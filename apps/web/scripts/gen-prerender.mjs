// gen-prerender.mjs — emit per-route HTML files so AI bots without JS
// execution (GPTBot, OAI-SearchBot, ClaudeBot, etc.) see meaningful content
// per URL instead of the empty React shell.
//
// Approach: read dist/index.html (produced by `vite build`), and for each
// public marketing route emit a copy at dist/<route>/index.html with:
//   - route-specific <title>
//   - route-specific <meta name="description">
//   - route-specific <link rel="canonical">
//   - route-specific <noscript> content block (the bot-visible body)
//
// Apache's rewrite rules in .htaccess pick up real files BEFORE falling
// back to the SPA root, so /info → dist/info/index.html naturally. The
// React SPA still hydrates on every route — bots get content, humans get
// the interactive app, both happy.
//
// No headless browser, no new npm deps. Fully additive — if this script
// fails, the regular SPA build at dist/index.html still serves correctly.
// React hydration takes over the moment the bundle loads.
//
// Runs in the `postbuild` step.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, "..", "dist");
const sourceHtml = join(distDir, "index.html");

if (!existsSync(sourceHtml)) {
  console.error("gen-prerender: dist/index.html not found — did vite build run? Skipping.");
  process.exit(0);  // exit 0 = don't fail the build; this is a discoverability bonus
}

const baseHtml = readFileSync(sourceHtml, "utf8");

// Per-route content. Each entry produces a dedicated HTML file at
// dist/<path>/index.html with bot-visible noscript content tailored to
// that page. Content is intentionally compact + factual (the AI extraction
// unit is the paragraph, not the page).
const ROUTES = [
  {
    path: "/info",
    title: "NoKLock — how it works: architecture, contracts, audits, FAQ",
    description: "Six source-verified contracts on Polygon. 154 forge tests on Solidity 0.8.35. Two-pass independent audit. Architecture explainers for the four signature differentiators: Duress-proof, Social-engineering-proof, NoKLock-proof, Self-custodial.",
    noscript: `
      <h1>How NoKLock works — architecture, contracts, audit posture</h1>
      <p>NoKLock is a self-custodial cryptographic vault for crypto seed phrases, sealed letters, documents, and images, with on-chain next-of-kin inheritance via a dead-man's switch on Polygon. The entire system runs on six source-verified smart contracts:</p>
      <ol>
        <li><strong>NoKLockLicense</strong> — ERC-1155 tier licence. The only contract that moves money. Pulls only the USDC the user explicitly approves; treasury + referrer split atomically. Founder pricing for the first 10,000 paid mints contract-enforced.</li>
        <li><strong>NoKLockSBT</strong> — ERC-721 + ERC-5192 soulbound NFTs. Each next-of-kin designation mints one Activation NFT (M-of-N quorum vaults add a Voting NFT per heir) that cannot be transferred, sold, stolen, or seized. Rare-in-production use of the ERC-5192 standard.</li>
        <li><strong>NoKLockOracle</strong> — Chainlink Automation dead-man's switch. Records heartbeats; fires activation only after the user-chosen grace period lapses. <code>performUpkeep</code> is forwarder-only.</li>
        <li><strong>NoKLockRecovery</strong> — M-of-N guardian quorum + time-lock + owner-cancellation window for lost-wallet defence.</li>
        <li><strong>NoKLockEscrow</strong> — Hybrid-E email-NoK. Holds the SBT in trust for an email-designated heir until they complete an EIP-712 server-attested claim, then burns and re-mints to the heir's wallet.</li>
        <li><strong>NoKLockAlerts</strong> — the Live-Man's Switch. A Chainlink log-trigger watches the Recovery contract and pings your pre-registered watcher wallets on-chain (self-funded POL, no NoKLock balance) when a recovery starts against you, so you can cancel within the timelock even if you never open the app.</li>
      </ol>
      <h2>The four signature differentiators</h2>
      <ul>
        <li><strong>Duress-proof (Premium)</strong> — decoy vault with its own master password. Under coercion you reveal the decoy; the attacker decrypts a believable throwaway while your real vault stays cryptographically hidden alongside it.</li>
        <li><strong>Social-engineering-proof</strong> — multi-NoK M-of-N quorum from independent wallets. Phishing or coercing a single heir cannot release the vault.</li>
        <li><strong>NoKLock-proof</strong> — works even if NoKLock disappears. Recovery is 100% client-side; inheritance runs entirely on-chain via Polygon + Chainlink.</li>
        <li><strong>Self-custodial</strong> — NoKLock never sees seeds, shares, master passwords, or vault contents.</li>
      </ul>
      <h2>Audit posture</h2>
      <p>154 automated contract tests on Solidity 0.8.35. Two-pass independent AI audit (round 1: 5 Critical + 9 High + 12 Medium + 10 Low — all 5 Crits + 9 Highs fixed; round 2: 5 follow-up findings on round-1 patches — all fixed). Basic SolidityScan review: License 89.3 / Oracle 90.49 / Escrow 73.0 / SBT 62.12 / Recovery 61.79 / Alerts 61.68 (every Critical/High walked through line-by-line). PolygonScan source-verified for all six contracts. Bug bounty programme live (verified reports earn a free Lifetime licence; criticals also earn USDC).</p>
      <p>Open the full Info page in a JavaScript-capable browser to see the deep tabs (Architecture, FAQ, Shares, Process diagrams, Security, Passkeys, Contracts, Referral, Compliance, Competitors).</p>
    `,
  },
  {
    path: "/pricing",
    title: "NoKLock — pricing: Free, Standard, Premium, Lifetime tiers on Polygon USDC",
    description: "Five tiers paid in USDC directly on Polygon — no subscription processor. Founder pricing for the first 10,000 paid mints, contract-enforced. Lifetime tiers paid once, never expire.",
    noscript: `
      <h1>NoKLock pricing — five tiers, paid in USDC on Polygon</h1>
      <p>NoKLock is paid in Circle native USDC directly on Polygon. No subscription processor, no credit-card relationship. Founder pricing applies to the first 10,000 paid mints across all tiers, contract-enforced, with an automatic step-up to regular price at zero remaining.</p>
      <h2>Tiers</h2>
      <table>
        <thead><tr><th>Tier</th><th>Founder price</th><th>Regular price</th><th>Term</th><th>Key feature</th></tr></thead>
        <tbody>
          <tr><td>Free</td><td>$0</td><td>$0</td><td>Forever</td><td>1 vault, 1 next-of-kin, full crypto core</td></tr>
          <tr><td>Standard</td><td>$99/yr</td><td>$149/yr</td><td>Annual</td><td>Up to 5 NoKs, social-recovery guardians, multi-NoK voting</td></tr>
          <tr><td>Standard Lifetime</td><td>$299 once</td><td>$499 once</td><td>Forever</td><td>Standard features paid once</td></tr>
          <tr><td>Premium</td><td>$199/yr</td><td>$299/yr</td><td>Annual</td><td>Up to 10 NoKs, duress-decoy, multi-seed vaults, document + image vaults, Shamir up to 5-of-9</td></tr>
          <tr><td>Lifetime Premium</td><td>$499 once</td><td>$799 once</td><td>Forever</td><td>Premium features paid once — the inheritance-grade tier</td></tr>
        </tbody>
      </table>
      <p>Family Office and Institutional tiers are gated until launch.</p>
      <p>On-chain referral programme: 10% referee discount + 10% referrer share. First wallet to 100 / 500 / 1,000 paid referrals earns a 25% / 50% / 75% Founder-Referrer Bonus on its hard earnings — a public reputation pledge admin-paid in USDC.</p>
    `,
  },
  {
    path: "/manual",
    title: "NoKLock — step-by-step user manual (6 languages, screen-aligned)",
    description: "12-section walkthrough of the entire NoKLock app: connecting a wallet, enrolling a vault, designating heirs, heartbeats, the dead-man's switch, social recovery, the dashboard cockpit, the heir's claim walkthrough. Available in English, German, French, Portuguese, Simplified Chinese (draft), Hindi (draft).",
    noscript: `
      <h1>NoKLock user manual — step-by-step walkthrough</h1>
      <p>A 12-section guide covering every screen of the NoKLock app. English is the authoritative version; German, French, and Portuguese are full translations; Simplified Chinese and Hindi are first-pass drafts pending native review. Each section names the exact English on-screen label so users on translated versions can match.</p>
      <ol>
        <li>Connect your wallet</li>
        <li>Choose what to protect (seed / sealed letter / document / image)</li>
        <li>The enrol wizard (step strip)</li>
        <li>How saving + spreading shares really works</li>
        <li>Restore your secret later</li>
        <li>Next-of-kin, heartbeat &amp; dead-man's switch</li>
        <li>Social recovery — guardians (different from NoKs)</li>
        <li>Dashboard cockpit</li>
        <li>The instruction manual for an heir (/nok-claim)</li>
        <li>Soulbound NFTs (ERC-5192) — your inheritance proof</li>
        <li>Settings, info &amp; help</li>
        <li>Golden rules</li>
      </ol>
      <p>Open the manual in a JavaScript-capable browser to read the full step list and switch languages.</p>
    `,
  },
  {
    path: "/heir",
    title: "NoKLock heir guide — what to do if you received an inheritance email",
    description: "Plain-language guide for next-of-kin who received a NoKLock activation email. Public, no wallet required to read. Covers what just happened, is this real, what you need, step-by-step claim + restore, multi-NoK quorum, and what NoKLock cannot do.",
    noscript: `
      <h1>If you are reading this, you have been designated as a next-of-kin</h1>
      <p>Someone you knew set up NoKLock as a way to pass on a digital secret to you — a crypto wallet seed phrase, a sealed letter, a document, or an image. They named you as their next-of-kin. Their grace period has lapsed; the on-chain dead-man's switch fired automatically; an inheritance NFT is queued for you to claim.</p>
      <p><strong>Take your time. There is no rush.</strong> The claim link in the activation email expires 30 days from sending, not immediately. Read this guide, ask someone you trust, verify, and proceed when you are ready.</p>
      <h2>Verify this is real (not a scam)</h2>
      <ul>
        <li>The email came from an @noklock.app address. Check the header.</li>
        <li>The claim link starts with https://noklock.app/nok-claim/ — hover before clicking.</li>
        <li>Verify NoKLock independently on PolygonScan: search for the NoKLockEscrow contract address (printed at /info → Contracts). You will see the verified Solidity source code.</li>
        <li>NoKLock cannot charge you anything beyond ~$0.05 in MATIC gas. Anyone asking for money is a scammer.</li>
        <li>NoKLock cannot pressure you. If you ignore the email, nothing happens to you.</li>
      </ul>
      <h2>What you will need</h2>
      <ul>
        <li>The activation email + the claim link.</li>
        <li>A crypto wallet on Polygon (Trust Wallet, MetaMask, etc. — free to install).</li>
        <li>The master password the designator shared with you outside NoKLock.</li>
        <li>The encrypted share files (links the designator gave you to their cloud storage).</li>
      </ul>
      <h2>Step-by-step</h2>
      <ol>
        <li>Open the claim link from your email.</li>
        <li>Connect a wallet on Polygon (or create one).</li>
        <li>Click Claim. Approve the tx. ~$0.05 in MATIC gas.</li>
        <li>Open /restore on the same site. Drop in the share files. Type the master password.</li>
        <li>The secret is reconstructed entirely in your browser.</li>
      </ol>
      <p>Open the full heir guide in a JavaScript-capable browser to read sections on multi-NoK quorum, what NoKLock cannot do, and what to do after you have claimed.</p>
      <p>Contact: hello@noklock.app</p>
    `,
  },
  {
    path: "/help",
    title: "NoKLock help — air-gapped enrolment, tamper-proof shares, soulbound inheritance",
    description: "Plain-English explainer of every NoKLock security claim: truly air-gapped enrolment, tamper-proof manifest signatures, spoof-proof soulbound tokens, social-engineering-proof multi-NoK quorum, duress-proof decoy vaults, NoKLock-proof on-chain inheritance.",
    noscript: `
      <h1>How NoKLock works — every claim, in plain English</h1>
      <p>NoKLock makes seven testable security claims. Each is grounded in deterministic mathematics, not trust:</p>
      <ul>
        <li><strong>Truly air-gapped.</strong> During enrolment NoKLock blocks every network call from the page; the crypto runs locally and deterministically.</li>
        <li><strong>Tamper-proof.</strong> Every share is AEAD-encrypted with an authentication tag. Every manifest is Ed25519-signed. Tampering anywhere fails verification at restore.</li>
        <li><strong>Spoof-proof.</strong> ERC-5192 soulbound NFTs cannot be transferred, sold, or impersonated. The NoK you designated is the NoK who will inherit.</li>
        <li><strong>Social-engineering-proof.</strong> Multi-NoK M-of-N quorum from independent wallets. Phishing one heir cannot release the vault.</li>
        <li><strong>Duress-proof (Premium).</strong> Optional decoy vault with its own master password. Under coercion you reveal the decoy.</li>
        <li><strong>NoKLock-proof.</strong> Recovery is 100% client-side. Inheritance runs on-chain. The protocol survives even if NoKLock the company disappears.</li>
        <li><strong>Self-custodial.</strong> NoKLock never sees keys, shares, passwords, or vault contents. By architecture, not policy.</li>
      </ul>
      <p>Open the full Help page in a JavaScript-capable browser for the storage-provider how-to table (Google Drive / Dropbox / OneDrive / IPFS / Arweave).</p>
    `,
  },
  {
    path: "/terms",
    title: "NoKLock — Terms of Use",
    description: "Self-custodial, AS-IS, BUSL-1.1. License NFTs non-refundable, non-transferable. User responsibility for vault contents (NoKLock cannot see). Bug-bounty programme. English authoritative.",
    noscript: `
      <h1>NoKLock — Terms of Use</h1>
      <p>NoKLock is a self-custodial cryptography tool. We do not hold your keys, your data, or your money. We cannot recover what we never had. Use is at your own risk. License NFT purchases are non-refundable. Software provided AS-IS under BUSL-1.1, no warranties.</p>
      <p>Sections: 1. Who we are · 2. Self-custody — you control everything · 3. License NFTs are non-refundable · 4. AS-IS, no warranty · 5. Acceptable use · 5a. User content and your responsibility · 6. Dead-man's switch + NoK inheritance · 7. Smart-contract risk + Bug Bounty + Beta Tester Programme · 8. Changes to these terms · 9. Referral &amp; affiliate programme · 10. Contact · 11. Language (English authoritative).</p>
      <p>Open in a JavaScript-capable browser for the full text.</p>
    `,
  },
  {
    path: "/privacy",
    title: "NoKLock — Privacy notice (zero-PII architecture)",
    description: "NoKLock collects no email, name, phone, IP, cookies, or per-user analytics. Encryption runs in your browser; the server cannot see vault contents. Wallet address is the only identifier and lives on the public chain. One transactional email (NoK activation) sent only for email-designated heirs, event-driven from on-chain.",
    noscript: `
      <h1>NoKLock — Privacy notice (zero-PII architecture)</h1>
      <p>NoKLock cannot leak what it never has. We collect no email, no name, no phone, no IP, no cookies, no analytics events. Encryption is end-to-end in your browser; the back-end never sees plaintext seeds, shares, or vault contents. The only on-chain identifier is your pseudonymous wallet address.</p>
      <h2>What we cannot see</h2>
      <ul>
        <li>The words of your seed phrase or sealed letter</li>
        <li>The contents of any document or image you store</li>
        <li>Your master password</li>
        <li>Whether the content is lawful, accurate, or complete</li>
        <li>Whether your designated next-of-kin email or wallet belongs to the person you think it does</li>
      </ul>
      <p>Because we cannot see these things, we have no obligation to verify them. NoKLock is not your legal, financial, tax, or estate adviser.</p>
      <p>Open the full Privacy notice in a JavaScript-capable browser.</p>
    `,
  },
  {
    path: "/prove-it",
    title: "NoKLock — try the real cryptographic pipeline on throwaway data",
    description: "The Prove It page runs every step of the NoKLock crypto pipeline (Argon2id KDF, SLIP-39 split, AEAD encrypt, Ed25519-signed manifest, threshold reconstruction) on a throwaway test seed generated in your browser. No real wallet, no real value, no obligation — verify the math works before trusting it.",
    noscript: `
      <h1>NoKLock — try the real pipeline on throwaway test data</h1>
      <p>The Prove It page lets you run the entire NoKLock cryptographic pipeline live in your browser, on throwaway test data the page generates locally. Verify the math works before trusting it with real assets.</p>
      <p>Each pipeline runs end-to-end: Argon2id key derivation, SLIP-39 Shamir splitting over GF(256), per-share AEAD encryption (AES-256-GCM or XChaCha20-Poly1305 randomly chosen), Ed25519-signed manifest, threshold reconstruction, and content verification. Four content types are demonstrable: a fresh BIP39 mnemonic, a sealed letter, a document, and an image.</p>
      <p>This is the real pipeline — not a separate demo build. Same code path as enrolling a real vault. The only difference is the input data is throwaway and nothing is persisted.</p>
      <p>Open in a JavaScript-capable browser to run the demo.</p>
    `,
  },
  {
    path: "/refer",
    title: "NoKLock — refer & earn (on-chain 10% / 15% split + Founder-Referrer Bonus)",
    description: "On-chain referral programme via the verified License contract: 10% referee discount + 10% referrer share, automatic credit accrual + instant USDC affiliate mode at 5 paid referrals. PLUS the Founder-Referrer Bonus: first wallet to 100 / 500 / 1,000 paid referrals earns 25% / 50% / 75% bonus on hard earnings — public reputation pledge.",
    noscript: `
      <h1>Refer &amp; earn on NoKLock — fully on-chain</h1>
      <p>Anyone with a wallet can refer; no purchase, no signup. Connect a wallet at /refer — your referral link is your wallet address. The on-chain License contract handles the entire programme.</p>
      <h2>How it works</h2>
      <ul>
        <li>Referee buys a paid licence after visiting your link → gets 10% off automatically (contract-applied at mint).</li>
        <li>You earn 10% of what they pay, attributed by the contract on every paid mint they make — including their future renewals.</li>
        <li>Pre-5 paid referrals: your share accrues as on-chain USDC credit (auto-applies against your own future licence purchases).</li>
        <li>At 5 paid referrals: you flip to affiliate, and every subsequent referral pays your 10% directly to your wallet in USDC, in the same transaction, no claim button.</li>
        <li>First-referrer-lock: the first paid mint locks you in as that wallet's referrer permanently — no farming, no poaching.</li>
        <li>Free-tier mints pay nothing (sybil-defence).</li>
      </ul>
      <h2>Founder-Referrer Bonus (public reputation pledge)</h2>
      <p>On top of the standard split, NoKLock commits a one-time milestone bonus to the first wallet that reaches each of three paid-referral thresholds:</p>
      <ul>
        <li>First wallet to 100 paid referrals → 25% of its on-chain referral earnings to that block.</li>
        <li>First wallet to 500 paid referrals → 50% (tranched-exclusive math for same-wallet multi-tier wins).</li>
        <li>First wallet to 1,000 paid referrals → 75% (max single-wallet total = 75% of hard-earnings-at-block-1000).</li>
      </ul>
      <p>Admin-paid in USDC from NoKLock Treasury. The trust anchor is on-chain: the metric is public referralCount; the payout tx is a public PolygonScan transaction; the pledge is announced via the Updates page with the owner signature. Mathematically sybil-unprofitable (attacker self-funding 1,000 mints loses ~$66k net).</p>
      <p>Open the full /refer page in a JavaScript-capable browser to get your link and see the live leaderboard.</p>
    `,
  },
  {
    path: "/crypto-inheritance",
    title: "Crypto inheritance — leave your coins to family without giving up your keys",
    description: "How to pass on crypto when you die without a custodian: self-custodial Shamir-split seeds, an on-chain dead-man's switch, soulbound-NFT heirs, and an email path for non-crypto family. Plain answers to the questions people ask.",
    noscript: `
      <h1>Crypto inheritance, done right</h1>
      <p>Most crypto dies with its owner — no password reset, no support line, no court that can crack a seed phrase. NoKLock hands your coins to your family without you ever giving your keys to anyone, including us: self-custody while you're alive, an automatic on-chain handover when you're not.</p>
      <h2>What happens to your crypto when you die?</h2>
      <p>By default, nothing good — if your heirs can't produce the seed phrase, the assets sit on-chain forever. NoKLock designates next-of-kin who hold inert soulbound NFTs on Polygon that only activate after you stop checking in for a grace window you choose. It is proof-of-life, never proof-of-death.</p>
      <h2>How do I leave crypto to my family without giving up my keys?</h2>
      <p>Your seed is Shamir-split and AEAD-encrypted in your browser; the encrypted shares go to your own cloud accounts; heirs are bound on-chain. NoKLock never holds your keys, shares, or master password — and the inheritance still completes on-chain if NoKLock disappears.</p>
      <h2>What is a crypto dead man's switch?</h2>
      <p>A mechanism that releases your crypto only after you've gone silent for a set period. NoKLock's runs on-chain via Chainlink Automation: miss your heartbeats for the grace window (default 60 days, up to 365) and your designated next-of-kin can claim. No one can declare you dead to trigger it early.</p>
      <h2>How do I pass on a seed phrase safely?</h2>
      <p>Don't hand over raw words or rely on one sheet of paper. NoKLock uses T-of-N Shamir shares across your own clouds, reconstructed by the heir only after the switch fires using a threshold of shares plus a master password shared out-of-band. Layer it with a paper backup or hardware-wallet recovery card.</p>
      <h2>Can my heir inherit if they don't use crypto?</h2>
      <p>Yes. NoKLock's Hybrid-E lets you designate an heir by email; the inheritance NFT waits in escrow until the switch fires, then the heir makes a wallet and a server EIP-712 attestation rebinds the soulbound NFT to them.</p>
      <h2>What if NoKLock disappears?</h2>
      <p>Recovery is 100% client-side from your shares; inheritance runs on Polygon + Chainlink, not our servers. No NoKLock, your heirs still inherit. Six contracts source-verified on PolygonScan, 154 automated tests, multiple independent reviews.</p>
      <p>Compare NoKLock with Casa, Vault12, Inheriti and Deadhand at /compare. Try the real cryptographic pipeline on throwaway data at /prove-it.</p>
    `,
  },
  {
    path: "/compare",
    title: "NoKLock vs Casa, Vault12, Inheriti & Deadhand — crypto inheritance compared",
    description: "Honest side-by-side comparisons of NoKLock against the closest crypto-inheritance products: custody model, inheritance trigger, soulbound record, survives-if-vendor-gone, duress, non-crypto-heir support, pricing.",
    noscript: `
      <h1>NoKLock vs the alternatives</h1>
      <p>Honest, side-by-side comparisons against the closest crypto-inheritance products. NoKLock's column is verifiable on PolygonScan now; theirs is a conservative reading of their public positioning — verify with each provider.</p>
      <ul>
        <li><strong>NoKLock vs Casa</strong> (/compare/casa) — self-custodial with zero provider keys + an autonomous on-chain dead-man's switch + duress decoy + email heirs, vs Casa's collaborative multisig (Casa co-holds a key) and a Casa-assisted inheritance service.</li>
        <li><strong>NoKLock vs Vault12</strong> (/compare/vault12) — a public-chain trigger + soulbound NFT record + independent-wallet M-of-N quorum that survives the vendor, vs Vault12's app-mediated Guardian social custody.</li>
        <li><strong>NoKLock vs Inheriti</strong> (/compare/inheriti) — no proprietary hardware, standard ERC-5192 soulbound NFTs + Chainlink trigger + duress + email heirs, vs Inheriti's SmartKey hardware and sharding scheme.</li>
        <li><strong>NoKLock vs Deadhand</strong> (/compare/deadhand) — independent-heir M-of-N quorum, duress, soulbound record, email heirs and sealed-letter/document/image vaults, vs Deadhand's minimalist single-beneficiary on-chain switch.</li>
      </ul>
      <p>Full 10-competitor feature matrix on /info (Competitors tab).</p>
    `,
  },
  {
    path: "/compare/casa",
    title: "NoKLock vs Casa — self-custodial vs collaborative-custody inheritance",
    description: "NoKLock vs Casa: zero provider keys + an autonomous on-chain dead-man's switch + duress decoy + email heirs, vs Casa's collaborative multisig and Casa-assisted inheritance service.",
    noscript: `
      <h1>NoKLock vs Casa</h1>
      <p>Casa is a premium collaborative-custody multisig with a Casa-assisted inheritance service.</p>
      <h2>Key differences</h2>
      <ul>
        <li>Custody: NoKLock is self-custodial (never holds your keys); Casa co-holds a multisig key.</li>
        <li>Trigger: NoKLock fires an autonomous on-chain dead-man's switch (Chainlink); Casa runs a service-mediated inheritance process.</li>
        <li>Survives the vendor: NoKLock's recovery is client-side and inheritance is on-chain, so it works if NoKLock disappears; Casa's hand-over is a Casa-run service.</li>
        <li>Duress decoy vault: NoKLock yes (Premium); Casa no.</li>
        <li>Non-crypto heir: NoKLock has an email (Hybrid-E) path; Casa heirs work through Casa.</li>
        <li>Soulbound record: NoKLock mints ERC-5192 NFTs; Casa does not.</li>
        <li>Pricing: NoKLock pays in USDC with a Free tier and lifetime options; Casa is a subscription roughly $250–$2,100/yr.</li>
      </ul>
      <p>Honest verdict: Casa is a strong, well-run white-glove product — pick it if you want a human concierge and don't mind a custodial key + subscription. Pick NoKLock for zero provider keys, an autonomous trigger, duress protection, an email path for non-crypto heirs, and survival of the operator. Verify current details with each provider.</p>
    `,
  },
  {
    path: "/compare/vault12",
    title: "NoKLock vs Vault12 — on-chain inheritance vs app-based social custody",
    description: "NoKLock vs Vault12: a public-chain trigger + soulbound NFT record + independent-wallet M-of-N quorum that survives the vendor, vs Vault12's app-mediated Guardian social custody.",
    noscript: `
      <h1>NoKLock vs Vault12</h1>
      <p>Vault12 is app-based 'social custody' — your Guardians hold encrypted shares and a beneficiary inherits via the app.</p>
      <h2>Key differences</h2>
      <ul>
        <li>Where it runs: NoKLock's trigger + record are on Polygon (public, verifiable); Vault12's flow lives in the Vault12 app/network.</li>
        <li>Survives the vendor: NoKLock works without us (client-side recovery, on-chain inheritance); Vault12 is tied to its app + infrastructure.</li>
        <li>Soulbound record: NoKLock mints ERC-5192 NFTs anyone can verify; Vault12 does not.</li>
        <li>Quorum: NoKLock uses an M-of-N quorum of independent wallets; Vault12 uses an app-mediated Guardian quorum.</li>
        <li>Duress decoy: NoKLock yes (Premium); Vault12 no.</li>
        <li>Both: no-KYC.</li>
      </ul>
      <p>Honest verdict: Vault12 popularised social-custody inheritance and the Guardian model is solid and approachable. Pick NoKLock if you want the trigger and record on a public chain (so it survives the vendor), an independent-wallet quorum, duress protection, and a verifiable soulbound record. Verify current details with each provider.</p>
    `,
  },
  {
    path: "/compare/inheriti",
    title: "NoKLock vs Inheriti — soulbound on-chain inheritance vs hardware sharding",
    description: "NoKLock vs Inheriti (Safe Haven): no proprietary hardware, standard ERC-5192 soulbound NFTs + Chainlink trigger + duress + email heirs, vs Inheriti's SmartKey hardware and sharding scheme.",
    noscript: `
      <h1>NoKLock vs Inheriti (Safe Haven)</h1>
      <p>Inheriti is a decentralised digital-inheritance product using a hardware SmartKey + secret-sharding.</p>
      <h2>Key differences</h2>
      <ul>
        <li>Hardware: NoKLock needs none; Inheriti leans on its SmartKey hardware + sharding scheme.</li>
        <li>Record: NoKLock uses standard ERC-5192 soulbound NFTs; Inheriti uses its own sharding scheme.</li>
        <li>Trigger: NoKLock's is a Chainlink-fired on-chain dead-man's switch; Inheriti uses validator/device-based release.</li>
        <li>Duress decoy: NoKLock yes (Premium); Inheriti no.</li>
        <li>Non-crypto heir: NoKLock has an email path; Inheriti needs heir setup + the hardware/app.</li>
        <li>Both: no-KYC; Inheriti has attractive one-time pricing.</li>
      </ul>
      <p>Honest verdict: Inheriti is one of the few genuinely decentralised inheritance products and the one-time pricing is appealing; the trade-off is hardware + ecosystem dependency. Pick NoKLock for no proprietary hardware, a standard soulbound record, duress protection, an M-of-N independent-heir quorum, and an email path for non-crypto heirs. Verify current details with each provider.</p>
    `,
  },
  {
    path: "/compare/deadhand",
    title: "NoKLock vs Deadhand — full inheritance suite vs a bare dead-man's switch",
    description: "NoKLock vs Deadhand: independent-heir M-of-N quorum, duress decoy, soulbound record, email heirs and sealed-letter/document vaults, vs Deadhand's minimalist single-beneficiary on-chain switch.",
    noscript: `
      <h1>NoKLock vs Deadhand</h1>
      <p>Deadhand is a lightweight on-chain dead-man's switch for crypto.</p>
      <h2>Key differences</h2>
      <ul>
        <li>Heir model: NoKLock supports an M-of-N quorum of independent heirs; Deadhand is typically a single beneficiary.</li>
        <li>Duress decoy: NoKLock yes (Premium); Deadhand no.</li>
        <li>Soulbound record: NoKLock mints ERC-5192 NFTs; Deadhand does not.</li>
        <li>Scope: NoKLock also handles sealed letters, documents and images, with an email path for non-crypto heirs; Deadhand is switch-only.</li>
        <li>Assurance: NoKLock has 154 tests + source-verified contracts + independent reviews; Deadhand is minimalist.</li>
        <li>Both: self-custodial; Deadhand is free / low one-time cost.</li>
      </ul>
      <p>Honest verdict: Deadhand is the minimalist option — if you just want one beneficiary and a timer, it does that, often free. Pick NoKLock when inheritance actually matters: independent-heir quorum, duress protection, a soulbound record, email heirs, document vaults, and a tested, verified contract suite. Verify current details with each provider.</p>
    `,
  },
  // Daniel 2026-05-31: added the missing routes that were falling through
  // to the generic index.html tagline. Each gets a content-specific
  // title, meta description, and bot-visible <noscript> body block.
  {
    path: "/prove-it/math",
    title: "NoKLock — prove the math: run the real crypto pipeline live in your browser",
    description: "Generate throwaway test data, run the real Argon2id + SLIP-39 Shamir + AEAD + Ed25519-signed manifest pipeline, restore from K shares, verify byte-for-byte round-trip. No mocks, no server, no synthetic data.",
    noscript: `
      <h1>Prove the math — the real NoKLock crypto pipeline, in your browser</h1>
      <p>This page runs each cryptographic primitive NoKLock uses to protect a vault, on throwaway test data generated locally: Argon2id key derivation (RFC 9106, 64 MiB memory-hard), SLIP-39 Shamir split (GF(256) threshold scheme), per-share AEAD encryption (AES-256-GCM or XChaCha20-Poly1305), Ed25519-signed manifest, threshold reconstruction, and byte-for-byte round-trip verification.</p>
      <p>The animation replays the whole sequence at lesson-pace so you can SEE every primitive. The same code paths run when you enrol a real vault.</p>
      <p>Open in a JavaScript-capable browser to run the demo.</p>
    `,
  },
  {
    path: "/prove-it/airgap",
    title: "NoKLock — prove the airgap: zero network calls during seed entry, verifiable in DevTools",
    description: "Live network-watch terminal alongside four test-fire buttons (fetch / Image / WebSocket / sendBeacon). Every browser exfil channel bounces off the firewall in real time. Corroborate against your own DevTools.",
    noscript: `
      <h1>Prove the airgap — zero outbound traffic during seed entry</h1>
      <p>The airgap firewall hijacks nine browser channels (fetch, XMLHttpRequest, sendBeacon, Image.src, WebSocket, EventSource, RTCPeerConnection, DOM-injected script and link) plus an independent PerformanceObserver browser-native witness. Every outbound attempt is recorded and shown live.</p>
      <p>Four "test fire" buttons deliberately try to exfiltrate via each channel. Every attempt should bounce off and appear as blocked in BOTH our terminal and the browser's own DevTools Network tab — two independent observers, same record.</p>
      <p>Open in a JavaScript-capable browser to run the live test.</p>
    `,
  },
  {
    path: "/prove-it/noklock-proof",
    title: "NoKLock — prove the chain runs without us: 6 immutable contracts + Chainlink keeper",
    description: "If NoKLock vanished tomorrow, your inheritance still fires. 6 source-verified contracts on Polygon, Chainlink Automation as the dead-man's switch, public-RPC fallback chain. Honest caveats included.",
    noscript: `
      <h1>Prove the chain runs without us — survives the vendor</h1>
      <p>NoKLock's on-chain contract suite is six immutable Solidity contracts source-verified on PolygonScan. The dead-man's switch is fired by Chainlink Automation (a decentralised keeper), not by NoKLock. The PWA can reach the chain via the NoKLock RPC proxy or four public Polygon RPC endpoints in fallback order — if our proxy goes dark, your wallet still finds the chain.</p>
      <p>Open in a JavaScript-capable browser to run the live checks and view the contract list with PolygonScan links.</p>
    `,
  },
  {
    path: "/prove-it/build-matches",
    title: "NoKLock — prove the build matches the source: runtime hash + reproduce one-liner",
    description: "Live build-hash readout, runtime enumeration of every JS/CSS asset the browser actually loaded, and a one-liner to clone-and-build the same dist yourself in 5 minutes. The code you ship matches the code on GitHub.",
    noscript: `
      <h1>Prove the build matches the source</h1>
      <p>NoKLock shows you the build hash of the bundle your browser actually downloaded, plus an enumeration of every JS and CSS asset the browser engine loaded (browser report, not our claim). A 5-minute one-liner lets you clone github.com/dksteeves/noklock, build the same dist yourself, and compare hashes.</p>
      <p>Open in a JavaScript-capable browser to run the live hash compare.</p>
    `,
  },
  {
    path: "/prove-it/entropy",
    title: "NoKLock — prove your shares look like noise: chi-square byte-frequency test on real ciphertext",
    description: "Generate real ciphertext + real Shamir shares in your browser, run them through a chi-square byte-frequency test against the critical value for 256 bins. A control column of structured ASCII deliberately fails so the test is visibly wired right.",
    noscript: `
      <h1>Prove your encrypted shares look like noise</h1>
      <p>This page generates real ciphertext and real Shamir shares in your browser, then runs a chi-square byte-frequency test over the resulting bytes against the critical value for 256 bins (df = 255, α = 0.05). A control column of structured ASCII text deliberately fails the same test, so you can see the test is wired correctly.</p>
      <p>Open in a JavaScript-capable browser to run the live test.</p>
    `,
  },
  {
    path: "/prove-it/source",
    title: "NoKLock — prove the source: 9-channel firewall + synchronous memory wipe of every derived byte",
    description: "Inline-bundled source of the 9-channel browser-exfil firewall + PerformanceObserver witness + boot install. Plus the honest JS memory model: every Uint8Array we derive from your seed is synchronously .fill(0)'d the moment it's no longer needed.",
    noscript: `
      <h1>Prove the source — read the firewall and the wipe code</h1>
      <p>The source of NoKLock's 9-channel browser-exfil firewall, the PerformanceObserver browser-native witness, and the boot install where the firewall arms — all bundled into this page via vite ?raw imports so opening the proof itself does not make a network call. Works while the airgap is engaged.</p>
      <p>Plus an honest explainer of the JavaScript memory model for the seed phrase: JS strings cannot be synchronously wiped (no API exists in any browser to overwrite a string in place). Every Uint8Array NoKLock derives from your seed — BIP-39 entropy, Argon2id master, HKDF pseudorandom key, per-share AEAD keys, Shamir share plaintexts, Ed25519 signing seed — is synchronously zeroed in place via .fill(0) the moment it is no longer needed. The seed string itself becomes garbage-collected after React state is cleared; the 9-channel airgap firewall is the load-bearing defense that stops residual heap from leaving the page.</p>
      <p>Open in a JavaScript-capable browser to view the bundled source modal.</p>
    `,
  },
  {
    path: "/viz/pipeline",
    title: "NoKLock — end-to-end pipeline visualisation: 8 primitives, one continuous animation",
    description: "BIP-39 → Argon2id → SLIP-39 Shamir → AEAD → Ed25519-signed manifest → restore from K shares → byte-for-byte round-trip. Same algorithms as the live math proof, run on illustrative data so you can see the shape of the whole process in ~90 seconds.",
    noscript: `
      <h1>End-to-end NoKLock pipeline — one continuous lesson-pace animation</h1>
      <p>All eight cryptographic primitives strung together as one animation: BIP-39 mnemonic generation, Argon2id master key derivation, SLIP-39 Shamir split, per-share AEAD encryption, Ed25519-signed manifest, threshold reconstruction, and byte-for-byte round-trip verification.</p>
      <p>The same algorithms as the live math proof at /prove-it/math; this version runs on illustrative data so the shape of the whole process is visible in about 90 seconds.</p>
      <p>Open in a JavaScript-capable browser to watch the animation.</p>
    `,
  },
  {
    path: "/nok-claim",
    title: "NoKLock — claim your inheritance: next-of-kin claim flow on Polygon",
    description: "Connect the heir wallet that holds your soulbound-NFT claim ticket. Walk through verification, the time-locked claim window, and the restore step that hands you the encrypted vault. No custodian; the contracts do this on-chain.",
    noscript: `
      <h1>Claim your NoKLock inheritance</h1>
      <p>This page is for next-of-kin who hold a soulbound NoK-NFT claim ticket. Connect the heir wallet; the page walks you through verification, the time-locked claim window, the grace period, and the restore step that hands you the encrypted vault. NoKLock is not a custodian — the contracts on Polygon do this on-chain.</p>
      <p>If you received an inheritance notification email and are not crypto-native, also see <a href="/heir">/heir</a> for the plain-language walkthrough.</p>
    `,
  },
  {
    path: "/recovery",
    title: "NoKLock — vault recovery: restore on any browser, any time",
    description: "Self-recovery flow: drop in any K of your encrypted Shamir shares + your master password, the browser reconstructs the original seed phrase / sealed letter / document. Works on any device; no signup, no login, no server round-trip.",
    noscript: `
      <h1>Restore a NoKLock vault on any browser</h1>
      <p>Self-recovery flow: drop in any K of your N encrypted Shamir share files plus your master password, the browser reconstructs the original seed phrase, sealed letter, document, or image. Works on any device with a modern browser. No signup, no login, no server round-trip — the crypto runs entirely on your device.</p>
      <p>Open in a JavaScript-capable browser to run the restore.</p>
    `,
  },
  {
    path: "/corporate",
    title: "Asserro — NoKLock Enterprise for businesses, treasuries and DAOs",
    description: "The enterprise tier of NoKLock — multi-signer vaults, org-managed share locations, audit-log export, treasury continuity, regulated-custody integrations, optional ESG/DPP cross-links. Asserro is sold separately.",
    noscript: `
      <h1>Asserro — NoKLock Enterprise</h1>
      <p>Asserro is the enterprise tier of the NoKLock vault stack, aimed at businesses, treasuries, DAOs and other organisations that need a self-custodial vault with org-managed key procedures. Features include multi-signer vaults, org-managed share locations, audit-log export, treasury continuity, regulated-custody integrations, and optional ESG/Digital Product Passport cross-links.</p>
      <p>Asserro is sold separately under the Asserro brand. See <a href="https://asserro.com">asserro.com</a> for details.</p>
    `,
  },
  {
    path: "/whitelabel",
    title: "NoKLock — white-label: embed self-custodial inheritance in your product",
    description: "White-label the NoKLock vault + inheritance flow under your own brand. Polygon-rooted, source-verifiable, BUSL-1.1. For wallets, exchanges, custodians and fintechs that want inheritance without becoming the custodian.",
    noscript: `
      <h1>NoKLock white-label — embed self-custodial inheritance under your brand</h1>
      <p>For wallets, exchanges, custodians and fintechs that want to offer inheritance without becoming the custodian. NoKLock's vault and inheritance flow can be embedded under your brand, on Polygon, source-verifiable, BUSL-1.1 licensed.</p>
      <p>Contact <a href="mailto:hello@noklock.app">hello@noklock.app</a> for partnership and integration details.</p>
    `,
  },
  {
    path: "/updates",
    title: "NoKLock — updates: the public changelog",
    description: "The public NoKLock changelog: feature announcements, security improvements, contract upgrades, and the deploy-by-deploy story. Bookmark this page — there is no mailing list and no tracking.",
    noscript: `
      <h1>NoKLock updates — the public changelog</h1>
      <p>This is the canonical public changelog for NoKLock: feature announcements, security improvements, contract upgrades, and the deploy-by-deploy story. Bookmark this page — there is no mailing list and no tracking.</p>
      <p>Open in a JavaScript-capable browser to read the live updates feed.</p>
    `,
  },
  // 2026-06-05 — added /refund + /refund-policy + /cli. These shipped in NL-1.5
  // this week and were missing from the prerender list, so AI bots fetching
  // those URLs got the SPA shell with no per-route enrichment.
  {
    path: "/refund",
    title: "NoKLock — refund: request and policy",
    description: "Request a NoKLock refund for a Paddle-paid subscription within 14 calendar days (EU statutory cooling-off, BGB §355). Crypto purchases are on-chain final; case-by-case credit may apply via refunds@noklock.app.",
    noscript: `
      <h1>NoKLock refund request</h1>
      <p>Paddle-paid users: file a refund request within 14 calendar days of purchase under EU statutory cooling-off (BGB §355, Directive 2011/83/EU Article 13(1)). The request is wallet-signed (EIP-191) to prove ownership; Paddle initiates the refund within 1-2 business days; funds arrive within 14 calendar days at the original payment method.</p>
      <p>Crypto (USDC) purchases on Polygon are on-chain final, but case-by-case credit may apply — email <a href="mailto:refunds@noklock.app">refunds@noklock.app</a> with the wallet address, the USDC payment transaction hash, and the reason for the refund request.</p>
      <p>Full policy: <a href="/refund-policy">/refund-policy</a>.</p>
    `,
  },
  {
    path: "/refund-policy",
    title: "NoKLock — refund policy (EU statutory cooling-off + crypto carve-out)",
    description: "The NoKLock refund policy: 14 calendar days statutory cooling-off for Paddle (fiat) purchases under EU Directive 2011/83/EU and German BGB §355. Crypto (USDC on Polygon) purchases are on-chain final; case-by-case credit may apply. Operator: Tenza Climate Solutions, HRB 41384.",
    noscript: `
      <h1>NoKLock refund policy</h1>
      <p><strong>Paddle (fiat) purchases:</strong> 14 calendar days statutory cooling-off under EU Directive 2011/83/EU Article 13(1) and German BGB §355. File a refund request via <a href="/refund">/refund</a> within 14 days of purchase.</p>
      <p><strong>Crypto (USDC on Polygon) purchases:</strong> on-chain transactions are final. Case-by-case credit may apply — email <a href="mailto:refunds@noklock.app">refunds@noklock.app</a>.</p>
      <p><strong>Operator:</strong> Tenza Climate Solutions, HRB 41384. Governed by German law + the mandatory consumer-protection provisions of the buyer's country of residence.</p>
    `,
  },
  {
    path: "/cli",
    title: "NoKLock — CLI: noklock-cli for manifest verification + airgapped share upload",
    description: "noklock-cli is the open-source companion tool for NoKLock vault owners: verify manifest signatures, decrypt shares locally, audit the firewall + memory-wipe behaviour. Source on GitHub; install via npm or build from source. No NoKLock server involved.",
    noscript: `
      <h1>noklock-cli — open-source companion tool</h1>
      <p>noklock-cli is the command-line companion for NoKLock vault owners. Verify manifest signatures, decrypt shares locally without a browser, audit the firewall + Uint8Array memory-wipe behaviour from source.</p>
      <p>Install via npm or build from source: <a href="https://github.com/dksteeves/noklock">github.com/dksteeves/noklock</a>. The token never reaches NoKLock — verification is fully local.</p>
    `,
  },
];

// 2026-06-05 — per-route extra JSON-LD enrichment. The global @graph in
// index.html (Organization + WebSite + SoftwareApplication + FAQPage +
// Blog + HowTo) gets duplicated into every prerendered route unchanged.
// This map adds a ROUTE-SPECIFIC schema block injected just before </head>
// when the route's path is present here — so Google + AI crawlers see
// per-route enrichment on top of the global block.
const EXTRA_JSON_LD = {
  "/pricing": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "NoKLock — Crypto Inheritance Vault",
    "description": "Self-custodial encrypted Shamir-share storage + restore + optional on-chain inheritance. Paid in USDC on Polygon, no subscription.",
    "brand": { "@type": "Brand", "name": "NoKLock" },
    "category": "Crypto inheritance / digital legacy",
    "offers": {
      "@type": "AggregateOffer",
      "url": "https://noklock.app/pricing",
      "priceCurrency": "USD",
      "lowPrice": "0",
      "highPrice": "799",
      "offerCount": "5",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    }
  },
  "/crypto-inheritance": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What happens if I lose my phone?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Your seed doesn't live on your phone. It lives in encrypted Shamir shares distributed across providers you picked at enrol. Lose the phone — download the K shares to any new device, re-enter your master password, recover. Same Argon2id + Shamir recombination."
        }
      },
      {
        "@type": "Question",
        "name": "Why aren't seeds stored in the Secure Enclave?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Secure Enclave / StrongBox / TPM keys are not exportable from the chip — that's what makes them secure. The same property makes them the wrong fit for a recoverable seed: if the device dies, the key dies with it. NoKLock's Shamir-shares model removes the single point of failure structurally."
        }
      },
      {
        "@type": "Question",
        "name": "What is a crypto dead man's switch?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An automatic mechanism that releases access to your designated heirs after you stop sending proof-of-life signals for a chosen grace period. NoKLock runs this on Polygon + Chainlink Automation — fully autonomous, no NoKLock-side trigger, survives the company disappearing."
        }
      },
      {
        "@type": "Question",
        "name": "Is this safe if NoKLock disappears?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Recovery is 100% client-side from your encrypted shares. Inheritance runs on Polygon + Chainlink — not on NoKLock servers. Contracts are source-verified on PolygonScan. The system keeps working without us."
        }
      }
    ]
  },
  "/compare": {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "NoKLock vs the alternatives — head-to-head comparison",
    "description": "Honest side-by-side comparisons of NoKLock vs Casa, Vault12, Inheriti, Ledger Recover, Nunchuk, Unchained, ZenGo, Tangem, Sarcophagus, Bitkey, and digital-legacy alternatives. Each verdict uses superset framing: NoKLock covers the rival's job and adds more.",
    "url": "https://noklock.app/compare"
  }
};

let count = 0;
for (const r of ROUTES) {
  const routePath = r.path.replace(/^\//, "");
  const outDir = join(distDir, routePath);
  const outFile = join(outDir, "index.html");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  // Build the per-route HTML by replacing key bits in baseHtml.
  let html = baseHtml;
  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(r.title)}</title>`);
  // Replace meta description
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeAttr(r.description)}" />`);
  // Replace OG title + description
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeAttr(r.title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeAttr(r.description)}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="https://noklock.app${r.path}" />`);
  // Replace canonical
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="https://noklock.app${r.path}" />`);
  // Replace noscript content
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>\n      <main style="max-width:48rem;margin:2rem auto;padding:0 1rem;font-family:system-ui,sans-serif;color:#e2e8f0;background:#0f172a">\n        ${r.noscript.trim()}\n        <p style="margin-top:2rem;color:#94a3b8;font-size:0.875rem">This application requires JavaScript to use interactively. The summary above is for search engines, AI assistants, and accessibility tooling. Contact: hello@noklock.app</p>\n      </main>\n    </noscript>`);

  // 2026-06-05 — inject route-specific JSON-LD block just before </head>
  // when present in EXTRA_JSON_LD. Sits ALONGSIDE the global @graph (not
  // a replacement), so each route carries the site-wide org + per-route
  // schema (Product on /pricing, FAQPage on /crypto-inheritance, etc.).
  const extra = EXTRA_JSON_LD[r.path];
  if (extra) {
    const block = `    <script type="application/ld+json">${JSON.stringify(extra)}</script>\n  </head>`;
    html = html.replace("</head>", block);
  }

  writeFileSync(outFile, html, "utf8");
  count += 1;
}

console.log(`gen-prerender: wrote ${count} per-route HTML files under dist/`);

// 2026-06-16 — NoKLock Articles (SEO/AIEO). Fetch the published articles from
// Form B at build time and emit dist/articles/<slug>/index.html with the FULL
// body in <noscript> + Article JSON-LD, so crawlers / AI engines see the
// content per URL on our own domain. Best-effort: if Form B is unreachable at
// build, skip cleanly (the SPA still client-renders /articles/<slug>).
const FORM_B = (process.env.VITE_FORM_B_BASE_URL || process.env.VITE_API_URL || "https://api.noklock.app").replace(/\/+$/, "");
const ART_CAT = { security: "Security", utility: "Utility", technology: "Technology", compliance: "Compliance", guides: "Guides", features: "Features" };
let articleCount = 0;
try {
  const listRes = await fetch(`${FORM_B}/v1/articles`, { signal: AbortSignal.timeout(8000) });
  if (listRes.ok) {
    const listJson = await listRes.json();
    const metas = Array.isArray(listJson?.articles) ? listJson.articles : [];
    for (const meta of metas) {
      const oneRes = await fetch(`${FORM_B}/v1/articles/${encodeURIComponent(meta.slug)}`, { signal: AbortSignal.timeout(8000) });
      if (!oneRes.ok) continue;
      const a = (await oneRes.json())?.article;
      if (!a || !a.slug) continue;
      const url = `https://noklock.app/articles/${a.slug}`;
      const catLabel = ART_CAT[a.category] || a.category;
      let html = baseHtml;
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(`${a.title} — NoKLock`)}</title>`);
      html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeAttr(a.excerpt || a.title)}" />`);
      html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeAttr(a.title)}" />`);
      html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeAttr(a.excerpt || a.title)}" />`);
      html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`);
      html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
      // The body is already sanitised HTML (the Admin editor sanitises before
      // POST). Inject it verbatim into <noscript> for bots/AI/no-JS.
      const ns = `<noscript>\n      <main style="max-width:48rem;margin:2rem auto;padding:0 1rem;font-family:system-ui,sans-serif;color:#e2e8f0;background:#0f172a">\n        <p style="color:#94a3b8;font-size:0.8rem">${escapeAttr(catLabel)} · ${escapeAttr(a.ymd)}</p>\n        <h1>${escapeAttr(a.title)}</h1>\n        ${a.body}\n        <p style="margin-top:2rem;color:#94a3b8;font-size:0.875rem">More NoKLock articles at <a href="https://noklock.app/articles">noklock.app/articles</a>.</p>\n      </main>\n    </noscript>`;
      html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, ns);
      const ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title,
        description: a.excerpt || a.title,
        datePublished: a.ymd,
        author: { "@type": "Organization", name: "NoKLock" },
        publisher: { "@type": "Organization", name: "NoKLock" },
        mainEntityOfPage: url,
        articleSection: catLabel,
      };
      html = html.replace("</head>", `    <script type="application/ld+json">${JSON.stringify(ld)}</script>\n  </head>`);
      const outDir = join(distDir, "articles", a.slug);
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, "index.html"), html, "utf8");
      articleCount += 1;
    }
  }
  console.log(`gen-prerender: wrote ${articleCount} article page(s) under dist/articles/`);
} catch (e) {
  console.log(`gen-prerender: articles prerender skipped (${(e && e.message) || e}) — the SPA still client-renders /articles`);
}

function escapeAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
