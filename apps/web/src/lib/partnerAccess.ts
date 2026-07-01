// @version 0.2.0 @date 2026-05-27
// 0.2.0 — Daniel: the toolkit is for SELECTED partners + Premium-tier holders
//         ONLY. Not for any wallet that hits 5 referrals. Dropped the
//         earned-via-referrals path. Whitelist moved from a baked-in VITE_
//         env (rebuilds for every partner) to a runtime-fetched Form B flag
//         (app_flags key `partners.toolkit-whitelist`, edited via the Admin
//         panel — no rebuild, no env redeploy).
// 0.1.0 — initial partner-toolkit access model (Premium / earned / whitelist).
//
// Partner-toolkit access model. TWO painless ways into the /community-owners
// toolkit, no shared bearer tokens to leak or manage:
//   1. On-chain Premium-tier licence — Premium / Lifetime Premium / Family
//      Office / Institutional (tier >= 3). Frames the toolkit as a Premium
//      perk.
//   2. Selected-partner invitation — wallet is on the admin-managed
//      whitelist, edited from the Admin → Site toggles panel (stored in
//      Form B's app_flags so no rebuild is needed to grant/revoke).
//
// The user connects their wallet, the page reads the on-chain state + the
// runtime whitelist, and either lets them in or shows the two paths.

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

/** The minimum on-chain tier number that auto-qualifies for the toolkit. */
export const PARTNER_MIN_TIER = 3; // 3 = Premium

/** Form B `app_flags` key used to persist the runtime whitelist. */
export const PARTNER_WHITELIST_FLAG_KEY = "partners.toolkit-whitelist";

/** Tier names matching NoKLockLicense (mirrors useTierGate's mapping). */
const TIER_NAMES: Record<number, string> = {
  0: "Free",
  1: "Standard",
  2: "Standard Lifetime",
  3: "Premium",
  4: "Family Office",
  5: "Institutional",
  6: "Lifetime Premium",
};

export function tierName(tier: number): string {
  return TIER_NAMES[tier] ?? "Free";
}

/** Parse a Form B `app_flags` value (JSON-stringified array of addresses) into
 *  a lowercased Set. Tolerates empty / unset / malformed input — returns an
 *  empty set. Also accepts a comma-separated fallback shape so a paste of
 *  "0xabc,0xdef" still works. */
export function parsePartnerWhitelist(raw: string | null | undefined): ReadonlySet<string> {
  if (!raw) return new Set();
  let arr: unknown;
  try {
    arr = JSON.parse(raw);
  } catch {
    arr = raw.split(","); // comma-separated fallback
  }
  if (!Array.isArray(arr)) return new Set();
  return new Set(
    arr
      .map((a) => (typeof a === "string" ? a.trim().toLowerCase() : ""))
      .filter((a) => /^0x[a-f0-9]{40}$/.test(a) && a !== ZERO_ADDR),
  );
}

export type PartnerAccessReason = "premium-tier" | "selected-partner";

export interface PartnerAccessState {
  /** True if any path is satisfied. */
  readonly allowed: boolean;
  /** Which path qualified (first match) — informational. */
  readonly reason: PartnerAccessReason | null;
  /** The connected wallet's on-chain licence tier. */
  readonly tier: number;
  /** Whether the connected wallet is on the runtime whitelist. */
  readonly whitelisted: boolean;
}

/** Decide access purely from already-fetched values. Pure function. */
export function decidePartnerAccess(args: {
  readonly address: string | undefined;
  readonly tier: number;
  readonly whitelist: ReadonlySet<string>;
}): PartnerAccessState {
  const addrLower = args.address?.toLowerCase();
  const whitelisted = !!addrLower && args.whitelist.has(addrLower);
  const premium = args.tier >= PARTNER_MIN_TIER;

  let reason: PartnerAccessReason | null = null;
  if (premium) reason = "premium-tier";
  else if (whitelisted) reason = "selected-partner";

  return {
    allowed: premium || whitelisted,
    reason,
    tier: args.tier,
    whitelisted,
  };
}
