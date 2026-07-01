// @version 0.1.0 @date 2026-05-31
// Global app-shell status bar that renders an amber strip across the
// top of the page whenever airgap mode is engaged anywhere in the app.
// Solves the "I can't tell when airgap is on / off" problem — the prior
// signal was only visible on viz components, but the airgap-proof page
// (/prove-it/airgap) has no vizzes, so users couldn't see the change.
//
// Mounted once in App.tsx above the TopNav. Subscribes to airgap-manager
// state changes. When `isAirgapped()` is true OR `navigator.onLine` is
// false, renders a thin amber bar saying "AIRGAPPED — all outbound
// network calls are being intercepted" with a pulsing dot.
//
// CSS-only animation (uses the existing nkPulse keyframe). Hidden when
// network is normal — does not occupy layout space when idle.

import { useOfflineState } from "../hooks/useOfflineState.js";

export function AirgapStatusBar(): JSX.Element | null {
  const { offline, airgapped } = useOfflineState();
  if (!offline && !airgapped) return null;
  const label = airgapped ? "AIRGAPPED" : "OFFLINE";
  const detail = airgapped
    ? "All outbound network calls are being intercepted. Your seed cannot leave this tab."
    : "Your browser reports it is offline. NoKLock works fully offline by design.";
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: "linear-gradient(180deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.18))",
        borderBottom: "1px solid rgba(245, 158, 11, 0.55)",
        color: "#fbbf24",
        padding: "6px 16px",
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        letterSpacing: "0.06em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#fbbf24",
          boxShadow: "0 0 8px rgba(251, 191, 36, 0.9)",
          animation: "nkPulse 1.6s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <span style={{ fontWeight: 700, letterSpacing: "0.18em" }}>{label}</span>
      <span style={{ opacity: 0.85 }}>·</span>
      <span style={{ opacity: 0.9 }}>{detail}</span>
    </div>
  );
}
