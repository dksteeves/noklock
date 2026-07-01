// @version 0.2.0 @date 2026-06-03
// 0.2.0 — Reconciled with docs/refund-policy-de-eu-2026-06-03.md so the
//         rendered page is a faithful HTML version of the canonical MD.
//         P1: "14 business days" → calendar-day phrasing throughout the
//         policy stack. P2/P6: "non-refundable once minted" opening
//         replaced with crypto framing that mirrors MD section 4 — the
//         on-chain payment is irreversible, but service credit /
//         replacement / off-chain fiat hardship refund may apply
//         case-by-case. P3: operator identity (Tenza Climate Solutions
//         Germany, HRB 41384) kept consistent with Privacy/Terms/Info.
//         P4: durable-medium acknowledgment (Paddle receipt = Art. 7(2)
//         confirmation) added to waiver section. P5: governing law
//         simplified — German law subject to mandatory consumer
//         protection of buyer's country of residence. UK-entity branch
//         dropped.
// 0.1.0 — Initial Refund Policy page. Public route at /refund-policy.
//         Visually consistent with /privacy + /terms (same prose-invert
//         max-w-3xl container, same "In short" card, same section
//         typography). Sourced from REFUND_POLICY_TEXT below — single
//         const string, rendered as <h2> + <p> per section so the
//         policy is one obvious source of truth and can be exported
//         straight to a PDF / RTF if needed.
//
// SEO meta is wired via useDocumentHead("/refund-policy"). If/when a
// matching ROUTE_SEO entry lands in lib/seo.ts, the per-page <title>,
// description, canonical and OG/Twitter tags will populate; until then
// the page falls through to index.html's static meta (safe default).
//
// CTAs at the bottom:
//   - "Request refund (Settings)" — internal <Link> to /settings, where
//     the licence-NFT receipt is shown alongside the refund-request form.
//   - "Contact refunds@noklock.app" — mailto: anchor.

import { Link } from "react-router-dom";
import { BRAND_NAME } from "../lib/brand.js";
import { useDocumentHead } from "../lib/seo.js";

interface Section {
  readonly heading: string;
  readonly body: string;
}

// Policy copy lives here as a single const so the page is one source of
// truth. Add / reorder sections by editing this array — render loop below
// emits <h2> + <p> for each entry.
const REFUND_POLICY_TEXT: readonly Section[] = [
  {
    heading: "In short",
    body:
      `Once a licence NFT is minted on-chain, the payment cannot be reversed on-chain — but ` +
      `service credit, replacement, or off-chain fiat hardship refund may be available ` +
      `case-by-case. For fiat (card / Paddle) subscriptions you have a statutory 14-day ` +
      `right of withdrawal under EU Directive 2011/83/EU and BGB §355, and ${BRAND_NAME} ` +
      `voluntarily honours it even after the Article 16(m) waiver — provided you have not ` +
      `irrevocably minted or used a NoKMint. Edge cases are reviewed individually — email us, ` +
      `we read every message.`,
  },
  {
    heading: "The 14-day right of withdrawal (fiat subscriptions)",
    body:
      `If you paid for a ${BRAND_NAME} subscription with a card, bank transfer, Apple Pay, ` +
      `Google Pay, or any other fiat method processed through our merchant of record (Paddle), ` +
      `you have a 14-day right of withdrawal under BGB §355 and EU Directive 2011/83/EU. ` +
      `Within 14 calendar days of your purchase you can cancel for any reason or none at all, ` +
      `and we will refund 100% of what you paid back to the original payment method. You do ` +
      `not have to give a reason. You just have to tell us within the window.`,
  },
  {
    heading: `The "immediate use" waiver (Article 16(m))`,
    body:
      `${BRAND_NAME} is a digital service. Article 16(m) of Directive 2011/83/EU lets a ` +
      `provider start delivering a digital service immediately if the buyer explicitly agrees ` +
      `and acknowledges they are giving up the 14-day withdrawal right. At checkout you tick ` +
      `a box to that effect — the Paddle-standard waiver. Paddle emails you a checkout ` +
      `receipt that includes the waiver acknowledgment; this is the durable-medium ` +
      `confirmation required by Art. 7(2) of Directive 2011/83/EU. Even with the waiver ticked, ` +
      `${BRAND_NAME} voluntarily honours a full refund inside the first 14 days provided you ` +
      `have not irrevocably created or used a NoKMint (the on-chain heir attestation that is ` +
      `the core service). Subscribing, exploring the app, configuring heirs, generating shares ` +
      `offline — none of that counts as "consumption". The line is crossed only when a NoKMint ` +
      `is minted on-chain or a live-man's-switch is triggered.`,
  },
  {
    heading: "After day 14 — pro-rata refunds",
    body:
      `If you cancel after the 14-day window has closed, your subscription stops renewing at ` +
      `the end of the current billing period. We do not automatically refund the unused ` +
      `portion. That said, if you have a reasonable case — moved to a country we do not serve, ` +
      `medical hardship, lost the wallet the subscription was tied to — write to ` +
      `refunds@noklock.app and we will consider a pro-rata refund of the unused portion at ` +
      `our discretion. We approve these more often than we deny them.`,
  },
  {
    heading: "Crypto payments (USDC, MATIC, any chain) — read carefully",
    body:
      `On-chain transactions are irreversible. Once your USDC or MATIC has hit our treasury ` +
      `wallet, there is no "chargeback" button anywhere on Earth that can reverse it — this ` +
      `is not a policy choice, it is a property of the blockchain. So crypto purchases are ` +
      `technically final. But we do not hide behind that. Our actual policy: we cannot ` +
      `reverse the on-chain payment itself; we can and often do issue a service credit of ` +
      `equivalent value applied to your ${BRAND_NAME} account; we can and often do issue a ` +
      `replacement (extend your subscription, transfer it to another wallet you control, or ` +
      `apply it to a different ${BRAND_NAME} product); and in genuine hardship cases we will ` +
      `discuss an off-chain refund in fiat at the spot rate at time of purchase. This is ` +
      `handled case-by-case — write to refunds@noklock.app with your transaction hash and a ` +
      `brief explanation. We aim to reply within 5 business days.`,
  },
  {
    heading: "How to request a refund",
    body:
      `The fastest path: open the ${BRAND_NAME} app and go to Settings → /refund, choose the ` +
      `subscription or charge you want refunded and submit the form. You will receive an ` +
      `email confirmation at the address on file within minutes. Paddle initiates the refund ` +
      `within 1-2 business days; funds arrive at your original payment method within 14 ` +
      `calendar days (issuer-dependent, typically 3-10 business days for cards) — we cannot ` +
      `redirect to a different card or account. If you cannot reach the in-app form ` +
      `(cancelled wallet, lost access, account locked), email refunds@noklock.app directly ` +
      `with your order ID or transaction hash. We will process it the same way.`,
  },
  {
    heading: "When refunds are not granted automatically",
    body:
      `A refund will not be approved automatically — though you can still appeal to ` +
      `refunds@noklock.app — if any of the following has happened: an heir has already ` +
      `claimed a NoKMint under your account (the service has delivered its core value); the ` +
      `live-man's-switch has fired and on-chain inheritance has been triggered; more than 6 ` +
      `months have passed since the original charge with no contact from you; or the account ` +
      `is under fraud investigation or has been flagged for terms-of-service violations. In ` +
      `these cases we will explain in writing why the refund is declined and what ` +
      `alternatives exist (credit, partial refund, transfer).`,
  },
  {
    heading: "Jurisdiction and your rights",
    body:
      `${BRAND_NAME} is operated from Germany by Tenza Climate Solutions ` +
      `(HRB 41384). German law governs, subject to mandatory consumer-protection law of your ` +
      `country of residence. For EU-resident buyers we treat EU consumer protection law as ` +
      `paramount, specifically BGB §312g + §355 (withdrawal rights for distance contracts), ` +
      `EU Directive 2011/83/EU (Consumer Rights Directive), and Regulation (EU) 524/2013 ` +
      `(Online Dispute Resolution platform): https://ec.europa.eu/consumers/odr. Nothing in ` +
      `this policy limits any statutory right you have as a consumer.`,
  },
  {
    heading: "Changes to this policy",
    body:
      `We will update this page if the law changes or our practice changes. The effective ` +
      `date at the top reflects the current version. Material changes will be announced ` +
      `in-app and by email at least 30 days before they take effect for existing subscribers. ` +
      `Operator: ${BRAND_NAME} operates under Tenza Climate Solutions, HRB 41384.`,
  },
];

export function RefundPolicy(): JSX.Element {
  useDocumentHead("/refund-policy");
  return (
    <article className="prose-invert max-w-3xl mx-auto space-y-6 py-4">
      <header>
        <h1 className="text-4xl font-bold font-display">
          <span className="grad">Refund Policy</span>
        </h1>
        <p className="text-text-muted mt-2">Last updated 2026-06-03.</p>
      </header>

      {REFUND_POLICY_TEXT.map((s, i) => {
        const isShort = s.heading === "In short";
        return (
          <section
            key={s.heading}
            className={isShort ? "card space-y-2" : undefined}
          >
            <h2
              className={
                isShort
                  ? "text-xl font-bold"
                  : "text-2xl font-bold mb-3"
              }
            >
              {isShort ? s.heading : <span>{s.heading}</span>}
            </h2>
            <p>{s.body}</p>
            {i === 0 && (
              <p className="text-xs text-text-muted pt-1 border-t border-bg-surface/40">
                <strong className="text-text-on-dark/80">Operator:</strong>{" "}
                noklock.app operates under Tenza Climate Solutions,
                HRB&nbsp;41384.
              </p>
            )}
          </section>
        );
      })}

      <section className="card space-y-3">
        <h2 className="text-xl font-bold">Take action</h2>
        <p className="text-text-on-dark/90 text-sm">
          The fastest path is from the receipt card in Settings — it auto-fills
          the wallet address, mint transaction hash and tier. Or email us
          directly; a human reads every message.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            to="/settings"
            className="inline-flex items-center justify-center rounded-md bg-accent-cyan text-bg-base font-bold px-4 py-2 hover:opacity-90"
          >
            Request refund (Settings)
          </Link>
          <a
            href="mailto:refunds@noklock.app"
            className="inline-flex items-center justify-center rounded-md border border-accent-cyan text-accent-cyan font-bold px-4 py-2 hover:bg-accent-cyan/10"
          >
            Contact refunds@noklock.app
          </a>
        </div>
      </section>

      <p className="text-text-muted">
        <Link to="/" className="text-accent-cyan hover:underline">
          ← Back to home
        </Link>{" "}
        ·{" "}
        <Link to="/terms" className="text-accent-cyan hover:underline">
          Terms of Use
        </Link>{" "}
        ·{" "}
        <Link to="/privacy" className="text-accent-cyan hover:underline">
          Privacy
        </Link>
      </p>
    </article>
  );
}
