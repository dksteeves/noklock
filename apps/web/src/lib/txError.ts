// @version 0.1.0 @date 2026-05-19
// One concise, truthful line for any wallet/transaction failure, instead
// of dumping the raw multi-paragraph viem error (request args, calldata,
// docs URL, version…) at the user. Says what happened + why — nothing
// more, nothing misleading. Used everywhere a tx can be rejected/fail.

export function humanizeTxError(e: unknown): string {
  const raw =
    (e as { shortMessage?: string })?.shortMessage ||
    (e as { message?: string })?.message ||
    String(e ?? "Unknown error");
  const m = raw.toLowerCase();

  // User declined in their wallet (MetaMask/WC code 4001 / ethers ACTION_REJECTED).
  if (
    m.includes("user rejected") ||
    m.includes("user denied") ||
    m.includes("rejected the request") ||
    m.includes("action_rejected") ||
    (e as { code?: number })?.code === 4001
  ) {
    return "Cancelled — you rejected the request in your wallet.";
  }
  if (m.includes("insufficient funds")) {
    return "Failed — insufficient funds for the transaction (gas / amount).";
  }
  if (m.includes("chain") && (m.includes("does not match") || m.includes("mismatch") || m.includes("wrong network"))) {
    return "Failed — wrong network. Switch the wallet to Polygon and retry.";
  }
  if (m.includes("nonce")) {
    return "Failed — nonce/ordering issue. Retry; if it persists, reset the wallet's activity data.";
  }
  if (m.includes("timeout") || m.includes("timed out")) {
    return "Failed — the request timed out. Check your connection and retry.";
  }

  // Generic: keep only the viem shortMessage (one sentence), never the
  // calldata/args/docs dump.
  const short =
    (e as { shortMessage?: string })?.shortMessage ||
    raw.split("\n")[0] ||
    raw;
  return `Failed — ${short.slice(0, 160)}`;
}
