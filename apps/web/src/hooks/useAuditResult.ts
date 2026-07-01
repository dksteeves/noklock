// @version 0.2.1 @date 2026-05-19
// 0.2.1 — REGRESSION FIX: Form B /v1/audit returns score as a STRING;
//         0.2.0 passed it through typed as number → TrustBlock did
//         score.toFixed() → "o.toFixed is not a function" → ErrorBoundary
//         took down the whole Landing page. Now coerced to number|null.
// 0.2.0 — VERACITY (audit B1): was calling a non-existent endpoint
//         (/audit/results/:addr on the dead Form A WP plugin) so the
//         Landing TrustBlock rendered NOTHING in prod while
//         CompetitorTable advertised "Live SolidityScan score — UNIQUE"
//         (false). Now reads the REAL Form B endpoint GET /v1/audit
//         ({reports:[{title,url,score,contract,added_at}]}) and picks
//         the newest report for the given contract. Default base fixed
//         to api.noklock.app/v1 (was the superseded tenza.one host).
//
// useAuditResult — most recent published SolidityScan report for a
// contract address, from Form B. Used by the public TrustBlock.

import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.noklock.app/v1";

export interface AuditResult {
  readonly uuid: string;
  readonly contract: string;
  readonly chain: string;
  readonly status: string;
  readonly score: number | null;
  readonly severity_counts: {
    critical: number; high: number; medium: number; low: number; informational: number; gas: number;
  } | null;
  readonly report_url: string | null;
  readonly report_hash: string | null;
  readonly updated_at: string;
}

export interface UseAuditResultState {
  readonly result: AuditResult | null;
  readonly loading: boolean;
  readonly error: string | null;
}

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

export function useAuditResult(contract: string | null | undefined): UseAuditResultState {
  // Skip query for unset / zero-address contracts (pre-mainnet-deploy state).
  const enabled =
    !!contract &&
    /^0x[a-fA-F0-9]{40}$/.test(contract) &&
    contract.toLowerCase() !== ZERO_ADDR;

  const q = useQuery({
    queryKey: ["audit-result", contract?.toLowerCase()],
    queryFn: async (): Promise<AuditResult | null> => {
      if (!contract) return null;
      const r = await fetch(`${BASE}/audit`);
      if (!r.ok) throw new Error(`audit fetch ${r.status}`);
      const body = (await r.json()) as {
        // Form B stores score as TEXT (string | null) — NOT a number.
        reports?: { title: string; url: string; score: string | number | null; contract: string | null; added_at: number }[];
      };
      const want = contract.toLowerCase();
      // Newest report for THIS contract (rows already added_at DESC).
      const hit = (body.reports ?? []).find(
        (x) => (x.contract ?? "").toLowerCase() === want,
      );
      if (!hit) return null;
      // Coerce the string score to a real number (or null) so consumers
      // can safely call .toFixed() — TrustBlock crashed the whole Landing
      // page otherwise ("o.toFixed is not a function").
      const sNum =
        hit.score === null || hit.score === undefined || hit.score === ""
          ? null
          : typeof hit.score === "number"
            ? hit.score
            : Number(hit.score);
      const score = sNum !== null && Number.isFinite(sNum) ? sNum : null;
      return {
        uuid: hit.url,
        contract: hit.contract ?? contract,
        chain: "polygon",
        status: "published",
        score,
        // Form B publishes the headline score + report link; per-severity
        // counts are not stored there (the full report URL has them).
        severity_counts: null,
        report_url: hit.url || null,
        report_hash: null,
        updated_at: new Date((hit.added_at || 0) * 1000).toISOString(),
      };
    },
    enabled,
    staleTime: 5 * 60_000,
  });

  return {
    result: (q.data as AuditResult | null) ?? null,
    loading: q.isLoading,
    error: q.error ? (q.error as Error).message : null,
  };
}
