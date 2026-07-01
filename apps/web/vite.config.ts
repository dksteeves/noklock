// @version 0.6.0 @date 2026-05-19
// 0.6.0 — Production build now DROPS all console.* + debugger (esbuild
//         `drop`) — no debug/log/error noise or info-leak in the
//         browser console for end users (Daniel: bad security / clean
//         it out). Dev (`command === "serve"`) keeps console for
//         debugging. Config converted to the function form to branch on
//         command.
// 0.5.1 — Transparent logo set (noklocklogo-T.png). Icons transparent;
//         maskable now uses logo-maskable.png (logo on an opaque light
//         tile - a transparent dark mark would be invisible as an Android
//         maskable). og-image regenerated dark + light badge.
// 0.5.0 — CRITICAL offline fix. There was NO workbox navigateFallback, so
//         reloading / deep-linking while offline fell through the service
//         worker and the BROWSER showed its native "You're offline" page
//         (with the stale app icon). For an air-gapped vault that is a
//         functional + veracity defect ("truly air-gapped" requires the
//         app to survive offline + reload). Added navigateFallback:
//         "index.html" (the SPA shell is precached) + a denylist so only
//         in-app SPA routes use it, + cleanupOutdatedCaches. The app now
//         runs fully offline and survives reload — the air-gapped enrol
//         is actually completable.
// 0.4.0 — Real brand-mark PNG icons replace the SVG monogram. Manifest icons:
//         /logo-192.png (any), /logo-512.png (any + maskable). Plus
//         favicon.png (64), apple-touch-icon.png (180), og-image.png (1200x630
//         for social shares), logo-wordmark.png (200h for in-app use). All
//         resized server-side from images/noklock_logo*.png via PowerShell +
//         System.Drawing (npm sharp install was blocked by a workspace
//         peer-dep bug, so we used Windows native).
// 0.3.0 — SVG favicon, bumped to 512 viewBox with safe-zone padding.
// 0.6.0 — __BUILD_VERSION__ now carries a per-build timestamp stamp
//         (pkg version + UTC yyyymmdd-hhmm). It was just the static
//         package version, so the footer "build" id NEVER changed
//         between builds — there was no objective way to tell whether
//         the running PWA was the freshly-uploaded bundle or a stale
//         service-worker-cached one. Now: note the footer build id,
//         deploy, hard-reload — if it didn't change, you're on the
//         cached SW (clear it), not new code.
// 0.2.0 — added __BUILD_VERSION__ define for App.tsx footer.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const BUILD_STAMP = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
const BUILD_VERSION = `${process.env.npm_package_version ?? "dev"}-${BUILD_STAMP}`;

export default defineConfig(({ command }) => ({
  // Strip all console.*/debugger from PRODUCTION bundles only. `command`
  // is "build" for `vite build`, "serve" for the dev server (keep logs).
  ...(command === "build" ? { esbuild: { drop: ["console", "debugger"] as ("console" | "debugger")[] } } : {}),
  define: {
    __BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  plugins: [
    react(),
    VitePWA({
      // Daniel 2026-05-28: "no longer seeing the update app pill at the
      // bottom of the screen like i used to". Switched autoUpdate →
      // prompt. With autoUpdate the SW silently takes over (no toast
      // event), AND with skipWaiting+clientsClaim there's a race where
      // the new SW could activate before main.tsx's controllerchange
      // listener attaches. Prompt mode + the official registerSW API
      // in main.tsx wire the toast reliably.
      registerType: "prompt",
      includeAssets: ["favicon.png", "apple-touch-icon.png", "og-image.png", "logo-wordmark.png", "logo-maskable.png"],
      manifest: {
        name: "NoKLock",
        short_name: "NoKLock",
        description:
          "Self-custodial vault for crypto seed phrases, wills, sealed letters and documents. Next-of-kin inheritance via soul-bound tokens on Polygon. Your keys, your documents, your rules.",
        theme_color: "#0f172a",
        background_color: "#020617",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/logo-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm}"],
        // Offline-first REQUIRES the main bundle be precached — the airgapped
        // enrol/restore flow runs with zero network, so the SW must already
        // hold every app chunk. The wagmi + viem + crypto-core entry chunk is
        // ~2.2 MB, over workbox's conservative 2 MiB default (which would
        // SILENTLY skip precaching it AND fail the build at SW generation).
        // Raised to 4 MiB so the entry is precached and there is headroom for
        // organic growth. (The fix for size is code-splitting, tracked
        // separately; precaching the entry is the correct offline behaviour
        // regardless.)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // CRITICAL: during enrolment the airgap-manager DELIBERATELY blocks all
        // fetches. The service worker must respect navigator.onLine === false
        // and never attempt background sync of sensitive state.
        // Daniel 2026-05-28 (rev. b): skipWaiting STAYS off (prompt mode
        // controls activation timing). clientsClaim is BACK to true — without
        // it, after the user clicks Refresh, the new SW activates but doesn't
        // claim the existing page client. The subsequent reload then races
        // the old SW serving stale assets → Daniel's regression to the older
        // build. With clientsClaim, controllerchange fires on activation,
        // updateSW(true) correctly waits for it, then reloads with the new
        // SW already in control. clientsClaim does NOT override prompt mode
        // (it only affects what happens AFTER activation, not when activation
        // happens — that's still gated by skipWaiting which we leave off).
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Offline-first SPA: every in-app navigation (incl. a hard reload
        // or deep link while air-gapped) is served the precached app
        // shell so the React router can render it with zero network.
        // Without this the browser shows its own "You're offline" page.
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//, /\/[^/?]+\.[^/]+$/],
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
}));
