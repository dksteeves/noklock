// @version 0.5.0 @date 2026-05-22
// 0.5.0 — the page-view beacon moved into lib/track.ts (trackPageView) so it
//         runs through the SAME isExcluded() gate as every other counter —
//         previously this component fired its own un-gated beacon, so admin/
//         treasury page views were always counted. No behaviour change for
//         real visitors; excluded wallets now don't inflate page views.
// 0.4.0 — WS-H: also fires the once-per-browser-per-day "unique_view"
//         event (dedup is purely client-local; nothing identifying is
//         sent — see lib/track.ts). Still zero-PII.
// 0.3.0 — also captures ?ref=0x.. referral links into localStorage on every
//         route (one shared per-route effect — no extra component). Fed into
//         the mint flow as mintLicenceReferred.
// 0.2.0 — also fires a fire-and-forget POST /v1/track on every pathname
//         change. Zero PII: body is { route: pathname } and Form B
//         increments a (route, ymd) counter row. No cookies, no UA, no IP
//         stored. If the beacon fails, page navigation is unaffected.
// 0.1.0 — Reset scroll position when the route changes.
//
// React-router-dom doesn't reset scroll position when the route changes.
// This component listens for pathname changes and scrolls to the top.
//
// Honours an explicit hash (e.g. /info#shares) — if there's a #hash in the
// URL, we let the browser handle anchor scrolling instead of jumping to top.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureReferrerFromUrl } from "../lib/referral.js";
import { trackUniqueViewOncePerDay, trackPageView } from "../lib/track.js";

export function ScrollToTop(): null {
  const { pathname, hash, search } = useLocation();

  useEffect(() => {
    captureReferrerFromUrl(search);
  }, [search]);

  // Once per browser per UTC day (client-deduped, zero-PII).
  useEffect(() => {
    trackUniqueViewOncePerDay();
  }, []);

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    trackPageView(pathname);
  }, [pathname, hash]);

  return null;
}
