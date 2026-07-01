// @version 0.8.0 @date 2026-06-11
// 0.8.0 — Daniel 2026-06-11 wallet rebuild: NEW FAQ entry "app-updates"
//         (How updates work) — why we never swap the app silently
//         (verifiability), what the update pill means. Inserted second.
// @version 0.7.2 @date 2026-06-08
// 0.7.2 — Daniel 2026-06-08 (handoff §3 positioning sweep): self-custodial
//         FAQ answer rewritten so the storage-agnostic frame leads —
//         "Encrypted shares live in storage you pick — local folders or your
//         own cloud accounts — with no NoKLock API access." Replaces the
//         prior cloud-only phrasing. Same simple-vs-max framing as 0.7.1 Q5
//         + Landing 0.22.0 + Enrol Step B + Pricing FAQ + Info 0.8.8/0.8.9.
// @version 0.7.1 @date 2026-06-07
// 0.7.1 — Daniel 2026-06-07 (handoff §3.3): Q5 "Where do my encrypted shares
//         actually go?" gains the simple-vs-max-security framing — "Simple
//         route: three folders on your own devices — already safer than a
//         sticky note. Maximum security: 3+ providers from different
//         jurisdictions." Matches the same two-tier framing now used across
//         Landing 0.22.0 + Enrol Step B + Pricing FAQ + CryptoInheritance Q.
// @version 0.7.0 @date 2026-06-04
// 0.7.0 — Daniel 2026-06-04 (locked split): Help.tsx is now a lightweight
//         FAQ. Deep architecture, process diagrams, and the share-storage
//         provider table live on Info → Architecture (Business + Technology
//         sub-tabs) and Info → Shares. Every Help section the audit marked
//         DROP_FROM_HELP (air-gapped / tamper-proof / spoof-proof / social-
//         engineering-proof / duress-proof / death-proof / self-custodial /
//         noklock-proof) loses its long-form body here and is rewritten as
//         a single one-line question + concise answer that links straight
//         to the canonical write-up on Info. Section anchor IDs are kept
//         unchanged so existing #fragment links still land somewhere. The
//         "Where do my shares go?" provider table is removed entirely — the
//         richer per-provider accordion on Info → Shares is the single
//         source of truth. Two Help-only beats (Premium-tier duress UX
//         gating + noklock-cli callout) were folded INTO Info 0.8.4 before
//         the drop. Top of page gains a prominent link to Info Architecture.
// @version 0.6.1 @date 2026-06-03
// 0.6.1 — Daniel 2026-06-03: header stale text ("Process diagrams + screen-
//         by-screen walkthroughs land in a multi-tab format soon") fixed —
//         we DO have those today. Replaced with a pointer to Info Architecture
//         tab + User manual where the deep content actually lives.
// @version 0.6.0 @date 2026-06-03
// 0.6.0 — Daniel 2026-06-03: "Where do my shares go?" section gains a
//         cyan callout introducing the open-source noklock-cli for
//         optional auto-upload/download. Token stays on user's machine,
//         NoKLock never sees it. Same trust story, less typing. Links to
//         the github repo for install + source-read.
// @version 0.5.0 @date 2026-06-01
// 0.5.0 — M-of-N pre-v0.6 honesty disclosure (Daniel 2026-06-01):
//         "social-engineering-proof" lede + body now qualified — M-of-N
//         quorum is enforced from v0.6 onwards; vaults enrolled before v0.6
//         remain owner-restorable (re-enrol to upgrade). Closes the silent
//         marketing-vs-code gap on Help's signature-differentiator page.
// 0.4.0 — FAQ-sweep sync with Info.tsx Architecture (Daniel 2026-05-20):
//         - `provider-independent` section renamed to `noklock-proof`
//         - NEW `social-engineering-proof` section (multi-NoK M-of-N quorum)
//         - NEW `duress-proof` section (Premium-only decoy vault)
//         Help.tsx and Info.tsx Architecture tab now use the same six
//         signature-differentiator section names, no drift.
// 0.3.1 — WS-D veracity: "Practical guarantee:" → "In practice:" (an
//         absolute-guarantee phrasing softened to the truth).
// 0.3.0 — WS6: NEW "What if NoKLock disappears?" section (provider-
//         independence). Stray "passkey" → "master password" (veracity).
//
// /help — Lightweight FAQ. Deep architecture, process diagrams, and the
// share-storage provider table live on Info → Architecture (Business +
// Technology sub-tabs) and Info → Shares. This page answers the short
// version; the "Read full →" link on each item jumps to the deep dive.

import { Link } from "react-router-dom";

interface Faq {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly deepLink: { to: string; label: string };
}

// Section anchor IDs are preserved from 0.6.x so existing /help#<id>
// fragment links still land here. Bodies are intentionally short — the
// canonical long-form lives on Info.
const FAQS: readonly Faq[] = [
  {
    id: "air-gapped",
    question: "Is the seed-entry step really offline?",
    answer:
      "Yes. The enrolment wizard puts the PWA into airgap mode at the seed-entry screen — every fetch() from this tab is blocked until you reach Done — and we also prompt you to switch the device to airplane mode. The restore path forces the airgap back on before any decryption begins. Symmetric, by design.",
    deepLink: { to: "/info?tab=architecture&sub=business#air-gapped", label: "Read the step-by-step pipeline →" },
  },
  {
    id: "app-updates",
    question: "Why does NoKLock ask me to apply updates instead of updating silently?",
    answer:
      "Verifiability. What you've reviewed and proven — the code, the math, the prove-its — is what keeps running until YOU accept the new version; we never swap the app out from under you. When a new build ships, the app downloads it and shows 'A required security update is ready'. Tap Update now to switch (one quick reload). Tap Later and we'll remind you when you come back. Please apply promptly — updates carry security fixes. The footer build id always tells you exactly which version you're running.",
    deepLink: { to: "/updates", label: "See what changed in each update →" },
  },
  {
    id: "tamper-proof",
    question: "What stops someone modifying a share or the manifest?",
    answer:
      "Each share carries an AEAD authentication tag (AES-256-GCM or XChaCha20-Poly1305); the manifest is Ed25519-signed using a key derived from your master secret. Change one byte of either and restore refuses to proceed — fail-safe, never best-effort.",
    deepLink: { to: "/info?tab=architecture&sub=business#tamper-proof", label: "Read the AEAD + Ed25519 detail →" },
  },
  {
    id: "spoof-proof",
    question: "Can my heir's inheritance token be stolen or sold?",
    answer:
      "No. The Activation token (and, for M-of-N quorum vaults, the Voting token) minted to your NoK's wallet are ERC-5192 soul-bound — the on-chain contract refuses every transfer attempt. The token can only be burned, never moved. No secondary market, no theft vector.",
    deepLink: { to: "/info?tab=architecture&sub=business#spoof-proof", label: "Read the ERC-5192 detail →" },
  },
  {
    id: "social-engineering-proof",
    question: "What if a phisher gets to one of my heirs?",
    answer:
      "From v0.6 onwards, the contract requires an M-of-N quorum of independent signatures from independent wallets to release (default 2-of-3). Coercing one heir is mathematically insufficient. Vaults enrolled before v0.6 remain owner-restorable — re-enrol to upgrade. Best practice: spread NoKs across different households, employers, geographies.",
    deepLink: { to: "/info?tab=architecture&sub=business#social-engineering-proof", label: "Read the quorum detail →" },
  },
  {
    id: "duress-proof",
    question: "What if someone forces me to hand over my password?",
    answer:
      "Premium tier offers an optional duress decoy — a second vault with its own master password, encrypted side-by-side with your real one. Under coercion you hand over the decoy; the attacker decrypts a believable throwaway. The two vaults are cryptographically indistinguishable from outside. Defends against criminal coercion, not legal subpoena.",
    deepLink: { to: "/info?tab=architecture&sub=business#duress-proof", label: "Read the decoy-vault detail →" },
  },
  {
    id: "death-proof",
    question: "How does the inheritance actually trigger?",
    answer:
      "An on-chain dead-man's switch. You set a grace period (default 60 days); each heartbeat resets it. If the grace elapses, Chainlink Automation flips your NoK's Activation token from LockedInactive to LockedActive on Polygon. No probate, no trustee, no central authority — the chain itself is the executor.",
    deepLink: { to: "/info?tab=architecture&sub=business#death-proof", label: "Read the heartbeat detail →" },
  },
  {
    id: "self-custodial",
    question: "Can NoKLock see my seed, shares, or master password?",
    answer:
      "No. Every cryptographic step runs in your browser on your device. Our back-end never sees plaintext seeds, plaintext shares, your master password, or the master secret derived from it. Encrypted shares live in storage you pick — local folders or your own cloud accounts — with no NoKLock API access. Compare to Casa / Ledger Recover / Vault12 — all custody at least one share.",
    deepLink: { to: "/info?tab=architecture&sub=business#self-custodial", label: "Read the self-custody detail →" },
  },
  {
    id: "noklock-proof",
    question: "What happens if NoKLock disappears?",
    answer:
      "Your recovery and your inheritance still work. Your licence is on-chain (readable from any public RPC); restore is 100% client-side against your own clouds; the dead-man's switch runs on Polygon via Chainlink Automation. The app falls back to a public Polygon node if our RPC is down. Continuity is also written into our Terms.",
    deepLink: { to: "/info?tab=architecture&sub=business#noklock-proof", label: "Read the continuity detail →" },
  },
  {
    id: "providers",
    question: "Where do my encrypted shares actually go?",
    answer:
      "You pick. NoKLock only sees the share URLs you paste — never your accounts, never your other files. No OAuth, no API keys, no provider lock-in. Simple route: three folders on your own devices — already safer than a sticky note. Maximum security: 3+ providers from different jurisdictions. The full per-provider how-to (Google Drive, Dropbox, OneDrive, pCloud, MEGA, Box, Filen, Internxt, Yandex, IPFS, Arweave) lives on Info → Shares, with the optional noklock-cli speed-up.",
    deepLink: { to: "/info?tab=shares#providers", label: "Open the full provider list + how-to →" },
  },
];

export function Help(): JSX.Element {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold font-display"><span className="grad">Help &mdash; FAQ</span></h1>
        <p className="text-text-muted text-sm mt-2">
          Short answers to the questions people ask most. For the deep dive &mdash; process diagrams, primitive-level architecture, the FSM, and the full provider how-to &mdash; see Info.
        </p>
      </header>

      {/* Prominent top-of-page link to the canonical deep-dive. */}
      <section className="card border border-accent-cyan/40 bg-accent-cyan/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold font-display"><span className="grad">Looking for the full architecture?</span></h2>
            <p className="text-sm text-text-on-dark/85 mt-1">
              The deep technical write-up &mdash; primitives, contracts, FSM, share-storage how-tos &mdash; lives on Info. This page is the short version.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link to="/info?tab=architecture" className="btn btn-primary">Info &rarr; Architecture</Link>
            <Link to="/manual" className="btn btn-secondary">User manual</Link>
          </div>
        </div>
      </section>

      <nav className="card">
        <h2 className="font-bold font-display mb-3">Jump to</h2>
        <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
          {FAQS.map((f) => (
            <li key={f.id}>
              <a href={`#${f.id}`} className="text-accent-cyan hover:underline">{f.question}</a>
            </li>
          ))}
        </ul>
      </nav>

      {FAQS.map((f) => (
        <section key={f.id} id={f.id} className="card scroll-mt-20">
          <h2 className="text-xl font-bold font-display mb-3"><span className="grad">{f.question}</span></h2>
          <p className="text-base text-text-on-dark/90">{f.answer}</p>
          <p className="mt-3">
            <Link to={f.deepLink.to} className="text-accent-cyan hover:underline text-sm">{f.deepLink.label}</Link>
          </p>
        </section>
      ))}

      <section className="card text-center">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">Try it without enrolling</span></h2>
        <p className="text-sm text-text-muted mb-4">
          The Prove It page runs every cryptographic step end-to-end on a throwaway test seed generated in your browser right now. No real wallet, no real value, no obligation.
        </p>
        <Link to="/prove-it" className="btn btn-primary">Run the Prove It demo</Link>
      </section>
    </div>
  );
}
