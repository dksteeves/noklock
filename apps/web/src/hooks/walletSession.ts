// @version 0.8.0 @date 2026-06-14
// 0.8.0 — Daniel 2026-06-14 (GATE no-friction fix, part 2): REVERT the 0.7.0
//   8s→15s retry-window extension back to [1000,3000,8000]. With useWalletGate
//   0.4.0 now rendering the page IMMEDIATELY from the persisted address
//   (BOOT_ADDRESS), there is no visible spinner to keep on screen during a slow
//   cold wake — so the 15s tail is no longer load-bearing and only lengthened
//   the stranded-bound for a genuinely-uninstalled wallet. Back to 8s. The
//   driver + poke schedule + event-rescue are KEPT unchanged: they still perform
//   the real background rebind that swaps the optimistic persisted address for
//   wagmi's live address (and recover on unlock/refocus after the window closes).
// @version 0.7.0 @date 2026-06-14
// 0.7.0 — Daniel 2026-06-14 (GATE no-friction fix — kill the Connect-buttons
//   flash on a returning user's hard refresh). ROOT CAUSE of the residual
//   flash (NOT the first-render race — the status branch + the on-mount
//   markRecoveryActive already cover that): the recovery window CLOSED TOO
//   EARLY. The 1s/3s/8s schedule settled the window at 8s, but a cold/locked
//   Trust MV3 service worker often finishes waking + rebinding a few seconds
//   LATER (the 8s eth_accounts poke wakes it; its accountsChanged → reconnect
//   lands at ~10-12s). In that gap wagmi is settled 'disconnected' with the
//   window already closed → the gate blipped to 'disconnected' → bare Connect
//   buttons flashed → then the late rebind connected → the page. FIX: extend
//   the schedule to 1s/3s/8s/15s so the window stays open (calm, NO-button
//   'Reconnecting…' per WalletGateCard 0.3.0) until the cold rebind reliably
//   wins. Stranded bound is now 15s (was 8s) — a genuinely-gone wallet shows
//   the calm spinner for 15s, THEN the Connect buttons (correct). The event-
//   rescue still reconnects instantly on unlock/refocus/accountsChanged even
//   after the window closes, so a late wake auto-connects rather than stranding
//   on the buttons. No new timers, no clock in the gate — same structure, two
//   numbers + one extra wake-poke.
// @version 0.6.0 @date 2026-06-12
// 0.6.0 — Daniel 2026-06-12 (WORKSTREAM B — universal "reconnecting" gate fix):
//   wire the WalletSessionDriver into lib/wallet-recovery's tiny external store
//   so every gate can show a calm "Reconnecting…" (NOT bare Connect buttons)
//   while the driver is GENUINELY retrying a wiped/settled connection. On mount,
//   when hadWalletAtBoot() && wagmi status !== 'connected' → markRecoveryActive().
//   The window is BOUNDED by the driver's own schedule: markRecoverySettled() on
//   the first 'connected' (new status effect) AND after the FINAL (8s) poke fires
//   (even if still not connected) AND on unmount. The store self-clears, so this
//   can NEVER reintroduce the 0.3.1 permanent false-'reconnecting' bug. All
//   existing poke + event-rescue behaviour is unchanged.
// @version 0.5.0 @date 2026-06-11
// 0.5.0 — Daniel 2026-06-11 (/marketing-corruption fix, parts 3+4). The 0.3.0
//   "connected = trusted" rebuild left ZERO recovery for a GENUINELY wiped
//   connection (a full-document reload against a cold/locked extension makes
//   wagmi settle 'disconnected' + wipe its persisted connection). Two no-timer
//   additions: (A) the existing one-shot 1s/3s/8s poke schedule may now retry
//   after a SETTLED 'disconnected' when hadWalletAtBoot() — the first
//   eth_accounts probe usually wakes the extension's MV3 service worker, so
//   retry 2/3 silently restores. (B) NEW event-driven rescue effect:
//   visibilitychange/focus + provider accountsChanged → reconnect() when
//   status !== 'connected' && hadWalletAtBoot(), so recovery fires the instant
//   the user unlocks the wallet or refocuses the tab — no hard refresh. Both
//   use reconnect()'s eth_accounts path (cannot hang/prompt) and respect
//   explicit disconnect (hadWalletAtBoot() is false after TopNav clears keys).
// @version 0.4.0 @date 2026-06-04
// 0.4.0 — Daniel 2026-06-04 deep-dive refactor. GUTTED from a parallel
//         state machine + active driver to a thin compat shim. The
//         previous implementation owned:
//           - currentStatus module-singleton (3-state enum)
//           - useSyncExternalStore subscribe/getSnapshot
//           - 800ms falling-edge debounce
//           - 1s / 3s / 8s active retry schedule + synthetic eip6963
//             dispatch
//           - <WalletSessionDriver/> mounted once in App
//         All of that fought wagmi v2's own native reconnect (per the
//         deep dive's root-cause analysis). This file now delegates to
//         useWalletGate (single source over wagmi useAccount + managed-
//         wallet) and lib/wallet-bootstrap (sync localStorage read).
//
//         Files that imported from here:
//           - useWalletStatus     → re-routed to useWalletGate
//           - getWalletStatus     → re-routed to gate-state-at-this-moment;
//                                   tests still use it
//           - hasHadWallet        → hadWalletAtBoot
//           - markWalletDisconnected → forgetWalletAtBoot
//           - WalletSessionDriver → kept as a render-null no-op so the
//                                   App.tsx mount continues to compile;
//                                   removed in a follow-up.
// 0.3.4–0.1.0 — historical; see git or feedback memory.

import { useWalletGate } from "./useWalletGate.js";
import { hadWalletAtBoot, forgetWalletAtBoot } from "../lib/wallet-bootstrap.js";
import { markRecoveryActive, markRecoverySettled } from "../lib/wallet-recovery.js";

export type WalletStatus = "connected" | "reconnecting" | "disconnected";

/** Subscribe to the live wallet status. Pure reader — no side effects. */
export function useWalletStatus(): WalletStatus {
  return useWalletGate().status;
}

/** Sync read: did this browser previously hold a connected wallet? */
export function hasHadWallet(): boolean {
  return hadWalletAtBoot();
}

/** Imperative: forget the persisted wallet binding. Called from the
 *  TopNav Disconnect handler. */
export function markWalletDisconnected(): void {
  forgetWalletAtBoot();
}

/**
 * Imperative read of the current wallet status.
 *
 * NOTE: under the new architecture this can no longer return a precise
 * snapshot outside of React (the source of truth is wagmi's React store).
 * The only consumer is the test file `wallet-storage-keys.test.ts`. We
 * approximate by returning "connected" if BOOT_HAD_WALLET is true OR the
 * legacy flag is set, otherwise "disconnected". This is good enough for
 * the test's purpose (verifying the localStorage-cleanup behaviour) and
 * we intend to delete this export when the test is updated.
 */
export function getWalletStatus(): WalletStatus {
  return hadWalletAtBoot() ? "connected" : "disconnected";
}

/**
 * Mounted ONCE in App.tsx. Drives ONE tiny effect: if wagmi is still in
 * the 'connecting' or 'reconnecting' state ~1 / 3 / 8 seconds after mount,
 * poke the EIP-6963 handshake + call wagmi.reconnect() again. This wakes
 * slow extensions (MetaMask after browser idle, mobile WalletConnect
 * after app-switch) whose initial wagmi reconnect-on-mount didn't get a
 * provider-announce in time.
 *
 * This is the ONLY thing left of the previous walletSession.ts driver —
 * the parallel store + debounce + status enum are gone. The retry-poke
 * schedule is kept because removing it regressed slow-extension wake
 * (Daniel: hard-refresh /admin "won't reconnect for a long while").
 */
import { useEffect, useRef } from "react";
import { useAccount, useReconnect } from "wagmi";

// 0.8.0 — back to 1s/3s/8s. The page now renders immediately from the persisted
// address (useWalletGate 0.4.0), so the recovery window no longer hides a
// spinner — its only remaining job is the address-less BOOT_HAD_WALLET path
// (legacy users with no persisted address), for which 8s is the prior, adequate
// bound. (0.7.0 had pushed this to 15s to mask the cold-wake spinner; no longer
// needed.) The final index still settles the recovery store in pokeAndRetry.
const RETRY_SCHEDULE_MS: readonly number[] = [1000, 3000, 8000];

export function WalletSessionDriver(): null {
  const { status } = useAccount();
  const { reconnect } = useReconnect();
  const statusRef = useRef(status);
  statusRef.current = status;

  // 0.6.0 — settle the recovery store the instant wagmi reports 'connected',
  // so a gate stops showing "Reconnecting…" the moment the wallet rebinds (the
  // address-trust branch in useWalletGate takes over). Idempotent.
  useEffect(() => {
    if (status === "connected") markRecoverySettled();
  }, [status]);

  useEffect(() => {
    // No prior session → nothing to reconnect to.
    if (!hadWalletAtBoot()) return;

    // 0.6.0 — open the BOUNDED recovery window: a wallet was here at boot and
    // wagmi isn't connected yet, so the driver is about to retry. Gates show a
    // calm "Reconnecting…" instead of bare Connect buttons. Settled below after
    // the final poke (or earlier, by the status effect, on 'connected').
    if (statusRef.current !== "connected") markRecoveryActive();

    const lastIndex = RETRY_SCHEDULE_MS.length - 1;
    const pokeAndRetry = (index: number): void => {
      // 0.6.0 — BOUND the recovery window: once the FINAL (8s) poke has fired,
      // settle the store even if we're still not connected, so a gate can never
      // be stranded on a permanent false "Reconnecting…" (the 0.3.1 bug). Runs
      // in a finally so it settles regardless of the early returns below. The
      // event-rescue effect still recovers later on unlock/focus, and the
      // status effect re-settles on the eventual 'connected'.
      try {
        // If wagmi already settled to 'connected' or true 'disconnected',
        // we have our answer — don't fight wagmi.
        // 0.5.0 — retry after a SETTLED 'disconnected' ONLY when a wallet was
        // present at boot (a genuine wipe to recover, not a fresh visitor or an
        // explicit disconnect). The eth_accounts probe usually wakes the
        // extension's idle service worker, so a later poke wins.
        const s = statusRef.current;
        if (s === "connected") return;
        if (s === "disconnected" && !hadWalletAtBoot()) return;
        try {
          // Synthetic EIP-6963 prompt — some extensions only announce in
          // response to an explicit requestProvider event.
          window.dispatchEvent(new Event("eip6963:requestProvider"));
        } catch {
          /* envs that disallow synthetic events */
        }
        try {
          reconnect();
        } catch {
          /* wagmi guards concurrent reconnects */
        }
      } finally {
        if (index >= lastIndex) markRecoverySettled();
      }
    };

    const timers = RETRY_SCHEDULE_MS.map((ms, index) =>
      window.setTimeout(() => pokeAndRetry(index), ms),
    );
    return () => {
      for (const t of timers) window.clearTimeout(t);
      // 0.6.0 — driver unmounting (App teardown / StrictMode remount) must not
      // leave the recovery window open with no poke left to close it. Settle is
      // idempotent and a fresh mount re-opens it if still not connected.
      markRecoverySettled();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnect]);

  // 0.5.0 — Event-driven rescue (NO timers). After the first 8s the SPA has
  // zero reconnect callers, so a connection wiped by a full-document reload
  // against a cold/locked extension — or a click-connect pinned 'connecting'
  // by a hung wallet_requestPermissions — is unrecoverable by soft means.
  // Recover at the exact human moment the precondition is fixed: the user
  // unlocks the wallet (provider 'accountsChanged' with accounts) or returns
  // focus to the tab. reconnect()'s isReconnecting path uses eth_accounts
  // (never wallet_requestPermissions), so it cannot hang or prompt, and its
  // success setStates the connection directly (bypassing wagmi's discard of
  // the extension's own 'connect' self-heal while status is pinned). No-op in
  // healthy sessions (status 'connected') and after an explicit disconnect
  // (hadWalletAtBoot() is false once TopNav clears the legacy keys).
  useEffect(() => {
    const rescue = (): void => {
      if (statusRef.current === "connected") return;
      if (!hadWalletAtBoot()) return;
      try { reconnect(); } catch { /* wagmi serialises concurrent reconnects */ }
    };
    const onVisible = (): void => { if (document.visibilityState === "visible") rescue(); };
    const eth = (window as unknown as {
      ethereum?: {
        on?: (e: string, h: (a: unknown) => void) => void;
        removeListener?: (e: string, h: (a: unknown) => void) => void;
      };
    }).ethereum;
    const onAccountsChanged = (accs: unknown): void => {
      if (Array.isArray(accs) && accs.length > 0) rescue();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", rescue);
    try { eth?.on?.("accountsChanged", onAccountsChanged); } catch { /* provider may not support */ }
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", rescue);
      try { eth?.removeListener?.("accountsChanged", onAccountsChanged); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnect]);

  return null;
}
