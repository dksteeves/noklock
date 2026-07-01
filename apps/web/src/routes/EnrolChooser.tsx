// @version 0.11.0 @date 2026-06-08
// 0.11.0 — Daniel 2026-06-08: surfaced UX gap fix. Each ChoiceCard now
//          carries a tier-required badge in the corner derived from the
//          shared `lib/tier-gating.ts` VAULT_KIND_MIN_TIER map (single
//          source of truth shared with the use-case catalog + the Enrol
//          welcome guard). Free-available kinds (seed / letter) render
//          no extra badge; gated kinds (document / image) render an
//          amber "Premium+" pill ALWAYS, plus the existing greyed-out
//          treatment + diverted /pricing route when the connected
//          wallet is below the required tier. Wallet-disconnected =
//          all cards visible + tier badges shown so users see what
//          they're signing up for before they connect. Tooltip caption
//          "Requires Premium — upgrade at /pricing" surfaces on hover
//          + screen-readers via `title` + `aria-label` on the gated
//          card. Migrated from the bespoke `docLocked` boolean to the
//          shared `gate.canCreateVaultKind(kind)` predicate so any
//          future re-tiering (e.g. Standard-gating "image") flows
//          through without further edits here.
// @version 0.10.1 @date 2026-06-07
// 0.10.1 — Daniel 2026-06-07: handoff §3.7 — Crypto seed ChoiceCard body
//          reframed away from cloud-only storage. Was "Split 3-of-5 across
//          your cloud accounts so you can rebuild it after a lost device or
//          a forgotten paper backup." Now "Split 3-of-5 across storage you
//          pick — three local folders is fine to start, cloud accounts give
//          you maximum geographic spread — so you can rebuild it after a
//          lost device or a forgotten paper backup." Matches the simple-vs-
//          max-security framing landing on Landing 0.22.0 / Enrol Step B /
//          Pricing FAQ / CryptoInheritance Q ("three shares scattered in
//          your own folders already beats a sticky note"). No structural
//          changes — same chooser tile, same route, same CTA.
// 0.10.0 — Daniel 2026-06-02: human-voice pass on top of the 0.9.0 declutter.
//          Cut em-dash overuse (was averaging 2-3 per bullet), trimmed
//          hedging adjectives, killed "airgapped threshold-split pipeline"
//          jargon repetition, tightened intro, audited every chooser tile
//          summary + body, audited all six ExampleBlock prefaces and 60+
//          bullets, audited the Or-pick-by-type fallback. Concrete user
//          moments preserved; corporate hedge removed. No structural
//          changes — same blocks, same order, same routes. Headlines kept
//          under 8 words. Counts: 4 chooser tiles rewritten, 6 example
//          blocks rewritten, 1 multi-letter pattern callout rewritten,
//          1 intro rewritten = 12 blocks touched.
// 0.9.0 — Daniel 2026-06-02: decluttered. Removed Need-ideas carousel
//         (redundant with homepage). All use-case content consolidated into
//         Example uses expandable. Keeps chooser tiles + Or-pick-by-type
//         fallback. Concretely:
//           • Dropped the <VaultUseCasesCarousel compact /> mount + its
//             "Need ideas? Here are some of the things people use vaults
//             for." lead-in section that previously sat between the
//             use-case tiles and the "Or pick by type ↓" disclosure.
//           • Tightened the chooser intro paragraph(s) — was three lines
//             of pipeline-name + reassurance, now two short lines that
//             keep the protect-first / heir-optional framing without the
//             "Argon2id + Shamir + AEAD + Ed25519" sentence (that's on
//             the Info / Prove-It pages where it belongs).
//           • Audited carousel cards (26 across 6 categories) against
//             every existing ExampleBlock so no use-case content is lost.
//             Added a NEW "Crypto seed vault" ExampleBlock at the top
//             (the carousel surfaced 5 crypto-finance + 4 recovery-code
//             cards that previously had no dedicated example block —
//             the existing Sealed-letter / Document / Image blocks only
//             mentioned hardware-wallet *location*, not the seed itself).
//             Extended the Sealed-letter block with the digital-identity
//             cards (Apple ID + Google credentials, social-media, domain
//             registrars, cloud storage). Extended the Final-wishes
//             coverage by adding a NEW "Final wishes & personal letters"
//             ExampleBlock (funeral / ethical-will / pet-care were
//             previously buried under "personal farewell letters" in the
//             Sealed-letter block — now first-class). Added "spare key
//             locations" to Sealed-letter. Added "YubiKey registration
//             list" + "Disk-encryption keys (BitLocker / FileVault /
//             LUKS)" + "GPG / Age private keys" to the Document block.
// 0.8.0 — Mount <VaultUseCasesCarousel compact /> as a "browse for
//         inspiration" strip BELOW the use-case tiles (the 0.7.0 rework)
//         and ABOVE the "Or pick by type ↓" disclosure. The carousel is a
//         continuous-scroll marquee of ~24 hand-curated one-liners pulled
//         off VAULT_USE_CASES — it lets users who haven't yet recognised
//         their own scenario in the six dense rows scroll a wider sample
//         without leaving the chooser. Lead-in text reads "Need ideas?
//         Here are some of the things people use vaults for." (passed via
//         the component's `leadInText` prop so the visual treatment stays
//         consistent with other mount points). Pure-CSS animation, GPU-
//         composited, prefers-reduced-motion + hover both pause it.
// 0.7.0 — Lead with use-cases over types per Daniel 2026-06-01. Users think
//         "I want to store my safe-deposit-box location", not "I want a Letter
//         vault". The page now opens with <VaultUseCases dense /> (six
//         categories — Crypto & Finance Keys, Digital Identity, Hidden Places,
//         Vital Documents, Final Wishes, Recovery Codes) — each row has a
//         "Pick this" button that auto-selects the best-matching vault kind
//         (seed / letter / document / image) and routes straight into the
//         existing /enrol/{kind} wizard. Document- and image-backed rows
//         show a "Premium" pill and route to /pricing when the licence is
//         missing (defense-in-depth alongside the on-chain wizard gate). A
//         collapsed "Or pick by type ↓" disclosure preserves the previous
//         four-tile picker for power users who already know the kind they
//         want. The Example-uses block and the Your-responsibility block
//         remain unchanged below.
// 0.6.0 — M-of-N pre-v0.6 honesty disclosure (K.BEFORE marketing edit):
//         the multi-letter example block's "M-of-N quorum still apply"
//         line now qualifies that quorum enforcement lands with Premium
//         v0.6 onwards; pre-v0.6 vaults remain owner-restorable until
//         re-enrolled. Matches the same disclosure landing on Pricing,
//         Info, Manual, DeadMan, HeirGuide, CryptoInheritance, Nok,
//         Help, NokClaim this round.
// 0.5.0 — Daniel reframe pass: protection comes first, inheritance is the
//         optional layer. Intro adds the "protect for yourself; optionally
//         designate an heir later" framing. Each tile's body lead now
//         emphasises personal recovery / store-and-restore; the inheritance
//         clause is moved to "and if you add an heir later…" tone.
// 0.4.0 — Daniel-asked 2026-05-20: concrete use-case examples for each kind
//         (seed phrase is self-explanatory; sealed letter / document / image
//         less so). Adds an "Example uses" expandable card below the 4
//         tiles with category-by-category examples + the multi-letter-to-
//         different-NoKs pattern (each heir can receive a different sealed
//         letter with need-to-know information) + owner-legal-responsibility
//         disclaimer pointing to Terms § "User content + your responsibility".
// 0.3.0 — Document + Image tiles are Premium-gated to match the now
//         hard-enforced wizard (Daniel): non-Premium wallets see a
//         "Premium" lock + the tile routes to /pricing instead of into a
//         flow they'd be blocked from. Defense-in-depth alongside the
//         Enrol.tsx on-chain gate. Seed + sealed-letter stay open.
// 0.2.1 — Image card made SINGULAR + parallel to the Document card.
// 0.2.0 — WS-A: 4 cards (added Image) → /enrol/{seed,letter,document,image}.
//
// /enrol — "What are you protecting?" picker.

import { Link, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { BRAND_NAME } from "../lib/brand.js";
import { useTierGate } from "../hooks/useTierGate.js";
import VaultUseCases, { type VaultBestKind } from "../components/VaultUseCases.js";
import {
  tierBadgeLabel,
  tierBadgeClasses,
  minTierName,
  VAULT_KIND_MIN_TIER,
  TIER_FREE,
} from "../lib/tier-gating.js";

export function EnrolChooser(): JSX.Element {
  const navigate = useNavigate();
  const gate = useTierGate();
  const { isConnected } = useAccount();

  // 0.11.0 — Use the shared per-kind predicate. A kind is "locked" when
  // we KNOW the connected wallet's tier is below the required minimum.
  // When disconnected, no kind is locked — we render the tile fully
  // interactive with the tier badge visible so users see what they're
  // signing up for before they connect.
  const isKindLocked = (kind: VaultBestKind): boolean =>
    isConnected && !gate.canCreateVaultKind(kind);

  // 0.7.0 — use-case-led entry. The user picks a real-world scenario from
  // <VaultUseCases dense />; we map its `bestKind` to the matching wizard
  // route. Locked kinds divert to /pricing so the wallet upgrades on-chain
  // before re-entering the flow.
  const handlePick = (kind: VaultBestKind): void => {
    if (isKindLocked(kind)) {
      navigate("/pricing");
      return;
    }
    navigate(`/enrol/${kind}`);
  };

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold font-display"><span className="grad">What are you protecting?</span></h1>
        {/* 0.10.0 — human-voice: dropped the em-dash, tightened the
            heir-optional line to active voice. Same two-paragraph shape. */}
        <p className="text-text-on-dark/80 mt-3 max-w-2xl mx-auto">
          Pick the situation that sounds most like yours. We&apos;ll open the right enrolment flow.
        </p>
        <p className="text-text-muted text-sm mt-2 max-w-2xl mx-auto">
          You&apos;re doing this <strong className="text-text-on-dark/80">for yourself first</strong>. <strong className="text-text-on-dark/80">Adding a next-of-kin is optional</strong>, and you can do it at the end, later, or never.
        </p>
      </header>

      {/* 0.7.0 — lead with use-cases, not types. Six dense rows; "Pick this"
          auto-selects the best-matching vault kind and routes into the
          existing /enrol/{kind} wizard. Power users who already know the
          kind they want can open the "Or pick by type ↓" disclosure below. */}
      <section aria-label="Pick by use case" className="card">
        <h2 className="text-xl font-bold font-display mb-1"><span className="grad">Pick by use case</span></h2>
        <p className="text-text-muted text-sm mb-4">
          Six situations cover what almost everyone wants protected. Click <em>Pick this</em> on the row that fits.
        </p>
        <VaultUseCases dense onPick={handlePick} isKindLocked={isKindLocked} />
      </section>

      {/* 0.9.0 — Need-ideas carousel removed; redundant with homepage.
          All 26 carousel one-liners are now folded into the Example-uses
          expandable below. */}

      <details className="card">
        <summary className="cursor-pointer font-bold font-display select-none">
          <span className="grad">Or pick by type ↓</span>
          <span className="text-text-muted text-sm font-normal ml-2">(power users — if you already know which vault kind you want)</span>
        </summary>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChoiceCard
            to="/enrol/seed"
            kind="seed"
            badge="Crypto seed"
            badgeClass="bg-cyan-700/40 text-accent-cyan"
            title="A crypto seed phrase"
            summary="12 or 24 BIP39 words. The classic case."
            body="Hardware wallet seed, soft wallet recovery phrase, multisig signer key. Split 3-of-5 across storage you pick — three local folders is fine to start, cloud accounts give you maximum geographic spread — so you can rebuild it after a lost device or a forgotten paper backup. Designate a next-of-kin later if you want it to inherit via on-chain SBT when you stop checking in."
            cta="Enrol a seed →"
            locked={isKindLocked("seed")}
          />
          <ChoiceCard
            to="/enrol/letter"
            kind="letter"
            badge="Sealed letter"
            badgeClass="bg-amber-600/40 text-amber-300"
            title="A sealed letter"
            summary="A private message you store now, released later only if you choose."
            body="Write it in-app or paste a draft, encrypt it, distribute the key shares. Useful as a future-you note that nobody else can read until you (or a next-of-kin you designate) unseal it. Even NoKLock cannot decrypt it. That privacy is the point."
            cta="Compose a letter →"
            locked={isKindLocked("letter")}
          />
          <ChoiceCard
            to="/enrol/document"
            kind="document"
            locked={isKindLocked("document")}
            badge="Document"
            badgeClass="bg-violet-700/40 text-violet-300"
            title="A document"
            summary="Will PDF, contract, credentials backup. Anything you can upload."
            body="Drag in a file (up to ~50 MB). Same pipeline as your seed phrase, applied to bytes, so you can always pull it back. Release to a designated NoK if and when the dead-man's switch fires."
            cta="Upload a document →"
          />
          <ChoiceCard
            to="/enrol/image"
            kind="image"
            locked={isKindLocked("image")}
            badge="Image"
            badgeClass="bg-emerald-700/40 text-accent-green"
            title="An image"
            summary="One photo or scan. Or a .zip of many, uploaded as one file."
            body="Same offline, threshold-split, signed-manifest pipeline. Recoverable by you any time. Your designated next-of-kin gets it back in its original format."
            cta="Upload an image →"
          />
        </div>
      </details>

      {/* 0.4.0 — concrete use-case examples. Crypto seed is self-explanatory;
          letter / document / image less so. Expandable so it doesn't bury
          the four-card pick above on first view.
          0.9.0 — extended to absorb all 26 carousel cards across 6
          categories (Crypto-finance, Digital-identity, Hidden-places,
          Vital-documents, Final-wishes, Recovery-codes) so no use-case
          content was lost when the Need-ideas carousel was removed. */}
      <details className="card">
        <summary className="cursor-pointer font-bold font-display select-none">
          <span className="grad">Example uses — what people put in each kind of vault</span>
        </summary>
        <div className="mt-4 space-y-5 text-sm">
          {/* 0.9.0 — NEW block. Absorbs the 5 crypto-finance carousel cards
              + the GPG / disk-encryption / 2FA-seed-export recovery-code
              cards. Previously the seed-vault case was implicit (only
              the chooser tile mentioned it) — now first-class. */}
          <ExampleBlock
            title="Crypto seed vault"
            tag="cyan"
            preface="Short, high-entropy strings: seed phrases, recovery codes, master passwords, private keys. Released to a designated next-of-kin only after the dead-man's switch fires, and only if you added one."
            uses={[
              "BIP-39 mnemonic for a hardware wallet (Ledger, Trezor, Tangem). The 12 or 24 words behind the device.",
              "Soft-wallet recovery phrase (MetaMask, Rabby, Phantom) and any multisig signer key.",
              "Crypto-exchange account-recovery codes. The printed codes Coinbase, Kraken, or Binance gave you at signup.",
              "Master password for your password manager (1Password, Bitwarden, Dashlane). Unlocks the rest of your financial life.",
              "Google Authenticator, Authy, or Aegis 2FA seed export, so a lost phone doesn't lock you out of every exchange.",
            ]}
          />

          <ExampleBlock
            title="Sealed letter"
            tag="amber"
            preface="A private message your designated next-of-kin reads ONLY after the dead-man's switch fires. Even you can't decrypt it once stored. That privacy is the point. Most people put information here that's too sensitive for a will (which becomes a public probate document) but essential for the people they leave behind."
            uses={[
              "Safe-deposit-box location: the bank branch, the box number, where the key lives, where the password and signature card live.",
              "Where the hardware wallet is physically stored (Ledger, Trezor, Tangem). Add the PIN if you trust the heir, or just the physical location if the seed phrase is split in your NoKLock vault.",
              "Combination or location of a home safe, fire safe, or buried geocache.",
              "Spare house, car, and office keys: the magnetic box under the wheel arch, the one with the neighbour, the one taped under the desk.",
              "Master password for your password manager (1Password, Bitwarden), which gives the heir access to everything else.",
              "Apple ID and Google account master passwords plus recovery codes. The root logins that gate the phone, photos, contacts, and email.",
              "Social media credentials (Facebook, Instagram, LinkedIn, X, TikTok), so the heir can memorialise, post a final note, or close the account per each platform's policy.",
              "Domain registrar logins (GoDaddy, Namecheap, Cloudflare Registrar). Domains lapse silently and are often impossible to recover after the fact.",
              "Cloud storage and hosting accounts (Dropbox, iCloud, Google Drive, AWS), where decades of photos, documents, and personal projects actually live.",
              "Insurance policy numbers plus the broker contact who actually pays out.",
              "Pension, retirement, and brokerage account names plus which advisor or platform to contact. Heirs often don't know these exist.",
              "Business-succession secrets: where the company seal is, who currently holds signing authority, the M&A advisor's contact.",
              "Hidden cash, jewelry, or heirloom locations.",
              "Crypto exchange account-recovery codes (the printed codes the exchange gave you at signup), distinct from the on-chain seed phrase you already split via NoKLock.",
              "Personal farewell letters, family-history notes, recipe collections. Non-financial content the heir will value.",
            ]}
          />

          <div className="rounded-lg border border-accent-cyan/40 bg-bg-deepest p-4">
            <div className="font-bold text-accent-cyan font-display mb-1">Multi-letter pattern: different letters for different NoKs</div>
            <p className="text-text-on-dark/85 mb-2">
              You aren't limited to one sealed letter. Most users enrol several, each addressed to a different next-of-kin on a strict need-to-know basis. The on-chain inheritance flow lets each NoK reach <em>only</em> the letter or letters they're designated for.
            </p>
            <p className="text-text-on-dark/85 mb-2">
              Example for a family of three heirs:
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-on-dark/80 ml-2">
              <li><strong>Spouse</strong>: the full picture. Bank, insurance, hardware wallet location, master password, business succession.</li>
              <li><strong>Sibling</strong>: backup "if my spouse can't act". Same details, slightly different framing, plus where to find legal counsel.</li>
              <li><strong>Lawyer or attorney</strong>: only what's needed to execute the legal estate. Signature card location, key custodians, broker contacts. None of the family-personal content.</li>
            </ul>
            <p className="text-text-on-dark/85 mt-2">
              Each letter is its own vault with its own master password and its own designated heir. The split-share architecture and the M-of-N quorum (Premium, from v0.6 onwards; see <Link to="/pricing" className="text-accent-cyan underline">/pricing</Link> for current status. Pre-v0.6 vaults remain owner-restorable; re-enrol to upgrade) apply per-letter, so pick the right NoK setup for each one.
            </p>
          </div>

          <ExampleBlock
            title="Document vault (Premium)"
            tag="violet"
            preface="Any file you can upload, up to ~50 MB. Same pipeline as a seed phrase, applied to bytes. Released to the designated NoK after the dead-man's switch fires."
            uses={[
              "PDF of your will, trust deed, power of attorney, or healthcare directive. The actual signed document, scan or original.",
              "Insurance policy PDFs (life, property, key-person business), so the heir has the full contract, not just a policy number.",
              "Property deeds, title certificates, vehicle titles.",
              "Brokerage, pension, and 401(k) statements showing account numbers, holdings, and contact details.",
              "Recovery-code text files from cloud services, exchanges, and 2FA apps. The kind you printed and tucked in a drawer.",
              "YubiKey registration list: serials, which accounts each key is enrolled on, and where the backup key is physically stored.",
              "Full-disk encryption recovery keys (BitLocker, FileVault, LUKS). Without these the laptop is a brick.",
              "GPG and Age private keys, for anyone who actually uses end-to-end encryption.",
              "Pre-nup, post-nup, or divorce-settlement documents that affect the estate.",
              "Tax records (last 7 years), so the heir or executor can settle final taxes.",
              "Business contracts, equity vesting schedules, and employment agreements with surviving benefits.",
              "Medical history and family medical records, useful for surviving family.",
              "Birth certificate, passport, and national-ID scans, useful when an heir needs to prove identity to access foreign assets.",
            ]}
          />

          <ExampleBlock
            title="Image vault (Premium)"
            tag="green"
            preface="One photograph or scan. Or a .zip archive of many, uploaded as one file. Same pipeline, returns to the heir in original format."
            uses={[
              "Photographs of paper documents (deeds, certificates) when you don't have a clean PDF.",
              "Photographs of jewelry, art, watches, collectibles. Provenance and identification for insurance and estate accounting.",
              "Photographs of family heirlooms with stories on their history, paired with a sealed letter explaining significance.",
              "QR codes: recovery codes for 2FA apps, software-wallet seed-phrase QRs, GPG-key backups. Any QR you'd hate to lose.",
              "Photos of safe combinations written down somewhere obscure, or where a buried geocache was placed.",
              "Annotated photograph of the safe-deposit box: bank branch, box number, and where the key and signature card actually live at home.",
              "Family photo archives you want delivered to a specific NoK after death. Sentimental, not financial.",
              "Scanned signatures or notarised letters for continuity of legal authority.",
              "Photographs of business-critical assets (server racks, factory layouts, supplier address books) where succession matters.",
            ]}
          />

          {/* 0.9.0 — NEW block. Absorbs the final-wishes carousel cards
              (funeral & burial, ethical will, pet-care) that were
              previously squashed into one line ("personal farewell
              letters") in the Sealed-letter block. */}
          <ExampleBlock
            title="Final wishes and personal letters"
            tag="amber"
            preface="The things you wanted to say, and the choices only you can make for yourself. Most people enrol these as one or more sealed letters, released only after the dead-man's switch fires, only to the next-of-kin you designated."
            uses={[
              "Letters to each child, partner, parent, or close friend. The things you would have said in person if there had been time.",
              "Funeral and burial preferences: cremation vs burial, the music, the readings, whether you want a service at all.",
              "Organ-donation wishes, and the specifics your next of kin will be asked at the worst possible moment.",
              "Ethical-will or legacy statement: the values, lessons, and stories you want the next generation to carry forward.",
              "Pet-care wishes: who takes the dog, what the cat eats, the vet's name and the chip number.",
              "Charitable bequests, and the causes you'd like remembered in lieu of flowers.",
              "Names of people who should not be contacted, accounts that should be silently closed, history that should stay private.",
            ]}
          />

          <div className="rounded-lg border border-rose-500/40 bg-bg-deepest p-4">
            <div className="font-bold text-rose-300 font-display mb-1">Your responsibility — please read</div>
            <p className="text-text-on-dark/85 mb-2">
              {BRAND_NAME} is a cryptographic vault, not a legal service. You decide what to put in your vaults, who to designate as next-of-kin, and what they can do with the content once it's released. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-on-dark/80 ml-2">
              <li>{BRAND_NAME} <strong>cannot see</strong> the content of any vault — encryption is end-to-end in your browser. We therefore <strong>have no obligation</strong> to verify the legality, accuracy, or completeness of anything you store.</li>
              <li>Putting bank account details, recovery codes, or financial instructions into a vault does NOT make {BRAND_NAME} a financial adviser, estate planner, lawyer, or fiduciary. We are none of those.</li>
              <li>If you are designing a real succession plan, work with a qualified attorney in your jurisdiction. A sealed letter is a complement to a will, not a substitute.</li>
              <li>You are responsible for the legality of what you store in your jurisdiction, including (where applicable) tax disclosures, sanctions law, and content laws.</li>
              <li>{BRAND_NAME} accepts <strong>no liability</strong> for the consequences of how you use these vaults — see <Link to="/terms" className="text-accent-cyan underline">Terms of Use § "User content + your responsibility"</Link> and <Link to="/privacy" className="text-accent-cyan underline">Privacy Notice</Link>.</li>
            </ul>
          </div>
        </div>
      </details>

      <div className="card text-center">
        <h2 className="font-bold font-display mb-2"><span className="grad">All your vaults in one place</span></h2>
        <p className="text-text-on-dark/80 text-sm mb-3">
          Already enrolled some things? See them all at <Link to="/vaults" className="text-accent-cyan underline">/vaults</Link>.
        </p>
      </div>
    </div>
  );
}

// 0.4.0 — shared example block for Letter / Document / Image use-cases.
// 0.9.0 — `tag` widened to include "cyan" for the new Crypto-seed block.
function ExampleBlock({ title, tag, preface, uses }: {
  readonly title: string;
  readonly tag: "amber" | "violet" | "green" | "cyan";
  readonly preface: string;
  readonly uses: readonly string[];
}): JSX.Element {
  const tagClass =
    tag === "amber"  ? "bg-amber-600/30 text-amber-300 border-amber-500/40" :
    tag === "violet" ? "bg-violet-700/30 text-violet-300 border-violet-500/40" :
    tag === "cyan"   ? "bg-cyan-700/30 text-accent-cyan border-cyan-500/40" :
                       "bg-emerald-700/30 text-accent-green border-emerald-500/40";
  return (
    <div className="rounded-lg border border-bg-surface bg-bg-deepest p-4">
      <div className={`tier-badge w-fit border ${tagClass} mb-2`}>{title}</div>
      <p className="text-text-on-dark/85 mb-3">{preface}</p>
      <ul className="list-disc list-inside space-y-1 text-text-on-dark/80">
        {uses.map((u) => <li key={u}>{u}</li>)}
      </ul>
    </div>
  );
}

function ChoiceCard({ to, kind, badge, badgeClass, title, summary, body, cta, locked }: {
  readonly to: string;
  readonly kind: VaultBestKind;
  readonly badge: string;
  readonly badgeClass: string;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly cta: string;
  readonly locked?: boolean;
}): JSX.Element {
  // Locked (tier-below-minimum): the tile routes to /pricing instead of
  // into a flow the wizard would block, and reads clearly as a gated
  // feature. Tier badge derived from the shared map so the label always
  // matches what the wizard actually enforces.
  const href = locked ? "/pricing" : to;
  const minTier = VAULT_KIND_MIN_TIER[kind];
  const tierLabel = tierBadgeLabel(kind);   // null for Free-available kinds
  const tierClass = tierBadgeClasses(kind); // null for Free-available kinds
  const requiresLabel = minTierName(kind);  // "Free" | "Standard" | "Premium"
  const lockedTitle = locked ? `Requires ${requiresLabel} — upgrade at /pricing` : undefined;
  return (
    <Link
      to={href}
      title={lockedTitle}
      aria-label={locked ? `${title} — requires ${requiresLabel}. Click to view pricing.` : `${title} — ${cta}`}
      aria-disabled={locked ? true : undefined}
      className={`card transition-colors flex flex-col ${locked ? "opacity-60 hover:border-amber-500/50 cursor-help" : "hover:border-accent-cyan/40"}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`tier-badge w-fit ${badgeClass}`}>{badge}</span>
        {/* 0.11.0 — Tier-required pill ALWAYS shown for non-Free kinds,
            even when the wallet has the tier (so users learn the gating)
            and even when disconnected (so users see what they're signing
            up for before they connect). Free-available kinds (seed,
            letter) render no extra pill — the absence carries meaning. */}
        {tierLabel && tierClass && minTier > TIER_FREE ? (
          <span className={`tier-badge w-fit ${tierClass}`}>{tierLabel}</span>
        ) : null}
      </div>
      <h2 className="text-xl font-bold font-display mt-3"><span className="grad">{title}</span></h2>
      <p className="text-text-on-dark/90 font-semibold mt-1 text-sm">{summary}</p>
      <p className="text-sm text-text-on-dark/70 mt-2 flex-1">{body}</p>
      {locked ? (
        <span className="text-amber-300 font-bold text-sm mt-4">
          Requires {requiresLabel} — see pricing →
        </span>
      ) : (
        <span className="text-accent-cyan font-bold text-sm mt-4">{cta}</span>
      )}
    </Link>
  );
}
