// @version 0.1.0 @date 2026-05-31
// /prove-it/source — Daniel 2026-05-31. The 6th proof on the /prove-it hub.
// Owns the inline source-code modal (was briefly mounted on /prove-it/airgap)
// + explains the 9-channel firewall, the seed-derived-Uint8Array wipe pass
// that landed in this round, and the honest JS memory model for the seed
// string itself (which cannot be synchronously wiped — no JS API).
//
// Pairs with: AirgapCodeModal.tsx (bundles 3 source files inline via vite
// ?raw imports); enrol-pipeline.ts 0.4.0 + Enrol.tsx 1.9.0 (the actual
// memory-wipe go-big work). Honest about what we DO and DON'T do.

import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/seo.js";
import { AirgapCodeModalTrigger } from "../components/AirgapCodeModal.js";
import { BRAND_NAME } from "../lib/brand.js";

export function ProveItSource(): JSX.Element {
  useDocumentHead("/prove-it/source");

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h1 className="text-3xl font-bold font-display"><span className="grad">Prove the source</span></h1>
          <Link to="/prove-it" className="text-xs text-text-muted hover:text-accent-cyan">← back to Prove-It hub</Link>
        </div>
        <p className="text-text-on-dark/80 text-base mt-2 max-w-3xl">
          The honest proof of the deepest claim a self-custodial vault has to defend: that the code
          handling your seed is what we say it is. Two layers — the 9-channel network firewall that
          stops the seed from leaving the page, and the synchronous in-place wipe of every Uint8Array
          we derive from your seed the moment it's no longer needed. Inline source, bundled into the
          page so opening this proof doesn't itself make a network call.
        </p>
      </header>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Read the source</div>
        <h2 className="text-xl font-bold font-display mb-3">The actual firewall + boot install, bundled into this page.</h2>
        <p className="text-sm text-text-on-dark/85 mb-4">
          Three files cover the entire firewall claim: the 9-channel hijack manager, the
          PerformanceObserver browser-native witness that independently corroborates, and the boot
          install where the firewall arms (before any seed-handling code runs). Each file's source
          is bundled into this page via vite <code className="font-mono text-xs text-accent-cyan">?raw</code> imports — opening
          the modal does NOT make a network call, so the proof works even while the airgap is engaged.
          GitHub link in the modal footer is shown only when the airgap is OFF (clicking otherwise
          would take you off-page to a third party at exactly the wrong moment).
        </p>
        <AirgapCodeModalTrigger />
      </section>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Memory wipe — what we actually do</div>
        <h2 className="text-xl font-bold font-display mb-3">Every byte we derive from your seed is synchronously zeroed in place.</h2>
        <p className="text-sm text-text-on-dark/85 mb-3">
          The {BRAND_NAME} enrolment pipeline derives several intermediate buffers from your seed —
          the BIP-39 entropy, the Argon2id master, the HKDF pseudorandom key, per-share AEAD keys,
          the Shamir share plaintexts, and the Ed25519 signing seed. Every one of those is a
          <code className="font-mono text-xs text-accent-cyan"> Uint8Array</code> and every one is
          synchronously wiped via <code className="font-mono text-xs text-accent-cyan">.fill(0)</code> the
          moment it's no longer needed. The wipes run inside <code className="font-mono text-xs text-accent-cyan">try/finally</code> blocks
          so a mid-pipeline error doesn't leave seed-derived material lingering.
        </p>
        <ul className="text-sm text-text-on-dark/85 space-y-1.5 list-disc ml-6 mb-4">
          <li><strong>BIP-39 entropy</strong> — wiped immediately after splitting into Shamir shares.</li>
          <li><strong>HKDF PRK</strong> — wiped after per-share keys + Ed25519 sign seed are derived.</li>
          <li><strong>Per-share AEAD keys</strong> — wiped after each share is encrypted (inside the loop, not at the end).</li>
          <li><strong>Shamir share plaintexts</strong> — wiped after encryption; only the ciphertext (which is what gets written to your cloud) survives.</li>
          <li><strong>Ed25519 signing seed</strong> — wiped after the manifest signature is computed.</li>
          <li><strong>Argon2id master</strong> — wiped after the optional WebAuthn passkey envelope is sealed (the encrypted envelope re-derives it from your passkey when needed).</li>
        </ul>
        <p className="text-sm text-text-on-dark/85 mb-3">
          The relevant source lives in <code className="font-mono text-xs text-accent-cyan">apps/web/src/lib/enrol-pipeline.ts</code>
          (the pipeline-level wipes) and <code className="font-mono text-xs text-accent-cyan">apps/web/src/routes/Enrol.tsx</code>
          (React-state cleanup after enrolment + on unmount). Both are visible at <a href="https://github.com/dksteeves/noklock" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">github.com/dksteeves/noklock</a>.
        </p>
      </section>

      <section className="card border-amber-700/40 bg-amber-950/10">
        <div className="text-[10px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-2">Honest caveat — the seed string itself</div>
        <h2 className="text-xl font-bold font-display mb-3">JavaScript strings cannot be synchronously wiped. Here is why, and what we do about it.</h2>
        <p className="text-sm text-text-on-dark/85 mb-3">
          Your seed phrase enters the app as a <code className="font-mono text-xs text-accent-cyan">&lt;textarea&gt;</code> bound
          to a React <code className="font-mono text-xs text-accent-cyan">useState</code> — both of which require a JavaScript
          string. JavaScript strings are <strong>immutable</strong>: there is no API in any browser that lets you
          overwrite the bytes of a string in place. Every keystroke creates a brand-new string in heap;
          the previous one becomes unreferenced and <em>eligible for garbage collection</em>, but the GC runs
          when V8 (or SpiderMonkey, or JavaScriptCore) decides. On a long-running tab, multiple
          intermediate strings can sit in heap for seconds or minutes before they're reclaimed.
        </p>
        <p className="text-sm text-text-on-dark/85 mb-3">
          Worse: even if YOU drop your reference, the JS engine maintains additional representations
          we cannot reach — string-interning tables, JIT scratch buffers, optimised small-string
          caches. Even a hypothetical perfect-wipe-of-your-ref would not touch those. This is true
          for every browser-based vault — Vault12, Casa, Argent, MetaMask. None of them claim
          synchronous memzero of the seed string, because none of them can.
        </p>
        <p className="text-sm text-text-on-dark/85 mb-3">
          <strong>What we do:</strong> Enrol.tsx calls <code className="font-mono text-xs text-accent-cyan">setSeed("")</code> the
          instant the pipeline returns, so the old string is unreferenced immediately. A
          <code className="font-mono text-xs text-accent-cyan"> useEffect</code> cleanup also fires on
          route-nav / browser-close to catch the unmount case. This nudges GC but does not pretend
          to be a synchronous wipe.
        </p>
        <p className="text-sm text-text-on-dark/85 mb-3">
          <strong>What stops the seed from leaving the page regardless:</strong> the 9-channel airgap firewall
          (see the source modal above). Even if a seed string lingers in heap for 30 seconds after
          use, it CANNOT exfiltrate during the airgap window. The firewall is the load-bearing
          claim; the wipes minimise the heap-residue window in case the user's environment is later
          compromised (browser crash report uploaded with heap snapshot, malicious extension
          installed afterward, etc.).
        </p>
        <p className="text-sm text-text-on-dark/85">
          <strong>What we cannot defend against:</strong> a malicious browser extension that already has the
          page open (extensions can inject scripts and read DOM); a compromised OS doing RAM
          dumps; cold-boot attacks. These threats are out of scope for any browser-based vault.
          The right mitigation for those is a hardware wallet, used in combination with NoKLock's
          inheritance + share-storage layer.
        </p>
      </section>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Related proofs</div>
        <ul className="text-sm text-text-on-dark/85 space-y-2">
          <li>→ <Link to="/prove-it/airgap" className="text-accent-cyan hover:underline">/prove-it/airgap</Link> — the live demonstration: open DevTools, click "Fire all four", watch every browser exfil channel bounce off the firewall in real time.</li>
          <li>→ <Link to="/prove-it/math" className="text-accent-cyan hover:underline">/prove-it/math</Link> — run the real crypto pipeline on throwaway test data and watch the wipes happen as part of the round-trip.</li>
          <li>→ <Link to="/prove-it/build-matches" className="text-accent-cyan hover:underline">/prove-it/build-matches</Link> — verify that the source you read in the modal is the source that's actually running in your browser.</li>
        </ul>
      </section>
    </div>
  );
}
