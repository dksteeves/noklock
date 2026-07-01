// @version 0.1.0 @date 2026-05-22
// Launch-message store for the Admin → Marketing tab (Daniel 2026-05-22).
// Research-backed (current 2025-2026 X best-practice) launch tweets + a short
// playbook. Truthful only — every claim maps to a real NoKLock property.
// The Marketing tab renders each as a card with a "Tweet this ↗" (X compose
// intent, pre-filled) + copy button. Keep links OUT of the tweet body (X
// deboosts link posts) — put the link in the FIRST REPLY.

export interface LaunchMessage {
  readonly id: string;
  readonly angle: string;          // what this tweet is for
  readonly text: string;           // the tweet body (no link, no hashtags)
  readonly hashtags: readonly string[]; // 1–2, appended on compose
  readonly note: string;           // format/usage tip
}

export const LAUNCH_MESSAGES: readonly LaunchMessage[] = [
  {
    id: "problem",
    angle: "The death-anxiety problem (thread starter)",
    text: `What happens to your crypto when you're gone?\n\nNo "forgot password." No support line. No one to call.\n\nIf your heirs don't have your keys, your coins are gone forever.\n\nWe fixed that. 🧵`,
    hashtags: ["#selfcustody", "#cryptoinheritance"],
    note: "Provocative-question hook — opens the launch thread.",
  },
  {
    id: "flagship",
    angle: "Flagship launch announcement",
    text: `Crypto inheritance, finally done right.\n\nNoKLock never holds your keys, shares, or data. Ever.\n\nA soulbound-NFT dead-man's switch on @0xPolygon hands your wallet to your heirs the moment you stop checking in — on-chain, verifiable, no middleman, no probate.`,
    hashtags: ["#selfcustody", "#Polygon"],
    note: "Hero post — attach a how-it-works image; put the link in the first reply.",
  },
  {
    id: "soulbound",
    angle: "Soulbound-NFT novelty (proof)",
    text: `Most "inheritance" products are a company holding your keys and a promise.\n\nNoKLock mints your heir a soulbound NFT (ERC-5192) — an on-chain Activation token that triggers the handover (M-of-N quorum vaults add a Voting token per heir). It can't be sold, moved, or seized.\n\nNon-transferable. Provider-independent. No middleman holding your coins.`,
    hashtags: ["#DeadMansSwitch", "#ERC5192"],
    note: "Contrast + tech proof — great with a short GIF of the flow.",
  },
  {
    id: "survives",
    angle: "\"Survives if we vanish\" trust angle",
    text: `Here's the test for any inheritance product:\n\nWhat if the company disappears tomorrow?\n\nNoKLock keeps working. Your licence, the dead-man's switch (Chainlink Automation) and the soulbound trigger all live on @0xPolygon — not our servers. You can even heartbeat directly on-chain. No NoKLock = your heirs still inherit.`,
    hashtags: ["#selfcustody", "#web3"],
    note: "Strongest differentiator — consider pinning / boosting this one.",
  },
  {
    id: "founder",
    angle: "Founder-cohort scarcity (CTA)",
    text: `The NoKLock founder cohort is capped at 10,000.\n\nNot a marketing number — a hard cap.\n\nEarly self-custody believers, this is your spot. When it's full, it's full.\n\nClaim yours 👇`,
    hashtags: ["#NotYourKeys", "#crypto"],
    note: "Scarcity + CTA — link in the first reply.",
  },
  {
    id: "referral",
    angle: "Referral rewards (incentive)",
    text: `Refer a friend to NoKLock:\n\n→ They get 10% off\n→ You get 10%\n→ Paid automatically, on-chain\n\nNo dashboards to chase. No "pending" payouts. The contract handles it.`,
    hashtags: ["#Polygon", "#DeFi"],
    note: "Value-stack + on-chain proof; bulleted for skimmability.",
  },
  {
    id: "vs-custodial",
    angle: "Comparison to custodial (positioning)",
    text: `Custodial inheritance asks you to trust a company with your keys.\n\nThat's the exact thing self-custody exists to avoid.\n\nNoKLock never touches your keys, shares, or data. The chain enforces the handoff — not us.`,
    hashtags: ["#NotYourKeys", "#selfcustody"],
    note: "Us-vs-them framing; sharpens positioning vs Casa / Vault12 / Ledger Recover.",
  },
  {
    id: "hybrid-e",
    angle: "Hybrid-E / non-crypto heir (accessibility)",
    text: `Your heir doesn't use crypto? Most don't.\n\nNoKLock's Hybrid-E lets a non-crypto heir inherit by email — no seed phrase, no wallet setup, no panic.\n\nSelf-custody for you. Simple for them.`,
    hashtags: ["#cryptoinheritance", "#estateplanning"],
    note: "Objection-handling; bridges to the mainstream / legacy-planning crowd.",
  },
  {
    id: "zero-pii",
    angle: "Zero-PII / privacy (proof)",
    text: `NoKLock collects zero personal data.\n\nNo KYC vault. No name, no address, no "we take your privacy seriously" theater.\n\nThere's no honeypot to leak — because there's nothing to leak.`,
    hashtags: ["#selfcustody", "#web3"],
    note: "Reframes \"no data\" as a security feature.",
  },
  {
    id: "poll",
    angle: "Engagement poll (zero link risk)",
    text: `Honest question: would your family know how to access your crypto if something happened to you?\n\n🔘 Yes, fully\n🔘 Sort of\n🔘 No idea\n🔘 I don't want to think about it`,
    hashtags: ["#selfcustody"],
    note: "Create as a native Poll on X — engagement + market research; no link = max reach.",
  },
  {
    id: "pain-stat",
    angle: "The pain stat (bold hook)",
    text: `Billions in crypto are already lost forever — much of it because no one could inherit it.\n\nLost keys don't have to mean lost legacy.\n\nNoKLock makes inheritance on-chain, self-custodial, and verifiable.`,
    hashtags: ["#cryptoinheritance", "#crypto"],
    note: "Bold problem hook — pair with a striking visual.",
  },
  {
    id: "verify",
    angle: "Don't trust, verify (trust close)",
    text: `Everything NoKLock does is verifiable on @0xPolygon.\n\nThe soulbound NFT, the dead-man's switch, the source-verified contracts, the live state of your inheritance — all on-chain, all auditable by anyone.\n\nDon't trust us. Verify us.`,
    hashtags: ["#Polygon", "#web3"],
    note: "CT-native trust close — link to the contracts in the first reply.",
  },
  {
    id: "prove-it-why",
    angle: "Prove It — run the real crypto yourself (trust)",
    text: `Don't trust a crypto product — make it prove itself.\n\nNoKLock's "Prove It" runs the ACTUAL pipeline — split → encrypt → sign → recover — on throwaway data, live in your browser. No wallet, no signup, nothing saved or uploaded.\n\nWatch the math round-trip back byte-for-byte before you ever trust it with something real.`,
    hashtags: ["#selfcustody", "#crypto"],
    note: "\"Proof, not promises\" — the strongest CT-native trust hook. Link in the FIRST REPLY: noklock.app/prove-it. Killer paired with a screen-recording of the pipeline running.",
  },
  {
    id: "prove-it-quick",
    angle: "Prove It — punchy CTA",
    text: `Most crypto apps say "trust us."\n\nNoKLock says: run our real cryptography yourself, right now, on fake data — and watch it work before you risk a cent.\n\nThat's Prove It. No wallet, no signup. 👇`,
    hashtags: ["#NotYourKeys", "#web3"],
    note: "Short CTA variant of prove-it. Link in the first reply: noklock.app/prove-it.",
  },
  {
    id: "fsm",
    angle: "On-chain finite state machine (deep / builders)",
    text: `Every other crypto-inheritance product tracks your status in a private database you can't see — and that they could flip.\n\nNoKLock is a true on-chain finite state machine: ENROLLED → ALIVE ⇄ DUE-SOON ⇄ IN-GRACE → ACTIVATED → CLAIMED, every transition recorded on @0xPolygon.\n\nAnyone can read which state your inheritance is in straight from a block explorer. No vendor dashboard. No trust required.`,
    hashtags: ["#Polygon", "#web3"],
    note: "Deep / technical — lands with builders and tags @0xPolygon for the novel on-chain-FSM use case. Link to the FSM diagram + 10-row state table in the first reply: noklock.app/info?tab=architecture&sub=technology",
  },
];

export interface HashtagGroup { readonly label: string; readonly tags: readonly string[] }

// Hashtag bank to swap tags on any tweet (Daniel). Best practice: 1–2 per
// tweet, lead with a niche tag, at most one broad tag, woven mid/end.
export const HASHTAG_BANK: readonly HashtagGroup[] = [
  { label: "Niche · high-relevance (lead with one)", tags: ["#selfcustody", "#NotYourKeys", "#cryptoinheritance", "#DeadMansSwitch"] },
  { label: "Ecosystem / mid (good second tag)", tags: ["#Polygon", "#web3", "#DeFi", "#estateplanning", "#ERC5192"] },
  { label: "Broad reach (use sparingly, max one)", tags: ["#Bitcoin", "#BTC", "#crypto", "#Ethereum", "#ETH", "#NFT"] },
];

export interface PlaybookRule { readonly label: string; readonly body: string }

export const LAUNCH_PLAYBOOK: readonly PlaybookRule[] = [
  { label: "Hashtags", body: "1–2 per tweet (3+ cuts reach ~40%). Niche-first (#selfcustody, #NotYourKeys, #cryptoinheritance, #DeadMansSwitch) + at most one broad (#crypto, #Bitcoin, #Polygon). Weave mid/end — never start a tweet with a hashtag." },
  { label: "Links", body: "Keep links OUT of the tweet body — X deboosts link posts on non-Premium accounts. Put the link in the FIRST REPLY (\"how it works 👇\"), or pair an inline link with an image. X Premium materially improves link reach — worth it for launch week." },
  { label: "Best times", body: "Strongest: Wed ~9–10am ET. Core: Tue–Thu 9am–2pm ET. EU overlap 13:00–15:00 CET hits EU + US together (you're Germany-based). Crypto is also active Sat 10am–12pm. Check X Analytics after a week and double down on your own top times." },
  { label: "Cadence", body: "Launch week: 1–3 posts/day, mixed formats (announcement, poll, thread, proof, scarcity). Reply as much as you post — replies are rewarded. Steady-state after: ~1/day + active replies." },
  { label: "Format", body: "Short wins (71–140 chars). One job per tweet. Threads 5–10 (~7) for education — spend 30–40% of effort on the hook. Polls + text-only posts get strong reach and dodge the link penalty. Always attach media when you can." },
  { label: "Launch sequence", body: "Pre (T-7→T-1): teasers / problem-framing / a poll, then a partial reveal, then \"tomorrow.\" Day 0: flagship announcement (9–10am ET) → explainer thread +3–4h → evening scarcity post. T+1→T+7: one angle/day (novelty → trust → referral → Hybrid-E → vs-custodial → scarcity update) + drop social proof as it arrives." },
];
