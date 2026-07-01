// @version 0.3.0 @date 2026-06-05
// 0.3.0 — Daniel 2026-06-05: TWO changes:
//         (1) AskAnAI widget copied from Info → Competitors tab and placed at
//             the TOP of /compare (above the comparison categories) — same
//             "ask a neutral AI" framing pushes visitors to verify our claims
//             via Perplexity / ChatGPT / Claude / Google in a new tab.
//             Reinforces the AEO flywheel + addresses Daniel's observation
//             that the AI tools (Perplexity, ChatGPT, Claude) frequently fail
//             to find NoKLock pages and mis-compare it to Ledger Recover.
//         (2) The three category sections (Crypto inheritance / Digital
//             legacy / Managed-wallet adjacency) are now ACCORDIONS — only
//             one open at a time, all collapsed by default on mount. Page
//             is materially shorter on first paint; users pick the category
//             they care about. Crypto inheritance defaults to open since
//             it's the most-trafficked category. Each accordion preserves
//             the internal Section structure (Top-end / Lighter / etc.).
// 0.2.0 — Competitors-tab reorg follow-on. CompareIndex now groups by the
//         new Comparison.category field (crypto-inheritance / digital-legacy
//         / managed-wallet) rather than by tier. Adds the new /compare/managed
//         slug (Privy / Web3Auth / Magic / Dynamic / Coinbase Smart Wallet
//         summary) per managed-wallet-competitors-tab-reorg-20260602.md §10
//         step 4. Within crypto-inheritance, tier-based sub-grouping (top /
//         low) is retained for visual scannability. Password-manager
//         category DELIBERATELY OMITTED — per Daniel's positioning
//         realignment brief (2026-06-02) they are complements, not
//         competitors, and surfaced as a paragraph in CompetitorTable.tsx.
// 0.1.0 — /compare (index) + /compare/:slug — head-to-head comparison pages
//         for AEO (Daniel 2026-05-22). Data in data/comparisons.ts. Honest
//         tone; each page carries a "verify with the provider" note. Linked
//         from the CompetitorTable. Prerendered for bots via gen-prerender.mjs.

import { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { COMPARISONS, comparisonBySlug, COMPARE_NOTE, NOKLOCK_LIFETIME_ONCE, type Comparison } from "../data/comparisons.js";
import { useDocumentHead } from "../lib/seo.js";
import { AskAnAI } from "../components/AskAnAI.js";

export function Compare(): JSX.Element {
  const { slug } = useParams();
  const { pathname } = useLocation();
  useDocumentHead(pathname);
  const c = slug ? comparisonBySlug(slug) : undefined;
  return c ? <CompareOne c={c} /> : <CompareIndex />;
}

type AccordionKey = "crypto" | "legacy" | "managed";

function CompareIndex(): JSX.Element {
  const cryptoTop = COMPARISONS.filter((c) => c.category === "crypto-inheritance" && c.tier === "top");
  const cryptoLow = COMPARISONS.filter((c) => c.category === "crypto-inheritance" && c.tier === "low");
  const legacy = COMPARISONS.filter((c) => c.category === "digital-legacy");
  const managed = COMPARISONS.filter((c) => c.category === "managed-wallet");
  // 0.3.0 — crypto-inheritance defaults open (highest-traffic category);
  // the other two stay collapsed until clicked.
  const [open, setOpen] = useState<AccordionKey | null>("crypto");
  const toggle = (key: AccordionKey): void => setOpen(open === key ? null : key);
  return (
    <article className="space-y-6 max-w-3xl mx-auto">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold font-display"><span className="grad">NoKLock vs the alternatives</span></h1>
        <p className="text-lg text-text-on-dark/90 leading-relaxed">
          Honest, side-by-side comparisons across two categories — crypto-inheritance products and
          digital-legacy / post-mortem tools — plus the managed-wallet adjacency. Our column is verifiable
          on PolygonScan right now; theirs is a conservative reading of their public positioning. Where a
          rival is genuinely strong, we say so.
        </p>
      </header>

      <AskAnAI />

      <CategoryAccordion
        title="Crypto inheritance"
        blurb="Direct rivals — products built specifically for crypto inheritance / key recovery."
        isOpen={open === "crypto"}
        onToggle={() => toggle("crypto")}
        count={cryptoTop.length + cryptoLow.length}
      >
        <Section title="Top-end" items={cryptoTop} />
        <Section title="Lighter / lower-cost" items={cryptoLow} />
      </CategoryAccordion>

      <CategoryAccordion
        title="Digital legacy & post-mortem"
        blurb="Where a non-crypto user goes today when planning end-of-life. None handle crypto, on-chain triggers, or self-custody — NoKLock is the bridge."
        isOpen={open === "legacy"}
        onToggle={() => toggle("legacy")}
        count={legacy.length}
      >
        <Section title="Legacy planning" items={legacy} />
      </CategoryAccordion>

      <CategoryAccordion
        title="Managed-wallet adjacency"
        blurb="Passkey / MPC wallet infrastructure — the building blocks NoKLock — Managed wraps inside an inheritance product."
        isOpen={open === "managed"}
        onToggle={() => toggle("managed")}
        count={managed.length}
      >
        <Section title="Adjacent — not a direct competitor" items={managed} />
      </CategoryAccordion>

      <section className="card border-accent-teal/40">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">Complementary tools — password managers</span></h2>
        <p className="text-text-on-dark/90 leading-relaxed">
          <span className="font-bold">1Password, Bitwarden, Dashlane, Proton Pass and Apple Passwords handle your 200 daily logins.
          NoKLock handles the one master password that unlocks them</span> — plus the seed, the sealed letter, the
          safe-deposit photo. They're not competitors; we suggest you use them together. Store your
          password-manager master password in a NoKLock letter vault.
        </p>
      </section>
      <p className="text-xs text-text-muted">{COMPARE_NOTE}</p>
      <p className="text-sm">
        Prefer the full feature matrix?{" "}
        <Link to="/info?tab=competitors" className="text-accent-cyan hover:underline">See the full competitor table on Info →</Link>
      </p>
    </article>
  );
}

function CategoryAccordion({
  title,
  blurb,
  isOpen,
  onToggle,
  count,
  children,
}: {
  readonly title: string;
  readonly blurb: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly count: number;
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 text-left p-3 rounded-lg border border-bg-surface hover:border-accent-cyan transition-colors"
      >
        <div className="flex-1">
          <h2 className="text-xl font-bold font-display"><span className="grad">{title}</span></h2>
          <p className="text-sm text-text-muted mt-1">{blurb}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-text-muted">{count} {count === 1 ? "entry" : "entries"}</span>
          <span aria-hidden="true" className="text-accent-cyan font-mono text-lg">{isOpen ? "▼" : "▶"}</span>
        </div>
      </button>
      {isOpen && <div className="space-y-3 pl-2">{children}</div>}
    </section>
  );
}

function Section({ title, items }: { readonly title: string; readonly items: readonly Comparison[] }): JSX.Element {
  return (
    <section className="space-y-2">
      <h2 className="text-sm uppercase tracking-wider text-accent-cyan font-bold">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((c) => (
          <Link key={c.slug} to={`/compare/${c.slug}`} className="card hover:border-accent-cyan block">
            <div className="font-bold font-display text-lg">NoKLock vs {c.name}</div>
            <div className="text-xs text-text-muted mt-1">{c.tagline}</div>
            <div className="text-accent-cyan text-sm mt-2">Compare →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CompareOne({ c }: { readonly c: Comparison }): JSX.Element {
  const others = COMPARISONS.filter((x) => x.slug !== c.slug);
  return (
    <article className="space-y-6 max-w-3xl mx-auto">
      <header className="space-y-2">
        <p className="text-sm"><Link to="/compare" className="text-accent-cyan hover:underline">← all comparisons</Link></p>
        <h1 className="text-3xl font-bold font-display"><span className="grad">NoKLock vs {c.name}</span></h1>
        <p className="text-text-muted">{c.tagline}</p>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-bg-surface">
              <th className="py-2 pr-3 font-normal text-text-muted"></th>
              <th className="py-2 pr-3 font-bold font-display text-accent-teal">NoKLock</th>
              <th className="py-2 font-bold font-display text-text-on-dark">{c.name}</th>
            </tr>
          </thead>
          <tbody>
            {c.rows.map((r) => (
              <tr key={r.dim} className="border-b border-bg-surface/40 align-top">
                <td className="py-2 pr-3 text-text-muted">{r.dim}</td>
                <td className="py-2 pr-3 text-text-on-dark">{r.noklock}</td>
                <td className="py-2 text-text-on-dark/80">{r.them}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="card border-accent-teal/40">
        <h2 className="font-bold font-display mb-2"><span className="grad">The honest verdict</span></h2>
        <p className="text-text-on-dark/90 leading-relaxed">{c.verdict}</p>
      </section>

      <section className="card">
        <h2 className="font-bold font-display mb-1"><span className="grad">Cost over time</span></h2>
        <p className="text-text-muted text-xs mb-3">{c.cost.note}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-bg-surface align-bottom">
                <th className="text-left py-2 pr-4 font-bold">You keep it for…</th>
                <th className="py-2 px-2 text-center font-bold">{c.name}<div className="text-xs text-text-muted font-normal mt-0.5">{c.cost.label}</div></th>
                <th className="py-2 px-2 text-center font-bold"><span className="grad">NoKLock Lifetime</span><div className="text-xs text-text-muted font-normal mt-0.5">${NOKLOCK_LIFETIME_ONCE} once</div></th>
              </tr>
            </thead>
            <tbody>
              {[5, 25, 50].map((y) => (
                <tr key={y} className="border-b border-bg-surface/40">
                  <td className="py-2 pr-4 text-text-on-dark/90">{y} years</td>
                  <td className="py-2 px-2 text-center text-text-on-dark/90">
                    {c.cost.model === "annual"
                      ? `$${((c.cost.annual ?? 0) * y).toLocaleString()}`
                      : c.cost.oneTime
                        ? `$${c.cost.oneTime.toLocaleString()}`
                        : "free / low"}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-accent-teal">${NOKLOCK_LIFETIME_ONCE} once</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/prove-it" className="btn btn-secondary">Prove it yourself</Link>
        <Link to="/pricing" className="btn btn-primary">See pricing</Link>
        <Link to="/crypto-inheritance" className="btn btn-secondary">Crypto inheritance 101</Link>
      </div>

      <p className="text-xs text-text-muted">{COMPARE_NOTE}</p>

      <section className="space-y-2">
        <h2 className="text-sm uppercase tracking-wider text-accent-cyan font-bold">Other comparisons</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((o) => (
            <Link key={o.slug} to={`/compare/${o.slug}`} className="text-sm px-3 py-1.5 rounded border border-bg-surface hover:border-accent-cyan">
              vs {o.name}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
