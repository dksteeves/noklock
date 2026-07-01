// @version 0.3.1 @date 2026-06-03
// IMPORTANT: v1 (legacy baseline) reuses the Argon2id master key across Shamir splitting, AEAD encryption, and Ed25519 signing — a cross-protocol key-reuse pattern. v2 uses HKDF-derived per-purpose subkeys (V2_DOMAIN="noklock-v2").
// 0.3.1 — LOW-6: Added top-of-file honesty note documenting the v1 vs v2 key-schedule difference.
// 0.3.0 — Tier 1A: + `keypairFromPRKv2(prk)` which HKDF-derives the Ed25519
//         signing seed from the v2 PRK instead of using the raw Argon2id
//         master bytes as the private key directly (eliminates v1's cross-
//         protocol key-reuse smell where the same 32 bytes were
//         simultaneously the Shamir master, the AEAD key, AND the Ed25519
//         private key). v1 path (`keypairFromSeed`) kept unchanged for
//         backward compatibility on existing manifests. The signer pubkey is
//         what's stored in the manifest, so verify-side logic is identical
//         for both baselines — only the SIGNER's derivation differs.
// 0.2.0 — Manifest sign/verify with Ed25519 (@noble/curves), signing a
//         canonical-JSON serialisation of the manifest minus its sig fields.

import { ed25519 } from "@noble/curves/ed25519";
import { sha256 } from "@noble/hashes/sha2";
import type { VaultManifest } from "./types.js";
import { b64Encode, b64Decode, hkdfExpand, V2_INFO } from "./kdf.js";

/** Deterministic JSON serialiser — sorts object keys alphabetically so the
 *  signature is reproducible regardless of source-object key order. */
function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts: string[] = [];
  for (const k of keys) {
    parts.push(JSON.stringify(k) + ":" + canonicalJson((value as Record<string, unknown>)[k]));
  }
  return "{" + parts.join(",") + "}";
}

/** Derive an Ed25519 signing keypair from a 32-byte seed (the master secret).
 *  v1 (legacy) path — the master Argon2id output IS the Ed25519 private key.
 *  Kept unchanged so existing manifests still verify byte-identically. */
export async function keypairFromSeed(seed: Uint8Array): Promise<{ pub: Uint8Array; priv: Uint8Array }> {
  if (seed.length !== 32) throw new Error("manifest: seed must be 32 bytes");
  const pub = ed25519.getPublicKey(seed);
  // In @noble/curves/ed25519 the 32-byte seed IS the "private key" used by sign().
  return { pub, priv: seed };
}

/** v2 (Tier 1A) path — HKDF-Expand the v2 PRK with domain-separated `info`
 *  to derive a DEDICATED Ed25519 signing seed. Eliminates the v1 key-reuse
 *  smell where the same 32 bytes were the Shamir master + AEAD key + Ed25519
 *  private key. Verify-side logic is unchanged; only the SIGNER differs. */
export async function keypairFromPRKv2(prk: Uint8Array): Promise<{ pub: Uint8Array; priv: Uint8Array }> {
  if (prk.length !== 32) throw new Error("manifest: prk must be 32 bytes");
  const priv = hkdfExpand(prk, V2_INFO.signSeed, 32);
  const pub = ed25519.getPublicKey(priv);
  return { pub, priv };
}

export async function signManifest(
  manifestWithoutSignature: Omit<VaultManifest, "signatureB64" | "signerPubB64">,
  seed: Uint8Array
): Promise<VaultManifest> {
  const { pub, priv } = await keypairFromSeed(seed);
  const payload = canonicalJson(manifestWithoutSignature);
  const sig = ed25519.sign(new TextEncoder().encode(payload), priv);
  return {
    ...manifestWithoutSignature,
    signatureB64: b64Encode(sig),
    signerPubB64: b64Encode(pub),
  };
}

export async function verifyManifest(manifest: VaultManifest): Promise<boolean> {
  const { signatureB64, signerPubB64, ...rest } = manifest;
  const payload = canonicalJson(rest);
  try {
    return ed25519.verify(
      b64Decode(signatureB64),
      new TextEncoder().encode(payload),
      b64Decode(signerPubB64)
    );
  } catch {
    return false;
  }
}

/** Quick fingerprint of the manifest contents — used as an on-chain canary. */
export function manifestHash(manifest: VaultManifest): Uint8Array {
  const payload = canonicalJson(manifest);
  return sha256(new TextEncoder().encode(payload));
}
