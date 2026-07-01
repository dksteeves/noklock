// @version 0.24.0 @date 2026-06-08
// 0.24.0 — Daniel 2026-06-08 round-5: managed-hero amber disclaimer copy
//          updated. "Coming with v1.1.0 — currently in development. Sign up
//          above to be notified when ready." → "Coming soon — currently in
//          development. Sign up below to be notified when ready." (the
//          notify button is rendered BELOW the disclaimer, so "above" was
//          backwards; and "v1.1.0" leaked internal release naming).
// @version 0.23.0 @date 2026-06-08
// 0.23.0 — Daniel 2026-06-08: "extreme protection, simplified" card now
//          keyed via useT() — landing.proof.simpleMax.{headline,accent,
//          simple,max,either}. Was inline EN; non-EN locales were showing
//          EN tail in the middle of the proofs wall. Cloned into all 6
//          locales (en/de/fr/pt/zh-Hans/hi) as machine-translation
//          starting point.
// @version 0.22.0 @date 2026-06-06
// 0.22.0 — Daniel 2026-06-06: NEW slim "extreme protection, simplified"
//          card inside the "Proof, not promises" section, placed above
//          the Shamir mathematical-impossibility tagline. Frames the
//          SIMPLE-route entry point first ("three shares scattered across
//          your own folders already beats a sticky note or encrypted text
//          file") then the maximum-security spectrum. Anchors the
//          positioning Daniel wants users to feel on first visit: even
//          the minimal version of NoKLock is dramatically better than
//          what most users do today, and the maximum security is just
//          the same model spread across more storage providers.
// @version 0.21.0 @date 2026-06-03
// 0.21.0 — Daniel 2026-06-03: Two coordinated tweaks to the hero + video
//          section so the Managed-mode preview is unmistakably pre-launch
//          and the demo video stops dominating the fold.
//          (A) Hero Managed tiles get a visible col-span-full amber
//              disclaimer block appended to the 6-tile grid:
//              "⚠️ Coming with v1.1.0 — currently in development. Sign up
//              above to be notified when ready." Borders/bg use the same
//              amber-500 token family the Managed tiles already use, so
//              it reads as belonging to that block rather than a generic
//              site banner. Keeps the existing "Notify me when ready"
//              mailto CTA below — disclaimer reinforces the CTA, doesn't
//              replace it.
//          (B) Video wrapper shrunk 25% — max-w-4xl (896px) →
//              max-w-[42rem] (672px). The bare <video>-era 4xl width
//              made the demo feel like a hero, which crowded the
//              tiles + CTAs above it. New width keeps the controls
//              comfortable on desktop while letting the surrounding
//              copy breathe. Mobile layout unaffected (max-w only
//              kicks in above the natural width).
// 0.20.0 — Daniel 2026-06-02: SEQUENTIAL multi-change pass (Phase-2 of the
//          E0/E1 prep workflow). Three coordinated changes in one revision
//          so no agent races a partial file:
//          (A) Video perf + controls. The previous bare <video> at "The
//              whole proof, in motion." section is replaced by a new
//              <VideoWithControls> component (see components/VideoWithControls
//              0.1.0). It owns the multi-source <source> ladder (720p webm
//              → 480p webm → 480p mp4 fallback), IntersectionObserver-gated
//              preload (preload="none" → "metadata" on first intersection),
//              and a hover/focus-within bottom-centre control bar (rewind,
//              -5s, play/pause, +5s) with Space + ArrowLeft/Right keyboard
//              support. Poster falls back to /hero-bg.jpg (the same image
//              the hero section already pre-warms in CSS) so the section
//              never paints empty before the metadata loads.
//          (B) Hero Managed-mode is now FUNCTIONAL. The HeroModePivot was
//              an informational pill in 0.14.0 — clicking Managed did
//              nothing. Now both tabs swap a 6-tile hero block:
//                • Self-Custody (default) — the existing 6-tile content,
//                  bullets unchanged.
//                • Managed — new content framed for non-crypto-native
//                  audiences: email/passkey sign-in, "we provision the
//                  wallet" framing, heir-claim by email, same vault
//                  crypto, escape-hatchable, "for the people in your
//                  life who would never set up MetaMask" tile. Closing
//                  paragraph + primary "Notify me when ready" cyan
//                  button (mailto: subscribe path).
//              The pivot widget label still carries the "live" / "coming
//              soon" pills regardless of which tab is active — Managed is
//              still pre-launch software, the active tab is just a content
//              preview.
//          (C) Lang pass on ALL new hero copy. Every new string added in
//              this revision is routed through useT(). New keys added to
//              all 6 locales (en + zh-Hans + hi + de + fr + pt) and locale
//              files bumped to 0.5.0. Old canonical English-only copy from
//              0.13.0 is now keyed too (hero.h1 / hero.tagline / hero.h2 /
//              hero.mainTagline / hero.subTagline / hero.tiles.* /
//              hero.phonePinHook / hero.closer.* / hero.cta.* / hero.video.*
//              / hero.shamir.statement / hero.managed.* / pricing.priced-to-protect).
//              Non-EN translations are seeded as machine-translation starting
//              points mirroring each locale's existing tone — flagged in the
//              locale changelog headers for native review.
//          See VideoWithControls.tsx 0.1.0 + locale files 0.5.0 for the
//          companion edits.
// 0.19.1 — Daniel 2026-06-02: stale staged-comment scaffolding cleaned up
//          after Info Tech tab relocation landed. Removed the three orphan
//          comment blocks that still pointed at MOVED-TO-INFO-TECH-TAB-PENDING
//          and the techTiles array (header-level marker around line 362,
//          inline marker around line 652, and the "block REMOVED" tombstone
//          around line 717). The MOVED-TO-INFO-FSM-PENDING block + its
//          pointers stay — that relocation is still pending.
// 0.19.0 — Daniel 2026-06-02: killer Shamir closing-the-deal statement
//          appended to the "Proof, not promises" card, below the existing
//          /info footer link. Title-sized treatment (text-2xl md:text-3xl
//          font-bold), centered, with a gradient accent on the phrase
//          "mathematically impossible to break". Reads as the anchor
//          tagline for the whole proofs wall. Not routed through useT()
//          per Daniel's "marketing anchor, English canonical" policy for
//          this beat (mirrors Info Tech-tab counterpart in Info.tsx 0.8.0).
// 0.18.0 — Daniel 2026-06-02: the staged MOVED-TO-INFO-TECH-TAB-PENDING
//          comment block (techTiles array + the 0.8.0 "Under the hood"
//          tech-tiles JSX) has been LIFTED into Info.tsx → Architecture
//          → Technology (TechnologyArchSection 0.7.9). Boxes rewritten
//          with Daniel's new copy: Air-gap / Store anywhere (IPFS +
//          Arweave precision fix) / Shamir Protection (with See the
//          math link to /viz/shamir) / Recovery & Protection (heartbeat
//          + dead-man's switch + live-man's switch). The staged comment
//          block is removed from this file (it served its purpose).
//          The MOVED-TO-INFO-FSM-PENDING block remains pending for a
//          separate relocation pass.
// 0.17.0 — Shamir-viz embed swapped for end-to-end pipeline MP4. New title
//          "The whole proof, in motion." Sub-line + Prove-It CTA.
//          ShamirPolyVizLazy import removed if no longer used on this page.
//          Per Daniel 2026-06-02. Drops every Shamir-specific word from the
//          replaced section. Also retires the SimAirgapProvider /
//          SimAirgapMoodOverlay / SimAirgapBadge mounts (only used in the
//          removed section), plus the lazy / Suspense / NoKLockSpinner /
//          ShamirPolyVizLazy plumbing that fed the Shamir viz. Video is
//          autoplay / loop / muted / playsInline, 480p MP4 from
//          /share-cards/. Section keeps the same <section className="card">
//          wrapper so spacing remains consistent with neighbours. No i18n —
//          new copy ships in English (Daniel's under-the-hood policy).
// 0.16.0 — human-voice pass. AI-slop removed, sentences tightened. Locked
//          anchors preserved verbatim.
// 0.16.0 — Daniel 2026-06-02: SEQUENTIAL Landing rewrite pass. Six changes
//          landed in one pass to avoid race conditions:
//          (1) Tagline now sits BETWEEN the H1 and the gradient H2 (was
//              below H2) — reads cleaner as the bridging line: H1 lists
//              what you're protecting, tagline frames the category, H2 is
//              the promise. Same locked text:
//              "Beyond the wallet, above the password manager, before the lawyer."
//          (2) CurrentModePill REMOVED from the hero (was absolute top-3
//              right-3). It now lives in TopNav.tsx's wallet status bar
//              to the LEFT of LIFETIME PREMIUM / address / ADMIN —
//              same row, same size. See TopNav 0.x bump.
//          (3) "Under the hood" tech-tiles section CUT from the homepage
//              (Daniel: "homepage getting way too heavy"). Content STAGED
//              at the bottom of this file in a MOVED-TO-INFO-TECH-TAB-PENDING
//              comment block so a follow-up agent can lift it into Info.tsx
//              Tech sub-tab. techTiles array kept for that follow-up.
//          (4) FSM section restructured: keep the diagram, retitle it
//              "Stronger trust than any service offers", make it a click-
//              through link to /info?tab=architecture&sub=fsm with an
//              aria-label + tooltip explaining the destination. The
//              detailed FSM prose ("True finite state machine" card +
//              three sub-cards What-it-is / Why-it's-rare / What-it-means)
//              is CUT from the homepage and STAGED at the bottom of this
//              file in a MOVED-TO-INFO-FSM-PENDING block.
//          (5) VaultUseCasesCarousel mount with leadInText="What people
//              actually use it for" — CONFIRMED still mounted.
//          (6) Digital Life hero tile — added "Password-manager master"
//              as the first bullet so the canonical use-case from
//              VaultUseCases.tsx is reflected in the hero teaser.
//          Also: NEXT-ROUND TODO comment added near the Shamir viz mount
//          flagging the future MP4 swap.
// 0.15.0 — NEW pinned positioning tagline rendered below the gradient H2
//          promise: "Beyond the wallet, above the password manager, before
//          the lawyer." Mirrors the same line pinned at the top of Pricing
//          (0.6.0) so the framing is consistent across surfaces. Sits as a
//          third bold heading-class line beneath the H2 — small italic
//          accent treatment, gradient text, no behaviour change.
// @version 0.14.0 @date 2026-06-02
// 0.14.0 — NEW hero two-mode pivot widget. Self-Custody is live (default +
//          only mode today); Managed is shown as "coming soon" per Daniel's
//          2026-06-02 framing. Widget is informational only — no actual
//          mode switching wired yet, that's a Stage-2 deliverable. Sets
//          user expectation that the broader audience is coming.
//          Implementation: inline <HeroModePivot> component rendered between
//          the gradient H2 and the main tagline; centred horizontal pill
//          with two buttons (Self-Custody · live, default-active cyan;
//          Managed · coming soon, dim w/ amber hover + tooltip). Managed
//          click is a no-op — tooltip says "Coming with v1.1.0 — email/passkey
//          sign-in, no wallet to set up. Notify me when ready: Subscribe →"
//          where Subscribe is a mailto. Below the main tagline, a smaller
//          italic sub-tagline reinforces the framing: "Self-Custody for
//          crypto-native users live today. Managed-mode for everyone else,
//          coming with v1.1.0." Discreet "Currently in Self-Custody mode"
//          pill mounted in the top-right of the hero (absolute) — cyan
//          today, amber once Managed ships. Stage-2 will wire the actual
//          mode-switch + conditional tagline + accent swap.
// 0.13.0 — Daniel 2026-06-02: hero rewrite per the breathing-room spec he
//          approved. Replaces the dense wall-of-text pitch paragraph with
//          a structured layout: locked Option-A H1 ("Your seed phrase.
//          Your will. Your digital life."), gradient H2 ("Secure air-gapped
//          store & restore: Legacy-ready Vaults."), medium tag-line ("Lose nothing important — to
//          time, to memory, to the wrong people."), then a 3×2 grid of six
//          breathing-room tiles (Crypto & finance / Documents & docs /
//          Digital life / Hidden places / Personal legacy / Operational),
//          each with 3-4 concrete punchy examples — NOT prose. A dim
//          italic hook line below the tiles ("And yes — your phone PIN
//          doesn't get them into your cloud. We'll show you what does.").
//          The original NoKLock pitch (now simplified) is demoted from
//          OPENER to CLOSER right above the two CTAs. <VaultUseCases compact />
//          that wekblca02 mounted at line ~217 is REMOVED — the 6-tile hero
//          grid replaces it (don't double-list the same use cases).
//          NEW: mounts <VaultUseCasesCarousel leadInText="What people
//          actually use it for" /> below the hero closer + above the
//          existing Shamir viz embed. Existing Shamir embed and everything
//          below it is untouched. Hero literals are intentionally not
//          routed through useT() this round — Daniel's locked Option-A
//          copy is canonical English; the i18n keys (hero.h1a/b/c/d, lede,
//          fsm, neverSees) are no longer rendered here and can be removed
//          from the locale files in a follow-up.
// 0.12.0 — Daniel 2026-06-01: mount <VaultUseCases compact /> as a prominent
//          hero section between the hero pitch and the Shamir viz embed.
//          Six categories of what people actually store in NoKLock —
//          counters the "isn't this just a crypto thing?" first impression.
//          Pre-section copy: "Six things people use NoKLock for. (Spoiler:
//          it's not just crypto.)" + "Pick the category that sounds most
//          like the regret you're trying to prevent."
// 0.10.0 — Daniel 2026-06-01: wrap the homepage Shamir embed in
//          <SimAirgapProvider enabled> + <SimAirgapMoodOverlay> +
//          <SimAirgapBadge/>. The Shamir split happens locally in the
//          real flow; the homepage viz should reflect that with the
//          same amber simulated-airgap framing the /viz/pipeline demo
//          uses. Visual continuity across "How your seed is split"
//          (Landing) and the end-to-end pipeline (/viz/pipeline).
// 0.9.1 — Daniel 2026-05-21: two-way control on the launch banner. Adds
//         "Dismiss forever" (separate localStorage key from the session
//         "Dismiss" — once set, the banner never shows again on this
//         browser, even across reloads/days). Adds Form B flag awareness:
//         the banner respects an owner-set "noklock.launch-banner.enabled"
//         flag (explicit "false" hides it globally — admin override from
//         the Admin tab > Banner toggle). Without an explicit flag the
//         default-enabled time-based show-then-auto-hide behaviour is
//         preserved. Three layers of control: per-session ✕, permanent
//         "Dismiss forever" (browser-local), global admin toggle (Form B).
// 0.9.0 — Daniel 2026-05-20: small dismissable launch-transparency banner
//         at the top of the Landing page. Visible while NoKLock is in
//         early-launch (counters at zero, rough edges expected). Dismiss
//         persists in localStorage; auto-hides 90 days after launch date
//         (DAY_ZERO) when counters will have moved.
// 0.8.0 — Option-B restructure (Daniel-approved 2026-05-20): the four
//         signature-differentiator standouts (Duress-proof, Social-engineering-
//         proof, NoKLock-proof, Self-custodial) are promoted to the prominent
//         top tile row. Soulbound NFTs get a dedicated section with the 3
//         TrustBlock cards moved INSIDE it as on-chain provenance. The
//         "Proof, not promises" wall extends from 2×3 → 3×3 with the 3 new
//         entries mirroring the standouts in compact form. The original
//         tech tiles (Air-gap / 3-of-5 / +IPFS / Recover) demote to a
//         smaller "Under the hood" strip BELOW the proofs grid — they
//         remain present (mechanism still matters) but no longer compete
//         with the promises for top real estate.
// 0.7.1 — "Why not keyless" CTA now deep-links to the section (#why-not-keyless).
// 0.7.0 — i18n REDO: the runtime DOM auto-translator was removed.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FSMDiagram } from "../components/FSMDiagram.js";

// 0.17.0 — ShamirPolyVizLazy lazy-import REMOVED (was the homepage Shamir
// viz mount). Section now hosts the end-to-end pipeline MP4. The Shamir
// viz still ships standalone on /viz/shamir; only the homepage embed is
// retired here.
// 0.13.0 — continuous-scroll marquee of curated example one-liners. Mounts
// directly below the hero closer, above the pipeline MP4, as the "below the
// fold but not too far down" placement Daniel asked for.
// Note: the previous <VaultUseCases compact /> mount was removed in 0.13.0
// because the new 6-tile hero grid is already the canonical category surface
// — we don't want to render the same six categories twice on one page.
import VaultUseCasesCarousel from "../components/VaultUseCasesCarousel.js";
import { TrustBlock } from "../components/TrustBlock.js";
// 0.20.0 — VideoWithControls component owns the multi-source <video> + perf
// gating + hover-control bar for the homepage end-to-end pipeline video. See
// components/VideoWithControls.tsx 0.1.0.
import { VideoWithControls } from "../components/VideoWithControls.js";
// 0.17.0 — NoKLockSpinner + SimAirgap* imports REMOVED. Only consumer on
// Landing was the Shamir viz Suspense fallback + SimAirgap framing wrapper,
// both retired in this version. /viz/pipeline still mounts SimAirgapBadge
// — that's a separate route, unaffected.
import { LICENSE_ADDR, SBT_ADDR, ORACLE_ADDR } from "../lib/contracts.js";
// 0.16.0 — BRAND_NAME import dropped: was used in the "True finite state
// machine" prose card that was cut from this page (staged in the
// MOVED-TO-INFO-FSM-PENDING comment block at the bottom). Restore when
// lifting that block into Info.tsx.
import { useDocumentHead } from "../lib/seo.js";
import { useT } from "../i18n/index.js";
import { useFlag } from "../hooks/useFlag.js";

// 0.9.0 — launch transparency. Auto-hides 90 days post-launch + on user dismiss.
const DAY_ZERO_ISO = "2026-05-21";  // adjust on actual cutover broadcast
const SHOW_UNTIL = new Date(DAY_ZERO_ISO).getTime() + 90 * 24 * 60 * 60 * 1000;
// Session dismissal (the ✕) — Daniel can re-show by clearing localStorage.
// "Forever" dismissal is a separate key set by the explicit "Dismiss forever"
// link below; once set the banner never shows again on this browser.
//
// 2026-05-28: bumped both keys v1 → v2. Daniel forever-dismissed the v1
// banner during testing and the move-to-bottom needed him to see it again.
// v2 invalidates the prior dismissal once; any future re-dismiss will land
// under the new key.
const LAUNCH_BANNER_DISMISS_SESSION_KEY = "noklock.launch-banner-dismissed-v2";
const LAUNCH_BANNER_DISMISS_FOREVER_KEY = "noklock.launch-banner-dismissed-forever-v2";
// Owner-set Form B flag — explicit "false" hides the banner globally
// (admin override). Anything else (unset / "true") leaves the time-based
// + per-browser dismiss logic in charge. Toggleable from /admin > Banner.
const LAUNCH_BANNER_FLAG = "noklock.launch-banner.enabled";

function LaunchTransparencyBanner(): JSX.Element | null {
  const { t } = useT();
  const enabledFlag = useFlag(LAUNCH_BANNER_FLAG, "true");

  const [dismissedSession, setDismissedSession] = useState<boolean>(() => {
    try { return typeof localStorage !== "undefined" && localStorage.getItem(LAUNCH_BANNER_DISMISS_SESSION_KEY) === "1"; }
    catch { return false; }
  });
  const [dismissedForever, setDismissedForever] = useState<boolean>(() => {
    try { return typeof localStorage !== "undefined" && localStorage.getItem(LAUNCH_BANNER_DISMISS_FOREVER_KEY) === "1"; }
    catch { return false; }
  });
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(t); }, []);

  // Hide conditions (any one true = hidden):
  //   • Admin explicitly disabled via Form B flag ("false").
  //   • User clicked "Dismiss forever" on this browser (sticky across sessions).
  //   • User clicked ✕ this session.
  //   • 90-day post-launch auto-hide elapsed (counters will have moved).
  if (enabledFlag.value === "false") return null;
  if (dismissedForever) return null;
  if (dismissedSession) return null;
  if (now > SHOW_UNTIL) return null;

  return (
    <div className="card border-accent-teal/50 bg-gradient-to-br from-bg-panel via-bg-panel to-amber-900/10">
      <div className="flex items-start gap-3">
        <span className="tier-badge bg-amber-600/30 text-amber-300 border border-amber-500/40 shrink-0">{t("landing.day1.badge")}</span>
        <div className="flex-1 text-sm">
          {/* 0.12.0 — keyed via useT(). The 154/154 + 0.8.35 figures are
              injected as untranslated interpolations ({tests} / {solc} in the
              key) so the numbers stay correct in every locale. */}
          <p className="text-text-on-dark/90">
            {t("landing.day1.body")
              .replace("{tests}", "154/154")
              .replace("{solc}", "0.8.35")}
          </p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <Link to="/info?tab=contracts#bug-bounty" className="text-accent-green hover:underline font-semibold">{t("landing.day1.bug")}</Link>
            <Link to="/info?tab=faq" className="text-accent-cyan hover:underline">{t("landing.day1.rough")}</Link>
            <a href="mailto:hello@noklock.app?subject=Feedback%20from%20%2F" className="text-accent-cyan hover:underline">{t("landing.day1.email")}</a>
            <button
              type="button"
              onClick={() => {
                try { localStorage.setItem(LAUNCH_BANNER_DISMISS_FOREVER_KEY, "1"); } catch {}
                setDismissedForever(true);
              }}
              className="text-text-muted hover:text-text-on-dark underline"
              title="Permanently hide on this browser. Clear browser data to re-show."
            >
              {t("landing.day1.dismissForever")}
            </button>
          </div>
        </div>
        <button
          onClick={() => { try { localStorage.setItem(LAUNCH_BANNER_DISMISS_SESSION_KEY, "1"); } catch {} setDismissedSession(true); }}
          className="text-text-muted hover:text-text-on-dark text-xs shrink-0"
          aria-label="Dismiss launch banner (this session)"
          title="Dismiss for now"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// 0.14.0 — Daniel 2026-06-02: two-mode pivot widget. Today the site is
// Self-Custody only; Managed mode is "coming soon" until Stage 2 ships.
// 0.20.0 — Daniel 2026-06-02: pivot is now interactive. Selecting Managed
//          swaps the hero content block to the Managed framing (preview
//          only — the software wiring still ships in v0.6). Both pills
//          retain their "live" / "coming soon" tags so the audience
//          framing is honest regardless of which content is showing.
type HeroMode = "self-custody" | "managed";
function HeroModePivot({
  mode,
  onSelect,
}: {
  mode: HeroMode;
  onSelect: (m: HeroMode) => void;
}): JSX.Element {
  const isSelf = mode === "self-custody";
  return (
    <div className="flex justify-center">
      <div
        role="tablist"
        aria-label="Authentication mode"
        className="inline-flex items-center gap-1 p-1 rounded-full border border-bg-surface bg-bg-panel/70 backdrop-blur shadow-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isSelf}
          onClick={() => onSelect("self-custody")}
          className={
            isSelf
              ? "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-accent-cyan/15 border border-accent-cyan/50 text-accent-cyan"
              : "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-text-on-dark/70 hover:text-text-on-dark transition-colors"
          }
          title="Self-Custody: 100% in-browser, your keys, your seed — live today."
        >
          <span aria-hidden>⛓️</span>
          <span>Self-Custody</span>
          <span className="text-[10px] uppercase tracking-wider text-accent-cyan/80 bg-accent-cyan/10 border border-accent-cyan/30 rounded-full px-1.5 py-0.5">
            live
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isSelf}
          onClick={() => onSelect("managed")}
          className={
            !isSelf
              ? "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-500/10 border border-amber-500/50 text-amber-300"
              : "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-text-muted hover:text-amber-300 hover:bg-amber-500/5 transition-colors"
          }
          title="Coming soon — email/passkey sign-in, no wallet to set up. Click to preview the framing for non-crypto-native users."
        >
          <span aria-hidden>👤</span>
          <span>Managed</span>
          <span className="text-[10px] italic uppercase tracking-wider text-amber-400/80 bg-amber-500/10 border border-amber-500/30 rounded-full px-1.5 py-0.5">
            coming soon
          </span>
        </button>
      </div>
    </div>
  );
}

// 0.16.0 — Daniel 2026-06-02: CurrentModePill REMOVED from the hero
// (was absolute top-3 right-3) and re-homed in TopNav.tsx's wallet
// status bar so it sits in the same row + same visual size as the
// LIFETIME PREMIUM / address / ADMIN badges. Exported here so TopNav
// (and any future surface) can mount it. The component now renders as
// a single sized-to-match span — no positioning, no wrapper div —
// so callers control layout. Cyan today (Self-Custody), amber once
// Managed ships.
export function CurrentModePill({ mode }: { mode: HeroMode }): JSX.Element {
  const isSelf = mode === "self-custody";
  const cls = isSelf
    ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
    : "border-amber-500/40 bg-amber-500/10 text-amber-300";
  return (
    <span
      className={`tier-badge inline-flex items-center gap-1 border ${cls}`}
      title={isSelf ? "You're browsing the Self-Custody flow — 100% in-browser, your keys." : "You're browsing the Managed flow — email/passkey, hosted custody."}
    >
      <span aria-hidden>{isSelf ? "⛓️" : "👤"}</span>
      <span>{isSelf ? "Self-Custody" : "Managed"} mode</span>
    </span>
  );
}
export type { HeroMode };

export function Landing(): JSX.Element {
  useDocumentHead("/");
  const { t } = useT();
  // 0.20.0 — Hero mode is now FUNCTIONAL state (was hard-coded "self-custody"
  // in 0.14.0). Self-Custody is the default + the only live software path
  // today; clicking Managed swaps in a preview of the v0.6 framing without
  // changing any wallet behaviour. The pivot pills still show "live" /
  // "coming soon" tags so visitors know the swap is content-only.
  const [heroMode, setHeroMode] = useState<HeroMode>("self-custody");

  // 0.8.0 — top-4 signature standouts. These are NoKLock's unique-in-market
  // differentiators (no Casa / Vault12 / Ledger Recover / Nunchuk equivalent).
  // They live ABOVE the proofs grid + soulbound section so a first-time
  // visitor's eye lands on the "I cannot get this anywhere else" claims.
  const standouts = [
    { k: "stand.duress.k",        tt: "stand.duress.t",        b: "stand.duress.b",        link: "/info?tab=architecture#duress-proof" },
    { k: "stand.social.k",        tt: "stand.social.t",        b: "stand.social.b",        link: "/info?tab=architecture#social-engineering-proof" },
    { k: "stand.noklockproof.k",  tt: "stand.noklockproof.t",  b: "stand.noklockproof.b",  link: "/info?tab=architecture#noklock-proof" },
    { k: "stand.selfcustody.k",   tt: "stand.selfcustody.t",   b: "stand.selfcustody.b",   link: "/info?tab=architecture" },
  ] as const;

  // 0.8.0 — 3×3 proofs wall: existing 6 + 3 new signature entries.
  const proof = [
    { k: "proof.loss.k",          b: "proof.loss.b" },
    { k: "proof.tamper.k",        b: "proof.tamper.b" },
    { k: "proof.spoof.k",         b: "proof.spoof.b" },
    { k: "proof.inherit.k",       b: "proof.inherit.b" },
    { k: "proof.airgap.k",        b: "proof.airgap.b" },
    { k: "proof.ai.k",            b: "proof.ai.b" },
    { k: "proof.duress.k",        b: "proof.duress.b" },
    { k: "proof.social.k",        b: "proof.social.b" },
    { k: "proof.noklockproof.k",  b: "proof.noklockproof.b" },
  ] as const;

  return (
    <div className="space-y-12">
      {/* 2026-05-28 Daniel: LaunchTransparencyBanner moved from TOP to BOTTOM
          of the home page (was the first element above the hero — competed
          with the hero pitch on first impression). Now sits below the
          closing CTA card so visitors see the product first, the day-1
          transparency note last. */}
      {/* 0.13.0 — breathing-room hero per Daniel's approved spec.
          • Locked Option-A H1 ("Your seed phrase. Your will. Your digital life.")
          • Gradient H2 ("Secure air-gapped store & restore: Legacy-ready Vaults.")
          • Medium tag-line ("Lose nothing important — to time, to memory, to the wrong people.")
          • 3×2 grid of six tiles (icon + category + 3-4 punchy examples) with breathing room
          • Dim italic hook line below the tiles
          • Closer block (the original NoKLock pitch, simplified)
          • Two CTAs (Get started / See the math)
          Hero copy is intentionally rendered as English literals — Daniel's
          approved canonical text. The old i18n keys (hero.h1a/b/c/d, lede,
          fsm, neverSees) are no longer rendered from this file. */}
      <section className="hero-bg text-center pt-10 pb-14 px-4 -mx-4 rounded-2xl flex flex-col justify-center gap-8 relative">
        {/* 0.16.0 — CurrentModePill MOVED from the hero (absolute top-3
            right-3) into TopNav.tsx's wallet status bar so it sits in
            the same row + same size as LIFETIME PREMIUM / address /
            ADMIN. Site-wide indicator, no longer hero-only. */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-teal/40 bg-bg-panel/80 backdrop-blur text-sm">
            <span className="grad font-display font-bold tracking-wider">HI not AI</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-on-dark/80">{t("hero.chip")}</span>
          </span>
        </div>

        {/* 0.20.0 — H1 / taglines / H2 now keyed via useT(). Canonical
            English still lives in en.ts; other locales seeded from native
            tone in 0.5.0. */}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight font-display max-w-5xl mx-auto">
          {t("hero.h1")}
        </h1>

        {/* Positioning tagline — H1 names categories, tagline frames where
            NoKLock sits in the market, H2 is the promise. */}
        <p className="text-lg md:text-xl font-display font-bold tracking-tight max-w-3xl mx-auto">
          <span className="grad">{t("hero.tagline")}</span>
        </p>

        {/* Gradient H2 — the promise. */}
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight max-w-4xl mx-auto">
          <span className="grad">{t("hero.h2")}</span>
        </h2>

        {/* 0.20.0 — pivot widget is now interactive (was informational).
            Selecting Managed swaps the 6-tile block below to the v0.6
            framing for non-crypto-native users. */}
        <HeroModePivot mode={heroMode} onSelect={setHeroMode} />

        {/* Tag-line — medium, the emotional hook. */}
        <p className="text-lg md:text-xl text-text-on-dark/90 max-w-3xl mx-auto">
          {t("hero.mainTagline")}
        </p>

        {/* Sub-tagline reinforcing the two-audience framing. */}
        <p className="text-sm md:text-base italic text-text-on-dark/70 max-w-3xl mx-auto">
          {t("hero.subTagline")}
        </p>

        {/* 0.20.0 — 3×2 tile grid now swaps between Self-Custody (original
            6 tiles) and Managed (NEW 6 tiles for non-crypto-native framing).
            Bullets per tile flattened into bullet1..bullet4 keys so each
            locale can translate one bullet at a time. */}
        {heroMode === "self-custody" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto w-full text-left">
            {[
              { icon: "🔐", k: "crypto",    bullets: 4 },
              { icon: "📂", k: "documents", bullets: 4 },
              { icon: "🌐", k: "digital",   bullets: 3 },
              { icon: "📸", k: "hidden",    bullets: 3 },
              { icon: "💌", k: "legacy",    bullets: 4 },
              { icon: "⚙️", k: "ops",       bullets: 3 },
            ].map((tile) => (
              <div
                key={tile.k}
                className="rounded-xl border border-bg-surface bg-bg-panel/70 backdrop-blur px-5 py-4 flex flex-col gap-2 hover:border-accent-cyan/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden className="text-2xl leading-none">{tile.icon}</span>
                  <h3 className="font-display font-bold text-lg text-text-on-dark">
                    {t(`hero.tiles.${tile.k}.title`)}
                  </h3>
                </div>
                <ul className="space-y-1 text-sm text-text-on-dark/80">
                  {Array.from({ length: tile.bullets }, (_, i) => i + 1).map((idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-accent-teal shrink-0">·</span>
                      <span>{t(`hero.tiles.${tile.k}.bullet${idx}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto w-full text-left">
            {[
              { icon: "📧", k: "signin" },
              { icon: "🤝", k: "provision" },
              { icon: "💌", k: "heirEmail" },
              { icon: "🔐", k: "sameCrypto" },
              { icon: "🔓", k: "escape" },
              { icon: "🌍", k: "audience" },
            ].map((tile) => (
              <div
                key={tile.k}
                className="rounded-xl border border-amber-500/30 bg-bg-panel/70 backdrop-blur px-5 py-4 flex flex-col gap-2 hover:border-amber-400/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden className="text-2xl leading-none">{tile.icon}</span>
                  <h3 className="font-display font-bold text-lg text-text-on-dark">
                    {t(`hero.managed.tiles.${tile.k}.title`)}
                  </h3>
                </div>
                <p className="text-sm text-text-on-dark/80">
                  {t(`hero.managed.tiles.${tile.k}.body`)}
                </p>
              </div>
            ))}
            <div className="col-span-full mt-6 p-4 rounded-lg border-2 border-amber-500/40 bg-amber-500/5 text-center">
              <p className="text-sm text-amber-300 font-semibold">
                ⚠️ Coming soon — currently in development. Sign up below to be notified when ready.
              </p>
            </div>
          </div>
        )}

        {/* Mode-conditional content below the tile grid. */}
        {heroMode === "self-custody" ? (
          <>
            {/* Dim italic hook — the gap most people don't know exists. */}
            <p className="text-sm md:text-base text-text-muted italic max-w-3xl mx-auto">
              {t("hero.phonePinHook")}
            </p>

            {/* Closer block — simplified pitch, demoted from opener to closer. */}
            <div className="max-w-3xl mx-auto text-text-on-dark/85 space-y-2 text-base md:text-lg">
              <p>{t("hero.closer.p1")}</p>
              <p>{t("hero.closer.p2")}</p>
              <p>{t("hero.closer.p3")}</p>
            </div>

            {/* Two CTAs — Get started / See the math. */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/enrol" className="btn btn-primary px-8 py-3 text-base">
                {t("hero.cta.getStarted")}
              </Link>
              <Link to="/prove-it" className="btn btn-secondary px-8 py-3 text-base">
                {t("hero.cta.seeMath")}
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Managed closer paragraph. */}
            <p className="max-w-3xl mx-auto text-text-on-dark/85 text-base md:text-lg">
              {t("hero.managed.closer")}
            </p>

            {/* Notify-me CTA — mailto subscribe (cheap version, no email
                capture modal needed). Subject line keys off "Managed-mode-
                ready" so future filtering is one-line easy. */}
            <div className="flex justify-center">
              <a
                href="mailto:hello@noklock.app?subject=Notify%20me%20when%20Managed%20mode%20is%20ready"
                className="btn btn-primary px-8 py-3 text-base"
              >
                {t("hero.managed.notifyButton")}
              </a>
            </div>
          </>
        )}
      </section>

      {/* 0.13.0 — Daniel 2026-06-02: continuous-scroll marquee of curated
          example one-liners. Sits directly below the hero closer, above the
          Shamir viz embed — the "below the fold but not too far down"
          placement Daniel asked for. */}
      <section>
        {/* 0.12.0 — lead-in label keyed via useT() (home.useCases.leadIn).
            The carousel cards + category labels translate internally via the
            same i18n dictionary (vuc.card.* / vuc.cat.*). */}
        <VaultUseCasesCarousel leadInText={t("home.useCases.leadIn")} />
      </section>

      {/* 0.20.0 — Daniel 2026-06-02: bare <video> swapped for the new
          <VideoWithControls> component. Adds multi-source codec ladder
          (webm 720p → webm 480p → mp4 480p fallback), IntersectionObserver
          gating (no metadata fetch until in-viewport), and a hover/focus
          control bar (rewind / -5s / play-pause / +5s with Space +
          ArrowLeft/Right keyboard support). Poster is the existing hero-bg
          jpg so the section never paints blank before metadata loads.
          Title / subline / CTA are now keyed via useT(). */}
      <section className="card text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold font-display">
          <span className="grad">{t("hero.video.title")}</span>
        </h2>
        <p className="text-text-on-dark/85 text-sm md:text-base max-w-3xl mx-auto">
          {t("hero.video.subline")}
        </p>
        <div className="max-w-[42rem] mx-auto">
          {/* Desktop / tablet (md+): autoplay video. The captions overlay +
              full-bleed-on-mobile scroll trap make the video unreadable +
              unusable on phones, so we suppress it below md and show a
              static Shamir polynomial still instead (Daniel 2026-06-04). */}
          <div className="hidden md:block">
            <VideoWithControls
              sources={[
                // 2026-06-04 Daniel: smaller-first. Browsers pick the first
                // source they can play, so this defaults all WebM-capable
                // visitors to the 480p WebM (3.4 MB, VP9) — fast enough for
                // mobile + sufficient quality for a static vis demo. 720p
                // WebM (7.0 MB) is a secondary option; 480p MP4 (2.4 MB) is
                // the H.264 fallback for browsers without VP9/WebM.
                { src: "/share-cards/NoKLock%20end-to-end%20viz%20480p.webm", type: "video/webm" },
                { src: "/share-cards/NoKLock%20end-to-end%20viz%20720p.webm", type: "video/webm" },
                { src: "/share-cards/NoKLock%20end-to-end%20viz%20480p.mp4",  type: "video/mp4"  },
              ]}
              poster="/hero-bg.jpg"
              ariaLabel="NoKLock end-to-end pipeline visualisation — 12 steps"
            />
          </div>
          {/* Mobile (<md): static Shamir polynomial visualisation — the
              same image the /shamir showcase route renders, captured at
              1600×1000 @ 2x DPR via tools/video-capture/record-shamir-
              still.mjs. WebP first (20 KB), JPEG fallback (53 KB). */}
          <div className="md:hidden">
            <picture>
              <source srcSet="/share-cards/shamir-still-mobile.webp" type="image/webp" />
              <img
                src="/share-cards/shamir-still-mobile.jpg"
                alt="Shamir 3-of-5 secret split — polynomial curve with 5 share points and the secret marker at x=0"
                className="w-full rounded-2xl shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>
        <Link to="/prove-it" className="btn btn-primary">
          {t("hero.video.cta")}
        </Link>
      </section>

      {/* 0.8.0 — top-4 SIGNATURE STANDOUTS. The differentiators visitors
          can't get anywhere else — promoted above everything else. */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {standouts.map((c) => (
          <div key={c.k} className="card border-accent-teal/50 bg-bg-panel/60">
            <div className="font-display text-3xl font-bold mb-2"><span className="grad whitespace-pre-line">{t(c.k)}</span></div>
            <div className="text-lg font-semibold mb-2">{t(c.tt)}</div>
            <p className="text-text-on-dark/80 text-sm">{t(c.b)}</p>
            <Link to={c.link} className="text-xs text-accent-cyan hover:underline mt-3 inline-block">{t("card.readHow")}</Link>
          </div>
        ))}
      </section>

      {/* 0.8.0 — Soulbound NFTs dedicated section: explainer text + the
          three on-chain TrustBlock cards INSIDE the same card (License,
          SBT, Oracle) as on-chain provenance evidence. */}
      <section className="card border-accent-cyan/40">
        <h2 className="text-2xl font-bold mb-3"><span className="grad">{t("soul.title")}</span></h2>
        <p className="text-text-on-dark/90 mb-2">{t("soul.body")}</p>
        <p className="text-text-on-dark/80 text-sm mb-5">{t("soul.bodyB")}</p>
        <div className="grid md:grid-cols-3 gap-4">
          <TrustBlock contractLabel="License NFT" contractAddress={LICENSE_ADDR} compact />
          <TrustBlock contractLabel="Soul-bound SBT" contractAddress={SBT_ADDR} compact />
          <TrustBlock contractLabel="Oracle" contractAddress={ORACLE_ADDR} compact />
        </div>
        <p className="text-text-muted text-xs mt-4 text-center">{t("soul.scoreLabel")}</p>
      </section>

      {/* 0.8.0 — Proof, not promises: extended to 3×3 (9 items). */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-4 text-center"><span className="grad">{t("proof.title")}</span></h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
          {proof.map((p) => (
            <div key={p.k}>
              <div className="font-display font-bold mb-1"><span className="grad">{t(p.k)}</span></div>
              <p className="text-xs text-text-muted">{t(p.b)}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/info" className="text-sm text-accent-cyan hover:underline">{t("proof.fullinfo")}</Link>
        </div>

        {/* 0.21.0 (Daniel 2026-06-06) — slim "extreme protection, simplified"
            statement. Sits ABOVE the Shamir closing-the-deal tagline so it
            anchors the SIMPLE-route framing first: even three shares in
            local folders beats a paper note or an encrypted file. Then
            the spectrum: simple → max security. Then the Shamir math
            closer below.
            0.23.0 (Daniel 2026-06-08) — now keyed via useT(): headline /
            accent / simple / max / either. Stops non-EN visitors seeing
            mid-paragraph EN tail when this block stayed inline. */}
        <div className="mt-8 max-w-3xl mx-auto rounded-xl border border-accent-cyan/30 bg-bg-deepest/40 px-5 py-4 text-center">
          <p className="text-lg md:text-xl font-display text-text-on-dark leading-snug">
            {t("landing.proof.simpleMax.headline")} <span className="grad font-bold">{t("landing.proof.simpleMax.accent")}</span>
          </p>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            {t("landing.proof.simpleMax.simple")} {t("landing.proof.simpleMax.max")} <span className="text-accent-cyan font-semibold">{t("landing.proof.simpleMax.either")}</span>
          </p>
        </div>

        {/* 0.19.0 — Daniel's killer Shamir closing-the-deal statement.
            0.20.0 — now keyed via useT() so non-EN visitors get the same
            anchor tagline in their language. Gradient accent on the
            phrase "mathematically impossible to break" is preserved by
            splitting the key into prefix + accent + suffix. */}
        <p className="text-2xl md:text-3xl font-bold font-display text-center mt-8 max-w-4xl mx-auto leading-snug text-text-on-dark">
          {t("hero.shamir.prefix")} <span className="grad">{t("hero.shamir.accent")}</span>{t("hero.shamir.suffix")}
        </p>
      </section>

      <section className="card text-center">
        <h2 className="text-2xl font-bold mb-3"><span className="grad">{t("more.title")}</span></h2>
        <p className="text-text-on-dark/80 max-w-2xl mx-auto mb-3">{t("more.body")}</p>
        <Link to="/vaults" className="btn btn-primary inline-block">{t("more.cta")}</Link>
      </section>

      {/* 0.16.0 — FSM section restructured: keep diagram + retitle +
          click-through. The detailed prose ("True finite state machine"
          + What-it-is / Why-it's-rare / What-it-means cards) was CUT
          from the homepage (Daniel: too heavy) and STAGED at the bottom
          of this file under MOVED-TO-INFO-FSM-PENDING. The diagram now
          carries the headline "Stronger trust than any service offers"
          and is a clickable link to the full state-table on the Info →
          FSM tab. */}
      <section>
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold font-display">
            <span className="grad">{t("landing.fsm.headline")}</span>
          </h2>
          <p className="text-sm text-text-muted mt-1 max-w-2xl mx-auto">
            {t("landing.fsm.subtitle")}
          </p>
        </div>
        <Link
          to="/info?tab=architecture&sub=fsm"
          aria-label="Click to see the full state machine on the Info → FSM tab"
          title="Click to see the full state machine on the Info → FSM tab"
          className="block rounded-xl border border-bg-surface hover:border-accent-cyan/50 transition-colors p-2"
        >
          <FSMDiagram />
        </Link>
        <div className="text-center mt-3">
          <Link to="/info?tab=architecture&sub=fsm" className="text-sm text-accent-cyan hover:underline font-semibold">
            See the full state machine on the Info → FSM tab →
          </Link>
        </div>
      </section>

      <section className="card text-center">
        <h2 className="text-2xl font-bold mb-3">
          <span className="grad">{t("keyless.titleA")}</span> <span className="grad">{t("keyless.titleB")}</span>
        </h2>
        <p className="text-text-on-dark/80 max-w-2xl mx-auto">
          {t("keyless.body")}{" "}
          <Link to="/info?tab=compliance#why-not-keyless" className="text-accent-cyan underline">{t("keyless.cta")}</Link>
        </p>
      </section>

      <section className="card text-center">
        <h2 className="text-2xl font-bold mb-3">
          <span className="grad">{t("ins.titleA")}</span> <span className="grad">{t("ins.titleB")}</span>
        </h2>
        <p className="text-text-on-dark/80 max-w-2xl mx-auto">{t("ins.body")}</p>
      </section>

      <LaunchTransparencyBanner />
    </div>
  );
}

// ============================================================================
// MOVED-TO-INFO-FSM-PENDING:
// Cut from Landing.tsx 0.16.0 (2026-06-02). Daniel: keep diagram + retitle +
// click-through on homepage, but remove the detailed prose. A follow-up
// agent should ensure this content lives in Info.tsx's Architecture → FSM
// sub-tab (FSMDiagram is already mounted there; this is the explanatory
// 3-card block — "What it is" / "Why it's rare" / "What that means for you"
// — that should accompany it).
// ----------------------------------------------------------------------------
// {/* 0.10.0 — NEW info box: True finite state machine. Daniel 2026-05-22.
//     Placed between "More than crypto" and "Not keyless" per his spec.
//     Distils the on-chain-FSM property — a real differentiator that
//     no Casa / Vault12 / Ledger Recover / Nunchuk can claim because
//     their state lives behind a vendor login. */}
// <section className="card border-accent-cyan/40">
//   <h2 className="text-2xl font-bold mb-3 text-center">
//     <span className="grad">True finite state machine</span>
//   </h2>
//   <p className="text-text-on-dark/85 max-w-3xl mx-auto mb-4 text-center">
//     Your vault is in <strong>exactly one state at any time</strong>, and that state lives on Polygon. You can check which state directly on a block explorer — without logging in, without asking us, without trusting our dashboard (it's the lifecycle state that's public, never your vault's contents). That's a stronger trust property than any service can offer.
//   </p>
//   <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
//     <div className="rounded-lg border border-bg-surface bg-bg-deepest p-4">
//       <h3 className="font-display font-bold text-accent-cyan mb-2">What it is</h3>
//       <p className="text-sm text-text-on-dark/80">
//         Seven named lifecycle states (ENROLLED → HEIR_DESIGNATED → ALIVE ⇄ DUE_SOON ⇄ IN_GRACE → ACTIVATED → CLAIMED) plus REVOKED and RECOVERED side-states. Every transition is a specific Solidity function call with specific guards — nothing else can change a state.
//       </p>
//     </div>
//     <div className="rounded-lg border border-bg-surface bg-bg-deepest p-4">
//       <h3 className="font-display font-bold text-accent-cyan mb-2">Why it's rare</h3>
//       <p className="text-sm text-text-on-dark/80">
//         Every competitor's state lives in a mutable database controlled by the vendor. You can't verify which state your inheritance is in without trusting their dashboard. {BRAND_NAME}'s state is encoded directly on Polygon — composable, immutable, public. No login, no API key, no relationship with us required to read it.
//       </p>
//     </div>
//     <div className="rounded-lg border border-bg-surface bg-bg-deepest p-4">
//       <h3 className="font-display font-bold text-accent-cyan mb-2">What that means for you</h3>
//       <p className="text-sm text-text-on-dark/80">
//         Every state change emits a cryptographically-signed event you (or anyone) can audit. No hidden state, no surprise transitions, no "and behind the scenes the server marked it claimed" path. The chain is the source of truth — if we disappear, your vault's state stays exactly where the chain says it is.
//       </p>
//     </div>
//   </div>
//   <div className="text-center mt-5">
//     <Link to="/info?tab=architecture&sub=fsm" className="text-accent-cyan hover:underline font-semibold">
//       See the diagram + the full state table →
//     </Link>
//   </div>
// </section>
// ============================================================================
