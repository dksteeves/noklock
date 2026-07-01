// @version 0.3.0 @date 2026-06-01
// 0.3.0 — Daniel 2026-06-01: REPLACED the forgeable ownerAck boolean guard with
//         a cryptographic-attestation-aware route guard. `evaluateOwnerAckGuard`
//         is gone (it returned PROCEED on a caller-supplied boolean — an heir
//         who clicked "I'm the owner" walked straight through the M-of-N gate
//         without any wallet signature). The new helper
//         `evaluateRestoreModeGuard` reads the loaded manifests AND the result
//         of an EIP-712 wallet-signed `OwnerSelfRestoreProof` (issued by Form B
//         AFTER recovering the wallet signature against the on-record owner
//         wallet for that vault). The decision matrix is:
//
//           - no quorumPolicy on any loaded manifest   → "proceed-legacy"
//           - quorumPolicy present, no owner proof yet → "blocked-need-owner-proof"
//           - quorumPolicy present + owner proof in    → "proceed-with-owner-proof"
//
//         The "blocked-heir-only" outcome exists for callers that want to
//         redirect heirs to /heir/restore unconditionally (e.g. an `/owner-only`
//         route guard); the /restore route doesn't need it since /restore is
//         the owner path by definition and the heir-button is a `<Link>`.
//
//         This closes the Workflow A.1 re-review heir-bypass: an heir landing
//         on /restore CANNOT now silently unlock — they hit
//         "blocked-need-owner-proof" and the only way through is to connect a
//         wallet whose address is the recorded owner of that vault AND sign
//         the OwnerSelfRestore EIP-712 challenge. Form B verifies the recovered
//         signer matches the on-record owner before issuing the attestation;
//         restore-pipeline.ts (0.9.0+) verifies the attestation signature
//         against the env-frozen attestor before allowing the unlock.
//
// 0.2.0 — Daniel 2026-06-01: + `evaluateOwnerAckGuard` — the pure predicate
//         behind Restore.tsx 0.10.0's heir-bypass guard. Extracted as a
//         standalone function so unit tests (restore-quorum-route-guard.test.ts)
//         can exercise it without React. Restore.tsx (next bump) is expected
//         to call this instead of inlining the find()+ownerAck branch.
// 0.1.0 — Daniel 2026-06-01: M-of-N Stage 1 step 3 [mofn-restore-quorum-fix-plan §D.1].
//         Thin readers over the `quorumPolicy` field on `VaultManifest`
//         (added in crypto-core types 0.5.0 §D.7). Kept as separate getters
//         so callers don't have to remember the "applies only in heir mode"
//         rule — `quorumApplies` encapsulates the Stage-1 owner-path-
//         preservation invariant from plan §F.
//
//         OWNER MODE is a no-op even when the manifest carries a
//         quorumPolicy — the owner with the master password + shares
//         restores on any browser by design (plan §F). Quorum gating
//         applies only to the heir-restore route (`/heir/restore`),
//         which forces `mode === "heir"` and refuses without an EIP-712
//         `QuorumReleaseAttestation` from the Form B attestor.
//
//         `QuorumPolicy` is re-exported here from `@soulchain/crypto-core`
//         purely for callsite ergonomics (one import for the type + the
//         readers). The shape is authoritative in `crypto-core/src/types.ts`.

import type { VaultManifest, QuorumPolicy as CryptoCoreQuorumPolicy } from "@soulchain/crypto-core";
import type { RestoreMode } from "./restore-mode.js";
import type { RestoreInput } from "./restore-pipeline.js";

/** Re-export for callsite ergonomics. Authoritative definition lives in
 *  `@soulchain/crypto-core` (`packages/crypto-core/src/types.ts`). */
export type QuorumPolicy = CryptoCoreQuorumPolicy;

/** Shape of the cryptographic owner-self-restore proof that has to be
 *  presented to clear the route guard. Identical (by construction) to the
 *  `ownerSelfRestoreProof` field on `RestoreInput` in restore-pipeline.ts
 *  (0.9.0+) — that pipeline does the heavy verification (EIP-712 recover,
 *  env-frozen attestor address, manifestHash + vaultId match, expiresAt).
 *  The route guard just reads "present-or-not". */
export type OwnerSelfRestoreProof = NonNullable<RestoreInput["ownerSelfRestoreProof"]>;

/** Read the optional quorum policy off a manifest. Returns undefined for
 *  legacy / Free / pre-2026-06 manifests (grandfather path). */
export function getQuorumPolicy(manifest: VaultManifest): QuorumPolicy | undefined {
  return manifest.quorumPolicy;
}

/** Does the quorum gate apply to this restore attempt? True iff the caller
 *  is in heir mode AND the manifest carries a `quorumPolicy`. Owner mode
 *  is byte-identical to today regardless of the field's presence (plan §F:
 *  owner-path preservation). Free / Standard-without-quorum / pre-2026-06
 *  vaults return false (no field → no gate). */
export function quorumApplies(manifest: VaultManifest, mode: RestoreMode): boolean {
  return mode === "heir" && manifest.quorumPolicy !== undefined;
}

/** 0.3.0 — Route-level guard outcomes for /restore.
 *
 *  - "proceed-legacy"            — no loaded manifest carries `quorumPolicy`,
 *                                   so the pre-quorum owner path runs
 *                                   byte-identically (no proof needed).
 *  - "blocked-need-owner-proof"  — at least one loaded manifest is
 *                                   quorum-protected and we don't yet have a
 *                                   Form-B-issued `OwnerSelfRestoreProof`.
 *                                   The UI is expected to render the
 *                                   "connect owner wallet + sign challenge"
 *                                   fork; nothing in the pipeline runs.
 *  - "blocked-heir-only"          — reserved for routes that want to redirect
 *                                   heirs unconditionally (e.g. an owner-only
 *                                   admin sub-route). /restore doesn't return
 *                                   this — it shows a `<Link to="/heir/restore">`
 *                                   directly.
 *  - "proceed-with-owner-proof"  — quorum-protected manifest AND we have a
 *                                   present proof object. The pipeline will
 *                                   still re-verify the proof cryptographically
 *                                   (see restore-pipeline.ts
 *                                   `assertQuorumPolicyHonored` 0.9.0+) — this
 *                                   guard just shapes the route's state machine.
 */
export type RestoreModeGuardOutcome =
  | "proceed-legacy"
  | "blocked-need-owner-proof"
  | "blocked-heir-only"
  | "proceed-with-owner-proof";

/** 0.3.0 — Pure predicate behind the /restore route guard. Reads the loaded
 *  manifest set + the (possibly undefined) owner-self-restore proof and
 *  returns the next step the UI should take. Unit-testable without React.
 *
 *  The /restore route always tries the owner-mode path — heirs are sent to
 *  /heir/restore via a top-of-page link. So this helper never returns
 *  "blocked-heir-only" itself; it's part of the union for other consumers.
 *
 *  Replaces the forgeable boolean `evaluateOwnerAckGuard` (0.2.0). The
 *  proof here is wallet-signed and Form-B-attested; the previous boolean
 *  was caller-supplied and had no cryptographic backing. */
export function evaluateRestoreModeGuard(
  manifests: readonly VaultManifest[],
  ownerSelfRestoreProof: OwnerSelfRestoreProof | undefined,
): RestoreModeGuardOutcome {
  const quorumProtected = manifests.find((m) => m.quorumPolicy !== undefined);
  if (!quorumProtected) return "proceed-legacy";
  if (!ownerSelfRestoreProof) return "blocked-need-owner-proof";
  return "proceed-with-owner-proof";
}
