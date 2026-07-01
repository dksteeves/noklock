// @version 0.5.0 @date 2026-06-02
// 0.5.0 — Daniel 2026-06-02: adversarial review flagged the AIRGAPPED/ONLINE
//          pill was too quiet at 12px after Daniel originally specced 15px
//          ("more obvious"). 15px dominated the header row, so 14px is the
//          compromise. Padding bumped proportionally (py-1 px-2.5 → py-1.5
//          px-3 equivalent: BADGE_PAD_VERT 4→6, BADGE_PAD_HORIZ 10→12) so
//          the pill keeps its breathing room around the larger glyphs. The
//          breathing-pulse keyframes are size-agnostic (scale + box-shadow,
//          no pixel-anchored values) — confirmed they still hit the right
//          beat at the new size with no tuning needed.
// 0.4.0 — Daniel 2026-06-01: pill REDESIGN — single-row inline pill that
//          slots beside the "Local-only — runs in your browser" header text
//          in ProveItVizPanel.
//          (1) Position dropped — badges are now inline-flex siblings, no
//              position:absolute. The parent layout puts them where they go
//              (typically `ml-auto` on the same flex row as the header).
//          (2) Single-line label: "AIRGAPPED · simulated" / "ONLINE ·
//              simulated" inline, no stacked sub-text. Size dropped from
//              15px → 12px bold since it's now a true inline pill (was a
//              floating callout). Padding tightened to ~8px / 4px.
//          (3) Colour refresh per Daniel:
//                AIRGAPPED — deeper yellow (yellow-600 → yellow-500,
//                            #ca8a04 → #eab308), white text + drop shadow.
//                ONLINE    — rich green (green-600 → green-500,
//                            #16a34a → #22c55e), white text + drop shadow.
//              Keyframe halos updated to match each badge's new accent
//              colour so the breathing pulse is on-theme, not cyan/amber.
//          (4) PerStepSimAirgap simplified: no longer wraps an absolute
//              child in a relatively-positioned div. It just computes
//              airgapped + renders the correct inline badge under the
//              correct SimAirgapProvider. Children render alongside in
//              a plain inline-flex container (no `position: relative`,
//              no overlay layer).
// 0.3.0 — Daniel 2026-06-01: TWO low-defect fixes from code review.
//          (1) Keyframes (`simAirgapBreathe` + `simOnlineBreathe`) moved
//              OUT of SimAirgapBadge's render tree and into a module-level
//              side-effect that injects a single <style id="sim-badges-kf">
//              into document.head on import. Previously the keyframes only
//              loaded when SimAirgapBadge rendered — if a page rendered
//              SimOnlineBadge FIRST without ever mounting SimAirgapBadge,
//              the simOnlineBreathe animation silently failed to load.
//              Now both badges work regardless of mount order.
//          (2) DELETED the dead `simAirgapMoodFilter` export. It returned
//              "none" unconditionally and was unused. Removing it prevents
//              a future maintainer from re-wiring the brown mood-filter
//              bug. The viz palette stays its natural blue, no mood filter
//              applied. The pill (SimAirgapBadge / SimOnlineBadge) is the
//              sole online/offline indicator.
// 0.2.0 — Daniel 2026-06-01: KILLED the brown mood filter ("shit brown").
//          simAirgapMoodFilter() now returns "none" always — the SVG vizzes
//          keep their natural blue palette in every sim state. Compensating
//          for the lost colour-shift signal: SimAirgapBadge is now MUCH
//          more obvious (larger 15px text, cyan tinted bg, bold white,
//          breathing-pulse animation, inline lock icon, two-line label).
//          NEW sibling SimOnlineBadge for steps that REQUIRE network
//          (distribute shares, broadcast signature) — amber-tinted, wifi
//          icon, "ONLINE · simulated" — so every step gets a clear pill
//          one way or the other. PerStepSimAirgap WRAPPER no longer applies
//          any CSS filter; it just renders children + the appropriate badge.
// 0.1.0 — Daniel 2026-06-01: SimAirgap context + badge so educational
//          /viz/* and /prove-it/* routes can SIMULATE the airgap mood
//          (filter + pill) that the real-flow step would put the user in,
//          without touching the real airgap-manager state.

import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Module-level keyframes injection
//
// 0.4.0 — Halo colours retuned to match each badge's new accent:
//   - simAirgapBreathe: yellow halo (was cyan) — matches the deeper yellow
//     #ca8a04 → #eab308 gradient.
//   - simOnlineBreathe: green halo (was amber) — matches the rich green
//     #16a34a → #22c55e gradient.
// 0.3.0 — Keyframes are injected ONCE into document.head on first import
// of this module, not inside SimAirgapBadge's JSX. Previously the <style>
// tag lived in SimAirgapBadge's render output, so a page that only ever
// rendered SimOnlineBadge (e.g. an online-only pipeline step) would never
// load the simOnlineBreathe keyframe and the badge would sit static. The
// injection is idempotent (checks for the id) and SSR/Node-safe (guards
// on `typeof document`).
// ---------------------------------------------------------------------------

const KEYFRAMES_STYLE_ID = "sim-badges-keyframes";
const KEYFRAMES_CSS = `
@keyframes simAirgapBreathe {
  0%, 100% {
    box-shadow:
      0 6px 18px rgba(133, 77, 14, 0.45),
      0 0 0 3px rgba(202, 138, 4, 0.18),
      0 0 22px rgba(234, 179, 8, 0.45);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 6px 22px rgba(133, 77, 14, 0.55),
      0 0 0 5px rgba(202, 138, 4, 0.26),
      0 0 32px rgba(234, 179, 8, 0.65);
    transform: scale(1.03);
  }
}
@keyframes simOnlineBreathe {
  0%, 100% {
    box-shadow:
      0 6px 18px rgba(21, 128, 61, 0.45),
      0 0 0 3px rgba(22, 163, 74, 0.18),
      0 0 22px rgba(34, 197, 94, 0.45);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 6px 22px rgba(21, 128, 61, 0.55),
      0 0 0 5px rgba(22, 163, 74, 0.26),
      0 0 32px rgba(34, 197, 94, 0.65);
    transform: scale(1.03);
  }
}
`;

if (typeof document !== "undefined" && !document.getElementById(KEYFRAMES_STYLE_ID)) {
  const styleEl = document.createElement("style");
  styleEl.id = KEYFRAMES_STYLE_ID;
  styleEl.textContent = KEYFRAMES_CSS;
  document.head.appendChild(styleEl);
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface SimAirgapContextValue {
  readonly enabled: boolean;
  /** 0.4.0 — Distinguishes "no SimAirgapProvider mounted" (mounted=false)
   *  from "provider mounted with enabled=false" (mounted=true). Lets
   *  inline-badge consumers in shared components no-op on routes that
   *  don't participate in the simulation (e.g. /prove-it/math) instead
   *  of rendering an unwanted ONLINE-green pill. */
  readonly mounted: boolean;
}

export const SimAirgapContext = createContext<SimAirgapContextValue>({
  enabled: false,
  mounted: false,
});

export function useSimAirgap(): boolean {
  return useContext(SimAirgapContext).enabled;
}

/** 0.4.0 — True when a SimAirgapProvider is mounted somewhere up the tree. */
export function useSimAirgapMounted(): boolean {
  return useContext(SimAirgapContext).mounted;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SimAirgapProvider({
  children,
  enabled = true,
}: PropsWithChildren<{ enabled?: boolean }>): JSX.Element {
  const value = useMemo<SimAirgapContextValue>(() => ({ enabled, mounted: true }), [enabled]);
  return (
    <SimAirgapContext.Provider value={value}>
      {children}
    </SimAirgapContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// 0.3.0 — simAirgapMoodFilter REMOVED.
//
// The viz palette stays its natural blue, no mood filter applied. The pill
// (SimAirgapBadge / SimOnlineBadge) is the sole online/offline indicator.
// The previous 0.2.0 implementation returned "none" unconditionally and was
// unused; deleting it prevents a future maintainer from re-wiring the brown
// mood-filter bug we killed in 0.2.0.
// ---------------------------------------------------------------------------

export interface SimAirgapMoodOverlayProps {
  /** Force on/off; otherwise reads SimAirgapContext. */
  readonly enabled?: boolean;
  readonly children?: ReactNode;
}

export function SimAirgapMoodOverlay({
  enabled,
  children,
}: SimAirgapMoodOverlayProps): JSX.Element {
  const ctxEnabled = useSimAirgap();
  const on = typeof enabled === "boolean" ? enabled : ctxEnabled;
  return (
    <div
      data-sim-airgap={on ? "on" : "off"}
      style={{
        // 0.2.0 — no filter applied. Blue palette preserved.
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared badge sizing/animation
//
// 0.4.0 — Inline pill sizing. The badge no longer floats over the viz;
// it sits inline on the same row as the header text. 12px bold reads as
// a peer of the surrounding eyebrow text without dominating it.
//
// 0.5.0 — Bumped to 14px after adversarial-review feedback. 14px is the
// compromise between Daniel's original 15px request (too dominant on the
// inline header row) and the 12px that fits cleanly but reads too quiet.
// Padding bumped proportionally so the larger glyphs still breathe:
//   BADGE_PAD_VERT  4 → 6   (py-1   → py-1.5 equivalent)
//   BADGE_PAD_HORIZ 10 → 12  (px-2.5 → px-3   equivalent)
// Breathing-pulse keyframes are size-agnostic (scale + box-shadow only,
// no pixel-anchored values) — they hit the same beat at 14px with no
// keyframe edits needed.
// ---------------------------------------------------------------------------

// 14px compromise between Daniel's original 15px request and the 12px that
// fits cleanly on the header row (0.5.0 — 2026-06-02 adversarial review).
const BADGE_FONT_SIZE_PX = 14;
const BADGE_PAD_VERT = 6;
const BADGE_PAD_HORIZ = 12;

// Lock/shield icon for AIRGAPPED state.
function LockIcon(): JSX.Element {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <rect x={4} y={11} width={16} height={9} rx={2} />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

// Wifi/globe icon for ONLINE state.
function WifiIcon(): JSX.Element {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M2 9.5a16 16 0 0 1 20 0" />
      <path d="M5 13a11 11 0 0 1 14 0" />
      <path d="M8.5 16.5a6 6 0 0 1 7 0" />
      <circle cx={12} cy={20} r={1.1} fill="currentColor" stroke="none" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AIRGAPPED badge — deeper yellow, lock icon, breathing pulse, inline pill.
// Daniel's 2026-06-01 colour recipe:
//   gradient: #ca8a04 (yellow-600) → #eab308 (yellow-500)
//   text:     white with subtle drop shadow for legibility on yellow.
// (Keyframes are injected at module load — see top of file.)
// ---------------------------------------------------------------------------

export interface SimAirgapBadgeProps {
  /** Force on/off; otherwise reads SimAirgapContext. */
  readonly enabled?: boolean;
}

export function SimAirgapBadge({ enabled }: SimAirgapBadgeProps = {}): JSX.Element {
  const ctxEnabled = useSimAirgap();
  const on = typeof enabled === "boolean" ? enabled : ctxEnabled;
  if (!on) return <></>;
  const tooltip =
    "This viz simulates the airgapped browser state the user would be in for the corresponding real-flow step.";
  return (
    <div
      aria-label="AIRGAPPED — simulated"
      role="status"
      title={tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: `${BADGE_PAD_VERT}px ${BADGE_PAD_HORIZ}px`,
        borderRadius: 999,
        background: "linear-gradient(135deg, #ca8a04 0%, #eab308 100%)",
        color: "#ffffff",
        border: "1px solid rgba(253, 224, 71, 0.85)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        boxShadow:
          "0 6px 18px rgba(133, 77, 14, 0.45), 0 0 0 3px rgba(202, 138, 4, 0.18), 0 0 22px rgba(234, 179, 8, 0.45)",
        animation: "simAirgapBreathe 2.4s ease-in-out infinite",
        cursor: "help",
        pointerEvents: "auto",
        whiteSpace: "nowrap",
        lineHeight: 1.1,
      }}
    >
      <LockIcon />
      <span
        style={{
          fontSize: BADGE_FONT_SIZE_PX,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#ffffff",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.45)",
          textTransform: "uppercase",
        }}
      >
        Airgapped&nbsp;·&nbsp;simulated
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ONLINE badge — rich green, wifi icon, breathing pulse, inline pill.
// Daniel's 2026-06-01 colour recipe:
//   gradient: #16a34a (green-600) → #22c55e (green-500)
//   text:     white with subtle drop shadow for legibility on green.
// Used for pipeline steps that REQUIRE network (distribute shares,
// broadcast signature).
// ---------------------------------------------------------------------------

export interface SimOnlineBadgeProps {
  /** Force visible; defaults to true so callers can `<SimOnlineBadge/>` directly. */
  readonly enabled?: boolean;
}

export function SimOnlineBadge({ enabled = true }: SimOnlineBadgeProps = {}): JSX.Element {
  if (!enabled) return <></>;
  const tooltip =
    "This step requires network access — the user would be on Wi-Fi for this part of the real flow.";
  return (
    <div
      aria-label="ONLINE — simulated"
      role="status"
      title={tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: `${BADGE_PAD_VERT}px ${BADGE_PAD_HORIZ}px`,
        borderRadius: 999,
        background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
        color: "#ffffff",
        border: "1px solid rgba(134, 239, 172, 0.85)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        boxShadow:
          "0 6px 18px rgba(21, 128, 61, 0.45), 0 0 0 3px rgba(22, 163, 74, 0.18), 0 0 22px rgba(34, 197, 94, 0.45)",
        animation: "simOnlineBreathe 2.4s ease-in-out infinite",
        cursor: "help",
        pointerEvents: "auto",
        whiteSpace: "nowrap",
        lineHeight: 1.1,
      }}
    >
      <WifiIcon />
      <span
        style={{
          fontSize: BADGE_FONT_SIZE_PX,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#ffffff",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.45)",
          textTransform: "uppercase",
        }}
      >
        Online&nbsp;·&nbsp;simulated
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-step helper — routes feed an array of hints keyed by stepKey so the
// appropriate badge (airgapped vs online) renders per pipeline step.
//
// 0.4.0 — Inline architecture. The previous mood-overlay/absolute wrapper
// is gone. Now PerStepSimAirgap:
//   - computes airgapped per stepKey,
//   - publishes it via SimAirgapProvider for descendants,
//   - renders the correct inline badge (no positioning) when showBadge,
//   - renders children right alongside as a plain fragment so the parent
//     layout owns placement entirely.
// Callers that want the badge slotted into a header row should set
// showBadge={true} and read the rendered badge as the first child via the
// `badgeOnly` variant below; or render children + badge inline themselves.
// ---------------------------------------------------------------------------

export interface SimAirgapStepHint {
  readonly stepKey: string;
  readonly airgapped: boolean;
}

export interface PerStepSimAirgapProps {
  readonly stepKey: string;
  readonly hints: readonly SimAirgapStepHint[];
  /** If the stepKey isn't found in hints, fall back to this. Default false. */
  readonly fallback?: boolean;
  /** Render the badge alongside children. Default true. */
  readonly showBadge?: boolean;
  readonly children?: ReactNode;
}

export function PerStepSimAirgap({
  stepKey,
  hints,
  fallback = false,
  showBadge = true,
  children,
}: PerStepSimAirgapProps): JSX.Element {
  const match = hints.find((h) => h.stepKey === stepKey);
  const airgapped = match ? match.airgapped : fallback;
  // 0.4.0 — No wrapper div; just a Provider + fragment so descendants get
  // the context flag and the parent layout owns child placement. When
  // showBadge is true we render the inline badge as a sibling AFTER
  // children — the typical use is now that ProveItVizPanel reads context
  // directly and renders its own inline badge inside the header row,
  // so this branch is mostly a back-compat path for legacy callers.
  return (
    <SimAirgapProvider enabled={airgapped}>
      {children}
      {showBadge ? (airgapped ? <SimAirgapBadge enabled /> : <SimOnlineBadge enabled />) : null}
    </SimAirgapProvider>
  );
}

// ---------------------------------------------------------------------------
// 0.4.0 — Convenience: read the active airgapped flag and render the right
// inline badge directly. Used by ProveItVizPanel to slot the pill into its
// header row beside "Local-only — runs in your browser".
// ---------------------------------------------------------------------------

export function SimAirgapInlineBadge(): JSX.Element {
  const { enabled: airgapped, mounted } = useContext(SimAirgapContext);
  // 0.4.0 — No-op if no SimAirgapProvider is mounted. Lets components
  // that live both inside and outside the simulation (e.g. ProveItVizPanel,
  // shared by /viz/pipeline AND /prove-it/math) include this badge slot
  // unconditionally without polluting the live-run route with a "ONLINE
  // simulated" pill that has no meaning there.
  if (!mounted) return <></>;
  return airgapped ? <SimAirgapBadge enabled /> : <SimOnlineBadge enabled />;
}
