// @version 0.2.0 @date 2026-06-13
// 0.2.0 — NL-2 Phase 3 (managed-wallet chunk A): declare the env vars the
//         managed-wallet / Privy / runtime-config surface reads so the new
//         modules type-check without per-file `as unknown as Record<…>` casts.
//         VITE_MANAGED_WALLET_ENABLED is the LOCKED DCE flag literal (the
//         inline `=== "true"` compare at every Privy import boundary); the
//         rest are the build-time Privy/Pimlico config + the API base the
//         runtime-config + payment-config clients target.
// @version 0.1.0 @date 2026-05-13

/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __BUILD_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // Host root WITHOUT /v1 (used by useOpsLive + quorum-client + the managed /
  // runtime-config family). runtime-config.ts targets `${VITE_API_URL}/v1/...`.
  readonly VITE_API_URL?: string;
  readonly VITE_POLYGON_RPC_URL?: string;
  readonly VITE_LICENSE_CONTRACT_ADDR?: `0x${string}`;
  readonly VITE_SBT_CONTRACT_ADDR?: `0x${string}`;
  readonly VITE_ORACLE_CONTRACT_ADDR?: `0x${string}`;
  readonly VITE_PAYMENT_TOKEN_ADDR?: `0x${string}`;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_APP_DOMAIN?: string;
  // Gates every Google Play download surface (footer / settings / /download).
  // Set to the literal string "true" only when the Play listing is live.
  readonly VITE_PLAY_STORE_AVAILABLE?: string;
  // --- Managed-wallet (NL-2 Phase 3) ---
  // LOCKED DCE flag — compared inline as `=== "true"` at every Privy import
  // boundary so Vite static-replace proves the flag-off branch unreachable.
  readonly VITE_MANAGED_WALLET_ENABLED?: string;
  // Build-time-authoritative Privy app id (the module-load guard in
  // managed-wallet.ts throws if the flag is on without it).
  readonly VITE_PRIVY_APP_ID?: string;
  // Pimlico API key — read ONLY by the server-side relayer path; the PWA's
  // pimlico-paymaster.ts reads it for mock-vs-real mode but never logs it.
  readonly VITE_PIMLICO_API_KEY?: string;
  // Off-chain admin allow-list (comma-separated 0x addresses). Parsed once in
  // offchainAdmins.ts; payment-config writes accept these signers server-side.
  readonly VITE_OFFCHAIN_ADMIN_ADDRESSES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
