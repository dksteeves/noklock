// @version 0.5.0 @date 2026-06-11
// 0.5.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.11):
//         dropped useWalletSettling + WalletReconnecting → ONE
//         <WalletGateCard/> on `gate.status !== "connected"`. Connected
//         simulation/real panels gate on the unified isConnected.
// @version 0.4.0 @date 2026-06-01
// 0.4.0 — M-of-N pre-v0.6 honesty disclosure: qualify the "Multi-NoK voting
//          (M-of-N quorum) gates release" line in the safe-simulation
//          walkthrough — quorum is Premium, from v0.6 onwards; pre-v0.6
//          vaults remain owner-restorable (re-enrol to upgrade). Closes the
//          marketing-vs-code gap flagged in mofn-restore-quorum-fix-plan.md
//          section K.BEFORE before the Stage-1 quorum gate ships.
// 0.3.1 — FIX-COPY 4 (audit fix-copy-4-deadman-fire-warning): append explicit
//          irreversibility sentence to the REAL-fire warning section — heirs
//          gain immediate unilateral claim authority the moment grace elapses,
//          and resetting heartbeat AFTER does NOT reverse activation. Closes
//          the copy gap where users could assume "I can still un-fire by
//          heartbeating again post-grace" — they cannot.
// 0.3.0 — Section H4 (Daniel-locked 2026-05-19): drop ALL "demo" wording —
//          this page fires the user's REAL on-chain dead-man's switch. New
//          structure:
//          + Mode toggle at top: "Safe simulation" (default — front-end-only
//            walkthrough, NO chain tx) and "REAL test fire" (requires typed
//            confirmation before any of the chain-changing buttons unlock).
//          + Typed-confirmation gate: user must type the exact phrase
//            (REAL_FIRE_CONFIRMATION) before any real-fire button accepts a
//            click. The phrase is meaningful, not a captcha — typing it
//            confirms the user reads what they're doing.
//          + Honest contract reality: in 0.4.x Oracle is forwarder-ONLY for
//            `performUpkeep`. Users cannot self-fire via direct call — they
//            compress grace + stop sending heartbeats, and the registered
//            Chainlink Automation forwarder fires when grace elapses. The
//            UI now reflects this truthfully (the FIRE button is captioned
//            "Initiate real fire" + explains the Chainlink-fires-it reality).
//          + /prove-it (TestProve) remains distinct = synthetic-data crypto
//            demo, no chain; this page is your REAL switch.
// 0.2.3 — Reconnect guard → shared useWalletSettling grace window.
// 0.2.2 — Tx errors render inside the step card whose button was pressed.
// 0.2.0 — Wallet-reconnect guard.

import { useMemo, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useDeadMan } from "../hooks/useDeadMan.js";
import { useHeartbeat } from "../hooks/useHeartbeat.js";
import { ORACLE_ADDR, SBT_ADDR, oracleAbi } from "../lib/contracts.js";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { humanizeTxError } from "../lib/txError.js";

const TEST_GRACE_SECONDS = 60;
const REAL_FIRE_CONFIRMATION = "I understand this triggers REAL inheritance for ALL my vaults";

type Mode = "simulation" | "real";

export function DeadMan(): JSX.Element {
  const { address } = useAccount();
  const gate = useWalletGate();
  const isConnected = gate.status === "connected";
  const dm = useDeadMan();
  const hb = useHeartbeat();

  const [mode, setMode] = useState<Mode>("simulation");
  const [confirmed, setConfirmed] = useState("");
  const realFireUnlocked = confirmed.trim() === REAL_FIRE_CONFIRMATION;

  const [lastAction, setLastAction] = useState<"compress" | "upkeep" | "reset" | null>(null);
  const errLine = (which: "compress" | "upkeep" | "reset"): JSX.Element | null =>
    dm.error && dm.step === "error" && lastAction === which
      ? <div className="mt-2 text-sm text-danger break-words">{humanizeTxError(dm.error)}</div>
      : null;

  const contractsLive = ORACLE_ADDR !== "0x0000000000000000000000000000000000000000" && SBT_ADDR !== "0x0000000000000000000000000000000000000000";

  const { data: lastHb } = useReadContract({
    address: ORACLE_ADDR, abi: oracleAbi, functionName: "lastHeartbeat",
    args: address ? [address] : undefined,
    query: { enabled: !!address && contractsLive, refetchInterval: 4000 },
  });

  const { data: lastActivated } = useReadContract({
    address: ORACLE_ADDR, abi: oracleAbi, functionName: "lastActivatedBlock",
    args: address ? [address] : undefined,
    query: { enabled: !!address && contractsLive, refetchInterval: 4000 },
  });

  const simulationSteps = useMemo(() => buildSimulationSteps(), []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-display"><span className="grad">Dead-man's switch — test fire</span></h1>
        <p className="text-text-muted text-sm mt-2">
          This page exercises your <strong className="text-text-on-dark">REAL on-chain dead-man's switch</strong>. It is not a demo. Use the safe simulation (default) to see exactly what would happen, with the real timings, NoKs and grace period from your wallet, without changing anything on chain. Switch to <strong>REAL test fire</strong> only if you actually want to trigger inheritance.
        </p>
        <p className="text-text-muted text-xs mt-2">
          Looking for a no-chain throwaway crypto demo? That's <a href="/prove-it" className="text-accent-cyan underline">Prove-It</a> — synthetic data, in-browser only.
        </p>
      </header>

      {/* Mode toggle */}
      <div className="card">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold font-display">Mode:</span>
          <button
            className={`px-3 py-1.5 rounded text-sm border ${mode === "simulation" ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-bold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}
            onClick={() => { setMode("simulation"); setConfirmed(""); }}
          >
            Safe simulation (default · no chain tx)
          </button>
          <button
            className={`px-3 py-1.5 rounded text-sm border ${mode === "real" ? "bg-danger/20 border-danger text-danger font-bold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}
            onClick={() => setMode("real")}
          >
            REAL test fire (chain tx · irreversible)
          </button>
        </div>
        {mode === "real" && (
          <div className="mt-4 p-3 rounded border-2 border-danger bg-danger/10 text-sm space-y-3">
            <p className="font-bold text-danger">⚠ Real fire — this triggers actual inheritance.</p>
            <p className="text-text-on-dark/90">
              The buttons below change real on-chain state. Compressing your grace period + stopping heartbeats will, after the grace elapses, cause Chainlink Automation to activate every queued NoK SBT across <strong>all your vaults</strong>. Once activated, the trigger is permanent — your designated next-of-kin will receive the inheritance, and you cannot un-fire it.
            </p>
            {/* FIX-COPY 4 (audit fix-copy-4-deadman-fire-warning) — make irreversibility explicit. */}
            <p className="text-text-on-dark/90 font-bold">
              Heirs gain immediate unilateral claim authority the moment grace elapses. Resetting your heartbeat AFTER does NOT reverse activation.
            </p>
            <p className="text-text-on-dark/90">
              Type the phrase below exactly to unlock the real-fire buttons:
            </p>
            <p className="font-mono text-xs text-text-muted">{REAL_FIRE_CONFIRMATION}</p>
            <input
              type="text"
              value={confirmed}
              onChange={(e) => setConfirmed(e.target.value)}
              placeholder="Type the phrase here"
              className="block w-full bg-bg-deepest border border-danger/50 rounded p-2 text-sm font-mono"
            />
            <p className="text-xs text-text-muted">
              {realFireUnlocked ? <span className="text-accent-teal font-bold">Unlocked — real-fire buttons are now live.</span> : "Buttons stay disabled until the phrase matches exactly."}
            </p>
          </div>
        )}
      </div>

      {!contractsLive && (
        <div className="card border-2 border-danger">
          <h2 className="font-bold text-danger mb-2">Contracts not deployed</h2>
          <p className="text-sm text-text-on-dark/80">
            Deploy <code>NoKLockOracle.sol</code> + <code>NoKLockSBT.sol</code> and set <code>VITE_ORACLE_CONTRACT_ADDR</code> + <code>VITE_SBT_CONTRACT_ADDR</code> in <code>.env.local</code>.
          </p>
        </div>
      )}

      {gate.status !== "connected" && (
        <WalletGateCard note={mode === "simulation"
          ? "Connect a wallet to walk through the simulation with your live grace + NoK state."
          : "Connect a wallet to fire your real switch."} />
      )}

      {isConnected && contractsLive && mode ==="simulation" && (
        <div className="card">
          <h2 className="font-bold font-display mb-1"><span className="grad">Safe simulation</span></h2>
          <p className="text-text-muted text-sm mb-4">
            This is a front-end-only walkthrough. <strong className="text-accent-teal">No transactions are sent.</strong> The timings shown reflect your wallet's actual grace period + heartbeat state — only no chain change is made.
          </p>
          <ol className="space-y-3">
            {simulationSteps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grad-bg text-text-primary font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                <div>
                  <div className="font-bold text-text-on-dark">{s.title}</div>
                  <div className="text-sm text-text-on-dark/80 mt-1">{s.body}</div>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-xs text-text-muted mt-4">
            Switch to <strong>REAL test fire</strong> mode above if you want to actually exercise this on chain.
          </p>
        </div>
      )}

      {isConnected && contractsLive && mode ==="real" && (
        <>
          <div className="card">
            <h2 className="font-bold font-display mb-3">Live on-chain state</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="text-text-muted pr-4 py-1">Wallet</td><td className="font-mono break-all">{address}</td></tr>
                <tr>
                  <td className="text-text-muted pr-4 py-1">Last heartbeat (oracle)</td>
                  <td className="font-mono">{formatLastHb(lastHb as readonly [bigint, number] | undefined)}</td>
                </tr>
                <tr>
                  <td className="text-text-muted pr-4 py-1">Last activated (block)</td>
                  <td className="font-mono">{lastActivated && Number(lastActivated) > 0 ? Number(lastActivated).toLocaleString() : "never (still alive)"}</td>
                </tr>
                <tr>
                  <td className="text-text-muted pr-4 py-1">Grace override</td>
                  <td className="font-mono">{dm.currentGrace ? `${dm.currentGrace} s (${Math.round((dm.currentGrace / 86400) * 10) / 10} d)` : "(default 60 d)"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h2 className="font-bold font-display mb-3">Step 1 — compress your grace period to 60 seconds</h2>
            <p className="text-sm text-text-muted mb-3">Calls <code>oracle.setGracePeriod(self, 60)</code>. Reversible — Step 4 restores it back to 60 days.</p>
            <button className="btn btn-primary text-sm" disabled={!realFireUnlocked || (dm.step !== "idle" && dm.step !== "done" && dm.step !== "error")} onClick={() => { setLastAction("compress"); void dm.compressGrace(TEST_GRACE_SECONDS); }}>
              {dm.step === "compressing" ? "Sending…" : "Compress grace → 60 s"}
            </button>
            {dm.txHashCompress && <div className="text-xs font-mono mt-2">tx: {tx(dm.txHashCompress)}</div>}
            {errLine("compress")}
          </div>

          <div className="card">
            <h2 className="font-bold font-display mb-3">Step 2 — wait 60 seconds without sending another heartbeat</h2>
            <p className="text-sm text-text-muted mb-3">
              Once compressed, your grace period is 60 seconds. Don't sign a heartbeat in the meantime (signing one resets the timer). After 60 seconds <code>checkUpkeep</code> returns true and the Chainlink Automation forwarder will call <code>performUpkeep</code> on its next check.
            </p>
            <button className="btn btn-secondary text-sm" disabled={!realFireUnlocked} onClick={() => void hb.signAndPost()}>
              (Optional) sign a fresh heartbeat first to reset the clock
            </button>
            <p className="text-xs text-text-muted mt-3">
              ⏱ Real time required: 60 seconds after the compress tx confirms. The actual fire happens when Chainlink Automation polls — that may add a small additional wait depending on the upkeep configuration.
            </p>
          </div>

          <div className="card">
            <h2 className="font-bold font-display mb-3">Step 3 — fire (forwarder-only)</h2>
            <p className="text-sm text-text-muted mb-3">
              <strong className="text-text-on-dark">0.4.x oracle is forwarder-ONLY.</strong> Direct <code>performUpkeep</code> from your wallet will revert with <code>NotForwarder</code> — by design (so no individual key, including yours, can fire arbitrarily). Chainlink Automation fires this automatically once your grace elapses.
            </p>
            <p className="text-sm text-text-muted mb-3">
              The button below is left in for advanced users who ARE the registered forwarder (e.g. local-fork dress-rehearsal). For the standard flow, just wait — Chainlink fires.
            </p>
            <button className="btn btn-danger text-sm" disabled={!realFireUnlocked || dm.step === "performing-upkeep"} onClick={() => { setLastAction("upkeep"); void dm.performUpkeepNow(); }}>
              {dm.step === "performing-upkeep" ? "Sending…" : "Try performUpkeep (forwarder-only)"}
            </button>
            {dm.txHashUpkeep && <div className="text-xs font-mono mt-2">tx: {tx(dm.txHashUpkeep)}</div>}
            {errLine("upkeep")}
          </div>

          <div className="card">
            <h2 className="font-bold font-display mb-3">Step 4 — reset grace</h2>
            <p className="text-sm text-text-muted mb-3">Restores grace to the default 60 days. This does NOT un-activate already-fired SBTs — the trigger is permanent on-chain.</p>
            <button className="btn btn-secondary text-sm" disabled={!realFireUnlocked || dm.step === "resetting"} onClick={() => { setLastAction("reset"); void dm.resetGrace(); }}>
              {dm.step === "resetting" ? "Sending…" : "Reset grace → 60 days"}
            </button>
            {dm.txHashReset && <div className="text-xs font-mono mt-2">tx: {tx(dm.txHashReset)}</div>}
            {errLine("reset")}
          </div>

          {dm.error && dm.step === "error" && lastAction === null && (
            <div className="card border-danger border text-danger text-sm break-words">{humanizeTxError(dm.error)}</div>
          )}
        </>
      )}
    </div>
  );
}

// -- Safe-simulation walkthrough -----------------------------------------

interface SimStep { readonly title: string; readonly body: JSX.Element | string }

function buildSimulationSteps(): readonly SimStep[] {
  return [
    {
      title: "Today: you sign a heartbeat",
      body: "Each heartbeat (off-chain signed or on-chain self-sign) tells the oracle you're alive. Your grace timer resets the moment your wallet's latest heartbeat is recorded. While you check in, nothing changes.",
    },
    {
      title: "60 days of silence (default grace)",
      body: "If you stop heartbeating for the whole grace period, the oracle considers you absent. The grace is owner-configurable (1 day to 10 years; default 60 days). Nothing happens at the chain level until the grace elapses.",
    },
    {
      title: "Chainlink Automation calls performUpkeep",
      body: "When grace elapses, the immutable Chainlink Automation forwarder fires. The oracle activates every queued NoK SBT (Activation role) across all your vaults. Status flips Locked-Inactive → Locked-Active. State is cumulative — re-org cannot undo it.",
    },
    {
      title: "Form B watches the activation event",
      body: "An indexer on the api.noklock.app service watches `NoKActivated`. For email-NoK (Hybrid-E) bindings, it enqueues the heir-walkthrough email automatically. Wallet-NoKs already hold the SBTs they need to claim their share of the off-chain manifest.",
    },
    {
      title: "Your designated NoKs inherit",
      body: "Each NoK presents their SBT + their master password + the off-chain share manifests to restore the vault. Multi-NoK voting (M-of-N quorum) gates release from v0.6 onwards (Premium, see /pricing for current status); vaults enrolled before v0.6 remain owner-restorable — re-enrol to upgrade. The whole thing runs without you, without a server holding your keys, without a court order.",
    },
  ];
}

function formatLastHb(value: readonly [bigint, number] | undefined): string {
  if (!value) return "—";
  const ts = Number(value[0]);
  if (ts === 0) return "never";
  return `${new Date(ts * 1000).toISOString()} (${value[1]})`;
}

function tx(hash: `0x${string}`): JSX.Element {
  return (
    <a href={`https://polygonscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">
      {hash.slice(0, 10)}…{hash.slice(-6)}
    </a>
  );
}
