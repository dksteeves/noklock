// @version 0.16.0 @date 2026-06-11
// 0.16.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.10):
//          dropped useWalletSettling + WalletReconnecting. The not-connected
//          branch keeps the "Are you an heir?" nudge card and swaps the
//          connect card for the shared <WalletGateCard/> (buttons always
//          live); condition widened to `gate.status !== "connected"`.
// @version 0.15.0 @date 2026-06-03
// 0.15.0 — Daniel 2026-06-03: H5 fix — Heir misdirected to owner challenge
//          fork. When the quorum-protected owner fork renders with NO
//          wallet connected, we now lead with an explicit "Are you an
//          heir?" card pointing to /heir/restore BEFORE the
//          "Connect wallet to restore your vault" prompt. Previously,
//          an heir landing on /restore (despite the amber banner at the
//          top) would see only the wallet-connect UI and assume that
//          was their path — they would either connect a non-owner wallet
//          (which Form B then rejects with a confusing "not-recorded-owner"
//          error) or abandon the flow. The new card surfaces the
//          /heir/restore route at the exact decision point where the
//          mistake is most likely.
// 0.14.0 — Daniel 2026-06-01: HONEST FLOW STRIP — Go-offline is now an
//          explicit step IN the FlowSteps strip between Gather and
//          Unlock (parity with /enrol's step ladder). Previously the
//          strip was: Gather → Verify → Unlock → Decrypt → Recombine →
//          Recovered, with the "Go offline now" engagement panel
//          rendered BELOW the strip — the strip lied about the moment
//          the user crosses from online to offline.
//          Changes:
//            1. RESTORE_STEPS is now a 7-step ordered array carrying a
//               `phase: "online" | "boundary" | "offline"` tag per step:
//                 1 Gather       (online)
//                 2 Go offline   (boundary)
//                 3 Unlock       (offline)
//                 4 Verify       (offline)
//                 5 Decrypt      (offline)
//                 6 Recombine    (offline)
//                 7 Recovered    (offline)
//            2. RestoreCycle now renders each card with a small
//               online/offline indicator: green dot for online, yellow
//               dot for offline, both-dots-with-arrow for the boundary
//               step. Active step is highlighted (grad-bg) so the user
//               can see exactly where they are in the flow.
//            3. The "Go offline now" engagement panel that lived BELOW
//               the strip has been folded INTO the active-step-2 render
//               (the strip step itself IS the engagement card when
//               active). Before step 2 the subsequent step cards are
//               dimmed; after step 2 (`airgapReady`) the step 2 slot
//               collapses to a small "✓ Airgap engaged" confirmation
//               and the offline UI below it unlocks.
//            4. Active step is derived from existing state:
//                 - no manifests dropped + !airgapReady  → step 1
//                 - !airgapReady                         → step 2 (engage)
//                 - airgapReady + !output                → step 3 (unlock)
//                 - airgapReady + output                 → step 7 (recovered)
//               Steps 4-6 (Verify/Decrypt/Recombine) all collapse into
//               the runRestorePipeline call and are not separately
//               observable in this UI shell — they remain in the strip
//               as honest descriptors of what happens during that
//               single async call.
//          No structural change to the airgap engagement flow itself —
//          the same enterAirgap() + setAirgapReady(true) handlers fire;
//          the strip is now just honest about the boundary.
// 0.13.0 — Daniel 2026-06-01: EXPLICIT AIRGAP STEP — parity with /enrol.
//          Previously airgapForUnlock() engaged the airgap SILENTLY at
//          unlock time (no user awareness of the "going offline now"
//          moment). Critique: /enrol forces an explicit "Go offline now"
//          card with live online/offline detection + a deliberate user
//          action before content is provided; /restore did not.
//          This release mirrors that flow:
//            1. A new "Go offline now" card renders FIRST. It reads the
//               live `isBrowserOnline()` state (subscribed to the window
//               online/offline events) and shows the live blocked-fetch
//               counter from `airgap-manager.ts`. The primary action is
//               "I am offline — engage airgap" gated on isBrowserOnline()
//               === false; a secondary "Skip physical disconnect — engage
//               software airgap only" lets advanced users proceed when
//               they cannot physically disconnect. Both call enterAirgap()
//               and set `airgapReady=true`.
//            2. ALL subsequent UI (file drop, share URL fetch, master
//               password field, owner-self-restore challenge fork,
//               passkey unlock, reset) is gated on `airgapReady`. Until
//               the user explicitly engages, the rest of the page does
//               not render — same shape as /enrol's step ladder.
//            3. airgapForUnlock() is now a no-op when airgapReady is
//               already true (the airgap is engaged from step 1). Kept
//               as a defensive belt-and-braces inside reconstruct() /
//               reconstructWithPasskey() in case the underlying state
//               was reset by an extension or page event.
//          The previously-silent `airgapForUnlock()` engagement at
//          unlock time is GONE as the primary engagement path — it
//          remains only as the no-op safety net.
// 0.12.0 — Daniel 2026-06-01: phishing-replay close-out (Workflow A.2 re-review).
//          The owner-sign button now follows a 3-step nonce-bound flow:
//            a) FIRST calls getOwnerChallengeNonce(vaultId) → Form B issues
//               a fresh, server-authoritative, single-use, 5-min nonce.
//            b) Wallet signs the EXPANDED EIP-712 typed-data with
//               challengeNonce + challengeExpiresAt fields bound in.
//            c) POSTs to getOwnerSelfRestoreAttestation including the same
//               challengeNonce; Form B re-validates the row, marks it
//               consumed, then issues the attestation as before.
//          New error branches: "unknown-challenge-nonce" / "nonce-already-consumed"
//          / "nonce-expired" prompt the user to "try again" — and the next
//          click pulls a fresh nonce. Closes the defect surfaced by Workflow
//          A.2 re-review where a no-nonce signature could be phished once and
//          replayed against Form B indefinitely (until owner_wallet changed).
// 0.11.0 — Daniel 2026-06-01: 0.11.0 replaces the forgeable ownerAck boolean
//          with a wallet-signed OwnerSelfRestore attestation issued by Form B.
//          Closes the bypass identified by Workflow A.1 re-review where a heir
//          could click I-am-the-owner and unlock the vault without any
//          cryptographic check. The flow is now:
//            1. Detect quorum-protected manifest (evaluateRestoreModeGuard,
//               quorum-policy.ts 0.3.0).
//            2. If protected and no proof present → render the
//               "Connect owner wallet & sign challenge" fork. The previous
//               yellow "I'm the vault owner — acknowledge and proceed" button
//               is GONE; the only owner-mode path is a real wallet signature.
//            3. On primary click: ensure walletSession is connected →
//               useSignTypedDataAsync over the EIP-712
//               OwnerSelfRestoreChallenge(vaultId, manifestHash, ownerWallet)
//               domain (name=NoKLockOwnerSelfRestore, version=1, chainId=137,
//               verifyingContract=0x000…000) → POST to
//               /v1/nok/quorum/owner-self-restore-attestation (quorum-client
//               0.2.0 getOwnerSelfRestoreAttestation) → on success store the
//               attestation in state and run the unlock with
//               ownerSelfRestoreProof wired into runRestorePipeline.
//            4. On 401 "not-recorded-owner" → red error pointing at /heir/restore.
//          The route-guard outcome dictates the call site:
//            "proceed-legacy"            → runRestorePipeline(no proof) — byte-
//                                          identical to pre-quorum behaviour.
//            "blocked-need-owner-proof"  → show owner-wallet fork (no pipeline).
//            "proceed-with-owner-proof"  → runRestorePipeline(...ownerSelfRestoreProof).
//          Legacy /restore vaults (no quorumPolicy) keep working with no UI
//          change at all. The forgeable boolean pattern is fully deleted —
//          ownerAck / ownerAckRequired state, the inline "acknowledge"
//          button, and the boolean argument to the policy helper are gone.
// 0.10.1 — Daniel 2026-06-01: extracted the inline owner-ack predicate into
//          `evaluateOwnerAckGuard` (quorum-policy.ts 0.2.0). SUPERSEDED by
//          0.11.0 — see above.
// 0.10.0 — Daniel 2026-06-01: CRITICAL fix — explicit owner-ack required
//          when manifest has quorumPolicy. SUPERSEDED by 0.11.0 (the ack
//          was forgeable; the wallet-signed challenge in 0.11.0 is not).
// 0.9.0 — Daniel 2026-06-01: M-of-N Stage 1 step D.3. Heir entry link.
// 0.8.0 — archgap-algo7-heir-notify: owner-notify beacon on successful restore.
// 0.7.1 — Restore-side airgap engages at unlock time (not on mount).
// 0.7.0 — Restore-side airgap (original mount-time version).
// 0.6.2 — Restore-cycle strip → responsive wrapping grid.
// 0.6.1 — Master-password field → shared MaskedSecret.
// 0.6.0 — At-a-glance restore-cycle flow strip.
// 0.5.3 — File picker no longer restricted to application/json.
// 0.5.2 — Optional "Unlock with passkey" path (WebAuthn).
// 0.5.1 — Veracity rename: user-facing "passkey" -> "master password".
// 0.5.0 — kind-aware restore UI (bip39 / sealed-letter / document).
// 0.4.0 — accepts share URLs in addition to drag-drop files.
// 0.3.0 — multi-manifest aware.
// 0.2.0 — drag-drop restore + hold-to-reveal.

import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAccount, useSignTypedData } from "wagmi";
import type { Hex, Address } from "viem";
import type { VaultManifest } from "@soulchain/crypto-core";
import { manifest as manifestLib } from "@soulchain/crypto-core";
import { ShareUrlAdapter, normaliseShareUrl } from "@soulchain/storage-adapters";
import {
  parseShareJson,
  parseManifestJson,
  runRestorePipeline,
  type ParsedShare,
  type RestoreOutput,
  type RestoreInput,
} from "../lib/restore-pipeline.js";
import { parsePasskeyEnvelope, unwrapMaster, loadEnvelopeLocal, type PasskeyEnvelope } from "../lib/webauthn.js";
import { MaskedSecret } from "../components/MaskedSecret.js";
import { RichTextView } from "../components/RichTextView.js";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { trackEventDurable } from "../lib/track.js";
import {
  enterAirgap,
  leaveAirgap,
  isAirgapped,
  runOnline,
  isBrowserOnline,
  blockedFetchCount,
  subscribeAirgap,
} from "../lib/airgap-manager.js";
import { evaluateRestoreModeGuard, type OwnerSelfRestoreProof } from "../lib/quorum-policy.js";
import {
  getOwnerSelfRestoreAttestation,
  getOwnerChallengeNonce,
} from "../lib/quorum-client.js";

// EIP-712 domain + types for OwnerSelfRestoreChallenge. The DOMAIN MUST
// match what Form B verifies against (server-form-b owner-self-restore
// service) and what restore-pipeline.ts 0.9.0+ uses on the
// `OwnerSelfRestoreAttestation` recovery (note: the attestation is a
// DIFFERENT typed-struct — `OwnerSelfRestoreAttestation` — signed by the
// Form B attestor key; this challenge is signed by the OWNER wallet and
// only ever recovered server-side). Keeping the chainId pinned to 137
// (Polygon PoS) matches the chain choice in
// reference_chain_choice_pos_vs_zkevm.md.
const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

const OWNER_CHALLENGE_DOMAIN = {
  name: "NoKLockOwnerSelfRestore",
  version: "1",
  chainId: 137,
  verifyingContract: ZERO_ADDRESS,
} as const;

// 0.12.0 — typed-data expanded with challengeNonce + challengeExpiresAt so a
// phished signature cannot be replayed past the 5-minute window and even
// within the window can only be used once. Form B re-derives
// challengeExpiresAt server-side from the persisted row (the client can't
// forge expiry into the signed message).
const OWNER_CHALLENGE_TYPES = {
  OwnerSelfRestoreChallenge: [
    { name: "vaultId", type: "bytes32" },
    { name: "manifestHash", type: "bytes32" },
    { name: "ownerWallet", type: "address" },
    { name: "challengeNonce", type: "bytes32" },
    { name: "challengeExpiresAt", type: "uint256" },
  ],
} as const;

function bytesToHexLocal(bytes: Uint8Array): Hex {
  let out = "0x";
  for (let i = 0; i < bytes.length; i++) out += bytes[i]!.toString(16).padStart(2, "0");
  return out as Hex;
}

/** Normalise a manifest's vaultId to a 0x-prefixed hex string (Form B +
 *  EIP-712 both want bytes32 hex). Manifests historically store the id
 *  un-prefixed; HeirRestore.tsx and restore-pipeline.ts apply the same
 *  normalisation. */
function vaultIdHex(mf: VaultManifest): Hex {
  const v = mf.vaultId;
  return (v.startsWith("0x") ? v : `0x${v}`) as Hex;
}

export function Restore(): JSX.Element {
  const [manifests, setManifests] = useState<readonly VaultManifest[]>([]);
  const [shares, setShares] = useState<readonly ParsedShare[]>([]);
  const [passkey, setPasskey] = useState("");
  const [output, setOutput] = useState<RestoreOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlBusy, setUrlBusy] = useState(false);
  const [passkeyEnv, setPasskeyEnv] = useState<PasskeyEnvelope | null>(null);
  // 0.11.0 — REAL cryptographic owner-self-restore proof issued by Form B
  // after a successful wallet signature. Replaces the forgeable ownerAck
  // boolean (0.10.x). Null until the user connects + signs + Form B
  // accepts; once set, the next pipeline run wires it through to
  // runRestorePipeline as `ownerSelfRestoreProof`.
  const [ownerSelfRestoreProof, setOwnerSelfRestoreProof] =
    useState<OwnerSelfRestoreProof | null>(null);
  // 0.11.0 — track which manifest the proof was issued against, so a
  // mid-session manifest swap re-triggers the owner-wallet fork instead
  // of silently re-using a stale proof.
  const [proofManifestHash, setProofManifestHash] = useState<Hex | null>(null);
  // 0.11.0 — busy + error scoped to the owner-wallet challenge flow so the
  // top-level restore error doesn't get clobbered.
  const [ownerSigBusy, setOwnerSigBusy] = useState(false);
  const [ownerSigError, setOwnerSigError] = useState<string | null>(null);
  // 0.11.0 — flag set when the master-password flow has been initiated but
  // the route-guard kicked it back for an owner proof. After the proof is
  // obtained, we auto-resume.
  const [awaitingOwnerProof, setAwaitingOwnerProof] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  // 0.13.0 — Explicit airgap-step state (parity with /enrol's airgap step).
  // `airgapReady` gates EVERY subsequent UI section (file drop, master
  // password, share URL fetch, owner-wallet fork). The user must click
  // either the primary (physical-disconnect) or secondary (software-only)
  // engage button before the rest of the page renders. Mirrors the
  // `enterAirgap()` call already made by /enrol.
  const [airgapReady, setAirgapReady] = useState(false);
  // Live online flag — subscribed to window online/offline events so the
  // "I am offline — engage airgap" button flips state in real time when
  // the user disconnects Wi-Fi / cellular. Mirrors Enrol.tsx 1.0.2.
  const [online, setOnline] = useState<boolean>(() => isBrowserOnline());
  useEffect(() => {
    const update = (): void => setOnline(isBrowserOnline());
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  // Live blocked-fetch counter — surfaces the airgap doing its job.
  const [blockedCount, setBlockedCount] = useState(0);
  useEffect(() => {
    const unsubscribe = subscribeAirgap(() => setBlockedCount(blockedFetchCount()));
    return () => { unsubscribe(); };
  }, []);

  // Wallet hooks — only used for the owner-wallet challenge fork. The legacy
  // share+password owner path doesn't need a wallet, and the route still
  // renders/works without one for legacy / Free vaults.
  const { address: connectedAddress } = useAccount();
  const gate = useWalletGate();
  const isConnected = gate.status === "connected";
  const { signTypedDataAsync } = useSignTypedData();

  // 0.7.1 — Airgap engages ONLY at unlock time (not on mount). Gather
  // phase needs network access for share-URL fetches AND for the owner-
  // self-restore attestation POST in 0.11.0.
  const wasAirgappedAtMountRef = useRef<boolean>(isAirgapped());
  // 0.8.0 (archgap-algo7-heir-notify) — Vault to notify the owner about
  // on unmount.
  const pendingNotifyVaultIdRef = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (!wasAirgappedAtMountRef.current && isAirgapped()) {
        leaveAirgap();
      }
      const vId = pendingNotifyVaultIdRef.current;
      if (vId) {
        try {
          const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";
          const body = JSON.stringify({ vaultId: vId });
          if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            navigator.sendBeacon(`${API_BASE}/ops/heir-restore-event`, new Blob([body], { type: "application/json" }));
          } else {
            void fetch(`${API_BASE}/ops/heir-restore-event`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body,
              keepalive: true,
            }).catch(() => { /* swallow — best-effort */ });
          }
        } catch { /* swallow */ }
        pendingNotifyVaultIdRef.current = null;
      }
      try {
        if (output && (output.kind === "sealed-letter" || output.kind === "document") && output.content?.fill) {
          output.content.fill(0);
        }
      } catch { /* already wiped or gone */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 0.13.0 — Defensive no-op safety net. The PRIMARY engagement path is
  // now the explicit "Go offline now" card below: the user clicks one of
  // the two engage buttons → enterAirgap() → setAirgapReady(true). This
  // helper remains as belt-and-braces inside reconstruct() in case the
  // underlying airgap state was reset by a page event or extension between
  // step 1 and the unlock click.
  const airgapForUnlock = (): void => {
    if (!isAirgapped()) enterAirgap();
  };

  /** 0.13.0 — Explicit engage handler used by both the primary
   *  (physical-disconnect) and secondary (software-only) buttons. Mirrors
   *  the Enrol airgap step's `enterAirgap(); setStep("content");` jump. */
  function engageAirgapAndAdvance(): void {
    if (!isAirgapped()) enterAirgap();
    setAirgapReady(true);
  }

  const handleFiles = useCallback(async (files: FileList | File[]): Promise<void> => {
    setError(null);
    const arr = Array.from(files);
    const newShares: ParsedShare[] = [...shares];
    const newManifests: VaultManifest[] = [...manifests];

    for (const f of arr) {
      try {
        const text = await f.text();
        if (text.includes("passkey/v1") || /passkey-unlock/i.test(f.name)) {
          setPasskeyEnv(parsePasskeyEnvelope(text));
          continue;
        }
        if (f.name === "manifest.json" || /manifest/i.test(f.name)) {
          const m = parseManifestJson(text);
          if (!newManifests.find((x) => x.vaultId === m.vaultId)) newManifests.push(m);
        } else {
          const share = parseShareJson(text);
          if (!newShares.find((s) => s.index === share.index && s.vaultId === share.vaultId)) {
            newShares.push(share);
          }
        }
      } catch (e) {
        setError(`Failed to parse ${f.name}: ${(e as Error).message}`);
      }
    }
    setManifests(newManifests);
    setShares(newShares);
  }, [manifests, shares]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      void handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      void handleFiles(e.target.files);
      e.target.value = "";
    }
  }, [handleFiles]);

  /** 0.11.0 — Pick the manifest the owner-self-restore challenge is bound to.
   *  When multiple manifests are dropped (real + decoy), we sign over the
   *  quorum-protected one — the only one that needs a proof. Form B verifies
   *  the recovered signer is the on-record owner for THAT vaultId. */
  function pickQuorumProtectedManifest(): VaultManifest | null {
    return manifests.find((m) => m.quorumPolicy !== undefined) ?? null;
  }

  /** 0.12.0 — Run the owner-wallet challenge fork (nonce-bound):
   *    1. Make sure the wallet is connected (the UI gates this button on
   *       `isConnected`, but a stale render could fire it).
   *    2. Compute the manifest hash (must match what restore-pipeline.ts
   *       0.9.0+ recomputes during attestation verification).
   *    3. FETCH a fresh server-issued challenge nonce from Form B (5-min,
   *       single-use). Server-authoritative `expiresAt` is bound into the
   *       signed typed-data so the client can't forge expiry.
   *    4. signTypedDataAsync over the EXPANDED OwnerSelfRestoreChallenge
   *       (with challengeNonce + challengeExpiresAt fields).
   *    5. POST to Form B (quorum-client.ts 0.3.0) including challengeNonce;
   *       Form B re-validates, marks consumed, issues the attestation.
   *    6. On success → stash the attestation, clear the fork, auto-resume
   *       the master-password path if the user had just tried to unlock.
   *    7. On 401/409/410 / nonce errors → red error + nudge to "try again"
   *       (a fresh nonce will be pulled on the next click).
   *  Any throw inside is surfaced as ownerSigError without touching the
   *  global restore error strip. */
  async function startOwnerSelfRestoreChallenge(): Promise<void> {
    setOwnerSigError(null);
    if (!connectedAddress) {
      setOwnerSigError("Connect your owner wallet first.");
      return;
    }
    const targetManifest = pickQuorumProtectedManifest();
    if (!targetManifest) {
      // Belt-and-braces — if the user clicks this on a legacy vault we
      // should never have shown the fork. Bail rather than sign noise.
      setOwnerSigError("No quorum-protected manifest is loaded — owner challenge not required.");
      return;
    }
    setOwnerSigBusy(true);
    try {
      const vidHex: Hex = vaultIdHex(targetManifest);
      const mfHashBytes = manifestLib.manifestHash(targetManifest);
      const mfHashHex: Hex = bytesToHexLocal(mfHashBytes);
      const ownerWallet = connectedAddress as Address;

      // 1. Fetch fresh server-issued challenge nonce BEFORE the wallet
      // sees anything. Server is authoritative on the 5-minute expiry —
      // the client cannot forge it into the signed message.
      // runOnline: this PRE-DECRYPT authorization call legitimately needs the
      // network (it exposes no seed); it must not be blocked by a leftover
      // tab-wide airgap. The decrypt re-engages the airgap afterwards.
      const nonceResult = await runOnline(() => getOwnerChallengeNonce(vidHex));
      if ("error" in nonceResult) {
        setOwnerSigError(
          `Could not obtain a fresh challenge nonce from Form B: ${nonceResult.error}. Try again.`,
        );
        return;
      }
      const { nonce: challengeNonce, expiresAt: challengeExpiresAt } = nonceResult;

      // 2. Wallet signature over the EXPANDED challenge — binds the
      // (nonce, expiresAt) pair so a phished signature is single-use and
      // 5-minute-bounded.
      const ownerSig = (await signTypedDataAsync({
        domain: OWNER_CHALLENGE_DOMAIN,
        types: OWNER_CHALLENGE_TYPES,
        primaryType: "OwnerSelfRestoreChallenge",
        message: {
          vaultId: vidHex,
          manifestHash: mfHashHex,
          ownerWallet,
          challengeNonce,
          challengeExpiresAt: BigInt(challengeExpiresAt),
        },
      })) as Hex;

      // 3. Hand it to Form B for verification + attestation issuance.
      // runOnline: same pre-decrypt online carve-out as the nonce fetch.
      const result = await runOnline(() => getOwnerSelfRestoreAttestation({
        vaultId: vidHex,
        manifestHash: mfHashHex,
        ownerWallet,
        ownerSig,
        challengeNonce,
      }));
      if ("error" in result) {
        if (/not-recorded-owner/i.test(result.error)) {
          setOwnerSigError(
            "This wallet is not the recorded owner of this vault. If you are the original owner via a previous wallet, that wallet must sign. If you are an heir, use /heir/restore.",
          );
        } else if (/unknown-challenge-nonce/i.test(result.error)) {
          setOwnerSigError(
            "Form B did not recognise the challenge nonce. This usually means the page was reloaded mid-flow. Click 'Connect owner wallet & sign challenge' again to try with a fresh nonce.",
          );
        } else if (/nonce-already-consumed/i.test(result.error)) {
          setOwnerSigError(
            "That challenge nonce has already been used. Click 'Connect owner wallet & sign challenge' again to try with a fresh nonce.",
          );
        } else if (/nonce-expired/i.test(result.error)) {
          setOwnerSigError(
            "That challenge nonce expired before the signature reached Form B (5-minute window). Click 'Connect owner wallet & sign challenge' again to try with a fresh nonce.",
          );
        } else {
          setOwnerSigError(`Form B refused the owner-self-restore attestation: ${result.error}`);
        }
        return;
      }

      // 4. Stash the proof + bind it to the manifest hash so a later
      // manifest swap invalidates it.
      setOwnerSelfRestoreProof(result.attestation);
      setProofManifestHash(mfHashHex);

      // 5. If the user had just tried to unlock, auto-resume now that
      // the proof is present.
      if (awaitingOwnerProof) {
        setAwaitingOwnerProof(false);
        // microtask-defer so the proof state has flushed before the
        // pipeline reads it (React batches the setStates above).
        void Promise.resolve().then(() => { void reconstruct(); });
      }
    } catch (e) {
      setOwnerSigError((e as Error).message ?? String(e));
    } finally {
      setOwnerSigBusy(false);
    }
  }

  /** Read the (possibly stale) ownerSelfRestoreProof, but only if it's bound
   *  to a manifest that's currently in the loaded set. Prevents a proof
   *  issued for a previous manifest from satisfying the route guard after
   *  the user dropped a different manifest. */
  function currentValidProof(): OwnerSelfRestoreProof | undefined {
    if (!ownerSelfRestoreProof) return undefined;
    if (!proofManifestHash) return undefined;
    // Match by manifest hash — the bound manifest must still be loaded.
    const matched = manifests.find((m) => {
      try {
        const hashHex = bytesToHexLocal(manifestLib.manifestHash(m));
        return hashHex.toLowerCase() === proofManifestHash.toLowerCase();
      } catch {
        return false;
      }
    });
    return matched ? ownerSelfRestoreProof : undefined;
  }

  async function reconstruct(): Promise<void> {
    if (manifests.length === 0) { setError("Drop at least one manifest.json first"); return; }
    if (passkey.length < 1) { setError("Enter your master password"); return; }
    const proof = currentValidProof();
    const guard = evaluateRestoreModeGuard(manifests, proof);
    if (guard === "blocked-need-owner-proof") {
      setError(null);
      setAwaitingOwnerProof(true);
      return;
    }
    if (guard === "blocked-heir-only") {
      // /restore doesn't return this branch — the heir is sent to
      // /heir/restore via a top-of-page link. Defensive surfacing in case
      // the predicate ever evolves.
      setError("This vault is heir-only — use /heir/restore.");
      return;
    }
    setError(null);
    setBusy(true);
    airgapForUnlock();
    try {
      const input: RestoreInput = {
        manifests,
        shares,
        passkey,
        ...(guard === "proceed-with-owner-proof" && proof ? { ownerSelfRestoreProof: proof } : {}),
      };
      const result = await runRestorePipeline(input);
      setOutput(result);
      pendingNotifyVaultIdRef.current = result.matchedVaultId;
      trackEventDurable("restore_run");
    } catch (e) {
      // 0.8.0 traction — count FAILED restore drills too (restore runs in
      // airgap → durable). Before this, only successful restores were counted.
      trackEventDurable("restore_failed");
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function reconstructWithPasskey(): Promise<void> {
    const env =
      passkeyEnv ??
      manifests.map((m) => loadEnvelopeLocal(m.vaultId)).find((e): e is PasskeyEnvelope => !!e) ??
      null;
    if (!env) { setError("No passkey-unlock file found for these manifests on this device."); return; }
    if (manifests.length === 0) { setError("Drop the manifest.json first"); return; }
    const proof = currentValidProof();
    const guard = evaluateRestoreModeGuard(manifests, proof);
    if (guard === "blocked-need-owner-proof") {
      setError(null);
      setAwaitingOwnerProof(true);
      return;
    }
    if (guard === "blocked-heir-only") {
      setError("This vault is heir-only — use /heir/restore.");
      return;
    }
    setError(null);
    setBusy(true);
    airgapForUnlock();
    try {
      const master = await unwrapMaster(env);
      const input: RestoreInput = {
        manifests,
        shares,
        passkey: "",
        masterOverride: master,
        ...(guard === "proceed-with-owner-proof" && proof ? { ownerSelfRestoreProof: proof } : {}),
      };
      const result = await runRestorePipeline(input);
      setOutput(result);
      pendingNotifyVaultIdRef.current = result.matchedVaultId;
      trackEventDurable("restore_run");
    } catch (e) {
      // 0.8.0 traction — count FAILED restore drills too (restore runs in
      // airgap → durable). Before this, only successful restores were counted.
      trackEventDurable("restore_failed");
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function fetchFromUrl(): Promise<void> {
    const url = urlInput.trim();
    if (!url) return;
    const normalised = normaliseShareUrl(url);
    if (!normalised) {
      setError("URL not recognised, or provider needs manual download (MEGA / Filen / Internxt etc. — download the file in your browser then drop it above).");
      return;
    }
    setError(null);
    setUrlBusy(true);
    try {
      const adapter = new ShareUrlAdapter();
      const bytes = await adapter.get({ pathOrId: url });
      if (!bytes) {
        setError(`Empty response from ${normalised.provider}`);
        return;
      }
      const text = new TextDecoder().decode(bytes);
      try {
        const obj = JSON.parse(text) as Record<string, unknown>;
        if (obj["soulchain"] === "share/v1") {
          const share = parseShareJson(text);
          if (!shares.find((s) => s.index === share.index && s.vaultId === share.vaultId)) {
            setShares([...shares, share]);
          }
        } else if (obj["version"] !== undefined && obj["shamir"] !== undefined) {
          const m = parseManifestJson(text);
          if (!manifests.find((x) => x.vaultId === m.vaultId)) setManifests([...manifests, m]);
        } else {
          setError("Fetched URL but content is neither a share file nor a manifest.");
        }
      } catch {
        setError("Fetched URL but couldn't parse as JSON.");
      }
      setUrlInput("");
    } catch (e) {
      setError(`Fetch failed: ${(e as Error).message}`);
    } finally {
      setUrlBusy(false);
    }
  }

  function reset(): void {
    setManifests([]);
    setShares([]);
    setPasskey("");
    setOutput(null);
    setError(null);
    setReveal(false);
    setUrlInput("");
    // 0.11.0 — clear owner proof + challenge state so a fresh session starts
    // neutral. (Previously cleared the forgeable ownerAck booleans here.)
    setOwnerSelfRestoreProof(null);
    setProofManifestHash(null);
    setOwnerSigError(null);
    setOwnerSigBusy(false);
    setAwaitingOwnerProof(false);
    pendingNotifyVaultIdRef.current = null;
    // 0.13.0 — Reset also drops the user back to the "Go offline now"
    // step. The underlying airgap is intentionally NOT leaveAirgap()'d
    // (other tabs / paths may rely on it); the user can re-engage with
    // one click if they Reset mid-flow.
    setAirgapReady(false);
  }

  // 0.11.0 — Route-guard outcome (also drives the JSX render of the fork
  // card below). Re-derived per render — pure function over state.
  const proof = currentValidProof();
  const guardOutcome = manifests.length > 0
    ? evaluateRestoreModeGuard(manifests, proof)
    : "proceed-legacy";
  const ownerForkVisible =
    guardOutcome === "blocked-need-owner-proof" || awaitingOwnerProof;

  // 0.14.0 — Derive the active step number for the FlowSteps strip from
  // existing state. Steps 4-6 (Verify / Decrypt / Recombine) all happen
  // synchronously inside runRestorePipeline — they aren't separately
  // observable in this UI shell, so we collapse them into the "Unlock"
  // active state and the strip stays honest about what runs offline.
  const activeStepN: number = (() => {
    if (output) return 7;                          // Recovered
    if (!airgapReady) {
      // If no manifests have been dropped yet, the user is still in
      // Gather (step 1); otherwise nudge them onto the boundary (step 2).
      return manifests.length === 0 && shares.length === 0 ? 1 : 2;
    }
    return 3;                                       // Unlock (+4/5/6 inside)
  })();

  return (
    <div className="space-y-6">
      {/* 0.10.0 banner kept (still relevant): heirs should NEVER land here.
          0.11.0 hardens the bypass with a real wallet signature, but the
          banner remains the cheaper first-line filter. */}
      <div className="card border border-amber-500/40 bg-amber-500/5 text-sm text-amber-200">
        If you&apos;re a designated heir, start at{" "}
        <Link to="/heir/restore" className="text-accent-cyan underline hover:no-underline font-semibold">
          /heir/restore
        </Link>
        . This page is the owner self-restore path.
      </div>

      <div className="card">
        <h1 className="text-2xl font-bold">Restore a vault</h1>
        <p className="text-slate-400 mt-2 text-sm">
          Drag and drop your manifest.json and at least the threshold number of share files. Enter your master password. The entire reconstruction runs locally — your seed never leaves this browser.
        </p>
        <div className="mt-3 text-sm">
          <Link to="/heir/restore" className="text-accent-cyan hover:underline">
            If you&apos;re an heir, start here →
          </Link>
        </div>
        <RestoreCycle activeN={activeStepN} />
      </div>

      {/* 0.14.0 — This card IS the content slot of step 2 ("Go offline")
          in the FlowSteps strip above. The strip card itself just shows
          the label + indicator dots; the active-step engagement UI
          lives here. Once the user engages, this card collapses into a
          tiny "✓ Airgap engaged" confirmation (rendered below this
          block) and the offline cards (steps 3-7) unlock.
          0.13.0 (history) — The user MUST engage the airgap before any
          restore UI renders. The flow mirrors Enrol.tsx 1.0.2: live
          online/offline detection, live blocked-fetch counter, primary
          "I am offline" button gated on isBrowserOnline() === false,
          plus a less-prominent secondary "Software airgap only" button
          for users who cannot physically disconnect. */}
      {!airgapReady && (
        <div className="card sensitive-surface space-y-3 border-l-4 border-l-amber-400">
          <div className="text-[10px] font-mono uppercase tracking-wide text-amber-300">Step 2 of 7 · boundary</div>
          <h2 className="font-bold font-display text-lg">Go offline now</h2>
          <p className="text-sm text-text-on-dark/85">
            NoKLock is about to reassemble your seed locally. For maximum safety, disconnect your Wi-Fi (or unplug your ethernet) and close any tabs you do not trust. The browser tab also installs a software airgap that blocks every outbound network call — but physical disconnect is belt-and-braces.
          </p>
          <div className="text-sm">
            Browser online?{" "}
            <span className="font-mono">
              {online ? (
                <span className="text-danger">yes — turn it off</span>
              ) : (
                <span className="text-accent-green">no ✓</span>
              )}
            </span>
          </div>
          {isAirgapped() && (
            <div className="p-2 rounded bg-accent-green/10 border border-accent-green/40 text-xs">
              <strong className="text-accent-green">Software airgap engaged.</strong>{" "}
              <span className="font-mono">Fetches blocked since engaged: {blockedCount}</span>
              {blockedCount === 0
                ? <span className="text-accent-green"> ✓ no calls leaked</span>
                : <span className="text-amber-400"> — investigate before continuing</span>}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              className="btn btn-primary"
              disabled={online}
              onClick={engageAirgapAndAdvance}
            >
              I am offline — engage airgap
            </button>
            <button
              className="btn btn-secondary text-sm"
              onClick={engageAirgapAndAdvance}
            >
              Skip physical disconnect — engage software airgap only
            </button>
          </div>
          <p className="text-xs text-text-muted">
            The software airgap intercepts every fetch / XHR / WebSocket / EventSource / SendBeacon / Worker / Service-Worker / WebRTC channel — but a compromised browser can still leak via a renderer exploit. Physical disconnect closes that gap.
          </p>
        </div>
      )}

      {/* 0.13.0 — All subsequent restore UI is gated on airgapReady. */}
      {airgapReady && (
        <div className="card border border-emerald-500/40 bg-emerald-950/10 text-xs text-emerald-200 flex items-center justify-between gap-3 flex-wrap">
          <span>
            <strong>Airgap engaged ✓</strong> — all outbound network calls are being intercepted.
            <span className="font-mono ml-2">Blocked since engaged: {blockedCount}</span>
          </span>
        </div>
      )}

      {/* 0.11.0 — Owner-wallet challenge fork. Replaces the 0.10.x
          forgeable-boolean "acknowledge" button. The ONLY way through this
          card is to connect a wallet whose address Form B recognises as the
          on-record owner of the dropped vault, then sign the EIP-712
          OwnerSelfRestoreChallenge with that wallet.
          0.13.0 — gated on airgapReady so this fork (which does network
          I/O against Form B during the challenge fetch) only renders
          after the user has consciously engaged the airgap. The airgap
          allows the explicit attestation POST/GET while blocking
          everything else. */}
      {airgapReady && ownerForkVisible && (
        <div className="card border border-amber-500 bg-amber-500/10 space-y-3">
          <h2 className="font-bold text-amber-300">
            This vault is M-of-N heir-quorum protected
          </h2>
          <p className="text-sm text-amber-100/90">
            To restore as the original owner, sign a one-shot challenge with the original owner wallet. NoKLock will not unlock the vault on this page until Form B has verified that signature recovers to the owner address recorded for this vault. If you are an heir, use{" "}
            <Link to="/heir/restore" className="text-accent-cyan underline hover:no-underline">
              /heir/restore
            </Link>
            {" "}— a single boolean acknowledgement is no longer accepted.
          </p>
          <p className="text-xs text-amber-100/70">
            This authorization makes <strong>one brief online call</strong> (your wallet signs a challenge → Form B returns the attestation). No seed is in memory yet, so nothing sensitive can leave — the airgap re-engages automatically for the decrypt itself. This is the only network call this page makes.
          </p>

          {gate.status !== "connected" && (
            <div className="space-y-3">
              {/* 0.15.0 — H5 fix: heirs misdirected to the owner-challenge
                  fork should be sent to /heir/restore BEFORE they're asked
                  to connect a wallet. The amber banner at the top of the
                  page covers the same nudge but is easy to miss; this card
                  surfaces it at the exact decision point. */}
              <div className="rounded-lg border border-accent-cyan/50 bg-accent-cyan/5 p-3 text-sm">
                <p className="font-semibold text-accent-cyan">
                  Are you an heir?
                </p>
                <p className="text-text-on-dark/85 mt-1">
                  You should be at{" "}
                  <Link
                    to="/heir/restore"
                    className="text-accent-cyan underline hover:no-underline font-semibold"
                  >
                    /heir/restore
                  </Link>
                  . This page is only for the original vault owner restoring
                  with the owner wallet.
                </p>
              </div>
              <WalletGateCard note="Connect the owner wallet this vault was enrolled with, then sign the challenge." />
            </div>
          )}

          {isConnected && (
            <div className="text-xs text-text-on-dark/80 font-mono break-all">
              Connected: {connectedAddress}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              className="btn btn-primary text-sm"
              disabled={!isConnected || ownerSigBusy}
              onClick={() => void startOwnerSelfRestoreChallenge()}
            >
              {ownerSigBusy ? "Awaiting wallet signature…" : "Connect owner wallet & sign challenge"}
            </button>
            <Link to="/heir/restore" className="btn btn-secondary text-sm">
              I am an heir → /heir/restore
            </Link>
          </div>

          {ownerSigError && (
            <div className="text-sm text-rose-300 break-words">{ownerSigError}</div>
          )}
        </div>
      )}

      {/* 0.11.0 — once a proof is in hand, surface a small confirmation strip
          so the user knows the challenge succeeded before they click Restore. */}
      {airgapReady && proof && !ownerForkVisible && (
        <div className="card border border-emerald-500/40 bg-emerald-950/10 text-sm text-emerald-200">
          Owner-self-restore attestation issued ✓ — proceed with master password.
        </div>
      )}

      {airgapReady && (
      <div className="card sensitive-surface">
        <div
          className="border-2 border-dashed border-bg-surface rounded-lg p-8 text-center cursor-pointer hover:border-accent-teal transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInput.current?.click()}
        >
          <p className="text-text-on-dark/80">Drop your share files + manifest.json here, or click to pick (select all of them at once)</p>
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            onChange={onChange}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-bg-surface">
          <div className="text-sm text-text-muted mb-2">…or paste a share URL one at a time:</div>
          <div className="flex gap-2">
            <input
              type="url"
              className="flex-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.dropbox.com/scl/... or https://drive.google.com/file/d/..."
              spellCheck={false}
              autoComplete="off"
            />
            <button className="btn btn-secondary text-sm" disabled={urlBusy || !urlInput.trim()} onClick={() => void fetchFromUrl()}>
              {urlBusy ? "Fetching…" : "Fetch"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-text-muted mb-1">Manifest(s) loaded</div>
            {manifests.length === 0 ? (
              <div className="text-text-muted">— not loaded</div>
            ) : (
              <div className="space-y-1">
                {manifests.map((m) => (
                  <div key={m.vaultId} className="font-mono text-accent-green break-all">
                    ✓ vault {m.vaultId.slice(0, 12)}… · {m.shamir.threshold}-of-{m.shamir.total}
                    {m.quorumPolicy && (
                      <span className="ml-1 text-amber-300">· quorum {m.quorumPolicy.M}-of-{m.quorumPolicy.N}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-text-muted mb-1">Shares loaded</div>
            <div className="font-mono">
              {shares.length}
              {shares.length > 0 && (
                <div className="text-xs mt-1 text-text-muted break-all">
                  indices: {shares.map((s) => s.index).sort((a, b) => a - b).join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-slate-400 mb-1" htmlFor="restore-passkey">Vault master password</label>
          <MaskedSecret id="restore-passkey" value={passkey} onChange={setPasskey} />
        </div>

        {(passkeyEnv || manifests.some((m) => loadEnvelopeLocal(m.vaultId))) && (
          <div className="mt-3 p-3 rounded border border-bg-surface bg-bg-panel text-sm">
            <p className="text-text-muted text-xs mb-2">
              A passkey unlock is available for this vault — use Face ID / Touch ID / your security key instead of the master password. Your master password still works and remains your recovery key.
            </p>
            <button
              className="btn btn-secondary text-sm"
              disabled={busy || manifests.length === 0 || shares.length === 0}
              onClick={() => void reconstructWithPasskey()}
            >
              {busy ? "…" : "Unlock with passkey"}
            </button>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button className="btn btn-primary" disabled={busy || manifests.length === 0 || shares.length === 0 || passkey.length < 1} onClick={() => void reconstruct()}>
            {busy ? "Reconstructing…" : "Restore seed"}
          </button>
          <button className="btn btn-secondary" onClick={reset}>Reset</button>
        </div>
      </div>
      )}

      {airgapReady && error && <div className="card border-rose-500 text-rose-300 break-words">{error}</div>}

      {airgapReady && output && <RestoredPanel output={output} reveal={reveal} setReveal={setReveal} />}
    </div>
  );
}

// 0.14.0 — 7-step strip with per-card online/offline phase tag.
//   online   = step happens while the device is still connected (only step 1).
//   boundary = the explicit transition from online to offline (step 2 only).
//   offline  = step happens after airgap is engaged (steps 3-7).
// The phase drives the per-card indicator dot and is also surfaced in the
// boundary step's content slot (where the engagement UI lives).
type StepPhase = "online" | "boundary" | "offline";
const RESTORE_STEPS: readonly { n: number; label: string; sub: string; phase: StepPhase }[] = [
  { n: 1, label: "Gather", sub: "drop share files + manifest.json (or fetch one direct link at a time)", phase: "online" },
  { n: 2, label: "Go offline", sub: "engage airgap, disconnect Wi-Fi", phase: "boundary" },
  { n: 3, label: "Unlock", sub: "master password (Argon2id) — or passkey if you added one", phase: "offline" },
  { n: 4, label: "Verify", sub: "Ed25519 manifest signature checked", phase: "offline" },
  { n: 5, label: "Decrypt", sub: "each share AEAD-decrypted + tamper-checked", phase: "offline" },
  { n: 6, label: "Recombine", sub: "any T-of-N shares → Shamir combine", phase: "offline" },
  { n: 7, label: "Recovered", sub: "seed / letter / document — in this browser only", phase: "offline" },
];

/** 0.14.0 — Small phase indicator for each step card. Green dot = online,
 *  yellow dot = offline, both-with-arrow = boundary (the moment of crossing).
 *  Title attribute carries the long-form for hover. */
function PhaseIndicator({ phase }: { readonly phase: StepPhase }): JSX.Element {
  if (phase === "online") {
    return (
      <span
        title="Online phase — runs before airgap is engaged"
        className="inline-flex items-center gap-1 text-[10px] font-mono"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" aria-hidden />
        <span className="text-emerald-300">online</span>
      </span>
    );
  }
  if (phase === "offline") {
    return (
      <span
        title="Offline phase — runs after airgap is engaged"
        className="inline-flex items-center gap-1 text-[10px] font-mono"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400" aria-hidden />
        <span className="text-amber-300">offline</span>
      </span>
    );
  }
  // boundary — the explicit transition
  return (
    <span
      title="Boundary — engaging the airgap (crossing from online to offline)"
      className="inline-flex items-center gap-1 text-[10px] font-mono"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" aria-hidden />
      <span aria-hidden className="text-text-on-dark/80">→</span>
      <span className="inline-block w-2 h-2 rounded-full bg-amber-400" aria-hidden />
    </span>
  );
}

/** 0.14.0 — Strip now takes the active step number so the user can see
 *  exactly where they are. Non-active steps dim; the active step is
 *  highlighted (grad-bg, matches FlowSteps). */
function RestoreCycle({ activeN }: { readonly activeN?: number }): JSX.Element {
  return (
    <ol className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
      {RESTORE_STEPS.map((s) => {
        const isActive = activeN === s.n;
        const isDimmed = activeN !== undefined && !isActive;
        const cls = `rounded-lg border p-2 flex flex-col transition-colors ${
          isActive
            ? "grad-bg text-text-primary border-transparent"
            : isDimmed
            ? "bg-bg-surface/40 border-bg-surface text-text-on-dark/60"
            : "border-bg-surface bg-bg-deepest text-text-on-dark"
        }`;
        return (
          <li key={s.n} className={cls}>
            <div className="flex items-center justify-between gap-1">
              <span className={`grad-bg text-text-primary font-bold rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 ${isActive ? "bg-white/20 grad-bg-none" : ""}`}>{s.n}</span>
              <PhaseIndicator phase={s.phase} />
            </div>
            <span className={`font-display font-bold text-[13px] leading-tight mt-1 ${isActive ? "text-text-primary" : "text-text-on-dark"}`}>{s.label}</span>
            <p className={`text-[10px] mt-1 leading-snug ${isActive ? "text-text-primary/85" : "text-text-muted"}`}>{s.sub}</p>
          </li>
        );
      })}
    </ol>
  );
}

function RestoredPanel({ output, reveal, setReveal }: {
  readonly output: RestoreOutput;
  readonly reveal: boolean;
  readonly setReveal: (b: boolean) => void;
}): JSX.Element {
  const meta = (
    <div className="text-sm text-slate-400 mb-3">
      Used shares: {output.usedShareIndices.join(", ")}
      {output.tamperFlags.length > 0 && (
        <span className="text-amber-400"> · Tampered/wrong-password on: {output.tamperFlags.join(", ")}</span>
      )}
    </div>
  );

  if (output.kind === "bip39") {
    return (
      <div className="card border-emerald-500">
        <h2 className="font-bold text-emerald-400 mb-2">Seed restored ✓</h2>
        {meta}
        <div
          className="sensitive-surface select-none cursor-pointer"
          onMouseDown={() => setReveal(true)}
          onMouseUp={() => setReveal(false)}
          onMouseLeave={() => setReveal(false)}
          onTouchStart={() => setReveal(true)}
          onTouchEnd={() => setReveal(false)}
        >
          {reveal ? (
            <pre className="font-mono whitespace-pre-wrap break-words text-emerald-200">{output.mnemonic}</pre>
          ) : (
            <div className="text-slate-400 text-center py-6">Press and hold to reveal seed</div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Once revealed, copy this seed straight into a fresh wallet on a clean device. NoKLock does not retain it. Refresh the page to clear it from memory.
        </p>
      </div>
    );
  }

  const docOutput = output as Extract<RestoreOutput, { kind: "sealed-letter" | "document" }>;
  const isText = docOutput.mimeType === "text/plain" || docOutput.mimeType === "text/markdown";
  const isHtml = docOutput.mimeType === "text/html";
  const kindLabel = docOutput.kind === "sealed-letter" ? "Sealed letter" : "Document";
  const decodedText = isText && docOutput.kind === "sealed-letter"
    ? new TextDecoder().decode(docOutput.content)
    : null;
  const decodedHtml = isHtml && docOutput.kind === "sealed-letter"
    ? new TextDecoder().decode(docOutput.content)
    : null;

  function downloadFile(): void {
    const blob = new Blob([docOutput.content as BlobPart], { type: docOutput.mimeType ?? "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ext = docOutput.mimeType === "text/html" ? ".html" : docOutput.mimeType === "text/plain" ? ".txt" : ".bin";
    a.download = docOutput.originalFilename ?? `noklock-${docOutput.kind}-${docOutput.matchedVaultId.slice(0, 8)}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card border-emerald-500">
      <h2 className="font-bold text-emerald-400 mb-2">{kindLabel} restored ✓</h2>
      {meta}
      <div className="text-xs text-slate-400 mb-3">
        {output.originalFilename && <span>Original: <code className="font-mono">{output.originalFilename}</code> · </span>}
        {output.mimeType && <span><code className="font-mono">{output.mimeType}</code> · </span>}
        <span>{output.content.byteLength} bytes</span>
      </div>

      {decodedHtml !== null ? (
        <>
          <div
            className="sensitive-surface select-none cursor-pointer"
            onMouseDown={() => setReveal(true)}
            onMouseUp={() => setReveal(false)}
            onMouseLeave={() => setReveal(false)}
            onTouchStart={() => setReveal(true)}
            onTouchEnd={() => setReveal(false)}
          >
            {reveal ? (
              <RichTextView html={decodedHtml} className="text-emerald-100 text-sm" />
            ) : (
              <div className="text-slate-400 text-center py-6">Press and hold to reveal letter</div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary text-sm" onClick={downloadFile}>Download as file</button>
          </div>
        </>
      ) : decodedText !== null ? (
        <>
          <div
            className="sensitive-surface select-none cursor-pointer"
            onMouseDown={() => setReveal(true)}
            onMouseUp={() => setReveal(false)}
            onMouseLeave={() => setReveal(false)}
            onTouchStart={() => setReveal(true)}
            onTouchEnd={() => setReveal(false)}
          >
            {reveal ? (
              <pre className="font-mono whitespace-pre-wrap break-words text-emerald-200 text-sm">{decodedText}</pre>
            ) : (
              <div className="text-slate-400 text-center py-6">Press and hold to reveal letter</div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-secondary text-sm" onClick={downloadFile}>Download as file</button>
          </div>
        </>
      ) : (
        <div className="text-center py-6 border border-dashed border-bg-surface rounded">
          <p className="text-text-on-dark/80 text-sm mb-3">
            {output.kind === "sealed-letter"
              ? "This sealed letter was uploaded as a non-text file. Download to open in your preferred editor."
              : "Document decrypted. Download to open in your preferred editor."}
          </p>
          <button className="btn btn-primary" onClick={downloadFile}>
            Download {output.originalFilename ?? `${output.kind}.bin`}
          </button>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Decrypted bytes live in this browser tab only. Refresh to clear from memory. NoKLock does not retain the plaintext.
      </p>
    </div>
  );
}
