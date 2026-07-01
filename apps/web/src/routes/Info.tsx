// @version 0.9.3 @date 2026-06-14
// 0.9.3 — Daniel 2026-06-14: NEW Architecture sub-tab "Third-party interfaces"
//         (ThirdPartyInterfacesArchSection). One card per outside specialist
//         (Chainlink Automation / JSON-RPC proxy / WalletConnect / storage
//         providers / SMTP — always-on; Privy / Paddle / Pimlico — managed-only,
//         dark) with Why / What-it-sees / What-it-can't-see / Security-&-anon.
//         Content code-verified per integration (research workflow, 9 agents);
//         honest bounds kept verbatim — no overstated security/anon claims.
//         ArchSub union + ARCH_SUBS extended; dispatch added at the arch render.
// @version 0.9.2 @date 2026-06-14
// 0.9.2 — Daniel 2026-06-14: beef up AboutFounderCard (About NoKLock tab). New
//         lead paragraph — the founder's depth/longevity (40+ years from the
//         foundations: math / OS / network protocols → very-large-scale
//         architecture, $250–500M programmes, IT strategy for Accenture-scale
//         consultancies + a multi-billion-dollar national state oil company; 15y
//         independent advisory; 15y across London/Germany/Switzerland startups,
//         judging at MassChallenge; blockchain since 2017) tied to the "cold,
//         checkable math, human-in-control" thesis. Existing first-person note
//         retained but its opening "Twenty-five years … a decade in blockchain"
//         numbers dropped (the new lead supersedes them) — kept the "breaks in
//         the assumptions, not the cryptography" insight. English-authoritative
//         (no new locale keys — the founder voice stays English, like the rest
//         of this card). Company kept generic (no proper noun).
// @version 0.9.1 @date 2026-06-12
// 0.9.1 — Daniel 2026-06-12: NEW Architecture sub-tab "Roadmap" inserted
//         between "Managed mode" and "Why it matters". New RoadmapArchSection
//         component (below ManagedModeArchSection) renders five horizontal
//         phase cards (done ✓ / "you are here" pulsing dot / planned ring):
//         Foundation (Shamir SLIP-39 + Argon2id + AEAD, ERC-5192 SBT,
//         contracts on Polygon PoS, "first-round Swiss patent application
//         accepted" foundational milestone), First release (store + restore
//         live + heir-designation framework), Launch / you-are-here (store +
//         restore + OPTIONAL inheritance, hardened wallet connection, owner-
//         signed ops), Next (Google Play TWA, managed mode, "US patent
//         application in progress"), Future (multi-chain, dead-man's-switch
//         redundancy, managed-wallet redundancy, enterprise/multi-tenant
//         identity teaser). Detail section below the cards expands WHY multi-
//         chain, dead-man's-switch redundancy (Chainlink primary + Gelato/
//         self-hosted fallback), and managed-wallet redundancy (Privy primary
//         + passkey/secure-element hardening + alternates under evaluation).
//         PUBLIC-SAFE: no pricing, no infra/provider contracts, no tenant/
//         brand names, no "provisional/granted/patented". Positioning stays
//         store+restore FIRST with OPTIONAL inheritance. ARCH_SUBS array +
//         ArchSub union extended; dispatch added at the architecture render.
// @version 0.9.0 @date 2026-06-08
// 0.9.0 — Daniel 2026-06-08 round-5: NEW Architecture sub-tab "Managed mode"
//         inserted between FSM and "Why it matters" sub-tabs. New
//         ManagedModeArchSection component (below FSMArchSection) covers:
//         self-vs-managed difference (side-by-side diagram), what each party
//         holds (Privy / Paddle / NoKLock / You — 4-row table with explicit
//         "does NOT hold" column), disappearance resilience ("your app lives
//         on" — vault contents in user-controlled storage, on-chain trigger,
//         Privy export = self-custody escape hatch, client-side restore, Form
//         B replaceable), and the explicit honest claim ("NoKLock sees
//         nothing about your vault contents. Touches no private keys. Stores
//         no plaintext email, card details, or seed phrase — in either
//         mode."). Cloudflare Worker Secrets noted as off-box vault for the
//         admin payment-config encryption key. ARCH_SUBS array extended +
//         dispatch added at line 1166.
// @version 0.8.9 @date 2026-06-08
// 0.8.9 — Daniel 2026-06-08 (handoff §3 positioning sweep, three more sites):
//         (a) NoKLock-disappears FAQ answer "your shares live in your own
//         cloud accounts" → "in storage you pick — local folders or your own
//         cloud accounts"; (b) Component-view diagram caption "the storage
//         providers are your accounts" → "the storage you pick — local
//         folders or your accounts — is yours"; (c) Secure-Element comparison
//         body "distributed across N independent storage providers you choose"
//         → "distributed across N independent local folders or storage
//         providers you choose". All three now match the simple-vs-max
//         framing landed in 0.8.8 + Landing 0.22.0 + Enrol Step B + Help.
// @version 0.8.8 @date 2026-06-07
// 0.8.8 — Daniel 2026-06-07: positioning sweep §3.1 + §3.2 (handoff
//         2026-06-07-audit-findings). Self-custodial Architecture body
//         line rewritten to name BOTH the simple route (local folders)
//         and the maximum-security route (own cloud accounts via share
//         URLs) — replaces the cloud-only "Encrypted shares live in your
//         own cloud accounts via share URLs you control" line. NEW top-
//         of-Shares-tab "Two routes — pick what fits you today" callout
//         mirroring Enrol Step B 2.13.0 (same cyan-bordered card pattern
//         from Landing 0.22.0). NEW SEARCH_INDEX entry for the simple
//         route so users searching "folder" or "local" land on Shares.
//         No schema change; provider catalog untouched.
// @version 0.8.7 @date 2026-06-05
// 0.8.7 — Daniel 2026-06-05: compact "Deeper comparison" link card added
//         to the top of the Competitors tab, linking to /compare. Lists
//         the rivals covered (Casa, Vault12, Inheriti, Ledger Recover,
//         Nunchuk, Unchained, Sarcophagus + digital-legacy + managed-
//         wallet) so visitors who land here from search realise the
//         deeper head-to-head matrix exists. Sized compact — sits above
//         AskAnAI without pushing CompetitorTable below the fold.
// @version 0.8.6 @date 2026-06-05
// 0.8.6 — Daniel 2026-06-05: NEW "Why your seed doesn't live in the Secure
//         Enclave" card inside the Security model sub-tab. Explains the
//         technical reason hardware Secure-Element storage is the wrong
//         fit for a recoverable seed (keys not exportable from the chip
//         by design → seed dies with the device), and why the distributed-
//         shares model (Argon2id + Shamir GF(256) 3-of-5 + AEAD over
//         provider-of-your-choice storage) is the alternative. Placed
//         before the existing "We don't carry insurance" card so the two
//         competitor-context cards sit adjacent.
// @version 0.8.5 @date 2026-06-04
// 0.8.5 — Daniel 2026-06-04: NEW <AboutFounderCard /> in About tab — placed
//         first (above AboutCheckForUpdatesCard) so a curious reader meets
//         the founder voice before the version/build mechanics. Paragraph
//         + signature + LinkedIn ↗ link to https://www.linkedin.com/in/danielsteeves.
//         No marketing decoration; plain card + grad heading.
// @version 0.8.4 @date 2026-06-04
// 0.8.4 — Daniel 2026-06-04: Help/Info content split locked. Folded two
//         Help-only beats INTO Info (Architecture > Business > duress-proof
//         gains Premium-tier-gating Standard-user UX note; shares tab gains
//         the open-source noklock-cli speed-up callout from Help). Both
//         additions tagged "// folded from Help.tsx 0.6.x — Daniel 2026-06-04"
//         per the canonical comment convention. Help.tsx 0.7.0 (this round)
//         is the thin FAQ counterpart: it drops the deep-tech bodies + the
//         provider table (both now lived-in-Info) and points users here for
//         the full architecture. No ARCHITECTURE_SECTIONS schema change; the
//         search index re-extracts automatically from the structured entries.
// @version 0.8.3 @date 2026-06-03
// 0.8.3 — Daniel 2026-06-03: REMOVED duplicate <PhonePinNotCloud /> mount on
//         Use-cases tab. Same warning is rendered INLINE inside the Digital
//         Identity & Accounts card via VaultUseCases inlineCallout. Two of
//         the same callout on one scroll was the duplication Daniel flagged.
// @version 0.8.2 @date 2026-06-03
// 0.8.2 — Daniel 2026-06-03: Info Tech Box 2 second paragraph added —
//         introduces the open-source noklock-cli (Dropbox upload/download
//         today, gdrive+onedrive stubs in roadmap). User picks auto-vs-manual
//         at enrol time. Trust story preserved: token stays on user's
//         machine, NoKLock never sees it.
// @version 0.8.1 @date 2026-06-03
// 0.8.1 — Daniel 2026-06-03: Info Tech Box 2 reworded per audit P1
//         (Store-anywhere is YOU upload, not automated — OAuth ceremony
//         exists but no upload code). Removed "Automated share
//         distribution" sub-heading + rewrote body to make the manual
//         download/upload flow explicit ("we never see, store, or
//         transmit your shares; you choose where they live"). Optional
//         IPFS pinning retained; Arweave permanent backup removed from
//         body (also not wired). No SaaS to fail.
// 0.8.0 — Daniel 2026-06-02: killer Shamir conceptual-headline statement
//         inserted as a regular body paragraph immediately ABOVE the
//         existing Shamir polynomial viz mount (section #shamir-viz) in
//         TechnologyArchSection. Full version of the homepage anchor
//         (Landing.tsx 0.19.0): below-threshold impossibility + above-
//         threshold audited-encryption sealing context (AES-256-GCM,
//         XChaCha20-Poly1305, "same primitives behind TLS, Signal,
//         WireGuard"). Reads as the conceptual headline for the viz.
//         Shamir viz remains the existing mount (already in Tech tab —
//         lazy ShamirPolyViz, secret=73, n=5, k=3, autoPlay/loop). Not
//         i18n'd — content beat, not navigation label (Daniel's policy).
// 0.7.9 — Daniel 2026-06-02: relocated the "Under the hood" 4-tile section
//         from Landing.tsx (homepage) into Info → Architecture → Technology
//         (TechnologyArchSection), positioned as slot 2 between the intro
//         "Technology architecture" card and the "Component view — what
//         runs where" diagram section. New 4-box copy rewritten by Daniel:
//         (1) Air-gap (Truly disconnected processing) — carry-over voice-
//         pass body; (2) Store anywhere (Automated share distribution) —
//         IPFS pinning + Arweave permanent backup, no SaaS to fail
//         (PRECISION FIX: "blockchain pinning" → "IPFS pinning"; IPFS is
//         content-addressed distributed storage, Arweave IS blockchain
//         permanent storage); (3) Shamir Protection (Configurable
//         thresholds) — below-threshold math + above-threshold audited
//         encryption, with "See the math →" link to /viz/shamir; (4)
//         Recovery & Protection (When you can't check in) — heartbeat
//         + dead-man's switch + live-man's switch. No i18n — plain JSX
//         per Daniel ("no longer needs these boxes for translating as
//         they are off the home page").
// 0.7.8 — Human-voice pass on the new About-NoKLock tab + the digital-legacy
//         expansion section. Priority targets per Daniel's "human writer for
//         human reader, no AI slop" rubric: kill generic adjectives, vague
//         reassurances, em-dash overuse, corporate hedge, "simply", padded
//         phrases. Specific rewrites:
//         • AboutNoKLockTab intro paragraph — replaced "Updates, privacy
//           posture, current system status… project-meta surfaces" with a
//           plain-English "what / where / which contracts / alive right now"
//           lead. Settings vs Info framing kept; em-dash dropped.
//         • AboutCheckForUpdatesCard — heading "NoKLock updates" → "How
//           updates work"; "keeps itself current automatically" rewritten
//           as "New versions arrive on their own"; "There is nothing to
//           download or install by hand" → "Nothing to download, nothing
//           to side-load". Hardware-wallet paragraph re-flowed away from
//           em-dash sandwich; "Manual BIP39 text entry always works too" →
//           "If everything else fails, BIP39 text entry still works".
//         • AboutPrivacyCard — "{BRAND} stores nothing about you" reworked
//           to lead with "We don't store anything about you. We can't" (the
//           honest-impossibility framing Daniel asked for). Self-hosting
//           line gets a beat: "One file, one line."
//         • AboutBox contracts-list lede — added "Click any address to read
//           the code on PolygonScan" so the meaning of the list is up front
//           instead of trailing the file name. GDPR line — "zero cookies,
//           zero trackers, zero personal identifiers stored — no consent
//           banner is shown because there is nothing to consent to" tightened
//           to "no cookies, no trackers, no personal identifiers stored. No
//           consent banner, because there's nothing to consent to."
//         • AboutPatentLine label "IP" → "Patent" (concrete > generic).
//         • Digital-legacy expansion (Use-cases tab) — the "Your online
//           life doesn't end when you do" hero paragraph rewritten with
//           concrete beats ("Tell the networks before an algorithm tells
//           the wrong people", "Cancel the recurring charges that keep
//           billing your estate") replacing the abstract list. Bullets
//           re-cast as imperatives with concrete imagery ("photos, files,
//           drafts, half-finished work"). Zero-log stamp rewritten as four
//           short sentences instead of three semicolon-chained clauses.
//         • "What can I store in a NoKLock vault" — em-dash → colon for
//           the category enumeration; "Architecture and how-it-works sit
//           in the tabs to the right" rewritten to lead with "Read this
//           tab first" (action) instead of "Architecture … sit in the
//           tabs" (description).
//         • "Free pre-setup tools (do these now)" → "Two free tools, do
//           these now" (concrete number, drops parenthetical). Apple
//           Digital Legacy + Google Inactive Account body re-flowed to
//           drop em-dashes and lead with the verb the heir performs.
//         No structural / type / route change — pure copy pass + version
//         bump. Architecture / FAQ tabs already read clean (Daniel: "leave
//         if they read fine"); no edits there.
// 0.7.7 — Competitors-tab reorg follow-on (managed-wallet-competitors-tab-
//         reorg-20260602.md + positioning-realignment-brief-20260602.md).
//         Search-index entry for the Competitors tab rewritten to describe
//         the new two-category structure (Crypto inheritance + Digital
//         legacy & post-mortem), the new Managed-wallet column, and the
//         Complementary-tools section (password managers are framed as
//         complements, not competitors — Daniel's 2026-06-02 positioning
//         realignment). No structural change to the tab mounting
//         (<AskAnAI/> + <CompetitorTable/>) — CompetitorTable v0.5.0
//         carries all the visual changes.
// 0.7.6 — Daniel 2026-06-02: NEW "About NoKLock" tab placed FIRST in the
//         Info sub-menu. Contains content moved from Settings (NoKLock
//         updates, Privacy, System status, About — version + build +
//         on-chain contracts + entity + GDPR + IP/patent). These are
//         project-meta surfaces that belong in Info, not Settings. The
//         Settings page keeps its Day-1 honest note near the top (newly
//         added there in Settings 0.6.0) and is now strictly user-tunable
//         state. Implementation lives in AboutNoKLockTab() at the bottom
//         of this file — JSX moved verbatim from Settings.tsx 0.5.x. New
//         search-index entries point at this tab so /info search hits
//         the right place.
// 0.7.5 — Mounted <VaultUseCasesCarousel /> (default variant) as the
//         OPENER of the Use-cases tab — sits ABOVE the full <VaultUseCases />
//         grid so a reader sees a continuous-scroll marquee of ~24 concrete
//         one-liners ("Bitcoin seed phrase", "Master password", "Safety
//         deposit box code"…) before the six categorical cards below.
//         Lead-in copy: "Every kind of secret. One pattern. Pick yours."
// 0.7.4 — Use-cases tab expanded with Daniel's "your online life doesn't end
//         when you do" framing for the Digital Identity & Accounts category.
//         Lead paragraph rewritten as the hero line; the six concrete heir
//         actions (memorialise/close, notify networks, recover irreplaceable,
//         stop the bleed, block impersonation, hand off business) added as a
//         bulleted list above the use-case grid; the "we don't log a thing"
//         privacy stamp surfaced as a prominent disclosure card. NEW
//         <PhonePinNotCloud /> amber callout mounted immediately after the
//         use-case grid (right after the Digital Identity & Accounts card's
//         neighbourhood) — closes the single biggest heir-misconception
//         gap (phone PIN ≠ cloud access). Apple Digital Legacy Contact +
//         Google Inactive Account Manager pre-setup CTAs added beneath the
//         MemorialPlatforms disclosure with their official setup URLs.
// 0.7.3 — Mounted <VaultUseCases /> (full-detail variant) on a NEW
//         "Use cases" tab placed FIRST in the tab order — BEFORE the
//         Architecture / How-it-works / technical-detail tabs — so a
//         first-time reader sees the six categories of things people
//         actually want to put in a NoKLock vault before they hit the
//         primitives, FSM, and audit narrative. Also mounted the
//         <MemorialPlatforms /> expandable "Digital legacy specifics"
//         disclosure immediately beneath the use-case grid (sits below
//         the Digital Identity & Accounts category card visually and
//         conceptually — the disclosure unpacks the six big platforms'
//         deceased-user policies that the Identity category points at).
//         Tab type, TABS array, TAB_LABEL, search default-tab guard all
//         updated; search index gets two entries pointed at the new tab.
// 0.7.2 — Online/offline transition pass (Daniel 2026-06-01): the
//         "air-gapped" Architecture section is no longer just "we block
//         fetch during enrol" — it now walks step-by-step through where the
//         boundary is, where it crosses, and the symmetry between enrol
//         (offline build → online distribute) and restore (online gather →
//         offline rebuild). Pulls in the new viz "distribute" + "gather"
//         steps and the /restore force-offline step explicitly. Five new
//         body bullets (steps 6 / 7 / 8 / 9 + a closing symmetry note).
// 0.7.1 — KNOWN-DEFECTS disclosure: Stage-1 enforcement model + wallet-
//         migration re-enrol prompt added as a final bullet to the
//         Social-engineering-proof body in the Architecture tab. Documents
//         that M-of-N quorum is currently enforced via Form B attestations
//         and that NoKLockQuorum.sol on-chain enforcement is Stage-2.
// 0.7.0 — M-of-N pre-v0.6 honesty disclosure: appended a parenthetical
//         disclosure to the social-engineering-proof section's "When the
//         dead-man's switch fires…" prose paragraph clarifying that
//         M-of-N quorum is enforced from v0.6 onwards and that vaults
//         enrolled before v0.6 remain owner-restorable; re-enrol to
//         upgrade. Aligns marketing prose with the K.BEFORE row of
//         mofn-restore-quorum-fix-plan.md ahead of the Stage-1 quorum
//         gate landing in restore-pipeline.ts → 0.6.0.
// 0.6.9 — launch-blocker-1-owner-cancel-window: added an 8th bullet to
//         "Owner protection — why a next-of-kin can't jump the gun" disclosing
//         the activation-stage owner cancel-window (default 48h, env-tunable
//         0-168). Reads OWNER_CANCEL_WINDOW_HOURS from lib/cancelWindow.ts so
//         the number tracks the single source of truth (Form B env var).
// 0.6.8 — [fix-copy-7-pick-cipher-clarification] Architecture tab: corrected
//         the per-share cipher-choice copy in TWO spots — the "Tamper-proof"
//         narrative bullet (was "randomly chosen per share") and the
//         AES-256-GCM / SHA-256 primitive-table cells (was "the share index
//         decides…" alone + "per-share AEAD-selector hash"). New wording
//         makes the honest point: cipher selection is DETERMINISTIC per
//         (master, share-index) — restore depends on it. It is not freshly
//         random per share; it is technically random *over the seed*,
//         deterministic once the seed is fixed. Audit finding: previous
//         copy implied per-share entropy was rolled at encrypt-time, which
//         would break re-derivation on restore.
// 0.6.7 — [fix-copy-6-email-hash-v1-disclosure] FAQ tab → "Can I designate a
//         next-of-kin by email…" (Hybrid-E) answer: appended an honest
//         disclosure that Email-Hash v1 (keccak-based) commitments remain
//         on-chain and are technically rainbow-attackable (confirmation
//         oracle for candidate emails; SBT still gated by EIP-712 server
//         attestation), and that v2 (Argon2id-based) is forward-only and
//         does not retroactively rewrite the v1 on-chain commitments.
//         Audit finding: the prior copy framed the email-hash as a
//         settled detail and didn't surface the v1 rainbow-attackability
//         residual or the forward-only nature of the v2 hardening.
// 0.6.6 — [fix-copy-5-v1-key-reuse-disclosure] Architecture tab → Cryptographic
//         primitives section: appended an honest "v1 vs v2 key-schedule"
//         disclosure note clarifying that the v1 (legacy baseline) vaults
//         reuse the Argon2id master across Shamir/AEAD/Ed25519, while v2
//         (default for new vaults) derives per-purpose HKDF subkeys per
//         RFC 5869. Audit finding: marketing said "standard primitives"
//         but didn't disclose the cross-protocol reuse on v1.
// 0.6.5 — [fix-copy-1-escrow-attestor-disclosure] Contracts tab: added a
//         dedicated "Escrow attestor — owner-set off-chain signer" disclosure
//         block, symmetric to the License/Oracle/Recovery owner-power
//         paragraphs. Audit finding: attestor compromise scenario was only
//         documented in Solidity NatSpec — not surfaced to /info readers.
//         Names the `setAttestor` rotation power, the `revokeBinding` owner
//         power, the BadAttestor revert on stale signatures, and the
//         quarterly rotation cadence. Same disclosure tone as the existing
//         centralisation bullet.
// 0.6.4 — + FAQ "What if I forget to send a heartbeat?" documenting the new
//         zero-PII calendar reminder (.ics / Google Calendar) + the long
//         grace window as the safety net.
// 0.6.3 — Daniel 2026-05-22: NEW <AskAnAI/> widget atop the Competitors tab —
//         pick a competitor, open ChatGPT/Claude/Perplexity/Google in a new
//         tab with a balanced comparison prompt pre-filled. "Here's our take;
//         go ask a neutral AI." Zero-API, free, can't-iframe-the-chats.
// 0.6.2 — Daniel 2026-05-22: (1) Contracts section now LEADS with "they
//         custody nothing — here's what an exploit could and couldn't do"
//         instead of an audit-posture defence — reframes away from the DeFi-
//         audit benchmark + ties score-publishing to transparency; dropped
//         the dated reveal-everything metaphor. (2) Bug-bounty disclosure no
//         longer promises a "72 hours for first reply" target.
// 0.6.1 — Daniel 2026-05-21 Contracts-tab pass:
//         • Search index + body updated 4 → 5 contracts (already lists 5
//           via env-driven ESCROW_ADDR_LOCAL; copy now matches).
//         • "Published scan & audit reports" empty-state reworded — drops
//           the "any future formal audit will be linked here" implicit
//           commitment.
//         • "How these were reviewed" beefed up — 148 → 154 tests, multiple
//           independent AI passes from two distinct sources (two external
//           + three Claude self-reviews) called out explicitly, local
//           Polygon mainnet-fork dress-rehearsal added, deploy-ceremony
//           integration audit added.
//         • "Why no $50k formal audit (yet)" → "Why no formal audit".
//           Opener says we have not + do not intend to commission one;
//           "Spending $50k now would be theatre" bullet replaced with
//           the considered-position bullet Daniel asked for.
//         • Bounty bullet reframed — "while we expect any bugs found will
//           be more functionality than meaningful contract exploits";
//           links to the on-page #bug-bounty section.
//         • "If you scan these yourself" rebuilt into two groups: WILL
//           flag today (memecoin heuristics, public burn ×3, setGuardians,
//           Escrow OZ-lib unchecked, centralisation, block.timestamp,
//           hygiene) + FIXED-in-earlier-passes history (incorrect access
//           control, _safeMint reentrancy, Lifetime double-mint, CEI,
//           unbounded loop, module-setter timelock, performUpkeep-anyone).
//         • Documents disclaimer → "Documents and images disclaimer";
//           covers /enrol/document AND /enrol/image, jurisdictional note
//           added for photographs (consent / data-protection / copyright).
// 0.6.0 — NEW "FAQ" tab (FaqTab) — honest answers to the real questions
//         (per-device vaults, restore is device-independent, no 2FA by
//         design, what the optional passkey is, NoK is per-vault + how
//         to add later, Premium doc/image gate, Lifetime==Standard,
//         stale-page hard-refresh). "Passkeys & access" tab label
//         shortened to "Passkeys" so the tab bar fits (Daniel).
//         Passkeys tab veracity: it implied Windows Hello/any passkey
//         always works — corrected to require the WebAuthn PRF
//         extension + state it's added at the save step, not the
//         password step, and no-2FA-by-design (Daniel caught this).
// 0.5.14 — Referral tab: explicit first rule that ANYONE with a wallet
//          can refer — no purchase, no signup, no Free mint required
//          (clarity Daniel asked for; matches the contract — referrer
//          has no tier requirement).
// 0.5.13 — Tab bar: + "User guide ↗" link → /manual; bar is now
//          single-line (flex-nowrap + overflow-x-auto, whitespace-nowrap
//          buttons) so it never wraps to two rows. (Daniel.)
// 0.5.12 — Deep-link/anchor support: /info?tab=...#section scrolls to
//          the section after the tab paints. "Why not keyless?" card
//          given id="why-not-keyless" + scroll-mt so the Landing CTA
//          lands ON it (was dumping at the top of the Compliance tab).
// 0.5.11 — Shares tab: NEW plain-English "Getting your shares out, and
//          back" explainer at the top — the save model (desktop-sync
//          folder = direct write, else manual; NoKLock never talks to
//          your cloud), WHY one-share-per-separate-account is required
//          (threshold protection), and how restore works + why the
//          manual steps exist (security, not bugs). Mirrors
//          docs/share-and-restore-model.rtf. (Daniel: doc it clearly
//          in-app for users.)
// 0.5.10 — WS-C: "Language & translations" card in the Compliance tab —
//          English is authoritative/governing, no liability for
//          translation errors, functionality identical, zh/hi are drafts
//          pending native review.
// 0.5.9 — F3/Q2/WS-D: referral worked example now leads with the Founder
//         price ($99→$89.10→~$8.91, regular shown too); NEW "no cookie /
//         no tracking" link-mechanics card + "The fine print" legal card
//         in the Referral tab; absolute "impossible to lose" / "never lose
//         them" claims softened to the truthful share+master-password
//         framing.
// 0.5.8 — WS-B: NEW "Passkeys & access" tab (PasskeysTab) — plain-English
//         master-password-vs-passkey, what-if-you-lose-it, NoK access, and
//         a responsibilities table. The Enrol wizard links /info?tab=passkeys.
// 0.5.7 — WS3b veracity: threat-matrix + IPFS note reworded — the secret
//         is the master password; the WebAuthn passkey is real but OPTIONAL
//         (origin-bound). Duress wording corrected (two master passwords).
// 0.5.6 — WS6: NEW Architecture section "What if NoKLock disappears?"
//         (provider-independence trust narrative). Stray "passkey" →
//         "master password" in the self-custodial section (veracity).
// 0.5.5 — NEW "Referral" tab (ReferralInfoTab): full rules + worked
//         example + emphasis it is 100% automatic / smart-contract-
//         executed / non-custodial / no claim step / reads live on-chain;
//         links to /refer. PublishedAudits + Admin audit list now show
//         FIRST-ENTERED FIRST (ascending by added_at) per Daniel.
// 0.5.4 — Contracts tab: <PublishedAudits> moved ABOVE "How these were
//         reviewed". Re-scan is complete — the SolidityScan bullet now
//         states the ACTUAL deployed-bytecode scores (License 89.08 /
//         Oracle 89.12, both 0 Crit / 0 High; SBT 61.77 + Recovery 72.50
//         lower only due to automated false-positives on a valueless
//         soulbound token / self-service guardian contract, all traced
//         and dismissed) instead of the stale "being re-scanned" text.
// 0.5.3 — Veracity: test count 55 -> 63 (referral suite added); the 88.94
//         SolidityScan score is no longer asserted as the *currently
//         deployed* bytecode (the 2026-05-16 referral redeploy is pending
//         re-scan) — it is framed as the prior revision's, with the live
//         home-page TrustBlock + published reports as the source of truth.
//         NoKLockLicense role + the "money only moves" / "no honeypot"
//         passages now honestly describe the referral split (one approved
//         pull, routed atomically; still no pooled custody, no sweep).
// 0.5.2 — Contracts tab: NEW <PublishedAudits> — public read of owner-
//         signed audit reports from Form B /v1/audit (Option A). Honest
//         empty-state. Documents-disclaimer reframed present-tense (doc
//         inheritance is shipped, not "Phase 3").
// 0.5.1 — Security tab: NEW "Owner protection — why a next-of-kin can't jump
//         the gun" section. Explicit 7-layer defense chain + the
//         proof-of-life-never-proof-of-death design rationale (no death
//         input by design). Derived from verified contract behaviour.
// 0.5.0 — NEW "Contracts" tab — full audit-posture transparency: verified
//         addresses, how reviewed (55 tests + AI review + SolidityScan +
//         source verification), why no $50k formal audit + rationale, a
//         line-by-line walkthrough of the scary scanner flags a user will
//         see (memecoin false positives, custom-error-guarded "public burn",
//         hardened safeMint reentrancy, acknowledged owner powers), and the
//         architectural "no exploitable path to steal funds or break
//         inheritance" argument. Jump-to grid 2-col → 3-col.
// 0.4.0 — Drop redundant subtitle under Info h1 (duplicated tab nav).
//         Compliance tab gets a "Why not keyless?" section explaining
//         NoKLock's honest-self-custody positioning vs. the "keyless"
//         cohort (plan §1.5).
// 0.3.0 — Insurance headline aligned with Landing. Pinata/Arweave clickable.
//         Provider list "open →" (was "sign up →"). renderNote() helper.
// 0.2.0 — Security tab (threat matrix) + Compliance tab (legal position).
//
// /info — multi-tab info hub.

import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PROVIDERS } from "@soulchain/storage-adapters";
import { ProcessDiagrams } from "../components/ProcessDiagrams.js";
import { ChainlinkUpkeepStatus } from "../components/ChainlinkUpkeepStatus.js";
import { CompetitorTable } from "../components/CompetitorTable.js";
import { WhyItMatters } from "../components/WhyItMatters.js";
import { AskAnAI } from "../components/AskAnAI.js";
import VaultUseCases, { MemorialPlatforms } from "../components/VaultUseCases.js";
import VaultUseCasesCarousel from "../components/VaultUseCasesCarousel.js";
import { SubTabBar } from "../components/SubTabBar.js";
import { TechArchDiagram } from "../components/TechArchDiagram.js";
import { FSMDiagram } from "../components/FSMDiagram.js";
// Lazy-load: Shamir viz only fetched when the user lands on
// Architecture → Technology sub-tab. Saves ~80 KB on initial /info load.
import { lazy, Suspense } from "react";
const ShamirPolyViz = lazy(() => import("../components/ShamirPolyViz.js").then((m) => ({ default: m.ShamirPolyViz })));
import { BRAND_NAME } from "../lib/brand.js";
import { LICENSE_ADDR, SBT_ADDR, ORACLE_ADDR, RECOVERY_ADDR, ESCROW_ADDR, ALERTS_ADDR } from "../lib/contracts.js";
import { OWNER_CANCEL_WINDOW_HOURS } from "../lib/cancelWindow.js";
import { PATENT_DESCRIPTION, useLivePatentLeader } from "../lib/patentNotice.js";
import { useDocumentHead } from "../lib/seo.js";
// 0.7.6 — Imports needed by the new About NoKLock tab (content moved
// from Settings.tsx 0.5.x). PUBLIC_VERSION / DEPLOY_DATE / getBuildHash
// power the version block; SystemStatus is the "don't trust, verify"
// strip; the contract addresses + brand + patent imports above are
// re-used here (no duplication).
import { PUBLIC_VERSION, DEPLOY_DATE, getBuildHash } from "../lib/version.js";
import { SystemStatus } from "../components/SystemStatus.js";

type Tab = "about" | "use-cases" | "architecture" | "faq" | "shares" | "process" | "security" | "contracts" | "referrals" | "compliance" | "competitors";

const TABS: readonly { id: Tab; label: string }[] = [
  // 0.7.6 — "About NoKLock" placed FIRST in the Info sub-menu (Daniel
  // 2026-06-02). Foundational entry point — version + build + on-chain
  // contracts + privacy notice + system status + updates. Moved out of
  // Settings (which is now strictly user-tunable state).
  { id: "about",        label: "About NoKLock" },
  // 0.7.3 — "Use cases" placed second (was first) so a reader sees what
  // NoKLock is FOR (the six concrete categories) before the technical
  // detail, after the project-meta About tab.
  { id: "use-cases",    label: "Use cases" },
  { id: "architecture", label: "Architecture" },
  { id: "faq",          label: "FAQ" },
  { id: "shares",       label: "Shares" },
  { id: "process",      label: "How it works" },
  { id: "security",     label: "Security" },
  { id: "contracts",    label: "Contracts" },
  { id: "referrals",    label: "Refer & Earn" },
  { id: "compliance",   label: "Compliance" },
  { id: "competitors",  label: "Competitors" },
];

const TAB_LABEL: Record<Tab, string> = Object.fromEntries(TABS.map((t) => [t.id, t.label])) as Record<Tab, string>;

// Sub-tabs (2026-05-22 consolidation). Each parent tab that has sub-tabs
// keeps its own type union + label map. Sub-tab state persists in the
// URL as ?tab=parent&sub=child so deep links keep working. Existing deep
// links without &sub default to the first sub-tab of each parent (which
// is the historically-default content for that parent).
type ArchSub = "business" | "technology" | "fsm" | "managed" | "interfaces" | "roadmap" | "why";
const ARCH_SUBS: readonly { id: ArchSub; label: string }[] = [
  { id: "business",   label: "Business architecture" },
  { id: "technology", label: "Technology architecture" },
  { id: "fsm",        label: "Finite state machine" },
  { id: "managed",    label: "Managed mode" },
  // 0.9.3 — Daniel 2026-06-14: "Third-party interfaces" sub-tab
  // (ThirdPartyInterfacesArchSection) — every outside specialist NoKLock
  // touches, what each sees / provably can't see, and how (or whether) it
  // contributes to security + anonymity. Content code-verified per integration.
  { id: "interfaces", label: "Third-party interfaces" },
  // 0.9.1 — Daniel 2026-06-12: "Roadmap" sub-tab (RoadmapArchSection,
  // defined below ManagedModeArchSection). Phase cards (done / you-are-here
  // / future) for where the product has been and where it's going, public-
  // safe. Placed after "Managed mode", before "Why it matters".
  { id: "roadmap",    label: "Roadmap" },
  { id: "why",        label: "Why it matters" },
];

type SecSub = "model" | "passkeys";
const SEC_SUBS: readonly { id: SecSub; label: string }[] = [
  { id: "model",    label: "Security model" },
  { id: "passkeys", label: "Passkeys & access" },
];

// Generic sub-tab pill bar — slimmer than the top-level tab nav (smaller
// font, no card surround) so it visually nests under the parent tab.
// SubTabBar is now shared — components/SubTabBar.js (imported above).

const ARCHITECTURE_SECTIONS = [
  {
    id: "transparency",
    title: "Transparency",
    lede: `Most products tell you about their security. NoKLock shows you. Every primitive, every contract, every byte of the pipeline is verifiable without trusting our description.`,
    body: [
      `All six on-chain contracts (License, SBT, Oracle, Recovery, Escrow, Alerts) are source-verified on PolygonScan — anyone can read the exact code that runs your inheritance. The PWA itself is BUSL-1.1 source-visible: you can audit how the cryptographic pipeline actually works.`,
      `The cryptographic primitives we use are all standard and peer-reviewed: Argon2id (RFC 9106), Shamir SLIP-39 (information-theoretic), XChaCha20-Poly1305 / AES-256-GCM (AEAD), SHA-256 (manifest binding), Ed25519 (manifest signing), secp256k1 (wallet signing). No proprietary algorithms anywhere. All via @noble/hashes and @noble/ciphers — audited pure-JS implementations used widely in the broader crypto ecosystem.`,
      `Live pipeline visualisations at /shamir, /argon, /aead, /restore-viz, /roundtrip, /manifest, /bip39 — each shows one cryptographic step in motion, animated in your browser, with no telemetry. The /prove-it page runs the entire pipeline end-to-end on synthetic data so you can watch real bytes flow through every primitive. "The viz teaches; the step log proves."`,
      `Zero hidden state: no cookies, no third-party trackers, no fingerprinting, no IP logging. The Privacy page on /privacy is mirrored on /info → Compliance. The Architecture diagrams here are pure SVG — no analytics, no remote fetches.`,
      `Open audit invitation: read the source on github.com/dksteeves/noklock, run the contracts in a local Polygon fork, prove-it on your own data. We don't claim "trust us"; we claim "verify it yourself".`,
    ],
  },
  {
    id: "air-gapped",
    title: "Truly air-gapped",
    lede: `During enrolment, ${BRAND_NAME} runs every cryptographic step locally in your browser. Network access is deliberately blocked — and the restore path forces the airgap back on before any decryption begins.`,
    body: [
      `The enrolment wizard puts the PWA into an internal airgap mode the moment you reach the seed-entry screen. From that point every fetch() call from this tab is intercepted and rejected until you reach Done.`,
      `We also prompt you to switch the device itself to airplane mode. Belt-and-braces — even if a browser extension tries to phone home, your network is off entirely.`,
      `Why this matters: the only window in which your raw seed exists is between your fingertips and your CPU. No remote party — not us, not your ISP, not a malicious extension — can observe it.`,
      `Where the airgap boundary is, step by step (enrol). Steps 1–6 of the enrolment pipeline run offline inside the airgap: seed entry, Argon2id, SLIP-39 split, per-share AEAD encryption, Ed25519 manifest signing, and save-out to a local folder. Step 6 ends offline with the signed manifest and the encrypted share-vaults sitting in your browser / on your disk — nothing has touched a network yet.`,
      `Step 7 — distribute — is the first online step. You reconnect to the network and the app uploads each encrypted share-vault to the storage URL you chose (one share per cloud account, or IPFS / Arweave for permanence). The vaults are already AEAD-sealed inside the airgap, so the upload itself reveals nothing about your seed; the only thing that crosses the boundary is the ciphertext.`,
      `Where the airgap boundary is, step by step (restore). The restore pipeline is the mirror image. Step 8 — gather — is online: the heir (or you) reconnects, downloads K share-vaults from where they were distributed, plus the manifest. Step 9 — restore — is offline: the /restore route forces the airgap back on (the same fetch-blocking PWA mode used at enrol) before any signature verification, AEAD decryption, or Shamir recombination runs. Every decryption that touches plaintext happens with the network blocked.`,
      `Symmetry, not asymmetry. Enrol = "build offline, then cross the boundary outward to distribute". Restore = "cross the boundary inward to gather, then rebuild offline". The only thing that ever travels online is the AEAD-sealed ciphertext (in both directions) — the master password, the master secret, the Shamir polynomial coefficients, and the plaintext seed never leave the airgap on either side.`,
    ],
  },
  {
    id: "tamper-proof",
    title: "Tamper-proof",
    lede: "Every encrypted share carries an AEAD authentication tag and the manifest is Ed25519-signed.",
    body: [
      // [fix-copy-7-pick-cipher-clarification] Was "randomly chosen per share";
      // that implied per-share entropy at encrypt-time, which would break restore.
      // Correct framing: deterministic per (master, share-index), so restore
      // re-derives the same choice. Random over the seed, not over each share.
      "Each share is encrypted with AES-256-GCM or XChaCha20-Poly1305. The cipher choice is deterministic per (master, share-index) — restore depends on it. It is not freshly random per share; it is technically random over the seed, then locked once your master key exists. Both are authenticated encryption — change one byte and the tag-verification step fails on restore.",
      "The manifest is signed with an Ed25519 key derived from your master secret. If anyone modifies it in transit, the signature check fails and the restore stops cold.",
      "Result: tampering detected at every layer. Restore is fail-safe: refuse, don't proceed.",
    ],
  },
  {
    id: "spoof-proof",
    title: "Spoof-proof",
    lede: "Soul-bound tokens cannot be transferred, sold, or impersonated. The NoK you designated is the NoK who will inherit.",
    body: [
      `When you designate a next-of-kin, ${BRAND_NAME} mints one ERC-5192 soul-bound Activation NFT to their wallet — the dead-man's-switch trigger. M-of-N quorum vaults add a Voting NFT per heir for the heir-cooperation release. ERC-5192 is the standard for non-transferable tokens; the contract refuses every transfer attempt.`,
      `An attacker who compromises a NoK's wallet still cannot transfer the SBT elsewhere. The token cannot leave its mint address (only burn).`,
      `No secondary market or theft vector for inheritance rights. Your heir keeps inheritance status as long as they keep their wallet.`,
    ],
  },
  {
    id: "social-engineering-proof",
    title: "Social-engineering-proof",
    lede: "You designate multiple PEOPLE, each with their own independent wallet. The contract requires a quorum (e.g. 2-of-3) of independent signatures to release. Phishing or coercing one heir does NOT release your vault.",
    body: [
      `The attack this defeats: phishing, blackmail, coercion, kidnapping, or simply a corrupted heir. In every other crypto-inheritance product, compromising the single designated person is the whole game — they have the key, the email-link, or the cloud account, and they're it. NoKLock makes that single-point attack mathematically insufficient.`,
      `Each NoK is a separate person with their OWN crypto wallet — three different addresses for three different people. ${BRAND_NAME} mints one set of SBTs to EACH NoK's wallet. The same wallet address never appears twice. The on-chain contract literally counts independent signatures from independent addresses.`,
      `When the dead-man's switch fires, the contract waits for a quorum vote. With 2-of-3 (the default), any 2 of your designated NoKs must each sign a 'release' transaction from their own wallet before the share pointers become available. One alone cannot do it — even if they're colluding with a cloud provider, even if they have the email link, even if they have your master password under duress. The chain rejects the single-vote release. (Honest disclosure: M-of-N quorum is enforced from v0.6 onwards. Vaults enrolled before v0.6 remain owner-restorable; re-enrol to upgrade.)`,
      `Why three (or more) different people, not three copies of one wallet: defends against any single point of social-engineering failure. An attacker compromises NoK #1's wallet via phishing — they still can't release alone. NoK #2 must independently agree. Three different humans, three different wallets, three different attack-surface contexts. Forging two-out-of-three INDEPENDENT signatures is materially harder than forging one — and you can configure the quorum higher (3-of-5, 4-of-7) for higher-stake inheritance.`,
      `What "independent" means on-chain: the contract enforces that the M signatures come from M DISTINCT wallets. It cannot be tricked by replaying one signature M times or by one wallet signing M times. Each vote slot is consumed once per wallet.`,
      `If a NoK loses their wallet or stops responding, you (the owner) can revoke their SBT and re-designate someone else — all from the /nok management page, while you're still alive. The quorum-of-the-day is the quorum your contract holds at fire time.`,
      `Best practice for high-stakes inheritance: pick 3+ people who don't share a household, an employer, or a phishing-context. A spouse + a sibling + an attorney is a strong triangle. Family-only quorums are convenient but weaker against household-level coercion. NoKLock can't prevent you from coercion-clustering your NoKs — but if you spread them, the quorum genuinely defends.`,
      `M-of-N quorum is enforced via Form B-issued attestations (Stage-1). On-chain enforcement via NoKLockQuorum.sol arrives in Stage-2. If you migrate to a new wallet, you must re-enrol your quorum-protected vaults so Form B knows the new ownership.`,
    ],
  },
  {
    id: "duress-proof",
    title: "Duress-proof",
    lede: "Optional decoy vault with its own separate master password. Under coercion you hand over the decoy — the attacker sees a believable throwaway, your real vault stays hidden. The two vaults are cryptographically indistinguishable from outside.",
    body: [
      `The attack this defeats: wrench attacks, kidnapping, hostage-style coercion, border-coercion, "give us the password or we hurt you" — situations where you physically can't refuse but you don't want the attacker to actually reach your real assets.`,
      `When you enrol you can OPTIONALLY add a duress decoy: a second vault with a SECOND master password. ${BRAND_NAME} stores BOTH vaults' encrypted shares side-by-side. From outside the encrypted bundle, the two are indistinguishable — same file structure, same share count, same manifest schema. Neither password leaks anything about the existence of the other.`,
      `Under coercion: you give the decoy password. The attacker decrypts the decoy vault — finds a plausible "throwaway" seed phrase (a small amount, or test funds, or a believable inheritance letter — your call what you put in it). They see a successful restore. They don't know the real vault exists.`,
      `Why this is cryptographically real: each vault has its own Argon2id key derivation from its own master password. Decrypting either vault gives you that vault's plaintext only — there's no observable "this password unlocked half the file" signal. Both passwords look complete from a forensic perspective; both restore to fully-formed vaults.`,
      `Why no competitor offers this: Casa, Vault12, Ledger Recover, Nunchuk all custody at least one share. A duress vault doesn't help when the custodian holds the keys — they can't pretend to not have your real vault. NoKLock's self-custody model is what makes the duress decoy actually defendable.`,
      `Honest caveat: if the coercer KNOWS NoKLock supports duress vaults AND knows you specifically enabled one, they may demand both passwords. The defence then is plausible deniability — the duress vault must contain enough value that "this is everything" is believable. Put a real but small wallet in your decoy. Test the restore yourself periodically.`,
      `Honest caveat on the master password: a court (per the Help/Info honesty pass) CAN compel a person to surrender a password under legal process. Duress decoys are a defence against COERCION, not against legal subpoena. If you're worried about legal disclosure, that's a different problem and a lawyer's question — NoKLock's architecture doesn't claim to defeat valid legal process. It claims to defeat criminal coercion, and that it does.`,
      // folded from Help.tsx 0.6.x — Daniel 2026-06-04
      `Tier gating: the duress mode is a Premium-tier feature, gated against your on-chain licence. Standard-tier users see a 'Premium feature' notice during enrol and skip the duress step entirely — their vault enrols without a decoy.`,
    ],
  },
  {
    id: "death-proof",
    title: "Death-proof",
    lede: "If you stop checking in, your NoK inherits automatically. No probate, no lawyer, no central authority.",
    body: [
      `${BRAND_NAME}'s dead-man's switch is implemented on-chain. You configure a grace period (default 60 days). Heartbeats — wallet sign, email click, on-chain wallet activity — reset the timer.`,
      `If the grace elapses, Chainlink Automation flips every queued NoK Activation token from LockedInactive to LockedActive on Polygon. The NoK's PWA detects activation on next visit.`,
      `Not involved: trustee, our server, legal process. The chain itself is the executor.`,
    ],
  },
  {
    id: "heir-proof",
    title: "Heir-Proof",
    lede: "The on-chain controls let you STOP a premature inheritance or recovery — but a veto is useless if you never learn the clock started, and an inheritance app isn't opened daily. The Live-Man's Switch reaches you out-of-band so you can cancel or check in, even without opening this app.",
    body: [
      `The veto already exists on-chain. A next-of-kin cannot trigger or accelerate inheritance — the dead-man's switch only fires after YOUR own heartbeat goes stale for the full grace period (activation is oracle-only and forwarder-gated; an heir's token sits locked + inactive until then). And a guardian social-recovery has a cancellation window (1–30 days, default 7) during which YOU call cancelRecovery() from your wallet. You can also revoke any next-of-kin at any time while you're alive.`,
      `The gap this closes: those vetoes only help if something tells you it's happening. The Live-Man's Switch (the counterpart to the dead-man's switch) is that signal — it reaches you when an action that you might want to stop is started against your wallet.`,
      `How it reaches you (Settings → Live-Man's Switch): register 1–2 "watcher" wallets you check regularly and pre-fund a little POL. If a recovery is started against you, the on-chain ${BRAND_NAME}Alerts contract sends each watcher a tiny POL "ping" — most wallet apps surface an incoming transfer — and emits a permanent on-chain AlertPinged record. You can optionally add an email for guaranteed delivery.`,
      `Self-funded and on-chain, so it survives ${BRAND_NAME}: you fund your OWN pings, and pings can only ever go to YOUR own registered wallets (no one can redirect them). The alert keeps working even if our company disappears.`,
      `Honest caveat: a wallet push is best-effort — MetaMask mobile notifies on incoming transfers by default, some wallets need notifications switched on, but the on-chain record is always there. In v1 the recovery alert is delivered by a Chainlink keeper plus your optional email (both depend on funding / our server); a planned v2 upgrade fires the ping atomically inside the recovery transaction itself, removing that dependency. The "your grace is running low / you're about to be inherited" nudge is shown in-app and via the calendar reminder you set up.`,
    ],
  },
  {
    id: "self-custodial",
    title: "Self-custodial",
    lede: "We never have your keys. The architecture makes it impossible.",
    body: [
      `Every crypto operation runs in your browser on your device. Our back-end never sees plaintext seeds, plaintext shares, your master password, or the master secret.`,
      `Encrypted shares live in storage YOU pick — local folders for the simple route, or your own cloud accounts via share URLs for maximum geographic separation. We have no API access to any of them.`,
      `Compare to Casa, Ledger Recover, Vault12 — all hold at least one key share in custody. Their security model requires trusting them. Ours architecturally removes that as a possibility.`,
    ],
  },
  {
    id: "noklock-proof",
    title: "NoKLock-proof",
    lede: "Self-custodial AND provider-independent. If our company, our servers, and this website all vanished tomorrow, your recovery and your inheritance still work.",
    body: [
      `Your licence is on-chain. The app checks balanceOf(yourWallet, tier) on Polygon — readable from any public RPC or block explorer (PolygonScan). We cannot revoke it and it does not need us to exist.`,
      `Recovery is 100% client-side. Restoring your seed needs only your manifest, any T-of-N share files (which live in YOUR clouds, never ours), and your master password. The reconstruction runs entirely in your browser — no NoKLock server is contacted at any point.`,
      `Inheritance is executed by the chain, not by us. The dead-man's switch and soul-bound activation run on Polygon via Chainlink Automation, a decentralised keeper network. When your grace window lapses, your next-of-kin's tokens activate on-chain whether NoKLock exists or not.`,
      `Honest caveat: the convenient off-chain heartbeat and the email-only next-of-kin rebind do use our server. Both have trustless fallbacks — heartbeat directly on-chain via selfHeartbeat(), and a next-of-kin who holds their own wallet (the recommended primary). If you only ever used the off-chain heartbeat, switch to the on-chain one if our service is ever unavailable.`,
      `Defence in depth: the app's blockchain reads automatically fail over to a public Polygon node if our RPC proxy is down, and the contracts are immutable and source-verified on PolygonScan. The chain is the executor — we are only a convenience layer on top of it.`,
      `Continuity on the company-operated layer: ${BRAND_NAME} has already been approached about acquisition. We treat continuity of service for existing customers as a precondition of any future change of ownership or control. Any such transition would be bound to honour every existing licence and entitlement in full, keep the deployed contracts immutable and operational, and keep the supporting servers and services funded for as long as necessary. The trustless core above means you never HAVE to depend on that promise — but for the convenience layer (off-chain heartbeat, email-only next-of-kin), it is a deliberate commitment, made before any deal, not an afterthought during one. See the Terms "Change of ownership and continuity" clause.`,
    ],
  },
];

const PROVIDER_HOWTOS: Record<string, { steps: readonly string[]; cautions?: string }> = {
  "google-drive": {
    steps: [
      "Sign in (or create a free account) at drive.google.com.",
      `Click 'New' → 'File upload' → pick the share file you downloaded from ${BRAND_NAME}.`,
      "Right-click the uploaded file → 'Share' → 'Anyone with the link' → role: 'Viewer'.",
      `Click 'Copy link' → paste it into the matching share slot in ${BRAND_NAME} Enrol.`,
    ],
  },
  "dropbox": {
    steps: [
      "Sign up at dropbox.com/basic (2 GB free).",
      "Drag the share file into your Dropbox.",
      "Click 'Share' on the file → 'Create link' → 'Anyone with the link can view'.",
      `Copy + paste into ${BRAND_NAME}. We auto-convert ?dl=0 to direct-download.`,
    ],
  },
  "onedrive": {
    steps: [
      "Sign in (or create a free account) at onedrive.live.com.",
      "Upload the share file.",
      "Right-click → 'Share' → 'Anyone with the link' → permission: 'View'.",
      `Copy the link → paste into ${BRAND_NAME}.`,
    ],
  },
  "pcloud": {
    steps: [
      "Sign up at pcloud.com (10 GB free, Swiss-based).",
      "Upload your share file.",
      "Right-click → 'Public link' → copy the link.",
      `Append &forcedownload=1 if not auto-added, or just paste — ${BRAND_NAME} adds it for you.`,
    ],
  },
  "mega": {
    steps: [
      "Sign up at mega.io (20 GB free, end-to-end encrypted by MEGA).",
      "Upload the share file.",
      "Right-click → 'Get link' → 'Include decryption key' (link ends in #KEY).",
      `Paste into ${BRAND_NAME}. Note: MEGA's E2E layer means ${BRAND_NAME} can't auto-fetch at restore — you'll download the file in your browser then drag it in.`,
    ],
    cautions: `MEGA uses end-to-end encryption with their own key system. At restore time you'll need to download the file manually first, then drag it into the Restore page. One extra click; same end result.`,
  },
  "mediafire": {
    steps: [
      "Sign up at mediafire.com (10 GB free).",
      "Upload the share file.",
      "Click the file → 'Share' → 'Get link'.",
      `Copy + paste into ${BRAND_NAME}.`,
    ],
  },
  "box": {
    steps: [
      "Sign up at box.com/personal (10 GB free).",
      "Upload the share file.",
      "Click 'Share' on the file → 'Link Sharing' → 'People with the link' → 'Can preview & download'.",
      `Copy + paste into ${BRAND_NAME}.`,
    ],
  },
  "filen": {
    steps: [
      "Sign up at filen.io (10 GB free, German E2E-encrypted).",
      "Upload the share file.",
      "Click 'Share' → set link permission to public.",
      `Paste into ${BRAND_NAME}. Like MEGA, you may need to download in browser at restore time.`,
    ],
    cautions: "Filen is E2E-encrypted by them. Auto-fetch at restore not supported; manual download then drag into Restore.",
  },
  "internxt": {
    steps: [
      "Sign up at internxt.com (10 GB free, Spanish E2E-encrypted).",
      "Upload the share file.",
      "Click 'Share' → make public.",
      `Paste into ${BRAND_NAME}. Same caveat as MEGA/Filen — manual download at restore.`,
    ],
    cautions: "Internxt is E2E-encrypted by them. Manual download at restore.",
  },
  "yandex": {
    steps: [
      "Sign up at disk.yandex.com (10 GB free, Russian).",
      "Upload the share file.",
      "Click 'Share' → 'Public link' → copy.",
      `Paste into ${BRAND_NAME}.`,
    ],
  },
};

const IPFS_NOTES: readonly (string | { text: string; link: { href: string; label: string } })[] = [
  `Pinata pins your encrypted share file to the IPFS network. The pin URL is public-readable by anyone with the URL — but since the file is AEAD-encrypted by ${BRAND_NAME} before upload, only your master password (or your optional passkey) can decrypt it.`,
  { text: "1. Open ", link: { href: "https://pinata.cloud", label: "pinata.cloud" } },
  "   Create a free account (1 GB free, ~10k pins).",
  "2. Dashboard → 'Files' → 'Upload' → pick the share file.",
  "3. After upload, click the pinned file → 'Copy URL' (form: https://gateway.pinata.cloud/ipfs/Qm…).",
  `4. Paste that URL into the matching slot in ${BRAND_NAME} Enrol.`,
  "Why this is good: IPFS pins are permanent until you unpin. Pinata's free tier is more than enough for ~1 KB share files. No expiry by default.",
];

const ARWEAVE_NOTES: readonly (string | { text: string; link: { href: string; label: string } })[] = [
  "Arweave stores your file PERMANENTLY on the Arweave blockchain. The file lives forever, paid once. Best place for things you absolutely cannot lose — like a will share or a master credential backup.",
  "Easiest path — ArDrive (graphical app):",
  { text: "1. Open ", link: { href: "https://ardrive.io", label: "ardrive.io" } },
  "   Choose 'New ArDrive Wallet' → ArDrive generates an Arweave wallet keyfile (save the .json SECURELY — it's the password to your storage).",
  "2. Buy ~$1 worth of Turbo credits (Arweave's prepayment system; covers thousands of small files) OR fund the wallet with a few cents of AR tokens.",
  "3. Upload the share file → choose 'Public' visibility.",
  "4. Click the file → copy the permanent URL (form: https://arweave.net/{txid}).",
  `5. Paste into ${BRAND_NAME}.`,
  "Permanent means permanent: you can't unpin, you can't delete. Use Arweave only when permanence is what you want.",
];

// 0.5.7 — Info-page search bar (Daniel-asked 2026-05-20). Curated client-side
// index across every tab so users can find any concept on Info without
// knowing which tab it lives on. Two-source index: (1) auto-extracted from
// ARCHITECTURE_SECTIONS (structured); (2) hardcoded entries for the long
// hand-rolled tabs (FAQ / Contracts / Referral / Passkeys / Compliance /
// Competitors / Shares / Security). Each entry has a tab + sectionId so
// the click-to-result handler jumps to the right tab and scrolls to the
// section anchor.
interface SearchEntry {
  readonly tab: Tab;
  readonly sub?: string;       // sub-tab id (architecture: business|technology, security: model|passkeys)
  readonly sectionId?: string;
  readonly title: string;
  readonly body: string;
  readonly keywords?: string; // extra search terms, not displayed
}

const SEARCH_INDEX: readonly SearchEntry[] = [
  // -- About NoKLock tab (0.7.6) — project-meta content moved from
  //    Settings 2026-06-02. Version, build hash, deploy date, live
  //    contracts, GDPR posture, IP/patent, privacy notice, system
  //    status, app updates.
  { tab: "about", title: "NoKLock updates — how the PWA stays current",
    body: "NoKLock is an installable web app (PWA). It auto-updates in the background and applies the newest version the next time every NoKLock tab and window is closed and reopened. Hardware-wallet support is vendor-maintained (MetaMask / Trust / WalletConnect / Ledger Live) — NoKLock ships no custom USB driver.",
    keywords: "update updates PWA auto-update install hardware wallet ledger trezor" },
  { tab: "about", title: "Privacy — what NoKLock can and cannot see",
    body: "Every cryptographic operation runs in your browser. The only call this PWA makes to the back-end is a JSON-RPC proxy that hides your IP from the public Polygon node. Current back-end URL is shown on the About tab. Self-hosting is one .env edit + rebuild.",
    keywords: "privacy back-end api url rpc proxy self-host self-hosting env zero trackers no cookies" },
  { tab: "about", title: "System status — operational ping",
    body: "Curated public 'don't trust, verify' strip: build hash, 6 verified contracts link, on-chain / Chainlink Automation statement, real /v1/health Operational ping, last-update date. Veracity-guarded: never a false green, never exposes LINK / queue / secret internals.",
    keywords: "system status operational health ping uptime chainlink automation build" },
  { tab: "about", title: "About — version, build, contracts, GDPR, IP",
    body: "Public version, build hash, mainnet deploy date, chain, live contracts on Polygon mainnet (License / SBT / Oracle / Recovery / Escrow / Alerts), all source-verified, all clickable to PolygonScan. Entity: Tenza Climate Solutions HRB 41384. GDPR: zero cookies, zero trackers. IP: live patent leader + scope.",
    keywords: "about version build hash deploy date contracts polygon polygonscan GDPR entity HRB Germany patent IP" },
  // -- Use cases tab (0.7.3) — the six categories of things people put
  //    in a NoKLock vault, plus the deceased-user-policy disclosure.
  { tab: "use-cases", title: "What can I store? — six categories",
    body: "Crypto and finance keys, digital identity and accounts, hidden places and physical hints, vital documents, final wishes and personal letters, recovery codes and backup secrets — the six concrete categories of things people actually want to put in a NoKLock vault.",
    keywords: "use cases what to store what for vault contents categories seeds letters documents images" },
  { tab: "use-cases", title: "Digital legacy specifics — platform deceased-user policies",
    body: "Facebook, Instagram, Google, Apple, X (Twitter), LinkedIn — each has a different rule for what an heir can do after you die. Memorialise, remove, legacy contact, inactive account manager.",
    keywords: "memorial memorialise deceased legacy contact inactive account manager facebook instagram google apple twitter linkedin platform policy" },
  // -- Auto: ARCHITECTURE sections (the *-proof differentiators + the rest)
  ...ARCHITECTURE_SECTIONS.map((s) => ({
    tab: "architecture" as Tab,
    sectionId: s.id,
    title: s.title,
    body: s.lede + " " + s.body.join(" "),
  })),
  // -- FAQ (one entry per Q)
  { tab: "faq", title: "Connected the same wallet on another device — no vaults?", body: "Vault list lives only in the browser you enrolled in. Restore device-independent." },
  { tab: "faq", title: "Lost my device or cleared my browser — can I still recover?", body: "Yes via Restore + threshold of share files + master password." },
  { tab: "faq", title: "Is there 2FA or SMS verification?", body: "No, deliberately. NoKLock bans SMS-2FA + TOTP. Lost second factor would destroy recovery + inheritance." },
  { tab: "faq", title: "What is the optional passkey?", body: "WebAuthn passkey is a per-device convenience unlock added after enrol. Master password remains the canonical key. PRF / hmac-secret extension required." },
  { tab: "faq", title: "Are next-of-kin per vault? How to add after enrolment?", body: "Each NoK is bound on-chain to one vault (vaultId + manifestHash). Add via /nok + Designate or per-vault detail page." },
  { tab: "faq", title: "Why can't I create a document or image vault?", body: "Document + image vaults are a Premium feature, gated against on-chain licence tier." },
  { tab: "faq", title: "Does NoKLock store my data, or see my vaults / seed?", body: "No — all encryption is in your browser. Server never sees seed, shares, or which vaults you own." },
  { tab: "faq", title: "Difference between Lifetime and Standard?", body: "Lifetime is Standard's feature set paid once instead of yearly. Same features. Only billing differs." },
  { tab: "faq", title: "Page looked stale, wallet showed not-connected after refresh?", body: "App auto-updates + wallet auto-reconnects. Hard refresh forces latest build: Ctrl+Shift+R / Cmd+Shift+R." },
  { tab: "faq", title: "Heir guide — public guide for next-of-kin who received an inheritance email", body: "Dedicated /heir route. Plain language, no wallet required to read. Covers: what just happened, is this real / how to verify, what you need, step-by-step claim + restore, multi-NoK quorum, what if you don't have the password / shares, what NoKLock cannot do, post-claim. Activation email links here BEFORE the claim flow.", keywords: "heir next-of-kin guide walkthrough scam phishing legitimate verify restore claim activation email" },
  // -- Contracts tab key surfaces
  { tab: "contracts", title: "Contracts & audit posture",       body: "Six contracts on Polygon mainnet — License, SBT, Oracle, Recovery, Escrow, Alerts. Source-verified on PolygonScan." },
  { tab: "contracts", title: "How these were reviewed",          body: "154 automated forge tests on Solidity 0.8.35. Multiple independent AI reviews (two-pass external audit + Claude triple self-review). Basic SolidityScan review across every contract. Local Polygon-mainnet-fork dress-rehearsal of the full deploy. PolygonScan source verification.", keywords: "audit forge solidityscan polygonscan tests anvil fork" },
  { tab: "contracts", title: "Why no formal audit",              body: "We have not and do not intend to commission a formal audit. No pooled honeypot. SBTs are valueless ERC-5192 soulbound. Tiny attack surface. Multiple independent reviews completed. Bug bounty active.", keywords: "bug bounty formal audit honeypot ERC-5192" },
  { tab: "contracts", title: "If you scan these yourself",       body: "What automated scanner flags mean — false positives walked through: public burn x3, incorrect access control, _safeMint reentrancy, setGuardians missing modifier, OZ-library unchecked-block.", keywords: "solidityscan false positive scanner" },
  { tab: "contracts", sectionId: "bug-bounty", title: "Bug Bounty — found a bug? we'll trade for it", body: "Free Lifetime licence for verified bug reports. USDC payout for criticals. Email hello@noklock.app. Standard + critical reward tiers, in-scope / out-of-scope clear, formal terms at Terms §7.", keywords: "bug bounty report security responsible disclosure lifetime reward" },
  { tab: "contracts", title: "The bottom line",                  body: "Nothing to steal. Money only moves with your signature. Inheritance can't be silently hijacked. Worst realistic bug is self-funded griefing." },
  // -- Referral tab key surfaces
  { tab: "referrals", title: "Refer & earn — how it actually works",    body: "On-chain 10% referee discount + 10% referrer share of what they pay. First-referrer-lock. Pre-5-refs: credit. Post-5-refs: instant USDC affiliate." },
  { tab: "referrals", title: "Worked example — founder pricing",        body: "Friend mints Standard at founder $99 → pays $89.10 (10% off). You earn $8.91 (10% of $89.10)." },
  { tab: "referrals", title: "How your link is remembered",             body: "noklock.ref localStorage write-once. No cookies. Browser-local + best-effort. On-chain first-referrer-lock is the only durable record." },
  { tab: "referrals", title: "Founder-Referrer Bonus",                  body: "First wallet to 100/500/1,000 paid referrals earns 25%/50%/75% bonus on hard earnings. Admin-paid, on-chain-anchored, reputation pledge.", keywords: "founder referrer bonus milestone contest pledge" },
  { tab: "referrals", title: "Why this is trustless, not a programme",  body: "Contract is arbiter. No contract-held balance. Owner-tunable bounded. Treasury keeps ≥40% always." },
  // -- Passkeys (now Security → Passkeys & access sub-tab)
  { tab: "security", sub: "passkeys", title: "Passkeys & access — what unlocks your vault", body: "Master password (real key) vs passkey (optional per-device convenience). Master password always works." },
  { tab: "security", sub: "passkeys", title: "How passkeys actually work",          body: "WebAuthn PRF / hmac-secret extension. Wraps an extra encrypted copy. Passkey-unlock.json sidecar. Not a second factor." },
  { tab: "security", sub: "passkeys", title: "Questions that actually matter",      body: "Lost device → master password works. Forgot master password → unrecoverable, deliberate. NoK uses shares + master password, never the passkey." },
  // -- Compliance tab
  { tab: "compliance", title: "Compliance, regulation, jurisdiction", body: "AS-IS no warranty. BUSL-1.1 source-visible. Self-custodial. Owner is administrator not custodian. English authoritative." },
  { tab: "compliance", title: "Why not 'keyless'",                    body: "Other wallets hide the key. NoKLock honours your seed phrase, makes it hard to lose, easy to recover, ready to inherit. Honest self-custody." },
  // -- Shares tab
  { tab: "shares",     title: "Simple route: three folders on your own devices", body: "Three local folders on your laptop, phone or USB drive already beats a sticky note. Leave the URL field blank during enrol; lose any one folder and the rest still recover the seed." },
  { tab: "shares",     title: "How to spread your encrypted shares",   body: "One share per separate cloud account. Dropbox / Drive / OneDrive / IPFS / Arweave. Anyone-with-the-link viewer permission." },
  { tab: "shares",     title: "Provider how-tos",                      body: "Step-by-step for Google Drive, Dropbox, OneDrive, IPFS via Pinata, Arweave permanent." },
  // -- Process tab
  { tab: "process",    title: "Process diagrams",                      body: "Enrol flow, Restore flow, NoK + dead-man flow, Multi-NoK quorum (social-engineering-proof). Hover any node for detail." },
  // -- Security tab (Security model sub-tab)
  { tab: "security", sub: "model",   title: "Security model — short version",        body: "Argon2id KDF + SLIP-39 Shamir + AEAD (GCM / XChaCha20). Ed25519 manifest. No 2FA / no SMS. Master password is the canonical key." },
  // -- Competitors tab
  { tab: "competitors", title: "Competitor comparison",                body: "Two competitor categories — Crypto inheritance (Casa, Vault12, Coincover, Unchained Capital Vault, Sarcophagus, Heir) and Digital legacy & post-mortem (Everplans, Trustworthy, GoodTrust, AfterVault, Cake, Lantern, Inalienable, Yellow Brick). New Managed-wallet column (email/passkey signin, no wallet setup) — NoKLock — Managed is UNIQUE. Complementary tools section: 1Password, Bitwarden, Dashlane, Proton Pass, Apple Passwords are complements not competitors — store your master password in a NoKLock letter vault. Plus deep-dive 37-row legacy matrix kept for verification. Annual price, custody model, soulbound NFT inheritance, on-chain referral, KYC posture." },
];

function SearchBar({ onPick }: { readonly onPick: (e: SearchEntry) => void }): JSX.Element {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results: readonly SearchEntry[] = (() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    return SEARCH_INDEX
      .map((e) => {
        const hay = (e.title + " " + e.body + " " + (e.keywords ?? "")).toLowerCase();
        const titleHit = e.title.toLowerCase().includes(term);
        const bodyHit  = hay.includes(term);
        if (!titleHit && !bodyHit) return null;
        // Score: title-hit > body-hit; earlier match > later
        const score = (titleHit ? 100 : 0) - hay.indexOf(term);
        return { e, score };
      })
      .filter((x): x is { e: SearchEntry; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.e);
  })();

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (ev: MouseEvent): void => {
      if (!inputRef.current?.parentElement?.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function snippet(text: string, term: string, len = 90): string {
    const i = text.toLowerCase().indexOf(term.toLowerCase());
    if (i < 0) return text.slice(0, len);
    const start = Math.max(0, i - 30);
    return (start > 0 ? "…" : "") + text.slice(start, start + len) + (text.length > start + len ? "…" : "");
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHover(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setHover(Math.min(hover + 1, results.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHover(Math.max(hover - 1, 0)); }
          else if (e.key === "Enter" && results[hover]) { e.preventDefault(); onPick(results[hover]); setOpen(false); setQ(""); }
          else if (e.key === "Escape") { setOpen(false); }
        }}
        placeholder="Search Info — concepts, terms, sections… (try: duress, soulbound, dead-man, referral, audit)"
        className="w-full px-4 py-3 rounded-lg border border-bg-surface bg-bg-deepest text-sm focus:outline-none focus:border-accent-cyan placeholder:text-text-muted/60"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 max-h-96 overflow-y-auto rounded-lg border border-accent-cyan/40 bg-bg-panel shadow-2xl">
          {results.map((r, i) => (
            <button
              key={`${r.tab}-${r.sectionId ?? r.title}-${i}`}
              onClick={() => { onPick(r); setOpen(false); setQ(""); }}
              onMouseEnter={() => setHover(i)}
              className={`w-full text-left p-3 border-b border-bg-surface/40 last:border-0 transition-colors ${i === hover ? "bg-bg-surface" : "hover:bg-bg-surface/60"}`}
            >
              <div className="flex items-baseline gap-2">
                <span className="tier-badge bg-cyan-700/30 text-accent-cyan border border-accent-cyan/30 text-[10px]">{TAB_LABEL[r.tab]}</span>
                <span className="font-bold text-sm text-text-on-dark">{r.title}</span>
              </div>
              <p className="text-xs text-text-muted mt-1">{snippet(r.body, q)}</p>
            </button>
          ))}
        </div>
      )}
      {open && q.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-lg border border-bg-surface bg-bg-panel p-3 text-sm text-text-muted">
          No matches. Try a different term — or check the <Link to="/help" className="text-accent-cyan hover:underline">/help</Link> page.
        </div>
      )}
    </div>
  );
}

export function Info(): JSX.Element {
  useDocumentHead("/info");
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab") ?? "architecture";
  const rawSub = params.get("sub") ?? "";
  // Back-compat: ?tab=passkeys (the old standalone tab) → security + passkeys sub.
  // Old bookmarks keep working after the 2026-05-22 consolidation.
  const initialTab: Tab = rawTab === "passkeys"
    ? "security"
    : (TABS.find((t) => t.id === rawTab) ? (rawTab as Tab) : "architecture");
  const initialSub = rawTab === "passkeys" ? "passkeys" : rawSub;

  const [tab, setTab] = useState<Tab>(initialTab);
  const [archSub, setArchSub] = useState<ArchSub>(
    ARCH_SUBS.find((s) => s.id === initialSub) ? (initialSub as ArchSub) : "business",
  );
  const [secSub, setSecSub] = useState<SecSub>(
    SEC_SUBS.find((s) => s.id === initialSub) ? (initialSub as SecSub) : "model",
  );
  const [openProvider, setOpenProvider] = useState<string | null>(null);

  // Deep-link: /info?tab=<tab>#<section> scrolls to that section once the
  // tab's content has painted (e.g. the landing "Why not keyless" CTA).
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const tmr = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => clearTimeout(tmr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, archSub, secSub]);

  function pick(t: Tab): void {
    setTab(t);
    // Drops ?sub — parents default to their first sub-tab on top-level switch.
    setParams({ tab: t });
  }

  function pickArchSub(s: ArchSub): void {
    setArchSub(s);
    setParams({ tab: "architecture", sub: s });
  }

  function pickSecSub(s: SecSub): void {
    setSecSub(s);
    setParams({ tab: "security", sub: s });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-display"><span className="grad">Info</span></h1>
      </header>

      {/* 0.8.6 (Daniel 2026-06-04): SearchBar + User-guide / Heir-guide
          buttons on a SINGLE row. SearchBar is shorter (flex-1, no longer
          full width) so the two guide buttons fit next to it. This
          shortens the tab-nav row by two items, which used to force
          horizontal scroll on every device under ~1280px wide. */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
        <div className="flex-1 min-w-0">
          <SearchBar
            onPick={(e) => {
              setTab(e.tab);
              // Apply sub-tab if the search entry specified one (so e.g. a passkey
              // result lands the user on Security → Passkeys, not just Security).
              if (e.sub && e.tab === "architecture" && ARCH_SUBS.find((s) => s.id === e.sub)) {
                setArchSub(e.sub as ArchSub);
                setParams({ tab: e.tab, sub: e.sub });
              } else if (e.sub && e.tab === "security" && SEC_SUBS.find((s) => s.id === e.sub)) {
                setSecSub(e.sub as SecSub);
                setParams({ tab: e.tab, sub: e.sub });
              } else {
                setParams({ tab: e.tab });
              }
              if (e.sectionId) {
                setTimeout(() => {
                  document.getElementById(e.sectionId!)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }
            }}
          />
        </div>
        <Link
          to="/manual"
          className="inline-flex items-center justify-center px-4 rounded-lg border border-bg-surface bg-bg-deepest text-sm text-accent-cyan hover:border-accent-cyan/60 transition-colors shrink-0"
        >
          User guide ↗
        </Link>
        <Link
          to="/heir"
          className="inline-flex items-center justify-center px-4 rounded-lg border border-bg-surface bg-bg-deepest text-sm text-accent-cyan hover:border-accent-cyan/60 transition-colors shrink-0"
        >
          Heir guide ↗
        </Link>
        <Link
          to="/articles"
          className="inline-flex items-center justify-center px-4 rounded-lg border border-bg-surface bg-bg-deepest text-sm text-accent-cyan hover:border-accent-cyan/60 transition-colors shrink-0"
        >
          NoKLock Articles ↗
        </Link>
      </div>

      {/* Tab nav — User guide + Heir guide were here; moved up to the
          search row (above) to keep this line short enough to fit without
          a scrollbar on common viewports. */}
      <nav className="card flex flex-nowrap gap-2 p-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => pick(t.id)}
            className={`px-2 py-2 rounded text-sm whitespace-nowrap shrink-0 transition-colors ${
              tab === t.id
                ? "grad-bg text-text-primary font-bold"
                : "bg-bg-surface text-text-on-dark/80 hover:bg-bg-deepest"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* 0.7.6 — About NoKLock tab (Daniel 2026-06-02). Content moved
          verbatim from Settings.tsx 0.5.x. Order on the tab is the same
          as the old Settings page bottom — Updates, then Privacy, then
          System status, then About — so a reader who knew Settings can
          find each section in the same sequence. */}
      {tab === "about" && <AboutNoKLockTab />}

      {tab === "use-cases" && (
        <div className="space-y-6">
          {/* 0.7.5 — Opener: continuous-scroll marquee of concrete one-liners.
              Sits ABOVE the categorical grid so a reader sees the diversity
              of what people actually put in a vault before they hit the six
              category cards. Lead-in: "Every kind of secret. One pattern. Pick yours." */}
          <VaultUseCasesCarousel leadInText="Every kind of secret. One pattern. Pick yours." />

          <section id="vault-use-cases" className="card scroll-mt-20">
            <h2 className="text-2xl font-bold font-display mb-3">
              <span className="grad">What can I store in a {BRAND_NAME} vault?</span>
            </h2>
            <p className="text-lg text-text-on-dark/90 mb-2">
              Six categories of things people want their next-of-kin to inherit: seed phrases, account logins, hidden physical places, legal documents, final wishes, and the recovery codes that unlock everything else. Each card lists concrete examples and the vault kind that fits.
            </p>
            <p className="text-sm text-text-muted mb-4">
              Read this tab first to see whether {BRAND_NAME} is for you. The Architecture and How-it-works tabs are next door if you want to verify how it works before trusting it.
            </p>
            <VaultUseCases />
          </section>

          {/* 0.7.4 — Digital-legacy lead. The "your online life doesn't end
              when you do" hero framing for the Digital Identity & Accounts
              category, the six concrete heir actions, and the zero-log
              privacy stamp. Placed directly after the use-case grid so a
              reader who paused on the Identity card sees the lead-in. */}
          <section id="digital-legacy" className="card scroll-mt-20">
            <h2 className="text-2xl font-bold font-display mb-3">
              <span className="grad">Your online life doesn't end when you do</span>
            </h2>
            <p className="text-lg text-text-on-dark/90 mb-4">
              Someone has to deal with it. Memorialise or close the social profiles. Tell the networks before an algorithm tells the wrong people. Pull the irreplaceable photos and drafts out of cloud storage before the account auto-suspends. Cancel the recurring charges that keep billing your estate. Lock down impersonation. Hand the business off to whoever was running it with you. None of this happens on its own, and almost none of it is possible without credentials your heirs don't have.
            </p>

            <h3 className="text-sm font-bold uppercase tracking-wide text-accent-cyan mb-2">
              What your heir will actually need to do
            </h3>
            <ul className="space-y-2 text-sm text-text-on-dark/85 mb-4">
              <li className="flex gap-2"><span className="text-accent-cyan shrink-0">→</span><span>Memorialise or close each social account, following that platform's own deceased-user policy.</span></li>
              <li className="flex gap-2"><span className="text-accent-cyan shrink-0">→</span><span>Tell the networks before strangers find out via algorithm or auto-tag.</span></li>
              <li className="flex gap-2"><span className="text-accent-cyan shrink-0">→</span><span>Pull what's irreplaceable out of cloud storage and devices: photos, files, drafts, half-finished work.</span></li>
              <li className="flex gap-2"><span className="text-accent-cyan shrink-0">→</span><span>Stop the bleed: cancel paid subscriptions, recurring charges, ongoing services.</span></li>
              <li className="flex gap-2"><span className="text-accent-cyan shrink-0">→</span><span>Lock down impersonation. Heirs with the full credential trail can prove ownership and shut down a copycat fast.</span></li>
              <li className="flex gap-2"><span className="text-accent-cyan shrink-0">→</span><span>Hand off the business: partners, clients, vendor logins, the in-flight work that doesn't stop just because you did.</span></li>
            </ul>

            {/* Zero-log privacy stamp — same wording as the per-card
                stamp on the Identity card. Repeated here because this
                section talks about putting credentials into the vault, and
                that's exactly where readers worry about who can see them. */}
            <div className="rounded-md border border-accent-teal/40 bg-accent-teal/10 px-4 py-3">
              <p className="text-sm text-accent-teal font-semibold leading-relaxed">
                We don't log a thing. The vault is yours. What you put in it is yours. We don't see it, can't see it, never will see it.
              </p>
            </div>
          </section>

          {/* 0.7.4 — PhonePinNotCloud callout REMOVED here in 0.8.3 (Daniel
              2026-06-03): the same callout is now rendered INLINE inside the
              Digital Identity & Accounts card via the inlineCallout data path
              in VaultUseCases.tsx. Keeping it both places duplicated the
              warning on the same scroll. */}

          {/* MemorialPlatforms — expandable "Digital legacy specifics"
              disclosure that unpacks the deceased-user policies for the
              six big platforms that the "Digital Identity & Accounts"
              category card points at. Sits beneath the use-case grid so
              a reader who lands on Identity sees exactly which form their
              heir will need to file, per platform. */}
          <MemorialPlatforms />

          {/* 0.7.4 — Pre-setup CTAs for the two big free tools that almost
              nobody enables in advance. Both require the OWNER to set them
              up while alive; neither can be enabled by heirs after the
              fact. Surfaces the official URLs alongside the platform-
              policies disclosure above. */}
          <section id="pre-setup-tools" className="card scroll-mt-20">
            <h2 className="text-xl font-bold font-display mb-2">
              <span className="grad">Two free tools, do these now</span>
            </h2>
            <p className="text-sm text-text-muted mb-4">
              Apple and Google each ship a free post-mortem access tool. You have to switch them on while you're alive. Your heirs can't turn them on for you afterwards, and almost nobody turns them on in advance. Five minutes each.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="font-mono text-accent-cyan shrink-0 w-48">Apple Digital Legacy</span>
                <span className="text-text-muted flex-1">Add one or more Legacy Contacts to your Apple ID. With a death certificate plus the access key Apple gives you to share, they can request your iCloud photos, messages, files, and apps.</span>
                <a
                  href="https://support.apple.com/en-us/HT212360"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-teal hover:underline text-xs font-mono shrink-0"
                >
                  Set up →
                </a>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="font-mono text-accent-cyan shrink-0 w-48">Google Inactive Account</span>
                <span className="text-text-muted flex-1">Google's Inactive Account Manager lets you nominate trusted contacts to receive a copy of your data (Gmail, Drive, Photos, YouTube) after 3 to 18 months of inactivity. Or to have the account deleted entirely.</span>
                <a
                  href="https://myaccount.google.com/inactive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-teal hover:underline text-xs font-mono shrink-0"
                >
                  Set up →
                </a>
              </li>
            </ul>
          </section>
        </div>
      )}

      {tab === "architecture" && (
        <div className="space-y-6">
          {/* 2026-05-27: WhyItMatters (with the IP/patent block folded inside
              as its 5th rectangle) moved from TOP to BOTTOM of the Architecture
              tab. Sub-tab content reads first; the "why our architecture
              choices matter + IP we've protected" collapsible sits beneath. */}
          <SubTabBar items={ARCH_SUBS} active={archSub} onPick={(s) => pickArchSub(s as ArchSub)} />
          {archSub === "business" && (
            <>
              <nav className="card">
                <h2 className="font-bold font-display mb-3">Jump to</h2>
                <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-sm">
                  {ARCHITECTURE_SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="text-accent-cyan hover:underline">{s.title}</a>
                    </li>
                  ))}
                </ul>
              </nav>
              {ARCHITECTURE_SECTIONS.map((s) => (
                <section key={s.id} id={s.id} className="card scroll-mt-20">
                  <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">{s.title}</span></h2>
                  <p className="text-lg text-text-on-dark/90 mb-4">{s.lede}</p>
                  <div className="space-y-3 text-sm text-text-on-dark/80">
                    {s.body.map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                </section>
              ))}
            </>
          )}
          {archSub === "technology" && <TechnologyArchSection />}
          {archSub === "fsm" && <FSMArchSection />}
          {archSub === "managed" && <ManagedModeArchSection />}
          {archSub === "interfaces" && <ThirdPartyInterfacesArchSection />}
          {archSub === "roadmap" && <RoadmapArchSection />}
          {archSub === "why" && <WhyItMatters />}
        </div>
      )}

      {tab === "shares" && (
        <section id="providers" className="card scroll-mt-20">
          <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Where do my shares go?</span></h2>
          <p className="text-lg text-text-on-dark/90 mb-4">
            You pick. {BRAND_NAME} only sees the share URLs you paste — never your accounts, never your other files. No OAuth, no API keys, no provider lock-in.
          </p>
          <p className="text-sm text-text-on-dark/80 mb-4">
            Strongest setup: 3+ providers from different jurisdictions. Encrypted share files are ~1 KB each so free tiers everywhere are more than enough.
          </p>

          {/* folded from Help.tsx 0.6.x — Daniel 2026-06-04 */}
          <div className="rounded border border-accent-cyan/40 bg-accent-cyan/5 p-3 mb-6">
            <div className="font-semibold text-accent-cyan mb-1">⚡ Want to skip the manual upload?</div>
            <p className="text-sm text-text-on-dark/85 leading-snug">
              Our open-source CLI tool, <code>noklock-cli</code>, automates upload + download for Dropbox today (Google Drive + OneDrive coming). You install it locally, paste your provider token into your own shell, and the CLI does the rest. <strong>The token never reaches {BRAND_NAME}</strong> — same trust story as manual, less typing.
            </p>
            <p className="text-xs text-text-muted leading-snug mt-2">
              Install + usage: <a href="https://github.com/dksteeves/noklock/tree/main/tools/noklock-cli" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">github.com/dksteeves/noklock/tree/main/tools/noklock-cli</a>. Requires Node.js 20+. ~250 lines, audit it in 10 minutes.
            </p>
          </div>

          <div className="card bg-bg-deepest mb-6 space-y-4 text-sm text-text-on-dark/85">
            <h3 className="font-bold font-display text-lg"><span className="grad">Getting your shares out — and back</span></h3>

            <div>
              <div className="font-bold text-text-on-dark">1 · Out of the browser (enrol)</div>
              <p className="mt-1">
                {BRAND_NAME} splits and encrypts everything inside your browser, offline. The encrypted files then have to leave it. Two ways:
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li><strong>Save into a folder</strong> (Chrome/Edge): you pick a folder on your computer and all files are written straight in — no save-each. If that folder is your Dropbox / OneDrive / Drive <strong>desktop-sync</strong> folder, the cloud's own app syncs it up for you.</li>
                <li><strong>Download</strong> (any browser): the files come down as normal downloads and you put them where you want.</li>
              </ul>
              <p className="mt-2 text-text-muted">
                Either way, {BRAND_NAME} <strong>never talks to your cloud</strong> — no login, no token, no API. It writes to a local folder or hands you downloads; your own cloud's sync app (software you installed) is what carries it up. A "share link" is a <em>read</em> link the provider makes <em>after</em> a file exists — you can't write a file to a link, which is why there's no "{BRAND_NAME} uploads for me".
              </p>
            </div>

            <div>
              <div className="font-bold text-text-on-dark">2 · One share per separate account — and why</div>
              <p className="mt-1">
                Put <strong>each</strong> share in a <strong>different</strong> account. Any T of N rebuild your secret; fewer reveal nothing. So one stolen account leaks only <em>one</em> share — useless alone, your vault stays safe. All shares in one place removes exactly that protection, which is why the one-folder shortcut is not offered to users.
              </p>
            </div>

            <div>
              <div className="font-bold text-text-on-dark">3 · Back again (restore) — and why some steps are manual</div>
              <p className="mt-1">
                Restore is the reverse and runs entirely in your browser. You supply the share files: drag them in (open your folder, download, drop), or paste one share's <strong>direct-download link</strong> and Fetch — <strong>one at a time</strong>. There is no "one folder link pulls everything" — {BRAND_NAME} never enumerates a folder.
              </p>
              <p className="mt-2 text-text-muted">
                The manual parts are deliberate security, not unfinished work: no cloud token means nothing for us to leak; per-file (no folder API) keeps it provider-agnostic and trustless; end-to-end providers (MEGA / Filen / Internxt) decrypt in <em>their</em> client, so they must be downloaded then dropped in. Your <strong>master password</strong> is always the canonical key — a lost passkey or dead device can never brick the vault or block your next-of-kin.
              </p>
            </div>
          </div>

          {/* 2026-06-07 (Daniel) §3.2 — simple-vs-max-security callout mirroring
              Enrol Step B 2.13.0 (same cyan-bordered card from Landing 0.22.0).
              Surfaces BOTH routes before the provider catalog so users who only
              want the simple folder route don't bounce off "need an IPFS account"
              complexity. */}
          <div className="mb-4 rounded-lg border border-accent-cyan/30 bg-bg-deepest/40 p-3 text-sm">
            <div className="font-bold text-text-on-dark mb-1"><span className="grad">Two routes — pick what fits you today</span></div>
            <p className="text-text-on-dark/85 mb-2">
              <strong>Simple:</strong> put each share file in a <strong>different folder</strong> on your laptop, phone, USB drive, or wherever you already keep files. Leave the URL field blank at enrol. This is already dramatically safer than a sticky note or an encrypted text file — lose any one folder and the rest still recover the seed.
            </p>
            <p className="text-text-on-dark/85">
              <strong>Maximum security:</strong> put each share in a <strong>different cloud account</strong> from the provider catalog below (Drive, Dropbox, OneDrive, IPFS, Arweave, etc.) and paste the "anyone with the link" URL at enrol. That separation is the whole point of the threshold split: one stolen account leaks only <em>one</em> share, so your vault stays safe. You + your next-of-kin can fetch shares remotely instead of needing every file on hand.
            </p>
            <p className="text-text-muted text-xs mt-2">
              URLs are optional in both routes. {BRAND_NAME} stores only the URL (locally in your browser, nothing sent anywhere); the share files themselves never leave your control.
            </p>
          </div>

          <div className="space-y-2">
            {PROVIDERS.map((p) => {
              const howto = PROVIDER_HOWTOS[p.id];
              const isOpen = openProvider === p.id;
              return (
                <div key={p.id} className="border border-bg-surface rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenProvider(isOpen ? null : p.id)}
                    className="w-full p-3 flex items-center justify-between gap-3 bg-bg-panel hover:bg-bg-surface transition-colors text-left"
                  >
                    <span className="flex-1">
                      <span className="font-bold">{p.displayName}</span>
                      <span className="text-text-muted text-sm"> · {p.freeQuota} free · {p.jurisdiction}</span>
                    </span>
                    <a href={p.signupUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-accent-cyan hover:underline text-xs">
                      open →
                    </a>
                    <span className="text-text-muted text-xs">{isOpen ? "▾" : "▸"}</span>
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-bg-deepest border-t border-bg-surface text-sm">
                      <p className="text-text-on-dark/80 mb-3">{p.notes}</p>
                      {howto && (
                        <>
                          <div className="text-xs text-text-muted mb-1">How to share</div>
                          <ol className="list-decimal ml-5 space-y-1 text-text-on-dark/80">
                            {howto.steps.map((s, i) => <li key={i}>{s}</li>)}
                          </ol>
                          {howto.cautions && (
                            <div className="mt-3 p-2 rounded bg-accent-cyan/10 border border-accent-cyan/40 text-xs">
                              <strong className="text-accent-cyan">Note:</strong> {howto.cautions}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className="card">
              <h3 className="font-bold font-display mb-2"><span className="grad">IPFS via Pinata</span></h3>
              <div className="space-y-2 text-sm text-text-on-dark/80">
                {IPFS_NOTES.map((p, i) => renderNote(p, i))}
              </div>
              <div className="mt-3">
                <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-sm">open pinata.cloud →</a>
              </div>
            </div>
            <div className="card">
              <h3 className="font-bold font-display mb-2"><span className="grad">Arweave (permanent storage)</span></h3>
              <div className="space-y-2 text-sm text-text-on-dark/80">
                {ARWEAVE_NOTES.map((p, i) => renderNote(p, i))}
              </div>
              <div className="mt-3 flex gap-4">
                <a href="https://ardrive.io" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-sm">open ardrive.io →</a>
                <a href="https://arweave.app" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline text-sm">open arweave.app →</a>
              </div>
            </div>
          </div>

          <p className="text-xs text-text-muted mt-6">
            Note: MEGA / Filen / Internxt use end-to-end encryption with provider-managed keys. {BRAND_NAME} can't auto-fetch from those at restore time — download the share file in your browser, then drag it into the Restore page.
          </p>
        </section>
      )}

      {tab === "faq" && <FaqTab />}
      {tab === "process" && <ProcessDiagrams />}
      {tab === "security" && (
        <div className="space-y-6">
          <SubTabBar items={SEC_SUBS} active={secSub} onPick={(s) => pickSecSub(s as SecSub)} />
          {secSub === "model" && <SecurityTab />}
          {secSub === "passkeys" && <PasskeysTab />}
        </div>
      )}
      {tab === "contracts" && <ContractsTab />}
      {tab === "referrals" && <ReferralInfoTab />}
      {tab === "compliance" && <ComplianceTab />}
      {tab === "competitors" && <>
        {/* 0.8.7 (Daniel 2026-06-05): compact link card near the top of the
            Competitors tab, surfaces the /compare head-to-head pages so
            visitors who land here from search realise the deeper matrix
            exists. Sized small intentionally — sits above AskAnAI without
            pushing the table below the fold. */}
        <Link to="/compare" className="card block border-accent-cyan/40 hover:border-accent-cyan transition-colors mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-accent-cyan font-bold mb-1">Deeper comparison</div>
              <div className="text-sm text-text-on-dark/90">
                <span className="font-bold">Head-to-head pages with every rival</span> — Casa, Vault12, Inheriti, Ledger Recover, Nunchuk, Unchained, Sarcophagus, plus digital-legacy and managed-wallet alternatives. Honest verdict per page; our column is verifiable on PolygonScan today.
              </div>
            </div>
            <span aria-hidden="true" className="text-accent-cyan font-mono text-lg shrink-0">→</span>
          </div>
        </Link>
        <AskAnAI />
        <CompetitorTable />
      </>}
    </div>
  );
}

// -----------------------------------------------------------------------------
// TechnologyArchSection — Architecture > Technology sub-tab (2026-05-22).
// The sister to BusinessArchSection (the x-proof cards). Where Business
// answers "what trust properties does NoKLock offer?", Technology answers
// "how is NoKLock built — components, connections, and the state machine
// the whole system runs on?".
//
// The two large diagrams (Tech-arch component view + animated end-to-end
// state machine) are imported from dedicated SVG components in
// components/TechArchDiagram.tsx + components/FSMDiagram.tsx. Both are
// built in the same SVG idiom as HeroDiagram/ProcessDiagrams (dashed
// tealgrad borders, Jura/JetBrains Mono labels) so they slot in.
// -----------------------------------------------------------------------------
function TechnologyArchSection(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Technology architecture</span></h2>
        <p className="text-lg text-text-on-dark/90 mb-2">
          Where the <em>business</em> architecture tab answers <em>what</em> trust properties {BRAND_NAME} delivers, this tab answers <em>how</em> the system is built — what runs where, and what connects to what. (The state machine that governs the inheritance lifecycle has its own tab: <em>Finite state machine</em>.)
        </p>
        <p className="text-sm text-text-muted">
          Pure SVG, no telemetry, no remote fetch — exactly like the rest of the {BRAND_NAME} chrome.
        </p>
      </div>

      {/* 0.7.9 — Daniel 2026-06-02: "Under the hood" 4-tile section relocated
          from Landing.tsx (homepage was too heavy). Positioned as slot 2 in
          the Technology sub-tab, above "Component view — what runs where".
          Plain JSX (no useT) — these boxes no longer need translation per
          Daniel's homepage-removal directive. */}
      <section id="under-the-hood" className="card scroll-mt-20">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold font-display"><span className="grad">Under the hood</span></h3>
          <p className="text-sm text-text-muted mt-1 max-w-2xl mx-auto">
            The mechanism behind every promise above — the four primitives that make {BRAND_NAME} {BRAND_NAME}.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Box 1 — Air-gap. Voice-pass carry-over: honest, concrete,
              no "AI slop". The crypto core never needs a network, and
              the device is prompted into airplane mode at the boundary. */}
          <div className="rounded border border-bg-surface bg-bg-panel/40 p-3">
            <div className="font-display text-xl font-bold mb-1"><span className="grad">Air-gap</span></div>
            <div className="text-sm font-semibold mb-1 text-text-on-dark/85">Truly disconnected processing</div>
            <p className="text-text-muted text-xs leading-snug">
              Enrol in airplane mode. The crypto core never touches the network — every <code>fetch()</code> from this tab is intercepted, and the device itself is prompted offline at the boundary. Belt-and-braces, not vibes.
            </p>
            <Link to="/info?tab=architecture&sub=tech#air-gapped" className="text-[10px] text-accent-cyan hover:underline mt-2 inline-block">Read how →</Link>
          </div>

          {/* Box 2 — Store anywhere. AUDIT P1 FIX (Daniel 2026-06-03):
              previous copy implied automated upload, which doesn't
              exist — only an OAuth ceremony is wired. Reworded to
              make the manual download/upload flow explicit ("YOU
              upload"), and to reinforce that NoKLock never sees,
              stores, or transmits shares. "Automated share
              distribution" sub-heading removed. Arweave permanent
              backup dropped (also not wired). */}
          <div className="rounded border border-bg-surface bg-bg-panel/40 p-3">
            <div className="font-display text-xl font-bold mb-1"><span className="grad">Store anywhere</span></div>
            <p className="text-text-muted text-xs leading-snug">
              Download each encrypted share and upload it to your own Dropbox / Drive / OneDrive — or save locally, hand to a guardian, print as paper backup, whatever you choose. We never see, store, or transmit your shares; you choose where they live. Optional: pin to <strong>IPFS</strong> for redundancy. No SaaS to fail.
            </p>
            <p className="text-text-muted text-xs leading-snug mt-2 pt-2 border-t border-bg-surface">
              <strong className="text-accent-cyan">Optional speed-up:</strong> our open-source CLI tool (<code>noklock-cli</code>) automates upload/download to Dropbox today (Google Drive + OneDrive coming). It runs on YOUR machine with YOUR token — NoKLock never sees the token. Same trust story, less typing. <em>You pick auto or manual at enrol time.</em>
            </p>
          </div>

          {/* Box 3 — Shamir Protection. Below-threshold math + above-
              threshold audited encryption. Links to /viz/shamir for
              the polynomial visualisation. */}
          <div className="rounded border border-bg-surface bg-bg-panel/40 p-3">
            <div className="font-display text-xl font-bold mb-1"><span className="grad">Shamir Protection</span></div>
            <div className="text-sm font-semibold mb-1 text-text-on-dark/85">Configurable thresholds</div>
            <p className="text-text-muted text-xs leading-snug">
              Below your recovery threshold, the split is mathematically impossible to break — no computer, quantum or otherwise, recovers a single bit. Above it, your shares are sealed with audited, battle-tested encryption.
            </p>
            <Link to="/viz/shamir" className="text-[10px] text-accent-cyan hover:underline mt-2 inline-block">See the math →</Link>
          </div>

          {/* Box 4 — Recovery & Protection. Heartbeat + dead-man's switch
              + the unique live-man's switch (heir-claim with owner-veto
              window). */}
          <div className="rounded border border-bg-surface bg-bg-panel/40 p-3">
            <div className="font-display text-xl font-bold mb-1"><span className="grad">Recovery &amp; Protection</span></div>
            <div className="text-sm font-semibold mb-1 text-text-on-dark/85">When you can't check in</div>
            <p className="text-text-muted text-xs leading-snug">
              Your wallet dies. Your phone is lost. Or you're gone. Either way, {BRAND_NAME}'s in-app heartbeat and dead-man's switch kick in to get your data to your designated next-of-kin — but only if you stop checking in, and don't answer our unique live-man's switch.
            </p>
          </div>
        </div>
      </section>

      <section id="tech-arch-diagram" className="card scroll-mt-20">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Component view — what runs where</span></h3>
        <p className="text-sm text-text-on-dark/85 mb-4">
          Every {BRAND_NAME} component, every connection between them, and which trust boundary each side of the line sits on. Click through to the per-contract source on PolygonScan or to the deeper write-up of any block.
        </p>
        <TechArchDiagram />
        <p className="text-xs text-text-muted mt-4">
          What you can verify yourself from this diagram: every box on the chain side has a verified-source link on the <a href="#" onClick={(e) => { e.preventDefault(); window.location.assign("/info?tab=contracts"); }} className="text-accent-cyan hover:underline">Contracts</a> tab; the storage you pick — local folders or your accounts — is yours (we have no API access, no OAuth, no tokens); the heir's browser runs the same open-source PWA you do.
        </p>
      </section>

      <section id="crypto-primitives" className="card scroll-mt-20">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Cryptographic primitives — what's actually inside</span></h3>
        <p className="text-sm text-text-on-dark/85 mb-4">
          Every primitive {BRAND_NAME} uses, named, and what it does. Standard, peer-reviewed, in-browser — no proprietary algorithms anywhere. The third column is the post-quantum posture (see also the FAQ entry "Is {BRAND_NAME} quantum-safe?").
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-bg-surface">
                <th className="text-left p-2 text-accent-cyan font-display">Primitive</th>
                <th className="text-left p-2 text-accent-cyan font-display">Used for</th>
                <th className="text-left p-2 text-accent-cyan font-display">Post-quantum posture</th>
              </tr>
            </thead>
            <tbody className="text-text-on-dark/85">
              <tr className="border-b border-bg-surface/40 align-top">
                <td className="p-2 font-mono whitespace-nowrap"><strong>AES-256-GCM</strong></td>
                {/* [fix-copy-7-pick-cipher-clarification] Clarified that the
                    (master, share-index) → cipher mapping is deterministic —
                    restore re-derives it. Not freshly random per share. */}
                <td className="p-2">Authenticated encryption of each share's payload — half of the per-share AEAD pool. Cipher selection is deterministic per (master, share-index), so restore re-derives the same choice; it is not freshly random per share, but technically random over the seed.</td>
                <td className="p-2 text-text-muted">Grover-bounded → ≥128-bit effective; NIST considers AES-256 quantum-safe in practice.</td>
              </tr>
              <tr className="border-b border-bg-surface/40 align-top">
                <td className="p-2 font-mono whitespace-nowrap"><strong>XChaCha20-Poly1305</strong></td>
                <td className="p-2">Authenticated encryption of each share's payload — the other half of the AEAD pool. 192-bit nonce makes random nonces collision-safe at scale.</td>
                <td className="p-2 text-text-muted">Grover-bounded → ≥128-bit effective.</td>
              </tr>
              <tr className="border-b border-bg-surface/40 align-top">
                <td className="p-2 font-mono whitespace-nowrap"><strong>Argon2id</strong></td>
                <td className="p-2">Memory-hard key-derivation from your master password → master key. The reason a brute-force attack on the password is computationally impractical.</td>
                <td className="p-2 text-text-muted">Hash-based; Grover-bounded.</td>
              </tr>
              <tr className="border-b border-bg-surface/40 align-top">
                <td className="p-2 font-mono whitespace-nowrap"><strong>Shamir SLIP-39</strong></td>
                <td className="p-2">T-of-N threshold split of the master key into independent shares (e.g. 3-of-5). Below the threshold, the shares mathematically don't contain the secret.</td>
                <td className="p-2 text-text-muted"><strong>Information-theoretic — quantum-immune by construction.</strong> No math to crack.</td>
              </tr>
              <tr className="border-b border-bg-surface/40 align-top">
                <td className="p-2 font-mono whitespace-nowrap"><strong>SHA-256</strong></td>
                {/* [fix-copy-7-pick-cipher-clarification] Per-share AEAD-selector
                    is deterministic from the seed — the SHA-256 hash is *the
                    derivation*, not a freshly-rolled tag. */}
                <td className="p-2">Manifest hash (binds each vault's manifest to its on-chain NoK SBT) + the per-share AEAD-selector hash that deterministically maps (master, share-index) → cipher choice for restore.</td>
                <td className="p-2 text-text-muted">Grover-bounded → 128-bit collision resistance.</td>
              </tr>
              <tr className="border-b border-bg-surface/40 align-top">
                <td className="p-2 font-mono whitespace-nowrap"><strong>secp256k1 ECDSA</strong></td>
                <td className="p-2">Wallet signatures on Polygon — minting, heartbeats, designating heirs, claiming. Done by your wallet, not by {BRAND_NAME}.</td>
                <td className="p-2 text-amber-300">Shor-vulnerable. Same risk as <em>every</em> EVM and Bitcoin wallet; the chains will hard-fork to PQ signatures before that's a live threat.</td>
              </tr>
              <tr className="align-top">
                <td className="p-2 font-mono whitespace-nowrap"><strong>BIP-39</strong></td>
                <td className="p-2">Standard 12/24-word mnemonics for seed-phrase vaults. We never store or transmit a mnemonic — it is encrypted into the AEAD payload like any other secret.</td>
                <td className="p-2 text-text-muted">Encoding only — not a security boundary.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-4">
          The vault's content is end-to-end protected by the symmetric pool + Argon2id + Shamir, which means the most-quoted post-quantum concern ("Q-day breaks crypto inheritance") doesn't apply to {BRAND_NAME}'s vaults — only to the wallet-signing layer, which every product on Polygon / Ethereum / Bitcoin shares. The pure-JS implementation we use (<a href="https://github.com/paulmillr/noble-ciphers" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">@noble/ciphers</a>, <a href="https://github.com/paulmillr/noble-hashes" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">@noble/hashes</a>) is audited and used widely in the broader crypto ecosystem.
        </p>

        {/* [fix-copy-5-v1-key-reuse-disclosure] Audit finding: marketing said
            "standard primitives" but didn't disclose the cross-protocol key
            reuse on v1. Surfacing it here, in the same primitives section,
            so a reader doesn't have to dig through source or NatSpec. */}
        <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-text-on-dark/85">
          <div className="font-display text-amber-300 mb-1">Honest note — v1 vs v2 key schedule</div>
          <p className="mb-2">
            <strong>v1 (legacy baseline)</strong> reuses the Argon2id master key across Shamir splitting, AEAD encryption, and Ed25519 manifest signing. That's a single derived key serving three protocols — a documented cross-protocol reuse pattern, not a "standard primitives" composition.
          </p>
          <p>
            <strong>v2 (default for new vaults since 2026-XX-XX)</strong> derives independent per-purpose subkeys from the Argon2id master using <strong>HKDF (RFC 5869)</strong> with distinct info-strings — one subkey for Shamir, one for AEAD, one for Ed25519 — so a compromise in one path cannot bleed across the others. Existing v1 vaults remain restorable; the format flag in the manifest tells the restore pipeline which schedule to use.
          </p>
        </div>
      </section>

      {/* 0.8.0 — Daniel 2026-06-02: full version of the homepage killer
          Shamir statement (Landing.tsx 0.19.0 short version). Regular
          body paragraph, reads as the conceptual headline for the viz
          below. Below-threshold impossibility + above-threshold
          audited-encryption sealing context. Not i18n'd. */}
      <section className="card border-accent-teal/50 bg-bg-panel/60">
        <p className="text-base md:text-lg text-text-on-dark/90 leading-relaxed max-w-4xl mx-auto">
          Below your recovery threshold, NoKLock&apos;s secret-split is <span className="grad font-bold">mathematically impossible to break</span> — no computer, quantum or otherwise, recovers a single bit. Above it, your shares are sealed with audited, battle-tested encryption (<strong>AES-256-GCM</strong> and <strong>XChaCha20-Poly1305</strong> — the same primitives behind TLS, Signal, and WireGuard).
        </p>
      </section>

      {/* Shamir polynomial viz — the unicorn. Makes the information-theoretic
          property visible: K-1 shares reveal nothing; K shares reconstruct.
          Standalone autoplay loop; full clean version at /shamir for screen-
          recording into GIF / MP4 for social posts. */}
      <section id="shamir-viz" className="card scroll-mt-20">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">How Shamir secret sharing actually works (visualised)</span></h3>
        <p className="text-sm text-text-on-dark/85 mb-2">
          The math behind the SLIP-39 row above, in motion. Watch a polynomial of degree K-1 fit through your secret at x=0, sample N shares off the curve, then hide the secret. With 1 or K-1 shares known, infinitely many curves still pass through the known points — the secret could be any value at x=0. With K shares, exactly one curve fits and the secret reappears. "Any K reconstruct; any K-1 reveal nothing" isn't a slogan — it's a geometric property.
        </p>
        <p className="text-xs text-text-muted mb-4">
          <strong className="text-text-on-dark/90">One of three factors:</strong> in {BRAND_NAME}, the K-of-N share threshold is the cryptographic backbone — but the full restore also requires <strong className="text-text-on-dark/90">your password / passkey</strong> (Argon2id-derived key) and <strong className="text-text-on-dark/90">a connected wallet</strong> for the on-chain claim. This visualisation focuses on the share-threshold math; the password and wallet layers are independent and shown in the Process diagrams.
        </p>
        <Suspense fallback={<div className="rounded-lg border border-bg-surface bg-bg-deepest/40 text-text-muted text-sm flex items-center justify-center" style={{ height: 420 }}>Loading viz…</div>}>
          <ShamirPolyViz secret={73} n={5} k={3} autoPlay loop contentKind="seed" showCaptions showLegend showControls showPresetPicker height={420} />
        </Suspense>
        <p className="text-xs text-text-muted mt-4">
          Pick a threshold scheme above to see the math at 2-of-3, 3-of-5, 4-of-7, or 5-of-9. Click ⤢ Fullscreen for a larger view.
        </p>
      </section>
    </div>
  );
}

// Finite-state-machine sub-tab (2026-05-22 — Daniel: lift FSM out of
// Technology, it's too much to bury). The animated lifecycle diagram + the
// formal "why it qualifies" + "why it's a differentiator" + the full state
// table.
function FSMArchSection(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Finite state machine</span></h2>
        <p className="text-lg text-text-on-dark/90 mb-2">
          {BRAND_NAME}'s inheritance lifecycle is a true deterministic finite state machine, with every state and every transition recorded on Polygon — not in a private database. That is what makes NoKLock a trustless provider: your vault's exact lifecycle state can be verified directly on the blockchain at any instant — you never have to take our word for it. (It's the lifecycle state that's public; your vault's contents never are.)
        </p>
        <p className="text-sm text-text-muted">
          The diagram below is pure SVG, no telemetry. Below it: the formal proof it qualifies, why it's a differentiator, and the full state table.
        </p>
      </div>

      <section id="state-machine-diagram" className="card scroll-mt-20">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">End-to-end state machine — every state, every transition, on-chain</span></h3>
        <p className="text-sm text-text-on-dark/85 mb-4">
          Every vault sits in exactly one state at any time. State lives on Polygon. Transitions are guarded by specific contract functions with specific signatures. The diagram traces the happy path; side-states (REVOKED, RECOVERED) branch off as needed.
        </p>
        <FSMDiagram />
      </section>

      <section id="why-fsm-qualifies" className="card scroll-mt-20">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Why this qualifies as a finite state machine — formally</span></h3>
        <p className="text-sm text-text-on-dark/85 mb-3">
          A finite state machine needs four things; {BRAND_NAME} satisfies all four with state encoded on a public chain rather than in a private database:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-text-on-dark/85">
          <li><strong>A finite set of states.</strong> Every vault sits in exactly one of: <code>ENROLLED</code> → <code>HEIR_DESIGNATED</code> → <code>ALIVE</code> ⇄ <code>DUE_SOON</code> ⇄ <code>IN_GRACE</code> → <code>ACTIVATED</code> → <code>CLAIMED</code>. Plus side-states <code>REVOKED</code> (owner-initiated) and <code>RECOVERED</code> (M-of-N guardian quorum). No states beyond this set; no hidden in-between states.</li>
          <li><strong>A defined initial state.</strong> <code>ENROLLED</code> — the moment the vault manifest is built and at least one share file is dropped.</li>
          <li><strong>Explicit transitions triggered by named events.</strong> <code>designateNoK()</code>, <code>heartbeat()</code>, time-elapsed (no signature required — the chain reads its own clock), <code>performUpkeep()</code> (Chainlink-forwarder-gated), <code>claimWithAttestation()</code>, <code>revokeNoK()</code>, <code>recoverNoK()</code>. Every transition is a specific Solidity function call (or a specific Chainlink keeper event) with specific guards encoded in the contract.</li>
          <li><strong>Determinism.</strong> Given current state plus input, the next state is fixed. The contract <code>revert</code>s if a transition isn't permitted from the current state — you cannot enter <code>ACTIVATED</code> without <code>IN_GRACE</code> elapsing first; you cannot <code>CLAIM</code> without <code>ACTIVATED</code>; <code>REVOKE</code> from <code>CLAIMED</code> is impossible by design.</li>
        </ul>
      </section>

      <section id="why-fsm-matters" className="card scroll-mt-20 border-accent-cyan/40">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Why it's a real differentiator — what no competitor has</span></h3>
        <p className="text-sm text-text-on-dark/85 mb-3">
          Every other crypto-inheritance product also has states (designated / activated / claimed) but they live in a <strong>mutable database controlled by the vendor</strong>. You can't verify which state you're in without trusting their dashboard. With {BRAND_NAME}:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-text-on-dark/85">
          <li><strong>State is on-chain.</strong> Your vault's current lifecycle state can be read directly from Polygon — by you, your heir, or any auditor you choose — without trusting us, ever. No login required, no relationship with {BRAND_NAME} required.</li>
          <li><strong>Transitions are cryptographically-witnessable.</strong> Every state change emits an event with a signature/proof attached, so the lineage of how a vault reached its current state can be reconstructed and verified independently, signature by signature.</li>
          <li><strong>No hidden state.</strong> There is no "and behind the scenes the server marked it claimed" path. The chain is the source of truth, full stop. If we go offline, your vault's state stays exactly where the chain says it is.</li>
          <li><strong>No surprise transitions.</strong> Only the specific events at the specific times can change state. The set is finite, public, and audited. We can't unilaterally activate, can't unilaterally revoke, can't move a vault between states.</li>
          <li><strong>Composable parallel FSMs.</strong> Each vault is its own FSM running independently. No cross-user interference, no shared mutable state, no possibility of one user's vault affecting another's lifecycle.</li>
        </ul>
        <p className="text-sm text-text-on-dark/85 mt-3">
          That's a property no Casa / Vault12 / Ledger Recover / Nunchuk can claim — their state lives behind a login, mutable by their employees, opaque to verification.
        </p>
      </section>

      <section id="state-table" className="card scroll-mt-20">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">The states in detail</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-bg-surface">
                <th className="text-left p-2 text-accent-cyan font-display">State</th>
                <th className="text-left p-2 text-accent-cyan font-display">What it means</th>
                <th className="text-left p-2 text-accent-cyan font-display">Entered by</th>
                <th className="text-left p-2 text-accent-cyan font-display">Encoded on-chain at</th>
              </tr>
            </thead>
            <tbody className="text-text-on-dark/85">
              {[
                { s: "ENROLLED",           m: "Vault manifest built; at least one share file dropped",                                 e: "Local enrolment completes (no on-chain tx yet)",        c: "Local only — manifestHash will anchor on-chain later" },
                { s: "HEIR_DESIGNATED",   m: "At least one NoK SBT minted for the vault",                                              e: "designateNoK() or designateByEmail() (Hybrid-E)",       c: "SBT contract: holds the Activation token (+ a Voting token per heir for M-of-N quorum vaults)" },
                { s: "ALIVE",             m: "Owner has recorded a recent heartbeat; grace window has not started",                   e: "heartbeat() within graceWindow",                        c: "Oracle.lastHeartbeat[wallet]" },
                { s: "DUE_SOON",          m: "Heartbeat is overdue but grace window has not fully elapsed",                            e: "Time elapses past lastHeartbeat + graceWindow * (warn%)", c: "Derived from Oracle.lastHeartbeat + graceWindow" },
                { s: "IN_GRACE",          m: "Grace window has elapsed; activation is queued for next Chainlink tick",                e: "Time elapses past lastHeartbeat + graceWindow",         c: "Oracle.pendingActivationTokenIds[wallet]" },
                { s: "ACTIVATED",         m: "Dead-man's switch has fired; SBT released, heir can begin claim flow",                  e: "Chainlink performUpkeep()",                             c: "SBT.tokenIsActivated[tokenId]" },
                { s: "CLAIMED (wallet)",  m: "Wallet-NoK heir already holds the SBT — claim is implicit at activation",                e: "Same tx as ACTIVATED",                                  c: "SBT.balanceOf(heir, tokenId)" },
                { s: "CLAIMED (email)",   m: "Email-NoK heir has completed Hybrid-E walkthrough; SBT rebound to their wallet",         e: "Escrow.claimWithAttestation()",                         c: "SBT rebind event + escrow.claimedNonces[nonce]" },
                { s: "REVOKED",           m: "Owner revoked the NoK before activation",                                                e: "SBT.revokeNoK() (owner only)",                          c: "SBT burn event" },
                { s: "RECOVERED",         m: "Lost-wallet recovery succeeded; ownership of the wallet's vaults rebound to new wallet",  e: "Recovery.executeRecovery() after M-of-N + timelock",    c: "Recovery contract events; SBT.recoverNoK()" },
              ].map((r) => (
                <tr key={r.s} className="border-b border-bg-surface/40 align-top">
                  <td className="p-2 font-mono text-accent-cyan whitespace-nowrap">{r.s}</td>
                  <td className="p-2">{r.m}</td>
                  <td className="p-2 text-text-muted">{r.e}</td>
                  <td className="p-2 text-text-muted">{r.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Every "Encoded on-chain at" reference is a public read on Polygon — no login, no API key, no relationship with {BRAND_NAME} required. The chain reader on PolygonScan exposes every field.
        </p>
      </section>
    </div>
  );
}

// Managed-mode architecture sub-tab. Daniel 2026-06-08: explain self-custody
// vs managed difference + the "we maintain no data and your app lives on"
// posture using third-party providers (Privy for auth + wallet TEE, Paddle
// for billing). The honest no-touch story made explicit. Sits between FSM
// and "Why it matters" sub-tabs.
function ManagedModeArchSection(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Managed mode — the difference, and why your data stays out of our hands</span></h2>
        <p className="text-lg text-text-on-dark/90 mb-2">
          {BRAND_NAME} ships two access paths to the same store-and-restore vault. The vault itself — what you actually put in it — is identical in both. What differs is who holds the EVM key that signs your on-chain inheritance moves.
        </p>
        <p className="text-sm text-text-muted">
          This page exists because Managed mode introduces a third-party provider into the picture, and you deserve to know exactly what we do, what they do, and what we explicitly do not — and cannot — see.
        </p>
      </div>

      <section className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Self-custody vs Managed — one diagram</span></h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-accent-cyan/30 bg-bg-deepest/40 p-4">
            <div className="font-display font-bold text-accent-cyan mb-2">Self-custody (live today)</div>
            <ul className="space-y-1.5 list-disc pl-5 text-text-on-dark/85">
              <li>You install a browser wallet (MetaMask, Trust, Rabby, etc.) and hold the seed phrase yourself.</li>
              <li>You sign every on-chain action (mint, heartbeat, designate-heir) with your own wallet.</li>
              <li>{BRAND_NAME} never sees your seed phrase. The contract is the only party that needs to verify your signature.</li>
              <li>Pay in USDC on Polygon (or any of ~10 Polygon tokens via the swap layer).</li>
            </ul>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-bg-deepest/40 p-4">
            <div className="font-display font-bold text-amber-300 mb-2">Managed (coming soon)</div>
            <ul className="space-y-1.5 list-disc pl-5 text-text-on-dark/85">
              <li>You sign in with email or passkey. No wallet to install, no seed phrase to memorise.</li>
              <li><strong>Privy</strong> (the embedded-wallet provider) provisions an EVM wallet for you inside their Secure Enclave (TEE) and signs on-chain actions on your authenticated request.</li>
              <li><strong>{BRAND_NAME} never sees the private key</strong> — that part {BRAND_NAME} enforces. Privy states it shards the key (TEE-isolation + an auth-share) so that no single party can sign without you; that is Privy&apos;s own design, not something {BRAND_NAME} enforces on its behalf.</li>
              <li>Pay via Paddle (fiat — card / Apple Pay / Google Pay / PayPal). Paddle is Merchant of Record; they handle VAT/sales-tax globally.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">What each party holds — and what {BRAND_NAME} explicitly does NOT</span></h3>
        <p className="text-sm text-text-muted mb-3">
          Managed mode is engineered so the personally identifiable data lives with the specialists who already handle it well, and {BRAND_NAME} keeps as little as physically possible. This is structural — not policy.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-bg-surface">
                <th className="py-2 pr-4 font-display font-bold text-accent-cyan">Holder</th>
                <th className="py-2 pr-4 font-display font-bold text-accent-cyan">Holds</th>
                <th className="py-2 font-display font-bold text-accent-cyan">Does NOT hold</th>
              </tr>
            </thead>
            <tbody className="text-text-on-dark/85">
              <tr className="border-b border-bg-surface/40">
                <td className="py-3 pr-4 font-semibold">Privy</td>
                <td className="py-3 pr-4">Auth email · MFA factors · embedded wallet private key (Privy states it is TEE-isolated + sharded with an auth-share so no single party can sign)</td>
                <td className="py-3">Your vault contents · your designated heirs · your billing details</td>
              </tr>
              <tr className="border-b border-bg-surface/40">
                <td className="py-3 pr-4 font-semibold">Paddle</td>
                <td className="py-3 pr-4">Billing email · card / payment-method details · tax-jurisdiction info · subscription invoices</td>
                <td className="py-3">Your vault contents · your designated heirs · your embedded wallet keys</td>
              </tr>
              <tr className="border-b border-bg-surface/40">
                <td className="py-3 pr-4 font-semibold">{BRAND_NAME} (Form B)</td>
                <td className="py-3 pr-4">Embedded wallet address (public) · SHA-256 email hash + global salt · opaque Paddle subscription ID · opaque Privy user ID · tier + status</td>
                <td className="py-3"><strong>Email plaintext · seed phrase · embedded wallet private key · card details · vault contents · share files · OAuth tokens</strong></td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">You</td>
                <td className="py-3 pr-4">Vault contents · Shamir shares (in storage you pick — local folders or cloud) · master password · heir relationships</td>
                <td className="py-3">Nothing else. The vault is yours; we cannot read it.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-3 italic">
          The encryption key for the {BRAND_NAME}-side admin payment-config table is held off-box in Cloudflare Worker Secrets — env-injected at boot, never written to disk. Even if a Form B disk image is exfiltrated, the encrypted payment configs cannot be read without the off-box key.
        </p>
      </section>

      <section className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Your app lives on — even if {BRAND_NAME} disappears</span></h3>
        <p className="text-text-on-dark/90 mb-3">
          The same disappearance-test that protects self-custody users protects Managed users too. The architecture is deliberately layered so the load-bearing pieces survive us going dark:
        </p>
        <ul className="space-y-2 list-disc pl-5 text-sm text-text-on-dark/85">
          <li><strong>Vault contents stay encrypted in storage you picked.</strong> Local folders, Dropbox, Drive, IPFS — your choice, your control. {BRAND_NAME} has no API access. If we vanish, your encrypted share files are exactly where you put them.</li>
          <li><strong>Inheritance trigger runs on Polygon + Chainlink Automation.</strong> The dead-man-switch is on-chain. No {BRAND_NAME} server is in the trigger path. Heirs claim against the contract, not against us.</li>
          <li><strong>Managed wallet survives via Privy export.</strong> Privy lets you export your embedded wallet's private key any time, in your own session. Once exported, your managed wallet becomes a self-custody wallet — you sign on-chain moves yourself, with no {BRAND_NAME} layer at all. <em>Self-custody escape hatch is built-in.</em></li>
          <li><strong>Recovery doesn't need {BRAND_NAME} at all.</strong> The Shamir reconstruction is 100% client-side from your stored shares plus your master password. We're not in the path. Read the airgap proof at <a href="/prove-it/airgap" className="text-accent-cyan hover:underline">/prove-it/airgap</a>.</li>
          <li><strong>Form B is replaceable.</strong> Form B is a thin coordination service. Its on-chain trigger logic is in the contracts — not in Form B. If Form B goes down, you lose Admin-tab features (refund processing, off-chain referrals) but you do not lose your vault, your inheritance trigger, or your wallet.</li>
        </ul>
      </section>

      <section className="card border-amber-500/40">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Limitations &amp; restrictions — the honest bounds</span></h3>
        <p className="text-sm text-text-on-dark/90 mb-3">
          The disappearance-test above is true for the <strong>custody of your secret</strong> — that's fully {BRAND_NAME}-independent in either mode. But Managed mode adds a coordination/convenience layer with real dependencies, and you deserve them stated plainly rather than buried. Here is what does <em>not</em> hold unconditionally, and what we're doing about each:
        </p>
        <ul className="space-y-2.5 list-disc pl-5 text-sm text-text-on-dark/85">
          <li><strong className="text-amber-300">Managed mode isn't live yet.</strong> It's built but dark (NL-2). Today every user is self-custody. Nothing on this page is purchasable until we flip it on.</li>
          <li><strong className="text-amber-300">The self-custody escape hatch only protects you if you use it.</strong> Privy lets you export the embedded wallet's key any time — but until you (or your heir) export it, the managed wallet's continued operation depends on Privy being around. If you want the strongest guarantee, export to self-custody early; don't leave it for the heir to do under pressure.</li>
          <li><strong className="text-amber-300">An email-only heir currently depends on {BRAND_NAME} to claim.</strong> A next-of-kin designated by <em>email</em> (Hybrid-E escrow) claims with a signature from {BRAND_NAME}'s attestor key. If Form B were permanently gone, an email-only heir couldn't complete that claim. <em>Mitigation: name a wallet-holding heir (no attestor needed), and we're adding a trustless fallback release.</em></li>
          <li><strong className="text-amber-300">M-of-N quorum vaults currently need a {BRAND_NAME}-signed attestation to decrypt.</strong> Optional, off by default — but where you turn it on, that one co-signature is a {BRAND_NAME} dependency we are closing (enforced from the heirs' own signatures / on-chain).</li>
          <li><strong className="text-amber-300">Auto-<em>notifying</em> a non-crypto heir can't be fully decentralised.</strong> The inheritance <em>fires</em> and is <em>claimable</em> on-chain with no {BRAND_NAME} server in the path — but a blockchain can't push a message to a human inbox. Today the email reminder runs through our mailbox. <em>Mitigation: redundant third-party relays (email + SMS) and an optional human carrier (executor/lawyer); you'll choose at designation time.</em></li>
          <li><strong className="text-amber-300">Billing, refunds &amp; gas help depend on providers.</strong> Managed subscription management runs through Paddle + Form B; gasless heir transactions (if enabled) run through Pimlico funded by us. These are conveniences — none of them gate access to your vault or your inheritance.</li>
        </ul>
        <p className="text-xs text-text-muted mt-3">
          The rule we hold to: <strong>custody is {BRAND_NAME}-independent; the coordination layer is being hardened, and until it is, we say so here, in the Terms, and at the moment you designate.</strong>
        </p>
      </section>

      <section className="card border-accent-teal/40">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">The honest claim, plainly</span></h3>
        <p className="text-text-on-dark/90 mb-3">
          {BRAND_NAME} sees nothing about your vault contents. Touches no private keys. Stores no plaintext email, card details, or seed phrase — in either mode. In Managed mode we deliberately offload the personally identifiable pieces to specialists (Privy for auth + key custody, Paddle for billing) who carry the regulatory burden and the data-controller obligations.
        </p>
        <p className="text-text-on-dark/90 mb-3">
          What we hold could fit in one log line: a wallet address, a salted hash of your email, an opaque Paddle subscription ID, an opaque Privy user ID, your tier, and your status. That's it.
        </p>
        <p className="text-sm text-text-muted">
          Verify it yourself. The source is at <a href="https://github.com/dksteeves/noklock" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">github.com/dksteeves/noklock</a>. The contracts are source-verified on PolygonScan. The cryptographic pipeline runs in your browser, with zero telemetry, with the airgap proof at <a href="/prove-it/airgap" className="text-accent-cyan hover:underline">/prove-it/airgap</a> demonstrating that {BRAND_NAME} cannot exfiltrate anything even if we wanted to.
        </p>
      </section>
    </div>
  );
}

// Third-party interfaces sub-tab. Daniel 2026-06-14: every outside specialist
// NoKLock touches — what it is, why we use it, what it sees, what it provably
// CANNOT see, and how (or whether) it contributes to security + anonymity.
// Content is code-verified per integration (research workflow wgy2ka1qk, 9
// agents): each card's "honest bounds" are deliberate — claims trace to actual
// code and we DO NOT overstate (e.g. Privy's key-sharding is Privy's own design
// claim, not ours; the managed-mode providers Privy / Paddle / Pimlico are NL-2
// and currently dark). PUBLIC-SAFE: no secrets, no internal infra contracts.
const TPI_INTRO_P1 =
  `NoKLock leans on a handful of outside specialists — but only where a specialist genuinely does the job better, and never in a place where trusting them is what keeps your seed safe. The load-bearing security here is not a promise about any third party's good behavior; it is structural. Your seed phrase and your Shamir/SLIP-39 shares are generated, split, and AES-256-GCM / XChaCha20-Poly1305 encrypted entirely in your browser, offline, before a single byte is stored or transmitted — so the parties below only ever touch already-encrypted blobs, already-public on-chain data, or a wallet address.`;

const TPI_INTRO_P2 =
  `None of them can read a share, sign for you, or reconstruct anything below the threshold. Where an integration does see real personal data (an heir's email, a billing identity), we say so plainly and explain why we deliberately push that data onto a regulated specialist instead of holding it ourselves.`;

const TPI_DISTINCTIONS: readonly string[] = [
  `Some of these are always-on infrastructure for the core self-custody product; others are managed-mode (NL-2) integrations that are currently dark — they ship as inert foundation code and the flag-off build provably contains none of their SDK bytes. Each card below is tagged with which it is, and anything tagged "Managed-only" does not touch self-custody users at all — so its caveats simply do not apply if you self-custody.`,
  `"We can't see it" means something different from "we don't store it" — we are explicit, per card, about which claims are enforced by construction versus which rest on operator trust.`,
];

// The disappearance test — rewritten honestly after the 2026-06-15 audit:
// the CORE (default self-custody + wallet-heir + non-quorum) genuinely survives
// NoKLock; the coordination layer (heir notification, the optional email-only
// escrow, the optional M-of-N quorum) still leans on NoKLock and is being
// hardened (owner-armed switch, redundant multi-provider notification, a
// self-serve heir-claim page) — disclosed + owner-choice, never overclaimed.
const TPI_CLOSING_PARAS: readonly string[] = [
  `Run the disappearance test honestly. For the default setup — a self-custody vault with a wallet-holding heir — your secret survives us completely: it is split into Shamir shares you store in your own places and reconstructed locally in your browser, and NoKLock holds nothing. That is verified in the code, not a slogan.`,
  `Two of the parties above are NoKLock-operated — the JSON-RPC proxy and the email mailbox — and neither is load-bearing for that core. The proxy is only the first entry in a fallback list: if it is down, your wallet reads the chain straight from public Polygon nodes (you lose IP-privacy, not access). And your inheritance fires and is claimable on-chain whether or not any email is ever sent.`,
  `Where we are honest that NoKLock dependencies still exist: the convenient notification of a non-crypto heir, the optional email-only-heir escrow, and the optional M-of-N quorum currently lean on NoKLock. We are closing those — an owner-armed on-chain switch, redundant multi-provider notification (email + SMS through independent, established providers), and a self-serve heir-claim page that needs no server. Until each is closed, we tell you plainly and let you choose how bulletproof to make your designation — including naming a human (an executor or lawyer) as a guaranteed backstop — rather than overclaim.`,
  `The cryptographic custody of your seed never depended on us, and never will. The coordination layer — getting the right person to claim at the right time — is what we are hardening, with redundancy and your informed choice. We never claim any single company (including us) is immortal; we make sure the keys, the chain, and your ability to claim never hinge on one.`,
];

const THIRD_PARTY_INTERFACES: readonly {
  readonly name: string;
  readonly tagline: string;
  readonly why: string;
  readonly sees: string;
  readonly cannotSee: string;
  readonly trust: string;
}[] = [
  {
    name: `Chainlink Automation (decentralized keeper network)`,
    tagline: `Always-on. A decentralized network of independent keeper nodes that calls the contracts' upkeep on a schedule, so the dead-man's switch fires with no NoKLock server in the loop.`,
    why: `NoKLock's whole promise is that inheritance executes even if the company disappears. A blockchain can't poke itself — something must observe 'grace period elapsed' and submit the firing transaction. Using a decentralized keeper network instead of a NoKLock cron server means the trigger survives NoKLock going dark: the Polygon contracts are immutable and the upkeep is permissionless to fund. performUpkeep is locked to only the Chainlink forwarder, so not even NoKLock's owner key can fire the switch.`,
    sees: `Only already-public on-chain data: a 20-byte wallet address plus block timestamps. checkUpkeep decodes a single wallet address from checkData and reads its last-heartbeat timestamp, grace override and last-activated block against block.timestamp; performData is just abi.encode(wallet). For the Live-Man's Switch, checkLog reads a lost-wallet address from a public RecoveryInitiated event. Nothing crosses that a block-explorer visitor couldn't already see.`,
    cannotSee: `It never receives the seed phrase, any Shamir share, any plaintext, manifest contents, email, master password, or any PII — the contracts store none of it (only an address, a uint64 timestamp, a source code, a grace override, and a queue of token IDs). All cryptography is client-side. It also cannot choose an outcome: performUpkeep re-validates the grace window on-chain via _assertGraceElapsed before activating, so even the keeper cannot fire early. The mechanism is enforced in code: performUpkeep is onlyForwarder, the forwarder is set once via a one-shot bootstrap and then permanently locked, and the Live-Man's Switch can only ping the owner's own pre-registered watchers from the owner's own escrow.`,
    trust: `Removes NoKLock as a single point of failure for the most safety-critical action in the system. It converts 'trust NoKLock to run a cron job and not cheat' into 'trust an immutable contract plus a permissionless decentralized network, verifiable on PolygonScan.' Liveness depends on the upkeep being funded with LINK — anyone can top it up via the permissionless Chainlink UI, so the community can keep it alive if NoKLock vanishes. Honest bound: a second/Gelato fallback keeper is roadmap, not shipped; today there is a single Chainlink upkeep, and if its LINK runs out and no one tops it up, activation silently waits. The off-chain heartbeat is relayed by a pusher for convenience; the trustless path is the on-chain selfHeartbeat().`,
  },
  {
    name: `JSON-RPC proxy (api.noklock.app/v1/rpc)`,
    tagline: `Always-on. A read-path relay on NoKLock's own back-end that forwards the PWA's blockchain reads to a public Polygon node, so the public node sees NoKLock's server IP instead of yours.`,
    why: `It exists to break the user-IP-to-wallet-address correlation at the network layer. Without it, every license/inheritance read from the PWA would hit a public Polygon RPC operator directly, letting that operator log your IP alongside the contracts and wallet you're querying. Routing through our back-end means the upstream RPC provider only ever sees our server's IP.`,
    sees: `Only public-chain JSON-RPC requests, against a method allow-list of exactly the reads the app needs (eth_call, eth_getLogs, eth_getBalance, eth_blockNumber, eth_chainId, etc.) plus the one write eth_sendRawTransaction — which carries an already-signed raw transaction. Because our reverse proxy is in front, the relay does receive your IP at the connection layer and uses it for per-IP rate limiting — but it strips it before forwarding upstream.`,
    cannotSee: `It never receives seed phrases, Shamir shares, mnemonics, private keys, vault plaintext, or any recovery secret — all cryptography runs client-side. It cannot sign anything: it only relays, and for eth_sendRawTransaction the transaction is signed in your wallet before it ever reaches the proxy. The upstream-blinding is structural: the proxy makes its own outbound HTTPS call with an explicit minimal header set, so the upstream's connecting IP is our server's, not yours, and no X-Forwarded-For / User-Agent / Referer / Cookie is added.`,
    trust: `Network-layer unlinkability: it prevents a public Polygon RPC operator from building an IP-to-wallet query log of NoKLock users. It carries no secrets and cannot sign, so compromising it cannot move funds or expose recovery material — only the privacy property is at stake, and only versus the upstream node. Two honest limits: (1) it hides your IP from the upstream Polygon node, NOT from NoKLock — our server terminates the connection and reads your IP; we assert we don't store the IP-to-query mapping (no-store headers, no logging call), but that rests on operator trust, not a structural guarantee. (2) The proxy is the first entry in a fallback chain; if it's unreachable, the browser fails over to public nodes directly, at which point your real IP IS exposed to those operators. So the protection holds while the proxy is on the primary path, not unconditionally.`,
  },
  {
    name: `WalletConnect relay + EIP-6963 / injected`,
    tagline: `Conditional. The transport that lets your existing crypto wallet talk to the dApp — a browser extension in-process (EIP-6963 / injected, no third party) or a mobile wallet via the WalletConnect v2 relay.`,
    why: `NoKLock is self-custodial: you prove control of an Ethereum address to gate /admin, sign 24h ops-session messages, and submit on-chain inheritance transactions, without NoKLock ever holding a key. wagmi's connectors give a standard, wallet-agnostic way to request an account and a signature. The WalletConnect relay is needed only to reach mobile wallets that can't inject into the page; browser-extension wallets connect via EIP-6963 with no third party involved.`,
    sees: `Browser-extension (EIP-6963 / injected) path: nothing leaves the device — the connect/sign handshake is in-process between the page and the extension. WalletConnect relay path (mobile, only when the project ID is set): the Reown/WalletConnect relay sees the end-to-end-encrypted session traffic plus routing metadata — the pairing topic, the project ID, your IP/timing as the WebSocket peer — and the static dApp metadata in the connector config: the app name "NoKLock", a description string, and the url https://noklock.app.`,
    cannotSee: `Your private key / seed phrase — it never leaves the wallet; wagmi only ever calls eth_requestAccounts / eth_accounts and signMessageAsync, so only an address and a signature cross into NoKLock. The Shamir shares and the encrypted seed/document envelope come from a separate offline encryption pipeline, are never passed to the connector, and the CSP connect-src allow-list blocks any fetch of in-memory secrets to the relay. The WalletConnect relay carries an end-to-end-encrypted channel, so the relay sees ciphertext of the wallet-to-dApp messages, not their plaintext.`,
    trust: `A pure authentication/transport layer: it proves address control and relays user-approved signatures, contributing zero attack surface to the secret-bearing pipeline. Choosing a browser extension removes the third party entirely. Honest bound: the WalletConnect relay path is a genuine third-party hop operated by Reown/WalletConnect — it necessarily observes your IP, timing, the pairing topic, and the static dApp metadata, and its remote-config host is also a third party. It is not "fully anonymous." Note also that the IP-privacy RPC proxy does NOT front the WalletConnect connection — that WebSocket goes direct to the relay, so it still sees your IP.`,
  },
  {
    name: `Storage backends (local folders, your own cloud, IPFS, Arweave, NAS)`,
    tagline: `Always-on. The pluggable backends where your already-encrypted vault shares land — local folders, your own Dropbox / Google Drive / OneDrive, IPFS-Pinata, Arweave, or a NAS — each behind one uniform StorageAdapter interface.`,
    why: `A T-of-N vault must scatter its encrypted shares across several independent, redundant locations so no single account, company, or jurisdiction holds enough to reconstruct anything. Letting you pick (and own) those locations is what makes NoKLock "store anywhere, we see nothing" rather than a custodian.`,
    sees: `Only opaque ciphertext bytes — one AEAD-sealed share bundle per location plus the signed manifest. The bundle contains strictly iv, ciphertext, tag, cipher name, index, an opaque SHA-256-derived vault id, a plaintext length, and an optional provenance MAC. Each adapter passes exactly those bytes over HTTPS and nothing else. With the recommended spread, each provider holds one share — below the reconstruction threshold. The upload lands under your own provider account, so the provider naturally learns your account identity, IP, timestamps, and the ~1 KB file size.`,
    cannotSee: `It provably never receives the BIP39 seed, the master password, or any plaintext share. Encryption happens entirely client-side before any byte leaves the page: the master key is derived via Argon2id from your passphrase, the secret is SLIP-39 split, and each share is AEAD-encrypted (AES-256-GCM / XChaCha20-Poly1305 — pure byte ops, no network). Only ciphertext is serialized; the passphrase/seed strings and derived key material are wiped after the pipeline runs. The airgap manager hijacks every outbound channel during encryption, so encryption can't coincide with exfiltration. NoKLock holds no provider tokens server-side — any OAuth tokens are yours, passed client-side to your own accounts.`,
    trust: `Realizes the core "store anywhere, we see nothing" property: threshold-split, offline-sealed shares across independent backends you own, so compromising NoKLock, or any single provider, or any one account, reveals an unreadable ciphertext below the reconstruction threshold. NoKLock is custodian of nothing. Honest bounds: the provider sees only ciphertext but it CAN identify you (your own account, IP, timestamps) — "can't read your shares," not "can't identify you." The shipped wizard write path is local-file first; cloud placement is a manual upload-then-paste-share-URL step. The "one share per separate account" separation is what the security promise rests on — the UI nudges and validates it, but you ultimately control the spread.`,
  },
  {
    name: `SMTP / transactional email (operator's own mailbox)`,
    tagline: `Always-on design, inert until configured. Transactional emails (heir notifications, heartbeat reminders, owner alerts) are sent through the operator's own cPanel/ISP SMTP mailbox — not a third-party email SaaS.`,
    why: `NoKLock sends a few transactional emails: a heads-up to a designated heir that the dead-man's switch has fired, heartbeat reminders, and owner recovery/auth-change alerts. This is a CONVENIENCE notification, not the trust root — the inheritance fires and is claimable on-chain regardless of any email. We deliberately send through the operator's own mailbox (not a third-party email SaaS) so the recipient list — designated next-of-kin email addresses — is never handed to an external email/marketing vendor.`,
    sees: `The operator's SMTP server receives the full plaintext email: the recipient address (the heir's real email, or the owner's alert email), From/Reply-To, subject, and body. The heir-activation body carries a short vault reference plus a single-use claim-nonce link; owner alerts carry a shortened wallet string. The recipient address is decrypted from at-rest storage only at the moment of send. So the operator's mailbox is the one place plaintext heir/owner email addresses legitimately appear.`,
    cannotSee: `It never sees any wallet seed phrase, Shamir shares, sealed-document contents, or master password — heir reassembly is purely client-side. It never sees the 32-byte email-hash global salt (env-only, never written to disk) nor the on-chain email commitment, and it never receives managed-mode/Privy secrets. The heir's identity is deliberately NOT disclosed to the owner in heir-restore alerts. The legacy external-email-provider config is a dead block never imported by the notifier — no external provider receives anything.`,
    trust: `Removes a third-party data-exposure surface: by sending through the operator's own mailbox instead of an external email SaaS, the list of designated next-of-kin addresses (and the fact that someone is an heir) is never disclosed to an outside vendor. Addresses are AES-256-GCM-encrypted at rest and Argon2id hash-committed on-chain (per-vault blinded salt, so a leaked salt column alone can't enumerate heirs); they appear in plaintext only transiently at SMTP handoff. The send loop is structurally incapable of inventing an inheritance email — it only drains rows the on-chain-event-gated watcher enqueued. Honest bounds: anonymity is intentionally surrendered at send time, so the OPERATOR can see every recipient address — the guarantee is "no external email vendor gets the recipient list," not "nobody can see it." Wire confidentiality depends on the operator's SMTP server's TLS. Disappearance-test bound (the honest one): this mailbox is NoKLock-operated, so if NoKLock vanishes the email stops — but a wallet or managed heir can still claim on-chain without it, and we are adding redundant independent providers (email + SMS) plus a self-serve heir-claim page so notification does not hinge on us alone. A non-crypto heir notified ONLY by email is the one path that still leans on a live channel; we disclose that at designation and let the owner add a human backstop (executor / lawyer).`,
  },
  {
    name: `Privy (embedded wallet + passwordless auth) — Managed mode`,
    tagline: `MANAGED-ONLY, currently DARK (NL-2). In optional Managed mode, Privy signs a non-crypto user in (email OTP / Google / Apple / passkey) and provisions an embedded EVM wallet, so an heir can claim without installing a wallet or holding a seed.`,
    why: `The core store-and-restore + on-chain inheritance flow is self-custody only — you install a browser wallet and hold the seed yourself. That excludes non-crypto heirs who have no wallet. Privy is the optional bridge: a passwordless login that mints a non-crypto heir an embedded EVM account so they can sign the claim. It's a one-shot claim vehicle, not long-lived custody — the wallet is exportable to self-custody the same day.`,
    sees: `Managed users only — self-custody users send Privy nothing. Privy holds the auth identity and login PII: email address (OTP), and/or Google / Apple OAuth, and/or passkey credential, and it generates and custodies the embedded-wallet private key, and binds MFA/passkey factors. On NoKLock's server side, the back-end receives from Privy's signed identity token only the opaque Privy user id and the embedded wallet's PUBLIC address — never the key.`,
    cannotSee: `Privy never receives the self-custody seed phrase or the Shamir shares — those are generated and reconstructed 100% client-side in your own storage; NoKLock has no API access and Privy is not in that path. It never sees vault contents, your designated heirs, or billing/card details (billing is Paddle's). Self-custody users never touch Privy at all: the entire Privy code path is gated behind the managed-wallet flag, and when off the provider returns children verbatim and never imports the SDK — verified empirically, a scan of all built JS in the flag-off dist returns zero Privy SDK bytes. Even NoKLock's server never holds the embedded key or email plaintext — only a salted email hash and opaque ids.`,
    trust: `Privy is the deliberate PII concentrator for Managed mode: it (not NoKLock) holds auth email + MFA factors, so NoKLock's own server keeps as little as physically possible — embedded wallet public address, a salted email hash, opaque ids, tier and status. The server cryptographically binds every managed mint to a Privy-verified identity (ES256-only JWT verification, iss/aud/exp checks, token never logged). Honest bounds we do NOT overstate: the "Privy shards the key so no single party can sign / TEE-isolated" property is Privy's OWN design claim, not something this repo enforces — treat it as "Privy states," and keep it separate from the NoKLock-side fact that NoKLock never sees the key. A managed heir IS identified to Privy (and to Paddle for billing) by real PII — that is the point of offloading the data-controller burden to specialists. The live token binding is foundation code, to be re-verified at flag-on; export resilience depends on Privy remaining operational.`,
  },
  {
    name: `Paddle (Billing) — Managed mode`,
    tagline: `MANAGED-ONLY, NOT live (mock mode until configured). The fiat payment processor and merchant of record for managed-tier subscriptions (card / Apple Pay / Google Pay / bank).`,
    why: `Card/fiat billing carries heavy regulatory weight: PCI-DSS scope, EU VAT collection and remittance, chargebacks, and the statutory 14-day right of withdrawal. NoKLock offloads all of that to Paddle as merchant of record so it never touches a card number, never stores billing PII, and never enters PCI scope. Self-custody users sidestep fiat entirely by paying in USDC on-chain, so Paddle is only the rail for managed users who'd rather not touch crypto at the door.`,
    sees: `The only NoKLock-origin data crossing to Paddle is the checkout custom_data {wallet, tier} (plus an optional referrer code), used to pin a payment back to a wallet+tier. The card number/CVV, billing address, name, email, and tax data are collected by Paddle's own hosted checkout directly from the buyer — NoKLock's code never sends or sees those. On refund, NoKLock sends only an action, a transaction id, and a reason. Inbound webhooks carry event type plus subscription/customer ids, totals, currency, and timestamps, which NoKLock parses and stores.`,
    cannotSee: `No seed phrase, share, mnemonic, or any vault/key material ever reaches Paddle — the custom_data path is structurally limited to {wallet, tier}. The custom_data carries an on-chain address, not a name or identity. Paddle also never sees on-chain self-custody payments at all — those are USDC mints with no processor in the middle. The self-custody buy path provably never reaches Paddle: it fires the on-chain mint hook and the fiat option is disabled/greyed in the UI.`,
    trust: `Removes NoKLock from PCI-DSS scope and from data-controllership of cardholder PII by making Paddle the merchant of record; confines the wallet-to-fiat-identity linkage to a specialist that carries the regulatory burden; and keeps the secret-material trust boundary intact because the only NoKLock-origin data crossing is a wallet address + tier integer. Webhook authenticity is enforced (HMAC-SHA256 over timestamp+body against the webhook secret, 5-minute replay tolerance, constant-time compare) before any state write. Honest bounds: NoKLock does persist two opaque Paddle reference tokens (subscription id + customer id) — the accurate claim is "no card / PAN / CVV / billing address / name / email, only an opaque Paddle pointer plus wallet+tier," not "zero identifiers." For managed users Paddle links that wallet to a real billing identity on ITS side — NoKLock does not hold that linkage, but the linkage exists. And it is NOT live today — managed fiat billing is NL-2 "coming soon" and runs in mock mode until the Paddle keys are configured.`,
  },
  {
    name: `Pimlico (ERC-4337 paymaster + bundler) — Managed mode`,
    tagline: `MANAGED-ONLY, dark by default (mock mode). A verifying paymaster + bundler that sponsors a managed heir's on-chain gas on Polygon PoS, so a non-crypto heir can transact without ever holding MATIC.`,
    why: `A managed heir signs in via Privy and gets a brand-new embedded account with zero MATIC. Asking them to fund their own gas before claiming would break the whole non-crypto-user pitch, so Pimlico's verifying paymaster sponsors the user-operation on NoKLock's account — the heir never sees or pays gas. It's forward-surface for NL-2: NL-1 itself submits no direct heir on-chain transaction, so sponsorship is optional for NL-1.`,
    sees: `Exactly one thing crosses the boundary: an ERC-4337 UserOperation passed to the paymaster — sender (the embedded account address), nonce, callData (the encoded on-chain action), gas limits, fee caps, and signature. This is precisely the data that becomes a PUBLIC on-chain transaction once submitted to the bundler — nothing private that isn't already destined for the public ledger. The request hits Pimlico's Polygon (chain 137) endpoint.`,
    cannotSee: `It provably never receives any seed phrase, Shamir share, recovery secret, or plaintext envelope — the module's only input is the UserOperation shape; there is no share/seed/key-material field anywhere in its surface. The self-custody owner flow (seed/share generation, airgap enrolment) is entirely separate and never imports this module. The Pimlico API key is never logged and, server-side, is marked secret and never returned in any reply.`,
    trust: `Lets a managed (non-crypto) heir transact on Polygon PoS without holding MATIC by sponsoring ERC-4337 gas. It touches no key material (only UserOps), defaults to a no-op mock so a missing/leaked-flag build can't accidentally call out, keeps the API key server-side-only, and stays fully tree-shaken out of self-custody / flag-off builds. It does not custody funds, does not see secrets, and does not weaken the self-custody path. Honest bounds: it does NOT provide anonymity — a sponsoring RPC can correlate the caller's IP with the sponsored address, and there's no IP-proxy here, so the honest claim is only "no new private-data exposure beyond the public on-chain tx." It sees the full UserOp, but that is already public on-chain data. It is mock-mode by default with no call sites in NL-1, so end-to-end sponsorship is not live or battle-tested today.`,
  },
];

// Third-party interfaces — Architecture sub-tab body. Intro + one card per
// specialist (always-on first, then managed-only) + the disappearance-test
// close. Pure content; reuses the card + label idiom from the sibling sections.
function ThirdPartyInterfacesArchSection(): JSX.Element {
  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <h2 className="text-2xl font-bold font-display"><span className="grad">Third-party interfaces</span></h2>
        <p className="text-sm text-text-on-dark/85 leading-relaxed">{TPI_INTRO_P1}</p>
        <p className="text-sm text-text-on-dark/85 leading-relaxed">{TPI_INTRO_P2}</p>
        <p className="text-sm text-text-on-dark/85 leading-relaxed">Two distinctions run through this whole page:</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-text-on-dark/85 leading-relaxed">
          {TPI_DISTINCTIONS.map((d, i) => <li key={i}>{d}</li>)}
        </ol>
      </section>

      {THIRD_PARTY_INTERFACES.map((p) => (
        <section key={p.name} className="card space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold font-display text-lg">{p.name}</h3>
            {p.name.includes("Managed mode")
              ? <span className="tier-badge bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px]">Managed-only · NL-2 (dark)</span>
              : <span className="tier-badge bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 text-[10px]">Always-on</span>}
          </div>
          <p className="text-xs text-accent-cyan/90 italic leading-relaxed">{p.tagline}</p>
          <dl className="space-y-2 mt-1">
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-text-muted font-semibold">Why we use it</dt>
              <dd className="text-sm text-text-on-dark/85 leading-relaxed">{p.why}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-text-muted font-semibold">What it sees</dt>
              <dd className="text-sm text-text-on-dark/85 leading-relaxed">{p.sees}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-text-muted font-semibold">What it can&apos;t see</dt>
              <dd className="text-sm text-text-on-dark/85 leading-relaxed">{p.cannotSee}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-accent-teal font-semibold">Security &amp; anonymity</dt>
              <dd className="text-sm text-text-on-dark/85 leading-relaxed">{p.trust}</dd>
            </div>
          </dl>
        </section>
      ))}

      <section className="card border-accent-teal/40 space-y-2">
        <h3 className="font-bold font-display"><span className="grad">The disappearance test</span></h3>
        {TPI_CLOSING_PARAS.map((para, i) => (
          <p key={i} className="text-sm text-text-on-dark/85 leading-relaxed">{para}</p>
        ))}
      </section>
    </div>
  );
}

// Roadmap sub-tab. Daniel 2026-06-12: horizontal phase cards (done / you-
// are-here / future) mirroring the product roadmap, with a detail section
// below the cards expanding the future-resilience items. PUBLIC-SAFE ONLY:
// no pricing, no internal infra/provider contracts, no tenant/brand names,
// no "provisional / granted / patented". Positioning stays store+restore
// FIRST with OPTIONAL inheritance (NoKLock is not an "inheritance product").
// Reuses the existing card + cyan-callout Tailwind idiom from the sibling
// Arch sections (TechnologyArchSection / ManagedModeArchSection).
function RoadmapArchSection(): JSX.Element {
  // status drives the marker: "done" (✓ check), "now" (filled "you are
  // here" dot), "future" (hollow ring). One small array → consistent cards.
  const phases: readonly {
    id: string;
    status: "done" | "now" | "future";
    phase: string;
    title: string;
    points: readonly string[];
    milestone?: string;
  }[] = [
    {
      id: "foundation",
      status: "done",
      phase: "Foundation",
      title: "Design & architecture",
      points: [
        "Self-custodial split: Shamir SLIP-39 thresholds + Argon2id key-stretching + authenticated encryption (AEAD).",
        "Soulbound, non-transferable heir tokens (ERC-5192).",
        "Smart contracts deployed and source-verified on Polygon PoS.",
      ],
      milestone:
        "First-round Swiss patent application accepted — a foundational cryptographic-design milestone the architecture has since far surpassed.",
    },
    {
      id: "first-release",
      status: "done",
      phase: "First release",
      title: "Store & restore, live",
      points: [
        "Store and restore your seed phrase and secrets — the primary job — working end-to-end.",
        "Heir-designation framework in place, layered on top of store + restore.",
      ],
    },
    {
      id: "launch",
      status: "now",
      phase: "Launch",
      title: "You are here",
      points: [
        "Store + restore + OPTIONAL inheritance — storage first, inheritance only if you want it.",
        "Hardened wallet connection across cold-start, lock, and reconnect.",
        "Owner-signed operations for every sensitive action.",
      ],
    },
    {
      id: "next",
      status: "future",
      phase: "Next",
      title: "Reach & managed mode",
      points: [
        "Google Play distribution (Android TWA) for one-tap install.",
        "Managed mode for non-crypto users — email / passkey sign-in, no wallet to install.",
        "US patent application in progress.",
      ],
    },
    {
      id: "multi-chain-wallets",
      status: "future",
      phase: "Multi-chain",
      title: "Connect & inherit beyond EVM",
      points: [
        "Today: back up and restore a seed or key from any chain — Bitcoin, Solana, Ethereum — storage is already chain-agnostic, no wallet required.",
        "Planned: sign in and run inheritance with non-EVM wallets — Solana first (native sign-in + on-chain inheritance).",
        "Bitcoin and further ecosystems under research — seed storage works now; trust-minimised on-chain inheritance is chain-dependent.",
      ],
    },
    {
      id: "future",
      status: "future",
      phase: "Future",
      title: "Resilience & redundancy",
      points: [
        "Deployment redundancy across regions and chains for multi-decade durability.",
        "Dead-man's-switch automation redundancy — a primary trigger plus an independent fallback.",
        "Managed-wallet provider redundancy.",
        "An enterprise / multi-tenant identity direction (early exploration).",
      ],
    },
  ];

  // Per-status visual tokens. Reuses the same accent palette as the rest of
  // Info — cyan for "now", teal-leaning border for done, muted for future.
  function marker(status: "done" | "now" | "future"): JSX.Element {
    if (status === "done") {
      return (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan/15 text-accent-cyan text-sm font-bold" aria-hidden="true">✓</span>
      );
    }
    if (status === "now") {
      return (
        <span className="relative inline-flex h-6 w-6 items-center justify-center" aria-hidden="true">
          <span className="absolute inline-flex h-6 w-6 rounded-full bg-accent-cyan/30 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-cyan" />
        </span>
      );
    }
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-text-muted/50" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-text-muted/40" />
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Roadmap — where {BRAND_NAME} has been, and where it's going</span></h2>
        <p className="text-lg text-text-on-dark/90 mb-2">
          {BRAND_NAME} is, first and foremost, a way to <strong>store and restore</strong> your seed phrase and your other irreplaceable secrets. Inheritance is an <strong>optional</strong> layer on top — not the product. This is the path so far and the direction ahead.
        </p>
        <p className="text-sm text-text-muted">
          Forward-looking items are intentions, not commitments — they describe the direction of travel, not a dated promise.
        </p>
      </div>

      {/* Horizontal phase cards. Scrolls horizontally on narrow screens, sits
          as a 5-across row on wide ones — same grid idiom as the "Under the
          hood" tiles in TechnologyArchSection. */}
      <section className="card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {phases.map((p) => {
            const isNow = p.status === "now";
            return (
              <div
                key={p.id}
                className={
                  "rounded-lg border p-4 flex flex-col " +
                  (isNow
                    ? "border-accent-cyan/60 bg-accent-cyan/5"
                    : p.status === "done"
                      ? "border-accent-teal/40 bg-bg-deepest/40"
                      : "border-bg-surface bg-bg-panel/30")
                }
              >
                <div className="flex items-center gap-2 mb-2">
                  {marker(p.status)}
                  <span className={"text-[11px] font-mono uppercase tracking-wide " + (isNow ? "text-accent-cyan" : "text-text-muted")}>
                    {p.status === "done" ? "Done" : isNow ? "You are here" : "Planned"}
                  </span>
                </div>
                <div className="font-display font-bold text-sm text-text-on-dark/70">{p.phase}</div>
                <div className="font-display font-bold text-lg mb-2"><span className={isNow ? "grad" : "text-text-on-dark"}>{p.title}</span></div>
                <ul className="space-y-1.5 text-xs text-text-on-dark/80 list-disc pl-4 flex-1">
                  {p.points.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
                {p.milestone && (
                  <div className="mt-3 rounded border border-accent-cyan/30 bg-accent-cyan/5 p-2 text-[11px] leading-snug text-text-on-dark/85">
                    <span className="text-accent-cyan font-semibold">Milestone:</span> {p.milestone}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Detail expansion BELOW the cards — the "why" behind the future-
          resilience items, public-safe (no provider contracts named beyond
          the already-public primary, no infra detail, no pricing). */}
      <section className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">The future, in a little more detail</span></h3>

        <div className="space-y-4 text-sm text-text-on-dark/85">
          <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-4">
            <div className="font-display font-bold text-text-on-dark mb-1">Why multi-chain</div>
            <p>
              Inheritance is a multi-decade promise, so the architecture shouldn't depend on any single chain staying healthy for that long. Deploying across more than one chain removes single-chain dependency, gives the trigger and token layer somewhere to live if any one network's economics or roadmap shift, and broadens the wallet ecosystems {BRAND_NAME} can reach. Your vault contents are already chain-independent — they're encrypted shares in storage you control — so multi-chain is about the on-chain trigger and heir-token layer being durable for the long haul.
            </p>
          </div>

          <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-4">
            <div className="font-display font-bold text-text-on-dark mb-1">Dead-man's-switch redundancy</div>
            <p>
              The dead-man's switch is the part that fires when you stop checking in, so it should never rest on a single automation network. The plan is a <strong>primary</strong> automation trigger (Chainlink Automation) with an independent <strong>fallback</strong> — a second decentralised keeper (such as Gelato) or a self-hosted keeper — that can carry the trigger if the primary is ever unavailable. The contract logic is identical either way; redundancy is about <em>who pokes the contract</em>, not about changing what the contract does.
            </p>
          </div>

          <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-4">
            <div className="font-display font-bold text-text-on-dark mb-1">Managed-wallet redundancy</div>
            <p>
              For non-crypto users, Managed mode relies on an embedded-wallet provider (Privy is the primary). Resilience here means not being single-provider: passkey / secure-element hardening of the wallet layer, plus alternate embedded-wallet providers under evaluation, so the managed path stays available even if any one provider has an outage or a change of terms. The self-custody escape hatch — exporting the embedded wallet to become a self-custody wallet — already exists today as the ultimate fallback.
            </p>
          </div>
        </div>

        <p className="text-xs text-text-muted mt-4">
          Everything above is direction, not a dated commitment. The store-and-restore core — and the optional inheritance layer — already work today and don't depend on any of these future items landing.
        </p>
      </section>
    </div>
  );
}

function FaqTab(): JSX.Element {
  // 2026-05-27 reorder — Daniel: protect/restore/storage questions FIRST
  // (what most users actually worry about), inheritance questions in the
  // middle, billing/referrals/technical at the bottom. Same content, new
  // sequence.
  const faqs: readonly { q: string; a: string }[] = [
    // ── BLOCK 1 — protection / store / restore (the primary use case)
    {
      q: "I connected the same wallet on another device and see no vaults. Is it broken?",
      a: `No - this is by design. Your vault list lives only in the browser you enrolled in. ${BRAND_NAME} keeps no server-side record of your vaults, so connecting your wallet does not (and cannot) load them on another device. To recover anywhere, use Restore with your saved shares plus your master password - it is fully device-independent.`,
    },
    {
      q: "I lost my device or cleared my browser. Can I still recover?",
      a: "Yes. You do not need the original device or the vault list. Go to Restore on any device, supply the threshold number of share files (or paste the share URLs) and your master password. The vault rebuilds entirely in that browser.",
    },
    {
      q: `Does ${BRAND_NAME} store my data, or can it see my vaults or seed?`,
      a: `No. All encryption runs in your browser. The back-end never sees your seed, the contents of your shares, or which vaults you own. That is exactly why the vault list is per-device. ${BRAND_NAME} therefore has no obligation to verify the legality, accuracy or completeness of anything you store - see the Terms § "User content + your responsibility" and the Privacy section "What we cannot see".`,
    },
    {
      q: "Is there 2FA or SMS verification?",
      a: `No, deliberately. ${BRAND_NAME} bans SMS-2FA and TOTP. A lost second factor would permanently destroy both your recovery and your next-of-kin's inheritance - unacceptable for an inheritance product. Your master password, together with your shares, is the single canonical key.`,
    },
    {
      q: "What is the optional passkey then?",
      a: "A convenience only. On devices that support platform WebAuthn (Face ID / Touch ID / a security key) you may add a passkey AFTER the vault is created, to unlock faster on that one device. It never replaces the master password and can never be the only way in. On a device without WebAuthn support no passkey option appears - that is expected, not a bug.",
    },
    {
      q: "Why can't I create a document or image vault?",
      a: "Document and image vaults are a Premium feature, enforced against your wallet's on-chain licence. Seed-phrase vaults and one sealed letter are available on every tier, including Free. The duress decoy feature is also Premium-only now (was Standard+ pre-2026-05).",
    },
    {
      q: "Why is the duress decoy Premium-only?",
      a: "Duress decoy is a genuinely high-paranoia feature (whole second encryption pipeline + second master password) - it's the kind of defence the Premium tier is built around. Standard tier shows the duress step with a 'Premium feature' notice so it's visible-but-gated; upgrading to Premium turns it on. Client-side enforced (matches how documents + image vaults are gated); the on-chain licence is the source of truth.",
    },
    {
      q: `Is ${BRAND_NAME} quantum-safe?`,
      a: `Your vault content, effectively — by architecture. The encryption is symmetric (AES-256-GCM or XChaCha20-Poly1305 per share), the master password is stretched with Argon2id, the threshold split is Shamir Secret Sharing (SLIP-39), and the manifest is bound with SHA-256. All four are at worst Grover-bounded — meaning a future large-scale quantum computer halves their effective security but doesn't break them (NIST already considers AES-256 quantum-safe in practice). Shamir is stronger still: it's information-theoretic, so below the threshold the shares hold zero information about the secret — there is no math for a quantum computer to crack. What ISN'T ${BRAND_NAME}-specific quantum-safe is the wallet itself. Polygon, Ethereum and Bitcoin all use secp256k1 ECDSA signatures, which a sufficiently large quantum computer could break with Shor's algorithm. That risk is identical across every EVM wallet on earth, and the chains will hard-fork to post-quantum signatures before "Q-day" actually arrives — ${BRAND_NAME}'s on-chain layer follows whatever Polygon does. Your vault stays safe across that migration precisely because its encryption is symmetric, not signature-based. The full primitive list lives on /info → Architecture → Technology.`,
    },
    {
      q: "A page looked stale, or my wallet showed \"not connected\" after a refresh.",
      a: "The app auto-updates to the newest version and a connected wallet is reconnected automatically. If a page ever looks stale, a hard refresh forces the latest build: Windows/Linux Ctrl+Shift+R, Mac Cmd+Shift+R.",
    },

    // ── BLOCK 2 — inheritance (the optional layer)
    {
      q: "Are next-of-kin per vault? How do I add one after enrolment?",
      a: `Yes - each next-of-kin designation is bound on-chain to one specific vault (its vault ID + manifest hash). The simplest path: open the per-vault Manage page (Vaults → click a vault), use the "Add NoK to this vault" form there - vault ID + manifest hash are pre-filled automatically. The legacy /nok "+ Designate" form also accepts a vault picker that auto-fills from your local index. Older vaults that pre-date the manifest-hash storage support a drop-the-manifest.json fallback inline.`,
    },
    {
      q: "How many next-of-kin can I designate?",
      a: "On-chain per-wallet cap: Free 1, Standard 5, Premium 10 (mirrored on the Lifetime variants). Family Office and Institutional tiers have org-managed quotas (50 / 100). Each designation mints ONE ERC-5192 soulbound Activation NFT (the trigger) to that heir's wallet (or to the Hybrid-E escrow for email-NoKs) — one heir, one token. M-of-N quorum vaults add a Voting NFT per heir. You can revoke + re-designate any time from the per-vault Manage page.",
    },
    {
      q: "Can I designate a next-of-kin by email instead of a wallet address?",
      a: `Yes — that's "Hybrid-E", a ${BRAND_NAME}-original flow. You enter the heir's email at designate time; the SBT mints to an on-chain escrow holding it in trust. The heir gets an email with a one-time walkthrough link at /nok-claim/<nonce> when the dead-man's switch fires — they create their own wallet (no key ever held by us), the server signs an EIP-712 attestation binding their wallet to the original email hash, and the SBT rebinds to the heir's wallet via burn-and-remint. The full EIP-712 domain is byte-matched against the on-chain escrow contract so the attestation can't be replayed against a different deployment. Non-technical heirs can complete the whole thing on a phone in 5-10 minutes; the heir guide at /heir walks through it in plain language. Honest disclosure on the email-hash itself: Email-Hash v1 (keccak-based) commitments remain on-chain and are technically rainbow-attackable — an attacker with a candidate email address can confirm whether it was ever designated as a Hybrid-E heir, though they still cannot claim the SBT without the EIP-712 server attestation. v2 (Argon2id-based) is forward-only — it hardens new designations against rainbow attacks but does not retroactively rewrite the v1 commitments already on-chain.`,
    },
    {
      q: "Multi-NoK quorum - what is it and why does it matter?",
      a: "If you designate multiple NoKs you can require an M-of-N quorum (e.g. 2-of-3) before inheritance releases. Each NoK is a separate person with their own wallet; the contract counts independent signatures from independent addresses. A single coerced or phished NoK cannot release alone - quorum is the social-engineering defence. Premium tier supports up to 5-of-9 quorum. See /info → Architecture → Social-engineering-proof for the full mechanism + best-practice patterns for spreading NoKs.",
    },
    {
      q: "What if I forget to send a heartbeat?",
      a: "Two things protect you. First, the grace window is long and you choose it (default 60 days, up to 365) — a single check-in any time inside it resets the clock, and one heartbeat covers ALL your vaults on that wallet. Second, you can add a recurring reminder to your OWN calendar from the Heartbeat page, Settings, or Dashboard (\"Never forget a heartbeat\"): download an .ics for Apple Calendar / Outlook / any app, or use the one-click Google Calendar link, on as many calendars as you like. It's zero-PII — NoKLock takes no email and sends nothing, so the reminder lives only in your calendar. We deliberately don't email you (we hold no owner email); the calendar reminder plus the long grace window are the safety net, and the on-chain selfHeartbeat remains the trustless guarantee.",
    },
    {
      q: `What if ${BRAND_NAME} the company disappears, or gets acquired?`,
      a: `Your inheritance still works either way. The NoKLock contracts on Polygon are immutable; the dead-man's switch is fired by Chainlink Automation (a decentralised keeper network), not by us; your shares live in storage you pick — local folders or your own cloud accounts (we have no API access). If our PWA goes offline, the same source-verified contracts are still readable on PolygonScan and writable from any EVM wallet — anyone could spin up a copy of the open-source PWA against the same contract addresses. The PWA's blockchain reads automatically fall back to a public Polygon RPC if our service is down. On the acquisition question specifically: ${BRAND_NAME} has already been approached about acquisition, and we treat continuity of service for existing customers as a precondition of any future change of ownership or control — any such deal would be bound to honour every existing licence and entitlement in full, keep the deployed contracts immutable and operational, and keep the supporting servers and services funded for as long as necessary. So even the convenience layer (off-chain heartbeat, email-only next-of-kin) is protected across a transition, on top of the trustless core that never needed us in the first place. Documented at /info → Architecture → Business ("NoKLock-proof"), the technical mechanism at /info → Architecture → Technology, and as a binding commitment in the Terms ("Change of ownership and continuity").`,
    },

    // ── BLOCK 3 — billing / referrals / technical
    {
      q: "What is the difference between Lifetime and Standard, and where does Lifetime Premium fit?",
      a: `Two paid renting tiers (Standard yearly, Premium yearly) each have a "paid-once" counterpart. Standard Lifetime is the Standard feature set paid once. Lifetime Premium is the Premium feature set paid once. Features are identical to the yearly tier - the only difference is billing. The Pricing page lays them out in a 3-column grid where the lifetime row sits directly below its yearly counterpart for easy rent-vs-own comparison.`,
    },
    {
      q: "What is the Founder-Referrer Bonus and how does it work?",
      a: "On top of the standard 10%/10% on-chain referral split, NoKLock commits a one-time bonus to the first wallet that reaches each of three paid-referral milestones: 100 → 25% / 500 → 50% / 1,000 → 75% of that wallet's hard earnings up to the milestone block. Same wallet winning multiple tiers gets each bonus net of the prior payouts (max total = 75% × hard-earnings-at-block-1000). Admin-paid (not contract-enforced); the metric is on-chain referralCount, the payout is a public PolygonScan tx, the pledge is reputation-anchored. Full rules at /info → Referral tab → Founder-Referrer Bonus section.",
    },
    {
      q: "Are you really a finite state machine?",
      a: `Yes — formally. Every ${BRAND_NAME} vault sits in exactly one of seven lifecycle states (ENROLLED → HEIR_DESIGNATED → ALIVE ⇄ DUE_SOON ⇄ IN_GRACE → ACTIVATED → CLAIMED) plus REVOKED and RECOVERED side-states. Every transition is a specific Solidity function call with explicit guards — the contract reverts if a transition isn't permitted from the current state. The state itself lives on Polygon, not in our database, so you can verify which lifecycle state your vault is in right now directly on a block explorer — without trusting us at all (it's the state that's public, never your vault's contents). Every state change emits a cryptographically-signed event you can audit independently. That's a stronger trust property than any service can offer. Full diagram + state table + on-chain anchor for each state: /info → Architecture → Finite state machine.`,
    },
  ];
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold font-display mb-1"><span className="grad">Frequently asked</span></h2>
        <p className="text-text-muted text-sm">
          Short, honest answers to the things people actually ask. English is the authoritative version.
        </p>
      </div>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="card group">
            <summary className="font-bold font-display cursor-pointer list-none flex items-start gap-2">
              <span className="text-accent-cyan shrink-0 group-open:rotate-90 transition-transform">&rsaquo;</span>
              <span>{f.q}</span>
            </summary>
            <p className="text-sm text-text-on-dark/85 mt-3 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function SecurityTab(): JSX.Element {
  const rows: readonly { actor: string; sees: string; cannot: string; why: string }[] = [
    { actor: `${BRAND_NAME} back-end`, sees: "Wallet addresses, heartbeat timestamps, manifest hashes", cannot: "Decrypt your shares · see your seed · impersonate you on-chain · release pointers before grace expires", why: "All crypto runs client-side. The back-end holds no keys." },
    { actor: "Single cloud provider (one of N)", sees: "1-2 encrypted share files + the manifest", cannot: "Reconstruct your seed (needs threshold from multiple providers) · read share contents", why: "AEAD encryption per share. Manifest is Ed25519-signed." },
    { actor: "Designated NoK (pre-activation)", sees: "Their own soul-bound NFT · manifest hash on-chain", cannot: "Recover your seed before grace period expires · transfer their SBT to someone else · collude with one cloud to read shares", why: "ERC-5192 non-transferable. On-chain active flag gated by Chainlink Automation." },
    { actor: "NoK colluding with ≤2 cloud providers", sees: "NoK NTT + up to 2 share files", cannot: "Reconstruct (below the 3-of-5 threshold)", why: "Threshold split — colluding with 2 clouds still leaves them one share short." },
    { actor: `Phishing attacker (impersonating ${BRAND_NAME})`, sees: "A session token at most", cannot: "Steal your seed · access your shares · impersonate you on-chain", why: "Seed never sent over network. Master password entered only locally; the optional WebAuthn passkey is origin-bound (phish-resistant)." },
    { actor: "$5-wrench / coercion attacker", sees: "The duress decoy vault contents (a believable low-value wallet)", cannot: "Access your real vault", why: "Two seeds, two manifests, two master passwords. Real vault encrypted with a master password the attacker never gets." },
    { actor: "SIM-swap attacker", sees: "Nothing", cannot: `Reset any ${BRAND_NAME} state, period`, why: "SMS-2FA is explicitly banned in this app." },
    { actor: `Insider (${BRAND_NAME} or hosting sysadmin)`, sees: "Same as back-end view", cannot: "Decrypt or alter shares · bypass the on-chain dead-man's switch", why: "Crypto-core code is auditable, on-chain logic is the inheritance executor — not our server." },
    { actor: "Back-end full compromise", sees: "Could mark heartbeats / release pointers early", cannot: "Decrypt shares · bypass the on-chain active flag", why: "The chain itself is the trust root. Not our server." },
  ];
  return (
    <section className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Security model</span></h2>
        <p className="text-text-on-dark/90 mb-4">
          {BRAND_NAME}'s security comes from the architecture, not the trust of any single party. The table below names every actor who could plausibly attack the system, what they can see, what they cannot do, and why.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-bg-surface">
              <th className="text-left p-2 align-top">Actor</th>
              <th className="text-left p-2 align-top">What they can see</th>
              <th className="text-left p-2 align-top">What they cannot do</th>
              <th className="text-left p-2 align-top">Why</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.actor} className="border-b border-bg-surface/40 align-top">
                <td className="p-2 font-bold text-text-on-dark">{r.actor}</td>
                <td className="p-2 text-text-on-dark/80">{r.sees}</td>
                <td className="p-2 text-accent-green">{r.cannot}</td>
                <td className="p-2 text-text-muted text-xs">{r.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card border-accent-teal/40">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Owner protection — why a next-of-kin can't jump the gun</span></h3>
        <p className="text-sm text-text-on-dark/90 mb-3">
          The single sharpest question for an inheritance system: <em>what stops a greedy or impatient next-of-kin from taking your vault while you are alive and well?</em> {BRAND_NAME}'s answer is structural, not procedural — there is no "trust us" step. A NoK has to get through every one of these, and cannot skip or accelerate any:
        </p>
        <ol className="space-y-2 text-sm text-text-on-dark/90 list-decimal list-inside">
          <li><strong>Their token is born inert.</strong> Every NoK SBT is minted <em>LockedInactive</em>. Holding it grants nothing until it is flipped active.</li>
          <li><strong>Only the Oracle can flip it — never the NoK.</strong> The on-chain <code>activate()</code> reverts for any caller that is not the Oracle. A NoK calling it directly fails, every time.</li>
          <li><strong>The Oracle only fires on sustained silence.</strong> Activation requires <code>now &gt; lastHeartbeat + graceWindow</code> with the switch un-fired. While you send any heartbeat inside your window, the timer resets indefinitely. A NoK cannot forge your heartbeat (they don't hold your wallet or the authorised pusher) and cannot suppress it.</li>
          <li><strong>It's proof-of-life, never proof-of-death.</strong> Nobody — not us, not a NoK, not an oracle, not a court — can assert you are dead to this system. The <em>only</em> trigger is the absence of your own check-in over a window <em>you</em> chose. There is no death certificate input, no "report owner deceased" button, by deliberate design.</li>
          <li><strong>You can revoke pre-emptively.</strong> The vault owner can burn any NoK SBT they minted at any moment via <code>revokeNoK</code>. Suspect a NoK? Remove them before the switch is ever in play. The NoK cannot block their own revocation.</li>
          <li><strong>One NoK is never enough.</strong> Even after a legitimate activation, release needs an M-of-N quorum of <em>independent</em> NoK wallets. A lone rogue (or a single coerced/compromised) NoK is stuck without M-1 others colluding.</li>
          <li><strong>Guardian recovery has an owner override.</strong> The separate social-recovery path adds a fixed time-lock after guardian quorum, during which you can <code>cancelRecovery</code> from your original wallet. Even fully-colluding guardians hand you a cancellation window.</li>
          <li><strong>Activation also has an owner cancel-window.</strong> Activations include a <code>{OWNER_CANCEL_WINDOW_HOURS}h</code> owner cancel-window. After Chainlink fires the dead-man and an Activation SBT is minted to a heir, the off-chain heir-notification email is held for that long before it goes out. False-positive activations (owner missed heartbeat for a benign reason — sick, off-grid, simply forgot) can be aborted by the owner during the window via the Dashboard's "Pending activations" widget, which both suppresses the email and burns the SBT on-chain via <code>revokeNoK</code>. Configurable via <code>OWNER_CANCEL_WINDOW_HOURS</code> (clamp 0-168).</li>
        </ol>
        <p className="text-sm text-text-muted mt-3">
          Multiple independent heartbeat channels count as proof of life — app sign-in, an email link click, a wallet signature, or a direct on-chain <code>selfHeartbeat</code>. Any one resets the clock. The grace window itself can only be changed by your own wallet (or the contract owner) and is capped at 10 years — a NoK cannot shorten it to trigger you early. Every layer above is enforced by verified contract code you can read on the Contracts tab.
        </p>
      </div>

      <div className="card border-accent-cyan/30">
        <h3 className="font-bold font-display mb-2"><span className="grad">Why your seed doesn't live in the Secure Enclave</span></h3>
        <p className="text-sm text-text-on-dark/85 mb-2">
          iOS Secure Enclave, Android StrongBox and Windows TPM are excellent at one thing: holding a key that can sign but cannot be exported from the chip. That property is what makes them secure — and the same property is why they are the <em>wrong</em> place to store a recoverable seed.
        </p>
        <p className="text-sm text-text-on-dark/85 mb-2">
          A 12 / 24-word seed kept inside Secure Enclave is recoverable from that one device <strong>or not at all</strong>. Lose the phone — drop it, brick it, flush it — and the key dies with it. Hardware-wallet products and Secure-Element-marketed competitors acknowledge this gap with paper-backup rituals: write your seed down, store it in a fireproof safe, hope you never lose it. The Secure Enclave wraps an already-unsafe single-point-of-failure; it does not remove it.
        </p>
        <p className="text-sm text-text-on-dark/85 mb-2">
          {BRAND_NAME}'s architecture sidesteps this entirely. Before any device touches a recoverable artifact, the seed is encrypted with an Argon2id-derived key, split via SLIP-39 Shamir over GF(256) into N shares (3-of-5 by default), each share AEAD-sealed with GCM or XChaCha20-Poly1305, and distributed across N independent local folders or storage providers you choose. No single device holds the recoverable seed. Lose any one device — phone, laptop, hardware wallet — and the seed is still recoverable: download the K shares to <em>any</em> new device, re-run the same Argon2id + Shamir recombination, recover the seed.
        </p>
        <p className="text-sm text-text-muted">
          You can still use Secure Enclave, StrongBox or TPM for what they're good at: wrapping a passkey or biometric-bound key that protects the local share-vault on your device. That's a defence-in-depth layer on top of the distributed-shares model, not a replacement for it. (Passkey-backed wrap of the local vault is on the roadmap — see /info?tab=updates for status.)
        </p>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-2"><span className="grad">We don't carry insurance.</span> <span className="grad">We don't need to.</span></h3>
        <p className="text-sm text-text-on-dark/80">
          Casa, Ledger Recover, Vault12 carry insurance because they hold keys. We don't, so there's nothing to insure. Insurance is their apology; our architecture is the equivalent reassurance.
        </p>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-2"><span className="grad">HI not AI</span></h3>
        <p className="text-sm text-text-on-dark/80 mb-2">
          <strong>Human Intelligence, not Artificial Intelligence.</strong> {BRAND_NAME} runs zero AI on your data. Your seed phrase never crosses into a language model. There is no prompt that contains your seed, no inference call that processes your shares, no training dataset that touches your manifest. The only "intelligence" applied to your data is the deterministic mathematics of SLIP-39 + Argon2id + AEAD, running locally in your browser.
        </p>
        <p className="text-sm text-text-muted">
          Most "Web3 inheritance" competitors send something to an LLM somewhere — for support chat, for KYC, for "intelligent" rules engines. We don't. The audit trail is mathematics, not model output.
        </p>
      </div>
    </section>
  );
}

function renderNote(p: string | { text: string; link: { href: string; label: string } }, i: number): JSX.Element {
  if (typeof p === "string") return <p key={i}>{p}</p>;
  return (
    <p key={i}>
      {p.text}
      <a href={p.link.href} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">{p.link.label}</a>
    </p>
  );
}

interface PublishedAuditReport {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly score: string | null;
  readonly contract: string | null;
  readonly added_at: number;
}

// Public read of owner-published audit/scan reports (Form B /v1/audit).
// Honest empty-state: if none are published, we say exactly that rather
// than implying audits exist.
function PublishedAudits(): JSX.Element {
  const API = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";
  const [reports, setReports] = useState<PublishedAuditReport[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`${API}/audit`)
      .then((r) => r.json())
      .then((j: { reports?: PublishedAuditReport[] }) => {
        // First-entered first (ascending added_at, then id) per Daniel.
        if (live) setReports([...(j.reports ?? [])].sort((a, b) => a.added_at - b.added_at || a.id - b.id));
      })
      .catch(() => { /* network/endpoint down — fall through to empty state */ })
      .finally(() => { if (live) setLoaded(true); });
    return () => { live = false; };
  }, [API]);

  return (
    <div className="card">
      <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Verified source &amp; scan scores</span></h3>
      {!loaded ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-text-on-dark/80">
          No reports are published yet. The SolidityScan basic-review results — and any other scan or external review we choose to publish — will be linked here, signed-published by the contract owner, the moment they're posted. We won't claim a review we don't have, and we don't claim or promise a formal audit either (see "Why no formal audit" below for why that's a considered position, not an oversight).
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {reports.map((r) => (
            <li key={r.id} className="border-b border-bg-surface/40 pb-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-bold text-accent-cyan hover:underline">{r.title}</a>
                {r.score && <span className="text-xs font-mono text-accent-green">{r.score}</span>}
                {r.contract && <span className="text-xs text-text-muted">· {r.contract}</span>}
              </div>
              <div className="text-xs text-text-muted font-mono break-all">{r.url}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ContractsTab(): JSX.Element {
  const scan = (a: string): string => `https://polygonscan.com/address/${a}#code`;
  const ZERO = "0x0000000000000000000000000000000000000000";
  const { leader: patentLeader } = useLivePatentLeader();
  const contracts: ReadonlyArray<{ name: string; addr: string; role: string }> = [
    { name: "NoKLockLicense",  addr: LICENSE_ADDR,  role: "ERC-1155 tier licence. Pulls only the USDC you explicitly approve for one mint; if you used a referral link the referrer's share is routed within that same single pull — no extra charge, no balance ever held by the contract. Founder pricing is baked on-chain — `currentPrice(tier)` auto-steps founder → regular once the global cap of 10,000 paid mints is reached." },
    { name: "NoKLockSBT",      addr: SBT_ADDR,      role: "ERC-721 + ERC-5192 soulbound. Non-transferable, valueless inheritance trigger tokens — minted to your designated next-of-kin's wallet (or to the Hybrid-E escrow if you designated by email). Rare-in-production use of the ERC-5192 standard." },
    { name: "NoKLockOracle",   addr: ORACLE_ADDR,   role: "Dead-man's-switch. Records heartbeats; fires activation only after the grace period lapses. `performUpkeep` is FORWARDER-ONLY — only the registered Chainlink Automation forwarder can fire the switch (not even the owner)." },
    { name: "NoKLockRecovery", addr: RECOVERY_ADDR, role: "M-of-N guardian quorum + time-lock + owner-cancellation window for social recovery." },
    { name: "NoKLockEscrow",   addr: ESCROW_ADDR,   role: "Hybrid-E email-NoK escrow. Holds the soulbound NFT in trust for an email-designated heir; releases it (via burn-and-remint) when the heir completes the email walkthrough + server attestation. EIP-712 signature verified on-chain." },
    ...(ALERTS_ADDR.toLowerCase() !== ZERO ? [{
      name: "NoKLockAlerts",
      addr: ALERTS_ADDR,
      role: "Live-Man's Switch — out-of-band notification. A Chainlink log-trigger keeper watches the live Recovery contract for `RecoveryInitiated` events; when one fires under your wallet, this contract sends a small POL ping (self-funded by you, no NoKLock balance) to each of your pre-registered watcher wallets and emits an `AlertPinged` event, so you learn a recovery has started against you and can cancel it within the timelock — even if you haven't opened the app.",
    }] : []),
  ];
  const count = contracts.length;
  return (
    <section className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Contracts &amp; audit posture</span></h2>
        <p className="text-lg text-text-on-dark/90 mb-2">
          {BRAND_NAME} runs <strong>{count === 6 ? "six" : "five"} small contracts on Polygon mainnet — and they custody nothing</strong>. No pooled funds, no custody of your keys, shares or data, no contract balance for anyone to drain.
        </p>
        <p className="text-sm text-text-on-dark/90 mb-4">
          That changes the only question worth asking. Not "how does this score against a DeFi audit?" — these contracts guard no shared pot of money — but <strong>"what could an exploit here actually do, and not do?"</strong> At worst it could interfere with a single user's own licence mint or their own next-of-kin record; there is nothing pooled to steal, and the soul-bound tokens are valueless and non-transferable. Below we publish every review and every score in full — the strong ones and the imperfect ones alike — because complete transparency is the right posture for what this system actually is.
        </p>
        <div className="space-y-2 text-sm">
          {contracts.map((c) => (
            <div key={c.name} className="border-b border-bg-surface/40 pb-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-bold">{c.name}</span>
                <a href={scan(c.addr)} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent-cyan hover:underline break-all">{c.addr}</a>
              </div>
              <div className="text-text-muted text-xs mt-0.5">{c.role}</div>
            </div>
          ))}
        </div>
        <p className="text-text-muted text-xs mt-3">
          Every contract's full Solidity source is verified on PolygonScan — click any address and read the #code tab. The bytecode on-chain provably matches the source you can read.
        </p>
        <p className="text-xs text-text-muted mt-3 border-l-2 border-accent-cyan/40 pl-3">
          <strong className="text-text-on-dark/90">IP note:</strong> {patentLeader}, covering {PATENT_DESCRIPTION} The contracts above implement those inventions. Source under BUSL-1.1.
        </p>
      </div>

      <PublishedAudits />

      <div className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">How these were reviewed</span></h3>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li><strong>154 automated tests, all green</strong> (Foundry, Solidity 0.8.35). Coverage spans every state transition and every revert path: the full social-recovery M-of-N quorum + time-lock + owner-cancellation window, the ERC-5192 soulbound transfer block, the complete referral discount / split / affiliate-unlock / first-referrer-lock matrix, the founder-cap step transition at 10,000 paid mints, the <code>upgradeLicence</code> delta-charge + first-referrer-lock preservation, the §M per-tier on-chain cap policy, the Hybrid-E <code>designateByEmail → recordDesignation</code> atomic callback, the <code>claimWithAttestation</code> happy path + replay + expiry + bad-attestor rejection, the EIP-712 domain byte-match against the Form B signer, the soulbound burn-and-remint rebind, the Chainlink forwarder one-shot bootstrap + lock, and every Ownable2Step transfer path. Re-run from scratch on every contract change.</li>
          <li><strong>Multiple independent AI reviews — at least three full passes from two distinct sources.</strong> A separate frontier model audited the source <strong>twice</strong> — once on the 0.4.2 set, once on the 0.5.0 patches that came out of the first pass — and Claude ran <strong>three self-reviews of its own work in between</strong>, each catching items the previous pass had not. Every finding from every pass is folded into the deployed source. <em>v0.1 external pass surfaced + we fixed:</em> Lifetime + Lifetime-Premium double-mint blocked, dead-man grace period capped at 10 years, <code>performUpkeep</code> tightened to forwarder-only + grace-elapsed-self-validating, bounded-loop guard on the activation iterator, Ownable2Step on all 5 with <code>renounceOwnership</code> disabled, License treasury/payment-token swaps put behind a 7-day timelock, <code>adminMint</code> capped at 500 lifetime grants, distinct custom errors on every previously-overloaded revert path. <em>v0.2 follow-up external pass surfaced + we fixed:</em> SBT module-setter swaps now behind the same 7-day timelock (oracle / recovery / escrow / license — closing the highest residual centralisation surface), CEI ordering in every paid mint path so state writes finalise before the USDC pull, an optional EIP-712 vault-binding attestation gate (enabled when the off-chain signer ships), Voting / Revocation role-uniqueness per vault per owner, and an Oracle queue-time cap + a one-call pending-queue view. <strong>This is the last review pass before broadcast.</strong></li>
          <li><strong>Basic SolidityScan review</strong> on the deployed bytecode, all six contracts source-verified. The two contracts with any value/authority surface — <strong>License</strong> (the only one that moves money) and <strong>Oracle</strong> (the dead-man's switch) — scored ~<strong>89</strong> and ~<strong>91</strong> respectively, each with <strong>zero Critical and zero High</strong>. The new <strong>NoKLockEscrow</strong> scores in the high-70s/low-80s with the only remaining High being an OZ-library <code>unchecked</code> block (not our code). SBT and Recovery score in the low-to-mid 70s because the free-tier scanner cannot reason past architectural false positives (soulbound <code>_burn</code> calls in revoke/recover/rebind; self-scoped permissionless <code>setGuardians</code>). Every Critical/High on those is a traced-and-dismissed false positive walked through line-by-line in "If you scan these yourself" below.</li>
          <li><strong>Full deploy dress-rehearsal on a local Polygon mainnet fork</strong> (anvil <code>--fork-url</code>) before the real broadcast. The actual <code>forge script</code> the chain saw on launch day was run end-to-end against forked state first — 14 transactions (5 deploys + 4 SBT wires + 5 transferOwnership) executed and validated against forked Polygon state, including the <code>setForwarder</code> Chainlink bootstrap path. Zero unknowns at broadcast time.</li>
          <li><strong>0.4.x audit-clarity refactor</strong>: inline <code>if (msg.sender != X) revert ...</code> access checks converted to standard <code>modifier onlyX</code> patterns (so the scanner's access-control heuristic stops flagging them as missing), <code>_safeMint</code> → <code>_mint</code> on the SBT's four mint sites (the receiver-interface check is moot when tokens are soulbound and can never leave), a bounded-length guard added to the Oracle's activation loop, our internal <code>unchecked</code> blocks dropped (the gas micro-saving wasn't worth the scanner noise), and pragma pinned to Solidity <strong>0.8.35</strong> (latest stable on review). Behaviour identical — labelled the way auditors expect.</li>
          <li><strong>Deploy-ceremony integration audit</strong> — separate from the contract audit. We walked the 17 external-service touchpoints the deploy hits (Chainlink Automation, PolygonScan verify, USDC, Form B EIP-712 domain, indexer block, salt, SMTP, WalletConnect, RPC, DNS, SSL, ownership transfer, attestor rotation, founder-cap counting, PWA build cache, owner-sig allow-list, seed paper backups) and flagged any hidden coupling. The Chainlink forwarder chicken-and-egg gap was caught by this pass and fixed via the one-shot bootstrap setter in Oracle 0.5.2.</li>
          <li><strong>Source verification</strong> on PolygonScan for all 6 — anyone (including you, right now) can read the deployed code independently. The bytecode on-chain provably matches the source.</li>
        </ul>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Why no formal audit</span></h3>
        <p className="text-sm text-text-on-dark/90 mb-3">
          We have not and do not intend to commission one, and we will tell you exactly why that is honest rather than negligent:
        </p>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li><strong>There is no pooled honeypot.</strong> {BRAND_NAME} never holds your keys, your shares, or your data. There is no contract balance to drain. The only value movement is USDC <em>you</em> explicitly approve, one licence mint at a time; that single approved amount is split atomically between the fixed treasury and — if you were referred — your referrer, with nothing pooled or held by the contract in between. A formal audit's primary job — protecting pooled TVL — does not apply because there is no pool.</li>
          <li><strong>The SBTs are valueless and non-transferable.</strong> They are ERC-5192 soul-bound triggers. No market, no liquidity, no price. There is nothing to steal even if every transfer restriction failed.</li>
          <li><strong>The attack surface is tiny.</strong> Six small contracts; no external integrations beyond USDC's standard ERC-20 and Chainlink Automation's standard interface. Most formal-audit value comes from complex DeFi composition we deliberately don't have.</li>
          <li><strong>We have decided and determined that our contracts are secure and suited for the unique applications of {BRAND_NAME}.</strong> The 154 forge tests, multiple independent AI review passes from two distinct sources, basic SolidityScan review of all 6 source-verified contracts, the audit-clarity refactor, and the local Polygon-mainnet-fork dress-rehearsal — together with the structural property that no user funds are ever pooled — gave us a clear, considered position that the deployed code is fit for the purpose this product actually has. A $50k formal audit on top of that would be theatre, and pre-revenue that money is better spent on the product.</li>
          <li><strong>The incentive structure is real, not absent.</strong> While we expect any bugs found will be more related to functionality and edge cases than to meaningful exploits of the contracts, our <a href="#bug-bounty" className="text-accent-cyan hover:underline">working bug-bounty programme</a> aligns reporters with the product, its use, and the {BRAND_NAME} philosophy. Verified reports earn a free Lifetime licence (see <Link to="/terms#section-7" className="text-accent-cyan hover:underline">Terms §7</Link>).</li>
        </ul>
      </div>

      {/* 0.5.8 — Daniel 2026-05-20: lift the bug-bounty surface. Was previously
          mentioned only in passing inside the "Why no $50k formal audit" card.
          Promoted to its own callout card with the full programme outline. */}
      <div id="bug-bounty" className="card border-accent-green/50">
        <div className="flex items-baseline gap-3 flex-wrap mb-3">
          <span className="tier-badge bg-emerald-700/30 text-accent-green border border-accent-green/40">Bug Bounty</span>
          <h3 className="text-xl font-bold font-display"><span className="grad">Found a bug? We'll trade for it.</span></h3>
        </div>
        <p className="text-sm text-text-on-dark/90 mb-3">
          {BRAND_NAME} runs a working bug-bounty programme. We do not pretend that audited code is bug-free; we want adversarial eyes on it. Bounty terms are deliberately simple — no NDAs, no lawyers, no negotiation, no "we'll get back to you in 90 days" delays.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          <div className="rounded-lg border border-bg-surface bg-bg-deepest p-4">
            <h4 className="font-bold font-display mb-2">Standard reward</h4>
            <p className="text-sm text-text-on-dark/85 mb-2">
              <strong>One free Lifetime licence NFT</strong> (current value $299–$799 depending on tier; minted via <code>adminMint</code> to the wallet of your choice) for any verified bug — front-end, back-end, contracts, deploy infrastructure, documentation, or veracity.
            </p>
            <p className="text-xs text-text-muted">
              "Verified" = we can reproduce it on the live build. We do not require severity ratings, attack chains, or a 30-page write-up. Plain reproducer steps + the address/page/function affected is enough.
            </p>
          </div>
          <div className="rounded-lg border border-accent-green/30 bg-bg-deepest p-4">
            <h4 className="font-bold font-display mb-2">Critical-finding reward</h4>
            <p className="text-sm text-text-on-dark/85 mb-2">
              <strong>USDC payout as treasury permits</strong> + public acknowledgement + Lifetime licence, for findings that materially compromise the system:
            </p>
            <ul className="list-disc list-inside text-xs text-text-on-dark/80 space-y-1">
              <li>smart-contract fund drain / unauthorised mint / unauthorised burn</li>
              <li>seed / master-password / share leak via the front-end</li>
              <li>recovery-flow bypass (skip dead-man's switch, skip M-of-N quorum)</li>
              <li>ownership-takeover paths (bypass Ownable2Step, bypass timelocks)</li>
              <li>any path to a forged inheritance or theft of another user's assets</li>
            </ul>
          </div>
        </div>

        <h4 className="font-bold font-display mt-5 mb-2">How to report</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-text-on-dark/90">
          <li>Email <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a> with subject line "Bug report — <em>short title</em>".</li>
          <li>Include: reproducer steps, the affected address / page / file:line if known, your contact wallet (where to mint the Lifetime licence).</li>
          <li>Do NOT publicly disclose until we've responded. For critical findings, we coordinate the timing of public disclosure with you.</li>
          <li>Do NOT attempt to exploit at scale — proof-of-concept on a single test account is enough. Mass exploitation will void the bounty and may have legal consequences.</li>
        </ul>

        <h4 className="font-bold font-display mt-5 mb-2">What's in scope</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-text-on-dark/90">
          <li>The six deployed contracts (License, SBT, Oracle, Recovery, Escrow, Alerts) on Polygon mainnet.</li>
          <li>The PWA at <a href="https://noklock.app" className="text-accent-cyan hover:underline">noklock.app</a> and the Form B service at <a href="https://api.noklock.app" className="text-accent-cyan hover:underline">api.noklock.app</a>.</li>
          <li>Documentation (Terms, Privacy, Manual, Info, Pricing) — veracity bugs count. If a claim on the site is false, that's a bug.</li>
          <li>The Hybrid-E heir-claim flow including the EIP-712 attestation signing path.</li>
          <li>The Founder-Referrer Bonus on-chain metric (a path that exploits the bonus structure for unbacked payout).</li>
        </ul>

        <h4 className="font-bold font-display mt-5 mb-2">What's out of scope (please don't waste your time)</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-text-on-dark/90">
          <li>The known false-positive findings already documented in "If you scan these yourself" below — public-burn × 3 on the SBT, setGuardians-missing-modifier on Recovery, unchecked-block in flattened OZ library code.</li>
          <li>Self-DoS / self-griefing (someone wasting their own gas on their own designation). Worst realistic bug is bounded to the attacker's own resources.</li>
          <li>Spam / volume abuse of the public RPC proxy — already rate-limited.</li>
          <li>Findings that require physical access to the user's device (cold-boot RAM extraction, side-channel attacks on the user's CPU, etc.).</li>
          <li>Social-engineering attacks on {BRAND_NAME} staff (we are 1 person; the attack surface is documented elsewhere).</li>
        </ul>

        <p className="text-sm text-text-muted mt-5">
          The formal terms of the bounty live at <Link to="/terms#section-7" className="text-accent-cyan hover:underline">Terms § 7 — Smart-contract risk + Beta Tester Programme</Link>. The reward decision is at the discretion of {BRAND_NAME}; the public reputation pledge is that we will not weasel out of clear-cut findings, and the public on-chain mint record makes that pledge auditable.
        </p>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">If you scan these yourself, here's what you'll see — and what it means</span></h3>
        <p className="text-sm text-text-on-dark/90 mb-3">
          Run any automated scanner on these addresses and it will surface a wall of flags. We are not hiding from that — here is the honest, line-by-line reality, mapped to the actual findings reported across both review passes and the final SolidityScan run on the deployed bytecode:
        </p>
        <h4 className="text-base font-bold text-text-on-dark/90 mt-4 mb-2">What the scanner will flag today — and why each is not exploitable</h4>
        <div className="space-y-3 text-sm">
          <div className="border-l-2 border-rose-500/50 pl-3">
            <div className="font-bold text-rose-300">"Honeypot · Liquidity lock · Counterfeit token · Spam NFT · 5% supply concentration · ERC-20 token"</div>
            <p className="text-text-muted mt-1">Not applicable — memecoin rug-pull heuristics. Automated scanners assume every contract is a tradeable ERC-20. {BRAND_NAME}'s License is ERC-1155 and the SBT is soul-bound ERC-721 — no liquidity pool, no tradeable supply, no market. The aggregate "Threat Score / High Risk" headline you see is this misclassification, not a real assessment. Ignore it; read the per-contract Security Score instead.</p>
          </div>
          <div className="border-l-2 border-amber-400/50 pl-3">
            <div className="font-bold text-amber-300">"Public burn (×3 on SBT)" — false positive</div>
            <p className="text-text-muted mt-1">All three: <code>revokeNoK</code> reverts unless the caller is the exact wallet that minted the SBT (the original vault owner); <code>recoverNoK</code> reverts unless the caller is the registered Recovery module (after its M-of-N guardian quorum + 24-hour time-lock + owner-cancellation window); <code>rebindFromEscrow</code> reverts unless the caller is the registered Hybrid-E escrow (after EIP-712 attestation verification on a one-time nonce + deadline). Free-tier scanners cannot reason about custom access-control logic past simple modifier patterns — read each function's first line. We cannot remove the <code>_burn</code> calls without removing the ability to revoke a NoK, recover a lost wallet, or rebind an inheritance from email-escrow — i.e. removing the product.</p>
          </div>
          <div className="border-l-2 border-amber-400/50 pl-3">
            <div className="font-bold text-amber-300">"setGuardians missing access modifier" (Recovery, 1× High) — false positive</div>
            <p className="text-text-muted mt-1">Intentionally permissionless and self-scoped. The function writes ONLY to <code>guardiansOf[msg.sender]</code> and <code>thresholdOf[msg.sender]</code> — each user configures their OWN guardian list. Adding <code>onlyOwner</code> would break the product (it'd let only the contract owner set every user's guardians, which is the opposite of what social recovery means). The scanner cannot reason about per-user storage scoping. Documented in the contract NatSpec permanently.</p>
          </div>
          <div className="border-l-2 border-amber-400/50 pl-3">
            <div className="font-bold text-amber-300">"Integer overflow in unchecked block" (Escrow, 1× High) — false positive</div>
            <p className="text-text-muted mt-1">The NoKLockEscrow contract source contains <strong>no <code>unchecked</code> blocks</strong>. The flag is on flattened OpenZeppelin library code (EIP712 / ECDSA / ReentrancyGuard internals) — well-audited library code that we do not modify. Verify by opening the verified source on PolygonScan and searching for the word "unchecked" inside the <code>NoKLockEscrow</code> contract scope — you'll find none in our code.</p>
          </div>
          <div className="border-l-2 border-amber-400/50 pl-3">
            <div className="font-bold text-amber-300">"Centralization risk · Overpowered owner" — acknowledged and mitigated</div>
            <p className="text-text-muted mt-1">The owner can set licence prices (<code>setPrice</code>), toggle tier mintability (<code>setMintable</code>), set referral parameters (<code>setReferralParams</code>) within hard caps, and bootstrap the Chainlink forwarder once (<code>setForwarder</code>, then locked irrevocably). These are operational controls, not the ability to touch user data or seize funds: there is no <code>withdraw</code>, no <code>sweep</code>, no "move user funds" path, and no pooled balance the owner could drain. The two highest-impact owner powers — License treasury/payment-token swaps, and SBT module-setter swaps (oracle / recovery / escrow / license) — are now both behind a <strong>7-day on-chain timelock</strong> (v0.1 + v0.2 audit fixes). Ownable2Step is enforced on all 6 contracts; <code>renounceOwnership</code> is explicitly disabled. Migration to a Gnosis Safe multi-sig is documented and will execute as scale warrants.</p>
          </div>
          <div className="border-l-2 border-amber-400/50 pl-3">
            {/* 0.6.5 — [fix-copy-1-escrow-attestor-disclosure] Symmetric
                disclosure for the Escrow attestor (owner-set Form B signer).
                Previously documented only in the NoKLockEscrow Solidity
                NatSpec; now surfaced to /info readers alongside the
                License/Oracle/Recovery owner-power disclosures. */}
            <div className="font-bold text-amber-300">"Escrow attestor — owner-set off-chain signer" — acknowledged and scoped</div>
            <p className="text-text-muted mt-1">The Hybrid-E email-NoK escrow has an owner-set <strong>attestor</strong>: the Form B EIP-712 signer whose signature is required for an email-designated heir to claim an SBT via <code>claimWithAttestation</code>. The owner can rotate this address (<code>setAttestor</code>, on a quarterly cadence) and can revoke an in-flight escrow binding (<code>revokeBinding</code>); both emit public on-chain events. <strong>What an attestor-key compromise could do:</strong> sign a forged claim payload for an email-designated SBT that is already in escrow — i.e. interfere with one specific user's email-heir route. <strong>What it could NOT do:</strong> touch any wallet-designated NoK (the email-attestor path is bypassed entirely when a NoK wallet is named directly); drain or move USDC (the Escrow contract holds none); skip the dead-man's switch (activation is still gated by the Oracle's heartbeat lapse); decrypt your shares (those never touch the chain). Rotation invalidates every unspent attestation signed by the old key instantly — submitting a stale signature after rotation reverts with <code>BadAttestor</code>. Ownable2Step + 7-day timelock on the SBT's escrow-module setter apply here too, and the migration path to multi-sig signing of attestations is in the same Gnosis Safe roadmap as the contract owner.</p>
          </div>
          <div className="border-l-2 border-amber-400/50 pl-3">
            <div className="font-bold text-amber-300">"Block timestamp dependency" (Oracle) — by design</div>
            <p className="text-text-muted mt-1">The dead-man's switch uses <code>block.timestamp</code> to measure elapsed silence against the user's chosen grace period (default 60 days, max 10 years per the v0.1 audit cap). Miner timestamp drift is bounded to ±15 seconds — irrelevant on a grace window of days/months. The flag is generic; the use is correct and unavoidable.</p>
          </div>
          <div className="border-l-2 border-slate-500/50 pl-3">
            <div className="font-bold text-slate-300">"Outdated pragma · missing NatSpec · gas optimisations · informational items"</div>
            <p className="text-text-muted mt-1">Hygiene, not vulnerabilities. Pragma is pinned to <strong>Solidity 0.8.35</strong> (latest stable on review — newest ≠ safest, so we hold one minor behind bleeding-edge). NatSpec coverage is complete on every external function; the hundreds of "informational" gas items are style suggestions a scanner emits in bulk and none affect correctness or safety. <em>Older scans may also flag "use Ownable2Step" — no longer applicable</em>: Ownable2Step is adopted on all 6 contracts, with <code>renounceOwnership</code> explicitly disabled, per the v0.1 audit fix.</p>
          </div>
        </div>

        {/* "Findings raised in earlier review passes and now fixed (history,
            not current state)" section moved off the public page on
            2026-05-27 — historical context isn't useful to a visitor reading
            the CURRENT state. Full history preserved at
            docs/audit-findings-history.rtf for internal reference. */}
      </div>

      <div className="card border-accent-teal/40">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">The bottom line — by design, not by luck</span></h3>
        <p className="text-sm text-text-on-dark/90 mb-3">
          There is no exploitable path to steal funds or to break or hijack an inheritance. That is a property of the architecture, not an outcome we're hoping holds:
        </p>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li><strong>Nothing to steal:</strong> the contracts custody no funds and no data. Your seed, shares and documents are encrypted in your browser and stored in <em>your</em> accounts. The chain holds hashes and pointers, never plaintext.</li>
          <li><strong>Money only moves with your signature:</strong> a licence mint pulls only the USDC you explicitly approved, once. That single pull is split atomically — the treasury gets the remainder and, if you used a referral link, the referrer or affiliate gets their fixed share in the very same transaction. There is no withdraw function, no sweep, no admin "move user funds" path, and the contract never holds a balance to claim or lose — because there are no pooled user funds on it.</li>
          <li><strong>Inheritance can't be silently hijacked:</strong> activation requires the dead-man's switch to lapse on-chain; release requires an M-of-N guardian quorum, then a time-lock, then a window in which you can cancel from your original wallet. No single party — including us — can shortcut that.</li>
          <li><strong>Worst realistic bug = self-inflicted, self-funded griefing</strong> (someone wasting their own gas on their own designation), never the theft of another user's assets or a forged inheritance.</li>
        </ul>
        <p className="text-text-muted text-xs mt-3">
          Don't take our word for it — the source is verified on PolygonScan above. Read it. If you find a path we missed, <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a> — a verified report earns a free Lifetime licence.
        </p>
      </div>
    </section>
  );
}

function ReferralInfoTab(): JSX.Element {
  return (
    <section className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Refer &amp; earn — how it actually works</span></h2>
        <p className="text-lg text-text-on-dark/90 mb-4">
          The whole programme is enforced by the {BRAND_NAME}License smart contract on Polygon. There is no dashboard we control, no payout team, no claim form, no discretion. Every figure on the <Link to="/refer" className="text-accent-cyan hover:underline">/refer</Link> page is read live, on-chain.
        </p>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li><strong>Anyone with a wallet can refer — no purchase, no signup.</strong> You do <em>not</em> need a paid licence (or even a Free mint) to be a referrer. Connect any wallet on <Link to="/refer" className="text-accent-cyan hover:underline">/refer</Link>; your referral link is simply your wallet address.</li>
          <li><strong>The referee saves 10%.</strong> Anyone who buys a paid licence after visiting your link pays 90% of list price — the discount is applied by the contract at mint, automatically.</li>
          <li><strong>You earn 10% of what they pay.</strong> The contract attributes a fixed 10% of the discounted price (= the amount they paid) to you the instant the mint settles. The same member is permanently locked to you on-chain as their first referrer (<code>referredBy</code>), so when they renew or re-purchase through a referral link you're credited again — automatically.</li>
          <li><strong>First-referrer lock.</strong> The first paid mint locks you in as that wallet's referrer permanently. It cannot be swapped later — no farming, no poaching.</li>
          <li><strong>Below 5 referrals → redeemable credit.</strong> Your 10% accrues as on-chain USDC credit that auto-applies against your own next licence purchase. Non-cash, but real value, and it never expires.</li>
          <li><strong>At 5 paid referrals → affiliate, instant USDC.</strong> You flip to affiliate and every referral from then on pays your 10% <em>straight to your wallet in USDC, in the same transaction</em>. There is no claim button by design — the contract never custodies your money, so there is nothing to claim, freeze, or lose.</li>
          <li><strong>Free tier earns nothing.</strong> Free mints cost nothing and pay nothing — there is no sybil/farming surface.</li>
          <li><strong>Self-referral and the zero address are rejected on-chain.</strong> You cannot refer yourself.</li>
        </ul>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Worked example</span></h3>
        <p className="text-sm text-text-on-dark/90">
          At today's <strong>Founder price</strong>, your friend mints Standard (list $99). They pay <strong>$89.10</strong> (10% off). You earn <strong>$8.91</strong> (10% of $89.10). Under 5 referrals that $8.91 is on-chain credit toward your own next {BRAND_NAME} licence. Once you've made 5 paid referrals it lands in your wallet as USDC the instant they mint — no claim, no wait, no intermediary.
        </p>
        <p className="text-xs text-text-muted mt-2">
          The maths follows the live on-chain price. After the Founder window (Standard list $149) the same example is: friend pays <strong>$134.10</strong>, you are credited <strong>$20.12</strong>. The percentages never change — only the price they apply to.
        </p>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">How your link is remembered — no cookie, no tracking</span></h3>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li><strong>No cookie. No server. No tracking pixel.</strong> When someone opens your <code className="text-accent-cyan">?ref=</code> link, the referrer address is saved only in <em>their own browser's local storage</em>. {BRAND_NAME} records nothing about who visited — consistent with our zero-tracking promise.</li>
          <li><strong>It sticks to that browser.</strong> Once they've opened your link, that browser remembers it even if they leave and come back later <em>without</em> the link — right up until their first paid mint. It is the most recently opened referral link on that browser that counts before the mint.</li>
          <li><strong>It does not follow the person.</strong> A different device or browser, a cleared site-data, or a private/incognito window has no memory of your link — there is nothing server-side to recover it from (by design).</li>
          <li><strong>The chain is the final word.</strong> At their first paid mint the contract locks you in as that wallet's referrer <em>permanently</em>. Nothing off-chain can change it after that, and every renewal stays yours.</li>
        </ul>
      </div>

      <div className="card border-accent-teal/40">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Why this is trustless, not a "programme"</span></h3>
        <p className="text-sm text-text-on-dark/90 mb-3">
          Traditional referral schemes ask you to trust the company to track, tally, and pay. {BRAND_NAME}'s is the opposite:
        </p>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li><strong>The contract is the arbiter.</strong> Attribution, the discount, the split, the affiliate threshold and the USDC transfer are all executed by verified Solidity you can read on the <button type="button" className="text-accent-cyan hover:underline" onClick={() => { /* same-tab Contracts */ window.location.assign("/info?tab=contracts"); }}>Contracts tab</button>.</li>
          <li><strong>No contract-held balance.</strong> Affiliate payouts are atomic transfers within the buyer's own mint transaction — {BRAND_NAME} never holds your earnings, so there is nothing for us (or an attacker) to withhold.</li>
          <li><strong>Owner-tunable, bounded.</strong> The 10% / 10% / 5-referral parameters are owner-set on-chain within hard caps (the treasury always keeps ≥ 40%), and every change emits a public event.</li>
        </ul>
        <p className="text-sm text-text-muted mt-3">
          Get your link and track everything on the <Link to="/refer" className="text-accent-cyan hover:underline">/refer dashboard →</Link>
        </p>
      </div>

      <div id="founder-referrer-bonus" className="card border-accent-teal/50">
        <div className="flex items-baseline gap-3 flex-wrap mb-3">
          <span className="tier-badge bg-cyan-700/40 text-accent-cyan border border-accent-cyan/40">Founder-Referrer Bonus</span>
          <h3 className="text-xl font-bold font-display"><span className="grad">Early-builder bonus &amp; reputation pledge</span></h3>
        </div>
        <p className="text-sm text-text-on-dark/90 mb-3">
          On top of the standard 10%/10% referral split (executed by the audited contract above), {BRAND_NAME} commits a one-time milestone bonus to the first wallet that reaches each of three paid-referral thresholds. This is not a contest or a prize draw — it is a performance bonus paid in proportion to verified, on-chain referral work.
        </p>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-surface text-text-muted">
                <th className="text-left p-2">First wallet to reach</th>
                <th className="text-left p-2">Bonus</th>
                <th className="text-left p-2">Calculated on</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-bg-surface/40">
                <td className="p-2 font-mono">100 paid referrals</td>
                <td className="p-2 font-bold text-accent-green">25%</td>
                <td className="p-2 text-text-muted">of that wallet's on-chain referral earnings up to and including the milestone block</td>
              </tr>
              <tr className="border-b border-bg-surface/40">
                <td className="p-2 font-mono">500 paid referrals</td>
                <td className="p-2 font-bold text-accent-green">50%</td>
                <td className="p-2 text-text-muted">of that wallet's on-chain referral earnings up to and including the milestone block</td>
              </tr>
              <tr>
                <td className="p-2 font-mono">1,000 paid referrals</td>
                <td className="p-2 font-bold text-accent-green">75%</td>
                <td className="p-2 text-text-muted">of that wallet's on-chain referral earnings up to and including the milestone block</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="font-bold font-display mt-5 mb-2">How the bonus is calculated (precise)</h4>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li>
            <strong>"Hard earnings" of a wallet</strong> means the cumulative sum of the <code>cut</code> field across every <code>ReferralAttributed</code> event emitted by the on-chain {BRAND_NAME}License contract for that wallet as the <code>referrer</code>. It includes both pre-affiliate credit accruals AND post-affiliate instant USDC payouts. Anyone can reproduce the number from chain logs.
          </li>
          <li>
            <strong>The milestone block</strong> is the block where that wallet's on-chain <code>referralCount</code> first equals or exceeds 100 / 500 / 1,000 respectively. The exact tx hash that crossed the threshold is public on PolygonScan; we will reference it in the payout announcement.
          </li>
          <li>
            <strong>Same wallet wins multiple tiers — tranched, not stacked.</strong> If the same wallet is first to 100 AND first to 500, the 500-tier bonus is calculated as <code>50% × hard-earnings-at-block-500 − 25% × hard-earnings-at-block-100</code> (the 25% already received is netted out). The 1,000-tier bonus is calculated similarly, netting both prior payouts. So the maximum any single wallet can earn through this bonus is exactly <strong>75% of its hard earnings at the block it crossed 1,000</strong> — never more.
          </li>
          <li>
            <strong>Tie-break</strong> (extremely unlikely but disclosed): if two wallets cross the same milestone in the same block, the wallet with the lower transaction index within that block wins.
          </li>
          <li>
            <strong>Payout</strong> is made in USDC from the {BRAND_NAME} Treasury wallet to the winning wallet, as soon as we have verified the milestone-crossing tx (target: within 7 days of the milestone block). The payout tx hash is announced on the <Link to="/updates" className="text-accent-cyan hover:underline">Updates page</Link>, owner-signed.
          </li>
        </ul>

        <h4 className="font-bold font-display mt-5 mb-2">Why "admin-paid" — and why that doesn't weaken the promise</h4>
        <p className="text-sm text-text-on-dark/90 mb-3">
          The standard 10%/10% referral split is contract-enforced and atomic. The milestone bonus is paid manually by {BRAND_NAME} (an off-chain admin action) for two pragmatic reasons: it lets us launch this bonus today without redeploying the contracts, and it lets us be flexible if we ever need to address an obvious bad-faith edge case in public. But the bonus's <strong>trust anchor is not "our word" alone</strong> — it is the combination of three things that we cannot fake:
        </p>
        <ol className="space-y-2 text-sm text-text-on-dark/90 list-decimal list-inside ml-2">
          <li>
            <strong>The metric is on-chain.</strong> Every paid referral that counts toward 100/500/1,000 is a <code>ReferralAttributed</code> event on the verified License contract. There is no off-chain count, no hidden ledger, no admin override. The contract is the count, and the count is public on PolygonScan in real time.
          </li>
          <li>
            <strong>The payout is on-chain.</strong> When we pay, the USDC transfer from {BRAND_NAME} Treasury to the winning wallet is a public Polygon transaction. The tx hash is published on /updates with an owner signature. If we ever failed to pay, the absence would be just as visible on-chain as the payment.
          </li>
          <li>
            <strong>The reputation pledge.</strong> We are publishing this bonus alongside the rest of the {BRAND_NAME} trust narrative — verified contracts, zero-PII privacy, self-custodial architecture, on-chain referral split, two-pass external audit. If we ever broke this milestone promise, the same audience that holds us to the rest of those promises would see it. The cost to {BRAND_NAME} of breaking this bonus = the loss of every other claim's credibility. That alignment is what makes the pledge worth more than the words.
          </li>
        </ol>

        <h4 className="font-bold font-display mt-5 mb-2">Caveats — what is NOT promised</h4>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li>
            <strong>No retroactive top-up</strong>. The bonus pays a percentage of hard earnings up to the milestone block, computed once at that block. Future earnings of the same wallet beyond a milestone do not retroactively grow that milestone's bonus.
          </li>
          <li>
            <strong>One winner per tier.</strong> The 25% bonus goes to the first wallet to reach 100, period. Once that block is in, the tier is closed forever even if many other wallets later reach 100 (which we hope they do — they keep earning the standard 10% referrer share).
          </li>
          <li>
            <strong>Future contract redeploy</strong>: tiered milestones are anchored to the deployed License contract's on-chain <code>referralCount</code>. If a future redeploy ever happens (multi-level referral and certain contract-logic upgrades may need one), positions held on the current contract at the cutover are honoured up to the milestones they had crossed. The replacement contract starts a fresh count from zero; we will only run a new milestone bonus on the new contract if we explicitly announce one. There is no implicit roll-over.
          </li>
          <li>
            <strong>No purchase to participate.</strong> You do not need to own a paid licence to refer; anyone with a wallet can refer (see existing referral rules above). The 100/500/1,000 thresholds count PAID referrals (Free tier mints have price zero and pay no referral cut, so they never count).
          </li>
          <li>
            <strong>Not an investment or security.</strong> The bonus is a marketing performance payment on top of a software-sales referral split. It is not an investment, deposit, security, income guarantee, or financial / tax / legal advice. By participating you accept the on-chain state of the audited contract as the sole and final source of truth for what you have earned.
          </li>
        </ul>

        <p className="text-sm text-text-on-dark/85 mt-4 p-3 rounded border border-accent-teal/40 bg-bg-deepest">
          <strong>The pledge, in one sentence:</strong> {BRAND_NAME} will pay these three milestone bonuses in USDC to the qualifying wallets, transparently and on-chain, as a public reputation commitment. If we ever broke that, the proof would be just as public as the promise.
        </p>
      </div>

      <div className="card border-white/10">
        <h3 className="text-sm font-bold font-display mb-2 text-text-muted">The fine print</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          By sharing a referral link or participating in the programme you accept that the audited,
          publicly verifiable {BRAND_NAME}License smart contract is the <strong>sole and final arbiter</strong> of
          all attribution, discounts and payouts. The browser-local link mechanism described above is a
          convenience and is <strong>best-effort, not guaranteed</strong> — a referral that is not locked on-chain at
          the referee's first paid mint carries no entitlement. Because {BRAND_NAME} keeps <strong>no off-chain
          record of referrals by design</strong> (zero tracking), {BRAND_NAME} cannot and does not adjudicate
          "I referred them but did not get credit" disputes; only the on-chain state is recognised.
          Referral credit and affiliate USDC are a discount/revenue-share on software sales — they are
          <strong> not an investment, deposit, security, or income promise</strong>, and nothing here is financial,
          tax or legal advice. Parameters (currently 10% / 10% / 5) are owner-tunable on-chain within
          hard caps and may change prospectively; every change emits a public event. Where this text is
          shown in another language, the <strong>English version governs</strong>.
        </p>
      </div>
    </section>
  );
}

function PasskeysTab(): JSX.Element {
  return (
    <section className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Passkeys &amp; access — what unlocks your vault</span></h2>
        <p className="text-lg text-text-on-dark/90 mb-4">
          There are two things, and they are NOT the same. Knowing the difference is the most important thing on this page.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded border border-accent-teal/40 p-3">
            <div className="font-bold text-accent-teal mb-1">Master password — the real key</div>
            <p className="text-text-on-dark/80">A password you choose and remember. It derives the key that encrypts your shares. It is the ONE thing that always brings your vault back — for you, and for your next-of-kin. {BRAND_NAME} never sees it and cannot reset it.</p>
          </div>
          <div className="rounded border border-bg-surface p-3">
            <div className="font-bold mb-1">Passkey — an optional convenience</div>
            <p className="text-text-on-dark/80">A real WebAuthn passkey (Face ID / Touch ID / Windows Hello / a hardware security key) you can add <strong>after</strong> the vault is created, on the save step, on a device whose authenticator supports the WebAuthn <strong>PRF</strong> extension. It just unlocks a local encrypted copy so you don't retype the long password on that device. There is deliberately <strong>no 2FA / SMS / app code</strong> — a lost second factor would permanently destroy recovery and inheritance. The passkey is never the only way in; the master password always works even if your device can't do passkeys.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">How it actually works</span></h3>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li>At enrol you set a <strong>master password</strong>. Everything (seed, letter, document, image) is encrypted with a key derived from it. To recover, you supply your threshold of share files + that master password. That path always works, on any device, with no passkey.</li>
          <li>Optionally, on the <strong>Save share files</strong> step (after the vault is split — not at the master-password screen), you can <strong>add a passkey</strong> on the device you're using. {BRAND_NAME} wraps an extra encrypted copy of the key so your fingerprint/face/security-key can open it — and downloads a small <code>passkey-unlock.json</code> sidecar. Convenience only. This needs an authenticator that supports the WebAuthn <strong>PRF (hmac-secret)</strong> extension — most hardware security keys and many platform authenticators do, some don't. If yours doesn't, the add step won't complete and that's fine: your master password fully protects and recovers the vault on every device.</li>
          <li>At restore, you can unlock with <strong>either</strong>: the master password (always), or the passkey if that sidecar + a registered device are present.</li>
        </ul>
      </div>

      <div className="card border-accent-teal/40">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">The questions that actually matter</span></h3>
        <ul className="space-y-3 text-sm text-text-on-dark/90 list-disc list-inside">
          <li><strong>I lost the device / the passkey doesn't work.</strong> Nothing is lost. Use your master password + shares — it fully restores. The passkey can never be the single point of failure, by design.</li>
          <li><strong>I forgot the master password.</strong> This is the one unrecoverable case — deliberately. If a password could be reset, {BRAND_NAME} (or an attacker, or a court) could decrypt your vault. No one can. <strong>Write your master password down and store it safely</strong> (a safe, a will, a password manager you control).</li>
          <li><strong>How does my next-of-kin get in?</strong> Inheritance uses the shares + the master password — NOT your device passkey (a passkey is bound to your device, your heir won't have it). Make sure your next-of-kin can obtain the master password through your own arrangements (sealed letter, estate documents, a trusted party). The on-chain dead-man's switch releases the share pointers; the master password is what turns them back into your data.</li>
          <li><strong>Is the passkey phishing-safe?</strong> Yes — WebAuthn is origin-bound; it only works on {BRAND_NAME}'s real domain. But it's a convenience layer, not the trust root.</li>
        </ul>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold font-display mb-3"><span className="grad">Who is responsible for what</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-surface text-text-muted">
                <th className="text-left p-2">Item</th>
                <th className="text-left p-2">Who keeps it</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Seed phrase (for a seed vault)", "You — never sent to us"],
                ["Master password", "You — never sent to us, never resettable"],
                ["Share files / their cloud locations", "You — your own accounts"],
                ["Optional device passkey", "Your device's authenticator — local, per-device"],
                ["Anything that could decrypt your vault", `${"Nobody else"} — not ${BRAND_NAME}, not a server, not a court`],
              ].map(([a, b]) => (
                <tr key={a} className="border-b border-bg-surface/40">
                  <td className="p-2 align-top text-text-on-dark/80 w-1/2">{a}</td>
                  <td className="p-2 align-top text-accent-green">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-text-muted text-xs mt-3">
          The passkey is optional and only available where your browser/device supports WebAuthn. Adding or skipping it changes nothing about how you or your next-of-kin recover the vault.
        </p>
      </div>
    </section>
  );
}

function ComplianceTab(): JSX.Element {
  return (
    <section className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Compliance position</span></h2>
        <p className="text-lg text-text-on-dark/90 mb-4">
          {BRAND_NAME} is software. You pay for a subscription. The architecture means we never custody your funds, never facilitate exchange of crypto for fiat, never hold or move user money. That makes the regulatory picture simple.
        </p>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-3">Why KYC is not required</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-surface text-text-muted">
                <th className="text-left p-2">Test</th>
                <th className="text-left p-2">{BRAND_NAME}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Custody of crypto on user's behalf?", "No — user holds their own keys."],
                ["Exchange of crypto for fiat?", "No — we accept crypto for software; we don't convert."],
                ["Transfer or routing of crypto between parties?", "No — the smart contract mints an NFT to the payer. That's a receipt, not a transfer."],
                ["Operation of a trading platform?", "No — no order book, no matching engine."],
                ["Lending, staking, or asset management?", "No."],
                ["Financial advice?", "No."],
                ["Handling of user fiat at any point?", "No."],
                ["Handling of user crypto beyond receiving payment for our own software?", "No."],
              ].map(([q, a]) => (
                <tr key={q} className="border-b border-bg-surface/40">
                  <td className="p-2 align-top text-text-on-dark/80 w-1/2">{q}</td>
                  <td className="p-2 align-top text-accent-green font-mono text-xs">{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-text-on-dark/80 mt-4">
          {BRAND_NAME} is structurally a software vendor that accepts crypto as payment — same category as developer tools, paid Web3 SDKs, or any other paid Web3 SaaS. Not a Crypto-Asset Service Provider under MiCA. Not a money-services business under German BaFin rules. None of those frameworks apply.
        </p>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-3">What we do comply with</h3>
        <ul className="space-y-2 text-sm text-text-on-dark/80">
          <li><strong>DSGVO / GDPR:</strong> {BRAND_NAME} sets <strong>zero cookies</strong>, runs <strong>no third-party trackers</strong>, collects <strong>no personal identifiers</strong> (no name, email, phone, IP logging, browser fingerprint). The only things stored are wallet addresses + heartbeat timestamps — public on-chain data anyone can already see. No cookie banner is shown because no consent is required: there is nothing to consent to. Data-controller: Tenza Climate Solutions, HRB&nbsp;41384. Full statement on the <Link to="/privacy" className="text-accent-cyan hover:underline">Privacy page</Link>.</li>
          <li><strong>Impressum:</strong> German Telemediengesetz §5 — operator disclosed on the site (Tenza Climate Solutions, HRB&nbsp;41384).</li>
          <li><strong>Terms of Service:</strong> standard SaaS terms, light counsel review.</li>
          <li><strong>Income / VAT:</strong> ordinary German income tax + VAT once over Kleinunternehmer threshold. Crypto revenue declared at the EUR equivalent at time of receipt.</li>
        </ul>
      </div>

      <div id="why-not-keyless" className="card scroll-mt-24">
        <h3 className="font-bold font-display mb-3"><span className="grad">Why not "keyless"?</span></h3>
        <p className="text-sm text-text-on-dark/80 mb-3">
          A growing cohort of wallets market themselves as "keyless" — sign in with Google, sign in with biometrics, no seed phrase. The pitch is seductive. The reality is usually one of three quiet truths:
        </p>
        <ol className="space-y-2 text-sm text-text-on-dark/80 list-decimal ml-5 mb-3">
          <li><strong>Custodial behind the curtain.</strong> "Keyless" because someone else holds a share / the key / the recovery quorum. Lose access to your OAuth provider, lose your wallet.</li>
          <li><strong>Shards in localStorage.</strong> The "keyless" wallet stores share fragments in your browser's localStorage. One XSS or one malicious npm package and the shards are exfiltrated. The seed phrase you avoided becomes a session cookie that can be stolen by JavaScript.</li>
          <li><strong>Centralised MPC coordinator.</strong> Multi-party computation needs at least one party. If that party is the wallet company's server, you have a custodial wallet with extra steps.</li>
        </ol>
        <p className="text-sm text-text-on-dark/80 mb-3">
          {BRAND_NAME} takes the opposite stance: <strong>your seed phrase is sacred, not a UX problem to hide.</strong> We honour it, then we make it extremely hard to lose — and easy to recover or pass on:
        </p>
        <ul className="space-y-1 text-sm text-text-on-dark/80 list-disc ml-5 mb-3">
          <li><strong>You hold the keys.</strong> We literally cannot access them. Every crypto operation runs in your browser; we receive no plaintext.</li>
          <li><strong>You hold the shares.</strong> Encrypted shares live in clouds <em>you</em> connect — Dropbox, Drive, OneDrive, IPFS, Arweave. Not ours.</li>
          <li><strong>You hold the recovery rights.</strong> Threshold restore from any T-of-N shares. Plus optional social recovery with time-locked guardian votes (Premium). Plus optional next-of-kin inheritance via soul-bound NFT.</li>
        </ul>
        <p className="text-sm text-text-on-dark/90">
          <strong>Other wallets pretend you don't have keys. {BRAND_NAME} hands you the tools to keep them — any threshold of your shares plus your master password brings the vault back.</strong>
        </p>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-3">Documents and images disclaimer</h3>
        <p className="text-sm text-text-on-dark/80">
          Document and image inheritance is live (enrol at <code>/enrol/document</code> or <code>/enrol/image</code>). Your files are encrypted in your browser, split into shares, and released to your designated next-of-kin when the dead-man's switch fires. The same end-to-end self-custodial pipeline as the seed and sealed-letter flows applies — {BRAND_NAME} never sees the contents and never holds the key. {BRAND_NAME} does NOT replace legal requirements for the originals: wills must still be signed and witnessed in your jurisdiction's prescribed form, deeds must remain in official registries, contracts must be enforceable on paper, and photographs of identity, property or third parties are subject to whatever consent / data-protection / copyright rules apply to them in your jurisdiction. Treat {BRAND_NAME} as a digital safe with an inheritance trigger — not as a notary, lawyer, or court.
        </p>
      </div>

      <div className="card">
        <h3 className="font-bold font-display mb-3">Language &amp; translations</h3>
        <p className="text-sm text-text-on-dark/80 mb-2">
          The <strong>English version of every page, term, and disclaimer is the single authoritative and legally governing version</strong>. Other languages are provided only as a convenience.
        </p>
        <ul className="space-y-1 text-sm text-text-on-dark/80 list-disc ml-5">
          <li>If a translation differs from the English in any way, <strong>the English text prevails</strong>.</li>
          <li>{BRAND_NAME} is <strong>not liable for translation errors, omissions, or ambiguities</strong> in any non-English rendering.</li>
          <li>Product functionality, security, pricing and on-chain behaviour are <strong>identical regardless of the language</strong> you view the site in — translations change wording only, never what the software does.</li>
          <li>The Chinese (简体) and Hindi (हिन्दी) translations are <strong>pending native-speaker review</strong>; treat them as drafts and rely on the English for anything consequential.</li>
        </ul>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// AboutNoKLockTab — Info > About NoKLock tab (0.7.6, Daniel 2026-06-02).
//
// Project-meta surfaces moved verbatim from Settings.tsx 0.5.x. Same JSX,
// same components, same imports — just hosted on the Info tab where they
// belong. Order on the page is the same as the old Settings page bottom:
//   1. NoKLock updates (CheckForUpdatesCard) — how the PWA stays current.
//   2. Privacy — current back-end URL + privacy posture.
//   3. System status — operational "don't trust, verify" strip.
//   4. About — version, build, deploy date, live contracts, entity, GDPR, IP.
//
// Nothing changes about the content or look; only the route home.
// -----------------------------------------------------------------------------
function AboutNoKLockTab(): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-2xl font-bold font-display mb-2">
          <span className="grad">About {BRAND_NAME}</span>
        </h2>
        <p className="text-text-on-dark/80 text-sm">
          What the project is, where it runs, what version you're on, which contracts the chain is enforcing on your behalf, and whether everything is alive right now. Moved out of Settings on 2026-06-02. Settings is for things you choose; this tab is for things you verify.
        </p>
      </section>

      <AboutFounderCard />
      <AboutCheckForUpdatesCard />
      <AboutPrivacyCard />
      <SystemStatus />
      <AboutBox />

      {/* Chainlink funding visibility (Daniel 2026-06-15) — the live LINK
          balance of the dead-man's-switch upkeep, with a permissionless top-up
          button. Proves the automation isn't a NoKLock-only dependency: anyone
          can keep it alive. */}
      <section className="card">
        <h3 className="text-xl font-bold font-display mb-1"><span className="grad">Keep the automation alive</span></h3>
        <p className="text-text-on-dark/80 text-sm mb-3">
          The dead-man's switch is fired by a <strong>Chainlink Automation</strong> upkeep funded with LINK. Chainlink is
          permissionless — <strong>anyone can top this up</strong>, so the switch never depends on NoKLock alone for funding.
          Here's the live balance and a top-up button open to any wallet.
        </p>
        <ChainlinkUpkeepStatus />
      </section>
    </div>
  );
}

// 0.8.5 — Daniel 2026-06-04: founder profile / "About the founder" card.
// Placed at the top of the About tab so the first thing a curious user reads
// is the why-this-was-built voice. Plain copy, single LinkedIn link to
// Daniel's profile. No marketing decoration.
// 0.9.2 — Daniel 2026-06-14: two paragraphs now — a depth/longevity lead
// (credentials, no buzzwords) + the original first-person "why I built it"
// note (its contradicting 25yr/decade numbers removed). See file header.
function AboutFounderCard(): JSX.Element {
  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-bold font-display">
        <span className="grad">About the founder</span>
      </h2>
      <p className="text-text-on-dark/85 text-sm leading-relaxed">
        The reason {BRAND_NAME} trusts math instead of a company — and leaves you in sole control — is the person who designed it. Forty-plus years in technology from the ground up: mathematics, operating systems, network protocols, then the architecture of very large-scale systems — programmes in the $250–500 million range — and IT strategy for organisations from Accenture-scale consultancies to a multi-billion-dollar national state oil company. Fifteen years advising independently on positioning, planning, product and at board level; fifteen across the London, German and Swiss startup scenes, judging at MassChallenge and others; and blockchain and token-economy architecture since 2017. Decades of watching what lasts and what fails is exactly why {BRAND_NAME} is built on cold, checkable math and keeps the human — you — in control.
      </p>
      <p className="text-text-on-dark/85 text-sm leading-relaxed">
        One lesson held across all of it: things rarely break in the cryptography — they break in the assumptions around it. I built {BRAND_NAME} first for myself: self-custody that survives me, without trusting a company to stay alive or stay honest to make recovery work. Every alternative I examined forced one of two trades I wasn&apos;t willing to make — hand your keys to the provider, or bet your heirs&apos; access on that provider still existing. {BRAND_NAME} makes neither: it never sees your seeds, and inheritance keeps working even if {BRAND_NAME} itself disappears.
      </p>
      <p className="text-sm">
        <span className="text-text-on-dark/85">— Daniel Steeves, Founder · </span>
        <a
          href="https://www.linkedin.com/in/danielsteeves"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-cyan hover:underline"
        >
          LinkedIn ↗
        </a>
      </p>
    </div>
  );
}

// 0.7.6 — Moved verbatim from Settings.tsx (0.5.x). Same copy, same logic.
function AboutCheckForUpdatesCard(): JSX.Element {
  return (
    <div className="card scroll-mt-28" id="how-updates-work">
      <h2 className="font-bold font-display mb-3">How updates work</h2>
      <p className="text-text-on-dark/80 text-sm mb-2">
        {BRAND_NAME} is an installable web app. New versions arrive on their own. The browser fetches the next build quietly in the background; it takes effect the next time every {BRAND_NAME} tab and window is closed and reopened (or the installed app is relaunched). Nothing to download, nothing to side-load.
      </p>
      <p className="text-text-muted text-sm">
        Your hardware wallet is not our problem to update. A Ledger or Trezor signs through your own wallet app (MetaMask, Trust, Ledger Live) or WalletConnect, the standard way, and those vendors maintain that path. {BRAND_NAME} ships no USB driver, never touches the hardware wallet's keys, and your vault's encryption secret is a separate offline layer that no wallet holds. If everything else fails, BIP39 text entry still works.
      </p>
    </div>
  );
}

// 0.7.6 — Moved verbatim from Settings.tsx (0.5.x). Same copy, same logic.
function AboutPrivacyCard(): JSX.Element {
  return (
    <div className="card">
      <h2 className="font-bold font-display mb-3">Privacy</h2>
      <p className="text-text-on-dark/80 text-sm mb-3">
        We don't store anything about you. We can't: every cryptographic operation runs in your browser. The one call this PWA makes to our back-end is a JSON-RPC proxy whose job is to hide your IP from the public Polygon node. Full details on the <Link to="/privacy" className="text-accent-cyan hover:underline">privacy notice</Link>.
      </p>
      <p className="text-text-on-dark/80 text-sm mb-2">Current back-end URL (license reads and the RPC proxy):</p>
      <div className="font-mono text-xs bg-bg-deepest px-3 py-2 rounded border border-bg-surface mb-2 break-all">
        {import.meta.env.VITE_API_BASE_URL ?? "https://api.noklock.app/v1"}
      </div>
      <p className="text-text-muted text-xs">
        Want to host this yourself? Edit <code>apps/web/.env.production</code> and rebuild. One file, one line.
      </p>
    </div>
  );
}

// 0.7.6 — Moved verbatim from Settings.tsx (0.5.3). Same copy, same logic,
// same PolygonScan link helper, same row map.
function AboutBox(): JSX.Element {
  const polygonscan = (a: string): string => `https://polygonscan.com/address/${a}`;
  return (
    <div className="card">
      <h2 className="font-bold font-display mb-3">About</h2>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-text-muted">Public version</div>
          <div className="font-mono font-bold">v{PUBLIC_VERSION}</div>
        </div>
        <div>
          <div className="text-text-muted">Build hash</div>
          <div className="font-mono text-xs break-all">{getBuildHash()}</div>
        </div>
        <div>
          <div className="text-text-muted">Mainnet deploy date</div>
          <div className="font-mono">{DEPLOY_DATE}</div>
        </div>
        <div>
          <div className="text-text-muted">Chain</div>
          <div className="font-mono">Polygon (chainId 137)</div>
        </div>
      </div>
      {(() => {
        const ZERO = "0x0000000000000000000000000000000000000000";
        const rows: ReadonlyArray<readonly [string, string]> = [
          ["License",  LICENSE_ADDR],
          ["SBT",      SBT_ADDR],
          ["Oracle",   ORACLE_ADDR],
          ["Recovery", RECOVERY_ADDR],
          ["Escrow",   ESCROW_ADDR],
          ...(ALERTS_ADDR.toLowerCase() !== ZERO ? [["Alerts", ALERTS_ADDR] as const] : []),
        ];
        return (
          <div className="mt-4 space-y-1 text-xs">
            <div className="text-text-muted mb-1">Live contracts on Polygon mainnet, all {rows.length}, source-verified. Click any address to read the code on PolygonScan:</div>
            {rows.map(([label, addr]) => (
              <div key={label} className="flex gap-2">
                <span className="text-text-muted w-24 shrink-0">{label}:</span>
                <a href={polygonscan(addr)} target="_blank" rel="noopener noreferrer" className="font-mono text-accent-cyan hover:underline break-all">{addr}</a>
              </div>
            ))}
          </div>
        );
      })()}
      <p className="text-text-muted text-xs mt-3">
        Source under <a href="https://spdx.org/licenses/BUSL-1.1.html" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">BUSL-1.1</a>. See <Link to="/terms" className="text-accent-cyan hover:underline">Terms</Link> and <Link to="/privacy" className="text-accent-cyan hover:underline">Privacy</Link>.
      </p>
      <p className="text-text-muted text-xs mt-2">
        <strong className="text-text-on-dark/80">Entity:</strong> noklock.app operates under Tenza Climate Solutions, HRB&nbsp;41384.
      </p>
      <p className="text-text-muted text-xs mt-1">
        <strong className="text-text-on-dark/80">GDPR:</strong> no cookies, no trackers, no personal identifiers stored. No consent banner, because there's nothing to consent to. Full notice on <Link to="/privacy" className="text-accent-cyan hover:underline">Privacy</Link>.
      </p>
      <AboutPatentLine />
    </div>
  );
}

// 0.7.6 — Moved verbatim from Settings.tsx (0.5.x). Same copy, same logic.
function AboutPatentLine(): JSX.Element {
  const { leader } = useLivePatentLeader();
  return (
    <p className="text-text-muted text-xs mt-2">
      <strong className="text-text-on-dark/80">Patent:</strong> {leader}, covering {PATENT_DESCRIPTION}
    </p>
  );
}
