// @version 0.1.0 @date 2026-05-25
// Public "System status" strip on Settings (above About). Reinforces NoKLock's
// "don't trust, verify" stance with ONLY verifiable, non-sensitive facts plus
// ONE real health ping.
//
// VERACITY GUARDRAILS (Daniel-locked):
//   * show only verifiable facts + a real GET /v1/health ping;
//   * NEVER expose LINK balance, email-queue depth, indexer lag, or secret ages;
//   * never show a false green — if a check is unknown it reads NEUTRAL ("—" /
//     "Status unavailable"), never "Operational";
//   * the dead-man's switch is described FACTUALLY (it runs on-chain via
//     Chainlink Automation) — never asserted "live", because liveness depends
//     on LINK funding we deliberately do not surface here.

import { useEffect, useState } from "react";
import { LICENSE_ADDR, ALERTS_ADDR } from "../lib/contracts.js";
import { PUBLIC_VERSION, DEPLOY_DATE, getBuildHash } from "../lib/version.js";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

type Health = "checking" | "ok" | "unknown";

export function SystemStatus(): JSX.Element {
  const [health, setHealth] = useState<Health>("checking");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(8000) });
        if (cancelled) return;
        if (r.ok) {
          const j = (await r.json()) as { status?: string };
          setHealth(j?.status === "ok" ? "ok" : "unknown");
        } else {
          setHealth("unknown");
        }
      } catch {
        if (!cancelled) setHealth("unknown");
      }
    })();
    void (async () => {
      try {
        const r = await fetch(`${API_BASE}/updates`, { signal: AbortSignal.timeout(8000) });
        if (cancelled || !r.ok) return;
        const j = (await r.json()) as { updates?: Array<{ ymd?: string }> };
        const ymd = j?.updates?.[0]?.ymd;
        if (typeof ymd === "string") setLastUpdate(ymd);
      } catch {
        /* leave null → renders "—" */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dot = (cls: string): JSX.Element => <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />;

  return (
    <div className="card">
      <h2 className="font-bold font-display mb-1">System status</h2>
      <p className="text-text-muted text-xs mb-3">Verifiable, public facts — don't trust, verify.</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-muted">Service</span>
          <span className="flex items-center gap-2">
            {health === "checking" ? (
              <>{dot("bg-text-muted animate-pulse")}<span className="text-text-muted">Checking…</span></>
            ) : health === "ok" ? (
              <>{dot("bg-accent-green")}<span className="text-accent-green">Operational</span></>
            ) : (
              <>{dot("bg-text-muted")}<span className="text-text-muted">Status unavailable</span></>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-muted shrink-0">Inheritance</span>
          <span className="text-right">On-chain — Chainlink Automation on Polygon</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-muted shrink-0">Contracts</span>
          <a
            href={`https://polygonscan.com/address/${LICENSE_ADDR}#code`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline text-right"
          >
            {ALERTS_ADDR.toLowerCase() !== ZERO_ADDR ? "6" : "5"} source-verified on PolygonScan ↗
          </a>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-muted">App build</span>
          <span className="font-mono text-xs break-all text-right">v{PUBLIC_VERSION} · {getBuildHash()}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-muted">Mainnet deployed</span>
          <span className="font-mono">{DEPLOY_DATE}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-muted">Last update posted</span>
          <span className="font-mono">{lastUpdate ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}
