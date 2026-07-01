// @version 0.5.0 @date 2026-06-12
// 0.5.0 — Daniel 2026-06-12: EXTRACT the signing logic out of the hook into a
//         standalone module-level `ensureOpsSig(address, signMessageAsync)`
//         export so NON-hook owner-gated READ fetchers (Admin refund-requests +
//         blacklist lists) can share the very SAME ops-session signature as the
//         ops tiles — one sign covers every admin read for 24h. The hook's own
//         ensureSig now just delegates to ensureOpsSig(); zero behaviour change
//         for existing ops tiles (same module cache, same single-flight guard,
//         same "NoKLock ops session: <unixSeconds>" message, same 24h TTL).
//         CachedSig is now exported for the new callers.
// @version 0.4.0 @date 2026-06-11
// 0.4.0 — Daniel 2026-06-11 (Fable replay finding): ops-session message is now
//         "NoKLock ops session: <unixSeconds>" (was "<day>"). The server
//         (owner-sig.ts 0.4.0 isFreshOpsSession) enforces a freshness window
//         on the timestamp, so a captured sig (logged as a GET query param)
//         expires — and the day-bucket UTC-midnight cliff is gone (sliding
//         window). valid() stays age-based; senders forward the CACHED msg.
//         DEPLOY ORDER: ship this PWA build BEFORE the Form B 0.4.0 server.
// @version 0.3.0 @date 2026-06-11
// 0.3.0 — Daniel 2026-06-11 wallet rebuild: ops-session signature TTL 1h → 24h.
//         The signed message is already day-scoped ("NoKLock ops session:
//         <day>"), so a 24h window means the operator signs at most ONCE per
//         UTC day across every ops surface instead of re-prompting hourly.
//         (Dashboard's PendingActivations no longer auto-prompts at all — it
//         reads this shared cache silently. See PendingActivations 0.2.0.)
// @version 0.2.0 @date 2026-05-22
// 0.2.0 — FIX concurrent-signature thundering herd. On first load every
//         owner-signed tile mounts at once; each used to fire its OWN
//         signPersonalMessage, so the wallet accepted the first and
//         rejected the rest with "Request of type 'PUBLIC_signPersonalMessage'
//         already pending for origin ...". Now the session signature is a
//         SINGLE shared in-flight promise (module-level sigInFlight): the
//         first tile that needs it starts the one signMessage; every other
//         tile awaits that same promise instead of starting its own. Also
//         persists the signature to localStorage (valid 1h, keyed to the
//         connected address) so it survives reloads + actually matches the
//         "cached locally" copy on the page.
// 0.1.0 — initial owner-signed fetcher for /v1/ops/*.

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import type { SignMessageMutateAsync } from "@wagmi/core/query";

const API_URL = (import.meta.env.VITE_API_URL ?? "https://api.noklock.app").replace(/\/+$/, "");
const SIG_TTL_MS = 24 * 60 * 60 * 1000;  // 24h — day-scoped msg ⇒ one sign/UTC day
const LS_KEY = "noklock.ops-sig";

export interface CachedSig { msg: string; sig: string; signedAt: number; address: string }

// Module-level so EVERY tile shares one signature + one in-flight request.
let sessionSig: CachedSig | null = null;
let sigInFlight: Promise<CachedSig> | null = null;

function readLs(): CachedSig | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as CachedSig) : null;
  } catch { return null; }
}
function writeLs(s: CachedSig): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* storage blocked — fine */ }
}
function valid(s: CachedSig | null, address: string): s is CachedSig {
  return !!s
    && s.address.toLowerCase() === address.toLowerCase()
    && Date.now() - s.signedAt < SIG_TTL_MS;
}

/**
 * ensureOpsSig — module-level, hook-free accessor for THE shared ops-session
 * signature. Any owner-gated READ (the useOpsLive tiles AND the Admin
 * refund-requests / blacklist list fetchers) calls this with the connected
 * address and wagmi's `signMessageAsync`; the first caller signs once and every
 * subsequent caller (within the 24h TTL, same address) reuses the cached sig —
 * so the operator signs at most once per UTC day across every admin read.
 *
 * Shares the SAME module-level cache (sessionSig / sigInFlight), the SAME
 * localStorage persistence (readLs/writeLs), the SAME 24h TTL (valid), the SAME
 * single-flight thundering-herd guard, and the SAME message format
 * "NoKLock ops session: <unixSeconds>" as the hook always used — this is a pure
 * extraction, no behaviour change for the existing ops tiles.
 *
 * Throws "Connect a wallet first" if no address is connected.
 */
export async function ensureOpsSig(
  address: `0x${string}` | undefined,
  signMessageAsync: SignMessageMutateAsync,
): Promise<CachedSig> {
  if (!address) throw new Error("Connect a wallet first");
  // 1. in-memory session signature still valid?
  if (valid(sessionSig, address)) return sessionSig;
  // 2. localStorage (survives reloads)?
  const ls = readLs();
  if (valid(ls, address)) { sessionSig = ls; return ls; }
  // 3. a sign is ALREADY in flight (another tile/fetcher started it) — await
  //    that same promise rather than firing a second signPersonalMessage. This
  //    is the fix for the "already pending" wall.
  if (sigInFlight) return sigInFlight;
  // 4. nobody's signing yet — start the one and only sign request.
  sigInFlight = (async () => {
    // 0.4.0 — timestamp-based session message (was day-bucketed). The server
    // (owner-sig.ts isFreshOpsSession) enforces a freshness window on this
    // unix-seconds value, so a captured sig EXPIRES — and there is no
    // UTC-midnight cliff (sliding window, not a calendar bucket).
    const msg = `NoKLock ops session: ${Math.floor(Date.now() / 1000)}`;
    const sig = await signMessageAsync({ message: msg });
    const fresh: CachedSig = { msg, sig, signedAt: Date.now(), address };
    sessionSig = fresh;
    writeLs(fresh);
    return fresh;
  })();
  try {
    return await sigInFlight;
  } finally {
    sigInFlight = null;   // cleared so a future expiry can re-sign
  }
}

export interface UseOpsLiveResult<T> {
  readonly data: T | null;
  readonly error: string | null;
  readonly loading: boolean;
  readonly refresh: () => void;
}

export function useOpsLive<T>(path: string, intervalMs = 60_000): UseOpsLiveResult<T> {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  // Delegate to the standalone module-level ensureOpsSig — the hook owns no
  // signing logic of its own anymore (0.5.0). Same shared cache + single-flight
  // guard, so ops tiles and the Admin read fetchers all reuse one signature.
  const ensureSig = useCallback(
    (): Promise<CachedSig> => ensureOpsSig(address, signMessageAsync),
    [address, signMessageAsync],
  );

  useEffect(() => {
    let cancelled = false;
    async function go(): Promise<void> {
      try {
        setLoading(true);
        setError(null);
        let url = `${API_URL}${path}`;
        const isPublic = path.endsWith("/health");   // /health needs no signature
        if (!isPublic) {
          const s = await ensureSig();
          const u = new URL(url);
          u.searchParams.set("msg", s.msg);
          u.searchParams.set("sig", s.sig);
          url = u.toString();
        }
        const r = await fetch(url);
        const body = await r.json();
        if (cancelled) return;
        if (!r.ok || body.error) {
          setError(body.error ?? `HTTP ${r.status}`);
        } else {
          setData(body as T);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void go();
    return () => { cancelled = true; };
  }, [path, tick, ensureSig]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { data, error, loading, refresh: () => setTick((t) => t + 1) };
}
