// @version 0.12.0 @date 2026-06-13
// 0.12.0 — Daniel 2026-06-13: English-only-surface i18n sweep. New keys for
//          three previously-hardcoded funnel/nav surfaces that rendered EN
//          in every locale:
//            (1) Homepage "Day-1 honest note" launch banner
//                (Landing.tsx LaunchTransparencyBanner):
//                  landing.day1.{badge,body,bug,rough,email,dismissForever}
//                  — the dynamic 154/154 + 0.8.35 numbers stay as untranslated
//                    interpolations injected at the callsite.
//            (2) Homepage use-cases carousel lead-in + 26 cards + 6 category
//                labels (VaultUseCasesCarousel / VaultUseCases):
//                  home.useCases.leadIn
//                  vuc.cat.<categoryId>            (6 category labels)
//                  vuc.card.<cardId>.{title,blurb} (26 cards)
//            (3) Info-dropdown menu items (TopNav desktop):
//                  nav.info.appInfo / .appUpdates / .enrolWalkthrough
//                  — NoKLock.white + Asserro item reuse existing
//                    nav.whitelabel / nav.corporate (no new keys).
//          Cloned into de/fr/pt as curated translations; zh-Hans/hi as
//          machine-translation starting points (TODO: native review).
// @version 0.11.0 @date 2026-06-10
// 0.11.0 — Daniel 2026-06-10: Google Play download surface keys (flag-gated
//          by PLAY_STORE_AVAILABLE). 7 new keys: footer.getAndroidApp,
//          settings.getAndroidApp.title, settings.getAndroidApp.body,
//          download.title, download.androidNote, download.iosNote,
//          download.comingSoon. Cloned into de/fr/pt/zh-Hans/hi as machine-
//          translation starting points (TODO: native review).
// @version 0.10.0 @date 2026-06-08
// 0.10.0 — Daniel 2026-06-08 round-5 copy: hero.managed.tiles.provision.body
//          expanded with Privy-secure-enclave + sharded-key reassurance;
//          hero.managed.tiles.heirEmail.body appended "(also applies to
//          self-custody model)"; hero.managed.tiles.escape.title renamed
//          "Always escape-hatchable" → "Self-custody escape hatch".
// @version 0.9.0 @date 2026-06-08
// 0.9.0 — Daniel 2026-06-08: tier-gating UX sweep — 5 new keys for the
//         chooser-card + use-case-catalog tier badges.
//           tier.badge.standardPlus
//           tier.badge.premiumPlus
//           tier.requires.standard
//           tier.requires.premium
//           tier.upgrade.cta
//         Cloned into de/fr/pt/zh-Hans/hi as machine-translation starting
//         point (TODO: native review). All five are short label/CTA
//         strings; the existing chooser-card amber "Premium" pill is the
//         visual baseline they replace.
// @version 0.8.0 @date 2026-06-08
// 0.8.0 — Daniel 2026-06-08: pricing round-2 copy keys — 17 new keys for the
//         buy-once / founder accordion + primary mode selector + bottom
//         summary block. New key groups:
//           pricing.accordion.buyOnce.{title,body}
//           pricing.accordion.founder.{title,body}
//           pricing.primary.{chooseMode,currency,buy,getStarted,founder}
//           pricing.primary.mode.{self,managed}
//           pricing.bottom.{headline,selfRow,managedRow,tiersLine,inheritanceOptional,referLine}
//         Cloned into de/fr/pt/zh-Hans/hi as machine-translation starting
//         point (TODO: native review).
// @version 0.7.0 @date 2026-06-08
// 0.7.0 — Daniel 2026-06-08: pricing rework key additions — 19 new keys for
//         the new tier-box + tabs + summary block copy that Agent 1 is
//         wiring into Pricing.tsx. Covers the two-path framing (self-custody
//         vs Managed coming-soon NL-2), the 5 tabs (selfCustody / managed /
//         compare / enterprise / faq), 3 tier names (free / standard /
//         premium), 3 SKU bits (annual / lifetime / autorenew), Managed
//         coming-soon callout + subtitle, lifetime tagline, founder-pricing
//         label, and the two mode-labels. New key groups:
//           pricing.summary.{headline,body}
//           pricing.tabs.{selfCustody,managed,compare,enterprise,faq}
//           pricing.tier.{free,standard,premium}.name
//           pricing.sku.{annual,lifetime,autorenew}
//           pricing.managed.{comingSoon,subtitle}
//           pricing.lifetime.tagline
//           pricing.founder.label
//           pricing.modeLabel.{self,managed}
//         Cloned into de/fr/pt/zh-Hans/hi as machine-translation starting
//         point (TODO: native review).
// @version 0.6.0 @date 2026-06-08
// 0.6.0 — Daniel 2026-06-08: simple-vs-max-security i18n sweep — add 19 new
//         keys covering the inline-EN copy that landed 2026-06-06 in
//         Landing.tsx 0.22.0 / Enrol.tsx Step B 2.13.0 / Pricing.tsx 0.9.6
//         FAQ / CryptoInheritance.tsx 0.3.1 Q. New key groups:
//           landing.proof.simpleMax.{headline,accent,simple,max,either}
//           pricing.faq.losePhone.{question,intro,simple,max,either,secureEnclave}
//           crypto.q.losePhone.{question,intro,simple,max,either,secureEnclave}
//           enrol.shareUrl.twoRoutes.{headline,simple,max,urlsNote}
//         Cloned into de/fr/pt/zh-Hans/hi as machine-translation starting
//         point (TODO: native review). Stops non-EN visitors seeing
//         mid-paragraph language switches in these blocks.
// @version 0.5.0 @date 2026-06-02
// 0.5.0 — Daniel 2026-06-02: hero/pricing-eyebrow keys added for the new
//         copy that landed in Landing.tsx 0.20.0 (Phase-2 multi-change pass
//         A/B/C — video perf + Managed-mode swap + lang pass). All new
//         strings are now keyed via useT(). Block of additions:
//           hero.h1, hero.tagline, hero.h2,
//           hero.mainTagline, hero.subTagline,
//           hero.tiles.{crypto,documents,digital,hidden,legacy,ops}.{title,bullet1..bullet4},
//           hero.phonePinHook,
//           hero.closer.{p1,p2,p3},
//           hero.cta.{getStarted,seeMath},
//           hero.video.{title,subline,cta},
//           hero.shamir.{prefix,accent,suffix},
//           hero.managed.tiles.{signin,provision,heirEmail,sameCrypto,escape,audience}.{title,body},
//           hero.managed.closer, hero.managed.notifyButton,
//           pricing.priced-to-protect (eyebrow — wired into Pricing.tsx in
//           a follow-up, key shipped now so the lang sweep is one round).
// 0.4.0 — Daniel 2026-06-02: re-review sweep — 2 further orphans removed
//         from all 6 locales: `footer.updates` (Footer.tsx never renders it —
//         renders tagline/howItWorks/privacy/terms/guide/heir/foundBug/rough
//         only) and `nav.connect` (ConnectWallet in TopNav.tsx uses hard-coded
//         English labels with no t() call).
// 0.3.0 — Daniel 2026-06-02: orphan-key sweep after the human-voice rewrite
//         pass on Landing.tsx (0.13.0→0.16.0). The hero block was rewritten
//         as canonical English plain JSX (per Daniel's locked Option-A copy),
//         the "Under the hood" tech tiles were CUT from the homepage, and
//         the hero diagram was deprecated in favour of FSMDiagram +
//         ShamirPolyViz embeds. The following keys were no longer rendered
//         from any live JSX (only in src/components/_archive/) — REMOVED
//         from all 6 locales this round:
//           hero.h1a, hero.h1b, hero.h1c, hero.h1d, hero.lede, hero.fsm,
//           hero.neverSees, hero.ctaEnrol, hero.ctaSee
//           card.airgap.k/t/b, card.threshold.k/t/b, card.ipfs.k/t/b,
//           card.recover.k/t/b
//           tech.title, tech.subtitle
//           diag.localOnly, diag.yourSeed, diag.seedWords, diag.splitEncrypt,
//           diag.sbt, diag.nokWallet, diag.deadman
//         hero.chip is RETAINED — still rendered next to the "HI not AI" pill.
//         card.readHow is RETAINED — still rendered on the standouts row.
//         nav.whitelabel + nav.corporate added to all 5 non-English locales
//         (brand strings; mirror EN verbatim).
//
// 0.2.0 — English — the source of truth + key schema. Every other locale
//         mirrors these exact keys. Scope = the marketing FUNNEL only
//         (Landing standouts/proofs/soul/more/keyless/ins blocks, top nav,
//         footer, lang selector). Everything deeper stays literal English
//         with <TermTip> hover-translations + the <PageLangNotice> box.
//         Technical / proper-noun tokens (ARGON2id, SLIP-39, ERC-5192,
//         Polygon, provider names…) are deliberately NOT keyed — they are
//         universal.

export const en: Record<string, string> = {
  // hero — small "HI not AI" framing pill.
  "hero.chip": "Human Intelligence in control. Zero AI on your seed: just open, audited maths",

  // 0.5.0 — Hero H1 / taglines / H2 (lifted from Landing.tsx 0.13.0 canonical
  // English, now keyed for all 6 locales per the 0.20.0 lang pass).
  "hero.h1": "Your seed phrase. Your will. Your digital life.",
  "hero.tagline": "Beyond the wallet, above the password manager, before the lawyer.",
  "hero.h2": "Back up & inherit any wallet — Bitcoin, Solana, Ethereum, any chain.",
  "hero.mainTagline": "Lose nothing important — to time, to memory, to the wrong people.",
  "hero.subTagline": "Self-Custody for crypto-native users live today. Managed-mode for everyone else, coming soon.",

  // Hero tile grid (Self-Custody) — 6 categories of what people store.
  "hero.tiles.crypto.title": "Crypto & finance",
  "hero.tiles.crypto.bullet1": "Seed phrases",
  "hero.tiles.crypto.bullet2": "Hardware wallet recovery sheets",
  "hero.tiles.crypto.bullet3": "2FA backup codes",
  "hero.tiles.crypto.bullet4": "Exchange and bank logins",
  "hero.tiles.documents.title": "Documents & docs",
  "hero.tiles.documents.bullet1": "Wills and deeds",
  "hero.tiles.documents.bullet2": "Insurance policies",
  "hero.tiles.documents.bullet3": "Medical directives",
  "hero.tiles.documents.bullet4": "Passport scans",
  "hero.tiles.digital.title": "Digital life",
  "hero.tiles.digital.bullet1": "Your password manager master password",
  "hero.tiles.digital.bullet2": "Apple ID, Google, Facebook (so heirs can memorialise the accounts)",
  "hero.tiles.digital.bullet3": "The subscription list nobody else has",
  "hero.tiles.hidden.title": "Hidden places",
  "hero.tiles.hidden.bullet1": "A photo of where the safe-deposit key actually is",
  "hero.tiles.hidden.bullet2": "Spare keys",
  "hero.tiles.hidden.bullet3": "Storage unit gate codes",
  "hero.tiles.legacy.title": "Personal legacy",
  "hero.tiles.legacy.bullet1": "Letters to specific people",
  "hero.tiles.legacy.bullet2": "Family recipes",
  "hero.tiles.legacy.bullet3": "Voice notes",
  "hero.tiles.legacy.bullet4": "Stories worth passing on",
  "hero.tiles.ops.title": "Operational",
  "hero.tiles.ops.bullet1": "Server and API keys",
  "hero.tiles.ops.bullet2": "Business contacts",
  "hero.tiles.ops.bullet3": "The runbook only you remember",

  // Hero "phone PIN" hook + 3-paragraph closer + 2 CTA buttons.
  "hero.phonePinHook": "And yes — your phone PIN doesn't get them into your cloud. We'll show you what does.",
  "hero.closer.p1": "Everything happens in your browser. We don't store your seed. We can't — there's no API call that sends it to us.",
  "hero.closer.p2": "Recover it yourself when a wallet goes missing. Restore it after a device dies.",
  "hero.closer.p3": "Or hand it to the person you named, automatically, if you ever stop checking in.",
  "hero.cta.getStarted": "Get started",
  "hero.cta.seeMath": "See the math",

  // Hero end-to-end pipeline video section.
  "hero.video.title": "The whole proof, in motion.",
  "hero.video.subline": "12 steps end-to-end. Every primitive, every airgap moment, every online crossing. Then run the math yourself.",
  "hero.video.cta": "Prove it →",

  // Shamir closing statement (anchor tagline of the proofs wall). Split
  // into prefix / accent / suffix so the gradient highlight on
  // "mathematically impossible to break" survives translation — each
  // locale moves the accent phrase to whatever position reads naturally.
  "hero.shamir.prefix": "Below your recovery threshold, NoKLock's secret-split is ",
  "hero.shamir.accent": "mathematically impossible to break",
  "hero.shamir.suffix": ". Not with today's computers. Not with a quantum one. Not ever.",

  // Hero Managed-mode tile grid (NEW 0.5.0 — the 6 tiles that swap in
  // when the visitor clicks the Managed pivot tab).
  "hero.managed.tiles.signin.title": "Email or passkey sign-in",
  "hero.managed.tiles.signin.body": "No wallet to set up. Use your normal sign-in.",
  "hero.managed.tiles.provision.title": "We provision the wallet",
  "hero.managed.tiles.provision.body": "Behind the scenes. You never see a seed phrase — and neither do we. The key is held by Privy (our managed-wallet provider), never by us; by Privy's design, no single party can sign without you.",
  "hero.managed.tiles.heirEmail.title": "Heir-claim by email",
  "hero.managed.tiles.heirEmail.body": "Your designated heir clicks an email link to claim. No crypto literacy required (also applies to self-custody model).",
  "hero.managed.tiles.sameCrypto.title": "Same crypto under the hood",
  "hero.managed.tiles.sameCrypto.body": "Argon2id + Shamir + AEAD. Vault contents are still self-custodial. Only the wallet layer is managed.",
  "hero.managed.tiles.escape.title": "Self-custody escape hatch",
  "hero.managed.tiles.escape.body": "Export your wallet keys any time. Migrate to self-custody whenever you want.",
  "hero.managed.tiles.audience.title": "For the people in your life",
  "hero.managed.tiles.audience.body": "Who would never set up MetaMask — but still have a digital life worth leaving behind.",
  "hero.managed.closer": "Same vault math. Easier wallet. Same honesty about what we do and don't see.",
  "hero.managed.notifyButton": "Notify me when ready",

  // Pricing eyebrow (key landed now for the lang sweep; wired into
  // routes/Pricing.tsx in a follow-up).
  "pricing.priced-to-protect": "Priced to protect, not to extract.",

  // top-4 SIGNATURE standouts (the unique-in-market differentiators —
  // promoted above the tech tiles per the 2026-05-20 Option-B restructure)
  "stand.duress.k": "Duress-\nproof",
  "stand.duress.t": "Two passwords, two vaults.",
  "stand.duress.b": "Optional decoy vault with its own password. Under coercion you hand over the decoy — they see a believable throwaway, your real vault stays hidden. No competitor offers this.",
  "stand.social.k": "Layered defense",
  "stand.social.t": "Five protections, not one.",
  "stand.social.b": "Air-gapped browser-only encryption · AEAD-sealed per-share with tamper detection · Ed25519-signed manifest so one flipped bit fails restore · spoof-proof on-chain attestation for heir claims · M-of-N voting so phishing one heir doesn't unlock anything.",
  "stand.noklockproof.k": "NoKLock-proof",
  "stand.noklockproof.t": "If we vanish, it still works.",
  "stand.noklockproof.b": "Recovery is 100% client-side (your shares + master password). Inheritance is on-chain (Polygon + Chainlink). Selfheartbeat survives even if NoKLock disappears. Verified on PolygonScan, you can audit it yourself.",
  "stand.selfcustody.k": "Self-custodial",
  "stand.selfcustody.t": "Your keys. Your data. Always.",
  "stand.selfcustody.b": "NoKLock never sees or touches your seed, your shares, or your data. The chain holds hashes and pointers, never plaintext. No pooled honeypot, no admin override, no recovery hostage. You hold everything.",

  // dedicated soulbound NFT section — between the standouts and the
  // proofs grid. Holds the 3 TrustBlock cards inside it (License + SBT
  // + Oracle) as the on-chain provenance evidence.
  "soul.title": "Soulbound NFTs — your inheritance, on-chain",
  "soul.body": "When you designate a next-of-kin, NoKLock mints one soulbound Activation NFT (ERC-5192) on Polygon — the dead-man's-switch trigger, one heir, one token. M-of-N quorum vaults add a Voting NFT per heir. Soulbound means non-transferable — once minted, the token cannot be sold, moved, stolen, or seized. This is a rare-in-production use of the ERC-5192 standard, and the only known production use for crypto-inheritance.",
  "soul.bodyB": "All three contracts above are source-verified on PolygonScan — click any address to read the deployed code. The SBT is the actual inheritance trigger; License pulls only the USDC you explicitly approve; Oracle's dead-man's switch is forwarder-only.",
  "soul.scoreLabel": "Basic SolidityScan review · zero pooled funds, zero key custody, intentionally tiny attack surface",

  // tech tile shared label — still used on the standouts row deep-link
  "card.readHow": "Read how →",

  // proof, not promises
  "proof.title": "Proof, not promises",
  "proof.loss.k": "Loss-proof",
  "proof.loss.b": "Lost wallet, dead phone, a lost share — any threshold of the remaining shares plus your master password brings it back. The split is your safety net, not just your inheritance trigger.",
  "proof.tamper.k": "Tamper-proof",
  "proof.tamper.b": "Every share carries an AEAD tag + the manifest is Ed25519-signed. Touch one byte, restore refuses.",
  "proof.spoof.k": "Spoof-proof",
  "proof.spoof.b": "Soul-bound tokens cannot be transferred. An attacker can't impersonate your designated heir.",
  "proof.inherit.k": "Inheritance",
  "proof.inherit.b": "If you stop checking in, your designated next of kin inherits automatically. No lawyer, no probate friction.",
  "proof.airgap.k": "Air-gapped",
  "proof.airgap.b": "Enrol in airplane mode. The crypto core never needs a network.",
  "proof.ai.k": "AI-resistant",
  "proof.ai.b": "Your seed never goes near a language model. No AI training, no prompts, no inference. Just deterministic maths.",
  // 3 new proofs added 2026-05-20 to complete the 3×3 wall (signature
  // differentiators, mirror the top-4 standouts in compact form).
  "proof.duress.k": "Duress-proof",
  "proof.duress.b": "Optional decoy vault with its own master password. Under coercion you reveal the decoy — they see a believable throwaway, the real vault stays hidden.",
  "proof.social.k": "Social-engineering-proof",
  "proof.social.b": "Multi-NoK M-of-N quorum from independent wallets. A single coerced or phished NoK cannot release alone — that single one fails the quorum check.",
  "proof.noklockproof.k": "NoKLock-proof",
  "proof.noklockproof.b": "Recovery is 100% client-side. Inheritance runs on-chain via Polygon + Chainlink. Self-heartbeat survives even if NoKLock disappears tomorrow.",
  "proof.fullinfo": "Full info — architecture, providers, security model, competitor analysis →",

  // more than crypto
  "more.title": "More than crypto — now live",
  "more.body": "Sealed letters, document vault and image vault are all shipped today. Compose a sealed letter, encrypt a will, scan family papers, lock away a photo archive — same split-encrypt-distribute-inherit pipeline as your crypto seed, all running in your browser.",
  "more.cta": "Open your vaults →",

  // not keyless
  "keyless.titleA": "Not “keyless”.",
  "keyless.titleB": "Honest self-custody.",
  "keyless.body": "Other wallets pretend you don't have keys — most of those are custodial behind the polish. NoKLock honours your seed phrase, then makes it hard to lose, easy to recover, and ready to inherit.",
  "keyless.cta": "Why not keyless →",

  // insurance
  "ins.titleA": "We don't carry insurance.",
  "ins.titleB": "We don't need to.",
  "ins.body": "Casa, Ledger Recover and Vault12 carry insurance because they hold your keys. Insurance is their apology for the fact they can lose them. NoKLock never touches your keys — there's nothing for us to lose. That's the difference.",

  // top nav
  "nav.dashboard": "Dashboard",
  "nav.vaults": "Vaults",
  "nav.restore": "Restore",
  "nav.proveit": "Prove It",
  "nav.nok": "NoK designation",
  "nav.heartbeat": "Heartbeat",
  "nav.deadman": "Dead-man's switch",
  "nav.livemans": "Live-Man's switch (alerts)",
  "nav.pricing": "Pricing",
  "nav.refer": "Refer & Earn",
  "nav.info": "Info",
  "nav.whitelabel": "NoKLock.white",
  "nav.corporate": "Asserro (NoKLock Enterprise)",
  "nav.settings": "Settings",
  "nav.advanced": "Advanced",
  "nav.disconnect": "Disconnect",
  "nav.reconnecting": "Restoring session…",

  // refund — /refund route (wallet-gated). Two-mode page: 14-day cooling-off
  // form for fiat (Paddle) purchases, case-by-case credit notice for crypto
  // purchases. Both modes link to /refund-policy.
  "refund.h1": "Request a refund",
  "refund.subtitle": "NoKLock refunds — statutory cooling-off for fiat purchases; case-by-case credit for crypto purchases.",
  "refund.policyLink": "Read the full Refund Policy →",
  "refund.connect.title": "Connect the wallet that paid",
  "refund.connect.body": "Refund eligibility is keyed to the wallet that minted your licence. Connect that same wallet to see your refund options.",
  "refund.loading": "Looking up your subscription…",
  "refund.error.title": "Could not load subscription",
  "refund.error.fallback": "If this keeps failing, email refunds@noklock.app with your wallet address and we will sort it manually.",
  "refund.summary.title": "Your subscription",
  "refund.summary.tier": "Tier",
  "refund.summary.method": "Payment method",
  "refund.summary.method.paddle": "Card / fiat (Paddle)",
  "refund.summary.method.crypto": "Crypto (USDC on Polygon)",
  "refund.summary.method.unknown": "Unknown",
  "refund.summary.subscribedAt": "Subscribed at",
  "refund.summary.eligibleUntil": "Refund eligible until",
  "refund.summary.requestedAt": "Refund requested at",
  "refund.summary.status": "Refund status",
  "refund.fiat.title": "14-day cooling-off refund (fiat purchase)",
  "refund.fiat.intro": "You paid by card via Paddle and you are still within the statutory 14-day cooling-off window. You can request a full refund here — no questions asked.",
  "refund.fiat.reason.label": "Reason (optional but helpful)",
  "refund.fiat.reason.placeholder": "Tell us why so we can fix it — e.g. didn't work for me, wrong tier, changed my mind.",
  "refund.fiat.confirm": "I confirm I am the wallet owner and I want to cancel my subscription and receive a refund to the original payment method.",
  "refund.fiat.submit.idle": "Submit refund request",
  "refund.fiat.submit.signing": "Sign in your wallet…",
  "refund.fiat.submit.submitting": "Submitting…",
  "refund.fiat.signNote": "Your wallet will be asked to sign a plain message to prove ownership. No transaction is sent on-chain; signing is free.",
  "refund.fiat.success.title": "Refund request received",
  "refund.fiat.success.body": "Paddle initiates the refund within 1-2 business days; funds arrive at your original payment method within 14 calendar days (issuer-dependent, typically 3-10 business days for cards).",
  "refund.fiat.success.note": "You will receive a confirmation email from our payment processor when funds are released to your card.",
  "refund.crypto.title": "Crypto purchases are on-chain final",
  "refund.crypto.body": "Crypto purchases: on-chain transactions are final but case-by-case credit may apply — contact refunds@noklock.app.",
  "refund.crypto.note": "Include your wallet address, the transaction hash of the USDC payment, and a one-line description of what went wrong. We aim to reply within 2 business days.",
  "refund.used.title": "Refund already on file",
  "refund.used.body": "A refund request is already on record for this wallet. Any further questions: refunds@noklock.app.",
  "refund.contact.button": "Contact refunds@noklock.app",
  "refund.policy.button": "Read the Refund Policy",

  // 0.6.0 — simple-vs-max-security framing on the Landing proofs wall
  // (Landing.tsx 0.22.0). Sits above the Shamir closing tagline; anchors
  // the SIMPLE route first so visitors don't bounce off paranoia copy.
  "landing.proof.simpleMax.headline": "Three shares scattered across your own folders",
  "landing.proof.simpleMax.accent": "already beats a sticky note or an encrypted text file.",
  "landing.proof.simpleMax.simple": "Simple route: pick three folders on your laptop or phone.",
  "landing.proof.simpleMax.max": "Maximum security: spread them across different drives, clouds, and providers you already use.",
  "landing.proof.simpleMax.either": "Either way — extreme protection, simplified.",

  // 0.6.0 — Pricing FAQ "Do I lose access if my phone dies?" (Pricing.tsx
  // 0.9.6). Same simple-vs-max routing; second paragraph is the
  // Secure-Enclave structural-difference closer.
  "pricing.faq.losePhone.question": "Do I lose access if my phone dies?",
  "pricing.faq.losePhone.intro": "No. Your seed isn't stored on your phone. It's encrypted, Shamir-split into shares (3-of-5 by default), and scattered across the storage YOU pick.",
  "pricing.faq.losePhone.simple": "Simple route: three folders on your laptop or phone — already safer than a sticky note or an encrypted text file.",
  "pricing.faq.losePhone.max": "Maximum security: spread them across different cloud accounts, IPFS, Arweave, multiple devices.",
  "pricing.faq.losePhone.either": "Either way, you lose any one drop and the rest still recover the seed.",
  "pricing.faq.losePhone.secureEnclave": "That's the structural difference from hardware-wallet-style products. Their seed is locked inside a Secure Enclave / StrongBox key that cannot be exported from the chip — that's what makes the chip secure and what makes their seed die with the device. They patch this with paper-backup phrase rituals. NoKLock removes the single point of failure instead of papering over it.",

  // 0.6.0 — CryptoInheritance AEO Q "What happens if I lose my phone?"
  // (CryptoInheritance.tsx 0.3.1). Parallel structure to pricing.faq.losePhone.
  "crypto.q.losePhone.question": "What happens if I lose my phone?",
  "crypto.q.losePhone.intro": "Nothing fatal. Your seed doesn't live on your phone — it lives in encrypted Shamir shares scattered across whatever storage you picked at enrol.",
  "crypto.q.losePhone.simple": "Simple route: three folders on your own devices — already safer than a sticky note in a book or an encrypted text file on your desktop.",
  "crypto.q.losePhone.max": "Maximum security: spread the shares across different cloud accounts, IPFS, Arweave, multiple drives.",
  "crypto.q.losePhone.either": "Either way, lose any one drop and the rest still recover the seed.",
  "crypto.q.losePhone.secureEnclave": "This is the structural difference from hardware-wallet-style products. Their seed is locked inside one device; lose it without the paper backup and you're done. NoKLock's seed is mathematically distributed before any device touches it as a recoverable artifact.",

  // 0.6.0 — Enrol Step B "Two routes" simple-vs-max callout (Enrol.tsx
  // 2.13.0). Surfaces the spectrum before users see the share-URL fields
  // so they don't bounce off "need an IPFS account" complexity.
  "enrol.shareUrl.twoRoutes.headline": "Two routes — pick what fits you today",
  "enrol.shareUrl.twoRoutes.simple": "Simple: put each share file in a different folder on your laptop, phone, USB drive, or wherever you already keep files. Leave the URL field blank below. This is already dramatically safer than a sticky note or an encrypted text file — lose any one folder and the rest still recover the seed.",
  "enrol.shareUrl.twoRoutes.max": "Maximum security: put each share in a different cloud account (Drive, Dropbox, OneDrive, IPFS, Arweave… see the recommended list) and paste the \"anyone with the link\" URL below. That separation is the whole point of the threshold split: one stolen account leaks only one share, so your vault stays safe. You + your next-of-kin can fetch shares remotely instead of needing every file on hand.",
  "enrol.shareUrl.twoRoutes.urlsNote": "URLs are optional in both routes. NoKLock stores only the URL (locally in this browser, nothing sent anywhere); the share files themselves never leave your control.",

  // 0.7.0 — Pricing rework: tier-box + tabs + summary block copy. Wired
  // into Pricing.tsx by Agent 1 via useT(). Two-path framing (Self-custody
  // vs Managed NL-2), 5 tabs, 3 tiers (Free / Standard / Premium), SKU
  // labels, founder-pricing note.
  "pricing.summary.headline": "Two access paths to the same store + restore vault",
  "pricing.summary.body": "Self-custody — you hold the keys. Managed — we hold a Privy embedded wallet for you (coming soon, NL-2). Three tiers across both: Free / Standard / Premium. Founder pricing on all paid tiers — first 10,000 paid licences each side.",
  "pricing.tabs.selfCustody": "Self-custody",
  "pricing.tabs.managed": "Managed (coming soon)",
  "pricing.tabs.compare": "Compare both",
  "pricing.tabs.enterprise": "Enterprise",
  "pricing.tabs.faq": "FAQ",
  "pricing.tier.free.name": "Free",
  "pricing.tier.standard.name": "Standard",
  "pricing.tier.premium.name": "Premium",
  "pricing.sku.annual": "Annual",
  "pricing.sku.lifetime": "Lifetime",
  "pricing.sku.autorenew": "(auto-renews via Paddle)",
  "pricing.managed.comingSoon": "Managed mode coming soon (NL-2)",
  "pricing.managed.subtitle": "Sign in with Google / Apple / email. NoKLock holds the embedded wallet for you. Self-custody users unaffected.",
  "pricing.lifetime.tagline": "Pay once. Never renew.",
  "pricing.founder.label": "Founder pricing — first 10,000 paid licences each side. Contract-enforced for self-custody, Form-B-tracked for managed.",
  "pricing.modeLabel.self": "Self-custody — you hold the keys",
  "pricing.modeLabel.managed": "Managed — Privy embedded wallet",

  // 0.8.0 — Pricing round-2 copy: buy-once / founder accordion + primary mode
  // selector + bottom summary block. Wired into Pricing.tsx round-2 build.
  "pricing.accordion.buyOnce.title": "Buy once. Use forever. No subscription on your survival.",
  "pricing.accordion.buyOnce.body": "We've seen the market: $10/mo here, $29/mo there, annual subscriptions that quietly auto-bill until your card expires (and then your heirs inherit the renewal too). We don't do that. Pick annual if you want, but the headline option is Lifetime: pay once, never think about it again.",
  "pricing.accordion.founder.title": "Founder pricing",
  "pricing.accordion.founder.body": "Founder pricing is a contract- and program-enforced discount for the first 10,000 paid licences on EACH side (self-custody + managed). You qualify automatically — no signup needed. Once a side reaches its 10,000, that side's price steps up to the regular tier price. Both counters are independent.",
  "pricing.primary.chooseMode": "Choose Model…",
  "pricing.primary.mode.self": "Self-custody",
  "pricing.primary.mode.managed": "Managed — Coming soon NL-2",
  "pricing.primary.currency": "Currency",
  "pricing.primary.buy": "Buy",
  "pricing.primary.getStarted": "Get started",
  "pricing.primary.founder": "Founder",
  "pricing.bottom.headline": "Two access paths to the same store + restore vault.",
  "pricing.bottom.selfRow": "Self-custody. You hold the keys. On-chain License NFT, pay in USDC on Polygon. NoKLock cannot access your data.",
  "pricing.bottom.managedRow": "Managed. We hold a Privy embedded wallet for you — sign in with Google / Apple / email, passkey unlock, fiat billing via Paddle. Coming with NL-2.",
  "pricing.bottom.tiersLine": "Three tiers across both: Free / Standard / Premium. Same prices either side. Founder pricing on every paid tier — first 10,000 paid licences each side, contract-enforced for self-custody, Form-B–tracked for managed.",
  "pricing.bottom.inheritanceOptional": "Inheritance is optional. Most users come for store + restore — pass-down to next-of-kin is a feature they turn on later, not the price of entry.",
  "pricing.bottom.referLine": "Refer others and earn a share on every paid licence they mint.",

  // 0.9.0 — Tier-gating UX badges. Surfaced on the EnrolChooser ChoiceCards
  // + the VaultUseCases catalog so Free / Standard browsers can see at a
  // glance which vault kinds require a paid tier. The amber "Premium" pill
  // that already exists on the dense row (EnrolChooser surface) now also
  // appears on the default 6-card grid and accordion header.
  "tier.badge.standardPlus": "Standard+",
  "tier.badge.premiumPlus": "Premium+",
  "tier.requires.standard": "Requires Standard — upgrade at /pricing",
  "tier.requires.premium": "Requires Premium — upgrade at /pricing",
  "tier.upgrade.cta": "Upgrade",

  // footer
  "footer.tagline": "Self-custodial cryptographic recovery for everything you can't afford to lose.",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms of Use",
  "footer.howItWorks": "How it works",

  // Google Play download surfaces (footer / settings / download route).
  // Flag-gated by PLAY_STORE_AVAILABLE — only visible once the listing is live.
  "footer.getAndroidApp": "Get the app",
  "settings.getAndroidApp.title": "Get the Android app",
  "settings.getAndroidApp.body": "Install NoKLock from Google Play for a home-screen app — same site, fullscreen, auto-updates.",
  "download.title": "Get the NoKLock app",
  "download.androidNote": "tap the badge above to install NoKLock from Google Play.",
  "download.iosNote": "open noklock.app in Safari → tap Share → Add to Home Screen.",
  "download.comingSoon": "Coming soon to Google Play",

  "lang.label": "Language",

  // 0.12.0 — Homepage "Day-1 honest note" launch banner
  // (Landing.tsx LaunchTransparencyBanner). The 154/154 and 0.8.35 figures
  // are injected as untranslated interpolations at the callsite, so the body
  // here carries {tests} / {solc} placeholders.
  "landing.day1.badge": "Day-1 honest note",
  "landing.day1.body": "NoKLock just launched. The contracts are audited. The tests pass ({tests} on Solidity {solc}). Two independent AI review passes are done. The first weeks of any real product still surface rough edges, copy that misses, flows we didn't anticipate. Tell us when you find one.",
  "landing.day1.bug": "Found a bug? Bounty →",
  "landing.day1.rough": "Something rough? How to tell us →",
  "landing.day1.email": "Email us →",
  "landing.day1.dismissForever": "Dismiss forever",

  // 0.12.0 — Homepage "What people actually use it for" use-cases carousel.
  "home.useCases.leadIn": "What people actually use it for",

  // 6 vault use-case category labels (VaultUseCases catalog). Keyed by the
  // canonical category id so both the carousel pill and the /info + /manual
  // catalog read the same translation.
  "vuc.cat.crypto-finance": "Crypto & Finance Keys",
  "vuc.cat.digital-identity": "Digital Identity & Accounts",
  "vuc.cat.hidden-places": "Hidden Places & Physical Hints",
  "vuc.cat.vital-documents": "Vital Documents",
  "vuc.cat.final-wishes": "Final Wishes & Personal Letters",
  "vuc.cat.recovery-codes": "Recovery Codes & Backup Secrets",

  // 26 carousel cards (title + blurb). Keyed by the carousel card id
  // (categoryId:pickId). Brand/product names (Ledger, MetaMask, 1Password…)
  // stay verbatim inside the translated sentences.
  "vuc.card.crypto-finance:hw-wallet.title": "Hardware wallet seed",
  "vuc.card.crypto-finance:hw-wallet.blurb": "The 12 or 24 words behind your Ledger, Trezor, or Tangem.",
  "vuc.card.crypto-finance:soft-wallet.title": "MetaMask / Rabby recovery",
  "vuc.card.crypto-finance:soft-wallet.blurb": "Soft-wallet seed phrase and any multisig signer key.",
  "vuc.card.crypto-finance:exchange-codes.title": "Exchange recovery codes",
  "vuc.card.crypto-finance:exchange-codes.blurb": "The printed backup codes Coinbase, Kraken, or Binance gave you at signup.",
  "vuc.card.crypto-finance:pw-manager.title": "Password-manager master",
  "vuc.card.crypto-finance:pw-manager.blurb": "Unlocks the rest of your financial life — 1Password, Bitwarden, Dashlane.",
  "vuc.card.crypto-finance:2fa-seed.title": "2FA seed export",
  "vuc.card.crypto-finance:2fa-seed.blurb": "Google Authenticator / Authy / Aegis seed list — survives a lost phone.",
  "vuc.card.digital-identity:apple-google.title": "Apple ID + Google account",
  "vuc.card.digital-identity:apple-google.blurb": "Root logins that gate your phone, photos, contacts, and email.",
  "vuc.card.digital-identity:social-credentials.title": "Social media credentials",
  "vuc.card.digital-identity:social-credentials.blurb": "Memorialise, post a final note, or close per each platform's policy.",
  "vuc.card.digital-identity:domains.title": "Domain registrar logins",
  "vuc.card.digital-identity:domains.blurb": "Domains lapse silently — often impossible to recover after the fact.",
  "vuc.card.digital-identity:cloud-storage.title": "Cloud storage accounts",
  "vuc.card.digital-identity:cloud-storage.blurb": "Where decades of photos, documents, and personal projects actually live.",
  "vuc.card.hidden-places:safe-deposit-photo.title": "Safe deposit box photo",
  "vuc.card.hidden-places:safe-deposit-photo.blurb": "Branch, box number, and where the key + signature card live at home.",
  "vuc.card.hidden-places:home-safe.title": "Home safe location + combo",
  "vuc.card.hidden-places:home-safe.blurb": "Annotated photo with the combination written on the back.",
  "vuc.card.hidden-places:hw-wallet-hiding.title": "Where the hardware wallet hides",
  "vuc.card.hidden-places:hw-wallet-hiding.blurb": "Back of which drawer, inside which book, under which floorboard.",
  "vuc.card.hidden-places:spare-keys.title": "Spare key locations",
  "vuc.card.hidden-places:spare-keys.blurb": "The magnetic box under the wheel arch — useless if its location dies with you.",
  "vuc.card.hidden-places:hidden-cash.title": "Hidden cash & heirlooms",
  "vuc.card.hidden-places:hidden-cash.blurb": "The envelope behind the painting, the floor-safe under the rug.",
  "vuc.card.vital-documents:will-trust.title": "Signed will & trust deed",
  "vuc.card.vital-documents:will-trust.blurb": "The actual signed PDFs — not just “it’s at the lawyer’s”.",
  "vuc.card.vital-documents:insurance.title": "Insurance policy PDFs",
  "vuc.card.vital-documents:insurance.blurb": "Life, property, and key-person — so no claimable policy gets missed.",
  "vuc.card.vital-documents:property-deeds.title": "Property deeds & titles",
  "vuc.card.vital-documents:property-deeds.blurb": "Proof of ownership that turns physical assets into transferable ones.",
  "vuc.card.vital-documents:tax-returns.title": "Recent tax returns",
  "vuc.card.vital-documents:tax-returns.blurb": "Last 3–7 years + the accountant’s direct contact.",
  "vuc.card.final-wishes:personal-letters.title": "Letters to each loved one",
  "vuc.card.final-wishes:personal-letters.blurb": "The things you’d have said in person if there had been time.",
  "vuc.card.final-wishes:funeral-prefs.title": "Funeral & burial wishes",
  "vuc.card.final-wishes:funeral-prefs.blurb": "Cremation vs burial, the music, the readings — your call, not theirs.",
  "vuc.card.final-wishes:ethical-will.title": "Ethical will",
  "vuc.card.final-wishes:ethical-will.blurb": "The values, lessons, and stories you want the next generation to carry.",
  "vuc.card.final-wishes:pet-care.title": "Pet-care wishes",
  "vuc.card.final-wishes:pet-care.blurb": "Who takes the dog, what the cat eats, the vet’s name and chip number.",
  "vuc.card.recovery-codes:printed-2fa.title": "Printed 2FA recovery codes",
  "vuc.card.recovery-codes:printed-2fa.blurb": "Google, Microsoft, GitHub, AWS, banking — the ones you tucked away.",
  "vuc.card.recovery-codes:yubikey.title": "YubiKey registration list",
  "vuc.card.recovery-codes:yubikey.blurb": "Serials, accounts enrolled, and where the backup key is kept.",
  "vuc.card.recovery-codes:disk-encryption.title": "Disk encryption keys",
  "vuc.card.recovery-codes:disk-encryption.blurb": "BitLocker, FileVault, LUKS — without these the laptop is a brick.",
  "vuc.card.recovery-codes:gpg-age.title": "GPG / Age private keys",
  "vuc.card.recovery-codes:gpg-age.blurb": "For anyone who actually uses end-to-end encryption.",

  // 0.12.0 — Info-dropdown menu items (TopNav desktop). NoKLock.white +
  // Asserro item reuse nav.whitelabel / nav.corporate (already keyed).
  "nav.info.appInfo": "App info",
  "nav.info.appUpdates": "App updates",
  "nav.info.enrolWalkthrough": "Enrol walkthrough",
  "nav.info.articles": "NoKLock Articles",

  // 0.13.0 — Landing FSM box headline + subtitle (Landing.tsx — was inline EN).
  "landing.fsm.headline": "Stronger trust than any service offers",
  "landing.fsm.subtitle": "Your vault is in exactly one state at any time. That state lives on Polygon, not on our server.",

  // 0.13.0 — FSMDiagram.tsx state-machine SVG. State NAMES translated per
  // Daniel; on-chain code identifiers (function signatures + anchor
  // expressions like manifestHash, SBT.balanceOf(heir)) stay literal in JSX.
  "fsm.title": "NoKLock vault lifecycle · finite state machine on Polygon",
  "fsm.subtitle": "every state on-chain · every transition cryptographically signed · verify your vault's state any time, no login",
  // prose transition labels (the code calls designateNoK()/heartbeat()/etc. stay literal in JSX)
  "fsm.transition.timeElapses": "time elapses",
  "fsm.transition.graceElapses": "grace elapses",
  // 7 happy-path state names + descriptions
  "fsm.state.enrolled.name": "ENROLLED",
  "fsm.state.enrolled.desc": "vault built locally",
  "fsm.state.heirDesignated.name": "HEIR_DESIGNATED",
  "fsm.state.heirDesignated.desc": "Activation NFT minted (+ Voting for quorum)",
  "fsm.state.alive.name": "ALIVE",
  "fsm.state.alive.desc": "heartbeat fresh",
  "fsm.state.dueSoon.name": "DUE_SOON",
  "fsm.state.dueSoon.desc": "grace window draining",
  "fsm.state.inGrace.name": "IN_GRACE",
  "fsm.state.inGrace.desc": "awaiting performUpkeep",
  "fsm.state.activated.name": "ACTIVATED",
  "fsm.state.activated.desc": "switch has fired",
  "fsm.state.claimed.name": "CLAIMED",
  "fsm.state.claimed.desc": "heir holds the SBT",
  // legend
  "fsm.legend.happyPath": "happy path — flowing teal",
  "fsm.legend.heartbeat": "heartbeat received → back to ALIVE",
  "fsm.legend.sideStates": "side-state branches",
  "fsm.legend.anchorNote": "Each state shows its on-chain anchor (the line beneath). The dashes flow continuously; verify any vault's live state on PolygonScan.",
};
