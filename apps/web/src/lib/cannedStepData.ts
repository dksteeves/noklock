// @version 0.1.0 @date 2026-05-30
// Canned per-step illustrative data for /viz/pipeline (the end-to-end
// demo). The live /prove-it/math dashboard populates the equivalent map
// from the REAL crypto pipeline as it runs; this file provides
// honest-shaped illustrative bytes so the demo page can show the
// "Show me the data" panel without requiring a live run.
//
// Honesty rules:
//   - Values look like real outputs would (correct lengths, correct
//     formats: hex strings, base64, etc.)
//   - Marked as "illustrative" / "synthetic" so the user knows this
//     isn't bytes from their machine.
//   - The viz panel header pill says "Demo · illustrative bytes" when
//     in cannedDemo mode (already wired via the existing `mode="demo"`
//     prop on ProveItVizPanel).

import type { StepDataLine, ProveItStepKey } from "../components/ProveItVizPanel.js";

export const CANNED_STEP_DATA: ReadonlyMap<string, readonly StepDataLine[]> = new Map<ProveItStepKey, readonly StepDataLine[]>([
  ["gen", [
    { k: "entropy bytes",    v: "16 (128 bits)" },
    { k: "wordlist",          v: "BIP-39 English · 2048 words" },
    { k: "mnemonic (synthetic)", v: "abandon ability absorb abstract accept across actor actual adapt advance afford agent" },
  ]],
  ["valid", [
    { k: "word count",       v: "12" },
    { k: "checksum bits",    v: "4 (12-word seed)" },
    { k: "result",            v: "valid ✓" },
  ]],
  ["kdf", [
    { k: "algorithm",        v: "Argon2id (RFC 9106)" },
    { k: "memory",            v: "65,536 KiB (64 MiB)" },
    { k: "time cost",         v: "t=3" },
    { k: "parallelism",       v: "p=4" },
    { k: "salt",              v: "3f7a…8d92 (16 bytes)" },
    { k: "output bytes",     v: "32" },
    { k: "master key (synthetic)", v: "9c4f8a3b1e7d2c5f4a8b6e9d3c7f2a1e5b8d4c7a9f3e2d8c5b1a7f4e9d3c8b2a" },
  ]],
  ["split", [
    { k: "threshold",         v: "3" },
    { k: "total shares",     v: "5" },
    { k: "field",             v: "GF(256) · poly x^8+x^4+x^3+x+1" },
    { k: "share 1",          v: "index=1 · 32 bytes" },
    { k: "share 2",          v: "index=2 · 32 bytes" },
    { k: "share 3",          v: "index=3 · 32 bytes" },
    { k: "share 4",          v: "index=4 · 32 bytes" },
    { k: "share 5",          v: "index=5 · 32 bytes" },
  ]],
  ["enc", [
    { k: "cipher mix",       v: "AES-256-GCM + XChaCha20-Poly1305 (random per share)" },
    { k: "share 1",          v: "AES-256-GCM · ct=48B (32 plaintext + 16 tag)" },
    { k: "share 2",          v: "XChaCha20-Poly1305 · ct=48B" },
    { k: "share 3",          v: "AES-256-GCM · ct=48B" },
    { k: "share 4",          v: "AES-256-GCM · ct=48B" },
    { k: "share 5",          v: "XChaCha20-Poly1305 · ct=48B" },
  ]],
  ["wrap", [
    { k: "ciphers",          v: "1:GCM, 2:XChaCha, 3:GCM, 4:GCM, 5:XChaCha" },
    { k: "wrapped sizes",    v: "48, 48, 48, 48, 48 bytes" },
  ]],
  ["content-enc", [
    { k: "cipher",            v: "AES-256-GCM" },
    { k: "plaintext bytes",  v: "1,024 (illustrative document)" },
    { k: "ciphertext bytes", v: "1,040 (plaintext + 16-byte tag)" },
    { k: "iv bytes",          v: "12" },
  ]],
  ["manifest", [
    { k: "algorithm",        v: "Ed25519 over canonical-JSON" },
    { k: "vault id",         v: "v1-2026-illustrative-demo" },
    { k: "signer pubkey",    v: "32 bytes" },
    { k: "signature",         v: "64 bytes" },
    { k: "self-verify",      v: "passes ✓" },
    { k: "manifest hash",    v: "8f3a4b9e2c7d1f5a6b8d4c2e9f7a3b5d1e8c4a6f9b2d5e7c8a1f4b3d9e6c2a5f" },
  ]],
  ["restore", [
    { k: "shares used",      v: "1, 3, 5 (any 3 of 5 works)" },
    { k: "interpolation",    v: "Lagrange at x=0 in GF(256)" },
    { k: "entropy out bytes", v: "16" },
    { k: "recovered mnemonic", v: "abandon ability absorb abstract accept across actor actual adapt advance afford agent" },
  ]],
  ["compare", [
    { k: "byte-for-byte",    v: "identical ✓" },
    { k: "original bytes",   v: "16 (entropy) / 1,024 (content)" },
    { k: "recovered bytes",  v: "16 (entropy) / 1,024 (content)" },
  ]],
  ["error", [
    { k: "(no error)",       v: "this row appears only on a failed run" },
  ]],
]);

/** Returns the canned bytes for a step, falling back to a one-liner
 *  placeholder if the step key isn't in the map. */
export function getCannedStepData(key: ProveItStepKey | string): readonly StepDataLine[] {
  return CANNED_STEP_DATA.get(key as ProveItStepKey) ?? [{ k: "step", v: String(key) }];
}
