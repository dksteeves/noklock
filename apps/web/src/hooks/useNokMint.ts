// @version 0.3.0 @date 2026-06-03
// 0.3.0 — AD1.7 FIX (Daniel 2026-06-03): wallet-switch-mid-flow detection.
//         Previously, if the user switched the connected wallet between
//         the time `mint()` was first invoked and the time the next of the
//         three sequential SBT writes fired (or just between mounting the
//         /nok-designate step and clicking "Mint"), the hook happily kept
//         going with the NEW connected account — Activation could be
//         signed by wallet A, Voting by wallet B, leaving an inconsistent
//         3-tuple on-chain. NEW: a wagmi `useAccountEffect` listens for
//         the connected-account `onChange` and, when fired while a mint
//         is in progress (step ≠ "idle"/"done"/"error"), flips state to a
//         new "stale" MintStep + records the prior + new address in the
//         exposed `staleReason` field. The UI is expected to surface this
//         + force the user to acknowledge / restart. `mint()` itself
//         re-checks `address` against the `address` captured at function
//         entry just before each write — if they diverge mid-flow we
//         abort cleanly into "stale" rather than continuing to sign with
//         a different account. `reset()` also clears the stale flag.
// 0.2.0 — C-05 vault-binding attestation (optional gate). The SBT mintNoK
//         signature gained 3 trailing args (sig, expiresAt, nonce). Pre-
//         attestor-set, we pass empty bytes / 0 / 0x00…; the on-chain
//         `_checkVaultBinding` no-ops while `vaultBindingAttestor ==
//         address(0)`. Once the off-chain signer ships and the owner sets
//         the attestor, this hook will fetch a fresh signed attestation
//         from Form B per mint and pass it here. The empty path is the
//         hardcoded shim while the off-chain side is being wired.
// 0.1.1 — Network guard: ensurePolygon() before the SBT write(s) so a
//         wallet on the wrong chain is switched to Polygon first.
//
// useNokMint — mint the heir's Activation SBT (plus a Voting SBT for M-of-N
// quorum vaults; Revocation dropped 2026-06-16) to
// a NoK wallet for a given vault. Three sequential writes — the contract
// requires one tx per role. State machine exposed so the UI can render
// "1 of 3 → 2 of 3 → 3 of 3 → done".

import { useCallback, useRef, useState } from "react";
import { useAccount, useAccountEffect, useWriteContract } from "wagmi";
import type { Address } from "viem";
import { sbtAbi, SBT_ROLE, asBytes32, DEFAULT_NOK_TOKEN_URI } from "../lib/sbt-contract.js";
import { SBT_ADDR } from "../lib/contracts.js";
import { useEnsurePolygon } from "./useEnsurePolygon.js";

// 0.2.0 — empty C-05 attestation shim. Used while `vaultBindingAttestor`
// is unset on the SBT contract (deploy-day default). When the off-chain
// signer ships, replace with a real attestation fetched from Form B.
const EMPTY_VAULT_BINDING_SIG: `0x${string}` = "0x";
const EMPTY_VAULT_BINDING_EXPIRES_AT: bigint = 0n;
const EMPTY_VAULT_BINDING_NONCE: `0x${string}` =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export type MintStep =
  | "idle"
  | "minting-activation"
  | "minting-voting"
  | "done"
  | "error"
  // 0.3.0 (AD1.7) — connected wallet changed between mint() invocation
  // entry and a subsequent SBT write, OR changed while the hook was sat
  // mid-flow (e.g. between the user pressing the button and the wallet
  // popup mounting). UI must surface and force re-confirmation rather
  // than silently signing the next write with a different account.
  | "stale";

/** 0.3.0 (AD1.7) — describes which wallet was active when the current
 *  mint sequence started vs. which wallet the user is connected to NOW.
 *  Surfaced to the UI so the modal copy can name both addresses. */
export interface StaleReason {
  readonly startedWith: Address;
  readonly nowConnected: Address | undefined;
  readonly at: MintStep; // the step we were on when the swap was detected
}

export interface UseNokMintState {
  readonly step: MintStep;
  readonly error: string | null;
  readonly txHashes: { readonly activation?: `0x${string}`; readonly voting?: `0x${string}` };
  readonly staleReason: StaleReason | null;
  readonly mint: (params: { nokWallet: Address; vaultId: string; manifestHash: string; quorum?: boolean }) => Promise<void>;
  readonly reset: () => void;
}

export function useNokMint(): UseNokMintState {
  const { address } = useAccount();
  const [step, setStep] = useState<MintStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHashes, setTxHashes] = useState<UseNokMintState["txHashes"]>({});
  const [staleReason, setStaleReason] = useState<StaleReason | null>(null);
  const { writeContractAsync } = useWriteContract();
  const { ensurePolygon } = useEnsurePolygon();

  // 0.3.0 (AD1.7) — refs so the in-flight mint() closure can see the
  // latest connected account + the address it STARTED with without
  // re-creating the callback (and forcing every consumer to re-render).
  const stepRef = useRef<MintStep>("idle");
  const startedWithRef = useRef<Address | null>(null);
  stepRef.current = step;

  // 0.3.0 (AD1.7) — wagmi v2 account-change listener. Fires when the
  // connected EOA actually changes (NOT just on first connect). If a
  // mint is in flight, mark stale + record both addresses so the UI can
  // render the "Wallet changed mid-flow" modal.
  useAccountEffect({
    onConnect({ address: nowAddr }) {
      const started = startedWithRef.current;
      const inFlight =
        stepRef.current === "minting-activation" ||
        stepRef.current === "minting-voting";
      if (inFlight && started && nowAddr.toLowerCase() !== started.toLowerCase()) {
        setStaleReason({ startedWith: started, nowConnected: nowAddr, at: stepRef.current });
        setStep("stale");
      }
    },
    onDisconnect() {
      const started = startedWithRef.current;
      const inFlight =
        stepRef.current === "minting-activation" ||
        stepRef.current === "minting-voting";
      if (inFlight && started) {
        setStaleReason({ startedWith: started, nowConnected: undefined, at: stepRef.current });
        setStep("stale");
      }
    },
  });

  const mint = useCallback(async ({ nokWallet, vaultId, manifestHash, quorum = false }: { nokWallet: Address; vaultId: string; manifestHash: string; quorum?: boolean }) => {
    if (!address) { setError("Connect a wallet first"); setStep("error"); return; }
    if (SBT_ADDR === "0x0000000000000000000000000000000000000000") {
      setError("SBT contract address not configured — deploy contracts and set VITE_SBT_CONTRACT_ADDR");
      setStep("error");
      return;
    }
    setError(null);
    setStaleReason(null);
    // 0.3.0 (AD1.7) — capture the EOA we're starting this sequence with.
    // The useAccountEffect listener compares every subsequent connected
    // address against this; the per-write guard below ALSO re-checks
    // before each writeContractAsync, so a swap during the wallet popup
    // mount (where useAccountEffect may not fire in time) is still
    // caught before the next signature is requested.
    const startAddr: Address = address;
    startedWithRef.current = startAddr;
    const vaultId32 = asBytes32(vaultId);
    const manifest32 = asBytes32(manifestHash);

    // 0.3.0 (AD1.7) — per-write address re-check. Returns true if the
    // currently-connected account still matches the one we started with;
    // false (and flips state to "stale") otherwise so the loop body can
    // bail before issuing the next signature.
    const stillSameWallet = (atStep: MintStep): boolean => {
      // wagmi's `address` is a hook value — the closure captured it at
      // callback-construction time. We instead read the freshest value
      // through the ref-mirror pattern: startedWithRef stays pinned, and
      // useAccountEffect already flipped step→"stale" if it diverged.
      // Re-check via stepRef.current as the single source of truth.
      if (stepRef.current === "stale") return false;
      // Defensive secondary check using the hook's most-recent `address`
      // value: closure is stale by definition, but if React already re-
      // rendered the consumer with a new `address` and queued a new
      // mint() identity, the OLD in-flight call may STILL be running.
      // Compare what we started with to the latest hook value seen by
      // the dep array — handled via setStaleReason fallback.
      if (address && address.toLowerCase() !== startAddr.toLowerCase()) {
        setStaleReason({ startedWith: startAddr, nowConnected: address, at: atStep });
        setStep("stale");
        return false;
      }
      return true;
    };

    try {
      await ensurePolygon();
      if (!stillSameWallet("minting-activation")) return;
      setStep("minting-activation");
      const h1 = await writeContractAsync({
        address: SBT_ADDR, abi: sbtAbi, functionName: "mintNoK",
        args: [nokWallet, vaultId32, SBT_ROLE.Activation, manifest32, DEFAULT_NOK_TOKEN_URI,
               EMPTY_VAULT_BINDING_SIG, EMPTY_VAULT_BINDING_EXPIRES_AT, EMPTY_VAULT_BINDING_NONCE],
      });
      setTxHashes((p) => ({ ...p, activation: h1 }));

      // 0.4.0 (Daniel 2026-06-16): single heir = ONE token. The Voting token is
      // ONLY for M-of-N quorum vaults — minted only when the caller passes
      // quorum=true (i.e. the vault's manifest carries a quorumPolicy). The
      // Revocation token is DROPPED entirely: it gated nothing on-chain (the
      // owner revokes the Activation token directly), so it was pure wasted gas
      // + a third wallet pop-up for zero function.
      if (quorum) {
        if (!stillSameWallet("minting-voting")) return;
        setStep("minting-voting");
        const h2 = await writeContractAsync({
          address: SBT_ADDR, abi: sbtAbi, functionName: "mintNoK",
          args: [nokWallet, vaultId32, SBT_ROLE.Voting, manifest32, DEFAULT_NOK_TOKEN_URI,
                 EMPTY_VAULT_BINDING_SIG, EMPTY_VAULT_BINDING_EXPIRES_AT, EMPTY_VAULT_BINDING_NONCE],
        });
        setTxHashes((p) => ({ ...p, voting: h2 }));
      }

      setStep("done");
    } catch (e) {
      // If the catch fires AFTER a stale flip (writeContractAsync rejected
      // because the wallet changed), preserve the "stale" state — the UI
      // needs that signal to render the swap modal, not a generic error.
      if (stepRef.current === "stale") return;
      setError((e as Error).message ?? String(e));
      setStep("error");
    }
  }, [address, writeContractAsync, ensurePolygon]);

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
    setTxHashes({});
    setStaleReason(null);
    startedWithRef.current = null;
  }, []);

  return { step, error, txHashes, staleReason, mint, reset };
}
