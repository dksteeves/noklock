// @version 0.4.1 @date 2026-06-03
// 0.4.1 — MED-crypto-1: Argon2id OWASP minimum enforcement. deriveMaster() now
//         rejects memKiB < 19 and timeCost < 1 (OWASP 2025 minimum baseline).
//         Defends against accidental/malicious downgrade of KDF params at the
//         call site; the ARGON2ID_DEFAULTS constants stay at the much-stronger
//         64 MiB / t=3 / p=4 production values.
// 0.4.0 — Daniel 2026-06-01: LAUNCH-BLOCKER 2 [launch-blocker-2-randomised-naming-mask].
//         New v3 helpers: `u32BE` (big-endian uint32), `base32LowerNoPad`
//         (RFC 4648 lowercase, no padding), and `deriveFilenameMaskV3(prk,
//         vaultId, shareIndex)` which builds the 20-char filename mask via
//         HMAC-SHA256(prk, "filename-mask:" || vaultId || u32be(idx)) →
//         take first 12 bytes → base32 lowercase 20-char string. The
//         FILENAME_MASK_PREFIX constant is V2_DOMAIN-tagged so it shares
//         the existing key-domain space (the PRK is the same one used for
//         share keys / sign seed); v3 only adds a new label inside it.
// 0.3.1 — F-6 refactor (audit finding f-6-doc-content-aad-centralise):
//         centralise V2_DOC_CONTENT_AAD_PREFIX here next to the other V2_*
//         constants (V2_DOMAIN / V2_INFO / V2_AAD_PREFIX) so a future v3
//         baseline migration can't miss it. Previously hardcoded inline in
//         buildDocContentAADv2() in apps/web/src/lib/doc-pipeline.ts.
// 0.3.0 — Tier 1A: HKDF-Extract/Expand helpers + domain-separation INFO
//         constants for the v2 cryptographic baseline. Argon2id is the
//         password-derivation root (unchanged); HKDF then splits that root
//         into purpose-specific subkeys: a per-share AEAD key per share, an
//         Ed25519 manifest-signing seed, and a per-secret subkey for the
//         multi-secret v2 manifests. Eliminates the v1 cross-protocol key-
//         reuse smell where the raw Argon2id output was simultaneously the
//         Shamir master, the AEAD key, AND the Ed25519 private key. Uses
//         only standard primitives (HKDF-SHA-256, RFC 5869) — composition
//         is novel, primitives are not. See @noble/hashes/hkdf.
// 0.2.0 — Argon2id via @noble/hashes (pure JS, no WASM, OWASP-2025 defaults).
//         Returns a deterministic byte sequence derived from a user-supplied
//         passphrase + salt. Used to produce the master secret that's fed
//         into SLIP-39 share generation.
//
// Synchronous (no `await` needed) but takes ~250ms at m=64MiB — show a
// spinner.

import { argon2id } from "@noble/hashes/argon2";
import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import type { KdfParams } from "./types.js";

export const ARGON2ID_DEFAULTS: Omit<KdfParams, "saltB64"> = {
  algo: "argon2id",
  memKiB: 65_536,    // 64 MiB
  timeCost: 3,
  parallelism: 4,
  outBytes: 32,
};

export function generateSalt(): Uint8Array {
  // 32-byte salt, generated with the platform's CSPRNG.
  return crypto.getRandomValues(new Uint8Array(32));
}

export async function deriveMaster(passphrase: string, params: KdfParams): Promise<Uint8Array> {
  const salt = b64Decode(params.saltB64);
  if (salt.length < 16) throw new Error("kdf: salt must be ≥ 16 bytes");
  if (params.memKiB < 19) throw new Error("kdf: memKiB must be >= 19 (OWASP minimum)");
  if (params.timeCost < 1) throw new Error("kdf: timeCost must be >= 1");

  // @noble/hashes/argon2 is synchronous. We wrap in a promise to keep the
  // call-site `await`-friendly and to give the browser a microtask gap to
  // paint a spinner before the CPU-heavy work starts.
  await Promise.resolve();

  return argon2id(passphrase, salt, {
    t: params.timeCost,
    m: params.memKiB,
    p: params.parallelism,
    dkLen: params.outBytes,
  });
}

export function b64Encode(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s);
}

export function b64Decode(s: string): Uint8Array {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(s, "base64"));
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ── v2 HKDF derivation chain (Tier 1A) ─────────────────────────────────────
// All v2 vaults pass the Argon2id output through HKDF-Extract once to produce
// a pseudo-random key (PRK), then HKDF-Expand the PRK with purpose-specific
// `info` byte strings to derive everything else. Bytes-deterministic; identical
// passphrase + salt + manifest will reproduce identical subkeys forever.
//
// CRYPTO BASELINE TAG — bumping this string is a HARD-FORK of the derivation;
// only do it when migrating to v3.
export const V2_DOMAIN = "noklock-v2";

/** HKDF `info` byte-strings. Stable forever for cryptoBaseline === "v2". */
export const V2_INFO = {
  /** Per-share AEAD key. Concatenated with u16BE(shareIndex) at call time. */
  shareKeyPrefix: new TextEncoder().encode(V2_DOMAIN + "/share-key/"),
  /** Ed25519 manifest-signing seed (32 bytes). */
  signSeed:        new TextEncoder().encode(V2_DOMAIN + "/sign-ed25519-seed"),
  /** Per-secret AEAD key for multi-secret v2 manifests. Concatenated with
   *  utf8(label) at call time. (Forward-looking — multi-secret restore not
   *  yet wired but the derivation surface is committed today.) */
  secretKeyPrefix: new TextEncoder().encode(V2_DOMAIN + "/secret-key/"),
} as const;

/** Per-share AAD prefix. The full AAD for share `i` of vault V with cipher C is
 *  `aadPrefix || vaultIdBytes(16) || u16BE(i) || cipherIdByte(C)`. Built by
 *  buildShareAADv2() in aead.ts. */
export const V2_AAD_PREFIX = new TextEncoder().encode(V2_DOMAIN + "/share-aad");

/** Per-vault doc-content AAD prefix. The full AAD for a docExt content blob of
 *  vault V is `docContentAadPrefix || vaultIdBytes(16)`. Different domain tag
 *  from V2_AAD_PREFIX so a doc content blob can't be replayed as a share or
 *  vice versa. Built by buildDocContentAADv2() in apps/web/src/lib/doc-pipeline.ts.
 *  Centralised here (F-6) so a v3 migration touches one file. */
export const V2_DOC_CONTENT_AAD_PREFIX = new TextEncoder().encode(V2_DOMAIN + "/doc-content-aad");

/** HKDF-Extract(salt, IKM) → PRK. Standard RFC 5869 construction:
 *  Extract is HMAC(key=salt, msg=IKM). We re-use the Argon2id salt as the
 *  HKDF salt — it's already random + per-vault, and per RFC 5869 the salt
 *  is not a secret. Returns a 32-byte PRK (SHA-256-based). */
export function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Uint8Array {
  return hmac(sha256, salt, ikm);
}

/** HKDF-Expand(PRK, info, L) → L-byte output. Standard RFC 5869 construction.
 *  Implemented manually (rather than via @noble/hashes/hkdf) so we can REUSE
 *  a single PRK across multiple Expand calls with different `info` strings —
 *  the @noble hkdf() helper bundles Extract+Expand and would redundantly
 *  re-Extract on each subkey derivation. */
export function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  const hashLen = 32; // SHA-256
  const N = Math.ceil(length / hashLen);
  if (N > 255) throw new Error("kdf: hkdf-expand requested too many bytes");
  const out = new Uint8Array(length);
  let prev: Uint8Array = new Uint8Array(0);
  let offset = 0;
  for (let i = 1; i <= N; i++) {
    const data = new Uint8Array(prev.length + info.length + 1);
    data.set(prev, 0);
    data.set(info, prev.length);
    data[prev.length + info.length] = i;
    prev = hmac(sha256, prk, data);
    const take = Math.min(prev.length, length - offset);
    out.set(prev.subarray(0, take), offset);
    offset += take;
  }
  return out;
}

/** Convenience: HKDF-Extract+Expand in one call. Used when the caller has
 *  the IKM (not yet a PRK) and wants the final L-byte output directly. */
export function hkdfExtractExpand(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number,
): Uint8Array {
  return hkdfExpand(hkdfExtract(salt, ikm), info, length);
}

/** Big-endian u16 → 2 bytes. Used to build deterministic `info` suffixes for
 *  per-share / per-index HKDF expansions. */
export function u16BE(n: number): Uint8Array {
  if (!Number.isInteger(n) || n < 0 || n > 0xffff) {
    throw new Error(`kdf: u16BE out of range: ${n}`);
  }
  const out = new Uint8Array(2);
  out[0] = (n >>> 8) & 0xff;
  out[1] = n & 0xff;
  return out;
}

/** Big-endian u32 → 4 bytes. Used by v3 filename-mask derivation. */
export function u32BE(n: number): Uint8Array {
  if (!Number.isInteger(n) || n < 0 || n > 0xffff_ffff) {
    throw new Error(`kdf: u32BE out of range: ${n}`);
  }
  const out = new Uint8Array(4);
  out[0] = (n >>> 24) & 0xff;
  out[1] = (n >>> 16) & 0xff;
  out[2] = (n >>> 8) & 0xff;
  out[3] = n & 0xff;
  return out;
}

/** RFC 4648 base32 alphabet, LOWERCASE, no padding. 32 symbols = a-z2-7. */
const BASE32_ALPHA = "abcdefghijklmnopqrstuvwxyz234567";

/** Encode a byte array as RFC 4648 base32, LOWERCASE, no padding. 12 bytes →
 *  20 chars (12*8 = 96 bits = 19.2 → 20 symbols). Used by the v3 filename-
 *  mask construction; the output is filesystem-safe + caseless + URL-safe. */
export function base32LowerNoPad(bytes: Uint8Array): string {
  let out = "";
  let buf = 0;
  let bits = 0;
  for (let i = 0; i < bytes.length; i++) {
    buf = (buf << 8) | bytes[i]!;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += BASE32_ALPHA[(buf >>> bits) & 0x1f];
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHA[(buf << (5 - bits)) & 0x1f];
  }
  return out;
}

/** v3 filename-mask domain tag. Prefix lives inside the existing V2_DOMAIN
 *  key-space so the same PRK can drive both v2 keys and v3 filename masks
 *  without a new HKDF tree. The full HMAC message is
 *  `FILENAME_MASK_PREFIX || vaultIdBytes(16) || u32BE(shareIndex)`. */
export const V3_FILENAME_MASK_PREFIX = new TextEncoder().encode(
  V2_DOMAIN + "/filename-mask:"
);

/** v3 — derive the 20-char base32 filename mask for one share.
 *  HMAC-SHA256(prk, FILENAME_MASK_PREFIX || vaultIdBytes(16) || u32BE(idx))
 *  → take first 12 bytes → base32 lowercase 20-char string. Deterministic
 *  per (prk, vaultId, shareIndex). PRK is the v2/v3 HKDF root. */
export function deriveFilenameMaskV3(
  prk: Uint8Array,
  vaultId: string,
  shareIndex: number,
): string {
  if (prk.length !== 32) throw new Error("kdf: prk must be 32 bytes for v3 filename mask");
  const vBytes = vaultIdToBytes(vaultId);
  const idxBytes = u32BE(shareIndex);
  const msg = new Uint8Array(V3_FILENAME_MASK_PREFIX.length + vBytes.length + idxBytes.length);
  msg.set(V3_FILENAME_MASK_PREFIX, 0);
  msg.set(vBytes, V3_FILENAME_MASK_PREFIX.length);
  msg.set(idxBytes, V3_FILENAME_MASK_PREFIX.length + vBytes.length);
  const mac = hmac(sha256, prk, msg);
  return base32LowerNoPad(mac.subarray(0, 12));
}

/** Convert a hex vaultId string (16 bytes = 32 hex chars) to bytes. Used by
 *  buildShareAADv2() in aead.ts. */
export function vaultIdToBytes(vaultId: string): Uint8Array {
  const clean = vaultId.replace(/^0x/, "");
  if (clean.length !== 32 || !/^[0-9a-f]+$/i.test(clean)) {
    throw new Error(`kdf: vaultId must be 16-byte hex (got ${clean.length} chars)`);
  }
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

