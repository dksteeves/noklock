// @version 0.1.0 @date 2026-06-12
// Daniel 2026-06-12 (WORKSTREAM B — universal wallet-gate "reconnecting" fix).
//
// A tiny external store (module-scope boolean + a Set of listeners). It owns
// NO timers of its own. It bridges the BOUNDED post-settle reconnect window so
// gates can show "Reconnecting…" (NOT bare Connect buttons) ONLY while the
// WalletSessionDriver is GENUINELY retrying — and it SELF-CLEARS so it can
// never strand a user on a permanent false 'reconnecting' (the 0.3.1 bug).
//
// WHY THIS EXISTS: on a soft/F5 reset of a gated page, wagmi's reconnect-on-
// mount against an idle/locked Trust MV3 extension often SETTLES to status
// 'disconnected' (empty eth_accounts) before the extension's service worker
// wakes. walletSession.ts's WalletSessionDriver then pokes reconnect at
// 1s/3s/8s (+ an event-rescue) and usually wins a few seconds later. But once
// wagmi has settled 'disconnected' AND the reconnect cycle has started,
// useWalletGate's boot bridge is disarmed, so it returns 'disconnected' in the
// gaps and the gate flashes bare Connect buttons. This store lets the driver
// announce "I am actively retrying" for exactly that window; the driver marks
// it SETTLED on the first 'connected' OR after its final (8s) poke, so the
// window is bounded by the driver's own retry schedule, not by a clock here.
//
// No React, no timers, no storage. Just: set/clear + notify on CHANGE only.

let recoveryActive = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const cb of listeners) cb();
}

/** Is the driver currently in its bounded post-settle reconnect window? */
export function isRecoveryActive(): boolean {
  return recoveryActive;
}

/** The driver is retrying a wiped/settled connection. Idempotent — notifies
 *  only on a false→true transition. */
export function markRecoveryActive(): void {
  if (recoveryActive) return;
  recoveryActive = true;
  notify();
}

/** The driver's retry window is over (connected, or final poke fired, or the
 *  driver unmounted). Idempotent — notifies only on a true→false transition.
 *  This is what guarantees the store can never strand a user. */
export function markRecoverySettled(): void {
  if (!recoveryActive) return;
  recoveryActive = false;
  notify();
}

/** Subscribe to recovery-state changes (useSyncExternalStore-compatible).
 *  Returns an unsubscribe function. */
export function subscribeRecovery(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
