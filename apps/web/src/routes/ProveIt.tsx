// @version 0.4.0 @date 2026-05-31
// 0.4.0 — Daniel 2026-05-31: Box 6 is now "Prove the source" (links to
//          /prove-it/source, the 9-channel firewall + memzero explainer +
//          honest JS memory model). The end-to-end viz demo moves to a
//          slim wide row BELOW the 6-proof grid and ABOVE the
//          "Deeper access on request" row — same single-column shape as
//          deeper-access. Rationale: the viz demo is a visualisation, not
//          a proof per se; promoting source to a proof slot reflects what
//          it actually is.
// 0.1.0 — /prove-it — hub landing for all NoKLock "Prove It" sub-pages.

import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/seo.js";

interface CardSpec {
  readonly slug: string;
  readonly href: string | null;            // null = coming-soon, no nav
  readonly headline: string;
  readonly accent: string;
  readonly tagline: string;
  readonly body: string;
  readonly cta: string;
  readonly comingSoon?: boolean;
  /** 0.2.0 — when true, the card link opens in a new tab. Used for the
   *  end-to-end demo so the user doesn't lose their place on the hub. */
  readonly openInNewTab?: boolean;
}

const CARDS: readonly CardSpec[] = [
  {
    slug: "math",
    href: "/prove-it/math",
    headline: "Prove the math",
    accent: "Algorithms",
    tagline: "Run the real crypto pipeline on throwaway test data — round-trip verified in your browser.",
    body: "Argon2id → SLIP-39 Shamir → AEAD → Ed25519 signed manifest → restore from K shares → byte-for-byte match. The animation replays the whole sequence at lesson-pace so you can SEE every primitive.",
    cta: "Run the math proof →",
  },
  {
    slug: "airgap",
    href: "/prove-it/airgap",
    headline: "Prove the airgap",
    accent: "Network",
    tagline: "Watch live as the app makes ZERO network calls during seed entry — corroborate against your own DevTools.",
    body: "A live terminal showing every browser network event, alongside a button panel that deliberately TRIES to exfiltrate (fetch / Image / WebSocket / sendBeacon) — each bouncing off the firewall in real time. Plus a guided walkthrough to verify against your browser's own Network tab.",
    cta: "Run the airgap proof →",
  },
  {
    slug: "noklock-proof",
    href: "/prove-it/noklock-proof",
    headline: "Prove the chain runs without us",
    accent: "Continuity",
    tagline: "If NoKLock vanished tomorrow — server gone, domain gone, company gone — your inheritance still fires.",
    body: "6 immutable contracts source-verified on PolygonScan. Chainlink Automation (not us) fires the dead-man's switch. Public-RPC fallback chain in main.tsx survives our proxy going dark. Honest caveats about the convenience layer that DOES need us — and the trustless fallback for each.",
    cta: "Read the continuity proof →",
  },
  {
    slug: "build-matches",
    href: "/prove-it/build-matches",
    headline: "Prove the build matches the source",
    accent: "Integrity",
    tagline: "The code your browser runs is built from the source on GitHub — read it, build it, check what your browser loaded.",
    body: "The full app source is public on GitHub — read exactly what runs. Browser-side enumeration of every loaded script + stylesheet (the BROWSER's report, not our claim), plus a clone-and-build so you can compile the app from source yourself. The on-chain contracts are byte-verified on PolygonScan.",
    cta: "Verify the build →",
  },
  {
    slug: "entropy",
    href: "/prove-it/entropy",
    headline: "Prove your shares look like noise",
    accent: "Statistics",
    tagline: "Encrypted shares are statistically indistinguishable from random data — see the chi-square test live.",
    body: "Real ciphertext + real Shamir shares generated in your browser, run through a chi-square byte-frequency test against the critical value for 256 bins. A control column (structured ASCII) deliberately fails so you can see the test is wired correctly. Honest caveats about what the test does and doesn't prove.",
    cta: "Run the entropy test →",
  },
  {
    slug: "source",
    href: "/prove-it/source",
    headline: "Prove the source",
    accent: "Code",
    tagline: "Read the 9-channel firewall + the synchronous memory-wipe of every Uint8Array we derive from your seed — bundled into the page, no network call to open.",
    body: "The 9-channel browser-exfil firewall (fetch, XHR, sendBeacon, Image, WebSocket, EventSource, RTC, script and link injection) + the PerformanceObserver browser-native witness — full source bundled into the page via vite ?raw imports so opening this proof itself doesn't make a network call. Plus the honest explainer of the JS memory model: every byte we derive from your seed (entropy, master, HKDF PRK, per-share keys, share plaintexts, sign seed) is synchronously .fill(0)'d the moment it's no longer needed; the seed string itself can't be wiped (no JS API exists) but the firewall is the load-bearing defense.",
    cta: "Read the source proof →",
  },
];

export function ProveIt(): JSX.Element {
  useDocumentHead("/prove-it");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-display">
          <span className="grad">Prove It</span>
        </h1>
        <p className="text-text-on-dark/80 text-base mt-2 max-w-3xl">
          We claim — and so do most products — that we don't see your seed. The difference: NoKLock proves
          it. Every claim below has its own demonstration page where the proof runs live in your browser,
          not as a static screenshot or a brand promise. Verify with your own DevTools open.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((c) => <ProveCard key={c.slug} card={c} />)}
      </div>

      {/* 2026-07-01 (Daniel) — Prove the competitor comparisons. Slim shape like
          the engine-demo box below; links into the Competitors tab, which hosts
          the AskAnAI multi-model query launcher (ChatGPT / Claude / Perplexity). */}
      <Link
        to="/info?tab=competitors"
        className="block card border-bg-surface/60 bg-bg-deepest/40 max-w-3xl mx-auto hover:border-accent-cyan/60 transition-all"
      >
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Head-to-head</div>
        <h2 className="text-2xl font-bold font-display mb-2 text-text-on-dark">Prove the competitor comparisons</h2>
        <p className="text-sm text-text-on-dark/85 mb-2">
          Every rival — crypto-inheritance, digital-legacy and managed-wallet alternatives — mapped side-by-side as claims you can check, not a table you're asked to trust. We're confident enough to let someone else judge: each comparison ships with pre-set, one-click queries whose prompts are set to run an <strong>unbiased head-to-head across three independent AI models</strong> — ChatGPT, Claude and Perplexity — each told to fetch the live evidence and decide for itself. We don't get a vote.
        </p>
        <p className="text-sm text-accent-cyan font-mono">Compare — and ask an AI →</p>
      </Link>

      {/* 0.4.1 — End-to-end viz demo. Same slim shape as Deeper-access
          below, but title styled like the six proof cards above (white
          display font, eyebrow above it, accent-cyan CTA). Opens in a new
          tab — anchor attrs handle that; no need to mention in the title. */}
      <a
        href="/viz/pipeline?fs=1"
        target="_blank"
        rel="noopener noreferrer"
        className="block card border-bg-surface/60 bg-bg-deepest/40 max-w-3xl mx-auto hover:border-accent-cyan/60 transition-all"
      >
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Visualisation</div>
        <h2 className="text-2xl font-bold font-display mb-2 text-text-on-dark">Watch the end-to-end pipeline demo</h2>
        <p className="text-sm text-text-on-dark/85 mb-2">
          The whole pipeline as one continuous animation — BIP-39 → Argon2id → Shamir → AEAD → Ed25519-signed manifest → restore from K shares → byte-for-byte round-trip. Same algorithms as the live math proof; canned data so you can SEE the shape of the whole process in about 90 seconds.
        </p>
        <p className="text-sm text-accent-cyan font-mono">Watch the end-to-end demo →</p>
      </a>

      <div className="card border-bg-surface/60 bg-bg-deepest/40 max-w-3xl mx-auto">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Deeper access on request</div>
        <p className="text-sm text-text-on-dark/85">
          The proofs above are the touchiest claims a self-custodial product has to defend — that the math holds, that we don't see your seed, that the chain runs without us, that the build is what we shipped, and that the bytes really are random.
          Anything else you'd like proven — soulbound enforcement under attack, decoy-vault indistinguishability under forensic inspection, Hybrid-E escrow attestor compromise scenarios, key-rotation drills, formal-method walkthroughs, contract simulation under arbitrary failure modes — email{" "}
          <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>
          {" "}with the scenario you want exercised. We'll set up a live demo or a written walkthrough. Good-faith offer; not a marketing tactic.
        </p>
      </div>

      <p className="text-xs text-text-muted text-center pt-2">
        More proofs land here as we ship them. Source is BUSL-1.1 source-visible on{" "}
        <a href="https://github.com/dksteeves/noklock" className="text-accent-cyan hover:underline" target="_blank" rel="noopener noreferrer">github.com/dksteeves/noklock</a>{" "}
        — every claim on this page is a function call away from being verified by you.
      </p>
    </div>
  );
}

function ProveCard({ card }: { readonly card: CardSpec }): JSX.Element {
  const Wrap = card.href
    ? card.openInNewTab
      // 0.2.0 — openInNewTab uses a plain anchor with target=_blank so
      // the user keeps the hub tab open while the demo plays in a new
      // tab. The end-to-end demo uses this so they can come back and
      // explore the other proofs without losing their place.
      ? ({ children }: { children: React.ReactNode }) => (
          <a href={card.href!} target="_blank" rel="noopener noreferrer" className="block">{children}</a>
        )
      : ({ children }: { children: React.ReactNode }) => (
          <Link to={card.href!} className="block">{children}</Link>
        )
    : ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

  return (
    <Wrap>
      <div
        className={
          "card h-full flex flex-col gap-3 transition-all " +
          (card.href
            ? "border-bg-surface hover:border-accent-cyan/60 cursor-pointer"
            : "border-bg-surface/60 opacity-80")
        }
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold">{card.accent}</span>
          {card.comingSoon && (
            <span className="tier-badge bg-amber-700/40 text-amber-300">Coming soon</span>
          )}
        </div>
        <h2 className="text-2xl font-bold font-display">{card.headline}</h2>
        <p className="text-sm text-text-on-dark/85 font-medium">{card.tagline}</p>
        <p className="text-sm text-text-muted leading-relaxed">{card.body}</p>
        <div className="mt-auto pt-2">
          <span className={
            "text-sm font-mono " +
            (card.href ? "text-accent-cyan" : "text-text-muted")
          }>
            {card.cta}
          </span>
        </div>
      </div>
    </Wrap>
  );
}
