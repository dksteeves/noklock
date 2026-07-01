// @version 0.3.2 @date 2026-06-10
// 0.3.2 — Daniel 2026-06-10: two-track refund reality surfaced in the "In
//         short" box and §3. "In short" previously said "License NFT
//         purchases are non-refundable" — a blanket statement that was only
//         accurate for crypto/on-chain purchases and omitted the statutory
//         14-day EU/BGB fiat right for Paddle subscribers. Updated to the
//         accurate two-track framing: on-chain (crypto/admin-grant) =
//         non-refundable; fiat (Paddle) = 14-day right of withdrawal applies.
//         §3 heading and body extended with the same two-track framing and
//         a link to /refund-policy as single source of truth. Last-updated
//         date bumped to 2026-06-10.
// 0.3.1 — Daniel 2026-06-07: storage-agnostic rewrite in §2 + §5.
//         §2 self-custody bullet now reads "You select your own share storage
//         — local folders on your devices, or cloud providers you choose
//         (Drive / Dropbox / OneDrive / IPFS / Arweave)" (was "your own
//         cloud storage providers"). §5 closing paragraph expanded from
//         "your own storage providers" to "your own chosen storage (local
//         folders on your devices, or cloud providers you selected)".
//         Matches the storage-primary positioning across the product.
// 0.3.0 — Daniel 2026-06-02: Defensible-position Terms paragraph added per
//         managed-wallet-legal-defensible-position-20260602.md. NEW §1a
//         "Nature of the Service; No Custody; No Financial Service."
//         inserted between §1 (Who we are) and §2 (Self-custody). Three-
//         paragraph block: (a) non-custodial wallet infrastructure, sharded
//         keys via TEE + authenticator — id.asserro / NoKLock / providers
//         cannot independently move user assets; (b) gas sponsorship is a
//         cost of delivering infrastructure (parallel to AWS bandwidth /
//         FCM notification delivery) — not a payment, loan, grant, deposit
//         or financial service; (c) explicit not-a-money-transmitter /
//         not-a-CASP posture citing 31 CFR § 1010.100(ff)(5)(ii)(A), MiCA
//         Recital 22, FCA non-custodial wallet guidance. Last-updated
//         bumped to 2026-06-02.
// 0.2.2 — Daniel: discreet operator-entity line below the "In short" box —
//         "noklock.app operates under Tenza Climate Solutions,
//         HRB 41384." Identifies the legal party to the agreement (no
//         new section, no jurisdiction implication beyond plain disclosure).
// 0.2.1 — Daniel-asked 2026-05-22: NEW §10 "Change of ownership and
//         continuity" — NoKLock has been approached about acquisition;
//         continuity of service for existing customers is a precondition
//         of any future change of ownership/control (licences honoured,
//         contracts immutable+operational, servers+services funded). Old
//         §10 Contact → §11, §11 Language → §12. Test count §7 154.
// 0.2.0 — Daniel-asked 2026-05-20: explicit § "User content + your
//         responsibility" covering legality / accuracy / completeness of
//         vault contents; succession-planning is owner's responsibility +
//         NoKLock is NOT a legal/financial/fiduciary adviser; we cannot
//         see what's in vaults (E2E-encrypted) and therefore have NO
//         obligation to verify any of it; sanctions / tax / jurisdiction
//         compliance is the user's responsibility. Updated outdated test
//         count "55 tests" → "148 tests" in §7. Bumped Last-updated.
// 0.1.4 — Summary box heading "TL;DR" → "In short".
// 0.1.3 — WS-C: new §11 "Language" — English is the sole authoritative /
//         governing version; no liability for translation errors;
//         functionality identical across languages; zh/hi are drafts
//         pending native review. (§9 already states English governs.)
// 0.1.2 — New §9 "Referral & affiliate programme": audited on-chain
//         contract is the sole/final arbiter; off-chain link is
//         best-effort; no off-chain record kept so no dispute
//         adjudication; not an investment/income promise; English
//         governs. Contact renumbered to §10.
// 0.1.1 — Section 7: bug-bounty programme replaced with beta-tester /
//         Lifetime-licence rewards model. Daniel 2026-05-15: no cash for
//         Immunefi; Lifetime adminMint is free for the owner to call and
//         self-selects engaged testers. Cash USDC bounty layered on top
//         only as treasury permits.
// 0.1.0 — Terms of Use.
//   - Software is BUSL-1.1 (source-visible, non-commercial use without licence)
//   - Service is offered AS-IS with NO WARRANTY
//   - User is responsible for their seed phrase, mnemonic, wallet, NoK choices
//   - License NFT purchases are non-refundable; non-transferable
//   - We never custody anything; we cannot recover what we never had
//   - Jurisdiction: deliberately neutral pending counsel review

import { Link } from "react-router-dom";
import { BRAND_NAME } from "../lib/brand.js";
import { useDocumentHead } from "../lib/seo.js";

export function Terms(): JSX.Element {
  useDocumentHead("/terms");
  return (
    <article className="prose-invert max-w-3xl mx-auto space-y-6 py-4">
      <header>
        <h1 className="text-4xl font-bold font-display"><span className="grad">Terms of Use</span></h1>
        <p className="text-text-muted mt-2">Last updated 2026-06-10.</p>
      </header>

      <section className="card space-y-2">
        <h2 className="text-xl font-bold">In short</h2>
        <p>
          {BRAND_NAME} is a self-custodial cryptography tool. We do not hold your
          keys, your data, or your money. We cannot recover what we never had.
          Use of {BRAND_NAME} is at your own risk. The software is provided AS-IS,
          no warranties. <strong>Refunds are two-track:</strong> on-chain payments
          in crypto (USDC) and admin-granted licences are non-refundable (smart
          contracts are irreversible); fiat (card/Paddle) subscriptions carry a
          statutory 14-day right of withdrawal under EU Directive 2011/83/EU and
          BGB §355 — see the{" "}
          <Link to="/refund-policy" className="text-accent-cyan hover:underline">Refund Policy</Link>{" "}
          for the full two-track policy.
        </p>
        <p className="text-xs text-text-muted pt-1 border-t border-bg-surface/40">
          <strong className="text-text-on-dark/80">Operator:</strong> noklock.app operates under Tenza Climate Solutions, HRB&nbsp;41384.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">1. Who we are</h2>
        <p>
          {BRAND_NAME} is operated as a self-custodial software service. The
          web app at <a href="https://noklock.app" className="text-accent-cyan hover:underline">noklock.app</a> and
          its back-end at <a href="https://api.noklock.app" className="text-accent-cyan hover:underline">api.noklock.app</a> together
          constitute the service. Smart contracts on Polygon mainnet form the
          on-chain layer.
        </p>
      </section>

      <section id="section-1a">
        <h2 className="text-2xl font-bold mb-3">1a. Nature of the service; no custody; no financial service</h2>
        <p>
          {BRAND_NAME} (including the id.asserro Managed-mode wallet, where
          offered) is a <strong>non-custodial wallet infrastructure service</strong>.
          We do not at any time take custody of, hold, transfer, or control
          your digital assets or the cryptographic private keys that authorise
          transactions involving those assets. In the self-custody model you
          alone generate and hold your keys. In Managed mode (where offered),
          the embedded-wallet key is generated and custodied by our managed-wallet
          provider, which states that it shards that key across Trusted Execution
          Environments and authenticator-bound factors so that no single party can
          independently access or move your assets; {BRAND_NAME} itself never
          holds, sees, or can access that key. You alone are the owner and
          controller of your digital assets; you alone authorise every transaction.
        </p>
        <p className="mt-2">
          Where we sponsor network "gas" (the protocol-native compute cost of
          executing a transaction on the underlying public blockchain), we do
          so as <strong>a cost of delivering our infrastructure service to
          you</strong>, in the same way a cloud provider absorbs bandwidth or
          a messaging provider absorbs notification delivery. Such sponsorship
          is not a payment, loan, grant, transfer of value, deposit, or
          financial service. Gas is consumed by the public protocol and is
          not transferred to or held by any counterparty.
        </p>
        <p className="mt-2">
          {BRAND_NAME} does not provide money transmission, custody, deposit,
          investment, exchange, brokerage, lending, payment, or any other
          regulated financial service. We provide <strong>software,
          communications, and network access services</strong> that enable
          you to interact with public blockchain infrastructure. To the
          extent any jurisdiction classifies our service differently, the
          carve-outs in (e.g.) 31 CFR § 1010.100(ff)(5)(ii)(A), MiCA
          Regulation (EU) 2023/1114 Recital 22, and the FCA's non-custodial
          wallet guidance reflect the appropriate regulatory treatment of
          our role.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">2. Self-custody — you control everything</h2>
        <ul className="list-disc list-inside space-y-1 text-text-on-dark/90">
          <li>You hold your own wallet, seed phrase, master password, and recovery shares.</li>
          <li>You select your own share storage — local folders on your devices, or cloud providers you choose (Drive / Dropbox / OneDrive / IPFS / Arweave).</li>
          <li>You designate your own next-of-kin (NoK) wallets or emails.</li>
          <li>You configure your own dead-man's-switch grace period.</li>
          <li>{BRAND_NAME} has no copy of any of the above. We cannot help you recover them if you lose them.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">3. Refunds — two-track policy</h2>
        <p>
          <strong>On-chain (crypto) purchases — non-refundable.</strong>{" "}
          When you mint a {BRAND_NAME} licence NFT by paying in USDC, that
          payment is transferred to our treasury wallet via the on-chain License
          contract. <strong>This is irreversible.</strong> Smart contracts cannot
          reverse on-chain payments. Admin-granted licences (minted via{" "}
          <code>adminMint</code>) were never paid and are likewise non-refundable
          in the monetary sense. Case-by-case service credit or replacement may
          apply — see{" "}
          <Link to="/refund-policy" className="text-accent-cyan hover:underline">Refund Policy</Link>.
        </p>
        <p className="mt-2">
          <strong>Fiat (card/Paddle) subscriptions — 14-day right of withdrawal.</strong>{" "}
          If you subscribed using a card, bank transfer, Apple Pay, Google Pay or
          any other fiat method processed via our merchant of record (Paddle), you
          have a statutory <strong>14-day right of withdrawal</strong> under BGB
          §355 and EU Directive 2011/83/EU. Within 14 calendar days of purchase
          you may cancel for any reason and receive a full refund to your original
          payment method — no questions asked. {BRAND_NAME} voluntarily honours
          this right even after the Article 16(m) digital-service waiver, provided
          you have not irrevocably minted or used a NoKMint on-chain. After the
          14-day window, subscription cancellation stops renewal at the end of the
          current billing period; pro-rata refunds are reviewed on request. Full
          details:{" "}
          <Link to="/refund-policy" className="text-accent-cyan hover:underline">Refund Policy →</Link>
        </p>
        <p className="mt-2">
          You may burn (downgrade) a licence NFT at any time via the on-chain
          burn function. Burning does not return USDC. Recurring tiers expire
          off-chain after their billing window; re-mint to renew. The Lifetime
          tier never expires and may only be minted once per wallet.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">4. AS-IS, no warranty</h2>
        <p>
          The {BRAND_NAME} software is licensed under <a href="https://spdx.org/licenses/BUSL-1.1.html" className="text-accent-cyan hover:underline" target="_blank" rel="noopener noreferrer">BUSL-1.1</a>. You may inspect the source, audit the cryptography, and run
          it on your own infrastructure for non-commercial use. The software is
          provided "AS IS", without warranty of any kind, express or implied,
          including but not limited to merchantability, fitness for a particular
          purpose, and non-infringement. In no event shall the authors,
          contributors, or {BRAND_NAME} operators be liable for any claim,
          damages, or other liability arising from your use of the software.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">5. Acceptable use</h2>
        <ul className="list-disc list-inside space-y-1 text-text-on-dark/90">
          <li>Do not use {BRAND_NAME} to store, transmit, or enable the recovery of unlawful content.</li>
          <li>Do not use {BRAND_NAME} to circumvent applicable financial-reporting or sanctions law in your jurisdiction.</li>
          <li>Do not designate NoK wallets you know to belong to sanctioned individuals or entities.</li>
          <li>Do not attempt to disrupt the service for other users (denial-of-service, malicious RPC abuse, etc.).</li>
        </ul>
        <p className="mt-2">
          We reserve the right to refuse mints, freeze the RPC proxy for IPs
          showing abusive patterns, or restrict access to the PWA — but we
          cannot affect what is already in your own chosen storage (local
          folders on your devices, or cloud providers you selected) or your
          on-chain identity.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">5a. User content + your responsibility</h2>
        <p>
          {BRAND_NAME} lets you encrypt and inheritably store seed phrases,
          sealed letters, documents, and images. Because every share is
          encrypted end-to-end in your browser before it leaves the page,
          <strong> {BRAND_NAME} cannot see, read, scan, classify, or otherwise
          access the contents of any vault</strong>. This applies to us, our
          employees, our contractors, any back-end server we operate, and any
          third party we contract with. It is true by architecture, not by
          policy.
        </p>
        <p className="mt-2">
          Because we cannot see vault contents:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong>We have no obligation to verify the legality, accuracy,
            completeness, currency, or suitability</strong> of anything you
            store in a vault. We do not know what is in there. We cannot
            check. We make no representation about your content.
          </li>
          <li>
            <strong>You are solely responsible</strong> for what you store,
            who you designate as next-of-kin to receive it, and how that
            information is used after release. This includes whether your
            sealed letter accurately describes the location of a safe, the
            PIN of a hardware wallet, the credentials of a bank account, or
            anything else — only you know if the information is current and
            correct.
          </li>
          <li>
            <strong>{BRAND_NAME} is not a legal, financial, tax, estate, or
            fiduciary adviser.</strong> The product is a cryptographic vault.
            A sealed letter or document vault is a complement to a properly
            drafted will or trust — not a substitute. For real succession
            planning, work with a qualified attorney in your jurisdiction.
          </li>
          <li>
            <strong>You are responsible for compliance with applicable law
            in your jurisdiction</strong>, including (where applicable) tax
            reporting, gift / inheritance / wealth-transfer law, sanctions
            screening, financial-services disclosure, anti-money-laundering
            rules, and content laws. {BRAND_NAME} does not perform KYC, does
            not screen content, and does not file reports on your behalf.
          </li>
          <li>
            <strong>You are responsible for the rights you have in stored
            content</strong> — that you own it, have lawful access to it,
            and have authority to designate it for inheritance.
            {" "}{BRAND_NAME} accepts no liability for content claims
            (copyright, privacy, defamation, IP infringement, etc.) that
            may arise after release to a next-of-kin.
          </li>
          <li>
            <strong>Sanctioned content / persons.</strong> You may not
            knowingly designate a next-of-kin wallet or email that belongs
            to a sanctioned person or entity (see §5 Acceptable use). You
            are responsible for screening your own designations.
          </li>
          <li>
            <strong>Post-release behaviour is the heir's responsibility.</strong>
            {" "}Once the dead-man's switch fires and a next-of-kin can
            access the content, what they do with it is governed by their
            own legal duties (probate, tax, fiduciary, custodial). {BRAND_NAME}
            has no ongoing relationship with the heir.
          </li>
        </ul>
        <p className="mt-3 text-text-muted">
          In short: we built a strong, self-custodial vault. What you put
          into it, and what your heirs do with what comes out, is yours.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">6. Dead-man's-switch + NoK inheritance</h2>
        <p>
          If your wallet stops sending heartbeat signals for longer than your
          configured grace period, the on-chain Oracle activates the soul-bound
          NFTs (SBTs) held by your designated NoKs. The NoKs can then use those
          SBTs (in combination with their own configured shares) to recover the
          content you protected.
        </p>
        <p className="mt-2">
          <strong>{BRAND_NAME} cannot intervene to prevent or trigger
          activation.</strong> If you anticipate not being able to send a
          heartbeat (travel, illness, etc.), extend your grace period in advance
          via the Settings page.
        </p>
      </section>

      <section id="section-7">
        <h2 className="text-2xl font-bold mb-3">7. Smart-contract risk + Bug Bounty + Beta Tester Programme</h2>
        <p>
          Smart contracts can contain bugs. {BRAND_NAME}'s contracts have been
          unit-tested (154 tests at last release on Solidity 0.8.35), reviewed
          externally pre-deploy across multiple independent passes, and the
          deployed bytecode is source-verified on PolygonScan. SolidityScan
          review reports are published in-app at <Link to="/info?tab=contracts" className="text-accent-cyan hover:underline">Info → Contracts</Link>.
          Use of the on-chain layer is nevertheless at your own risk.
        </p>
        <p className="mt-2">
          If you discover a bug or vulnerability, please email{" "}
          <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>.
          Verified reports earn a free Lifetime tier licence NFT, minted to a
          wallet address of your choice via the on-chain {BRAND_NAME}License
          contract's <code>adminMint</code> function. Critical findings (smart-contract
          drain, key-leak, recovery-flow bypass) additionally earn public
          acknowledgement and may earn a USDC reward as treasury permits.
        </p>
        <p className="mt-2">
          Early users who complete a full enrol-and-restore cycle and submit
          structured feedback also qualify for the Beta Tester Programme — a
          free Lifetime licence in exchange for real-world testing. Details
          in-app once the programme opens.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">8. Changes to these terms</h2>
        <p>
          We may revise these terms when the service or its legal posture
          changes. The "Last updated" date at the top of this page records the
          most recent revision. Material changes (changes that affect your
          rights, fees, or obligations) will be announced in-app before they
          take effect.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">9. Referral &amp; affiliate programme</h2>
        <p>
          The optional referral programme is executed entirely by the audited,
          publicly verifiable {BRAND_NAME}License smart contract on Polygon. By
          sharing a referral link or otherwise participating, you agree that:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            the on-chain contract is the <strong>sole and final arbiter</strong> of all
            attribution, discounts, credit and payouts — only its recorded
            state is recognised;
          </li>
          <li>
            the browser-local link mechanism is a convenience that is
            <strong> best-effort and not guaranteed</strong>; a referral not locked
            on-chain at the referee's first paid mint confers no entitlement;
          </li>
          <li>
            {BRAND_NAME} keeps <strong>no off-chain record of referrals by design</strong>
            (consistent with our zero-tracking commitment) and therefore
            <strong> cannot and does not adjudicate attribution disputes</strong>;
          </li>
          <li>
            referral credit and affiliate USDC are a discount / revenue-share
            on a software purchase — they are <strong>not an investment, deposit,
            security, or promise of income</strong>, and nothing on the referral
            pages is financial, tax or legal advice;
          </li>
          <li>
            programme parameters (currently a 10% referee discount, a 10%
            referrer share of what the referee pays, and a 5-referral
            affiliate threshold) are
            owner-tunable on-chain within hard caps, may change
            prospectively, and every change emits a public on-chain event.
          </li>
        </ul>
        <p className="mt-2">
          Where these terms are displayed in a language other than English,
          the <strong>English version is authoritative and governs</strong>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">10. Change of ownership and continuity</h2>
        <p>
          {BRAND_NAME} has been approached about acquisition. We regard
          continuity of service for existing customers as a precondition of any
          future change of ownership or control of {BRAND_NAME}. Accordingly,
          should such a change occur, we will require — as a binding condition of
          the transaction — that the acquirer or successor:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>honours <strong>every existing customer licence and entitlement in full</strong>, on the same terms;</li>
          <li>keeps the deployed smart contracts on Polygon <strong>immutable and operational</strong> (they are immutable by design and cannot be altered regardless of who controls the company);</li>
          <li>keeps the <strong>supporting servers and services funded and operational</strong> (the back-end service, email delivery, the RPC proxy, and this web app) for as long as necessary to honour the above.</li>
        </ul>
        <p className="mt-2">
          This obligation exists to protect existing customers across any
          transition. It <strong>supplements, and does not replace, the trustless core</strong>:
          your recovery and your wallet-based next-of-kin inheritance already
          function with no dependence on {BRAND_NAME} continuing to exist (see the
          "NoKLock-proof" section at <Link to="/info?tab=architecture" className="text-accent-cyan hover:underline">Info → Architecture</Link>). The continuity
          commitment additionally protects the convenience layer — the optional
          off-chain heartbeat and the email-only next-of-kin flow — which is the
          part that does rely on our servers.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">11. Contact</h2>
        <p>
          Questions, abuse reports, or legal notices: <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">12. Language</h2>
        <p>
          {BRAND_NAME} may be displayed in several languages. The{" "}
          <strong>English version of these terms and of all in-app text is
          the sole authoritative and legally governing version</strong>;
          every other language is a convenience translation only.
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>If a translation conflicts with or differs from the English in any respect, <strong>the English text prevails</strong>.</li>
          <li>{BRAND_NAME} accepts <strong>no liability for translation errors, omissions, or ambiguities</strong> in any non-English version.</li>
          <li>The software's functionality, security and on-chain behaviour are <strong>identical in every language</strong> — translation changes wording only, never what the product does.</li>
          <li>Chinese (简体) and Hindi (हिन्दी) are pending native-speaker review and should be treated as drafts; rely on the English for anything consequential.</li>
        </ul>
      </section>

      <p className="text-text-muted">
        <Link to="/" className="text-accent-cyan hover:underline">← Back to home</Link>
      </p>
    </article>
  );
}
