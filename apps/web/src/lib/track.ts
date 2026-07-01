// @version 0.9.0 @date 2026-06-15
// 0.9.0 — Enrol FUNNEL instrumentation (Daniel: "add the instrumentation to the
//         levels that you can"). + 5 per-step checkpoints (enrol_reached_airgap
//         /content/shares/drill/nok) fired once per step per session via
//         trackEventDurable (offline-safe — they fire mid-airgap). Turns the
//         opaque started→completed gap into a step-by-step drop-off the Admin
//         funnel can read.
// @version 0.8.0 @date 2026-06-15
// 0.8.0 — TRACTION expansion (Daniel: "count anything and everything … incl
//         restores, tests, pings; send a ping when a vault is created").
//         + 5 named events (vault_created, enrol_completed, restore_failed,
//         heartbeat_ping, nok_designated) and an OFFLINE-DURABLE queue
//         (trackEventDurable / flushPendingEvents / installOfflineEventFlush):
//         a vault stored in airgap fires its beacon while navigator.onLine ===
//         false, which sendBeacon drops — so those events are stashed in a
//         capped localStorage queue and replayed on the next 'online' event or
//         app boot. Still zero-PII: aggregate (name, day) integer only.
// @version 0.7.1 @date 2026-06-03
// 0.7.1 — LOW-2 (post-launch audit): ADDR_KEY now imported from the new
//         src/lib/wallet-storage-keys.ts (alongside HAD_WALLET_KEY used by
//         walletSession.ts). Behaviour byte-identical (same "noklock.addr"
//         string, same read/write paths) — change removes the rename
//         foot-gun: a future rename in wallet-storage-keys.ts updates both
//         modules atomically. The pre-LOW-2 arrangement was paired
//         "DO NOT rename without updating the other" comments here and in
//         walletSession.ts; both still document the contract but the string
//         lives in exactly one place now.
// 0.7.0 — launch-blocker-3-segment-activity-logging: NEW postSegmentActivity()
//         fire-and-forget beacon to POST /v1/ops/segment-activity for the
//         restore-pipeline per-share open-attempt audit log. Same sendBeacon
//         primitive + same swallow-on-failure shape as trackEvent — never
//         blocks the user. Body: { vaultId, shareIndex, result, attemptTs }.
//         No exclusion gate (admin's OWN restore attempts are operationally
//         interesting + we want them in the activity log too).
// 0.6.1 — F-13 (audit): documented that the ADDR_KEY ("noklock.addr") write
//         here is depended on by src/hooks/walletSession.ts → hasHadWallet()
//         as a fallback signal. DO NOT remove or rename without updating
//         walletSession.ts in lockstep. See the inline comment on ADDR_KEY
//         and on rememberConnectedWallet() below. (Superseded by 0.7.1 —
//         the string now lives in wallet-storage-keys.ts.)
// 0.6.0 — Partner-toolkit engagement events (Daniel): + community_owners_landing
//         (once per browser/day on /refer?tab=community-owners — direct or via
//         the /partners redirect), + partner_card_built (open-to-all cobrand
//         card downloaded/copied), + partner_contest_drafted (gated contest
//         card/playbook generated/copied). Fire-and-forget, same zero-PII rule
//         as the rest; new helper trackCommunityOwnersLandingOncePerDay() wraps
//         the new event in the same browser/day dedup the other landing
//         events use.
// 0.5.0 — NK9 zero-PII hardening: the page-view beacon sent the RAW pathname,
//         so dynamic routes leaked their identifier into the (route, day)
//         counter — most notably /nok-claim/<nonce> (the heir's claim TOKEN)
//         and /vault/<id>. normaliseRoute() now collapses dynamic segments to
//         placeholders (/nok-claim/:nonce, /vault/:id, /compare/:slug, plus a
//         defensive 0x-address / long-hex catch-all) BEFORE sending. Counts
//         stay meaningful per route; no token or per-vault id ever leaves the
//         browser. (Named events + src buckets were already PII-free.)
// 0.4.0 — FIX (Daniel: admin/treasury still counted on every refresh): the
//         exclusion never actually matched. getConnectedWalletLower() probed
//         wagmi's persisted store under the WRONG key — it looked for
//         "noklock.wagmi.store" (dot) etc., but main.tsx configures wagmi to
//         persist under "noklock-wagmi.store" (HYPHEN) — so it always returned
//         null and isExcluded() was always false. Now the React layer writes
//         the connected address to a simple "noklock.addr" key
//         (rememberConnectedWallet, called from TopNav; forgetConnectedWallet
//         on explicit disconnect) and the tracker reads THAT — reliable, no
//         wagmi-internals parsing. ALSO: page views were never gated (
//         ScrollToTop fired its own beacon) → new trackPageView() routes them
//         through isExcluded() too. So now ALL counters (page views,
//         unique_view, wallet_connect, free/paid vault, prove-it, etc.) honour
//         the exclude list. Default list refreshed to the current treasury +
//         admin + Daniel's test wallet.
// 0.3.0 — Analytics ops upgrade (Daniel 2026-05-22): + "wallet_connect" event
//         (fired at most once per browser/day when a wallet is connected; the
//         excluded admin/treasury wallets are suppressed by isExcluded() so
//         they don't inflate it) and a coarse `src` traffic-source sent ONCE
//         with unique_view — derived from document.referrer's HOST only
//         (mapped to an allow-listed src_* bucket; never a full URL). Still
//         zero-PII: the server only ever stores aggregate (key, day) integers.
// 0.2.0 — Daniel's launch-perfect ask: exclude the admin wallet from
//         site-visit / pwa_install / unique_view analytics so the counters
//         measure REAL users, not Daniel's own testing. He explicitly
//         wanted admin EXCLUDED from visit counts but INCLUDED in vault/
//         wallet/heir counts — those latter come from on-chain data and
//         aren't routed through this client beacon, so this exclusion
//         only touches the front-end "track-event" anonymous counter.
//         Implementation: read the connected wallet from localStorage's
//         wagmi persisted-state key + compare against an env-allow-listed
//         set of admin addresses. Synchronous, no React. Falls through
//         (and tracks normally) if anything is unparseable — never
//         suppresses non-admin traffic.
// 0.1.1 — + "paid_tier_use".
// 0.1.0 — WS-H zero-PII named-event beacon.
//
// Same primitive + same privacy rule as before: fire-and-forget, no
// cookies, no UA, no IP, no identifier. The server only ever stores an
// aggregate integer per (name, day) for an allow-listed set of names.

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

/// Optional VITE_ANALYTICS_EXCLUDE_WALLETS = "0xabc...,0xdef..." (comma sep,
/// case-insensitive) — addresses suppressed from the front-end beacons (page
/// views + named events). On-chain-derived counters (founder, referral) aren't
/// routed through these beacons. Defaults to the current treasury + admin +
/// Daniel's test wallet; .env.production overrides. See [[feedback-wallet-naming]].
const EXCLUDED_WALLETS: ReadonlySet<string> = (() => {
  const env = (import.meta.env.VITE_ANALYTICS_EXCLUDE_WALLETS as string | undefined)
    ?? "0x17322F0BCdc1c5a04518aAE817Fd84470F5A9A5d,0x8102bc92B1Dde90FaC1F2f47d34B3000396F9081,0x1496bEb61210F96F8491E08f71692b532cD0F68D";
  return new Set(env.split(",").map((s) => s.trim().toLowerCase()).filter((s) => /^0x[a-f0-9]{40}$/.test(s)));
})();

// CROSS-MODULE DEPENDENCY (F-13 audit, 2026-06-01; LOW-2 fix 2026-06-03):
//   src/hooks/walletSession.ts → hasHadWallet() READS this same key as a
//   fallback signal so the wallet-reconnect gate engages on cold load before
//   WalletSessionDriver has run its first effect. Renaming or removing this
//   key (or the writes in rememberConnectedWallet / forgetConnectedWallet
//   below) WILL silently break the reconnect UX.
//   As of 0.7.1 the key string lives in src/lib/wallet-storage-keys.ts so both
//   modules pull from one source — rename there and BOTH consumers update.
import { ADDR_KEY } from "./wallet-storage-keys.js";

/** Remember the connected wallet under a simple, reliable localStorage key so
 *  analytics exclusion works WITHOUT parsing wagmi internals. Called from the
 *  React layer (TopNav) whenever the account changes. Only ever SETS — a
 *  transient `undefined` during reconnect must NOT clear it (TopNav passes the
 *  address; the explicit-disconnect path calls forgetConnectedWallet).
 *
 *  DO NOT REMOVE the localStorage.setItem(ADDR_KEY, …) write below — see the
 *  ADDR_KEY comment above. walletSession.ts → hasHadWallet() depends on it. */
export function rememberConnectedWallet(addr?: string | null): void {
  try {
    if (typeof localStorage === "undefined") return;
    // DO NOT REMOVE noklock.addr write — read by walletSession.ts hasHadWallet().
    if (addr && /^0x[a-f0-9]{40}$/i.test(addr)) localStorage.setItem(ADDR_KEY, addr.toLowerCase());
  } catch { /* ignore */ }
}

/** Clear the remembered wallet — call on an EXPLICIT disconnect only. */
export function forgetConnectedWallet(): void {
  try { if (typeof localStorage !== "undefined") localStorage.removeItem(ADDR_KEY); } catch { /* ignore */ }
}

function getConnectedWalletLower(): string | null {
  if (typeof localStorage === "undefined") return null;
  // Primary, reliable source: the address the React layer wrote (see
  // rememberConnectedWallet). This is what makes the exclusion actually work
  // (the wagmi-store probe below used the wrong key shape historically).
  const direct = localStorage.getItem(ADDR_KEY);
  if (direct && /^0x[a-f0-9]{40}$/i.test(direct)) return direct.toLowerCase();
  // Fallback: best-effort probe of wagmi's persisted store (key shapes vary
  // across versions; our config uses "noklock-wagmi.store"). Safety net only.
  const candidates = ["noklock-wagmi.store", "noklock.wagmi.store", "wagmi.store", "noklock-wagmi", "noklock.wagmi", "wagmi"];
  for (const k of candidates) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      // Different wagmi versions nest the address under different paths.
      // Walk the common ones.
      const tryPaths: ReadonlyArray<(o: Record<string, unknown>) => unknown> = [
        (o) => (o.state as Record<string, unknown> | undefined)?.current,
        (o) => (((o.state as Record<string, unknown> | undefined)?.connections as Map<string, unknown> | undefined)?.values()?.next?.()?.value as { accounts?: readonly string[] } | undefined)?.accounts?.[0],
        (o) => (o as { current?: string }).current,
      ];
      for (const fn of tryPaths) {
        try {
          const v = fn(parsed);
          if (typeof v === "string" && /^0x[a-f0-9]{40}$/i.test(v)) return v.toLowerCase();
        } catch { /* keep trying */ }
      }
    } catch { /* keep trying next candidate */ }
  }
  return null;
}

function isExcluded(): boolean {
  const w = getConnectedWalletLower();
  return w !== null && EXCLUDED_WALLETS.has(w);
}

export type TrackEventName =
  | "pwa_install"
  | "free_tier_use"
  | "paid_tier_use"
  | "prove_it_run"
  | "prove_airgap_run"   // 0.x — /prove-it/airgap test-fire panel used
  | "how_it_works_run"
  | "unique_view"
  | "wallet_connect"
  | "restore_run"      // a Restore drill actually completed (vault rebuilt in-browser)
  | "enrol_started"    // the user entered the Enrol wizard for any kind
  | "referral_visit"   // a ?ref=<addr> link was visited (referral link → site conversion)
  | "terms_accepted"   // the first-wallet-connect Terms modal was accepted
  | "community_owners_landing"  // once-per-browser/day on /refer?tab=community-owners (incl. /partners redirect)
  | "partner_card_built"        // a cobrand card PNG was downloaded or copied (open-to-all builder)
  | "partner_contest_drafted"   // a Refer & Share contest card or playbook was generated/copied (gated builder)
  // 0.8.0 — TRACTION events (Daniel 2026-06-15: "count anything and everything").
  // These measure REAL adoption, including FREE-tier vaults that mint nothing
  // on-chain. vault_created / enrol_completed / nok_designated fire while a user
  // may still be AIRGAPPED — so they go through trackEventDurable() (localStorage
  // queue + replay on reconnect), not the plain fire-and-forget beacon.
  | "vault_created"     // a vault was actually written to disk (any tier; airgap-durable)
  | "enrol_completed"   // the Enrol wizard reached a stored vault (funnel pair to enrol_started)
  | "restore_failed"    // a Restore/HeirRestore drill ended in failure (complements restore_run)
  | "heartbeat_ping"    // the user proved liveness from the app (once/day)
  | "nok_designated"    // a next-of-kin was designated (fires app-side, before the indexer sees the mint)
  // 0.9.0 — per-STEP enrol funnel checkpoints (Daniel 2026-06-15: "add the
  // instrumentation to the levels that you can"). Fire once per step per session
  // (dedup'd in Enrol via a ref). Several fire while the user is AIRGAPPED →
  // trackEventDurable, so a bail mid-flow is still captured on the next online
  // boot. Lets the Admin funnel pinpoint WHERE 15-started→0-completed leaks.
  | "enrol_reached_airgap"   // reached the "go offline" step
  | "enrol_reached_content"  // reached secret-entry (offline)
  | "enrol_reached_shares"   // reached "store share locations" (the distribute step)
  | "enrol_reached_drill"    // reached the test-restore drill
  | "enrol_reached_nok";     // reached next-of-kin designation

export function trackEvent(name: TrackEventName, extra?: { readonly src?: string }): void {
  if (isExcluded()) return;
  try {
    const body = JSON.stringify(extra?.src ? { name, src: extra.src } : { name });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(`${API_BASE}/track/event`, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(`${API_BASE}/track/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      mode: "cors",
    }).catch(() => { /* swallow — analytics must never break UX */ });
  } catch {
    /* swallow */
  }
}

// ── 0.8.0 Offline-durable event queue ──────────────────────────────────────
// sendBeacon silently DROPS when the browser is offline — which is exactly the
// airgap state in which a user stores a vault or designates an heir. So the
// traction-critical events (vault_created, enrol_completed, nok_designated)
// are ALSO stashed in a tiny localStorage queue and replayed when connectivity
// returns (the 'online' event + every app boot). Each entry is just the bare
// event name + a local timestamp — nothing identifying; the server still only
// stores an aggregate (name, day) integer. At-most-once is NOT guaranteed (a
// crash mid-flush could double-count by 1) — fine for a coarse traction
// counter, and we never UNDER-count a real action, which is the point.
const EVENT_QUEUE_KEY = "noklock.evtq";
const EVENT_QUEUE_MAX = 200; // hard cap so a permanently-offline browser can't grow it unbounded

interface QueuedEvent { readonly name: TrackEventName; readonly src?: string; readonly t: number; }

function readEventQueue(): QueuedEvent[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(EVENT_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return (parsed as QueuedEvent[]).filter((e) => e && typeof e.name === "string").slice(-EVENT_QUEUE_MAX);
  } catch { return []; }
}

function writeEventQueue(q: readonly QueuedEvent[]): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify(q.slice(-EVENT_QUEUE_MAX)));
    }
  } catch { /* ignore */ }
}

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Fire a traction event that MUST survive being created OFFLINE (airgap).
 *  When online it's a normal beacon; when offline it's queued and replayed on
 *  the next reconnect / app boot. Excluded wallets are suppressed either way. */
export function trackEventDurable(name: TrackEventName, extra?: { readonly src?: string }): void {
  if (isExcluded()) return;
  if (!isOffline()) { trackEvent(name, extra); return; }
  try {
    const q = readEventQueue();
    q.push({ name, src: extra?.src, t: Date.now() });
    writeEventQueue(q);
  } catch { /* swallow — never break the airgap flow */ }
}

/** Replay any queued offline events. Called on app boot + on every 'online'.
 *  Clears the queue BEFORE sending so a send-failure doesn't loop forever
 *  (coarse counter — a dropped replay just under-counts by the queued amount,
 *  which is the rare case; the common path is a successful flush). */
export function flushPendingEvents(): void {
  if (isOffline()) return;
  const q = readEventQueue();
  if (q.length === 0) return;
  writeEventQueue([]);
  for (const e of q) {
    if (isExcluded()) continue;
    trackEvent(e.name, e.src ? { src: e.src } : undefined);
  }
}

// Wire the auto-flush exactly once (idempotent against HMR / double-import).
// Call from app startup (main.tsx). Flushes immediately on install too, so a
// vault stored offline in a previous session is counted as soon as the app
// next boots online.
let offlineFlushWired = false;
export function installOfflineEventFlush(): void {
  if (offlineFlushWired) return;
  offlineFlushWired = true;
  try {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => flushPendingEvents());
      flushPendingEvents();
    }
  } catch { /* ignore */ }
}

// Coarse traffic source from document.referrer's HOST only — never a full URL,
// path, or query. Same-origin (internal navigation) → "src_direct" so we don't
// double-count our own pages. Maps to the SOURCE_ALLOWLIST in Form B's
// analytics.ts; anything unmatched is "src_other". (More-specific subdomains
// like gemini.google.com are checked before the generic google rule.)
function deriveSource(): string {
  if (typeof document === "undefined") return "src_direct";
  const ref = document.referrer;
  if (!ref) return "src_direct";
  // Google Play app (Trusted Web Activity): Android sets document.referrer to
  // android-app://<package>. Attribute our TWA (app.noklock.twa) as the Play
  // app so launches from the installed Android app show as their own source.
  if (ref.startsWith("android-app://")) {
    return ref.includes("app.noklock.twa") ? "src_google_app" : "src_android_app";
  }
  let host: string;
  try { host = new URL(ref).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return "src_other"; }
  if (typeof location !== "undefined" && host === location.hostname.toLowerCase().replace(/^www\./, "")) {
    return "src_direct";
  }
  const map: readonly (readonly [RegExp, string])[] = [
    [/(^|\.)gemini\.google\.com$/, "src_gemini"],
    [/(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com)$/, "src_chatgpt"],
    [/(^|\.)claude\.ai$/, "src_claude"],
    [/(^|\.)perplexity\.ai$/, "src_perplexity"],
    [/(^|\.)google\./, "src_google"],
    [/(^|\.)bing\.com$/, "src_bing"],
    [/(^|\.)duckduckgo\.com$/, "src_duckduckgo"],
    [/(^|\.)yahoo\./, "src_yahoo"],
    [/(^|\.)(twitter\.com|x\.com|t\.co)$/, "src_twitter"],
    [/(^|\.)reddit\.com$/, "src_reddit"],
    [/(^|\.)(facebook\.com|fb\.com)$/, "src_facebook"],
    [/(^|\.)linkedin\.com$/, "src_linkedin"],
    [/(^|\.)instagram\.com$/, "src_instagram"],
    [/(^|\.)(youtube\.com|youtu\.be)$/, "src_youtube"],
    [/(^|\.)github\.com$/, "src_github"],
    [/(^|\.)(t\.me|telegram\.org)$/, "src_telegram"],
    [/(^|\.)discord(app)?\.(com|gg)$/, "src_discord"],
    [/(^|\.)medium\.com$/, "src_medium"],
  ];
  for (const [re, src] of map) if (re.test(host)) return src;
  return "src_other";
}

/** Fire a named event at most once per browser per UTC day, under a given
 *  localStorage day-flag key. The dedup is purely local; only the anonymous
 *  +1 leaves the browser. Excluded wallets are suppressed by trackEvent. */
function trackOncePerDay(flag: string, name: TrackEventName, extra?: { readonly src?: string }): void {
  try {
    if (typeof localStorage === "undefined") return;
    const ymd = new Date().toISOString().slice(0, 10);
    const key = `${flag}.${ymd}`;
    if (localStorage.getItem(key) === "1") return;
    // Suppress (and don't burn the day-flag) for excluded wallets, so a real
    // user on the same browser later in the day is still counted.
    if (isExcluded()) return;
    localStorage.setItem(key, "1");
    trackEvent(name, extra);
  } catch {
    /* private mode / storage disabled → just skip (never throw) */
  }
}

// Fire "unique_view" (with the coarse traffic source) once per browser/day.
export function trackUniqueViewOncePerDay(): void {
  trackOncePerDay("noklock.seen", "unique_view", { src: deriveSource() });
}

// Fire "wallet_connect" once per browser/day — call it when a wallet becomes
// connected (auto-reconnect on every load would otherwise inflate it). The
// excluded admin/treasury wallets are suppressed (isExcluded reads the
// remembered account), so this counts real users connecting.
export function trackWalletConnectOncePerDay(): void {
  trackOncePerDay("noklock.wconn", "wallet_connect");
}

// 0.8.0 — Fire "heartbeat_ping" once per browser/day when the user proves
// liveness from the app (signed-and-posted OR on-chain selfHeartbeat). Both
// paths require network, so plain once/day (no durable queue needed). Counts
// how many distinct active owners exercise the dead-man's-switch liveness path.
export function trackHeartbeatPingOncePerDay(): void {
  trackOncePerDay("noklock.hbping", "heartbeat_ping");
}

// Fire "community_owners_landing" once per browser/day — call it when the user
// LANDS on /refer?tab=community-owners (direct, via /partners redirect, or via
// the subtab switch from /refer's Earn referrals tab). Daily dedup so a
// partner refreshing the page doesn't inflate the count.
export function trackCommunityOwnersLandingOncePerDay(): void {
  trackOncePerDay("noklock.co.landing", "community_owners_landing");
}

// Collapse dynamic path segments to placeholders so no per-vault id or heir
// claim token ever leaves the browser. Keeps per-route counts meaningful.
export function normaliseRoute(path: string): string {
  return path
    .replace(/^\/nok-claim\/[^/]+/, "/nok-claim/:nonce")
    .replace(/^\/vault\/[^/]+/, "/vault/:id")
    .replace(/^\/compare\/[^/]+/, "/compare/:slug")
    // defensive catch-alls for anything else id-shaped in a path segment
    .replace(/\/0x[a-fA-F0-9]{6,}/g, "/:addr")
    .replace(/\/[A-Za-z0-9_-]{24,}/g, "/:id");
}

/** 0.7.0 — launch-blocker-3-segment-activity-logging: per-share open-attempt
 *  audit beacon. Called by restore-pipeline after the AEAD-decrypt loop —
 *  one call per tampered share index + one 'ok' summary on a clean unlock.
 *  Fire-and-forget; never throws; never blocks. Form B side rate-limits to
 *  100 events/vault/hour. */
export type SegmentActivityResult = "ok" | "tamper" | "aad_mismatch" | "manifest_invalid";

export function postSegmentActivity(args: {
  readonly vaultId: string;
  readonly shareIndex: number;
  readonly result: SegmentActivityResult;
  readonly attemptTs?: number;
}): void {
  try {
    const body = JSON.stringify({
      vaultId: args.vaultId,
      shareIndex: args.shareIndex,
      result: args.result,
      attemptTs: args.attemptTs ?? Math.floor(Date.now() / 1000),
    });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(`${API_BASE}/ops/segment-activity`, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(`${API_BASE}/ops/segment-activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      mode: "cors",
    }).catch(() => { /* swallow — audit beacon must never break Restore */ });
  } catch {
    /* swallow */
  }
}

// Page-view beacon (POST /v1/track { route }). Fired on every route change by
// ScrollToTop. Gated by isExcluded() so admin/treasury/test wallets don't
// inflate page-view counts (this was previously un-gated). Zero-PII: body is
// the route with dynamic segments normalised away; Form B increments a
// (route, day) integer.
export function trackPageView(route: string): void {
  if (isExcluded()) return;
  try {
    const body = JSON.stringify({ route: normaliseRoute(route) });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(`${API_BASE}/track`, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(`${API_BASE}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      mode: "cors",
    }).catch(() => { /* swallow — analytics must never break navigation */ });
  } catch {
    /* swallow */
  }
}
