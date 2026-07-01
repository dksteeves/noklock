// @version 0.1.2 @date 2026-06-03
//
// SLIP-39 / Shamir Secret Sharing over GF(256).
//
// This is a minimal, faithful implementation of Shamir's scheme as used in
// SLIP-39 (Trezor). For Phase 1 we ship the polynomial scheme directly; a
// future swap to a vetted external library (e.g. @privy-io/shamir-secret-sharing)
// is a one-file substitution behind the same { split, combine } interface.
//
// Mathematical detail:
//   - Secret S ∈ {0..255}^n is split into N shares S_i = P(i) for i=1..N
//     where P(x) is a polynomial of degree (threshold-1) over GF(256) with
//     P(0) = S (or more precisely: each byte of S is the constant term of
//     a separate polynomial; we run N parallel byte-level Shamir splits).
//   - Threshold-many shares are needed to reconstruct S via Lagrange
//     interpolation at x=0.
//
// References:
//   - Shamir, "How to Share a Secret", CACM 1979.
//   - SLIP-0039, https://github.com/satoshilabs/slips/blob/master/slip-0039.md

const GF256_LOG = new Uint8Array(256);
const GF256_EXP = new Uint8Array(256);
(function buildTables(): void {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x ^= x << 1;
    if (x & 0x100) x ^= 0x11b; // AES irreducible polynomial
    x &= 0xff;
  }
  GF256_EXP[255] = GF256_EXP[0]!; // wrap
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[(GF256_LOG[a]! + GF256_LOG[b]!) % 255]!;
}

function gfDiv(a: number, b: number): number {
  if (a === 0) return 0;
  if (b === 0) throw new Error("slip39: division by zero in GF(256)");
  return GF256_EXP[(GF256_LOG[a]! - GF256_LOG[b]! + 255) % 255]!;
}

function gfPolyEval(coeffs: Uint8Array, x: number): number {
  // Horner's method.
  let result = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    result = gfMul(result, x) ^ coeffs[i]!;
  }
  return result;
}

/** Lagrange interpolation at x=0 given (x_i, y_i) pairs. */
function gfLagrangeAtZero(xs: number[], ys: number[]): number {
  let result = 0;
  for (let i = 0; i < xs.length; i++) {
    let num = 1;
    let den = 1;
    for (let j = 0; j < xs.length; j++) {
      if (i === j) continue;
      num = gfMul(num, xs[j]!);             // (0 - x_j) = -x_j; in GF(256) negation is identity
      den = gfMul(den, xs[j]! ^ xs[i]!);
    }
    result ^= gfMul(ys[i]!, gfDiv(num, den));
  }
  return result;
}

export interface ShamirShare {
  readonly index: number;       // x-coordinate, 1..total (255 max)
  readonly bytes: Uint8Array;   // y-coordinates per byte position
}

export function split(secret: Uint8Array, threshold: number, total: number): readonly ShamirShare[] {
  if (threshold < 2) throw new Error("slip39: threshold must be ≥ 2");
  if (total < threshold) throw new Error("slip39: total must be ≥ threshold");
  if (total > 255) throw new Error("slip39: total must be ≤ 255");

  const shares: ShamirShare[] = [];
  for (let s = 1; s <= total; s++) {
    shares.push({ index: s, bytes: new Uint8Array(secret.length) });
  }

  for (let byteIdx = 0; byteIdx < secret.length; byteIdx++) {
    // Build polynomial P_byteIdx(x) with constant term = secret[byteIdx]
    // and (threshold - 1) random coefficients.
    const coeffs = new Uint8Array(threshold);
    coeffs[0] = secret[byteIdx]!;
    const rand = crypto.getRandomValues(new Uint8Array(threshold - 1));
    for (let i = 1; i < threshold; i++) coeffs[i] = rand[i - 1]!;

    for (let s = 0; s < total; s++) {
      shares[s]!.bytes[byteIdx] = gfPolyEval(coeffs, shares[s]!.index);
    }
  }

  return shares;
}

export function combine(shares: readonly ShamirShare[], threshold: number): Uint8Array {
  if (shares.length < threshold) {
    throw new Error(`slip39: have ${shares.length} shares, need ${threshold}`);
  }
  // Use the first `threshold` shares (assumption: callers select valid ones).
  const used = shares.slice(0, threshold);
  const secretLen = used[0]!.bytes.length;
  for (const sh of used) {
    if (sh.bytes.length !== secretLen) throw new Error("slip39: share length mismatch");
  }

  const xs = used.map((s) => s.index);
  for (const x of xs) {
    if (!Number.isInteger(x) || x < 1 || x > 255) {
      throw new Error(`slip39: share index must be integer in [1,255], got ${x}`);
    }
  }
  for (const sh of used) {
    for (const b of sh.bytes) {
      if (!Number.isInteger(b) || b < 0 || b > 255) {
        throw new Error("slip39: share bytes must be integers in [0,255]");
      }
    }
  }
  const xsSet = new Set(xs);
  if (xsSet.size !== xs.length) throw new Error("slip39: duplicate share indices in input");
  const secret = new Uint8Array(secretLen);
  for (let byteIdx = 0; byteIdx < secretLen; byteIdx++) {
    const ys = used.map((s) => s.bytes[byteIdx]!);
    secret[byteIdx] = gfLagrangeAtZero(xs, ys);
  }
  return secret;
}
