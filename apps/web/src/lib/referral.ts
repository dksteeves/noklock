// @version 0.3.0 @date 2026-06-08
// Referral-link capture. A referral link is one of:
//   * Self-custody: https://noklock.app/?ref=0x<addr>            (40-hex)
//   * Managed:      https://noklock.app/?ref=NK-MGMT-XXXX        (12 chars)
//
// We persist the referrer in localStorage so it survives navigation and the
// wallet-connect round-trip. Self-custody referrers feed into the contract
// mint flow (useMintLicence → mintLicenceReferred); managed referrers are
// resolved off-chain by Form B at the Paddle webhook (managed mints are not
// on-chain referred — see strawman §9.2 + Agent 3's territory).
//
// 0.3.0 — BREAKING: getStoredReferrer() now returns a discriminated union
//   StoredReferrer (self-custody address OR managed NK-MGMT-XXXX code OR
//   null) instead of `0x${string}` | null. NEW: URL-param capture supports
//   the NK-MGMT-* managed-mode 12-char code (regex /^NK-MGMT-[A-Z0-9]{4}$/;
//   the 4-char tail is alphanumeric — Form B is responsible for generating
//   codes that avoid visually confusing chars 0/O/1/I/L, the validation
//   regex stays [A-Z0-9]{4} so any legitimate Form-B-issued code parses).
//   localStorage value is now serialized JSON ({"kind":"...", ...});
//   backward-compat: an older plain "0x..." string in localStorage parses
//   as self-custody on first read (no migration write — first valid
//   capture replaces it with the new JSON format).
//
// 0.2.0 — T-3D-2 (Claude-extension test): the mint UI showed "Referred —
//   discount applied" with a discounted price for the zero-address AND for
//   self-referral, but the contract REVERTS both at mint time — i.e. a
//   discount we could never honour (the tx would just fail). Added the
//   validator isValidSelfCustodyReferrer() (rejects null / malformed /
//   zero-address / self) and routed BOTH capture and getStoredReferrer
//   through it, so an invalid referrer is never stored or returned.
//
// Stored once; a later valid ?ref overwrites (last referrer wins pre-mint —
// on-chain the FIRST attribution is locked regardless, so this only affects
// who gets credited before the user's first paid mint).

const REF_KEY = "noklock.ref";
const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
// 12-char total: "NK-MGMT-" (8) + 4-char tail. H-26 (pressure-test 2026-06-10):
// the tail alphabet MUST match the issuer + webhook exactly — Form B issues and
// the billing webhook validates against the confusing-char-free set
// [ABCDEFGHJKMNPQRSTUVWXYZ23456789] (managed-referrals.ts:60, billing.ts:1087).
// The prior loose [A-Z0-9]{4} captured crafted ?ref codes the issuer can never
// mint while the webhook silently rejected them → referral credit lost with no
// user-visible error. One canonical alphabet across all three layers.
const MGMT_CODE_RE = /^NK-MGMT-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/;

export type StoredReferrer =
  | { kind: "self-custody"; address: `0x${string}` }
  | { kind: "managed"; code: string }
  | null;

export function isAddress(v: string | null | undefined): v is `0x${string}` {
  return !!v && ADDR_RE.test(v);
}

export function isManagedCode(v: string | null | undefined): boolean {
  return !!v && MGMT_CODE_RE.test(v);
}

/** Validate a self-custody 0x referrer. Returns the lower-cased 0x address
 *  if it is well-formed, non-zero, and not the connected wallet (`self`);
 *  otherwise null. */
export function isValidSelfCustodyReferrer(
  ref: string | null | undefined,
  self?: string | null,
): `0x${string}` | null {
  if (!isAddress(ref)) return null;
  const lower = ref.toLowerCase();
  if (lower === ZERO_ADDR) return null;
  if (self && lower === self.toLowerCase()) return null;
  return lower as `0x${string}`;
}

// Back-compat alias (existing TierCard comments + any external import).
// Same signature as 0.2.0's isValidReferrer.
export const isValidReferrer = isValidSelfCustodyReferrer;

/** Parse a raw ?ref= URL param into a StoredReferrer (or null). Tries the
 *  managed-code shape first (cheap regex), then the 0x self-custody path
 *  (which also rejects zero-address + self-referral when `self` is given). */
export function parseReferrerParam(
  raw: string | null | undefined,
  self?: string | null,
): StoredReferrer {
  if (!raw) return null;
  if (isManagedCode(raw)) return { kind: "managed", code: raw };
  const addr = isValidSelfCustodyReferrer(raw, self);
  if (addr) return { kind: "self-custody", address: addr };
  return null;
}

function serialize(r: StoredReferrer): string | null {
  if (!r) return null;
  return JSON.stringify(r);
}

function deserialize(raw: string | null, self?: string | null): StoredReferrer {
  if (!raw) return null;
  // Forward path: JSON-encoded StoredReferrer.
  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as { kind?: string; address?: string; code?: string };
      if (parsed.kind === "managed" && isManagedCode(parsed.code)) {
        return { kind: "managed", code: parsed.code as string };
      }
      if (parsed.kind === "self-custody") {
        const addr = isValidSelfCustodyReferrer(parsed.address, self);
        if (addr) return { kind: "self-custody", address: addr };
      }
      return null;
    } catch {
      return null;
    }
  }
  // Backward-compat: 0.2.0 wrote plain "0x..." strings. Treat as
  // self-custody (still subject to zero-address + self-referral filters).
  const addr = isValidSelfCustodyReferrer(raw, self);
  if (addr) return { kind: "self-custody", address: addr };
  return null;
}

/** Call once on app load / each route. Reads ?ref= and persists if valid.
 *  (The connected wallet is unknown here, so self-referral is filtered later
 *  by getStoredReferrer once an address is available.) */
export function captureReferrerFromUrl(search: string): void {
  try {
    const params = new URLSearchParams(search);
    const parsed = parseReferrerParam(params.get("ref"));
    if (parsed) {
      const prior = localStorage.getItem(REF_KEY);
      const serialized = serialize(parsed);
      if (serialized === null) return;
      localStorage.setItem(REF_KEY, serialized);
      // Fire-and-forget analytic: ONLY on a fresh ref capture (not on re-render
      // / route change with the same ref already stored), so a single click on
      // a referral link counts once. Dynamic import to avoid a cycle on tests.
      if (prior !== serialized) {
        void import("./track.js").then((m) => m.trackEvent("referral_visit")).catch(() => { /* never block */ });
      }
    }
  } catch {
    /* localStorage blocked / bad URL — referral simply doesn't attach */
  }
}

/** The stored referrer, or null. For self-custody: `self` (the connected
 *  wallet) and the zero-address are filtered out. For managed: the
 *  NK-MGMT-XXXX code is returned unchanged (managed referrals are resolved
 *  off-chain by Form B; no self-filter applies here). */
export function getStoredReferrer(self?: string | null): StoredReferrer {
  try {
    return deserialize(localStorage.getItem(REF_KEY), self);
  } catch {
    return null;
  }
}

export function clearStoredReferrer(): void {
  try { localStorage.removeItem(REF_KEY); } catch { /* ignore */ }
}
