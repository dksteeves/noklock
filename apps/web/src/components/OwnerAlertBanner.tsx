// @version 0.1.0 @date 2026-05-24
// App-wide owner alert banner (Daniel 2026-05-24). Reads the connected wallet's
// OWN on-chain state and warns, on EVERY page, about the two things an owner
// must not miss:
//   1. A social-recovery request started against their wallet — with the
//      cancel-by deadline + a one-tap link to cancel. NON-dismissible (safety).
//   2. Their dead-man's-switch grace period running low — check in or be
//      inherited. Session-dismissible (a nudge, not an emergency).
// Zero new PII — pure on-chain reads of the user's own wallet. This is the
// IN-APP layer only; it is NOT sufficient on its own (the app isn't opened
// regularly) — the out-of-band on-chain notification (NoKLockAlerts) is the
// real fix and is designed separately. This banner complements it: loud the
// moment you DO open NoKLock anywhere.

import { useMemo, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Link } from "react-router-dom";
import { RECOVERY_ADDR, ORACLE_ADDR, oracleAbi } from "../lib/contracts.js";
import { recoveryAbi } from "../lib/recovery-contract.js";

const ZERO = "0x0000000000000000000000000000000000000000";

export function OwnerAlertBanner(): JSX.Element | null {
  const { address, isConnected } = useAccount();
  const [hbDismissed, setHbDismissed] = useState(false);

  const recoveryLive = RECOVERY_ADDR !== ZERO;
  const oracleLive = ORACLE_ADDR !== ZERO;

  const { data: req } = useReadContract({
    address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "getRequest",
    args: address ? [address] : undefined,
    query: { enabled: !!address && recoveryLive, refetchInterval: 60_000 },
  });
  const { data: lastHb } = useReadContract({
    address: ORACLE_ADDR, abi: oracleAbi, functionName: "lastHeartbeat",
    args: address ? [address] : undefined,
    query: { enabled: !!address && oracleLive, refetchInterval: 60_000 },
  });
  const { data: graceOverride } = useReadContract({
    address: ORACLE_ADDR, abi: oracleAbi, functionName: "gracePeriodOverride",
    args: address ? [address] : undefined,
    query: { enabled: !!address && oracleLive, refetchInterval: 120_000 },
  });

  // getRequest tuple: [oldTokenId, proposedNewWallet, voteCount, quorumMetAt,
  //                    executableAfter, executed, cancelled]
  const recovery = useMemo(() => {
    if (!req) return null;
    const t = req as readonly [bigint, string, number, bigint, bigint, boolean, boolean];
    const proposedNewWallet = t[1];
    if (!proposedNewWallet || proposedNewWallet === ZERO) return null;
    if (t[5] /*executed*/ || t[6] /*cancelled*/) return null;
    return { executableAfter: Number(t[4]) };
  }, [req]);

  // lastHeartbeat struct decoded as [ts, source]. ts===0 => never armed → no nag.
  const heartbeat = useMemo(() => {
    if (!lastHb) return null;
    const ts = Number((lastHb as readonly [bigint, number])[0]);
    if (ts === 0) return null;
    const grace = Number(graceOverride ?? 0) || 60 * 24 * 60 * 60;
    const left = ts + grace - Math.floor(Date.now() / 1000);
    const warnAt = Math.max(14 * 86400, grace * 0.2);
    if (left >= warnAt) return null;
    return { left, overdue: left <= 0 };
  }, [lastHb, graceOverride]);

  if (!isConnected) return null;
  if (!recovery && !heartbeat) return null;

  return (
    <div className="relative z-30">
      {recovery && (
        <div className="bg-rose-900/50 border-b border-rose-500/60 text-rose-50 text-sm px-4 py-2 text-center">
          ⚠ A wallet recovery was started against your wallet.{" "}
          <strong>
            If this wasn’t you, cancel it
            {recovery.executableAfter > 0
              ? ` before ${new Date(recovery.executableAfter * 1000).toLocaleString()}`
              : ""}.
          </strong>{" "}
          <Link to="/recovery" className="underline font-semibold">Review &amp; cancel →</Link>
        </div>
      )}
      {heartbeat && !hbDismissed && (
        <div className={`text-sm px-4 py-2 text-center border-b ${heartbeat.overdue ? "bg-rose-900/40 border-rose-500/50 text-rose-50" : "bg-amber-900/30 border-amber-500/40 text-amber-100"}`}>
          {heartbeat.overdue ? (
            <><strong>Your check-in is overdue</strong> — your dead-man’s switch may fire and hand your vaults to your next-of-kin. </>
          ) : (
            <>Heartbeat due in <strong>{Math.max(0, Math.ceil(heartbeat.left / 86400))} day{Math.ceil(heartbeat.left / 86400) === 1 ? "" : "s"}</strong> — check in to stay armed. </>
          )}
          <Link to="/heartbeat" className="underline font-semibold">Send heartbeat →</Link>
          <button onClick={() => setHbDismissed(true)} className="ml-3 opacity-70 hover:opacity-100" aria-label="Dismiss for this session">✕</button>
        </div>
      )}
    </div>
  );
}
