// @version 0.12.0 @date 2026-06-11
// 0.12.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC-2026-06-11):
//          update pill reworded to "A required security update is ready —
//          Update now / Later" with a snooze (noklock.update-later-at, 30min)
//          + non-intrusive re-advise (re-shows on reload / foreground-return
//          after the snooze lapses). Prompt mode + user-controlled activation
//          UNCHANGED (no silent swap — verifiability is a product principle).
// @version 0.11.0 @date 2026-06-02
// 0.11.0 — NL-1 Foundation: wrap the existing wagmi/QueryClient/Router tree
//          with <ManagedWalletProvider/>. When VITE_MANAGED_WALLET_ENABLED
//          != "true" (default), provider is a pure pass-through and the
//          Privy SDK is tree-shaken out of the bundle (React.lazy() chunk
//          only resolved on the flag-on path). Self-custody flow byte-
//          identical to 0.10.2 when flag off. See lib/managed-wallet.ts +
//          components/ManagedWalletProvider.tsx + round-2 §2.1.
// 0.10.2 — SW update check on every page load + tab refocus, not just the
//          periodic 60-min tick. Daniel: "update notice takes a long time
//          to come to app … is there not a check exact at refresh".
// 0.10.1 — Refresh-toast: forced reload after 1.5 s belt-and-braces. The
//          second update's "Refresh" was a no-op for Daniel — happens when
//          skipWaiting resolves without controllerchange firing on this
//          tab. Now: skipWaiting first (loads fresh assets if it works);
//          fallback reload guarantees the click is never a dud.
// 0.10.0 — Daniel: "no longer seeing the update app pill at the bottom of
//          the screen like i used to". The 0.9.0 controllerchange-based
//          detection had a race: with vite-pwa autoUpdate +
//          skipWaiting+clientsClaim, the new SW could activate BEFORE
//          main.tsx's addEventListener attached. controllerchange fires
//          once — miss it, no toast. Switched to the official
//          virtual:pwa-register API (`registerSW({ onNeedRefresh })`)
//          which the plugin manages internally + paired with `prompt`
//          mode in vite.config.ts so the SW reliably waits for the user
//          tap. Added an hourly periodic update check so tabs left open
//          a long time still see the toast when a deploy lands.
// 0.9.0 — Killed the mid-session SW auto-reload. Replaced with a small
//         NON-blocking "A new version is ready — Refresh" toast.
// 0.8.0 — SW takeover reload. autoUpdate installs the new SW in the
//         background but a tab on stale precached assets isn't refreshed
//         until the SW eventually claims it — that's the "soft refresh =
//         old bundle (wallet shows disconnected / since-fixed crash) /
//         hard refresh = new bundle" gap. On a NEW SW taking control
//         (there WAS a prior controller = an update) we now reload ONCE
//         (sessionStorage one-shot, loop-safe) so every browser moves to
//         the fresh bundle with no manual hard refresh.
// 0.7.0 — RPC resilience: public Polygon fallbacks expanded
//         (polygon-rpc.com, publicnode bor, ankr, 1rpc) — the lone
//         publicnode fallback "Failed to fetch" on browser eth_getLogs
//         when the proxy was down. Proxy still first (IP privacy).
// 0.6.0 — WS-H: `appinstalled` → zero-PII pwa_install counter.
// 0.5.0 — WS-F: explicit persistent storage + reconnectOnMount so a
//         connected wallet survives navigation/reload (fixes /admin
//         dropping to "connect wallet" after navigating away and back).
//         WalletConnect connector enabled once VITE_WALLETCONNECT_PROJECT_ID
//         is set (Reown id provided) — mobile/QR wallets now work.
// 0.4.2 — <I18nProvider> mounted (zero-dependency i18n; funnel-only Phase 1).
// 0.4.1 — Provider-independence: Polygon transport is now a viem fallback —
//         the api.noklock.app RPC proxy first (IP privacy), then a public
//         Polygon node if the proxy is unreachable. License/inheritance
//         reads survive even if NoKLock's servers are dead.
// 0.4.0 — SEO: hydrate-or-render guard. When react-snap (build:seo) has
//         prerendered static HTML into #root, hydrate it so the
//         crawler-visible markup is preserved with no blank flash;
//         otherwise normal client-side render. Default `npm run build` is
//         unchanged (CSR) — prerender is the opt-in build:seo path.
// 0.3.1 — Round 3 wave 3 revision: dropped Plausible (needs Docker, doesn't
//         fit cPanel shared hosting). Replaced with a fire-and-forget POST
//         to Form B's /v1/track endpoint on every route change. Form B owns
//         the aggregate counter table. No IP / UA / cookies / fingerprint —
//         just route + date, incremented server-side.
// 0.2.0 — brand rename to NoKLock. WalletConnect metadata + default app
//         domain switched to noklock.app.

/// <reference types="vite-plugin-pwa/client" />
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { installAirgapHijacks } from "./lib/airgap-manager.js";
import { installAirgapPerfWitness } from "./lib/airgap-perf-witness.js";

// 0.10.2 — Daniel 2026-05-30: install airgap channel hijacks + the
// browser-native PerformanceObserver witness at boot, BEFORE any React
// render. Hijacks are no-ops while NOT airgapped (just an early-return
// branch per call). The witness logs every resource the browser loads
// into the airgap event ring so /prove-it/airgap's terminal can show
// the boot-time baseline as the pre-airgap "this is what normal looks
// like" backdrop. Required for the airgap-proof feature.
installAirgapHijacks();
installAirgapPerfWitness();
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, createStorage, http } from "wagmi";
import { fallback } from "viem";
import { polygon, polygonAmoy } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { App } from "./App.js";
import { I18nProvider } from "./i18n/index.js";
import ManagedWalletProvider from "./components/ManagedWalletProvider.js";
import { trackEvent, installOfflineEventFlush } from "./lib/track.js";
import "./index.css";

const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

const wagmiConfig = createConfig({
  chains: [polygon, polygonAmoy],
  ssr: false,
  // Persist the active connection so it survives SPA navigation + reloads
  // (the /admin "connect wallet" drop was an unpersisted/race issue).
  storage: createStorage({
    key: "noklock-wagmi",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }),
  connectors: [
    injected({ shimDisconnect: true }),
    ...(wcProjectId
      ? [
          walletConnect({
            projectId: wcProjectId,
            metadata: {
              name: "NoKLock",
              description: "Self-custodial seed + document vault with next-of-kin inheritance.",
              url: `https://${import.meta.env.VITE_APP_DOMAIN ?? "noklock.app"}`,
              icons: [],
            },
          }),
        ]
      : []),
  ],
  transports: {
    // Resilience: try the NoKLock RPC proxy first (IP privacy from public
    // nodes); if it's unreachable — including NoKLock fully gone — viem
    // automatically falls over to a public Polygon node so license and
    // inheritance reads keep working. The protocol does not depend on us.
    // Resilience: NoKLock proxy first (IP privacy). If it's down, viem
    // walks these public Polygon RPCs in order — all browser-CORS-open
    // and supporting eth_getLogs, so the NoK list / leaderboard /
    // whitelist reads survive a proxy outage. (publicnode alone was
    // unreliable for browser eth_getLogs.)
    [polygon.id]: fallback([
      http(import.meta.env.VITE_POLYGON_RPC_URL ?? "https://api.noklock.app/v1/rpc"),
      http("https://polygon-rpc.com"),
      http("https://polygon-bor-rpc.publicnode.com"),
      http("https://rpc.ankr.com/polygon"),
      http("https://1rpc.io/matic"),
    ]),
    [polygonAmoy.id]: http("https://rpc-amoy.polygon.technology"),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

const rootEl = document.getElementById("root")!;
// NL-1 (2026-06-02): ManagedWalletProvider wraps the existing wagmi tree.
// When VITE_MANAGED_WALLET_ENABLED is not "true" (the default) this is a
// pure pass-through — no Privy code enters the bundle, the self-custody
// flow is byte-identical to pre-NL-1. When flipped on (Stage-1 heir-only
// managed path), the provider lazy-loads <PrivyProvider/> around the wagmi
// chain so heir-claim screens can mount Privy hooks without disturbing the
// owner-side connect flow. See lib/managed-wallet.ts + round-2 §2.1.
const tree = (
  <React.StrictMode>
    <ManagedWalletProvider>
      <WagmiProvider config={wagmiConfig} reconnectOnMount>

        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <I18nProvider>
              <App />
            </I18nProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </ManagedWalletProvider>
  </React.StrictMode>
);

// If react-snap prerendered static HTML into #root, hydrate it (preserves
// the crawler-visible markup + avoids a blank flash). Otherwise normal CSR.
if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootEl, tree);
} else {
  ReactDOM.createRoot(rootEl).render(tree);
}

// WS-H: count actual PWA installs (zero-PII aggregate). The browser fires
// `appinstalled` once when the app is installed by any method — no custom
// prompt UI exists, so this is the accurate signal.
if (typeof window !== "undefined") {
  window.addEventListener("appinstalled", () => trackEvent("pwa_install"), { once: true });
}

// 0.8.0 traction — replay any traction events (vault_created, nok_designated, …)
// that were stored OFFLINE in an airgap session and dropped by sendBeacon. Wires
// an 'online' listener + flushes once on boot. Zero-PII aggregate counters.
installOfflineEventFlush();

// New-version handling — uses vite-plugin-pwa's official `registerSW` API
// (much more reliable than raw `controllerchange` which has a race window).
// SW config in vite.config.ts is `registerType: "prompt"` so the new SW
// WAITS — `onNeedRefresh` fires reliably + we show the toast + the user
// taps Refresh which calls `updateSW(true)` to skipWaiting + reload.
// ── Update pill (Daniel 2026-06-11): user-controlled, never silent. ──────
// Copy frames it as a required security update. "Later" snoozes; we re-
// prompt non-intrusively: every fresh page load with a waiting SW re-fires
// onNeedRefresh (so reopening/reloading the app re-shows it), and a tab
// returning to the foreground after ≥30 min re-shows it without a reload.
// Never blocking, never auto-applied. FAQ "app-updates" explains why.
const UPDATE_SNOOZE_KEY = "noklock.update-later-at";
const UPDATE_RESHOW_MS = 30 * 60 * 1000; // 30 min

function snoozedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(UPDATE_SNOOZE_KEY) ?? "0");
    return at > 0 && Date.now() - at < UPDATE_RESHOW_MS;
  } catch { return false; }
}

function showUpdateToast(onRefresh: () => void): void {
  try {
    if (document.getElementById("nk-update-toast")) return;
    const el = document.createElement("div");
    el.id = "nk-update-toast";
    el.setAttribute("role", "status");
    el.style.cssText =
      "position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:99999;" +
      "display:flex;align-items:center;gap:12px;max-width:calc(100vw - 32px);" +
      "background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:10px;" +
      "padding:11px 14px;box-shadow:0 10px 30px rgba(0,0,0,0.45);" +
      "font:500 14px Inter,system-ui,-apple-system,sans-serif;";
    const msg = document.createElement("span");
    msg.innerHTML =
      "<strong>A required security update is ready.</strong>" +
      "<span style='display:block;font-weight:400;font-size:12px;color:#94a3b8;'>" +
      "Your option — applied only when you choose. See <a href='/info?tab=about#how-updates-work' style='color:#22d3ee;text-decoration:underline;'>Info &rarr; About</a> &rarr; &ldquo;How updates work&rdquo;.</span>";
    const refresh = document.createElement("button");
    refresh.textContent = "Update now";
    refresh.style.cssText =
      "cursor:pointer;background:#22d3ee;color:#0f172a;border:none;border-radius:8px;" +
      "padding:7px 14px;font:600 13px Inter,system-ui,sans-serif;white-space:nowrap;";
    refresh.onclick = (): void => {
      try { localStorage.removeItem(UPDATE_SNOOZE_KEY); } catch { /* ignore */ }
      // Best-effort SW skipWaiting + reload; forced reload after 1.5s so the
      // click is never a dud (0.10.1 behaviour, kept).
      try { onRefresh(); } catch { /* fall through to forced reload */ }
      window.setTimeout(() => { window.location.reload(); }, 1500);
    };
    const later = document.createElement("button");
    later.textContent = "Later";
    later.setAttribute("aria-label", "Remind me later");
    later.style.cssText =
      "cursor:pointer;background:transparent;color:#94a3b8;border:none;" +
      "font:500 13px Inter,system-ui,sans-serif;";
    later.onclick = (): void => {
      try { localStorage.setItem(UPDATE_SNOOZE_KEY, String(Date.now())); } catch { /* ignore */ }
      el.remove();
    };
    el.appendChild(msg);
    el.appendChild(refresh);
    el.appendChild(later);
    document.body.appendChild(el);
  } catch {
    /* DOM blocked — nothing we can do */
  }
}

if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  let pendingRefresh: (() => void) | null = null;
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      pendingRefresh = () => { void updateSW(true); };
      // Fresh page load with a waiting SW always re-prompts (the "when he
      // returns / reopens" re-advise). The snooze only suppresses the
      // foreground-return re-show below within its 30-min window.
      showUpdateToast(pendingRefresh);
    },
    onRegisteredSW(_url, reg) {
      if (reg) {
        void reg.update();
        const onVis = (): void => {
          if (document.visibilityState !== "visible") return;
          void reg.update();
          // Re-show on foreground return if an update is pending and the
          // snooze window has lapsed (non-intrusive re-advise).
          if (pendingRefresh && !snoozedRecently()) showUpdateToast(pendingRefresh);
        };
        document.addEventListener("visibilitychange", onVis);
        setInterval(() => { void reg.update(); }, 60 * 60 * 1000);
      }
    },
  });
}
