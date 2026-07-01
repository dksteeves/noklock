// @version 0.5.2 @date 2026-06-02
// 0.5.2 — Daniel §12.7 brutal-but-honest caps surfaced in FREE self-custody
//         tier perks: vault size 5 MB max, heir cap 1, NO heartbeat automation
//         (manual re-attest only on Free; configurable heartbeat is a paid
//         tier capability per the Managed-tier matrix on Pricing 0.9.0). The
//         "Heartbeat / dead-man's switch" line on Free is reworded to "Manual
//         re-attest (heartbeat automation is paid-tier)" — the SBT trigger
//         itself still works, but the automated ping cadence is paid-tier
//         capability. Aligns the contract-claim with what the public pricing
//         page now publishes.
// @version 0.5.1 @date 2026-05-22
// 0.5.1 — Daniel pricing-card pass: dropped the redundant cross-tier
//         comparison parentheticals ("(Free is 1)", "(Free 1 · Standard 5
//         · Premium 10)", "(Standard is 2-of-3)") — the cards sit side by
//         side, the reader infers it. Standard's delta bullets given a
//         touch more honest descriptive detail so the three row-1 cards
//         (Free / Standard / Premium) balance to ~equal height (matching
//         row 2's content-weight balance) instead of Standard sitting
//         short. No claim changed — every line still maps to the contract.
// 0.5.0 — ACTIVE PLAN 7 final-deploy: contract ABIs + tier metadata rebuilt
//         to match the new contract bundle. NEW ESCROW_ADDR + escrowAbi
//         (Hybrid-E claim flow). New tier 6 TIER_LIFETIME_PREMIUM. New
//         pricing model: founder + regular per tier baked on-chain, read
//         live via `currentPrice(tier)` (PWA pricing UI MUST read
//         currentPrice, NOT priceFor — `priceFor` is now the post-cap
//         regular price). New `nokLimitOf` / `capabilityTier` view surfaces
//         (§M policy authority). NEW Hybrid-E SBT functions:
//         `designateByEmail`, `rebindFromEscrow`, escrow + license setters.
//         Oracle gains `MAX_TOKENS_PER_FIRE`, forwarder-only performUpkeep.
//         Ownable2Step on all 5 → exposed `pendingOwner` / `acceptOwnership`
//         on each ABI. New events `LicenceUpgraded`, `FounderCapReached`,
//         `NoKDesignatedByEmail`, `NoKReboundFromEscrow`, `Initialized`.
//         TIER_PERKS rewritten per Section A veracity sweep (removed
//         unbacked "quarterly integrity audit", "wallets per vault" counts,
//         "Shamir 5-of-9 as Premium-only", "family/couples 2-of-2";
//         multi-seed-per-vault retained as a real Premium capability now
//         that the PWA build delivers it). Family Office (4) + Institutional
//         (5) PERKS de-duplicated for the Pricing.tsx "combined coming-soon
//         card" layout. Standard (1) + Lifetime (2) share STANDARD_PERKS;
//         Premium (3) + Lifetime-Premium (6) share PREMIUM_PERKS — provably
//         identical feature lists so the cards never drift.
// 0.4.6 — Tier 2 name "Lifetime" → "Lifetime (Standard)".
// 0.4.5 — LOG_QUERY_CHUNK env-overridable.
// 0.4.4 — + LicenceAdminMinted + ReferralAttributed events for client-side log reads.
// 0.4.3 — Free-tier "FIDO2 / passkey login" → "WebAuthn passkey (optional unlock)".
// 0.4.2 — Pricing undercut founder offer.
// 0.4.1 — DEPLOY_BLOCK comment refreshed.
// 0.4.0 — Affiliate/referral ABI surface.
// 0.3.0 — Free tier 2→3 share locations + adminMint/setPrice/setMintable ABI.
// 0.2.0 — TIER_PERKS plan §6.
// 0.1.0 — initial.
//
// Contract ABIs and tier definitions for the PWA. Hand-rolled minimal ABIs
// for what wagmi needs — forge exports full ABIs after deploy, but the PWA
// only consumes a focused surface.

import type { Address } from "viem";

export const LICENSE_ADDR  = (import.meta.env.VITE_LICENSE_CONTRACT_ADDR  ?? "0x0000000000000000000000000000000000000000") as Address;
export const SBT_ADDR      = (import.meta.env.VITE_SBT_CONTRACT_ADDR      ?? "0x0000000000000000000000000000000000000000") as Address;
export const ORACLE_ADDR   = (import.meta.env.VITE_ORACLE_CONTRACT_ADDR   ?? "0x0000000000000000000000000000000000000000") as Address;
export const RECOVERY_ADDR = (import.meta.env.VITE_RECOVERY_CONTRACT_ADDR ?? "0x0000000000000000000000000000000000000000") as Address;
export const ESCROW_ADDR   = (import.meta.env.VITE_ESCROW_CONTRACT_ADDR   ?? "0x0000000000000000000000000000000000000000") as Address;
export const ALERTS_ADDR   = (import.meta.env.VITE_ALERTS_CONTRACT_ADDR   ?? "0x0000000000000000000000000000000000000000") as Address;
export const USDC_ADDR     = (import.meta.env.VITE_PAYMENT_TOKEN_ADDR     ?? "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359") as Address;

// Chainlink Automation Registry on Polygon PoS (canonical public address).
// Anyone can fund any registered upkeep — this is the surface that lets the
// community keep our dead-man's switch firing even if NoKLock disappears.
export const CHAINLINK_REGISTRY_ADDR = "0x08a8eea76D2395807Ce7D1FC942382515469cCA1" as Address;
// LINK token (ERC-677) on Polygon PoS — the token used to fund Automation upkeeps.
export const LINK_TOKEN_POLYGON_ADDR = "0xb0897686c545045aFc77CF20eC7A532E3120E0F1" as Address;
// The upkeep ID for NoKLock's Oracle dead-man's switch. uint256 string,
// emitted at registration. If unset, the upkeep widget renders a friendly
// "upkeep not configured" placeholder rather than reading a nonsense ID.
export const CHAINLINK_ORACLE_UPKEEP_ID = (import.meta.env.VITE_CHAINLINK_ORACLE_UPKEEP_ID ?? "") as string;
// The 2nd upkeep — NoKLockAlerts (Live-Man's Switch) log-trigger automation.
// Registered separately from the Oracle dead-man's switch; leave the env blank
// until it's registered and the widget renders a "not configured yet" notice.
export const CHAINLINK_ALERTS_UPKEEP_ID = (import.meta.env.VITE_CHAINLINK_ALERTS_UPKEEP_ID ?? "") as string;

// Minimal Chainlink Automation Registry ABI — only the read fns the upkeep
// status widget uses. The registry is huge; we don't need the rest.
export const chainlinkRegistryAbi = [
  { type: "function", name: "getUpkeep", stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "upkeep", type: "tuple", components: [
      { name: "target",                type: "address" },
      { name: "executeGas",             type: "uint32"  },
      { name: "checkData",              type: "bytes"   },
      { name: "balance",                type: "uint96"  },
      { name: "admin",                  type: "address" },
      { name: "maxValidBlocknumber",    type: "uint64"  },
      { name: "lastPerformBlockNumber", type: "uint32"  },
      { name: "amountSpent",            type: "uint96"  },
      { name: "paused",                 type: "bool"    },
      { name: "offchainConfig",         type: "bytes"   },
    ]}],
  },
  { type: "function", name: "getMinBalanceForUpkeep", stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "minBalance", type: "uint96" }],
  },
] as const;

/** Block the contracts were deployed in. Updated per-deploy via env. */
export const DEPLOY_BLOCK = BigInt(import.meta.env.VITE_DEPLOY_BLOCK ?? "86980000");

/** Max block span per eth_getLogs call. */
export const LOG_QUERY_CHUNK = BigInt(import.meta.env.VITE_LOG_QUERY_CHUNK ?? "500");

export const TIER = {
  Free: 0n,
  Standard: 1n,
  Lifetime: 2n,
  Premium: 3n,
  FamilyOffice: 4n,
  Institutional: 5n,
  LifetimePremium: 6n,
} as const;

export type TierId = typeof TIER[keyof typeof TIER];

export const TIER_NAME: Record<string, string> = {
  "0": "Free",
  "1": "Standard",
  "2": "Lifetime (Standard)",
  "3": "Premium",
  "4": "Family Office",
  "5": "Institutional",
  "6": "Lifetime Premium",
};

// Display prices (USDC) — MUST equal the on-chain `currentPrice(tier)` the
// contract actually charges right now (founder while founderCapRemaining > 0,
// regular thereafter). Founder + regular are baked into the contract per
// ACTIVE PLAN 7 §B6 EXECUTION DECISIONS LOG.
export const TIER_DISPLAY_PRICE: Record<string, string> = {
  "1": "99 USDC / year — Founder (first 10,000), then 149",
  "2": "299 USDC one-time — Founder (first 10,000), then 499",
  "3": "199 USDC / year — Founder (first 10,000), then 299",
  "4": "Family Office tier — coming soon",
  "5": "Institutional tier — coming soon",
  "6": "499 USDC one-time — Founder (first 10,000), then 799",
};

// Architectural baseline — applies to every tier, listed once for visibility.
// 2026-06-03 truthfulness-audit fix: removed "Web Worker" (FALSE — no Worker
// exists; crypto runs on main thread inside enrol/restore pipelines) and the
// "+ Trusted Types" tail (TT was removed in .htaccess 0.4.0).
const ARCH_BASELINE = "Browser-native crypto + strict CSP + RPC IP-privacy proxy + AI-resistant";

// -- Veracity-fixed perks (§A sweep) -------------------------------------------
// Removed: "Quarterly integrity audit" (didn't exist); "Up to N wallets per
// vault" counts (unenforced honour claim — drop); "Shamir 5-of-9 as Premium
// -exclusive" (available all paid tiers — drop the per-tier claim); "Family
// /couples 2-of-2" (unbacked); raw vault-count promises on paid tiers (drop).
// Kept and now TRUE: Hybrid-E email-NoK, multi-seed-per-vault (Premium),
// social-recovery guardians, document/image vaults (Premium).

// 0.5.0 — Daniel 2026-05-22: cards build LEFT-TO-RIGHT. Free carries the full
// working base (soulbound trigger, heartbeat, test-restore, social recovery,
// arch baseline — all real on Free, which gets 1 NoK on-chain). Standard +
// Premium list only what they ADD, so boxes balance and the value-ladder
// reads at a glance. Every line verified against the deployed contract.
const STANDARD_PERKS: readonly string[] = [
  "Everything in Free, plus:",
  "Unlimited vaults — separate ones for seeds, sealed letters, etc.",
  "Up to 5 NoK per wallet, each minted on-chain",
  "Multi-NoK voting (2-of-3) — no single heir can act alone",
  "Crypto-seed AND sealed-letter vaults",
  "More share locations across clouds and devices",
];

const PREMIUM_PERKS: readonly string[] = [
  "Everything in Standard, plus:",
  "Duress decoy mode — two independent vaults + passwords (Premium-only)",
  "Up to 10 designated next-of-kin per wallet",
  "Multi-NoK voting up to 5-of-9 quorum",
  "Social recovery up to 5-of-9 guardians",
  "Document + image vaults (encrypted blobs + restore)",
  "Multi-seed-per-vault (several seed phrases in one vault)",
  "Configurable Shamir threshold up to 5-of-9",
  "Guardian-management UI + audit-log export",
  "Priority bug-report channel",
];

const FAMILYORG_PERKS: readonly string[] = [
  "10-50 client accounts under one advisor / family-office umbrella",
  "Advisor dashboard with vault-state read-outs (encrypted-blob-aware)",
  "Audit export (CSV/PDF)",
  "Multi-user org roles",
];

const INSTITUTIONAL_PERKS: readonly string[] = [
  "Multi-sig governance",
  "SOC2 (if/when achieved — not before)",
  "M&A data-room provisioning",
];

export const TIER_PERKS: Record<string, readonly string[]> = {
  // Free — the full working base: real inheritance, capped at 1 NoK on-chain.
  // Everything the paid tiers build on starts here.
  "0": [
    "1 vault (5 MB max), 1 next-of-kin — real, autonomous inheritance",
    "Soulbound NFT inheritance trigger (ERC-5192) — rare in production",
    "Manual heartbeat re-attest only (heartbeat automation is paid-tier)",
    "Email-NoK via Hybrid-E (NoK without their own wallet)",
    "Social recovery (2-of-3 guardians, 7-day cancellation window)",
    "1 sealed letter OR 1 seed-phrase vault",
    "3 share locations (2-of-3 restore)",
    "Test-restore drill (run any time)",
    "WebAuthn passkey (optional unlock)",
    "Prove-It demo",
    ARCH_BASELINE,
  ],
  // Standard (1) and Lifetime (2) — SAME feature set; Lifetime is just paid once.
  "1": STANDARD_PERKS,
  "2": [
    "One payment — lifetime licence, never renews. The full Standard feature set (shown above), paid once.",
    "NoKLock-proof: contracts are immutable + on-chain, so your inheritance keeps working even if NoKLock disappears — a lifetime that doesn't depend on us being around.",
    "Rare offer: a one-time price for autonomous, self-custodial, soulbound on-chain inheritance — competitors only rent, and none match this model.",
  ],
  // Premium (3) and Lifetime-Premium (6) — SAME feature set; LP is paid once.
  "3": PREMIUM_PERKS,
  "6": [
    "One payment — lifetime licence, never renews. The full Premium feature set (shown above), paid once.",
    "Includes duress decoy, document + image vaults, multi-seed, up to 10 NoK + 5-of-9 quorum.",
    "NoKLock-proof + rare: the most complete self-custodial inheritance stack there is — on-chain, verifiable, soulbound — for a single lifetime price. No competitor offers this feature set at all, let alone paid-once.",
  ],
  // Family Office + Institutional — gated on-chain (mintable=false). The
  // Pricing.tsx page combines these into ONE "coming soon" card; the perks
  // here are kept distinct so the eventual launch can re-split easily.
  "4": FAMILYORG_PERKS,
  "5": INSTITUTIONAL_PERKS,
};

// -- ABIs --------------------------------------------------------------------

export const licenseAbi = [
  // ERC-1155
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }, { name: "id", type: "uint256" }], outputs: [{ type: "uint256" }] },

  // Pricing — currentPrice is the truth (founder/regular auto-step). priceFor
  // remains as the regular price for display + admin tuning.
  { type: "function", name: "currentPrice", stateMutability: "view", inputs: [{ name: "tier", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "priceFor", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "priceForFounder", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "founderCapRemaining", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },
  { type: "function", name: "FOUNDER_CAP", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },

  // Mint paths
  { type: "function", name: "mintLicence", stateMutability: "nonpayable", inputs: [{ name: "tier", type: "uint256" }], outputs: [] },
  { type: "function", name: "mintLicenceReferred", stateMutability: "nonpayable", inputs: [{ name: "tier", type: "uint256" }, { name: "referrer", type: "address" }], outputs: [] },
  { type: "function", name: "upgradeLicence", stateMutability: "nonpayable", inputs: [{ name: "fromTier", type: "uint256" }, { name: "toTier", type: "uint256" }], outputs: [] },
  { type: "function", name: "burnLicence", stateMutability: "nonpayable", inputs: [{ name: "tier", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "adminMint", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "tier", type: "uint256" }, { name: "note", type: "string" }], outputs: [] },

  // Admin (owner-only setters)
  { type: "function", name: "setPrice", stateMutability: "nonpayable", inputs: [{ name: "tier", type: "uint256" }, { name: "newPrice", type: "uint256" }], outputs: [] },
  { type: "function", name: "setFounderPrice", stateMutability: "nonpayable", inputs: [{ name: "tier", type: "uint256" }, { name: "newPrice", type: "uint256" }], outputs: [] },
  { type: "function", name: "setMintable", stateMutability: "nonpayable", inputs: [{ name: "tier", type: "uint256" }, { name: "isMintable", type: "bool" }], outputs: [] },
  { type: "function", name: "setTreasury", stateMutability: "nonpayable", inputs: [{ name: "newTreasury", type: "address" }], outputs: [] },

  // Reads
  { type: "function", name: "mintable", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "paymentToken", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "treasury", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "lastMintedAt", stateMutability: "view", inputs: [{ name: "", type: "address" }, { name: "", type: "uint256" }], outputs: [{ type: "uint64" }] },

  // Referral / affiliate
  { type: "function", name: "referredBy", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "address" }] },
  { type: "function", name: "referralCount", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint32" }] },
  { type: "function", name: "referralCreditUSDC", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "isAffiliate", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "refereeDiscountBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] },
  { type: "function", name: "referrerShareBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] },
  { type: "function", name: "affiliateThreshold", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },
  { type: "function", name: "setReferralParams", stateMutability: "nonpayable", inputs: [{ name: "refereeDiscountBps_", type: "uint16" }, { name: "referrerShareBps_", type: "uint16" }, { name: "affiliateThreshold_", type: "uint32" }], outputs: [] },

  // §M tier-limit policy
  { type: "function", name: "capabilityTier", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint8" }] },
  { type: "function", name: "nokLimitOf", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint32" }] },
  { type: "function", name: "nokLimitForTier", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ type: "uint32" }] },
  { type: "function", name: "setNokLimits", stateMutability: "nonpayable", inputs: [{ name: "freeMax", type: "uint32" }, { name: "stdMax", type: "uint32" }, { name: "premMax", type: "uint32" }], outputs: [] },

  // Ownable2Step
  { type: "function", name: "pendingOwner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "transferOwnership", stateMutability: "nonpayable", inputs: [{ name: "newOwner", type: "address" }], outputs: [] },
  { type: "function", name: "acceptOwnership", stateMutability: "nonpayable", inputs: [], outputs: [] },

  // Events
  { type: "event", name: "LicenceMinted", inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "tier", type: "uint256", indexed: true },
      { name: "pricePaid", type: "uint256", indexed: false },
      { name: "mintedAt", type: "uint64", indexed: false },
  ] },
  { type: "event", name: "LicenceAdminMinted", inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "tier", type: "uint256", indexed: true },
      { name: "by", type: "address", indexed: true },
      { name: "mintedAt", type: "uint64", indexed: false },
      { name: "note", type: "string", indexed: false },
  ] },
  { type: "event", name: "LicenceUpgraded", inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "fromTier", type: "uint256", indexed: true },
      { name: "toTier", type: "uint256", indexed: true },
      { name: "deltaPaid", type: "uint256", indexed: false },
  ] },
  { type: "event", name: "ReferralAttributed", inputs: [
      { name: "referee", type: "address", indexed: true },
      { name: "referrer", type: "address", indexed: true },
      { name: "tier", type: "uint256", indexed: true },
      { name: "paid", type: "uint256", indexed: false },
      { name: "cut", type: "uint256", indexed: false },
      { name: "asCredit", type: "bool", indexed: false },
  ] },
  { type: "event", name: "FounderCapReached", inputs: [{ name: "at", type: "uint64", indexed: false }] },
  { type: "event", name: "Initialized", inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "paymentToken", type: "address", indexed: true },
      { name: "treasury", type: "address", indexed: true },
  ] },
] as const;

export const erc20Abi = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

export const oracleAbi = [
  { type: "function", name: "lastHeartbeat", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint64" }, { type: "uint8" }] },
  { type: "function", name: "gracePeriodOverride", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint32" }] },
  { type: "function", name: "selfHeartbeat", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "setGracePeriod", stateMutability: "nonpayable", inputs: [{ name: "wallet", type: "address" }, { name: "seconds_", type: "uint32" }], outputs: [] },
  { type: "function", name: "performUpkeep", stateMutability: "nonpayable", inputs: [{ name: "performData", type: "bytes" }], outputs: [] },
  { type: "function", name: "checkUpkeep", stateMutability: "view", inputs: [{ name: "checkData", type: "bytes" }], outputs: [{ name: "upkeepNeeded", type: "bool" }, { name: "performData", type: "bytes" }] },
  { type: "function", name: "queuePendingActivation", stateMutability: "nonpayable", inputs: [{ name: "wallet", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [] },
  { type: "function", name: "lastActivatedBlock", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "MAX_TOKENS_PER_FIRE", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "MAX_GRACE", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },
  { type: "function", name: "DEFAULT_GRACE", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },
  { type: "function", name: "automationForwarder", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "pusher", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "setForwarder", stateMutability: "nonpayable", inputs: [{ name: "newForwarder", type: "address" }], outputs: [] },
  { type: "function", name: "setPusher", stateMutability: "nonpayable", inputs: [{ name: "who", type: "address" }, { name: "authorised", type: "bool" }], outputs: [] },
  // Ownable2Step
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "pendingOwner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "transferOwnership", stateMutability: "nonpayable", inputs: [{ name: "newOwner", type: "address" }], outputs: [] },
  { type: "function", name: "acceptOwnership", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

// NoKLockAlerts — the "Live-Man's Switch": owner registers watcher wallets +
// self-funds POL; a Chainlink log-trigger pings them when a recovery starts.
export const alertsAbi = [
  { type: "function", name: "registerWatchers", stateMutability: "payable", inputs: [{ name: "watchers_", type: "address[]" }], outputs: [] },
  { type: "function", name: "topUp", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "withdrawFunding", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "clearWatchers", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "testPing", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "getWatchers", stateMutability: "view", inputs: [{ name: "owner_", type: "address" }], outputs: [{ type: "address[]" }] },
  { type: "function", name: "fundingOf", stateMutability: "view", inputs: [{ name: "owner_", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "PING_AMOUNT", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "MAX_WATCHERS", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "alertForwarder", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "isForwarderLocked", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "setForwarder", stateMutability: "nonpayable", inputs: [{ name: "newForwarder", type: "address" }], outputs: [] },
  { type: "event", name: "AlertPinged", inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "watcher", type: "address", indexed: true },
      { name: "reason", type: "uint8", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
  ] },
  // Ownable2Step
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "acceptOwnership", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

// NoKLockEscrow — Hybrid-E claim flow ABI surface.
export const escrowAbi = [
  // Reads
  { type: "function", name: "sbt", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "attestor", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "bindings", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [
      { name: "vaultId", type: "bytes32" },
      { name: "emailHash", type: "bytes32" },
      { name: "role", type: "uint8" },
      { name: "ownerWallet", type: "address" },
      { name: "createdAt", type: "uint64" },
      { name: "status", type: "uint8" }, // 0 Unknown · 1 Pending · 2 Claimed · 3 Revoked
  ] },
  { type: "function", name: "spent", stateMutability: "view", inputs: [{ name: "", type: "bytes32" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "ESCROW_CLAIM_TYPEHASH", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "domainSeparator", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },

  // Heir claim
  { type: "function", name: "claimWithAttestation", stateMutability: "nonpayable", inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "claimingWallet", type: "address" },
      { name: "nonce", type: "bytes32" },
      { name: "expiresAt", type: "uint64" },
      { name: "signature", type: "bytes" },
      { name: "newTokenUri", type: "string" },
  ], outputs: [] },

  // Owner admin
  { type: "function", name: "revokeBinding", stateMutability: "nonpayable", inputs: [{ name: "tokenId", type: "uint256" }, { name: "reason", type: "string" }], outputs: [] },
  { type: "function", name: "setAttestor", stateMutability: "nonpayable", inputs: [{ name: "newAttestor", type: "address" }], outputs: [] },

  // Ownable2Step
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "pendingOwner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "transferOwnership", stateMutability: "nonpayable", inputs: [{ name: "newOwner", type: "address" }], outputs: [] },
  { type: "function", name: "acceptOwnership", stateMutability: "nonpayable", inputs: [], outputs: [] },

  // Events
  { type: "event", name: "DesignationRecorded", inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "vaultId", type: "bytes32", indexed: true },
      { name: "emailHash", type: "bytes32", indexed: true },
      { name: "ownerWallet", type: "address", indexed: false },
      { name: "role", type: "uint8", indexed: false },
  ] },
  { type: "event", name: "Claimed", inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "newTokenId", type: "uint256", indexed: true },
      { name: "claimingWallet", type: "address", indexed: true },
      { name: "nonce", type: "bytes32", indexed: false },
  ] },
  { type: "event", name: "Revoked", inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "by", type: "address", indexed: true },
      { name: "reason", type: "string", indexed: false },
  ] },
  { type: "event", name: "AttestorUpdated", inputs: [
      { name: "oldAttestor", type: "address", indexed: false },
      { name: "newAttestor", type: "address", indexed: false },
  ] },
] as const;
