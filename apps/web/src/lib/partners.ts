// @version 0.1.0 @date 2026-05-23
// Partner pipeline for the Marketing → Partners tab (Daniel c.). Candidate
// partners (wallets / exchanges / DEX / CEX / ecosystem), why they fit, and a
// reach-out template per type. ANNOUNCED stays empty until a real partnership
// exists — that list is what a public "our partners" surface would render.

export type PartnerType = "wallet" | "dex" | "cex" | "ecosystem" | "infra" | "estate";

export interface PartnerCandidate {
  readonly name: string;
  readonly type: PartnerType;
  readonly handle?: string;     // X handle (without @) for outreach
  readonly why: string;         // why they're a fit / the angle
}

export const PARTNER_TYPE_LABEL: Record<PartnerType, string> = {
  wallet: "Wallet providers",
  dex: "DEX",
  cex: "Exchanges (CEX)",
  ecosystem: "Polygon / ecosystem",
  infra: "Infrastructure",
  estate: "Estate / legal",
};

export const PARTNER_CANDIDATES: readonly PartnerCandidate[] = [
  // Wallets — the most natural fit: their users hold the seeds we help inherit.
  { name: "MetaMask", type: "wallet", handle: "MetaMask", why: "Largest EVM wallet; 'what happens to your wallet when you die' is an unmet need for their base. Snap or referral angle." },
  { name: "Trust Wallet", type: "wallet", handle: "TrustWallet", why: "Huge mobile base, Polygon-native; inheritance as a value-add for non-technical holders." },
  { name: "Rabby", type: "wallet", handle: "Rabby_io", why: "Security-conscious power users; complements their pre-tx safety stance." },
  { name: "Coinbase Wallet", type: "wallet", handle: "CoinbaseWallet", why: "Self-custody arm of Coinbase; mainstream heirs angle." },
  { name: "Ledger", type: "wallet", handle: "Ledger", why: "Hardware-wallet leader; inheritance pairs with their recovery messaging (and our 'defence in depth' line)." },
  { name: "Trezor", type: "wallet", handle: "Trezor", why: "Open-source hardware; sovereignty audience aligns with self-custodial inheritance." },
  { name: "Keystone", type: "wallet", handle: "KeystoneWallet", why: "Air-gapped open-source; overlaps with our air-gapped enrolment story." },
  { name: "OneKey", type: "wallet", handle: "OneKeyHQ", why: "Open-source HW+SW; self-custody education partner." },
  // DEX
  { name: "QuickSwap", type: "dex", handle: "QuickswapDEX", why: "Leading native Polygon DEX — same chain, shared ecosystem reach." },
  { name: "Uniswap", type: "dex", handle: "Uniswap", why: "Top DEX, multichain incl. Polygon; broad reach." },
  { name: "1inch", type: "dex", handle: "1inch", why: "Aggregator + wallet; security-aware base." },
  // CEX
  { name: "Coinbase", type: "cex", handle: "coinbase", why: "Mainstream; 'self-custody your legacy' is on-message for their education arm." },
  { name: "Kraken", type: "cex", handle: "krakenfx", why: "Security-forward brand; estate-planning content partner." },
  // Polygon / ecosystem
  { name: "Polygon", type: "ecosystem", handle: "0xPolygon", why: "Our chain — ecosystem amplification, case-study, dApp spotlight." },
  { name: "Polygon Labs", type: "ecosystem", handle: "0xPolygonLabs", why: "Official ecosystem support / co-marketing." },
  // Infra
  { name: "Chainlink", type: "infra", handle: "chainlink", why: "We use Chainlink Automation for the dead-man's switch — a real integration story / case study." },
  { name: "Pinata", type: "infra", handle: "pinatacloud", why: "IPFS pinning is a supported share-storage target; co-content on durable storage." },
  // Estate / legal
  { name: "The Bitcoin Adviser", type: "estate", handle: "TheBTCAdviser", why: "Crypto estate-planning firm — referral / co-advisory channel." },
];

export interface OutreachTemplate { readonly forType: PartnerType | "generic"; readonly label: string; readonly body: string }

export const PARTNER_OUTREACH: readonly OutreachTemplate[] = [
  {
    forType: "wallet",
    label: "Wallet provider",
    body: `Hi [team] — your users hold the seeds; almost none have a plan for what happens to them if they die or lose access. NoKLock is self-custodial crypto inheritance (on-chain dead-man's switch on Polygon, soulbound-NFT heirs, email path for non-crypto family) — we never hold keys, so it complements your wallet rather than competing. Open to: a referral arrangement (we run an on-chain 10/10 referral), co-marketing/education, or a deeper integration. Verifiable on PolygonScan; happy to walk your team through it. — NoKLock (hello@noklock.app)`,
  },
  {
    forType: "ecosystem",
    label: "Polygon / ecosystem",
    body: `Hi [team] — NoKLock is a self-custodial crypto-inheritance dApp live on Polygon (6 source-verified contracts, Chainlink Automation, ERC-5192 soulbound NFTs — a rare in-production use). We'd love an ecosystem spotlight / case study / co-marketing slot. It's a genuinely novel consumer use case for the chain. Contracts + details: noklock.app/info?tab=contracts. — NoKLock`,
  },
  {
    forType: "infra",
    label: "Infrastructure (integration story)",
    body: `Hi [team] — NoKLock uses [your product] in production ([e.g. Chainlink Automation for our autonomous dead-man's switch] / [IPFS pinning for user-held encrypted shares]). It's a clean, novel case study (self-custodial crypto inheritance). Interested in a joint write-up / case study / amplification? Verifiable on-chain. — NoKLock (hello@noklock.app)`,
  },
  {
    forType: "estate",
    label: "Estate / legal",
    body: `Hi [name] — crypto inheritance is the gap your clients keep hitting. NoKLock is self-custodial (no provider keys, on-chain trigger, email path for non-crypto heirs, M-of-N quorum). Not a custodian — it slots alongside an estate plan rather than replacing your role; an attorney/executor can even be one of the M-of-N. Open to a referral/co-advisory channel. Happy to give you a walkthrough. — NoKLock`,
  },
  {
    forType: "generic",
    label: "Generic / other",
    body: `Hi [team] — NoKLock is self-custodial crypto inheritance, live on Polygon: we never hold keys, an on-chain dead-man's switch hands a vault to designated heirs, with a soulbound-NFT record and an email path for non-crypto family. We think there's a natural fit with [you] via [referral / co-marketing / integration]. Everything's verifiable on PolygonScan. Worth a short call? — NoKLock (hello@noklock.app)`,
  },
];
