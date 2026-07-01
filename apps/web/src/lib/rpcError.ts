// @version 0.1.0 @date 2026-05-19
// Humanize the one RPC failure that keeps surfacing on the historical
// log scans (NoK list, admin grants, leaderboard): the configured
// Polygon RPC is a PRUNED node and cannot serve eth_getLogs back to the
// contract deploy block. This is an infrastructure/config issue (the RPC
// endpoint), NOT a bug in this page — so say exactly that instead of
// dumping a raw viem stack at the user.

export function humanizeRpcError(msg: string | null | undefined): string | null {
  if (!msg) return null;
  const m = msg.toLowerCase();
  const isLogScan = m.includes("eth_getlogs");
  const failed =
    m.includes("history has been pruned") ||
    m.includes("pruned for this block") ||
    m.includes("upstream 4") ||      // proxy → upstream 400/4xx
    m.includes("upstream 5") ||      // proxy → upstream 5xx
    m.includes("internal error was received") ||
    m.includes("rpc request failed") ||
    m.includes("failed to fetch");
  if (isLogScan && failed) {
    return (
      "On-chain history scan via the RPC failed — the endpoint either prunes old logs or " +
      "rejected the query (e.g. block-range limit). Your on-chain data is intact; this is an " +
      "RPC limitation, not lost or missing data. The fix is server-side: an archive-capable " +
      "Polygon RPC and/or a smaller query range (see the deploy runbook)."
    );
  }
  return null;
}
