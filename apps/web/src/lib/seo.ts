// @version 0.5.0 @date 2026-06-07
// 0.5.0 — AEO citation surface (handoff §3.11): "/" page description rewritten
//         to lead with "storage you pick — local folders or your own cloud
//         accounts" instead of cloud-only. Matches the positioning CARDINAL
//         (store + restore + optional inheritance, superset of competitors)
//         and removes the cloud-only framing that AI tools were quoting back.
//         All other route descriptions unchanged.
// @version 0.4.0 @date 2026-06-03
// 0.4.0 — Daniel 2026-06-03: Google Search Console "Alternative page with
//         proper canonical tag" fix for /info?tab=*. The old canonical was
//         `/info` for every tab variant — Google correctly deduped them all
//         under `/info` and indexed only the architecture tab as a
//         representative. This was suboptimal SEO: lost the chance to rank
//         `/info?tab=contracts` for "noklock contracts" queries, etc.
//         Fix: CANONICAL_PRESERVED_QUERY_PARAMS table lets specific routes
//         whitelist query params that get preserved in the canonical URL.
//         `/info` whitelists `tab` so each tab variant is now its own
//         indexable page. After deploy, request re-indexing in Search Console
//         for /info?tab=architecture / /info?tab=contracts / /info?tab=faq /
//         /info?tab=compliance — Google will pick them up over the next 1-4
//         weeks.
// @version 0.3.0 @date 2026-05-31
// 0.3.0 — Daniel 2026-05-31: "every page link has the noklock tag line ..
//         should they not be specific to the content". Added content-specific
//         entries for the 12 routes that called useDocumentHead() but had
//         no match in this map (so they fell through the early-return and
//         kept whatever index.html's static meta said). Matching entries
//         added in scripts/gen-prerender.mjs for the bot-visible static
//         HTML side. Routes added: /prove-it/{math,airgap,noklock-proof,
//         build-matches,entropy}, /viz/pipeline, /manual, /heir, /nok-claim,
//         /recovery, /corporate, /whitelabel.
// 0.2.0 — added /refer (referral rewards) to ROUTE_SEO — marketing-positive,
//         prerenders the connect prompt fine, joins sitemap.
// 0.1.0 — Single source of truth for per-route SEO + the canonical marketing-route
// list. Consumed by:
//   - useDocumentHead() below (sets title/description/canonical/OG per route)
//   - scripts/gen-seo.mjs (generates public/sitemap.xml — cannot drift)
//   - public/llms.txt content (hand-mirrored from ROUTE_SEO descriptions)
//
// Only PUBLIC marketing routes belong here. App/wallet routes (/dashboard,
// /vaults, /enrol*, /restore, /nok, /heartbeat, /dead-man, /settings,
// /admin) are intentionally absent — they are noindex and Disallowed in
// robots.txt and carry zero discovery value.

import { useEffect } from "react";

export const SITE_ORIGIN = "https://noklock.app";

export interface RouteSeo {
  /** Path exactly as registered in App.tsx routes. */
  readonly path: string;
  /** <title> — keep under ~60 chars; brand suffix added automatically. */
  readonly title: string;
  /** <meta name=description> — keep ~150-160 chars, plain, factual. */
  readonly description: string;
  /** Sitemap priority 0.0-1.0. */
  readonly priority: number;
}

export const ROUTE_SEO: readonly RouteSeo[] = [
  {
    path: "/articles",
    title: "NoKLock Articles — crypto inheritance, security & how it works",
    description:
      "Plain-language articles on crypto inheritance, self-custody, dead-man's switches, and how NoKLock protects your seed phrase and next-of-kin. Published in full on noklock.app.",
    priority: 0.7,
  },
  {
    path: "/",
    title: "NoKLock — self-custodial recovery & inheritance for crypto",
    description:
      "Back up and inherit a wallet from any chain — Bitcoin, Solana, Ethereum. Split your seed, wills and documents across storage you pick — local folders or your own cloud accounts. Self-recovery, emergency recovery, and optional on-chain next-of-kin inheritance. 100% self-custody — we never see your keys.",
    priority: 1.0,
  },
  {
    path: "/pricing",
    title: "Pricing — NoKLock licence tiers (pay in USDC on Polygon)",
    description:
      "Free, Standard, Lifetime, Premium, Family Office and Institutional tiers. One on-chain licence NFT, paid in USDC on Polygon. Full feature comparison table. No subscription processor.",
    priority: 0.9,
  },
  {
    path: "/info",
    title: "How NoKLock works — architecture, security & contracts",
    description:
      "Architecture, share storage, the dead-man's switch, the threat model, owner-vs-next-of-kin protections, and the verified Polygon contracts. The full, transparent technical breakdown.",
    priority: 0.9,
  },
  {
    path: "/prove-it",
    title: "Prove It — run the NoKLock crypto pipeline yourself",
    description:
      "Generate throwaway test data and watch the real Argon2id + SLIP-39 + AEAD + Ed25519 pipeline encrypt, split, restore and byte-compare it live in your browser. No mocks.",
    priority: 0.7,
  },
  {
    path: "/privacy",
    title: "Privacy — NoKLock collects nothing it could leak",
    description:
      "No email, no name, no IP, no cookies, no per-user analytics. The only two transactional emails ever sent are heartbeat reminders and next-of-kin activation, and only if you opt in.",
    priority: 0.5,
  },
  {
    path: "/terms",
    title: "Terms of Use — NoKLock",
    description:
      "Self-custodial software, AS-IS, no warranty. Licence NFTs are non-refundable. Beta Tester Programme: verified bug reports earn a free Lifetime licence.",
    priority: 0.4,
  },
  {
    path: "/updates",
    title: "Updates — what's new in NoKLock",
    description:
      "The public NoKLock changelog. Bookmark this page — there is no mailing list and no tracking.",
    priority: 0.4,
  },
  {
    path: "/cli",
    title: "noklock-cli — open-source share auto-upload/download tool",
    description:
      "Optional companion command-line tool for NoKLock. Automates upload + download of your encrypted shares to Dropbox (today) and Google Drive + OneDrive (roadmap). Your tokens stay on your machine — NoKLock servers never see them. ~250 lines TypeScript, BUSL-1.1 source-visible.",
    priority: 0.6,
  },
  {
    path: "/refer",
    title: "Refer & earn — NoKLock referral rewards",
    description:
      "Share NoKLock: people you refer get a discount on a paid licence and you earn a share — redeemable credit, then instant on-chain USDC once you're an affiliate. Fully on-chain, non-cash to start, no claims.",
    priority: 0.6,
  },
  {
    path: "/crypto-inheritance",
    title: "Crypto inheritance — leave your coins to family without giving up your keys",
    description:
      "How to pass on crypto when you die without a custodian: self-custodial Shamir-split seeds, an on-chain dead-man's switch, soulbound-NFT heirs, and an email path for non-crypto family. Plain answers to the questions people ask.",
    priority: 0.9,
  },
  {
    path: "/compare",
    title: "NoKLock vs Casa, Vault12, Inheriti & Deadhand — crypto inheritance compared",
    description:
      "Honest side-by-side comparisons of NoKLock against the closest crypto-inheritance products. Custody model, inheritance trigger, soulbound record, survives-if-vendor-gone, duress, non-crypto-heir support, pricing.",
    priority: 0.8,
  },
  {
    path: "/compare/casa",
    title: "NoKLock vs Casa — self-custodial vs collaborative-custody inheritance",
    description:
      "NoKLock vs Casa: zero provider keys + an autonomous on-chain dead-man's switch + duress decoy + email heirs, vs Casa's collaborative multisig and Casa-assisted inheritance service. Honest verdict on when to pick which.",
    priority: 0.7,
  },
  {
    path: "/compare/vault12",
    title: "NoKLock vs Vault12 — on-chain inheritance vs app-based social custody",
    description:
      "NoKLock vs Vault12: a public-chain trigger + soulbound NFT record + independent-wallet M-of-N quorum that survives the vendor, vs Vault12's app-mediated Guardian social custody. Honest comparison.",
    priority: 0.7,
  },
  {
    path: "/compare/inheriti",
    title: "NoKLock vs Inheriti — soulbound on-chain inheritance vs hardware sharding",
    description:
      "NoKLock vs Inheriti (Safe Haven): no proprietary hardware, standard ERC-5192 soulbound NFTs + Chainlink trigger + duress + email heirs, vs Inheriti's SmartKey hardware and sharding scheme. Honest verdict.",
    priority: 0.7,
  },
  {
    path: "/compare/deadhand",
    title: "NoKLock vs Deadhand — full inheritance suite vs a bare dead-man's switch",
    description:
      "NoKLock vs Deadhand: independent-heir M-of-N quorum, duress decoy, soulbound record, email heirs and sealed-letter/document vaults, vs Deadhand's minimalist single-beneficiary on-chain switch. Honest comparison.",
    priority: 0.7,
  },
  // 0.X — Daniel 2026-05-31: added content-specific entries for every route
  // that calls useDocumentHead() but had no match in this map. Previously
  // those routes fell through the early-return in useDocumentHead and kept
  // whatever index.html's static meta said (the generic NoKLock tagline).
  {
    path: "/prove-it/math",
    title: "Prove the math — run the NoKLock crypto pipeline live in your browser",
    description:
      "Generate throwaway test data, run the real Argon2id + SLIP-39 Shamir + AEAD + Ed25519-signed manifest pipeline, restore from K shares, verify byte-for-byte round-trip. No mocks, no server, no synthetic data.",
    priority: 0.7,
  },
  {
    path: "/prove-it/airgap",
    title: "Prove the airgap — zero network calls during seed entry, verifiable in DevTools",
    description:
      "Live network-watch terminal alongside four 'test fire' buttons (fetch / Image / WebSocket / sendBeacon). Every browser exfil channel bounces off the firewall in real time. Corroborate against your own DevTools.",
    priority: 0.7,
  },
  {
    path: "/prove-it/noklock-proof",
    title: "Prove the chain runs without us — 6 immutable contracts + Chainlink keeper",
    description:
      "If NoKLock vanished tomorrow, your inheritance still fires. 6 source-verified contracts on Polygon, Chainlink Automation as the dead-man's switch, public-RPC fallback chain. Honest caveats included.",
    priority: 0.7,
  },
  {
    path: "/prove-it/build-matches",
    title: "Prove the build matches the source — runtime hash compare + 5-min reproduce one-liner",
    description:
      "Live build-hash readout, runtime enumeration of every JS/CSS asset the browser actually loaded, and a one-liner to clone-and-build the same dist yourself in 5 minutes. The code you ship matches the code on GitHub.",
    priority: 0.7,
  },
  {
    path: "/prove-it/entropy",
    title: "Prove your shares look like noise — chi-square byte-frequency test on real ciphertext",
    description:
      "Generate real ciphertext + real Shamir shares in your browser, run them through a chi-square byte-frequency test against the critical value for 256 bins. A control column of structured ASCII deliberately fails so the test is visibly wired right.",
    priority: 0.7,
  },
  {
    path: "/prove-it/source",
    title: "Prove the source — read the 9-channel firewall + every Uint8Array we wipe",
    description:
      "Bundled inline source of the 9-channel browser-exfil firewall + PerformanceObserver witness + boot install. Plus the honest JS memory model: every byte we derive from your seed is synchronously .fill(0)'d; the seed string itself can't be wiped (no JS API exists), the firewall is the defense.",
    priority: 0.8,
  },
  {
    path: "/viz/pipeline",
    title: "End-to-end pipeline demo — 8 cryptographic primitives, one continuous animation",
    description:
      "BIP-39 → Argon2id → SLIP-39 Shamir → AEAD → Ed25519-signed manifest → restore from K shares → byte-for-byte round-trip. The same algorithms as the live math proof, run on illustrative data so you can see the shape of the whole process in ~90 seconds.",
    priority: 0.6,
  },
  {
    path: "/manual",
    title: "NoKLock operations manual — owner & next-of-kin runbooks, ops procedures, recovery drills",
    description:
      "End-to-end operations manual for vault owners and next-of-kin: enrolment, heartbeat, recovery, claim, dead-man's switch, live-man's switch, decoy mode, share rotation, test-restore drills. The full procedural reference.",
    priority: 0.5,
  },
  {
    path: "/heir",
    title: "Next-of-kin guide — what to do when you're notified of an inheritance claim",
    description:
      "Plain-language walkthrough for designated heirs: how the soulbound NFT works, how the claim window runs, the grace period, what to gather, and how to restore the vault — including for non-crypto heirs who have never used a wallet.",
    priority: 0.5,
  },
  {
    path: "/nok-claim",
    title: "Claim your inheritance — next-of-kin claim flow on Polygon",
    description:
      "Connect the heir wallet that holds your soulbound-NFT claim ticket. Walk through verification, the time-locked claim window, and the restore step that hands you the encrypted vault. No custodian; the contracts do this on-chain.",
    priority: 0.4,
  },
  {
    path: "/recovery",
    title: "Vault recovery — restore a NoKLock vault on any browser",
    description:
      "Self-recovery flow: drop in any K of your encrypted Shamir shares + your master password, the browser reconstructs the original seed phrase / sealed letter / document. Works on any device; no signup, no login, no server round-trip.",
    priority: 0.6,
  },
  {
    path: "/corporate",
    title: "Asserro — NoKLock Enterprise for businesses, treasuries and DAOs",
    description:
      "The enterprise tier of NoKLock — multi-signer vaults, org-managed share locations, audit-log export, treasury continuity, regulated-custody integrations, optional ESG/DPP cross-links. Asserro is sold separately.",
    priority: 0.5,
  },
  {
    path: "/whitelabel",
    title: "NoKLock white-label — embed self-custodial inheritance in your product",
    description:
      "White-label the NoKLock vault + inheritance flow under your own brand. Polygon-rooted, source-verifiable, BUSL-1.1. For wallets, exchanges, custodians and fintechs that want inheritance without becoming the custodian.",
    priority: 0.5,
  },
  {
    path: "/download",
    title: "Get the NoKLock app — Android (Google Play) & iOS (Add to Home Screen)",
    description:
      "Install NoKLock on your phone: download the Android app from Google Play, or on iOS open noklock.app in Safari and Add to Home Screen for a fullscreen, auto-updating home-screen app.",
    priority: 0.6,
  },
];

export function seoForPath(path: string): RouteSeo | undefined {
  return ROUTE_SEO.find((r) => r.path === path);
}

function setMeta(attr: "name" | "property", key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Per-route document head. Sets title, description, canonical and the OG/
 * Twitter title+description+url for the current route. The values are baked
 * into the static HTML by the build-time prerender so non-JS crawlers and
 * AI bots see the right per-page metadata.
 *
 * 2026-06-03 SEO fix (Daniel — Google Search Console "Alternative page with
 * proper canonical tag" warning on /info?tab=*): when the current URL has a
 * preserved query param (?tab= on /info), include it in the canonical so each
 * tab variant can be indexed as its own page (better targeting for "noklock
 * architecture" / "noklock contracts" / "noklock compliance" queries).
 */
const CANONICAL_PRESERVED_QUERY_PARAMS: Readonly<Record<string, readonly string[]>> = {
  "/info": ["tab"],
};

function canonicalSuffixForPath(path: string): string {
  const preserved = CANONICAL_PRESERVED_QUERY_PARAMS[path];
  if (!preserved || typeof window === "undefined") return "";
  const current = new URLSearchParams(window.location.search);
  const out = new URLSearchParams();
  for (const key of preserved) {
    const v = current.get(key);
    if (v) out.set(key, v);
  }
  const qs = out.toString();
  return qs ? `?${qs}` : "";
}

export function useDocumentHead(path: string): void {
  useEffect(() => {
    const seo = seoForPath(path);
    if (!seo) return;
    const url = `${SITE_ORIGIN}${path === "/" ? "" : path}${canonicalSuffixForPath(path)}`;
    document.title = seo.title;
    setMeta("name", "description", seo.description);
    setLink("canonical", url);
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.description);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.description);
  }, [path]);
}
