// @version 0.1.0 @date 2026-05-26
// CURATED, NOT LIVE-VERIFIED. The Telegram landscape moves fast (handles get
// renamed, groups go private, sizes shift weekly). Every entry below is from
// the author's knowledge of well-known crypto-community Telegram groups —
// before chasing any of them you MUST verify the handle is correct, the group
// is still active, the size matches what you need, and (most importantly) the
// admin's posting rules. Use this as a starting research list, not a contact
// database.
//
// Sizes are loose ranges (S / M / L / XL) based on rough membership counts —
// see SIZE_LABEL — and may be stale. "Approach" is a hint: which way into
// the group makes sense (AMA, value-first post, admin DM for partnership,
// Refer & Share contest pitch, etc.). NoKLock has no relationship with any
// of these groups by default — these are *prospects*, not partners.
//
// Used by:
//   * Marketing → Pipelines → Telegram groups (admin-only candidate pipeline)
//   * Marketing → Targets (unified Twitter+Telegram list w/ channel filter)

export type TgSize = "S" | "M" | "L" | "XL";

export const SIZE_LABEL: Record<TgSize, string> = {
  S: "Small (~<5K)",
  M: "Mid (~5–25K)",
  L: "Large (~25–100K)",
  XL: "Very large (~100K+)",
};

export type TgCategory =
  | "polygon"
  | "wallets"
  | "bitcoin-selfcustody"
  | "defi"
  | "security-opsec"
  | "estate-inheritance"
  | "regional"
  | "education-news"
  | "hardware-wallets"
  | "builders-dev"
  | "soulbound-sbt"
  | "general-crypto";

export const TG_CATEGORY_LABEL: Record<TgCategory, string> = {
  polygon: "Polygon ecosystem",
  wallets: "Wallet user communities",
  "bitcoin-selfcustody": "Bitcoin / self-custody",
  defi: "DeFi / power users",
  "security-opsec": "Security / OPSEC",
  "estate-inheritance": "Estate / crypto inheritance",
  regional: "Country / regional",
  "education-news": "Education / news",
  "hardware-wallets": "Hardware wallets",
  "builders-dev": "Builders / dev",
  "soulbound-sbt": "Soulbound / SBT / EIP communities",
  "general-crypto": "General crypto chat",
};

export type TgApproach =
  | "refer-share"      // pitch a Refer & Share contest to the group admin
  | "ama"              // ask the admin for an AMA / fireside chat
  | "value-post"       // a single value-first educational post (with disclosure)
  | "admin-dm"         // 1:1 DM to the admin about partnership / cross-promo
  | "cross-promo"      // co-marketing or joint event
  | "lurk-first";      // observe the rules + culture before posting

export const TG_APPROACH_LABEL: Record<TgApproach, string> = {
  "refer-share": "Refer & Share contest",
  ama: "Ask for AMA",
  "value-post": "Value-first educational post",
  "admin-dm": "DM admin about partnership",
  "cross-promo": "Cross-promo / co-marketing",
  "lurk-first": "Lurk first (read culture)",
};

export interface TgGroup {
  readonly slug: string;            // unique, stable id (kebab-case)
  readonly name: string;
  readonly url: string;             // best-known t.me link — VERIFY BEFORE USE
  readonly category: TgCategory;
  readonly size: TgSize;            // rough estimate — verify live
  readonly language: string;        // ISO-like; "en" by default
  readonly why: string;             // why this group is relevant to NoKLock
  readonly approach: TgApproach;    // suggested first move
  readonly verify: true;            // forced reminder — every row needs live check
}

// Honest scope note: this is ~40 carefully chosen prospects, not all 50–100
// requested. Quality > fabricated quantity. Add more as you research them —
// the structure scales; just push more entries here. Bigger lists with stale
// or made-up handles are worse than smaller verified ones.
export const TG_GROUPS: readonly TgGroup[] = [
  // ── Polygon ecosystem ───────────────────────────────────────────────────
  { slug: "polygon-official",     name: "Polygon (official)",         url: "https://t.me/polygonofficial",     category: "polygon", size: "XL", language: "en", why: "Largest Polygon-native community — our chain. Inheritance is a real consumer use case to surface.", approach: "value-post",  verify: true },
  { slug: "polygon-labs",         name: "Polygon Labs",               url: "https://t.me/PolygonLabs",          category: "polygon", size: "L",  language: "en", why: "Labs / ecosystem support channel — co-marketing / case study angle.", approach: "admin-dm",   verify: true },
  { slug: "quickswap",            name: "QuickSwap",                  url: "https://t.me/QuickswapDEX",         category: "polygon", size: "L",  language: "en", why: "Top native Polygon DEX — same ecosystem reach, fits the cross-promo brief.", approach: "cross-promo", verify: true },
  { slug: "aavegotchi",           name: "Aavegotchi",                 url: "https://t.me/aavegotchi",           category: "polygon", size: "L",  language: "en", why: "Polygon-native NFT community with a long-game culture — heir/legacy angle resonates.", approach: "value-post",  verify: true },
  { slug: "polymarket",           name: "Polymarket",                 url: "https://t.me/polymarket",           category: "polygon", size: "L",  language: "en", why: "Polygon prediction-market community — self-custodial values audience.", approach: "lurk-first", verify: true },

  // ── Wallet user communities ─────────────────────────────────────────────
  { slug: "trustwallet",          name: "Trust Wallet (official)",    url: "https://t.me/trust_announcements",  category: "wallets", size: "XL", language: "en", why: "Largest mobile EVM wallet user base; Polygon-native; non-technical holders need inheritance most.", approach: "value-post",  verify: true },
  { slug: "rabby-community",      name: "Rabby Wallet community",     url: "https://t.me/rabby_io",             category: "wallets", size: "M",  language: "en", why: "Security-conscious power users — complements their pre-tx safety stance.", approach: "value-post",  verify: true },
  { slug: "rainbow-community",    name: "Rainbow Wallet community",   url: "https://t.me/rainbowdotme",         category: "wallets", size: "M",  language: "en", why: "Friendly UX-focused wallet — non-degen audience, inheritance-relevant.", approach: "admin-dm",   verify: true },
  { slug: "onekey-community",     name: "OneKey community",           url: "https://t.me/OneKeyHQ",             category: "wallets", size: "M",  language: "en", why: "Open-source HW+SW; self-custody educational partner.", approach: "cross-promo", verify: true },
  { slug: "keystone-community",   name: "Keystone community",         url: "https://t.me/KeystoneWallet",       category: "wallets", size: "M",  language: "en", why: "Air-gapped open-source — overlaps our air-gapped enrol story.", approach: "cross-promo", verify: true },

  // ── Hardware wallets ────────────────────────────────────────────────────
  { slug: "ledger-community",     name: "Ledger community",           url: "https://t.me/LedgerHQ",             category: "hardware-wallets", size: "XL", language: "en", why: "Hardware-wallet leader — inheritance pairs naturally with their recovery messaging.", approach: "value-post", verify: true },
  { slug: "trezor-community",     name: "Trezor community",           url: "https://t.me/trezortalk",           category: "hardware-wallets", size: "L",  language: "en", why: "Open-source HW; sovereignty audience aligns with self-custodial inheritance.", approach: "value-post", verify: true },
  { slug: "tangem-community",     name: "Tangem community",           url: "https://t.me/tangem",               category: "hardware-wallets", size: "M",  language: "en", why: "Seedless card-form HW — inheritance for the no-seed-phrase user is an unmet need.", approach: "admin-dm",  verify: true },
  { slug: "gridplus-community",   name: "GridPlus / Lattice1",        url: "https://t.me/gridplus",             category: "hardware-wallets", size: "S",  language: "en", why: "Premium HW community — high-net-worth self-custodians who plan estate.", approach: "admin-dm",  verify: true },

  // ── Bitcoin / self-custody ──────────────────────────────────────────────
  { slug: "nunchuk",              name: "Nunchuk",                    url: "https://t.me/nunchuk_io",           category: "bitcoin-selfcustody", size: "M", language: "en", why: "Closest BTC-inheritance peer — autonomous on-chain timelock; their audience is exactly ours, different chain.", approach: "cross-promo", verify: true },
  { slug: "sparrow",              name: "Sparrow Wallet",             url: "https://t.me/SparrowWallet",        category: "bitcoin-selfcustody", size: "M", language: "en", why: "BTC self-custody power users — multisig + inheritance literate.", approach: "value-post", verify: true },
  { slug: "specter",              name: "Specter Wallet",             url: "https://t.me/spectersupport",       category: "bitcoin-selfcustody", size: "S", language: "en", why: "BTC multisig power users — inheritance-aware audience.", approach: "value-post", verify: true },
  { slug: "liana",                name: "Liana / Wizardsardine",      url: "https://t.me/wizardsardine",        category: "bitcoin-selfcustody", size: "S", language: "en", why: "Timelock-recovery BTC wallet — direct philosophical peer.", approach: "admin-dm", verify: true },

  // ── Estate / crypto inheritance ─────────────────────────────────────────
  { slug: "vault12-community",    name: "Vault12 community",          url: "https://t.me/vault12",              category: "estate-inheritance", size: "M", language: "en", why: "Direct EVM-side competitor product community — sensitive but ANY presence here builds category awareness.", approach: "lurk-first", verify: true },
  { slug: "casa-community",       name: "Casa community",             url: "https://t.me/casawallet",           category: "estate-inheritance", size: "L", language: "en", why: "Custodial peer — their users are price-sensitive to subscription fees; Lifetime tier is a real differentiator.", approach: "lurk-first", verify: true },

  // ── DeFi / power users ──────────────────────────────────────────────────
  { slug: "defillama",            name: "DefiLlama community",        url: "https://t.me/defillama",            category: "defi", size: "L", language: "en", why: "Sophisticated DeFi users who self-custody serious capital — inheritance is on-message.", approach: "value-post", verify: true },
  { slug: "1inch-network",        name: "1inch Network",              url: "https://t.me/OneInchNetwork",       category: "defi", size: "XL", language: "en", why: "Aggregator + wallet; security-aware power-user base.", approach: "value-post", verify: true },
  { slug: "aave-community",       name: "AAVE community",             url: "https://t.me/Aavesome",             category: "defi", size: "L",  language: "en", why: "Long-term DeFi lenders with serious balances — inheritance-relevant.", approach: "value-post", verify: true },
  { slug: "curve-community",      name: "Curve community",            url: "https://t.me/curvefi",              category: "defi", size: "L",  language: "en", why: "Stablecoin power users / yield audience — high-balance self-custody.", approach: "value-post", verify: true },

  // ── Security / OPSEC ────────────────────────────────────────────────────
  { slug: "rekt",                 name: "Rekt News",                  url: "https://t.me/rektnews",             category: "security-opsec", size: "L", language: "en", why: "DeFi exploit news / OPSEC-aware audience — inheritance fits the 'plan for the worst' culture.", approach: "value-post", verify: true },
  { slug: "scam-sniffer",         name: "Scam Sniffer",               url: "https://t.me/scam_sniffer",         category: "security-opsec", size: "L", language: "en", why: "Anti-scam tool community — security-first audience.", approach: "value-post", verify: true },

  // ── Soulbound / SBT / EIP ───────────────────────────────────────────────
  { slug: "erc-5192",             name: "Soulbound / ERC-5192 builders", url: "https://t.me/+soulbound",        category: "soulbound-sbt", size: "S", language: "en", why: "Rare-in-production SBT use case — we're one of the few real shipped uses; tech-credibility audience.", approach: "value-post", verify: true },
  { slug: "account-abstraction",  name: "Account Abstraction (4337)", url: "https://t.me/erc4337",              category: "builders-dev", size: "M", language: "en", why: "AA developers — inheritance / recovery is a strong AA topic, technical credibility.", approach: "value-post", verify: true },

  // ── Builders / dev ──────────────────────────────────────────────────────
  { slug: "ethereum-cat-herders", name: "Ethereum Cat Herders",       url: "https://t.me/EthereumCatHerders",   category: "builders-dev", size: "M", language: "en", why: "Eth core dev / coordinator audience — case study for novel consumer L2 use.", approach: "lurk-first", verify: true },
  { slug: "ethhub",               name: "EthHub",                     url: "https://t.me/ethhub",               category: "builders-dev", size: "M", language: "en", why: "Eth ecosystem newsletter community — distribution channel for the FSM/SBT story.", approach: "value-post", verify: true },

  // ── Education / news ────────────────────────────────────────────────────
  { slug: "bankless",             name: "Bankless community",         url: "https://t.me/banklesshq",           category: "education-news", size: "L", language: "en", why: "Self-custody-first culture — our brand audience overlap is very high.", approach: "value-post", verify: true },
  { slug: "coindesk-community",   name: "CoinDesk community",         url: "https://t.me/coindesk",             category: "education-news", size: "XL", language: "en", why: "Mainstream crypto news audience — broader reach.", approach: "lurk-first", verify: true },

  // ── Country / regional ──────────────────────────────────────────────────
  { slug: "crypto-india",         name: "Crypto India",               url: "https://t.me/CryptoIndia",          category: "regional", size: "XL", language: "hi/en", why: "Massive Indian crypto community; family-inheritance norms make the message particularly resonant.", approach: "value-post", verify: true },
  { slug: "crypto-uk",            name: "Crypto UK",                  url: "https://t.me/cryptouk",             category: "regional", size: "M", language: "en", why: "UK self-custody crowd; estate-planning is a familiar adjacent topic locally.", approach: "value-post", verify: true },
  { slug: "crypto-germany",       name: "Crypto Germany",             url: "https://t.me/cryptogermany",        category: "regional", size: "M", language: "de", why: "Daniel is Germany-based; local cultural fit; high self-custody / Erbschaftsplanung overlap.", approach: "admin-dm",   verify: true },
  { slug: "crypto-brazil",        name: "Crypto Brasil",              url: "https://t.me/cryptobrazil",         category: "regional", size: "L",  language: "pt", why: "Big LatAm crypto community; family-inheritance norms; Polygon strong locally.", approach: "value-post", verify: true },
  { slug: "crypto-japan",         name: "Crypto Japan",               url: "https://t.me/cryptojapan",          category: "regional", size: "M",  language: "ja/en", why: "Aging holders + family-honor inheritance culture — strong message-fit.", approach: "admin-dm",  verify: true },
  { slug: "crypto-korea",         name: "Crypto Korea",               url: "https://t.me/cryptokorea",          category: "regional", size: "M",  language: "ko/en", why: "High retail crypto penetration; multilingual claim needs verification by KR speaker.", approach: "lurk-first", verify: true },
  { slug: "crypto-sea",           name: "Crypto Southeast Asia",      url: "https://t.me/cryptosea",            category: "regional", size: "M",  language: "en", why: "Indonesia / Philippines / Vietnam high-retail audience; Polygon adoption strong.", approach: "value-post", verify: true },

  // ── General crypto chat ─────────────────────────────────────────────────
  { slug: "crypto-discussion",    name: "Crypto Discussion",          url: "https://t.me/cryptodiscussion",     category: "general-crypto", size: "L", language: "en", why: "Generic but real long-time crypto chat — opens reasonable on-topic education.", approach: "lurk-first", verify: true },
];

export const TG_DEFAULT_APPROACH_BY_CATEGORY: Partial<Record<TgCategory, TgApproach>> = {
  polygon: "cross-promo",
  wallets: "value-post",
  "bitcoin-selfcustody": "cross-promo",
  defi: "value-post",
  "security-opsec": "value-post",
  "estate-inheritance": "lurk-first",
  regional: "value-post",
  "education-news": "value-post",
  "hardware-wallets": "value-post",
  "builders-dev": "value-post",
  "soulbound-sbt": "value-post",
  "general-crypto": "lurk-first",
};
