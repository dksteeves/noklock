// @version 0.6.0 @date 2026-06-01
// 0.6.0 — Daniel 2026-06-01: G5-A per-share provenance HMAC [noklock-deferred-backlog-execution-plan §G5-A].
//         Extended the existing v3 cryptoBaseline (which already adds randomised
//         filename masks) with per-share provenance HMACs bound to (vaultId,
//         shareIndex, ciphertext). Added OPTIONAL `provenanceB64?: string`
//         to `ShareDescriptor` — 16-byte HMAC-SHA256 truncated tag derived
//         via HKDF-Expand sub-key, base64-encoded. Absent on v1/v2 manifests
//         → canonicalJson omits it → manifestHash byte-identical (legacy
//         grandfather path preserved). Present on v3 → restore verifies the
//         HMAC BEFORE AEAD-decrypt and routes failures to tamperFlags so a
//         forged share file with the right vaultId + plausible index is
//         rejected without burning the AEAD decrypt or prompting for the
//         master password.
// 0.5.0 — Daniel 2026-06-01: M-of-N Stage 1 step 1 [mofn-restore-quorum-fix-plan §D.7].
//         Added optional `quorumPolicy?: QuorumPolicy` to `VaultManifest` to
//         carry the heir-cooperation quorum spec (M of N, schemeId
//         "claims-quorum-v1"). The field is OPTIONAL: absent on every existing
//         vault → canonicalJson omits it → manifestHash is byte-identical to
//         pre-quorum manifests (grandfather path — existing on-chain NoK
//         bindings remain valid, no contract redeploy). NEW Premium vaults
//         emit `quorumPolicy` and the heir-restore path enforces it; OWNER
//         restore on `/restore` stays unchanged (heirMode discriminator,
//         see plan §F). Orthogonal to `version` (schema) and `cryptoBaseline`
//         (per-share derivation).
// 0.4.0 — Daniel 2026-06-01: LAUNCH-BLOCKER 2 [launch-blocker-2-randomised-naming-mask].
//         Added "v3" to CryptoBaseline and optional `maskedFilename?: string`
//         to ShareDescriptor. v3 vaults derive a per-share filename mask via
//         HMAC-SHA256(prk, "filename-mask:" || vaultId || u32be(shareIndex))
//         truncated to 12 bytes and rendered as a 20-char lowercase base32
//         string — hiding the share index from the on-disk filename. The
//         mask is recorded in the manifest's share descriptor as
//         `maskedFilename` so restore can look up shares by it. v1/v2
//         manifests omit the field entirely → canonicalJson omits it →
//         manifestHash unchanged (byte-identical to today).
// 0.3.0 — Tier 1A/C: added OPTIONAL `cryptoBaseline?: "v1" | "v2"` field to
//         `VaultManifest`. Absent (or "v1") = legacy derivation (raw
//         Argon2id output used as both Shamir master, per-share AEAD key,
//         AND Ed25519 private key — cross-protocol key reuse). "v2" =
//         HKDF-derived per-share AEAD keys + manifest-bound AAD +
//         HKDF-derived Ed25519 seed — see kdf.ts V2_INFO. Existing v1
//         manifests stay byte-identical (no new field → canonicalJson
//         omits it → manifestHash unchanged → on-chain NoK bindings
//         intact). NEW vaults emit "v2" by default. This field is
//         ORTHOGONAL to the manifest `version` field (which is still
//         reserved for multi-seed schema evolution).
// 0.2.0 — Multi-seed-per-vault foundation. Adds OPTIONAL `secrets` field
//         carrying multiple labelled secrets sharing the SAME Shamir
//         share-set. Version stays 1 for backward compatibility.
// 0.1.0 — initial single-secret schema.

/** Manifest versions in use. v1 = single-secret (legacy + Free / Standard /
 *  Lifetime tier). v2 = multi-seed (Premium / Lifetime-Premium tier only;
 *  multiple labelled secrets share the same SLIP-39 share-set). NOTE: this
 *  is the SCHEMA version, distinct from `cryptoBaseline` (the per-share
 *  derivation algorithm — see `CryptoBaseline`). */
export const MANIFEST_VERSION = 1 as const;
export const MANIFEST_VERSION_V2 = 2 as const;
export type ManifestVersion = typeof MANIFEST_VERSION | typeof MANIFEST_VERSION_V2;

/** Cryptographic baseline used to derive per-share AEAD keys + manifest-
 *  signing seed. Orthogonal to manifest schema version.
 *  - "v1" / absent → raw Argon2id output is the master, the per-share key,
 *    AND the Ed25519 seed (cross-protocol key reuse — kept for backward
 *    compatibility on existing vaults).
 *  - "v2" → HKDF-Extract(Argon2id) → PRK; per-share keys + signing seed
 *    HKDF-Expanded from PRK with domain-separated `info` strings; per-share
 *    AEAD bound to (vaultId, shareIndex, cipherKind) via AAD to defeat
 *    cross-vault share replay. See `kdf.ts V2_INFO`.
 *  - "v3" → everything v2 does PLUS (a) a randomised per-share filename mask
 *    (HMAC-SHA256(prk, "filename-mask:" || vaultId || u32be(shareIndex)),
 *    truncated to 12 bytes, rendered base32 = 20-char `[a-z2-7]` string),
 *    AND (b) a per-share provenance HMAC bound to (vaultId, shareIndex,
 *    ciphertext), 16-byte truncated HMAC-SHA256 under an HKDF-derived
 *    sub-key, recorded in the manifest's share descriptor as
 *    `provenanceB64`. Restore verifies the HMAC BEFORE AEAD-decrypt so a
 *    forged share with the right vaultId + plausible index is rejected
 *    without burning the AEAD decrypt or prompting for the master password.
 *    v3 is Premium-tier opt-in; v1/v2 vaults grandfather. */
export type CryptoBaseline = "v1" | "v2" | "v3";

/** Allowed AEAD ciphers. Randomly chosen per share for diversity. */
export type CipherKind = "AES-256-GCM" | "XChaCha20-Poly1305";

/** SLIP-39 threshold spec, e.g. {threshold:3, total:5}. */
export interface ShamirSpec {
  readonly threshold: number;
  readonly total: number;
}

/** M-of-N heir-cooperation quorum spec for heir-initiated restore. Distinct
 *  from `ShamirSpec` (T-of-N share-availability). Absent on legacy / Free /
 *  pre-2026-06 manifests → restore path is byte-identical to today
 *  (grandfather). Present on new Premium vaults → heir-restore path enforces
 *  the gate via an EIP-712 `QuorumReleaseAttestation` from the Form B
 *  attestor (Stage 1) and, in Stage 2, an on-chain `releaseVotes >= M` read
 *  from `NoKLockQuorum.sol`. `schemeId` is reserved for future scheme
 *  evolution (e.g. "claims-quorum-v2" for on-chain-only enforcement). */
export type QuorumPolicy = {
  readonly M: number;
  readonly N: number;
  readonly schemeId: "claims-quorum-v1";
};

/** Argon2id parameter set used to derive the master secret. */
export interface KdfParams {
  readonly algo: "argon2id";
  readonly memKiB: number;
  readonly timeCost: number;
  readonly parallelism: number;
  readonly saltB64: string;
  readonly outBytes: number;
}

/** Per-share metadata recorded in the manifest. */
export interface ShareDescriptor {
  readonly index: number;
  readonly cipher: CipherKind;
  readonly ivB64: string;
  readonly cipherTextB64: string;
  readonly tagB64?: string; // present for AES-GCM; XChaCha20-Poly1305 tag is inline
  readonly compressedLen: number;
  readonly originalLen: number;
  readonly storageHint?: string; // e.g. "dropbox", "gdrive", "onedrive", "ipfs", "arweave"
  /** v3 only — 20-char lowercase base32 filename mask. Restore-side share
   *  lookup keys off this when present (falls back to deterministic
   *  `share-{idx}-…` naming for v1/v2 vaults). Omitted on v1/v2 manifests
   *  so canonicalJson is byte-identical to today (manifestHash unchanged). */
  readonly maskedFilename?: string;
  /** v3 only — base64-encoded 16-byte truncated HMAC-SHA256 binding the share
   *  ciphertext to (vaultId, shareIndex) under an HKDF-derived provenance
   *  sub-key. Restore verifies this BEFORE AEAD-decrypt — a forged share
   *  with the right vaultId + plausible index is rejected without burning
   *  the AEAD decrypt or prompting for the master password. Omitted on
   *  v1/v2 manifests → canonicalJson byte-identical to today (manifestHash
   *  unchanged → on-chain NoK bindings preserved). */
  readonly provenanceB64?: string;
}

/** A labelled secret in a v2 multi-seed vault. The Shamir share-set in
 *  `shares` is shared across all secrets — recombining the threshold yields
 *  the MASTER key, which then decrypts each individual `cipherTextB64`
 *  to recover that specific secret. (One vault, many seed phrases.) */
export interface SecretEntry {
  readonly label: string;             // e.g. "BTC main", "ETH cold", "letter to family"
  readonly cipher: CipherKind;
  readonly ivB64: string;
  readonly cipherTextB64: string;
  readonly tagB64?: string;
  readonly originalLen: number;
}

/** A complete manifest written once per vault, copied to every storage backend. */
export interface VaultManifest {
  /** SCHEMA version. v1 = single-secret (legacy + Free/Std/Lifetime).
   *  v2 = multi-seed (Premium / Lifetime-Premium). Distinct from
   *  `cryptoBaseline` (the derivation algorithm). */
  readonly version: ManifestVersion;
  readonly vaultId: string;       // 16-byte hex
  readonly createdAt: number;     // unix seconds
  readonly shamir: ShamirSpec;
  readonly kdf: KdfParams;
  readonly shares: readonly ShareDescriptor[];
  /** v2 schema only: array of labelled secrets all encrypted under the
   *  same master key. Omitted entirely on v1-schema manifests. */
  readonly secrets?: readonly SecretEntry[];
  /** Per-share key + manifest-signing-seed derivation algorithm. Absent
   *  on legacy manifests (= "v1" — raw Argon2id output reused everywhere).
   *  Set to "v2" on new manifests to enable HKDF-derived per-share keys +
   *  vault-bound AAD + HKDF-derived Ed25519 seed. Absent ↔ omitted from
   *  canonicalJson (preserving byte-identical legacy manifestHash). */
  readonly cryptoBaseline?: CryptoBaseline;
  /** M-of-N heir-cooperation quorum policy for heir-initiated restore.
   *  Absent on legacy / Free / pre-2026-06 manifests — when absent, the
   *  canonical-JSON is byte-identical to pre-quorum manifests (grandfather
   *  path: existing on-chain NoK bindings via vaultId+manifestHash remain
   *  valid, no contract redeploy needed). Present on new Premium vaults to
   *  enable heir-quorum enforcement on `/heir/restore`. */
  readonly quorumPolicy?: QuorumPolicy;
  readonly signatureB64: string;  // Ed25519 sig over canonical-JSON(manifest minus signatureB64)
  readonly signerPubB64: string;  // Ed25519 public key
}

/** Result of a successful reconstruction. v1 fills `secret`; v2 fills
 *  `secrets` (array of {label, secret}). Both fields are present in the
 *  type so callers can branch on `manifest.version`. */
export interface ReconstructResult {
  readonly secret: Uint8Array;
  readonly secrets?: readonly { readonly label: string; readonly secret: Uint8Array }[];
  readonly verifiedShares: readonly number[]; // indices used
  readonly tamperFlags: readonly number[];    // indices that failed AEAD
}
