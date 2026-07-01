// @version 0.14.0 @date 2026-06-16
// 0.14.0 — Daniel 2026-06-16: B-2 (disappearance test) — Form-B-INDEPENDENT
//          local heir quorum. The heir path in `assertQuorumPolicyHonored`
//          now clears on EITHER a Form-B `quorumProof` OR a new
//          `localHeirQuorum`: M distinct heir wallets sign one shared
//          `QuorumLocalRelease` tuple, and `assertLocalHeirQuorum` recovers +
//          de-dupes the signers and confirms each holds a Voting-role SBT for
//          the vault on-chain (via the injected `isVotingHolder` reader —
//          backed by the SBT's public `hasRoleForVault`). No Form B, no
//          attestor key: a quorum vault stays restorable even if NoKLock
//          vanishes (only dependency = a Polygon SBT read). Domain/types +
//          the reader factory live in lib/quorum-local.ts so heir wallets
//          SIGN and the pipeline VERIFIES byte-identical typed-data. Owner
//          path + the existing Form-B heir path are unchanged.
// 0.13.0 — Daniel 2026-06-03: MED-restore-1 fix — provenance HMAC verify
//          length check moved INTO the constant-time loop. Previously a
//          length mismatch hit a separate `else if` branch and returned
//          `ok = false` without walking the XOR loop, leaking a
//          timing/branch-side-channel signal that distinguished
//          "same length, wrong bytes" from "different length" (~few-ns
//          but observable in close-proximity profiling). The new path
//          iterates over min(a.length, b.length), accumulates XOR diffs,
//          then unconditionally ORs a sentinel bit (0x100, outside any
//          byte's value range so it can't be cleared by a colliding XOR
//          on a real byte mismatch) when lengths disagree. Final compare
//          is a single `diff === 0` test. Prefers
//          `crypto.subtle.timingSafeEqual` when present (Node 21+ /
//          some browsers); JS XOR-accumulate is the fallback. Also folds
//          the two cross-checks (descriptor-vs-share tag AND
//          MAC-over-cipher) into a non-short-circuiting `ok1 && ok2`
//          AFTER both have run, so a false ok1 doesn't skip the MAC
//          verify (matches the no-short-circuit discipline used
//          elsewhere in the unlock pipeline).
// 0.12.0 — Daniel 2026-06-03: H4 fix — re-bind owner manifest bytes to the
//          owner-self-restore attestation at the call site, immediately
//          after `assertQuorumPolicyHonored()` returns. The gate function
//          already checks `oProof.manifestHash === mfHashHex` and
//          `oProof.vaultId === vaultIdHex` internally, but H4 review flagged
//          that the unlock site itself does not re-derive and compare those
//          bytes — meaning any future refactor or subtle bug inside the gate
//          (e.g. early-return on a code path, a swallowed throw, a wrong
//          hash function in `manifest.manifestHash`) would let an
//          attestation issued against a DIFFERENT manifest unlock the
//          actual manifest being decrypted. Defence-in-depth: we now
//          re-compute `manifestHash(mf)` and `mf.vaultId` at unlock and
//          assert exact match against the supplied `ownerSelfRestoreProof`,
//          throwing `RestoreError("manifest mismatch after quorum gate")`
//          on any disagreement. This is a redundant check by design — if
//          the gate is healthy it never fires; if the gate ever stops
//          binding, this fires before Argon2id / AEAD touches the master
//          password. Quorum (heir) path is unchanged — its proof has no
//          `manifestHash`/`vaultId` fields on `RestoreInput` (the gate
//          recovers them from the signature), so the call-site re-check
//          is owner-only. Also: introduces a `RestoreError` class so the
//          UI can branch on `instanceof` (Restore.tsx surfaces .message
//          today; future use can key off the type without string-match).
// 0.11.0 — Daniel 2026-06-01: G5-A per-share provenance HMAC verification
//          [noklock-deferred-backlog-execution-plan §G5-A]. When a v3 manifest
//          carries `provenanceB64` on a share descriptor, the restore pipeline
//          now verifies the 16-byte HMAC tag BEFORE attempting AEAD-decrypt.
//          The tag binds (vaultId, shareIndex, ciphertext) under an HKDF-
//          derived sub-key, so a forged share file with the right vaultId
//          and a plausible index is rejected without (a) burning the AEAD
//          decrypt, and (b) prompting the heir for the master password
//          on a junk share. Failing shares are routed into `tamperFlags`
//          (the existing tamper-gate from 0.5.1 then short-circuits unlock
//          before any plaintext leaves the pipeline). Defence-in-depth:
//          the AEAD-AAD already binds (vaultId, shareIndex, cipher), so
//          this is a SECOND independent check that fires earlier in the
//          pipeline and uses a domain-separated sub-key. v1/v2 vaults
//          and v3 vaults whose descriptors lack the field are unaffected
//          (no-op — restore is byte-identical to 0.10.0).
//          Also: `parseShareJson` now reads the optional `"prov"` field
//          from on-disk share JSON; absent → undefined → no verification.
// 0.10.0 — Daniel 2026-06-01: phishing-replay close-out (Workflow A.2 re-review).
//          NO CHANGES to the EIP-712 OwnerSelfRestoreAttestation type verified
//          here — that attestation already includes its own server-issued
//          nonce + expiresAt (15-min one-shot). The new defence sits ONE STEP
//          UPSTREAM: Form B issues an ephemeral CHALLENGE nonce (5-min expiry,
//          single-use) the wallet signs over BEFORE the attestation is issued.
//          The challenge-nonce flow closes the bypass closure from Workflow
//          A.2 re-review where a no-nonce signature could be phished once and
//          replayed against Form B's attestation route indefinitely (until
//          owner_wallet changed). See:
//            apps/web/src/routes/Restore.tsx               0.12.0
//            apps/web/src/lib/quorum-client.ts             0.3.0
//            server-form-b/.../routes/quorum.ts            0.4.0
//            server-form-b/.../db/migrations/022-owner-challenge-nonces.sql
//          The attestation this pipeline verifies remains byte-identical.
// 0.9.0 — Daniel 2026-06-01: OwnerSelfRestoreProof support; closes /restore-route
//          bypass identified in Workflow A.1 re-review (the previous owner-mode
//          path relied on a falsy `heirMode` flag — a forgeable boolean from the
//          caller; any client could set heirMode=false and skip the quorum gate
//          entirely on a quorum-protected vault). Now: when the manifest carries
//          a `quorumPolicy`, BOTH paths require a server-attested proof:
//            - Heir path (heirMode=true) → `quorumProof` (Form B QuorumReleaseAttestation)
//              verified against VITE_QUORUM_ATTESTOR_ADDRESS (unchanged from 0.8.0).
//            - Owner path (heirMode=false) → `ownerSelfRestoreProof`
//              (Form B OwnerSelfRestoreAttestation) verified against
//              VITE_OWNER_SELF_RESTORE_ATTESTOR_ADDRESS (NEW, separate env).
//          Owners cannot bypass quorum-protected manifests with a boolean any
//          more; they must obtain a fresh owner-self-restore attestation from
//          Form B (which requires the same wallet-signature challenge Form B
//          uses elsewhere). Legacy manifests with NO quorumPolicy still
//          grandfather (byte-identical no-op) so v1/v2 owner restore is
//          untouched.
//          Renamed: assertQuorumOrOwnerMode → assertQuorumPolicyHonored.
// 0.8.0 — Daniel 2026-06-01: CRITICAL fix: env-required attestor (no fallback to
//          proof.signer). Adversarial review surfaced that the previous code
//          fell back to `proof.signer` when VITE_QUORUM_ATTESTOR_ADDRESS was
//          missing at build time — letting a heir generate their own key, sign
//          a fake attestation, set `proof.signer` to that key's address and
//          have every check pass. Now: module-scope `QUORUM_ATTESTOR_ADDR`
//          is read + validated AT MODULE LOAD; missing/malformed env throws
//          immediately so the bundle won't even initialise. Fail-closed.
//          Heir spoof bypass closed.
// 0.8.0 — Daniel 2026-06-01: M-of-N Stage 1 step D.2 [mofn-restore-quorum-fix-plan §D.2].
//          Added optional `heirMode` + `quorumProof` to `RestoreInput`, and a
//          new `assertQuorumOrOwnerMode(mf, input)` gate fired AFTER manifest
//          signature verification and BEFORE Argon2id master derivation.
//          OWNER PATH IS BYTE-IDENTICAL: when `heirMode` is falsy (the
//          default everywhere except `/heir/restore`), the helper is a
//          no-op regardless of whether the manifest carries a
//          `quorumPolicy` (plan §F). HEIR PATH: when `heirMode` is true
//          and the manifest carries a `quorumPolicy`, the helper requires
//          a valid `quorumProof` — EIP-712 signature recovers to the
//          configured attestor (VITE_QUORUM_ATTESTOR_ADDRESS), expiresAt
//          is in the future, and the manifestHash inside the signed
//          attestation matches this manifest. Throws otherwise.
//          Legacy manifests with NO quorumPolicy + heirMode=true succeed
//          without a proof (grandfather path for pre-2026-06 vaults).
// 0.7.0 — Daniel 2026-06-01: LAUNCH-BLOCKER 3 [launch-blocker-3-segment-activity-logging].
//          The pipeline historically computed `tamperFlags` per-share but only
//          USED them to gate unlock (0.5.1). They were never persisted, so
//          operators had zero visibility into vault-probing — e.g. a stolen
//          share file + someone brute-forcing the master password. Now: right
//          after the AEAD decrypt loop, we fire a fire-and-forget beacon to
//          POST /v1/ops/segment-activity for EACH tampered share index (one
//          row per flagged share) and a SINGLE 'ok' summary row for the
//          attempt (vault-bound, share_index = -1-style sentinel? No — to
//          keep the migration's CHECK simple, the 'ok' summary uses
//          shareIndex 0 with result='ok'; the read summary just counts by
//          result anyway). Uses navigator.sendBeacon (same primitive as
//          track.ts) so it never blocks the user; all failures swallowed.
//          NOTE: emits the beacon BEFORE the tamper-gate throw so failed
//          unlocks still log their tamper signature.
// 0.6.0 — Daniel 2026-06-01: LAUNCH-BLOCKER 2 [launch-blocker-2-randomised-naming-mask].
//          Restore now understands the new optional `maskedFilename` field
//          on the manifest's share descriptors (v3 vaults only). Callers
//          that load shares from disk/cloud by name should use the new
//          helper `expectedShareFilename(descriptor, vaultId)` which
//          returns `{maskedFilename}.json` when present, otherwise the
//          legacy deterministic `vaultId-share-{idx}.json` format used by
//          v1/v2 vaults. The pipeline itself accepts pre-parsed shares so
//          nothing about decrypt changed — restore is byte-identical for
//          v1/v2 vaults, and v3 vaults with valid masked shares decrypt
//          via the same v2 HKDF/AAD path (v3 only adds filename masking
//          on top of v2 derivation).
// 0.5.1 — Daniel 2026-06-01: ARCH-GAP fix [archgap-tamper-gate-enforcement].
//          The pipeline collected `tamperFlags` (per-share AEAD failures)
//          and returned them in the output but NEVER gated unlock on them.
//          A tampered share that still left threshold-many good shares
//          would silently reconstruct the plaintext. Now: if any share
//          failed AEAD/AAD verification (tamperFlags.length > 0), we
//          throw BEFORE returning the reconstructed secret. The flagged
//          share indices are included in the error message — Restore.tsx
//          already surfaces thrown errors to the UI so the user sees
//          exactly which share(s) tripped the gate.
// 0.5.0 — Daniel 2026-06-01: RESTORE-SIDE memory wipe. Architecture-gap
//          review surfaced that the original spec requires offline +
//          memory-wipe at Restore (same as Segment) — we shipped only
//          the enrol side. Now mirrors enrol-pipeline.ts 0.4.0: every
//          Uint8Array derived during restore (master, prk, per-share
//          AEAD keys, decrypted share plaintexts, combined entropy /
//          content key) is synchronously .fill(0)'d in try/finally
//          the moment it's no longer needed. The OUTPUT bytes
//          (content for doc kind) remain — caller owns wipe after use.
//          The BIP39 mnemonic is a JS string (same caveat as enrol —
//          no in-place wipe API exists). masterOverride is caller-
//          owned and not wiped here.
// 0.4.0 — @date 2026-05-27
// 0.4.0 — Tier 1A + 1C: cryptoBaseline-aware decrypt. v1 manifests (absent
//         field, or "v1") decrypt with the legacy raw-master-as-key + no-AAD
//         path — byte-identical to pre-0.4.0 behaviour, so every existing
//         vault keeps restoring. v2 manifests (cryptoBaseline === "v2") use
//         the HKDF-derived per-share key + (vaultId, shareIndex, cipher)-
//         bound AAD; cross-vault share replay fails because the AAD won't
//         match. masterOverride still skips the Argon2id step but feeds the
//         same baseline-aware key-derivation downstream.
// 0.3.1 — Optional `masterOverride`: when the user unlocks with a real
//         WebAuthn passkey, the UI re-derives the SAME `master` from the
//         passkey sidecar and passes it here, so the Argon2id password
//         derivation step is skipped. When absent (the default, and the
//         only path a next-of-kin / threshold restore ever uses) behaviour
//         is exactly as before. The password remains the canonical
//         recovery secret.
// 0.3.0 — kind-aware restore. If the manifest carries `docExt`, treat the
//         shares as Shamir fragments of a CONTENT KEY (not entropy);
//         combine, AEAD-decrypt the inline blob in `docExt`, return bytes +
//         mimeType + originalFilename. Otherwise fall back to the BIP39
//         entropy path. Output now has a discriminated union on `kind`.
// 0.2.0 — when multiple manifests are dropped in (real + decoy), the
//         caller can pass them all; the pipeline tries the passkey against
//         each manifest in turn and returns whichever decrypts cleanly.
//         The caller cannot tell whether they unlocked the real or decoy
//         vault (no flag in the output) — by design. Only the user knows
//         which passkey they typed.

import { kdf, slip39, aead, manifest, bip39 } from "@soulchain/crypto-core";
import type { CipherKind, VaultManifest, CryptoBaseline, ShareDescriptor } from "@soulchain/crypto-core";
import { recoverTypedDataAddress } from "viem";
import type { Hex, Address } from "viem";
import { buildDocContentAADv2 } from "./doc-pipeline.js";
import { wipeBytes } from "./enrol-pipeline.js";
import { postSegmentActivity } from "./track.js";
import {
  QUORUM_LOCAL_DOMAIN,
  QUORUM_LOCAL_TYPES,
  type LocalHeirQuorum,
  type VotingHolderReader,
} from "./quorum-local.js";

/** 0.8.0 — CRITICAL fail-closed: the Form B quorum attestor address MUST be
 *  baked into the bundle at build time. If it's missing or malformed, the
 *  module THROWS AT LOAD — the bundle won't initialise. The previous code
 *  fell back to `proof.signer` (caller-supplied) when the env was absent;
 *  that turned the whole quorum-gate into a no-op for a heir who could
 *  generate their own key, sign a fake attestation, set `proof.signer` to
 *  their key's address and watch every check pass. This module-scope check
 *  closes that bypass. Stage 2 (on-chain NoKLockQuorum) will replace this
 *  with an on-chain attestor registry, but the env-pin is the right gate
 *  for Stage 1. */
const QUORUM_ATTESTOR_ADDR = ((): `0x${string}` => {
  const raw = (import.meta.env.VITE_QUORUM_ATTESTOR_ADDRESS as string | undefined)?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) {
    throw new Error("restore-pipeline: VITE_QUORUM_ATTESTOR_ADDRESS is required and must be 0x[40hex] — refusing to load (would be a quorum-gate bypass)");
  }
  return raw.toLowerCase() as `0x${string}`;
})();

/** 0.9.0 — Owner-self-restore attestor (separate from quorum attestor). Form B
 *  issues an OwnerSelfRestoreAttestation after verifying the owner's wallet
 *  signature on a fresh challenge; this address is the recovered signer for
 *  those attestations. DIFFERENT KEY than the quorum attestor so the two
 *  authorities can be rotated / revoked / scoped independently. Same fail-
 *  closed semantics: missing or malformed env throws at module load so the
 *  bundle won't initialise (the previous boolean-only owner-path check was
 *  forgeable by the caller — see 0.9.0 changelog). */
const OWNER_SELF_RESTORE_ATTESTOR_ADDR = ((): `0x${string}` => {
  const raw = (import.meta.env.VITE_OWNER_SELF_RESTORE_ATTESTOR_ADDRESS as string | undefined)?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) {
    throw new Error("restore-pipeline: VITE_OWNER_SELF_RESTORE_ATTESTOR_ADDRESS is required and must be 0x[40hex] — refusing to load");
  }
  return raw.toLowerCase() as `0x${string}`;
})();

export type DocKind = "sealed-letter" | "document";

interface DocManifestExt {
  readonly kind: DocKind;
  readonly mimeType?: string;
  readonly originalFilename?: string;
  readonly originalSize: number;
  readonly contentCipher: CipherKind;
  readonly contentIvB64: string;
  readonly contentCipherTextB64: string;
  readonly contentTagB64?: string;
}

type ManifestMaybeDoc = VaultManifest & { docExt?: DocManifestExt };

export interface ParsedShare {
  readonly vaultId: string;
  readonly index: number;
  readonly cipher: CipherKind;
  readonly iv: Uint8Array;
  readonly cipherText: Uint8Array;
  readonly tag: Uint8Array | undefined;
  readonly plainLen: number;
  /** 0.11.0 — v3 only: 16-byte per-share provenance HMAC tag, base64-
   *  decoded. Present when the share file carries `"prov"`; absent on
   *  v1/v2 share files. Restore verifies this against the matching
   *  manifest descriptor's `provenanceB64` BEFORE AEAD-decrypt. */
  readonly provenance?: Uint8Array;
}

export interface RestoreInput {
  /** One or more manifests. The pipeline tries the passkey against each
   *  in order; the first that decrypts the matching shares wins. */
  readonly manifests: readonly VaultManifest[];
  readonly shares: readonly ParsedShare[];
  readonly passkey: string;
  /** Set ONLY by the WebAuthn passkey-unlock path: the master re-derived
   *  from the passkey sidecar. When present, the Argon2id-from-password
   *  step is skipped and this is used as the master directly. The password
   *  path (masterOverride undefined) is unchanged. */
  readonly masterOverride?: Uint8Array;
  /** 0.8.0 — M-of-N Stage 1. Owner path (`/restore`) leaves this falsy and
   *  behaves byte-identically to 0.7.0. Heir path (`/heir/restore`) sets
   *  this to true; if the manifest carries a `quorumPolicy`, a valid
   *  `quorumProof` MUST also be supplied or the pipeline throws before
   *  any key derivation. */
  readonly heirMode?: boolean;
  /** 0.8.0 — Form B `QuorumReleaseAttestation` covering this manifest.
   *  Verified inside `assertQuorumOrOwnerMode`: signature recovers to
   *  the env-configured attestor, expiresAt > now, and the signed
   *  `manifestHash` matches the actual manifest hash. */
  readonly quorumProof?: {
    readonly attestation: Hex;
    readonly signer: Address;
    readonly expiresAt: number;
    readonly nonce: Hex;
  };
  /** 0.9.0 — Form B `OwnerSelfRestoreAttestation` covering this manifest.
   *  Required when the manifest carries a `quorumPolicy` AND the caller is
   *  in owner mode (`heirMode` falsy). Verified inside
   *  `assertQuorumPolicyHonored`: signature recovers to the env-configured
   *  OWNER_SELF_RESTORE_ATTESTOR_ADDR, expiresAt > now, and the signed
   *  `manifestHash` + `vaultId` match this manifest. The `ownerWallet`
   *  field records which owner wallet Form B verified before issuing. */
  readonly ownerSelfRestoreProof?: {
    readonly attestation: Hex;
    readonly signer: Address;
    readonly expiresAt: number;
    readonly nonce: Hex;
    readonly ownerWallet: Address;
    readonly vaultId: Hex;
    readonly manifestHash: Hex;
  };
  /** B-2 (disappearance-resilient heir quorum) — Form-B-INDEPENDENT local
   *  release. Set in heir mode INSTEAD OF `quorumProof`. M distinct heir
   *  wallets each EIP-712-sign a `QuorumLocalRelease` over (vaultId,
   *  manifestHash, M, N, expiresAt, nonce); `assertLocalHeirQuorum` recovers
   *  each signer, de-dupes, and confirms each holds a Voting-role SBT for this
   *  vault on-chain via `isVotingHolder` — then requires >= M distinct valid
   *  heir signers. No Form B, no attestor: works even if NoKLock has vanished
   *  (the only dependency is a Polygon SBT read — see lib/quorum-local.ts). If
   *  BOTH `quorumProof` and `localHeirQuorum` are present, the Form-B path is
   *  tried first and EITHER clearing the gate suffices. */
  readonly localHeirQuorum?: LocalHeirQuorum;
  /** B-2 — injected on-chain reader backing `localHeirQuorum`. Supplied by
   *  HeirRestore.tsx (wraps the SBT `hasRoleForVault` view through the app's
   *  publicClient inside `runOnline()`). Keeps this pure-crypto module free of
   *  wagmi/RPC imports. REQUIRED whenever `localHeirQuorum` is used. */
  readonly isVotingHolder?: VotingHolderReader;
}

/** 0.8.0 — domain + types for the EIP-712 `QuorumReleaseAttestation` issued
 *  by Form B (see server-form-b/.../services/quorum-attestation.ts). Stage 1
 *  pins `verifyingContract = 0x0…0` because there is no on-chain
 *  NoKLockQuorum yet. Stage 2 will swap to the deployed address. */
const QUORUM_ATT_DOMAIN = {
  name: "NoKLockQuorum",
  version: "1",
  chainId: 137,
  verifyingContract: "0x0000000000000000000000000000000000000000" as Address,
} as const;

const QUORUM_ATT_TYPES = {
  QuorumReleaseAttestation: [
    { name: "vaultId", type: "bytes32" },
    { name: "manifestHash", type: "bytes32" },
    { name: "M", type: "uint8" },
    { name: "N", type: "uint8" },
    { name: "expiresAt", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

/** 0.9.0 — EIP-712 domain + types for OwnerSelfRestoreAttestation issued by
 *  Form B (see server-form-b/.../services/owner-self-restore-attestation.ts).
 *  Distinct domain name from QuorumReleaseAttestation so a quorum attestation
 *  signed by the quorum attestor can NEVER be replayed as an owner-self-restore
 *  attestation (and vice versa), even before the env-frozen signer check. */
const OWNER_SELF_RESTORE_ATT_DOMAIN = {
  name: "NoKLockOwnerSelfRestore",
  version: "1",
  chainId: 137,
  verifyingContract: "0x0000000000000000000000000000000000000000" as Address,
} as const;

const OWNER_SELF_RESTORE_ATT_TYPES = {
  OwnerSelfRestoreAttestation: [
    { name: "vaultId", type: "bytes32" },
    { name: "manifestHash", type: "bytes32" },
    { name: "ownerWallet", type: "address" },
    { name: "expiresAt", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

function bytesToHex(bytes: Uint8Array): Hex {
  let out = "0x";
  for (let i = 0; i < bytes.length; i++) out += bytes[i]!.toString(16).padStart(2, "0");
  return out as Hex;
}

/** 0.12.0 — H4 fix: dedicated error class for restore-pipeline guard
 *  violations. Lets the UI (Restore.tsx) branch on `instanceof RestoreError`
 *  in the future without string-matching the message. Currently used by the
 *  H4 owner-manifest re-bind check immediately after the quorum gate. */
export class RestoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RestoreError";
  }
}

/** 0.9.0 — quorum-policy gate. Enforces the manifest's quorum policy on BOTH
 *  paths (heir and owner) once a manifest carries `quorumPolicy`. Previously
 *  the gate was bypassed entirely when `heirMode` was falsy — a forgeable
 *  caller-supplied boolean. Now:
 *    - No `quorumPolicy` on the manifest → no-op (legacy / pre-2026-06 vaults,
 *      byte-identical to 0.8.0 grandfather path).
 *    - `quorumPolicy` + heirMode=true → requires `quorumProof`, verified
 *      against VITE_QUORUM_ATTESTOR_ADDRESS.
 *    - `quorumPolicy` + heirMode falsy (owner) → requires
 *      `ownerSelfRestoreProof`, verified against
 *      VITE_OWNER_SELF_RESTORE_ATTESTOR_ADDRESS.
 *    - Neither proof present on a quorum-protected manifest → throws.
 *  All signature recovery uses the local clock for `expiresAt`; same
 *  Stage-1 limitation noted in 0.8.0 applies (Stage-2 on-chain quorum
 *  uses block.timestamp). */
// KNOWN STAGE-1 LIMITATIONS (closed in Stage-2 via on-chain NoKLockQuorum):
// 1. Local-clock skew: expiresAt vs Date.now() — heir with rolled-back device clock
//    could extend a stale attestation window. Mitigated by short server expiries.
// 2. Manifest-downgrade theoretical: heir who already has the SEED (which would be the
//    actual decrypt secret) could sign a competing manifest without quorumPolicy. The
//    attack pre-requisite (seed) is exactly what the vault is protecting — so this is
//    a circular concern, not a real bypass.
// 3. Attestation replay within validity window: HTTPS-protected; requires capture of an
//    in-transit attestation AND independent K-shares + master-password possession.
export async function assertQuorumPolicyHonored(
  mf: VaultManifest,
  input: RestoreInput,
): Promise<void> {
  // Legacy / Free / pre-2026-06 vaults — no quorumPolicy → no gate
  // (byte-identical to today, grandfather path).
  if (!mf.quorumPolicy) return;

  const now = Math.floor(Date.now() / 1000);
  const mfHashHex = bytesToHex(manifest.manifestHash(mf));
  const vaultIdHex = (mf.vaultId.startsWith("0x") ? mf.vaultId : `0x${mf.vaultId}`) as Hex;

  if (input.heirMode === true) {
    // ─── Heir path ────────────────────────────────────────────────────
    // TWO independent ways to clear the gate:
    //  (1) Form-B QuorumReleaseAttestation (`quorumProof`) — online convenience.
    //  (2) B-2 local M-heir-signature threshold (`localHeirQuorum`) — survives
    //      Form B / NoKLock disappearing; verified on-chain, no attestor key.
    // The Form-B path is tried first when present; otherwise the local path.
    if (!input.quorumProof) {
      if (input.localHeirQuorum) {
        await assertLocalHeirQuorum(mf, input, vaultIdHex, mfHashHex, now);
        return;
      }
      if (input.ownerSelfRestoreProof) {
        // Defence-in-depth: caller in heirMode supplying an owner proof is
        // a wiring bug — fail explicitly rather than silently use the wrong
        // path.
        throw new Error(
          "Heir restore requires an M-of-N quorum release attestation — owner-self-restore attestation supplied instead.",
        );
      }
      throw new Error(
        "Quorum-protected vault: provide a Form B heir quorum release attestation, an M-of-N local heir-signature release, or (owner mode) an owner-self-restore attestation",
      );
    }

    const proof = input.quorumProof;
    if (proof.expiresAt <= now) {
      throw new Error("Quorum release attestation has expired — request a fresh one from the heir restore page.");
    }

    let recovered: Address;
    try {
      recovered = await recoverTypedDataAddress({
        domain: QUORUM_ATT_DOMAIN,
        types: QUORUM_ATT_TYPES,
        primaryType: "QuorumReleaseAttestation",
        message: {
          vaultId: vaultIdHex,
          manifestHash: mfHashHex,
          M: mf.quorumPolicy.M,
          N: mf.quorumPolicy.N,
          expiresAt: BigInt(proof.expiresAt),
          nonce: proof.nonce,
        },
        signature: proof.attestation,
      });
    } catch (e) {
      throw new Error(`Quorum release attestation signature did not recover: ${(e as Error).message}`);
    }

    // 0.8.0 — env-frozen attestor, no fallback.
    if (recovered.toLowerCase() !== QUORUM_ATTESTOR_ADDR.toLowerCase()) {
      throw new Error(
        `Quorum release attestation signer mismatch — recovered ${recovered}, expected ${QUORUM_ATTESTOR_ADDR}.`,
      );
    }
    if (recovered.toLowerCase() !== proof.signer.toLowerCase()) {
      throw new Error("Quorum release attestation signer field disagrees with recovered signer.");
    }
    return;
  }

  // ─── Owner path (heirMode falsy) ─────────────────────────────────────
  // 0.9.0 closes the Workflow A.1 re-review bypass: previously this path was
  // a silent no-op on quorum-protected manifests, gated only by a forgeable
  // boolean. Now: same fail-closed treatment as the heir path, but against
  // a separate env-frozen attestor.
  if (!input.ownerSelfRestoreProof) {
    if (input.quorumProof) {
      throw new Error(
        "Owner restore on a quorum-protected vault requires an owner-self-restore attestation — heir quorum proof supplied instead.",
      );
    }
    throw new Error(
      "Quorum-protected vault: either heir quorum or owner-self-restore attestation required",
    );
  }

  const oProof = input.ownerSelfRestoreProof;
  if (oProof.expiresAt <= now) {
    throw new Error("Owner-self-restore attestation has expired — request a fresh one from the restore page.");
  }

  // Manifest-bound: the attestation's manifestHash AND vaultId MUST match.
  if (oProof.manifestHash.toLowerCase() !== mfHashHex.toLowerCase()) {
    throw new Error("Owner-self-restore attestation manifestHash does not match this manifest.");
  }
  if (oProof.vaultId.toLowerCase() !== vaultIdHex.toLowerCase()) {
    throw new Error("Owner-self-restore attestation vaultId does not match this manifest.");
  }

  let oRecovered: Address;
  try {
    oRecovered = await recoverTypedDataAddress({
      domain: OWNER_SELF_RESTORE_ATT_DOMAIN,
      types: OWNER_SELF_RESTORE_ATT_TYPES,
      primaryType: "OwnerSelfRestoreAttestation",
      message: {
        vaultId: vaultIdHex,
        manifestHash: mfHashHex,
        ownerWallet: oProof.ownerWallet,
        expiresAt: BigInt(oProof.expiresAt),
        nonce: oProof.nonce,
      },
      signature: oProof.attestation,
    });
  } catch (e) {
    throw new Error(`Owner-self-restore attestation signature did not recover: ${(e as Error).message}`);
  }

  if (oRecovered.toLowerCase() !== OWNER_SELF_RESTORE_ATTESTOR_ADDR.toLowerCase()) {
    throw new Error(
      `Owner-self-restore attestation signer mismatch — recovered ${oRecovered}, expected ${OWNER_SELF_RESTORE_ATTESTOR_ADDR}.`,
    );
  }
  if (oRecovered.toLowerCase() !== oProof.signer.toLowerCase()) {
    throw new Error("Owner-self-restore attestation signer field disagrees with recovered signer.");
  }
}

/** B-2 — verify a Form-B-INDEPENDENT local heir-quorum release. Resolves iff
 *  >= M DISTINCT signatures over the shared `QuorumLocalRelease` tuple
 *  (vaultId, manifestHash, M, N, expiresAt, nonce) recover to addresses that
 *  each hold a Voting-role SBT for this vault on-chain (via the injected
 *  `isVotingHolder` reader). Throws otherwise. No Form B, no attestor key —
 *  the only external dependency is the on-chain SBT read inside the reader.
 *
 *  Fail-closed properties:
 *   - missing reader → throw (can't verify ⇒ refuse, never assume holders)
 *   - expired release → throw
 *   - fewer than M signatures supplied → throw before any RPC
 *   - unrecoverable signature → skipped (not counted)
 *   - duplicate signer (one wallet signing twice) → counted once
 *   - signer not an on-chain Voting holder → skipped
 *   - RPC error inside the reader → treated as "not a holder" (skipped)
 *  Early-returns as soon as M valid distinct holders are confirmed (so it
 *  never makes more RPC reads than necessary). */
async function assertLocalHeirQuorum(
  mf: VaultManifest,
  input: RestoreInput,
  vaultIdHex: Hex,
  mfHashHex: Hex,
  now: number,
): Promise<void> {
  const local = input.localHeirQuorum!;
  const M = mf.quorumPolicy!.M;
  const N = mf.quorumPolicy!.N;

  if (typeof input.isVotingHolder !== "function") {
    throw new Error(
      "Local heir-quorum supplied without an on-chain Voting-holder reader (isVotingHolder) — cannot verify signers; refusing.",
    );
  }
  if (local.expiresAt <= now) {
    throw new Error("Local heir-quorum release has expired — collect fresh heir signatures.");
  }
  const sigs = Array.isArray(local.signatures) ? local.signatures : [];
  if (sigs.length < M) {
    throw new Error(`Local heir-quorum needs ${M} heir signatures, got ${sigs.length}.`);
  }

  const seen = new Set<string>();
  let valid = 0;
  for (const s of sigs) {
    let recovered: Address;
    try {
      recovered = await recoverTypedDataAddress({
        domain: QUORUM_LOCAL_DOMAIN,
        types: QUORUM_LOCAL_TYPES,
        primaryType: "QuorumLocalRelease",
        message: {
          vaultId: vaultIdHex,
          manifestHash: mfHashHex,
          M,
          N,
          expiresAt: BigInt(local.expiresAt),
          nonce: local.nonce,
        },
        signature: s.signature,
      });
    } catch {
      continue; // unrecoverable signature — skip
    }
    const key = recovered.toLowerCase();
    if (seen.has(key)) continue; // one wallet = one vote
    // If the caller annotated the signer, it must agree with the recovery.
    if (s.signer && s.signer.toLowerCase() !== key) continue;
    let isHolder = false;
    try {
      isHolder = await input.isVotingHolder(vaultIdHex, recovered);
    } catch {
      isHolder = false; // fail closed on RPC error
    }
    if (!isHolder) continue; // not a Voting-role heir for this vault
    seen.add(key);
    valid++;
    if (valid >= M) return; // threshold met — done
  }
  throw new Error(
    `Local heir-quorum: only ${valid} of ${M} required signatures verified against on-chain Voting holders.`,
  );
}

/** 0.9.0 — back-compat alias. The pre-0.9.0 name was
 *  `assertQuorumOrOwnerMode`; the rename reflects the new semantics (the gate
 *  now enforces the manifest's quorumPolicy on BOTH paths, not just heir mode).
 *  Existing callers (HeirRestore.tsx, /restore route, regression tests) keep
 *  building against the old name until they migrate. */
export const assertQuorumOrOwnerMode = assertQuorumPolicyHonored;

export type RestoreOutput =
  | {
      readonly kind: "bip39";
      readonly mnemonic: string;
      readonly usedShareIndices: readonly number[];
      readonly tamperFlags: readonly number[];
      readonly matchedVaultId: string;
    }
  | {
      readonly kind: DocKind;
      readonly content: Uint8Array;
      readonly mimeType: string | undefined;
      readonly originalFilename: string | undefined;
      readonly usedShareIndices: readonly number[];
      readonly tamperFlags: readonly number[];
      readonly matchedVaultId: string;
    };

export function parseShareJson(text: string): ParsedShare {
  const obj = JSON.parse(text) as Record<string, unknown>;
  if (obj["soulchain"] !== "share/v1") throw new Error("Not a NoKLock share file");
  const cipherStr = String(obj["cipher"] ?? "");
  if (cipherStr !== "AES-256-GCM" && cipherStr !== "XChaCha20-Poly1305") {
    throw new Error(`Unknown cipher: ${cipherStr}`);
  }
  return {
    vaultId: String(obj["vaultId"] ?? ""),
    index: Number(obj["index"] ?? 0),
    cipher: cipherStr,
    iv: kdf.b64Decode(String(obj["iv"] ?? "")),
    cipherText: kdf.b64Decode(String(obj["ct"] ?? "")),
    tag: obj["tag"] ? kdf.b64Decode(String(obj["tag"])) : undefined,
    plainLen: Number(obj["plainLen"] ?? 0),
    // 0.11.0 — v3 only: per-share provenance HMAC (16 bytes). Absent on
    // v1/v2 share files → undefined → no verification at restore time.
    ...(obj["prov"] ? { provenance: kdf.b64Decode(String(obj["prov"])) } : {}),
  };
}

/** 0.6.0 — Resolve the on-disk filename to look up for a given manifest
 *  share descriptor. v3 manifests carry `maskedFilename` on each descriptor
 *  → the filename is `{maskedFilename}.json`, with the share INDEX hidden
 *  from disk. v1/v2 manifests fall back to the legacy deterministic
 *  `{vaultId}-share-{index}.json` format so existing vaults restore byte-
 *  identically. Callers that scan a directory and match by filename use
 *  this to build the expected name from the manifest. */
export function expectedShareFilename(descriptor: ShareDescriptor, vaultId: string): string {
  if (descriptor.maskedFilename) return `${descriptor.maskedFilename}.json`;
  return `${vaultId}-share-${descriptor.index}.json`;
}

export function parseManifestJson(text: string): VaultManifest {
  const m = JSON.parse(text) as VaultManifest;
  if (m.version !== 1) throw new Error("Unsupported manifest version");
  return m;
}

export async function runRestorePipeline(input: RestoreInput): Promise<RestoreOutput> {
  if (input.manifests.length === 0) throw new Error("No manifest supplied");

  const errors: string[] = [];

  for (const mf of input.manifests) {
    try {
      const result = await tryOneManifest(mf, input.shares, input.passkey, input.masterOverride, input);
      return result;
    } catch (e) {
      errors.push(`vault ${mf.vaultId.slice(0, 8)}…: ${(e as Error).message}`);
    }
  }

  // All manifests rejected the passkey.
  throw new Error(
    `Passkey didn't unlock any of the ${input.manifests.length} manifest(s) provided. Details: ${errors.join(" | ")}`
  );
}

async function tryOneManifest(
  mf: VaultManifest,
  allShares: readonly ParsedShare[],
  passkey: string,
  masterOverride: Uint8Array | undefined,
  input: RestoreInput,
): Promise<RestoreOutput> {
  // 1. Verify manifest signature.
  const okSig = await manifest.verifyManifest(mf);
  if (!okSig) throw new Error("manifest signature failed");

  // 0.9.0 — quorum-policy gate. Enforced on BOTH paths once a manifest
  // carries `quorumPolicy` (the previous heirMode-only check was a forgeable
  // boolean bypass; see 0.9.0 changelog). Heir path requires a quorum
  // attestation; owner path requires an owner-self-restore attestation.
  // No quorumPolicy → no-op (legacy grandfather). Runs BEFORE Argon2id so we
  // don't burn 250 ms of memory-hard work to fail the gate afterwards.
  await assertQuorumPolicyHonored(mf, input);

  // 0.12.0 — H4 fix: defence-in-depth re-bind. After the quorum gate
  // returns, re-derive the manifest's bytes-of-record (vaultId + manifest
  // hash) and assert they match the owner-self-restore attestation that
  // was just accepted. The gate already does this check internally; this
  // redundant call-site check ensures any future refactor / regression
  // inside `assertQuorumPolicyHonored` that drops the binding will be
  // caught here — BEFORE we touch the master password / Argon2id /
  // share-AEAD. Owner-only by construction: the heir `quorumProof`
  // shape on `RestoreInput` has no `manifestHash` or `vaultId` field
  // (the gate recovers them from the EIP-712 signature), so there's
  // nothing to re-bind at the call site for the heir path.
  if (mf.quorumPolicy && !input.heirMode && input.ownerSelfRestoreProof) {
    const oProof = input.ownerSelfRestoreProof;
    const mfHashHex = bytesToHex(manifest.manifestHash(mf));
    const vaultIdHex = (mf.vaultId.startsWith("0x") ? mf.vaultId : `0x${mf.vaultId}`) as Hex;
    const vaultIdOk = oProof.vaultId.toLowerCase() === vaultIdHex.toLowerCase();
    const manifestHashOk = oProof.manifestHash.toLowerCase() === mfHashHex.toLowerCase();
    if (!vaultIdOk || !manifestHashOk) {
      throw new RestoreError("manifest mismatch after quorum gate");
    }
  }

  // 2. Filter to shares belonging to this vault.
  const shares = allShares.filter((s) => s.vaultId === mf.vaultId);
  if (shares.length < mf.shamir.threshold) {
    throw new Error(`have ${shares.length} matching shares, need ${mf.shamir.threshold}`);
  }

  // 0.5.0 — every Uint8Array derived in this restore is registered here and
  // wiped synchronously in finally — even on throw mid-pipeline. masterOverride
  // is CALLER-owned and intentionally excluded.
  let master: Uint8Array | undefined;
  let prk: Uint8Array | null = null;
  const derivedKeys: Uint8Array[] = [];   // per-share keys (v2)
  const decrypted: { index: number; bytes: Uint8Array }[] = [];
  const tamperFlags: number[] = [];
  let combined: Uint8Array | undefined;

  try {
    // 3. Derive the master for this manifest. Passkey-unlock supplies it
    //    pre-derived (from the sidecar); otherwise it's Argon2id(password) —
    //    the canonical path a next-of-kin / threshold restore always takes.
    const masterIsOurs = !masterOverride;
    master = masterOverride ?? (await kdf.deriveMaster(passkey, mf.kdf));

    // 3b. Decide cryptoBaseline. v1 uses master as key + no AAD; v2 + v3
    //     both use HKDF (v3 = v2 derivation + filename masking, which is a
    //     storage-layer concern, not a decryption-layer concern).
    const baseline: CryptoBaseline = mf.cryptoBaseline ?? "v1";
    const useHkdf = baseline === "v2" || baseline === "v3";
    const salt = kdf.b64Decode(mf.kdf.saltB64);
    prk = useHkdf ? kdf.hkdfExtract(salt, master) : null;

    // 4. Decrypt each share. v2 binds AAD to (vaultId, shareIndex, cipher).
    //    v3 ALSO verifies the per-share provenance HMAC tag from the
    //    manifest descriptor BEFORE AEAD decrypt — a forged share with
    //    the right vaultId but a wrong (or absent) provenance is routed
    //    to tamperFlags without burning the AEAD path or revealing
    //    anything about the master password. The tamper-gate at 0.5.1
    //    then short-circuits the unlock before any plaintext leaves.
    const isV3 = baseline === "v3";
    const descByIndex = new Map<number, ShareDescriptor>();
    if (isV3) {
      for (const d of mf.shares) descByIndex.set(d.index, d);
    }
    for (const sh of shares) {
      // v3 provenance gate (G5-A) — runs BEFORE AEAD decrypt.
      if (isV3 && prk) {
        const desc = descByIndex.get(sh.index);
        const expectedB64 = desc?.provenanceB64;
        if (expectedB64) {
          let provKey: Uint8Array | undefined;
          let ok = false;
          try {
            provKey = aead.deriveShareProvenanceKeyV3(prk, sh.index);
            const expected = kdf.b64Decode(expectedB64);
            // Cross-check #1: the on-disk share file's `"prov"` field (if
            // present) must match the manifest's descriptor value — they're
            // the same MAC, written from both sides at enrol time, so any
            // mismatch is forgery / corruption.
            // 0.13.0 — MED-restore-1: length check is now folded INTO the
            // constant-time loop so the timing/branching signal is identical
            // for "same length, wrong bytes" and "different length". We
            // iterate over min(a.length, b.length), XOR-accumulate, then OR
            // a sentinel bit (0x100, outside any byte's value range so it
            // can't be cleared by a colliding XOR) when lengths differ.
            // Final compare is a single accumulator-vs-0 check. Prefers
            // crypto.subtle.timingSafeEqual when the runtime exposes it
            // (Node 21+ / some browsers); otherwise the JS XOR-accumulate
            // path is the fallback.
            if (sh.provenance) {
              const a = expected;
              const b = sh.provenance;
              let ok1 = false;
              const subtleAny = (globalThis.crypto as unknown as {
                subtle?: { timingSafeEqual?: (x: Uint8Array, y: Uint8Array) => boolean };
              }).subtle;
              if (
                typeof subtleAny?.timingSafeEqual === "function" &&
                a.length === b.length
              ) {
                ok1 = subtleAny.timingSafeEqual(a, b);
              } else {
                const minLen = a.length < b.length ? a.length : b.length;
                let diff = 0;
                for (let i = 0; i < minLen; i++) {
                  diff |= (a[i]! ^ b[i]!);
                }
                // Sentinel bit set out-of-byte-range when lengths disagree.
                // `| 0` keeps it a 32-bit int; the |= is unconditional so
                // there's no length-dependent branch in this expression.
                diff |= ((a.length ^ b.length) === 0 ? 0 : 0x100);
                ok1 = diff === 0;
              }
              // Cross-check #2: MAC over (vaultId, index, cipher) must
              // verify against the manifest's expected tag. Always run
              // both branches and AND results — no short-circuit on ok1.
              const ok2 = aead.verifyShareProvenanceV3(provKey, mf.vaultId, sh.index, sh.cipherText, expected);
              ok = ok1 && ok2;
            } else {
              // Share file lacks `"prov"` but manifest expects one →
              // verify the manifest's tag against the share ciphertext
              // directly. This handles v3 share files that were stripped
              // (legacy storage backends) yet keeps the MAC binding tight.
              ok = aead.verifyShareProvenanceV3(provKey, mf.vaultId, sh.index, sh.cipherText, expected);
            }
          } catch {
            ok = false;
          } finally {
            if (provKey) wipeBytes(provKey);
          }
          if (!ok) {
            tamperFlags.push(sh.index);
            continue; // skip AEAD — failed provenance is dispositive
          }
        }
      }

      try {
        const key = prk ? aead.deriveShareKeyV2(prk, sh.index) : master;
        if (prk) derivedKeys.push(key);  // v2 keys are ours to wipe
        const aad = prk ? aead.buildShareAADv2(mf.vaultId, sh.index, sh.cipher) : undefined;
        const bytes = await aead.decrypt({
          kind: sh.cipher,
          key,
          iv: sh.iv,
          cipherText: sh.cipherText,
          ...(sh.tag ? { tag: sh.tag } : {}),
          ...(aad ? { aad } : {}),
        });
        decrypted.push({ index: sh.index, bytes });
      } catch {
        tamperFlags.push(sh.index);
      }
    }

    // 0.7.0 [launch-blocker-3-segment-activity-logging] — fire-and-forget
    // per-share audit beacon to Form B. Emitted HERE (before the threshold
    // + tamper-gate throws) so failed unlocks still log their tamper
    // signature; the beacon is the whole point of the launch-blocker. The
    // helper swallows every error so a beacon failure can never break
    // restore. Vault scope: only emit when this manifest actually owns the
    // shares we attempted (the surrounding tryOneManifest already filtered
    // shares by vaultId; mismatched manifests in input.manifests fall
    // through this without emitting).
    try {
      const attemptTs = Math.floor(Date.now() / 1000);
      for (const idx of tamperFlags) {
        postSegmentActivity({ vaultId: mf.vaultId, shareIndex: idx, result: "tamper", attemptTs });
      }
      if (tamperFlags.length === 0 && decrypted.length >= mf.shamir.threshold) {
        // Single 'ok' summary row per clean unlock — share_index = 0 sentinel
        // (the read-summary endpoint counts by result only; the per-share
        // index is only meaningful for 'tamper' / 'aad_mismatch' rows).
        postSegmentActivity({ vaultId: mf.vaultId, shareIndex: 0, result: "ok", attemptTs });
      }
    } catch { /* belt-and-braces — helper already swallows */ }

    if (decrypted.length < mf.shamir.threshold) {
      throw new Error(
        `only ${decrypted.length} share(s) decrypted (need ${mf.shamir.threshold})`
      );
    }

    // 0.5.1 — ARCH-GAP [archgap-tamper-gate-enforcement]: gate the unlock.
    // Even if we have threshold-many good shares, ANY share that failed
    // AEAD/AAD verification is evidence of tamper / substitution. Throw
    // BEFORE Shamir combine + return so no reconstructed plaintext leaves
    // this pipeline when integrity is in doubt. Restore.tsx surfaces the
    // thrown error to the UI, naming the flagged share indices.
    if (tamperFlags.length > 0) {
      throw new Error(
        `Tamper detected on shares: ${tamperFlags.join(", ")}`
      );
    }

    // 5. Shamir combine using the first `threshold` good shares.
    const picked = decrypted.slice(0, mf.shamir.threshold);
    combined = slip39.combine(picked, mf.shamir.threshold);

    // 6. Branch on manifest kind.
    const docExt = (mf as ManifestMaybeDoc).docExt;
    if (docExt) {
      // combined = 32-byte content key. AEAD-decrypt the inline blob.
      const docAad = (baseline === "v2" || baseline === "v3") ? buildDocContentAADv2(mf.vaultId) : undefined;
      const content = await aead.decrypt({
        kind: docExt.contentCipher,
        key: combined,
        iv: kdf.b64Decode(docExt.contentIvB64),
        cipherText: kdf.b64Decode(docExt.contentCipherTextB64),
        ...(docExt.contentTagB64 ? { tag: kdf.b64Decode(docExt.contentTagB64) } : {}),
        ...(docAad ? { aad: docAad } : {}),
      });
      // master / prk / share keys / share plaintexts / combined all wiped by
      // the outer finally. content (Uint8Array) is the return — caller owns it
      // and is responsible for wiping after use (the calling UI does this).
      // masterIsOurs gates the master wipe so we don't touch the caller's buffer.
      void masterIsOurs;
      return {
        kind: docExt.kind,
        content,
        mimeType: docExt.mimeType,
        originalFilename: docExt.originalFilename,
        usedShareIndices: picked.map((p) => p.index),
        tamperFlags,
        matchedVaultId: mf.vaultId,
      };
    }

    // BIP39 path: combined is entropy. mnemonic conversion is a JS string —
    // we can't synchronously wipe strings (no browser API exists).
    // combined entropy bytes wiped by outer finally.
    const mnemonic = bip39.entropyToWords(combined);
    if (!bip39.isValidBip39(mnemonic)) {
      throw new Error("reconstructed entropy is not a valid BIP39 mnemonic");
    }
    void masterIsOurs;
    return {
      kind: "bip39",
      mnemonic,
      usedShareIndices: picked.map((p) => p.index),
      tamperFlags,
      matchedVaultId: mf.vaultId,
    };
  } finally {
    // 0.5.0 — synchronous wipe of every Uint8Array we derived. Order
    // doesn't matter (each is independent). masterOverride is excluded
    // (it's a borrowed reference from the caller).
    if (master && !masterOverride) wipeBytes(master);
    if (prk) wipeBytes(prk);
    for (const k of derivedKeys) wipeBytes(k);
    for (const d of decrypted) wipeBytes(d.bytes);
    if (combined) wipeBytes(combined);
  }
}
