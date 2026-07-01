// @version 0.1.0 @date 2026-06-08
// Thin Form-B fetch wrapper for the signed-in managed-mode user's referral
// code (the NK-MGMT-XXXX 12-char code surfaced on /refer). Used by Refer.tsx
// when useWalletGate reports kind === 'managed' — the user's link is then
// `${SITE}/?ref=${code}` instead of `${SITE}/?ref=${address}`.
//
// Endpoint contract (Agent 3 / Form B):
//   GET /v1/managed-referrals/me
//     200 { code: "NK-MGMT-X3K9" }       — user has a managed referral code
//     404 { error: "not-managed" }       — caller is not in managed mode
//     <other>                            — treat as "unavailable" (null)
//
// Best-effort: any failure (network, 4xx other than 404, JSON-shape mismatch)
// returns { code: null, ok: false } so the UI can fall back to the
// self-custody address path. ok === false MUST NOT cause an error banner —
// the address path is a safe degraded display.

import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

export interface ManagedReferralCodeState {
  /** The user's NK-MGMT-XXXX code, or null when not managed / unavailable. */
  readonly code: string | null;
  /** true once the fetch has resolved (success OR known not-managed). */
  readonly settled: boolean;
}

/**
 * Fetch the connected managed-mode user's referral code from Form B.
 * Returns settled=false until the request resolves; code=null when the user
 * is not in managed mode or the endpoint is unreachable. The `enabled` flag
 * lets callers gate the request on a useWalletGate kind === 'managed' check
 * so we don't hit the endpoint for self-custody users.
 */
export function useManagedReferralCode(enabled: boolean): ManagedReferralCodeState {
  const [state, setState] = useState<ManagedReferralCodeState>({ code: null, settled: false });

  useEffect(() => {
    if (!enabled) {
      setState({ code: null, settled: true });
      return;
    }
    let alive = true;
    void (async () => {
      try {
        const r = await fetch(`${API_BASE}/managed-referrals/me`, { credentials: "include" });
        if (!alive) return;
        if (r.status === 404) {
          setState({ code: null, settled: true });
          return;
        }
        if (!r.ok) {
          setState({ code: null, settled: true });
          return;
        }
        const j = (await r.json()) as { code?: string };
        if (!alive) return;
        setState({
          code: typeof j.code === "string" && j.code.length > 0 ? j.code : null,
          settled: true,
        });
      } catch {
        if (alive) setState({ code: null, settled: true });
      }
    })();
    return () => { alive = false; };
  }, [enabled]);

  return state;
}
