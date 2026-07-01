// @version 0.7.1 @date 2026-06-10
// 0.7.1 — Daniel 2026-06-10: + /download route (Download.tsx) — "Get the
//         NoKLock app" page (Google Play badge gated by PLAY_STORE_AVAILABLE
//         + iOS Add-to-Home-Screen note). Route registered unconditionally;
//         the page self-handles the pre-launch "coming soon" state. Imported
//         eagerly alongside the other small marketing routes (Cli/etc.).
// @version 0.7.0 @date 2026-06-04
// 0.7.0 — Daniel 2026-06-04: Chrome tab title fix. App routes (/dashboard,
//         /vaults, /enrol*, /restore, /settings, /help, /admin, /marketing,
//         /shamir, etc.) did NOT call useDocumentHead, so navigating from
//         a public marketing route that DID set a title (e.g. /info →
//         "How NoKLock works…") to one that DIDN'T left the title stuck on
//         the old one. NEW DocumentTitleSync component mounted inside the
//         router listens to every pathname change and sets document.title
//         via seoForPath() OR a brand-default fallback. Per-component
//         useDocumentHead calls still work (idempotent — both routes that
//         have ROUTE_SEO entries produce the same title). Single source of
//         truth, no missed navigations.
// @version 0.6.5 @date 2026-05-29
// 0.6.5 — Pricing/Admin/Marketing also lazy-loaded (they pull big sub-trees
//         most users never visit; trims ~150 KB more off the initial bundle).
// 0.6.4 — Mounted <WalletSessionDriver/> once (single reconnect driver +
//         debounced/bounded wallet-status store) so useWalletSettling becomes a
//         pure reader app-wide. Kills the per-page reconnect storm that caused
//         the "reconnecting when already connected" flap.
// 0.6.3 — Wallet-connect Terms gate: mounted <TermsGate /> as a top-level
//         singleton (right after the route-level banners) so the moment a
//         user connects a wallet for the first time on this browser, the
//         scroll-to-bottom + 3-checkbox Terms modal fires before any
//         consequential action proceeds. Idle browsing without a wallet
//         connected is unaffected — gate is keyed to the connect transition.
// 0.6.2 — + /vault/:vaultId route (VaultDetail) — per-vault share URLs +
//         next-of-kin. Kept the bare /vault → /vaults redirect.
// 0.6.1 — WS-C: mounted <RoutePageNotice/> once in <main> — on the
//         English-authoritative pages (terms/privacy/info/help/enrol/
//         restore) a non-English user gets a localized why-English +
//         summary + key warnings block. One mount, route-aware.
// 0.6.0 — WS-A: /enrol/{seed,letter,document,image} all render the single
//         parameterized <Enrol kind=…/> wizard (100% flow parity incl.
//         airgap). Old flat EnrolLetter/EnrolDocument removed. NEW
//         /enrol/image route.
// 0.5.4 — <NetworkBanner /> mounted (proactive wrong-chain warning + one-tap
//         switch to Polygon — pairs with the ensurePolygon write-guard).
// 0.5.3 — App-wide <ErrorBoundary> wrapped around <Routes>, keyed by
//         pathname so a route render-throw shows a recoverable card and
//         auto-clears on navigation — instead of unmounting the whole
//         React root to a blank white page (root cause of the /admin
//         Audit blank). Boundary sits inside <main> so TopNav + Footer
//         stay usable as the escape hatch.
// 0.5.2 — /refer route (referral rewards dashboard) wired.
// 0.5.1 — Round 3 wave 2: <ScrollToTop /> wired so every <Link> navigation
//         jumps to the top of the next page (was leaving users scrolled to
//         whatever Y the previous page ended at). Respects #hash anchors.
// 0.5.0 — Round 3 polish: /privacy + /terms routes wired, inline footer
//         replaced by <Footer /> component. safeBuildVersion moved to
//         lib/version.ts.
// 0.4.0 — Vaults/Enrol restructure. /vaults = list, /enrol = context chooser,
//         /enrol/seed | /enrol/letter | /enrol/document = content-specific
//         wizards. /vault redirects to /vaults for back-compat.
// 0.3.0 — Phase 2 routes wired: /nok, /dead-man, /settings, /oauth/dropbox.
// 0.2.1 — defensive build-version readout.
// 0.2.0 — added /pricing, /heartbeat.

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { seoForPath } from "./lib/seo.js";

/**
 * DocumentTitleSync — global title-setter that fires on EVERY route change.
 *
 * Daniel 2026-06-04: Chrome tab titles were "not always changing" on
 * navigation. Root cause: app routes (/dashboard, /vaults, /enrol*,
 * /restore, /settings, /help, /admin, etc.) did NOT call useDocumentHead,
 * and useDocumentHead has no cleanup on unmount — so navigating from a
 * route that DID set a title (e.g. /info) to one that DIDN'T (e.g.
 * /dashboard) left the old title stuck.
 *
 * Fix: one global sync component mounted inside the router. On every
 * pathname change, it looks up seoForPath() and either sets the per-route
 * title OR falls back to the brand-default. Routes that ALSO call
 * useDocumentHead still work (idempotent — both produce the same result).
 *
 * Default title chosen to match ROUTE_SEO "/" entry so a fall-back never
 * surprises a user with an unbranded page.
 */
const DEFAULT_TITLE = "NoKLock — self-custodial recovery & inheritance for crypto";

function DocumentTitleSync(): null {
  const { pathname } = useLocation();
  useEffect(() => {
    const seo = seoForPath(pathname);
    document.title = seo?.title ?? DEFAULT_TITLE;
  }, [pathname]);
  return null;
}
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { Landing } from "./routes/Landing.js";
import { Dashboard } from "./routes/Dashboard.js";
import { Enrol } from "./routes/Enrol.js";
import { EnrolChooser } from "./routes/EnrolChooser.js";
import { Restore } from "./routes/Restore.js";
import { HeirRestore } from "./routes/HeirRestore.js";
import { ProveIt } from "./routes/ProveIt.js";
import { TestProveLegacy } from "./routes/TestProveLegacy.js";
// Pricing/Admin/Marketing lazy-loaded — see lazy block below.
import { Heartbeat as HeartbeatRoute } from "./routes/Heartbeat.js";
import { Nok } from "./routes/Nok.js";
import { NokClaim } from "./routes/NokClaim.js";
import { HeirGuide } from "./routes/HeirGuide.js";
import { Recovery } from "./routes/Recovery.js";
import { DeadMan } from "./routes/DeadMan.js";
import { LiveManSwitch } from "./routes/LiveManSwitch.js";
import { Settings } from "./routes/Settings.js";
import { Help } from "./routes/Help.js";
import { Manual } from "./routes/Manual.js";
import { Info } from "./routes/Info.js";
import { Vaults } from "./routes/Vaults.js";
import { VaultDetail } from "./routes/VaultDetail.js";
import { Privacy } from "./routes/Privacy.js";
import { Terms } from "./routes/Terms.js";
import { RefundPolicy } from "./routes/RefundPolicy.js";
import { Updates } from "./routes/Updates.js";
import { Refer } from "./routes/Refer.js";
import { Refund } from "./routes/Refund.js";
import { Cli } from "./routes/Cli.js";
import { Download } from "./routes/Download.js";
import { CryptoInheritance } from "./routes/CryptoInheritance.js";
import { Compare } from "./routes/Compare.js";
import { Corporate } from "./routes/Corporate.js";
import { Whitelabel } from "./routes/Whitelabel.js";
// Viz showcase routes — code-split so the bundle for /shamir, /argon,
// /aead, /restore-viz, /roundtrip only loads when the route is visited.
// Each viz module is ~50-100 KB; lazy-loading shrinks the initial PWA
// bundle by ~400 KB. Daniel 2026-05-28: "v v slow to load".
import { lazy, Suspense } from "react";
// 0.6.5 — Pricing/Admin/Marketing also lazy-loaded; they pull big sub-trees
// (CompetitorTable, citations, partner cobrand canvas) most users never hit.
const Pricing           = lazy(() => import("./routes/Pricing.js").then((m) => ({ default: m.Pricing })));
const Admin             = lazy(() => import("./routes/Admin.js").then((m) => ({ default: m.Admin })));
const Marketing         = lazy(() => import("./routes/Marketing.js").then((m) => ({ default: m.Marketing })));
// /prove-it/math — promoted from TestProveV2 → ProveItMath. The hub at
// /prove-it lists this + future sub-proofs (airgap planned).
const ProveItMath       = lazy(() => import("./routes/ProveItMath.js").then((m) => ({ default: m.ProveItMath })));
// /prove-it/noklock-proof — Daniel 2026-05-30: chain runs without us.
const ProveItNoKLockProof = lazy(() => import("./routes/ProveItNoKLockProof.js").then((m) => ({ default: m.ProveItNoKLockProof })));
// /prove-it/build-matches — reproducible build + browser-side asset enum.
const ProveItBuildMatches = lazy(() => import("./routes/ProveItBuildMatches.js").then((m) => ({ default: m.ProveItBuildMatches })));
// /prove-it/entropy — live chi-square test on real ciphertext + shares.
const ProveItEntropy      = lazy(() => import("./routes/ProveItEntropy.js").then((m) => ({ default: m.ProveItEntropy })));
// /prove-it/airgap — live network-watch terminal + test-fire buttons + DevTools walkthrough.
const ProveItAirgap       = lazy(() => import("./routes/ProveItAirgap.js").then((m) => ({ default: m.ProveItAirgap })));
// /prove-it/source — the 6th proof: bundled source modal + memzero explainer + honest JS memory model.
const ProveItSource       = lazy(() => import("./routes/ProveItSource.js").then((m) => ({ default: m.ProveItSource })));
// /viz/pipeline — clean end-to-end canned demo route. Pure auto-walking
// timeline through all 8 viz steps. DemoGate-wrapped; admin reference.
const VizPipeline       = lazy(() => import("./routes/VizPipeline.js").then((m) => ({ default: m.VizPipeline })));
const ShamirShowcase    = lazy(() => import("./routes/ShamirShowcase.js").then((m) => ({ default: m.ShamirShowcase })));
const ArgonShowcase     = lazy(() => import("./routes/ArgonShowcase.js").then((m) => ({ default: m.ArgonShowcase })));
const AeadShowcase      = lazy(() => import("./routes/AeadShowcase.js").then((m) => ({ default: m.AeadShowcase })));
const RestoreShowcase   = lazy(() => import("./routes/RestoreShowcase.js").then((m) => ({ default: m.RestoreShowcase })));
const RoundTripShowcase = lazy(() => import("./routes/RoundTripShowcase.js").then((m) => ({ default: m.RoundTripShowcase })));
const Bip39Showcase     = lazy(() => import("./routes/Bip39Showcase.js").then((m) => ({ default: m.Bip39Showcase })));
const ManifestShowcase  = lazy(() => import("./routes/ManifestShowcase.js").then((m) => ({ default: m.ManifestShowcase })));
const Articles          = lazy(() => import("./routes/Articles.js").then((m) => ({ default: m.Articles })));
const ArticleView       = lazy(() => import("./routes/ArticleView.js").then((m) => ({ default: m.ArticleView })));
import { TopNav } from "./components/TopNav.js";
import { Footer } from "./components/Footer.js";
import { BrowserBanner } from "./components/BrowserBanner.js";
import { NetworkBanner } from "./components/NetworkBanner.js";
import { OwnerAlertBanner } from "./components/OwnerAlertBanner.js";
import { ScrollToTop } from "./components/ScrollToTop.js";
import { RoutePageNotice } from "./components/PageLangNotice.js";
import { TermsGate } from "./components/TermsGate.js";
import { NoKLockSpinner } from "./components/NoKLockSpinner.js";
import { AirgapStatusBar } from "./components/AirgapStatusBar.js";
import { WalletSessionDriver } from "./hooks/walletSession.js";

// Re-keyed on navigation so an error on one route auto-clears when the
// user navigates away (class error boundaries don't reset on prop change).
function KeyedBoundary({ children }: { readonly children: ReactNode }): JSX.Element {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}

export function App(): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col">
      <WalletSessionDriver />
      <ScrollToTop />
      <BrowserBanner />
      <DocumentTitleSync />
      <NetworkBanner />
      <OwnerAlertBanner />
      <TermsGate />
      <AirgapStatusBar />
      <TopNav />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <RoutePageNotice />
        <KeyedBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vaults" element={<Vaults />} />
          <Route path="/enrol" element={<EnrolChooser />} />
          <Route path="/enrol/seed" element={<Enrol kind="seed" />} />
          <Route path="/enrol/letter" element={<Enrol kind="letter" />} />
          <Route path="/enrol/document" element={<Enrol kind="document" />} />
          <Route path="/enrol/image" element={<Enrol kind="image" />} />
          <Route path="/restore" element={<Restore />} />
          {/* M-of-N Stage 1 (plan §D.4) — heir-side restore enforces the
              quorum policy. Sibling of /restore so the owner path stays
              byte-identical to today. */}
          <Route path="/heir/restore" element={<HeirRestore />} />
          {/* 0.7.0 — Daniel restructure 2026-05-30: /prove-it is now a
              HUB; the math dashboard moves to /prove-it/math; v1 is
              preserved at /prove-it-legacy; the airgap proof will land
              at /prove-it/airgap in the next build. /prove-it-v2 stays
              as a redirect alias for any shared links. */}
          <Route path="/prove-it" element={<ProveIt />} />
          <Route path="/prove-it/math" element={<Suspense fallback={<VizLoading />}><ProveItMath /></Suspense>} />
          <Route path="/prove-it/noklock-proof" element={<Suspense fallback={<VizLoading />}><ProveItNoKLockProof /></Suspense>} />
          <Route path="/prove-it/build-matches" element={<Suspense fallback={<VizLoading />}><ProveItBuildMatches /></Suspense>} />
          <Route path="/prove-it/entropy" element={<Suspense fallback={<VizLoading />}><ProveItEntropy /></Suspense>} />
          <Route path="/prove-it/airgap" element={<Suspense fallback={<VizLoading />}><ProveItAirgap /></Suspense>} />
          <Route path="/prove-it/source" element={<Suspense fallback={<VizLoading />}><ProveItSource /></Suspense>} />
          <Route path="/prove-it-legacy" element={<TestProveLegacy />} />
          <Route path="/prove-it-v2" element={<Navigate to="/prove-it/math" replace />} />
          <Route path="/viz/pipeline" element={<Suspense fallback={<VizLoading />}><VizPipeline /></Suspense>} />
          <Route path="/pricing" element={<Suspense fallback={<VizLoading />}><Pricing /></Suspense>} />
          <Route path="/heartbeat" element={<HeartbeatRoute />} />
          <Route path="/nok" element={<Nok />} />
          <Route path="/nok-claim" element={<NokClaim />} />
          <Route path="/nok-claim/:nonce" element={<NokClaim />} />
          <Route path="/heir" element={<HeirGuide />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/dead-man" element={<DeadMan />} />
          <Route path="/live-mans-switch" element={<LiveManSwitch />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/info" element={<Info />} />
          <Route path="/vault/:vaultId" element={<VaultDetail />} />
          <Route path="/vault" element={<Navigate to="/vaults" replace />} />
          <Route path="/help" element={<Help />} />
          <Route path="/manual" element={<Manual />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/articles" element={<Suspense fallback={<VizLoading />}><Articles /></Suspense>} />
          <Route path="/articles/:slug" element={<Suspense fallback={<VizLoading />}><ArticleView /></Suspense>} />
          <Route path="/refer" element={<Refer />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/cli" element={<Cli />} />
          <Route path="/download" element={<Download />} />
          <Route path="/crypto-inheritance" element={<CryptoInheritance />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/compare/:slug" element={<Compare />} />
          {/* 2026-06-18 (Daniel) — admin page moved off the universally-scanned
              /admin to /terminal (obscurity, defence-in-depth on top of the
              owner-wallet gate). No /admin redirect on purpose: a bot hitting
              /admin gets the SPA 404, never a hint of the real path. */}
          <Route path="/terminal" element={<Suspense fallback={<VizLoading />}><Admin /></Suspense>} />
          <Route path="/marketing" element={<Suspense fallback={<VizLoading />}><Marketing /></Suspense>} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/whitelabel" element={<Whitelabel />} />
          {/* /shamir — clean showcase page for the Shamir polynomial viz.
              No app chrome, autoplay loop. Designed for screen-recording
              into GIF/MP4 for social posts. ?n=, ?k=, ?secret=, ?speed=,
              ?theme=cyan|emerald let recordings cycle variants. */}
          <Route path="/shamir" element={<Suspense fallback={<VizLoading />}><ShamirShowcase /></Suspense>} />
          {/* /argon — clean showcase page for the Argon2id memory-hard
              viz. Same recording-friendly layout as /shamir. */}
          <Route path="/argon" element={<Suspense fallback={<VizLoading />}><ArgonShowcase /></Suspense>} />
          <Route path="/aead" element={<Suspense fallback={<VizLoading />}><AeadShowcase /></Suspense>} />
          {/* /restore-viz not /restore — /restore is the app's actual restore page. */}
          <Route path="/restore-viz" element={<Suspense fallback={<VizLoading />}><RestoreShowcase /></Suspense>} />
          <Route path="/roundtrip" element={<Suspense fallback={<VizLoading />}><RoundTripShowcase /></Suspense>} />
          <Route path="/bip39" element={<Suspense fallback={<VizLoading />}><Bip39Showcase /></Suspense>} />
          <Route path="/manifest" element={<Suspense fallback={<VizLoading />}><ManifestShowcase /></Suspense>} />
          {/* Back-compat in case anything got shared with the old path before
              the 2026-05-28 rename. /quorlock → /corporate. */}
          <Route path="/quorlock" element={<Navigate to="/corporate" replace />} />
          {/* /partners + /telegram-partners moved INTO /refer as a "Community
              Owners" subtab (Daniel: it's a subset of refer & earn). Old
              URLs redirect so any external links / shares stay live. */}
          <Route path="/partners" element={<Navigate to="/refer?tab=community-owners" replace />} />
          <Route path="/telegram-partners" element={<Navigate to="/refer?tab=community-owners" replace />} />
          <Route
            path="*"
            element={
              <div className="text-center py-16">
                <h1 className="text-3xl font-bold">404</h1>
                <p className="mt-4 text-slate-400">
                  Nothing here.{" "}
                  <Link to="/" className="text-accent-400 underline">
                    Go home
                  </Link>
                  .
                </p>
              </div>
            }
          />
        </Routes>
        </KeyedBoundary>
      </main>
      <Footer />
    </div>
  );
}

// 0.6.6 — Lazy-load fallback for viz showcase + Pricing/Admin/Marketing.
// Switched from the text-only stub to the NoKLock logo spinner so the
// user gets brand-aware feedback during the chunk fetch instead of a
// nearly-blank panel (the chunk fetch can be visibly long on cold load).
function VizLoading(): JSX.Element {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#020617", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <NoKLockSpinner size={112} label="Loading…" />
    </div>
  );
}
