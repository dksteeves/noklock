// @version 0.3.0 @date 2026-06-12
// 0.3.0 — Dropped "provisional" from all user-facing status strings (real
//         status is a US patent application in progress; the accepted Swiss
//         application is handled on the Roadmap, not here). DISPLAYED text +
//         comments only — the flag-key constant VALUES (us-provisional-status
//         / -serial) are UNCHANGED internal identifiers so Daniel's stored
//         Form B flag value is not orphaned.
// 0.2.0 — Daniel: status + serial are now ADMIN-CONTROLLED via Form B
//         `patents.us-provisional-status` + `patents.us-provisional-serial`
//         flags. The four hard-coded constants from 0.1.0 (PATENT_STATUS,
//         PATENT_SERIAL, patentLeader(), patentNotice()) remain — they're
//         the static fallback used at module-import time (e.g. for static
//         strings in Pricing's ARCH_BASELINE list) and any time the live
//         flag fetch hasn't resolved yet. UI surfaces that re-render on
//         flag-fetch use the `useLivePatentLeader()` hook instead — its
//         output replaces the static `patentLeader()` for live JSX.
//
// Legal-precision phasing (35 USC §292 false-marking awareness): you can
// only legally say "patent pending" once you actually have a USPTO filing
// receipt with a serial number. Setting status to "pending" without a serial
// in the admin UI shows a warning + still emits "patent pending — US
// application" (no serial) which is defensible if you have actually filed.
// Going to status "pending" before you have filed is YOUR call; the UI
// doesn't enforce it (we don't know what's on your desk).

import { useFlag } from "../hooks/useFlag.js";

export type PatentStatus = "in-progress" | "filed" | "pending" | "non-pro";

const VALID_STATUSES: ReadonlySet<PatentStatus> = new Set([
  "in-progress", "filed", "pending", "non-pro",
]);

/** Static fallback — used at module-import time + when the live flag fetch
 *  is in flight. Live admin overrides via the Form B flag take precedence. */
export const PATENT_STATUS: PatentStatus = "in-progress";

/** Static fallback serial — null = none. */
export const PATENT_SERIAL: string | null = null;

/** Form B `app_flags` keys backing the live status + serial. */
export const PATENT_STATUS_FLAG_KEY = "patents.us-provisional-status";
export const PATENT_SERIAL_FLAG_KEY = "patents.us-provisional-serial";

/** Brief description of what the application covers. Keep general but
 *  concrete enough to communicate what's protected. No claim language. This
 *  is intentionally NOT admin-controlled — the inventions are what they are. */
export const PATENT_DESCRIPTION =
  "NoKLock's heir-by-email designation flow with on-chain SBT rebind (Hybrid-E), " +
  "the three-role-per-NoK soulbound NFT split (Activation / Voting / Revocation, ERC-5192), " +
  "and the self-funded Live-Man's Switch out-of-band notification via Chainlink log-trigger.";

/** Build the leading phrase for any given (status, serial) pair. */
export function patentLeaderFor(status: PatentStatus, serial: string | null): string {
  switch (status) {
    case "in-progress":
      return "US patent application in progress";
    case "filed":
      return serial
        ? `US patent application filed (serial ${serial})`
        : "US patent application filed";
    case "pending":
      return serial
        ? `Patent pending — US application ${serial}`
        : "Patent pending — US application";
    case "non-pro":
      return serial ? `Patent pending — ${serial}` : "Patent pending";
  }
}

/** Static fallback leader, using the module-level defaults. Use in places
 *  that can't take a React hook (string arrays evaluated at module load). */
export function patentLeader(): string {
  return patentLeaderFor(PATENT_STATUS, PATENT_SERIAL);
}

/** Static fallback combined notice. */
export function patentNotice(): string {
  return `${patentLeader()}, covering ${PATENT_DESCRIPTION}`;
}

/** Live leader text from the Form B admin-controlled flags. Falls back to
 *  the static `patentLeader()` while the fetch is in flight or if either
 *  flag is unreachable / unrecognised. Re-renders the consuming component
 *  the moment the flags resolve. */
export function useLivePatentLeader(): { readonly leader: string; readonly status: PatentStatus; readonly serial: string | null } {
  const { value: rawStatus } = useFlag(PATENT_STATUS_FLAG_KEY, PATENT_STATUS);
  const { value: rawSerial } = useFlag(PATENT_SERIAL_FLAG_KEY, "");
  const status: PatentStatus = VALID_STATUSES.has(rawStatus as PatentStatus)
    ? (rawStatus as PatentStatus)
    : PATENT_STATUS;
  const serial = rawSerial && rawSerial.trim().length > 0 ? rawSerial.trim() : null;
  return { leader: patentLeaderFor(status, serial), status, serial };
}
