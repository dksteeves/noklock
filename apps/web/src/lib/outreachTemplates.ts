// @version 0.1.0 @date 2026-05-23
// Per-influencer outreach copy (Daniel: DM + public tweet, not just generic
// launch tweets). Category-aware (from data/influencers.ts), with the handle
// inserted. Used by Marketing → Targets.

type Bucket = "inheritance" | "security" | "educator" | "media" | "ecosystem" | "generic";

function bucket(category: string): Bucket {
  if (category === "inheritance" || category === "estate") return "inheritance";
  if (category === "security" || category === "hardware") return "security";
  if (category === "educator" || category === "women" || category === "regional" || category === "defi") return "educator";
  if (category === "media") return "media";
  if (category === "polygon" || category === "ecosystem") return "ecosystem";
  return "generic";
}

const DM: Record<Bucket, (h: string) => string> = {
  inheritance: (h) => `Hi ${h} — your work on crypto inheritance is exactly the gap we built for. NoKLock is self-custodial, on-chain inheritance (soulbound-NFT heirs on Polygon, an email path for non-crypto family, works even if we shut down). Not asking for a plug — I'd genuinely value your critique of the model. Contracts source-verified: noklock.app/info?tab=contracts. Worth 10 minutes?`,
  security: (h) => `Hi ${h} — built a self-custodial inheritance tool and I'd rather have it torn apart by someone who teaches self-custody than praised by people who don't. NoKLock: client-side crypto, no provider keys, M-of-N heir quorum, duress decoy, on-chain trigger that survives the company. Verifiable on PolygonScan. Brutal feedback welcome — noklock.app/prove-it runs the real pipeline on throwaway data.`,
  educator: (h) => `Hi ${h} — love how you teach self-custody. Most of your audience has no plan for what happens to their crypto if they die. NoKLock is self-custodial inheritance (no provider keys, on-chain dead-man's switch on Polygon, email path for non-crypto heirs). If it's useful to your teaching I'd love to give you a walkthrough — and honest feedback is very welcome. noklock.app/crypto-inheritance`,
  media: (h) => `Hi ${h} — possible story angle: a crypto-inheritance product doing the "survives if the company disappears" thing with soulbound NFTs (rare in production) + an on-chain dead-man's switch, fully source-verified. No-NDA walkthrough + the contract addresses to verify independently, any time. noklock.app`,
  ecosystem: (h) => `Hi ${h} — NoKLock is a self-custodial crypto-inheritance dApp live on Polygon (6 source-verified contracts, Chainlink Automation, ERC-5192 soulbound NFTs — a rare in-production use). Would love an ecosystem spotlight / case study — a genuinely novel consumer use case for the chain. noklock.app/info?tab=contracts`,
  generic: (h) => `Hi ${h} — NoKLock is self-custodial crypto inheritance, live on Polygon: we never hold keys, an on-chain dead-man's switch hands a vault to designated heirs, with a soulbound-NFT record and an email path for non-crypto family. Think there's a fit with your audience. Verifiable on PolygonScan — happy to walk you through it.`,
};

const PUBLIC: Record<Bucket, (h: string) => string> = {
  inheritance: (h) => `${h} this one's squarely in your wheelhouse: self-custodial crypto inheritance — on-chain dead-man's switch, soulbound-NFT heirs, an email path for non-crypto family, and it keeps working even if the company disappears. Curious what you make of the model 👉 noklock.app/crypto-inheritance`,
  security: (h) => `${h} — for the "what happens to your keys when you die" problem: NoKLock does it self-custodially — no provider keys, M-of-N heir quorum, duress decoy, on-chain trigger. All verifiable on PolygonScan. Would value your read 👉 noklock.app`,
  educator: (h) => `${h} — the self-custody gap most guides skip: inheritance. NoKLock hands your crypto to your heirs without you giving up your keys — on-chain, survives the vendor, with an email path for non-crypto family 👉 noklock.app/crypto-inheritance`,
  media: (h) => `${h} — rare-in-production ERC-5192 soulbound NFTs powering a self-custodial crypto-inheritance dead-man's switch that survives the company shutting down — all source-verified on Polygon 👉 noklock.app`,
  ecosystem: (h) => `${h} — built on Polygon: NoKLock, self-custodial crypto inheritance. On-chain dead-man's switch + soulbound-NFT heirs, 6 source-verified contracts 👉 noklock.app`,
  generic: (h) => `${h} — what happens to your crypto when you die? NoKLock: self-custodial inheritance, on-chain dead-man's switch, soulbound-NFT heirs, survives the vendor 👉 noklock.app`,
};

export function dmTemplate(category: string, handle: string): string { return DM[bucket(category)](handle); }
export function publicTweet(category: string, handle: string): string { return PUBLIC[bucket(category)](handle); }
