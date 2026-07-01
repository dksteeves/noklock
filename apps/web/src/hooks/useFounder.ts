// @version 0.2.0 @date 2026-06-08
// 0.2.0 — Add useManagedFounderStats() reading from Form B's NEW
//         /v1/founder/managed-stats endpoint (Agent 3). Pricing.tsx surfaces
//         the SEPARATE managed-mode founder counter (strawman §9.2: Form-B
//         8-char referral codes for managed AND a separate 10,000 founder
//         counter for managed mints). Same { cap, claimed, remaining, ok }
//         shape as the self-custody useFounderStats so the consumer code is
//         symmetric.
// 0.1.0 — Global Founder counter + per-wallet founder status, read from
//         Form B (/v1/founder/*), derived purely from the on-chain
//         LicenceMinted events its indexer records. Best-effort: if Form B
//         is unreachable the UI just hides the counter / pill (never blocks).

import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

export interface FounderStats {
  readonly cap: number;
  readonly claimed: number;
  readonly remaining: number;
  readonly ok: boolean; // false = stats unavailable (hide the UI)
}

function useFounderStatsFromPath(path: string): FounderStats {
  const [s, setS] = useState<FounderStats>({ cap: 0, claimed: 0, remaining: 0, ok: false });
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const r = await fetch(`${API_BASE}${path}`);
        if (!r.ok) return;
        const j = (await r.json()) as { cap?: number; claimed?: number; remaining?: number };
        if (!alive || typeof j.cap !== "number") return;
        setS({
          cap: j.cap,
          claimed: j.claimed ?? 0,
          remaining: j.remaining ?? Math.max(0, j.cap - (j.claimed ?? 0)),
          ok: true,
        });
      } catch { /* hide on failure */ }
    })();
    return () => { alive = false; };
  }, [path]);
  return s;
}

/** Self-custody founder counter (existing 0.1.0 endpoint). */
export function useFounderStats(): FounderStats {
  return useFounderStatsFromPath("/founder/stats");
}

/** Managed-mode founder counter (NEW 0.2.0 — Agent 3 endpoint). Same shape
 *  as useFounderStats; surfaced separately in Pricing because the managed
 *  founder cap is a distinct 10,000-mint counter (strawman §9.2). */
export function useManagedFounderStats(): FounderStats {
  return useFounderStatsFromPath("/founder/managed-stats");
}

export function useIsFounder(address?: string): { founder: boolean; ordinal: number | null } {
  const [v, setV] = useState<{ founder: boolean; ordinal: number | null }>({ founder: false, ordinal: null });
  useEffect(() => {
    if (!address) { setV({ founder: false, ordinal: null }); return; }
    let alive = true;
    void (async () => {
      try {
        const r = await fetch(`${API_BASE}/founder/${address}`);
        if (!r.ok) return;
        const j = (await r.json()) as { founder?: boolean; ordinal?: number | null };
        if (alive) setV({ founder: !!j.founder, ordinal: j.ordinal ?? null });
      } catch { /* leave default (not shown) */ }
    })();
    return () => { alive = false; };
  }, [address]);
  return v;
}
