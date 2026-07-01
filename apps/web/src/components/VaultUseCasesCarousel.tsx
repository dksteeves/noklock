// @version 0.4.0 @date 2026-06-04
// 0.4.0 — Daniel-locked slider click-through. Each carousel card is now a
//         <Link to="/enrol/<kind>"> wrapper around its existing visual
//         content. NO intermediate info step — direct route to the enrol
//         flow for the card's category. Category→kind map (matches
//         VAULT_USE_CASES.bestKind so the carousel and the canonical
//         category data agree):
//           crypto-finance   → /enrol/seed
//           digital-identity → /enrol/letter
//           hidden-places    → /enrol/image
//           vital-documents  → /enrol/document
//           final-wishes     → /enrol/letter
//           recovery-codes   → /enrol/seed
//         (Default fallback: /enrol/seed — keeps the link safe if a new
//         category is added but not yet mapped.) Added visible hover
//         affordance on the Link wrapper: cursor-pointer, scale-[1.02],
//         brighter cyan border. The existing CSS .vuc-card:hover lift
//         (translateY + glow) still fires because the inner div is
//         unchanged. New `react-router-dom` import for <Link>. No other
//         behavioural change: marquee speed, hover-pause, edge fade,
//         sr-only list — all untouched.
// 0.3.0 — Removed reduced-motion auto-pause (both CSS @media block and JS
//         useReducedMotionLocal() hook). Root cause: Windows 10 "Show
//         animations in Windows" toggle (Settings -> Ease of Access ->
//         Display, and some power/perf profiles + Intel graphics driver
//         presets) maps to `prefers-reduced-motion: reduce` in browsers,
//         which then triggered BOTH layered kill-switches (JS class
//         vuc-track--paused AND CSS @media animation-play-state: paused)
//         and froze the carousel from frame one on Daniel's laptop.
//         Fix: gentle continuous marquee scroll is below the WCAG /
//         prefers-reduced-motion spec's vestibular-motion threshold
//         (which targets parallax, large transitions, autoplaying video,
//         flashing) — the auto-pause was over-cautious. Track className
//         simplified to "vuc-track"; the .vuc-track--paused CSS class
//         definition stays (harmless, still used by the hover/focus
//         pause path). useReducedMotionLocal() hook removed entirely
//         since nothing else used it. Hover/focus-within pause behaviour
//         unchanged.
// 0.2.0 — Doc-only: comment counts corrected from "~24" to actual 26
//         (5 crypto-finance + 4 digital-identity + 5 hidden-places +
//         4 vital-documents + 4 final-wishes + 4 recovery-codes). No
//         behaviour change.
// 0.1.0 — Continuous-scroll "what people actually put in their vault"
//         marquee. Pulls the flat examples[] list off VAULT_USE_CASES in
//         VaultUseCases.tsx, curates 26 of the most evocative one-liners
//         (see buildCards() for the per-category breakdown), and shows
//         them as 2-3 cards-in-view sliding right→left in a
//         seamless loop. Pure CSS @keyframes transform animation — no JS
//         interval, no scroll listeners, GPU-accelerated. Cards array is
//         duplicated TWICE in the DOM so the seam at translateX(-50%) is
//         invisible. Hover pauses the marquee (animation-play-state).
//
// Variants:
//   <VaultUseCasesCarousel />                     — default (80s loop)
//   <VaultUseCasesCarousel compact />             — tighter cards (~240px)
//   <VaultUseCasesCarousel leadInText="..." />    — uppercase tracking-wide
//                                                   label above the strip
//
// Sexy not obtrusive not too performance hungry:
//   • One transform animation, GPU-composited; nothing else paints
//     per-frame. ~0% CPU when scrolled off-screen (browsers throttle
//     off-screen CSS animations).
//   • Cards memoised once at module load; only React work is the initial
//     mount + a single state read for reduced-motion.
//   • Border lift on hover (transform + box-shadow) is also pure CSS.

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { VAULT_USE_CASES, type VaultUseCase, type VaultIcon } from "./VaultUseCases";
import { useT } from "../i18n/index.js";

/* ─────────────────────────────────────────────────────────────────────────
   Category → /enrol/<kind> route map (Daniel-locked direct click-through,
   no intermediate info step). Mirrors VAULT_USE_CASES[].bestKind so the
   carousel and the canonical category data stay in sync. Falls back to
   "seed" if a new category is ever added without a mapping here.
   ───────────────────────────────────────────────────────────────────────── */

const CATEGORY_TO_KIND: Readonly<Record<string, string>> = {
  "crypto-finance": "seed",
  "digital-identity": "letter",
  "hidden-places": "image",
  "vital-documents": "document",
  "final-wishes": "letter",
  "recovery-codes": "seed",
};

function enrolHrefForCategory(categoryId: string): string {
  const kind = CATEGORY_TO_KIND[categoryId] ?? "seed";
  return `/enrol/${kind}`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Curated card list — one card per concrete use case
   ───────────────────────────────────────────────────────────────────────── */

interface CarouselCard {
  readonly id: string;
  readonly title: string;
  readonly blurb: string;
  readonly categoryId: string;
  readonly categoryLabel: string;
  readonly icon: VaultIcon;
}

/** Build CARDS.length (26) cards by picking ~3-5 of the most evocative
 *  examples per category and turning each into a short "title + 1-line
 *  context" card. Hand-curated so each card stands on its own out of
 *  context. Breakdown: 5 crypto-finance + 4 digital-identity +
 *  5 hidden-places + 4 vital-documents + 4 final-wishes +
 *  4 recovery-codes = 26 cards. */
function buildCards(): readonly CarouselCard[] {
  const byId = (id: string): VaultUseCase | undefined =>
    VAULT_USE_CASES.find((u) => u.id === id);

  type Pick = { readonly id: string; readonly title: string; readonly blurb: string };

  const picks: ReadonlyArray<{ readonly cat: string; readonly items: readonly Pick[] }> = [
    {
      cat: "crypto-finance",
      items: [
        {
          id: "hw-wallet",
          title: "Hardware wallet seed",
          blurb: "The 12 or 24 words behind your Ledger, Trezor, or Tangem.",
        },
        {
          id: "soft-wallet",
          title: "MetaMask / Rabby recovery",
          blurb: "Soft-wallet seed phrase and any multisig signer key.",
        },
        {
          id: "exchange-codes",
          title: "Exchange recovery codes",
          blurb: "The printed backup codes Coinbase, Kraken, or Binance gave you at signup.",
        },
        {
          id: "pw-manager",
          title: "Password-manager master",
          blurb: "Unlocks the rest of your financial life — 1Password, Bitwarden, Dashlane.",
        },
        {
          id: "2fa-seed",
          title: "2FA seed export",
          blurb: "Google Authenticator / Authy / Aegis seed list — survives a lost phone.",
        },
      ],
    },
    {
      cat: "digital-identity",
      items: [
        {
          id: "apple-google",
          title: "Apple ID + Google account",
          blurb: "Root logins that gate your phone, photos, contacts, and email.",
        },
        {
          id: "social-credentials",
          title: "Social media credentials",
          blurb: "Memorialise, post a final note, or close per each platform's policy.",
        },
        {
          id: "domains",
          title: "Domain registrar logins",
          blurb: "Domains lapse silently — often impossible to recover after the fact.",
        },
        {
          id: "cloud-storage",
          title: "Cloud storage accounts",
          blurb: "Where decades of photos, documents, and personal projects actually live.",
        },
      ],
    },
    {
      cat: "hidden-places",
      items: [
        {
          id: "safe-deposit-photo",
          title: "Safe deposit box photo",
          blurb: "Branch, box number, and where the key + signature card live at home.",
        },
        {
          id: "home-safe",
          title: "Home safe location + combo",
          blurb: "Annotated photo with the combination written on the back.",
        },
        {
          id: "hw-wallet-hiding",
          title: "Where the hardware wallet hides",
          blurb: "Back of which drawer, inside which book, under which floorboard.",
        },
        {
          id: "spare-keys",
          title: "Spare key locations",
          blurb: "The magnetic box under the wheel arch — useless if its location dies with you.",
        },
        {
          id: "hidden-cash",
          title: "Hidden cash & heirlooms",
          blurb: "The envelope behind the painting, the floor-safe under the rug.",
        },
      ],
    },
    {
      cat: "vital-documents",
      items: [
        {
          id: "will-trust",
          title: "Signed will & trust deed",
          blurb: "The actual signed PDFs — not just “it’s at the lawyer’s”.",
        },
        {
          id: "insurance",
          title: "Insurance policy PDFs",
          blurb: "Life, property, and key-person — so no claimable policy gets missed.",
        },
        {
          id: "property-deeds",
          title: "Property deeds & titles",
          blurb: "Proof of ownership that turns physical assets into transferable ones.",
        },
        {
          id: "tax-returns",
          title: "Recent tax returns",
          blurb: "Last 3–7 years + the accountant’s direct contact.",
        },
      ],
    },
    {
      cat: "final-wishes",
      items: [
        {
          id: "personal-letters",
          title: "Letters to each loved one",
          blurb: "The things you’d have said in person if there had been time.",
        },
        {
          id: "funeral-prefs",
          title: "Funeral & burial wishes",
          blurb: "Cremation vs burial, the music, the readings — your call, not theirs.",
        },
        {
          id: "ethical-will",
          title: "Ethical will",
          blurb: "The values, lessons, and stories you want the next generation to carry.",
        },
        {
          id: "pet-care",
          title: "Pet-care wishes",
          blurb: "Who takes the dog, what the cat eats, the vet’s name and chip number.",
        },
      ],
    },
    {
      cat: "recovery-codes",
      items: [
        {
          id: "printed-2fa",
          title: "Printed 2FA recovery codes",
          blurb: "Google, Microsoft, GitHub, AWS, banking — the ones you tucked away.",
        },
        {
          id: "yubikey",
          title: "YubiKey registration list",
          blurb: "Serials, accounts enrolled, and where the backup key is kept.",
        },
        {
          id: "disk-encryption",
          title: "Disk encryption keys",
          blurb: "BitLocker, FileVault, LUKS — without these the laptop is a brick.",
        },
        {
          id: "gpg-age",
          title: "GPG / Age private keys",
          blurb: "For anyone who actually uses end-to-end encryption.",
        },
      ],
    },
  ];

  const cards: CarouselCard[] = [];
  for (const block of picks) {
    const parent = byId(block.cat);
    if (!parent) continue;
    for (const p of block.items) {
      cards.push({
        id: `${block.cat}:${p.id}`,
        title: p.title,
        blurb: p.blurb,
        categoryId: parent.id,
        categoryLabel: parent.title,
        icon: parent.icon,
      });
    }
  }
  return cards;
}

const CARDS: readonly CarouselCard[] = buildCards();

/* ─────────────────────────────────────────────────────────────────────────
   Icon — same inline SVG vocabulary as VaultUseCases.tsx (no lib dep)
   ───────────────────────────────────────────────────────────────────────── */

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
    className: className ?? "w-5 h-5",
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
   Single card
   ───────────────────────────────────────────────────────────────────────── */

interface CardViewProps {
  readonly card: CarouselCard;
  readonly compact?: boolean;
}

function CardView({ card, compact }: CardViewProps): JSX.Element {
  const { t } = useT();
  const href = enrolHrefForCategory(card.categoryId);
  // 0.5.0 — title / blurb / category label localize via the i18n dictionary.
  // The English literal baked into CARDS is passed as the fallback, so an
  // untranslated locale shows English (never blank, never a mixed sentence).
  const title = t(`vuc.card.${card.id}.title`, card.title);
  const blurb = t(`vuc.card.${card.id}.blurb`, card.blurb);
  const categoryLabel = t(`vuc.cat.${card.categoryId}`, card.categoryLabel);
  return (
    <Link
      to={href}
      aria-label={`Enrol a ${categoryLabel} vault — ${title}`}
      className={[
        "shrink-0 block no-underline",
        "cursor-pointer transform transition-transform",
        "hover:scale-[1.02] hover:border-accent-cyan/50",
        // Focus ring for keyboard nav (no visual change for mouse users).
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/70 rounded-xl",
      ].join(" ")}
    >
      <div
        className={[
          "vuc-card flex flex-col gap-2 rounded-xl",
          "bg-bg-panel border border-bg-surface",
          "px-4 py-3",
          compact ? "vuc-card--compact" : "",
        ].join(" ")}
        style={{
          width: compact ? 240 : 300,
          // Reserve the height so cards don't jitter while strings differ.
          minHeight: compact ? 132 : 156,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-accent-cyan shrink-0">
            <Icon name={card.icon} className={compact ? "w-4 h-4" : "w-5 h-5"} />
          </span>
          <h4
            className={[
              "font-display font-bold text-text-on-dark leading-snug",
              compact ? "text-sm" : "text-base",
            ].join(" ")}
          >
            {title}
          </h4>
        </div>

        <p
          className={[
            "text-text-on-dark/75 leading-snug flex-1",
            compact ? "text-[11px]" : "text-xs",
          ].join(" ")}
        >
          {blurb}
        </p>

        <span
          className={[
            "self-start mt-auto rounded-full px-2 py-0.5",
            "border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
            compact ? "text-[10px]" : "text-[11px]",
          ].join(" ")}
          aria-label={`Category: ${categoryLabel}`}
        >
          {categoryLabel}
        </span>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Top-level carousel
   ───────────────────────────────────────────────────────────────────────── */

export interface VaultUseCasesCarouselProps {
  /** Smaller cards (~240px wide) — used inside tight intros (EnrolChooser). */
  readonly compact?: boolean;
  /** Optional uppercase tracking-wide label rendered above the strip. */
  readonly leadInText?: string;
  /** Loop duration in seconds. Default 80s (~3 cards / sec at default width
   *  on a 1440px viewport — readable, not frantic). */
  readonly durationSeconds?: number;
}

export default function VaultUseCasesCarousel({
  compact,
  leadInText,
  durationSeconds,
}: VaultUseCasesCarouselProps = {}): JSX.Element {
  const { t } = useT();
  const duration = durationSeconds ?? (compact ? 60 : 80);

  // Memoise the duplicated list so the keys stay stable across re-renders.
  const doubled = useMemo(() => {
    return [
      ...CARDS.map((c) => ({ ...c, _seam: "a" as const })),
      ...CARDS.map((c) => ({ ...c, _seam: "b" as const })),
    ];
  }, []);

  // We inline a tiny <style> so this component is fully self-contained and
  // doesn't require an index.css edit to ship. The keyframes name is scoped
  // (vucScroll) to avoid collision with other marquees elsewhere.
  const styleBlock = `
    @keyframes vucScroll {
      from { transform: translate3d(0, 0, 0); }
      to   { transform: translate3d(-50%, 0, 0); }
    }
    .vuc-track {
      display: flex;
      gap: 16px;
      width: max-content;
      will-change: transform;
      animation: vucScroll ${duration}s linear infinite;
      animation-play-state: running;
    }
    .vuc-track--paused { animation-play-state: paused; }
    .vuc-viewport:hover .vuc-track { animation-play-state: paused; }
    .vuc-viewport:focus-within .vuc-track { animation-play-state: paused; }
    /* NOTE: No prefers-reduced-motion auto-pause here. A gentle continuous
       marquee is below the WCAG / prefers-reduced-motion spec's
       vestibular-motion threshold (parallax, large transitions,
       autoplaying video, flashing). Pausing on that signal caused the
       carousel to appear frozen for users whose OS reports reduced-motion
       (e.g. Windows 10 with "Show animations in Windows" off). */
    /* Subtle individual-card hover lift + brighter border. Pure CSS, GPU. */
    .vuc-card {
      transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
    }
    .vuc-card:hover {
      transform: translateY(-2px);
      border-color: rgba(34, 211, 238, 0.55);
      box-shadow: 0 8px 24px -8px rgba(34, 211, 238, 0.35);
    }
    /* Edge fade so cards melt in/out of view instead of clipping hard. */
    .vuc-viewport {
      -webkit-mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 56px,
        #000 calc(100% - 56px),
        transparent 100%
      );
              mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 56px,
        #000 calc(100% - 56px),
        transparent 100%
      );
    }
  `;

  return (
    <section
      className="w-full"
      aria-label="What people actually put in a NoKLock vault"
    >
      <style>{styleBlock}</style>

      {leadInText ? (
        <div className="mb-3 text-xs uppercase tracking-[0.18em] text-accent-cyan/80 font-semibold">
          {leadInText}
        </div>
      ) : null}

      <div className="vuc-viewport overflow-hidden">
        <div
          className="vuc-track"
          // aria-hidden on the marquee itself — screen readers get the
          // semantic list below instead of the duplicated visual one.
          aria-hidden
        >
          {doubled.map((card) => (
            <CardView
              key={`${card._seam}:${card.id}`}
              card={card}
              compact={compact}
            />
          ))}
        </div>
      </div>

      {/* Accessibility: semantic, non-duplicated list for screen readers.
          Visually hidden via Tailwind's sr-only equivalent (absolute,
          1px, overflow-hidden). */}
      <ul
        className="sr-only"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {CARDS.map((c) => (
          <li key={c.id}>
            {t(`vuc.card.${c.id}.title`, c.title)} — {t(`vuc.card.${c.id}.blurb`, c.blurb)} ({t(`vuc.cat.${c.categoryId}`, c.categoryLabel)})
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Re-exports for tests / callers that want to introspect the curation
   ───────────────────────────────────────────────────────────────────────── */

export const VAULT_CAROUSEL_CARDS: readonly CarouselCard[] = CARDS;
export type { CarouselCard };
