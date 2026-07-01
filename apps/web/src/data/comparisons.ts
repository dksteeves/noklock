// @version 0.4.0 @date 2026-06-05
// 0.4.0 — Daniel 2026-06-05 evening: SEVEN new entries (ledger-recover,
//         nunchuk, unchained-inheritance, zengo, tangem, sarcophagus-dms,
//         bitkey) added after the `managed` entry. All use the locked
//         SUPERSET positioning per feedback_noklock_positioning: NoKLock
//         is STORE + RESTORE + OPTIONAL INHERITANCE; competitor verdicts
//         lead with "they do X; NoKLock does X differently AND adds Y."
//         Two slug-collision avoidances: Unchained Capital's collaborative-
//         multisig entry stays as 'unchained'; the new concierge-inheritance
//         angle is `unchained-inheritance`. Sarcophagus's Arweave angle
//         stays as 'sarcophagus'; the pure DMS angle is `sarcophagus-dms`.
//         AskAnAI dropdown now has matching slugs for every competitor it
//         lists. deviceTied dim populated for the SE/StrongBox/proprietary-
//         hardware entries (Ledger Recover, ZenGo, Tangem, Bitkey,
//         Unchained-Inheritance, Nunchuk partial). Adversarial verify ran
//         in workflow `wgan32xla` and approved with no critical concerns.
// @version 0.3.0 @date 2026-06-05
// 0.3.0 — Daniel 2026-06-05: NEW "Single-device key lock" dimension
//         (`deviceTied`) added between `survives` and `quorum`. Captures the
//         Secure Enclave / StrongBox / TPM / proprietary-hardware tie that
//         several competitors carry. NoKLock's distributed-shares model
//         answers: no single device — phone, laptop, hardware wallet —
//         holds the recoverable seed. Hardware Secure-Element keys are not
//         exportable from the chip BY DESIGN (that's what makes them
//         secure) — which means a seed kept inside SE is recoverable from
//         that one device OR NOT AT ALL. NoKLock's Argon2id + Shamir 3-of-5
//         + AEAD over distributed providers means: lose any one device,
//         download the K shares to ANY new device, recover the seed. The
//         row is populated only on competitors where the device-tie is a
//         documented part of their model (Vault12 app, Casa app + Casa
//         shard, Inheriti SmartKey); others default to "—" (not enough
//         public evidence to make a claim).
// @version 0.2.0 @date 2026-06-02
// 0.2.0 — Competitors-tab reorg (managed-wallet-competitors-tab-reorg-20260602.md
//         + positioning-realignment-brief-20260602.md). Expanded Category A
//         (Crypto inheritance) from 4 → 8 entries: added Coincover, Unchained
//         Capital Vault, Sarcophagus, Heir. Added Category B (Digital legacy &
//         post-mortem): Everplans, Trustworthy, GoodTrust, AfterVault, Cake,
//         Lantern, Inalienable, Yellow Brick (8 entries). Added Comparison
//         `category` field ("crypto-inheritance" | "digital-legacy"). Category
//         C (password managers) DELIBERATELY OMITTED per Daniel's realignment
//         brief — password managers are COMPLEMENTS, not competitors, and are
//         surfaced as a "Complementary tools" section in CompetitorTable.tsx
//         rather than a competitor row-set. Also added "managed" slug entry
//         (Privy / Web3Auth / Magic / Dynamic / Coinbase SW summary) per spec
//         §10 step 4.
// 0.1.0 — Initial head-to-head comparison data (Daniel 2026-05-22):
//         the two closest top-end competitors (Casa, Vault12) + two lower-end
//         ones (Inheriti, Deadhand). NoKLock's column is from our own verified
//         facts; the competitor columns are conservative readings of each
//         provider's PUBLIC positioning as of 2026-05 — products change, so
//         each page carries a "verify with the provider" note. Honest, not
//         hatchet-job: where a rival is genuinely strong, the verdict says so.

export interface CompareRow {
  readonly dim: string;
  readonly noklock: string;
  readonly them: string;
}

export type CompareCategory = "crypto-inheritance" | "digital-legacy" | "managed-wallet";

export interface Comparison {
  readonly slug: string;
  readonly name: string;          // competitor name
  readonly tier: "top" | "low";
  readonly category: CompareCategory;  // 2026-06-02: A=crypto-inheritance, B=digital-legacy, managed-wallet=adjacent
  readonly tagline: string;       // one-line "what they are"
  readonly verdict: string;       // honest summary — when to pick which
  readonly rows: readonly CompareRow[];
  readonly cost: {
    readonly model: "annual" | "onetime";
    readonly annual?: number;     // USD/yr (annual model)
    readonly oneTime?: number;    // USD one-time (onetime model; 0 = free)
    readonly label: string;       // e.g. "$250 / yr" or "~$40 one-time"
    readonly note: string;        // honest framing of the cost-over-time read
  };
}

// NoKLock anchor for the cost-over-time table: Lifetime Premium, paid ONCE
// (founder price). Regular is $799. Lifetime never renews.
export const NOKLOCK_LIFETIME_ONCE = 499;

const NK = {
  custody: "Self-custodial — never holds your keys, shares, or data",
  trigger: "Autonomous on-chain dead-man's switch (Chainlink), proof-of-life",
  soulbound: "Yes — ERC-5192 soulbound NFTs, one per heir role",
  survives: "Yes — recovery is client-side, inheritance runs on Polygon",
  deviceTied: "No — seed lives in Argon2id-wrapped Shamir shares (3-of-5) distributed across providers you pick. Lose any one device, recover from the remaining shares on a fresh device. No Secure-Element lock-in.",
  quorum: "Yes — M-of-N from independent wallets (up to 5-of-9)",
  duress: "Yes — duress decoy vault (Premium)",
  nonCrypto: "Yes — Hybrid-E lets a non-crypto heir inherit by email",
  kyc: "None",
  runs: "Polygon — public + source-verified",
  pricing: "USDC on Polygon · Free tier · lifetime options · founder pricing",
  verify: "Contracts source-verified on PolygonScan; open crypto core",
  referral: "Yes — on-chain 10% / 10%, paid automatically",
} as const;

function rows(them: Partial<Record<keyof typeof NK, string>>): CompareRow[] {
  const order: (keyof typeof NK)[] = [
    "custody", "trigger", "soulbound", "survives", "deviceTied", "quorum", "duress",
    "nonCrypto", "kyc", "runs", "pricing", "verify", "referral",
  ];
  const labels: Record<keyof typeof NK, string> = {
    custody: "Custody model",
    trigger: "Inheritance trigger",
    soulbound: "Soulbound NFT record (ERC-5192)",
    survives: "Works if the company disappears",
    deviceTied: "Single-device key lock (Secure Enclave / StrongBox / proprietary hardware)",
    quorum: "Multi-heir M-of-N quorum",
    duress: "Duress / decoy vault",
    nonCrypto: "Non-crypto heir path",
    kyc: "KYC required",
    runs: "Where it runs",
    pricing: "Pricing model",
    verify: "Open / independently verifiable",
    referral: "On-chain referral rewards",
  };
  return order.map((k) => ({ dim: labels[k], noklock: NK[k], them: them[k] ?? "—" }));
}

export const COMPARISONS: readonly Comparison[] = [
  {
    slug: "casa",
    name: "Casa",
    tier: "top",
    category: "crypto-inheritance",
    tagline: "Premium collaborative-custody multisig with a Casa-assisted inheritance service.",
    cost: { model: "annual", annual: 250, label: "$250 / yr", note: "Casa's inheritance is a perpetual annual subscription. NoKLock Lifetime is paid once — over a normal lifetime that's a different category, not 'a bit cheaper'." },
    verdict:
      "Casa is a genuinely strong, white-glove product — if you want a human concierge, multi-key multisig, and don't mind Casa co-holding a key and an annual subscription, it's credible and well-run. Pick NoKLock instead if you want zero provider keys, an autonomous on-chain trigger (no service to run the handover), duress protection, an email path for non-crypto heirs, and something that keeps working even if the company shuts down.",
    rows: rows({
      custody: "Collaborative multisig — Casa co-holds a key",
      trigger: "Casa-assisted inheritance process (service-mediated, not autonomous on-chain)",
      soulbound: "No",
      survives: "Your keys persist, but the inheritance hand-over is a Casa-run service",
      deviceTied: "Yes — multisig setup pairs hardware wallets (Ledger / Trezor) with the Casa app; lose a device, follow Casa's recovery process tied to that specific device profile.",
      quorum: "Multisig + key-shard recovery via Casa; not an independent-heir M-of-N",
      duress: "No",
      nonCrypto: "Heir works through Casa; no crypto-free email rebind",
      kyc: "Account + some identity",
      runs: "BTC + ETH, service-mediated",
      pricing: "Subscription, roughly $250–$2,100/yr by tier",
      verify: "Proprietary service",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "vault12",
    name: "Vault12",
    tier: "top",
    category: "crypto-inheritance",
    tagline: "App-based 'social custody' — your Guardians hold encrypted shares; a beneficiary inherits via the app.",
    cost: { model: "annual", annual: 365, label: "$365 / yr", note: "Vault12 is a perpetual annual subscription. NoKLock Lifetime is paid once and never renews." },
    verdict:
      "Vault12 popularised social-custody inheritance and the Guardian model is solid, no-KYC, and approachable. The trade-off is that the whole flow lives inside the Vault12 app and infrastructure. NoKLock is the pick if you want the trigger and the record on a public chain (so it survives the vendor), an independent-wallet M-of-N quorum, duress protection, and a soulbound on-chain inheritance record anyone can verify.",
    rows: rows({
      custody: "Social custody — Guardians hold encrypted shares via the Vault12 app",
      trigger: "App-mediated inheritance (beneficiary + Guardians)",
      soulbound: "No",
      survives: "Tied to the Vault12 app + infrastructure",
      deviceTied: "Vault12 markets Secure Enclave / StrongBox wrap on the device that holds the local Vault. Guardian apps each carry shares on their devices too — recovery flow lives in the device-installed app on every leg.",
      quorum: "Guardian quorum, app-mediated",
      duress: "No",
      nonCrypto: "Beneficiary still needs the Vault12 app",
      kyc: "No KYC",
      runs: "Vault12 network (no public-chain trigger)",
      pricing: "Subscription, roughly $365/yr",
      verify: "Proprietary app",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "inheriti",
    name: "Inheriti (Safe Haven)",
    tier: "low",
    category: "crypto-inheritance",
    tagline: "Decentralised digital-inheritance using a hardware SmartKey + secret-sharding.",
    cost: { model: "onetime", oneTime: 40, label: "~$40 one-time", note: "Honest read: Inheriti is cheaper up-front — cost isn't the story here. NoKLock costs more because it does materially more (independent-heir M-of-N quorum, duress decoy, soulbound on-chain record, email path for non-crypto heirs) and needs no proprietary hardware." },
    verdict:
      "Inheriti is one of the few genuinely decentralised inheritance products and the one-time pricing is attractive. It leans on its own hardware (SmartKey) and sharding scheme, which adds setup friction and a dependency on that ecosystem. NoKLock needs no proprietary hardware, uses a standard soulbound NFT + Chainlink trigger, adds duress protection and an M-of-N independent-heir quorum, and gives non-crypto heirs an email path.",
    rows: rows({
      custody: "Self-custodial; SmartKey hardware + secret shards",
      trigger: "Validator/device-based release",
      soulbound: "No (its own sharding scheme)",
      survives: "Depends on the Safe Haven / Inheriti ecosystem + hardware",
      deviceTied: "Yes — proprietary SmartKey hardware required for setup and recovery. Lose the SmartKey, replacement runs through the Safe Haven ecosystem.",
      quorum: "Multi-validator release",
      duress: "No",
      nonCrypto: "Heir setup + the hardware/app required",
      kyc: "No KYC",
      runs: "Multi-chain",
      pricing: "One-time plans (roughly $40+)",
      verify: "Proprietary scheme",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "deadhand",
    name: "Deadhand",
    tier: "low",
    category: "crypto-inheritance",
    tagline: "A lightweight on-chain dead-man's switch for crypto.",
    cost: { model: "onetime", oneTime: 0, label: "free / low one-time", note: "Honest read: Deadhand is the cheapest — free or a small one-time fee. NoKLock isn't competing on price here; it's the full inheritance suite (quorum, duress, soulbound record, email heirs, document vaults) versus a bare switch." },
    verdict:
      "Deadhand is the minimalist option — a straightforward on-chain dead-man's switch, often free or low-cost. If you just want a single beneficiary and a timer, it does that. NoKLock is the step up when inheritance actually matters: an independent-heir M-of-N quorum (not one beneficiary), duress protection, a soulbound on-chain record, an email path for non-crypto heirs, sealed-letter/document/image vaults, and a tested, source-verified contract suite.",
    rows: rows({
      custody: "Self-custodial dead-man's switch",
      trigger: "On-chain dead-man's switch (simpler)",
      soulbound: "No",
      survives: "On-chain switch, but minimal heir tooling",
      quorum: "Typically a single beneficiary; no independent M-of-N",
      duress: "No",
      nonCrypto: "No crypto-free heir path",
      kyc: "No KYC",
      runs: "Ethereum / EVM",
      pricing: "Free / low one-time",
      verify: "Varies",
      referral: "No on-chain referral",
    }),
  },
  // ------------------------------------------------------------------
  // Category A expansion (2026-06-02) — Coincover, Unchained Capital
  // Vault, Sarcophagus, Heir. Anchored to public May/June-2026 product
  // pages (coincover.com, unchained.com, sarco.io, heir.com).
  // ------------------------------------------------------------------
  {
    slug: "coincover",
    name: "Coincover",
    tier: "top",
    category: "crypto-inheritance",
    tagline: "Custodial insurance + recovery shard bundled with partner wallets — claims-based heir handover.",
    cost: { model: "annual", annual: 200, label: "~$200 / yr (bundled w/ partner wallets)", note: "Coincover sells through partner wallets as a recurring add-on. NoKLock Lifetime is paid once and never renews." },
    verdict:
      "Coincover is the right pick if you want an insurance-backed claims path through a regulated service and you're happy with a custodial recovery shard sitting on Coincover's infrastructure. Pick NoKLock if you don't want a third party able to touch a key, want an autonomous on-chain trigger instead of a claims-process, and want the system to keep working if the vendor disappears.",
    rows: rows({
      custody: "Custodial — Coincover holds a recovery shard",
      trigger: "Manual insurance claim, vendor-mediated",
      soulbound: "No",
      survives: "Service-mediated — depends on Coincover staying live",
      quorum: "No independent-heir M-of-N",
      duress: "No",
      nonCrypto: "Claims process — partial heir path",
      kyc: "Yes (insurance underwriting)",
      runs: "Coincover infrastructure + partner-wallet networks",
      pricing: "Bundled w/ partner wallets, roughly $200/yr",
      verify: "Proprietary service",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "unchained",
    name: "Unchained Capital Vault",
    tier: "top",
    category: "crypto-inheritance",
    tagline: "Collaborative multisig vault for Bitcoin with a legal-coordinated inheritance process.",
    cost: { model: "annual", annual: 500, label: "~$500 / yr", note: "Unchained Vault is a perpetual annual subscription scaled by vault size + legal coordination. NoKLock Lifetime is one payment." },
    verdict:
      "Unchained is excellent for high-net-worth Bitcoiners who want collaborative multisig, a regulated US counterparty, and lawyers in the loop. NoKLock is the choice when you want an autonomous on-chain trigger that does not depend on legal coordination, an independent-heir M-of-N quorum, duress protection, and a non-crypto heir path by email.",
    rows: rows({
      custody: "Collaborative multisig — Unchained co-holds a key",
      trigger: "Manual — legal + multisig coordination",
      soulbound: "No",
      survives: "Keys persist; the inheritance hand-over is a vendor + legal service",
      quorum: "Multisig coordinated through Unchained; not an independent-heir M-of-N",
      duress: "No",
      nonCrypto: "Heir works through Unchained + lawyers",
      kyc: "Yes",
      runs: "BTC, US-regulated",
      pricing: "Subscription, roughly $500/yr",
      verify: "Proprietary service",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "sarcophagus",
    name: "Sarcophagus",
    tier: "low",
    category: "crypto-inheritance",
    tagline: "Decentralised dead-man's switch using Arweave + Ethereum and an 'archaeologist' resharding network.",
    cost: { model: "onetime", oneTime: 0, label: "ETH gas only", note: "Sarcophagus charges ETH gas + a small archaeologist fee per resharding cycle. NoKLock Lifetime is a single Polygon mint." },
    verdict:
      "Sarcophagus is genuinely decentralised, no-KYC, and the Arweave-anchored architecture is interesting. The trade-off is that you (the owner) have to keep re-signing to extend the timer, and the heir tooling is sparse. NoKLock is the choice for a softer owner UX (Chainlink-driven dead-man's switch, no re-sign ritual), a soulbound ERC-5192 inheritance record, duress protection, an M-of-N quorum, and an email path for non-crypto heirs.",
    rows: rows({
      custody: "Self-custodial — Arweave + Ethereum",
      trigger: "Re-sign required to keep the switch alive",
      soulbound: "No",
      survives: "Yes — Arweave + Ethereum, vendor-independent",
      quorum: "Archaeologist resharding network",
      duress: "No",
      nonCrypto: "No crypto-free heir path",
      kyc: "No",
      runs: "Arweave + Ethereum",
      pricing: "ETH gas + small archaeologist fees",
      verify: "Open contracts on Ethereum",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "heir",
    name: "Heir",
    tier: "low",
    category: "crypto-inheritance",
    tagline: "Closed-beta crypto-inheritance product with Web3Auth login and email beneficiaries.",
    cost: { model: "annual", annual: 0, label: "TBD (closed beta 2026)", note: "Heir's pricing is not yet public. Treat the numbers as placeholder until they launch openly." },
    verdict:
      "Heir is the closest competitor on the 'managed-wallet + inheritance' axis — Web3Auth keyless login plus an email beneficiary path is a real combination. Pick NoKLock if you want an autonomous on-chain trigger (not partial), a soulbound ERC-5192 record, duress decoy, M-of-N independent-heir quorum, and a product that's been live + verifiable since 2026-05.",
    rows: rows({
      custody: "Partial — Web3Auth keyless custody",
      trigger: "Partial — closed-beta inheritance flow",
      soulbound: "No",
      survives: "Partial — vendor + Web3Auth infrastructure",
      quorum: "No independent-heir M-of-N",
      duress: "No",
      nonCrypto: "Email beneficiary path",
      kyc: "TBD",
      runs: "TBD (closed beta)",
      pricing: "Not yet public",
      verify: "Proprietary",
      referral: "No on-chain referral",
    }),
  },
  // ------------------------------------------------------------------
  // Category B (2026-06-02) — Digital legacy & post-mortem. Anchored to
  // public 2026 pricing pages: everplans.com, trustworthy.com,
  // mygoodtrust.com, aftervault.com, joincake.com, lanternlegacy.com,
  // inalienable.com, yellowbrickwills.com. None of these handle crypto,
  // self-custody, or on-chain triggers — that is the whole point of
  // putting them in their own category.
  // ------------------------------------------------------------------
  {
    slug: "everplans",
    name: "Everplans",
    tier: "top",
    category: "digital-legacy",
    tagline: "Subscription estate-document vault with named deputies who unlock items after death.",
    cost: { model: "annual", annual: 75, label: "$75 / yr", note: "Everplans is a perpetual annual subscription. NoKLock Lifetime is paid once." },
    verdict:
      "Everplans is a competent estate-document organiser — wills, insurance, contacts, instructions. It handles documents and deputies well. It does not handle crypto, on-chain triggers, or self-custody. NoKLock is the bridge: same document + deputy story PLUS the seed phrase, the on-chain inheritance trigger, and a managed-wallet path so a non-crypto heir can actually receive the crypto.",
    rows: rows({
      custody: "Not applicable — document vault",
      trigger: "Manual deputies",
      soulbound: "No",
      survives: "Everplans-hosted — vendor-dependent",
      quorum: "No",
      duress: "No",
      nonCrypto: "Yes — deputies",
      kyc: "No",
      runs: "Everplans SaaS",
      pricing: "Subscription, roughly $75/yr",
      verify: "Proprietary SaaS",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "trustworthy",
    name: "Trustworthy",
    tier: "top",
    category: "digital-legacy",
    tagline: "Family-operating-system document vault with collaborators and life-event playbooks.",
    cost: { model: "annual", annual: 120, label: "$120 / yr (Family)", note: "Trustworthy Family is an annual subscription. NoKLock Lifetime is paid once." },
    verdict:
      "Trustworthy is a beautifully-designed family operating system for documents, contacts, and life events. It's a real product and a competent organiser. It does not handle crypto or on-chain inheritance. NoKLock complements it: store crypto seeds, sealed letters, and on-chain trigger here, keep your family docs there if you already use it.",
    rows: rows({
      custody: "Not applicable — document vault",
      trigger: "Manual collaborators",
      soulbound: "No",
      survives: "Trustworthy-hosted — vendor-dependent",
      quorum: "No",
      duress: "No",
      nonCrypto: "Yes — collaborators",
      kyc: "No",
      runs: "Trustworthy SaaS",
      pricing: "Subscription, roughly $120/yr (Family)",
      verify: "Proprietary SaaS",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "goodtrust",
    name: "GoodTrust",
    tier: "low",
    category: "digital-legacy",
    tagline: "Digital-legacy + after-death messaging + memorial pages with named Trusted Contacts.",
    cost: { model: "annual", annual: 39, label: "$39 / yr", note: "GoodTrust is a low-cost annual subscription. NoKLock Lifetime is paid once." },
    verdict:
      "GoodTrust is approachable and inexpensive, with a thoughtful 'message after death' feature plus memorial pages. It handles social-account memorialisation reasonably well. It does not handle crypto or any on-chain inheritance. NoKLock is the right pick when crypto, soulbound on-chain records, or a real inheritance trigger matter.",
    rows: rows({
      custody: "Not applicable — message + memorial service",
      trigger: "Partial — after-death messaging + memorial",
      soulbound: "No",
      survives: "GoodTrust-hosted — vendor-dependent",
      quorum: "No",
      duress: "No",
      nonCrypto: "Yes — Trusted Contacts",
      kyc: "No",
      runs: "GoodTrust SaaS",
      pricing: "Subscription, roughly $39/yr",
      verify: "Proprietary SaaS",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "aftervault",
    name: "AfterVault",
    tier: "low",
    category: "digital-legacy",
    tagline: "Document + credentials vault with executor unlock after a verified-death event.",
    cost: { model: "annual", annual: 50, label: "$50 / yr", note: "AfterVault is an annual subscription. NoKLock Lifetime is paid once." },
    verdict:
      "AfterVault leans further into 'unlock after death' than the pure document-vault crowd, with an executor-unlock mechanic. Still vendor-mediated, still no crypto. NoKLock turns the same idea into an autonomous on-chain event with a soulbound record and an M-of-N heir quorum.",
    rows: rows({
      custody: "Not applicable — credential vault",
      trigger: "Partial — executor unlock",
      soulbound: "No",
      survives: "AfterVault-hosted — vendor-dependent",
      quorum: "No",
      duress: "No",
      nonCrypto: "Yes — executor",
      kyc: "No",
      runs: "AfterVault SaaS",
      pricing: "Subscription, roughly $50/yr",
      verify: "Proprietary SaaS",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "cake",
    name: "Cake",
    tier: "low",
    category: "digital-legacy",
    tagline: "Free end-of-life planning checklist with funeral-preference capture and paid add-ons.",
    cost: { model: "onetime", oneTime: 0, label: "free (paid add-ons)", note: "Cake's core checklist is free. NoKLock Lifetime is paid once but covers crypto inheritance Cake doesn't." },
    verdict:
      "Cake is a friendly, free planning checklist with paid services around it. It handles intention-capture and funeral preferences well. It is not an inheritance product and has no crypto path. NoKLock sits alongside it: use Cake to plan, use NoKLock to actually execute the secret-and-key handover on-chain.",
    rows: rows({
      custody: "Not applicable — planning checklist",
      trigger: "No — planning only",
      soulbound: "No",
      survives: "Cake-hosted — vendor-dependent",
      quorum: "No",
      duress: "No",
      nonCrypto: "Yes",
      kyc: "No",
      runs: "Cake SaaS",
      pricing: "Free + paid add-ons",
      verify: "Proprietary SaaS",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "lantern",
    name: "Lantern",
    tier: "low",
    category: "digital-legacy",
    tagline: "End-of-life planning + deputies, free tier with a low-cost Premium.",
    cost: { model: "annual", annual: 27, label: "free (Premium ~$27/yr)", note: "Lantern's core is free; Premium is a low annual fee. NoKLock Lifetime is paid once and covers the crypto + on-chain inheritance gap Lantern doesn't." },
    verdict:
      "Lantern is a thoughtful end-of-life planning tool with deputies and a free tier. It handles planning and deputy-notification well. It does not handle crypto, on-chain triggers, or any actual asset transfer. NoKLock is the complement that closes the crypto + soulbound-record gap.",
    rows: rows({
      custody: "Not applicable — planning + deputies",
      trigger: "No — planning only",
      soulbound: "No",
      survives: "Lantern-hosted — vendor-dependent",
      quorum: "No",
      duress: "No",
      nonCrypto: "Yes — deputies",
      kyc: "No",
      runs: "Lantern SaaS",
      pricing: "Free or roughly $27/yr Premium",
      verify: "Proprietary SaaS",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "inalienable",
    name: "Inalienable",
    tier: "low",
    category: "digital-legacy",
    tagline: "Document + credentials vault with a verified-death unlock for named heirs.",
    cost: { model: "annual", annual: 99, label: "$99 / yr", note: "Inalienable is an annual subscription. NoKLock Lifetime is paid once." },
    verdict:
      "Inalienable is closer in spirit to NoKLock than most digital-legacy peers — it explicitly builds around a verified-death unlock event. It's still vendor-mediated, still no crypto, still no autonomous on-chain trigger. NoKLock does the same intent with on-chain machinery and crypto support.",
    rows: rows({
      custody: "Not applicable — credential vault",
      trigger: "Partial — verified-death unlock",
      soulbound: "No",
      survives: "Inalienable-hosted — vendor-dependent",
      quorum: "No",
      duress: "No",
      nonCrypto: "Yes",
      kyc: "No",
      runs: "Inalienable SaaS",
      pricing: "Subscription, roughly $99/yr",
      verify: "Proprietary SaaS",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "yellow-brick",
    name: "Yellow Brick (Wills)",
    tier: "low",
    category: "digital-legacy",
    tagline: "Online will-drafting service — a legal document, not an inheritance system.",
    cost: { model: "onetime", oneTime: 150, label: "one-time will fee", note: "Yellow Brick is a one-time legal document fee. NoKLock Lifetime is paid once and is the technical execution layer the will assumes exists." },
    verdict:
      "Yellow Brick (and the broader online-will category) produces a legal document. Wills are necessary; they are not an inheritance MECHANISM. Without something like NoKLock, the will tells the executor that crypto exists somewhere but provides no way to actually reach it. NoKLock + a will is the right pairing.",
    rows: rows({
      custody: "Not applicable — legal document",
      trigger: "No — legal document only",
      soulbound: "No",
      survives: "Not applicable — the document is yours",
      quorum: "No",
      duress: "No",
      nonCrypto: "Yes",
      kyc: "Identity verification",
      runs: "Legal jurisdiction",
      pricing: "One-time will fee",
      verify: "Legal instrument",
      referral: "No on-chain referral",
    }),
  },
  // ------------------------------------------------------------------
  // Managed-wallet adjacency (2026-06-02) — Privy / Web3Auth / Magic /
  // Dynamic / Coinbase Smart Wallet. These are infrastructure providers
  // for keyless / passkey wallets; they are the toolkit NoKLock — Managed
  // wraps INSIDE an inheritance product. Listed here so the
  // /compare/managed page exists per spec §10 step 4.
  // ------------------------------------------------------------------
  {
    slug: "managed",
    name: "Managed-wallet providers (Privy / Web3Auth / Magic / Dynamic / Coinbase Smart Wallet)",
    tier: "top",
    category: "managed-wallet",
    tagline: "Passkey / MPC / embedded-wallet infrastructure — the building blocks NoKLock — Managed will wrap (with NL-2) in an inheritance product.",
    cost: { model: "annual", annual: 0, label: "infra-priced (per-MAU)", note: "Managed-wallet providers price per monthly active user to app developers. NoKLock — Managed is the consumer product built on top — same Free / Standard / Premium tiers as self-custody (annual + lifetime SKUs) — and adds the inheritance layer none of them ship." },
    verdict:
      "Privy, Web3Auth, Magic, Dynamic, and Coinbase Smart Wallet are excellent at one thing: removing wallet-setup friction. None of them ships an inheritance feature. NoKLock — Managed (an optional mode arriving with NL-2 — not yet live) will sit on top of one of these providers (Privy) AND add the autonomous on-chain Chainlink trigger, soulbound ERC-5192 heir record, duress decoy, and M-of-N quorum that turn 'easy to log in' into 'safe to leave behind'.",
    rows: rows({
      custody: "Partial — passkey / MPC custody (exportable)",
      trigger: "No — no inheritance feature ships in any of them",
      soulbound: "No",
      survives: "Partial — depends on provider + recovery export path",
      quorum: "No",
      duress: "No",
      nonCrypto: "Yes — passkey or email login, no wallet setup",
      kyc: "Varies by provider",
      runs: "Provider infrastructure + selected chain(s)",
      pricing: "Per-MAU infra fees (developer-facing)",
      verify: "Proprietary infra",
      referral: "No on-chain referral",
    }),
  },
  // ------------------------------------------------------------------
  // SUPERSET round 2 (2026-06-05) — seven more rivals surfaced in the
  // AskAnAI dropdown but missing from COMPARISONS. Framing is locked
  // store+restore-first: NoKLock covers the rival's job AND adds more.
  // Public-positioning numbers are conservative reads of each vendor's
  // public pages as of May/June 2026 — products change, COMPARE_NOTE
  // applies. Unchained Capital and Sarcophagus already exist above
  // under their multisig + Arweave-dead-man angles; these two new
  // entries use distinct slugs (unchained-inheritance,
  // sarcophagus-dms) for the concierge-inheritance and pure
  // dead-man-switch angles surfaced in the dropdown.
  // ------------------------------------------------------------------
  {
    slug: "ledger-recover",
    name: "Ledger Recover",
    tier: "low",
    category: "crypto-inheritance",
    tagline: "ID-verified seed-recovery subscription bolted onto a Ledger hardware wallet.",
    cost: { model: "annual", annual: 120, label: "~$9.99 / mo (~$120 / yr)", note: "Ledger Recover is a perpetual monthly subscription that only works while you keep paying AND keep a compatible Ledger device. NoKLock Lifetime is paid once, no device lock-in, never renews." },
    verdict:
      "Ledger Recover does owner-side seed recovery — encrypts your seed into three shards held by Coincover, Ledger, and EscrowTech, gated by government-ID verification. NoKLock does the same job (store + restore your seed) differently — Argon2id + Shamir 3-of-5 across providers you pick, no ID, no custodial shards, no device requirement — AND adds an optional inheritance layer (autonomous Chainlink trigger, soulbound ERC-5192 record, M-of-N heir quorum, duress decoy, email path for non-crypto heirs) that Recover doesn't attempt.",
    rows: rows({
      custody: "Custodial recovery — three ID-gated shards held by Coincover, Ledger, EscrowTech",
      trigger: "Owner-only ID verification; no inheritance flow",
      soulbound: "No",
      survives: "Subscription + Ledger device + the three custodians must remain live",
      deviceTied: "Yes — requires a compatible Ledger hardware wallet (Nano X / Stax / Flex). Setup and recovery flow through that device's Secure Element.",
      quorum: "Custodial 2-of-3 shard reassembly by the providers, not an independent-heir M-of-N",
      duress: "No",
      nonCrypto: "No — heir would still need a Ledger + government ID matching the owner",
      kyc: "Mandatory — government-ID verification by Onfido / Veridas",
      runs: "Ledger + partner custodian infrastructure",
      pricing: "~$9.99/mo perpetual",
      verify: "Closed-source recovery service; SE firmware proprietary",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "nunchuk",
    name: "Nunchuk",
    tier: "top",
    category: "crypto-inheritance",
    tagline: "Collaborative-multisig Bitcoin wallet with inheritance via key sharding to trustees.",
    cost: { model: "annual", annual: 150, label: "~$150 / yr (Honey Badger Premier)", note: "Nunchuk's inheritance + assisted multisig sit behind a perpetual annual subscription. NoKLock Lifetime is paid once." },
    verdict:
      "Nunchuk does collaborative-multisig wallet management AND inheritance via sharded backup keys handed to trustees — a legitimate Bitcoin-native approach. NoKLock does the same store+restore+inheritance job differently — Shamir over your seed (works for any chain, not just BTC) plus an autonomous on-chain Chainlink trigger and a soulbound ERC-5192 inheritance record — AND adds duress decoy, an independent-wallet M-of-N quorum, and an email path for non-crypto heirs without forcing the heir to learn multisig signing.",
    rows: rows({
      custody: "Self-custodial Bitcoin multisig + sharded inheritance keys",
      trigger: "Trustee-coordinated key-shard reassembly",
      soulbound: "No",
      survives: "Multisig keys persist; inheritance flow needs the Nunchuk app to coordinate",
      deviceTied: "Partial — relies on the Nunchuk app on each signer + trustee device; lose the device, restore via app from trustee shards",
      quorum: "Multisig quorum among trustees; not an independent-wallet heir M-of-N",
      duress: "No",
      nonCrypto: "Heir still needs to learn multisig signing in the Nunchuk app",
      kyc: "None for self-serve; Honey Badger plan ties to email",
      runs: "Bitcoin only",
      pricing: "Subscription, roughly $150/yr (Premier)",
      verify: "Open-source clients; assisted service proprietary",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "unchained-inheritance",
    name: "Unchained (Concierge Inheritance)",
    tier: "top",
    category: "crypto-inheritance",
    tagline: "Bitcoin-only collaborative-multisig vault with a concierge + legal inheritance protocol.",
    cost: { model: "annual", annual: 500, label: "~$500 / yr + legal", note: "Unchained Inheritance Protocol is bundled with the Vault subscription plus separate legal-coordination fees. NoKLock Lifetime is paid once and never renews." },
    verdict:
      "Unchained does collaborative-multisig storage AND a concierge-assisted inheritance handover with US legal coordination — a high-touch Bitcoin-only product. NoKLock does the same store+restore+inheritance job differently — multi-chain Shamir + Chainlink trigger + soulbound ERC-5192 record, no concierge fees, no jurisdiction-locked legal coordination — AND adds duress decoy, an independent-heir M-of-N quorum, and an email path for non-crypto heirs.",
    rows: rows({
      custody: "Collaborative multisig — Unchained co-holds a key",
      trigger: "Concierge + legal coordination, vendor-mediated",
      soulbound: "No",
      survives: "Multisig keys persist; the handover is a concierge service",
      deviceTied: "Partial — hardware wallets (Ledger / Trezor) paired with Unchained's app; recovery flows tied to those device profiles",
      quorum: "Multisig coordinated through Unchained; not an independent-heir M-of-N",
      duress: "No",
      nonCrypto: "Heir works through Unchained + lawyers",
      kyc: "Yes — US-regulated counterparty",
      runs: "Bitcoin only, US jurisdiction",
      pricing: "Subscription, roughly $500/yr + legal fees",
      verify: "Proprietary concierge service",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "zengo",
    name: "ZenGo",
    tier: "low",
    category: "crypto-inheritance",
    tagline: "MPC-based keyless personal wallet with face-scan recovery and an Inheritance feature.",
    cost: { model: "annual", annual: 130, label: "~$130 / yr (Pro)", note: "ZenGo Pro (Legacy Transfer + Web3 Firewall) is a perpetual annual subscription. NoKLock Lifetime is paid once." },
    verdict:
      "ZenGo does keyless storage + recovery via MPC and face-scan, plus a Legacy Transfer feature that sends the wallet to a named beneficiary after a verification window. NoKLock does the same store+restore+inheritance job differently — Argon2id + Shamir over your real seed (works on any wallet you already own, not just ZenGo's) plus an autonomous on-chain Chainlink trigger and a soulbound ERC-5192 record — AND adds duress decoy, an M-of-N independent-heir quorum, and survives even if the vendor and the device do not.",
    rows: rows({
      custody: "Custodial-ish MPC — one share on your phone, one on ZenGo's servers",
      trigger: "Legacy Transfer (vendor-mediated, single beneficiary)",
      soulbound: "No",
      survives: "Tied to ZenGo's MPC infrastructure and the ZenGo app",
      deviceTied: "Yes — local share lives in the phone's Secure Enclave / StrongBox, paired to your ZenGo account; switching devices runs through ZenGo's recovery + face-scan flow",
      quorum: "2-of-2 MPC with ZenGo; single beneficiary, not an independent-heir M-of-N",
      duress: "No",
      nonCrypto: "Beneficiary must still install ZenGo and complete face-scan",
      kyc: "Email + biometric face-scan",
      runs: "ZenGo MPC infrastructure + multi-chain support",
      pricing: "Subscription, roughly $130/yr Pro",
      verify: "Proprietary MPC service",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "tangem",
    name: "Tangem",
    tier: "low",
    category: "crypto-inheritance",
    tagline: "NFC cold-wallet cards with a multi-card backup scheme — tap to sign, swap to recover.",
    cost: { model: "onetime", oneTime: 70, label: "~$70 one-time (3-card pack)", note: "Tangem is a one-time hardware purchase — honestly cheap. NoKLock Lifetime costs more because it does materially more: inheritance, duress, M-of-N quorum, soulbound record, email path for non-crypto heirs, and doesn't require buying proprietary cards." },
    verdict:
      "Tangem does seed storage + restore beautifully — three NFC cards, no seed phrase to write down, lose one card and the other two restore the wallet. That's a legitimate store+restore product. NoKLock does the same store+restore job differently — Argon2id + Shamir 3-of-5 across providers you already use, no proprietary cards to buy or replace, lose any device recover from the remaining shares — AND adds an optional inheritance layer (Chainlink trigger, soulbound ERC-5192 record, M-of-N heir quorum, duress decoy, email path for non-crypto heirs) that Tangem doesn't ship.",
    rows: rows({
      custody: "Self-custodial — seed lives on the Tangem cards' secure chips",
      trigger: "None — no inheritance feature",
      soulbound: "No",
      survives: "Cards keep working forever; no inheritance hand-over tooling",
      deviceTied: "Yes — proprietary NFC cards with EAL6+ secure chips; seed is non-exportable from the chip BY DESIGN. Lose all cards, lose the wallet.",
      quorum: "Card-set redundancy (typically 2-of-3 cards); not an independent-heir M-of-N",
      duress: "No",
      nonCrypto: "No — heir needs the physical cards and the Tangem app",
      kyc: "None",
      runs: "Tangem hardware + multi-chain app",
      pricing: "~$70 one-time per card pack",
      verify: "Audited firmware; app proprietary",
      referral: "Affiliate code, not on-chain",
    }),
  },
  {
    slug: "sarcophagus-dms",
    name: "Sarcophagus (Dead-Man-Switch)",
    tier: "low",
    category: "crypto-inheritance",
    tagline: "Decentralised dead-man-switch run by an 'archaeologist' network that resharded your encrypted payload.",
    cost: { model: "onetime", oneTime: 0, label: "ETH gas + archaeologist fees", note: "Sarcophagus charges ETH gas + archaeologist fees per resharding cycle. NoKLock Lifetime is a single Polygon mint and the dead-man-switch runs on Chainlink — no per-cycle re-sign payments." },
    verdict:
      "Sarcophagus does the dead-man-switch job in a genuinely decentralised way — Arweave-anchored encrypted payload, an 'archaeologist' network that re-shards on a timer, no vendor lock-in. NoKLock does the same store+restore+inheritance job differently — Argon2id + Shamir distributes the seed across providers you pick (cheaper, faster, no Arweave dependency), and the trigger runs on Chainlink Automation (no owner re-sign ritual) — AND adds a soulbound ERC-5192 record, an M-of-N heir quorum, duress decoy, document/letter/image vaults, and an email path for non-crypto heirs.",
    rows: rows({
      custody: "Self-custodial — Arweave + Ethereum, archaeologist-resharded",
      trigger: "Owner must re-sign on a schedule or the payload releases",
      soulbound: "No",
      survives: "Yes — Arweave + Ethereum, vendor-independent",
      quorum: "Archaeologist resharding network, not an independent-heir M-of-N",
      duress: "No",
      nonCrypto: "No crypto-free heir path",
      kyc: "None",
      runs: "Arweave + Ethereum",
      pricing: "ETH gas + per-cycle archaeologist fees",
      verify: "Open contracts on Ethereum",
      referral: "No on-chain referral",
    }),
  },
  {
    slug: "bitkey",
    name: "Bitkey",
    tier: "top",
    category: "crypto-inheritance",
    tagline: "Block's Bitcoin-only collaborative hardware wallet — 2-of-3 between you, your phone, and Block.",
    cost: { model: "onetime", oneTime: 150, label: "~$150 one-time hardware + free recovery", note: "Bitkey hardware is a one-time purchase; recovery via Block is free at launch. NoKLock Lifetime is paid once and adds an inheritance layer Bitkey hasn't shipped." },
    verdict:
      "Bitkey does store+restore well — 2-of-3 collaborative hardware wallet (you, phone, Block), social-recovery-style restore via Trusted Contacts, Bitcoin-only. NoKLock does the same store+restore job differently — Argon2id + Shamir 3-of-5 over your seed phrase, works on any chain not just BTC, no proprietary hardware required — AND adds an inheritance layer Bitkey doesn't ship (autonomous Chainlink trigger, soulbound ERC-5192 record, M-of-N independent-heir quorum, duress decoy, email path for non-crypto heirs).",
    rows: rows({
      custody: "Collaborative — 2-of-3 between Bitkey hardware, your phone, and Block-held server key",
      trigger: "None — no inheritance feature ships",
      soulbound: "No",
      survives: "Recovery depends on Block remaining live to co-sign the recovery server key",
      deviceTied: "Yes — proprietary Bitkey hardware device + paired phone app. Lose both, recover via Block's server key + Trusted Contacts process.",
      quorum: "2-of-3 (you / phone / Block) and Trusted Contacts recovery; not an independent-heir inheritance M-of-N",
      duress: "No",
      nonCrypto: "No — heir would need the Bitkey hardware + phone pairing",
      kyc: "Email + phone number with Block",
      runs: "Bitcoin only",
      pricing: "~$150 one-time hardware",
      verify: "Open firmware + open server protocol; Block service proprietary",
      referral: "No on-chain referral",
    }),
  },
];

export function comparisonBySlug(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export const COMPARE_NOTE =
  "Comparison based on each provider's public information as of May 2026. Products change — verify current details with each provider before deciding. NoKLock's column is verifiable now on PolygonScan and at /info → Contracts.";
