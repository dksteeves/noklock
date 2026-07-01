// @version 0.4.0 @date 2026-06-01
// 0.4.0 — Daniel 2026-06-01 (BROWN KILLED): "since so much of the end to
//          end store to vault is offline just leave [the viz the same
//          color]" — restore original blue not the shit brown, just make
//          the pill more obvious. Per Daniel 2026-06-01 — 'shit brown' was
//          a hard no. The viz palette stays its natural blue regardless of
//          online/offline state. The pill (AirgapStatusBar /
//          SimAirgapBadge / SimOnlineBadge / OfflineMoodPill) is the
//          indicator now. offlineMoodFilter() now returns "none"
//          unconditionally; the OfflineState param is retained so the 9
//          call sites and the OfflineFilterContext plumbing stay
//          source-compatible and we can re-introduce a *non-brown* mood
//          tweak later without another import churn. The pill itself is
//          made more obvious: solid amber chip, larger label, stronger
//          shadow/glow, no counter-rotation hack.
// 0.3.0 — Daniel 2026-06-01 (self-audit fix): CSS `filter` composes
//          multiplicatively when nested. ProveItVizPanel 0.5.3 added a
//          page-level mood filter to its outer card; inner vizzes also
//          apply offlineMoodFilter() to their own containers; the result
//          was DOUBLE-application — `saturate(0.35) × saturate(0.35) =
//          saturate(0.12)` etc — way over the intended mood. Solution:
//          new OfflineFilterContext lets a parent (e.g. the panel) signal
//          "I already applied the mood — children should skip". Each viz
//          reads `useSkipMoodFilter()` and zeroes its own filter when
//          true. Standalone use (e.g. /viz/showcase/*) unchanged because
//          the context's default is false.
// 0.2.0 — Daniel 2026-05-31: prior filter (saturate 0.55 sepia 0.18
//          hue-rotate -12) was too subtle. Stronger now.
// 0.1.0 — Two-part offline indicator for viz components.

import { createContext, useContext } from "react";
import { useOfflineState, type OfflineState } from "../hooks/useOfflineState.js";

export { useOfflineState } from "../hooks/useOfflineState.js";

/** Context that lets a parent tell child vizzes "I've already applied the
 *  offline mood filter — don't re-apply yours" to avoid CSS filter
 *  composition (which is multiplicative). Default false = inner viz applies
 *  its own filter as before (correct for /viz/showcase standalone routes).
 *  Retained at 0.4.0 even though offlineMoodFilter() is now a no-op, so we
 *  can dial in a non-brown mood later without churning every viz import. */
export const OfflineFilterContext = createContext<{ readonly skipInnerFilter: boolean }>({ skipInnerFilter: false });

/** Read the skip flag. Inner vizzes should multiply their filter result
 *  by zero (return "none") when this is true. */
export function useSkipMoodFilter(): boolean {
  return useContext(OfflineFilterContext).skipInnerFilter;
}

// 0.4.0 — Daniel 2026-06-01: BROWN SEPIA FILTER KILLED. Viz stays its
// natural blue regardless of online/offline state. The pill is the
// indicator. The OfflineState param is retained for API compatibility
// (9 viz call sites + ProveItVizPanel) so we can re-introduce a
// non-brown mood tweak in the future without another import churn.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function offlineMoodFilter(_state: OfflineState): string {
  return "none";
}

export function OfflineMoodPill(): JSX.Element | null {
  const { offline, airgapped } = useOfflineState();
  const pillLabel = airgapped ? "AIRGAPPED" : offline ? "OFFLINE" : null;
  if (!pillLabel) return null;
  return (
    <div
      aria-label={`${pillLabel} mode`}
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 12,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        // 0.4.0 — pill made more obvious: solid amber chip (not translucent),
        // larger padding, bolder text, stronger glow. No counter-rotation
        // filter needed now that the viz is no longer desaturated.
        padding: "6px 14px",
        borderRadius: 999,
        background: "rgba(245, 158, 11, 0.95)",
        color: "#1a1303",
        border: "1px solid rgba(254, 215, 170, 0.9)",
        boxShadow: "0 0 0 2px rgba(245, 158, 11, 0.25), 0 4px 14px rgba(245, 158, 11, 0.45)",
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "0.2em",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#fff7ed",
          boxShadow: "0 0 8px rgba(255, 247, 237, 0.95)",
          animation: "nkPulse 1.8s ease-in-out infinite",
        }}
        aria-hidden
      />
      {pillLabel}
    </div>
  );
}
