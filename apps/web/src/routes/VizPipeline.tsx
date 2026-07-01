// @version 0.8.0 @date 2026-06-02
// 0.8.0 — Daniel 2026-06-02: Pipeline grows 10 → 12 steps. Two NEW online
//         steps slot between manifest and distribute to close the "both —
//         separate steps" gap on the signing-online interpretation:
//           - publish-manifest (ONLINE): after Ed25519 signing (offline), the
//             signed manifest.json is itself uploaded alongside the
//             share-vaults so heirs / future-you can find them
//             (PublishManifestViz.tsx). Visual: signed JSON envelope flies
//             up into a cloud icon.
//           - nok-mint (ONLINE): on-chain SBT mint via
//             NoKLockSBT.mint(heir, vaultId, manifestHash) on Polygon
//             mainnet (NokMintViz.tsx). Visual: tx pill → 12-block
//             confirmation grid + "POLYGONSCAN: 0xabc…" readout.
//         Order is now: gen, valid, kdf, split, enc, manifest,
//         publish-manifest, nok-mint, distribute, gather, restore, compare.
//         Both new steps are marked airgapped=false (ONLINE) in
//         SIM_AIRGAP_HINTS. WALK_DWELL extended; header copy bumped to
//         "12 steps" with publish + on-chain mint called out as the two
//         new online moments.
// 0.7.2 — Daniel 2026-06-01: PerStepSimAirgap now passes showBadge={false}
//         because ProveItVizPanel 0.6.2 + SimAirgapMood 0.4.0 render the
//         pill inline in the panel's header row beside the lock-icon
//         "Local-only — runs in your browser" eyebrow text. Leaving the
//         old showBadge=true would render TWO badges (one in-header, one
//         sibling after the panel). The SimAirgapProvider that
//         PerStepSimAirgap mounts is still required — that's what flips
//         the inline pill between yellow AIRGAPPED and green ONLINE per
//         step. Just the legacy double-render is gone.
// 0.7.1 — Daniel 2026-06-01: TWO defect fixes that were preventing the
//         AIRGAPPED → ONLINE pill flip from ever actually showing on
//         distribute + gather:
//           (a) Removed the always-on parent <SimAirgapBadge/> from BOTH
//               the chromeless and the non-chromeless branches. It was
//               hardcoded ON which fixed the pill at AIRGAPPED forever
//               and masked the per-step ONLINE pill.
//           (b) Switched PerStepSimAirgap to showBadge={true} so the
//               per-step wrapper actually renders the correct pill
//               (SimAirgapBadge on airgapped steps, SimOnlineBadge on
//               distribute + gather). The architecture was right; it
//               was just disabled.
//           (c) Added position:relative to the non-chromeless dash
//               container at all times (not just when isDashFs). The
//               badges inside PerStepSimAirgap are position:absolute,
//               so without a positioned ancestor they anchored to a
//               far-up ancestor / viewport edge.
// 0.7.0 — Daniel 2026-06-01: Pipeline grows 8 → 10 steps. Inserts two NEW
//         online steps between manifest and restore:
//           - distribute (ONLINE): owner uploads encrypted share-vaults to
//             the storage URLs they chose. Pill flips AIRGAPPED → ONLINE.
//           - gather (ONLINE): heir downloads K-of-N share-vaults from
//             those URLs. Pill stays ONLINE.
//         After gather, the pill returns to AIRGAPPED for the rest of
//         restore (decrypt + interpolate + content decrypt + round-trip).
//         Closes the "the demo says everything is airgapped but obviously
//         the shares had to get out somehow" hole. SimAirgapHints flipped
//         per step; WALK_DWELL extended with the two new entries.
// 0.6.0 — Daniel 2026-06-01: Mount the SimAirgap simulation on top of the
//         demo. The whole /viz/pipeline route is a CANNED illustration of
//         a process that, in real life, runs end-to-end on an air-gapped
//         browser session. The lesson is undermined if a viewer watching
//         the demo doesn't see the airgap framing. Now: every step is
//         wrapped in <SimAirgapProvider enabled={true}> + <SimAirgapMood
//         Overlay> + a <SimAirgapBadge/>. PerStepSimAirgap flips each
//         step's airgap flag on (all 8 steps simulate offline, because
//         the whole pipeline is offline by design). Visual: amber-shift
//         mood filter on the panel + an AIRGAPPED (simulated) pill in
//         the corner with an "i" tooltip explaining it's a simulation.
// 0.5.0 — Daniel 2026-05-31: (a) Auto-walk dwell now derived from each viz's
//         actual TOTAL_CYCLE_MS + 600ms settle pause — previously every step
//         was advancing mid-animation because hardcoded dwells were all
//         shorter than the real cycles (Argon 12s dwell vs 18s real, etc.).
//         (b) New onStepBack/onStepForward callbacks step the actual
//         activeStep (and continue auto-walk from there) — fixes the "back
//         arrow shows step then loops on it" bug where local manualStep
//         was decoupled from the parent's timer.
// /viz/pipeline — end-to-end canned demo of the full 8-step crypto
// pipeline strung together as one continuous lesson-pace animation.
//
// 0.2.0 — Daniel 2026-05-30: converted from a chromeless fullscreen
//         overlay (position:fixed inset:0 zIndex:9999, DemoGate-wrapped)
//         to a NORMAL route page (TopNav/Footer visible, user can
//         navigate around). Two reasons:
//           (a) Daniel: "watch the end-to-end demo needs to be on a
//               normal page with menus etc"
//           (b) The per-viz Fullscreen button was popping out of
//               fullscreen on every auto-walk step change, because the
//               previously-fullscreened inner viz UNMOUNTED when the
//               outer dispatcher swapped to the next viz. Now: outer
//               page provides ONE stable fullscreen container (whose
//               ref doesn't change across step swaps), per-viz buttons
//               are suppressed via <FullscreenSuppressContext>.
//               Result: pressing the dashboard Fullscreen button + auto-
//               walking through all 8 steps stays in fullscreen the
//               whole time. Arrow keys also no longer pop out (same
//               unmount cascade was the root cause).
//
// 0.1.0 — Initial chromeless DemoGate-wrapped overlay version.

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProveItVizPanel, type ProveItStepKey } from "../components/ProveItVizPanel.js";
import { FullscreenSuppressContext } from "../components/FullscreenAffordance.js";
import {
  SimAirgapProvider,
  SimAirgapMoodOverlay,
  PerStepSimAirgap,
  type SimAirgapStepHint,
} from "../components/SimAirgapMood.js";
import { useDocumentHead } from "../lib/seo.js";
// 0.5.0 — Daniel 2026-05-31: derive WALK_DWELL from each viz's actual
// TOTAL_CYCLE_MS instead of guessing. The old hardcoded values were ALL
// shorter than the real cycles (Argon 12s dwell vs 18s real cycle, etc.),
// so the auto-walk advanced mid-animation on EVERY step. Now each step
// dwells for its viz's full cycle + 600ms settle pause.
import { TOTAL_CYCLE_MS as BIP39_CYCLE } from "../components/Bip39Viz.js";
import { TOTAL_CYCLE_MS as ARGON_CYCLE } from "../components/ArgonGridViz.js";
import { TOTAL_CYCLE_MS as SHAMIR_CYCLE } from "../components/ShamirPolyViz.js";
import { TOTAL_CYCLE_MS as AEAD_CYCLE } from "../components/AeadEntropyViz.js";
import { TOTAL_CYCLE_MS as MANIFEST_CYCLE } from "../components/ManifestSigningViz.js";
import { TOTAL_CYCLE_MS as RESTORE_CYCLE } from "../components/RestoreLoopViz.js";
import { TOTAL_CYCLE_MS as ROUNDTRIP_CYCLE } from "../components/RoundTripViz.js";
import { TOTAL_CYCLE_MS as DISTRIBUTE_CYCLE } from "../components/DistributeViz.js";
import { TOTAL_CYCLE_MS as GATHER_CYCLE } from "../components/GatherViz.js";
import { TOTAL_CYCLE_MS as PUBLISH_MANIFEST_CYCLE } from "../components/PublishManifestViz.js";
import { TOTAL_CYCLE_MS as NOK_MINT_CYCLE } from "../components/NokMintViz.js";

const PIPELINE_ORDER: readonly ProveItStepKey[] = [
  "gen", "valid", "kdf", "split", "enc", "manifest",
  "publish-manifest", "nok-mint",
  "distribute", "gather",
  "restore", "compare",
];

// 0.8.0 — 12-step hint table. 8 of 12 simulate the airgap (the crypto
// work). The FOUR online moments (publish-manifest, nok-mint, distribute,
// gather) flip the pill from AIRGAPPED to ONLINE — those transitions ARE
// the lesson: the only times the network is actually touched are
//   (a) publishing the signed manifest.json,
//   (b) minting the on-chain NoK SBT,
//   (c) uploading the encrypted share-vaults,
//   (d) the heir downloading any K of them later.
// Everything else stays local.
const SIM_AIRGAP_HINTS: readonly SimAirgapStepHint[] = [
  { stepKey: "gen",              airgapped: true  /* user enters seed offline */ },
  { stepKey: "valid",            airgapped: true  /* BIP-39 wordlist check happens locally */ },
  { stepKey: "kdf",              airgapped: true  /* Argon2id memory-hard in-browser */ },
  { stepKey: "split",            airgapped: true  /* SLIP-39 Shamir locally */ },
  { stepKey: "enc",              airgapped: true  /* AEAD per-share locally */ },
  { stepKey: "manifest",         airgapped: true  /* canonical-JSON + Ed25519 sign locally */ },
  { stepKey: "publish-manifest", airgapped: false /* ONLINE — signed manifest.json published to chosen storage */ },
  { stepKey: "nok-mint",         airgapped: false /* ONLINE — NoKLockSBT.mint(heir, vaultId, manifestHash) on Polygon */ },
  { stepKey: "distribute",       airgapped: false /* ONLINE — uploads encrypted share-vaults */ },
  { stepKey: "gather",           airgapped: false /* ONLINE — heir downloads K-of-N from URLs */ },
  { stepKey: "restore",          airgapped: true  /* Lagrange interpolation locally */ },
  { stepKey: "compare",          airgapped: true  /* round-trip verification locally */ },
];

// 0.5.0 — dwell = exact cycle length + 600ms settle pause so the viz lands
// on its final phase before we swap. No more interrupting mid-animation.
const SETTLE_PAUSE_MS = 600;
const WALK_DWELL: Record<ProveItStepKey, number> = {
  gen:                BIP39_CYCLE            + SETTLE_PAUSE_MS,
  valid:              BIP39_CYCLE            + SETTLE_PAUSE_MS,
  kdf:                ARGON_CYCLE            + SETTLE_PAUSE_MS,
  split:              SHAMIR_CYCLE           + SETTLE_PAUSE_MS,
  enc:                AEAD_CYCLE             + SETTLE_PAUSE_MS,
  wrap:               AEAD_CYCLE             + SETTLE_PAUSE_MS,
  "content-enc":      AEAD_CYCLE             + SETTLE_PAUSE_MS,
  manifest:           MANIFEST_CYCLE         + SETTLE_PAUSE_MS,
  "publish-manifest": PUBLISH_MANIFEST_CYCLE + SETTLE_PAUSE_MS,
  "nok-mint":         NOK_MINT_CYCLE         + SETTLE_PAUSE_MS,
  distribute:         DISTRIBUTE_CYCLE       + SETTLE_PAUSE_MS,
  gather:             GATHER_CYCLE           + SETTLE_PAUSE_MS,
  restore:            RESTORE_CYCLE          + SETTLE_PAUSE_MS,
  compare:            ROUNDTRIP_CYCLE        + SETTLE_PAUSE_MS,
  error:              4000,
};

export function VizPipeline(): JSX.Element {
  useDocumentHead("/viz/pipeline");
  const [params] = useSearchParams();
  const speedParam = Math.max(0.25, Math.min(3, parseFloat(params.get("speed") ?? "1") || 1));
  // 0.3.0 — Daniel 2026-05-31: `?fs=1` (or `?chromeless=1`) renders the
  // demo as a maximal-viewport overlay — no TopNav, no Footer, no
  // helper paragraphs. The hub card uses this preset URL so opening
  // the demo in a new tab lands the user straight in the "as fullscreen
  // as the browser will give us without a user gesture" view. Browser
  // can't auto-Fullscreen-API a cross-tab open without a gesture; this
  // chromeless overlay is the next best thing.
  const chromeless = params.get("fs") === "1" || params.get("chromeless") === "1";

  const [activeStep, setActiveStep] = useState<ProveItStepKey>("gen");
  const timerRef = useRef<number | null>(null);

  // Outer container ref — this is the stable fullscreen target. It does
  // NOT unmount when the inner viz (Argon → Shamir → AEAD → …) swaps,
  // so browser fullscreen survives the auto-walk.
  const dashRef = useRef<HTMLDivElement | null>(null);
  const [isDashFs, setIsDashFs] = useState(false);
  useEffect(() => {
    const onChange = (): void => setIsDashFs(document.fullscreenElement === dashRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleDashFs = useCallback((): void => {
    if (!dashRef.current) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void dashRef.current.requestFullscreen();
  }, []);

  const scheduleNext = useCallback((idx: number, order: readonly ProveItStepKey[]): void => {
    const key = order[idx];
    const dwell = (key && WALK_DWELL[key]) || 5000;
    const adjusted = Math.max(500, dwell / speedParam);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const nextIdx = idx + 1 >= order.length ? 0 : idx + 1;
      setActiveStep(order[nextIdx] ?? "gen");
      scheduleNext(nextIdx, order);
    }, adjusted);
  }, [speedParam]);

  useEffect(() => {
    scheduleNext(0, PIPELINE_ORDER);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [scheduleNext]);

  const onLiveReset = useCallback((): void => {
    setActiveStep("gen");
    scheduleNext(0, PIPELINE_ORDER);
  }, [scheduleNext]);

  // 0.5.0 — Daniel 2026-05-31: side ◀/▶ in the panel now step the actual
  // auto-walk (and continue from there) rather than just locally overriding.
  // Previously pressing ◀ set a local manualStep, the auto-walk timer kept
  // ticking on its own index, the panel showed manualStep frozen and the
  // user saw "loops autoplays on that step rather than continuing on".
  const stepRelative = useCallback((delta: number): void => {
    setActiveStep((cur) => {
      const i = PIPELINE_ORDER.indexOf(cur);
      const next = i < 0 ? 0 : ((i + delta) % PIPELINE_ORDER.length + PIPELINE_ORDER.length) % PIPELINE_ORDER.length;
      scheduleNext(next, PIPELINE_ORDER);
      return PIPELINE_ORDER[next] ?? "gen";
    });
  }, [scheduleNext]);
  const onStepBack    = useCallback((): void => stepRelative(-1), [stepRelative]);
  const onStepForward = useCallback((): void => stepRelative(+1), [stepRelative]);

  // 0.3.0 — Chromeless mode renders the demo as a max-viewport overlay
  // (position:fixed inset:0 zIndex:9999) so it sits OVER the TopNav +
  // Footer for a clean "as fullscreen as the browser will give us"
  // presentation. Triggered by ?fs=1 in the URL. Used by the hub card.
  if (chromeless) {
    // 0.4.0 — Daniel 2026-05-31: kill the redundant title bar, kill the
    // outer scroll, size the viz so viz + stacked data panel BOTH fit
    // in the viewport. ProveItVizPanel chrome ~160px (card padding +
    // header + step strip), stacked allocation = 0.6h(viz) + 0.55h(data)
    // = 1.15h. Solve for h: h = (window.innerHeight - 176) / 1.15.
    const fitHeight = Math.max(320, Math.floor((window.innerHeight - 176) / 1.15));
    return (
      <FullscreenSuppressContext.Provider value={true}>
        <SimAirgapProvider enabled={true}>
          <SimAirgapMoodOverlay>
            <div
              ref={dashRef}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "radial-gradient(ellipse at center, #0b1220 0%, #020617 80%)",
                color: "#e2e8f0",
                padding: "8px 12px",
                overflow: "hidden",
              }}
            >
              <a
                href="/"
                className="text-[10px] text-text-muted/70 hover:text-accent-cyan font-mono uppercase tracking-wider whitespace-nowrap"
                title="Back to NoKLock"
                style={{ position: "absolute", top: 6, right: 12, zIndex: 10 }}
              >
                noklock.app ↗
              </a>
              <PerStepSimAirgap stepKey={activeStep} hints={SIM_AIRGAP_HINTS} showBadge={false}>
                <ProveItVizPanel
                  stepKey={activeStep}
                  running={true}
                  height={fitHeight}
                  mode="demo"
                  stepOrder={PIPELINE_ORDER}
                  onLiveReset={onLiveReset}
                  onStepBack={onStepBack}
                  onStepForward={onStepForward}
                  cannedDemo
                />
              </PerStepSimAirgap>
            </div>
          </SimAirgapMoodOverlay>
        </SimAirgapProvider>
      </FullscreenSuppressContext.Provider>
    );
  }

  // Normal page mode (default — TopNav + Footer visible, scrollable)
  return (
    <FullscreenSuppressContext.Provider value={true}>
      <SimAirgapProvider enabled={true}>
        <SimAirgapMoodOverlay>
          <div
            ref={dashRef}
            className="space-y-6"
            style={{
              position: "relative",
              ...(isDashFs ? { background: "#020617", padding: 24, overflowY: "auto" } : {}),
            }}
          >
            <header className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold">End-to-end · the full proof in motion</div>
                <h1 className="text-3xl font-bold font-display mt-1">
                  <span className="grad">BIP-39 → Argon2id → Shamir → AEAD → Manifest → Publish → SBT Mint → Distribute → Gather → Restore → Round-trip ✓</span>
                </h1>
                <p className="text-text-on-dark/80 text-sm mt-2 max-w-3xl">
                  All <strong>12 steps</strong> strung together as one continuous lesson-pace animation —
                  8 airgapped crypto moments plus the 4 ONLINE moments: <strong>publish-manifest</strong> (the signed
                  manifest.json goes up to your chosen storage), <strong>nok-mint</strong> (on-chain
                  NoKLockSBT.mint records vaultId + manifestHash + heir wallet on Polygon mainnet),
                  <strong> distribute</strong> (encrypted share-vaults upload alongside the manifest), and
                  <strong> gather</strong> (heir later downloads any K of N). Watch the pill flip from
                  <span className="text-accent-cyan"> AIRGAPPED</span> to <span className="text-amber-400">ONLINE</span> on
                  steps 7–10 — those are the only times the network is touched.
                  Same algorithms as the live math proof at <a href="/prove-it/math" className="text-accent-cyan hover:underline">/prove-it/math</a>;
                  this version runs on illustrative data so you can SEE the shape of the whole process in ~2 minutes.
                  Use ← / → arrow keys to step through any single viz at your pace.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary text-sm whitespace-nowrap"
                onClick={toggleDashFs}
                title={isDashFs ? "Exit fullscreen (Esc)" : "Fullscreen the whole demo"}
              >
                {isDashFs ? "⤓ Exit fullscreen" : "⤢ Fullscreen"}
              </button>
            </header>

            <PerStepSimAirgap stepKey={activeStep} hints={SIM_AIRGAP_HINTS} showBadge={true}>
              <ProveItVizPanel
                stepKey={activeStep}
                running={true}
                height={isDashFs ? Math.max(360, window.innerHeight - 280) : 520}
                mode="demo"
                stepOrder={PIPELINE_ORDER}
                onLiveReset={onLiveReset}
                onStepBack={onStepBack}
                onStepForward={onStepForward}
                cannedDemo
              />
            </PerStepSimAirgap>

            <p className="text-xs text-text-muted text-center">
              The pipeline is the same code path the live math proof uses. The animation here is the lesson — the proof itself runs in &lt; 1 second on real bytes at <a href="/prove-it/math" className="text-accent-cyan hover:underline">/prove-it/math</a>.
            </p>
          </div>
        </SimAirgapMoodOverlay>
      </SimAirgapProvider>
    </FullscreenSuppressContext.Provider>
  );
}
