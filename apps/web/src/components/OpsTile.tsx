// @version 0.1.0 @date 2026-05-20
// Traffic-light tile for the Ops Manual live-status board. Green = healthy,
// amber = warn / due-soon, rose = escalate / overdue, slate = pending /
// unavailable. Compact, consistent.

import type { ReactNode } from "react";

export type OpsBand = "ok" | "warn" | "bad" | "muted";

export interface OpsTileProps {
  readonly title: string;
  readonly value: ReactNode;
  readonly band?: OpsBand;
  readonly expected?: string;
  readonly sub?: ReactNode;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly onRefresh?: () => void;
}

export function OpsTile({ title, value, band = "muted", expected, sub, loading, error, onRefresh }: OpsTileProps): JSX.Element {
  const valueColor =
    band === "ok"   ? "text-accent-teal" :
    band === "warn" ? "text-amber-300"   :
    band === "bad"  ? "text-danger"      :
                      "text-text-on-dark/80";
  return (
    <div className="card flex flex-col gap-2 min-h-[120px]">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-bold text-text-on-dark text-sm">{title}</h4>
        {onRefresh && (
          <button onClick={onRefresh} title="Refresh" className="text-xs text-accent-cyan hover:underline">
            ↻
          </button>
        )}
      </div>
      <div className={`font-display font-bold text-2xl ${valueColor}`}>
        {loading ? <span className="text-text-muted/70 text-sm">loading…</span> : error ? <span className="text-danger text-sm">error</span> : value}
      </div>
      {expected && <div className="text-xs text-text-muted">expected: {expected}</div>}
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
      {error && <div className="text-xs text-danger break-words">{error}</div>}
    </div>
  );
}
