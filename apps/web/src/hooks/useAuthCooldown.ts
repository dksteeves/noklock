// @version 0.1.0 @date 2026-06-02
// 0.1.0 — Round-3 §1.B + round-4 §1.B email-takeover hardening (Daniel-
//         locked 2026-06-02). When the user adds/removes an auth method
//         (passkey add/remove, recovery email add/change), Form B records
//         the change with a 24h cool-down. During the cool-down the PWA
//         must gate high-stakes UI (add-passkey-post-creation in
//         VaultDetail.tsx, lifetime-USDC payment, key-export ceremony) so
//         a stolen recovery channel can't silently pivot ownership before
//         the legitimate owner reads the broadcast email and revokes.
//
// This hook calls GET /v1/nok/quorum/cooldown-status?wallet=... and
// caches the result with a short TTL so high-stakes surfaces can render
// quickly without thrashing Form B on every re-render.
//
// Cache TTL: 60 seconds — short enough that a fresh cool-down (e.g. the
// user JUST added a passkey on another tab) is picked up quickly, long
// enough that bouncing between routes during the same session doesn't
// re-hit the API. The cache is wallet-scoped and lives in module scope
// (per-tab), not localStorage (cool-down is a tight session safety
// belt; a hard refresh forces a fresh read which is the correct
// posture).

import { useEffect, useState } from "react";

/** Form B base URL — same pattern as lib/quorum-client.ts. Falls back to
 *  api.noklock.app (production Form B host) so a dev-server miss doesn't
 *  blow up the build. */
const BASE: string = (
  (import.meta.env.VITE_FORM_B_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://api.noklock.app"
).replace(/\/+$/, "");

const CACHE_TTL_MS = 60_000;

/** Closed enum mirrored from Form B notifier.ts AuthMethodChangeKind. */
export type AuthCooldownChangeKind =
  | "add_passkey"
  | "add_email"
  | "remove_passkey"
  | "change_recovery_email";

export interface AuthCooldownStatus {
  readonly inCooldown: boolean;
  /** Unix seconds when the cool-down ends; null when not in cool-down. */
  readonly until: number | null;
  /** The triggering change_kind; null when not in cool-down. */
  readonly change: AuthCooldownChangeKind | null;
}

export interface UseAuthCooldownState {
  readonly status: AuthCooldownStatus;
  readonly isLoading: boolean;
  readonly error: string | null;
  /** Force a fresh fetch on next call — useful after the local UI fires
   *  /auth-method-changed so the gate flips immediately. */
  readonly refresh: () => void;
}

interface CacheEntry {
  readonly at: number;
  readonly status: AuthCooldownStatus;
}

const cache = new Map<string, CacheEntry>();

const EMPTY: AuthCooldownStatus = { inCooldown: false, until: null, change: null };

/** Returns the current 24h auth-cooldown status for `wallet`. While the
 *  wallet is null/undefined the hook returns the no-cooldown sentinel
 *  (no network call). Cached per-wallet with a 60s TTL.
 *
 *  Surfaces that gate on the result:
 *    - VaultDetail.tsx PasskeySection (add-passkey-post-creation)
 *    - UsdcLifetimePayment.tsx (lifetime tier USDC payment)
 *    - KeyExportCeremony.tsx (key export at signup) */
export function useAuthCooldown(
  wallet: string | null | undefined,
): UseAuthCooldownState {
  const walletKey = wallet ? wallet.toLowerCase() : null;
  const [status, setStatus] = useState<AuthCooldownStatus>(() => {
    if (!walletKey) return EMPTY;
    const c = cache.get(walletKey);
    if (c && Date.now() - c.at < CACHE_TTL_MS) return c.status;
    return EMPTY;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState<number>(0);

  useEffect(() => {
    if (!walletKey) {
      setStatus(EMPTY);
      setError(null);
      setIsLoading(false);
      return;
    }
    const c = cache.get(walletKey);
    if (c && Date.now() - c.at < CACHE_TTL_MS && refreshTick === 0) {
      setStatus(c.status);
      setIsLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        const r = await fetch(
          `${BASE}/v1/nok/quorum/cooldown-status?wallet=${encodeURIComponent(walletKey)}`,
          { method: "GET", credentials: "omit" },
        );
        if (!r.ok) {
          if (cancelled) return;
          setError(`cooldown-status fetch failed (${r.status})`);
          setStatus(EMPTY);
          setIsLoading(false);
          return;
        }
        const body = (await r.json()) as Partial<{
          inCooldown: boolean;
          until: number | null;
          change: string | null;
        }>;
        if (cancelled) return;
        const next: AuthCooldownStatus = {
          inCooldown: body.inCooldown === true,
          until: typeof body.until === "number" ? body.until : null,
          change: isValidChangeKind(body.change) ? body.change : null,
        };
        cache.set(walletKey, { at: Date.now(), status: next });
        setStatus(next);
        setIsLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message ?? "network error");
        setStatus(EMPTY);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [walletKey, refreshTick]);

  return {
    status,
    isLoading,
    error,
    refresh: () => {
      if (walletKey) cache.delete(walletKey);
      setRefreshTick((n) => n + 1);
    },
  };
}

function isValidChangeKind(v: unknown): v is AuthCooldownChangeKind {
  return (
    v === "add_passkey" ||
    v === "add_email" ||
    v === "remove_passkey" ||
    v === "change_recovery_email"
  );
}

/** Format a cool-down change-kind for user-facing strings. */
export function formatAuthCooldownChange(k: AuthCooldownChangeKind): string {
  switch (k) {
    case "add_passkey":           return "a new passkey was added";
    case "add_email":             return "a new recovery email was added";
    case "remove_passkey":        return "an existing passkey was removed";
    case "change_recovery_email": return "your recovery email was changed";
  }
}
