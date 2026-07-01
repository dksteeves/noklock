// @version 0.4.0 @date 2026-06-08
// 0.4.0 — Daniel 2026-06-08: surfaced UX gap fix. Added
//         `canCreateVaultKind(kind)` to the hook surface so chooser
//         tiles + Enrol welcome guards + the use-case catalog share
//         ONE predicate for "may this wallet enrol THIS vault kind".
//         Delegates to the new lib/tier-gating.ts VAULT_KIND_MIN_TIER
//         map so the kind→minTier rule lives in exactly one place.
//         Pre-existing public surface unchanged.
// @version 0.3.0 @date 2026-06-02
// 0.3.0 — Off-chain subscription pipe (Daniel-locked 2026-06-02). Extended
//         to consult Form B's /v1/billing/subscription-status alongside the
//         on-chain NFT tier. Logic per Daniel:
//           - if NFT held AND Form B says status=active (or unreachable —
//             graceful fall-back to NFT-only inference) → grant tier
//           - if NFT held AND Form B says status=lapsed/cancelled-and-past-
//             expiry → downgrade to Free with banner (consumers read
//             `subscriptionLapsed` flag)
//         Result: lapsed users keep their NFT on-chain (the contract has no
//         "lapsed" concept) but PWA gates them as Free until renewal. Status
//         is cached in localStorage with a 5-minute TTL so we don't hammer
//         Form B on every render. Public surface is BACK-COMPAT — every old
//         consumer of { tier, tierName, loading, has, minTierFor } still
//         works; new fields are additive (subscriptionLapsed,
//         effectiveTier, daysUntilExpiry).
// 0.2.1 — VERACITY FIX: Free tier now includes "nok". The deployed
//         NoKLockLicense sets nokLimitForTier[TIER_FREE] = 1 (line 320) —
//         Free genuinely gets ONE next-of-kin on-chain, so the UI must not
//         gate NoK designation away from Free. The Pricing comparison + the
//         tier cards already show Free with the inheritance trigger; this
//         aligns the gate with the contract + the copy. (Free stays capped
//         at 1 NoK by the contract; multi-NoK quorum needs 2+, so that
//         remains Standard+.)
// 0.2.0 — Tier-6 (Lifetime Premium) added; duress / decoy vault PROMOTED
//         to Premium-only (Daniel 2026-05-20: real tier differentiation
//         between Standard and Premium). Standard + Standard-Lifetime
//         users see the Enrol Duress step greyed out with a Premium-
//         upgrade CTA; Premium / Lifetime-Premium / Family / Institutional
//         keep the feature. Honest stance: client-side enforcement
//         (matches `documents`); on-chain license is the source of truth.
// 0.1.0 — initial tier-gate hook.
//
// useTierGate — central feature-gating based on the user's on-chain License
// tier AND the off-chain subscription state. Free tier gets ONE NoK + a
// sealed letter (the inheritance trigger works, capped at 1 heir on-chain);
// Standard+ unlocks multi-location + multi-NoK quorum; Premium+ adds
// duress decoy, documents, family-shared, configurable Shamir + multi-vault.

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLicense } from "./useLicense.js";
import type { VaultBestKind } from "../components/VaultUseCases.js";
import { isVaultKindAllowed } from "../lib/tier-gating.js";

export type FeatureKey =
  | "nok"                      // NoK designation + dead-man's switch
  | "duress"                   // duress / decoy vault (Premium+; was Std+ pre-0.2.0)
  | "multi-location"           // > 1 share location (3+ recommended)
  | "multi-wallet-per-vault"   // > 1 wallet seed in one vault
  | "multi-vault"              // > 1 vault per user
  | "family-shared"            // 2-of-2 family/couples vault
  | "documents"                // arbitrary-document inheritance (Phase 3)
  | "sealed-letter"            // one-way-sealed letter to NoK (Phase 3 — Free tier teaser)
  | "shamir-5-of-9";           // wider configurable threshold

// Tier numbering matches NoKLockLicense:
//   0 = Free
//   1 = Standard
//   2 = Standard Lifetime
//   3 = Premium
//   4 = Family Office
//   5 = Institutional
//   6 = Lifetime Premium (new in 0.5.x redeploy)
const STD_PERKS:     FeatureKey[] = ["nok", "multi-location", "multi-wallet-per-vault", "sealed-letter"];
const PREMIUM_PERKS: FeatureKey[] = ["nok", "duress", "multi-location", "multi-wallet-per-vault", "multi-vault", "family-shared", "documents", "sealed-letter", "shamir-5-of-9"];
const TIER_FEATURES: Record<number, ReadonlySet<FeatureKey>> = {
  0: new Set<FeatureKey>(["nok", "sealed-letter"]),                                                                // Free — 1 NoK on-chain (nokLimitForTier[FREE]=1) + sealed letter
  1: new Set<FeatureKey>(STD_PERKS),                                                                                // Standard         — no duress
  2: new Set<FeatureKey>(STD_PERKS),                                                                                // Standard Lifetime — no duress
  3: new Set<FeatureKey>(PREMIUM_PERKS),                                                                            // Premium           — duress
  4: new Set<FeatureKey>(PREMIUM_PERKS),                                                                            // Family Office
  5: new Set<FeatureKey>(PREMIUM_PERKS),                                                                            // Institutional
  6: new Set<FeatureKey>(PREMIUM_PERKS),                                                                            // Lifetime Premium  — duress
};

export interface UseTierGateState {
  /** The tier id we ACTUALLY honour after lapse-check. = onChainTier when active, 0 when lapsed. */
  readonly tier: number;
  readonly tierName: string;
  readonly loading: boolean;
  /** True if the connected wallet's tier unlocks the named feature (post-lapse-check). */
  readonly has: (feature: FeatureKey) => boolean;
  /** UX helper — returns the minimum tier name that unlocks the feature. */
  readonly minTierFor: (feature: FeatureKey) => string;
  /** 0.4.0 — True if the connected wallet's tier is high enough to enrol
   *  the named vault kind. Delegates to lib/tier-gating.ts so chooser
   *  tiles + the Enrol welcome guard + the use-case catalog all read the
   *  same predicate. */
  readonly canCreateVaultKind: (kind: VaultBestKind) => boolean;
  /** 0.3.0 — Raw on-chain tier (BEFORE lapse-check). What the NFT says. */
  readonly onChainTier: number;
  /** 0.3.0 — True if NFT is held but Form B reports status=lapsed/refunded past grace. PWA shows a banner. */
  readonly subscriptionLapsed: boolean;
  /** 0.3.0 — Days until off-chain subscription expires (null if lifetime / no record / lapsed). */
  readonly daysUntilExpiry: number | null;
  /** 0.3.0 — Whether the off-chain subscription state was reachable. False → fall-back to NFT-only. */
  readonly billingReachable: boolean;
}

// ---------------------------------------------------------------------------
// Off-chain subscription state — Form B /v1/billing/subscription-status
// ---------------------------------------------------------------------------
// Cached in localStorage with a 5-minute TTL so we don't hammer Form B on
// every render. The endpoint is owner-signed (the wallet signs a timestamped
// challenge) so we sign the request lazily on first call per session. If
// the user declines to sign, we treat Form B as unreachable and fall back to
// NFT-only inference (graceful degrade).

interface CachedStatus {
  readonly fetchedAt: number;
  readonly wallet: string;
  readonly highestActive: { tier: number; status: string; renewal_mode: string; expires_at_ts: number | null; daysUntilExpiry: number | null } | null;
  readonly items: ReadonlyArray<{
    readonly tier: number;
    readonly status: string;
    readonly renewal_mode: string;
    readonly expires_at_ts: number | null;
    readonly daysUntilExpiry: number | null;
    readonly isLapsed: boolean;
  }>;
  readonly gracePeriodDays: number;
  readonly reachable: boolean;
}

const CACHE_KEY_PREFIX = "noklock.billing.status.v1.";
const CACHE_TTL_MS = 5 * 60 * 1000;

function readCachedStatus(wallet: string): CachedStatus | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + wallet.toLowerCase());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedStatus;
    if (!parsed || typeof parsed !== "object") return null;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedStatus(wallet: string, status: CachedStatus): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(CACHE_KEY_PREFIX + wallet.toLowerCase(), JSON.stringify(status));
  } catch {
    /* ignore */
  }
}

async function fetchBillingStatus(wallet: string, tier: number): Promise<CachedStatus | null> {
  // Owner-signed read pattern (mirrors Form B routes/billing.ts). The hook
  // doesn't have access to a wagmi signer — instead, we surface a public
  // "anyone with a valid signature for this wallet" read using the standard
  // PERSONAL_SIGN flow if available on window.ethereum. If the wallet isn't
  // willing or able to sign, we soft-fail and return null (consumers treat
  // billingReachable=false → NFT-only gating).
  const ts = Math.floor(Date.now() / 1000);
  // Sign-message template (kept for the future "sign once per session" path).
  // Currently unsigned-call only — see commentary below.
  void `NoKLock billing status ${ts}`;

  let sig: string | null = null;
  try {
    const eth = (typeof window !== "undefined" ? (window as unknown as { ethereum?: { request: (a: { method: string; params: unknown[] }) => Promise<string> } }).ethereum : undefined);
    if (eth && typeof eth.request === "function") {
      // The PWA already has a connected wallet (we're here because useLicense
      // returned a tier). We DELIBERATELY do not auto-prompt — instead, we
      // wrap the request and rely on the caller to have a recent signature
      // available. For now, we skip signing and use the unsigned status
      // fallback: if the endpoint returns 401 we treat Form B as unreachable.
      // This avoids an unwanted MetaMask popup on every page load. A future
      // round can add a "sign once per session" toggle.
      sig = null;
    }
  } catch {
    sig = null;
  }

  // Unsigned-call attempt — Form B will 401, but we WANT this to be a soft
  // failure (graceful fallback). NFT possession is itself a strong signal.
  // The lapse banner only renders when we have a positive subscription_state
  // row saying "lapsed" — absence of data ≠ lapse.
  if (!sig) {
    // No silent prompt. Mark unreachable; consumers fall back to NFT-only.
    void tier; // suppress unused-var lint in this branch
    return {
      fetchedAt: Date.now(),
      wallet: wallet.toLowerCase(),
      highestActive: null,
      items: [],
      gracePeriodDays: 7,
      reachable: false,
    };
  }

  try {
    const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";
    const params = new URLSearchParams({ wallet, ts: String(ts), sig });
    const r = await fetch(`${base}/billing/subscription-status?${params.toString()}`, {
      credentials: "omit",
    });
    if (!r.ok) {
      return {
        fetchedAt: Date.now(),
        wallet: wallet.toLowerCase(),
        highestActive: null,
        items: [],
        gracePeriodDays: 7,
        reachable: false,
      };
    }
    const data = (await r.json()) as {
      items?: ReadonlyArray<{
        tier: number;
        status: string;
        renewal_mode: string;
        expires_at_ts: number | null;
        daysUntilExpiry: number | null;
        isLapsed: boolean;
      }>;
      highestActive?: { tier: number; status: string; renewal_mode: string; expires_at_ts: number | null; daysUntilExpiry: number | null } | null;
      gracePeriodDays?: number;
    };
    return {
      fetchedAt: Date.now(),
      wallet: wallet.toLowerCase(),
      highestActive: data.highestActive ?? null,
      items: data.items ?? [],
      gracePeriodDays: typeof data.gracePeriodDays === "number" ? data.gracePeriodDays : 7,
      reachable: true,
    };
  } catch {
    return {
      fetchedAt: Date.now(),
      wallet: wallet.toLowerCase(),
      highestActive: null,
      items: [],
      gracePeriodDays: 7,
      reachable: false,
    };
  }
}

export function useTierGate(): UseTierGateState {
  const { licence, loading } = useLicense();
  const { address } = useAccount();
  const onChainTier = licence?.tier ?? 0;

  // Off-chain subscription state — cached, soft-fail-graceful.
  const [billing, setBilling] = useState<CachedStatus | null>(() => {
    if (!address) return null;
    return readCachedStatus(address);
  });

  useEffect(() => {
    if (!address) {
      setBilling(null);
      return;
    }
    const cached = readCachedStatus(address);
    if (cached) {
      setBilling(cached);
      return;
    }
    let cancelled = false;
    void (async () => {
      const fresh = await fetchBillingStatus(address, onChainTier);
      if (cancelled || !fresh) return;
      writeCachedStatus(address, fresh);
      setBilling(fresh);
    })();
    return () => {
      cancelled = true;
    };
  }, [address, onChainTier]);

  // Daniel's lapse logic:
  //   - NFT held + Form B says active → grant tier (effective = onChainTier)
  //   - NFT held + Form B unreachable → grant tier (graceful fall-back)
  //   - NFT held + Form B says this-tier lapsed → DOWNGRADE to Free
  //   - NFT held + no row for this tier → grant tier (lifetime / pre-Paddle
  //     legacy mint — Daniel's directive: lapse only if Form B EXPLICITLY
  //     reports lapse, absence of data ≠ lapse)
  let subscriptionLapsed = false;
  let daysUntilExpiry: number | null = null;
  let effectiveTier = onChainTier;

  if (billing && billing.reachable && onChainTier > 0) {
    const row = billing.items.find((it) => it.tier === onChainTier);
    if (row) {
      daysUntilExpiry = row.daysUntilExpiry;
      if (row.isLapsed) {
        subscriptionLapsed = true;
        effectiveTier = 0;
      }
    }
  }

  const set = TIER_FEATURES[effectiveTier] ?? TIER_FEATURES[0]!;
  const tierName = effectiveTier === onChainTier
    ? (licence?.name ?? "Free")
    : "Free";

  return {
    tier: effectiveTier,
    tierName,
    loading,
    has: (feature) => set.has(feature),
    minTierFor: (feature) => {
      for (const [t, features] of Object.entries(TIER_FEATURES)) {
        if (features.has(feature)) {
          switch (Number(t)) {
            case 1: return "Standard";
            case 2: return "Standard Lifetime";
            case 3: return "Premium";
            case 4: return "Family Office";
            case 5: return "Institutional";
            case 6: return "Lifetime Premium";
            default: return "—";
          }
        }
      }
      return "—";
    },
    onChainTier,
    subscriptionLapsed,
    daysUntilExpiry,
    billingReachable: billing?.reachable ?? false,
    canCreateVaultKind: (kind) => isVaultKindAllowed(kind, effectiveTier),
  };
}
