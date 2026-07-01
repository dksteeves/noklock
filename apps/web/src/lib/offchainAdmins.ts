// @version 0.2.0 @date 2026-06-11
// 0.2.0 — Daniel 2026-06-11 (connected = trusted, never re-verify — companion
//         to useWalletGate 0.3.0): FIX the wagmi storage-key mismatch in
//         isOffchainAdminAtBoot(). wagmi v2's createStorage appends `.${key}`
//         to the configured prefix, so the connection state persists under
//         "noklock-wagmi.store" — NOT the bare "noklock-wagmi" this module
//         read since 0.1.0 (track.ts 0.4.0 documented the same bug class).
//         In production the bare read returned null, so the OwnerOnly
//         cold-boot admin fast-path only ever fired via the legacy
//         "noklock.addr" side-channel. Now reads "noklock-wagmi.store"
//         FIRST; bare key kept as a defensive fallback.
// @version 0.1.0 @date 2026-06-07
// Single source of truth for the offchain-admin allow-list.
//
// Per Daniel-handoff §2.3 (docs/DANIEL-HANDOFF-2026-06-07-audit-findings.md):
// before this module existed, the OFFCHAIN_ADMINS Set was rebuilt INSIDE
// each render in OwnerOnly.tsx (lines 116-119) and Admin.tsx (lines 253-258)
// — same anti-pattern in two places (three once PartnerAccessGate gets its
// matching fast-path fix). Centralising here:
//
//   1. Parses the env var ONCE at module load (not per render).
//   2. Guarantees the same parse order across every caller so a checksum-
//      mixed-case address Daniel pastes from Trust Wallet survives.
//   3. Provides a synchronous boot-time membership check that mirrors
//      `hadWalletAtBoot()` in wallet-bootstrap.ts — eliminates the cold-load
//      "Verifying access…" flash documented in handoff §2.2 for admins.
//
// Parse order (DO NOT REORDER — must match the runtime in OwnerOnly 0.9.0
// and Admin.tsx so behaviour is identical):
//   split(',') -> map(trim + toLowerCase) -> filter(/^0x[a-f0-9]{40}$/)
// The lowercase step runs BEFORE the regex; the regex itself only matches
// lowercase hex. If the order were swapped, any checksum-mixed-case entry
// (the default copy-paste format from Trust Wallet, Etherscan, MetaMask)
// would be silently dropped from the allow-list and Daniel's Treasury
// wallet would see "Verifying access…" forever.

// Where wagmi v2 ACTUALLY persists the connection state (mirrors
// wallet-bootstrap.ts 0.2.0): main.tsx's createStorage key "noklock-wagmi"
// + wagmi's `.${key}` suffix for the "store" object = "noklock-wagmi.store".
// Bare prefix kept as defensive fallback only.
const WAGMI_STORAGE_KEYS = ["noklock-wagmi.store", "noklock-wagmi"] as const;

// Legacy address key (kept for migration only — same rationale as in
// wallet-bootstrap.ts; remove in a future round once the new bootstrap has
// shipped for >=1 deploy cycle).
const LEGACY_ADDR_KEY = "noklock.addr";

/**
 * Parsed once at module load. Lowercase 40-char hex addresses only.
 * Exported as ReadonlySet so callers cannot mutate the allow-list.
 */
export const OFFCHAIN_ADMINS: ReadonlySet<string> = new Set(
  ((import.meta.env.VITE_OFFCHAIN_ADMIN_ADDRESSES ?? "") as string)
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter((a) => /^0x[a-f0-9]{40}$/.test(a)),
);

/**
 * True if `addr` is in the offchain-admin allow-list.
 *
 * Handles `undefined` (wagmi returns `address: undefined` while
 * disconnected or hydrating) by returning false. Lowercases the input
 * before comparison so the caller does not have to.
 */
export function isOffchainAdmin(addr: string | undefined): boolean {
  if (!addr) return false;
  return OFFCHAIN_ADMINS.has(addr.toLowerCase());
}

/**
 * Synchronously decide — at module init / first render, BEFORE wagmi has
 * finished its async hydration — whether the previously-connected address
 * is an offchain admin.
 *
 * Reads (in order, mirroring `hadWalletAtBoot()` in wallet-bootstrap.ts):
 *   1. wagmi v2's persisted storage (`noklock-wagmi.store`, bare prefix as
 *      fallback). `state.current` is the connector id, NOT the address, so
 *      we walk `state.connections` to find the persisted account.
 *   2. Legacy `noklock.addr` key as a migration fallback for users who
 *      connected before the new bootstrap shipped.
 *
 * Returns false on any storage read error (private browsing, blocked
 * storage, malformed JSON). False is the safe default — non-admin users
 * see the normal gate path, admins briefly see it for one tick until
 * wagmi confirms and the regular membership check kicks in.
 *
 * Stale cache only briefly renders the admin surface before useReadContract
 * (in OwnerOnly) re-confirms — symmetric to the existing 15s timeout
 * escape and acceptable per handoff §2.2.
 */
export function isOffchainAdminAtBoot(): boolean {
  // 1. wagmi's own persisted state.
  for (const key of WAGMI_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as {
        state?: {
          current?: unknown;
          connections?: { value?: Array<[unknown, { accounts?: readonly string[] }]> } | unknown;
        };
      } | null;

      // wagmi serialises a Map as { __type: "Map", value: [[k, v], ...] }
      // so `state.connections.value` is the array of [connectorId, data].
      const conns = parsed?.state?.connections as
        | { value?: Array<[unknown, { accounts?: readonly string[] }]> }
        | undefined;
      const entries = Array.isArray(conns?.value) ? conns!.value : [];
      for (const entry of entries) {
        const data = entry?.[1];
        const accounts = data?.accounts;
        if (Array.isArray(accounts)) {
          for (const acct of accounts) {
            if (typeof acct === "string" && isOffchainAdmin(acct)) return true;
          }
        }
      }
    } catch {
      /* malformed JSON or storage blocked — fall through to legacy key */
    }
  }

  // 2. Legacy address fallback.
  try {
    const addr = localStorage.getItem(LEGACY_ADDR_KEY);
    if (addr && isOffchainAdmin(addr)) return true;
  } catch {
    /* blocked storage — fall through to false */
  }

  return false;
}
