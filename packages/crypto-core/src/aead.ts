// @version 0.4.0 @date 2026-06-01
// 0.4.0 — Daniel 2026-06-01: G5-A per-share provenance HMAC [noklock-deferred-backlog-execution-plan §G5-A].
//         Added `deriveShareProvenanceKeyV3(prk, shareIndex)` (HKDF-Expand info
//         = `V2_DOMAIN + "/share-provenance-v3:" || u16BE(shareIndex)`),
//         `signShareProvenanceV3(provKey, vaultId, shareIndex, cipherText)`
//         (HMAC-SHA256 over `V3_PROVENANCE_AAD_PREFIX || vaultIdBytes(16) ||
//         u32BE(shareIndex) || cipherText`, truncated to 16 bytes), and
//         `verifyShareProvenanceV3(provKey, vaultId, shareIndex, cipherText,
//         tag16)` (constant-time compare). Designed to ride the existing v3
//         baseline alongside the filename-mask helper: same PRK, separate
//         info string for domain separation, separate AAD-prefix domain so
//         a provenance tag can never collide with the share-AEAD AAD.
// 0.3.0 — Tier 1C: + `deriveShareKeyV2(prk, shareIndex)` and
//         `buildShareAADv2(vaultId, shareIndex, cipher)`. Used by the v2
//         crypto baseline to (a) replace the raw-share-bytes-as-AEAD-key
//         pattern with an HKDF-Expanded per-share key, and (b) bind each
//         share's AEAD to its specific (vault, share-index, cipher) via
//         the Associated Data input — a share lifted from vault A
//         can no longer decrypt as the same share in vault B's forged
//         manifest. Backward compat: existing v1 vaults bypass these
//         helpers via the legacy code path (mf.cryptoBaseline absent/"v1").
// 0.2.0 — Per-share random AEAD selection (AES-256-GCM ⇄ XChaCha20-Poly1305).
//         Both are audited; randomised selection diversifies cipher set.

import { gcm } from "@noble/ciphers/aes";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import type { CipherKind } from "./types.js";
import { b64Encode, b64Decode, hkdfExpand, u16BE, u32BE, vaultIdToBytes, V2_INFO, V2_AAD_PREFIX, V2_DOMAIN } from "./kdf.js";

export interface EncryptOptions {
  readonly kind: CipherKind;
  readonly key: Uint8Array;
  readonly plaintext: Uint8Array;
  readonly aad?: Uint8Array;
}

export interface EncryptResult {
  readonly kind: CipherKind;
  readonly iv: Uint8Array;
  readonly cipherText: Uint8Array; // tag is included inline for XChaCha20; separate for AES-GCM
  readonly tag?: Uint8Array;       // present for AES-256-GCM only
}

export interface DecryptOptions {
  readonly kind: CipherKind;
  readonly key: Uint8Array;
  readonly iv: Uint8Array;
  readonly cipherText: Uint8Array;
  readonly tag?: Uint8Array; // for AES-256-GCM
  readonly aad?: Uint8Array;
}

const XCHACHA20_NONCE_BYTES = 24;
const AES_GCM_IV_BYTES = 12;
const AES_GCM_TAG_BYTES = 16;

/** Choose a cipher kind deterministically from a seed byte (modulo). Used so
 *  the same master secret always produces the same cipher assignment per share. */
export function pickCipher(seed: Uint8Array, shareIndex: number): CipherKind {
  // Hash (seed || shareIndex) to get a stable byte; even → AES-GCM, odd → XChaCha20.
  const indexBytes = new Uint8Array(2);
  indexBytes[0] = (shareIndex >> 8) & 0xff;
  indexBytes[1] = shareIndex & 0xff;
  const combined = new Uint8Array(seed.length + 2);
  combined.set(seed, 0);
  combined.set(indexBytes, seed.length);
  const h = sha256(combined);
  return (h[0]! & 1) === 0 ? "AES-256-GCM" : "XChaCha20-Poly1305";
}

// ── v2 baseline helpers (Tier 1C) ───────────────────────────────────────────
// These compose with the existing encrypt/decrypt functions (which already
// accept an AAD); they don't replace them. The v2 baseline simply means:
//   * key = deriveShareKeyV2(prk, shareIndex)          ← was: raw share bytes
//   * aad = buildShareAADv2(vaultId, shareIndex, cipher) ← was: undefined

const CIPHER_ID_BYTE: Record<CipherKind, number> = {
  "AES-256-GCM":      0x01,
  "XChaCha20-Poly1305": 0x02,
};

/** Derive a 32-byte AEAD key for share `index` from the v2 PRK. Uses the
 *  byte-string `V2_INFO.shareKeyPrefix` || u16BE(index) as the HKDF info so
 *  every share gets a domain-separated, distinct key — eliminates the v1
 *  "share bytes ARE the AEAD key" cross-protocol smell. */
export function deriveShareKeyV2(prk: Uint8Array, shareIndex: number): Uint8Array {
  const info = new Uint8Array(V2_INFO.shareKeyPrefix.length + 2);
  info.set(V2_INFO.shareKeyPrefix, 0);
  info.set(u16BE(shareIndex), V2_INFO.shareKeyPrefix.length);
  return hkdfExpand(prk, info, 32);
}

/** Build the AAD bytes that bind a v2 share's AEAD ciphertext to its specific
 *  (vault, share-index, cipher-kind). Defeats cross-vault share replay: a
 *  share ciphertext lifted from vault A can no longer decrypt as share i of
 *  vault B's forged manifest, because the AAD bytes won't match. */
export function buildShareAADv2(vaultId: string, shareIndex: number, cipher: CipherKind): Uint8Array {
  const vBytes = vaultIdToBytes(vaultId);
  const idx = u16BE(shareIndex);
  const cid = CIPHER_ID_BYTE[cipher];
  if (cid === undefined) throw new Error(`aead: unknown cipher kind ${cipher}`);
  const out = new Uint8Array(V2_AAD_PREFIX.length + vBytes.length + idx.length + 1);
  let off = 0;
  out.set(V2_AAD_PREFIX, off); off += V2_AAD_PREFIX.length;
  out.set(vBytes, off);        off += vBytes.length;
  out.set(idx, off);           off += idx.length;
  out[off] = cid;
  return out;
}

// ── v3 baseline helpers (G5-A — per-share provenance HMAC) ──────────────────
// v3 inherits the v2 derivation chain and ADDS a per-share provenance tag
// bound to (vaultId, shareIndex, ciphertext). Restore verifies this tag
// BEFORE attempting AEAD-decrypt so a forged share file with the right
// vaultId + plausible index is rejected without:
//   (a) burning the Argon2id master-password derivation, AND
//   (b) probing the share's AEAD ciphertext (defence-in-depth).
// Same PRK as v2 key derivation; distinct HKDF `info` for domain separation.

/** HKDF `info` byte-string prefix for the v3 per-share PROVENANCE sub-key.
 *  Distinct from `V2_INFO.shareKeyPrefix` so the share-AEAD key and the
 *  provenance HMAC key are independently derived. Concatenated with
 *  u16BE(shareIndex) at call time. */
export const V3_PROVENANCE_INFO_PREFIX = new TextEncoder().encode(
  V2_DOMAIN + "/share-provenance-v3:"
);

/** HMAC-message AAD-prefix for the v3 per-share provenance tag. DIFFERENT
 *  domain tag than `V2_AAD_PREFIX` (the AEAD AAD prefix) so a provenance
 *  tag can never be replayed as an AEAD AAD or vice versa. The full HMAC
 *  message is `V3_PROVENANCE_AAD_PREFIX || vaultIdBytes(16) ||
 *  u32BE(shareIndex) || cipherText`. */
export const V3_PROVENANCE_AAD_PREFIX = new TextEncoder().encode(
  V2_DOMAIN + "/share-provenance-v3-aad"
);

/** Length (bytes) of the truncated provenance HMAC tag. 128 bits is the same
 *  security strength as AES-GCM's authentication tag and well above the
 *  collision bound for a deterministic per-(vaultId,shareIndex,ciphertext)
 *  tag where an attacker has at most a few candidate forgeries per second. */
export const V3_PROVENANCE_TAG_BYTES = 16;

/** v3 — derive the 32-byte HMAC-SHA256 sub-key for share `index` provenance.
 *  HKDF-Expand(prk, info = V3_PROVENANCE_INFO_PREFIX || u16BE(index), 32).
 *  Domain-separated from the v2 share-AEAD key (different info prefix). */
export function deriveShareProvenanceKeyV3(prk: Uint8Array, shareIndex: number): Uint8Array {
  if (prk.length !== 32) throw new Error("aead: prk must be 32 bytes for v3 provenance key");
  const info = new Uint8Array(V3_PROVENANCE_INFO_PREFIX.length + 2);
  info.set(V3_PROVENANCE_INFO_PREFIX, 0);
  info.set(u16BE(shareIndex), V3_PROVENANCE_INFO_PREFIX.length);
  return hkdfExpand(prk, info, 32);
}

/** v3 — sign the per-share provenance tag. Returns the 16-byte truncated
 *  HMAC-SHA256 over `V3_PROVENANCE_AAD_PREFIX || vaultIdBytes(16) ||
 *  u32BE(shareIndex) || cipherText`. Deterministic for fixed inputs. */
export function signShareProvenanceV3(
  provKey: Uint8Array,
  vaultId: string,
  shareIndex: number,
  cipherText: Uint8Array,
): Uint8Array {
  if (provKey.length !== 32) throw new Error("aead: provKey must be 32 bytes for v3 provenance");
  const vBytes = vaultIdToBytes(vaultId);
  const idxBytes = u32BE(shareIndex);
  const msg = new Uint8Array(
    V3_PROVENANCE_AAD_PREFIX.length + vBytes.length + idxBytes.length + cipherText.length,
  );
  let off = 0;
  msg.set(V3_PROVENANCE_AAD_PREFIX, off); off += V3_PROVENANCE_AAD_PREFIX.length;
  msg.set(vBytes, off);                   off += vBytes.length;
  msg.set(idxBytes, off);                 off += idxBytes.length;
  msg.set(cipherText, off);
  const mac = hmac(sha256, provKey, msg);
  return mac.subarray(0, V3_PROVENANCE_TAG_BYTES);
}

/** v3 — verify a per-share provenance tag in constant time. Returns true iff
 *  the supplied tag matches the freshly-computed HMAC over the same inputs.
 *  Constant-time comparison defends against tag-distinguishing oracles. */
export function verifyShareProvenanceV3(
  provKey: Uint8Array,
  vaultId: string,
  shareIndex: number,
  cipherText: Uint8Array,
  tag: Uint8Array,
): boolean {
  if (tag.length !== V3_PROVENANCE_TAG_BYTES) return false;
  const expected = signShareProvenanceV3(provKey, vaultId, shareIndex, cipherText);
  // Constant-time compare — XOR-then-OR, never short-circuits on first diff.
  let diff = 0;
  for (let i = 0; i < V3_PROVENANCE_TAG_BYTES; i++) {
    diff |= (expected[i]! ^ tag[i]!);
  }
  return diff === 0;
}

export async function encrypt(opts: EncryptOptions): Promise<EncryptResult> {
  if (opts.key.length !== 32) throw new Error("aead: key must be 32 bytes");

  if (opts.kind === "AES-256-GCM") {
    const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));
    const aead = gcm(opts.key, iv, opts.aad);
    const combined = aead.encrypt(opts.plaintext);
    // @noble/ciphers GCM returns ciphertext || tag concatenated. Split them.
    const cipherText = combined.slice(0, combined.length - AES_GCM_TAG_BYTES);
    const tag = combined.slice(combined.length - AES_GCM_TAG_BYTES);
    return { kind: opts.kind, iv, cipherText, tag };
  }

  // XChaCha20-Poly1305 — tag is inline in the ciphertext output.
  const iv = crypto.getRandomValues(new Uint8Array(XCHACHA20_NONCE_BYTES));
  const aead = xchacha20poly1305(opts.key, iv, opts.aad);
  const cipherText = aead.encrypt(opts.plaintext);
  return { kind: opts.kind, iv, cipherText };
}

export async function decrypt(opts: DecryptOptions): Promise<Uint8Array> {
  if (opts.key.length !== 32) throw new Error("aead: key must be 32 bytes");

  if (opts.kind === "AES-256-GCM") {
    if (!opts.tag) throw new Error("aead: AES-256-GCM requires tag");
    const combined = new Uint8Array(opts.cipherText.length + opts.tag.length);
    combined.set(opts.cipherText, 0);
    combined.set(opts.tag, opts.cipherText.length);
    const aead = gcm(opts.key, opts.iv, opts.aad);
    return aead.decrypt(combined);
  }

  const aead = xchacha20poly1305(opts.key, opts.iv, opts.aad);
  return aead.decrypt(opts.cipherText);
}

export { b64Encode, b64Decode };
