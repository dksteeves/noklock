// @version 0.1.0 @date 2026-06-16
// Self-service grace-period configuration — the "configurable heartbeat".
// NoKLockOracle.setGracePeriod(wallet, seconds_) is user-self-service (the
// caller must BE the wallet or the owner), so a user can lengthen/shorten how
// long they may go silent before the dead-man fires, entirely on-chain. 0 =
// "use the 60-day default" (legal). Contract caps at 10 years (MAX_GRACE);
// this UI offers 1 day → 10 years. Fully trustless: no Form B in the loop.

import { useState, useMemo } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ORACLE_ADDR, oracleAbi } from "../lib/contracts.js";
import { useEnsurePolygon } from "../hooks/useEnsurePolygon.js";
import { humanizeTxError } from "../lib/txError.js";
import { useWalletGate } from "../hooks/useWalletGate.js";

const DAY = 86_400;
const MAX_DAYS = 3650; // 10 years (matches NoKLockOracle MAX_GRACE)
const PRESETS = [
  { label: "30 days", days: 30 },
  { label: "60 days (default)", days: 60 },
  { label: "90 days", days: 90 },
  { label: "180 days", days: 180 },
  { label: "1 year", days: 365 },
  { label: "2 years", days: 730 },
];

function effectiveDays(overrideSeconds: number | undefined): number {
  if (!overrideSeconds || overrideSeconds === 0) return 60; // DEFAULT_GRACE
  return Math.round((overrideSeconds / DAY) * 10) / 10;
}

export function HeartbeatGraceSetting(): JSX.Element | null {
  const { address } = useAccount();
  const gate = useWalletGate();
  const isConnected = gate.status === "connected";
  const { writeContractAsync } = useWriteContract();
  const { ensurePolygon } = useEnsurePolygon();

  const { data: graceOverride, refetch } = useReadContract({
    address: ORACLE_ADDR,
    abi: oracleAbi,
    functionName: "gracePeriodOverride",
    args: address ? [address] : undefined,
    query: { enabled: !!address, staleTime: 60_000 },
  });

  const currentDays = useMemo(() => effectiveDays(graceOverride as number | undefined), [graceOverride]);
  const [days, setDays] = useState<string>(String(currentDays));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!isConnected) return null;

  const parsed = Number(days);
  const valid = Number.isFinite(parsed) && parsed >= 1 && parsed <= MAX_DAYS;

  async function apply(targetDays: number): Promise<void> {
    if (!address) return;
    setError(null);
    setDone(false);
    setBusy(true);
    try {
      await ensurePolygon();
      const seconds = Math.round(targetDays * DAY);
      await writeContractAsync({
        address: ORACLE_ADDR,
        abi: oracleAbi,
        functionName: "setGracePeriod",
        args: [address, seconds],
      });
      setDone(true);
      // Give the node a moment, then refresh the read.
      setTimeout(() => { void refetch(); }, 4000);
    } catch (e) {
      setError(humanizeTxError((e as Error).message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2 className="font-bold mb-1">Grace period <span className="text-text-muted text-xs font-normal">(how long you can go silent)</span></h2>
      <p className="text-sm text-text-on-dark/80">
        This is how long after your last on-chain heartbeat the dead-man's switch waits before your heirs can claim.
        Currently <strong>{currentDays} days</strong>{(!graceOverride || (graceOverride as number) === 0) ? " (the default)" : ""}.
        Longer = fewer false alarms if you go offline; shorter = faster handover. You set this on-chain — no NoKLock server involved.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.days}
            className="btn btn-secondary text-xs"
            disabled={busy}
            onClick={() => { setDays(String(p.days)); void apply(p.days); }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs text-text-muted mb-1">Custom (days, 1–{MAX_DAYS})</label>
          <input
            className="input w-32 font-mono text-sm"
            type="number"
            min={1}
            max={MAX_DAYS}
            value={days}
            onChange={(e) => { setDays(e.target.value); setDone(false); }}
          />
        </div>
        <button
          className="btn btn-primary text-sm"
          disabled={busy || !valid}
          onClick={() => void apply(parsed)}
        >
          {busy ? "Setting…" : "Set grace period"}
        </button>
      </div>

      {!valid && days.length > 0 && (
        <p className="text-xs text-amber-400 mt-2">Enter a whole number of days between 1 and {MAX_DAYS} (10 years).</p>
      )}
      {done && <p className="text-xs text-accent-green mt-2">Grace period updated on-chain ✓ (the status table refreshes shortly).</p>}
      {error && <p className="text-xs text-rose-400 mt-2 break-words">{error}</p>}
      <p className="text-[11px] text-text-muted mt-3">
        Setting it to the default 60 days? Use the “60 days (default)” button. A tiny gas amount applies (it's an on-chain write to the Oracle).
      </p>
    </div>
  );
}
