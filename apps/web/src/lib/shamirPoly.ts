// @version 0.1.0 @date 2026-05-28
// Standalone Shamir polynomial math for the Shamir visualisation. This
// module is INDEPENDENT of @soulchain/crypto-core — it does NOT call the
// real Shamir split. The viz uses friendly base-10 numbers so the curve
// fits on a screen-sized SVG; the real crypto-core Shamir uses GF(256)
// field arithmetic on Uint8Arrays, which doesn't draw as a smooth curve.
//
// What the viz teaches (and the reason this file exists):
//   * A degree-(K-1) polynomial is uniquely determined by K points.
//   * The secret is P(0) — the y-intercept.
//   * N shares = N sample points on the curve at x=1..N.
//   * Any K shares allow Lagrange interpolation → recover P(0) = secret.
//   * Any K-1 shares constrain a (K-1)-dim family of polynomials — P(0)
//     can be ANY value. Secret is information-theoretically hidden.
//
// The polynomial coefficients (above the constant term = secret) are
// deterministic, seeded by the secret itself, so re-rendering the same
// secret yields the same curve — useful for screen-recording.

export type Point = readonly [x: number, y: number];

/** Tiny deterministic PRNG (mulberry32) — seeded so the same secret
 *  produces the same polynomial every render. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate the canonical viz polynomial: degree K-1, constant term =
 *  secret, other coefficients drawn from the deterministic PRNG. The
 *  bound scales each term so that |P(x) - secret| stays within ~35 across
 *  the drawn x-range, regardless of (n, k). The `variant` arg lets the
 *  caller request DIFFERENT random curves for the same (secret, n, k) —
 *  so each animation loop shows a fresh polynomial. Without variant
 *  every loop draws the identical curve, which Daniel called out as
 *  "never exactly random". */
export function makePolynomial(
  secret: number,
  k: number,
  n: number,
  variant = 0,
  xDrawMax = 6.5,
): readonly number[] {
  if (k < 1) throw new Error("k must be >= 1");
  const rand = mulberry32(
    Math.floor(secret * 1000) + k * 31 + n * 17 + variant * 9941,
  );
  const coeffs: number[] = [secret];
  // Budget the swing so |P(x) - secret| ≤ 32 across x ∈ [0, xDrawMax].
  const MAX_ABS_SWING = 32; // margin against the [-15, 115] y-range
  const termBudget = MAX_ABS_SWING / Math.max(1, k - 1);
  for (let i = 1; i < k; i++) {
    const range = termBudget / Math.pow(xDrawMax, i);
    // Force a sign mix on higher orders so curves don't collapse into
    // monotone lines on every variant.
    const signBias = variant % 2 === 0 ? 1 : -1;
    coeffs.push((rand() * 2 - 1) * range * (i % 2 === 1 ? signBias : -signBias));
  }
  return coeffs;
}

/** Evaluate polynomial with given coefficients at x. coeffs[0] = constant. */
export function evalPoly(coeffs: readonly number[], x: number): number {
  let result = 0;
  let pow = 1;
  for (const c of coeffs) {
    result += c * pow;
    pow *= x;
  }
  return result;
}

/** Generate N shares from the polynomial at x = 1..N. */
export function shareValues(coeffs: readonly number[], n: number): readonly Point[] {
  const points: Point[] = [];
  for (let i = 1; i <= n; i++) {
    points.push([i, evalPoly(coeffs, i)]);
  }
  return points;
}

/** Lagrange interpolation: given points P, evaluate the unique polynomial
 *  of degree <= P.length - 1 passing through them, at x. */
export function lagrange(points: readonly Point[], x: number): number {
  let result = 0;
  for (let i = 0; i < points.length; i++) {
    const pi = points[i];
    if (!pi) continue;
    let term = pi[1];
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const pj = points[j];
      if (!pj) continue;
      const denom = pi[0] - pj[0];
      if (denom === 0) continue; // duplicate x — guard
      term *= (x - pj[0]) / denom;
    }
    result += term;
  }
  return result;
}

/** Given a fixed set of "known" shares and a desired P(0), produce the
 *  Lagrange-interpolating polynomial as a function evaluable at any x.
 *  This is what powers the "alternative curves" fan: pick different
 *  candidate secrets, get different curves through the same known shares.
 *  Returns the y-value at the queried x. */
export function lagrangeWithSecret(known: readonly Point[], candidateSecret: number, x: number): number {
  const points: Point[] = [[0, candidateSecret], ...known];
  return lagrange(points, x);
}

/** Sample a curve across [xMin, xMax] with N segments. Returns sample
 *  y-values for SVG path construction. */
export function sampleCurve(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  segments: number,
): readonly Point[] {
  const samples: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = xMin + ((xMax - xMin) * i) / segments;
    samples.push([x, fn(x)]);
  }
  return samples;
}

/** Pick `count` share indices SCATTERED across [0..n-1] so the viz
 *  visually conveys "ANY K, not the first K". Evenly-spaced selection.
 *  Pure function — deterministic for any (n, count) pair. */
export function pickScatteredIndices(n: number, count: number): readonly number[] {
  if (n <= 0 || count <= 0) return [];
  if (count >= n) return Array.from({ length: n }, (_, i) => i);
  if (count === 1) return [Math.floor(n / 2)]; // middle one
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    out.push(Math.round((i / (count - 1)) * (n - 1)));
  }
  // Ensure uniqueness if rounding collided (rare with reasonable n/k).
  const seen = new Set<number>();
  const final: number[] = [];
  for (const idx of out) {
    if (!seen.has(idx)) { seen.add(idx); final.push(idx); }
  }
  // If we collided and lost some, backfill with the next-available indices.
  let probe = 0;
  while (final.length < count && probe < n) {
    if (!seen.has(probe)) { seen.add(probe); final.push(probe); }
    probe++;
  }
  return final.sort((a, b) => a - b);
}

/** Standard threshold-scheme presets — what real users actually pick. */
export interface NKPreset {
  readonly n: number;
  readonly k: number;
  readonly label: string;
  readonly desc: string;
}

export const NK_PRESETS: readonly NKPreset[] = [
  { n: 3, k: 2, label: "2-of-3",  desc: "Minimal — 3 share locations, any 2 restore. NoKLock's default." },
  { n: 5, k: 3, label: "3-of-5",  desc: "Common — 5 share locations spread across clouds + devices, any 3 restore." },
  { n: 7, k: 4, label: "4-of-7",  desc: "Robust — 7 share locations, 4 needed. Survives multiple losses." },
  { n: 9, k: 5, label: "5-of-9",  desc: "Maximum — 9 share locations, 5 needed. Enterprise / family-office grade." },
];
