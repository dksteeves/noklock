// @version 0.3.0 @date 2026-06-14
// 0.3.0 — Daniel 2026-06-14 (GATE no-friction fix): REMOVE the "Taking too
//   long?" <details> + <ConnectWallet/> escape from the 'reconnecting' branch.
//   A returning/connected user hard-refreshing an admin page must see ZERO
//   connect-buttons UI — just a calm no-button "Reconnecting your wallet…"
//   spinner — and then the page. Connect buttons now live ONLY in the
//   'disconnected' branch (genuine disconnect: never-connected, explicit
//   disconnect, or the bounded recovery window genuinely expired). The wedged-
//   reconnect escape is NOT lost: walletSession.ts's event-rescue (unlock
//   Trust / refocus tab / accountsChanged) recovers it with no user action, and
//   if the driver's ≤8s window truly fails the gate falls to 'disconnected' and
//   THESE same connect buttons appear then. Paired with wallet-recovery.ts 0.2.0
//   (arms the window at module load) so 'reconnecting' is shown from the first
//   paint and never flashes 'disconnected' first.
// @version 0.2.0 @date 2026-06-12
// 0.2.0 — Daniel 2026-06-12 (WORKSTREAM B — universal "reconnecting" gate fix):
//   split the not-connected UI by gate.status so the BOUNDED reconnect window
//   reads as a CALM "Reconnecting your wallet…" block (small spinner + an
//   unlock hint), NOT bare Connect buttons. The 'disconnected' branch keeps the
//   PRIMARY "Connect your wallet to continue" prompt unchanged. Connected → null.
//   (0.2.0 kept a de-emphasised manual <ConnectWallet/> behind a "Taking too
//   long?" affordance; REMOVED in 0.3.0 — it still showed connect UI to a
//   returning user mid-reconnect, which Daniel ruled out.)
// @version 0.1.0 @date 2026-06-11
// Daniel 2026-06-11 wallet rebuild — THE single not-connected surface
// (WALLET-REBUILD-EXEC-2026-06-11). Every gated page renders THIS card (and
// nothing else) when the wallet is not connected. Properties:
//   - The connect buttons are ALWAYS present and live — including while a
//     previous session is still restoring. Tapping "connect" runs wagmi
//     connect() (requestAccounts), which pops/unlocks a locked extension and
//     bypasses a wedged auto-restore (the only action that does — see
//     WALLET-CONNECT-ROOTCAUSE-2026-06-11). There is NO spinner-only state.
//   - No timers, no deadlines, no retries, no escalation. Status comes from
//     useWalletGate (address = connected); this card renders null when
//     connected (defensive — parents gate before mounting it).
//   - `title`/`note` let a page keep its specific framing copy WITHOUT
//     inventing another dialog. The card itself is identical everywhere.

import type { ReactNode } from "react";
import { ConnectWallet } from "./ConnectWallet.js";
import { useWalletGate } from "../hooks/useWalletGate.js";

export function WalletGateCard({
  title,
  note,
}: {
  readonly title?: string;
  readonly note?: ReactNode;
}): JSX.Element | null {
  const gate = useWalletGate();

  if (gate.status === "connected") return null;

  // 0.3.0 — CALM, NO-BUTTON reconnecting block. The driver is actively retrying
  // a wiped/settled connection (bounded window — see lib/wallet-recovery). A
  // returning user must see NO connect UI here — just a spinner + an unlock
  // hint. The wedged-restore escape is handled silently by walletSession.ts's
  // event-rescue (unlock/refocus/accountsChanged); if the bounded window truly
  // expires the gate falls to 'disconnected' and the connect buttons appear
  // there. (0.2.0's "Taking too long?" <ConnectWallet/> removed —
  // WALLET-CONNECT-ROOTCAUSE-2026-06-11 / GATE-NO-FRICTION-2026-06-14.)
  if (gate.status === "reconnecting") {
    return (
      <div className="card text-center space-y-3">
        {title ? <h2 className="text-lg font-bold">{title}</h2> : null}
        {note ? <div className="text-sm text-text-on-dark/80">{note}</div> : null}
        <div className="flex items-center justify-center gap-2" aria-live="polite">
          <span
            className="inline-block w-4 h-4 rounded-full border-2 border-text-muted/40 border-t-text-muted animate-spin"
            aria-hidden
          />
          <span className="text-sm font-medium">Reconnecting your wallet…</span>
        </div>
        <p className="text-xs text-text-muted">
          If your wallet extension is locked, unlock it.
        </p>
      </div>
    );
  }

  // 'disconnected' — genuinely no wallet. PRIMARY connect prompt.
  return (
    <div className="card text-center space-y-3">
      <h2 className="text-lg font-bold">{title ?? "Connect your wallet to continue"}</h2>
      {note ? <div className="text-sm text-text-on-dark/80">{note}</div> : null}
      <div className="flex justify-center">
        <ConnectWallet />
      </div>
    </div>
  );
}
