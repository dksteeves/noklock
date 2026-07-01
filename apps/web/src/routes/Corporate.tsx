// @version 0.3.0 @date 2026-05-28
// 0.3.0 — Daniel: + Calendly link (calendly.com/noklockapp/30min) wired as
//         a dual CTA next to the "Get in touch" mailto on both hero + bottom
//         design-partner section. Bottom section copy "we are running 5" →
//         "we are having and would love to have you join us" per Daniel.
// 0.2.0 — Daniel: QuorLock + every alt name was taken. Holding pattern is
//         "NoKLock.corporate" (sub-brand suffix) for now — final name TBD.
//         Route moved /quorlock → /corporate. Visual: still emerald-tinted
//         (sister positioning reads at a glance) but text/copy no longer
//         says "QuorLock" anywhere.
// 0.1.0 — public landing page for the sister corp / FO / institutional
//         self-custodial governance product. Visually departs from NoKLock
//         chrome: emerald accent, distinct hero gradient, enterprise tone.
//
// CONTENT sourced from docs/corp-fo-spinoff-strategy.rtf + Research v2;
// minus the 10-50 quota numbers (replaced with "x+" — no artificial caps
// before the real customers tell us what they need).

import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/seo.js";
import { BRAND_NAME } from "../lib/brand.js";

const EMERALD = "#10b981";
const EMERALD_SOFT = "rgba(16, 185, 129, 0.12)";
const EMERALD_BORDER = "rgba(16, 185, 129, 0.45)";

// Display brand for the sister product. Daniel 2026-05-30: renamed
// from `${BRAND_NAME}.corporate` placeholder to "Asserro" — final brand.
// Outbound links/Calendly stay on the noklock side until the sister
// site is live; the brand-name change is purely user-facing copy.
const CORP_BRAND = "Asserro";
const ASSERRO_URL = "https://asserro.com";
const CALENDLY_URL = "https://calendly.com/noklockapp/30min";

export function Corporate(): JSX.Element {
  useDocumentHead("/corporate");
  const [copied, setCopied] = useState(false);
  const mailto = `mailto:hello@noklock.app?subject=${encodeURIComponent(CORP_BRAND)}%20%E2%80%94%20FO%2Fcorp%20enquiry&body=Hi%20%E2%80%94%20interested%20in%20${encodeURIComponent(CORP_BRAND)}%20for%20%5Borg%2Ffund%2Ffirm%5D.%20Use%20case%3A%20%5B...%5D%20Approx%20signers%3A%20%5B...%5D%20Best%20way%20to%20reach%20me%3A%20%5B...%5D`;

  return (
    <div className="space-y-8">
      {/* Distinct hero — emerald gradient, NOT NoKLock cyan-teal */}
      <section
        className="rounded-2xl p-8 md:p-12 border"
        style={{
          background: `linear-gradient(135deg, ${EMERALD_SOFT} 0%, transparent 65%), linear-gradient(180deg, rgba(15,23,42,0.6), rgba(15,23,42,1))`,
          borderColor: EMERALD_BORDER,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          {/* Logo placeholder — emerald lock glyph in a rounded square.
              Shape echoes the NoKLock logo; only the tint differs. Real
              artwork TBD. */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-2xl"
            style={{ background: EMERALD_SOFT, color: EMERALD, border: `1px solid ${EMERALD_BORDER}` }}
            aria-label={`${CORP_BRAND} logo placeholder`}
          >
            N
          </div>
          <span className="tier-badge" style={{ background: EMERALD_SOFT, color: EMERALD, border: `1px solid ${EMERALD_BORDER}` }}>
            {CORP_BRAND} — sister product · Q4 2026
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
          <span style={{ color: EMERALD }}>Self-custodial governance</span>
          <span className="text-text-on-dark"> for corporate treasury, family offices and crypto-native institutions.</span>
        </h1>
        <p className="text-text-on-dark/90 text-lg mt-4 max-w-3xl">
          Built on the same source-verified core as {BRAND_NAME} — but with the controls a CFO, GC, or family-office COO actually needs. No provider key share, ever. Anyone can verify that, on-chain, without asking us.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {/* 0.x — Asserro brand site live (or placeholder) at asserro.com.
              Primary CTA goes there; Calendly + email stay as secondary. */}
          <a
            href={ASSERRO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold transition-opacity hover:opacity-90"
            style={{ background: EMERALD, color: "#0a1a14" }}
          >
            Visit asserro.com ↗
          </a>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold border transition-colors hover:bg-bg-deepest"
            style={{ borderColor: EMERALD_BORDER, color: EMERALD }}
          >
            Book a 30-min call ↗
          </a>
          <a
            href={mailto}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold border transition-colors hover:bg-bg-deepest"
            style={{ borderColor: EMERALD_BORDER, color: EMERALD }}
          >
            Drop a note →
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold border transition-colors hover:bg-bg-deepest"
            style={{ borderColor: EMERALD_BORDER, color: EMERALD }}
            onClick={() => {
              void navigator.clipboard?.writeText("hello@noklock.app").then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
          >
            {copied ? "Copied hello@noklock.app ✓" : "Copy email"}
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-text-muted hover:text-text-on-dark"
          >
            Back to consumer {BRAND_NAME} →
          </Link>
        </div>
      </section>

      <section
        className="rounded-2xl p-6 md:p-8 border"
        style={{ borderColor: EMERALD_BORDER, background: EMERALD_SOFT }}
      >
        <h2 className="text-2xl font-bold font-display mb-4" style={{ color: EMERALD }}>Why {CORP_BRAND} — three things no enterprise competitor combines</h2>
        <ol className="space-y-4 text-sm md:text-base text-text-on-dark/90">
          <li><strong style={{ color: EMERALD }}>1. We don't hold any of your keys.</strong> Anyone can verify that, on-chain, without asking us. Fireblocks / BitGo MPC / Anchorage / Liminal / Cobo / GK8 / Hex Trust / Copper — all hold a co-signer or key share. We don't. Structurally.</li>
          <li><strong style={{ color: EMERALD }}>2. Your governance survives us.</strong> If we vanish tomorrow, your treasury keeps working. Source-verified contracts on Polygon; multisig you can rotate from your own wallets; no vendor lock-in by design.</li>
          <li><strong style={{ color: EMERALD }}>3. Built for the day someone in your org dies, quits, or is held at gunpoint.</strong> Per-signer dead-man's switch. Duress mode (silent panic alert + frozen withdrawals). Hybrid-E for non-crypto signers (your family lawyer / accountant / non-crypto principal can be a signer without holding a wallet). Nobody else has this.</li>
        </ol>
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold font-display mb-3"><span style={{ color: EMERALD }}>What ships in v1</span></h2>
        <p className="text-text-on-dark/85 text-sm mb-4">
          Building on the existing source-verified {BRAND_NAME} core (cryptographic primitives + SBT pattern + Hybrid-E + Chainlink-automated dead-man's switch + Live-Man's alerts), {CORP_BRAND} adds the operational-governance layer that consumer {BRAND_NAME} deliberately doesn't have.
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <FeatureBlock title="Quorum + RBAC" body="Configurable m-of-n at the vault level AND per-policy / per-amount thresholds. Initiator / Approver / Auditor / Admin / Viewer roles, scope-able per vault. Sub-accounts / business-unit segregation." />
          <FeatureBlock title="Withdrawal-policy DSL" body="Address allowlists. Velocity caps (daily / weekly / per-asset). Time-locks on amounts above your threshold. Per-destination dual-control rules." />
          <FeatureBlock title="Audit log + SIEM export" body="Append-only, signed, daily Merkle-anchored on-chain. Real-time export to Splunk / Datadog / AWS EventBridge / Syslog. Quarterly position-statement exporter for accountants + auditors." />
          <FeatureBlock title="Signer rotation + succession" body="Documented + tested + UI'd rotation flow (multisig owner-swap; address stays the same in practice via a thin governance contract). Per-signer dead-man's switch — each signer designates their own backup. Nobody else offers this." />
          <FeatureBlock title="Duress / coercion defence" body="Panic code triggers a silent alert + frozen withdrawals (without revealing the freeze to the coercer). Live-Man's Switch alerts for each signer's own out-of-band reach." />
          <FeatureBlock title="Hybrid-E for non-crypto signers" body="A family lawyer, an accountant, a non-crypto-native principal can be a signer or heir without ever holding a wallet. Email-bound escrow rebinds to a fresh wallet at claim time. Already shipping on consumer NoKLock; carries straight over." />
          <FeatureBlock title="Optional KYC + sanctions" body="Per-vault opt-in: Chainalysis / TRM / Elliptic address-screen pre-broadcast + Travel Rule attestation for transfers between custodians. Off by default — self-custody honesty." />
          <FeatureBlock title="Compliance reporting" body="SOC 2 Type 1 → Type 2 path (vCISO + auditor to be engaged). MiCA-aligned quarterly client-position statement exporter. Audit-trail bundles for regulator filings + period-end attestations." />
        </div>
        <p className="text-xs text-text-muted mt-4">
          <strong>Scale:</strong> no artificial seat or account caps — your org gets x+ signers / vaults / sub-accounts shaped to what you actually run. Pricing scoped to the relationship, not a per-seat table.
        </p>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold font-display mb-2" style={{ color: EMERALD }}>What we deliberately don't do</h2>
        <ul className="text-sm text-text-on-dark/85 space-y-2">
          <li><strong>No MPC sidecar.</strong> Multisig is the trade-off we own — it's source-verified on-chain rulebook code, not a vendor black box. Signer-rotation is a deliberate event, not a Tuesday — that's a feature for a treasury team, not a bug.</li>
          <li><strong>No federal trust-charter.</strong> We're the governance layer, not a custodian — there's nothing for a regulator to charter because we hold nothing.</li>
          <li><strong>No $1B Lloyd's insurance wrapper.</strong> Your funds are in your wallets under your signers' keys; there's nothing for us to insure (and nothing to be slow-claimed against if a competitor's HSM operator gets compromised).</li>
        </ul>
      </section>

      <section
        className="rounded-2xl p-6 md:p-8 border text-center"
        style={{ borderColor: EMERALD_BORDER, background: `linear-gradient(180deg, ${EMERALD_SOFT}, transparent)` }}
      >
        <h2 className="text-2xl font-bold font-display mb-2" style={{ color: EMERALD }}>Talking to design-partner orgs now</h2>
        <p className="text-text-on-dark/85 max-w-2xl mx-auto mb-4">
          We're having customer-discovery conversations with family offices, MFOs, RIAs, and crypto-native corp treasuries before committing to the full v1 build — and we would love to have you join us. If this is the gap in your stack, book a call or drop a note.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold transition-opacity hover:opacity-90"
            style={{ background: EMERALD, color: "#0a1a14" }}
          >
            Book a 30-min call ↗
          </a>
          <a
            href={mailto}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold border transition-colors hover:bg-bg-deepest"
            style={{ borderColor: EMERALD_BORDER, color: EMERALD }}
          >
            Drop a note — hello@noklock.app →
          </a>
        </div>
        <p className="text-xs text-text-muted mt-4">
          {CORP_BRAND} is a working name. Sister product to {BRAND_NAME} — same cryptographic core, governance-grade surface. Building / not yet shippable. No engagement letter required for the discovery call.
        </p>
      </section>
    </div>
  );
}

function FeatureBlock({ title, body }: { readonly title: string; readonly body: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-3">
      <div className="font-bold font-display text-sm mb-1" style={{ color: EMERALD }}>{title}</div>
      <div className="text-xs text-text-on-dark/80 leading-relaxed">{body}</div>
    </div>
  );
}
