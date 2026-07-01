// @version 0.1.0 @date 2026-06-01
// 0.1.0 — Daniel 2026-06-01: M-of-N Stage 1 step 6 [mofn-restore-quorum-fix-plan §D.1].
//         "Waiting on heirs" strip rendered on `/heir/restore`. Polls Form B
//         every `refreshIntervalMs` (default 15s — matches plan §D.4 step 4
//         "Poll every 15s") and renders one of three states:
//
//           amber  → votesSeen < votesNeeded   ("1 of 2 votes received")
//           green  → quorumMet                  ("Quorum met — fetching
//                                                 release attestation")
//           red    → network / server error     (with a Retry button)
//
//         Voters are shown as truncated addresses (0x1234…abcd). The
//         component is presentational only — it does NOT fetch the
//         release attestation itself; that's the heir-restore route's
//         next step once `quorumMet === true`. Use the `onQuorumMet`
//         callback (TODO future revision) to wire that hand-off; for
//         now consumers read the rendered "Quorum met" state visually
//         and proceed via their own poll of `getStatus`.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Hex, Address } from "viem";
import { getStatus, type QuorumStatus as QuorumStatusData } from "../lib/quorum-client.js";

export interface QuorumStatusProps {
  readonly vaultId: Hex;
  readonly manifestHash: Hex;
  readonly M: number;
  readonly N: number;
  readonly refreshIntervalMs?: number;
}

type View =
  | { readonly kind: "loading" }
  | { readonly kind: "data"; readonly data: QuorumStatusData }
  | { readonly kind: "error"; readonly message: string };

export function QuorumStatus(props: QuorumStatusProps): JSX.Element {
  const refreshMs = props.refreshIntervalMs ?? 15000;
  const [view, setView] = useState<View>({ kind: "loading" });
  // Hold the latest props for the polling timer without re-subscribing.
  const propsRef = useRef(props);
  propsRef.current = props;

  const refresh = useCallback(async (): Promise<void> => {
    const p = propsRef.current;
    try {
      const data = await getStatus({
        vaultId: p.vaultId,
        manifestHash: p.manifestHash,
        M: p.M,
        N: p.N,
      });
      setView({ kind: "data", data });
    } catch (e) {
      setView({ kind: "error", message: (e as Error).message ?? "network error" });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refresh();
      if (cancelled) return;
    })();
    const id = window.setInterval(() => {
      void refresh();
    }, refreshMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [refresh, refreshMs]);

  if (view.kind === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300"
      >
        Checking quorum status…
      </div>
    );
  }

  if (view.kind === "error") {
    return (
      <div
        role="alert"
        className="flex items-start justify-between gap-3 rounded-lg border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-100"
      >
        <div>
          <div className="font-semibold">Quorum service unavailable</div>
          <div className="mt-1 text-rose-200/80">{view.message}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            setView({ kind: "loading" });
            void refresh();
          }}
          className="shrink-0 rounded-md border border-rose-400/60 bg-rose-900/60 px-3 py-1.5 text-xs font-medium text-rose-50 hover:bg-rose-900"
        >
          Retry
        </button>
      </div>
    );
  }

  const { data } = view;
  const votersText = data.voters.length === 0
    ? "No votes yet."
    : `Voters: ${data.voters.map(truncateAddr).join(", ")}.`;

  if (data.quorumMet) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100"
      >
        <div className="flex items-center gap-2">
          <span aria-hidden="true">{"✓"}</span>
          <span className="font-semibold">
            Quorum met &mdash; fetching release attestation
          </span>
        </div>
        <div className="mt-1 text-emerald-200/80">
          {data.votesSeen} of {data.votesNeeded} heirs voted. {votersText}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100"
    >
      <div className="font-semibold">
        Waiting on heirs: {data.votesSeen} of {data.votesNeeded} votes received.
      </div>
      <div className="mt-1 text-amber-200/80">
        {votersText} {props.N > 0 && (
          <span className="text-amber-300/60">
            ({props.N} heir{props.N === 1 ? "" : "s"} designated.)
          </span>
        )}
      </div>
      {!data.oracleHasFired && (
        <div className="mt-1 text-amber-300/70">
          Note: the dead-man oracle has not yet fired for this vault.
        </div>
      )}
    </div>
  );
}

function truncateAddr(a: Address): string {
  if (a.length < 10) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
