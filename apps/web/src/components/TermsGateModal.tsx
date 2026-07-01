// @version 0.2.1 @date 2026-06-07
// 0.2.1 — Daniel 2026-06-07: storage-agnostic rewrite in the gate-modal
//         summary. Checkbox 2 now reads "on my devices, with my chosen
//         storage (local folders or cloud providers)" (was "with my chosen
//         storage providers"). TermsBody §2 control bullet now reads "Your
//         chosen storage (local folders or providers like Drive, Dropbox,
//         OneDrive, IPFS, your own server)" (was "Your storage providers
//         (Drive, Dropbox, OneDrive, IPFS, your own server)"). Matches the
//         storage-primary positioning across the product.
// 0.2.0 — MOBILE FIX (Daniel): the three acknowledgement checkboxes + Accept
//         button lived in a fixed, non-scrolling footer. On a small screen the
//         header + that tall footer exceeded the viewport, the scroller
//         collapsed, and the boxes/button were pushed off-screen with no way
//         to reach them. Now the checkboxes live INSIDE the single scroll area
//         (everything below the title scrolls); only the short note + button
//         are pinned. Mobile sizing: max-h-[95dvh], smaller padding/text,
//         min-h-0 on the scroller, overscroll-contain, bigger (w-5 h-5) tap
//         targets. Logic unchanged: read-to-sentinel still unlocks the boxes.
// 0.1.1 — Daniel 2026-05-21 tone correction on checkbox 3 + §6: the
//         original framing positioned NoKLock as "not the only safety net"
//         which implicitly weakens the primary. Reframed as defence-in-
//         depth: NoKLock IS the comprehensive answer; add a layer on top
//         the same way 2FA sits on top of a strong password — not because
//         either is weak but because layering compounds reliability.
// 0.1.0 — Forced Terms-acceptance modal. Daniel 2026-05-21: fires on FIRST
// wallet-connect ("the appropriate juncture"), forces scroll-to-bottom
// reading, then 3 explicit acknowledgement checkboxes BEFORE the Accept
// button enables. Calm tone — factual, not legal-CYA-melodrama.
//
// What the user is acknowledging (each one a separate tick):
//   1. NO LIABILITY — NoKLock is provided AS-IS; operators not liable.
//   2. TEST + VERIFY — user will run the full enrol-restore-NoK flow on
//      throwaway data before storing real value.
//   3. DEFENCE IN DEPTH — user will add at least one independent layer ON
//      TOP of NoKLock (paper seed in a safe, hardware-wallet recovery
//      card, separate inheritance arrangement). Same instinct as
//      password + 2FA: not a hedge against weakness, a multiplier.
//
// Acceptance persists per-browser via lib/termsAcceptance.ts. If TERMS_VERSION
// bumps, every user re-accepts (the right behaviour for material changes).

import { useEffect, useRef, useState } from "react";
import { BRAND_NAME } from "../lib/brand.js";
import { writeTermsAcceptance } from "../lib/termsAcceptance.js";

interface Props {
  readonly walletAddress: string;
  readonly onAccept: () => void;
}

export function TermsGateModal({ walletAddress, onAccept }: Props): JSX.Element {
  const [reachedBottom, setReachedBottom] = useState(false);
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver-based bottom-detection. Triggers when the bottom
  // sentinel scrolls into view inside the scroller. More reliable than
  // measuring scrollTop+clientHeight vs scrollHeight (zoom / dynamic layout).
  useEffect(() => {
    const scroller = scrollerRef.current;
    const sentinel = sentinelRef.current;
    if (!scroller || !sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setReachedBottom(true);
        }
      },
      { root: scroller, threshold: 0.5 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  // Body-scroll lock while the modal is open. Belt+braces: the modal also
  // covers the whole viewport, but locking the body prevents content jumps
  // when checkboxes tick.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const canAccept = reachedBottom && c1 && c2 && c3;

  function accept(): void {
    writeTermsAcceptance(walletAddress);
    // Funnel signal: a connected wallet just accepted the Terms gate. Zero-
    // PII (no wallet address in the beacon); excluded admin/treasury wallets
    // are suppressed inside trackEvent.
    void import("../lib/track.js").then((m) => m.trackEvent("terms_accepted")).catch(() => { /* never block */ });
    onAccept();
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-gate-title"
    >
      <div className="bg-bg-deepest border border-bg-surface rounded-lg shadow-2xl w-full max-w-3xl max-h-[95dvh] flex flex-col">
        <header className="px-4 sm:px-5 py-3 border-b border-bg-surface flex-shrink-0">
          <h2 id="terms-gate-title" className="text-xl sm:text-2xl font-bold font-display">
            <span className="grad">Before we continue — please read</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            You're about to use a self-custodial cryptography tool. There's no support desk that can undo a mistake.
            Read the terms, then tick the three boxes. One-time per browser.
          </p>
        </header>

        {/* ONE scroll area for the terms AND the checkboxes — so on a small
            screen everything below the title can be reached by scrolling.
            Only the short note + button are pinned in the footer. */}
        <div
          ref={scrollerRef}
          className="overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 flex-1 min-h-0 space-y-4 text-sm leading-relaxed"
        >
          <TermsBody />
          {/* Bottom-of-terms sentinel: once it scrolls into view the three
              acknowledgements (just below) unlock. */}
          <div ref={sentinelRef} aria-hidden="true" className="h-1" />

          <div className="pt-3 border-t border-bg-surface/60 space-y-3">
            {!reachedBottom && (
              <p className="text-xs text-amber-300/80">
                Finish reading the terms above to enable these three acknowledgements.
              </p>
            )}

            <label className={`flex items-start gap-2 cursor-pointer ${reachedBottom ? "" : "opacity-50 pointer-events-none"}`}>
              <input
                type="checkbox"
                className="mt-1 shrink-0 w-5 h-5"
                checked={c1}
                onChange={(e) => setC1(e.target.checked)}
                disabled={!reachedBottom}
              />
              <span className="text-sm">
                <strong>No liability.</strong> I understand {BRAND_NAME} is provided AS-IS, with no warranty.
                The operators, contributors, and authors are not responsible for any loss arising from my use of
                the software — including losses caused by my own errors, lost passwords, lost shares, lost
                wallets, or anything else.
              </span>
            </label>

            <label className={`flex items-start gap-2 cursor-pointer ${reachedBottom ? "" : "opacity-50 pointer-events-none"}`}>
              <input
                type="checkbox"
                className="mt-1 shrink-0 w-5 h-5"
                checked={c2}
                onChange={(e) => setC2(e.target.checked)}
                disabled={!reachedBottom}
              />
              <span className="text-sm">
                <strong>I will test the full flow before storing real value.</strong> I will run an end-to-end
                rehearsal with throwaway data — enrol a vault, distribute the shares, restore from those shares,
                designate a next-of-kin, and verify the heir's claim path — to confirm everything works the way
                I expect it to, on my devices, with my chosen storage (local folders or cloud providers).
              </span>
            </label>

            <label className={`flex items-start gap-2 cursor-pointer ${reachedBottom ? "" : "opacity-50 pointer-events-none"}`}>
              <input
                type="checkbox"
                className="mt-1 shrink-0 w-5 h-5"
                checked={c3}
                onChange={(e) => setC3(e.target.checked)}
                disabled={!reachedBottom}
              />
              <span className="text-sm">
                <strong>I will add a defence-in-depth layer.</strong> {BRAND_NAME} is engineered as a comprehensive,
                secured delivery system for diverse inheritance needs. As with anything important — the same way
                best practice pairs a strong password with a passkey or 2FA — I will add at least one independent
                layer on top of {BRAND_NAME}: a paper copy of a seed in a physical safe, a hardware-wallet
                recovery card, a separate inheritance arrangement with a trusted person, or a combination. Layers
                don't replace {BRAND_NAME}; they sit on top, the way 2FA sits on top of a good password.
              </span>
            </label>
          </div>
        </div>

        <footer className="px-4 sm:px-5 py-3 border-t border-bg-surface flex-shrink-0 bg-bg-deepest flex flex-wrap gap-2 items-center justify-between">
          <p className="text-xs text-text-muted flex-1 min-w-[12rem]">
            {canAccept
              ? "Stored only in this browser; nothing leaves your device."
              : "Read the terms and tick all three boxes above to enable."}
          </p>
          <button
            className="btn btn-primary"
            disabled={!canAccept}
            onClick={accept}
            title={canAccept ? "Accept and continue" : "Scroll the terms + tick all three to enable"}
          >
            Accept and continue
          </button>
        </footer>
      </div>
    </div>
  );
}

// Plain-language summary of the Terms structured for the gate modal.
// Keep it CONCISE (the full legal text lives on /terms — linked at the
// bottom). The user should be able to scroll through this in under a
// minute. If they want the full version they can open it in a new tab.
function TermsBody(): JSX.Element {
  return (
    <>
      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">1. What {BRAND_NAME} actually is</h3>
        <p>
          A set of smart contracts on Polygon plus a browser app and a thin back-end service. It splits, encrypts,
          and inheritably stores secrets you provide — seed phrases, sealed letters, documents, images. Every share
          is encrypted in your browser before it leaves your machine. {BRAND_NAME} cannot read your contents, see
          your master password, or recover anything for you.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">2. You control everything</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Your wallet, your seed, your master password, your recovery shares.</li>
          <li>Your chosen storage (local folders or providers like Drive, Dropbox, OneDrive, IPFS, your own server).</li>
          <li>Your next-of-kin designations and your grace-period setting.</li>
          <li>If you lose any of the above, no-one — including us — can help you get them back. That's the trade-off for true self-custody.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">3. License NFT purchases are non-refundable</h3>
        <p>
          Minting a licence (Standard / Premium / Lifetime / etc.) transfers USDC on-chain to the {BRAND_NAME} treasury.
          The smart contract cannot reverse this. You can burn a licence later but it does not refund the USDC.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">4. AS-IS, no warranty</h3>
        <p>
          The software is provided as-is, under <a className="text-accent-cyan hover:underline" href="https://spdx.org/licenses/BUSL-1.1.html" target="_blank" rel="noopener noreferrer">BUSL-1.1</a>. No warranties of merchantability or
          fitness for any particular purpose. The authors and operators are not liable for any claim, loss, or damage
          arising from use of the software — whether caused by software defects, your own errors, third-party storage
          providers, blockchain conditions, lost wallets, or anything else.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">5. Your responsibility to test and verify</h3>
        <p>
          Because {BRAND_NAME} is self-custodial, you are responsible for confirming the full flow works on your
          machines with your providers BEFORE you trust it with real value. That means running a complete
          throwaway-data rehearsal: enrol a test vault, distribute the shares to your real storage spots, restore
          from those shares on a different browser, designate a next-of-kin, and verify the heir's claim walkthrough.
          Do this at least once. Do it again after any setting change. We strongly recommend it before every
          significant content change.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">6. Defence in depth: layer on top of {BRAND_NAME}</h3>
        <p>
          {BRAND_NAME} is engineered as the comprehensive answer for diverse inheritance needs — one secured
          delivery flow that handles seeds, sealed letters, documents and images with the same self-custodial
          guarantees. That doesn't change the rule for anything important: best practice calls for defence
          in depth. The same instinct that pairs a strong password with a passkey or 2FA — not because either
          is weak, but because layering compounds reliability — applies here too.
        </p>
        <p>
          Add at least one independent layer on top of {BRAND_NAME}: a paper backup of a seed in a physical
          safe, a hardware-wallet recovery card, a separate inheritance arrangement with a trusted person,
          or a combination. These don't replace {BRAND_NAME} — they sit on top of it, the way 2FA sits on
          top of a good password.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">7. Acceptable use</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Don't use {BRAND_NAME} for unlawful content.</li>
          <li>Don't designate next-of-kin you know to be sanctioned individuals or entities.</li>
          <li>Don't try to disrupt the service for other users.</li>
          <li>You are responsible for your own tax, financial-reporting, and jurisdiction-specific obligations.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">8. We cannot see your content</h3>
        <p>
          Everything is encrypted in your browser before leaving your device. {BRAND_NAME}, its employees, its
          contractors, and any back-end we operate cannot inspect what you store. This is true by architecture,
          not policy. We have no obligation to verify the legality, accuracy, completeness, or suitability of
          anything in your vaults — we don't know what's there.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">9. Heirs and post-release behaviour</h3>
        <p>
          Once a next-of-kin claim completes (after the dead-man's switch fires or after a multi-NoK quorum),
          the heir receives the decrypted contents and is responsible for everything they do with them. Their
          behaviour is outside {BRAND_NAME}'s control and outside its scope.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-bold text-accent-cyan">10. Changes to these terms</h3>
        <p>
          We may update these terms. Material changes will bump the version, and you'll be asked to re-acknowledge
          on your next wallet-connect. The full current version lives at <a className="text-accent-cyan hover:underline" href="/terms" target="_blank" rel="noopener noreferrer">/terms</a>. English is the authoritative
          language.
        </p>
      </section>

      <section className="space-y-2 pb-2">
        <h3 className="text-base font-bold text-accent-cyan">11. In short</h3>
        <p>
          {BRAND_NAME} is a tool. You drive it. We can't undo your mistakes; we can't see your content; we
          can't recover what we never had. Test before you trust. Keep independent backups. The smart contracts
          on Polygon are the source of truth — they keep working even if our servers don't.
        </p>
      </section>
    </>
  );
}
