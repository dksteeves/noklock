// @version 0.3.0 @date 2026-06-14
// 0.3.0 — Daniel 2026-06-14 (GATE no-friction fix — render from the PERSISTED
//   address, kill the refresh spinner entirely): add persistedAddressAtBoot(),
//   a synchronous read of the wallet ADDRESS wagmi already persisted, so a
//   returning user is rendered 'connected' on the FIRST paint while wagmi
//   rebinds the live connection in the background (see useWalletGate 0.4.0).
//   hadWalletAtBoot()/forgetWalletAtBoot() unchanged.
// @version 0.2.0 @date 2026-06-11
// 0.2.0 — Daniel 2026-06-11 (connected = trusted, never re-verify — companion
//         to useWalletGate 0.3.0): FIX the wagmi storage-key mismatch. wagmi
//         v2's createStorage appends `.${key}` to the configured prefix
//         (createStorage.js:14/21), so with main.tsx's key "noklock-wagmi"
//         the connection state actually persists under "noklock-wagmi.store"
//         — NOT the bare "noklock-wagmi" this module read since 0.1.0 (the
//         same wrong-key bug track.ts 0.4.0 already documented and fixed for
//         analytics). The bare read returned null in production, so
//         hadWalletAtBoot() only ever worked via the legacy side-channel
//         keys. Now reads "noklock-wagmi.store" FIRST; the bare key is kept
//         as a defensive fallback (harmless — wagmi never writes it).
// @version 0.1.0 @date 2026-06-04
// Synchronous wallet-bootstrap helper. Reads wagmi v2's own persisted
// connector state from localStorage (the key set in main.tsx createStorage)
// + the legacy "noklock.had-wallet" / "noklock.addr" keys as migration
// fallbacks. Called at module init / first render to decide whether a
// previously-connected user should see a "Reconnecting…" UI or a
// ConnectWallet prompt while wagmi's async hydration runs.
//
// This is NOT a parallel state machine — there is no store, no driver, no
// debounce, no listeners. It's a one-shot sync read. The canonical wallet
// status during the rest of the app's lifetime comes from wagmi's own
// useAccount() / status field (read via the useWalletGate hook).
//
// Replaces the previous combination of walletSession.ts::hasHadWallet() +
// the cross-module ADDR_KEY dependency by reading wagmi's own storage
// first (single source of truth) and falling back to the legacy keys only
// for the migration window so currently-connected users don't see a Connect
// prompt flash on their next page load after the refactor ships.

// Where wagmi v2 ACTUALLY persists the connection state. main.tsx passes
// key "noklock-wagmi" to createStorage, and wagmi appends `.${key}` per
// stored object — the zustand-persist store name is "store", so the real
// localStorage key is "noklock-wagmi.store" (same finding as track.ts
// 0.4.0). The bare prefix is kept as a defensive fallback only; wagmi
// never writes it.
const WAGMI_STORAGE_KEYS = ["noklock-wagmi.store", "noklock-wagmi"] as const;

// Legacy keys (kept for migration only). Both will be removed in a future
// round once the new bootstrap has shipped for ≥1 deploy cycle and we are
// confident no user is stranded.
const LEGACY_HAD_WALLET_KEY = "noklock.had-wallet";
const LEGACY_ADDR_KEY = "noklock.addr";

/**
 * Did this browser previously hold a connected wallet?
 *
 * Reads (in order):
 *   1. wagmi v2's persisted storage (`noklock-wagmi.store`, bare prefix as
 *      fallback) — `state.current` is non-null when wagmi has a persisted
 *      connector binding. This is the single source of truth wagmi itself
 *      rehydrates from on reconnect.
 *   2. Legacy `noklock.had-wallet` flag — migration fallback for users who
 *      connected before the new bootstrap shipped.
 *   3. Legacy `noklock.addr` key (the ADDR written by track.ts) — second
 *      migration fallback.
 *
 * Returns false on any storage read error (private browsing mode, blocked
 * storage, malformed JSON). False is the safe default — first-visit users
 * see a ConnectWallet prompt, which is correct UX.
 */
export function hadWalletAtBoot(): boolean {
  // 1. wagmi's own persisted state.
  for (const key of WAGMI_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          state?: { current?: unknown };
        } | null;
        const current = parsed?.state?.current;
        if (typeof current === "string" && current.length > 0) return true;
      }
    } catch {
      /* malformed JSON or storage blocked — fall through to legacy keys */
    }
  }

  // 2. Legacy "had-wallet" flag.
  try {
    if (localStorage.getItem(LEGACY_HAD_WALLET_KEY) === "1") return true;
  } catch {
    /* blocked storage — fall through */
  }

  // 3. Legacy address fallback.
  try {
    const addr = localStorage.getItem(LEGACY_ADDR_KEY);
    if (addr && /^0x[a-f0-9]{40}$/i.test(addr)) return true;
  } catch {
    /* blocked storage — fall through to false */
  }

  return false;
}

/**
 * The persisted wallet ADDRESS from a prior session, read synchronously at
 * boot — so a returning user can be rendered 'connected' IMMEDIATELY while
 * wagmi rehydrates the live connection in the background (see useWalletGate
 * 0.4.0). Distinct from hadWalletAtBoot() (a boolean); this returns the 0x
 * address itself.
 *
 * Reads (in order):
 *   1. wagmi v2's persisted `state.connections` — wagmi serialises the Map as
 *      { __type:"Map", value:[[connectorId,{accounts:[...],chainId}],...] }, so
 *      the address is connections.value[i][1].accounts[0]. NOTE `state.current`
 *      is ONLY the connector uid, never an address, so we must walk connections
 *      (same walk as offchainAdmins.ts::isOffchainAdminAtBoot).
 *   2. Legacy `noklock.addr` — a lowercase 0x address written by track.ts
 *      rememberConnectedWallet on every account change, cleared only on an
 *      explicit Disconnect (forgetWalletAtBoot below).
 *
 * Returns undefined on any storage error or when nothing is persisted (first
 * visit / after explicit disconnect), making the optimistic gate branch a
 * no-op for those users.
 */
export function persistedAddressAtBoot(): `0x${string}` | undefined {
  const isAddr = (s: unknown): s is `0x${string}` =>
    typeof s === "string" && /^0x[a-f0-9]{40}$/i.test(s);
  try {
    if (typeof localStorage === "undefined") return undefined;
    // 1. wagmi's own persisted connections (the source of truth on rebind).
    for (const key of WAGMI_STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as {
          state?: {
            connections?: { value?: Array<[unknown, { accounts?: readonly unknown[] }]> };
          };
        } | null;
        const entries = parsed?.state?.connections?.value;
        if (Array.isArray(entries)) {
          for (const entry of entries) {
            const accounts = entry?.[1]?.accounts;
            if (Array.isArray(accounts)) {
              for (const a of accounts) if (isAddr(a)) return a;
            }
          }
        }
      } catch {
        /* malformed JSON or storage blocked — try the next key */
      }
    }
    // 2. Legacy address key (migration fallback).
    const legacy = localStorage.getItem(LEGACY_ADDR_KEY);
    if (isAddr(legacy)) return legacy.toLowerCase() as `0x${string}`;
  } catch {
    /* storage blocked — fall through to undefined */
  }
  return undefined;
}

/**
 * Forget the persisted wallet binding. Called from the Disconnect button so
 * the next page load does not show a "Reconnecting…" UI to a user who has
 * explicitly disconnected.
 *
 * Clears:
 *   * Legacy `noklock.had-wallet` flag
 *   * Legacy `noklock.addr` (the ADDR_KEY that track.ts writes)
 *
 * Does NOT touch the wagmi storage — wagmi's own `disconnect()` action
 * clears `state.current` in its persisted state, and we let wagmi own that
 * key exclusively to avoid format-drift bugs on future wagmi upgrades.
 */
export function forgetWalletAtBoot(): void {
  try {
    localStorage.removeItem(LEGACY_HAD_WALLET_KEY);
  } catch {
    /* blocked storage */
  }
  try {
    localStorage.removeItem(LEGACY_ADDR_KEY);
  } catch {
    /* blocked storage */
  }
}
