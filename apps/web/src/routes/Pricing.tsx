// @version 0.17.0 @date 2026-06-08
// 0.17.0 — Daniel 2026-06-08 round-3 restructure. Six locks:
//
//          (1) STRIP SPLIT INTO TWO ROWS — Free now sits ALONE on its own row
//              above the paid strip (wider card, simpler styling, single
//              "Get started" CTA to /enrol). The 4 paid mini-cards
//              (Std-Annual / Std-Lifetime / Premium-Annual / Premium-Lifetime)
//              render in a separate equal-width grid below, so the eye
//              groups "free vs paid" cleanly. Replaces the 0.16.x single
//              flex-wrap row of 5 cards.
//
//          (2) TIER BOXES BECOME INFO-ONLY — Free/Standard/Premium TierBoxes
//              below the strip lose their buy widgets entirely. Each tier
//              box now shows:
//                · Tier name + tagline at the top
//                · BOTH model labels inline: "Self-custody · Managed
//                  (coming soon)" — small, NOT separate sub-boxes
//                · ONE price display block (annual + lifetime where
//                  applicable) since prices are identical across modes
//                · ONE feature list from TIER_PERKS — no per-mode dupe
//                · NO buy widget — the strip is the sole buy surface
//              The ModeSubRow component is dropped. The <TierCard/> embed
//              that used to live inside it is removed; the TierCard import
//              is also removed (it isn't used elsewhere on this page).
//
//          (3) LIFETIME TAGLINE ON BOTH STANDARD AND PREMIUM —
//              "Pay once. Never renew." now renders on BOTH Standard
//              Lifetime AND Premium Lifetime tier-box price rows. 0.16.x
//              had it only on Premium.
//
//          (4) "CHOOSE PRODUCT" → "CHOOSE MODEL" — in the strip's
//              PaidStripCard: the label above the first dropdown is now
//              "Model" (was "Product"); the placeholder option reads
//              "Choose Model…" (was "Choose product…"); aria-label is
//              `${spec.label} model`. The i18n key
//              pricing.primary.chooseMode is also updated to
//              "Choose Model…" across all 6 locales.
//
//          (5) "LIVE AT NL-2" → "COMING SOON" — the Managed founder
//              counter caption under the strip now ends with
//              "; coming soon." instead of "; live at NL-2."
//
//          (6) EQUAL TIER-BOX HEIGHTS — the section that wraps the three
//              tier boxes uses `auto-rows-fr` so each box stretches to the
//              tallest sibling. Combined with the dropped buy widgets,
//              the three boxes now line up visually across the grid.
//
//          Carry-over: COMPARISON matrix, ARCH_BASELINE, Lifetime-vs-
//          renting math table, FAQ cards, Enterprise sister-products card,
//          PricingIpNote, useFounderStats/useManagedFounderStats,
//          PrimaryPricingStrip's PaidStripCard mint flow (4 useMintLicence
//          hooks, one per paid card), TopAccordions, BottomConsolidation-
//          Block. UNIFIED_TIERS' self/managed price strings preserved
//          even though the tier boxes no longer surface per-mode rows;
//          retained as the data-source for the single inline price row
//          (annual + lifetime).
//
// @version 0.16.1 @date 2026-06-08
// 0.16.1 — Daniel 2026-06-08 follow-up: the 0.16.0 PrimaryPricingStrip buy
//          flow was decorative — fiat currency selector (USDC/EUR/GBP) was
//          wrong-shaped (contract only accepts USDC; multi-token is via 0x
//          swap of Polygon CRYPTO tokens, not fiat); Buy button just routed
//          to /enrol which didn't consume the params. Rewrite of PaidStripCard
//          to use the same useMintLicence hook TierCard uses + the same
//          POLYGON_PAY_TOKENS list. Product dropdown (Self / Managed-greyed)
//          now drives the Pay-with dropdown: self → USDC + POL/WPOL/ETH/WBTC/
//          USDT/DAI/USDC.e/LINK/AAVE/UNI via 0x swap-to-pay; managed → fiat
//          (Paddle) disabled and unreachable while managed itself is greyed.
//          Buy button greyed until BOTH dropdowns picked; click fires
//          useMintLicence.start() inline (no /enrol redirect). Connect-wallet
//          short-circuit if user not connected. Inline approve/mint status
//          + error message rendering. Daniel quote: "can a fucking user
//          connect a wallet and buy or not? if not then fucking fix it".
//
// @version 0.16.0 @date 2026-06-08
// 0.16.0 — Daniel 2026-06-08 round-2 feedback. STRUCTURAL REWORK on top of
//          0.15.0:
//
//          (1) TOP = TWO COLLAPSED ACCORDIONS — replaces the long market-
//              awareness prose paragraph + Founder-pricing wall-of-text. Both
//              default-collapsed; user opens what they want to read.
//                · Accordion 1: "Buy once. Use forever. No subscription on
//                  your survival." Expanded body = the old market-awareness
//                  paragraph verbatim.
//                · Accordion 2: "Founder pricing" — SIMPLIFIED body. No more
//                  founderCapRemaining / contract-read / PolygonScan link
//                  tech-leak. Just "you qualify automatically; once a side
//                  hits 10,000 it steps up to regular." Two independent
//                  counters (self-custody + managed).
//
//          (2) NEW PRIMARY PRICING SUMMARY STRIP — 5 mini-cards in a wrapping
//              horizontal strip sitting between the accordions and the tier
//              boxes. Free / Std-Annual / Std-Lifetime / Premium-Annual /
//              Premium-Lifetime. Each paid card has:
//                · Mode dropdown (Self-custody buyable, Managed greyed
//                  "Coming soon NL-2")
//                · Currency selector (USDC / EUR / GBP, default USDC)
//                · Buy button (disabled until Self-custody picked; routes to
//                  the relevant tier in the unified TierBox below).
//              Free routes straight to /enrol — no dropdown, no currency.
//              Founder pricing is shown when useFounderStats().remaining > 0,
//              else regular, mirroring the existing TierCard behaviour.
//
//          (3) TIER BOXES MOVE OUT OF TABS — Free / Standard / Premium
//              unified TierBoxes (both modes inline as sub-rows) sit BELOW
//              the strip and ABOVE the tabs. They are always visible; no
//              longer hidden behind Self-custody / Managed tabs.
//
//          (4) TABS REDUCED 5 → 3 — drop "Self-custody" + "Managed" tabs;
//              their content is now inline above the tabs. Remaining tabs:
//              Compare both / Enterprise / FAQ. Default = compare.
//
//          (5) EQUAL BOX SIZES — each TierBox's self-custody sub-row +
//              managed sub-row get matching min-height (Tailwind min-h-[X])
//              so the three boxes line up visually.
//
//          (6) NEW BOTTOM SECTION — replaces the old SummaryBlock (which sat
//              above the tabs in 0.15.0). Consolidates: "Two access paths" +
//              "Three tiers" + "Inheritance is optional" + refer-and-earn
//              pointer. One block, bottom of page.
//
//          (7) DROP SummaryBlock from the top — its content lives in (6).
//
//          The COMPARISON matrix, ARCH_BASELINE, Lifetime-vs-renting table,
//          FAQ cards (incl. losePhone i18n keys), Enterprise sister-products
//          card, PricingIpNote, useFounderStats(), and the TierBox+ModeSubRow
//          components are all preserved from 0.15.0.
//
// @version 0.15.0 @date 2026-06-08
// 0.15.0 — Daniel-locked pricing rework per strawman doc
//          `docs/pricing-referral-rework-strawman-2026-06-08.md` §9 picks.
//          See history below for the five 0.15.0 structural changes.
// @version 0.10.0 @date 2026-06-08
// 0.10.0 — losePhone FAQ keyed via useT().
// @version 0.9.6 @date 2026-06-06
// 0.9.6 — simple-vs-max-security framing on the phone-dies FAQ.
// @version 0.9.0 @date 2026-06-02
// 0.9.0 — id.asserro MANAGED-tier matrix (later superseded).
// 0.5.0 — Tier-feature matrix surfaces VAULT_USE_CASES catalog inline.
// 0.3.0 — ACTIVE PLAN 7 Pricing-card restructure.
// 0.1.0 — initial Pricing route.

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAccount, useConnect } from "wagmi";
import { SubTabBar } from "../components/SubTabBar.js";
import { TIER, TIER_NAME, TIER_DISPLAY_PRICE, TIER_PERKS, type TierId } from "../lib/contracts.js";
import { useDocumentHead } from "../lib/seo.js";
import { useT } from "../i18n/index.js";
import { useFounderStats, useManagedFounderStats } from "../hooks/useFounder.js";
import { useMintLicence } from "../hooks/useMintLicence.js";
import { POLYGON_PAY_TOKENS } from "../lib/swap.js";
import { PATENT_DESCRIPTION, useLivePatentLeader } from "../lib/patentNotice.js";
import { VAULT_USE_CASES, type VaultBestKind, type VaultUseCase } from "../components/VaultUseCases.js";

// ----------------------------------------------------------------------------
// Tab routing — 0.16.0 reduced to three tabs (Self-custody + Managed dropped;
// their content is now inline above the tabs). Default = compare.
// ----------------------------------------------------------------------------
type PricingTab = "compare" | "enterprise" | "faq";
const ALL_TABS: readonly PricingTab[] = ["compare", "enterprise", "faq"];
const TAB_LABELS: { id: PricingTab; label: string }[] = [
  { id: "compare",    label: "Compare both" },
  { id: "enterprise", label: "Enterprise" },
  { id: "faq",        label: "FAQ" },
];

function tabFromParam(v: string | null): PricingTab {
  return (ALL_TABS as readonly string[]).includes(v ?? "")
    ? (v as PricingTab)
    : "compare";
}

// ----------------------------------------------------------------------------
// Unified tier display — one row per access mode per tier. Preserved verbatim
// from 0.15.0; only the consumer changed (TierBoxes no longer live in tabs).
// ----------------------------------------------------------------------------
interface ModeRow {
  readonly mode: "self" | "managed";
  readonly annual: string | null;
  readonly lifetime: string | null;
  readonly badge?: string;
}
interface UnifiedTier {
  readonly id: TierId;
  readonly name: "Free" | "Standard" | "Premium";
  readonly highlight?: boolean;
  readonly tagline: string;
  readonly self: ModeRow;
  readonly managed: ModeRow;
  readonly lifetimeTagline?: string;
}

const UNIFIED_TIERS: readonly UnifiedTier[] = [
  {
    id: TIER.Free,
    name: "Free",
    tagline: "Real, autonomous store + restore + optional inheritance — capped, honest.",
    self: {
      mode: "self",
      annual: "Free forever",
      lifetime: null,
    },
    managed: {
      mode: "managed",
      annual: "Free forever",
      lifetime: null,
      badge: "coming soon — NL-2",
    },
  },
  {
    id: TIER.Standard,
    name: "Standard",
    highlight: true,
    tagline: "Unlimited vaults, multi-heir, full automation. Most people land here.",
    self: {
      mode: "self",
      annual: "$99/yr · Founder (then $149/yr)",
      lifetime: "$299 once · Founder (then $499)",
    },
    managed: {
      mode: "managed",
      annual: "$99/yr (auto-renews via Paddle) · Founder",
      lifetime: "$299 once · Founder",
      badge: "coming soon — NL-2",
    },
  },
  {
    id: TIER.Premium,
    name: "Premium",
    tagline: "Everything in Standard + multi-seed, doc/image vaults, duress decoy, 5-of-9 quorum.",
    lifetimeTagline: "Pay once. Never renew.",
    self: {
      mode: "self",
      annual: "$199/yr · Founder (then $299/yr)",
      lifetime: "$499 once · Founder (then $799)",
    },
    managed: {
      mode: "managed",
      annual: "$199/yr (auto-renews via Paddle) · Founder",
      lifetime: "$499 once · Founder",
      badge: "coming soon — NL-2",
    },
  },
];

// ----------------------------------------------------------------------------
// COMPARISON matrix — preserved verbatim from 0.15.0.
// ----------------------------------------------------------------------------
interface FeatureRow {
  readonly group: string;
  readonly label: string;
  readonly values: Readonly<Record<string, string>>;
  readonly useCaseKind?: VaultBestKind;
}

const COMPARISON: readonly FeatureRow[] = [
  { group: "Identity", label: "Vaults (per browser-profile localStorage)", values: { "0": "1 in this browser", "1": "as many as needed", "2": "as many as needed", "3": "as many as needed", "6": "as many as needed" } },
  { group: "Identity", label: "Seed phrases per vault", values: { "0": "1", "1": "1", "2": "1", "3": "Multi-seed", "6": "Multi-seed" } },
  { group: "Identity", label: "Share locations (where your encrypted shares go)", values: { "0": "3 (2-of-3 restore)", "1": "More — recommended, honour-based", "2": "More — recommended, honour-based", "3": "Up to 9", "6": "Up to 9" } },
  { group: "Recovery", label: "Self-recovery (Shamir 2-of-3 default; up to 5-of-9)", values: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "6": "✓" } },
  { group: "Recovery", label: "Social recovery — guardians (M-of-N)", values: { "0": "2-of-3 default", "1": "2-of-3 default", "2": "2-of-3 default", "3": "Up to 5-of-9", "6": "Up to 5-of-9" } },
  { group: "Recovery", label: "Time-lock cancellation window", values: { "0": "7 days", "1": "7 days", "2": "7 days", "3": "Configurable", "6": "Configurable" } },
  { group: "Inheritance (optional)", label: "Soulbound NFT trigger (ERC-5192 — rare in production)", values: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "6": "✓" } },
  { group: "Inheritance (optional)", label: "Designated next-of-kin (on-chain per-wallet cap)", values: { "0": "1", "1": "Up to 5", "2": "Up to 5", "3": "Up to 10", "6": "Up to 10" } },
  { group: "Inheritance (optional)", label: "Email-NoK via Hybrid-E (NoK without their own wallet)", values: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "6": "✓" } },
  { group: "Inheritance (optional)", label: "Heartbeat / dead-man's switch (per wallet, all vaults)", values: { "0": "Manual re-attest", "1": "Automated", "2": "Automated", "3": "Automated (configurable 1-365d)", "6": "Automated (configurable 1-365d)" } },
  { group: "Inheritance (optional)", label: "Multi-NoK voting (M-of-N quorum) — coming soon; pre-v0.6 vaults remain single-heir-restorable by their owner, re-enrol to enable", values: { "0": "—", "1": "2-of-3 (from v0.6)", "2": "2-of-3 (from v0.6)", "3": "Up to 5-of-9 (from v0.6)", "6": "Up to 5-of-9 (from v0.6)" } },
  { group: "Content", label: "Crypto seed phrase", values: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "6": "✓" }, useCaseKind: "seed" },
  { group: "Content", label: "Sealed letter", values: { "0": "1", "1": "✓", "2": "✓", "3": "✓", "6": "✓" }, useCaseKind: "letter" },
  { group: "Content", label: "Document / image vault (encrypted blobs)", values: { "0": "—", "1": "—", "2": "—", "3": "✓", "6": "✓" }, useCaseKind: "document" },
  { group: "Defence", label: "Duress decoy mode (two independent vaults + passwords)", values: { "0": "—", "1": "—", "2": "—", "3": "✓", "6": "✓" } },
  { group: "Defence", label: "WebAuthn passkey unlock (optional per-device convenience)", values: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "6": "✓" } },
  { group: "Diagnostics", label: "Prove-It demo (browser-side end-to-end pipeline)", values: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "6": "✓" } },
  { group: "Diagnostics", label: "Test-restore drill (user-run any time)", values: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "6": "✓" } },
  { group: "Diagnostics", label: "Guardian-management UI + audit-log export", values: { "0": "—", "1": "—", "2": "—", "3": "✓", "6": "✓" } },
  { group: "Support", label: "Bug-report channel", values: { "0": "Email", "1": "Email", "2": "Email", "3": "Priority", "6": "Priority" } },
  { group: "Rewards", label: "Referred-user discount", values: { "0": "n/a (free)", "1": "10% off", "2": "10% off", "3": "10% off", "6": "10% off" } },
  { group: "Rewards", label: "Refer & earn (any tier)", values: { "0": "10% share", "1": "10% share", "2": "10% share", "3": "10% share", "6": "10% share" } },
  { group: "Rewards", label: "Community Owners — Partner Toolkit (card builder + Refer & Share contest + playbook) †", values: { "0": "—", "1": "—", "2": "—", "3": "✓", "6": "✓" } },
  { group: "Pricing", label: "Price", values: { "0": "Free", "1": "$99/yr (then $149)", "2": "$299 once (then $499)", "3": "$199/yr (then $299)", "6": "$499 once (then $799)" } },
];

const ARCH_BASELINE: readonly string[] = [
  "Soulbound NFT inheritance trigger — ERC-5192, rare in production, public-chain verifiable",
  "Browser-native crypto core (Argon2id + SLIP-39 + AEAD) — runs in your tab, no telemetry, no remote fetch",
  "Strict Content-Security-Policy",
  "RPC proxy via api.noklock.app (your IP never reaches public Polygon nodes)",
  "100% self-custody — NoKLock cannot access your data",
  "AI-resistant pipeline — your seed never goes near a language model",
  "EIP-712 typed-data signing (no blind-hex prompts)",
  "BUSL-1.1 source-visible code, all contracts verified on PolygonScan",
];

function useCasesForKind(kind: VaultBestKind): readonly VaultUseCase[] {
  if (kind === "document") {
    return VAULT_USE_CASES.filter((uc) => uc.bestKind === "document" || uc.bestKind === "image");
  }
  return VAULT_USE_CASES.filter((uc) => uc.bestKind === kind);
}

// ----------------------------------------------------------------------------
// Pricing route — 0.16.0 top-level. Header + two collapsed accordions +
// Primary Pricing Summary strip + unified TierBoxes (Free/Standard/Premium) +
// three tabs (Compare/Enterprise/FAQ) + new consolidated bottom section.
// ----------------------------------------------------------------------------
export function Pricing(): JSX.Element {
  useDocumentHead("/pricing");
  const { t } = useT();
  const [params, setParams] = useSearchParams();
  const tab: PricingTab = tabFromParam(params.get("tab"));

  const [, forceRender] = useState(0);
  useEffect(() => {
    const onHash = (): void => forceRender((n) => n + 1);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function pickTab(id: string): void {
    if (id === "compare") setParams({}, { replace: true });
    else setParams({ tab: id }, { replace: true });
  }

  return (
    <div className="space-y-10">
      <PageHeader />

      <TopAccordions />

      <PrimaryPricingStrip />

      {/* Info-only tier boxes — 0.17.0 dropped the per-mode sub-rows and the
          embedded TierCard buy widget. The strip above is the sole buy
          surface; these boxes are pure reference. `auto-rows-fr` makes the
          three boxes the same height across the grid. */}
      <section className="grid md:grid-cols-3 gap-6 auto-rows-fr">
        {UNIFIED_TIERS.map((tier) => (
          <TierBox key={String(tier.id)} tier={tier} />
        ))}
      </section>

      <section>
        <SubTabBar items={TAB_LABELS} active={tab} onPick={pickTab} />
        <div className="mt-6">
          {tab === "compare"    && <CompareTab t={t} />}
          {tab === "enterprise" && <EnterpriseTab />}
          {tab === "faq"        && <FaqTab t={t} />}
        </div>
      </section>

      <BottomConsolidationBlock />
    </div>
  );
}

// ----------------------------------------------------------------------------
// PageHeader — eyebrow + H1 + tagline only. The market-awareness paragraph
// and "Buy once. Use forever." line MOVED into Accordion 1 in 0.16.0. The
// self-custody/Managed sub-paragraph + referral pointer move into the new
// BottomConsolidationBlock so they aren't duplicated.
// ----------------------------------------------------------------------------
function PageHeader(): JSX.Element {
  return (
    <header className="text-center">
      <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">
        Priced to Protect You
      </div>
      <h1 className="text-4xl font-bold font-display"><span className="grad">One licence. Everything.</span></h1>

      <p className="mt-4 text-xl md:text-2xl font-display font-bold max-w-3xl mx-auto">
        <span className="grad">Beyond the wallet, above the password manager, before the lawyer.</span>
      </p>
    </header>
  );
}

// ----------------------------------------------------------------------------
// TopAccordions — two collapsed-by-default accordions. Replaces the long
// header prose + the founder-pricing wall-of-text from 0.15.0.
// ----------------------------------------------------------------------------
function TopAccordions(): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <Accordion title="Buy once. Use forever. No subscription on your survival.">
        <p className="text-sm text-text-on-dark/90 leading-relaxed">
          We've seen the market: $10/mo here, $29/mo there, annual subscriptions that quietly auto-bill until your card expires (and then your heirs inherit the renewal too). We don't do that. Pick annual if you want, but the headline option is Lifetime: pay once, never think about it again.
        </p>
      </Accordion>

      <Accordion title="Founder pricing">
        <p className="text-sm text-text-on-dark/90 leading-relaxed">
          Founder pricing is a contract- and program-enforced discount for the first <strong>10,000 paid licences on each side</strong> (self-custody + managed). <strong>You qualify automatically — no signup needed.</strong> Once a side reaches its 10,000, that side's price steps up to the regular tier price. Both counters are independent.
        </p>
        <p className="text-sm text-accent-teal mt-2">
          You qualify for a significant discount.
        </p>
      </Accordion>
    </div>
  );
}

function Accordion({ title, children }: { readonly title: string; readonly children: React.ReactNode }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-baseline justify-between gap-3 text-left"
      >
        <span className="font-display font-bold text-text-on-dark text-base md:text-lg">
          {title}
        </span>
        <span className="text-accent-cyan text-xs font-mono shrink-0" aria-hidden="true">
          {open ? "▼" : "▶"}
        </span>
      </button>
      {open && (
        <div className="mt-3 border-t border-bg-surface/60 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// PrimaryPricingStrip — 5 mini-cards in a wrapping horizontal strip.
// Free | Std-Annual | Std-Lifetime | Premium-Annual | Premium-Lifetime.
// Paid cards: PRODUCT dropdown (self / managed-greyed) drives PAYMENT dropdown
// (self → Polygon crypto tokens via useMintLicence + 0x swap; managed → fiat
// via Paddle, disabled — coming-soon NL-2). Buy button greyed until BOTH are
// picked. Buy click fires the same useMintLicence hook the lower TierCard
// uses — single mint state machine, no /enrol redirect, no URL-param plumbing.
// ----------------------------------------------------------------------------

interface StripCardSpec {
  readonly key: string;
  readonly label: string;
  readonly priceFounder: string;
  readonly priceRegular: string;
  readonly tier: TierId;
  readonly sku: "annual" | "lifetime";
}

function PrimaryPricingStrip(): JSX.Element {
  const fnd = useFounderStats();
  const mfnd = useManagedFounderStats();
  // Show Founder price when the self-custody counter still has room
  // (mirrors how TierCard derives the price). The Managed side has its own
  // counter but managed is non-buyable until NL-2 so the dropdown label is
  // static. If self-custody counter is exhausted, fall through to regular.
  const showFounder = !fnd.ok || fnd.remaining > 0;

  // Lifetime Premium uses TierId 6n (LifetimePremium). Lifetime Standard
  // uses TierId 2n (Lifetime). Annual uses 1n (Standard) and 3n (Premium).
  const paid: readonly StripCardSpec[] = [
    { key: "std-annual",   label: "Standard Annual",   priceFounder: "$99/yr Founder",    priceRegular: "$149/yr",    tier: TIER.Standard,        sku: "annual"   },
    { key: "std-lifetime", label: "Standard Lifetime", priceFounder: "$299 once Founder", priceRegular: "$499 once",  tier: TIER.Lifetime,        sku: "lifetime" },
    { key: "prm-annual",   label: "Premium Annual",    priceFounder: "$199/yr Founder",   priceRegular: "$299/yr",    tier: TIER.Premium,         sku: "annual"   },
    { key: "prm-lifetime", label: "Premium Lifetime",  priceFounder: "$499 once Founder", priceRegular: "$799 once",  tier: TIER.LifetimePremium, sku: "lifetime" },
  ];

  return (
    <section aria-labelledby="strip-title" className="space-y-4">
      <h2 id="strip-title" className="text-lg font-bold font-display text-center"><span className="grad">Pick a plan</span></h2>

      {/* Row 1 — Free on its own row, wider card, single CTA to /enrol. */}
      <div className="flex justify-center">
        <FreeStripCard />
      </div>

      {/* Row 2 — the four paid mini-cards in an equal-width responsive grid. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {paid.map((p) => (
          <PaidStripCard key={p.key} spec={p} showFounder={showFounder} />
        ))}
      </div>

      {mfnd.ok && (
        <p className="text-[11px] text-text-muted text-center">
          Managed founder counter — separate from self-custody — tracks the first {mfnd.cap.toLocaleString()} paid managed mints; coming soon.
        </p>
      )}
    </section>
  );
}

function FreeStripCard(): JSX.Element {
  return (
    <div className="card w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-display font-bold text-text-on-dark text-lg">Free</h3>
          <p className="text-sm text-text-muted mt-1">
            Free forever. Real, autonomous store + restore + optional inheritance — capped, honest.
          </p>
        </div>
        <Link to="/enrol" className="btn btn-secondary shrink-0 sm:w-40 text-center">
          Get started
        </Link>
      </div>
    </div>
  );
}

function PaidStripCard({ spec, showFounder }: { readonly spec: StripCardSpec; readonly showFounder: boolean }): JSX.Element {
  const [mode, setMode] = useState<"" | "self" | "managed">("");
  const [paymentPicked, setPaymentPicked] = useState<boolean>(false);
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { step, error, start, payWith, setPayWith, swapConfigured } = useMintLicence(spec.tier);

  const inFlight = step === "approving" || step === "approve-pending" || step === "minting" || step === "mint-pending";
  const buyEnabled = mode === "self" && paymentPicked && !inFlight && step !== "done";

  function handleModeChange(v: string): void {
    if (v === "managed") return; // belt-and-braces: option is disabled
    setMode(v as "" | "self");
    setPaymentPicked(false);
    setPayWith(null);
  }

  function handlePayChange(v: string): void {
    if (v === "") {
      setPaymentPicked(false);
      setPayWith(null);
      return;
    }
    setPaymentPicked(true);
    if (v === "USDC") setPayWith(null); // null means USDC-direct (no swap)
    else setPayWith(v as `0x${string}`);
  }

  function handleBuy(): void {
    if (!buyEnabled) return;
    if (!isConnected) {
      if (connectors.length > 0) connect({ connector: connectors[0]! });
      return;
    }
    void start();
  }

  const paySelectVal: string =
    mode !== "self" ? "" : !paymentPicked ? "" : payWith === null ? "USDC" : payWith;

  const buyLabel: string =
    step === "approving" || step === "approve-pending" ? "Approving…"
    : step === "minting" || step === "mint-pending" ? "Minting…"
    : step === "done" ? "Done ✓"
    : !isConnected && buyEnabled ? "Connect & Buy"
    : "Buy";

  return (
    <div className="card flex flex-col w-full">
      <h3 className="font-display font-bold text-text-on-dark text-sm">{spec.label}</h3>
      <p className="text-xs text-accent-teal mt-1 font-mono">
        {showFounder ? spec.priceFounder : spec.priceRegular}
      </p>

      <label className="mt-3 block text-[10px] uppercase tracking-wider text-text-muted">Model</label>
      <select
        value={mode}
        onChange={(e) => handleModeChange(e.target.value)}
        className="mt-1 w-full text-xs bg-bg-deepest/60 border border-bg-surface rounded px-2 py-1 text-text-on-dark"
        aria-label={`${spec.label} model`}
      >
        <option value="">Choose Model…</option>
        <option value="self">Self-custody</option>
        <option value="managed" disabled>Managed — Coming soon NL-2</option>
      </select>

      <label className="mt-2 block text-[10px] uppercase tracking-wider text-text-muted">Pay with</label>
      <select
        value={paySelectVal}
        onChange={(e) => handlePayChange(e.target.value)}
        disabled={mode !== "self" || inFlight}
        className={`mt-1 w-full text-xs bg-bg-deepest/60 border border-bg-surface rounded px-2 py-1 text-text-on-dark ${mode !== "self" ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label={`${spec.label} payment`}
      >
        {mode === "" && <option value="">Pick Model first…</option>}
        {mode === "managed" && <option value="">Fiat (Paddle) — Coming soon NL-2</option>}
        {mode === "self" && (
          <>
            <option value="">Choose payment…</option>
            <option value="USDC">USDC — pay directly (no swap)</option>
            {swapConfigured && POLYGON_PAY_TOKENS.filter((t) => t.symbol !== "USDC").map((t) => (
              <option key={t.address} value={t.address}>{t.symbol} — swap to USDC via 0x</option>
            ))}
          </>
        )}
      </select>

      <button
        type="button"
        onClick={handleBuy}
        disabled={!buyEnabled}
        className={`btn ${buyEnabled ? "btn-primary" : "btn-secondary cursor-not-allowed opacity-60"} mt-3 w-full text-sm`}
        title={buyEnabled ? "" : "Pick Model + payment to enable Buy (Managed launches with NL-2)"}
      >
        {buyLabel}
      </button>

      {error && <p className="text-[10px] text-red-400 mt-1 leading-tight">{error}</p>}
    </div>
  );
}

// ----------------------------------------------------------------------------
// TierBox — info-only tier card. 0.17.0 stripped: no more ModeSubRow, no more
// embedded <TierCard/> buy widget. Prices are identical across self-custody
// and managed, so we render ONE inline price block (annual + lifetime where
// applicable). Both model labels are surfaced inline at the top
// ("Self-custody · Managed (coming soon)") so the reader knows the same
// price covers both paths. The strip above is the sole buy surface.
// `h-full` lets the parent's `auto-rows-fr` grid equalise box heights.
// ----------------------------------------------------------------------------
function TierBox({ tier }: { readonly tier: UnifiedTier }): JSX.Element {
  const tierKey = String(tier.id);
  const name = TIER_NAME[tierKey] ?? tier.name;
  const perks = TIER_PERKS[tierKey] ?? [];

  // Free tier carries no real price string — show "Free forever" once.
  const annualPrice = tier.self.annual;
  const lifetimePrice = tier.self.lifetime;
  const isFree = tier.name === "Free";
  // 0.17.0 — "Pay once. Never renew." renders on BOTH Standard Lifetime
  // and Premium Lifetime. 0.16.x only had it on Premium.
  const showLifetimeTagline = !isFree && lifetimePrice !== null;
  const lifetimeTagline = tier.lifetimeTagline ?? "Pay once. Never renew.";

  return (
    <div className={`card flex flex-col h-full ${tier.highlight ? "border-accent-teal" : ""}`}>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="text-xl font-bold font-display">{name}</h3>
        {tier.highlight && <span className="tier-badge bg-accent-teal/20 text-accent-teal">Most popular</span>}
      </div>

      {/* Both model labels inline — small, not separate boxes. */}
      <p className="text-[11px] uppercase tracking-wider text-accent-cyan font-bold mt-2">
        Self-custody <span className="text-text-muted/70 normal-case font-normal">·</span> Managed <span className="text-text-muted/70 normal-case font-normal">(coming soon)</span>
      </p>

      <p className="text-xs text-text-muted mt-2">{tier.tagline}</p>

      {/* ONE price block — prices are identical across modes. */}
      <div className="mt-3 rounded border border-bg-surface bg-bg-deepest/40 px-3 py-3 space-y-1.5">
        {isFree ? (
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] text-text-muted">Price</span>
            <span className="font-mono text-xs text-text-on-dark text-right">Free forever</span>
          </div>
        ) : (
          <>
            {annualPrice && (
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-text-muted">Annual</span>
                <span className="font-mono text-xs text-text-on-dark text-right">{annualPrice}</span>
              </div>
            )}
            {lifetimePrice && (
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-text-muted">Lifetime</span>
                <span className="font-mono text-xs text-text-on-dark text-right">
                  {lifetimePrice}
                  {showLifetimeTagline && (
                    <span className="block text-[10px] text-accent-teal italic font-normal">{lifetimeTagline}</span>
                  )}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Perks — sourced from TIER_PERKS so this stays the single source of
          truth across the route and the wider design system. */}
      <ul className="mt-4 space-y-1 text-sm text-text-muted flex-1">
        {perks.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="text-accent-teal shrink-0">·</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----------------------------------------------------------------------------
// CompareTab — preserved from 0.15.0 verbatim (Lifetime-vs-renting math +
// ARCH_BASELINE "Included in every tier" + the COMPARISON feature matrix).
// ----------------------------------------------------------------------------
function CompareTab({ t: _t }: { readonly t: ReturnType<typeof useT>["t"] }): JSX.Element {
  const [openRowKey, setOpenRowKey] = useState<string | null>(null);
  const tierIds: readonly string[] = ["0", "1", "2", "3", "6"];

  const groups: Record<string, FeatureRow[]> = {};
  for (const r of COMPARISON) {
    (groups[r.group] ??= []).push(r);
  }

  return (
    <div className="space-y-8">
      <section className="card">
        <h2 className="text-2xl font-bold font-display mb-1"><span className="grad">Lifetime vs renting — the real math</span></h2>
        <p className="text-text-muted text-sm mb-4">
          Every serious competitor charges you <em>every year, forever</em>. Your heirs' inheritance plan is a perpetual subscription, and one missed renewal breaks it. NoKLock Lifetime is paid <strong>once</strong>. Over a normal lifetime the gap stops being a discount and becomes a category change. Two flavours: <strong>Lifetime (Standard)</strong> at $299 founder / $499 regular, and <strong>Lifetime Premium</strong> at $499 founder / $799 regular.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-bg-surface text-text-on-dark align-bottom">
                <th className="text-left py-3 pr-4 font-bold">You keep it for…</th>
                <th className="py-3 px-2 font-bold text-center"><div>Casa</div><div className="text-xs text-text-muted font-normal mt-0.5">$250 / yr</div></th>
                <th className="py-3 px-2 font-bold text-center"><div>Vault12</div><div className="text-xs text-text-muted font-normal mt-0.5">$365 / yr</div></th>
                <th className="py-3 px-2 font-bold text-center"><div>Ledger Recover</div><div className="text-xs text-text-muted font-normal mt-0.5">~$120 / yr</div></th>
                <th className="py-3 px-2 font-bold text-center"><div>Nunchuk</div><div className="text-xs text-text-muted font-normal mt-0.5">~$120 / yr</div></th>
                <th className="py-3 px-2 font-bold text-center"><div className="grad">NoKLock Lifetime</div><div className="text-xs text-text-muted font-normal mt-0.5">$299–499 once · $499–799 Premium once</div></th>
              </tr>
            </thead>
            <tbody>
              {[
                { y: "5 years", casa: "$1,250", v12: "$1,825", ledger: "$600", nunchuk: "$600" },
                { y: "25 years", casa: "$6,250", v12: "$9,125", ledger: "$3,000", nunchuk: "$3,000" },
                { y: "50 years", casa: "$12,500", v12: "$18,250", ledger: "$6,000", nunchuk: "$6,000" },
              ].map((r) => (
                <tr key={r.y} className="border-b border-bg-surface/40">
                  <td className="py-2 pr-4 text-text-on-dark/90">{r.y}</td>
                  <td className="py-2 px-2 text-center text-text-on-dark/90">{r.casa}</td>
                  <td className="py-2 px-2 text-center text-text-on-dark/90">{r.v12}</td>
                  <td className="py-2 px-2 text-center text-text-on-dark/90">{r.ledger}</td>
                  <td className="py-2 px-2 text-center text-text-on-dark/90">{r.nunchuk}</td>
                  <td className="py-2 px-2 text-center font-bold text-accent-teal">$299–799 once</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-4">
          Competitor annual prices sourced May 2026 (Casa keys.casa, Vault12 vault12.com, Ledger Recover shop.ledger.com, Nunchuk nunchuk.io; entry plans, higher tiers cost more). NoKLock Lifetime is a single on-chain mint. No renewal, ever. Founder pricing is contract-enforced for the first 10,000 paid mints across all tiers (self-custody); Form-B–tracked for managed.
        </p>
      </section>

      <section className="card">
        <h2 className="font-bold font-display mb-3"><span className="grad">Included in every tier — architecture, not a perk</span></h2>
        <p className="text-text-muted text-sm mb-3">These aren't features we charge for. They're how NoKLock is built. Every user, every tier, every device, both modes:</p>
        <ul className="space-y-1 text-sm">
          {ARCH_BASELINE.map((line) => (
            <li key={line} className="flex gap-2"><span className="text-accent-teal">·</span><span>{line}</span></li>
          ))}
        </ul>
        <PricingIpNote />
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold font-display mb-1"><span className="grad">Compare tiers</span></h2>
        <p className="text-text-muted text-sm mb-2">Every cell is what you actually get at that tier. Free is genuinely useful, not a teaser. Standard fits most people. Premium adds multi-seed, multi-vault, document and image vaults, and the duress decoy. Lifetime is either of those, paid once.</p>
        <p className="text-text-muted text-xs mb-4">
          Inheritance-side caps (designated NoKs, multi-seed-per-vault, document/image vaults) are <strong className="text-text-on-dark">contract-enforced</strong> against your on-chain licence at the moment of mint. Vault count is not server-metered: NoKLock never sees your encrypted files. That's the self-custody trade-off, said plainly.
          <br />
          † Partner Toolkit also unlocked for <strong className="text-text-on-dark">selected partners by invitation</strong> regardless of tier (admin-managed wallet whitelist; we never issue bearer tokens). The cobrand <em>card builder</em> alone is open to anyone. Try it on <code>/refer?tab=community-owners</code>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-bg-surface">
                <th className="text-left py-3 pr-4 font-bold text-text-on-dark">Feature</th>
                {tierIds.map((tid) => (
                  <th key={tid} className="text-center py-3 px-2 font-bold text-text-on-dark min-w-[110px]">
                    <div>{TIER_NAME[tid]}</div>
                    <div className="text-xs text-text-muted font-normal mt-1">{TIER_DISPLAY_PRICE[tid] ?? "Free"}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([groupName, rows]) => (
                <>
                  <tr key={`g-${groupName}`}>
                    <td colSpan={tierIds.length + 1} className="pt-5 pb-1 font-bold text-accent-cyan text-xs uppercase tracking-wider">{groupName}</td>
                  </tr>
                  {rows.map((r) => {
                    const rowKey = `${groupName}::${r.label}`;
                    const isExpandable = r.useCaseKind !== undefined;
                    const isOpen = isExpandable && openRowKey === rowKey;
                    const useCases = isExpandable ? useCasesForKind(r.useCaseKind as VaultBestKind) : [];
                    return (
                      <>
                        <tr key={rowKey} className="border-b border-bg-surface/40">
                          <td className="py-2 pr-4 text-text-on-dark/90">
                            {isExpandable ? (
                              <button
                                type="button"
                                onClick={() => setOpenRowKey(isOpen ? null : rowKey)}
                                aria-expanded={isOpen}
                                aria-controls={`uc-${rowKey}`}
                                className="text-left w-full flex items-center gap-2 hover:text-accent-cyan transition-colors"
                                title="Click to see example use-cases"
                              >
                                <span className="text-accent-cyan text-[10px] font-mono shrink-0" aria-hidden="true">
                                  {isOpen ? "▼" : "▶"}
                                </span>
                                <span>{r.label}</span>
                                <span className="text-[10px] text-text-muted/70 font-normal shrink-0">
                                  {isOpen ? "(hide examples)" : `(${useCases.length} examples)`}
                                </span>
                              </button>
                            ) : (
                              r.label
                            )}
                          </td>
                          {tierIds.map((tid) => {
                            const v = r.values[tid] ?? "—";
                            const isYes = v === "✓";
                            const isNo = v === "—";
                            const cellClass = isYes
                              ? "text-accent-teal font-bold"
                              : isNo
                              ? "text-text-muted"
                              : "text-text-on-dark/90";
                            return (
                              <td key={tid} className={`py-2 px-2 text-center text-xs ${cellClass}`}>
                                {v}
                              </td>
                            );
                          })}
                        </tr>
                        {isOpen && (
                          <tr
                            key={`${rowKey}-uc`}
                            id={`uc-${rowKey}`}
                            className="border-b border-bg-surface/40 bg-bg-deepest/40"
                          >
                            <td colSpan={tierIds.length + 1} className="py-3 px-4">
                              <UseCaseExpansion useCases={useCases} />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------------------
// EnterpriseTab — preserved from 0.15.0 verbatim.
// ----------------------------------------------------------------------------
function EnterpriseTab(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="card max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold font-display mb-2"><span className="grad">Two sister products on the way</span></h2>
        <p className="text-sm text-text-on-dark/90">
          Both built on the same self-custodial NoKLock core. Both have their own deep-link with the technical detail; this tab is the orientation.
        </p>
      </div>

      <div className="card max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h3 className="text-xl font-bold font-display"><span className="grad">Coming soon</span></h3>
          <span className="text-[10px] uppercase tracking-wider font-bold text-accent-cyan border border-accent-cyan/50 rounded px-2 py-0.5 shrink-0">
            NoKLock.white · NoKLock.corporate
          </span>
        </div>
        <p className="text-sm text-text-muted mt-1">Two products on the way, both built on the same self-custodial core. Tap through for details.</p>

        <div className="border-t border-bg-surface pt-3 mt-4 text-sm text-text-on-dark/85 space-y-1">
          <div className="font-bold text-accent-green">NoKLock.white</div>
          <div className="text-text-muted">Whitelabel of the consumer app. Phase 2, before Q3 2026.</div>
          <ul className="space-y-0.5 mt-1 text-xs">
            <li className="flex gap-2"><span className="text-accent-teal mt-0.5">·</span><span>Per-tenant brand, theme, legal entity, support email.</span></li>
            <li className="flex gap-2"><span className="text-accent-teal mt-0.5">·</span><span>Shared on-chain contracts with per-tenant namespace + fee-split.</span></li>
            <li className="flex gap-2"><span className="text-accent-teal mt-0.5">·</span><span>For wallet providers, exchanges, estate-planning firms, regional resellers.</span></li>
          </ul>
          <div className="pt-2">
            <Link to="/whitelabel" className="text-accent-green hover:underline font-semibold text-xs">Read about NoKLock.white →</Link>
          </div>
        </div>

        <div className="border-t border-bg-surface pt-3 mt-4 text-sm text-text-on-dark/85 space-y-1">
          <div className="font-bold" style={{ color: "#10b981" }}>NoKLock.corporate</div>
          <div className="text-text-muted">Sister governance product for corporate treasury, family office, and institutional signers. Q4 2026. Working name.</div>
          <ul className="space-y-0.5 mt-1 text-xs">
            <li className="flex gap-2"><span className="text-accent-teal mt-0.5">·</span><span>Self-custodial. No provider key share, ever — verifiable on-chain.</span></li>
            <li className="flex gap-2"><span className="text-accent-teal mt-0.5">·</span><span>Quorum + RBAC + withdrawal-policy DSL + SIEM-exportable audit log.</span></li>
            <li className="flex gap-2"><span className="text-accent-teal mt-0.5">·</span><span>Per-signer succession + duress mode + Hybrid-E for non-crypto signers.</span></li>
            <li className="flex gap-2"><span className="text-accent-teal mt-0.5">·</span><span>No account cap. Add as many signers as your governance actually has.</span></li>
          </ul>
          <div className="pt-2">
            <Link to="/corporate" className="font-semibold text-xs hover:underline" style={{ color: "#10b981" }}>Read about NoKLock.corporate →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// FaqTab — preserved from 0.15.0 verbatim.
// ----------------------------------------------------------------------------
function FaqTab({ t }: { readonly t: ReturnType<typeof useT>["t"] }): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="font-bold mb-2">Why crypto-only payments for self-custody?</h2>
        <p className="text-text-muted text-sm">
          The on-chain License NFT IS your receipt and IS your subscription state. The app reads <code>balanceOf(yourWallet, tier)</code> on Polygon and that's it. No payment processor sits in the middle, no card on file, no renewal email. You can verify your tier in any block explorer at any time. NoKLock holds no payment info about you because we never see one. Managed mode uses fiat billing via Paddle (coming with NL-2) — that's a separate rail for users who'd rather not touch crypto at the door.
        </p>
      </section>

      <section className="card">
        <h2 className="font-bold mb-2">{t("pricing.faq.losePhone.question")}</h2>
        <p className="text-text-muted text-sm mb-2">
          {t("pricing.faq.losePhone.intro")} <strong>{t("pricing.faq.losePhone.simple")}</strong> <strong>{t("pricing.faq.losePhone.max")}</strong> {t("pricing.faq.losePhone.either")}
        </p>
        <p className="text-text-muted text-sm">
          {t("pricing.faq.losePhone.secureEnclave")} See <Link to="/info?tab=security" className="text-accent-cyan hover:underline">Info → Security</Link> for the technical detail.
        </p>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------------------
// UseCaseExpansion — preserved from 0.15.0 verbatim.
// ----------------------------------------------------------------------------
function UseCaseExpansion({ useCases }: { readonly useCases: readonly VaultUseCase[] }): JSX.Element {
  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">
        What you'd actually put in here — drawn from the{" "}
        <Link to="/info" className="text-accent-cyan hover:underline">
          full use-case catalog
        </Link>
        :
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {useCases.map((uc) => (
          <div
            key={uc.id}
            className="rounded-md border border-bg-surface bg-bg-panel/60 p-3 text-xs"
          >
            <div className="font-display font-bold text-text-on-dark text-sm mb-1">
              {uc.title}
            </div>
            <p className="text-text-muted mb-2 leading-snug">{uc.teaser}</p>
            <ul className="space-y-0.5">
              {uc.examples.slice(0, 3).map((ex) => (
                <li key={ex} className="flex gap-1.5 text-text-on-dark/75">
                  <span className="text-accent-teal shrink-0">·</span>
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// BottomConsolidationBlock — 0.16.0 NEW. Consolidates the content that was
// previously scattered across the 0.15.0 PageHeader sub-paragraph + the
// (now-deleted) SummaryBlock + the bottom prose of the self-custody and
// managed tabs. One block, bottom of page, sets the "two access paths, three
// tiers, inheritance optional, refer & earn" frame.
// ----------------------------------------------------------------------------
function BottomConsolidationBlock(): JSX.Element {
  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="font-display font-bold text-text-on-dark text-lg mb-3">
        Two access paths to the same store + restore vault.
      </h2>
      <ul className="text-sm text-text-on-dark/90 space-y-2">
        <li className="flex gap-2">
          <span className="text-accent-teal shrink-0">·</span>
          <span><strong>Self-custody.</strong> You hold the keys. On-chain License NFT, pay in USDC on Polygon. NoKLock cannot access your data.</span>
        </li>
        <li className="flex gap-2">
          <span className="text-accent-teal shrink-0">·</span>
          <span><strong>Managed.</strong> We hold a Privy embedded wallet for you — sign in with Google / Apple / email, passkey unlock, fiat billing via Paddle. Coming with NL-2.</span>
        </li>
      </ul>
      <p className="text-sm text-text-muted mt-4">
        Three tiers across both: <strong className="text-text-on-dark">Free / Standard / Premium</strong>. Same prices either side. Founder pricing on every paid tier — first 10,000 paid licences each side, contract-enforced for self-custody, Form-B–tracked for managed.
      </p>
      <p className="text-sm text-text-muted mt-3 italic">
        Inheritance is optional. Most users come for store + restore — pass-down to next-of-kin is a feature they turn on later, not the price of entry.
      </p>
      <p className="text-sm text-accent-teal mt-4">
        Refer others and earn a share on every paid licence they mint.{" "}
        <Link to="/refer" className="underline hover:text-accent-cyan">Refer &amp; earn →</Link>
      </p>
    </div>
  );
}

/** Live IP note — reads the admin-controlled patent status flag so the
 *  wording (in-progress / filed / pending — with serial) flips the moment
 *  the admin sets it, no PWA rebuild. */
function PricingIpNote(): JSX.Element {
  const { leader } = useLivePatentLeader();
  return (
    <p className="text-xs text-text-muted mt-3">
      <strong className="text-text-on-dark/90">On the IP:</strong> {leader.toLowerCase()}, covering {PATENT_DESCRIPTION}
    </p>
  );
}
