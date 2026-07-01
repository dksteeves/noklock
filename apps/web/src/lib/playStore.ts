// @version 0.1.0 @date 2026-06-10
// Google Play download surface — pure consts module (no component).
//
// 0.1.0 — Daniel 2026-06-10: NEW. Centralises the Google Play listing URL,
//         the flag that gates EVERY download surface, and the badge asset
//         path. Nothing renders until VITE_PLAY_STORE_AVAILABLE === "true"
//         (set by Daniel when the Play listing is live). Keep this a pure
//         consts module — render the <img>/<a> inline at each call site
//         (Footer, Settings, Download route) so there is one obvious gate
//         per surface and no shared component to mis-gate.
//
// FLAG-OFF (default): PLAY_STORE_AVAILABLE === false, so the call sites
// short-circuit and never emit the badge <a>/<img> or the footer "Get app"
// link. The /download route still renders, but shows "Coming soon to Google
// Play" instead of the badge (so the URL is never a broken page pre-launch).
//
// FLAG-ON: badge renders in the footer, in the Settings "Get the Android
// app" card, and on /download, all linking to PLAY_STORE_URL.

// Deterministic from twa-manifest.json packageId === "app.noklock.twa"
// (confirmed in C:/Users/danie/noklock-twa/twa-manifest.json). The Play
// listing URL for an Android app is always this canonical shape.
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.noklock.twa";

// INLINE literal compare for Vite DCE — mirrors the pattern in
// lib/managed-wallet.ts:31-32 and ManagedWalletProvider.tsx:47-48. Reading
// import.meta.env.VITE_* directly (not via a re-export) lets Vite statically
// inline the env value at build time so Rollup can dead-code-eliminate the
// flag-on branches at every call site when the flag is not "true".
// Default false: any value other than the literal string "true" is off.
export const PLAY_STORE_AVAILABLE: boolean =
  import.meta.env.VITE_PLAY_STORE_AVAILABLE === "true";

// Official Google Play badge. Daniel drops the trademark-correct PNG at
// apps/web/public/play-badge/get-it-on-google-play.png before flipping the
// flag on (see public/play-badge/README.md). Path is /-rooted (served from
// public/) so it resolves under the SPA at any route.
export const PLAY_BADGE_SRC = "/play-badge/get-it-on-google-play.png";
