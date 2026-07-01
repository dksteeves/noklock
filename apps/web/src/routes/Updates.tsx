// @version 0.6.0 @date 2026-06-10
// 0.6.0 — Per-entry collapse (Daniel 2026-06-10): a single long update no
//         longer dominates the page. Each entry's body is now clamped to ~7
//         lines with a "… more" / "… less" toggle that only appears when the
//         body actually overflows the clamp. Extracted the inline entry render
//         into a module-scope <UpdateCard>. Uses Tailwind's built-in
//         line-clamp (core utility since v3.3; we're on ^3.4) via the
//         arbitrary value line-clamp-[7]; overflow is measured with a ref
//         (scrollHeight > clientHeight) so the toggle is suppressed for short
//         entries. Header (date + category chip + title) unchanged; the
//         RichTextView / whitespace-pre-line body branch is preserved verbatim.
// 0.5.1 — body now renders with whitespace-pre-line so paragraph breaks the
//         publisher typed/pasted are preserved (was a single collapsed <p>).
//         Spaces still collapse + text wraps; existing single-line entries
//         look identical. (Rich/RTF authoring in Admin is a separate todo.)
// 0.5.0 — Filter + search (Daniel). Category chips (All / Launch /
//         Feature / Polish / Security / Contracts) + a free-text box
//         matching title + body (case-insensitive). Filtering runs over
//         the merged (remote + static) list; pagination + "show more"
//         operate on the filtered result; changing filter/search resets
//         the page window. No new network calls.
// 0.4.0 — WS-G: page now MERGES the built-in static history with
//         owner-published entries from Form B (/v1/updates), newest
//         first, and paginates — shows 8, then a "Show all" button.
//         Form B unreachable → silently falls back to the static list
//         (no error noise). "RSS/notifications coming" softened (no
//         unbacked promise).
// 0.3.0 — 2026-05-17 ships: founder pricing + Lifetime-vs-rent, Referral
//         Info tab, wallet network guard + RPC fallback, real optional
//         WebAuthn passkey + master-password rename, provider-independence
//         section, cosmetics. (i18n + swap-to-pay tracked separately.)
// 0.2.0 — 2026-05-16 ships: hardened + referral contract redeploy (new
//         addresses superseding the 05-15 set), affiliate/referral rewards
//         program, security hardening (SBT ReentrancyGuard + Solidity
//         0.8.28 + 63 tests), Contracts-tab + published-audit transparency,
//         Round-3 polish (mobile nav, Free 3-share, SEO, veracity sweep,
//         Form B endpoints). Old 05-15 contract entry annotated as
//         superseded so mid-list scanning never reads old addresses as live.
// 0.1.0 — /updates — public changelog feed. No email subscription, no
//         mailing list, no cookies. Hand-maintained list of meaningful
//         changes. Users bookmark.
//
// Rationale (Daniel directive 2026-05-15): "transactional-only" email
// posture. We never collect emails for general updates. If users want to
// stay informed, they visit this page (or, in future, subscribe via RSS
// or in-app push). Transactional email is reserved for the two specific
// dead-man's-switch flows: heartbeat-reminder + NoK-activation.

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BRAND_NAME } from "../lib/brand.js";
import { useDocumentHead } from "../lib/seo.js";
import { RichTextView } from "../components/RichTextView.js";
import { looksLikeHtml } from "../lib/sanitizeHtml.js";

type ChangeCategory = "Launch" | "Feature" | "Polish" | "Security" | "Contracts";

interface ChangeEntry {
  readonly date: string;          // YYYY-MM-DD
  readonly title: string;
  readonly category: ChangeCategory;
  readonly body: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";
const PAGE = 8;

// Newest first. Each ship is one entry. Update as work lands.
const CHANGES: readonly ChangeEntry[] = [
  {
    date: "2026-05-17",
    title: "Founder pricing + Lifetime-vs-rent",
    category: "Feature",
    body: "Aggressive launch pricing: Standard $99/yr, Premium $199/yr, Lifetime $299 one-time for the first ~10,000 vaults (then $149 / $299 / $499 — a real, forward-stated founder offer, no fake markdown). New Pricing illustration shows the 5/25/50-year cost of renting an inheritance plan elsewhere vs paying once. New competitor pricing-&-positioning matrix adds Nunchuk, ZenGo, Unchained, Tangem and the dimensions that matter (annual price, no-KYC, self-custody, autonomous on-chain inheritance).",
  },
  {
    date: "2026-05-17",
    title: "Referral programme explained in full",
    category: "Feature",
    body: "New Info → Referral tab: the complete rules, a worked example, and exactly why it is 100% automatic and smart-contract-executed — non-custodial, no claim step, every figure read live on-chain. Linked both ways with the /refer dashboard.",
  },
  {
    date: "2026-05-17",
    title: "Wallet network guard — no more wrong-chain confusion",
    category: "Polish",
    body: "NoKLock runs on Polygon. If your wallet is on another network (e.g. BNB Smart Chain) the app now detects it, shows a banner, and switches you to Polygon with one tap before any transaction — instead of your wallet confusingly asking for BNB. Reads also fail over to a public Polygon node if our RPC is unreachable.",
  },
  {
    date: "2026-05-17",
    title: "Real optional passkey + honest naming",
    category: "Security",
    body: "What unlocks your vault was always an Argon2id password, not a passkey — so it is now correctly called your master password everywhere. Separately, you can now ALSO add a real WebAuthn passkey (Face ID / Touch ID / security key) for fast unlock on your own devices. Your master password (and your shares) remain the sole recovery and next-of-kin route — the passkey can never be the only way in.",
  },
  {
    date: "2026-05-17",
    title: "What if NoKLock disappears?",
    category: "Security",
    body: "New section spelling out that NoKLock is self-custodial AND provider-independent: your licence is on-chain, recovery is 100% in your browser from shares you hold, and inheritance is executed by Polygon + Chainlink — not our servers. If we vanished tomorrow, your recovery and inheritance still work. Plus input-time tooltips for threshold/shares and a missing back-link on the seed flow.",
  },
  {
    date: "2026-05-16",
    title: "Hardened + referral contract redeploy — new addresses",
    category: "Contracts",
    body: "All four contracts redeployed to Polygon mainnet in one broadcast. NEW addresses — these supersede the 2026-05-15 set below: License 0xF99b4D66…ac859 · SBT 0x515dC758…01Fd69 · Oracle 0x97869F2D…AA2e56 · Recovery 0x794caEA6…BD8f2E. Recovery + Oracle re-wired into the SBT in the same broadcast. Constructor signatures unchanged — verified-source arguments unaffected. The verified addresses on the Info → Contracts tab read live from the contract config, so they always show the current set.",
  },
  {
    date: "2026-05-16",
    title: "Referral & affiliate rewards program",
    category: "Feature",
    body: "Refer someone and you both win: they get 10% off their paid licence, you earn 10% of what they pay — entirely on-chain, no cash-out friction. Below 5 successful referrals your share banks as redeemable credit against your own next licence; at 5 you become an affiliate and every future referral pays your share straight to your wallet in USDC, instantly, with no claim step (the contract never custodies it). Self- and zero-address referrers are rejected on-chain; free mints earn nothing (no farming surface). Track everything at /refer. No crypto-inheritance competitor runs a public on-chain referral — this is unique.",
  },
  {
    date: "2026-05-16",
    title: "Security hardening",
    category: "Security",
    body: "The soul-bound SBT now inherits ReentrancyGuard with nonReentrant on mint, revoke and recover — defence-in-depth, not a patched hole (the pattern was never value-exploitable). All four contracts compiled on a single pinned Solidity 0.8.28. Foundry suite expanded to 63/63 green, including the full referral discount/split/affiliate-unlock/first-referrer-lock matrix.",
  },
  {
    date: "2026-05-16",
    title: "Contracts transparency tab + published-audit surface",
    category: "Polish",
    body: "New Info → Contracts tab: every verified address, exactly how the code was reviewed (tests + independent AI review + SolidityScan + source verification), an honest line-by-line walkthrough of the scary scanner flags you'll see and why they're false positives, and the architectural why-there-is-no-exploitable-path argument. Any owner-signed scan/audit report now publishes to a public list there — with an honest empty-state until one exists. We will not claim an audit we don't have.",
  },
  {
    date: "2026-05-16",
    title: "Round 3 polish + documentation veracity sweep",
    category: "Polish",
    body: "Mobile navigation menu added (the nav was hidden below tablet width). Free tier raised to 3 share locations so a 2-of-3 restore actually works on Free. SEO / AI-discoverability: robots.txt (AI crawlers welcomed), llms.txt, sitemap, JSON-LD, no-JS fallback content. Full documentation pass for 100% veracity — every overstated or future-tense claim corrected to match exactly what ships today. Form B back-end gained zero-PII analytics, the signed audit endpoint, and a read-only referral stats endpoint.",
  },
  {
    date: "2026-05-15",
    title: "Mainnet launch + Round 3 polish",
    category: "Launch",
    body: "All four smart contracts (License, SBT, Oracle, Recovery) deployed to Polygon mainnet. ScrollToTop on every navigation. Hero copy + image. Logo transparency. Pricing comparison table. Process-diagram tooltip popover. Settings inline help + About box. Footer + Privacy + Terms pages. Mint button now connects wallet on click instead of showing the not-allowed cursor.",
  },
  {
    date: "2026-05-15",
    title: "Polygon mainnet contracts live",
    category: "Contracts",
    body: "SUPERSEDED 2026-05-16 — see the redeploy entry at the top; these addresses are no longer the live set. (Historical record of the original launch:) License 0xD64764CF…980fD · SBT 0xa4934C09…6B772 · Oracle 0x9Fab8991…978A6 · Recovery 0x7D89BAf0…FAbfd. 55/55 tests green pre-deploy. Recovery module wired into SBT in the same broadcast.",
  },
  {
    date: "2026-05-15",
    title: "Pre-deploy contract audit response",
    category: "Security",
    body: "Folded in two pre-deploy reviewer findings: Lifetime tier now blocks double-mint (was burning USDC for no benefit), Oracle grace-period now capped at 10 years (was uint32-max footgun).",
  },
  {
    date: "2026-05-15",
    title: "RPC proxy live for IP privacy",
    category: "Security",
    body: "All eth_* calls from the PWA route through api.noklock.app/v1/rpc. The public Polygon RPC sees the server IP, never yours. Origin-checked + LRU-cached + rate-limited.",
  },
  {
    date: "2026-05-14",
    title: "Brand rename: SoulChain → NoKLock",
    category: "Feature",
    body: "Final brand. Domain noklock.app live. Email hello@noklock.app live. Form B back-end at api.noklock.app live.",
  },
];

const CAT_COLOR: Record<ChangeCategory, string> = {
  Launch:    "bg-emerald-700/30 text-accent-green border-emerald-700/50",
  Feature:   "bg-cyan-700/30   text-accent-cyan  border-cyan-700/50",
  Polish:    "bg-violet-700/30 text-violet-300  border-violet-700/50",
  Security:  "bg-rose-700/30   text-rose-300    border-rose-700/50",
  Contracts: "bg-amber-700/30  text-amber-300   border-amber-700/50",
};

const VALID_CATS = new Set<ChangeCategory>(["Launch", "Feature", "Polish", "Security", "Contracts"]);

interface RemoteUpdate { id: number; ymd: string; title: string; category: string; body: string }

type CatFilter = ChangeCategory | "All";
const CAT_FILTERS: readonly CatFilter[] = ["All", "Launch", "Feature", "Polish", "Security", "Contracts"];

// One changelog entry. The body is clamped to ~7 lines when collapsed so a
// single long update can't dominate the page; a "… more" / "… less" toggle
// appears only when the body actually overflows the clamp.
function UpdateCard({ c }: { c: ChangeEntry }): JSX.Element {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // Measure overflow while collapsed. scrollHeight is the full content height;
  // clientHeight is the visible (clamped) height. A small slack avoids a
  // toggle flickering on sub-pixel rounding. Re-runs when the body changes.
  useEffect(() => {
    if (expanded) return;            // keep the toggle visible once expanded
    const el = bodyRef.current;
    if (!el) return;
    setOverflows(el.scrollHeight > el.clientHeight + 4);
  }, [c.body, expanded]);

  return (
    <article className="card">
      <div className="flex flex-wrap items-baseline gap-3 mb-2">
        <span className="text-xs font-mono text-text-muted">{c.date}</span>
        <span className={`text-xs font-mono border rounded px-2 py-0.5 ${CAT_COLOR[c.category]}`}>{c.category}</span>
        <h3 className="text-lg font-bold font-display flex-1 min-w-0">{c.title}</h3>
      </div>
      <div ref={bodyRef} className={expanded ? undefined : "line-clamp-[7]"}>
        {looksLikeHtml(c.body)
          ? <RichTextView html={c.body} className="text-sm text-text-on-dark/90" />
          : <p className="text-sm text-text-on-dark/90 whitespace-pre-line">{c.body}</p>}
      </div>
      {(overflows || expanded) && (
        <button
          type="button"
          className="text-xs font-mono text-accent-cyan hover:underline mt-1"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "… less" : "… more"}
        </button>
      )}
    </article>
  );
}

export function Updates(): JSX.Element {
  useDocumentHead("/updates");
  const [remote, setRemote] = useState<readonly ChangeEntry[]>([]);
  const [visible, setVisible] = useState(PAGE);
  const [cat, setCat] = useState<CatFilter>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const r = await fetch(`${API_BASE}/updates`);
        if (!r.ok) return; // silently fall back to static
        const j = (await r.json()) as { updates?: RemoteUpdate[] };
        if (!alive || !Array.isArray(j.updates)) return;
        const mapped: ChangeEntry[] = j.updates
          .filter((u) => VALID_CATS.has(u.category as ChangeCategory))
          .map((u) => ({ date: u.ymd, title: u.title, category: u.category as ChangeCategory, body: u.body }));
        setRemote(mapped);
      } catch {
        /* Form B unreachable — static history is the source of truth */
      }
    })();
    return () => { alive = false; };
  }, []);

  // Merge owner-published + built-in history, newest first. Built-in
  // entries are the canonical record; remote entries are additive.
  const merged = useMemo<readonly ChangeEntry[]>(() => {
    const all = [...remote, ...CHANGES];
    return [...all].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [remote]);

  const filtered = useMemo<readonly ChangeEntry[]>(() => {
    const q = query.trim().toLowerCase();
    return merged.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (q && !(`${c.title} ${c.body}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [merged, cat, query]);

  // Reset the page window whenever the filter or search changes so the
  // user always sees the newest matches first (not a stale deep window).
  useEffect(() => { setVisible(PAGE); }, [cat, query]);

  const shown = filtered.slice(0, visible);
  const more = filtered.length - shown.length;

  return (
    <article className="prose-invert max-w-3xl mx-auto space-y-6 py-4">
      <header>
        <h1 className="text-4xl font-bold font-display"><span className="grad">Updates</span></h1>
        <p className="text-text-muted mt-2">What's new. Bookmark this page — no email list, no tracking.</p>
      </header>

      <section className="card space-y-2 text-sm">
        <h2 className="text-lg font-bold">How updates work at {BRAND_NAME}</h2>
        <ul className="list-disc list-inside space-y-1 text-text-on-dark/90">
          <li>We don't collect emails for marketing. Ever.</li>
          <li>Open this page when you want to know what changed.</li>
          <li>The only transactional emails {BRAND_NAME} ever sends are heartbeat reminders and NoK-activation notices — and only if you opt in to the dead-man's switch and configure email delivery there.</li>
          <li>An RSS feed and in-app notifications may be added later — this page is the source of truth meanwhile.</li>
        </ul>
        <p className="text-text-muted text-xs pt-2">
          Privacy posture in full: <Link to="/privacy" className="text-accent-cyan hover:underline">Privacy notice</Link>.
        </p>
      </section>

      <section className="card space-y-3">
        <div className="flex flex-wrap gap-2">
          {CAT_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setCat(f)}
              className={`text-xs font-mono border rounded px-2 py-1 transition-colors ${
                cat === f
                  ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50 font-bold"
                  : "bg-bg-deepest text-text-muted border-bg-surface hover:text-text-on-dark"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search updates (title or text)…"
          className="w-full bg-bg-deepest border border-bg-surface rounded p-2 text-sm"
          aria-label="Search updates"
          spellCheck={false}
        />
        <p className="text-xs text-text-muted">
          {filtered.length} {filtered.length === 1 ? "update" : "updates"}
          {(cat !== "All" || query.trim()) && (
            <>
              {" "}match{filtered.length === 1 ? "es" : ""} ·{" "}
              <button
                type="button"
                className="text-accent-cyan hover:underline"
                onClick={() => { setCat("All"); setQuery(""); }}
              >
                clear filters
              </button>
            </>
          )}
        </p>
      </section>

      <section className="space-y-4">
        {shown.length === 0 && (
          <div className="card text-sm text-text-muted">
            No updates match {cat !== "All" && <span className="text-text-on-dark">{cat}</span>}
            {cat !== "All" && query.trim() && " + "}
            {query.trim() && <span className="text-text-on-dark">&quot;{query.trim()}&quot;</span>}.
          </div>
        )}
        {shown.map((c, i) => (
          <UpdateCard key={`${c.date}-${i}-${c.title}`} c={c} />
        ))}
        {more > 0 && (
          <div className="text-center">
            <button
              type="button"
              className="btn btn-secondary text-sm"
              onClick={() => setVisible((v) => v + PAGE >= filtered.length ? filtered.length : v + PAGE)}
            >
              Show {Math.min(PAGE, more)} more ({more} older)
            </button>
          </div>
        )}
      </section>

      <p className="text-text-muted text-sm">
        <Link to="/" className="text-accent-cyan hover:underline">← Back to home</Link>
      </p>
    </article>
  );
}
