// @version 0.4.0 @date 2026-06-16
// 0.4.0 — Single-token model (Daniel 2026-06-16): a single heir = ONE Activation
//         token; Voting is registered + minted ONLY for an M-of-N quorum vault;
//         Revocation is dropped (the owner revokes the Activation token directly).
//         The "all three roles / same 3 SBTs" wording in the 0.3.0 note below is
//         historical and superseded.
// 0.3.0 — C-07/C-08 (pressure-test) email-NoK was DEAD on the wire. Three bugs:
//         (1) the hook POSTed {email, vaultId, ownerWallet} but the route
//         requires {email, vaultId, designatedBy, role} → 400 on every call;
//         (2) one call cannot populate the three per-role rows the on-chain
//         mint needs; (3) the hook gated on a `nonce` the route intentionally
//         withholds at designation (the heir receives it by email at
//         activation, server-form-b nok.ts:341). Fixed per Daniel-locked
//         "all 3 roles": register activation+voting+revocation in a per-role
//         loop (emailHash is deterministic per (email, vaultId) so all three
//         rows + mints share one hash), send designatedBy=owner, and drop the
//         designation-time nonce requirement. Route unchanged (its design is
//         correct). No on-chain behaviour change — the same 3 SBTs are minted.
// 0.2.0 — H18 fix: replace weak `email.includes("@")` check with the shared
//         `isValidEmail` from lib/validators.ts (enforces shape, max 254 chars,
//         rejects RTL/bidi/zero-width spoof characters).
// 0.1.0 — initial.
// Hybrid-E email-NoK mint hook. Mirrors useNokMint but for the email path:
// the heir's token(s) are minted via `designateByEmail` instead of `mintNoK`
// (Activation always; Voting only for an M-of-N quorum; no Revocation).
// Each call goes to the escrow (not a wallet) and atomically registers the
// (tokenId, vaultId, emailHash, role, ownerWallet) binding inside the escrow
// via its `recordDesignation` callback. The plaintext email never touches
// the chain — Form B `services/email-hash.ts` produces the keccak hash with
// a server-side salt, then sends it through the existing
// `POST /v1/nok/designate-by-email` endpoint that stores the (emailHash,
// nonce, vaultId, role) row in nok_emails. The on-chain mint is then issued
// from the OWNER's wallet (the vault owner).

import { useCallback, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import type { Hex } from "viem";
import { sbtAbi, SBT_ROLE, asBytes32, DEFAULT_NOK_TOKEN_URI } from "../lib/sbt-contract.js";
import { SBT_ADDR } from "../lib/contracts.js";
import { isValidEmail } from "../lib/validators.js";
import { useEnsurePolygon } from "./useEnsurePolygon.js";

const API_URL = (import.meta.env.VITE_API_URL ?? "https://api.noklock.app").replace(/\/+$/, "");

export type EmailMintStep =
  | "idle"
  | "registering-email"
  | "minting-activation"
  | "minting-voting"
  | "done"
  | "error";

export interface UseEmailNokMintState {
  readonly step: EmailMintStep;
  readonly error: string | null;
  readonly emailHash: Hex | null;
  readonly nonce: Hex | null;
  readonly txHashes: { readonly activation?: `0x${string}`; readonly voting?: `0x${string}` };
  readonly mint: (params: { readonly email: string; readonly vaultId: string; readonly manifestHash: string; readonly quorum?: boolean }) => Promise<void>;
  readonly reset: () => void;
}

interface DesignateByEmailResponse {
  readonly ok?: boolean;
  readonly emailHash?: Hex;
  readonly nonce?: Hex;
  readonly error?: string;
}

export function useEmailNokMint(): UseEmailNokMintState {
  const { address } = useAccount();
  const [step, setStep] = useState<EmailMintStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [emailHash, setEmailHash] = useState<Hex | null>(null);
  const [nonce, setNonce] = useState<Hex | null>(null);
  const [txHashes, setTxHashes] = useState<UseEmailNokMintState["txHashes"]>({});
  const { writeContractAsync } = useWriteContract();
  const { ensurePolygon } = useEnsurePolygon();

  const mint = useCallback(async ({ email, vaultId, manifestHash, quorum = false }: { email: string; vaultId: string; manifestHash: string; quorum?: boolean }) => {
    if (!address) { setError("Connect a wallet first"); setStep("error"); return; }
    if (SBT_ADDR === "0x0000000000000000000000000000000000000000") {
      setError("SBT contract address not configured — set VITE_SBT_CONTRACT_ADDR");
      setStep("error");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      setStep("error");
      return;
    }
    setError(null);

    try {
      // 1. Register the email at Form B for ALL THREE roles. The route writes
      //    one nok_emails(vault_id, email_hash, role, nonce, …) row per call
      //    keyed PK(vault_id, email_hash, role). emailHash is deterministic per
      //    (email, vaultId) via the HMAC-blinded per-vault salt, so all three
      //    calls + the three on-chain mints below share ONE emailHash. The
      //    nonce is NOT returned at designation by design (the heir receives it
      //    by email at activation/firing — nok.ts:341), so we do not gate on it.
      setStep("registering-email");
      // 0.4.0 (Daniel 2026-06-16): single heir = ONE token. Register (and mint)
      // Voting only for M-of-N quorum vaults; Revocation is dropped entirely
      // (it gated nothing — owner revokes the Activation token directly).
      const ROLE_REGS = quorum ? (["activation", "voting"] as const) : (["activation"] as const);
      let resolvedEmailHash: Hex | null = null;
      for (const role of ROLE_REGS) {
        const r = await fetch(`${API_URL}/v1/nok/designate-by-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, vaultId, designatedBy: address, role }),
        });
        const body = (await r.json()) as DesignateByEmailResponse;
        if (!r.ok || body.error || !body.emailHash) {
          setError(body.error ?? `Email registration failed (${r.status})`);
          setStep("error");
          return;
        }
        resolvedEmailHash = body.emailHash;
      }
      if (!resolvedEmailHash) {
        setError("Email registration returned no hash");
        setStep("error");
        return;
      }
      setEmailHash(resolvedEmailHash);

      // 2. Mint the heir's token(s) to the escrow via designateByEmail —
      //    Activation always; Voting only for quorum vaults; no Revocation.
      await ensurePolygon();
      const vaultId32 = asBytes32(vaultId);
      const manifest32 = asBytes32(manifestHash);

      // 0.2.0 — C-05 vault-binding attestation shim (same as useNokMint).
      // Empty bytes / 0 / 0x00… while `vaultBindingAttestor` is unset on
      // the SBT (deploy-day default). When the off-chain signer ships,
      // fetch a real attestation per mint.
      const VBS_SIG: `0x${string}` = "0x";
      const VBS_EXP: bigint = 0n;
      const VBS_NONCE: `0x${string}` = "0x0000000000000000000000000000000000000000000000000000000000000000";

      setStep("minting-activation");
      const h1 = await writeContractAsync({
        address: SBT_ADDR, abi: sbtAbi, functionName: "designateByEmail",
        args: [vaultId32, resolvedEmailHash, SBT_ROLE.Activation, manifest32, DEFAULT_NOK_TOKEN_URI, VBS_SIG, VBS_EXP, VBS_NONCE],
      });
      setTxHashes((p) => ({ ...p, activation: h1 }));

      if (quorum) {
        setStep("minting-voting");
        const h2 = await writeContractAsync({
          address: SBT_ADDR, abi: sbtAbi, functionName: "designateByEmail",
          args: [vaultId32, resolvedEmailHash, SBT_ROLE.Voting, manifest32, DEFAULT_NOK_TOKEN_URI, VBS_SIG, VBS_EXP, VBS_NONCE],
        });
        setTxHashes((p) => ({ ...p, voting: h2 }));
      }

      setStep("done");
    } catch (e) {
      setError((e as Error).message ?? String(e));
      setStep("error");
    }
  }, [address, writeContractAsync, ensurePolygon]);

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
    setEmailHash(null);
    setNonce(null);
    setTxHashes({});
  }, []);

  return { step, error, emailHash, nonce, txHashes, mint, reset };
}
