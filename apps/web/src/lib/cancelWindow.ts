// @version 0.1.0 @date 2026-06-01
// LAUNCH-BLOCKER 1 (audit ID: launch-blocker-1-owner-cancel-window).
//
// Single source of truth for the owner cancel-window length surfaced in the
// PWA. The AUTHORITATIVE runtime value lives in Form B's env
// OWNER_CANCEL_WINDOW_HOURS (default 48, clamp 0-168) and is exposed via
// GET /v1/ops/cancel-window-hours (public, read-only). This module:
//
//   1. Exports OWNER_CANCEL_WINDOW_HOURS — the BUILD-TIME constant used by
//      static disclosure copy on Info / Manual / HeirGuide. Falls back to 48
//      when VITE_OWNER_CANCEL_WINDOW_HOURS is unset (mirrors Form B's default).
//      Used wherever the value must appear in render output that can't await
//      a fetch (SSR / prerender / offline first-paint).
//
//   2. Exports useCancelWindowHours() — a tiny hook that fetches the runtime
//      value once on mount and falls back to the constant if the network is
//      unreachable. Used inside <PendingActivations/> (already reads it
//      indirectly via the /v1/ops/activations-pending response).
//
// Keep these two paths in lockstep at build time: VITE_OWNER_CANCEL_WINDOW_HOURS
// should match Form B's OWNER_CANCEL_WINDOW_HOURS env. If they ever drift, the
// runtime hook wins where it can fetch; static copy keeps the build value.

import { useEffect, useState } from "react";

const ENV_RAW = (import.meta.env.VITE_OWNER_CANCEL_WINDOW_HOURS as string | undefined) ?? "48";
const ENV_NUM = Number(ENV_RAW);

/** Build-time owner cancel-window length in hours. Clamped 0-168. */
export const OWNER_CANCEL_WINDOW_HOURS: number = (() => {
  if (!Number.isFinite(ENV_NUM)) return 48;
  if (ENV_NUM < 0) return 0;
  if (ENV_NUM > 168) return 168;
  return Math.floor(ENV_NUM);
})();

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

/**
 * Fetches the runtime cancel-window length once on mount. Returns the build-
 * time constant immediately so first-paint copy is never blank; updates to
 * the live value when the network call succeeds.
 */
export function useCancelWindowHours(): number {
  const [hours, setHours] = useState<number>(OWNER_CANCEL_WINDOW_HOURS);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch(`${API_BASE}/ops/cancel-window-hours`);
        if (!r.ok) return;
        const body = await r.json() as { hours?: number };
        if (cancelled) return;
        if (typeof body.hours === "number" && Number.isFinite(body.hours)) {
          let v = Math.floor(body.hours);
          if (v < 0) v = 0;
          if (v > 168) v = 168;
          setHours(v);
        }
      } catch { /* offline / cors — keep constant */ }
    })();
    return () => { cancelled = true; };
  }, []);
  return hours;
}
