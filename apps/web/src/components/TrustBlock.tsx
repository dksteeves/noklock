// @version 0.2.0 @date 2026-05-20
// 0.2.0 — Section B + §P SBT-visibility: relabelled "SolidityScan audit"
//         → "basic SolidityScan review" (honest — free-tier scoring, not a
//         full audit). "Full report" link → "Verified Source (PolygonScan)"
//         pointing at the contract's PolygonScan source page (the real
//         provenance signal; SolidityScan free-tier doesn't share PDF/link
//         externally). Also gained a noteSlot prop so the Landing page
//         can render a single explainer line under the 3 cards
//         ("All three verified on PolygonScan. SBT = soulbound ERC-5192 —
//         rare in production, mandatory for autonomous on-chain
//         inheritance.").
// 0.1.1 — Hardened: score coerced to number|null defensively.
// 0.1.0 — TrustBlock initial.
//
// TrustBlock — renders a basic SolidityScan review summary for one deployed
// contract. Used in the Landing hero strip + on /info under Architecture.
// Quietly hides itself if no scan has run yet.

import { useAuditResult } from "../hooks/useAuditResult.js";

interface Props {
  readonly contractLabel: string;
  readonly contractAddress: string;
  readonly compact?: boolean;
}

export function TrustBlock({ contractLabel, contractAddress, compact }: Props): JSX.Element | null {
  const { result, loading } = useAuditResult(contractAddress);

  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") return null;
  if (loading && !result) {
    return (
      <div className={`${compact ? "p-3" : "card"} text-xs text-text-muted`}>
        Loading audit for {contractLabel}…
      </div>
    );
  }
  if (!result) return null;

  // Defensive: a non-number score must NEVER crash the Landing page
  // (this whole block is inside the home route). Coerce anything that
  // isn't a finite number to null → renders "—".
  const rawScore: unknown = result.score;
  const score: number | null =
    typeof rawScore === "number" && Number.isFinite(rawScore)
      ? rawScore
      : typeof rawScore === "string" && rawScore.trim() !== "" && Number.isFinite(Number(rawScore))
        ? Number(rawScore)
        : null;
  const sev = result.severity_counts ?? { critical: 0, high: 0, medium: 0, low: 0, informational: 0, gas: 0 };
  const scoreBand = score === null ? "muted" : score >= 90 ? "green" : score >= 75 ? "teal" : score >= 50 ? "cyan" : "danger";
  const scoreColor = scoreBand === "green" ? "var(--accent-green)" : scoreBand === "teal" ? "var(--accent-teal)" : scoreBand === "cyan" ? "var(--accent-cyan)" : scoreBand === "danger" ? "var(--danger)" : "var(--text-muted)";

  return (
    <div className={compact ? "p-3 rounded border border-bg-surface bg-bg-panel" : "card"}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-text-muted">{contractLabel} · basic SolidityScan review</div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="font-display font-bold text-3xl" style={{ color: scoreColor }}>
              {score === null ? "—" : score.toFixed(1)}
            </span>
            <span className="text-xs text-text-muted font-mono">/ 100</span>
          </div>
        </div>
        <div className="text-xs text-text-muted text-right space-y-0.5">
          <div><span className="text-danger">C {sev.critical}</span> · <span className="text-amber-400">H {sev.high}</span></div>
          <div>M {sev.medium} · L {sev.low}</div>
          <div className="text-text-muted/60">I {sev.informational} · G {sev.gas}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <a href={`https://polygonscan.com/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline font-mono">
          {contractAddress.slice(0, 8)}…{contractAddress.slice(-6)}
        </a>
        <a href={`https://polygonscan.com/address/${contractAddress}#code`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">
          Verified Source (PolygonScan) →
        </a>
      </div>
      <div className="mt-1 text-xs text-text-muted/70">
        Scanned {new Date(result.updated_at).toISOString().slice(0, 16).replace("T", " ")}Z
      </div>
    </div>
  );
}
