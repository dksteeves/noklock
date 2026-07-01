// @version 0.8.0 @date 2026-06-10
// 0.8.0 — Daniel 2026-06-10: Google Play download surfaces, FLAG-GATED OFF.
//         When (and only when) PLAY_STORE_AVAILABLE is true:
//           (a) the official "Get it on Google Play" badge renders under the
//               brand wordmark/tagline in column 1, linking to PLAY_STORE_URL;
//           (b) a "Get the app" link is added to the footer nav (next to the
//               /cli link) pointing at /download.
//         Both are wrapped in `PLAY_STORE_AVAILABLE && …` so nothing renders
//         until Daniel sets VITE_PLAY_STORE_AVAILABLE=true (Vite DCE strips
//         the badge <a>/<img> + the link from the flag-off dist entirely).
//         The /download route itself always exists (self-handles the pre-
//         launch "coming soon" state) — only the footer LINK to it is gated.
// @version 0.7.8 @date 2026-06-03
// 0.7.8 — Daniel 2026-06-03: + "CLI tool" link to /cli (slotted between
//         "Heir guide" and "Privacy" so the user-facing tools all sit
//         together). Falls back to literal "CLI tool" when the i18n key
//         is missing in non-English locales.
// @version 0.7.7 @date 2026-05-31
// 0.7.7 — Daniel 2026-05-31: "footer still a bit off". Image was already
//         optically centred (0.7.6 PNG regen aligned canvas-centre with
//         glyph-centre-of-mass). Residual misalignment was the WORDMARK
//         beside it: Footer used `font-display font-bold text-lg grad`
//         (display font + animated cyan-teal gradient + bold) while
//         TopNav uses `font-semibold tracking-tight` on the default
//         family. Different fonts have different optical baselines, so
//         even with the image perfectly centred the text appeared off.
//         Matched Footer wordmark typography to TopNav: dropped the
//         display font, the gradient, and the chunky bold — kept text-lg
//         for footer size. Same visual identity as TopNav, identical
//         alignment to the lock mark, no longer fights the cyan mark
//         with a cyan gradient.
// 0.7.6 — Daniel 2026-05-31: dropped the `-translate-y-0.5` fudge on the
//         logo img — logo-192.png was regenerated so the glyph's alpha-
//         weighted optical centre sits AT the canvas centre (was +10px
//         below; lock body is heavier than shackle so geometric centre
//         ≠ optical centre). With the PNG fixed, `items-center` alone
//         aligns the lock with the wordmark correctly in both Footer
//         AND TopNav — no per-mount nudges.
// 0.7.5 — Daniel: "move updates from footer to info menu 2nd item 'App
//         updates' .. move priv and terms from col1 to bottom of col2 and
//         remove col 1 .. so now 2 cols again". Updates link dropped from
//         the footer (now lives on the Info dropdown). Privacy + Terms
//         moved out of col 1 and APPENDED to the bottom of col 2 (the
//         help-doc column — How it works / User guide / Heir guide /
//         Privacy / Terms reads cleanly as one help/legal stack). Col 1
//         deleted. Grid drops from `auto auto auto` to `auto auto`. Logo
//         + copyright stack still flank as the outer two-column header /
//         footer of the footer block (md:3-col), so visually we keep the
//         3-block layout but the nav block in the middle is now 2 sub-
//         columns instead of 3.
// 0.7.4 — Daniel: "we now have a calendly link calendly.com/noklockapp/30min
//         .. footer? corp and partner and whitelabel page cta sS?". Added
//         "Book a 30-min call ↗" link to the column 3 ("Talk to us") block
//         between the Telegram group and email — same dense layout, one
//         extra line.
// 0.7.3 — Daniel: external arrows (↗) were wrapping onto their own
//         lines in column 3 ("X · @noklock_app" wrapped before the
//         arrow). Fix: whitespace-nowrap on every footer link so the
//         arrow stays attached + non-breaking-space before each arrow as
//         belt-and-braces; "X · @noklock_app" shortened to "X" to
//         reclaim column width without losing the link.
// 0.7.2 — Daniel: discreet legal-entity line in the copyright stack —
//         "noklock.app operates under Tenza Climate Solutions,
//         HRB 41384". Small, dim text colour, single line, no extra height
//         (replaces the previous one-liner pair without adding a row).
// 0.7.1 — Daniel: 0.7.0 made the footer TALLER (added uppercase column
//         labels + bigger spacing). Tighten back to ~0.6.x height while
//         keeping the new Telegram links: drop the uppercase sub-column
//         labels, collapse the 3 sub-columns into a single dense 3-col
//         grid, group LangSelect + email + feedback inline on one row at
//         the bottom of the column so the whole nav block fits the
//         original two-row footprint.
// 0.7.0 — 3 sub-columns (Legal / Read / Talk to us) with Telegram links.
// 0.6.0 — Daniel 2026-05-22: both "Found a bug?" and "Tell us what's rough"
//         now open a <FeedbackModal> popup (name/email/subject/description)
//         instead of jumping to the bug-bounty page / FAQ. hello@noklock.app
//         moved out of the legal grid into a centred "Drop us a line" mailto
//         beneath it; the two CTA buttons are centred on the grid too.
// 0.5.0 — Daniel 2026-05-20: prominent "Found a bug?" link in the legal-
//         nav 2-col grid pointing at /info?tab=contracts#bug-bounty. Lift
//         to a more visible surface than just buried in Terms §7.
// 0.4.0 — Shorter footer (Daniel): the 6 legal links are a 2-column
//         grid (was a 6-deep vertical stack — the main height culprit);
//         py-8/mt-16 → py-6/mt-12; columns bottom-align (md:items-end)
//         so the version/build block sits level with the logo lockup.
//         Logo: mark + "Lock" wordmark are now ONE baseline-aligned row
//         (same -translate-y nudge as TopNav) so it reads "NoKLock";
//         tagline drops below the full lockup.
// 0.3.4 — Footer logo: items-center + gap-1.5 + tiny optical nudge so
//         the mark aligns with the "Lock" wordmark and sits tighter
//         (pic2). Mirrors the TopNav alignment fix.
// 0.3.3 — + "User guide" link → /manual (multilingual screen-aligned
//         walkthrough). Uses t() fallback so no locale-file churn.
// 0.3.2 — Logo: white badge removed (matched the TopNav fix); transparent
//         mark direct, h-8 → h-10 to sit with the footer wordmark.
// 0.3.1 — i18n: footer tagline keyed t() (legal links were already keyed).
// 0.3.0 — Transparent logo on a small rounded light badge + "NoK"
//         wordmark text dropped (mark carries it) → flows into "Lock".
// 0.2.0 — i18n (Phase 1): legal-nav labels localised + language selector.
// 0.1.1 — Logo img aspect-safe: h-10 w-auto object-contain.
// 0.1.0 — Site-wide footer. Replaces the inline <footer> in App.tsx.
//
// Renders dim so it doesn't pull eye away from page content.

import { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND_NAME, BRAND_PARTS } from "../lib/brand.js";
import { PUBLIC_VERSION, getBuildHash } from "../lib/version.js";
import { PLAY_STORE_AVAILABLE, PLAY_STORE_URL } from "../lib/playStore.js";
import { PlayBadge } from "./PlayBadge.js";
import { useT } from "../i18n/index.js";
import { LangSelect } from "./LangSelect.js";
import { FeedbackModal } from "./FeedbackModal.js";

export function Footer(): JSX.Element {
  const year = new Date().getFullYear();
  const { t } = useT();
  const [fb, setFb] = useState<null | "bug" | "rough">(null);
  return (
    <footer className="border-t border-soul-700/60 mt-12 py-6 text-sm text-slate-400">
      <div className="container mx-auto px-4 max-w-6xl grid gap-6 md:grid-cols-3 md:items-end">
        <div>
          <div className="flex items-center gap-1">
            <img src="/logo-192.png" alt="" className="h-10 w-10 object-contain shrink-0" />
            <span className="sr-only">{BRAND_NAME}</span>
            <span aria-hidden="true" className="text-text-on-dark font-semibold tracking-tight text-lg -ml-0.5">{BRAND_PARTS.rest}</span>
          </div>
          <div className="text-xs mt-2 text-slate-400 max-w-xs">
            {t("footer.tagline")}
          </div>
          {/* 0.8.0 — Google Play badge, gated by PLAY_STORE_AVAILABLE so it
              renders only once the listing is live (flag off by default). */}
          {PLAY_STORE_AVAILABLE && (
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3"
              aria-label={t("footer.getAndroidApp", "Get it on Google Play")}
            >
              <PlayBadge className="h-10" />
            </a>
          )}
        </div>

        <nav className="md:justify-self-center w-full" aria-label="Footer links">
          {/* Dense 2-col grid (Daniel 0.7.5 — was 3, dropped col 1; Privacy
              + Terms moved to bottom of help-doc column).
              Col 1: How-it-works / User-guide / Heir-guide / Privacy / Terms.
              Col 2: X / Telegram-channel / Telegram-group / Calendly / email. */}
          <div className="grid grid-cols-[auto_auto] justify-center md:justify-start gap-x-6 gap-y-0.5 text-left text-xs leading-snug">
            <div>
              <Link to="/info?tab=process" className="block hover:text-accent-cyan whitespace-nowrap">{t("footer.howItWorks")}</Link>
              <Link to="/manual"  className="block hover:text-accent-cyan whitespace-nowrap">{t("footer.guide", "User guide")}</Link>
              <Link to="/heir"    className="block hover:text-accent-cyan whitespace-nowrap">{t("footer.heir", "Heir guide")}</Link>
              <Link to="/cli"     className="block hover:text-accent-cyan whitespace-nowrap">{t("footer.cli", "CLI tool")}</Link>
              {/* 0.8.0 — "Get the app" → /download, shown only when the Play
                  listing is live. The /download route always exists; only the
                  link to it is gated so the footer stays clean pre-launch. */}
              {PLAY_STORE_AVAILABLE && (
                <Link to="/download" className="block hover:text-accent-cyan whitespace-nowrap">{t("footer.getAndroidApp", "Get the app")}</Link>
              )}
              <Link to="/privacy" className="block hover:text-accent-cyan whitespace-nowrap">{t("footer.privacy")}</Link>
              <Link to="/terms"   className="block hover:text-accent-cyan whitespace-nowrap">{t("footer.terms")}</Link>
            </div>
            <div>
              <a href="https://x.com/noklock_app"        target="_blank" rel="noopener noreferrer" className="block hover:text-accent-cyan whitespace-nowrap">X&nbsp;↗</a>
              <a href="https://t.me/noklock_app"         target="_blank" rel="noopener noreferrer" className="block hover:text-accent-cyan whitespace-nowrap">Telegram channel&nbsp;↗</a>
              <a href="https://t.me/+OGgwnHraxbs1MmU0"   target="_blank" rel="noopener noreferrer" className="block hover:text-accent-cyan whitespace-nowrap">Telegram group&nbsp;↗</a>
              <a href="https://calendly.com/noklockapp/30min" target="_blank" rel="noopener noreferrer" className="block hover:text-accent-cyan whitespace-nowrap">Book a 30-min call&nbsp;↗</a>
              <a href="mailto:hello@noklock.app"                                                    className="block hover:text-accent-cyan whitespace-nowrap">hello@noklock.app</a>
            </div>
          </div>
          {/* Inline action row — feedback CTAs + LangSelect on one line keeps total height equal to the original 0.6.x. */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs">
            <button type="button" onClick={() => setFb("bug")} className="text-accent-green hover:underline font-semibold">{t("footer.foundBug", "Found a bug? →")}</button>
            <button type="button" onClick={() => setFb("rough")} className="hover:text-accent-cyan">{t("footer.rough", "Tell us what's rough →")}</button>
            <LangSelect compact />
          </div>
        </nav>

        <div className="md:text-right text-xs text-slate-400 space-y-1">
          <div>&copy; {year} {BRAND_NAME}. Software under BUSL-1.1.</div>
          <div>{BRAND_NAME} never sees or touches your keys, shares, or data.</div>
          <div className="text-slate-500">noklock.app operates under Tenza Climate Solutions, HRB 41384.</div>
          <div className="font-mono text-slate-500">v{PUBLIC_VERSION} · build {getBuildHash()}</div>
        </div>
      </div>

      <FeedbackModal
        open={fb !== null}
        kind={fb ?? "rough"}
        defaultSubject={fb === "bug" ? "Bug report — " : "Rough edge / feedback — "}
        onClose={() => setFb(null)}
      />
    </footer>
  );
}
