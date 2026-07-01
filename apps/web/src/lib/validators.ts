// @version 0.2.0 @date 2026-06-03
// 0.2.0 — H19 FIX (Daniel 2026-06-03): add three hex-shape validators used
//          everywhere the PWA touches an EVM address, vault id, or 32-byte
//          digest. Prior callers re-wrote the same regex inline at every
//          mint-form / restore-form site (Enrol.tsx doMintNok, Nok.tsx
//          doMint vault+manifest+wallet checks) which (a) drifted in
//          subtle ways (some accept leading whitespace, some don't; some
//          accept the bare-hex no-0x form), and (b) meant a paste with a
//          trailing newline or a U+200E RTL spoof char would slip past a
//          permissive site and reach the chain or a server-side store.
//          These three helpers normalise via `.trim()` THEN strict-match
//          the canonical EIP-55 / 32-byte-hex shape — exactly the shape
//          viem expects when you cast `addr as `0x${string}``. Behaviour:
//            • `isValidEthAddress`  — 0x + exactly 40 hex chars (20 bytes).
//            • `isValidVaultId`     — 0x + exactly 64 hex chars (32 bytes).
//            • `isValidHash`        — same shape as vaultId (32-byte digest:
//                                     manifestHash / sha256 / keccak256).
//          All three reject empty/non-string input, leading/trailing
//          whitespace inside the body (post-trim), and any non-hex char.
//          We DO NOT lowercase the input — EIP-55 mixed-case checksum
//          encoding is part of the address shape and the regex accepts
//          both cases. Centralising here means a future EIP-55 checksum
//          verifier (real cryptographic check, not just shape) lands in
//          one place and every call-site upgrades for free.
//
// 0.1.0 — H18 FIX. The prior NoK email checks were `email.includes("@")`
// only — which accepted "@", " @ ", "a@b", RTL spoofs, and 50,000-char
// strings. This module centralises a single sound check used by every
// email entry point (Nok.tsx form + useEmailNokMint hook + future
// callers) so we never drift again.
//
// `isValidEmail` enforces:
//   1. Non-empty, length ≤ 254 (RFC 5321 max addr).
//   2. Shape `local@domain.tld` — at least one non-whitespace/non-@ char
//      on each side of @, and a `.tld` segment after the domain (regex
//      /^[^\s@]+@[^\s@]+\.[^\s@]+$/). Deliberately lax on local-part
//      grammar — the server-side hash + send-attempt is the real validator;
//      this is a client-side typo/spoof guard.
//   3. Reject ANY Unicode bidi/format/zero-width control char (U+200E,
//      U+200F, U+202A–U+202E, U+2066–U+2069, U+FEFF, U+200B–U+200D).
//      These are the classic RTL-spoof / homograph-spoof payload chars —
//      they let "good@example.com" render visually identical to a different
//      address. A real human-typed email never contains them.

// Bidi + zero-width + BOM controls that an attacker uses to spoof an address
// in the rendered UI. Anything in this set means "this is not a normal email".
//   U+200B–U+200D zero-width space/non-joiner/joiner
//   U+200E–U+200F LRM / RLM
//   U+202A–U+202E LRE / RLE / PDF / LRO / RLO
//   U+2066–U+2069 LRI / RLI / FSI / PDI
//   U+FEFF        BOM / ZWNBSP
const SPOOF_CHARS = /[​-‏‪-‮⁦-⁩﻿]/;

// Bare shape: one or more non-whitespace/non-@ chars, @, one or more
// non-whitespace/non-@ chars, ., one or more non-whitespace/non-@ chars.
const SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_EMAIL_LEN = 254;

export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  if (email.length === 0 || email.length > MAX_EMAIL_LEN) return false;
  if (SPOOF_CHARS.test(email)) return false;
  if (!SHAPE.test(email)) return false;
  return true;
}

// --- H19 (0.2.0) ---------------------------------------------------------
// Canonical hex shapes. `.trim()` lets us accept paste with a leading or
// trailing space/newline (common from email-quote pastes, manifest.json
// copy-out, etc.) but the regex itself is strict — no internal whitespace,
// no missing 0x, no truncation, no over-length.

// 20-byte EVM address: 0x + 40 hex (mixed case accepted; EIP-55 checksum
// validity is NOT enforced here — shape-only).
const ETH_ADDR_SHAPE = /^0x[0-9a-fA-F]{40}$/;

// 32-byte digest: 0x + 64 hex. Used for both vault ids (random 32-byte ids
// in this codebase) and any keccak256 / sha256 manifest hash.
const HEX32_SHAPE = /^0x[0-9a-fA-F]{64}$/;

export function isValidEthAddress(addr: string): boolean {
  if (typeof addr !== "string") return false;
  return ETH_ADDR_SHAPE.test(addr.trim());
}

export function isValidVaultId(id: string): boolean {
  if (typeof id !== "string") return false;
  return HEX32_SHAPE.test(id.trim());
}

export function isValidHash(h: string): boolean {
  if (typeof h !== "string") return false;
  return HEX32_SHAPE.test(h.trim());
}
