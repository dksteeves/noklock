// @version 0.1.0 — 2026-06-02 — NL-1 Pimlico paymaster. Mock-mode default. Polygon PoS chain 137.
//
// CANONICAL: docs/MANAGED-WALLET-PLAN-v1.md §2.4 (Pimlico paymaster +
// ERC-4337 bundler on Polygon PoS) + the round-2 research RTF section on
// Pimlico endpoints.
//
// WHY THIS FILE EXISTS
// --------------------
// Stage-1 managed-mode heirs sign in via Privy and receive a brand-new
// embedded EOA with ZERO MATIC balance. If we asked them to fund their
// own gas before claiming, the whole non-crypto-user pitch collapses.
// Pimlico's verifying paymaster sponsors the user-op on our dime so the
// heir never sees gas.
//
// NL-1 SCOPE NOTE — read before wiring this in anywhere
// ------------------------------------------------------
// For NL-1 the heir DOES NOT submit a direct on-chain tx during the
// claim flow:
//   - The quorum vote is an EIP-712 sig only (off-chain, free).
//   - The SBT mint is submitted by Form B's relayer using the operator's
//     wallet, not by the heir.
// Therefore Pimlico sponsorship is OPTIONAL for NL-1. This module exists
// so the surface is in place for NL-2 (when/if the heir submits any
// direct tx — key rotation, manual claim broadcast, etc.) without
// breaking the call-sites that already exist.
//
// MOCK MODE
// ---------
// `VITE_PIMLICO_API_KEY` absent → `PIMLICO_MOCK_MODE = true`. In mock
// mode `sponsorUserOp()` console.warns once per session and returns
// `{ sponsored: false, mockMode: true, fallback: "user-pays-gas" }` so
// the caller can branch cleanly. This lets the lib ship + compile + run
// in CI / local dev without a Pimlico account.
//
// REAL MODE
// ---------
// `VITE_PIMLICO_API_KEY` set → we dynamic-import `permissionless` and
// call its Pimlico bindings against the Polygon PoS endpoint:
//   https://api.pimlico.io/v2/137/rpc?apikey=${PIMLICO_API_KEY}
// (Polygon mainnet PoS chain id 137 — chain-choice locked in
// reference_chain_choice_pos_vs_zkevm.md.)
// The dynamic import is intentional: (a) lets us ship before
// `permissionless` is installed in the workspace (npm install is
// currently failing on the workspace root), (b) keeps the SDK chunk
// out of the dist when nobody flips the flag, (c) mirrors the same
// barrier we use for `@privy-io/react-auth` in ManagedWalletProvider.
//
// CAP
// ---
// `MAX_OPS_PER_HEIR = 5` per claim. Enforced via `sponsorUserOp()`'s
// `opts.claimId` + an in-memory counter. The counter is per-tab — this
// is a soft client-side guard, NOT a security boundary; the real
// rate-limit lives in the Pimlico policy + Form B's relayer.

// ---- Module-scope config ---------------------------------------------------

/**
 * Pimlico API key. Read from Vite env. When undefined, this module
 * operates in mock mode (see PIMLICO_MOCK_MODE).
 * Cast through `unknown` because `VITE_PIMLICO_API_KEY` is not in the
 * declared `ImportMetaEnv` shape (same pattern as managed-wallet.ts).
 */
export const PIMLICO_API_KEY: string | undefined =
  (import.meta.env as unknown as Record<string, string | undefined>)
    .VITE_PIMLICO_API_KEY;

/**
 * Mock-mode flag. True iff no Pimlico API key is configured.
 * Module-scope so it's evaluated once at load time — the value cannot
 * change at runtime, which keeps the "warn once" semantics simple.
 */
export const PIMLICO_MOCK_MODE: boolean =
  !PIMLICO_API_KEY || PIMLICO_API_KEY.length === 0;

/**
 * Polygon PoS chain id (mainnet). Hard-coded here rather than pulled
 * from chain.ts because the Pimlico endpoint URL is chain-scoped and
 * we want this lib self-contained for the mock-mode path.
 */
export const PIMLICO_CHAIN_ID = 137 as const;

/**
 * Cap on sponsored ops per heir per claim. Soft client-side guard.
 * Authoritative rate-limit lives in the Pimlico sponsorship policy
 * and Form B's relayer; this just keeps a runaway loop from burning
 * sponsorship credits in a single tab.
 */
export const MAX_OPS_PER_HEIR = 5 as const;

/**
 * Pimlico Polygon PoS RPC endpoint. Caller MUST NOT log this value
 * because it embeds the API key. Use `PIMLICO_MOCK_MODE` to guard
 * before any URL logging.
 */
export function pimlicoEndpoint(): string {
  if (!PIMLICO_API_KEY) return "";
  return `https://api.pimlico.io/v2/${PIMLICO_CHAIN_ID}/rpc?apikey=${PIMLICO_API_KEY}`;
}

// ---- Types -----------------------------------------------------------------

/**
 * Minimal ERC-4337 v0.7 UserOperation shape we accept from callers.
 * We DON'T re-export permissionless's type because permissionless may
 * not be installed yet (dynamic import); callers pass a plain object
 * and we forward it untouched in mock mode or hand it to the real
 * client in real mode.
 */
export interface UserOpLike {
  readonly sender: `0x${string}`;
  readonly nonce: bigint;
  readonly callData: `0x${string}`;
  readonly callGasLimit?: bigint;
  readonly verificationGasLimit?: bigint;
  readonly preVerificationGas?: bigint;
  readonly maxFeePerGas?: bigint;
  readonly maxPriorityFeePerGas?: bigint;
  readonly paymasterAndData?: `0x${string}`;
  readonly signature?: `0x${string}`;
  // Permissionless / EntryPoint 0.7 split fields — present on some shapes:
  readonly paymaster?: `0x${string}`;
  readonly paymasterData?: `0x${string}`;
  readonly paymasterVerificationGasLimit?: bigint;
  readonly paymasterPostOpGasLimit?: bigint;
  readonly factory?: `0x${string}`;
  readonly factoryData?: `0x${string}`;
}

/**
 * The minimal embedded-wallet handle this lib needs in order to sign
 * the sponsored user-op. Privy's `wallet` object exposes
 * `getEthereumProvider()` which gives us an EIP-1193 provider; that's
 * the universal handoff so we don't tie this lib to Privy directly.
 */
export interface EmbeddedWalletHandle {
  readonly address: `0x${string}`;
  readonly getEthereumProvider?: () => Promise<unknown>;
  // Fallback / future-proofing: callers can hand us a viem wallet
  // client directly if they already have one.
  readonly walletClient?: unknown;
}

/**
 * Options bag for `sponsorUserOp()`.
 *  - `claimId`        : namespaces the per-heir cap counter. REQUIRED
 *                       for the cap to work; if absent the call is
 *                       counted under a synthetic "anonymous" bucket.
 *  - `embeddedWallet` : reserved for NL-2 signing flows. Not used in
 *                       NL-1 because the heir doesn't sign on-chain.
 */
export interface SponsorOpts {
  readonly claimId?: string;
  readonly embeddedWallet?: EmbeddedWalletHandle;
}

/**
 * Result of `sponsorUserOp()`. Discriminated by `sponsored`.
 *  - Mock mode             → { sponsored: false, mockMode: true,  fallback: "user-pays-gas" }
 *  - Cap exceeded          → { sponsored: false, mockMode: false, fallback: "cap-exceeded" }
 *  - Real-mode degrade     → { sponsored: false, mockMode: false, fallback: "sdk-unavailable" }
 *  - Real-mode success     → { sponsored: true,  mockMode: false, userOp: <sponsored op> }
 */
export type SponsorResult =
  | {
      readonly sponsored: false;
      readonly mockMode: true;
      readonly fallback: "user-pays-gas";
    }
  | {
      readonly sponsored: false;
      readonly mockMode: false;
      readonly fallback: "cap-exceeded" | "sdk-unavailable";
    }
  | {
      readonly sponsored: true;
      readonly mockMode: false;
      readonly userOp: UserOpLike;
    };

/**
 * Shape of the client returned by `createPaymasterClient()`. Stable
 * across mock and real modes so call-sites don't branch on the flag.
 */
export interface PaymasterClient {
  /** True iff this is a real (Pimlico-backed) client. */
  readonly isReal: boolean;
  /** Endpoint URL, or empty string in mock mode. */
  readonly endpoint: string;
  /**
   * Sponsor a user-op. In real mode this calls Pimlico's
   * `pm_sponsorUserOperation` JSON-RPC method via permissionless. In
   * mock mode it returns the op unchanged and logs once.
   */
  readonly sponsorUserOperation: (userOp: UserOpLike) => Promise<UserOpLike>;
}

// ---- Mock-mode singletons --------------------------------------------------

let warnedMockOnce = false;
function warnMockOnce(): void {
  if (warnedMockOnce) return;
  warnedMockOnce = true;
  // eslint-disable-next-line no-console
  console.warn(
    "[NL-1] MOCK MODE — Pimlico not configured, falling back to " +
      "user-pays-gas. Set VITE_PIMLICO_API_KEY to enable real " +
      "sponsorship.",
  );
}

function mockPaymasterClient(): PaymasterClient {
  return {
    isReal: false,
    endpoint: "",
    sponsorUserOperation: async (userOp: UserOpLike): Promise<UserOpLike> => {
      warnMockOnce();
      return userOp;
    },
  };
}

// ---- Per-heir cap counter --------------------------------------------------

/**
 * In-memory per-claim counter. Per-tab only — a refresh resets it.
 * The real rate-limit lives in the Pimlico policy + Form B relayer;
 * this is just a soft loop-guard.
 */
const opsPerClaim = new Map<string, number>();

function bumpAndCheckCap(claimId: string | undefined): boolean {
  const key = claimId ?? "anonymous";
  const next = (opsPerClaim.get(key) ?? 0) + 1;
  opsPerClaim.set(key, next);
  return next <= MAX_OPS_PER_HEIR;
}

/**
 * Test/admin helper: clear the cap counter (e.g., when a claim
 * completes or a new claim starts in the same tab).
 */
export function resetOpsCounter(claimId?: string): void {
  if (claimId === undefined) {
    opsPerClaim.clear();
    return;
  }
  opsPerClaim.delete(claimId);
}

// ---- Real-mode lazy loader -------------------------------------------------

/**
 * Cached real client so we don't re-instantiate per call. Built on
 * first use, not at module load, because `permissionless` is a
 * dynamic-import boundary.
 */
let cachedRealClient: PaymasterClient | null = null;

interface PermissionlessModule {
  // We type only the bits we use. The real surface is much larger.
  readonly createPimlicoClient?: (args: {
    transport: unknown;
    chain: unknown;
    entryPoint: { address: `0x${string}`; version: "0.7" | "0.6" };
  }) => {
    sponsorUserOperation: (args: { userOperation: UserOpLike }) => Promise<UserOpLike>;
  };
}

interface ViemHttpModule {
  readonly http: (url: string) => unknown;
}

/**
 * Build the real Pimlico-backed client. Pulls `permissionless` + `viem`
 * via dynamic import. If either import fails (package not installed
 * yet), we fall back to mock mode and warn — same behavior as
 * "no API key", so callers always get a usable client.
 */
async function buildRealClient(): Promise<PaymasterClient> {
  if (cachedRealClient) return cachedRealClient;
  if (!PIMLICO_API_KEY) {
    // Defensive — shouldn't reach here because PIMLICO_MOCK_MODE check
    // gates the caller, but keep the invariant explicit.
    return mockPaymasterClient();
  }

  try {
    // Indirect dynamic-import via Function() so tsc does NOT try to
    // resolve the `permissionless` package at type-check time. The
    // package is an OPTIONAL runtime dep — workspace npm install is
    // currently failing on Daniel's box, so we ship without it and
    // load it dynamically iff a Pimlico API key is set. Same indirection
    // pattern we use for `viem` here purely for symmetry; in practice
    // viem is already a top-level dep so a direct import would also
    // work, but the indirection isolates this whole branch from tsc's
    // module resolution.
    const dynImport = new Function(
      "spec",
      "return import(/* @vite-ignore */ spec);",
    ) as (spec: string) => Promise<unknown>;
    const permissionless = (await dynImport(
      "permissionless",
    )) as PermissionlessModule;
    const viem = (await dynImport("viem")) as ViemHttpModule;

    if (!permissionless.createPimlicoClient || !viem.http) {
      // SDK shape changed or partial install — degrade.
      // eslint-disable-next-line no-console
      console.warn(
        "[NL-1] Pimlico SDK loaded but createPimlicoClient/http missing — " +
          "falling back to mock mode.",
      );
      return mockPaymasterClient();
    }

    const url = pimlicoEndpoint();
    // EntryPoint v0.7 canonical address (per permissionless docs /
    // ERC-4337 reference deployment).
    const entryPoint = {
      address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as `0x${string}`,
      version: "0.7" as const,
    };

    const inner = permissionless.createPimlicoClient({
      transport: viem.http(url),
      chain: { id: PIMLICO_CHAIN_ID },
      entryPoint,
    });

    const client: PaymasterClient = {
      isReal: true,
      endpoint: url,
      sponsorUserOperation: async (userOp: UserOpLike): Promise<UserOpLike> => {
        return inner.sponsorUserOperation({ userOperation: userOp });
      },
    };
    cachedRealClient = client;
    return client;
  } catch (e) {
    // permissionless not installed yet, or runtime mismatch. Mock-mode
    // is the right fallback — the lib still works, gas is just not
    // sponsored.
    // eslint-disable-next-line no-console
    console.warn(
      "[NL-1] Pimlico dynamic import failed (" +
        (e as Error).message +
        ") — falling back to mock mode.",
    );
    return mockPaymasterClient();
  }
}

// ---- Public API ------------------------------------------------------------

/**
 * Create (or fetch the cached) paymaster client. Always returns a usable
 * client — never throws. In mock mode the client is a no-op stub; in
 * real mode it's a permissionless-backed Pimlico client.
 *
 * Async because real-mode construction requires dynamic imports.
 */
export async function createPaymasterClient(): Promise<PaymasterClient> {
  if (PIMLICO_MOCK_MODE) {
    return mockPaymasterClient();
  }
  return buildRealClient();
}

/**
 * Sponsor a user-op. Discriminated-union return — see `SponsorResult`.
 *
 * In real mode: requests Pimlico sponsorship via permissionless and
 * returns `{ sponsored: true, mockMode: false, userOp }` ready for the
 * caller to submit to the bundler.
 *
 * In mock mode: console.warns (once per session) and returns
 * `{ sponsored: false, mockMode: true, fallback: "user-pays-gas" }`
 * so the caller can branch cleanly.
 *
 * Cap: per `opts.claimId` we sponsor at most `MAX_OPS_PER_HEIR = 5`
 * user-ops. Beyond that we return `{ fallback: "cap-exceeded" }`.
 *
 * @param userOp The unsponsored user operation.
 * @param opts   `claimId` (for the cap) and `embeddedWallet` (reserved
 *               for NL-2 signing flows).
 */
export async function sponsorUserOp(
  userOp: UserOpLike,
  opts: SponsorOpts = {},
): Promise<SponsorResult> {
  // Reserved for forward-compat (NL-2 may need an EIP-1193 provider to
  // sign the sponsored op). NL-1 doesn't use it yet — touch it to keep
  // noUnusedParameters happy without changing the public signature.
  void opts.embeddedWallet;

  if (PIMLICO_MOCK_MODE) {
    // eslint-disable-next-line no-console
    console.warn(
      "[NL-1] Pimlico MOCK MODE — sponsorUserOp returning user-pays-gas fallback.",
    );
    warnedMockOnce = true; // suppress the secondary client-level warn
    return { sponsored: false, mockMode: true, fallback: "user-pays-gas" };
  }

  // Cap is enforced in real mode only. Mock mode never spends credit.
  if (!bumpAndCheckCap(opts.claimId)) {
    return { sponsored: false, mockMode: false, fallback: "cap-exceeded" };
  }

  const client = await createPaymasterClient();
  if (!client.isReal) {
    // buildRealClient() degraded silently — already warned.
    return { sponsored: false, mockMode: false, fallback: "sdk-unavailable" };
  }
  const sponsored = await client.sponsorUserOperation(userOp);
  return { sponsored: true, mockMode: false, userOp: sponsored };
}

/**
 * Convenience predicate for call-sites that want to branch UI on the
 * sponsorship mode (e.g., show "gas sponsored" badge in real mode).
 */
export function isPimlicoLive(): boolean {
  return !PIMLICO_MOCK_MODE;
}
