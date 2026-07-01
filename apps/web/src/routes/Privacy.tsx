// @version 0.6.1 @date 2026-06-07
// 0.6.1 — Daniel 2026-06-07: storage-agnostic rewrite. Four places previously
//         said "cloud accounts" or "configured storage providers" — all four
//         now lead with local folders + cloud providers as equal options.
//         Touched: "In short" card (was "stored in your cloud accounts"),
//         "What we cannot see" section (was "encrypted shares go to your
//         cloud accounts"), "Cookies" section (was "your own configured
//         storage providers"), "Your rights" section (was "your share data
//         lives in your own cloud accounts"). Matches storage-primary
//         positioning across the product.
// 0.6.0 — Daniel 2026-06-02: Defensible-position Terms paragraph added per
//         managed-wallet-legal-defensible-position-20260602.md. Privacy
//         page now carries a cross-reference line pointing readers to
//         Terms §1a (Nature of the Service) for the non-custodial,
//         non-financial-service position. Added inline below the "In short"
//         operator line so it surfaces immediately. Last-updated bumped to
//         2026-06-02.
// 0.5.0 — Daniel: explicit GDPR/cookies card. We set zero cookies, run no
//         third-party trackers, collect no personal identifiers — so there
//         is nothing to consent to and no cookie banner is shown by design.
//         Names the controller (Tenza Climate Solutions, HRB 41384)
//         + the user's GDPR rights (mostly N/A by construction). Honest:
//         the on-chain wallet/timestamp data is public by design.
// 0.4.1 — Daniel: discreet controller-identity line below the "In short" box —
//         "noklock.app operates under Tenza Climate Solutions,
//         HRB 41384." Names the operating entity for GDPR-style "data
//         controller" purposes without changing the substantive zero-PII
//         posture (we still hold almost nothing identifiable).
// 0.4.0 — Daniel-asked 2026-05-20: explicit "What we cannot see + what
//         that means for our obligations" section. NoKLock cannot see
//         vault contents (E2E-encrypted in the browser) and therefore
//         has no obligation to verify, screen, or filter what users put
//         into their vaults. Mirrors the Terms §5a "User content + your
//         responsibility" stance on the privacy side. Bumped Last-updated.
// 0.3.1 — Summary box heading "TL;DR" → "In short".
// 0.3.0 — VERACITY (audit A1): the page claimed two emails (heartbeat
//         reminder + NoK-activation) "are sent". The heartbeat-reminder
//         email is INFEASIBLE — NoKLock keeps no owner email (wallet-
//         only). Rewritten to the truth: no reminder email to you ever;
//         exactly ONE email (NoK-activation), only for email-designated
//         NoKs, sent strictly off the on-chain NoKActivated event by the
//         new Form B email-watcher, SMTP-delivery-dependent.
// 0.2.1 — WS-D/WS-E veracity: Email-policy section now states the two
//         emails are an OPT-IN, best-effort convenience on top of the
//         trustless on-chain dead-man's switch (canonical path needs no
//         email); "Changes" section no longer says "if we ever add
//         Postmark" (we use a standard SMTP mailbox, no marketing/email
//         provider) — removes the internal contradiction.
// 0.2.0 — Round 3 wave 3: explicit "Email policy" section breaks out the
//         two transactional emails we DO send (only if user opts in to the
//         dead-man's switch flow and configures email there) from the
//         general "no email collection" posture. Closes the email decision
//         Daniel made 2026-05-15: zero general email list, transactional-
//         only for heartbeat-reminder + NoK-activation.
// 0.1.0 — initial Privacy notice.
// Privacy notice. NoKLock's privacy posture is "we never had it":
//   - zero cookies, zero session storage, zero per-user analytics
//   - no email / phone / address ever asked, ever collected, ever stored
//   - wallet address is the only identifier and lives only on the public chain
//   - share contents NEVER leave the user's browser — encrypted client-side
//   - on-chain stores hashes + AEAD-encrypted manifests, never plaintext PII
//   - back-end (Form B) only proxies RPC + escrow-attests email→wallet rebinds
//   - Polygon RPC sees Form B's server IP, never the user's
//
// This file is canon. Update when any data flow changes.

import { Link } from "react-router-dom";
import { BRAND_NAME } from "../lib/brand.js";
import { useDocumentHead } from "../lib/seo.js";

export function Privacy(): JSX.Element {
  useDocumentHead("/privacy");
  return (
    <article className="prose-invert max-w-3xl mx-auto space-y-6 py-4">
      <header>
        <h1 className="text-4xl font-bold font-display"><span className="grad">Privacy</span></h1>
        <p className="text-text-muted mt-2">Last updated 2026-06-02.</p>
      </header>

      <section className="card space-y-2">
        <h2 className="text-xl font-bold">In short</h2>
        <p>
          {BRAND_NAME} cannot leak what it never has. We collect no email, no name, no
          phone, no IP, no cookies, no analytics events. Your seed, your sealed
          letters, your documents, your shares — all encrypted in your browser and
          stored in <em>your</em> chosen storage (local folders on your devices,
          or cloud providers you select — Drive, Dropbox, OneDrive, IPFS, Arweave).
          We literally cannot read them. The only things on our public smart
          contracts are pseudonymous addresses, hashes, and AEAD ciphertext pointers.
        </p>
        <p className="text-xs text-text-muted pt-1 border-t border-bg-surface/40">
          <strong className="text-text-on-dark/80">Controller:</strong> noklock.app operates under Tenza Climate Solutions, HRB&nbsp;41384.
        </p>
        <p className="text-xs text-text-muted">
          See <Link to="/terms#section-1a" className="text-accent-cyan hover:underline">Terms § 1a (Nature of the Service)</Link> for our non-custodial, non-financial-service position.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-2xl font-bold mb-1"><span className="grad">GDPR / DSGVO</span></h2>
        <p className="text-text-on-dark/90 text-sm">
          We are aware of EU GDPR / DSGVO and Germany's BDSG. We built {BRAND_NAME} so that compliance is achieved by <strong>not collecting anything personal</strong>, not by paperwork on top of collection.
        </p>
        <ul className="list-disc list-inside space-y-1 text-text-on-dark/90 text-sm">
          <li><strong>No cookies.</strong> {BRAND_NAME} sets zero cookies — first-party or third-party. That is why you see no cookie banner: there is nothing to consent to.</li>
          <li><strong>No third-party trackers.</strong> No Google Analytics, no Meta Pixel, no LinkedIn Insight, no Hotjar, no Segment, no advertising pixels of any kind.</li>
          <li><strong>No identifiers stored server-side.</strong> No name, email, phone, address, IP logging, browser fingerprint, or device ID. (Wallet addresses are public on-chain data anyone can already see and are not "personal data" without external linkage we never perform.)</li>
          <li><strong>No PII to subject-access.</strong> Article 15 / 16 / 17 / 20 rights (access, rectification, erasure, portability) effectively don't apply because there is no personal record to access, correct, erase, or port. We hold nothing about you personally.</li>
          <li><strong>Optional opt-in email.</strong> The only personal field we ever take is an optional email for the Live-Man's Switch alert. That email is stored encrypted at rest, used solely for the wrongful-recovery alert it was given for, and can be removed at any time from Settings — full Article 17 erasure on demand.</li>
        </ul>
        <p className="text-xs text-text-muted">
          <strong className="text-text-on-dark/80">Controller / Verantwortlicher:</strong> Tenza Climate Solutions, HRB&nbsp;41384. Questions: <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>. No DPO is appointed because Article 37 thresholds are not met (no large-scale processing of personal or special-category data).
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">What we never collect</h2>
        <ul className="list-disc list-inside space-y-1 text-text-on-dark/90">
          <li><strong>No personal info.</strong> No email, name, phone, postal address, date of birth, government ID.</li>
          <li><strong>No cookies, no localStorage tracking, no fingerprinting.</strong> The PWA stores nothing on your device beyond what a service-worker needs to function offline.</li>
          <li><strong>No analytics events tied to identity.</strong> If we ever add aggregate analytics (e.g. "how many vaults enrolled this week") it will be Plausible or equivalent — privacy-first, no individual-user data.</li>
          <li><strong>No share contents.</strong> Encryption, splitting, and signing all run in your browser. The plaintext seed/letter/document is never transmitted anywhere.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">What lives on the public Polygon chain</h2>
        <ul className="list-disc list-inside space-y-1 text-text-on-dark/90">
          <li>Your wallet address (pseudonymous).</li>
          <li>The {BRAND_NAME} licence NFT you mint (tier + mint date).</li>
          <li>For each NoK you designate: a soul-bound NFT (SBT) at the NoK's wallet address, plus the keccak256 hash of (NoK email + per-vault salt) — the email itself is never on-chain.</li>
          <li>A heartbeat timestamp for your wallet (so the dead-man's-switch can fire).</li>
          <li>The IPFS CID of an AEAD-encrypted manifest describing your shares. Without your derived key, the ciphertext is indistinguishable from random bytes.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">What our back-end (api.noklock.app) does</h2>
        <p className="mb-2">
          The Form B Node service exists for exactly two reasons:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-text-on-dark/90">
          <li>
            <strong>RPC proxy for IP privacy.</strong> When your wallet reads
            blockchain data, the read goes through our server instead of straight
            to a public Polygon RPC. That way the upstream RPC operator only sees
            our server's IP, never yours. The proxy caches read-only calls for a
            few seconds; it never modifies your transactions and cannot sign
            anything.
          </li>
          <li>
            <strong>Hybrid-E escrow attestation.</strong> If you designate a NoK
            by email (instead of by wallet address), the server signs an attestation
            that the email's owner controls the destination wallet at activation
            time. The attestation is verified on-chain. The server stores the
            keccak256 hash of (email + salt), never the email itself.
          </li>
        </ol>
        <p className="mt-2">
          The server runs no analytics, no session tracking, no user account
          system. Logs are kept for 24 hours strictly for debugging and rotated
          out.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">What we cannot see — and what that means for our obligations</h2>
        <p className="mb-2">
          Every vault you create (seed phrase, sealed letter, document, image)
          is encrypted in your browser, on your device, before any bytes leave
          the page. The encryption key is derived from <em>your</em> master
          password via Argon2id — a key {BRAND_NAME} has never seen and cannot
          recover. The encrypted shares go to <em>your</em> chosen storage —
          local folders on your devices, or cloud providers you select (Drive,
          Dropbox, OneDrive, IPFS, Arweave). The on-chain layer holds only
          hashes and pointers, never plaintext.
        </p>
        <p className="mb-2">
          That architecture means {BRAND_NAME} <strong>cannot see</strong>:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-3 text-text-on-dark/85">
          <li>the words of your seed phrase or sealed letter;</li>
          <li>the contents of any document or image you store;</li>
          <li>the master password you used to derive the encryption key;</li>
          <li>whether the content is lawful, accurate, current, or complete;</li>
          <li>whether the next-of-kin email or wallet you designated belongs to the person you think it belongs to.</li>
        </ul>
        <p className="mb-2">
          Because we cannot see these things, we <strong>have no obligation
          to verify</strong> them. We do not screen vault content for
          legality. We do not scan for prohibited material. We do not
          classify or moderate what you put in. We do not perform KYC on
          you or on your designated heirs. We have no commitment to detect
          tax-reportable assets, sanctions-listed parties, or content that
          might be illegal in any specific jurisdiction.
        </p>
        <p className="mb-2">
          That posture is intentional. Privacy is genuine here only because
          we built ourselves out of the position to surveil you. The
          flip-side is that the legality, accuracy, and consequences of
          everything in your vaults are <strong>your responsibility</strong>.
          The Terms of Use § "User content + your responsibility" sets this
          out in full; this Privacy notice records the architectural reason.
        </p>
        <p className="text-text-muted">
          If a court in your jurisdiction issues a valid subpoena requiring
          {BRAND_NAME} to produce data about you, we can produce only what we
          actually hold: your pseudonymous wallet address (already public on
          Polygon), the keccak256 hash of any next-of-kin email you registered
          (irreversible), and standard server-debug logs which are wiped
          every 24 hours. We do not hold your seed, your master password,
          your shares, your sealed letters, your documents, your images, or
          your real name. We cannot produce what we do not have.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Cookies</h2>
        <p>
          {BRAND_NAME} sets no cookies of any kind. The PWA stores cryptographic
          shares only in your own chosen storage — local folders on your devices,
          or cloud providers you select (Google Drive, Dropbox, OneDrive, IPFS,
          Arweave — your accounts, not ours).
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Email policy — there are exactly two emails we ever send</h2>
        <p className="mb-3">
          {BRAND_NAME} runs no marketing list. There is no newsletter, no
          announcement blast, no drip campaign, no behavioural retargeting.
          Visit the <Link to="/updates" className="text-accent-cyan hover:underline">Updates page</Link> to see what's new on your schedule.
        </p>
        <p className="mb-3">
          {BRAND_NAME} has no account, password, or email <em>for you</em> —
          you are identified only by your wallet address. It therefore
          cannot and does not email <em>you</em> (no reminders, no nudges).
          There is exactly <strong>one</strong> transactional email, and only
          if you choose the email-based next-of-kin option:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-text-on-dark/90">
          <li>
            <strong>NoK-activation notice.</strong> When the on-chain
            dead-man's switch activates the inheritance SBT (fired by
            Chainlink Automation on Polygon — not by us), each next-of-kin
            you designated <strong>by email</strong> receives a single email
            pointing them to the recovery flow. It is sent automatically off
            the on-chain activation event — never on a timer or guess. No
            marketing, no tracking pixels, no links other than the recovery
            URL. If you designate next-of-kin by wallet address only, no
            email is ever sent by anyone.
          </li>
        </ol>
        <p className="mt-3 text-text-muted">
          That email is a convenience layered on the <strong>trustless
          on-chain dead-man's switch</strong>: it is sent only <em>after</em>
          on-chain activation and depends on our mail service being
          reachable. The canonical inheritance path lives entirely on-chain
          and does <strong>not</strong> depend on any email being delivered.
          There is <strong>no</strong> reminder email to you — you check in
          via the app or directly on-chain (<code>selfHeartbeat</code>); the
          switch only fires after the full grace period elapses with no
          check-in.
        </p>
        <p className="mt-3">
          Any next-of-kin email you provide is stored only as a salted
          keccak256 hash on-chain. The hash is the same length whether the
          email is "a@b.c" or "very.long.email@some-domain.tld" — it tells
          our contracts nothing about the plaintext. The plaintext is held
          only in our Form B back-end (encrypted at rest, in the
          transactional queue) and is wiped from logs within 24 hours of send.
        </p>
        <p className="mt-3 text-text-muted">
          If you do not use the dead-man's-switch feature, {BRAND_NAME} never
          asks for your email at any point in the product.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Wallet connection</h2>
        <p>
          Connecting your wallet via WalletConnect uses Reown's relay protocol.
          That relay handles the encrypted message channel between your wallet
          app and our PWA. We do not control Reown's privacy posture — see their
          policy at <a href="https://reown.com/privacy-policy" className="text-accent-cyan hover:underline" target="_blank" rel="noopener noreferrer">reown.com/privacy-policy</a>. Disconnect at any time.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Your rights</h2>
        <p>
          You have no DSGVO / GDPR data-subject rights to exercise against us
          because we have no personal data about you to give back, correct, or
          delete. Your share data lives in your own chosen storage — local
          folders on your devices, or cloud providers you select — so manage it
          there. Your on-chain footprint is yours alone; we cannot redact a
          public blockchain. If you have questions about a specific data flow,
          email <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Changes</h2>
        <p>
          Transactional email (the two opt-in dead-man's-switch messages
          above) is delivered via a standard SMTP mailbox; no third-party
          marketing/analytics email provider is used, and the zero-PII
          posture above is unchanged. If we ever expand what the back-end
          touches, this page will be updated to say so before the change
          ships. The change date is at the top.
        </p>
      </section>

      <p className="text-text-muted">
        <Link to="/" className="text-accent-cyan hover:underline">← Back to home</Link>
      </p>
    </article>
  );
}
