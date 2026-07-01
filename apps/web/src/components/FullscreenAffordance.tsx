// @version 0.1.0 @date 2026-05-29
// FullscreenAffordance — single helper for the per-viz fullscreen
// enter/exit button + arrow-key navigation. Used by all 7 vizzes so
// the UX is consistent:
//   - Not fullscreen: small "⤢" tile in TOP-RIGHT of the viz container.
//   - Fullscreen:     small discreet "✕" tile in BOTTOM-RIGHT, fades on
//                     mouse-idle so it doesn't pollute screen recordings.
//   - Fullscreen also wires document-level ArrowLeft / ArrowRight to
//     step prev / next, so the user can navigate without touching
//     the small on-screen controls.
//
// Each viz owns its own toggleFullscreen + isFullscreen state (already
// hooked up via the Fullscreen API). This component only renders the
// button affordance + key handler.

import { createContext, useContext, useEffect, useRef, useState } from "react";

// 0.3.0 — Daniel 2026-05-30: parents (e.g. the end-to-end demo page at
// /viz/pipeline) can suppress the per-viz fullscreen button via this
// context. Reason: when the end-to-end demo auto-walks from one viz
// component to the next, the previously-fullscreened inner viz UNMOUNTS
// and the browser exits fullscreen. Hiding the per-viz button on those
// pages and providing an OUTER stable fullscreen container (whose ref
// doesn't change across step swaps) keeps fullscreen alive through the
// entire demo cycle. Default = visible.
export const FullscreenSuppressContext = createContext<boolean>(false);

// 0.4.0 — Daniel 2026-06-01: VIZ STEP API. The panel SideArrows used to
// step PIPELINE_ORDER (cross-viz) unconditionally — Daniel reported
// "WHEN I STEP THRU THE VIZ IT IS NOT STEPPING THE STEPS IT IS MOVING TO
// THE NEXT VIZ". Fix: each viz registers its current phase index + total
// + a jumpToPhase function via this context. The panel's ◀/▶ first steps
// the sub-phase within the current viz; only crosses to the next/prev
// viz when at phase boundary. Standalone viz pages (showcase routes)
// don't mount this context provider, so they keep their current
// arrow-key wrap behaviour.
export interface VizSubStepApi {
  /** Current phase index (0..totalPhases-1). Read at click time so the
   *  panel always sees the live value without React re-renders. */
  getPhaseIdx: () => number;
  /** Total phases in this viz. */
  readonly totalPhases: number;
  /** Imperatively jump to phase N (snaps animation to phase boundary). */
  readonly jumpToPhase: (idx: number) => void;
}
export interface VizStepRegistry {
  /** Currently-mounted viz registers itself here. One viz at a time
   *  (vizzes are mutually exclusive in the panel). */
  set: (api: VizSubStepApi | null) => void;
  /** Panel reads via this — returns null if no viz registered yet. */
  get: () => VizSubStepApi | null;
}
export const VizStepApiContext = createContext<VizStepRegistry | null>(null);

/** Reusable hook each viz mounts to register its phase API with the panel.
 *  When no panel registry is present (standalone showcase pages, the
 *  Landing-page embed), this is a no-op. */
export function useRegisterVizSubStep(api: VizSubStepApi): void {
  const reg = useContext(VizStepApiContext);
  useEffect(() => {
    if (!reg) return;
    reg.set(api);
    return () => { reg.set(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reg, api.totalPhases]);
  // Keep the getPhaseIdx + jumpToPhase fresh by re-setting on every render
  // (cheap — just stores a ref). Avoids stale-closure footguns when the
  // viz's phase changes between renders.
  if (reg) reg.set(api);
}

interface Props {
  readonly isFullscreen: boolean;
  readonly onToggle: () => void;
  /** Step navigation handlers. Required for arrow-key support. */
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
  /** Theme accent colour for the button border + text. */
  readonly accent: string;
}

// 0.2.0 — onPrev / onNext kept in the prop signature for back-compat
// with the 7 viz call sites; arrow-key handling moved out (see hook).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FullscreenAffordance({ isFullscreen, onToggle, onPrev: _onPrev, onNext: _onNext, accent }: Props): JSX.Element | null {
  // 0.3.0 — Suppress entirely if a parent (e.g. the end-to-end demo
  // page) tells us to. The page provides its own outer-container
  // fullscreen so this per-viz button isn't needed AND would cause
  // unmount-during-fullscreen pop-out bugs as the auto-walk advances.
  const suppressed = useContext(FullscreenSuppressContext);
  if (suppressed) return null;
  // 0.2.0 — Arrow-key handling moved to the shared `useArrowStepNav` hook
  // (apps/web/src/hooks/useArrowStepNav.ts) so it works ALWAYS, not just
  // in fullscreen. Each viz mounts the hook directly with its stepBack /
  // stepForward callbacks. Removed from here to avoid double-firing.

  // Auto-fade the exit button on mouse-idle (only in fullscreen). 2.5s
  // of no mouse movement → fade. Movement → re-show. Standard
  // video-player pattern. Pure CSS opacity; React state only flips on
  // idle transitions, not per-frame.
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!isFullscreen) { setVisible(true); return; }
    const arm = (): void => {
      setVisible(true);
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => setVisible(false), 2500);
    };
    arm();
    const onMove = (): void => arm();
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    };
  }, [isFullscreen]);

  if (!isFullscreen) {
    // Off-state: standard "⤢ Fullscreen" tile in top-right.
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Enter fullscreen"
        title="Fullscreen"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          background: "rgba(2, 6, 23, 0.6)",
          color: accent,
          border: `1px solid ${accent}`,
          borderRadius: 6,
          padding: "5px 10px",
          cursor: "pointer",
          fontSize: 13,
          fontFamily: "ui-monospace, monospace",
          opacity: 0.85,
        }}
      >
        ⤢ Fullscreen
      </button>
    );
  }

  // On-state: discreet "✕" in bottom-right; auto-fades on idle.
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Exit fullscreen"
      title="Exit fullscreen (Esc)"
      style={{
        position: "fixed",
        bottom: 18,
        right: 18,
        zIndex: 10000,
        background: "rgba(2, 6, 23, 0.55)",
        color: accent,
        border: `1px solid ${accent}`,
        borderRadius: "50%",
        width: 36,
        height: 36,
        cursor: "pointer",
        fontSize: 16,
        fontFamily: "ui-monospace, monospace",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 0.85 : 0,
        transition: "opacity 350ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      ✕
    </button>
  );
}
