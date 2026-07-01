// @version 0.1.0 @date 2026-06-13
// NL-2 Phase 3 (managed-wallet chunk A) — PWA client for the PUBLIC bootstrap
// read GET /v1/config/runtime.
//
// ───────────────────────── DCE / SECRET DISCIPLINE ─────────────────────────
// This module imports NOTHING from @privy-io/react-auth or permissionless —
// it is a plain fetch() client and SHIPS IN ALL BUILDS (flag-off included). It
// is the public bootstrap read: no signature, no wallet. The server
// (payment-config.ts buildRuntimeConfig) returns ONLY is_secret=0 rows, NEVER
// 404s, and NEVER includes paddle_webhook_secret / paddle_api_key /
// privy_app_secret / pimlico_api_key / smtp_password. The pimlico_* fields it
// CAN return are plain non-secret strings (policy id, monthly cap) for display
// — NOT SDK code.
//
// API BASE (open-question resolved): the server route is /v1/config/runtime.
// We use VITE_API_URL (host root, no /v1) + the literal "/v1/config/runtime"
// to match the managed / quorum / ops family this read bootstraps (useOpsLive +
// quorum-client both read VITE_API_URL host root). track/cancelWindow/Admin use
// VITE_API_BASE_URL (incl /v1); runtime-config deliberately tracks the former.
//
// CACHE DISCIPLINE: mirrors useOpsLive's single-flight + module-level cache so
// concurrent callers share one fetch. Config is operator-changed rarely, so the
// cache is hold-until-reload (no TTL) with an explicit forced-refetch escape.

const API_URL = (import.meta.env.VITE_API_URL ?? "https://api.noklock.app").replace(/\/+$/, "");
const RUNTIME_CONFIG_PATH = "/v1/config/runtime";

/**
 * Flat public bootstrap config. `managed` is the SERVER's truth for the managed
 * flag (distinct from the PWA's build-time VITE_MANAGED_WALLET_ENABLED, which is
 * the DCE truth — see managedFlagDiverges()). Every other field is an optional
 * non-secret string; NEVER assume a key is present. Secret keys are NEVER in
 * this payload (the server strips them).
 */
export interface RuntimeConfig {
  readonly managed: boolean;
  readonly privy_app_id?: string;
  readonly privy_jwks_url?: string;
  readonly paddle_vendor_id?: string;
  readonly paddle_client_token?: string;
  readonly paddle_product_standard?: string;
  readonly paddle_product_premium?: string;
  readonly paddle_product_standard_lifetime?: string;
  readonly paddle_product_premium_lifetime?: string;
  readonly pimlico_policy_id?: string;
  readonly pimlico_monthly_cap_usd?: string;
  readonly smtp_host?: string;
  readonly smtp_port?: string;
  readonly smtp_username?: string;
  readonly smtp_from?: string;
  readonly play_store_url?: string;
  // The server may add further non-secret keys; tolerate unknown string fields
  // without forcing a type change at every read site.
  readonly [key: string]: string | boolean | undefined;
}

// Module-level cache + single-flight promise (mirror useOpsLive). The parsed
// object is shared by every caller; concurrent first-callers await one fetch.
let cached: RuntimeConfig | null = null;
let inFlight: Promise<RuntimeConfig> | null = null;

/** Coerce an unknown JSON body into a RuntimeConfig. `managed` is the only
 *  required field; it defaults to false if the server omits/garbles it (the
 *  server contract guarantees it, but we fail safe to "not managed"). Every
 *  other field is copied through only if it is a string. */
function coerce(body: unknown): RuntimeConfig {
  const obj = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const out: Record<string, string | boolean> = {
    managed: obj.managed === true,
  };
  for (const [k, v] of Object.entries(obj)) {
    if (k === "managed") continue;
    if (typeof v === "string") out[k] = v;
  }
  return out as RuntimeConfig;
}

/**
 * Fetch (or return the cached) runtime config. Single-flight: concurrent
 * callers share one in-flight request. The result is cached hold-until-reload;
 * pass `{ force: true }` to bypass the cache and refetch (e.g. after the
 * operator changes config via AdminPaymentConfig and you want the PWA to pick
 * it up without a reload).
 *
 * NEVER throws for the happy path: the server never 404s. A network error
 * rejects the promise (callers should catch and fall back to build-time env).
 */
export async function getRuntimeConfig(opts?: { force?: boolean }): Promise<RuntimeConfig> {
  if (!opts?.force && cached) return cached;
  if (!opts?.force && inFlight) return inFlight;

  inFlight = (async () => {
    const r = await fetch(`${API_URL}${RUNTIME_CONFIG_PATH}`, {
      method: "GET",
      credentials: "omit",
    });
    if (!r.ok) {
      throw new Error(`runtime-config fetch failed (HTTP ${r.status})`);
    }
    const body = (await r.json()) as unknown;
    const parsed = coerce(body);
    cached = parsed;
    return parsed;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

/** Synchronous cached accessor for second-paint reads — null until the first
 *  getRuntimeConfig() resolves. Never triggers a fetch. */
export function getCachedRuntimeConfig(): RuntimeConfig | null {
  return cached;
}

/** Test/admin seam: drop the cache so the next getRuntimeConfig() refetches. */
export function _resetRuntimeConfigCache(): void {
  cached = null;
  inFlight = null;
}

/**
 * True iff the SERVER's managed flag (runtime-config.managed) disagrees with
 * the PWA's BUILD-time flag (VITE_MANAGED_WALLET_ENABLED). At the flip BOTH must
 * be set — the rebuilt flag-on PWA AND MANAGED_MODE_ENABLED=true on Form B.
 * This is a runtime WARNING signal only; it MUST NOT gate the Privy import
 * (that stays the build-time literal for DCE). Returns false until the config
 * has been fetched (no false alarms before bootstrap).
 */
export function managedFlagDiverges(cfg: RuntimeConfig | null): boolean {
  if (!cfg) return false;
  const buildFlag = import.meta.env.VITE_MANAGED_WALLET_ENABLED === "true";
  return cfg.managed !== buildFlag;
}
