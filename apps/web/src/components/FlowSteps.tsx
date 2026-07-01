// @version 0.3.0 @date 2026-06-01
// 0.3.0 — Daniel 2026-06-01: per-step online/offline/boundary visual indicator.
//   Same visual language as the Restore strip (Phase 3): green dot for ONLINE
//   (#22c55e), deeper-yellow dot for OFFLINE (#eab308), and a split dot for
//   BOUNDARY (a transition between the two — half green / half yellow with an
//   arrow tooltip). The Enrol strip now telegraphs the air-gap topology at a
//   glance: every step card carries its state, so the user sees the gap
//   beginning at step 2 (Go offline = BOUNDARY), staying offline through the
//   crypto interior, transitioning back at step 10 (Store share locations =
//   BOUNDARY), and ending online for step 12 (Next-of-kin = on-chain NoK mint)
//   and step 13 (Done). The state is OPTIONAL — strips that don't pass it
//   render exactly as before (no visual change to Restore or anywhere else).
// 0.2.0 — Daniel: the 13-step Enrol strip rendered 6 + 6 + 1 in the old fixed
//   CSS grid (lg:grid-cols-6) — an orphaned "Done" alone on row 3. Switched
//   the layout to flex-wrap + justify-center so a partial last row CENTRES:
//   13 steps at perRow=7 → a row of 7 then a centred row of 6 (no orphan, no
//   horizontal scrollbar; any count/breakpoint centres cleanly). Boxes
//   slimmed (p-3 → p-2, tighter type) and the title now uses font-display
//   (Jura) per Daniel. The old `columns` prop (unused outside Enrol) is
//   replaced by `perRow` (target boxes per row at lg+).
// 0.1.0 — Section L1: shared "slick numbered-box grid" for multi-step flows,
//   extracted from the Restore RestoreCycle pattern (see git history).

import type { ReactNode } from "react";

/** Per-step connectivity state. Drives the small dot in the step card's
 *  top-right corner, in the same visual language as Restore Phase 3:
 *    "online"   — rich green dot (#22c55e)
 *    "offline"  — deeper yellow dot (#eab308)
 *    "boundary" — split dot (green ↔ yellow) marking a transition step
 *  Strips that don't pass a state render with no badge (backwards-compatible). */
export type FlowStepState = "online" | "offline" | "boundary";

export interface FlowStep {
  /** Stable id — used to mark active step. */
  readonly id: string;
  /** Display number (1-indexed by convention; can repeat for sub-steps). */
  readonly n: number;
  /** Short, bold title — what the step does. */
  readonly label: string;
  /** Optional one-line subhead — context for the step. */
  readonly sub?: ReactNode;
  /** Optional connectivity state — shows a small badge on the card. */
  readonly state?: FlowStepState;
  /** 0.4.0 — who does the work on this step (Daniel 2026-06-15: make the
   *  NoKLock-automated steps vs the user-action steps visually distinct so the
   *  workload doesn't read as 13 manual steps). "noklock" = cyan ring + "auto"
   *  tag; "you" = amber ring + "you" tag. Omitted → no actor chrome. */
  readonly actor?: "noklock" | "you";
  /** 0.4.0 — mark a skippable step (Daniel 2026-06-15: "ensure optional is on
   *  every box where it is optional"). Renders a small "OPTIONAL" tag. */
  readonly optional?: boolean;
}

export interface FlowStepsProps {
  readonly steps: readonly FlowStep[];
  /** Id of the currently-active step. Highlights that box; others dim. */
  readonly activeId?: string;
  /** Target boxes per row at lg+ (mobile/sm always wrap narrower). Default 6. */
  readonly perRow?: 5 | 6 | 7;
}

const STATE_COLORS = {
  online: "#22c55e",
  offline: "#eab308",
} as const;

const STATE_TITLE: Record<FlowStepState, string> = {
  online: "Online — connected (network used in this step)",
  offline: "Offline — air-gapped (no network during this step)",
  boundary: "Boundary — transition between online and offline",
};

/** Renders the small per-step connectivity badge. Green/yellow dot, or a
 *  half/half split with an arrow for boundary steps. Inline SVG keeps the
 *  badge crisp and avoids extra CSS. */
function StateBadge({ state }: { readonly state: FlowStepState }): JSX.Element {
  const title = STATE_TITLE[state];
  if (state === "boundary") {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        aria-label={title}
        className="shrink-0"
      >
        <title>{title}</title>
        {/* Left half = green (online side) */}
        <path d="M6 1 A5 5 0 0 0 6 11 Z" fill={STATE_COLORS.online} />
        {/* Right half = yellow (offline side) */}
        <path d="M6 1 A5 5 0 0 1 6 11 Z" fill={STATE_COLORS.offline} />
        {/* Thin divider for crispness */}
        <line x1="6" y1="1" x2="6" y2="11" stroke="rgba(0,0,0,0.35)" strokeWidth="0.6" />
      </svg>
    );
  }
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-label={title}
      className="shrink-0"
    >
      <title>{title}</title>
      <circle cx="5" cy="5" r="4.5" fill={STATE_COLORS[state]} />
    </svg>
  );
}

// Literal class strings (Tailwind JIT must see each whole). Basis is set a
// touch under 100/n % so the inter-box gap fits and justify-center centres
// both the slack and any partial last row. lg sizing assumes the max-w-6xl
// route container (~1120px), where 7 boxes fit comfortably.
const BASIS: Record<5 | 6 | 7, string> = {
  5: "basis-[46%] sm:basis-[30%] lg:basis-[18%]",
  6: "basis-[46%] sm:basis-[30%] lg:basis-[15%]",
  7: "basis-[46%] sm:basis-[30%] lg:basis-[12.5%]",
};

export function FlowSteps({ steps, activeId, perRow = 6 }: FlowStepsProps): JSX.Element {
  const basis = BASIS[perRow];
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
      {steps.map((s) => {
        const isActive = activeId === s.id;
        const isDimmed = activeId !== undefined && !isActive;
        // 0.4.0 — actor chrome (who does the work). A subtle ring so it reads
        // alongside (not instead of) the active/dimmed state + the connectivity
        // badge. noklock = cyan, you = amber.
        const actorRing = s.actor === "noklock" ? " ring-1 ring-accent-cyan/40" : s.actor === "you" ? " ring-1 ring-amber-400/40" : "";
        const cls = `${basis} rounded-lg border p-2 text-center transition-colors ${
          isActive
            ? "grad-bg text-text-primary border-transparent"
            : isDimmed
            ? "bg-bg-surface/40 border-bg-surface text-text-on-dark/60"
            : "bg-bg-surface border-bg-surface text-text-on-dark"
        }${actorRing}`;
        return (
          <div key={s.id} className={`${cls} relative`}>
            {s.state && (
              <div className="absolute top-1 right-1">
                <StateBadge state={s.state} />
              </div>
            )}
            <div className={`text-[11px] font-mono leading-none ${isActive ? "text-text-primary/80" : "text-text-muted"}`}>{s.n}</div>
            <div className="font-display font-bold text-[13px] leading-tight mt-0.5">{s.label}</div>
            {s.sub && (
              <div className={`text-[10px] mt-0.5 leading-tight ${isActive ? "text-text-primary/85" : "text-text-muted"}`}>
                {s.sub}
              </div>
            )}
            {s.actor && (
              <div className={`text-[8px] uppercase tracking-wide font-bold mt-0.5 ${isActive ? "text-text-primary/80" : s.actor === "noklock" ? "text-accent-cyan/80" : "text-amber-300/80"}`}>
                {s.actor === "noklock" ? "auto" : "you"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
