// @version 0.2.1 @date 2026-05-22
// 0.2.1 — + <HeartbeatReminderCard/> (Daniel): zero-PII recurring calendar
//          reminder (download .ics for Apple/Outlook/any + Google Calendar
//          deep link) so users don't forget to check in — without us holding
//          an email. Closes the "forgot to heartbeat" gap, zero-PII intact.
// @version 0.2.0 @date 2026-05-20
// 0.2.0 — Section H2/H3 terminology (Daniel-locked): "inactivity counter"
//          → "grace period"; "off-chain heartbeats … pushed to this oracle
//          by a separate process" → explicit "off-chain (signed) heartbeats
//          via Form B" vs "on-chain selfHeartbeat()". Honest, calm copy:
//          state cadence; "while you check in, nothing changes"; emphasis
//          that the switch is intentional and predictable.

import { useAccount, useReadContract } from "wagmi";
import { HeartbeatPanel } from "../components/HeartbeatPanel.js";
import { HeartbeatGraceSetting } from "../components/HeartbeatGraceSetting.js";
import { HeartbeatReminderCard } from "../components/HeartbeatReminderCard.js";
import { ORACLE_ADDR, oracleAbi } from "../lib/contracts.js";

export function Heartbeat(): JSX.Element {
  const { address, isConnected } = useAccount();

  const { data: lastHb } = useReadContract({
    address: ORACLE_ADDR,
    abi: oracleAbi,
    functionName: "lastHeartbeat",
    args: address ? [address] : undefined,
    query: { enabled: !!address, staleTime: 60_000 },
  });

  const { data: graceOverride } = useReadContract({
    address: ORACLE_ADDR,
    abi: oracleAbi,
    functionName: "gracePeriodOverride",
    args: address ? [address] : undefined,
    query: { enabled: !!address, staleTime: 60_000 },
  });

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold font-display"><span className="grad">Heartbeat</span></h1>
        <p className="text-text-on-dark/85 mt-2 text-sm">
          A <strong>heartbeat</strong> is your periodic check-in — your proof of life. Send one any time you remember (the app reminds you). While you check in, <strong>nothing changes</strong>: your vaults stay sealed, your heirs stay informed but not activated.
        </p>
        <p className="text-text-on-dark/85 mt-2 text-sm">
          If you stop checking in for your full <strong>grace period</strong> (default 60 days; you choose, 1 day to 10 years), the <strong>dead-man's switch</strong> fires: Chainlink Automation activates your designated next-of-kin's SBTs on Polygon, the inheritance process begins, and your heirs can restore the vault using the shares + master password you arranged with them ahead of time. The mechanism is intentional and predictable — never a surprise.
        </p>
        <p className="text-text-muted mt-2 text-xs">
          One heartbeat covers <strong>all your vaults on this wallet</strong> — the switch is per-wallet, not per-vault.
        </p>
      </div>

      <HeartbeatPanel />

      <HeartbeatGraceSetting />

      <HeartbeatReminderCard />

      {isConnected && (
        <div className="card">
          <h2 className="font-bold mb-2">On-chain status</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="text-slate-400 pr-4 py-1">Wallet</td><td className="font-mono">{address}</td></tr>
              <tr>
                <td className="text-slate-400 pr-4 py-1">Last on-chain heartbeat (ts)</td>
                <td className="font-mono">{formatLastHeartbeat(lastHb as readonly [bigint, number] | undefined)}</td>
              </tr>
              <tr>
                <td className="text-slate-400 pr-4 py-1">Grace period override</td>
                <td className="font-mono">{formatGrace(graceOverride as number | undefined)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-text-muted mt-3">
            <strong>To keep your dead-man's switch disarmed, use the on-chain heartbeat.</strong> The
            oracle's <code>selfHeartbeat()</code> — the "Heartbeat on-chain" button — costs a tiny gas
            amount and is <strong>the only path that resets your on-chain grace clock today</strong>. It is
            also fully trustless: it works even if Form B is down.
          </p>
          <p className="text-xs text-text-muted mt-2">
            The <strong>off-chain (signed, free)</strong> heartbeat has your wallet sign an EIP-712 message
            that Form B records as a proof-of-life log. <strong>Automated pushing of those signed heartbeats
            to the oracle is not yet live</strong> — so an off-chain heartbeat <strong>alone does not yet reset
            the on-chain grace clock.</strong> Until automated heartbeats ship, send an on-chain
            <code>selfHeartbeat()</code> before your grace window (default 60 days) elapses.
          </p>
        </div>
      )}
    </div>
  );
}

function formatLastHeartbeat(value: readonly [bigint, number] | undefined): string {
  if (!value) return "—";
  const ts = Number(value[0]);
  if (ts === 0) return "never";
  return `${new Date(ts * 1000).toISOString()} (source ${value[1]})`;
}

function formatGrace(value: number | undefined): string {
  if (!value || value === 0) return "default (60 days)";
  return `${value} s = ${Math.round((value / 86400) * 10) / 10} days`;
}
