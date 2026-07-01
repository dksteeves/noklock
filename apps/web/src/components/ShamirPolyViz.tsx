// @version 0.5.0 @date 2026-06-01
// 0.5.0 — INTRO phase now renders content — no more empty SVG blank during
//         INTRO sub-phase. Daniel: "see these are all blank and as it
//         plays they change to next slide so blanks need something dont
//         they". MP4 captures showed several seconds of dead dark canvas
//         before the secret card faded in. Fix: render an "expectations
//         skeleton" during INTRO — the FINAL polynomial curve + share
//         vault positions ghosted to ~22% opacity, fading down to 0 as
//         the phase progresses (so it transitions smoothly into the real
//         DRAW phase that follows). Gives the viewer a "where this is
//         going" preview that matches the INTRO body text ("We'll hide
//         it inside a curve..."). Pure additive — no existing behaviour
//         changed; intro skeleton is invisible from DRAW onward.
// 0.4.7 — Tier-2 WAAPI on bg particles. The 18-circle bg drift was the
//         largest remaining per-frame React render cost (3 attrs ×
//         18 circles × 30fps = ~1.6 k attr updates/s). Replaced with
//         Element.animate() — one looping animation per circle, runs on
//         the compositor thread, zero React re-renders. Density bumped
//         18 → 28 now that drawing is free. transform-origin: 0 0 +
//         transformBox: fill-box pins the translate() to absolute SVG
//         coordinates. Falls back to static circles if WAAPI is missing.
//         OS prefers-reduced-motion suppresses the wiring entirely.
// 0.4.6 — Daniel: "by the time i get to the shamir it might be playing
//         and it might be half way thru .. a user scrolling it for the
//         first time should see it start to play fresh from 0 not from
//         whereber it happens to be". Added a one-shot IntersectionObserver
//         on the viz container: the first time the viz scrolls ≥40% into
//         view it resets the cycle clock + variant 0 so the user sees
//         INTRO → DRAW → … from frame 0. After that, normal looping.
// 0.4.0 — Daniel: "5 of 9 goes too far right .. should be essentially
//         centered. text still too small, sometimes overwritten by the
//         visual. grey for alternative polynomials too dim". Tightening:
//           * DYNAMIC x-axis (xMaxVal = n + 1) — shares always fill the
//             canvas width regardless of N. 2-of-3 spreads wide, 5-of-9
//             stays in frame. Coefficient bounds + projectX both follow.
//           * Captions MOVED OUT OF SVG into HTML above the viz. No more
//             overlap with curves at high y-values. Native font scaling
//             via tailwind so sizes match the rest of the chrome.
//           * Vault content (seed words / doc glyphs) bumped 11→15px and
//             SHARE labels bumped 10→13px — Daniel called the seed words
//             "really sexy" on the Architecture page; same component now
//             so /shamir has it too.
//           * Alt polynomial dashes: brighter (cyan-200 #a5f3fc /
//             emerald-200 #a7f3d0 — theme-tinted same family as the main
//             curve) + strokeWidth 3 + opacity ramp 0.6-0.9 + longer
//             dashes. Now actually visible against the grid.
//           * Axis labels bumped 15→18px.
// 0.3.0 — Daniel: "text too small, dotted lines near impossible to see,
//         the 1-8 step labels are tech not user language, scatter the K
//         picks across N for proper randomness, maybe show user-selectable
//         3/5/7/9 configurations". Tightening pass:
//           * BIG readable in-SVG captions (title 32px, body 17px).
//           * Alt-curve dashes brightened (slate-400, strokeWidth 2.5,
//             opacity ~0.7 — were invisible against the dark grid).
//           * Phase titles rewritten user-first ("Your secret key starts
//             here") with the tech-precise wording as a sub-line for the
//             technical reader. Same 8 phases — clearer story per phase.
//           * Scattered share picks for ONE_FAN / KMINUS_FAN / LOCK so the
//             "ANY K, not the first K" property reads visually. Uses
//             evenly-spaced indices across [0..N-1] — for N=7,K=4 the
//             reveal highlights shares 1, 3, 5, 7 (not 1-4 in a row).
//           * "?" rain bigger + brighter for visibility.
//           * NEW: inline preset picker (2-of-3 / 3-of-5 / 4-of-7 / 5-of-9)
//             above the viz so the user can flip N/K and immediately see
//             the math behave consistently. Toggleable via showPresetPicker.
// 0.2.0 — Vault-card shares, secret card, particles, shockwave, controls,
//         phase dots, fwd/back.
// 0.1.0 — initial SVG phase-state-machine with isometric look.

import { useEffect, useRef, useState, useCallback } from "react";
import {
  evalPoly, lagrangeWithSecret, makePolynomial, pickScatteredIndices, sampleCurve, shareValues,
  NK_PRESETS, type Point,
} from "../lib/shamirPoly.js";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type ShamirPhase =
  | "INTRO" | "DRAW" | "EMIT" | "HIDE" | "ONE_FAN" | "KMINUS_FAN" | "LOCK" | "HOLD";

export type ShamirContentKind = "seed" | "letter" | "image" | "document" | "noise";

interface PhaseDef {
  readonly id: ShamirPhase;
  readonly ms: number;
  /** User-friendly headline that reads at a glance. */
  readonly title: string;
  /** What's actually happening, in plain English first then a tech aside. */
  readonly body: (n: number, k: number) => string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO",      ms: 1800,
    title: "Your secret key lives here",
    body: () => "Imagine your master key as a single point at x=0 on a graph. We'll hide it inside a curve that nobody else can guess from the pieces alone." },
  { id: "DRAW",       ms: 2400,
    title: "Hide the secret inside a random curve",
    body: (_n, k) => `We invent a smooth curve that just happens to pass through your secret. The wiggle is random — degree ${k - 1} — and looks like any other curve to an outsider.` },
  { id: "EMIT",       ms: 2400,
    title: "Carve the curve into share-vaults",
    body: (n) => `Sample ${n} different points along the curve. Each point becomes one share — a sealed vault holding part of the key's fingerprint, ready to be stored separately.` },
  { id: "HIDE",       ms: 1400,
    title: "Throw away the curve — keep only the vaults",
    body: (n) => `The curve is erased. Your secret vanishes with it. All that's left is ${n} share-vaults, sent to ${n} separate places — only you decide where.` },
  { id: "ONE_FAN",    ms: 2800,
    title: "1 share alone? The secret is unknowable",
    body: () => "A thief who steals one share has one dot on a graph. Endless curves pass through it — your secret could be ANY value at x=0. There is nothing to crack, mathematically." },
  { id: "KMINUS_FAN", ms: 2800,
    title: "Just under threshold? Still unknowable",
    body: (_n, k) => `Even with ${k - 1} shares, the curve isn't pinned down. The family of possibilities shrinks but never collapses — your secret stays completely hidden.` },
  { id: "LOCK",       ms: 2800,
    title: "Add the K-th share — the secret returns",
    body: (n, k) => `Exactly ${k} shares uniquely identify THE curve. (Any ${k} of the ${n} — not just the first few.) Lagrange interpolation rebuilds it, your secret reappears at x=0.` },
  { id: "HOLD",       ms: 2000,
    title: "This is math, not encryption",
    body: (_n, k) => `Below ${k} shares: zero information about the secret. Not "hard to crack" — provably impossible. Quantum-immune by construction. Same proof that protects nuclear-launch codes.` },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface ShamirPolyVizProps {
  readonly secret?: number;
  readonly n?: number;
  readonly k?: number;
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly speed?: number;
  readonly contentKind?: ShamirContentKind;
  readonly showCaptions?: boolean;
  readonly showLegend?: boolean;
  readonly showControls?: boolean;
  readonly showPresetPicker?: boolean; // 2-of-3 / 3-of-5 / 4-of-7 / 5-of-9 chooser
  readonly showFullscreenButton?: boolean; // top-right ⤢ Fullscreen toggle (default true)
  readonly chromeless?: boolean; // for showcase: no outer padding/bg
  readonly theme?: "cyan" | "emerald";
  readonly height?: number;
}

interface AnimState {
  readonly phase: ShamirPhase;
  readonly phaseProgress: number;
  readonly cycleProgress: number;
  readonly cycleMs: number;
}

interface ThemeColors {
  readonly secret: string;
  readonly secret2: string;
  readonly curve: string;
  readonly curve2: string;
  readonly share: string;
  readonly shareDim: string;
  readonly altCurve: string;
  readonly glow: string;
  readonly text: string;
  readonly muted: string;
  readonly bg: string;
  readonly bg2: string;
  readonly grid: string;
  readonly particle: string;
}

const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan: {
    secret:    "#22d3ee",
    secret2:   "#67e8f9",
    curve:     "#06b6d4",
    curve2:    "#22d3ee",
    share:     "#67e8f9",
    shareDim:  "#0e7490",
    altCurve:  "#475569",
    glow:      "#22d3ee",
    text:      "#e2e8f0",
    muted:     "#94a3b8",
    bg:        "#020617",
    bg2:       "#0b1220",
    grid:      "#1e293b",
    particle:  "#22d3ee",
  },
  emerald: {
    secret:    "#10b981",
    secret2:   "#6ee7b7",
    curve:     "#059669",
    curve2:    "#10b981",
    share:     "#6ee7b7",
    shareDim:  "#065f46",
    altCurve:  "#475569",
    glow:      "#10b981",
    text:      "#e2e8f0",
    muted:     "#94a3b8",
    bg:        "#020a05",
    bg2:       "#06120c",
    grid:      "#14241c",
    particle:  "#10b981",
  },
};

const VB_W = 1200;
const VB_H = 600;     // 680 was tall; captions now in HTML so reclaim space
const PAD_X = 110;
const PAD_Y_TOP = 60;  // 100 was for in-SVG title; captions now in HTML
const PAD_Y_BOT = 90;
const X_MIN_VAL = -0.5;
const Y_MIN_VAL = -15;
const Y_MAX_VAL = 115;

function projectY(y: number): number {
  return (VB_H - PAD_Y_BOT) - ((VB_H - PAD_Y_TOP - PAD_Y_BOT) * (y - Y_MIN_VAL)) / (Y_MAX_VAL - Y_MIN_VAL);
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }

// Hexagonal share vault path centered at (cx, cy), width w, height h.
function hexPath(cx: number, cy: number, w: number, h: number): string {
  const w2 = w / 2, h2 = h / 2, dx = w * 0.25;
  return `M ${cx - w2 + dx} ${cy - h2} L ${cx + w2 - dx} ${cy - h2} L ${cx + w2} ${cy} L ${cx + w2 - dx} ${cy + h2} L ${cx - w2 + dx} ${cy + h2} L ${cx - w2} ${cy} Z`;
}

// A handful of seed words + doc/image markers used as visible "content"
// inside the share vaults during EMIT and LOCK — the "going wild" detail
// Daniel asked for. Real BIP-39 words from the standard wordlist.
const SEED_WORDS = ["abandon", "ability", "absorb", "abstract", "accept", "across", "actor", "actual", "adapt", "advance", "afford", "agent", "aisle", "album", "alpha", "amazing", "ancient", "angle", "anchor", "answer"];
const DOC_FRAGMENTS = ["▤", "▦", "▩", "▥"];
const IMAGE_FRAGMENTS = ["◐", "◑", "◒", "◓", "◔", "◕"];

function vaultContentText(kind: ShamirContentKind, idx: number, slot: number): string {
  if (kind === "seed") {
    return SEED_WORDS[(idx * 3 + slot) % SEED_WORDS.length] ?? "abandon";
  }
  if (kind === "document") return DOC_FRAGMENTS[slot % DOC_FRAGMENTS.length] ?? "▤";
  if (kind === "image") return IMAGE_FRAGMENTS[slot % IMAGE_FRAGMENTS.length] ?? "◐";
  if (kind === "letter") return "█▓"[(idx + slot) % 2] ?? "█";
  return "01"[(idx + slot) % 2] ?? "0"; // noise: binary look
}

// Background drifting particles — generated once per mount, hand-positioned
// across the canvas with slow x/y drift + opacity pulse. 0.4.7: animation
// now driven by Web Animations API (compositor thread) instead of React
// state — bg-particle attrs no longer re-render with the main RAF tick.
interface BgParticle {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly speed: number;
  readonly phaseOffset: number;
}
function makeBgParticles(): readonly BgParticle[] {
  // 0.4.7: bumped 18 → 28. WAAPI runs on the compositor thread (zero React
  // cost), so we can afford density again — visual richness restored.
  const count = 28;
  const arr: BgParticle[] = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: (i * 137.5) % VB_W,
      y: ((i * 89.3) + (i * i * 0.4)) % VB_H,
      r: 0.8 + ((i * 0.7) % 1.8),
      speed: 0.0006 + ((i * 0.0001) % 0.0009),
      phaseOffset: (i * 0.41) % 6.28,
    });
  }
  return arr;
}

export function ShamirPolyViz({
  secret = 73,
  n: nProp = 5,
  k: kProp = 3,
  autoPlay = true,
  loop = true,
  speed = 1,
  contentKind = "seed",
  showCaptions = true,
  showLegend = true,
  showControls = true,
  showPresetPicker = false,
  showFullscreenButton = true,
  chromeless = false,
  theme = "cyan",
  height = 520,
}: ShamirPolyVizProps): JSX.Element {
  const t = THEMES[theme];

  // Internal (n, k) state so the inline preset picker can flip it. Defaults
  // track the props; if the parent re-renders with different props we re-sync.
  const [nkConfig, setNkConfig] = useState({ n: nProp, k: kProp });
  useEffect(() => { setNkConfig({ n: nProp, k: kProp }); }, [nProp, kProp]);
  const { n, k } = nkConfig;

  // 0.4.8 — reducedMotion no longer kills the main animation. The
  // animation IS the lesson for these vizzes; freezing at frame 0 of
  // INTRO leaves a blank viz with only the static halo + axes — which
  // is what Daniel actually hit on the deploy. reducedMotion now only
  // suppresses the decorative drift/sparkles (bg particles WAAPI below).
  const reducedMotion = useReducedMotion();
  const effectiveAutoPlay = autoPlay;

  // Variant index — increments every cycle wrap so each loop iteration
  // draws a DIFFERENT random polynomial (Daniel: "random curves never
  // exactly random in the widget .. each repeats the same each time").
  // Resets to 0 whenever (n, k) flip via the preset picker.
  const [variant, setVariant] = useState(0);
  const lastCycleMsRef = useRef(0);

  // Dynamic x-axis — shares always fill the canvas width regardless of N.
  // 2-of-3 spreads wide, 5-of-9 stays in frame. Coefficient bounds + drawn
  // curve range follow this same xMaxVal so the curve stays in container.
  const xMaxVal = n + 1;

  const projectX = (x: number): number =>
    PAD_X + ((VB_W - PAD_X * 2) * (x - X_MIN_VAL)) / (xMaxVal - X_MIN_VAL);

  const pointsToPath = (samples: readonly Point[]): string => {
    if (samples.length === 0) return "";
    const first = samples[0];
    if (!first) return "";
    let d = `M ${projectX(first[0]).toFixed(2)} ${projectY(first[1]).toFixed(2)}`;
    for (let i = 1; i < samples.length; i++) {
      const p = samples[i];
      if (!p) continue;
      d += ` L ${projectX(p[0]).toFixed(2)} ${projectY(p[1]).toFixed(2)}`;
    }
    return d;
  };

  const coeffs = makePolynomial(secret, k, n, variant, xMaxVal);
  const shares = shareValues(coeffs, n);
  const bgParticles = useRef<readonly BgParticle[]>(makeBgParticles());

  // Scattered indices for the reveal phases — picked from [0..n-1] so the
  // viz shows "ANY K, not the first K". Recomputed when n/k change.
  const fanOneIdx = pickScatteredIndices(n, 1);
  const fanKminusIdx = pickScatteredIndices(n, k - 1);
  const lockIdx = pickScatteredIndices(n, k);

  const [anim, setAnim] = useState<AnimState>({ phase: "INTRO", phaseProgress: 0, cycleProgress: 0, cycleMs: 0 });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false); // hover-to-pause
  const [manualMs, setManualMs] = useState<number | null>(null); // when user scrubs

  // 0.4.5 — paused / hovered routed via refs so they DON'T trigger the
  // useEffect to re-run when they flip. Previously every hover / pause
  // click cancelled the RAF and reset startedAtRef = 0, so the animation
  // restarted from frame 0 on every interaction — making controls feel
  // dead and the cycle play "sporadic" / "incomplete" when the user
  // scrolled near the viz and triggered a hover. The tick reads the
  // latest values from refs on each call without restarting the loop.
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;
  const manualMsRef = useRef(manualMs);
  manualMsRef.current = manualMs;

  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const hasSkippedIntroRef = useRef(false);
  const pausedAtRef = useRef<number>(0);
  const pauseAccumRef = useRef<number>(0);

  // Reset the loop clock whenever n/k flip — the new polynomial deserves a fresh story.
  useEffect(() => {
    startedAtRef.current = 0;
    pausedAtRef.current = 0;
    pauseAccumRef.current = 0;
    lastCycleMsRef.current = 0;
    setManualMs(null);
    setPaused(false);
    setVariant(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, k]);

  // Detect cycle wrap (cycleMs jumps from high back near 0) and bump variant
  // → next loop iteration draws a different polynomial. Skipped while
  // manually scrubbing so back/forward step buttons don't surprise-mutate.
  useEffect(() => {
    if (manualMs !== null) return;
    if (lastCycleMsRef.current > TOTAL_CYCLE_MS * 0.7 && anim.cycleMs < TOTAL_CYCLE_MS * 0.3) {
      setVariant((v) => (v + 1) % 7); // cycle through 7 distinct curves
    }
    lastCycleMsRef.current = anim.cycleMs;
  }, [anim.cycleMs, manualMs]);

  // Compute phase + progress from absolute cycle ms.
  const computeFromMs = useCallback((cycleMs: number): AnimState => {
    const wrapped = ((cycleMs % TOTAL_CYCLE_MS) + TOTAL_CYCLE_MS) % TOTAL_CYCLE_MS;
    let acc = 0;
    for (const p of PHASES) {
      if (wrapped < acc + p.ms) {
        return {
          phase: p.id,
          phaseProgress: easeInOut(Math.max(0, Math.min(1, (wrapped - acc) / p.ms))),
          cycleProgress: wrapped / TOTAL_CYCLE_MS,
          cycleMs: wrapped,
        };
      }
      acc += p.ms;
    }
    return { phase: "INTRO", phaseProgress: 0, cycleProgress: 0, cycleMs: 0 };
  }, []);

  // 0.4.3 perf: RAF runs at full 60fps for smooth timing math, but React
  // setAnim is throttled to 30fps (half the reconciliation cost). Daniel
  // reported "v v slow to play in some cases" — every cell / particle /
  // share re-rendered at 60fps was the bottleneck. Visual delta at 30fps
  // vs 60fps is imperceptible.
  const lastSetAtRef = useRef(0);
  const FRAME_THROTTLE_MS = 33;

  useEffect(() => {
    if (!effectiveAutoPlay) return;

    const tick = (now: number): void => {
      if (startedAtRef.current === 0) { startedAtRef.current = hasSkippedIntroRef.current ? now : (now - (PHASES[0]?.ms ?? 0)); hasSkippedIntroRef.current = true; } /* skip INTRO on first mount only, NOT on subsequent resets (pause/scrub/phase-jump preserve user position) */
      if (manualMsRef.current !== null) {
        setAnim(computeFromMs(manualMsRef.current));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (pausedRef.current || hoveredRef.current) {
        if (pausedAtRef.current === 0) pausedAtRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (pausedAtRef.current !== 0) {
        pauseAccumRef.current += now - pausedAtRef.current;
        pausedAtRef.current = 0;
      }
      const elapsed = (now - startedAtRef.current - pauseAccumRef.current) * speed;
      if (!loop && elapsed >= TOTAL_CYCLE_MS) {
        setAnim({ phase: "HOLD", phaseProgress: 1, cycleProgress: 1, cycleMs: TOTAL_CYCLE_MS - 1 });
        return;
      }
      // Throttle React state updates to ~30fps. Skip setAnim if not enough
      // wall-clock time has passed since the last update.
      if (now - lastSetAtRef.current >= FRAME_THROTTLE_MS) {
        lastSetAtRef.current = now;
        setAnim(computeFromMs(elapsed));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startedAtRef.current = 0;
      pausedAtRef.current = 0;
      pauseAccumRef.current = 0;
      lastSetAtRef.current = 0;
    };
  }, [effectiveAutoPlay, loop, speed, computeFromMs]);

  // Control handlers
  const goToPhase = useCallback((phaseIdx: number): void => {
    // 0.4.8 — Land at 65% through the phase, NOT at the start. Phases
    // that animate content from 0→1 (DRAW, ONE_FAN, KMINUS_FAN, LOCK)
    // look empty at the start frame because progress=0 means
    // drawProgress=0 / altFanProgress=0 etc. Daniel: "step by step
    // doesn't show the line curves". Landing mid-narrative shows the
    // story of the phase, not the empty pre-rollover frame.
    const idx = Math.max(0, Math.min(PHASES.length - 1, phaseIdx));
    const phaseStart = PHASE_BOUNDARIES[idx] ?? 0;
    const phaseMs = PHASES[idx]?.ms ?? 0;
    setManualMs(phaseStart + phaseMs * 0.65);
    // resume from this point on next play
    startedAtRef.current = 0;
    pauseAccumRef.current = 0;
    setPaused(true);
  }, []);
  const stepForward = useCallback(() => {
    const idx = PHASES.findIndex((p) => p.id === anim.phase);
    goToPhase(idx + 1 >= PHASES.length ? 0 : idx + 1);
  }, [anim.phase, goToPhase]);
  const stepBack = useCallback(() => {
    const idx = PHASES.findIndex((p) => p.id === anim.phase);
    goToPhase(idx - 1 < 0 ? PHASES.length - 1 : idx - 1);
  }, [anim.phase, goToPhase]);
  // 0.5.0 — Always-on arrow-key step nav (Daniel 2026-05-30: "keyboard arrow
  // forward back controls on viz would be great"). Hook scopes itself to
  // ignore form-input focus.
  useArrowStepNav(stepBack, stepForward);
  useRegisterVizSubStep({
    getPhaseIdx: () => PHASES.findIndex((p) => p.id === anim.phase),
    totalPhases: PHASES.length,
    jumpToPhase: goToPhase,
  });
  const togglePlay = useCallback(() => {
    if (manualMs !== null) {
      // resume auto from this point
      startedAtRef.current = 0;
      pauseAccumRef.current = 0;
      setManualMs(null);
      setPaused(false);
    } else {
      setPaused((v) => !v);
    }
  }, [manualMs]);

  // ── derived rendering state per phase ─────────────────────────────────

  const fullCurve = sampleCurve((x) => evalPoly(coeffs, x), 0, xMaxVal, 120);
  const drawProgress = anim.phase === "DRAW"
    ? anim.phaseProgress
    : (anim.phase === "INTRO" ? 0 : 1);
  const partialCurve = fullCurve.slice(0, Math.max(1, Math.floor(fullCurve.length * drawProgress)));

  const curveAlpha = (() => {
    if (anim.phase === "INTRO") return 0;
    if (anim.phase === "DRAW")  return 1;
    if (anim.phase === "EMIT")  return 1;
    if (anim.phase === "HIDE")  return 1 - anim.phaseProgress;
    if (anim.phase === "LOCK")  return anim.phaseProgress;
    if (anim.phase === "HOLD")  return 1;
    return 0;
  })();

  const secretAlpha = (() => {
    if (anim.phase === "INTRO") return anim.phaseProgress;
    if (anim.phase === "DRAW")  return 1;
    if (anim.phase === "EMIT")  return 1;
    if (anim.phase === "HIDE")  return 1 - anim.phaseProgress;
    if (anim.phase === "LOCK")  return anim.phaseProgress;
    if (anim.phase === "HOLD")  return 1;
    return 0;
  })();

  // Alternative curves (fan) — interpolated through the SAME SCATTERED
  // known shares the share-highlight logic picks, so the visual is
  // internally consistent ("ANY K, not the first K").
  const altCurves: readonly { d: string; intensity: number }[] = (() => {
    if (anim.phase !== "ONE_FAN" && anim.phase !== "KMINUS_FAN") return [];
    const knownIdx = anim.phase === "ONE_FAN" ? fanOneIdx : fanKminusIdx;
    const known: Point[] = knownIdx.map((i) => shares[i]).filter((p): p is Point => !!p);
    const candidates = [5, 25, 45, 65, 85, 105];
    return candidates.map((c, i) => ({
      d: pointsToPath(sampleCurve((x) => lagrangeWithSecret(known, c, x), 0, xMaxVal, 80)),
      intensity: 0.5 + (i % 3) * 0.18,
    }));
  })();

  const altFanProgress = (() => {
    if (anim.phase === "ONE_FAN") return easeOut(Math.min(1, anim.phaseProgress * 1.4));
    if (anim.phase === "KMINUS_FAN") return easeOut(Math.min(1, anim.phaseProgress * 1.4));
    return 0;
  })();

  // Each share's visibility (EMIT staggers them appearing).
  const shareScale = (i: number): number => {
    if (anim.phase === "INTRO" || anim.phase === "DRAW") return 0;
    if (anim.phase === "EMIT") {
      // Stagger emit so they pop one at a time with a tiny overshoot.
      const t01 = anim.phaseProgress * (n + 0.5) - i;
      if (t01 < 0) return 0;
      if (t01 < 1) return easeOut(t01) * (1 + 0.15 * Math.sin(t01 * Math.PI));
      return 1;
    }
    return 1;
  };

  const shareHighlighted = (i: number): boolean => {
    if (anim.phase === "ONE_FAN")    return fanOneIdx.includes(i);
    if (anim.phase === "KMINUS_FAN") return fanKminusIdx.includes(i);
    if (anim.phase === "LOCK")       return lockIdx.includes(i);
    if (anim.phase === "HOLD")       return lockIdx.includes(i);
    return i < n; // EMIT / HIDE — all shares "real"
  };

  // LOCK phase: particles stream from each share back toward the secret.
  const lockStream = anim.phase === "LOCK" ? anim.phaseProgress : 0;

  // Shockwave during LOCK climax.
  const shockwave = anim.phase === "LOCK" && anim.phaseProgress > 0.6
    ? (anim.phaseProgress - 0.6) / 0.4
    : 0;

  const currentPhaseIdx = PHASES.findIndex((p) => p.id === anim.phase);
  const currentPhaseDef = PHASES[currentPhaseIdx] ?? PHASES[0]!;

  const secretY = evalPoly(coeffs, 0);

  // ── render ────────────────────────────────────────────────────────────

  const outerStyle = chromeless
    ? { background: "transparent", padding: 0 }
    : { background: t.bg, borderRadius: 12, padding: 16 };

  // Fullscreen — uses the browser Fullscreen API. The container itself
  // becomes the fullscreen target so the page chrome falls away.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onChange = (): void => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = useCallback((): void => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current.requestFullscreen();
    }
  }, []);

  // 0.4.7 — Tier-2 WAAPI bg-particle animations. Each particle gets its own
  // looping Element.animate() — runs on the compositor thread, zero React
  // re-renders. Replaces the per-frame React recompute of cx/cy/opacity that
  // was the largest remaining per-render cost in the viz.
  const bgRefs = useRef<(SVGCircleElement | null)[]>([]);
  useEffect(() => {
    if (reducedMotion) return;
    const animations: Animation[] = [];
    bgRefs.current.forEach((el, i) => {
      if (!el) return;
      const p = bgParticles.current[i];
      if (!p) return;
      // Full x-traverse duration matching the legacy maths
      // (px = (p.x + cycleMs * p.speed * 30) % VB_W).
      const dur = VB_W / (p.speed * 30);
      const dy = 6; // ±6 px y-bob like the legacy sin(...)*6
      // Keyframes: drift right across the full canvas, then wrap back via a
      // discontinuous step (offset 0.5 → 0.5001) so the particle visually
      // re-enters from the left edge. Opacity + y-bob run smoothly through.
      const kf: Keyframe[] = [
        { offset: 0,      transform: `translate(0px, 0px)`,         opacity: 0.20 },
        { offset: 0.25,   transform: `translate(${VB_W * 0.5}px, ${dy}px)`,  opacity: 0.42 },
        { offset: 0.5,    transform: `translate(${VB_W}px, 0px)`,    opacity: 0.20 },
        { offset: 0.5001, transform: `translate(${-VB_W}px, 0px)`,   opacity: 0.20 },
        { offset: 0.75,   transform: `translate(${-VB_W * 0.5}px, ${-dy}px)`, opacity: 0.42 },
        { offset: 1,      transform: `translate(0px, 0px)`,          opacity: 0.20 },
      ];
      try {
        const a = el.animate(kf, {
          duration: dur,
          iterations: Infinity,
          easing: "linear",
          delay: -dur * (p.phaseOffset / (Math.PI * 2)),
        });
        animations.push(a);
      } catch {
        // WAAPI on SVG transform unsupported (very old browsers) — silently
        // leave the particle static. No fallback needed; the viz is still
        // legible without the drift.
      }
    });
    return () => animations.forEach((a) => a.cancel());
  // bgParticles is a ref → stable; only re-wire if reducedMotion flips.
  }, [reducedMotion]);

  // 0.4.6 — one-shot IntersectionObserver. The autoplay RAF starts on mount
  // regardless of viewport position, so by the time the user scrolls down to
  // the viz it's already somewhere mid-cycle. Reset the cycle clock the
  // first time the container scrolls ≥40% into view so the user sees the
  // story start at INTRO. After the first reveal, subsequent observer hits
  // are ignored — the loop runs normally. No-op if IntersectionObserver is
  // unavailable (older browsers).
  const firstRevealRef = useRef(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e || firstRevealRef.current) return;
        if (e.isIntersecting && e.intersectionRatio >= 0.4) {
          firstRevealRef.current = true;
          startedAtRef.current = 0;
          pausedAtRef.current = 0;
          pauseAccumRef.current = 0;
          lastCycleMsRef.current = 0;
          lastSetAtRef.current = 0;
          setVariant(0);
          setManualMs(null);
          setPaused(false);
          obs.disconnect();
        }
      },
      { threshold: [0.4] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 0.5.0 — Offline mood: networkOff (navigator.onLine===false OR airgap
  // engaged) applies a subtle desaturate + warm tint to the viz + shows
  // an absolute pill in the top-left corner. Visual cue that the user
  // is in the security-sensitive offline phase.
  const offlineState = useOfflineState();
  const skipMoodFilter = useSkipMoodFilter();
  return (
    <div
      ref={containerRef}
      style={{
        ...outerStyle,
        ...(isFullscreen ? { background: "#020617", padding: 32 } : {}),
        color: t.text,
        position: "relative",
        filter: skipMoodFilter ? "none" : offlineMoodFilter(offlineState),
        transition: "filter 600ms ease",
      }}
      onMouseEnter={chromeless || isFullscreen ? undefined : () => setHovered(true)}
      onMouseLeave={chromeless || isFullscreen ? undefined : () => setHovered(false)}
    >
      <OfflineMoodPill />
      {/* Fullscreen button — top-right corner, small + unobtrusive. Gated
          via showFullscreenButton (default true) so the homepage embed
          can opt out. */}
      {showFullscreenButton && (
        <FullscreenAffordance
          isFullscreen={isFullscreen}
          onToggle={toggleFullscreen}
          onPrev={stepBack}
          onNext={stepForward}
          accent={t.share}
        />
      )}

      {/* N/K preset picker (Daniel 0.3.0). Lets the user flip between
          industry-standard threshold-scheme configurations and see the
          math work identically across them. Defaults off so existing
          embeds don't change layout unless they opt in. */}
      {showPresetPicker && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: t.muted, fontWeight: 700 }}>
            Try a threshold scheme
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {NK_PRESETS.map((p) => {
              const isActive = p.n === n && p.k === k;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setNkConfig({ n: p.n, k: p.k })}
                  title={p.desc}
                  style={{
                    background: isActive ? t.share : "transparent",
                    color: isActive ? t.bg : t.share,
                    border: `1.5px solid ${t.share}`,
                    borderRadius: 999,
                    padding: "6px 18px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "ui-monospace, monospace",
                    letterSpacing: "0.5px",
                    transition: "all 150ms",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* HTML caption block above the SVG. Daniel 0.4.1: scaled back from
          28/17 to 22/14 — earlier sizes "looked like an accessibility
          setting". */}
      {showCaptions && (
        <div style={{ textAlign: "center", paddingBottom: 14, paddingLeft: 120, paddingRight: 120 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, lineHeight: 1.25, letterSpacing: "0.2px" }}>
            {currentPhaseDef.title}
          </div>
          <div style={{ fontSize: 14, color: t.text, opacity: 0.85, marginTop: 5, maxWidth: 820, marginLeft: "auto", marginRight: "auto", lineHeight: 1.45 }}>
            {currentPhaseDef.body(n, k)}
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }}
        aria-label="Shamir secret sharing visualisation"
      >
        <defs>
          <filter id={`glow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`softglow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`curveGrad-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.curve} stopOpacity="0.95" />
            <stop offset="50%" stopColor={t.curve2} stopOpacity="1" />
            <stop offset="100%" stopColor={t.share} stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id={`vault-fill-${theme}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={t.share} stopOpacity="0.18" />
            <stop offset="100%" stopColor={t.shareDim} stopOpacity="0.08" />
          </radialGradient>
          <radialGradient id={`vault-fill-dim-${theme}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={t.muted} stopOpacity="0.08" />
            <stop offset="100%" stopColor={t.muted} stopOpacity="0.02" />
          </radialGradient>
          <radialGradient id={`secret-fill-${theme}`} cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor={t.secret} stopOpacity="0.45" />
            <stop offset="65%" stopColor={t.secret} stopOpacity="0.16" />
            <stop offset="100%" stopColor={t.secret} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`bg-vignette-${theme}`} cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor={t.bg2} stopOpacity="0" />
            <stop offset="100%" stopColor={t.bg} stopOpacity="0.9" />
          </radialGradient>
          {/* 0.4.4 — static halo band behind the polynomial-curve-and-share
              region. Rendered once at mount, never updated. Restores some
              of the shimmer that was lost when the per-element glow filters
              were stripped, at zero per-frame cost. */}
          <linearGradient id={`band-halo-${theme}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={t.curve2} stopOpacity="0" />
            <stop offset="35%" stopColor={t.curve2} stopOpacity="0.06" />
            <stop offset="50%" stopColor={t.curve2} stopOpacity="0.12" />
            <stop offset="65%" stopColor={t.curve2} stopOpacity="0.06" />
            <stop offset="100%" stopColor={t.curve2} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`secret-halo-${theme}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={t.secret} stopOpacity="0.22" />
            <stop offset="60%" stopColor={t.secret} stopOpacity="0.06" />
            <stop offset="100%" stopColor={t.secret} stopOpacity="0" />
          </radialGradient>
          <pattern id={`grid-${theme}`} width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={t.grid} strokeWidth="0.6" />
          </pattern>
        </defs>

        {/* Background layer */}
        <rect width={VB_W} height={VB_H} fill={t.bg2} />
        <rect width={VB_W} height={VB_H} fill={`url(#grid-${theme})`} opacity="0.55" />
        <rect width={VB_W} height={VB_H} fill={`url(#bg-vignette-${theme})`} />
        {/* 0.4.4 static halo glow band — restored shimmer behind the
            polynomial-curve-and-share region. Rendered once, never updates. */}
        <rect width={VB_W} height={VB_H} fill={`url(#band-halo-${theme})`} />
        <circle cx={projectX(0)} cy={projectY(50)} r="170" fill={`url(#secret-halo-${theme})`} />

        {/* Drifting particles — 0.4.7: rendered ONCE with refs; positions +
            opacity animated via WAAPI on the compositor thread. No React
            cost per frame; transform-origin pinned via style so the
            translate() keyframes behave like absolute offsets. */}
        <g>
          {bgParticles.current.map((p, i) => (
            <circle
              key={`bg-${i}`}
              ref={(el) => { bgRefs.current[i] = el; }}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill={t.particle}
              opacity={0.20}
              style={{ transformBox: "fill-box", transformOrigin: "0 0", willChange: "transform, opacity" }}
            />
          ))}
        </g>

        {/* Axes — subtle */}
        <g stroke={t.grid} strokeWidth="1.2" opacity="0.7">
          <line x1={projectX(X_MIN_VAL)} y1={projectY(0)} x2={projectX(xMaxVal)} y2={projectY(0)} />
          <line x1={projectX(0)} y1={projectY(Y_MIN_VAL)} x2={projectX(0)} y2={projectY(Y_MAX_VAL)} />
        </g>
        <g fill={t.muted} fontSize="14" fontFamily="ui-monospace, monospace" opacity="0.95">
          <text x={projectX(0) - 18} y={projectY(0) + 26} textAnchor="end">x=0</text>
          {Array.from({ length: n }, (_, i) => i + 1).map((xi) => (
            <text key={`xl-${xi}`} x={projectX(xi)} y={projectY(0) + 28} textAnchor="middle">{xi}</text>
          ))}
          <text x={projectX(0) - 18} y={projectY(Y_MAX_VAL) + 8} textAnchor="end" fontSize="13">P(x)</text>
        </g>

        {/* Alternative curves fan — theme-tinted so they read as "candidate
            curves of the same family" not random grey ghosts. Brighter +
            thicker dashes per Daniel 0.4.0. */}
        {altCurves.map((c, i) => (
          <path
            key={`alt-${i}`}
            d={c.d}
            fill="none"
            stroke={theme === "emerald" ? "#a7f3d0" : "#a5f3fc"}
            strokeWidth="3"
            strokeDasharray="14 8"
            strokeLinecap="round"
            opacity={altFanProgress * Math.max(0.55, c.intensity)}
          />
        ))}

        {/* 0.5.0 — INTRO "expectations skeleton": ghosted final-state preview
            of the polynomial curve + share-vault positions, so the canvas
            isn't dead-air during the first ~1.8s. Fades from ~22% opacity
            down to 0 over the INTRO phase so it dissolves into nothing
            just as the real DRAW phase begins. Pure preview — no other
            phase touches this. */}
        {anim.phase === "INTRO" && fullCurve.length > 1 && (() => {
          const ghostAlpha = (1 - anim.phaseProgress) * 0.22;
          if (ghostAlpha <= 0) return null;
          return (
            <g opacity={ghostAlpha} pointerEvents="none">
              {/* Ghosted full polynomial curve — where the secret will be hidden */}
              <path
                d={pointsToPath(fullCurve)}
                fill="none"
                stroke={`url(#curveGrad-${theme})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 6"
              />
              {/* Ghosted share positions — small dotted hex outlines at each
                  future share location so the viewer sees "this many vaults
                  will appear there". */}
              {shares.map(([sx, sy], i) => {
                const cx = projectX(sx);
                const cy = projectY(sy);
                return (
                  <g key={`ghost-share-${i}`}>
                    <path
                      d={hexPath(cx, cy, 54, 60)}
                      fill="none"
                      stroke={t.share}
                      strokeWidth="1.2"
                      strokeDasharray="3 4"
                    />
                    <circle cx={cx} cy={cy} r="2" fill={t.share} opacity="0.7" />
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* Main polynomial curve */}
        {partialCurve.length > 1 && curveAlpha > 0 && (
          <g>
            <path
              d={pointsToPath(partialCurve)}
              fill="none"
              stroke={`url(#curveGrad-${theme})`}
              strokeWidth="5"
              strokeLinecap="round"
              opacity={curveAlpha * 0.35}
            />
            <path
              d={pointsToPath(partialCurve)}
              fill="none"
              stroke={`url(#curveGrad-${theme})`}
              strokeWidth="3"
              strokeLinecap="round"
              opacity={curveAlpha}
            />
          </g>
        )}

        {/* Curve "leading edge" sparkle during DRAW */}
        {anim.phase === "DRAW" && partialCurve.length > 1 && (() => {
          const leadIdx = partialCurve.length - 1;
          const lead = partialCurve[leadIdx];
          if (!lead) return null;
          const lx = projectX(lead[0]);
          const ly = projectY(lead[1]);
          return (
            <g>
              <circle cx={lx} cy={ly} r="10" fill={t.curve2} opacity="0.85" />
              <circle cx={lx} cy={ly} r="22" fill="none" stroke={t.curve2} strokeWidth="1.5" opacity={0.6 - 0.3 * (anim.phaseProgress % 1)} />
            </g>
          );
        })()}

        {/* Flowing particles along the curve during DRAW + EMIT */}
        {(anim.phase === "DRAW" || anim.phase === "EMIT" || anim.phase === "LOCK") && partialCurve.length > 4 && (
          <g opacity={curveAlpha * 0.9}>
            {[0, 1, 2, 3, 4, 5].map((p) => {
              const offset = (anim.cycleMs * 0.00045 + p * 0.16) % 1;
              const idx = Math.floor(offset * (partialCurve.length - 1));
              const pt = partialCurve[idx];
              if (!pt) return null;
              return <circle key={`fp-${p}`} cx={projectX(pt[0])} cy={projectY(pt[1])} r="2.5" fill={t.curve2} opacity={0.7} />;
            })}
          </g>
        )}

        {/* Lock-phase shockwave from secret */}
        {shockwave > 0 && (
          <g opacity={1 - shockwave}>
            <circle cx={projectX(0)} cy={projectY(secretY)} r={20 + shockwave * 220} fill="none" stroke={t.secret} strokeWidth="3" opacity="0.7" />
            <circle cx={projectX(0)} cy={projectY(secretY)} r={20 + shockwave * 140} fill="none" stroke={t.secret2} strokeWidth="2" opacity="0.5" />
          </g>
        )}

        {/* SECRET VAULT at x=0 */}
        {(secretAlpha > 0 || anim.phase === "HIDE" || anim.phase === "ONE_FAN" || anim.phase === "KMINUS_FAN") && (() => {
          const sx = projectX(0);
          const sy = projectY(secretY);
          const w = 110, h = 110;
          const hidden = anim.phase === "HIDE" || anim.phase === "ONE_FAN" || anim.phase === "KMINUS_FAN";
          const hideStrength = anim.phase === "HIDE" ? anim.phaseProgress
            : (anim.phase === "ONE_FAN" || anim.phase === "KMINUS_FAN") ? 1 : 0;
          const lockReveal = anim.phase === "LOCK" ? anim.phaseProgress : (anim.phase === "HOLD" ? 1 : 0);
          const cardAlpha = hidden ? 0.6 - 0.2 * hideStrength : 1;
          return (
            <g opacity={cardAlpha}>
              {/* outer glow */}
              <circle cx={sx} cy={sy} r="80" fill={`url(#secret-fill-${theme})`} opacity={0.5 + lockReveal * 0.6} />
              {/* card */}
              <g filter={lockReveal > 0.5 ? `url(#glow-${theme})` : undefined}>
                <rect
                  x={sx - w / 2} y={sy - h / 2}
                  width={w} height={h}
                  rx="14"
                  fill={t.bg2}
                  stroke={t.secret}
                  strokeWidth={hidden ? 1.6 : 3}
                  strokeDasharray={hidden ? "6 4" : undefined}
                />
                {/* header — 0.4.8: nudged down so the SECRET word sits
                    fully INSIDE the card border (Daniel screenshot). */}
                <text x={sx} y={sy - h / 2 + 28} textAnchor="middle" fill={t.secret} fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
                  SECRET
                </text>
                <line x1={sx - 38} y1={sy - h / 2 + 36} x2={sx + 38} y2={sy - h / 2 + 36} stroke={t.secret} strokeWidth="1" opacity="0.5" />
                {/* body — 0.4.9: stacked as x=0 / y=secret so it fits
                    inside the box border AND reads more honestly to
                    non-math users (the y-intercept IS the secret).
                    Daniel: "still too fat. maybe x = y ?" */}
                {!hidden && (
                  <>
                    <text x={sx} y={sy - 4} textAnchor="middle" fill={t.secret2} fontSize="18" fontFamily="ui-monospace, monospace" fontWeight="bold">
                      x = 0
                    </text>
                    <text x={sx} y={sy + 18} textAnchor="middle" fill={t.secret2} fontSize="18" fontFamily="ui-monospace, monospace" fontWeight="bold">
                      y = {secret}
                    </text>
                  </>
                )}
                {hidden && (
                  <text x={sx} y={sy + 14} textAnchor="middle" fill={t.muted} fontSize="44" fontFamily="ui-monospace, monospace" fontWeight="bold" opacity={0.6 + 0.3 * Math.sin(anim.cycleMs * 0.005)}>
                    ?
                  </text>
                )}
                {/* footer label — nudged up so MASTER KEY sits inside the border. */}
                {!hidden && (
                  <text x={sx} y={sy + h / 2 - 16} textAnchor="middle" fill={t.muted} fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="1">
                    MASTER KEY
                  </text>
                )}
              </g>
              {/* "polynomial y-intercept" hover text under the card */}
              {(anim.phase === "INTRO" || anim.phase === "DRAW") && (
                <text x={sx} y={sy + h / 2 + 26} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-sans-serif, system-ui" opacity={secretAlpha}>
                  y-intercept of the polynomial
                </text>
              )}
            </g>
          );
        })()}

        {/* SHARE VAULTS — one hex card per share, each with contents */}
        {shares.map(([sx, sy], i) => {
          const scale = shareScale(i);
          if (scale <= 0) return null;
          const cx = projectX(sx);
          const cy = projectY(sy);
          const w = 108, h = 124;
          const highlighted = shareHighlighted(i);
          const fill = highlighted ? `url(#vault-fill-${theme})` : `url(#vault-fill-dim-${theme})`;
          const stroke = highlighted ? t.share : t.shareDim;
          const labelColor = highlighted ? t.share : t.muted;

          // LOCK: each "known" (scattered) share emits 3 particles streaming toward secret.
          const emits = lockStream > 0 && lockIdx.includes(i);
          const secretX = projectX(0);
          const secretYy = projectY(secretY);

          // Subtle floating motion + scale.
          const floatY = Math.sin(anim.cycleMs * 0.0015 + i * 0.7) * 2.5;

          return (
            <g key={`share-${i}`} transform={`translate(0, ${floatY})`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
              <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`}>
                {/* Soft glow halo behind the card if highlighted */}
                {highlighted && (
                  <ellipse cx={cx} cy={cy} rx={w * 0.9} ry={h * 0.7} fill={t.share} opacity="0.12" />
                )}
                {/* Hex card */}
                <path
                  d={hexPath(cx, cy, w, h)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={highlighted ? 2.5 : 1.5}
                  filter={highlighted ? `url(#glow-${theme})` : undefined}
                />
                {/* Top header band */}
                <text x={cx} y={cy - h / 2 + 22} textAnchor="middle" fill={labelColor} fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
                  SHARE {String(i + 1).padStart(2, "0")}
                </text>
                <line x1={cx - 30} y1={cy - h / 2 + 28} x2={cx + 30} y2={cy - h / 2 + 28} stroke={stroke} strokeWidth="1" opacity="0.6" />

                {/* Inner content fragments — actual BIP-39 seed words / doc /
                    image / noise glyphs. Daniel 0.4.1: pulled back from 15
                    to 13 so they read as "fragments inside the vault" not
                    "accessibility-mode big text". */}
                {(anim.phase === "EMIT" || anim.phase === "HIDE" || anim.phase === "ONE_FAN" || anim.phase === "KMINUS_FAN" || anim.phase === "LOCK" || anim.phase === "HOLD") && (
                  <g>
                    {[0, 1, 2].map((slot) => {
                      const text = vaultContentText(contentKind, i, slot);
                      const yy = cy - 4 + slot * 14;
                      const fontSize = contentKind === "image" || contentKind === "document" ? 18 : 13;
                      return (
                        <text key={`vc-${i}-${slot}`} x={cx} y={yy} textAnchor="middle" fill={labelColor} fontSize={fontSize} fontFamily="ui-monospace, monospace" opacity={highlighted ? 0.95 : 0.55}>
                          {text}
                        </text>
                      );
                    })}
                  </g>
                )}

                {/* Bottom marker — x-value */}
                <text x={cx} y={cy + h / 2 - 8} textAnchor="middle" fill={labelColor} fontSize="10" fontFamily="ui-monospace, monospace" opacity="0.75">
                  x={i + 1}
                </text>
              </g>

              {/* LOCK: streaming particles from share -> secret */}
              {emits && [0, 1, 2].map((p) => {
                const phaseT = (lockStream + p * 0.13) % 1;
                const px = cx + (secretX - cx) * phaseT;
                const py = cy + (secretYy - cy) * phaseT;
                return (
                  <circle key={`emit-${i}-${p}`} cx={px} cy={py} r="3" fill={t.secret2} opacity={1 - phaseT * 0.5} />
                );
              })}
            </g>
          );
        })}

        {/* Big "?" floating from x=0 when secret is hidden (ONE_FAN/KMINUS_FAN) */}
        {(anim.phase === "ONE_FAN" || anim.phase === "KMINUS_FAN") && (
          <g opacity="0.85">
            {[0, 1, 2, 3, 4].map((q) => {
              const yt = (anim.cycleMs * 0.0007 + q * 0.2) % 1;
              return (
                <text
                  key={`qm-${q}`}
                  x={projectX(0) - 60}
                  y={projectY(Y_MIN_VAL) - yt * (projectY(Y_MIN_VAL) - projectY(Y_MAX_VAL))}
                  textAnchor="end"
                  fill="#cbd5e1"
                  fontSize={`${42 - q * 4}`}
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                  opacity={(1 - yt) * 0.9}
                >
                  ?
                </text>
              );
            })}
          </g>
        )}

        {/* Phase title + body MOVED OUT of SVG into HTML above the SVG
            (Daniel 0.4.0: "text too small, sometimes overwritten by the
            visual"). See JSX below for the HTML caption block. */}
      </svg>

      {/* HTML config strip below the SVG. */}
      {showCaptions && (
        <div style={{ textAlign: "center", paddingTop: 10, fontSize: 12, color: t.muted, fontFamily: "ui-monospace, monospace", letterSpacing: "0.4px" }}>
          {n} shares  ·  {k}-of-{n} threshold  ·  polynomial degree = {k - 1}  ·  secret = {secret}  ·  variant #{variant + 1}
        </div>
      )}

      {/* HTML control row below the SVG */}
      {showControls && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 12, paddingBottom: 8 }}>
          {/* Phase dots */}
          <div style={{ display: "flex", gap: 8 }}>
            {PHASES.map((p, i) => {
              const isActive = i === currentPhaseIdx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goToPhase(i)}
                  aria-label={`Jump to phase ${i + 1}: ${p.title}`}
                  style={{
                    width: isActive ? 28 : 10,
                    height: 10,
                    borderRadius: 5,
                    border: "none",
                    background: isActive ? t.share : t.shareDim,
                    cursor: "pointer",
                    transition: "all 200ms ease",
                    padding: 0,
                  }}
                />
              );
            })}
          </div>
          {/* Controls */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <CtrlBtn onClick={stepBack} t={t} aria-label="Previous phase">◀</CtrlBtn>
            <CtrlBtn onClick={togglePlay} t={t} aria-label={paused || manualMs !== null ? "Play" : "Pause"} primary>
              {(paused || manualMs !== null) ? "▶" : "❚❚"}
            </CtrlBtn>
            <CtrlBtn onClick={stepForward} t={t} aria-label="Next phase">▶</CtrlBtn>
          </div>
        </div>
      )}

      {showLegend && (
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 18, paddingTop: 6, fontSize: 11, color: t.muted, fontFamily: "ui-monospace, monospace" }}>
          <span style={{ color: t.secret }}>● secret vault</span>
          <span style={{ color: t.share }}>⬢ share vault</span>
          <span style={{ color: t.curve2 }}>— true polynomial</span>
          <span style={{ color: t.altCurve }}>┄ ┄ alternative polynomials</span>
        </div>
      )}
    </div>
  );
}

function CtrlBtn({
  onClick,
  children,
  t,
  primary,
  ...rest
}: {
  readonly onClick: () => void;
  readonly children: React.ReactNode;
  readonly t: typeof THEMES.cyan;
  readonly primary?: boolean;
  readonly "aria-label"?: string;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: primary ? t.share : "transparent",
        color: primary ? t.bg : t.share,
        border: `1px solid ${t.share}`,
        borderRadius: 6,
        padding: primary ? "6px 16px" : "5px 10px",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "ui-monospace, monospace",
        letterSpacing: "0.5px",
        minWidth: primary ? 60 : 32,
        transition: "background 150ms, color 150ms",
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
