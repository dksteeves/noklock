// @version 0.8.0 @date 2026-06-08
// 0.8.0 — Daniel 2026-06-08: surfaced UX gap. Tier-gating badge now visible
//         on EVERY layout (default accordion header, compact card flat
//         header, dense row), derived from the new shared
//         `lib/tier-gating.ts` VAULT_KIND_MIN_TIER map. Previously the
//         "Premium" pill only appeared on the dense row (EnrolChooser
//         surface) — the default 6-card grid on /info and the Manual
//         /info catalog and the Landing-hero compact grid showed no
//         tier hint at all, so Free/Standard browsers couldn't tell
//         Document + Image vaults were gated. Now:
//           - Accordion header (default layout)  → amber "Premium" pill
//             beside the BEST_KIND_LABEL when bestKind = document/image.
//           - Compact flat header                → same amber pill.
//           - Dense row                          → amber pill kept as-is
//             (continues to double as the Pick-this CTA → /pricing when
//             caller passes isKindLocked).
//         Free-available kinds (seed / letter) show no extra pill — the
//         absence of an amber badge against the gated cards is what
//         carries the meaning.
//         No schema changes to VaultUseCase. No copy changes to teaser
//         / examples / userActions / inlineCallout / urgency /
//         privacyStamp. Behaviour-additive only.
// @version 0.7.0 @date 2026-06-04
// 0.7.0 — Two refactors to the Use Cases tab:
//         (A) "Two free tools, do these now" — MOVED to the TOP of the Use
//             Cases tab content (was previously buried at the bottom of the
//             PhonePinNotCloud component). NEW prominent cyan-bordered
//             callout (`border-accent-cyan/40 bg-accent-cyan/5 rounded-xl
//             p-5 sm:p-6`) renders BEFORE the 6-card grid in the default
//             VaultUseCases output. Heading "Two free tools, do these now"
//             with cyan title; body lists Apple Digital Legacy Contact and
//             Google Inactive Account Manager (same content, new
//             prominence and placement). NEW <TwoFreeToolsCallout />
//             helper component. The legacy reference inside
//             PhonePinNotCloud's footer paragraph is kept (still useful
//             where that component is mounted on Info.tsx) but the
//             primary surface is now the top-of-tab cyan callout.
//         (B) 6-category cards converted to an ACCORDION. NEW component
//             state `expandedId: string | null` (starts `null` — all
//             collapsed on mount). Each <UseCaseCard /> now renders as a
//             header button (icon + title + 60-char-truncated short
//             description from the teaser + expand caret), always
//             visible. The body (best-kind pill + full teaser +
//             inlineCallout + examples list + userActions +
//             privacyStamp + urgency) ONLY renders when
//             `expandedId === useCase.id`. Clicking another header
//             collapses the current one and expands the new (single-
//             open accordion). Clicking the same header toggles it back
//             to null. Compact + dense layouts are UNCHANGED (they
//             render flat as before).
// @version 0.6.3 @date 2026-06-03
// 0.6.3 — Workflow B truthfulness re-audit: privacyStamp opening rewritten
//         honest-first. Was "We don't log a thing" (then a parenthetical
//         contradiction); now "We don't log vault contents. ... We do log
//         anonymous route-changes server-side ... for ops health — see /privacy."
//         Puts the full truth in the opening so it can't be missed.
// @version 0.6.2 @date 2026-06-03
// 0.6.2 — Daniel 2026-06-03: privacyStamp narrow-truth clarification per audit.
//         We don't log vault contents (true) but we do log anonymous
//         route-changes — disclosing now. Digital Identity card privacyStamp
//         appends a parenthetical pointing at /privacy. No schema changes;
//         copy-only.
// @version 0.6.1 @date 2026-06-02
// 0.6.1 — Daniel 2026-06-02 residual AI-slop nit flagged by adversarial review.
//         Crypto-finance urgency line: replaced figurative "dormant-account
//         purgatory" with a literal alternative ("stuck in a dormant account
//         no one can reach"). Same sentence stays concrete throughout. No
//         schema changes; copy-only.
// @version 0.6.0 @date 2026-06-02
// 0.6.0 — Human-voice pass across all 6 categories. Killed em-dash overuse
//         (one per paragraph max, ideally zero), generic adjectives, padding
//         phrases, and the "rest assured" tone that had crept into a few
//         urgency lines. Specifics kept (Argon2id, BIP-39, 6–12 months,
//         platform names). Digital Identity teaser tightened. PhonePinNotCloud
//         inlineCallout body rewritten human. Privacy stamp made direct, not
//         preachy. examples[], userActions[], and urgency lines audited
//         across crypto-finance, digital-identity, hidden-places,
//         vital-documents, final-wishes, and recovery-codes. Inline callout
//         structure unchanged; standalone PhonePinNotCloud sibling export
//         body copy ALSO updated to match (same warning, different surface).
// 0.5.0 — Password-manager mentions CONSOLIDATED into the Digital Identity
//         & Accounts category as their canonical home. Daniel: scatter is
//         bad; password-manager master sits more naturally with the rest of
//         the digital-life logins than under crypto-finance. Removed the
//         "Master password for your password manager…" example from the
//         crypto-finance entry (it always belonged here anyway, since the
//         master gates the entire online identity, not just exchange
//         credentials). Replaced the existing terse digital-identity bullet
//         with the explicit canonical phrasing: "Password-manager master
//         password (1Password / Bitwarden / Dashlane / Proton Pass / Apple
//         Passwords)" — framed as a USE CASE for NoKLock, not a comparison.
//         The complementary mention inside the inlineCallout
//         `heirsActuallyNeed` list stays (different frame: "what heirs
//         actually need" vs "what you store here"). Standalone
//         <PhonePinNotCloud /> sibling export UNCHANGED.
// 0.4.0 — Phone-PIN-not-cloud warning brought INSIDE the Digital Identity
//         card itself (was previously a separate sibling <PhonePinNotCloud />
//         component on Info.tsx — too easy to miss). Schema extended with a
//         new optional `inlineCallout` field on VaultUseCase carrying
//         { title, body, heirsActuallyNeed[], proactiveSetupNote }. The
//         digital-identity entry now supplies one, and UseCaseCard renders
//         it as an amber-tinted block (NOT brown!) just BEFORE the examples
//         list, with a clear visual divider so it reads as a critical
//         caveat. Background #1f1d0f, border #eab308, body #fef3c7, title
//         #facc15 bold yellow; "what heirs actually need" bullets with a
//         small key icon; footer note in italic dim. Standalone
//         <PhonePinNotCloud /> export PRESERVED so the existing Info.tsx
//         mount (line 861) keeps working — no breakage — but the in-card
//         inline version is now the primary surface.
// 0.3.0 — Digital Identity & Accounts category expanded with Daniel's "your
//         online life doesn't end when you do" framing: teaser rewritten,
//         new `userActions` field (the six concrete things an heir actually
//         has to do — memorialise/close, notify networks, recover what's
//         irreplaceable, stop the bleed, block impersonation, hand off
//         business ops), and a per-card "we don't log a thing" privacy
//         stamp rendered as a footer block inside the card. Also NEW
//         <PhonePinNotCloud /> sibling export — amber-tinted prominent
//         callout that surfaces the gap heirs trip over most: unlocking
//         the phone does NOT unlock the cloud. Lists what heirs actually
//         need (Apple ID master + recovery codes, Google master +
//         Authenticator export, Microsoft, Dropbox/iCloud/Box/Sync/pCloud,
//         password-manager master, carrier SIM PIN + porting freeze, per-
//         account 2FA recovery codes) + plug for the free pre-setup tools
//         (Apple Digital Legacy Contact, Google Inactive Account Manager).
//         Card type extended with optional userActions: readonly string[]
//         and optional privacyStamp: string; UseCaseCard renders both when
//         present so only the Identity category surfaces them (other five
//         categories render identically to 0.2.0).
// 0.2.0 — Dense rows are now actionable. New optional props `onPick(kind)` and
//         `isKindLocked(kind)` let callers (EnrolChooser) put a "Pick this"
//         button on each row that auto-selects the best-matching vault kind
//         and proceeds to the Enrol wizard. Locked rows (e.g. non-Premium
//         document / image) render an amber "Premium" pill instead of the
//         pick button so users see the gating before they get to /pricing.
// 0.1.0 — Initial VaultUseCases catalog component. Renders the six categories
//         of things people actually want to put in a NoKLock vault (Phase 2
//         catalog), with three layout variants:
//           - default  : full detail (Info.tsx + Manual.tsx)
//           - compact  : 3 examples, shorter cards (Landing.tsx hero)
//           - dense    : single-line summary chips (EnrolChooser)
//         Also exports <MemorialPlatforms /> — the six big platforms +
//         their official deceased-user policy URLs, surfaced on Info.tsx
//         in the "Digital legacy specifics" expandable section.
//
//         Visual language mirrors TierCard / .card pattern from index.css
//         (bg-panel surface, bg-surface border, rounded-xl, slate-on-dark
//         text). Hover adds a subtle accent-cyan glow ring.
//
//         No icon library is installed — icons are inline SVG, keyed by a
//         small string union so we stay typed without pulling in lucide.

import { useMemo, useState } from "react";
import { tierBadgeLabel, tierBadgeClasses } from "../lib/tier-gating.js";

/* ─────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────── */

export type VaultBestKind = "seed" | "letter" | "document" | "image";

export type VaultIcon =
  | "KeyRound"
  | "UserCircle"
  | "MapPin"
  | "FileText"
  | "Heart"
  | "ShieldCheck";

export interface VaultUseCase {
  readonly id: string;
  readonly title: string;
  readonly teaser: string;
  readonly examples: readonly string[];
  readonly bestKind: VaultBestKind;
  readonly icon: VaultIcon;
  readonly urgency: string;
  /** Optional 0.3.0 field: the concrete actions an heir actually has to
   *  perform for this category. Rendered as a "What your heir will need
   *  to do" sub-list inside the card when present. */
  readonly userActions?: readonly string[];
  /** Optional 0.3.0 field: a per-card privacy stamp rendered as a footer
   *  block. Used on Digital Identity & Accounts to make the zero-log
   *  promise visible exactly where readers worry about it most. */
  readonly privacyStamp?: string;
  /** Optional 0.4.0 field: an amber-tinted critical caveat rendered
   *  INSIDE the card body, before the examples list. Used on Digital
   *  Identity to surface the phone-PIN-doesn't-unlock-the-cloud gap
   *  the moment a reader encounters the category, rather than as a
   *  buried follow-on section. */
  readonly inlineCallout?: {
    readonly title: string;
    readonly body: string;
    readonly heirsActuallyNeed: readonly string[];
    readonly proactiveSetupNote: string;
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Catalog
   ───────────────────────────────────────────────────────────────────────── */

export const VAULT_USE_CASES: readonly VaultUseCase[] = [
  {
    id: "crypto-finance",
    title: "Crypto & Finance Keys",
    teaser:
      "Seed phrases, exchange logins, recovery codes. The strings your wealth actually lives behind.",
    examples: [
      "BIP-39 mnemonic for a hardware wallet (Ledger, Trezor, Tangem). The 12 or 24 words.",
      "Soft-wallet recovery phrase (MetaMask, Rabby, Phantom), plus any multisig signer key.",
      "Crypto-exchange account-recovery codes. The printed backup codes Coinbase, Kraken, or Binance handed you at signup.",
      "Google Authenticator / Authy / Aegis 2FA seed export, so a lost phone doesn't lock you out of every exchange.",
      "Brokerage, pension, and 401(k) credentials plus the advisor's direct contact. Half the time heirs don't know these accounts exist.",
      "Online-banking root password, security questions, and the device-binding recovery PIN.",
    ],
    bestKind: "seed",
    icon: "KeyRound",
    urgency:
      "Lose the seed or the exchange recovery code and the funds are gone. No support line can bring them back. If your heirs don't know the accounts exist, the assets sit frozen on-chain or stuck in a dormant account no one can reach.",
  },
  {
    id: "digital-identity",
    title: "Digital Identity & Accounts",
    teaser:
      "Your online life doesn't end when you do. Someone has to deal with it.",
    examples: [
      "Apple ID and Google account credentials. The root logins that gate your phone, photos, contacts, and email.",
      "Social media credentials (Facebook, Instagram, LinkedIn, X/Twitter, TikTok, Snapchat, Reddit, Discord) so an heir can memorialise the profile, post a final note, or close it per each platform's deceased-user policy.",
      "Primary email accounts (Gmail, Outlook, Proton, iCloud Mail). The password-reset hub for almost everything else.",
      "Password-manager master password (1Password, Bitwarden, Dashlane, Proton Pass, Apple Passwords). One secret that gates every other login you've stored, plus any emergency-access contact you've configured.",
      "Domain registrar logins (GoDaddy, Namecheap, Cloudflare Registrar). Domains lapse silently and are often impossible to recover.",
      "Cloud storage and hosting accounts (Dropbox, iCloud, Google Drive, AWS, DigitalOcean). Where decades of photos, documents, and personal projects actually live.",
      "Subscriptions worth cancelling fast (Netflix, Spotify, Adobe, gym, dating apps) so the estate isn't drained by silent renewals.",
    ],
    userActions: [
      "Memorialise or close social accounts per each platform's deceased-user policy.",
      "Notify networks before strangers find out via the algorithm.",
      "Recover what's irreplaceable from cloud storage and devices: photos, files, drafts.",
      "Stop the bleed. Cancel paid subscriptions, recurring charges, and ongoing services.",
      "Block impersonation with the full credential trail so heirs can prove ownership.",
      "Hand off business operations to partners, clients, and ongoing work.",
    ],
    inlineCallout: {
      title: "Your phone PIN won't unlock the cloud.",
      body:
        "Unlocking the device only unlocks the device. iCloud, Google Photos, Drive, OneDrive, Dropbox: each is a SEPARATE account behind its own password and 2FA. Apps that look logged in on your phone quietly require a fresh sign-in on a new device, after a SIM swap, or after an OS rebuild.",
      heirsActuallyNeed: [
        "Apple ID master password plus recovery codes. iPhone unlock is not iCloud unlock.",
        "Google master password, recovery codes, and Authenticator export. Export the seed list before the device dies, or it's gone with the phone.",
        "Microsoft account master password. OneDrive, Outlook.com, Office 365, Xbox, Windows backup.",
        "Dropbox, iCloud, Box, Sync, pCloud master passwords. Each is its own account with its own 2FA.",
        "Password-manager master password (1Password, Bitwarden, Dashlane, LastPass, Apple Passwords).",
        "Carrier SIM PIN and porting freeze / port-out PIN. Heirs keep the number for SMS-2FA; attackers can't SIM-swap it.",
        "Per-account 2FA recovery codes. Every TOTP, SMS, or hardware-key account emitted a one-time code at setup.",
      ],
      proactiveSetupNote:
        "Apple Digital Legacy Contact and Google Inactive Account Manager are free, take ten minutes, and almost nobody sets them up. See the Digital Legacy reference section below.",
    },
    bestKind: "letter",
    icon: "UserCircle",
    urgency:
      "Without this list, heirs spend months hunting for accounts they don't know exist. Memorial windows expire, dormant-account policies kick in, domains lapse, subscriptions keep billing the estate, and a lifetime of photos goes dark. Many platforms require action within 6 to 12 months of death, or the account is gone.",
    privacyStamp:
      "We don't log vault contents. We can't see what you put in the vault — there's no API call that ships it to us, no server-side copy, no admin panel that decrypts it. We do log anonymous route-changes server-side (no IP, no UA, no fingerprint) for ops health — see /privacy. Your seed, your vault, your problem (in the good sense).",
  },
  {
    id: "hidden-places",
    title: "Hidden Places & Physical Hints",
    teaser:
      "A photograph that shows your partner exactly where the safe is. Or the spare key. Or the buried cash.",
    examples: [
      "Annotated photograph of the safe-deposit box: bank branch, box number, and where the key and signature card actually live at home.",
      "Photo and map of the home safe or fire safe, with the combination written on the back (or in a sealed letter cross-referenced from the image).",
      "Where the hardware wallet is physically stored. Back of which drawer, inside which book, under which floorboard.",
      "Spare house, car, and office key locations. The magnetic box under the wheel arch, the spare with the neighbour, the one taped under the desk.",
      "Storage-unit address, gate code, unit number, plus a photo of the unit door so the heir can identify it.",
      "Hidden cash, jewellery, and heirloom locations. The envelope behind the painting, the floor-safe under the rug.",
      "Where the original will, trust deed, or power-of-attorney is physically kept (lawyer's office, home file, safe-deposit box) and who holds the second key.",
    ],
    bestKind: "image",
    icon: "MapPin",
    urgency:
      "Heirs can't find what they don't know is there. Safe-deposit boxes get drilled and the contents auctioned by the state. Buried cash stays buried. Spare keys help nobody when their location died with you. One annotated photo does what a thousand-word letter never quite manages.",
  },
  {
    id: "vital-documents",
    title: "Vital Documents",
    teaser:
      "The PDFs and scans your executor actually needs to settle the estate.",
    examples: [
      "Signed will, trust deed, power of attorney, and healthcare directive. The actual signed PDFs, not just \"it's at the lawyer's\".",
      "Life, property, and key-person insurance policy PDFs so the heir can find every claimable policy without rummaging through paper files.",
      "Birth, marriage, divorce, and naturalisation certificates. The cross-referenced originals an executor needs to prove identity and lineage.",
      "Passport, driving licence, and national-ID scans. Useful for closing accounts, and for heirs who need to evidence the relationship.",
      "Property deeds, vehicle titles, and share certificates. Proof of ownership that turns physical assets into transferable ones.",
      "Tax returns for the last 3 to 7 years and the accountant's contact details. What the estate's final filing depends on.",
      "Business incorporation papers, shareholder agreements, and IP assignments. Without these, a sole founder's estate can't operate or sell the business.",
    ],
    bestKind: "document",
    icon: "FileText",
    urgency:
      "Probate stalls without the originals. Insurance policies go unclaimed. The estate misses tax deadlines and accrues penalties. A business with a dead founder and no findable cap table becomes worthless in months.",
  },
  {
    id: "final-wishes",
    title: "Final Wishes & Personal Letters",
    teaser:
      "The things you wanted to say, and the choices only you can make for yourself.",
    examples: [
      "Personal letters to each child, partner, parent, or close friend. The things you would have said in person if there had been time.",
      "Funeral and burial preferences: cremation or burial, the music, the readings, whether you want a service at all.",
      "Organ donation wishes, and the specifics your next of kin will be asked at the worst possible moment.",
      "Ethical will or legacy statement: the values, lessons, and stories you want the next generation to carry forward.",
      "Pet-care wishes. Who takes the dog, what the cat eats, the vet's name, the chip number.",
      "Charitable bequests and the causes you'd like remembered in lieu of flowers.",
      "Names of people who should not be contacted, accounts that should be silently closed, and history that should stay private.",
    ],
    bestKind: "letter",
    icon: "Heart",
    urgency:
      "If you never write it down, it never gets said. Grieving families default to generic services, fight over pets and possessions, and never know what you would have wanted. A short letter, sealed in a vault and released only after the dead-man trigger, fixes all of that.",
  },
  {
    id: "recovery-codes",
    title: "Recovery Codes & Backup Secrets",
    teaser:
      "The one-time codes, security answers, and break-glass credentials that gate everything else.",
    examples: [
      "Printed recovery codes from every 2FA-enabled account (Google, Microsoft, GitHub, AWS, banking). The ones you tucked away the day you set them up.",
      "Hardware-security-key registration list: YubiKey serials, which accounts each is enrolled on, and where the backup key actually lives.",
      "PIN and recovery key for full-disk encryption (BitLocker, FileVault, LUKS). Without these the laptop is a brick.",
      "Master keys for self-hosted services: server SSH keys, root passwords, VPN credentials, encrypted-backup keys.",
      "Security questions and their real answers, recorded so you don't have to remember which lie you told which provider.",
      "Crypto-exchange anti-phishing codes and withdrawal whitelists, so an heir can tell a real support email from a scam.",
      "GPG, Age, and Signal-Identity private keys, for anyone who actually uses end-to-end encryption.",
    ],
    bestKind: "seed",
    icon: "ShieldCheck",
    urgency:
      "Recovery codes are the only escape hatch when everything else fails. Lose them and the account is gone. No support process restores them. They are exactly the kind of high-entropy short string a NoKLock seed-vault was built to hold.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   Memorial platforms (deceased-user policies)
   ───────────────────────────────────────────────────────────────────────── */

export interface MemorialPlatform {
  readonly id: string;
  readonly platform: string;
  readonly policy: string;
  readonly url: string;
}

export const MEMORIAL_PLATFORMS: readonly MemorialPlatform[] = [
  {
    id: "facebook",
    platform: "Facebook",
    policy: "Memorialise or request removal; Legacy Contact can manage the memorialised profile.",
    url: "https://www.facebook.com/help/1506822589577997",
  },
  {
    id: "instagram",
    platform: "Instagram",
    policy: "Memorialise the account or have an immediate family member request removal.",
    url: "https://help.instagram.com/264154560391256",
  },
  {
    id: "google",
    platform: "Google / Gmail",
    policy: "Inactive Account Manager (set in advance) or post-mortem next-of-kin request.",
    url: "https://support.google.com/accounts/answer/3036546",
  },
  {
    id: "apple",
    platform: "Apple ID",
    policy: "Legacy Contact (set in advance) can access photos, messages, files, and apps.",
    url: "https://support.apple.com/en-us/HT212360",
  },
  {
    id: "x",
    platform: "X (Twitter)",
    policy: "Authorised family member or estate executive can request deactivation.",
    url: "https://help.twitter.com/en/rules-and-policies/contact-twitter-about-a-deceased-family-members-account",
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    policy: "Memorialise or close the profile via the deceased-member request form.",
    url: "https://www.linkedin.com/help/linkedin/answer/a1336771",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   Helpers — best-kind pill + icon
   ───────────────────────────────────────────────────────────────────────── */

const BEST_KIND_LABEL: Readonly<Record<VaultBestKind, string>> = {
  seed: "Seed vault recommended",
  letter: "Letter vault recommended",
  document: "Document vault recommended",
  image: "Image vault recommended",
};

const BEST_KIND_TONE: Readonly<Record<VaultBestKind, string>> = {
  seed: "bg-accent-teal/15 text-accent-teal",
  letter: "bg-amber-400/15 text-amber-300",
  document: "bg-sky-400/15 text-sky-300",
  image: "bg-fuchsia-400/15 text-fuchsia-300",
};

interface IconProps {
  readonly name: VaultIcon;
  readonly className?: string;
}

function Icon({ name, className }: IconProps): JSX.Element {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: className ?? "w-6 h-6",
    "aria-hidden": true,
  };
  switch (name) {
    case "KeyRound":
      return (
        <svg {...common}>
          <path d="M21 2 13 10" />
          <path d="m18 5 3 3" />
          <circle cx="8" cy="16" r="6" />
          <path d="m13 11-2 2" />
        </svg>
      );
    case "UserCircle":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="10" r="3" />
          <path d="M7 20.7a8 8 0 0 1 10 0" />
        </svg>
      );
    case "MapPin":
      return (
        <svg {...common}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "FileText":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8M8 17h8M8 9h2" />
        </svg>
      );
    case "Heart":
      return (
        <svg {...common}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
      );
    case "ShieldCheck":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   TierBadge — 0.8.0 — small pill rendered beside the kind chip on every
   layout (accordion header, compact flat header, dense row). Sources its
   label + colour from lib/tier-gating.ts so the chooser, the Enrol
   welcome guard, and this catalog all read the same gating data.
   Returns null for Free-available kinds (seed / letter) — the absence of
   the amber badge against the gated cards is what carries the meaning.
   ───────────────────────────────────────────────────────────────────────── */

function TierBadge({ kind }: { readonly kind: VaultBestKind }): JSX.Element | null {
  const label = tierBadgeLabel(kind);
  const cls   = tierBadgeClasses(kind);
  if (label === null || cls === null) return null;
  return (
    <span
      className={`tier-badge ${cls} shrink-0`}
      aria-label={`Requires ${label.replace("+", "").trim()} tier or higher`}
    >
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Card (default + compact share this; dense uses a separate row)
   ───────────────────────────────────────────────────────────────────────── */

interface CardProps {
  readonly useCase: VaultUseCase;
  readonly compact?: boolean;
  /** 0.7.0 — Accordion mode (default-layout only). When `expanded` and
   *  `onToggle` are both supplied, the card renders as a header-button
   *  with a collapsible body. Compact mode ignores these props and
   *  renders flat as before. */
  readonly expanded?: boolean;
  readonly onToggle?: () => void;
}

/** 0.7.0 — Derive a short (≤60-char) description from the teaser for the
 *  collapsed accordion header. Cuts at the last word boundary inside the
 *  budget so we don't slice a word in half, and appends an ellipsis when
 *  truncation actually happened. */
function shortDescription(teaser: string, maxLen = 60): string {
  if (teaser.length <= maxLen) return teaser;
  const slice = teaser.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const safe = lastSpace > 30 ? slice.slice(0, lastSpace) : slice;
  return `${safe.replace(/[.,;:]$/, "")}…`;
}

function UseCaseCard({ useCase, compact, expanded, onToggle }: CardProps): JSX.Element {
  const exampleLimit = compact ? 3 : useCase.examples.length;
  const examples = useMemo(
    () => useCase.examples.slice(0, exampleLimit),
    [useCase.examples, exampleLimit],
  );

  /* 0.7.0 — Accordion mode is opt-in via the `onToggle` prop. Compact
     layout never accordions (it's already a 3-example summary). */
  const accordion = !compact && typeof onToggle === "function";
  const isOpen = accordion ? !!expanded : true;

  // 0.7.0 — Header button used in accordion mode. Always-visible row with
  //         icon, title, short (≤60-char) description, best-kind pill,
  //         and rotating caret. The full body below is gated on `isOpen`.
  const headerButton = accordion ? (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`use-case-body-${useCase.id}`}
      className="w-full flex items-start justify-between gap-3 flex-wrap text-left"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-accent-cyan shrink-0">
          <Icon name={useCase.icon} className="w-6 h-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-lg leading-tight">
            {useCase.title}
          </h3>
          {!isOpen ? (
            <p className="text-xs text-text-muted mt-0.5 truncate">
              {shortDescription(useCase.teaser)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`tier-badge ${BEST_KIND_TONE[useCase.bestKind]}`}>
          {BEST_KIND_LABEL[useCase.bestKind]}
        </span>
        {/* 0.8.0 — Tier-gate badge. Renders only when bestKind requires a
            paid tier (currently Document + Image → Premium). Free-available
            kinds render no extra pill (the absence carries the meaning). */}
        <TierBadge kind={useCase.bestKind} />
        <span
          aria-hidden
          className={`text-accent-cyan text-lg leading-none transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </div>
    </button>
  ) : null;

  // Flat (non-accordion) header used in compact + legacy default-flat mode.
  const flatHeader = !accordion ? (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="text-accent-cyan">
          <Icon name={useCase.icon} className={compact ? "w-5 h-5" : "w-6 h-6"} />
        </span>
        <h3 className={`font-display font-bold ${compact ? "text-base" : "text-lg"}`}>
          {useCase.title}
        </h3>
      </div>
      <span className={`tier-badge ${BEST_KIND_TONE[useCase.bestKind]}`}>
        {BEST_KIND_LABEL[useCase.bestKind]}
      </span>
      {/* 0.8.0 — Tier-gate badge — see accordion-header equivalent above. */}
      <TierBadge kind={useCase.bestKind} />
    </div>
  ) : null;

  return (
    <div
      className={[
        "card flex flex-col gap-3 transition-all duration-200",
        "border border-bg-surface",
        "hover:border-accent-cyan/60 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_8px_24px_-8px_rgba(34,211,238,0.35)]",
        accordion ? "" : "hover:-translate-y-0.5",
        compact ? "p-4" : "",
      ].join(" ")}
    >
      {headerButton}
      {flatHeader}

      {/* 0.7.0 — Body is only rendered when the accordion is open (or
          when accordion mode is off entirely, i.e. compact/legacy). */}
      {isOpen ? (
      <div id={`use-case-body-${useCase.id}`} className="flex flex-col gap-3">
      <p className={`text-text-on-dark/80 ${compact ? "text-xs" : "text-sm"}`}>
        {useCase.teaser}
      </p>

      {/* 0.4.0 — In-card amber-tinted critical caveat. Rendered before the
          examples list (with a clear divider above and below) so readers
          encounter the warning the moment they read about this category,
          not as a buried follow-on section. Currently surfaces the
          phone-PIN-doesn't-unlock-the-cloud gap on the Digital Identity
          card; the standalone <PhonePinNotCloud /> export is preserved
          for the existing Info.tsx mount. */}
      {!compact && useCase.inlineCallout ? (
        <div
          className="rounded-lg border p-3 sm:p-4 my-1 border-t-2 border-b-2"
          style={{
            // Explicit hex per spec — amber-tinted, NOT brown.
            backgroundColor: "#1f1d0f",
            borderColor:     "#eab308",
            color:           "#fef3c7",
          }}
          role="note"
          aria-label={useCase.inlineCallout.title}
        >
          <div className="flex items-start gap-2 mb-2">
            <span
              aria-hidden
              className="shrink-0 text-lg leading-none font-bold"
              style={{ color: "#facc15" }}
            >
              !
            </span>
            <h4
              className="text-sm sm:text-base font-display font-bold leading-tight"
              style={{ color: "#facc15" /* bold yellow */ }}
            >
              {useCase.inlineCallout.title}
            </h4>
          </div>
          <p
            className="text-xs sm:text-sm leading-relaxed mb-3"
            style={{ color: "#fef3c7" }}
          >
            {useCase.inlineCallout.body}
          </p>
          <div className="mb-2">
            <h5
              className="text-[11px] uppercase tracking-wide font-bold mb-1.5"
              style={{ color: "#facc15" }}
            >
              What heirs actually need
            </h5>
            <ul className="space-y-1">
              {useCase.inlineCallout.heirsActuallyNeed.map((need) => (
                <li
                  key={need}
                  className="flex gap-2 text-xs sm:text-sm leading-snug"
                  style={{ color: "#fef3c7" }}
                >
                  <span
                    aria-hidden
                    className="shrink-0 mt-0.5"
                    style={{ color: "#facc15" }}
                  >
                    {/* small key icon — inline SVG, matches the rest of the file */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M21 2 13 10" />
                      <path d="m18 5 3 3" />
                      <circle cx="8" cy="16" r="6" />
                      <path d="m13 11-2 2" />
                    </svg>
                  </span>
                  <span>{need}</span>
                </li>
              ))}
            </ul>
          </div>
          <p
            className="text-[11px] sm:text-xs leading-relaxed italic opacity-80 pt-2 border-t"
            style={{ color: "#fef3c7", borderColor: "rgba(234, 179, 8, 0.35)" }}
          >
            {useCase.inlineCallout.proactiveSetupNote}
          </p>
        </div>
      ) : null}

      <ul className={`space-y-1 ${compact ? "text-xs" : "text-sm"} text-text-muted flex-1`}>
        {examples.map((ex) => (
          <li key={ex} className="flex gap-2">
            <span className="text-accent-teal shrink-0">·</span>
            <span>{ex}</span>
          </li>
        ))}
      </ul>

      {/* 0.3.0 — Per-card "What your heir will need to do" sub-list.
          Only rendered when the catalog entry supplies userActions
          (currently the digital-identity category). */}
      {!compact && useCase.userActions && useCase.userActions.length > 0 ? (
        <div className="mt-2 border-t border-bg-surface pt-3">
          <h4 className="text-xs font-bold uppercase tracking-wide text-accent-cyan mb-2">
            What your heir will actually need to do
          </h4>
          <ul className="space-y-1 text-sm text-text-on-dark/80">
            {useCase.userActions.map((act) => (
              <li key={act} className="flex gap-2">
                <span className="text-accent-cyan shrink-0">→</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-[11px] text-text-muted/70 leading-relaxed mt-1 border-t border-bg-surface pt-2">
        {useCase.urgency}
      </p>

      {/* 0.3.0 — "We don't log a thing" privacy stamp. Rendered as a
          prominent teal-tinted footer block when the catalog entry
          supplies privacyStamp (currently the digital-identity card). */}
      {!compact && useCase.privacyStamp ? (
        <div className="mt-2 rounded-md border border-accent-teal/40 bg-accent-teal/10 px-3 py-2">
          <p className="text-xs text-accent-teal font-semibold leading-relaxed">
            {useCase.privacyStamp}
          </p>
        </div>
      ) : null}
      </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Dense row (one-line summary, used on EnrolChooser)
   ───────────────────────────────────────────────────────────────────────── */

interface DenseRowProps {
  readonly useCase: VaultUseCase;
  readonly onPick?: (kind: VaultBestKind) => void;
  readonly locked?: boolean;
}

function DenseRow({ useCase, onPick, locked }: DenseRowProps): JSX.Element {
  return (
    <li
      className="flex items-center gap-3 px-3 py-2 rounded-md border border-bg-surface hover:border-accent-cyan/50 transition-colors"
    >
      <span className="text-accent-cyan shrink-0">
        <Icon name={useCase.icon} className="w-4 h-4" />
      </span>
      <span className="font-medium text-sm text-text-on-dark shrink-0">
        {useCase.title}
      </span>
      <span className="text-xs text-text-muted truncate flex-1">{useCase.teaser}</span>
      <span className={`tier-badge ${BEST_KIND_TONE[useCase.bestKind]} shrink-0`}>
        {useCase.bestKind}
      </span>
      {/* 0.8.0 — Tier-gate badge on dense row. Renders even when the
          caller didn't pass `isKindLocked` (e.g. read-only catalog mounts)
          so the gating is visible without depending on the locked-prop
          UX path. When the row IS locked the caller-driven amber Premium
          pill below doubles as the CTA. */}
      <TierBadge kind={useCase.bestKind} />
      {onPick ? (
        locked ? (
          <button
            type="button"
            onClick={() => onPick(useCase.bestKind)}
            className="tier-badge bg-amber-600/30 text-amber-300 border border-amber-500/40 shrink-0 hover:bg-amber-600/40"
            aria-label={`${useCase.title} — Premium, see pricing`}
          >
            Premium →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPick(useCase.bestKind)}
            className="tier-badge bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/40 shrink-0 hover:bg-accent-cyan/25 font-bold"
            aria-label={`Pick ${useCase.title} — proceed with ${useCase.bestKind} vault`}
          >
            Pick this →
          </button>
        )
      ) : null}
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Top-level component
   ───────────────────────────────────────────────────────────────────────── */

export interface VaultUseCasesProps {
  /** 3 examples, shorter cards — used on Landing hero. */
  readonly compact?: boolean;
  /** Single-line summary list — used on EnrolChooser. */
  readonly dense?: boolean;
  /** Dense-mode only: invoked when the user clicks "Pick this" on a row.
   *  Caller is responsible for routing to /enrol/{kind} (or /pricing if
   *  the kind is gated). When omitted, no pick button is rendered. */
  readonly onPick?: (kind: VaultBestKind) => void;
  /** Dense-mode only: predicate used to flip the row's pick button into a
   *  "Premium" pill (still calls onPick so the caller can route to /pricing). */
  readonly isKindLocked?: (kind: VaultBestKind) => boolean;
}

/* 0.7.0 — Top-of-tab cyan callout: "Two free tools, do these now".
   Previously this content was the footer paragraph inside
   <PhonePinNotCloud />; it's now lifted to the TOP of the Use Cases tab
   so readers hit it before the 6-card catalog. Same content (Apple
   Digital Legacy Contact + Google Inactive Account Manager), new
   prominence and placement. */
function TwoFreeToolsCallout(): JSX.Element {
  return (
    <div
      className="border border-accent-cyan/40 bg-accent-cyan/5 rounded-xl p-5 sm:p-6"
      role="note"
      aria-label="Two free tools, do these now"
    >
      <h3 className="font-display font-bold text-lg sm:text-xl text-accent-cyan leading-tight mb-2">
        Two free tools, do these now
      </h3>
      <p className="text-sm sm:text-base text-text-on-dark/85 leading-relaxed mb-3">
        Both are free, take ten minutes each, and almost nobody sets them
        up. They are the single highest-leverage thing you can do today
        before you even open a NoKLock vault.
      </p>
      <ul className="space-y-3 text-sm sm:text-base text-text-on-dark/90">
        <li className="flex gap-3">
          <span aria-hidden className="text-accent-cyan shrink-0 mt-0.5">→</span>
          <span>
            <a
              href="https://support.apple.com/en-us/HT212360"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-cyan hover:underline"
            >
              Apple Digital Legacy Contact
            </a>
            <span className="text-text-on-dark/85">
              {" "}— name a person who can request access to your Apple ID
              data (photos, messages, files, app data) with a death
              certificate. Set in Settings → [your name] → Sign-In &amp;
              Security → Legacy Contact.
            </span>
          </span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden className="text-accent-cyan shrink-0 mt-0.5">→</span>
          <span>
            <a
              href="https://support.google.com/accounts/answer/3036546"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-cyan hover:underline"
            >
              Google Inactive Account Manager
            </a>
            <span className="text-text-on-dark/85">
              {" "}— pick a trusted contact who gets your Gmail / Drive /
              Photos / YouTube data after Google detects a configurable
              period of inactivity. Set at{" "}
              <span className="font-mono text-xs">myaccount.google.com</span>{" "}
              → Data &amp; privacy → Make a plan for your account.
            </span>
          </span>
        </li>
      </ul>
    </div>
  );
}

export default function VaultUseCases({ compact, dense, onPick, isKindLocked }: VaultUseCasesProps = {}): JSX.Element {
  /* 0.7.0 — Accordion state for the default-layout 6-card grid. Starts
     `null` so every card is collapsed on mount; clicking a header
     expands that one and collapses any other open card (single-open
     accordion). Clicking the same header toggles it back to null. */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (dense) {
    return (
      <ul className="flex flex-col gap-1">
        {VAULT_USE_CASES.map((uc) => (
          <DenseRow
            key={uc.id}
            useCase={uc}
            onPick={onPick}
            locked={isKindLocked ? isKindLocked(uc.bestKind) : false}
          />
        ))}
      </ul>
    );
  }

  /* 0.7.0 — Compact mode (Landing hero) keeps the flat 3-example layout
     it always had. Only the default layout gets the accordion + the
     top-of-tab cyan callout. */
  if (compact) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {VAULT_USE_CASES.map((uc) => (
          <UseCaseCard key={uc.id} useCase={uc} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 0.7.0 — Top-of-tab cyan callout. Lifted from the bottom of
          PhonePinNotCloud so readers encounter the free-tools pitch
          BEFORE the 6-card catalog. */}
      <TwoFreeToolsCallout />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {VAULT_USE_CASES.map((uc) => (
          <UseCaseCard
            key={uc.id}
            useCase={uc}
            expanded={expandedId === uc.id}
            onToggle={() =>
              setExpandedId((curr) => (curr === uc.id ? null : uc.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   <MemorialPlatforms /> — expandable list of deceased-user policies
   ───────────────────────────────────────────────────────────────────────── */

export function MemorialPlatforms(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="font-display font-bold text-lg">Digital legacy specifics</span>
        <span className="text-text-muted text-sm">
          {open ? "Hide" : "Show"} platform policies
          <span aria-hidden className="ml-2">{open ? "−" : "+"}</span>
        </span>
      </button>
      {open && (
        <div className="mt-4">
          <p className="text-sm text-text-muted mb-3">
            Each of the six big platforms has a different rule for what an heir can do
            after you die, and a different window in which to act. Save the right
            credentials in a NoKLock letter or seed vault, and these links tell your
            heir exactly which form to file.
          </p>
          <ul className="space-y-2">
            {MEMORIAL_PLATFORMS.map((p) => (
              <li
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 text-sm"
              >
                <span className="font-mono text-accent-cyan shrink-0 w-32">{p.platform}</span>
                <span className="text-text-muted flex-1">{p.policy}</span>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-teal hover:underline text-xs font-mono shrink-0"
                >
                  Official policy →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   <PhonePinNotCloud /> — prominent amber callout (0.3.0)

   The single biggest misconception heirs trip over: "I have his phone PIN,
   so I can get his photos / messages / accounts." The phone PIN unlocks
   the DEVICE only. Every cloud account behind it (iCloud, Google, Drive,
   Dropbox, OneDrive, password managers, 2FA apps, the carrier itself)
   is a SEPARATE login that quietly re-authenticates on new device, after
   SIM swap, or after OS rebuild. This callout makes that gap visible and
   lists what heirs ACTUALLY need to bring with them.

   Visual tone: yellow/amber-tinted (#eab308 / amber-500 family) — NOT
   brown. Tailwind amber-400/500/600 stack. Sits as a top-of-section
   warning, not a footnote.
   ───────────────────────────────────────────────────────────────────────── */

interface PhonePinHeirNeed {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
}

const PHONE_PIN_HEIR_NEEDS: readonly PhonePinHeirNeed[] = [
  {
    id: "apple-id",
    label: "Apple ID master password + recovery codes",
    detail:
      "iPhone unlock is not iCloud unlock. Photos, iMessage, Notes, Health, and Find My all sit behind a separate Apple ID password and its trusted-device prompts.",
  },
  {
    id: "google",
    label: "Google account master password + recovery codes + Authenticator export",
    detail:
      "Gmail, Photos, Drive, YouTube, and every Android backup ride on one Google account. The Authenticator app on the phone is itself gated by the phone. Export the seed list before the device dies, or it goes with it.",
  },
  {
    id: "microsoft",
    label: "Microsoft account master password",
    detail:
      "OneDrive, Outlook.com, Office 365, Xbox, and Windows backup all run off one Microsoft account that prompts for a fresh sign-in on any new device.",
  },
  {
    id: "cloud-storage",
    label: "Dropbox / iCloud / Box / Sync / pCloud master passwords",
    detail:
      "Each personal cloud is its own account with its own password and 2FA. An app that looks logged in on the phone means nothing once the phone is wiped or replaced.",
  },
  {
    id: "password-manager",
    label: "Password manager master password",
    detail:
      "1Password, Bitwarden, Dashlane, LastPass, Apple Passwords. All gated by a master that the phone biometric only unwraps locally. No master, no vault.",
  },
  {
    id: "carrier",
    label: "Carrier SIM PIN + porting freeze / port-out PIN",
    detail:
      "Without the carrier PIN, heirs can't keep the number active to receive SMS-2FA codes. Without a port-out PIN, attackers can SIM-swap the deceased's number before family even notices.",
  },
  {
    id: "twofa",
    label: "2FA recovery codes for each account",
    detail:
      "Every account with TOTP, SMS, or hardware-key 2FA emitted a one-time recovery code at setup. Without those codes, every 2FA-protected account stays locked even with the master password.",
  },
];

export function PhonePinNotCloud(): JSX.Element {
  return (
    <div
      className="rounded-xl border-2 p-5 sm:p-6"
      style={{
        // Amber-500 family — explicit hex so we don't depend on a Tailwind
        // amber-* token being in the theme. NOT brown — saturated yellow.
        backgroundColor: "rgba(234, 179, 8, 0.10)",   // amber-500 @ 10%
        borderColor:     "rgba(234, 179, 8, 0.55)",   // amber-500 @ 55%
      }}
      role="note"
      aria-label="Phone PIN does not unlock the cloud"
    >
      <div className="flex items-start gap-3 mb-3">
        <span
          aria-hidden
          className="shrink-0 text-2xl leading-none"
          style={{ color: "#eab308" }}
        >
          !
        </span>
        <h3
          className="text-xl sm:text-2xl font-display font-bold leading-tight"
          style={{ color: "#fde68a" /* amber-200 — readable on dark */ }}
        >
          Your phone PIN won't get them to the cloud.
        </h3>
      </div>

      <p className="text-sm sm:text-base text-text-on-dark/90 leading-relaxed mb-3">
        Unlocking the device only unlocks the device. iCloud, Google Photos,
        Drive, OneDrive, Dropbox: each is a SEPARATE account behind its own
        password and 2FA. Apps that look "logged in" on your phone quietly
        require a fresh sign-in on a new device, after a SIM swap, or after
        an OS rebuild.
      </p>

      <div className="rounded-lg border border-amber-400/30 bg-bg-deepest/40 p-3 sm:p-4 mb-3">
        <h4
          className="text-xs uppercase tracking-wide font-bold mb-2"
          style={{ color: "#fcd34d" /* amber-300 */ }}
        >
          What your heir actually needs (per account)
        </h4>
        <ul className="space-y-2 text-sm text-text-on-dark/85">
          {PHONE_PIN_HEIR_NEEDS.map((n) => (
            <li key={n.id} className="flex gap-2">
              <span
                aria-hidden
                className="shrink-0 mt-0.5"
                style={{ color: "#eab308" }}
              >
                •
              </span>
              <span>
                <span className="font-semibold text-text-on-dark">{n.label}</span>
                <span className="text-text-muted"> — {n.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs sm:text-sm text-text-on-dark/75 leading-relaxed">
        <span className="font-semibold" style={{ color: "#fcd34d" }}>
          Apple Digital Legacy Contact
        </span>{" "}
        and{" "}
        <span className="font-semibold" style={{ color: "#fcd34d" }}>
          Google Inactive Account Manager
        </span>{" "}
        are free, take ten minutes, and almost nobody sets them up. See the
        Digital Legacy reference section.
      </p>
    </div>
  );
}
