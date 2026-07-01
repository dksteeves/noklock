// @version 0.4.1 @date 2026-06-08
// 0.4.1 — Daniel 2026-06-08: positioning fix per handoff §3 — "distributed
//          across N independent storage providers" → "across N independent
//          local folders or storage providers". Aligns with NoKLock cardinal
//          positioning that store+restore is the primary value (folders on
//          your own devices beat any sticky-note baseline) and cloud
//          providers are one option among many, not the only path.
// @version 0.4.0 @date 2026-06-05
// 0.4.0 — Daniel 2026-06-05: NEW "And the key isn't tied to one device either"
//         section added before the "Honest caveats" section. Pairs the
//         airgap "key never leaves" proof with the distributed-shares
//         "key isn't trapped" companion. Links to Info Security card +
//         Compare matrix for the full write-up. Same content shape as the
//         Info Security card (Info.tsx 0.8.6), abbreviated for the proof
//         page context.
// @version 0.3.0 @date 2026-05-31
// 0.3.0 — Daniel 2026-05-31: source-code modal MOVED to the new
//          /prove-it/source page (the 6th proof on the hub). This page
//          now links to /prove-it/source rather than embedding the modal,
//          so source is owned by the proof that's primarily about it.
//          Avoids duplicating the modal trigger in two places.
// 0.2.0 — added <AirgapCodeModalTrigger/> in the "Verify yourself"
//          section (now removed, see 0.3.0).
// 0.1.0 — /prove-it/airgap — Daniel's "deeper prove-it" feature. Demonstrates
// undeniably that NoKLock exfiltrates zero bytes during seed entry, by
// running the live network-watch terminal alongside four "test fire"
// buttons that deliberately TRY to exfiltrate via fetch / Image /
// WebSocket / sendBeacon — each bouncing off the airgap firewall in
// real time. Plus a 4-step DevTools walkthrough so the user can
// corroborate against the browser's own Network panel.
//
// Engages the airgap on mount so the terminal shows the "since airgap
// engaged" zero-count proof immediately. Releases on unmount so leaving
// the page doesn't leave the rest of the app crippled.

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDocumentHead } from "../lib/seo.js";
import { trackEvent } from "../lib/track.js";
import { enterAirgap, leaveAirgap, isAirgapped } from "../lib/airgap-manager.js";
import { NetworkWatchTerminal } from "../components/NetworkWatchTerminal.js";
import { BRAND_NAME } from "../lib/brand.js";

interface FireResult { kind: string; ok: boolean; msg: string }

export function ProveItAirgap(): JSX.Element {
  useDocumentHead("/prove-it/airgap");
  const [fired, setFired] = useState<readonly FireResult[]>([]);

  // Engage airgap on mount, release on unmount. This is the demo page —
  // the user wants the firewall ACTIVE while they read so the terminal
  // shows zero-traffic proof.
  useEffect(() => {
    const wasAirgapped = isAirgapped();
    if (!wasAirgapped) enterAirgap();
    return () => {
      if (!wasAirgapped) leaveAirgap();
    };
  }, []);

  const fireFetch = async (): Promise<void> => {
    try {
      await fetch("https://example.com/airgap-test-noklock-prove-it");
      setFired((p) => [...p, { kind: "fetch", ok: false, msg: "request escaped! (should NOT happen)" }]);
    } catch (e) {
      setFired((p) => [...p, { kind: "fetch", ok: true, msg: (e as Error).message }]);
    }
  };

  const fireImage = (): void => {
    const img = new Image();
    img.onload = () => setFired((p) => [...p, { kind: "image", ok: false, msg: "image loaded! (should NOT happen)" }]);
    img.onerror = () => setFired((p) => [...p, { kind: "image", ok: true, msg: "Image.src setter rewrote to data:URI; original URL recorded as blocked" }]);
    img.src = "https://example.com/airgap-test-noklock.png";
    // The hijack rewrites src to a transparent data URI, so onload may
    // fire with no real request. The blocked record is what proves it.
  };

  const fireWebSocket = (): void => {
    try {
      void new WebSocket("wss://example.com/airgap-test-noklock");
      setFired((p) => [...p, { kind: "websocket", ok: false, msg: "WebSocket connected! (should NOT happen)" }]);
    } catch (e) {
      setFired((p) => [...p, { kind: "websocket", ok: true, msg: (e as Error).message }]);
    }
  };

  const fireBeacon = (): void => {
    try {
      const ok = navigator.sendBeacon("https://example.com/airgap-test-noklock", "exfil-payload");
      setFired((p) => [...p, { kind: "beacon", ok: !ok, msg: ok ? "beacon delivered! (should NOT happen)" : "sendBeacon returned false — beacon refused" }]);
    } catch (e) {
      setFired((p) => [...p, { kind: "beacon", ok: true, msg: (e as Error).message }]);
    }
  };

  const fireAll = (): void => {
    trackEvent("prove_airgap_run");
    void fireFetch();
    fireImage();
    fireWebSocket();
    fireBeacon();
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h1 className="text-3xl font-bold font-display"><span className="grad">Prove the airgap</span></h1>
          <Link to="/prove-it" className="text-xs text-text-muted hover:text-accent-cyan">← back to Prove-It hub</Link>
        </div>
        <p className="text-text-on-dark/80 text-base mt-2 max-w-3xl">
          {BRAND_NAME} engaged its airgap firewall the moment you loaded this page. Every outbound channel a browser exposes — fetch, XHR, sendBeacon, Image, WebSocket, EventSource, RTCPeerConnection, even DOM-injected scripts — is hijacked and recorded.
          The terminal below shows every attempt in real time. The buttons let you deliberately try to exfiltrate.
          Open your browser's DevTools Network tab alongside this page — what you see in the terminal should match what the browser sees, because we read from the same source.
        </p>
        <p className="text-text-muted text-sm mt-2 max-w-3xl">
          Visual cues that the airgap is engaged: the amber{" "}
          <span className="font-bold tracking-widest text-amber-300">AIRGAPPED</span>{" "}
          status bar at the very top of the page (visible on every page while airgap is active), and on any animated viz (e.g. the math proof or end-to-end demo) a subtle warm desaturation overlay with an{" "}
          <span className="font-bold tracking-widest text-amber-300">AIRGAPPED</span>{" "}
          pill in the top-left corner. Both clear automatically when you navigate away.
        </p>
      </header>

      <NetworkWatchTerminal />

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Test-fire</div>
        <h2 className="text-xl font-bold font-display mb-1">Try to exfiltrate. Watch it bounce.</h2>
        <p className="text-sm text-text-on-dark/85 mb-4">
          Each button below tries to send data to <code className="font-mono text-xs text-accent-cyan">example.com</code> via a different browser channel.
          Every attempt should appear in the terminal above as <span className="text-rose-300 font-medium">blocked</span> (red). If any of them go through, that's a real bug in the airgap and we want to know.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button type="button" onClick={() => void fireFetch()} className="btn btn-secondary text-sm">Fire fetch()</button>
          <button type="button" onClick={fireImage} className="btn btn-secondary text-sm">Fire Image.src</button>
          <button type="button" onClick={fireWebSocket} className="btn btn-secondary text-sm">Fire WebSocket</button>
          <button type="button" onClick={fireBeacon} className="btn btn-secondary text-sm">Fire sendBeacon</button>
          <button type="button" onClick={fireAll} className="btn btn-primary text-sm ml-auto">▶ Fire all four</button>
        </div>
        {fired.length > 0 && (
          <ul className="space-y-1 font-mono text-xs">
            {fired.map((f, i) => (
              <li key={i} className={f.ok ? "text-emerald-300" : "text-rose-300 font-bold"}>
                {f.ok ? "✓" : "✗"} {f.kind.toUpperCase()} — {f.msg}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Verify yourself</div>
        <h2 className="text-xl font-bold font-display mb-3">Don't take our word for it — open DevTools, or read the source.</h2>
        <p className="text-sm text-text-on-dark/85 mb-4">
          For the source of the 9-channel firewall, the PerformanceObserver witness, the boot install,
          and an honest explainer of the JS memory model (including the synchronous in-place wipe of every
          Uint8Array we derive from your seed), see <Link to="/prove-it/source" className="text-accent-cyan hover:underline">/prove-it/source</Link> —
          source is bundled into that page so opening it does not make a network call (works while the
          airgap is engaged).
        </p>
        <ol className="space-y-3 text-sm text-text-on-dark/90 list-decimal ml-5">
          <li><strong>Open DevTools.</strong> Press <code className="font-mono text-xs text-accent-cyan">F12</code> (or <code className="font-mono text-xs text-accent-cyan">Ctrl+Shift+I</code> on Windows / <code className="font-mono text-xs text-accent-cyan">Cmd+Opt+I</code> on Mac, or right-click → Inspect). Click the <strong>Network</strong> tab.</li>
          <li><strong>Clear &amp; record.</strong> Click the 🚫 circle to clear, then the ⏺ circle to ensure recording is on. Check <strong>"Disable cache"</strong> and <strong>"Preserve log"</strong>.</li>
          <li><strong>Click "Fire all four" above.</strong> Watch your DevTools Network tab as you click. Every attempt that's red in our terminal should also be a <code className="font-mono text-xs">(blocked:other)</code> or <code className="font-mono text-xs">(failed)</code> entry in DevTools — same events, two independent observers, both saying the same thing.</li>
          <li><strong>Verify nothing escaped.</strong> Look for any request in your DevTools that's NOT in our terminal — a request we'd be missing. There shouldn't be any. If you find one, screenshot both panels and email us — that's a bug-bounty submission to <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>.</li>
        </ol>
      </section>

      <section className="card border-accent-cyan/30">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">And the key isn't tied to one device either</div>
        <h2 className="text-xl font-bold font-display mb-3">Airgap proves the key never <em>leaves</em>. Distributed shares prove the key isn't <em>trapped</em>.</h2>
        <p className="text-sm text-text-on-dark/85 mb-2">
          The airgap demo above proves the seed never crosses the network. Useful on its own, but it doesn't answer the next obvious question: <em>what if the device dies?</em>
        </p>
        <p className="text-sm text-text-on-dark/85 mb-2">
          The answer is the architecture's other half. Before the seed exists as a recoverable artifact, it is encrypted with an Argon2id-derived key, split via SLIP-39 Shamir over GF(256) into N shares (3-of-5 by default), each share AEAD-sealed, and distributed across N independent local folders or storage providers <em>you</em> pick. No single device — phone, laptop, hardware wallet — holds the recoverable seed. Lose any one device: download the K shares to any new device, run the same Argon2id + Shamir recombination, recover the seed.
        </p>
        <p className="text-sm text-text-muted">
          That structurally differs from Secure-Element-marketed products (iOS Secure Enclave, Android StrongBox, hardware wallets). SE keys are not exportable from the chip <em>by design</em> — that's what makes them secure. Same property is what makes them a bad fit for a recoverable seed: lose the device, lose the key. Vendors patch this with paper-backup phrases. NoKLock's distributed-shares model is the alternative to the paper-backup ritual. See <Link to="/info?tab=security" className="text-accent-cyan hover:underline">Info → Security</Link> for the technical write-up, or <Link to="/compare" className="text-accent-cyan hover:underline">Compare</Link> for the head-to-head matrix.
        </p>
      </section>

      <section className="card border-amber-700/40 bg-amber-950/10">
        <div className="text-[10px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-2">Honest caveats</div>
        <ul className="text-sm text-text-on-dark/85 space-y-2 list-disc ml-5">
          <li>The hijacks above run AT PAGE-LEVEL. They cannot defend against a browser extension, an OS-level network proxy, or a compromised browser. Self-custody requires you to bring a trustworthy browser; we can prove our code is clean, we cannot prove your environment is.</li>
          <li>Native <code className="font-mono text-xs">import()</code> dynamic imports are NOT directly hijackable in any browser today. The PerformanceObserver still records the resource load they trigger, so a malicious import would surface there — but the hijack count won't tick.</li>
          <li>The airgap engages WHEN YOU REACH THE SEED-ENTRY SCREEN of enrolment, not on every page. This demo page engages it for the duration of your visit so the terminal shows the proof. When you leave this page, normal browsing resumes.</li>
          <li>Service Workers can intercept fetch outside the page sandbox — {BRAND_NAME} doesn't install one with that capability, but a future SW update could (and would be visible in the source diff at <a href="https://github.com/dksteeves/noklock" className="text-accent-cyan hover:underline" target="_blank" rel="noopener noreferrer">github.com/dksteeves/noklock</a>).</li>
        </ul>
      </section>
    </div>
  );
}
