// @version 0.2.0 @date 2026-06-15
// 0.2.0 — Daniel 2026-06-15: PARAMETERIZED. The widget took only the Oracle
//         dead-man's-switch upkeep; now it accepts optional props (upkeepId /
//         label / targetAddr / targetLabel / envVarName / compact) so the SAME
//         component renders BOTH the Oracle upkeep AND the new NoKLockAlerts
//         (Live-Man's Switch) upkeep card, and a user-facing compact variant on
//         Settings + the About page. Read logic extracted to useUpkeepRead() and
//         shared with the new <ChainlinkLowBalanceBanner/> — a home-screen alert
//         that appears ONLY when LINK is LOW/CRITICAL so the community is
//         prompted to top it up (anyone can, permissionlessly) before the
//         dead-man's switch can silently die for lack of LINK.
// @version 0.1.0 @date 2026-06-01
// ChainlinkUpkeepStatus — live status widget for a Chainlink Automation upkeep.
//
// Audit Q1 answer (the live funding-visibility approach): show the upkeep
// address, live LINK balance, runway estimate, status pill, and a Top-up CTA
// that deep-links to Chainlink's official UI. Chainlink Automation's design
// already lets ANY wallet fund ANY upkeep — we just surface it prominently. If
// NoKLock disappears, the community keeps the dead-man's switch alive directly
// via the public Chainlink UI.
//
// Reads (view-only) from the canonical Chainlink Automation Registry on
// Polygon PoS via wagmi useReadContract — no writes, no permissions.

import { useReadContract } from "wagmi";
import {
  CHAINLINK_REGISTRY_ADDR,
  CHAINLINK_ORACLE_UPKEEP_ID,
  LINK_TOKEN_POLYGON_ADDR,
  ORACLE_ADDR,
  chainlinkRegistryAbi,
} from "../lib/contracts.js";

function formatLink(balanceWei: bigint): string {
  // LINK is 18-decimal. Show 2 d.p. (typical balance is 1-1000 range).
  const whole = balanceWei / 10n ** 18n;
  const frac  = (balanceWei % 10n ** 18n) / 10n ** 16n; // hundredths
  return `${whole.toString()}.${frac.toString().padStart(2, "0")}`;
}

interface UpkeepStatus {
  readonly kind: "HEALTHY" | "LOW" | "CRITICAL" | "PAUSED" | "UNKNOWN";
  readonly label: string;
  readonly accent: string;
  readonly bg: string;
}

function classifyStatus(balance: bigint, minBalance: bigint, paused: boolean): UpkeepStatus {
  if (paused) return { kind: "PAUSED", label: "PAUSED", accent: "text-amber-300", bg: "bg-amber-700/30 border-amber-500/40" };
  if (balance <= minBalance)                      return { kind: "CRITICAL", label: "CRITICAL — below minimum", accent: "text-rose-300",    bg: "bg-rose-700/30 border-rose-500/40" };
  if (balance <= (minBalance * 3n))               return { kind: "LOW",      label: "LOW — top up soon",          accent: "text-amber-300",   bg: "bg-amber-700/30 border-amber-500/40" };
  return                                                   { kind: "HEALTHY", label: "HEALTHY",                     accent: "text-emerald-300", bg: "bg-emerald-700/30 border-emerald-500/40" };
}

interface ParsedUpkeep {
  readonly target: string;
  readonly balance: bigint;
  readonly lastPerformBlockNumber: number;
  readonly amountSpent: bigint;
  readonly paused: boolean;
}

interface UpkeepRead {
  readonly configured: boolean;       // env var present + numeric
  readonly loading: boolean;
  readonly errored: boolean;
  readonly upkeep: ParsedUpkeep | null;
  readonly minBalance: bigint;
  readonly status: UpkeepStatus | null;
  readonly topUpHref: string;
}

// Shared read hook — used by the full card AND the low-balance home banner so
// they never diverge. Always calls the same number of hooks (id may be 0 when
// unconfigured; we just ignore the result in that case).
function useUpkeepRead(upkeepIdStr: string): UpkeepRead {
  const trimmed = upkeepIdStr.trim();
  const configured = !!trimmed && /^\d+$/.test(trimmed);
  const id = configured ? BigInt(trimmed) : 0n;
  const upkeepArgs = [id] as const;

  const { data: upkeep, isLoading, error } = useReadContract({
    abi: chainlinkRegistryAbi,
    address: CHAINLINK_REGISTRY_ADDR,
    functionName: "getUpkeep",
    args: upkeepArgs,
    query: { staleTime: 30_000, gcTime: 5 * 60_000, enabled: configured },
  });

  const { data: minBalanceData } = useReadContract({
    abi: chainlinkRegistryAbi,
    address: CHAINLINK_REGISTRY_ADDR,
    functionName: "getMinBalanceForUpkeep",
    args: upkeepArgs,
    query: { staleTime: 30_000, gcTime: 5 * 60_000, enabled: configured },
  });

  const parsed = (upkeep as unknown as ParsedUpkeep | undefined) ?? null;
  const minBalance = (minBalanceData as bigint | undefined) ?? 0n;
  const status = parsed ? classifyStatus(parsed.balance, minBalance, parsed.paused) : null;
  const topUpHref = configured ? `https://automation.chain.link/polygon/${trimmed}` : "https://automation.chain.link/polygon";

  return {
    configured,
    loading: configured && isLoading,
    errored: configured && (!!error || (!isLoading && !parsed)),
    upkeep: parsed,
    minBalance,
    status,
    topUpHref,
  };
}

export interface ChainlinkUpkeepStatusProps {
  /** uint256 upkeep id as a string. Defaults to the Oracle dead-man's switch. */
  readonly upkeepId?: string;
  /** Card eyebrow label. */
  readonly label?: string;
  /** The automated contract this upkeep targets (link + readout). */
  readonly targetAddr?: string;
  readonly targetLabel?: string;
  /** The env var name to cite in the "not configured" placeholder. */
  readonly envVarName?: string;
  /** A short sentence describing what this upkeep keeps alive. */
  readonly purpose?: string;
}

export function ChainlinkUpkeepStatus({
  upkeepId = CHAINLINK_ORACLE_UPKEEP_ID,
  label = "Chainlink upkeep · live",
  targetAddr = ORACLE_ADDR,
  targetLabel = "Oracle target",
  envVarName = "VITE_CHAINLINK_ORACLE_UPKEEP_ID",
  purpose = "The dead-man's switch fires as long as this upkeep has LINK.",
}: ChainlinkUpkeepStatusProps = {}): JSX.Element {
  const r = useUpkeepRead(upkeepId);

  // Guard: env var unset → a CALM "pending registration" note (not an alarming
  // amber warning that reads as broken). This branch only shows for an upkeep
  // that isn't registered yet (e.g. the Alerts/Live-Man's-Switch upkeep), so we
  // do NOT claim it's "funded and firing" — it simply doesn't exist yet.
  if (!r.configured) {
    return (
      <div className="rounded border border-bg-surface/60 bg-bg-deepest/40 px-4 py-3 text-xs text-text-muted">
        <span className="text-text-on-dark/80 font-medium">Not registered yet.</span> This live funding readout lights up
        automatically once the upkeep is registered on Chainlink Automation and{" "}
        <code className="font-mono text-accent-cyan">{envVarName}</code> is set in the build. Register or fund any upkeep at{" "}
        <a href="https://automation.chain.link/polygon" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">automation.chain.link/polygon ↗</a>.
      </div>
    );
  }

  if (r.loading) {
    return (
      <div className="rounded border border-bg-surface/60 bg-bg-deepest/50 px-4 py-3 text-xs text-text-muted">
        Reading live upkeep status from Chainlink Automation Registry…
      </div>
    );
  }

  if (r.errored || !r.upkeep || !r.status) {
    return (
      <div className="rounded border border-rose-500/40 bg-rose-950/20 px-4 py-3 text-xs text-text-on-dark/85">
        <strong className="text-rose-300">Couldn't read the upkeep status.</strong> Falls under "RPC fallback" — the live
        figures aren't available right now but the upkeep is independent of this widget. View directly at{" "}
        <a href={r.topUpHref} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">automation.chain.link ↗</a>.
      </div>
    );
  }

  const balance       = r.upkeep.balance;
  const minBal        = r.minBalance;
  const lastPerformed = r.upkeep.lastPerformBlockNumber;
  const amountSpent   = r.upkeep.amountSpent;
  const status        = r.status;

  // Rough runway: amountSpent over the upkeep's lifetime is the only burn
  // metric the registry exposes view-side. Approximate days = (balance - min)
  // / assumed 0.05 LINK/day. Order-of-magnitude only.
  const assumedDailyBurnLink = 0.05;
  const balanceLink = Number(balance / 10n ** 16n) / 100;
  const minBalLink  = Number(minBal  / 10n ** 16n) / 100;
  const runwayDays  = balanceLink > 0 ? Math.floor((balanceLink - minBalLink) / assumedDailyBurnLink) : 0;
  const spentLink   = Number(amountSpent / 10n ** 16n) / 100;

  return (
    <div className="rounded border border-bg-surface bg-bg-deepest/60 px-4 py-3 space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold">{label}</div>
          <div className="text-base font-bold text-text-on-dark mt-0.5">
            Balance: <span className="font-mono">{formatLink(balance)} LINK</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono uppercase tracking-wider border ${status.bg} ${status.accent}`}>
          {status.label}
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-text-on-dark/85">
        <li><span className="text-text-muted">Minimum:</span> <span className="font-mono">{formatLink(minBal)} LINK</span></li>
        <li><span className="text-text-muted">Spent (lifetime):</span> <span className="font-mono">{spentLink.toFixed(2)} LINK</span></li>
        <li><span className="text-text-muted">Approx. runway:</span> <span className="font-mono">{runwayDays > 0 ? `~${runwayDays} days` : "below threshold"}</span></li>
        <li><span className="text-text-muted">Last performed block:</span> <a href={`https://polygonscan.com/block/${lastPerformed}`} target="_blank" rel="noopener noreferrer" className="font-mono text-accent-cyan hover:underline">{lastPerformed.toLocaleString()} ↗</a></li>
        <li className="sm:col-span-2"><span className="text-text-muted">{targetLabel}:</span> <a href={`https://polygonscan.com/address/${targetAddr}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-accent-cyan hover:underline break-all">{targetAddr} ↗</a></li>
      </ul>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <a href={r.topUpHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary text-xs">
          Top up this upkeep ↗
        </a>
        <span className="text-[10px] text-text-muted">
          Anyone can fund — Chainlink permissionless. LINK token (Polygon PoS):{" "}
          <a href={`https://polygonscan.com/token/${LINK_TOKEN_POLYGON_ADDR}`} target="_blank" rel="noopener noreferrer" className="font-mono text-accent-cyan hover:underline">0xb089…E0F1 ↗</a>
        </span>
      </div>

      <p className="text-[11px] text-text-muted leading-relaxed">
        {purpose} <strong className="text-text-on-dark/90">If NoKLock ever disappears,</strong>{" "}
        the community can keep it running — the fund button above is open to any wallet, no permission needed. Honest runway estimate
        assumes ~0.05 LINK/day average burn; real burn varies with activity volume.
      </p>
    </div>
  );
}

export interface ChainlinkLowBalanceBannerProps {
  /** Which upkeep to watch. Defaults to the Oracle dead-man's switch. */
  readonly upkeepId?: string;
  /** Short name shown in the banner copy. */
  readonly name?: string;
}

/** Home-screen alert (Daniel 2026-06-15). Renders NOTHING until the watched
 *  upkeep's LINK balance is LOW or CRITICAL — then a dismissible-by-scroll
 *  banner prompting anyone to top it up (permissionless). Silent in the
 *  healthy/paused/unconfigured/loading cases so it never nags. */
export function ChainlinkLowBalanceBanner({
  upkeepId = CHAINLINK_ORACLE_UPKEEP_ID,
  name = "dead-man's switch",
}: ChainlinkLowBalanceBannerProps = {}): JSX.Element | null {
  const r = useUpkeepRead(upkeepId);
  const kind = r.status?.kind;
  if (!r.configured || r.loading || r.errored || !r.upkeep || (kind !== "LOW" && kind !== "CRITICAL")) {
    return null;
  }
  const critical = kind === "CRITICAL";
  return (
    <div
      role="status"
      className={`rounded-lg border px-4 py-3 text-sm flex flex-wrap items-center gap-x-3 gap-y-1.5 ${
        critical ? "border-rose-500/50 bg-rose-950/30 text-rose-100" : "border-amber-500/50 bg-amber-900/25 text-amber-100"
      }`}
    >
      <span className="font-bold">
        {critical ? "⚠ Chainlink LINK critically low" : "Chainlink LINK running low"}
      </span>
      <span className="text-[13px] opacity-90">
        The {name}'s automation upkeep is at <span className="font-mono">{formatLink(r.upkeep.balance)} LINK</span>{critical ? " — below the firing minimum" : ""}.
        Anyone can refill it permissionlessly so it never stops.
      </span>
      <a
        href={r.topUpHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-xs font-bold px-3 py-1 rounded border ${critical ? "border-rose-300/60 hover:bg-rose-500/20" : "border-amber-300/60 hover:bg-amber-500/20"}`}
      >
        Top up ↗
      </a>
    </div>
  );
}
