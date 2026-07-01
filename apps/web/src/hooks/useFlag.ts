// @version 0.1.0 @date 2026-05-21
// Read a single Form B app_flags entry. Defaults to "defaultValue" if the
// flag is not set (404) or Form B is unreachable. Caches in-memory for the
// session — the launch banner doesn't need real-time updates; one fetch on
// mount is fine. Admin tab writes invalidate the cache manually by calling
// invalidateFlag(key) after a successful write.

import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";

interface FlagState {
  readonly value: string | null;     // null = not set
  readonly loading: boolean;
  readonly error: string | null;
}

const _cache = new Map<string, string | null>();
const _listeners = new Map<string, Set<() => void>>();

export function invalidateFlag(key: string): void {
  _cache.delete(key);
  _listeners.get(key)?.forEach((cb) => cb());
}

export function useFlag(key: string, defaultValue: string): { value: string; loading: boolean; error: string | null; refresh: () => void } {
  const [state, setState] = useState<FlagState>(() => ({
    value: _cache.has(key) ? (_cache.get(key) ?? null) : null,
    loading: !_cache.has(key),
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;
    function load(): void {
      if (_cache.has(key)) {
        setState({ value: _cache.get(key) ?? null, loading: false, error: null });
        return;
      }
      setState((s) => ({ ...s, loading: true, error: null }));
      fetch(`${API_BASE}/flags/${encodeURIComponent(key)}`)
        .then(async (r) => {
          // 404 = flag known but never set → treat as "unset" (caller uses default).
          // 400 = Form B doesn't recognise the flag key (older Form B build that
          //       pre-dates the flag's introduction in KNOWN_FLAGS — common after
          //       a PWA-only deploy where Form B hasn't been re-uploaded yet).
          //       Quietly treat as unset so the UI degrades to the default
          //       instead of flashing a scary "HTTP 400" error.
          if (r.status === 404 || r.status === 400) {
            _cache.set(key, null);
            if (!cancelled) setState({ value: null, loading: false, error: null });
            return;
          }
          if (!r.ok) throw new Error(`${r.status}`);
          const j = await r.json() as { value?: string };
          const v = typeof j.value === "string" ? j.value : null;
          _cache.set(key, v);
          if (!cancelled) setState({ value: v, loading: false, error: null });
        })
        .catch((e) => {
          if (!cancelled) setState({ value: null, loading: false, error: String(e?.message ?? e) });
        });
    }
    load();

    // Re-load when invalidateFlag() is called from elsewhere.
    const set = _listeners.get(key) ?? new Set();
    set.add(load);
    _listeners.set(key, set);
    return () => {
      cancelled = true;
      set.delete(load);
    };
  }, [key]);

  return {
    value: state.value ?? defaultValue,
    loading: state.loading,
    error: state.error,
    refresh: () => invalidateFlag(key),
  };
}
