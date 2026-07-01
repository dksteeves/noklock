// @version 0.7.0 @date 2026-06-02
// 0.7.0 — Daniel 2026-06-02: Pipeline grows 10 → 12 steps. Two NEW step keys
//         added BETWEEN manifest and distribute to close the signing-online
//         gap that Daniel resolved as "both — separate steps":
//           - "publish-manifest" (ONLINE) — upload signed manifest.json to
//             chosen storage so heirs / future-you can find it
//             (PublishManifestViz.tsx)
//           - "nok-mint"        (ONLINE) — on-chain NoKLockSBT.mint(heir,
//             vaultId, manifestHash) on Polygon mainnet (NokMintViz.tsx)
//         Wired into ProveItStepKey, STEP_META, STEP_ORDER, VIZ_TIMING and
//         the VizDispatch switch. The Pipeline route flips SimAirgapHints
//         ONLINE for both — the same AIRGAPPED → ONLINE story already used
//         for distribute/gather extends to these. Underlying crypto pipelines
//         untouched; this is a telling-the-story expansion, not a crypto
//         change.
// 0.6.4 — Daniel 2026-06-02: VizDispatch now accepts cannedDemo and passes
//         loop={!cannedDemo} to every inner viz. In pipeline-walker mode
//         (cannedDemo=true on /viz/pipeline) each viz freezes on its final
//         HOLD frame instead of wrapping back to phase 0 during the 600ms
//         settle pause that sits between cycle-end and the dispatcher's
//         viz-swap. Bug Daniel reported: "in full end to end viz, at end
//         of shamir .. the last slide seems to the first again then it
//         switches to next viz (i see the first screen 'your secret key
//         lives here' after the full shamir run)". Root cause: the inner
//         viz auto-looped → INTRO ("Your secret key lives here") rendered
//         for ~600ms before VizPipeline's WALK_DWELL fired the swap. All 9
//         vizzes already implement the !loop && elapsed >= TOTAL_CYCLE_MS
//         freeze-on-HOLD branch, so this is a one-line dispatcher flip —
//         no per-viz code changes needed. Live mode (/prove-it/math,
//         cannedDemo=false) still loops as before.
// 0.6.3 — Daniel 2026-06-01: per-step title coloring driven by SimAirgap
//         state. The slide title (each viz's step heading — "Generate test
//         seed", "Split into Shamir shares", "Publish encrypted shares",
//         etc.) and the mini eyebrow label ("step N.x/M · stepKey") are
//         now tinted to match the pill state:
//           - YELLOW (#eab308) when airgapped — matches the AIRGAPPED pill
//           - GREEN  (#22c55e) when online    — matches the ONLINE pill
//         Subtitle / supporting text stays default muted-white so only the
//         load-bearing heading carries the color signal. The "PIPELINE VIZ
//         · DEMO RUN" prefix and dot separator stay accent-cyan; only the
//         numeric "step N.x / M · stepKey" portion picks up the per-step
//         color so the live one-glance signal lands without losing the
//         existing cyan branding chrome. When no SimAirgapProvider is
//         mounted (e.g. /prove-it/math) the title falls back to the
//         default style — no green leak on live-run routes that don't
//         participate in the simulation. Implementation: read
//         SimAirgapContext directly via useContext so we get the same
//         (enabled, mounted) shape SimAirgapInlineBadge already uses;
//         compute simColor in-component; apply via inline `style={{ color }}`
//         only when mounted, otherwise omit the override.
// 0.6.2 — Daniel 2026-06-01: relocate the SimAirgap pill (AIRGAPPED /
//         ONLINE · simulated) ONTO the same row as the lock-icon
//         "Local-only — runs in your browser" eyebrow text. Previously
//         the pill was floating top-right via position:absolute and the
//         header eyebrow ran below it on its own line — visually
//         disconnected from the AIRGAPPED/ONLINE message it was
//         reinforcing.
//         Implementation:
//           - SimAirgapMood 0.4.0 dropped position:absolute from the
//             badges; they're now inline pills.
//           - The eyebrow row + inline `<SimAirgapInlineBadge/>` now
//             share a single flex-row. The pill sits on the right via
//             `ml-auto` so on wide screens it pins to the row edge,
//             and on narrow screens it wraps under the eyebrow text.
//           - The Demo/Your-run + status-pill stack moves OUT of the
//             header right column (which previously held the floating
//             airgap pill via PerStepSimAirgap) and onto a new
//             secondary row beneath — keeps the eyebrow row clean and
//             the running pipeline pill discoverable.
// 0.6.1 — Daniel 2026-06-01: fixed forward-arrow being greyed at last phase
//         / last viz. Root cause: SideArrows `canNext` was only true when
//         orderIdx < order.length-1 (cross-viz boundary), ignoring whether
//         the current viz still had unspent sub-phases. On RoundTripViz
//         (the LAST viz in the pipeline) the arrow was greyed despite 5
//         sub-phases being available. Fix: `canPrev`/`canNext` now also
//         consider the current viz's phase index; the arrow only greys
//         when truly at the global first/last step. goPrev/goNext also
//         wrap (last viz last-phase → first viz first-phase) when no
//         parent onStepBack/onStepForward is provided, matching the
//         per-viz wrap pattern Daniel's mental model expects.
// 0.6.0 — Daniel 2026-06-01: Pipeline grows from 8 → 10 steps. Two NEW steps
//         sit BETWEEN manifest and restore to close the airgap-story gap:
//           - "distribute" (ONLINE) — upload encrypted share-vaults to cloud
//             storage URLs the owner chose (DistributeViz.tsx)
//           - "gather"     (ONLINE) — heir downloads K-of-N share-vaults from
//             the manifest URLs (GatherViz.tsx)
//         Adds them to ProveItStepKey, STEP_META, STEP_ORDER, VIZ_TIMING +
//         VizDispatch. The Pipeline route flips SimAirgapHints ONLINE for
//         these two — the AIRGAPPED badge → ONLINE badge transition is the
//         lesson: "this part really does touch the network, the rest does
//         not". The underlying CRYPTO pipelines (enrol-pipeline.ts,
//         doc-pipeline.ts) are untouched — the viz expansion is a
//         telling-the-story change, not a crypto change.
// 0.5.0 — Daniel 2026-05-31: 4 changes that move together —
//   (a) NEW props onStepBack/onStepForward. When provided, the side arrows
//       call them (so VizPipeline can step the actual auto-walk + continue
//       from there); when absent, fall back to the local manualStep
//       behaviour for callers that don't manage auto-walk themselves
//       (e.g. /prove-it/math live run).
//   (b) Side ◀/▶ arrows now show ALWAYS (not just cannedDemo) — replicates
//       the "arrow on side of viz instead of wasted-space buttons above"
//       nav Daniel asked to replicate on /prove-it/math from /viz/pipeline.
//   (c) Top ◀/▶ button strip + dot row removed (they're now the side
//       arrows). Speed/Pause/Live/Show-data controls preserved.
//   (d) Step indicator moved UP into the header row in `1.x / 8` format —
//       `1` = step number (1..8), `.x` = current sub-step within the
//       viz's phase array (e.g. Argon has 8 phases → x cycles 1..8 over
//       ~18s). Frees ~30px of vertical real estate so the data box
//       below the viz fits without scroll.
// 0.1.0 @date 2026-05-28
// ProveItVizPanel — the orchestration shell that sits ABOVE the existing
// Prove-It step list and renders the right viz for whatever step is
// currently active. Shared controls (speed slider + play/pause + "show
// data" toggle) drive every viz uniformly.
//
// SESSION 2 SCOPE: the shell + Shamir wired in for the "split" step. Other
// step vizzes will arrive in subsequent sessions (ArgonGridViz for "kdf",
// AeadEntropyViz for "enc", ManifestSigningViz for "manifest",
// RestoreLoopViz for "restore", RoundTripViz for "compare"). When a step
// has no viz yet, the shell shows a clean "coming next session" tile so
// the pipeline shape is visible from day one.
//
// Step keys come from TestProve.tsx's StepLog `key` field. Mapping:
//   "gen"      → BIP39 generation                       (placeholder)
//   "valid"    → BIP39 checksum verified                (placeholder)
//   "kdf"      → Argon2id master derived                (ArgonGridViz — next session)
//   "split"    → SLIP-39 Shamir split                   (ShamirPolyViz — DONE today)
//   "enc"      → Per-share AEAD encryption              (AeadEntropyViz — next session)
//   "manifest" → Manifest signed (Ed25519)              (ManifestSigningViz — next session)
//   "restore"  → Reconstructed from 3-of-5 shares       (RestoreLoopViz — next session)
//   "compare"  → Round-trip match ✓                     (RoundTripViz — next session)

import { useContext, useEffect, useRef, useState } from "react";
import { getCannedStepData } from "../lib/cannedStepData.js";
import { useOfflineState } from "../hooks/useOfflineState.js";
import { FullscreenSuppressContext, VizStepApiContext, type VizSubStepApi, type VizStepRegistry } from "./FullscreenAffordance.js";
import { offlineMoodFilter, OfflineFilterContext } from "./OfflineMoodOverlay.js";
import { SimAirgapContext, SimAirgapInlineBadge } from "./SimAirgapMood.js";
import { ShamirPolyViz, TOTAL_CYCLE_MS as SHAMIR_CYCLE, PHASES_COUNT as SHAMIR_PHASES } from "./ShamirPolyViz.js";
import { ArgonGridViz, TOTAL_CYCLE_MS as ARGON_CYCLE, PHASES_COUNT as ARGON_PHASES } from "./ArgonGridViz.js";
import { AeadEntropyViz, TOTAL_CYCLE_MS as AEAD_CYCLE, PHASES_COUNT as AEAD_PHASES } from "./AeadEntropyViz.js";
import { RestoreLoopViz, TOTAL_CYCLE_MS as RESTORE_CYCLE, PHASES_COUNT as RESTORE_PHASES } from "./RestoreLoopViz.js";
import { RoundTripViz, TOTAL_CYCLE_MS as ROUNDTRIP_CYCLE, PHASES_COUNT as ROUNDTRIP_PHASES } from "./RoundTripViz.js";
import { Bip39Viz, TOTAL_CYCLE_MS as BIP39_CYCLE, PHASES_COUNT as BIP39_PHASES } from "./Bip39Viz.js";
import { ManifestSigningViz, TOTAL_CYCLE_MS as MANIFEST_CYCLE, PHASES_COUNT as MANIFEST_PHASES } from "./ManifestSigningViz.js";
import { DistributeViz, TOTAL_CYCLE_MS as DISTRIBUTE_CYCLE, PHASES_COUNT as DISTRIBUTE_PHASES } from "./DistributeViz.js";
import { GatherViz, TOTAL_CYCLE_MS as GATHER_CYCLE, PHASES_COUNT as GATHER_PHASES } from "./GatherViz.js";
import { PublishManifestViz, TOTAL_CYCLE_MS as PUBLISH_MANIFEST_CYCLE, PHASES_COUNT as PUBLISH_MANIFEST_PHASES } from "./PublishManifestViz.js";
import { NokMintViz, TOTAL_CYCLE_MS as NOK_MINT_CYCLE, PHASES_COUNT as NOK_MINT_PHASES } from "./NokMintViz.js";

// 0.5.0 — per-step viz timing for sub-step (N.x / 8) computation.
const VIZ_TIMING: Partial<Record<string, { cycleMs: number; phases: number }>> = {
  gen:          { cycleMs: BIP39_CYCLE,    phases: BIP39_PHASES },
  valid:        { cycleMs: BIP39_CYCLE,    phases: BIP39_PHASES },
  kdf:          { cycleMs: ARGON_CYCLE,    phases: ARGON_PHASES },
  split:        { cycleMs: SHAMIR_CYCLE,   phases: SHAMIR_PHASES },
  enc:          { cycleMs: AEAD_CYCLE,     phases: AEAD_PHASES },
  wrap:         { cycleMs: AEAD_CYCLE,     phases: AEAD_PHASES },
  "content-enc":{ cycleMs: AEAD_CYCLE,     phases: AEAD_PHASES },
  manifest:           { cycleMs: MANIFEST_CYCLE,         phases: MANIFEST_PHASES },
  "publish-manifest": { cycleMs: PUBLISH_MANIFEST_CYCLE, phases: PUBLISH_MANIFEST_PHASES },
  "nok-mint":         { cycleMs: NOK_MINT_CYCLE,         phases: NOK_MINT_PHASES },
  distribute:         { cycleMs: DISTRIBUTE_CYCLE,       phases: DISTRIBUTE_PHASES },
  gather:             { cycleMs: GATHER_CYCLE,           phases: GATHER_PHASES },
  restore:      { cycleMs: RESTORE_CYCLE,  phases: RESTORE_PHASES },
  compare:      { cycleMs: ROUNDTRIP_CYCLE, phases: ROUNDTRIP_PHASES },
};

export type ProveItStepKey =
  | "gen" | "valid" | "kdf" | "split" | "enc" | "manifest"
  | "publish-manifest" | "nok-mint"
  | "distribute" | "gather"
  | "restore" | "compare"
  | "error" | "wrap" | "content-enc";

interface StepMeta {
  readonly title: string;
  readonly subtitle: string;
  readonly status: "live" | "queued";
}

const STEP_META: Record<ProveItStepKey, StepMeta> = {
  "gen":          { title: "Generate test seed",        subtitle: "128 bits of entropy → 12 BIP-39 words",            status: "live"   },
  "valid":        { title: "Verify BIP-39 checksum",     subtitle: "4 checksum bits validate the word list",            status: "live"   },
  "kdf":          { title: "Derive master key",          subtitle: "Argon2id (64 MiB memory-hard) → 32-byte master",    status: "live"   },
  "split":        { title: "Split into Shamir shares",   subtitle: "SLIP-39 over GF(256) — threshold-scheme math",      status: "live"   },
  "enc":          { title: "Wrap each share with AEAD",  subtitle: "XChaCha20-Poly1305 / AES-256-GCM (per-share mix)",  status: "live"   },
  "wrap":         { title: "Wrap content with AEAD",     subtitle: "Same cipher mix — content payload encryption",     status: "live"   },
  "content-enc":  { title: "Encrypt content blob",       subtitle: "AEAD over the bytes you put in",                   status: "live"   },
  "manifest":         { title: "Sign manifest",              subtitle: "SHA-256 over canonical JSON → Ed25519 signature",  status: "live"   },
  "publish-manifest": { title: "Publish signed manifest",    subtitle: "Online — upload manifest.json alongside the share-vaults", status: "live"   },
  "nok-mint":         { title: "Mint Next-of-Kin SBT",       subtitle: "Online — Polygon NoKLockSBT.mint(heir, vaultId, manifestHash)", status: "live"   },
  "distribute":   { title: "Publish encrypted shares",    subtitle: "Online — upload share-vaults to chosen storage URLs", status: "live"   },
  "gather":       { title: "Heir gathers K share-vaults", subtitle: "Online — heir downloads any K of N from storage",  status: "live"   },
  "restore":      { title: "Reconstruct from K shares",  subtitle: "Lagrange interpolation reverses the split",        status: "live"   },
  "compare":      { title: "Round-trip integrity",        subtitle: "Original bytes ≡ reconstructed bytes",             status: "live"   },
  "error":        { title: "Pipeline error",              subtitle: "See log entries below for details",                status: "queued" },
};

// Step order for manual navigation — matches the live pipeline sequence.
// 0.6.0 — distribute + gather inserted between manifest and restore. These
// are ONLINE moments in the otherwise-airgapped flow: the user goes online
// to upload the encrypted shares to the storage URLs they provided, and
// later the heir goes online to download K-of-N from those URLs before the
// rest of restore happens offline.
const STEP_ORDER: readonly ProveItStepKey[] = [
  "gen", "valid", "kdf", "split", "enc", "manifest",
  "publish-manifest", "nok-mint",
  "distribute", "gather",
  "restore", "compare",
];

/** A single line of step data — passed from TestProve so HexDataPanel
 *  can show real bytes the WebWorker computed (no synthetic data). */
export interface StepDataLine { readonly k: string; readonly v: string; }

export interface ProveItVizPanelProps {
  /** Current step key from the live demo. Falls back to "gen" when null. */
  readonly stepKey: ProveItStepKey | null;
  /** Whether the pipeline is actively running (controls auto-advance behaviour). */
  readonly running: boolean;
  /** Optional map of step → data lines, so "Show me the data" can render
   *  real bytes from the live run. Daniel's Option D: skip crypto-core
   *  per-iteration callbacks entirely — just surface the post-step bytes
   *  that TestProve already captures. */
  readonly stepData?: ReadonlyMap<string, ReadonlyArray<StepDataLine>>;
  /** Override default height. */
  readonly height?: number;
  /** "demo" (default) = panel shows illustrative bytes from the viz's
   *  own internal demo state. "your-run" = panel is paired with a live
   *  Prove run; the data-toggle surfaces YOUR run's bytes. Pill in the
   *  header reflects this so the user always knows what they're looking
   *  at. Daniel 2026-05-29. */
  readonly mode?: "demo" | "your-run";
  /** Step order for ◀/▶ navigation. Defaults to SEED order. BYTES kinds
   *  (letter/image/document) MUST pass the appropriate order or ◀ stays
   *  grey for steps that aren't in the default order (content-enc/wrap).
   *  Daniel 2026-05-30. */
  readonly stepOrder?: readonly ProveItStepKey[];
  /** Fired when the user clicks Live ↩ — parent should restart its
   *  auto-walk from the first step so the user sees the full sequence
   *  again instead of jumping to wherever Prove last landed. */
  readonly onLiveReset?: () => void;
  /** 0.4.0 — Daniel 2026-05-30: cannedDemo mode for /viz/pipeline:
   *    - "Show me the data" defaults ON
   *    - Speed select / Play-Pause / Live / prev-next / top step-dots
   *      all HIDDEN
   *    - Big ◀ / ▶ arrows render on the LEFT and RIGHT sides of the viz
   *      (vertically centred) instead of small buttons at the top
   *    - Header status reads "demo run" instead of "live run / browsing"
   *    - When stepData doesn't have an entry for the active step, the
   *      data panel renders illustrative bytes from the canned-data lib
   *      (`lib/cannedStepData.ts`) instead of "No data yet for step X".
   */
  readonly cannedDemo?: boolean;
  /** 0.5.0 — When provided, side ◀/▶ call these (so the parent's auto-walk
   *  steps + continues from there) instead of the local manualStep override.
   *  Use from VizPipeline (cannedDemo). When absent, side arrows fall back
   *  to local manualStep — fine for /prove-it/math where the parent doesn't
   *  manage an auto-walk timer. */
  readonly onStepBack?: () => void;
  readonly onStepForward?: () => void;
}

export function ProveItVizPanel({ stepKey, running, stepData, height = 420, mode = "demo", stepOrder, onLiveReset, onStepBack, onStepForward, cannedDemo = false }: ProveItVizPanelProps): JSX.Element {
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  // 0.4.0 — cannedDemo defaults showData to true.
  const [showData, setShowData] = useState(cannedDemo);
  // Manual step override — when the user clicks prev/next, the panel
  // shows THAT step's viz instead of the live-demo step. null = follow
  // live demo. The override resets when a new live step lands.
  const [manualStep, setManualStep] = useState<ProveItStepKey | null>(null);

  // When the live demo advances, drop any manual override so the panel
  // re-syncs with the live run.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // (deliberately only watching stepKey)
  // Note: this effect-style behaviour is fine without useEffect because
  // the comparison runs every render; we just check + clear.
  // To avoid stale state, derive the effective step at render time.

  const effectiveStep: ProveItStepKey = manualStep ?? stepKey ?? "gen";
  const meta = STEP_META[effectiveStep];

  // 0.3.0 — order is now either the prop (BYTES kinds pass content-enc/wrap)
  // or the default SEED order. Was hardcoded to STEP_ORDER which excluded
  // content-enc/wrap → on letter/image/document, ◀ stayed grey forever.
  const order: readonly ProveItStepKey[] = stepOrder ?? STEP_ORDER;
  const orderIdx = Math.max(0, order.indexOf(effectiveStep));
  // 0.5.2 — Viz step registry. Each viz registers its sub-phase API via
  // context on mount. SideArrows ◀/▶ try sub-phase first (within current
  // viz); only cross to prev/next viz when at phase boundary.
  const vizApiRef = useRef<VizSubStepApi | null>(null);
  const vizRegistry: VizStepRegistry = useRef<VizStepRegistry>({
    set: (api) => { vizApiRef.current = api; },
    get: () => vizApiRef.current,
  }).current;
  // 0.6.1 — Arrows ALWAYS live. Forward wraps within-viz first; at the
  // last sub-phase of the last viz it wraps last viz → first viz. Backward
  // mirrors. Daniel's "forward arrow should ALWAYS be usable" mental
  // model. canPrev/canNext kept as `true` so the SideArrows `disabled`
  // path is dead and the hover-opacity branches stay on the live path.
  const canPrev = true;
  const canNext = true;

  const goPrev = (): void => {
    const api = vizRegistry.get();
    if (api && api.getPhaseIdx() > 0) {
      api.jumpToPhase(api.getPhaseIdx() - 1);
      return;
    }
    // at phase-0 boundary → cross to previous viz
    if (onStepBack)    { onStepBack(); return; }
    // 0.6.1 — wrap when no parent callback: at orderIdx 0 wrap to last
    if (orderIdx > 0) { setManualStep(order[orderIdx - 1] ?? null); return; }
    const last = order[order.length - 1];
    if (last) setManualStep(last);
  };
  const goNext = (): void => {
    const api = vizRegistry.get();
    if (api && api.getPhaseIdx() < api.totalPhases - 1) {
      api.jumpToPhase(api.getPhaseIdx() + 1);
      return;
    }
    // at last-phase boundary → cross to next viz
    if (onStepForward) { onStepForward(); return; }
    // 0.6.1 — wrap when no parent callback: at last orderIdx wrap to first
    if (orderIdx < order.length - 1) { setManualStep(order[orderIdx + 1] ?? null); return; }
    const first = order[0];
    if (first) setManualStep(first);
  };

  // 0.5.0 — Sub-step counter ("1.x / 8" display). Resets when effectiveStep
  // changes. Ticks every 250ms to update without measurably re-rendering
  // child vizzes (they're imperatively driven).
  const stepStartRef = useRef<number>(typeof performance !== "undefined" ? performance.now() : 0);
  const [, forceTick] = useState(0);
  useEffect(() => {
    stepStartRef.current = typeof performance !== "undefined" ? performance.now() : 0;
  }, [effectiveStep]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.setInterval(() => forceTick((n) => (n + 1) % 1_000_000), 250);
    return () => window.clearInterval(t);
  }, []);
  const timing = VIZ_TIMING[effectiveStep];
  const subStep = timing
    ? Math.min(
        timing.phases,
        Math.floor(
          (((typeof performance !== "undefined" ? performance.now() : 0) - stepStartRef.current) % timing.cycleMs)
          / (timing.cycleMs / timing.phases),
        ) + 1,
      )
    : 1;

  // 0.5.0 — Daniel: "I want in the viz panel to indicate that the steps
  // being shown are happening when airgapped … shows them the local-only
  // data processing." Default tells the user the crypto is always local;
  // when airgap is engaged the badge brightens + says so explicitly.
  const offlineState = useOfflineState();
  const { airgapped } = offlineState;

  // 0.6.3 — Read SimAirgapContext directly so the slide title + mini
  // "step N.x/M" label can tint to match the AIRGAPPED-yellow / ONLINE-green
  // pill. We use `mounted` to detect whether a SimAirgapProvider is up the
  // tree at all — when it's not (e.g. /prove-it/math live-run route) we
  // leave the title in its default color rather than leaking an unwarranted
  // green pill state onto a route that doesn't participate in the sim.
  // Colors mirror the pill gradients exactly: yellow-500 (#eab308) for
  // AIRGAPPED, green-500 (#22c55e) for ONLINE. Subtitle stays default muted.
  const { enabled: simAirgapped, mounted: simAirgapMounted } = useContext(SimAirgapContext);
  const simColor: string | undefined = simAirgapMounted
    ? (simAirgapped ? "#eab308" : "#22c55e")
    : undefined;
  const followLive = (): void => {
    setManualStep(null);
    // 0.3.0 — Live ↩ now also asks the parent to restart its auto-walk
    // from the first step so the user sees the full sequence again.
    if (onLiveReset) onLiveReset();
  };

  return (
    // 0.5.1 — Suppress the per-viz Fullscreen button. ProveItMath (and
    // /viz/pipeline already) own a single page-level Fullscreen control;
    // per-viz buttons popped up at each viz's own top-right corner and
    // looked rogue when long captions wrapped. Single panel-wide
    // suppress → one button per page, predictable location.
    // 0.5.2 — Viz step registry: each viz inside registers its phase
    // API so ◀/▶ steps sub-phases first, crosses viz only at boundary.
    <VizStepApiContext.Provider value={vizRegistry}>
    <FullscreenSuppressContext.Provider value={true}>
    {/* 0.5.4 — Signal inner vizzes to SKIP their own mood filter; we apply
        it at panel-card level. Without this, the filter composes 2× and
        over-desaturates (CSS filter on parent + child stacks multiplicatively). */}
    <OfflineFilterContext.Provider value={{ skipInnerFilter: true }}>
    {/* 0.5.3 — Page-level offline mood. Daniel: "the entire prove it
        process … when it is offline or online regular colors when
        online". Filter on the WHOLE panel card (not just inside vizzes
        which already filter themselves). Plus a top-border accent + a
        small AIRGAPPED ribbon so the offline state is unmistakable. */}
    <div
      className="card"
      style={{
        position: "relative",
        overflow: "hidden",
        filter: offlineMoodFilter(offlineState),
        transition: "filter 600ms ease, border-color 300ms ease, box-shadow 300ms ease",
        borderColor: airgapped ? "rgba(251, 191, 36, 0.55)" : undefined,
        boxShadow: airgapped ? "0 0 0 1px rgba(251, 191, 36, 0.25), 0 0 40px -10px rgba(251, 191, 36, 0.20) inset" : undefined,
      }}>
      {/* Header — current step + status pill + new 1.x / 8 step indicator */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          {/* 0.6.2 — Single eyebrow row now also hosts the SimAirgap pill
              on the right via `ml-auto`. The pill (AIRGAPPED / ONLINE ·
              simulated) used to float top-right via position:absolute,
              visually disconnected from the "Local-only — runs in your
              browser" copy it was reinforcing. Now they sit side-by-side
              on the SAME row so the airgap story reads as one statement. */}
          <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold flex flex-wrap items-center gap-3">
            <span>
              Pipeline viz ·{" "}
              {cannedDemo ? "demo run" :
                running && manualStep === null ? "live run" :
                running && manualStep !== null ? "live run · browsing" :
                "idle"}
            </span>
            {/* 0.5.0 — step indicator moved UP into the header eyebrow,
                "N.x / total" format. N = step number, x = sub-step within
                this viz (tracked via VIZ_TIMING). Frees a row of vertical
                space below for the data box.
                0.6.3 — The two numeric/key spans tint to the SimAirgap
                color when a SimAirgapProvider is mounted (yellow when
                airgapped, green when online). The surrounding "step"
                word, slash, and dot separator stay muted so the color
                signal lands on the values themselves. When no provider
                is mounted, both spans fall back to accent-cyan as
                before — no behavior change for /prove-it/math. */}
            <span className="text-text-muted font-mono normal-case tracking-normal">
              step{" "}
              <span
                className={simColor ? "" : "text-accent-cyan"}
                style={simColor ? { color: simColor } : undefined}
              >
                {orderIdx + 1}.{subStep}
              </span>
              {" "}/ {order.length}
              <span className="opacity-50 mx-1.5">·</span>
              <span
                className={simColor ? "" : "text-accent-cyan"}
                style={simColor ? { color: simColor } : undefined}
              >
                {effectiveStep}
              </span>
            </span>
            {/* 0.5.0 — local-only / airgapped indicator. Always present
                because the crypto IS always local; brightens to amber +
                pulse when the airgap firewall is actively engaged. */}
            <span
              className={
                airgapped
                  ? "inline-flex items-center gap-1 px-1.5 py-0.5 rounded normal-case tracking-normal text-[10px] font-mono bg-amber-700/30 text-amber-200 border border-amber-500/40"
                  : "inline-flex items-center gap-1 normal-case tracking-normal text-[10px] font-mono text-text-muted/80"
              }
              title={airgapped
                ? "Airgap firewall engaged — every browser exfil channel is blocked. The pipeline below is running fully offline."
                : "All crypto runs in your browser. Nothing here ever touches our server."}
            >
              <span aria-hidden="true">{airgapped ? "⚡" : "🔒"}</span>
              {airgapped ? "AIRGAPPED · running offline" : "Local-only · runs in your browser"}
            </span>
            {/* 0.6.2 — SimAirgap (simulated) pill: now inline on the same
                row, pushed right via ml-auto. Reads SimAirgapContext to
                decide AIRGAPPED-yellow vs ONLINE-green. SimAirgapInlineBadge
                no-ops when no SimAirgapProvider is mounted, so /prove-it/math
                (which doesn't simulate) renders nothing here. */}
            <span className="ml-auto inline-flex items-center">
              <SimAirgapInlineBadge />
            </span>
          </div>
          {/* 0.6.3 — Slide title tinted per SimAirgap state. Yellow when
              the simulated airgap is engaged for this step; green when the
              step requires network. Subtitle stays muted-white below so the
              color signal lives on the heading alone. */}
          <h3
            className="text-xl font-bold font-display mt-0.5"
            style={simColor ? { color: simColor } : undefined}
          >
            {meta.title}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">{meta.subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {/* 0.2.0 — Demo / Your-run mode pill. Tells the user what
              they're looking at:
                demo     = the viz is showing its own illustrative bytes
                your-run = the panel is paired with a Prove run; toggle
                           "Show me the data" to see YOUR bytes
              The pill flips visual state when "Show me the data" is on
              in your-run mode, so the data state is unambiguous. */}
          {mode === "your-run" && showData ? (
            <span className="tier-badge bg-emerald-700/40 text-emerald-300 whitespace-nowrap" title="The data shown is from the Prove run you just executed">
              Your run · real bytes
            </span>
          ) : mode === "your-run" ? (
            <span className="tier-badge bg-accent-teal/20 text-accent-teal whitespace-nowrap" title="The animation shows the same algorithms running on illustrative bytes. Toggle Show me the data to see YOUR run's actual bytes.">
              Demo · same algorithms, illustrative bytes
            </span>
          ) : (
            <span className="tier-badge bg-accent-teal/20 text-accent-teal whitespace-nowrap">
              Demonstration
            </span>
          )}
          <span
            className={
              meta.status === "live"
                ? "tier-badge bg-bg-surface text-text-muted text-[10px]"
                : "tier-badge bg-bg-surface text-text-muted text-[10px]"
            }
          >
            {meta.status === "live" ? "live viz" : "viz next session"}
          </span>
        </div>
      </div>

      {/* Shared controls — drive every viz uniformly. Daniel 0.2.0: added
          ◀ / ▶ step navigation so the user can browse any step's viz at
          their own pace, plus a "Live" button to re-sync with the running
          demo (clears manual override). 0.4.0: cannedDemo hides the whole
          control bar — side ◀▶ arrows + arrow keys handle navigation on
          that page. */}
      {/* 0.5.0 — Controls strip. ◀/▶ moved to side arrows (always shown).
          Dot row removed (step indicator is in the header eyebrow above).
          Strip is hidden entirely in cannedDemo mode (no controls there). */}
      {!cannedDemo && (
      <div className="flex flex-wrap items-center gap-3 mb-4 pb-3 border-b border-bg-surface/60">
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          className="text-xs font-mono px-3 py-1.5 rounded border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10"
        >
          {paused ? "▶ Play" : "❚❚ Pause"}
        </button>
        {manualStep !== null && (
          <button
            type="button"
            onClick={followLive}
            title="Re-sync with the live demo"
            className="text-xs font-mono px-2 py-1.5 rounded border border-accent-green/40 text-accent-green hover:bg-accent-green/10"
          >
            Live ↩
          </button>
        )}
        <label className="flex items-center gap-2 text-xs text-text-muted">
          Speed
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="bg-bg-deepest border border-bg-surface rounded px-2 py-1 text-xs text-text-on-dark"
          >
            <option value="0.25">0.25×</option>
            <option value="0.5">0.5×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="5">5×</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={showData}
            onChange={(e) => setShowData(e.target.checked)}
            className="accent-accent-cyan"
          />
          <span>Show me the data</span>
        </label>
      </div>
      )}

      {/* Viz dispatch — renders the registered viz for this step, or
          the real-byte hex data panel when "Show me the data" is on. */}
      {/* 0.3.0 — Show-data now STACKS viz + data instead of toggling.
          Both render together and advance in lockstep as effectiveStep
          changes. Viz height is roughly 60% of the panel when stacked
          so the data panel below has room to breathe. Daniel 2026-05-30
          ("when selected i see a slightly smaller viz container and below
          it the relevant data for that exact step"). */}
      {showData ? (
        <div className="space-y-3 relative">
          <div className="relative">
            <VizDispatch stepKey={effectiveStep} speed={speed} paused={paused} height={Math.round(height * 0.6)} cannedDemo={cannedDemo} />
            <SideArrows onPrev={goPrev} onNext={goNext} canPrev={canPrev} canNext={canNext} />
          </div>
          <HexDataPanel
            stepKey={effectiveStep}
            lines={(stepData?.get(effectiveStep) ?? null) || (cannedDemo ? getCannedStepData(effectiveStep) : null)}
            height={Math.round(height * 0.55)}
            cannedDemo={cannedDemo}
          />
        </div>
      ) : (
        <div className="relative">
          <VizDispatch stepKey={effectiveStep} speed={speed} paused={paused} height={height} cannedDemo={cannedDemo} />
          <SideArrows onPrev={goPrev} onNext={goNext} canPrev={canPrev} canNext={canNext} />
        </div>
      )}
    </div>
    </OfflineFilterContext.Provider>
    </FullscreenSuppressContext.Provider>
    </VizStepApiContext.Provider>
  );
}

function VizDispatch({
  stepKey, speed, paused, height, cannedDemo = false,
}: {
  readonly stepKey: ProveItStepKey;
  readonly speed: number;
  readonly paused: boolean;
  readonly height: number;
  readonly cannedDemo?: boolean;
}): JSX.Element {
  // Paused = run at near-zero speed (effectively freezes the animation
  // without re-architecting each viz to accept a paused prop).
  const effSpeed = paused ? 0.0001 : speed;
  // 0.6.4 — Daniel 2026-06-02: in cannedDemo (pipeline-walker) mode, pass
  // loop={false} to every viz so the inner cycle FREEZES on its final HOLD
  // frame instead of wrapping back to phase 0 during the 600ms settle pause
  // that sits between cycle-end and the dispatcher's swap to the next viz.
  // Bug Daniel reported: "in full end to end viz, at end of shamir .. the
  // last slide seems to the first again then it switches to next viz (i see
  // the first screen 'your secret key lives here' after the full shamir
  // run)". Root cause: the inner viz auto-looped back to phase 0 (Shamir's
  // INTRO renders "Your secret key lives here") before VizPipeline's
  // WALK_DWELL timer fired and swapped to the next step. With loop=false
  // each viz's tick loop already freezes at HOLD when elapsed >= cycle,
  // so the user sees the END frame for the 600ms settle, not the START
  // frame of a new cycle. Live-mode (/prove-it/math, cannedDemo=false)
  // still loops as before.
  const loopInner = !cannedDemo;
  // 0.5.1 — `key={stepKey}` on EVERY viz forces a fresh mount when the
  // step changes. Without this, multi-step vizzes (BIP-39 owns both
  // gen+valid; AEAD owns enc+wrap+content-enc) would keep their internal
  // cycle running across step boundaries — the user would land mid-cycle
  // on the new step, sometimes on a blank phase, sometimes on the wrong
  // animation for the title. Fresh mount = cycle starts at phase 0,
  // animation matches the title from the first frame.
  if (stepKey === "gen" || stepKey === "valid") {
    return <Bip39Viz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" height={height} />;
  }
  if (stepKey === "kdf") {
    return <ArgonGridViz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" height={height} />;
  }
  if (stepKey === "split") {
    return <ShamirPolyViz key={stepKey} secret={73} n={5} k={3} autoPlay loop={loopInner} speed={effSpeed} contentKind="seed" showCaptions showLegend showControls={false} showPresetPicker={false} chromeless theme="cyan" height={height} />;
  }
  if (stepKey === "enc" || stepKey === "wrap" || stepKey === "content-enc") {
    return <AeadEntropyViz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" height={height} />;
  }
  if (stepKey === "manifest") {
    return <ManifestSigningViz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" height={height} />;
  }
  if (stepKey === "publish-manifest") {
    return <PublishManifestViz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" height={height} />;
  }
  if (stepKey === "nok-mint") {
    return <NokMintViz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" height={height} />;
  }
  if (stepKey === "distribute") {
    return <DistributeViz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" n={5} m={5} height={height} />;
  }
  if (stepKey === "gather") {
    return <GatherViz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" n={5} k={3} height={height} />;
  }
  if (stepKey === "restore") {
    return <RestoreLoopViz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" n={5} k={3} height={height} />;
  }
  if (stepKey === "compare") {
    return <RoundTripViz key={stepKey} autoPlay loop={loopInner} speed={effSpeed} showCaptions showControls={false} chromeless theme="cyan" height={height} />;
  }
  return <ComingSoonPlaceholder key={stepKey} stepKey={stepKey} height={height} />;
}

function ComingSoonPlaceholder({
  stepKey, height,
}: { readonly stepKey: ProveItStepKey; readonly height: number }): JSX.Element {
  const meta = STEP_META[stepKey];
  return (
    <div
      className="rounded-lg border border-dashed border-bg-surface bg-bg-deepest/40 flex flex-col items-center justify-center text-center px-6"
      style={{ height }}
    >
      <div className="text-3xl mb-3 opacity-50">◌</div>
      <div className="text-text-on-dark/90 font-display font-bold text-base mb-1">
        {meta.title}
      </div>
      <div className="text-xs text-text-muted max-w-md">
        {meta.subtitle}
      </div>
      <div className="text-[11px] text-accent-cyan/80 mt-4 font-mono uppercase tracking-wider">
        Animated viz lands next session
      </div>
    </div>
  );
}

// HexDataPanel — Daniel's Option D (2026-05-28): no crypto-core changes,
// no WASM swap. Just surface the REAL bytes that TestProve already
// captures in each step's `lines` field. Hex / mono / scrollable. If no
// data for this step yet (live demo hasn't reached it), show a calm
// placeholder. The viz teaches; this panel proves.
function HexDataPanel({
  stepKey, lines, height, cannedDemo = false,
}: {
  readonly stepKey: ProveItStepKey;
  readonly lines: ReadonlyArray<StepDataLine> | null;
  readonly height: number;
  readonly cannedDemo?: boolean;
}): JSX.Element {
  if (!lines || lines.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-bg-surface bg-bg-deepest/40 flex flex-col items-center justify-center text-center px-6 font-mono text-text-muted"
        style={{ height }}
      >
        <div className="text-xs uppercase tracking-wider mb-2 text-accent-cyan">show me the data</div>
        <div className="text-sm">
          No data yet for step <span className="text-accent-cyan">{stepKey}</span> — run the demo to populate.
        </div>
        <div className="text-[11px] mt-3 opacity-70">Once the live pipeline reaches this step, its actual bytes appear here.</div>
      </div>
    );
  }
  // 0.4.0 — In cannedDemo mode the label + footer change to make clear the
  // bytes are illustrative, not from a live run. Same data shape; honest
  // framing per the "Demo · illustrative bytes" pill in the header.
  return (
    <div
      className="rounded-lg border border-bg-surface bg-bg-deepest/60 px-4 py-3 font-mono text-xs overflow-y-auto"
      style={{ height }}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-accent-cyan mb-2 font-bold">
        Step {stepKey} — {cannedDemo ? "illustrative bytes" : "live WebWorker output"}
      </div>
      <table className="w-full">
        <tbody>
          {lines.map((ln, i) => (
            <tr key={`${ln.k}-${i}`} className="border-b border-bg-surface/30 last:border-0">
              <td className="py-1 pr-3 text-text-muted whitespace-nowrap align-top">{ln.k}</td>
              <td className="py-1 text-text-on-dark/90 break-all">{ln.v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-[10px] text-text-muted mt-3 opacity-70">
        {cannedDemo
          ? "Illustrative bytes. Same shape and same algorithms as the live pipeline at /prove-it/math — run that to see your own real bytes."
          : "These are the bytes the crypto-core computed on YOUR device. No synthetic data, no calibrated guess — bit-accurate to the live run."}
      </div>
    </div>
  );
}

// 0.4.0 — Big ◀ / ▶ overlay arrows on the left/right edges of the viz,
// vertically centred. Used by cannedDemo mode (replaces the top dot row).
// Translucent until hovered so they don't distract from the viz at rest.
function SideArrows({
  onPrev, onNext, canPrev, canNext,
}: {
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly canPrev: boolean;
  readonly canNext: boolean;
}): JSX.Element {
  const base: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 48,
    height: 64,
    borderRadius: 8,
    background: "rgba(2, 6, 23, 0.55)",
    color: "#22d3ee",
    border: "1px solid rgba(34, 211, 238, 0.35)",
    fontSize: 22,
    fontFamily: "ui-monospace, monospace",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.55,
    transition: "opacity 200ms ease",
    zIndex: 15,
  };
  const disabled: React.CSSProperties = { opacity: 0.18, cursor: "not-allowed" };
  return (
    <>
      <button
        type="button"
        aria-label="Previous step"
        title="Previous step (←)"
        onClick={onPrev}
        disabled={!canPrev}
        onMouseEnter={(e) => { (e.currentTarget.style.opacity = canPrev ? "0.95" : "0.18"); }}
        onMouseLeave={(e) => { (e.currentTarget.style.opacity = canPrev ? "0.55" : "0.18"); }}
        style={{ ...base, left: 12, ...(canPrev ? {} : disabled) }}
      >
        ◀
      </button>
      <button
        type="button"
        aria-label="Next step"
        title="Next step (→)"
        onClick={onNext}
        disabled={!canNext}
        onMouseEnter={(e) => { (e.currentTarget.style.opacity = canNext ? "0.95" : "0.18"); }}
        onMouseLeave={(e) => { (e.currentTarget.style.opacity = canNext ? "0.55" : "0.18"); }}
        style={{ ...base, right: 12, ...(canNext ? {} : disabled) }}
      >
        ▶
      </button>
    </>
  );
}
