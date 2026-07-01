// @version 0.9.1 @date 2026-06-08
// 0.9.1 — Daniel 2026-06-08: Closes 3 remaining cloud-only positioning gaps the
//         positioning.test.ts drift-guard flagged (2 hard failures + 1 sister
//         template carrying the same framing). Lines:
//         • cm-every-member-hook (community-mgr paste-in teaser) — "split
//           across YOUR own cloud accounts" → "split across YOUR own storage
//           (local folders or cloud — your call)".
//         • li-free-A-cold-dm (LinkedIn free-tier cold DM) — "split across
//           your own cloud accounts" → "split across storage you pick —
//           local folders or cloud accounts".
//         • cm-email-formal (community-mgr formal email body) — sister
//           template using "split across their own clouds" → "split across
//           storage they pick — local folders or cloud accounts". Caught
//           in the same pass for consistency with the other two.
//         Phrasing borrowed verbatim from the 0.9.0 sweep (lines 291/333).
//         CARDINAL: feedback_noklock_positioning — store + restore primary,
//         cloud is optional.
// @version 0.9.0 @date 2026-06-07
// 0.9.0 — Daniel 2026-06-07: NEW SIMPLE_ROUTE_X_POSTS set (3 tweets,
//         245–273 chars) prepended into X_REFRAME_POSTS between the
//         compare-page flaunt and the device-resilience comparators.
//         Leads with the "three folders beats a sticky note" angle from
//         the Jun 7 simple-vs-max framing across Landing 0.22.0 + Enrol
//         Step B + Pricing FAQ + CryptoInheritance Q. IDs:
//         x-simple-three-folders / x-simple-vs-max / x-simple-already-safer.
//         ALSO softened 6 existing X_REFRAME / TG_REFRAME / REFRAME_TWEETS
//         lines that said "spread to YOUR cloud accounts" → rewrote to
//         "spread across YOUR own storage (local folders or cloud — your
//         call)" so the cloud-mandatory implication is removed. Lines:
//         x-reframe-announce / x-reframe-differentiation / x-reframe-thread
//         tweet 1/ / tg-grp-reframe-selfcustody / tg-grp-reframe-hardware /
//         ref-protect-first-inherit-later. Companion to the BOTH-options
//         locked decision in the Jun 7 handoff §3.13.
// @version 0.8.1 @date 2026-06-05
// 0.8.1 — Daniel 2026-06-05: NEW COMPARE_FLAUNT_X_POSTS set (3 tweets,
//         262–273 chars) prepended into X_REFRAME_POSTS between the
//         free-tier push and the device-resilience comparators. Drives
//         traffic at the /compare page (head-to-head matrix, honest-
//         verdict framing, AskAnAI "ask the AI" CTA). Companion to the
//         Compare.tsx 0.3.0 accordion rework + AskAnAI-at-top.
// @version 0.8.0 @date 2026-06-05
// 0.8.0 — Daniel 2026-06-05: NEW DEVICE_RESILIENCE_X_POSTS set (3 tweets,
//         245–273 chars) prepended into X_REFRAME_POSTS after the free-tier
//         push and before the prove-it launch set. Comparator angle on the
//         "seed doesn't go in Secure Enclave" architectural difference vs.
//         hardware-wallet + Vault12-style products. Companion to Info
//         Security card (Info.tsx 0.8.6), CryptoInheritance AEO blocks
//         (CryptoInheritance.tsx 0.3.0), Compare matrix deviceTied dim
//         (comparisons.ts 0.3.0), and the ProveItAirgap "device" section
//         (ProveItAirgap.tsx 0.4.0). Each tweet ties back to a NoKLock
//         surface URL (info?tab=security or pricing).
// @version 0.7.0 @date 2026-06-02
// 0.7.0 — Daniel 2026-06-02: NEW categorised tweet sets for the Marketing →
//          Tweets sub-tab refactor. Six categories shipped:
//          Security / Inheritance / Reframe / NewFeatures / ManagedService /
//          Launch. Surfaced via the new TWEET_CATEGORIES map below; each
//          entry is a ChannelTemplate so the existing CopyBtn + Tweet ↗
//          card pattern just works. Every tweet hand-written for human
//          voice (no AI slop), under 280 chars, mapped to a real shipped
//          property of NoKLock.
// 0.6.0 — Daniel 2026-05-31: Prove-It hub is now 6 proofs (Source added).
//          Updated all Prove-It-launch copy across X / TG / LI from "5 live
//          demonstrations" to "6", and added the new "Prove the source"
//          line to the X-hub + TG-hub + LI-summary bodies. Two NEW lead
//          posts also added — `x-proveit-source-lead` (X) and
//          `tg-grp-proveit-source` (TG) — so the source proof gets a
//          dedicated drop alongside the airgap-lead it complements.
// 0.5.0 — Daniel 2026-05-31: FREE-TIER PUSH copy added — set A (text only)
//         + set B (with viz link + free-tier-card-1200x675.png graphic).
//         Pushes the free element harder: 1 vault, full product, seed +
//         sealed letter, 2-of-3 Shamir, soulbound-NFT inheritance, no
//         signup, no wallet to try. Graphic URL stable at
//         /share-cards/free-tier-card-1200x675.png (apps/web/public/share-cards/ —
//         NOT public/marketing/ which would collide with the /marketing SPA route
//         and 404 from LiteSpeed). Spread into the
//         existing exported arrays at the very top so they lead.
// 0.4.0 — Daniel 2026-05-30: prove-it expansion launch copy added as new
//         entries in the existing channel arrays (X_REFRAME_POSTS,
//         TELEGRAM_GROUP_POSTS, LINKEDIN_DMS) tagged "Prove-It launch —
//         5 live demonstrations" so they're scannable in Marketing →
//         Channels alongside the reframe and original copy.
// 0.3.0 — Daniel: surface the 2026-05-27 REFRAME social copy (from
//         docs/reframe-social-copy.rtf) as ADDITIONS in the existing
//         arrays, not as a separate card. New entries are tagged with
//         "Reframe launch — protect first / inherit optionally" in their
//         angle text so they're scannable in the Marketing UI alongside
//         the original copy.
//
// 0.2.0 @date 2026-05-27
// 0.2.0 — Daniel: beef up the community-manager outreach. NEW
//         COMMUNITY_MANAGER_OUTREACH array — 5 templates that explicitly spell
//         out the EXTENT of the offer (10% off / 10% USDC earned / honour-
//         system payout / cobrand card / contest pool) AND the PLANNING TOOL
//         (cobrand card builder open-to-all + contest builder + per-partner
//         playbook gated to Premium or invited partners). Every template
//         points at the canonical deep-link noklock.app/partners (redirects
//         to /refer?tab=community-owners). Surfaced as a new "Community
//         managers / group owners" card in Marketing → Channels.
// 0.1.0 — Telegram + LinkedIn outreach copy. Telegram supports a prefilled
// share deep-link (t.me/share/url); LinkedIn has no reliable prefilled-message
// URL, so those are copy-to-paste. Used by Marketing → Channels.

export interface ChannelTemplate {
  readonly id: string;
  readonly angle: string;
  readonly body: string;
  readonly note?: string;
}

// Etiquette — Telegram groups ban stealth-shilling fast; same spirit as the
// Reddit rules.
export const TELEGRAM_GROUP_RULES: readonly string[] = [
  "Read the room first — only post where self-custody / inheritance / estate planning is genuinely on-topic.",
  "Lead with a real answer or a genuine question, not a link. Drop the link once, last.",
  "Disclose you're affiliated (\"I work on NoKLock\") — groups spot stealth promo instantly.",
  "One post per group. Don't paste the same text into ten groups back-to-back (spam filters + bans).",
  "Don't cold-DM members just because you're both in a group. Ask the admin first (templates below).",
  "Education first — skip price/\"buy\" talk. The pitch is the problem you solve, not the licence.",
];

// Value-first messages to drop into a relevant Telegram group.
// ── REFRAME LAUNCH X / TWITTER POSTS (2026-05-28 — new array) ────────────
// Mirrors the X tweets in docs/reframe-social-copy.rtf §2. The Marketing
// page surfaces these in a new "X / Twitter — reframe launch" card.
// Each <=280 chars (X limit). Daniel's reframe stance: lead with personal
// recovery + unauthorised-access fears, not death.
// ── FREE-TIER PUSH (2026-05-31) ──────────────────────────────────────────
// Daniel: push the free element harder — no obligation, full product on
// 1 vault, seed phrase + sealed letter, 2-of-3 Shamir, end-to-end same
// crypto as paid. TWO variants per channel:
//   • Set A — text-only (no graphic, no viz link beyond noklock.app)
//   • Set B — with viz link (/viz/pipeline?fs=1) + free-tier-card graphic
//     (apps/web/public/free-tier-card-1200x675.png — stable URL
//      https://noklock.app/share-cards/free-tier-card-1200x675.png)
// Each Set-B body ends with [ATTACH: …] so Daniel (or any operator) knows
// the graphic to upload alongside the text.
const FREE_PUSH_X_POSTS: readonly ChannelTemplate[] = [
  {
    id: "x-free-A-fullproduct",
    angle: "Free-tier push · Set A (text only) — full product, no obligation (211 chars)",
    body:
      "Self-custodial seed store + restore — free.\nNo signup. No wallet to try.\n1 vault, seed phrase + sealed letter, 2-of-3 Shamir split across YOUR clouds. Same crypto as paid. Inheritance optional.\nnoklock.app",
    note: "211 chars. Pure text. Strongest single anchor for the free push — leads with what the tier IS, not what it isn't.",
  },
  {
    id: "x-free-A-try-before-pay",
    angle: "Free-tier push · Set A (text only) — try before you trust (243 chars)",
    body:
      "You shouldn't have to pay to find out whether self-custodial software actually works.\n\nNoKLock's free tier is the full product on 1 vault — real Argon2id, real Shamir, real round-trip. Add an heir if you want, skip it if you don't.\n\nnoklock.app",
    note: "243 chars. For the 'is this real?' crowd. Plain text, no link beyond home.",
  },
  {
    id: "x-free-A-honest-diff",
    angle: "Free-tier push · Set A (text only) — honest free-vs-paid breakdown (249 chars)",
    body:
      "Free tier ≠ teaser.\n\nNoKLock Free = 1 vault, seed phrase, sealed letter, 2-of-3 Shamir, soulbound-NFT inheritance, dead-man's switch, email NoK.\n\nWhat you pay for: duress decoy, doc/image vaults, multi-NoK voting, up to 9 shares.\n\nnoklock.app",
    note: "249 chars. Names exactly what's in / out — disarms the 'what's the catch' reflex. Numbers verified against Pricing.tsx 2026-05-31.",
  },
  {
    id: "x-free-B-graphic-pipeline",
    angle: "Free-tier push · Set B (with viz link + graphic) — see the pipeline before signup (228 chars)",
    body:
      "The full product, free.\n\nEnd-to-end same crypto as paid: BIP-39 → Argon2id → Shamir 2-of-3 → AEAD → Ed25519 manifest. Watch the whole pipeline run in your browser before you sign up to anything.\n\nnoklock.app/viz/pipeline?fs=1\n\n[ATTACH: /share-cards/free-tier-card-1200x675.png]",
    note: "228 chars (excl. attach line). Set B — pairs with the free-tier card PNG. Viz link opens chromeless fullscreen overlay so the recipient lands straight in the demo.",
  },
  {
    id: "x-free-B-graphic-window",
    angle: "Free-tier push · Set B (with viz link + graphic) — wall-with-a-window contrast (231 chars)",
    body:
      "Most 'free tiers' are walls with a window. Ours is a working vault.\n\n1 vault. Real seed. Real sealed letter. Real 2-of-3 Shamir. Real soulbound-NFT inheritance. Free. No wallet to try.\n\nRun the pipeline yourself → noklock.app/viz/pipeline?fs=1\n\n[ATTACH: /share-cards/free-tier-card-1200x675.png]",
    note: "231 chars (excl. attach line). Set B — same card, sharper contrast hook. Best after Set A entries have warmed the room.",
  },
];

// ── COMPARE-PAGE FLAUNTING (2026-06-05) ───────────────────────────────
// Daniel-asked 2026-06-05: tweets that flaunt the /compare page itself —
// drive traffic at the head-to-head matrix where the device-tied-keys
// dimension + the new accordions live. Three angles: head-to-head shape,
// honest-verdict framing, and "ask an AI to verify."
const COMPARE_FLAUNT_X_POSTS: readonly ChannelTemplate[] = [
  {
    id: "x-compare-head-to-head",
    angle: "Compare-page flaunting — head-to-head matrix (266 chars)",
    body:
      "We do head-to-head with every credible alternative — Casa, Vault12, Inheriti, Ledger Recover, Nunchuk, Unchained, Sarcophagus, the digital-legacy crowd, the managed-wallet adjacents.\n\nOne page. One matrix. Our column is verifiable on PolygonScan today.\n\nnoklock.app/compare",
    note: "266 chars. Lead with the comprehensive coverage — most competitors duck head-to-heads.",
  },
  {
    id: "x-compare-honest-verdict",
    angle: "Compare-page flaunting — honest-verdict framing (262 chars)",
    body:
      "Every /compare page on noklock.app has an Honest Verdict block: when the rival is actually better for your situation, we say so.\n\nWe think NoKLock wins on inheritance specifically. We're happy to argue it column-by-column.\n\nnoklock.app/compare",
    note: "262 chars. Differentiator on tone — most product comparisons are hatchet jobs. This is a real positioning angle.",
  },
  {
    id: "x-compare-ask-an-ai",
    angle: "Compare-page flaunting — ask an AI to verify (273 chars)",
    body:
      "/compare on noklock.app has an 'ask a neutral AI' widget at the top.\n\nPick a rival. We open Perplexity / ChatGPT / Claude in a new tab with a balanced compare prompt pre-filled.\n\nWe don't want you to take our word for it. We want the AI to take a side.\n\nnoklock.app/compare",
    note: "273 chars. AEO flywheel — every AI query about NoKLock surfaces it more.",
  },
];

// ── SIMPLE-ROUTE / THREE-FOLDERS-BEATS-A-STICKY-NOTE (2026-06-07) ──────
// Daniel-asked 2026-06-07: tweets surfacing the BOTH-options locked
// decision from handoff §3.13 — the "simple route" framing introduced
// across Landing 0.22.0 + Enrol Step B + Pricing FAQ + CryptoInheritance
// AEO Q. Lead angle: "three folders scattered in your own storage
// already beats a sticky note in a drawer." Each tweet ties back to a
// NoKLock surface (noklock.app home or pricing). Voice mirrors
// DEVICE_RESILIENCE + COMPARE_FLAUNT — informed-pragmatic, not preachy.
const SIMPLE_ROUTE_X_POSTS: readonly ChannelTemplate[] = [
  {
    id: "x-simple-three-folders",
    angle: "Simple route — three folders beats a sticky note (250 chars)",
    body:
      "Three folders on your laptop, your phone, and a USB stick already beats a sticky note in a drawer.\n\nNoKLock's simple route: split your seed 2-of-3, drop the share files wherever you already trust. No cloud required. Restore from any 2.\n\nnoklock.app",
    note: "250 chars. Lead with the lowest-friction setup — no cloud account, no extra signups, just three places you already control. The Jun 7 simple-vs-max anchor tweet.",
  },
  {
    id: "x-simple-vs-max",
    angle: "Simple route — simple vs max security (273 chars)",
    body:
      "Two ways to use NoKLock:\n\n• Simple — three folders you already use (laptop / phone / USB). Better than a sticky note, ten minutes to set up.\n• Max — Shamir 3-of-5 across cloud + offline + heir. Survives any single failure.\n\nStart simple. Upgrade when ready.\n\nnoklock.app",
    note: "273 chars. The BOTH-options framing in one tweet — gives the reader an entry point without locking them into the deep config.",
  },
  {
    id: "x-simple-already-safer",
    angle: "Simple route — already safer than what you have (267 chars)",
    body:
      "If your seed phrase is on one piece of paper in one drawer, you're already running max risk.\n\nNoKLock's simple setup — 2-of-3 Shamir across three folders you already own — is safer than 99% of crypto holders' current backup, before you even pick clouds.\n\nnoklock.app",
    note: "267 chars. The 99% line lands the contrast — frames the simple route as a strict upgrade over the dominant (terrible) status quo.",
  },
];

// ── DEVICE-RESILIENCE / SECURE-ELEMENT COMPARATORS (2026-06-05) ────────
// Daniel-asked 2026-06-05: comparator-themed tweets discussing the
// "seed-can't-go-in-Secure-Enclave" point as a public differentiator vs.
// hardware-wallet + Vault12-style products. Tone: informed-skeptical, not
// derogatory. Each claim ties back to a NoKLock surface (Info Security,
// Compare matrix, CryptoInheritance AEO hub, ProveItAirgap).
const DEVICE_RESILIENCE_X_POSTS: readonly ChannelTemplate[] = [
  {
    id: "x-se-not-for-seeds",
    angle: "Comparator — Secure Enclave is for signing, not seeds (273 chars)",
    body:
      "Secure Enclave / StrongBox / TPM are great. For signing.\n\nThey're a bad fit for a recoverable seed: the key can't leave the chip BY DESIGN — that's what makes them secure, and what makes them dead if the device dies.\n\nNoKLock: Argon2id + Shamir 3-of-5 + AEAD over providers YOU pick. Lose the phone, recover anywhere.\n\nnoklock.app/info?tab=security",
    note: "273 chars. Lead with the technical why, not the marketing diss. For the wallet/security crowd.",
  },
  {
    id: "x-paper-backup-ritual",
    angle: "Comparator — paper backup ritual is the SE tell (267 chars)",
    body:
      "Every Secure-Element-marketed wallet still hands you a paper phrase. Ever wondered why?\n\nBecause SE keys can't be exported from the chip. The seed dies with the device. The paper is the patch.\n\nNoKLock removes the single point of failure instead of papering over it. 3-of-5 Shamir, distributed.\n\nnoklock.app/info?tab=security",
    note: "267 chars. The 'paper backup is the tell' framing is strong and falsifiable.",
  },
  {
    id: "x-phone-dies-still-fine",
    angle: "Comparator — phone dies → seed still safe (245 chars)",
    body:
      "Your phone dies. Your seed:\n\n• In a hardware wallet → recoverable from the paper backup you wrote down 3 years ago and can't find. Hope you find it.\n• In a Secure Enclave-locked app → gone with the chip.\n• In NoKLock → download your shares to any new device, re-enter password, recover.\n\nnoklock.app/pricing",
    note: "245 chars. Three-way punch. The 'paper backup you can't find' line lands with the audience.",
  },
];

export const X_REFRAME_POSTS: readonly ChannelTemplate[] = [
  // ── FREE-TIER PUSH (2026-05-31 — leads the array) ─────────────────────
  ...FREE_PUSH_X_POSTS,
  // ── COMPARE-PAGE FLAUNT (2026-06-05) ─────────────────────────────────
  ...COMPARE_FLAUNT_X_POSTS,
  // ── SIMPLE-ROUTE / THREE-FOLDERS-BEATS-A-STICKY-NOTE (2026-06-07) ────
  ...SIMPLE_ROUTE_X_POSTS,
  // ── DEVICE RESILIENCE / SECURE-ELEMENT (2026-06-05) ──────────────────
  ...DEVICE_RESILIENCE_X_POSTS,
  // ── PROVE-IT LAUNCH (2026-05-30) ──────────────────────────────────────
  {
    id: "x-proveit-airgap-lead",
    angle: "Prove-It launch — airgap proof (lead) (271 chars)",
    body:
      "Most self-custodial apps SAY they don’t see your seed.\n\nNoKLock now lets you PROVE it.\n\nOpen /prove-it/airgap and click ‘Fire all four’. Watch fetch, Image, WebSocket, sendBeacon — every browser exfil channel — bounce off the firewall in real time.\n\nnoklock.app/prove-it/airgap",
    note: "271 chars. Strongest single anchor — most viscerally believable demo. Click-to-verify hook.",
  },
  {
    id: "x-proveit-hub",
    angle: "Prove-It launch — full 6-proof hub (276 chars)",
    body:
      "/prove-it now has 6 live proofs you can run in your browser:\n\n1. Prove the math (real crypto round-trip)\n2. Prove the airgap (zero network calls)\n3. Prove the chain runs without us\n4. Prove the build matches GitHub\n5. Prove your shares look like noise\n6. Prove the source (firewall + memory wipe)\n\nnoklock.app/prove-it",
    note: "276 chars. Use after the airgap lead has landed. Lists the full set including the new Source proof (firewall + Uint8Array .fill(0) of every derived secret).",
  },
  {
    id: "x-proveit-source-lead",
    angle: "Prove-It launch — Source proof (lead) (272 chars)",
    body:
      "We just shipped the deepest proof a self-custodial vault can offer: the source of the 9-channel firewall + the synchronous .fill(0) wipe of every byte we derive from your seed — bundled into the page so opening the modal doesn't itself make a network call.\n\nnoklock.app/prove-it/source",
    note: "272 chars. Strongest tweet for the security-savvy crowd. Pair with the airgap-lead for one-two punch.",
  },
  {
    id: "x-proveit-bug-bounty",
    angle: "Prove-It launch — bug-bounty framing (260 chars)",
    body:
      "Open /prove-it/airgap. Open your browser’s DevTools Network tab next to it.\n\nClick our 4 ‘test fire’ buttons. Every blocked attempt should match between our terminal and DevTools — same events, two independent observers.\n\nIf they disagree, bug bounty. We can’t fake the browser.",
    note: "260 chars. Tone = invite scrutiny. Best for security / OPSEC crowd.",
  },
  {
    id: "x-reframe-announce",
    angle: "Reframe launch — protect first / inherit optionally (252 chars)",
    body:
      "Most people don’t worry about dying. They worry about losing a seed.\n\nNoKLock does the first job first — split + encrypt + spread across YOUR own storage (local folders or cloud — your call).\n\nInheritance is the optional second layer.\n\nnoklock.app",
    note: "252 chars. Anchor tweet for the reframe launch. 2026-06-07: softened from 'YOUR cloud accounts' → 'YOUR own storage (local folders or cloud — your call)' per BOTH-options decision.",
  },
  {
    id: "x-reframe-hook",
    angle: "Reframe launch — wait-what hook (215 chars)",
    body:
      "You probably bought a hardware wallet because you were scared of losing your seed.\n\nHave you actually tested that you can recover it? Without the device? On any browser?\n\nNoKLock makes that the basic case. Inheritance is the bonus.\n\nnoklock.app/info?tab=process",
    note: "215 chars. Self-custody crowd, lead with the unaddressed anxiety.",
  },
  {
    id: "x-reframe-differentiation",
    angle: "Reframe launch — differentiation tweet (256 chars)",
    body:
      "Most “crypto inheritance” tools lead with death.\n\nNoKLock leads with: don’t lose your stuff.\n\n• Split 3-of-5 across YOUR own storage (folders or cloud — your call)\n• Recover on any browser\n• Add an heir later, if you want\n\nSource-verified on Polygon.",
    note: "256 chars. Positions against Casa / Vault12 / Coincover head-on. 2026-06-07: softened from 'YOUR clouds' → 'YOUR own storage (folders or cloud — your call)' per BOTH-options decision.",
  },
  {
    id: "x-reframe-honest-contrast",
    angle: "Reframe launch — honest contrast (273 chars)",
    body:
      "Casa Inheritance: build a vault for your heirs.\nVault12: backup for your heirs.\nCoincover: recovery you pay for.\n\nNoKLock: protect it for YOURSELF first — a working store + restore vault for a seed, letter, doc or image. Heirs are an optional layer you can add later.",
    note: "273 chars. Direct competitor list. Risky tone — use sparingly.",
  },
  {
    id: "x-reframe-thread",
    angle: "Reframe launch — practical thread (4 tweets, paste as a thread)",
    body:
      "1/ First job NoKLock does isn’t inheritance. It’s protection.\n\nSplit your seed 3-of-5 across YOUR own storage (folders or cloud — your call). Encrypted in your browser, we can’t see it.\n\nLose your device? Open Restore on any browser, drop in 3 shares + master password. Done.\n\n———\n\n2/ That’s the foundation. Most users stop there — they just want a seed phrase / sealed letter / document / image they can’t lose and nobody else can find.\n\n———\n\n3/ The optional second layer: add a next-of-kin. On-chain dead-man’s switch fires if you stop checking in. Heir gets a soulbound NFT, claims the vault, restores it the same way you would.\n\n———\n\n4/ Layer it on now, later, or never. Your foundation vaults are unchanged.\n\nnoklock.app",
    note: "Thread of 4. Paste each segment (separated by ———) as its own X post in a reply chain.",
  },
];

// ── REFRAME LAUNCH TELEGRAM POSTS (2026-05-28 — added to existing array) ──
// Mirrors the Telegram in-group posts in docs/reframe-social-copy.rtf §3.
// Use these in self-custody / hardware-wallet / OPSEC groups where the
// audience cares more about losing the seed than about dying.
const REFRAME_TG_GROUP_POSTS: readonly ChannelTemplate[] = [
  {
    id: "tg-grp-reframe-selfcustody",
    angle: "Reframe launch — protect first / inherit optionally (self-custody group)",
    body:
      "Quick conversation: what’s actually scarier to you — losing your seed phrase tomorrow, or never giving it to anyone when you die?\n\nFor most people I’ve asked, it’s the first.\n\nWe built NoKLock for both — but the protection use case (split your seed 3-of-5 across YOUR own storage — local folders or cloud, your call — and rebuild on any browser any time) works on its own. Inheritance is the optional layer on top.\n\n(Full disclosure: I work on NoKLock.) noklock.app",
    note: "Reframe-pass copy. Best in self-custody / wallet-power-user groups. Lead with the everyday anxiety, not death.",
  },
  {
    id: "tg-grp-reframe-hardware",
    angle: "Reframe launch — protect first / inherit optionally (hardware-wallet group)",
    body:
      "Honest question: if you lost your Ledger / Trezor / Tangem today, could you actually recover from your written seed phrase?\n\nThe paper backup is great until: it’s in a desk drawer in another city, you can’t remember which envelope, the ink faded, the fire took it.\n\nNoKLock splits the seed encrypted across YOUR own storage (local folders or cloud — your call) at 3-of-5. You rebuild on any browser, any time, with the master password you set. Independent of the device.\n\nOptional: designate a next-of-kin on-chain so the same vault becomes inheritable. Skip it if all you want is personal recovery.\n\nSource-verified on Polygon: noklock.app/info?tab=contracts",
    note: "Reframe-pass copy. Best in hardware-wallet / Ledger / Trezor / Tangem groups.",
  },
];

// ── FREE-TIER PUSH TELEGRAM POSTS (2026-05-31) ────────────────────────────
const FREE_PUSH_TG_GROUP_POSTS: readonly ChannelTemplate[] = [
  {
    id: "tg-grp-free-A-text",
    angle: "Free-tier push · Set A (text only) — genuine ask + free-vault offer",
    body:
      "Genuine ask for the self-custody crowd: what would actually convince you that a 'we never see your seed' tool was telling the truth?\n\nFor us the answer was: let people try the whole thing first. Free. No signup. No wallet to connect.\n\nNoKLock Free is the full product on one vault — seed phrase + sealed letter, encrypted in your browser, 2-of-3 Shamir split across your own clouds (Drive / iCloud / Dropbox / wherever you trust). Restore on any browser, any time. Same cryptography as the paid tiers; what you pay for is a duress-decoy vault, doc/image vaults, multi-NoK voting, more share locations.\n\nInheritance is an optional layer on top. Plenty of users only ever want the personal-recovery vault.\n\n(Full disclosure: I work on NoKLock.) noklock.app",
    note: "Set A — text only. Best in self-custody / wallet-power-user groups. Leads with a real question, lands the offer, names the paid extras honestly. ~135 lines fits in TG's 4096-char limit.",
  },
  {
    id: "tg-grp-free-B-viz-graphic",
    angle: "Free-tier push · Set B (with viz link + graphic) — see the crypto run before you sign up",
    body:
      "For the 'I don't trust crypto products' folks — we built a viz that runs the actual crypto pipeline in your browser, so you can SEE the whole flow before you even consider signing up.\n\n[ATTACH: /share-cards/free-tier-card-1200x675.png — or a screen-record / screenshot of the viz]\n\nBIP-39 generation → Argon2id master key → Shamir 2-of-3 split → AEAD wrap per share → Ed25519-signed manifest → restore from K shares → byte-for-byte round-trip.\n\nThat's exactly what the free vault runs on, end-to-end.\n• Free = 1 vault · seed + sealed letter · 2-of-3 · full product.\n• Paid = duress decoy · doc/image · multi-NoK · up to 9 share locations.\n\nWatch the pipeline: noklock.app/viz/pipeline?fs=1\nTry the free vault:   noklock.app\n\n(Full disclosure: I work on NoKLock.)",
    note: "Set B — attaches the free-tier-card PNG (or a screen-record of /viz/pipeline?fs=1) above the body in Telegram. The viz link opens the chromeless fullscreen overlay. Drop one channel, observe.",
  },
];

// ── PROVE-IT LAUNCH TELEGRAM POSTS (2026-05-30) ──────────────────────────
const PROVEIT_TG_GROUP_POSTS: readonly ChannelTemplate[] = [
  {
    id: "tg-grp-proveit-airgap",
    angle: "Prove-It launch — airgap demo (self-custody / OPSEC group)",
    body:
      "If you've ever wondered \"how do I actually know this app doesn't see my seed?\" — we just shipped the page that answers it.\n\nGo to noklock.app/prove-it/airgap. Open your browser's DevTools Network tab next to it. Click \"Fire all four\" — fetch, Image.src, WebSocket, sendBeacon. Every browser exfil channel deliberately tries to send data; every attempt should bounce off and show as blocked in BOTH our terminal and your DevTools (the browser's own report, not ours).\n\nIf they ever disagree, that's a real leak and a bug bounty. We can be wrong; the browser can't be wrong about its own network activity.\n\n(Full disclosure: I work on NoKLock.) noklock.app/prove-it/airgap",
    note: "Prove-It launch. Best in self-custody / OPSEC / hardware-wallet groups. Tone = invite scrutiny.",
  },
  {
    id: "tg-grp-proveit-hub",
    angle: "Prove-It launch — full 6-proof hub (general crypto group)",
    body:
      "Quick share — /prove-it is now a hub for 6 live, browser-verifiable demonstrations of NoKLock's core security claims:\n\n• Prove the math — the real crypto pipeline runs on throwaway data, round-trip verified.\n• Prove the airgap — every browser exfil channel hijacked + a live terminal showing zero traffic.\n• Prove the chain runs without us — 6 immutable contracts + Chainlink keeper + public RPC fallback chain.\n• Prove the build matches the source — runtime hash compare + 5-minute reproduce one-liner.\n• Prove your shares look like noise — chi-square byte-frequency test on real ciphertext, live in your browser.\n• Prove the source — read the 9-channel firewall + the synchronous memory wipe of every byte we derive from your seed. Source is bundled inline so opening the modal doesn't even make a network call.\n\nThe premise: you shouldn't have to take our word for anything. (Full disclosure: I work on NoKLock.) noklock.app/prove-it",
    note: "Prove-It launch. Pithy summary of the whole hub including the new Source proof. Best in general crypto / self-custody groups.",
  },
  {
    id: "tg-grp-proveit-source",
    angle: "Prove-It launch — Source proof (security-savvy group)",
    body:
      "For the 'I want to read the actual code that handles my seed' crowd: NoKLock's new /prove-it/source page bundles the 9-channel browser-exfil firewall + the PerformanceObserver browser-native witness + the boot install directly into the page (via vite ?raw imports — no network call when you open the modal, so the proof works even while the airgap is engaged).\n\nPlus an honest explainer of the JavaScript memory model: strings can't be synchronously wiped (no JS API exists), but every Uint8Array NoKLock derives from your seed — entropy, Argon2id master, HKDF PRK, per-share AEAD keys, Shamir share plaintexts, Ed25519 signing seed — is synchronously .fill(0)'d the moment it's no longer needed. We name what we can't do (string wipe) and show the code that does what we can.\n\n(Full disclosure: I work on NoKLock.) noklock.app/prove-it/source",
    note: "Best in security / OPSEC / dev groups where the audience reads code. Pairs with the airgap-demo post.",
  },
];

export const TELEGRAM_GROUP_POSTS: readonly ChannelTemplate[] = [
  ...FREE_PUSH_TG_GROUP_POSTS,
  ...PROVEIT_TG_GROUP_POSTS,
  ...REFRAME_TG_GROUP_POSTS,
  {
    id: "tg-grp-question",
    angle: "Conversation starter",
    body:
      "Honest question for the group: what's your actual plan for your crypto if you got hit by a bus tomorrow?\n\nWhen I ask people, the answer is usually \"…nothing.\" A seed in a drawer and family who'd never find it, let alone understand it.\n\n(Full disclosure — I work on NoKLock, self-custodial on-chain inheritance — but genuinely curious what folks here actually do today.) noklock.app/crypto-inheritance",
    note: "Best in general crypto / self-custody groups. Invites replies — engage before re-linking.",
  },
  {
    id: "tg-grp-security",
    angle: "Security crowd — invite a teardown",
    body:
      "If you teach self-custody, you know the gap nobody plans for: what happens to the keys when the holder dies.\n\nWe built NoKLock to solve it without custody: client-side crypto, no provider keys, M-of-N heir quorum, a duress decoy, and an on-chain dead-man's switch (Chainlink Automation on Polygon) that fires even if our company disappears. 6 source-verified contracts.\n\nI'd rather have it torn apart by this group than praised by people who don't self-custody. Real pipeline runs on throwaway data here: noklock.app/prove-it",
    note: "For security / OPSEC / hardware-wallet groups. Tone = ask for critique, not applause.",
  },
  {
    id: "tg-grp-polygon",
    angle: "Polygon / ecosystem",
    body:
      "A genuinely novel consumer use case on Polygon: NoKLock — self-custodial crypto inheritance.\n\nIt mints ERC-5192 soulbound NFTs for designated heirs (rare in production), uses Chainlink Automation as an on-chain dead-man's switch, and has an email path so non-crypto family can still inherit. Everything's source-verified on PolygonScan.\n\nWould love feedback from builders here. noklock.app/info?tab=contracts",
    note: "For Polygon / L2 / ecosystem builder groups.",
  },
  {
    id: "tg-grp-family",
    angle: "Non-crypto family angle",
    body:
      "The hardest part of crypto inheritance isn't the tech — it's that your heirs probably don't use crypto.\n\nNoKLock handles that: you can designate an heir by email, and at claim time they're walked through making a wallet and receiving the vault — no seed phrase handed around, nothing custodial. The on-chain switch does the work even if we're gone.\n\nWriting about how this works for people who'll never touch MetaMask: noklock.app/crypto-inheritance",
    note: "For general / beginner / 'crypto for my family' groups.",
  },
];

// 1:1 Telegram outreach (admins, creators, partners).
export const TELEGRAM_DMS: readonly ChannelTemplate[] = [
  {
    id: "tg-dm-admin",
    angle: "Group admin — ask permission / AMA",
    body:
      "Hi — I work on NoKLock (self-custodial, on-chain crypto inheritance). Before posting in your group I wanted to ask: would an educational post or a short AMA on \"what happens to your crypto when you die\" be welcome and on-topic? Happy to keep it strictly non-promotional and answer hard questions. Source-verified on Polygon: noklock.app/info?tab=contracts",
    note: "Always do this before posting in a moderated group.",
  },
  {
    id: "tg-dm-creator",
    angle: "Creator / educator",
    body:
      "Hi {name} — love your work on self-custody. Most of your audience has no plan for what happens to their crypto if they die. NoKLock is self-custodial inheritance — no provider keys, on-chain dead-man's switch on Polygon, plus an email path for non-crypto heirs. Not asking for a plug; I'd genuinely value your critique of the model. 10 minutes? noklock.app/crypto-inheritance",
    note: "Replace {name}. Mirror of the X DM, tuned for Telegram.",
  },
  {
    id: "tg-dm-partner",
    angle: "Wallet / ecosystem partner",
    body:
      "Hi — NoKLock is a self-custodial crypto-inheritance dApp live on Polygon (6 source-verified contracts, Chainlink Automation, ERC-5192 soulbound NFTs). Inheritance is a feature your users ask for but you don't have to custody. Open to exploring an integration or co-marketing? Happy to send a short overview. noklock.app",
    note: "For wallets/exchanges/ecosystem BD contacts on Telegram.",
  },
];

// ── COMMUNITY MANAGER / GROUP-OWNER OUTREACH ─────────────────────────────
// 0.5.0 — Daniel 2026-05-31: every-member-wins-with-free-vault angle
//          woven in. Don't lead with it (free ≠ revenue) but call it out
//          as "the part that lands for 100% of your community even if
//          only 5% buy". New cm-every-member-hook short standalone +
//          one extra bullet inserted into the 5 existing pitch templates.
// Targets people who RUN a crypto community (Telegram group admin, Discord
// server owner, X community lead, Reddit moderator, channel/newsletter
// founder). Distinct from generic group-posts and from BD-partner outreach:
// the offer here is explicitly the Refer-&-Share programme + the partner
// toolkit, with the deep-link noklock.app/partners and the full surface
// area named so the recipient knows what they're being invited to.
export const COMMUNITY_MANAGER_OUTREACH: readonly ChannelTemplate[] = [
  {
    id: "cm-earnings-math",
    angle: "Earnings math — worked examples (paste into any DM)",
    body:
      "Your earnings as a community owner — quick math\n\nVisiting your link gets the buyer 10% off; you earn 10% of what they pay, paid in USDC on-chain at mint (no claim step, no balance held by NoKLock).\n\nUSDC earned at FOUNDER pricing (first 10,000 paid licences, contract-enforced):\n• Standard ($99/yr)              — $9.90 per signup    →  25 signups = $247.50   ·  100 signups = $990\n• Premium ($199/yr)              — $19.90 per signup   →  25 signups = $497.50   ·  100 signups = $1,990\n• Lifetime Standard ($299 once)  — $29.90 per signup   →  25 signups = $747.50   ·  100 signups = $2,990\n• Lifetime Premium ($499 once)   — $49.90 per signup   →  25 signups = $1,247.50 ·  100 signups = $4,990\n\nUSDC earned at REGULAR pricing (after the founder cap):\n• Standard ($149/yr)             — $14.90 per signup   →  25 signups = $372.50   ·  100 signups = $1,490\n• Premium ($299/yr)              — $29.90 per signup   →  25 signups = $747.50   ·  100 signups = $2,990\n• Lifetime Standard ($499 once)  — $49.90 per signup   →  25 signups = $1,247.50 ·  100 signups = $4,990\n• Lifetime Premium ($799 once)   — $79.90 per signup   →  25 signups = $1,997.50 ·  100 signups = $7,990\n\nMix-of-tiers example (typical community split at founder pricing):\n• 100 signups, of which 40 Standard + 40 Premium + 15 Lifetime-Standard + 5 Lifetime-Premium\n  → 40·$9.90 + 40·$19.90 + 15·$29.90 + 5·$49.90  =  $396 + $796 + $448.50 + $249.50  =  $1,890 USDC\n\nVerify any wallet's earnings on PolygonScan at any time: ReferralAttributed events on the License contract.",
    note: "Pure worked math, no extra pitch. Copy + paste into any DM/email when the partner asks 'what would I actually earn?'.",
  },
  {
    id: "cm-every-member-hook",
    angle: "Every-member-wins short hook — paste-into-channel teaser (Set B works with the free-tier card)",
    body:
      "We've teamed up with NoKLock — self-custodial seed-phrase store & restore, on-chain inheritance optional.\n\nThe part that matters for EVERY member of this channel, whether they ever pay a cent:\n• A free vault — 1 vault, real seed phrase + sealed letter, 2-of-3 Shamir split across YOUR own storage (local folders or cloud — your call), on-chain inheritance available. No signup, no wallet to try.\n\nFor anyone who upgrades to paid (duress decoy, doc/image vaults, multi-NoK voting, up to 9 share locations) the channel earns 10% in USDC on-chain — feeds the contest pool below.\n\nFree vault: noklock.app   ·   Watch the crypto run: noklock.app/viz/pipeline?fs=1\n\n[ATTACH: /free-tier-card-1200x675.png — optional but lands the point]",
    note: "SHORT teaser the partner can paste into their channel as a leading post BEFORE the full cm-announce-template. Frames the free vault as the universal community win (lands for 100% even if only 5% buy) — revenue stays as the upgrade story. Pairs with the free-tier-card graphic.",
  },
  {
    id: "cm-dm-cold-tg",
    angle: "Cold DM — Telegram group admin / Discord owner",
    body:
      "Hi {name} — I run NoKLock (self-custodial crypto inheritance on Polygon) and I think the Refer & Share programme is a natural fit for your community.\n\nThe extent of the offer:\n• **Every member of your community gets a free NoKLock vault via your link** — 1 vault, real seed phrase + sealed letter, 2-of-3 Shamir split, on-chain inheritance. No signup, no wallet to try. This is what lands for 100% of your community even if only a fraction upgrades.\n• Your members get **10% off** every paid NoKLock licence via your link.\n• You earn **10% in USDC, on-chain at mint**, every time one of them buys — no claim step, no contract-held balance, paid the moment they mint.\n• On top of that you can run a Refer & Share contest: pre-commit a slice of your earned USDC to a community pool that pays out (equal split / raffle / weighted) once N qualified signups arrive under your wallet.\n\nQuick worked math (founder pricing, first 10k licences):\n• 25 Standard signups   = $247.50 USDC     ·  100 Standard signups  = $990\n• 25 Premium signups    = $497.50           ·  100 Premium signups   = $1,990\n• 25 Lifetime signups   = $747.50–$1,247.50 ·  100 Lifetime signups  = $2,990–$4,990\n(Realistic mixed-tier community of 100 ≈ $1,800–$2,000 USDC. See the 'Earnings math' template for the per-tier table.)\n\nThe planning tool (built into the dApp, end-to-end):\n• Cobrand card builder — 1200×675 PNG with your logo × NoKLock for Telegram / X / channel banners (open to everyone, no signup).\n• Contest builder — 4 knobs (pool share / trigger count / prize / distribution) → live sample card + Telegram post body + 30-second admin pitch.\n• Per-partner playbook — a customised end-to-end how-to-run-it doc (download .md / .rtf / Save-as-PDF).\n\nHonour-system payout, on-chain verifiability — NoKLock never custodies the pool; you pay winners from your own wallet, and your community can independently calculate what's owed by reading your wallet on PolygonScan.\n\nThe contest builder + playbook are a Premium-tier perk or selected-partner invitation. The cobrand card is free for anyone. Have a look: noklock.app/refer?tab=community-owners",
    note: "Best for medium-to-large crypto Telegram groups (self-custody / wallet / Polygon / inheritance-curious). Personalise {name} + your relationship to the group.",
  },
  {
    id: "cm-dm-cold-li",
    angle: "Cold DM — LinkedIn (founder / community lead)",
    body:
      "Hi {name} — given your work building {community/audience}, I wanted to put NoKLock's community-owner programme on your radar.\n\nNoKLock is self-custodial crypto inheritance on Polygon (6 source-verified contracts, ERC-5192 soulbound NFTs, Chainlink-automated dead-man's switch). It's a real problem for anyone with crypto + a family.\n\nThe partner programme is straightforward — and includes something for EVERY member of your community, not just buyers: every visitor through your link gets a free NoKLock vault (1 vault, real seed phrase + sealed letter, 2-of-3 Shamir, on-chain inheritance — no signup, no wallet to try). Members who upgrade to paid get 10% off; you earn 10% in USDC on-chain at mint on every paid signup.\n\nQuick math at founder pricing: 25 Standard signups = $247.50 USDC, 100 Premium = $1,990, 100 mixed-tier ≈ $1,800–$2,000. You can also run a Refer & Share community contest — pre-commit a slice of your earned referral USDC as a pool that pays out after N qualified signups. NoKLock never custodies the pool; you pay from your own wallet and the community verifies on PolygonScan.\n\nThe full toolkit (cobrand card builder, contest builder, per-partner playbook) is at noklock.app/refer?tab=community-owners. The card builder is open to everyone; the contest builder + playbook are a Premium-tier perk or by invitation. Happy to send a Calendly link if a 15-min call helps.",
    note: "LinkedIn equivalent. {community/audience} = the thing they run / built.",
  },
  {
    id: "cm-email-formal",
    angle: "Formal email — partnership / co-marketing pitch",
    body:
      "Subject: Refer-&-Share — 10/10 on-chain referral + a contest pool for your community\n\nHi {name},\n\nI'm reaching out about a community-owner programme at NoKLock (self-custodial crypto inheritance, live on Polygon). I think it's a good fit for {community}.\n\nThe extent of the offer\n• Every member who visits via your link gets a free NoKLock vault — 1 vault, real seed phrase + sealed letter, 2-of-3 Shamir split across storage they pick — local folders or cloud accounts, on-chain inheritance. No signup, no wallet to try. Lands for 100% of your community even if only a fraction upgrades.\n• 10% off — every paid licence bought through your link.\n• 10% in USDC, paid to your wallet on-chain at mint — no claim step, no balance held by NoKLock, automatic the moment the buyer signs.\n• Refer & Share contest — pre-commit a slice of your earned referral USDC to a community pool; once N qualified signups arrive under your wallet, the pool pays winners (equal split / raffle / weighted, your choice).\n\nWorked earnings (founder pricing, first 10,000 paid licences — contract-enforced)\n• 25 Standard signups   →  $247.50 USDC     ·  100 Standard signups   →  $990\n• 25 Premium signups    →  $497.50 USDC     ·  100 Premium signups    →  $1,990\n• 25 Lifetime signups   →  $747–$1,247 USDC ·  100 Lifetime signups   →  $2,990–$4,990\nA realistic mixed-tier community of 100 signups (40 Std / 40 Prem / 20 Lifetime variants) earns ≈ $1,800–$2,000 USDC.\n\nThe planning tool — at noklock.app/refer?tab=community-owners\n• Cobrand card builder — generates a 1200×675 'NoKLock × your-brand' PNG for Telegram / X / channel banners. Free for anyone.\n• Refer & Share contest builder — set 4 knobs, see the live sample card + Telegram post body + admin pitch.\n• Per-partner playbook — a custom end-to-end runbook (download .md / .rtf / Save-as-PDF). Hands to the partner the exact text they'd use to launch + run the contest in their channel.\n\nHonour-system payout, on-chain verifiability — NoKLock never holds contest funds; the partner pays winners from their own earned wallet, and the community can independently verify on PolygonScan.\n\nThe cobrand card is open to everyone. The contest builder + playbook are a Premium-tier perk or by selected-partner invitation; happy to extend an invitation directly to {community} if it's a fit.\n\nWorth a 15-minute call? Book here: https://calendly.com/noklockapp/30min\n— NoKLock\nhello@noklock.app · noklock.app/refer?tab=community-owners",
    note: "Use this when a formal email is appropriate (foundations, larger DAOs, ecosystem programmes). Replace {name} + {community}.",
  },
  {
    id: "cm-pitch-30sec",
    angle: "30-second pitch (verbal / call open / DM follow-up)",
    body:
      "Quick version: NoKLock is self-custodial crypto inheritance on Polygon. Every visitor through your link gets a free vault — 1 vault, seed + sealed letter, 2-of-3 Shamir, full product on one vault. Anyone who upgrades gets 10% off; you earn 10% in USDC on-chain at mint — no claim step. At founder pricing that's roughly $10–$50 per signup depending on tier — 100 mixed signups ≈ $1,800–$2,000 USDC. On top of that, you can pre-commit a slice of your earned USDC to a community contest pool that pays winners once N qualified signups arrive under your wallet. NoKLock never holds the pool — you pay from your wallet and the community verifies on-chain. There's a builder for the cobrand card, the contest, and a per-partner playbook all in the app. Have a look: noklock.app/refer?tab=community-owners.",
    note: "Short enough to actually deliver verbally or DM after they say 'tell me more'.",
  },
  {
    id: "cm-announce-template",
    angle: "Announcement post — partner uses this in THEIR channel after signing on",
    body:
      "📣 New community perk — Refer & Share with NoKLock\n\nNoKLock is self-custodial crypto inheritance — on-chain on Polygon, you never hand over your keys, your heir is designated by wallet or by email. (More: noklock.app)\n\nThe deal for our community:\n• **Every member of this channel gets a free NoKLock vault** via our link — 1 vault, real seed phrase + sealed letter, 2-of-3 Shamir split across your OWN clouds, on-chain inheritance. No signup, no wallet to try. The free vault is for everyone whether you ever upgrade or not.\n• Visiting our link gets you **10% off** every paid NoKLock licence.\n• Every paid signup adds USDC to our shared community pool (10% of what they pay, earned by this channel).\n• Once we hit {N} qualified signups, the pool pays out — {distribution: equal / raffle / weighted}.\n• The prize: {prize}.\n\nHonour-system, on-chain verifiable — anyone can read the channel wallet on PolygonScan and calculate the pool. NoKLock holds nothing; we pay winners directly from our own earned wallet.\n\nOur referral link: {link}\nVerify the contract source: noklock.app/info?tab=contracts",
    note: "Hand this to a partner who's signed on — they fill in {N} / {distribution} / {prize} / {link} from the contest builder's output.",
  },
];

// ── COMMUNITY-OWNER OFFER — PRODUCT-AS-PAYMENT (2026-06-15) ──────────────
// Daniel-locked 2026-06-15: a SECOND, distinct community-owner offer that is
// NOT the 10%-USDC referral framing above (COMMUNITY_MANAGER_OUTREACH).
// THIS offer is the product-reward deal for "cash-only" community operators
// who've heard a million pitches: Premium FREE on joining (unlocks the whole
// Partner Toolkit), upgrading to Premium LIFETIME at 10 signups through their
// referral link. Tone: short, direct, no-fluff — "I know how you work, here's
// a straight offer, the product IS the payment." No upfront, no catch.
// Same ChannelTemplate shape as COMMUNITY_MANAGER_OUTREACH. Surfaced in
// Marketing → Channels under the "Community owners" sub-tab.
export const COMMUNITY_OWNER_OFFER: readonly ChannelTemplate[] = [
  {
    id: "co-tg-dm-straight",
    angle: "Telegram DM — cash-only, straight offer (no upfront)",
    body:
      "Hey {name} — you run {community}, you work cash, and you've heard a million things. Here's a straight one.\n\nJoin NoKLock through my link and Premium is free for you — the whole product, no upfront, no card. That unlocks the Partner Toolkit (cobrand card, contest builder, per-partner playbook).\n\nBring 10 signups off your link and your Premium goes Lifetime. Yours, done, forever.\n\nNo catch. The product is the payment. Want the link?",
    note: "Best opener for a Telegram group owner / Discord admin. Replace {name} + {community}. Leads with respect for how they operate; the offer is the whole message.",
  },
  {
    id: "co-dm-short-generic",
    angle: "Short DM — generic (X / Discord / WhatsApp)",
    body:
      "{name} — no pitch, just the offer: a free Premium NoKLock licence for joining through my link. Full Partner Toolkit unlocked, nothing to pay.\n\nGet 10 signups off your link and it's Premium Lifetime — yours for good.\n\nNo upfront, no card, no catch. The product is the payment. Send the word and I'll drop the link.",
    note: "Tightest version — paste into any 1:1 DM. Replace {name}. Works where Telegram-specific framing doesn't fit.",
  },
  {
    id: "co-email-short",
    angle: "Email — short, cash-only operator (subject + body)",
    body:
      "Subject: Free Premium for {community} — no upfront, product is the payment\n\nHi {name},\n\nYou run {community} and you've seen every referral pitch going. This one's different in one way: nothing to pay, ever.\n\n• Join NoKLock through my link → Premium free, the full product, no card. Unlocks the Partner Toolkit (cobrand card builder, contest builder, per-partner playbook).\n• Bring 10 signups off your link → Premium goes Lifetime. Yours for good.\n\nNo upfront, no catch — the product is the payment. If that's worth two minutes, reply and I'll send your link.\n\n— NoKLock\nhello@noklock.app",
    note: "For owners who prefer email or run a newsletter. Replace {name} + {community}. Keep it short — the appeal is the no-cost offer, not a wall of text.",
  },
  {
    id: "co-channel-blurb",
    angle: "Paste-into-channel blurb — owner announces it themselves",
    body:
      "Sorted a deal for this channel with NoKLock (self-custodial seed store + restore, optional on-chain inheritance).\n\nJoin through our link and Premium is free — the full product, no card, no upfront. Once we hit 10 signups off the link it upgrades to Premium Lifetime for the channel.\n\nThe product is the payment. No catch.\n\nLink: {link}",
    note: "Hand to an owner who's signed on — they paste it in their own channel. Replace {link}. Keeps the cash-only, no-fluff tone the operator will recognise as their own voice.",
  },
];

// LinkedIn — professional voice, estate/fintech framing. No prefilled-message
// URL exists, so these are copy-to-paste.
// ── REFRAME LAUNCH LINKEDIN DMs (2026-05-28 — added to existing array) ──
const REFRAME_LINKEDIN_DMS: readonly ChannelTemplate[] = [
  {
    id: "li-reframe-cold",
    angle: "Reframe launch — protect first / inherit optionally (cold DM)",
    body:
      "Hi {name} — given your work in {field}, you've probably told plenty of people they need to back up their crypto seed phrase. Most haven't — or have it written down somewhere they'll never find again.\n\nNoKLock is self-custodial cryptographic backup: split + encrypt your seed (or sealed letter / doc / image) across YOUR cloud accounts, recover on any browser any time. Inheritance is an optional layer.\n\nSource-verified on Polygon, no provider keys, structurally cannot leak. Worth a look: noklock.app",
    note: "Reframe-pass cold DM. Replace {name} + {field}. Leads with the personal-recovery anxiety, not death.",
  },
  {
    id: "li-reframe-connect",
    angle: "Reframe launch — protect first / inherit optionally (connection-request note ≤300)",
    body:
      "Hi {name} — I work on NoKLock, self-custodial cryptographic backup for crypto seeds + sealed letters + documents. Split across your own clouds, recover on any browser. Optional inheritance layer. Given your work in {field}, I'd value connecting.",
    note: "Reframe-pass version. Fits LinkedIn's 300-char limit. Replace {name} + {field}.",
  },
];

// ── FREE-TIER PUSH LINKEDIN DMs (2026-05-31) ─────────────────────────────
const FREE_PUSH_LINKEDIN_DMS: readonly ChannelTemplate[] = [
  {
    id: "li-free-A-cold-dm",
    angle: "Free-tier push · Set A (text only) — cold DM, trust-before-pay framing",
    body:
      "Hi {name} — given your work in {field}, you've probably had the 'should I trust this crypto-custody product?' conversation more than once. The honest answer most people give is some version of 'I have no real way to tell.'\n\nNoKLock's response is the free tier: the full product on one vault — no signup, no wallet required to try, no time-bombed trial. Seed phrase + sealed letter, encrypted in your browser, 2-of-3 Shamir split across storage you pick — local folders or cloud accounts. Same cryptography as the paid tiers; what you pay for is convenience (duress decoy, document/image vaults, multi-NoK voting, up to 9 share locations).\n\nWorth a few minutes to see how it actually behaves before recommending anything to anyone: noklock.app",
    note: "Set A — text only. Replace {name} + {field}. Frames the free vault as the trust-establishment step rather than a sales funnel.",
  },
  {
    id: "li-free-B-post-with-graphic",
    angle: "Free-tier push · Set B (with viz link + graphic) — LinkedIn post or post-connect DM",
    body:
      "Sharing something that might be relevant to {field}.\n\n[ATTACH: /share-cards/free-tier-card-1200x675.png — drag-drop attach when posting; LinkedIn renders it inline]\n\nNoKLock is self-custodial cryptographic backup (seed phrases, sealed letters, with optional on-chain inheritance). The free tier isn't a teaser — it's the full product on one vault: real Argon2id, real Shamir 2-of-3, real soulbound-NFT inheritance, real dead-man's switch. What you pay for is feature breadth (duress decoy, doc/image vaults, multi-NoK voting, more share locations).\n\nTo skip the marketing and look at the underlying crypto: noklock.app/viz/pipeline?fs=1 runs the actual end-to-end pipeline in your browser. Free vault: noklock.app\n\nHappy to set up 15 minutes if any of this is useful to your work.",
    note: "Set B — works as a public LinkedIn POST (attach the card) or as a post-connect DM (attach OR link the card). Replace {field}. Viz link opens chromeless fullscreen overlay.",
  },
];

// ── PROVE-IT LAUNCH LINKEDIN DMs (2026-05-30) ────────────────────────────
const PROVEIT_LINKEDIN_DMS: readonly ChannelTemplate[] = [
  {
    id: "li-proveit-airgap-longform",
    angle: "Prove-It launch — airgap proof long-form (cold DM / post)",
    body:
      "Built a thing that needed building.\n\nSelf-custodial crypto products universally claim \"we never see your seed\". The honest user response is: how would I know?\n\nNoKLock's new /prove-it/airgap page answers that. It runs a live network-watch terminal that records every network event the browser makes. Alongside it: four \"test fire\" buttons (fetch, Image.src, WebSocket, sendBeacon) that deliberately try to exfiltrate. Every attempt bounces off the page's airgap firewall in real time and shows up as blocked.\n\nThe kicker: open your browser's own DevTools Network tab next to it. What you see in the terminal should match what the browser sees — because we don't write what DevTools shows you, the browser engine does. Two independent observers, both reading zero.\n\nIf they ever disagree, that's a real leak and a bug bounty. We can be wrong; the browser can't be wrong about its own network activity.\n\nThis is what \"trustless\" actually has to look like in a consumer product. Not \"trust the brand\" — trust the demo you ran 30 seconds ago, in the browser you already use.\n\nnoklock.app/prove-it/airgap",
    note: "Prove-It launch. Long-form LinkedIn post or post-connect DM. Best for security/fintech audience.",
  },
  {
    id: "li-proveit-hub-summary",
    angle: "Prove-It launch — 6-proof hub summary (post-connect DM)",
    body:
      "Hi {name} — shipped something I thought might interest you given your work in {field}.\n\nNoKLock's /prove-it is now a hub for 6 live, browser-verifiable demonstrations of our core security claims: the math (real crypto round-trip), the airgap (zero network calls during seed entry), the chain continues without us (6 contracts + Chainlink keeper + RPC fallback), the build matches GitHub (runtime hash compare + reproduce one-liner), the entropy (chi-square byte test on real ciphertext), and the source (the 9-channel firewall + synchronous .fill(0) memory wipe of every byte we derive from your seed — bundled inline so opening the modal makes zero network calls).\n\nEverything runs in your browser. The premise: you shouldn't have to take a self-custodial product's word for anything.\n\nWorth 5 minutes if the topic's relevant: noklock.app/prove-it",
    note: "Prove-It launch. Replace {name} + {field}. Short-form DM for already-connected contacts.",
  },
];

export const LINKEDIN_DMS: readonly ChannelTemplate[] = [
  ...FREE_PUSH_LINKEDIN_DMS,
  ...PROVEIT_LINKEDIN_DMS,
  ...REFRAME_LINKEDIN_DMS,
  {
    id: "li-estate",
    angle: "Estate-planning / wealth advisor",
    body:
      "Hi {name} — I work with estate professionals on a problem that's getting harder to ignore: digital assets, specifically crypto, in estate plans. When a client holds self-custodied crypto, traditional wills often can't deliver it — the keys aren't in the plan.\n\nNoKLock is a self-custodial tool that lets a holder designate heirs and have the assets transfer on-chain after a verifiable period of inactivity — without anyone (including us) ever holding the keys. It also supports heirs who aren't crypto-native.\n\nWould you be open to a short call? I'd value your perspective on where this fits alongside conventional estate planning.",
    note: "Replace {name}. Formal, advisory tone — they're professionals, not degens.",
  },
  {
    id: "li-fintech",
    angle: "Fintech / crypto professional",
    body:
      "Hi {name} — given your background in {field}, I thought this might interest you. NoKLock is self-custodial crypto inheritance: an on-chain dead-man's switch (Chainlink Automation on Polygon) hands a vault to designated heirs, with soulbound-NFT records and an email path for non-crypto family. Six source-verified contracts; the protocol keeps working even if the company doesn't. I'd welcome your read on the model. noklock.app/info?tab=contracts",
    note: "Replace {name} and {field}. Slightly more technical than the estate version.",
  },
  {
    id: "li-connect-note",
    angle: "Connection-request note (≤300 chars)",
    body:
      "Hi {name} — I work on NoKLock, self-custodial crypto inheritance (assets pass to heirs on-chain, no one holds the keys). Given your work in {field}, I'd value connecting and hearing your perspective. Thanks!",
    note: "LinkedIn caps connection notes at 300 chars — this fits. Keep it short.",
  },
  {
    id: "li-followup",
    angle: "Post-connect follow-up",
    body:
      "Thanks for connecting, {name}. Quick context on why I reached out: most people with crypto have no workable plan for passing it on, and traditional estate tools can't move self-custodied keys. NoKLock solves that on-chain without custody — and supports heirs who've never used a wallet. If it's relevant to your world I'd love 15 minutes; if not, no worries at all. noklock.app/crypto-inheritance",
    note: "Send a day or two after they accept — never paste the pitch into the request itself.",
  },
];

// ── CATEGORISED TWEET SETS (2026-06-02) ──────────────────────────────────
// Daniel: organise the Marketing → Tweets surface into sub-tabs by theme.
// Each array below is one sub-tab's worth of fresh, session-grounded tweets.
// Rules: <=280 chars body. No hashtags inside the body (X compose pre-fills
// them via the Tweets card). Human voice — no AI slop, no em-dash overdose,
// no "in a world where" openers. Every claim maps to a real shipped property.

// 1. SECURITY — the foundational crypto. Shamir, Argon2id, AEAD, airgap.
const SECURITY_TWEETS: readonly ChannelTemplate[] = [
  {
    id: "sec-shamir-impossible",
    angle: "Shamir — mathematically impossible below threshold (224 chars)",
    body:
      "Below your recovery threshold, NoKLock's secret-split is mathematically impossible to break.\n\nNot with today's computers. Not with a quantum one. Not ever.\n\nThat's not marketing. It's the math behind Shamir's Secret Sharing.\n\nnoklock.app/prove-it",
    note: "The killer Shamir statement. Lead with this whenever the conversation turns to 'but quantum'.",
  },
  {
    id: "sec-argon2id",
    angle: "Argon2id — the password-hash you actually want (236 chars)",
    body:
      "Your master password never leaves your browser.\n\nWe stretch it with Argon2id (the same password-hash winner used by 1Password and Bitwarden) before it touches a single byte of your seed.\n\nA 30-character passphrase is a wall, not a door.\n\nnoklock.app/prove-it",
    note: "Argon2id name-drop carries weight with security people. Pairs well with the Shamir tweet.",
  },
  {
    id: "sec-aead-pedigree",
    angle: "AEAD — Signal / TLS / WireGuard pedigree (243 chars)",
    body:
      "The cipher wrapping each of your Shamir shares is the same AEAD primitive that runs inside TLS, Signal, and WireGuard.\n\nWe didn't invent any crypto. We assembled crypto that already protects everything you do online, and pointed it at your seed phrase.",
    note: "Defuses the 'rolled their own crypto' suspicion. Honest framing.",
  },
  {
    id: "sec-airgap-runtime",
    angle: "Airgap — proved live in your DevTools (256 chars)",
    body:
      "Open /prove-it/airgap. Open your browser DevTools next to it.\n\nFire all four exfil channels: fetch, Image, WebSocket, sendBeacon. Watch every one bounce off the firewall in BOTH our terminal and your DevTools.\n\nTwo observers. Same zero. We can't fake the browser.",
    note: "Run-it-yourself proof. The most viscerally convincing security tweet we ship.",
  },
  {
    id: "sec-memory-wipe",
    angle: "Memory wipe — what we can and can't do (270 chars)",
    body:
      "Honest about JavaScript: strings can't be synchronously wiped from memory. No JS API exists for it.\n\nBut every Uint8Array we derive from your seed — entropy, Argon2id key, HKDF PRK, share plaintexts, signing seed — is .fill(0)'d the moment it's no longer needed.\n\nnoklock.app/prove-it/source",
    note: "Disarms the 'but JavaScript' objection by naming what we can't do alongside what we can.",
  },
  {
    id: "sec-no-honeypot",
    angle: "No data, no honeypot (199 chars)",
    body:
      "NoKLock collects no name. No email (unless you opt in for inheritance). No KYC. No usage analytics tied to your seed.\n\nThere is no honeypot for an attacker to breach. Because there is nothing to breach.",
    note: "Reframes 'no data' as the security feature it actually is.",
  },
  {
    id: "sec-ed25519-manifest",
    angle: "Ed25519 manifest — tamper-evident shares (244 chars)",
    body:
      "Every share file you download is fingerprinted with an Ed25519 signature in a bundled manifest.\n\nIf a single byte of a share is corrupted, swapped, or forged, restore refuses to proceed and tells you which share is bad. Tamper-evident by construction, not by trust.",
    note: "Most users don't know what Ed25519 is, but security people do. Honest detail that holds up.",
  },
  {
    id: "sec-12-step-pipeline",
    angle: "12-step pipeline visualised end to end (231 chars)",
    body:
      "Most crypto products are a black box.\n\nNoKLock ships a 12-step viz of the actual pipeline — BIP-39 entropy through Argon2id, Shamir, AEAD, manifest, restore, round-trip. Run it in your browser before you write a single thing down.\n\nnoklock.app/viz/pipeline?fs=1",
    note: "Bridges security to the new pipeline viz. Try-before-you-trust.",
  },
];

// 2. INHERITANCE — NoK flows, dead-man / live-man / heir-claim mechanics.
const INHERITANCE_TWEETS: readonly ChannelTemplate[] = [
  {
    id: "inh-owner-cancel-window",
    angle: "Owner cancel-window — 48h false-positive guard (266 chars)",
    body:
      "What if your heartbeat fails because you're on vacation, not because you're dead?\n\nNoKLock's owner cancel-window gives you 48 hours to abort a false-positive activation before any heir notification goes out.\n\nConfigurable from 0 to 168 hours. Your switch, your timing.",
    note: "Calms the 'what if it triggers wrongly' worry — which is the #1 question we get.",
  },
  {
    id: "inh-mn-quorum",
    angle: "M-of-N heir quorum (211 chars)",
    body:
      "One heir going rogue shouldn't be able to claim your vault.\n\nNoKLock supports M-of-N heir voting on-chain — 2-of-3, 3-of-5, whatever you set. The contract enforces the quorum; we can't override it even if we wanted to.\n\nMulti-sig for inheritance.",
    note: "Speaks to the 'what if my brother is shady' concern without naming brothers.",
  },
  {
    id: "inh-live-mans-switch",
    angle: "Live-man's switch — owner veto on activation (243 chars)",
    body:
      "Two-way safety: the dead-man's switch fires if you stop checking in. The LIVE-man's switch lets YOU veto an activation in flight, from your wallet, any time before the window closes.\n\nFalse positives are not catastrophes here. They're a notification you ignore.",
    note: "Names the live-man's switch (shipped 2026-05-25). Most competitors only have one direction.",
  },
  {
    id: "inh-heir-by-email",
    angle: "Heir-by-email (Hybrid-E) — non-crypto family (227 chars)",
    body:
      "Your heir doesn't use crypto? Most don't.\n\nDesignate them by email. At claim time they're walked through wallet setup and inheritance receipt — no seed phrase handed around, nothing custodial, nothing for them to lose before they understand.",
    note: "Bridges to the mainstream crowd. Real shipped feature, not aspirational.",
  },
  {
    id: "inh-owner-self-restore",
    angle: "Owner self-restore — you inherit from yourself (218 chars)",
    body:
      "The same on-chain machinery that hands your vault to an heir lets YOU restore your own vault if you lose your device.\n\nYou are your own primary heir. Inheritance isn't only for after you're gone — it's for tomorrow morning when your laptop won't boot.",
    note: "Reframes inheritance as personal disaster-recovery. Widens the audience by an order of magnitude.",
  },
  {
    id: "inh-chainlink-keeper",
    angle: "Chainlink Automation — the switch that survives us (235 chars)",
    body:
      "The thing that decides whether your inheritance fires isn't a NoKLock server. It's Chainlink Automation, pinging an immutable contract on Polygon.\n\nIf NoKLock the company vanishes tomorrow, your switch still fires. Your heir still inherits. The chain doesn't need us.",
    note: "Strongest 'survives us' angle. Verifiable on PolygonScan.",
  },
  {
    id: "inh-passkey-post-create",
    angle: "Passkey after vault creation — no seed for the everyday (252 chars)",
    body:
      "Once your vault is created and split, day-to-day access uses a passkey on your device.\n\nThe seed phrase is for one job: rebuilding the vault from your share files. The rest of the time, it's Touch ID / Windows Hello — same UX as your bank app, none of the custody.",
    note: "Names the passkey-post-creation feature. Bridges the seed-fear gap for non-crypto users.",
  },
];

// 3. REFRAME — positioning shifts. Beyond/above/before the password manager.
const REFRAME_TWEETS: readonly ChannelTemplate[] = [
  {
    id: "ref-above-beyond-before",
    angle: "Beyond the wallet, above the password manager, before the lawyer (200 chars)",
    body:
      "Beyond the wallet.\n\nAbove the password manager.\n\nBefore the lawyer.\n\nNoKLock is the layer most people didn't know they needed — until they tried to leave instructions for their crypto.\n\nnoklock.app",
    note: "Anchor positioning tweet. Use as a quote-retweet hook on competitor announcements.",
  },
  {
    id: "ref-not-1password",
    angle: "We don't replace 1Password (210 chars)",
    body:
      "We don't replace 1Password. We sit above it.\n\n1Password keeps your logins. NoKLock keeps the thing your logins can never recover — your seed phrase, sealed letters, the keys to assets that don't have a 'forgot password' link.",
    note: "Complementary-to-password-managers framing. Disarms the 'aren't you just a worse 1Password' question.",
  },
  {
    id: "ref-not-wallet",
    angle: "We don't replace your wallet (197 chars)",
    body:
      "We're not a wallet. Keep your Ledger. Keep your MetaMask.\n\nNoKLock is what stops you losing the seed that backs them — and what hands it to your family if you can't.\n\nWallets hold keys. We hold what you'd lose without the keys.",
    note: "Disarms the 'aren't you just another wallet' confusion. Compatible-with-everything framing.",
  },
  {
    id: "ref-protect-first-inherit-later",
    angle: "Protect first, inherit later (276 chars)",
    body:
      "Most people don't worry about dying.\n\nThey worry about losing a seed phrase. Or someone else finding it.\n\nNoKLock does the first job first: split, encrypt, spread your seed across YOUR own storage (folders or cloud — your call). Inheritance is optional — add later, or never.",
    note: "Lead with the everyday anxiety, not death. The reframe-launch anchor. 2026-06-07: softened from 'YOUR clouds' → 'YOUR own storage (folders or cloud — your call)' per BOTH-options decision.",
  },
  {
    id: "ref-not-custody",
    angle: "We are not a custody product (215 chars)",
    body:
      "There is no 'NoKLock holds your seed' configuration.\n\nThere is no 'in case of emergency, ask NoKLock' button.\n\nWe never see your seed. Not in flight, not at rest, not in a backup, not in a log. The architecture makes it impossible.\n\nnoklock.app/prove-it",
    note: "Hard line for the self-custody crowd. Backed by /prove-it/airgap.",
  },
  {
    id: "ref-not-lawyer",
    angle: "Before the lawyer — what a will can't do (260 chars)",
    body:
      "Your will can leave your wallet to your kids. It can't tell them the seed phrase.\n\nNoKLock fills the gap a will physically can't — moving the keys, not just the legal title. Use both. The lawyer handles the estate; we handle the math the lawyer can't touch.",
    note: "Complementary-to-lawyer framing. Estate professionals find this version palatable.",
  },
  {
    id: "ref-not-vault12",
    angle: "Honest vs Vault12 / Casa / Coincover (244 chars)",
    body:
      "Casa builds vaults for your heirs.\nVault12 backs up for your heirs.\nCoincover offers paid recovery.\n\nNoKLock starts somewhere else: protect it for YOURSELF first. A working store + restore for seeds and sealed letters. Heirs are an optional layer.",
    note: "Direct competitor naming. Use sparingly — earns goodwill from a self-custody audience that's tired of vague positioning.",
  },
];

// 4. NEW FEATURES — recent shipped (12-step viz, M-of-N, cancel-window, etc).
const NEW_FEATURES_TWEETS: readonly ChannelTemplate[] = [
  {
    id: "nf-12-step-pipeline",
    angle: "12-step pipeline viz with publish + mint as the only online moments (271 chars)",
    body:
      "Shipped: a 12-step viz of NoKLock's entire crypto pipeline.\n\nOnly 2 of the 12 steps touch the network — publish-manifest and nok-mint. The rest happens in your browser, in front of you.\n\nA sim-airgap mood toggle shows you what's online vs local in real time.\n\nnoklock.app/viz/pipeline?fs=1",
    note: "Anchor for the new viz pipeline launch. Names the 2 online moments explicitly.",
  },
  {
    id: "nf-mn-quorum-shipped",
    angle: "M-of-N quorum shipped (210 chars)",
    body:
      "Shipped: on-chain M-of-N heir voting.\n\nSet your quorum (2-of-3, 3-of-5, up to 9-of-9), and the contract enforces it. No single heir can claim your vault alone unless you set it that way on purpose.\n\nMulti-sig logic, inheritance flavour.",
    note: "Standalone feature-ship tweet for M-of-N.",
  },
  {
    id: "nf-cancel-window",
    angle: "Owner cancel-window shipped (264 chars)",
    body:
      "Just deployed: owner cancel-window.\n\n48 hours by default to veto a false-positive activation before any heir notification email goes out.\n\nConfigurable 0-168h. Set it to 0 if you trust your heartbeat; set it to 168 if your heartbeat is 'I'm on a 7-day silent retreat'.",
    note: "Day-1 honest note style. Real shipped feature 2026-05-XX.",
  },
  {
    id: "nf-self-restore",
    angle: "Owner-self-restore landed (243 chars)",
    body:
      "Shipped: owner-self-restore.\n\nThe same on-chain machinery that delivers your vault to an heir now lets YOU restore your own vault — no heir involved, no waiting period, no dead-man's switch firing.\n\nYou are your own primary heir. Inheritance is also disaster recovery.",
    note: "Re-frames inheritance as personal DR. Strong tweet on its own.",
  },
  {
    id: "nf-passkey-post-create",
    angle: "Passkey added after vault creation (238 chars)",
    body:
      "Shipped: passkey enrolment after vault creation.\n\nDay-one you write down a seed and split it. Day-two onwards, NoKLock unlocks with Touch ID / Windows Hello / your security key. The seed sits in the share files where it belongs.\n\nNo seed UX for the everyday case.",
    note: "Names the post-creation passkey flow. The 'best of both' bridge.",
  },
  {
    id: "nf-hero-rewrite",
    angle: "Hero rewrite — what the homepage actually says now (218 chars)",
    body:
      "Rewrote the NoKLock homepage hero this week.\n\nDropped the word 'inheritance' from the headline. Lead with what every visitor actually wants: a seed phrase you can't lose and nobody else can read.\n\nInheritance is the optional second layer.\n\nnoklock.app",
    note: "Process-transparency tweet. Honest about a positioning shift, lands well with founders watching.",
  },
  {
    id: "nf-source-proof-page",
    angle: "Source proof page — the deepest proof yet (252 chars)",
    body:
      "Shipped: /prove-it/source.\n\nThe 9-channel browser-exfil firewall AND the synchronous memory wipe of every byte we derive from your seed — both bundled inline so opening the modal doesn't itself make a network call.\n\nThe proof works while the airgap is engaged.",
    note: "Names the new /prove-it/source page from this session. Strongest tweet for the security-savvy.",
  },
];

// 5. MANAGED SERVICE — coming-soon teasers for Managed mode + digital legacy.
const MANAGED_SERVICE_TWEETS: readonly ChannelTemplate[] = [
  {
    id: "ms-coming-soon-teaser",
    angle: "Managed mode coming-soon — email sign-in / no seed (273 chars)",
    body:
      "Coming soon to NoKLock: Managed mode.\n\nEmail sign-in. Embedded wallet. No seed phrase to write down. Heir claim by email.\n\nFor everyone in your life who would never set up a hardware wallet but still has crypto worth leaving behind.\n\n(Self-custody users untouched — both modes coexist.)",
    note: "The honesty footer is the bit that lands with the OG self-custody crowd. Don't drop it.",
  },
  {
    id: "ms-digital-legacy-pitch",
    angle: "Digital legacy for non-crypto users (236 chars)",
    body:
      "Most people who'll be left behind don't use crypto.\n\nManaged-mode NoKLock is for them: a clean email-and-password account that becomes their inheritance vault. No seed. No wallet. Just a way to receive the assets when the time comes.\n\nComing soon.",
    note: "Bridges to the non-crypto audience. Same product, different surface.",
  },
  {
    id: "ms-coexist-honest",
    angle: "Self-custody untouched (224 chars)",
    body:
      "Managed mode is coming. Self-custody users will not lose a single byte of control.\n\nThe two modes are separate code paths. Separate contracts. Separate guarantees. Pick the one you want; the other one cannot touch you.\n\nNoKLock stays NoKLock.",
    note: "Calms the OG self-custody crowd before they panic about a managed-mode launch.",
  },
  {
    id: "ms-family-reach",
    angle: "Reach the rest of your family (213 chars)",
    body:
      "You self-custody. Your partner doesn't. Your parents definitely don't.\n\nManaged-mode NoKLock means the people in your life who'll never run a hardware wallet can still be in your inheritance plan.\n\nOne family, two modes, one outcome.",
    note: "Family-network angle. Sells the managed mode without selling out self-custody.",
  },
  {
    id: "ms-email-claim-flow",
    angle: "Heir claim by email — the flow non-crypto people actually do (266 chars)",
    body:
      "What a non-crypto heir does in Managed mode:\n\n1. Opens an email.\n2. Clicks a link.\n3. Sets a password.\n4. The vault is theirs.\n\nNo seed phrase. No wallet setup. No 'what's a private key'. The crypto rails are still doing the work — they just never see the rails.\n\nComing soon.",
    note: "Numbered list reads well on X. Don't oversell — 'coming soon' is the honest tag.",
  },
];

// 6. LAUNCH — Day-1 honest-note style milestone tweets.
const LAUNCH_TWEETS: readonly ChannelTemplate[] = [
  {
    id: "lnch-cancel-window-deployed",
    angle: "Day-1 honest note — owner cancel-window deployed (256 chars)",
    body:
      "We just deployed owner cancel-window.\n\n48 hours to abort a false-positive activation. Heir notification email holds until the window closes. Configurable to 0-168h.\n\nReal shipped contract, on Polygon, source-verified. Worth a minute: noklock.app/info?tab=contracts",
    note: "Day-1 honest-note voice. Names what shipped, when, where to verify.",
  },
  {
    id: "lnch-12-step-viz",
    angle: "Day-1 honest note — 12-step pipeline viz live (244 chars)",
    body:
      "Live: a 12-step viz of NoKLock's full crypto pipeline.\n\nTwo network moments (publish-manifest, nok-mint). Ten local moments. A sim-airgap toggle so you can see what would happen if the network vanished mid-flow.\n\nnoklock.app/viz/pipeline?fs=1",
    note: "Day-1 honest note for the pipeline viz launch.",
  },
  {
    id: "lnch-source-page-live",
    angle: "Day-1 honest note — /prove-it/source live (242 chars)",
    body:
      "Live: /prove-it/source.\n\nThe airgap firewall source AND the memory-wipe source, bundled inline so the proof doesn't itself need a network call. Plus an honest writeup of what JS can and can't do with strings.\n\nnoklock.app/prove-it/source",
    note: "Day-1 honest note. Pairs with the airgap-lead tweet from the prove-it set.",
  },
  {
    id: "lnch-mn-quorum-live",
    angle: "Day-1 honest note — M-of-N quorum live (224 chars)",
    body:
      "Live: M-of-N heir-quorum enforcement.\n\nSet 2-of-3 or 3-of-5 or 9-of-9. The contract holds. No single heir can claim alone unless that's what you specified.\n\nSource-verified on Polygon: noklock.app/info?tab=contracts",
    note: "Day-1 honest note for the M-of-N feature.",
  },
  {
    id: "lnch-self-restore-live",
    angle: "Day-1 honest note — owner-self-restore live (231 chars)",
    body:
      "Live: owner-self-restore.\n\nLost your device? Open Restore on any browser. Bring K share files + your master password. The vault rebuilds — no heir involved, no waiting, no dead-man trigger required.\n\nYou are your own primary heir.",
    note: "Day-1 honest note. Foregrounds the personal-DR use case.",
  },
  {
    id: "lnch-passkey-live",
    angle: "Day-1 honest note — passkey enrolment live (227 chars)",
    body:
      "Live: passkey enrolment after vault creation.\n\nDay-one: write the seed, split the shares. Day-two onwards: Touch ID / Windows Hello / your security key.\n\nBank-app convenience. None of the custody.\n\nnoklock.app",
    note: "Day-1 honest note for the passkey-post-creation flow.",
  },
  {
    id: "lnch-hero-rewrite",
    angle: "Day-1 honest note — homepage hero rewritten (213 chars)",
    body:
      "Rewrote the homepage hero today.\n\nFirst headline used to lead with inheritance. The new one leads with what every visitor actually wants first: a seed you can't lose and nobody else can read.\n\nnoklock.app",
    note: "Process-transparency tweet. Owns the positioning shift in public.",
  },
];

// 7. COMMUNITY — for the people who RUN a crypto community. Promotes the
//    Partner Toolkit + the product-as-payment offer (Premium free on joining,
//    Premium Lifetime at 10 signups). Cash-only, no-fluff voice. Distinct from
//    the 10%-USDC referral framing in COMMUNITY_MANAGER_OUTREACH.
const COMMUNITY_TWEETS: readonly ChannelTemplate[] = [
  {
    id: "com-product-is-payment",
    angle: "Product-as-payment — the whole offer in one tweet (233 chars)",
    body:
      "Run a crypto community? Straight offer, no fluff:\n\nJoin NoKLock through your link → Premium free. The full product, no card, no upfront.\n\nBring 10 signups off your link → it goes Premium Lifetime.\n\nThe product is the payment. No catch.\n\nnoklock.app",
    note: "Anchor tweet for the community-owner offer. Leads with the deal, ends with the no-catch line.",
  },
  {
    id: "com-toolkit-unlock",
    angle: "Free Premium unlocks the Partner Toolkit (241 chars)",
    body:
      "Free Premium for community owners isn't just a licence — it unlocks the Partner Toolkit:\n\n• Cobrand card builder (your logo × NoKLock)\n• Refer & Share contest builder\n• Per-partner playbook you can hand to your channel\n\nFree on joining. Lifetime at 10 signups.\n\nnoklock.app",
    note: "For owners who want to know what 'Premium' actually gets them. Names the three toolkit pieces.",
  },
  {
    id: "com-no-upfront",
    angle: "No upfront — for operators tired of pay-to-play (214 chars)",
    body:
      "Tired of 'partner programmes' that want money up front?\n\nNoKLock's is the opposite: Premium free the day you join through your link. Bring 10 signups and it's yours for life.\n\nNothing to pay. The product is the payment.\n\nnoklock.app",
    note: "Speaks to the cash-only operator who's been burned by upfront-fee schemes. Honest contrast.",
  },
  {
    id: "com-lifetime-at-ten",
    angle: "Lifetime at 10 — the milestone framed plainly (199 chars)",
    body:
      "Ten signups off your link and your NoKLock Premium goes Lifetime. Done. Forever.\n\nNo renewals, no fine print, no clawback. Hit the number, keep the product.\n\nThat's the whole deal.\n\nnoklock.app",
    note: "Foregrounds the 10-signups → Lifetime milestone for owners who want the bottom line.",
  },
  {
    id: "com-i-know-how-you-work",
    angle: "I know how you work — respect-first opener (236 chars)",
    body:
      "To the people who actually run crypto communities: I know you work cash and you've heard a million pitches.\n\nSo here's a clean one. Premium free on joining. Premium Lifetime at 10 signups. No upfront, no card, no catch.\n\nThe product is the payment.\n\nnoklock.app",
    note: "Respect-first voice that mirrors the DM templates. Good as a quote-retweet hook in operator circles.",
  },
];

// Categorised tweet sets — surfaced via the Marketing → Tweets sub-tabs.
export type TweetCategory =
  | "security"
  | "inheritance"
  | "reframe"
  | "new-features"
  | "managed-service"
  | "community"
  | "launch";

export const TWEET_CATEGORY_LABEL: Record<TweetCategory, string> = {
  "security":         "Security",
  "inheritance":      "Inheritance",
  "reframe":          "Reframe",
  "new-features":     "New features",
  "managed-service":  "Managed service",
  "community":        "Community owners",
  "launch":           "Launch",
};

export const TWEET_CATEGORY_BLURB: Record<TweetCategory, string> = {
  "security":         "Foundational crypto. Shamir, Argon2id, AEAD, airgap, memory wipe — the honest version of every claim.",
  "inheritance":      "NoK flows. Cancel-window, M-of-N quorum, live-man's switch, heir-by-email, owner-self-restore.",
  "reframe":          "Beyond the wallet, above the password manager, before the lawyer. We sit above 1Password, not against it.",
  "new-features":     "Recently shipped: 12-step pipeline viz, M-of-N quorum, owner cancel-window, owner-self-restore, passkey post-creation, hero rewrite.",
  "managed-service":  "Coming-soon teasers. Email sign-in. Embedded wallet. No seed to write down. Self-custody users untouched.",
  "community":        "For the people who RUN a crypto community. The Partner Toolkit + the product-as-payment offer: Premium free on joining, Premium Lifetime at 10 signups.",
  "launch":           "Day-1 honest notes. What shipped, when, where to verify on-chain.",
};

export const TWEETS_BY_CATEGORY: Record<TweetCategory, readonly ChannelTemplate[]> = {
  "security":         SECURITY_TWEETS,
  "inheritance":      INHERITANCE_TWEETS,
  "reframe":          REFRAME_TWEETS,
  "new-features":     NEW_FEATURES_TWEETS,
  "managed-service":  MANAGED_SERVICE_TWEETS,
  "community":        COMMUNITY_TWEETS,
  "launch":           LAUNCH_TWEETS,
};

