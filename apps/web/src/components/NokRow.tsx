// @version 0.1.0 @date 2026-05-13

import { useState } from "react";
import { useNokRevoke } from "../hooks/useNokRevoke.js";
import { SBT_ROLE } from "../lib/sbt-contract.js";
import type { NokEntry } from "../hooks/useNokList.js";

interface Props {
  readonly entry: NokEntry;
  readonly onRevoked?: () => void;
}

export function NokRow({ entry, onRevoked }: Props): JSX.Element {
  const { step, error, txHashes, revoke, reset } = useNokRevoke();
  const [confirming, setConfirming] = useState(false);

  async function doRevoke(): Promise<void> {
    await revoke({
      activation: entry.tokensByRole[SBT_ROLE.Activation],
      voting: entry.tokensByRole[SBT_ROLE.Voting],
      revocation: entry.tokensByRole[SBT_ROLE.Revocation],
    });
    if (onRevoked) onRevoked();
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-muted mb-1">NoK wallet</div>
          <div className="font-mono text-sm break-all">{entry.nokWallet}</div>
          <div className="text-xs text-text-muted mt-3 mb-1">Vault ID</div>
          <div className="font-mono text-xs text-text-on-dark/70 break-all">{entry.vaultId.slice(0, 18)}…{entry.vaultId.slice(-8)}</div>
        </div>
        <div className="text-xs space-y-1 text-right">
          <div><span className="text-text-muted">Activation</span> #{entry.tokensByRole[SBT_ROLE.Activation]?.toString() ?? "–"}</div>
          {/* Voting only exists for M-of-N quorum vaults; Revocation only on
              legacy (pre-2026-06-16) designations — show each ONLY if present. */}
          {entry.tokensByRole[SBT_ROLE.Voting] !== undefined && (
            <div><span className="text-text-muted">Voting</span> #{entry.tokensByRole[SBT_ROLE.Voting]!.toString()}</div>
          )}
          {entry.tokensByRole[SBT_ROLE.Revocation] !== undefined && (
            <div><span className="text-text-muted">Revocation</span> #{entry.tokensByRole[SBT_ROLE.Revocation]!.toString()}</div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        {!confirming && step === "idle" && (
          <button className="btn btn-danger text-sm" onClick={() => setConfirming(true)}>Revoke</button>
        )}
        {confirming && step === "idle" && (
          <>
            <button className="btn btn-secondary text-sm" onClick={() => setConfirming(false)}>Cancel</button>
            <button className="btn btn-danger text-sm" onClick={() => void doRevoke()}>
              Confirm revoke (3 transactions)
            </button>
          </>
        )}
        {step !== "idle" && step !== "done" && step !== "error" && (
          <span className="text-sm text-accent-cyan">{labelFor(step)}…</span>
        )}
        {step === "done" && (
          <>
            <span className="text-sm text-accent-green">Revoked ✓</span>
            <button className="btn btn-secondary text-sm" onClick={reset}>OK</button>
          </>
        )}
      </div>

      {txHashes.length > 0 && (
        <div className="text-xs text-text-muted mt-3 space-y-0.5 font-mono">
          {txHashes.map((h) => (
            <div key={h}>
              tx: <a href={`https://polygonscan.com/tx/${h}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">{h.slice(0, 10)}…{h.slice(-6)}</a>
            </div>
          ))}
        </div>
      )}
      {error && <div className="text-xs text-danger mt-2 break-words">{error}</div>}
    </div>
  );
}

function labelFor(step: string): string {
  switch (step) {
    case "burning-activation": return "Burning activation SBT (1/3)";
    case "burning-voting":     return "Burning voting SBT (2/3)";
    case "burning-revocation": return "Burning revocation SBT (3/3)";
    default: return step;
  }
}
