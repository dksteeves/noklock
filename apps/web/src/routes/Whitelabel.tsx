// @version 0.4.0 @date 2026-05-28
// 0.4.0 — Daniel: "update whitelabel .. too heavy on inheritacen not enough
//         on our reframing to seed store restore safety first then nok etc
//         as options at user discretion". Reframed in the same direction as
//         the consumer reframe pass: the headline product is
//         SELF-CUSTODIAL CRYPTOGRAPHIC BACKUP (protect a seed / sealed
//         letter / document / image; recover on any browser any time).
//         Inheritance / NoK / Hybrid-E / dead-man's switch / Live-Man's
//         Switch are now the OPTIONAL layers your users add at their
//         discretion. The "Who this is for" rewritten to lead with the
//         backup wedge per audience type. Hero H1 + lede + What's
//         whitelabelled intro all rewritten. Commercial / delivery / CTA
//         unchanged from 0.3.0.
// 0.3.0 — Daniel: "is 30pc enough for them?". Reframed the Commercial-
//         structure section: rev-share is now a BAND (25-50%) scoped to
//         partnership type, not a flat 30%. Added a "Delivery model"
//         section explaining the one-bundle / multi-tenant approach +
//         the two domain options (partner's own domain via CNAME default,
//         NoKLock subdomain fallback) so partners stop assuming separate
//         instances. Updated the regional-licensee row to note the
//         higher-end of the band fits that profile.
// 0.2.0 — Daniel: + Calendly link (calendly.com/noklockapp/30min) as a
//         dual CTA next to "Get in touch" mailto in the bottom design-
//         partner section. H1 brand string fixed: was hard-coded
//         "{BRAND_NAME} White" (with space + capital W); now "NoKLock.white"
//         to match the rest of the site convention.
// 0.1.0 — /whitelabel — public landing page for NoKLock.white (whitelabel of
// the consumer NoKLock app for B2B resellers — wallet providers, exchanges,
// estate-planning firms, regional licensees). Phase 2 before Q3 2026.
//
// Same visual chrome as the rest of NoKLock (no brand departure — this IS
// NoKLock, just sold under partner brands). Content sourced from the
// corp-fo-spinoff-strategy doc \'a77a.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/seo.js";
import { BRAND_NAME } from "../lib/brand.js";

export function Whitelabel(): JSX.Element {
  useDocumentHead("/whitelabel");
  const [copied, setCopied] = useState(false);
  const mailto = "mailto:hello@noklock.app?subject=NoKLock%20White%20%E2%80%94%20reseller%20enquiry&body=Hi%20%E2%80%94%20interested%20in%20NoKLock%20White%20for%20%5Bcompany%5D.%20Audience%3A%20%5B...%5D%20Expected%20volume%3A%20%5B...%5D%20Best%20way%20to%20reach%20me%3A%20%5B...%5D";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="space-y-3">
        <span className="tier-badge bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/40">
          NoKLock.white — Phase 2 · before Q3 2026
        </span>
        <h1 className="text-4xl font-bold font-display">
          <span className="grad">{BRAND_NAME}.white</span>
          <span className="text-text-on-dark"> — self-custodial cryptographic backup, your brand.</span>
        </h1>
        <p className="text-text-on-dark/90 text-lg max-w-3xl">
          Run a wallet, an exchange, an estate-planning practice, a regional crypto licence? Offer your users a serious answer to "how do I back up my seed without trusting a vendor with it?" — under your own brand, your own domain, your own legal entity. We never hold any of their keys.
        </p>
        <p className="text-accent-cyan text-base italic max-w-3xl mt-2">
          Protect your users' seeds first; inheritance is an optional layer they add at their discretion.
        </p>
      </header>

      <section className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">What's whitelabelled</span></h2>
        <p className="text-text-on-dark/85 text-sm mb-2">
          The exact same source-verified {BRAND_NAME} app you can use today on noklock.app — but YOUR brand on every surface. The core product is <strong className="text-text-on-dark">cryptographic backup the user fully controls</strong>: split + encrypt their seed (or sealed letter / document / image) across THEIR own cloud accounts, recover on any browser any time, with end-to-end primitives the user can verify (Argon2id + Shamir + AEAD + Ed25519-signed manifest, all browser-side, no server-held key material).
        </p>
        <p className="text-text-on-dark/85 text-sm mb-4">
          On top of that base, your users can optionally add: <strong className="text-text-on-dark">an inheritance layer</strong> (3-role soulbound NFTs to next-of-kin), <strong className="text-text-on-dark">Hybrid-E email-bound escrow</strong> (designate someone who doesn't have a wallet yet), the <strong className="text-text-on-dark">dead-man's switch</strong> (Chainlink-automated, fires only on real inactivity), and the <strong className="text-text-on-dark">Live-Man's Switch</strong> (out-of-band alert if anyone ever tries to recover one of their wallets). Each layer is opt-in per vault, set by the user, never required.
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <ParamBlock title="Brand + theme" body="Per-tenant logo, colour tokens, product name, support email, legal entity, jurisdiction clause. Loaded from a tenant config endpoint at boot — no rebuild per partner." />
          <ParamBlock title="Domain" body="Run it on your-domain.com / your-domain.app / wallet.your-domain.com via CNAME, with our SSL automation handling the cert chain." />
          <ParamBlock title="Contracts" body="Shared contracts with per-tenant namespace (your users' SBTs + escrow attestations are clearly attributable to your tenant). Per-tenant deploy as an enterprise upgrade if regulators ask." />
          <ParamBlock title="Fee splits" body="The on-chain referral programme extends — visiting your link gets the buyer 10% off; you earn a configurable share (typically 30%) of every paid licence on your tenant. Settled in USDC at mint." />
          <ParamBlock title="Email + SMTP" body="Per-tenant email-from + SMTP overrides. Your branding on every transactional email (heir activation, etc) — never ours." />
          <ParamBlock title="Terms + Privacy" body="Per-tenant Terms hash + DPA — your legal entity is the named operator, not us. We're the infrastructure provider you white-label." />
          <ParamBlock title="Analytics" body="Per-tenant analytics partition + a scoped admin role that only sees your tenant's slice. Same zero-PII posture: no cookies, no trackers." />
          <ParamBlock title="Support" body="You handle T1 support under your brand; we handle T2 protocol-level on a documented SLA. Joint escalation playbook." />
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Who this is for — and the wedge for each</span></h2>
        <ul className="text-sm text-text-on-dark/90 space-y-2">
          <li><strong className="text-text-on-dark">Wallet providers</strong> — your users hold the seeds today, and most of them have no working backup beyond a screenshot or a note. Give them a real backup story under YOUR brand — split across their own cloud accounts, restorable on any device, never custodied. Inheritance, dead-man's switch and Live-Man alerts are bolt-ons they enable when they're ready.</li>
          <li><strong className="text-text-on-dark">Crypto-native exchanges + neobanks</strong> — bundled "self-custody backup" perk for higher-tier subscribers. Solves the support burden of "I lost my seed" without ever taking custody. The succession features upsell on top.</li>
          <li><strong className="text-text-on-dark">Estate-planning practices + crypto-aware law firms</strong> — your clients have crypto your wills can't move. The first sell is the seed-backup story (something they can show the family is recoverable); the will sits alongside the optional on-chain inheritance layer.</li>
          <li><strong className="text-text-on-dark">Regional licensees</strong> — DACH / UK / APAC / LATAM operators who want a localised backup-first {BRAND_NAME} under their own legal entity and language. Sell backup to the broad market; sell inheritance to the segment that asks for it.</li>
          <li><strong className="text-text-on-dark">Hardware-wallet OEMs</strong> — pair the hardware seed-store with a software backup-and-recovery layer your customers actually use, plus an optional on-chain inheritance path. The recovery story sells the hardware.</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Commercial structure</span></h2>
        <p className="text-text-on-dark/85 text-sm mb-3">Hybrid — gives us both real skin in the game and our resellers a predictable cost line. Rev-share is a band, not a flat number — set by what you actually carry.</p>
        <ul className="text-sm text-text-on-dark/90 space-y-2">
          <li><strong>Setup:</strong> one-off ~$15K — parameterisation + DNS / SSL / branded email setup + a one-day onboarding.</li>
          <li><strong>Platform fee:</strong> ~$1.5K / month — covers ongoing hosting, SSL renewal, contract upgrades, T2 protocol-level support.</li>
          <li><strong>Rev-share band: 25–50%</strong> of licence revenue you originate, scoped to partnership type:
            <ul className="mt-1 ml-4 space-y-0.5 text-xs text-text-on-dark/85">
              <li><strong>25–30%</strong> — channel-already-built (existing wallet provider / exchange bolts NoKLock onto a tier they already sell, your CAC effectively zero).</li>
              <li><strong>35–45%</strong> — you build the audience: regional fintech, crypto-aware law / estate-planning practice, content-led acquisition.</li>
              <li><strong>45–55%</strong> — full localised regional licensee (own legal entity + locale + KYC carry + local language + T1 support).</li>
            </ul>
          </li>
        </ul>
        <p className="text-text-muted text-xs mt-3">
          Settlement: the 10% on-chain referrer share goes to your tenant wallet at every paid mint automatically (no claim step). Any rev-share above 10% is settled off-chain in USDC monthly from treasury — when volume justifies it, we redeploy License with per-tenant <code>referrerShareBps</code> to make the full share on-chain too.
        </p>
        <p className="text-text-muted text-xs mt-2">
          Numbers above are indicative. Each partnership scoped to your audience size + expected volume + regulatory context — talk to us before assuming.
        </p>
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span className="grad">Delivery model — one bundle, your brand, your domain</span></h2>
        <p className="text-text-on-dark/85 text-sm mb-3">
          {BRAND_NAME}.white is <strong>not</strong> a separate instance per partner. It's the same source-verified {BRAND_NAME} bundle, served on YOUR domain, that loads YOUR tenant config at boot.
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <ParamBlock title="Default — your own domain via CNAME" body="vault.your-domain.com / inheritance.your-domain.com / your-brand.app. You add a CNAME pointing at our hosting; we automate Let's Encrypt for the cert chain. The URL bar reads YOUR brand, which is the whole point of whitelabel. Standard SaaS pattern (Stripe, Auth0, Vercel, Shopify all do it this way)." />
          <ParamBlock title="Fallback — NoKLock subdomain" body="your-brand.noklock.app — zero setup, working in 5 minutes. Trade-off: the URL says noklock.app (some brand bleed). Fine as a starter; partners typically graduate to their own domain." />
        </div>
        <p className="text-text-muted text-xs mt-3">
          <strong>How the one-bundle works:</strong> the PWA reads <code>window.location.hostname</code> at boot → fetches <code>{"/v1/tenant-config?host=…"}</code> from our API → applies your logo, theme tokens, product name, legal entity, support email, referrer wallet. Shared on-chain contracts; per-tenant data path; per-tenant terms hash. No per-tenant deploy, no per-tenant CI, no per-tenant secrets sprawl. <strong>Separate full instance</strong> available as an enterprise option if a regulator demands it — fights the shared-contract upgrade path though, so we recommend against it unless you have a specific compliance reason.
        </p>
      </section>

      <section className="card text-center">
        <h2 className="text-2xl font-bold font-display mb-2"><span className="grad">First design-partner reseller wanted</span></h2>
        <p className="text-text-on-dark/85 max-w-2xl mx-auto mb-4">
          We're parameterising the consumer app in a 4-6 week sprint for one design-partner. If you've got a list of users who could use inheritance, get in touch — we'll bias the build to your stack and onboard you first.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="https://calendly.com/noklockapp/30min" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Book a 30-min call ↗</a>
          <a href={mailto} className="btn btn-secondary">Drop a note →</a>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              void navigator.clipboard?.writeText("hello@noklock.app").then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
          >
            {copied ? "Copied hello@noklock.app ✓" : "Copy email"}
          </button>
          <Link to="/corporate" className="btn btn-secondary">For enterprise / FO — see NoKLock.corporate →</Link>
        </div>
      </section>
    </div>
  );
}

function ParamBlock({ title, body }: { readonly title: string; readonly body: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3">
      <div className="font-bold font-display text-sm mb-1 text-accent-cyan">{title}</div>
      <div className="text-xs text-text-on-dark/80 leading-relaxed">{body}</div>
    </div>
  );
}
