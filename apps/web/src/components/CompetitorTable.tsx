// @version 0.6.1 @date 2026-06-07
// 0.6.1 — Daniel 2026-06-07 (handoff §3.14): "User-owned cloud storage" row
//         hint reworded to lead with the storage-agnostic frame BEFORE the
//         provider list, so the two dimensions Daniel flagged (where shares
//         live + who never holds them) are both covered without losing the
//         familiar Drive/Dropbox/iCloud anchor. New lead sentence: "Your
//         encrypted recovery shares live in storage YOU pick — local
//         folders OR YOUR own cloud accounts (Drive, Dropbox, iCloud…),
//         never on our servers." CLI / OAuth / why-it-matters tail kept
//         verbatim. tooltips.ts key + all 5 non-English locales updated in
//         parallel (en/de/fr/pt/zh-Hans/hi) to keep i18n parity.
// @version 0.6.0 @date 2026-06-06
// 0.6.0 — Daniel 2026-06-06: REMOVED both "Read the honest head-to-heads"
//         link bars (one inside the full-table accordion intro at ~line
//         590, one after ComplementaryTools at ~line 700). The "Deeper
//         comparison" link card I added to the top of the Competitors
//         tab on Jun 5 (Info.tsx 0.8.7) is the same call-to-action and
//         renders above this component, so the in-table bars are now
//         redundant duplicates. Daniel: "once at the top of the page is
//         suff." No data/positioning change — only the duplicate links
//         removed.
// @version 0.5.4 @date 2026-06-03
// 0.5.4 — Daniel 2026-06-03: User-owned cloud storage row hint extended to
//         mention noklock-cli (Dropbox auto-upload available today, drive +
//         onedrive coming). NoKLock still holds no OAuth tokens either way.
// @version 0.5.3 @date 2026-06-03
// 0.5.3 — Daniel 2026-06-03 H17 fix: NOKLOCK_SELF_CUSTODY.killer said
//         "Soulbound ERC-5192 trigger + duress decoy + M-of-N independent
//         heirs — the only stack with all four" but only listed THREE items.
//         Made the four explicit: (1) autonomous on-chain Chainlink dead-man
//         trigger, (2) soulbound ERC-5192 inheritance record, (3) duress
//         decoy, (4) M-of-N independent heirs. Each of the four corresponds
//         to a UNIQUE-marked cell in the legacy 37-row matrix below, so the
//         claim is verifiable in-page.
// @version 0.5.2 @date 2026-06-03
// 0.5.2 — Daniel 2026-06-03 truthfulness-audit P0 fixes:
//         - REMOVED row "Web Worker isolation of crypto core" (FALSE — no
//           `new Worker(...)` exists in apps/web/src; crypto-core runs on
//           main thread inside enrol/restore pipelines). To restore the
//           claim, actually move crypto-core into a worker.
//         - DOWNGRADED "Strict CSP + Trusted Types" → "Strict CSP" only
//           (Trusted Types was removed in .htaccess 0.4.0 because the
//           report-only stub had "zero security value"; only CSP remains).
// @version 0.5.1 @date 2026-06-03
// 0.5.1 — Daniel 2026-06-03: REMOVED row "Asset valuation at inheritance"
//         (was claimed "unique" with hint "Shows your heir the wallet's value
//         at the moment they inherit"). The claim was not backed by any code
//         path — no heir-facing valuation surface, no price-feed integration
//         in the heir-restore flow, no email template line. Removed per the
//         truthfulness audit triggered by Daniel's audit. Future restoration
//         requires actually building the feature (Chainlink price feeds in
//         heir-restore-complete step + confirmation email line).
// @version 0.5.0 @date 2026-06-02
// 0.5.0 — Competitors-tab reorg (managed-wallet-competitors-tab-reorg-20260602.md
//         + Daniel's positioning-realignment-brief-20260602.md). Per Daniel's
//         realignment: KILL Category C (password managers). They are
//         complements, not competitors, and now appear as a "Complementary
//         tools" section below the competitor accordions.
//
//         Front-of-house is now TWO collapsible category accordions:
//           A. Crypto inheritance       — 6 rivals (Casa, Vault12, Coincover,
//                                         Unchained Capital Vault, Sarcophagus,
//                                         Heir) + 2 NoKLock pinned rows
//                                         (Self-custody + Managed)
//           B. Digital legacy &        — 8 rivals (Everplans, Trustworthy,
//              post-mortem               GoodTrust, AfterVault, Cake, Lantern,
//                                         Inalienable, Yellow Brick) + 2 NoKLock
//                                         pinned rows
//
//         Each row is COMPETITOR-PER-ROW (transposed from the legacy 37-row
//         FEATURE-per-row grid) with 8 columns: Product · Cheapest paid ·
//         Self-custody · Inheritance trigger · Non-crypto heir path · Survives
//         vendor shutdown · MANAGED WALLET (NEW, killer-diff column) · Killer
//         differentiator.
//
//         A new "Complementary tools — password managers" card sits below the
//         accordions with one paragraph framing 1Password / Bitwarden /
//         Dashlane / Proton Pass / Apple Passwords as complements, not rivals
//         (per realignment brief option A). The card explicitly tells the
//         reader: store your password-manager master password in a NoKLock
//         letter vault.
//
//         The legacy 37-row behavioural matrix and the 10-row pricing matrix
//         are preserved verbatim inside a <details> "Deep feature dive"
//         collapsible below — kept because every row is already
//         veracity-checked and useful for the buyer who wants to verify
//         every UNIQUE claim. Pure relocation, no content change.
//
// 0.4.0 — Veracity + clarity (Daniel Q4): "Hardware wallet integration" →
//         "Hardware wallet support" with "via MetaMask / WC" cell; lifetime
//         price → "$299–499"; plain-English InfoTooltip hints across rows.
// 0.3.1 — Veracity: passkey row label tightened.
// 0.3.0 — Deep-dive added "Pricing & positioning" matrix below the feature
//         grid (Nunchuk, ZenGo, Unchained, Tangem on price/model only).
// 0.2.x — Earlier additions: on-chain referral row, audit honesty, post-
//         hardening differentiator rows.
// 0.1.0 — Initial 30-row competitor matrix.

import { useState } from "react";
import { Link } from "react-router-dom";
import { InfoTooltip } from "./InfoTooltip.js";

// ===========================================================================
// New (v0.5.0) — category-per-accordion structure
// ===========================================================================

type Verdict = "yes" | "no" | "partial" | "unique";
type CategoryCell = Verdict | string; // free-text for price + killer-diff

interface Competitor {
  readonly product: string;
  readonly cheapest: string;
  readonly selfCustody: Verdict;
  readonly trigger: CategoryCell;
  readonly nonCryptoHeir: Verdict;
  readonly survivesShutdown: Verdict;
  readonly managedWallet: Verdict;     // NEW killer-diff column
  readonly killer: string;             // free-text, italic
  readonly isUs?: boolean;             // pin + tint
  readonly compareSlug?: string;       // links to /compare/:slug when present
}

interface CategoryDef {
  readonly id: "crypto-inheritance" | "digital-legacy";
  readonly title: string;
  readonly blurb: string;
  readonly competitors: readonly Competitor[];
}

const NOKLOCK_SELF_CUSTODY: Competitor = {
  product: "NoKLock — Self-custody",
  cheapest: "$99/yr (or $299 once, Lifetime)",
  selfCustody: "yes",
  trigger: "yes (Chainlink dead-man, autonomous on-chain)",
  nonCryptoHeir: "yes",
  survivesShutdown: "yes",
  managedWallet: "no",
  killer: "Autonomous on-chain Chainlink dead-man trigger + soulbound ERC-5192 inheritance record + duress decoy + M-of-N independent heirs — the only stack with all four.",
  isUs: true,
};

const NOKLOCK_MANAGED: Competitor = {
  product: "NoKLock — Managed",
  cheapest: "$99/yr Standard (Free tier exists)",
  selfCustody: "partial",
  trigger: "yes (same on-chain trigger)",
  nonCryptoHeir: "yes",
  survivesShutdown: "yes",
  managedWallet: "unique",
  killer: "The only managed crypto wallet where the inheritance trigger is autonomous on-chain — not a vendor handover.",
  isUs: true,
  compareSlug: "managed",
};

const CATEGORIES: readonly CategoryDef[] = [
  {
    id: "crypto-inheritance",
    title: "Crypto inheritance",
    blurb:
      "Direct rivals — products built specifically for crypto inheritance / key recovery. NoKLock is the only stack with (a) an autonomous on-chain trigger, (b) a soulbound ERC-5192 inheritance record, (c) duress protection, and (d) — as of 2026-06-02 — an email/passkey managed path for non-crypto heirs.",
    competitors: [
      NOKLOCK_SELF_CUSTODY,
      NOKLOCK_MANAGED,
      {
        product: "Casa",
        cheapest: "$250/yr",
        selfCustody: "partial",
        trigger: "manual (Casa-mediated)",
        nonCryptoHeir: "no",
        survivesShutdown: "partial",
        managedWallet: "no",
        killer: "—",
        compareSlug: "casa",
      },
      {
        product: "Vault12",
        cheapest: "~$365/yr",
        selfCustody: "yes",
        trigger: "partial (app-mediated)",
        nonCryptoHeir: "no",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "vault12",
      },
      {
        product: "Coincover",
        cheapest: "~$200/yr (bundled w/ partner wallets)",
        selfCustody: "no",
        trigger: "manual (insurance claim)",
        nonCryptoHeir: "partial",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "coincover",
      },
      {
        product: "Unchained Capital Vault",
        cheapest: "~$500/yr",
        selfCustody: "partial",
        trigger: "manual (legal + multisig)",
        nonCryptoHeir: "no",
        survivesShutdown: "partial",
        managedWallet: "no",
        killer: "—",
        compareSlug: "unchained",
      },
      {
        product: "Sarcophagus",
        cheapest: "ETH gas only",
        selfCustody: "yes",
        trigger: "yes (re-sign required)",
        nonCryptoHeir: "no",
        survivesShutdown: "yes",
        managedWallet: "no",
        killer: "—",
        compareSlug: "sarcophagus",
      },
      {
        product: "Heir",
        cheapest: "TBD (closed beta 2026)",
        selfCustody: "partial",
        trigger: "partial",
        nonCryptoHeir: "partial",
        survivesShutdown: "partial",
        managedWallet: "partial",
        killer: "—",
        compareSlug: "heir",
      },
    ],
  },
  {
    id: "digital-legacy",
    title: "Digital legacy & post-mortem",
    blurb:
      "Where a non-crypto user goes today when planning end-of-life. Every product on this list handles documents + contacts well. NONE handle crypto, on-chain triggers, or self-custody. NoKLock — Managed is the bridge: passkey signin, no wallet setup, but the underlying inheritance runs autonomously on Polygon.",
    competitors: [
      { ...NOKLOCK_SELF_CUSTODY, killer: "Same digital-legacy + estate-doc vault these all sell, plus the only autonomous on-chain crypto inheritance trigger." },
      { ...NOKLOCK_MANAGED, killer: "Lets a non-crypto heir inherit crypto by passkey login — no digital-legacy product on this list does that." },
      {
        product: "Everplans",
        cheapest: "$75/yr",
        selfCustody: "no",
        trigger: "no (manual deputies)",
        nonCryptoHeir: "yes",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "everplans",
      },
      {
        product: "Trustworthy",
        cheapest: "$120/yr (Family)",
        selfCustody: "no",
        trigger: "no (manual collaborators)",
        nonCryptoHeir: "yes",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "trustworthy",
      },
      {
        product: "GoodTrust",
        cheapest: "$39/yr",
        selfCustody: "no",
        trigger: "partial (after-death messaging + memorial)",
        nonCryptoHeir: "yes",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "goodtrust",
      },
      {
        product: "AfterVault",
        cheapest: "$50/yr",
        selfCustody: "no",
        trigger: "partial (executor unlock)",
        nonCryptoHeir: "yes",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "aftervault",
      },
      {
        product: "Cake",
        cheapest: "free (paid add-ons)",
        selfCustody: "no",
        trigger: "no (planning checklist)",
        nonCryptoHeir: "yes",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "cake",
      },
      {
        product: "Lantern",
        cheapest: "free (Premium ~$27/yr)",
        selfCustody: "no",
        trigger: "no (planning checklist + deputies)",
        nonCryptoHeir: "yes",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "lantern",
      },
      {
        product: "Inalienable",
        cheapest: "$99/yr",
        selfCustody: "no",
        trigger: "partial (verified-death unlock)",
        nonCryptoHeir: "yes",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "inalienable",
      },
      {
        product: "Yellow Brick (Wills)",
        cheapest: "one-time will fee",
        selfCustody: "no",
        trigger: "no (legal document only)",
        nonCryptoHeir: "yes",
        survivesShutdown: "no",
        managedWallet: "no",
        killer: "—",
        compareSlug: "yellow-brick",
      },
    ],
  },
];

const CATEGORY_COLS = [
  "Product",
  "Cheapest paid",
  "Self-custody",
  "Inheritance trigger",
  "Non-crypto heir path",
  "Survives vendor shutdown",
  "Managed wallet (email/passkey, no wallet setup)",
  "Killer differentiator (NoKLock wins)",
] as const;

const MANAGED_WALLET_TOOLTIP =
  '"Managed wallet" = a user can sign in with email or passkey and use the service immediately, without ever installing MetaMask, writing down a seed phrase, or managing a private key. The provider handles key custody (typically via MPC or passkeys); the user just logs in.';

function renderVerdict(value: Verdict, isOurRow: boolean): JSX.Element {
  if (value === "yes")     return <span className={isOurRow ? "text-accent-green font-bold" : "text-accent-green"}>✓</span>;
  if (value === "no")      return <span className="text-text-muted">✗</span>;
  if (value === "partial") return <span className="text-accent-cyan">partial</span>;
  return <span className="grad font-bold">UNIQUE</span>;
}

function renderCategoryCell(value: CategoryCell, isOurRow: boolean): JSX.Element {
  if (value === "yes" || value === "no" || value === "partial" || value === "unique") {
    return renderVerdict(value, isOurRow);
  }
  return <span className="text-text-on-dark/80 text-xs">{value}</span>;
}

function CategoryAccordion({
  cat,
  open,
  onToggle,
}: {
  readonly cat: CategoryDef;
  readonly open: boolean;
  readonly onToggle: () => void;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-bg-surface overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 bg-bg-surface/30 hover:bg-bg-surface/50 flex items-center gap-3 transition-colors"
        aria-expanded={open}
      >
        <span className={`inline-block transition-transform duration-150 ${open ? "rotate-90" : ""}`}>▸</span>
        <span className="font-bold font-display text-lg"><span className="grad">{cat.title}</span></span>
        <span className="text-text-muted text-xs ml-auto">{cat.competitors.length} rows</span>
      </button>
      {open && (
        <div className="p-3 space-y-3">
          <p className="text-text-on-dark/85 text-sm">{cat.blurb}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-bg-surface">
                  {CATEGORY_COLS.map((col, i) => {
                    const isManagedCol = col.startsWith("Managed wallet");
                    const isKillerCol = i === CATEGORY_COLS.length - 1;
                    return (
                      <th
                        key={col}
                        className={[
                          "p-2 text-text-on-dark",
                          i === 0 ? "text-left sticky left-0 bg-bg-panel z-10" : "text-center",
                          isManagedCol ? "bg-accent-teal/10 text-accent-teal" : "",
                          isKillerCol ? "border-l border-accent-teal/30" : "",
                        ].join(" ")}
                      >
                        {isManagedCol ? <>Managed wallet <InfoTooltip hint={MANAGED_WALLET_TOOLTIP} /></> : col}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {cat.competitors.map((c) => {
                  const rowClass = c.isUs
                    ? "border-t border-accent-teal/40 bg-bg-surface/30"
                    : "border-b border-bg-surface/40 hover:bg-bg-surface/30";
                  return (
                    <tr key={`${cat.id}-${c.product}`} className={rowClass}>
                      <td className={`p-2 sticky left-0 bg-bg-panel z-10 ${c.isUs ? "grad font-bold" : "text-text-on-dark/90"}`}>
                        {c.compareSlug ? (
                          <Link to={`/compare/${c.compareSlug}`} className="hover:underline">{c.product}</Link>
                        ) : (
                          c.product
                        )}
                      </td>
                      <td className="text-center p-2 text-xs text-text-on-dark/80">{c.cheapest}</td>
                      <td className="text-center p-2">{renderVerdict(c.selfCustody, !!c.isUs)}</td>
                      <td className="text-center p-2">{renderCategoryCell(c.trigger, !!c.isUs)}</td>
                      <td className="text-center p-2">{renderVerdict(c.nonCryptoHeir, !!c.isUs)}</td>
                      <td className="text-center p-2">{renderVerdict(c.survivesShutdown, !!c.isUs)}</td>
                      <td className="text-center p-2 bg-accent-teal/5">{renderVerdict(c.managedWallet, !!c.isUs)}</td>
                      <td className="text-left p-2 border-l border-accent-teal/30 text-xs">
                        {c.isUs ? (
                          <span className="grad font-bold italic">{c.killer}</span>
                        ) : (
                          <span className="text-text-muted">{c.killer}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplementaryTools(): JSX.Element {
  return (
    <section className="card border-accent-teal/40 mt-6">
      <h3 className="text-xl font-bold font-display mb-2">
        <span className="grad">Complementary tools — password managers</span>
        <span className="ml-2 text-text-muted text-sm font-normal">(not competitors)</span>
      </h3>
      <p className="text-text-on-dark/90 leading-relaxed">
        <span className="font-bold">1Password, Bitwarden, Dashlane, Proton Pass and Apple Passwords handle your 200 daily logins.
        NoKLock handles the one master password that unlocks them</span> — plus the seed, the sealed letter, the
        safe-deposit photo. They're not competitors; we suggest you use them together.{" "}
        <span className="text-accent-cyan font-bold">Store your password-manager master password in a NoKLock letter vault.</span>
      </p>
      <p className="text-text-muted text-xs mt-2">
        Why this isn't a competitor row: password managers are daily-utility products optimised for recall hundreds
        of times a week. NoKLock is a one-shot product optimised for zero-loss handoff once-in-a-lifetime. Different
        jobs, different cadences — keep using both.
      </p>
    </section>
  );
}

// ===========================================================================
// Legacy block (v0.4.0 verbatim) — preserved inside the "Deep feature dive"
// <details> below. Pure relocation; every cell is already veracity-checked.
// ===========================================================================

type LegacyCell = "yes" | "no" | "partial" | "unique" | string;
interface LegacyRow {
  readonly feature: string;
  readonly cells: readonly LegacyCell[];
  readonly hint?: string;
}

const LEGACY_HEADERS = [
  "NoKLock",
  "Casa",
  "Vault12",
  "Sarcophagus",
  "Bitkey",
  "Bron",
  "Ledger Recover",
  "Inheriti",
  "Webacy",
  "Deadhand",
] as const;

const LEGACY_ROWS: readonly LegacyRow[] = [
  { feature: "Self-custodial (no provider keys)",       cells: ["yes",    "partial",  "yes",      "yes",      "partial",  "partial",  "no",       "yes",      "yes",      "yes"],
    hint: "Only you ever hold the keys/secret. The provider cannot access, freeze, or lose your assets because it never has them." },
  { feature: "User-owned cloud storage",                cells: ["unique", "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "Your encrypted recovery shares live in storage YOU pick — local folders OR YOUR own cloud accounts (Drive, Dropbox, iCloud…), never on our servers. Manual upload + open-source CLI tool (noklock-cli) for automated upload to Dropbox today, Google Drive + OneDrive coming. Either way, NoKLock holds no OAuth tokens. Why it matters: there is no central database of users' secrets to breach, leak, or be compelled to hand over — compromise our servers and there is nothing of yours there." },
  { feature: "Truly air-gapped enrolment",              cells: ["unique", "no",       "no",       "no",       "partial",  "no",       "no",       "no",       "no",       "no"],
    hint: "You can create the vault with the device fully offline, so the secret never touches the internet at all." },
  { feature: "Duress / decoy vault",                    cells: ["unique", "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "A second 'decoy' vault that opens with a different password — so if you're forced to unlock under threat, you can hand over the decoy." },
  { feature: "3-tier storage redundancy",               cells: ["unique", "no",       "no",       "partial",  "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "Your recovery is spread across several independent places, so losing any one of them does not lock you out." },
  { feature: "Soulbound NFT inheritance trigger (ERC-5192)",      cells: ["unique", "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "Inheritance rights are granted by a NON-TRANSFERABLE ERC-5192 soulbound NFT minted to your heir's wallet — it cannot be sold, moved, stolen or seized. ERC-5192 is rarely used in production anywhere; NoKLock is one of the few systems actually using it for what it was designed for. Verifiable on PolygonScan." },
  { feature: "Finite state machine on-chain (state independently verifiable, not a vendor DB)", cells: ["unique", "no — vendor DB", "no — vendor DB", "no — vendor DB", "no — vendor DB", "no — vendor DB", "no — vendor DB", "no — vendor DB", "no — vendor DB", "no — vendor DB"],
    hint: "Every NoKLock vault is in exactly one state at any time, and that state lives on Polygon — anyone can read it from a block explorer without trusting us. Every other crypto-inheritance product runs its lifecycle state in a private database controlled by the vendor: you cannot verify which state your inheritance is in without their dashboard, and the vendor can in principle mutate it. NoKLock is a true on-chain finite state machine — see Info → Architecture → Finite state machine for the full diagram + state table." },
  { feature: "Hardware wallet support",                 cells: ["via MetaMask / WC", "yes", "no",  "no",       "yes",      "no",       "yes",      "no",       "no",       "no"],
    hint: "Use a Ledger/Trezor for on-chain actions the standard way — through MetaMask, Trust, or WalletConnect. We deliberately run no custom USB driver, and a hardware wallet never holds your vault's encryption secret (that layer is offline and wallet-agnostic by design)." },
  { feature: "Multisig support",                        cells: ["yes",    "yes",      "no",       "no",       "yes",      "yes",      "no",       "no",       "no",       "no"],
    hint: "Works with wallets that require several signatures to approve a transaction." },
  { feature: "Inheritance / NoK",                       cells: ["yes",    "yes",      "yes",      "yes",      "yes",      "yes",      "no",       "yes",      "yes",      "yes"],
    hint: "NoK = next-of-kin: the person who can inherit access if something happens to you." },
  { feature: "Dead-man's switch",                       cells: ["yes",    "yes (delay)", "yes",   "yes (re-sign)", "yes (6mo)", "yes (6mo)", "no",   "yes",      "yes",      "yes (90d)"],
    hint: "If you stop periodically checking in, the system assumes you're gone and lets your heir begin the inheritance process." },
  { feature: "Multi-NoK voting (M-of-N)",               cells: ["yes",    "yes",      "partial",  "n/a",      "no",       "partial",  "no",       "no",       "no",       "no"],
    hint: "Name several heirs and require, say, any 2 of 3 to agree before inheritance proceeds." },
  { feature: "Test-restore drill",                      cells: ["yes",    "yes",      "yes",      "n/a",      "yes",      "partial",  "n/a",      "no",       "no",       "no"],
    hint: "A guided dry-run that proves you can actually rebuild your vault from your shares — before you ever need to." },
  { feature: "WebAuthn passkey (optional unlock)",      cells: ["yes",    "partial",  "partial",  "n/a",      "yes",      "yes",      "yes",      "partial",  "yes",      "yes"],
    hint: "Optional Face / Touch / security-key unlock on a device. It's a convenience — your master password still works everywhere and stays your primary key." },
  { feature: "SMS-2FA banned (SIM-swap safe)",          cells: ["yes",    "yes",      "yes",      "n/a",      "yes",      "yes",      "n/a",      "n/a",      "n/a",      "yes"],
    hint: "We never use text-message codes — those can be stolen by hijacking your phone number (a 'SIM swap')." },
  { feature: "Configurable Shamir threshold",           cells: ["unique", "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no",       "fixed"],
    hint: "You choose how many of your share files are needed to recover — e.g. any 3 of 5." },
  { feature: "Multi-seed per vault",                    cells: ["yes",    "no",       "yes",      "no",       "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "Store more than one wallet recovery phrase inside a single vault." },
  { feature: "Watch-only / address-only mode",          cells: ["yes",    "no",       "no",       "no",       "no",       "no",       "no",       "no",       "yes",      "no"],
    hint: "Track a wallet by its public address without storing any private keys." },
  { feature: "Family / couples shared vault",           cells: ["yes",    "partial",  "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "A vault two people (e.g. partners) can manage together." },
  { feature: "Multi-chain SBT (post-launch)",           cells: ["yes",    "n/a",      "n/a",      "partial",  "n/a",      "n/a",      "n/a",      "yes",      "n/a",      "n/a"],
    hint: "Planned support for the inheritance token on additional blockchains after launch." },
  { feature: "Insurance / loss cover",                  cells: ["no — non-custodial by design", "partial", "no", "no", "partial", "partial", "$50k", "no", "no", "no"],
    hint: "Whether losses are insured. NoKLock is non-custodial — we never hold your assets, so there is nothing for us to insure or lose. (Custodial providers carry insurance because they DO hold your keys.)" },
  { feature: "Smart-contract audit",                    cells: ["automated scan + source-verified", "n/a", "n/a", "yes", "yes", "partial", "yes", "yes", "partial", "partial"],
    hint: "How the contracts were checked. We use automated security scanning + public source verification on PolygonScan. We do NOT claim a paid third-party human audit — stated honestly; read the source yourself on the Contracts tab." },
  { feature: "Bug-report reward",                       cells: ["free Lifetime licence", "private",  "private",  "Immunefi",  "Immunefi",  "Immunefi",  "n/a",      "Immunefi",  "partial",  "Immunefi"],
    hint: "What you get for responsibly reporting a security flaw. We give a free Lifetime licence (no cash bounty programme)." },
  { feature: "On-chain referral revenue-share",         cells: ["unique", "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "Referral discounts and rewards are executed automatically by the smart contract — no company payout team, no claim form." },
  { feature: "Free tier",                               cells: ["yes",    "no",       "yes",      "no",       "bundled HW","no",      "no",       "yes",      "partial",  "yes"] },
  { feature: "Lifetime pricing option",                 cells: ["yes ($299–499)", "no", "no",     "no",       "no",       "no",       "no",       "no",       "no",       "yes ($300)"],
    hint: "Pay once instead of an annual subscription. NoKLock Lifetime is $299 at the Founder price, $499 afterwards — read live from the contract." },
  { feature: "Recurring-payment model",                 cells: ["USDC on-chain", "$250/yr",  "~$30/mo", "ETH gas",  "with HW",  "tbd",      "$10/mo",   "free",     "freemium", "$0/free"],
    hint: "How ongoing payment works. NoKLock takes a USDC payment on-chain at mint/renewal — no card, no stored billing." },
  { feature: "Open-source crypto core",                 cells: ["yes (post-launch)", "partial", "no",  "yes",      "partial",  "no",       "no",       "partial",  "no",       "yes (AGPL)"],
    hint: "The encryption code is open for anyone to inspect (published at/after launch)." },
  { feature: "Architecture cannot see your keys",       cells: ["unique", "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "It is structurally impossible for the system to access your secrets — a property of how it's built, not a policy promise. Why it matters: a provider that can touch your keys (even a shard) can be hacked, subpoenaed, freeze you out, or go bust with your assets inside — NoKLock never holds them, so that entire class of failure can't reach you." },
  { feature: "Live SolidityScan score on landing",      cells: ["unique", "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "The contracts' automated security score is shown live on the site — not merely asserted in marketing." },
  { feature: "Three-mode recovery (self / emergency / post-mortem)", cells: ["unique", "no", "partial", "no", "no", "no", "no", "no", "no", "partial"],
    hint: "Recover it yourself, via trusted contacts in an emergency, or have your heir inherit after you're gone — three separate paths." },
  { feature: "Strict Content-Security-Policy",          cells: ["unique", "no",       "no",       "no",       "partial",  "no",       "no",       "no",       "no",       "no"],
    hint: "Browser-level header restricting which scripts can run — blocks injected or malicious code from tampering with the app." },
  { feature: "RPC proxy (IP privacy from public nodes)", cells: ["unique", "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no",       "no"],
    hint: "Blockchain reads go through our proxy so public blockchain nodes don't see your IP address (with a fallback if our proxy is down)." },
  { feature: "Social recovery with cancellation window", cells: ["yes (Premium)", "yes", "partial", "no",     "no",       "yes",      "no",       "no",       "no",       "no"],
    hint: "Trusted contacts can help you recover, with a built-in delay during which you can cancel a malicious attempt." },
];

const LEGACY_POSITIONING_COL_HINTS: Readonly<Record<string, string>> = {
  "Custody": "Who actually controls the keys/assets. 'Self-custody' means only you do — the provider cannot.",
  "KYC": "Whether you must submit ID / personal documents to use the service.",
  "Multi-asset": "Whether it covers more than one type of crypto / wallet (vs. e.g. Bitcoin only).",
  "Autonomous on-chain inheritance": "Inheritance executes automatically by smart contract — no human executor, lawyer, or company step required.",
  "On-chain referral": "A referral-reward programme run entirely by the smart contract, not a company-managed scheme.",
};

const LEGACY_POSITIONING_COLS = [
  "Product", "Annual price", "One-time / Lifetime", "Free tier",
  "Custody", "KYC", "Multi-asset", "Autonomous on-chain inheritance", "On-chain referral",
] as const;

const LEGACY_POSITIONING: readonly (readonly string[])[] = [
  ["NoKLock",        "$99–149/yr",    "$299–499 (Lifetime)", "Yes",         "Self-custody",            "No",       "Yes (seed+letters+docs)", "Yes — dead-man's switch + soul-bound NFT", "UNIQUE"],
  ["Casa",           "$250–2,100/yr", "—",                   "No",          "Self (Casa holds 1 key)", "Yes",      "BTC/ETH",                 "No (manual beneficiary)",                  "No"],
  ["Vault12",        "~$365/yr",      "—",                   "Limited",     "Self (Shamir net)",       "No",       "Multi",                   "No",                                       "No"],
  ["Ledger Recover", "~$120/yr",      "—",                   "No",          "Custodial 3-shard",       "Yes (ID)", "Multi",                   "No",                                       "No"],
  ["Nunchuk",        "$120–2,100/yr", "—",                   "Wallet only", "Self multisig",           "No",       "BTC only",                "Yes (on-chain timelock)",                  "No"],
  ["ZenGo",          "$50–200/yr",    "—",                   "Yes (base)",  "MPC keyless (no seed)",   "Partial",  "Multi",                   "No (Legacy Transfer)",                     "No"],
  ["Unchained",      "~$500/yr",      "—",                   "No",          "Collaborative",           "Yes",      "BTC",                     "No (legal + multisig)",                    "No"],
  ["Tangem",         "—",             "$70–140 one-time",    "No",          "Self (seedless hw)",      "No",       "Multi",                   "No",                                       "No"],
  ["Inheriti",       "—",             "~$40 one-time",       "No",          "Self",                    "No",       "Multi",                   "Partial (dead-man)",                       "No"],
  ["Deadhand",       "$0",            "$0",                  "Yes (DIY)",   "Self",                    "No",       "EVM",                     "Yes (dead-man, DIY)",                      "No"],
];

function renderLegacyCell(value: LegacyCell, isOurColumn: boolean): JSX.Element {
  if (value === "yes")     return <span className={isOurColumn ? "text-accent-green font-bold" : "text-accent-green"}>✓</span>;
  if (value === "no")      return <span className="text-text-muted">✗</span>;
  if (value === "partial") return <span className="text-accent-cyan">partial</span>;
  if (value === "unique")  return <span className="grad font-bold">UNIQUE</span>;
  return <span className="text-text-on-dark/80 text-xs">{value}</span>;
}

function LegacyDeepDive(): JSX.Element {
  return (
    <details className="card mt-6">
      <summary className="cursor-pointer font-bold font-display text-lg">
        <span className="grad">Deep feature dive (37-row matrix)</span>
        <span className="text-text-muted text-sm font-normal ml-2">— verify every UNIQUE claim against the 9 closest crypto-inheritance rivals</span>
      </summary>
      <div className="mt-4 space-y-6">
        <p className="text-text-on-dark/80 text-sm">
          The full historical behavioural matrix and pricing/positioning grid — kept verbatim from v0.4.0
          because every cell is already veracity-checked. Useful if you want to verify a specific UNIQUE
          claim from the category accordions above. <span className="grad font-bold">UNIQUE</span> = something
          only NoKLock ships. ✓ = full feature. partial = limited. ✗ = absent.
        </p>
        {/* 2026-06-06 (Daniel) — REMOVED redundant "Read the honest head-to-heads"
            bar; the "Deeper comparison" link card at the top of the Competitors
            tab (Info.tsx 0.8.7) now anchors the same call-to-action without
            repeating it inside the accordion. */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-bg-surface">
                <th className="text-left p-2 sticky left-0 bg-bg-panel z-10">Feature</th>
                {LEGACY_HEADERS.map((h, i) => (
                  <th key={h} className={`text-center p-2 ${i === 0 ? "grad font-bold" : "text-text-muted"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEGACY_ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-bg-surface/40 hover:bg-bg-surface/30">
                  <td className="p-2 sticky left-0 bg-bg-panel z-10 text-text-on-dark/90">
                    {row.feature}
                    {row.hint && <InfoTooltip hint={row.hint} />}
                  </td>
                  {row.cells.map((cell, i) => (
                    <td key={i} className="text-center p-2">{renderLegacyCell(cell, i === 0)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted">
          Sources verified May 2026: Casa keys.casa · Vault12 vault12.com · Sarcophagus sarco.io · Bitkey bitkey.world (Q1 2026 launch) · Bron bron.so (March 2026) · Ledger Recover support.ledger.com · Inheriti inheriti.com · Webacy webacy.com · Deadhand deadhandprotocol.com.
        </p>

        <h3 className="text-xl font-bold font-display mt-10 mb-3"><span className="grad">Pricing &amp; positioning</span></h3>
        <p className="text-text-on-dark/80 text-sm mb-4">
          Where NoKLock sits on price and model against the full field — including the Bitcoin-inheritance and keyless-recovery rivals (Nunchuk, ZenGo, Unchained, Tangem). Low-band price, mid/high-band features. <span className="grad font-bold">UNIQUE</span> = no competitor offers it.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-bg-surface">
                {LEGACY_POSITIONING_COLS.map((c, i) => (
                  <th key={c} className={`p-2 ${i === 0 ? "text-left sticky left-0 bg-bg-panel z-10" : "text-center"} text-text-on-dark`}>
                    {c}
                    {LEGACY_POSITIONING_COL_HINTS[c] && <InfoTooltip hint={LEGACY_POSITIONING_COL_HINTS[c]!} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEGACY_POSITIONING.map((row, ri) => (
                <tr key={row[0]} className={`border-b border-bg-surface/40 ${ri === 0 ? "bg-bg-surface/30" : "hover:bg-bg-surface/30"}`}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`p-2 ${ci === 0 ? "sticky left-0 bg-bg-panel z-10 font-bold " + (ri === 0 ? "grad" : "text-text-on-dark/90") : "text-center text-xs"}`}
                    >
                      {cell === "UNIQUE" ? <span className="grad font-bold">UNIQUE</span> : cell === "No" || cell === "—" ? <span className="text-text-muted">{cell}</span> : <span className="text-text-on-dark/90">{cell}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-4">
          Pricing sourced May 2026: casa.io/pricing · vault12.com/pricing · shop.ledger.com (Recover) · nunchuk.io/pricing · zengo.com/pro · unchained.com/pricing · tangem.com/pricing · inheriti.com/pricing · deadhandprotocol.com. Figures are list prices at time of compilation; competitors may change them.
        </p>
      </div>
    </details>
  );
}

// ===========================================================================
// Top-level component
// ===========================================================================

export function CompetitorTable(): JSX.Element {
  const [openId, setOpenId] = useState<CategoryDef["id"] | null>("crypto-inheritance");
  return (
    <section className="card space-y-5">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold font-display">
          <span className="grad">NoKLock vs. the field</span>
        </h2>
        <p className="text-text-on-dark/80 text-sm">
          Two competitor categories, one comparison schema. NoKLock is pinned at the top of each
          (Self-custody + Managed) so every other row reads as "vs us". <span className="grad font-bold">UNIQUE</span> = no
          competitor offers it. Password managers don't appear as a competitor category — see the
          Complementary tools card below for why.
        </p>
      </header>
      <div className="space-y-3">
        {CATEGORIES.map((cat) => (
          <CategoryAccordion
            key={cat.id}
            cat={cat}
            open={openId === cat.id}
            onToggle={() => setOpenId(openId === cat.id ? null : cat.id)}
          />
        ))}
      </div>

      <ComplementaryTools />

      {/* 2026-06-06 (Daniel) — REMOVED second "Read the honest head-to-heads"
          bar; redundant with the "Deeper comparison" link card at the top
          of the Competitors tab (Info.tsx 0.8.7). Once at the top is
          sufficient. */}

      <p className="text-xs text-text-muted">
        Sources verified June 2026: keys.casa · vault12.com · coincover.com · unchained.com · sarco.io · heir.com ·
        everplans.com · trustworthy.com · mygoodtrust.com · aftervault.com · joincake.com · lanternlegacy.com ·
        inalienable.com · yellowbrickwills.com. Adjacent (managed-wallet infra, not competitor rows): privy.io ·
        web3auth.io · magic.link · dynamic.xyz · wallet.coinbase.com (Smart Wallet). Cells reflect publicly-disclosed
        features at time of compilation.
      </p>
      <p className="text-xs text-text-muted">
        For corporate-treasury, family-office and institutional governance (multi-sig quorum, RBAC, withdrawal-policy
        engine, SIEM-exportable audit, per-signer succession) see <Link to="/corporate" className="text-accent-cyan hover:underline">NoKLock.corporate</Link> —
        sister product, Q4 2026. The comparison above is the consumer NoKLock product only.
      </p>

      <LegacyDeepDive />
    </section>
  );
}
