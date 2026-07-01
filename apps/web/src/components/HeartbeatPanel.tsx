// @version 0.4.1 @date 2026-06-10
// 0.4.1 — Honesty fix (finding C-01): the lede previously implied the free
//         "Sign & send" beat resets the dead-man's-switch clock. Today only the
//         on-chain heartbeat resets the ON-CHAIN clock; the free beat records a
//         signed proof-of-life off-chain whose automatic on-chain relay is not
//         yet live (the heartbeat-pusher worker is dormant until configured).
//         Lede reworded to match the corrected Heartbeat.tsx:73-85 copy.
// @version 0.4.0 @date 2026-06-05
// 0.4.0 — Migrate off the useWalletSettling shim onto useWalletGate directly.
//         The panel is embedded inside larger page chrome (Dashboard /
//         Refer / etc.), so the migration preserves the inline-note pattern:
//         gate.status === 'reconnecting' renders "Reconnecting your wallet…"
//         + disables the buttons (was previously enabled-but-unhelpful);
//         gate.status === 'disconnected' renders the existing
//         "Connect a wallet to send heartbeats." note. We drop the wagmi
//         useAccount() read — gate.status is the single source of truth.
// 0.3.0 — Section H2/H3 canonical terminology pass (Daniel-locked):
//         "inactivity counter" → "grace period". "Proof of life" header
//         stays as the page concept (single-defined synonym) but the body
//         now leads with Heartbeat / Grace period / Dead-man's switch
//         terminology. Adds the explicit per-wallet line.
// 0.2.3 — Reconnect guard → shared useWalletSettling grace window.
// 0.2.2 — heartbeat errors run through humanizeTxError (concise
//         cancelled/failed line, not a raw viem dump).
// 0.2.1 — wallet-reconnect guard: shows "Reconnecting…" instead of the
//         "connect a wallet" note during the persisted-session restore.
// 0.2.0 — i18n: the on-chain-heartbeat button's native title= tooltip
//         localizes via localizeTip (English fallback).

import { useWalletGate } from "../hooks/useWalletGate.js";
import { useHeartbeat } from "../hooks/useHeartbeat.js";
import { humanizeTxError } from "../lib/txError.js";
import { useT } from "../i18n/index.js";
import { localizeTip } from "../i18n/tooltips.js";

export function HeartbeatPanel(): JSX.Element {
  const { lang } = useT();
  const gate = useWalletGate();
  const isConnected = gate.status === "connected";
  const { step, error, lastTs, txHashOnchain, signAndPost, heartbeatOnchain } = useHeartbeat();

  return (
    <div className="card">
      <h2 className="text-xl font-bold">Heartbeat <span className="text-text-muted text-xs font-normal">(proof of life)</span></h2>
      <p className="text-text-on-dark/80 text-sm mt-2">
        Use the <strong>on-chain heartbeat</strong> at least once per <strong>grace period</strong> to reset
        the dead-man's-switch clock — that is the only action that resets it on-chain today. The free
        <strong> Sign &amp; send</strong> records a signed proof-of-life off-chain (its automatic on-chain
        relay isn't live yet). One heartbeat covers <strong>all your vaults on this wallet</strong>.
      </p>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <button
          className="btn btn-primary"
          disabled={!isConnected || step === "signing" || step === "posting"}
          onClick={() => void signAndPost()}
        >
          {step === "signing" && "Signing…"}
          {step === "posting" && "Posting…"}
          {step === "done" && lastTs ? "Sent ✓ — repeat?" : null}
          {(step === "idle" || step === "error") && "Sign & send (free)"}
          {step === "sending-onchain" && "Sign & send (free)"}
        </button>

        <button
          className="btn btn-secondary"
          disabled={!isConnected || step === "sending-onchain"}
          onClick={() => void heartbeatOnchain()}
          title={localizeTip(lang, "Bypasses the back-end entirely — fully trustless. Costs a few cents in MATIC gas.")}
        >
          {step === "sending-onchain" ? "Sending…" : "On-chain heartbeat"}
        </button>
      </div>

      {lastTs && (
        <div className="mt-3 text-sm text-slate-400 font-mono">
          Last heartbeat: {new Date(lastTs * 1000).toISOString()}
        </div>
      )}
      {txHashOnchain && (
        <div className="mt-1 text-xs text-slate-400 font-mono">
          tx: <a className="text-accent-400 hover:underline" href={`https://polygonscan.com/tx/${txHashOnchain}`} target="_blank" rel="noopener noreferrer">{txHashOnchain.slice(0, 12)}…{txHashOnchain.slice(-6)}</a>
        </div>
      )}
      {error && <div className="mt-2 text-sm text-rose-400 break-words">{humanizeTxError(error)}</div>}
      {gate.status !== "connected" && (
        <div className="mt-2 text-xs text-slate-400" aria-busy={gate.status === "reconnecting"}>
          Connect a wallet to send heartbeats.
        </div>
      )}
    </div>
  );
}
