// @version 0.1.0 @date 2026-05-17
// Proactive wrong-network banner. The hard guard is ensurePolygon() before
// every write, but this surfaces the problem the moment a wallet connects
// on the wrong chain (e.g. BNB Smart Chain) — one tap fixes it, so users
// never hit the confusing "why is it asking for BNB?" mid-transaction.

import { useState } from "react";
import { useEnsurePolygon } from "../hooks/useEnsurePolygon.js";

export function NetworkBanner(): JSX.Element | null {
  const { isWrongChain, ensurePolygon } = useEnsurePolygon();
  const [busy, setBusy] = useState(false);

  if (!isWrongChain) return null;

  return (
    <div
      role="alert"
      className="bg-rose-700/30 border-b border-rose-700/50 text-rose-100 text-sm px-4 py-2 flex flex-wrap items-center justify-center gap-3 text-center"
    >
      <span>
        Your wallet is on the wrong network. NoKLock runs on <strong>Polygon</strong> — gas is a
        few cents of POL; nothing is ever charged in BNB or ETH.
      </span>
      <button
        type="button"
        className="btn btn-primary text-xs shrink-0"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void ensurePolygon()
            .catch(() => { /* user declined — banner stays until they switch */ })
            .finally(() => setBusy(false));
        }}
      >
        {busy ? "Switching…" : "Switch to Polygon"}
      </button>
    </div>
  );
}
