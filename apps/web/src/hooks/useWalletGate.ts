// @version 0.4.0 @date 2026-06-14
// 0.4.0 — Daniel 2026-06-14 (GATE no-friction fix — render the PAGE, not a
//   spinner, for a returning user). The 0.3.x line correctly trusted a LIVE
//   address over wagmi's status string, but on a hard refresh against a
//   cold/idle Trust MV3 extension there is genuinely NO live address for the
//   several seconds the service worker takes to wake — so the gate fell to
//   'reconnecting' and every gated page showed the calm spinner the WHOLE time.
//   Daniel's requirement is absolute: if he is already connected, the page must
//   render IMMEDIATELY with no reconnect spinner. FIX: surface the PERSISTED
//   address (persistedAddressAtBoot — wagmi's own persisted connections, read
//   synchronously at module load into BOOT_ADDRESS) as a 'connected' gate while
//   wagmi rebinds the SAME address in the background. The live wagmi.address
//   branch keeps STRICT precedence (it wins the instant wagmi holds an address,
//   so a rebind is invisible), and the optimistic branch is bounded by the SAME
//   self-clearing window the BOOT_HAD_WALLET bridge uses, so a genuinely-gone
//   wallet still settles to 'disconnected'. SAFE: no consumer signs/writes off
//   gate.address (all signing uses wagmi's own useSignMessage/useWriteContract),
//   and every server/chain action is independently signature-gated — optimistic
//   rendering grants zero privilege (adversarially verified 2026-06-14).
// @version 0.3.2 @date 2026-06-12
// 0.3.2 — Daniel 2026-06-12 (WORKSTREAM B — universal "reconnecting" gate fix):
//   widen ONLY the final boot-bridge branch so a gate shows a calm
//   'reconnecting' (not bare Connect buttons) during the BOUNDED window the
//   WalletSessionDriver is actively retrying a wiped/settled connection. The
//   branch was (BOOT_HAD_WALLET && !RECONNECT_CYCLE_STARTED); on a soft/F5
//   reset against an idle/locked Trust MV3 extension wagmi often SETTLES
//   'disconnected' BEFORE the extension wakes, so RECONNECT_CYCLE_STARTED is
//   already true and the bridge was disarmed — the gate flashed bare Connect in
//   the gaps until a driver poke won. Now also held open while
//   `recoveryActive` (lib/wallet-recovery, fed by the driver). WHY THIS CANNOT
//   REGRESS 0.3.1's permanent false-'reconnecting': recoveryActive is NOT a
//   page-lifetime latch — the driver SELF-CLEARS it (markRecoverySettled) on
//   the first 'connected' AND after its final (8s) poke AND on unmount, so the
//   widened window is strictly bounded by the driver's retry schedule and a
//   genuinely disconnected user always falls through to 'disconnected'. Every
//   other branch (managed path, address-trust, connecting/reconnecting status,
//   the RECONNECT_CYCLE_STARTED render-write) is byte-identical.
// @version 0.3.1 @date 2026-06-11
// 0.3.1 — Daniel 2026-06-11 (/marketing-corruption fix, part 2): the
//   reconnect-cycle-started fact is now MODULE-scope (page-lifetime), not a
//   per-hook-instance useRef. KeyedBoundary remounts every route gate on each
//   soft nav with a fresh ref=false, so after wagmi had SETTLED 'disconnected'
//   (e.g. a /marketing full-reload wiped the connection) a remounted gate
//   resurrected the BOOT_HAD_WALLET bridge and returned a PERMANENT false
//   'reconnecting' ("Restoring your previous session…" that never resolves +
//   the TopNav-vs-gate contradiction). Module scope preserves the genuine boot
//   bridge (flag false until status first moves) and disarms it forever after,
//   so remounted gates report wagmi's honest state. Address-trust (line ~189),
//   the status mapping, and OwnerOnly's fast-path are UNCHANGED; no timers.
// @version 0.3.0 @date 2026-06-11
// 0.3.0 — Daniel 2026-06-11: CONNECTED = TRUSTED, NEVER RE-VERIFY. The real
//   fix for "I open the app, connect the wallet, navigate to /admin or
//   /dashboard, and it STILL tries to verify/reconnect."
//
//   ROOT CAUSE (supersedes 0.2.0's bounded-reconnect deadline, which treated
//   a symptom): this hook derived trust from wagmi's status STRING instead of
//   from the presence of a live address. The only branch that surfaced an
//   address required `wagmi.status === "connected"`; the 'connecting',
//   'reconnecting', and BOOT_HAD_WALLET branches all hard-coded
//   `address: undefined` — discarding the address wagmi itself already
//   exposes during those statuses. wagmi v2 persists `connections`
//   (including accounts) + `current`, and its own getAccount() returns the
//   address with `isConnected: !!address` while status === 'reconnecting'
//   (@wagmi/core getAccount.js:23-35) — by wagmi's own semantics an
//   address-bearing reconnecting wallet IS connected. Every full-document
//   entry to a gated route (URL-bar nav, hard refresh, TWA activity
//   recreation after the WalletConnect app-switch) re-runs reconnect-on-
//   mount, pinning status to 'reconnecting' while the address sits in wagmi
//   state — so the hook reported {status:'reconnecting', address:undefined}
//   for a live wallet, every synchronous admin allowlist check downstream
//   received undefined, and the gates fell into 'Verifying access…' spinners
//   and (after the 0.2.0 10s deadline) a Connect button for a wallet that
//   never disconnected.
//
//   THE RULE (Daniel's principle, verbatim intent): if wagmi reports a live
//   connection (an address is present), EVERY gate trusts it IMMEDIATELY and
//   unconditionally — no reconnect attempt, no 'reconnecting'/'verifying'
//   spinner, no timeout, no Connect button. Admin authorization stays a
//   SYNCHRONOUS check of the already-connected address against the
//   allowlist. The ONLY state that may show 'Connect a wallet' is genuine
//   disconnection (no address at all).
//
//   IMPLEMENTATION:
//     1. `if (wagmi.address) → connected` now PRECEDES and SUBSUMES every
//        status-string branch. 'reconnecting' can only ever be reported when
//        there is genuinely NO address yet.
//     2. RECONNECT_DEADLINE_MS (the 10s timeout) is DELETED — no timer may
//        ever gate a wallet. The wedged-reconnect scenario that motivated it
//        (single-flight lock parked on a hung provider await) is now
//        cosmetically irrelevant: the persisted address is present during
//        the wedge, so the hook reports 'connected' and the gates render
//        while wagmi rebinds in the background.
//     3. The BOOT_HAD_WALLET bridge (no-address-yet cold boot) is no longer
//        held open by a clock. Instead we observe wagmi's own reconnect
//        cycle: reconnect() ALWAYS moves status off 'disconnected' when it
//        starts (@wagmi/core reconnect.js:8-11) and always settles back to
//        'connected' or 'disconnected' when it finishes (reconnect.js:84-96).
//        So: wagmi 'disconnected' BEFORE the cycle ever started = the brief
//        pre-reconnect hydration window → hold 'reconnecting' (no Connect
//        flash for a returning user). wagmi 'disconnected' AFTER the cycle
//        ran = wagmi's settled verdict (reconnect tried and found nothing,
//        or the user explicitly disconnected) → genuine 'disconnected'.
//        No timer, no stranding, no Connect-to-a-connected-wallet.
//   Companion fix: wallet-bootstrap.ts 0.2.0 + offchainAdmins.ts 0.2.0 now
//   read wagmi's REAL persisted key ("noklock-wagmi.store" — createStorage
//   appends `.${key}` to the prefix) instead of the bare "noklock-wagmi"
//   key wagmi never writes.
// @version 0.2.0 @date 2026-06-11 — bounded-reconnect 10s deadline
//   (REMOVED in 0.3.0: it converted a live-but-relabelled wallet into a
//   Connect prompt — the exact forbidden behaviour).
// @version 0.1.0 @date 2026-06-04
// Single-source unified wallet-gate hook.
//
// PURPOSE: replace the previous parallel state machine (walletSession.ts's
// module-singleton store + active polling driver + 800ms falling-edge
// debounce + WalletReconnecting card's own per-instance grace + 120s
// escalation timers) with ONE hook every gate reads. The hook composes:
//
//   - useAccount() from wagmi v2  — the canonical self-custody source of
//     truth. We trust the ADDRESS, not the status string: wagmi keeps the
//     persisted account visible during 'reconnecting'/'connecting', and an
//     address-bearing wallet is connected by wagmi's own getAccount()
//     semantics.
//
//   - useHeirClaim() from lib/managed-wallet — the NL-1 / NL-2 managed
//     wallet (Privy embedded). Returns { authenticated, embedded.address,
//     embedded.ready, ... }. In NL-1 flag-off mode this is a no-op session
//     and managed-related fields are null/false, so the gate falls through
//     to the self-custody path. In NL-2 (flag on) a managed-signed heir
//     becomes "connected" via this path without ever touching wagmi.
//
//   - hadWalletAtBoot() from lib/wallet-bootstrap — one-shot SYNCHRONOUS
//     read of wagmi's own persisted storage at first render so we can
//     distinguish "previously-connected, hydration pending" from
//     "first-visit, never connected". Bridges ONLY the pre-reconnect boot
//     window; once wagmi's reconnect cycle has run, wagmi's verdict wins.
//
// CONSUMERS (gates):
//   - if (gate.status === 'disconnected') render <ConnectPrompt/> — this is
//     now GENUINE disconnection only (no address anywhere).
//   - if (gate.status === 'reconnecting') render a calm busy state — this is
//     now the GENUINE no-address-yet cold boot only. A wallet with a live
//     address can never reach it.
//   - if (gate.status === 'connected') render children fully + use the
//     unified address. gate.kind tells you which path won (for telemetry /
//     UX copy variations only — gates should not branch on it).
//
// NON-GOALS:
//   - This hook does NOT poll, debounce, or run timers. No setInterval, no
//     setTimeout, no deadline. wagmi's own reconnectOnMount handles
//     rebinding; we render from the state it already holds.

import { useSyncExternalStore } from "react";
import { useAccount } from "wagmi";
import { useHeirClaim } from "../lib/managed-wallet.js";
import { hadWalletAtBoot, persistedAddressAtBoot } from "../lib/wallet-bootstrap.js";
import { isRecoveryActive, subscribeRecovery } from "../lib/wallet-recovery.js";

// Compute the boot-time "had a wallet" flag exactly ONCE per page load,
// outside the hook body, so every consumer in the tree sees the same value
// and React's render cycle does not re-evaluate it. Used ONLY to bridge the
// pre-reconnect hydration window (see status semantics below); once wagmi's
// reconnect cycle has started, wagmi's own state drives the gate.
const BOOT_HAD_WALLET = (() => {
  try {
    return hadWalletAtBoot();
  } catch {
    return false;
  }
})();

// 0.4.0 — the ADDRESS wagmi persisted last session, read ONCE at module load
// (synchronous, before any render). Non-undefined ⇒ a returning user we can
// render 'connected' immediately while wagmi rehydrates the live connection.
// undefined for first-visit / post-disconnect (forgetWalletAtBoot clears the
// trail) ⇒ the optimistic branch below is a no-op and the gate behaves as 0.3.x.
const BOOT_ADDRESS = (() => {
  try {
    return persistedAddressAtBoot();
  } catch {
    return undefined;
  }
})();

// 0.3.1 — page-lifetime fact: has wagmi's status left 'disconnected' at least
// once this page-load? MODULE-scope on purpose (NOT per-hook-instance) —
// KeyedBoundary remounts every route gate on each soft nav with a fresh
// false, so a per-instance ref let a remounted gate RESURRECT the boot bridge
// after wagmi had already settled, fabricating a permanent false 'reconnecting'.
let RECONNECT_CYCLE_STARTED = false;

export type WalletKind = "self-custody" | "managed";

export interface WalletGate {
  /** Tri-state. Gates branch on this. */
  readonly status: "connected" | "reconnecting" | "disconnected";
  /** Connected wallet address (self-custody OR managed). Undefined while
   *  not connected. Gates that need the address should still null-check. */
  readonly address: `0x${string}` | undefined;
  /** Which path the connection went through. Null while not connected.
   *  For telemetry / copy variation only — do NOT use as a control-flow
   *  branch in gate logic. */
  readonly kind: WalletKind | null;
}

/**
 * Read the unified wallet gate state. Single source per render. Use this
 * in any component that needs to gate its render on wallet connection.
 *
 * Status semantics (0.3.0 — connected = trusted, Daniel 2026-06-11):
 *   - 'connected':     wagmi holds an address (regardless of its status
 *                      string — persisted accounts are live accounts) OR
 *                      the managed wallet (Privy) is active with an address.
 *   - 'reconnecting':  NO address yet AND wagmi is mid connect/reconnect,
 *                      OR no address + wagmi reports 'disconnected' but its
 *                      reconnect-on-mount cycle has not run yet and storage
 *                      says a wallet was here last time (BOOT_HAD_WALLET).
 *   - 'disconnected':  genuinely no address — first visit, explicit
 *                      disconnect, or wagmi's reconnect cycle settled
 *                      without finding a connection.
 */
export function useWalletGate(): WalletGate {
  const wagmi = useAccount();
  const heir = useHeirClaim();

  // 0.3.2 — is the WalletSessionDriver currently in its BOUNDED post-settle
  // reconnect window? Subscribed via useSyncExternalStore so a gate re-renders
  // when the driver opens/closes the window. This widens ONLY the final boot-
  // bridge branch (see below); it self-clears, so it cannot strand a user.
  const recoveryActive = useSyncExternalStore(
    subscribeRecovery,
    isRecoveryActive,
    isRecoveryActive,
  );

  // Has wagmi's reconnect cycle started this page-lifetime? reconnect()
  // always moves status off 'disconnected' the moment it starts
  // (@wagmi/core reconnect.js:8-11), so observing ANY non-'disconnected'
  // status means the cycle ran; a LATER 'disconnected' is wagmi's settled
  // verdict, not a hydration gap. Monotonic false→true ref write during
  // render is deterministic and StrictMode-safe.
  // 0.3.1: write the MODULE flag (page-lifetime), not a per-instance ref — a
  // remounted gate must not re-arm the boot bridge after wagmi has settled.
  if (wagmi.status !== "disconnected") RECONNECT_CYCLE_STARTED = true;

  // Managed-wallet path takes priority when active (NL-2 heir flow). In
  // NL-1 flag-off, heir.authenticated is always false so this branch is
  // dead and the self-custody path runs.
  const managedAddress = heir.embedded.address;
  const managedReady =
    heir.authenticated && heir.embedded.ready && managedAddress !== null;

  if (managedReady && managedAddress) {
    return {
      status: "connected",
      address: managedAddress,
      kind: "managed",
    };
  }

  // ── THE RULE (Daniel 2026-06-11): connected = trusted, never re-verify. ──
  // If wagmi has an address, the wallet IS connected — immediately and
  // unconditionally. This branch precedes and subsumes every status-string
  // check: during reconnect-on-mount (status 'reconnecting') wagmi has
  // already rehydrated the persisted account and getAccount() exposes it
  // with isConnected: !!address, so we surface it instead of discarding it.
  // No bootstrap wait, no reconnect poke, no timer. (wagmi returns
  // address: undefined for status 'disconnected' — getAccount.js:49-51 —
  // so a settled disconnect can never smuggle a stale address through.)
  if (wagmi.address) {
    return {
      status: "connected",
      address: wagmi.address,
      kind: "self-custody",
    };
  }

  // ── Below this line there is genuinely NO LIVE address yet. ──

  // 0.4.0 — OPTIMISTIC PERSISTED-ADDRESS RENDER (Daniel 2026-06-14): a returning
  // user who hard-refreshes a gated page has a wallet persisted in localStorage,
  // but wagmi has not rehydrated a LIVE address yet (a cold/idle Trust MV3 service
  // worker takes seconds to wake + re-announce). Instead of showing a
  // 'Reconnecting…' spinner that entire time, surface the PERSISTED address so
  // every gate renders the page IMMEDIATELY; wagmi rebinds the SAME address in the
  // background (the live branch above then wins on the next tick — invisible).
  // Bounded by the SAME self-clearing window the BOOT_HAD_WALLET bridge uses:
  // only while the reconnect cycle hasn't settled OR the driver is actively
  // recovering. So a genuinely-gone wallet (cycle ran, recovery window closed
  // without reconnecting) falls past this to 'disconnected' below — it cannot
  // strand a user on a false 'connected'. Grants no privilege: nothing signs or
  // writes off gate.address (all signing uses wagmi's own hooks), and every
  // server/chain action is independently signature-gated server-side.
  if (BOOT_ADDRESS && (!RECONNECT_CYCLE_STARTED || recoveryActive)) {
    return { status: "connected", address: BOOT_ADDRESS, kind: "self-custody" };
  }

  // wagmi is mid connect/reconnect and has not surfaced an account yet:
  // a user-initiated connect whose QR/wallet-app handshake is in flight, or
  // a reconnect-on-mount that has not rehydrated/rebound anything. This is
  // the ONLY state that may render a busy card — and it is unbounded by
  // design: no deadline may ever flip a pending connect into a Connect
  // prompt (the 0.2.0 10s deadline did exactly that and is deleted).
  if (wagmi.status === "connecting" || wagmi.status === "reconnecting") {
    return { status: "reconnecting", address: undefined, kind: null };
  }

  // wagmi says 'disconnected' with no address. Two very different cases:
  //   (a) The reconnect-on-mount cycle has NOT started yet (first paint
  //       before WagmiProvider's effect fires) and storage says a wallet
  //       was here last time → hold 'reconnecting' so a returning user
  //       never sees a Connect flash. wagmi will flip to 'reconnecting'/
  //       'connecting' within the same tick-or-two and resolve from there.
  //   (b) The cycle ran and settled back to 'disconnected' (reconnect found
  //       no authorized connector, or the user explicitly disconnected) →
  //       genuine disconnection. Show Connect.
  //   (c) 0.3.2 — OR the WalletSessionDriver is mid its BOUNDED retry window
  //       (recoveryActive): wagmi settled 'disconnected' before a cold/locked
  //       extension woke, but the driver is actively poking reconnect at
  //       1s/3s/8s. Hold 'reconnecting' so the gate shows a calm hint, not bare
  //       Connect buttons, in the gaps. recoveryActive self-clears on connect /
  //       after the final poke / on unmount, so this is bounded and a genuinely
  //       disconnected user still falls through to 'disconnected' below.
  if (BOOT_HAD_WALLET && (!RECONNECT_CYCLE_STARTED || recoveryActive)) {
    return { status: "reconnecting", address: undefined, kind: null };
  }

  return { status: "disconnected", address: undefined, kind: null };
}
