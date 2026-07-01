// @version 0.2.0 @date 2026-05-30
// 0.2.0 — Active row auto-scrolls into view via a ref + useEffect on
//         activeKey change. Previously the user had to manually scroll
//         to see which step had just lit up during the auto-walk.
// ProveStepLog — left-pane scrollable step log for /prove-it-v2. Each
// step renders as a compact row: ✔ icon + title + (ms) on right. The
// active step is highlighted; completed steps are checked; pending
// steps are dim. Clicking a completed row jumps the right-pane viz to
// that step.
//
// Kept small + opinionated. The detailed per-step BYTE values still live
// in <ProveItVizPanel/>'s "Show me the data" toggle — this log just
// drives the visual progression and lets the user pick a step to inspect.

import { useEffect, useRef } from "react";
import type { ProveItStepKey } from "./ProveItVizPanel.js";

export interface ProveLogEntry {
  /** Matches the existing TestProve StepLog.key field — drives viz dispatch. */
  readonly key: ProveItStepKey | string;
  /** One-line title. */
  readonly title: string;
  /** Wall-clock milliseconds the step took (0 if not measured). */
  readonly ms: number;
  /** Whether the step completed successfully. false = explicit fail. */
  readonly ok: boolean;
}

interface Props {
  readonly entries: readonly ProveLogEntry[];
  /** Total expected step count — drives the "x / N" progress label. */
  readonly totalSteps: number;
  /** Currently-active step key. Highlights its row. */
  readonly activeKey: string | null;
  /** Click handler — fired when a completed row is clicked. */
  readonly onPickStep: (key: string) => void;
  /** Whether the live pipeline is currently running (drives header label). */
  readonly running: boolean;
}

export function ProveStepLog({ entries, totalSteps, activeKey, onPickStep, running }: Props): JSX.Element {
  const completed = entries.length;
  const pct = totalSteps > 0 ? Math.min(100, Math.round((completed / totalSteps) * 100)) : 0;
  const activeRowRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    if (activeKey && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeKey]);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold">
            Pipeline steps
          </div>
          <h3 className="text-base font-bold font-display mt-0.5">
            {running ? "Running…" : completed === 0 ? "Idle" : completed >= totalSteps ? "Complete" : "Partial"}
          </h3>
        </div>
        <span className="text-xs font-mono text-text-muted">{completed} / {totalSteps}</span>
      </div>

      <div className="h-1.5 bg-bg-deepest rounded overflow-hidden border border-bg-surface mb-3">
        <div
          className="h-full transition-all duration-300 ease-out grad-bg"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="space-y-1 overflow-y-auto" style={{ minHeight: 0, flex: 1 }}>
        {entries.length === 0 && (
          <li className="text-xs text-text-muted py-3 px-2">
            No steps yet. Click <span className="text-accent-cyan">Generate</span> then{" "}
            <span className="text-accent-cyan">Prove</span> to populate.
          </li>
        )}
        {entries.map((e, i) => {
          const active = e.key === activeKey;
          return (
            <li key={`${e.key}-${i}`} ref={active ? activeRowRef : null}>
              <button
                type="button"
                onClick={() => onPickStep(String(e.key))}
                className={
                  "w-full text-left px-2.5 py-2 rounded text-sm transition-colors flex items-center gap-2 " +
                  (active
                    ? "bg-accent-cyan/15 border border-accent-cyan/50"
                    : e.ok
                      ? "border border-transparent hover:bg-bg-surface/40"
                      : "border border-rose-500/40 bg-rose-950/20")
                }
              >
                <span
                  aria-hidden
                  className={
                    "inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold flex-shrink-0 " +
                    (e.ok
                      ? "bg-emerald-700/50 text-emerald-300"
                      : "bg-rose-700/60 text-rose-200")
                  }
                >
                  {e.ok ? "✓" : "✗"}
                </span>
                <span className={"flex-1 truncate " + (active ? "text-accent-cyan font-medium" : e.ok ? "text-text-on-dark/90" : "text-rose-200")}>
                  {e.title}
                </span>
                {e.ms > 0 && (
                  <span className="font-mono text-[10px] text-text-muted whitespace-nowrap">{e.ms} ms</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
