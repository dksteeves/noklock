// @version 0.11.0 @date 2026-06-10
// 0.11.0 — Daniel 2026-06-10: NEW "Get the Android app" card near the bottom
//          of Settings, gated by PLAY_STORE_AVAILABLE (lib/playStore.ts) so
//          it renders ONLY once the Google Play listing is live. One line
//          + the official Play badge linking to PLAY_STORE_URL. Flag off by
//          default → Vite DCE strips the whole block from the flag-off dist.
//          Also pulled `t` into the Settings() destructure for the new keys
//          (settings.getAndroidApp.title / .body).
// @version 0.10.1 @date 2026-06-10
// 0.10.1 — Daniel 2026-06-10: fix nested-read bug in RefundRequestButton.
//          0.9.0 read body.paymentMethod (top-level) which is ALWAYS
//          undefined — the field lives at body.subscription.payment_method
//          (per the Refund.tsx 0.4.2 fix that diagnosed the same root cause).
//          The bug meant RefundRequestButton never rendered for any Paddle
//          user. Fixed to read from the nested envelope, matching the pattern
//          in Refund.tsx lines 344-346.
// 0.10.0 — Daniel handoff §3.6 2026-06-07: reframe the storage panel for the
//          simple-vs-max-security split. Header "Cloud storage" → "Share
//          storage" (provider-agnostic — local folders qualify). New lead
//          sentence pinned at the top of the panel body: "Simple route: any
//          three folders on your own devices is already a valid setup — no
//          signups required. Maximum security: spread across the providers
//          below." Provider grid below kept verbatim as the max-route
//          how-to. Matches the simple-vs-max framing now woven through
//          Landing 0.22.0 / Enrol Step B / Pricing FAQ / CryptoInheritance.
// 0.9.0 — Daniel 2026-06-03: surface a "Request refund" CTA on the
//         Subscription card for fiat (Paddle) purchases that are still
//         inside the statutory 14-day cooling-off window AND haven't been
//         requested yet. Rendered BELOW <SubscriptionStatusCard/> as a
//         secondary button + helper line linking to /refund-policy, and
//         routes to /refund (the existing wallet-gated refund flow lives
//         there — see routes/Refund.tsx 0.1.0). Self-contained: fetches
//         /v1/billing/subscription-state on the connected wallet, hides
//         entirely when wallet disconnected / not Paddle / window has
//         closed / refund already in flight. Hook intentionally inline
//         so this round is a one-file delta — promote to a shared hook
//         when a second surface needs the same shape.
// 0.8.0 — Daniel Q13 2026-06-02: skip NowPayments v1 for crypto-native
//         lifetime payments. Mounted <UsdcLifetimePayment/> directly below
//         <SubscriptionStatusCard/> so a crypto-native user who's already
//         scanning their subscription state sees the "pay lifetime in USDC
//         directly to treasury" path next. The card is self-contained
//         (env-sourced treasury, on-chain priceFor read, tx-hash paste +
//         on-chain verify, honest "pending manual grant" message). Full
//         grant-after-verify automation lands with the managed-wallet
//         billing integration (PWA v0.6) — captured in the component header.
// 0.7.0 — Off-chain subscription pipe (Daniel-locked 2026-06-02). Mounted
//         <SubscriptionStatusCard/> directly under the Day-1 honest note,
//         ABOVE Vault defaults so the off-chain Paddle subscription state
//         (active / expires-in-N-days / lapsed / lifetime) is the first
//         thing the user sees on Settings. Includes a "Renew now" CTA when
//         expires within 14 days OR status=lapsed (placeholder Paddle URLs
//         until VITE_PADDLE_CHECKOUT_URL + VITE_PADDLE_CUSTOMER_PORTAL_URL
//         are configured). Sits alongside the existing on-chain NFT — the
//         component reads useTierGate which does the off-chain lapse check.
// 0.6.0 — Daniel 2026-06-02: Reorg pass. Project-meta surfaces — NoKLock
//         updates / Privacy / System status / About — REMOVED from Settings
//         and MOVED VERBATIM to Info → About NoKLock (Info.tsx, NEW first
//         tab in the Info sub-menu). Settings is now strictly user-tunable
//         state (vault defaults, alerts, cloud, share URLs). NEW Day-1
//         honest note card pinned at the TOP of Settings (was only on /
//         Landing — Daniel asked for it here too, near the top, so users
//         hitting Settings see the same expectations-setting framing). The
//         banner's flag-gating + dismiss/forever logic is duplicated as a
//         self-contained component so Settings doesn't import a Landing
//         internal. Content moved to Info → About NoKLock per Daniel
//         2026-06-02 — see Info.tsx 0.7.6 for the receiving section.
// 0.5.4 — Mounted <SystemStatus/> directly above About: a curated, PUBLIC,
//         non-sensitive "don't trust, verify" strip (build, 5 verified
//         contracts link, on-chain/Chainlink statement, real /v1/health
//         "Operational" ping, last-update date). Veracity-guarded: never a
//         false green, never exposes LINK/queue/secret internals.
// 0.5.3 — AboutBox corrected post-launch: deploy date now reflects the live
//         5-contract bundle (2026-05-22, was the superseded 4-contract
//         2026-05-15 set — see version.ts), and the "Live contracts" list
//         now shows ALL FIVE (added Recovery + Escrow; was License/SBT/
//         Oracle only). Rows refactored into one map.
// 0.5.2 — Share-URL store helpers extracted to lib/shareUrls.ts (shared
//         with the new per-vault page — one implementation). The Settings
//         "Share URLs" section is now a COMPACT index: each vault links
//         to /vault/:id where its URLs + next-of-kin are managed. Kills
//         the unusable long inline list (Daniel).
// 0.5.1 — i18n: the 3 "What is …?" expander labels + bodies now localize
//         via localizeTip (translated in non-English, English fallback).
// 0.5.0 — VERACITY: "NoKLock updates" card was a placeholder fake — it
//         fetched a non-existent /adapter-pack/latest endpoint, "Apply
//         update" only wrote a localStorage string (admitted placeholder),
//         and the copy claimed NoKLock ships hardware-wallet
//         "compatibility packs" (no such integration exists). Replaced
//         with a truthful card: NoKLock is a PWA and auto-updates; HW
//         wallets work via MetaMask/Trust/WalletConnect (vendor-maintained,
//         no NoKLock pack). Removed ADAPTER_PACK_KEY + fake fetch/apply.
// 0.4.2 — Stale API fallback fixed: tenza.one/wp-json/soulchain -> the
//         correct api.noklock.app/v1 (prod uses VITE_API_BASE_URL anyway;
//         this was a wrong/old default). No behaviour change in prod.
// 0.4.1 — Vault defaults card moved to TOP (above Cloud storage) per Daniel.
//         Order: Vault defaults → Cloud storage → Share URLs → updates →
//         Privacy → About. No logic change, pure reorder.
// 0.4.0 — Round 3 polish: inline-help <details> expanders for each vault
//         default (plain-English explanations of threshold / total /
//         grace period); Privacy card rewrite + link to /privacy; new
//         AboutBox card at bottom (public version, build hash, deploy date,
//         live mainnet contract addresses linked to PolygonScan).
// 0.3.0 — Provider link text "open" not "sign up". New "Manage share URLs"
//         card lists URLs from localStorage so the user can review/copy them
//         without re-running Enrol.
// 0.2.0 — share-link era. Cloud OAuth removed.
//
// PWA Settings — share-link era. Cloud OAuth is gone; this page is now
// almost entirely informational:
//   1. Recommended providers (link out to Help)
//   2. Vault defaults (with inline help)
//   3. Privacy — current back-end URL + privacy posture link
//   4. About — version + build + on-chain contracts
//
// Nothing here causes any cloud-provider account to be created or accessed.
// All cloud account lifecycle is the user's responsibility outside NoKLock.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { useT } from "../i18n/index.js";
import { localizeTip } from "../i18n/tooltips.js";
import { PROVIDERS } from "@soulchain/storage-adapters";
import { readStoredShareUrls } from "../lib/shareUrls.js";
import { PLAY_STORE_AVAILABLE } from "../lib/playStore.js";
import { PlayBadge } from "../components/PlayBadge.js";
import { HeartbeatReminderCard } from "../components/HeartbeatReminderCard.js";
import { ChainlinkUpkeepStatus } from "../components/ChainlinkUpkeepStatus.js";
import { SubscriptionStatusCard } from "../components/SubscriptionStatusCard.js";
import { UsdcLifetimePayment } from "../components/UsdcLifetimePayment.js";
import { useFlag } from "../hooks/useFlag.js";
// 0.6.0 — NoKLock updates / Privacy / System status / About were moved
// from this page to Info → About NoKLock (see Info.tsx 0.7.6). The
// imports that ONLY served those four cards (PUBLIC_VERSION / DEPLOY_DATE
// / getBuildHash / all contract addresses / PATENT_DESCRIPTION /
// useLivePatentLeader / SystemStatus / BRAND_NAME) were dropped here and
// re-introduced inside Info.tsx where the AboutBox now lives.

const PREFS_KEY = "soulchain.prefs";
interface Prefs {
  readonly defaultThreshold: number;
  readonly defaultTotal: number;
  readonly defaultGraceDays: number;
}
const PREFS_DEFAULTS: Prefs = { defaultThreshold: 3, defaultTotal: 5, defaultGraceDays: 60 };

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return PREFS_DEFAULTS;
    return { ...PREFS_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return PREFS_DEFAULTS;
  }
}

function writePrefs(p: Prefs): void {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function Settings(): JSX.Element {
  const { lang, t } = useT();
  const [prefs, setPrefs] = useState<Prefs>(() => readPrefs());
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function savePrefs(): void {
    writePrefs(prefs);
    setSavedAt(Date.now());
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-display"><span className="grad">Settings</span></h1>
        <p className="text-text-muted text-sm mt-2">
          Everything on this page lives in your browser's localStorage. None of it leaves your device.
        </p>
      </header>

      {/* 0.6.0 — Day-1 honest note pinned to the top of Settings (Daniel
          2026-06-02). Same content / dismiss model as the landing-page
          banner — own dismiss key so dismissing one place doesn't
          dismiss the other. Project-meta surfaces (Updates / Privacy /
          System status / About) have been moved out of Settings to
          Info → About NoKLock — see Info.tsx 0.7.6. */}
      <Day1HonestNoteCard />

      {/* 0.7.0 — Off-chain subscription state (Daniel-locked 2026-06-02).
          Surfaces tier + status (Active / Expires in N days / Lapsed /
          Lifetime) + "Renew now" + Paddle billing portal links. Sits
          ABOVE Vault defaults so it's the first user-tunable surface
          they see after the day-1 banner. */}
      <SubscriptionStatusCard />

      {/* 0.9.0 — Daniel 2026-06-03: in-window refund CTA for fiat (Paddle)
          purchases. Self-gating: renders only when payment_method=paddle,
          now < refund_eligible_until, and refund_status=none. Hidden
          entirely otherwise — quiet by default. */}
      <RefundRequestButton />

      {/* 0.8.0 — Daniel Q13 2026-06-02: crypto-native direct-USDC lifetime
          payment path. Sits right below the subscription status so a user
          who's already looking at their subscription state can opt out of
          managed billing entirely and pay once on-chain. Self-contained:
          on-chain priceFor read, treasury wallet from env, tx-hash paste
          + verify. Full grant-after-verify automation lands in PWA v0.6. */}
      <UsdcLifetimePayment />

      <div className="card">
        <h2 className="font-bold font-display mb-3">Vault defaults</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm text-text-muted">Default threshold</span>
            <input type="number" min={2} max={9} value={prefs.defaultThreshold}
              onChange={(e) => setPrefs({ ...prefs, defaultThreshold: Math.max(2, Math.min(9, parseInt(e.target.value || "3", 10))) })}
              className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
            <details className="mt-1">
              <summary className="text-xs text-accent-cyan cursor-pointer hover:underline">{localizeTip(lang, "What is threshold?")}</summary>
              <p className="text-xs text-text-muted mt-1" lang={lang === "zh-Hans" ? "zh" : lang}>
                {localizeTip(lang, "The minimum number of shares needed to reconstruct your secret. With threshold 3 and 5 total shares, any 3 of the 5 can rebuild your seed — but 2 alone are mathematically useless. Higher threshold = harder to lose AND harder to recover. 3 is the standard recommendation.")}
              </p>
            </details>
          </label>
          <label className="block">
            <span className="text-sm text-text-muted">Default total shares</span>
            <input type="number" min={3} max={9} value={prefs.defaultTotal}
              onChange={(e) => setPrefs({ ...prefs, defaultTotal: Math.max(3, Math.min(9, parseInt(e.target.value || "5", 10))) })}
              className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
            <details className="mt-1">
              <summary className="text-xs text-accent-cyan cursor-pointer hover:underline">{localizeTip(lang, "What is total shares?")}</summary>
              <p className="text-xs text-text-muted mt-1" lang={lang === "zh-Hans" ? "zh" : lang}>
                {localizeTip(lang, "How many encrypted shares your secret gets split into. More shares = more redundancy (e.g. spread across 5 cloud providers in 5 jurisdictions) but more places to manage. Total must be greater than threshold. 5 is the standard recommendation; up to 9 supported.")}
              </p>
            </details>
          </label>
          <label className="block">
            <span className="text-sm text-text-muted">Default grace period (days)</span>
            <input type="number" min={7} max={365} value={prefs.defaultGraceDays}
              onChange={(e) => setPrefs({ ...prefs, defaultGraceDays: Math.max(7, Math.min(365, parseInt(e.target.value || "60", 10))) })}
              className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
            <details className="mt-1">
              <summary className="text-xs text-accent-cyan cursor-pointer hover:underline">{localizeTip(lang, "What is grace period?")}</summary>
              <p className="text-xs text-text-muted mt-1" lang={lang === "zh-Hans" ? "zh" : lang}>
                {localizeTip(lang, "How long the dead-man's-switch waits before activating your NoK inheritance. If you stop sending heartbeats (signing into the app or signing an on-chain heartbeat tx) for longer than this, your designated NoK can claim your vault. 60 days is the default — short enough to be useful, long enough to survive holidays / illness. You choose, from 1 day to 10 years. Set it yourself on the Heartbeat page (it's an on-chain setting — no NoKLock server involved).")}
              </p>
            </details>
          </label>
        </div>
        <button className="btn btn-secondary text-sm mt-4" onClick={savePrefs}>
          {savedAt && Date.now() - savedAt < 3000 ? "Saved ✓" : "Save defaults"}
        </button>
      </div>

      <div className="card">
        <h2 className="font-bold font-display mb-1">Live-Man's Switch — alerts</h2>
        <p className="text-text-on-dark/80 text-sm">Get warned out-of-band if a recovery is ever started against your wallet, so you can cancel it in time. Register the wallet(s) you watch (and an optional email) on its own page.</p>
        <Link to="/live-mans-switch" className="btn btn-secondary text-sm mt-3 inline-block">Open Live-Man's Switch →</Link>
      </div>

      <HeartbeatReminderCard />

      {/* Keep-the-automation-funded widget (Daniel 2026-06-15). The dead-man's
          switch is fired by a Chainlink Automation upkeep that runs on LINK.
          Surfacing the live balance to users means anyone — not just NoKLock —
          can keep it topped up, permissionlessly, so it never silently dies. */}
      <div className="card">
        <h2 className="font-bold font-display mb-1">Keep the dead-man's switch funded</h2>
        <p className="text-text-on-dark/80 text-sm mb-3">
          Your inheritance fires through a <strong>Chainlink Automation</strong> upkeep that runs on LINK. It's funded by
          NoKLock today — but Chainlink is permissionless, so <strong>anyone can top it up</strong>. This is the live balance;
          if it ever runs low, the community (or you) can refill it directly, no NoKLock servers involved.
        </p>
        <ChainlinkUpkeepStatus />
      </div>

      <div className="card">
        <h2 className="font-bold font-display mb-3">Share storage</h2>
        <p className="text-text-on-dark/80 text-sm mb-3">
          <strong>Simple route:</strong> any three folders on your own devices is already a valid setup — no signups required. <strong>Maximum security:</strong> spread across the providers below.
        </p>
        <p className="text-text-on-dark/80 text-sm mb-3">
          NoKLock doesn't connect to your cloud accounts. You upload your encrypted share files manually to any provider you trust, set the file to <strong>"anyone with the link"</strong>, and paste the share URL during enrolment. NoKLock stores the URL — nothing else.
        </p>
        <p className="text-text-on-dark/80 text-sm mb-3">Recommended providers (any of these work — pick 3+ from different countries for the strongest geographic spread):</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {PROVIDERS.slice(0, 6).map((p) => (
            <a key={p.id} href={p.signupUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded border border-bg-surface hover:border-accent-cyan transition-colors">
              <div className="font-bold">{p.displayName} <span className="text-xs text-text-muted">· {p.freeQuota} free · {p.jurisdiction}</span> <span className="text-accent-cyan text-xs">open →</span></div>
            </a>
          ))}
        </div>
        <div className="mt-3">
          <Link to="/info?tab=shares" className="text-sm text-accent-cyan hover:underline">See all 10 providers + how to share-link them →</Link>
        </div>
      </div>

      <ShareUrlManager />

      {/* 0.11.0 — Daniel 2026-06-10: "Get the Android app" card, gated by
          PLAY_STORE_AVAILABLE so it renders ONLY once the Play listing is
          live (flag off by default → Vite strips this entire block from the
          flag-off dist). Near the bottom, after the user-tunable cards. */}
      {PLAY_STORE_AVAILABLE && (
        <div className="card">
          <h2 className="font-bold font-display mb-2">{t("settings.getAndroidApp.title", "Get the Android app")}</h2>
          <p className="text-text-on-dark/80 text-sm mb-3">
            {t("settings.getAndroidApp.body", "Install NoKLock from Google Play for a home-screen app — same site, fullscreen, auto-updates.")}
          </p>
          <Link
            to="/download"
            className="inline-block"
            aria-label={t("settings.getAndroidApp.title", "Get the Android app")}
          >
            <PlayBadge className="h-12" />
          </Link>
        </div>
      )}

      {/* 0.6.0 — Project-meta surfaces (NoKLock updates / Privacy /
          System status / About) moved verbatim to Info → About NoKLock
          per Daniel 2026-06-02. See Info.tsx 0.7.6 for the receiving
          tab. Settings is now strictly user-tunable state. */}
      <div className="card border-bg-surface/40">
        <p className="text-sm text-text-muted">
          Looking for app updates, the privacy notice, system status, or version &amp; contract info?{" "}
          <Link to="/info?tab=about" className="text-accent-cyan hover:underline">
            Info → About NoKLock →
          </Link>
        </p>
      </div>
    </div>
  );
}

// 0.6.0 — Day-1 honest note for the Settings page (Daniel 2026-06-02).
// Self-contained so this route does not import a Landing internal: same
// flag-gated visibility + dismiss-this-session + dismiss-forever model
// as the landing-page LaunchTransparencyBanner, with its OWN dismiss
// keys so a dismissal here doesn't dismiss the landing copy (and vice
// versa). Falls silent after 90 days post-launch like the landing copy.
const DAY1_SETTINGS_LAUNCH_DATE = new Date("2026-05-21").getTime();
const DAY1_SETTINGS_SHOW_UNTIL = DAY1_SETTINGS_LAUNCH_DATE + 90 * 24 * 60 * 60 * 1000;
const DAY1_SETTINGS_DISMISS_SESSION_KEY = "noklock.settings-day1-dismissed-session-v1";
const DAY1_SETTINGS_DISMISS_FOREVER_KEY = "noklock.settings-day1-dismissed-forever-v1";
const DAY1_SETTINGS_FLAG_KEY = "noklock.launch-banner.enabled"; // shares Landing's admin toggle

function Day1HonestNoteCard(): JSX.Element | null {
  const enabledFlag = useFlag(DAY1_SETTINGS_FLAG_KEY, "true");
  const [dismissedSession, setDismissedSession] = useState<boolean>(() => {
    try { return typeof localStorage !== "undefined" && localStorage.getItem(DAY1_SETTINGS_DISMISS_SESSION_KEY) === "1"; }
    catch { return false; }
  });
  const [dismissedForever, setDismissedForever] = useState<boolean>(() => {
    try { return typeof localStorage !== "undefined" && localStorage.getItem(DAY1_SETTINGS_DISMISS_FOREVER_KEY) === "1"; }
    catch { return false; }
  });
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(t); }, []);

  if (enabledFlag.value === "false") return null;
  if (dismissedForever) return null;
  if (dismissedSession) return null;
  if (now > DAY1_SETTINGS_SHOW_UNTIL) return null;

  return (
    <div className="card border-accent-teal/50 bg-gradient-to-br from-bg-panel via-bg-panel to-amber-900/10">
      <div className="flex items-start gap-3">
        <span className="tier-badge bg-amber-600/30 text-amber-300 border border-amber-500/40 shrink-0">Day-1 honest note</span>
        <div className="flex-1 text-sm">
          <p className="text-text-on-dark/90">
            <strong>NoKLock just launched.</strong> Look around: we've audited the contracts, run the tests (154/154 on Solidity 0.8.35) and put the source through multiple independent AI review passes from two distinct sources — and shipped what we believe is solid. The first weeks of a real product still reveal subjective rough edges, copy that doesn't land for everyone, UX flows we hadn't considered. Anticipate that. <strong>Tell us when you find it.</strong>
          </p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <Link to="/info?tab=contracts#bug-bounty" className="text-accent-green hover:underline font-semibold">Technical bug? Bounty programme →</Link>
            <Link to="/info?tab=faq" className="text-accent-cyan hover:underline">Rough edge / improvement? FAQ + how to tell us →</Link>
            <a href="mailto:hello@noklock.app?subject=Feedback%20from%20%2Fsettings" className="text-accent-cyan hover:underline">Direct email →</a>
            <button
              type="button"
              onClick={() => {
                try { localStorage.setItem(DAY1_SETTINGS_DISMISS_FOREVER_KEY, "1"); } catch { /* ignore */ }
                setDismissedForever(true);
              }}
              className="text-text-muted hover:text-text-on-dark underline"
              title="Permanently hide on this browser. Clear browser data to re-show."
            >
              Dismiss forever
            </button>
          </div>
        </div>
        <button
          onClick={() => { try { localStorage.setItem(DAY1_SETTINGS_DISMISS_SESSION_KEY, "1"); } catch { /* ignore */ } setDismissedSession(true); }}
          className="text-text-muted hover:text-text-on-dark text-xs shrink-0"
          aria-label="Dismiss launch banner (this session)"
          title="Dismiss for now"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// 0.6.0 — AboutBox / AboutPatentLine MOVED to Info.tsx (Info → About
// NoKLock tab) per Daniel 2026-06-02. Same JSX, same imports, just hosted
// on the project-meta tab where they belong instead of Settings.

// 0.9.0 — Daniel 2026-06-03: refund-request CTA for fiat (Paddle) buyers
// inside the 14-day cooling-off window. Reads /v1/billing/subscription-state
// for the connected wallet (same endpoint as routes/Refund.tsx) and gates
// on the exact triple: payment_method === "paddle" AND
// now < refund_eligible_until AND refund_status === "none". Anything else
// renders nothing — silent surface, no "ineligible" copy on the settings
// page (the /refund route owns that messaging). Hook is intentionally inline
// for this round; promote to hooks/useSubscriptionState.ts when a second
// caller needs the same shape.
const REFUND_API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "https://api.noklock.app").replace(/\/+$/, "");

interface RefundGateSubscription {
  readonly payment_method: "paddle" | "crypto" | null;
  readonly refund_eligible_until: number | null;
  readonly refund_status: "none" | "pending" | "approved" | "rejected" | "refunded";
}

function RefundRequestButton(): JSX.Element | null {
  const { address, isConnected } = useAccount();
  const [subscription, setSubscription] = useState<RefundGateSubscription | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setSubscription(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch(
          `${REFUND_API_BASE}/v1/billing/subscription-state?wallet=${encodeURIComponent(address)}`,
        );
        if (!r.ok) {
          if (!cancelled) setSubscription(null);
          return;
        }
        // 0.10.1 fix: payment_method is NESTED at body.subscription.payment_method,
        // not at the top-level body.paymentMethod. The Refund.tsx 0.4.2 fix
        // diagnosed the same root cause — the server returns the subscription
        // scalars inside a `subscription` envelope. body.refundEligibleUntil
        // and body.refundStatus remain top-level (server billing.ts confirmed).
        const body = (await r.json()) as {
          subscription?: { payment_method?: "paddle" | "crypto" | null };
          refundEligibleUntil?: number | null;
          refundStatus?: "none" | "pending" | "approved" | "rejected" | "refunded";
        };
        if (cancelled) return;
        setSubscription({
          payment_method: body.subscription?.payment_method ?? null,
          refund_eligible_until: typeof body.refundEligibleUntil === "number" ? body.refundEligibleUntil : null,
          refund_status: body.refundStatus ?? "none",
        });
      } catch {
        if (!cancelled) setSubscription(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  if (!subscription) return null;
  const now = Math.floor(Date.now() / 1000);
  const inWindow =
    subscription.refund_eligible_until !== null && now < subscription.refund_eligible_until;
  if (
    subscription.payment_method !== "paddle" ||
    !inWindow ||
    subscription.refund_status !== "none"
  ) {
    return null;
  }

  return (
    <div className="card">
      <Link to="/refund" className="btn btn-secondary text-sm inline-block">
        Request refund
      </Link>
      <p className="text-xs text-text-muted mt-2">
        Within 14 days of purchase — see{" "}
        <Link to="/refund-policy" className="text-accent-cyan hover:underline">refund policy</Link>
        .
      </p>
    </div>
  );
}

// Compact index only — editing/removing a vault's URLs (and its NoKs)
// now lives on the focused per-vault page (/vault/:id). With many
// vaults the old inline all-in-one-list was unusable (Daniel).
function ShareUrlManager(): JSX.Element {
  const vaults = readStoredShareUrls();

  if (vaults.length === 0) {
    return (
      <div className="card">
        <h2 className="font-bold font-display mb-3">Vaults &amp; share URLs</h2>
        <p className="text-text-on-dark/80 text-sm">
          When you finish enrolment your share URLs are saved here for review. Nothing's stored yet — they land here after you complete the "Paste share URLs" step in <Link to="/enrol" className="text-accent-cyan hover:underline">Enrol</Link>. You can also see everything at <Link to="/vaults" className="text-accent-cyan hover:underline">Vaults</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="font-bold font-display mb-3">Vaults &amp; share URLs</h2>
      <p className="text-text-on-dark/80 text-sm mb-3">
        Open a vault to edit its share URLs or manage its next-of-kin. URLs live in this browser's localStorage — they never leave your device.
      </p>
      <div className="space-y-2">
        {vaults.map((v) => (
          <Link
            key={v.vaultId}
            to={`/vault/${v.vaultId}`}
            className="flex justify-between items-center gap-3 border border-bg-surface rounded p-3 hover:border-accent-cyan/40 transition-colors"
          >
            <div className="min-w-0">
              <div className="text-sm font-mono text-accent-cyan truncate">vault {v.vaultId.slice(0, 16)}…</div>
              <div className="text-xs text-text-muted">{v.urls.length} share URL{v.urls.length === 1 ? "" : "s"} · updated {new Date(v.updatedAt).toLocaleString()}</div>
            </div>
            <span className="text-accent-cyan text-xs shrink-0">Manage &rsaquo;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 0.6.0 — CheckForUpdatesCard MOVED to Info.tsx (Info → About NoKLock
// tab) per Daniel 2026-06-02. See Info.tsx 0.7.6.
