// @version 0.3.0 @date 2026-06-01
// 0.3.0 — INTRO phase now renders content — no more empty SVG blank during
//         INTRO sub-phase. Breathing-precursor pattern: a centred
//         "PASSWORD ▸ ARGON2id" pill with a softly pulsing input dot + halo
//         appears during INTRO, fades out as SALT begins. Sets up the
//         metaphor ("a passphrase is about to enter the memory grid")
//         instead of staring at a dark canvas + title text alone. Opacity
//         driven imperatively in the existing RAF tick — zero per-frame
//         React cost. Reduced-motion users see the pill statically (no
//         pulse) but still get the content.
// 0.2.2 — SEX-UP pass: master-key strip shimmer (WAAPI linear-gradient
//         band travelling across the 32 key cells, compositor-thread,
//         zero React cost; only visible while the mkGroup itself is —
//         i.e. during EXTRACT/HOLD). Halo gradient stops brightened
//         (0.20 → 0.32 centre, 0.06 → 0.10 mid). Suppressed under
//         prefers-reduced-motion.
// 0.2.0 — TIER 1 PERF: imperative refs for the animated cells, master-key
//         strip, stats text, and access arrows. React state setAnim only
//         fires on PHASE CHANGE (8 times per ~18s cycle) instead of every
//         RAF tick (60 times per second). Per-frame React reconciliation
//         for 128 cells × 5 arrows × 32 master-key cells goes from ~165
//         element diffs every frame to ZERO. DOM is mutated directly via
//         setAttribute / textContent in the tick.
//
//         Static-halo glow RESTORED (computed once at mount, never re-
//         rendered — no per-frame filter cost). Brings back the "sex"
//         Daniel asked about: "does that mean you can safely return the
//         shimmer and other fancy stuff you removed in the name of perf?"
//         — yes, this is exactly how.
//
//         Visual story is byte-identical to 0.1.x. The viz just runs much
//         smoother on lower-end devices.
// 0.1.2 — Cells reduced 240 → 128.
// 0.1.1 — Cells reduced 512 → 240; glow filters stripped.
// 0.1.0 — Initial implementation.

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type ArgonPhase =
  | "INTRO" | "SALT" | "ALLOC" | "FILL_1" | "FILL_2" | "FILL_3" | "EXTRACT" | "HOLD";

interface PhaseDef {
  readonly id: ArgonPhase;
  readonly ms: number;
  readonly title: string;
  readonly body: string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO",   ms: 1600,
    title: "Your password enters",
    body: "A passphrase you type — short or long, weak or strong, doesn't matter yet. Argon2id will turn it into a key while making the conversion impractical to brute-force." },
  { id: "SALT",    ms: 1400,
    title: "Add a unique salt",
    body: "A random 16-byte salt makes your derivation unique. Even two users with the same password get totally different master keys. Pre-computed 'rainbow tables' are useless." },
  { id: "ALLOC",   ms: 1400,
    title: "Allocate 64 MiB of memory",
    body: "Argon2id grabs a big chunk of RAM — the whole point. An attacker needs the same 64 MiB for every guess. A million guesses ≈ 64 TB. ASICs can't shortcut this." },
  { id: "FILL_1",  ms: 3200,
    title: "Round 1 — fill the memory blocks",
    body: "Each block is computed from the previous block, in order. Linear pass through 64 MiB. Memory access pattern is predictable here but the data dependency is locked." },
  { id: "FILL_2",  ms: 3200,
    title: "Round 2 — blend with data-dependent reads",
    body: "Each block now re-reads earlier blocks at positions that DEPEND on the data itself. This is the 'i' in Argon2-i-d — adaptive memory access that defeats GPU parallelisation." },
  { id: "FILL_3",  ms: 3000,
    title: "Round 3 — final pass",
    body: "Three full passes through 64 MiB. Every block is touched, blended, mixed. The state is now a function of every byte of your password, every byte of the salt, and the memory layout." },
  { id: "EXTRACT", ms: 2000,
    title: "Extract the 32-byte master key",
    body: "Final hash distils 64 MiB of state down to 32 bytes. This becomes the master key that gets Shamir-split into your shares. The intermediate memory is wiped." },
  { id: "HOLD",    ms: 2200,
    title: "This is what 'memory-hard' looks like",
    body: "A laptop runs this in ~100 ms. An attacker trying 1 million passwords needs 64 TB of RAM in parallel — or 27 hours on one machine. Brute force becomes economic infeasibility." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
// 0.2.4 — cumulative phase start times for ◀/▶ step buttons.
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface ArgonGridVizProps {
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly speed?: number;
  readonly showCaptions?: boolean;
  readonly showControls?: boolean;
  readonly chromeless?: boolean;
  readonly theme?: "cyan" | "emerald";
  readonly height?: number;
}

interface ThemeColors {
  readonly cellOff: string;
  readonly cellFill: string;
  readonly cellHot: string;
  readonly cellGlow: string;
  readonly text: string;
  readonly muted: string;
  readonly bg: string;
  readonly bg2: string;
  readonly grid: string;
  readonly accent: string;
}

const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan: {
    cellOff:  "#0e2238",
    cellFill: "#06b6d4",
    cellHot:  "#67e8f9",
    cellGlow: "#22d3ee",
    text:     "#e2e8f0",
    muted:    "#94a3b8",
    bg:       "#020617",
    bg2:      "#0b1220",
    grid:     "#1e293b",
    accent:   "#22d3ee",
  },
  emerald: {
    cellOff:  "#0a2018",
    cellFill: "#059669",
    cellHot:  "#6ee7b7",
    cellGlow: "#10b981",
    text:     "#e2e8f0",
    muted:    "#94a3b8",
    bg:       "#020a05",
    bg2:      "#06120c",
    grid:     "#14241c",
    accent:   "#10b981",
  },
};

const GRID_COLS = 16;
const GRID_ROWS = 8;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;
const MK_CELLS = 32;
const ARROW_COUNT = 5;

const VB_W = 1200;
const VB_H = 520;
const GRID_PAD_X = 80;
const GRID_PAD_Y_TOP = 80;
const GRID_PAD_Y_BOT = 80;

function cellRand(i: number, salt: number): number {
  const v = ((i * 2654435761) ^ (salt * 1597334677)) >>> 0;
  return (v % 1000) / 1000;
}

// 0.2.3 — deterministic 2-char hex byte for a cell at (index, round).
// Reads "real-shaped" because it's the same kind of avalanche-mixed
// output that real Argon would produce; it's NOT secret-derived (no
// password input). Cells change byte value each FILL round so the user
// sees the memory state evolve.
function cellHex(i: number, round: number): string {
  const v = ((i * 2654435761) ^ (round * 805306457) ^ ((i * round) * 374761393)) >>> 0;
  const b = v & 0xff;
  return b.toString(16).padStart(2, "0");
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Pure helpers — compute frame state without React.
function computeCellFill(phase: ArgonPhase, phaseProgress: number, i: number): number {
  if (phase === "INTRO" || phase === "SALT") return 0;
  if (phase === "ALLOC") return phaseProgress * 0.3;
  if (phase === "FILL_1") {
    const filled = phaseProgress * TOTAL_CELLS;
    return i < filled ? 1 : (i < filled + 8 ? (filled - i) / 8 : 0.3);
  }
  if (phase === "FILL_2" || phase === "FILL_3") return 1;
  if (phase === "EXTRACT") return 1 - phaseProgress * 0.6;
  if (phase === "HOLD") return 0.4;
  return 0;
}

function computeCellHot(phase: ArgonPhase, cycleMs: number, i: number): number {
  if (phase !== "FILL_2" && phase !== "FILL_3") return 0;
  const speedFactor = phase === "FILL_3" ? 1.5 : 1;
  const pulseSeed = Math.floor(cycleMs / 120) % 7;
  const r = cellRand(i, pulseSeed);
  const phaseT = (cycleMs * 0.001 * speedFactor + r * 3) % 1;
  return phaseT < 0.1 ? 1 - phaseT * 10 : 0;
}

function computeStats(phase: ArgonPhase, phaseProgress: number): string {
  switch (phase) {
    case "INTRO":   return "0 / 64 MiB  ·  Round 0/3  ·  0 cells";
    case "SALT":    return "0 / 64 MiB  ·  Round 0/3  ·  16-byte salt added";
    case "ALLOC":   return `${Math.round(phaseProgress * 64)} / 64 MiB  ·  Round 0/3  ·  allocating…`;
    case "FILL_1":  return `64 / 64 MiB  ·  Round 1/3  ·  ${Math.round(phaseProgress * TOTAL_CELLS)} / ${TOTAL_CELLS} blocks`;
    case "FILL_2":  return `64 / 64 MiB  ·  Round 2/3  ·  data-dependent reads`;
    case "FILL_3":  return `64 / 64 MiB  ·  Round 3/3  ·  final blend`;
    case "EXTRACT": return `64 / 64 MiB → 32 bytes  ·  extracting master key`;
    case "HOLD":    return "32-byte master key derived  ·  ~100 ms on a laptop  ·  millions of years to brute-force";
  }
}

interface PhaseState {
  readonly phase: ArgonPhase;
  readonly phaseIdx: number;
}

export function ArgonGridViz({
  autoPlay = true,
  loop = true,
  speed = 1,
  showCaptions = true,
  showControls = true,
  chromeless = false,
  theme = "cyan",
  height = 480,
}: ArgonGridVizProps): JSX.Element {
  const t = THEMES[theme];

  // React state — driven ONLY by phase changes (8 times per cycle).
  // Anything that animates within a phase (cell colors, stats text,
  // arrow positions, master-key opacity oscillation) updates via direct
  // DOM mutation in the RAF tick — no React reconciliation.
  const [phaseState, setPhaseState] = useState<PhaseState>({ phase: "INTRO", phaseIdx: 0 });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  // 0.2.4 — manualMs jumps the tick to a specific elapsed value.
  const [manualMs, setManualMs] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  // 0.2.3 — reducedMotion only suppresses the decorative shimmer, NOT
  // the main lesson animation. Decoupled after the deploy showed blank
  // vizzes for OS reduce-motion users.
  const effectiveAutoPlay = autoPlay;

  // 0.2.1 fix — the previous 0.2.0 had `paused` + `hovered` in the
  // useEffect dependency array, which caused the RAF + timing refs to
  // RESET every time the user hovered or clicked pause. That made
  // controls appear to do nothing because the animation kept restarting
  // from frame 0. Now: route paused/hovered through refs; the tick reads
  // the LATEST values on each call without forcing the effect to re-run.
  const manualMsRef = useRef<number | null>(manualMs);
  manualMsRef.current = manualMs;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;

  // Imperative refs — populated via React's ref callback on first render,
  // then mutated directly in the RAF tick.
  const cellRefsRef = useRef<(SVGRectElement | null)[]>([]);
  if (cellRefsRef.current.length !== TOTAL_CELLS) {
    cellRefsRef.current = new Array<SVGRectElement | null>(TOTAL_CELLS).fill(null);
  }
  const mkRefsRef = useRef<(SVGRectElement | null)[]>([]);
  if (mkRefsRef.current.length !== MK_CELLS) {
    mkRefsRef.current = new Array<SVGRectElement | null>(MK_CELLS).fill(null);
  }
  const arrowRefsRef = useRef<(SVGLineElement | null)[]>([]);
  if (arrowRefsRef.current.length !== ARROW_COUNT) {
    arrowRefsRef.current = new Array<SVGLineElement | null>(ARROW_COUNT).fill(null);
  }
  const statTextRef = useRef<SVGTextElement | null>(null);
  const mkGroupRef = useRef<SVGGElement | null>(null);
  const arrowGroupRef = useRef<SVGGElement | null>(null);
  const mkShimmerRef = useRef<SVGRectElement | null>(null);
  // 0.3.0 — INTRO breathing precursor. Group is shown only during INTRO
  // (fades out as we cross into SALT). Pulse animates the inner dot's
  // opacity in the same RAF tick, no extra React work.
  const introGroupRef = useRef<SVGGElement | null>(null);
  const introPulseRef = useRef<SVGCircleElement | null>(null);
  // 0.2.3 — per-cell hex byte label. Lets the user SEE the (simulated)
  // memory bytes being filled, instead of "empty boxes flashing".
  // Updated imperatively in the tick alongside the cell fill.
  const cellTextRefsRef = useRef<(SVGTextElement | null)[]>([]);
  if (cellTextRefsRef.current.length !== TOTAL_CELLS) {
    cellTextRefsRef.current = new Array<SVGTextElement | null>(TOTAL_CELLS).fill(null);
  }
  // Mirror for master-key cells.
  const mkTextRefsRef = useRef<(SVGTextElement | null)[]>([]);
  if (mkTextRefsRef.current.length !== MK_CELLS) {
    mkTextRefsRef.current = new Array<SVGTextElement | null>(MK_CELLS).fill(null);
  }

  // 0.2.2 — master-key strip shimmer (WAAPI, compositor thread). Band
  // travels left→right across the key cells in a slow loop. Reduced-motion
  // suppresses it entirely. Inherits the mk group's opacity so it only
  // shows during the EXTRACT/HOLD phases when the strip is visible.
  useEffect(() => {
    if (reducedMotion) return;
    const el = mkShimmerRef.current;
    if (!el) return;
    const stripW = 32 * 16;
    const travel = stripW + 160;
    try {
      const a = el.animate(
        [
          { transform: "translate(0px, 0px)", opacity: 0.0 },
          { transform: `translate(${travel * 0.25}px, 0px)`, opacity: 0.9 },
          { transform: `translate(${travel * 0.75}px, 0px)`, opacity: 0.9 },
          { transform: `translate(${travel}px, 0px)`, opacity: 0.0 },
        ],
        { duration: 2200, iterations: Infinity, easing: "linear" }
      );
      return () => a.cancel();
    } catch { /* WAAPI unavailable — shimmer stays hidden, no break */ }
    return undefined;
  }, [reducedMotion]);

  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const hasSkippedIntroRef = useRef(false);
  const pausedAtRef = useRef<number>(0);
  const pauseAccumRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onChange = (): void => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = useCallback((): void => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void containerRef.current.requestFullscreen();
  }, []);
  // 0.2.5 — Named step handlers so FullscreenAffordance can fire them
  // from ArrowLeft / ArrowRight in fullscreen.
  const goToPhase = useCallback((newIdx: number): void => {
    const target = (PHASE_BOUNDARIES[newIdx] ?? 0) + (PHASES[newIdx]?.ms ?? 0) * 0.65;
    setManualMs(target);
    startedAtRef.current = 0;
    pauseAccumRef.current = 0;
    setPaused(true);
  }, []);
  const stepBack = useCallback((): void => {
    const idx = phaseState.phaseIdx;
    goToPhase(idx <= 0 ? PHASES.length - 1 : idx - 1);
  }, [phaseState.phaseIdx, goToPhase]);
  const stepForward = useCallback((): void => {
    const idx = phaseState.phaseIdx;
    goToPhase(idx >= PHASES.length - 1 ? 0 : idx + 1);
  }, [phaseState.phaseIdx, goToPhase]);
  // 0.2.4 — Always-on arrow-key step nav.
  useArrowStepNav(stepBack, stepForward);
  useRegisterVizSubStep({
    getPhaseIdx: () => phaseState.phaseIdx,
    totalPhases: PHASES.length,
    jumpToPhase: goToPhase,
  });

  const cellW = (VB_W - GRID_PAD_X * 2) / GRID_COLS;
  const cellH = (VB_H - GRID_PAD_Y_TOP - GRID_PAD_Y_BOT) / GRID_ROWS;

  // Memoised cell grid — renders ONCE; React diffs nothing on subsequent
  // re-renders because the dependency array is stable. All animation
  // happens via setAttribute against the refs.
  const cellsJsx = useMemo(() => (
    Array.from({ length: TOTAL_CELLS }, (_, i) => {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const x = GRID_PAD_X + col * cellW;
      const y = GRID_PAD_Y_TOP + row * cellH;
      // Hex byte label is centred in each cell; opacity is updated in
      // the tick (only shows when the cell is filled).
      return (
        <g key={`cell-${i}`}>
          <rect
            ref={(el) => { cellRefsRef.current[i] = el; }}
            x={x + 1}
            y={y + 1}
            width={cellW - 2}
            height={cellH - 2}
            fill={t.cellOff}
            opacity="0.15"
            rx={1}
          />
          <text
            ref={(el) => { cellTextRefsRef.current[i] = el; }}
            x={x + cellW / 2}
            y={y + cellH / 2 + 4}
            textAnchor="middle"
            fontSize={Math.min(11, cellH * 0.42).toFixed(1)}
            fontFamily="ui-monospace, monospace"
            fontWeight="bold"
            fill={t.bg}
            opacity="0"
            pointerEvents="none"
          />
        </g>
      );
    })
  ), [t.cellOff, t.bg, cellW, cellH]);

  const mkCellsJsx = useMemo(() => {
    const stripY = VB_H - GRID_PAD_Y_BOT / 2 - 12;
    const stripW = MK_CELLS * 16;
    const stripX = (VB_W - stripW) / 2;
    return Array.from({ length: MK_CELLS }, (_, i) => (
      <g key={`mk-${i}`}>
        <rect
          ref={(el) => { mkRefsRef.current[i] = el; }}
          x={stripX + i * 16}
          y={stripY}
          width="14"
          height="20"
          fill={t.cellHot}
          opacity="0"
          rx="2"
        />
        <text
          ref={(el) => { mkTextRefsRef.current[i] = el; }}
          x={stripX + i * 16 + 7}
          y={stripY + 14}
          textAnchor="middle"
          fontSize="8"
          fontFamily="ui-monospace, monospace"
          fontWeight="bold"
          fill={t.bg}
          opacity="0"
          pointerEvents="none"
        />
      </g>
    ));
  }, [t.cellHot, t.bg]);

  const arrowsJsx = useMemo(() => (
    Array.from({ length: ARROW_COUNT }, (_, i) => (
      <line
        key={`arr-${i}`}
        ref={(el) => { arrowRefsRef.current[i] = el; }}
        x1={0} y1={0} x2={0} y2={0}
        stroke={t.cellHot}
        strokeWidth="1.5"
        opacity="0"
      />
    ))
  ), [t.cellHot]);

  // The RAF tick — runs at full 60fps for smooth visuals. React state
  // setPhaseState fires ONLY when the phase ID changes. Cells, stats,
  // master-key, and arrows update via direct DOM mutation.
  useEffect(() => {
    if (!effectiveAutoPlay) return;
    let lastPhase: ArgonPhase | null = null;

    const tick = (now: number): void => {
      if (startedAtRef.current === 0) { startedAtRef.current = hasSkippedIntroRef.current ? now : (now - (PHASES[0]?.ms ?? 0)); hasSkippedIntroRef.current = true; } /* skip INTRO on first mount only, NOT on subsequent resets (pause/scrub/phase-jump preserve user position) */
      // 0.2.4 — manualMs takes priority. Bypasses pause/speed/accum.
      const manualMsVal = manualMsRef.current;
      if (manualMsVal === null && (pausedRef.current || hoveredRef.current)) {
        if (pausedAtRef.current === 0) pausedAtRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (manualMsVal === null && pausedAtRef.current !== 0) {
        pauseAccumRef.current += now - pausedAtRef.current;
        pausedAtRef.current = 0;
      }
      const elapsed = manualMsVal !== null
        ? manualMsVal
        : (now - startedAtRef.current - pauseAccumRef.current) * speed;
      if (!loop && elapsed >= TOTAL_CYCLE_MS) {
        // Final HOLD frame — render the end-state once.
        const endPhase: ArgonPhase = "HOLD";
        if (lastPhase !== endPhase) {
          lastPhase = endPhase;
          setPhaseState({ phase: endPhase, phaseIdx: PHASES.length - 1 });
        }
        return;
      }

      const wrapped = ((elapsed % TOTAL_CYCLE_MS) + TOTAL_CYCLE_MS) % TOTAL_CYCLE_MS;
      let acc = 0;
      let phase: ArgonPhase = "INTRO";
      let phaseIdx = 0;
      let phaseProgress = 0;
      for (let i = 0; i < PHASES.length; i++) {
        const p = PHASES[i]!;
        if (wrapped < acc + p.ms) {
          phase = p.id;
          phaseIdx = i;
          phaseProgress = easeInOut(Math.max(0, Math.min(1, (wrapped - acc) / p.ms)));
          break;
        }
        acc += p.ms;
      }
      const cycleMs = wrapped;

      // ── IMPERATIVE DOM UPDATES (every frame, no React) ─────────────

      // Cells + per-cell hex byte labels
      const cells = cellRefsRef.current;
      const texts = cellTextRefsRef.current;
      // round counter changes byte values phase-to-phase (FILL_1/2/3) so
      // the user sees memory state visibly evolve, not a static byte set.
      const round =
        phase === "FILL_1" ? 1 :
        phase === "FILL_2" ? 2 :
        phase === "FILL_3" ? 3 :
        phase === "EXTRACT" ? 4 : 0;
      for (let i = 0; i < TOTAL_CELLS; i++) {
        const cell = cells[i];
        if (!cell) continue;
        const fill = computeCellFill(phase, phaseProgress, i);
        const hot = computeCellHot(phase, cycleMs, i);
        const fillColor = hot > 0
          ? t.cellHot
          : fill > 0.3 ? t.cellFill
          : t.cellOff;
        const opacity = Math.max(0.15, Math.min(1, fill + hot * 0.6));
        cell.setAttribute("fill", fillColor);
        cell.setAttribute("opacity", opacity.toFixed(3));
        // Hex label: only visible when the cell is meaningfully filled.
        const txt = texts[i];
        if (txt) {
          const showLabel = fill > 0.5 && round > 0;
          const newOp = showLabel ? Math.min(1, fill).toFixed(3) : "0";
          if (txt.getAttribute("opacity") !== newOp) txt.setAttribute("opacity", newOp);
          if (showLabel) {
            const desired = cellHex(i, round);
            if (txt.textContent !== desired) txt.textContent = desired;
          }
        }
      }

      // 0.3.0 — INTRO breathing precursor. Visible during INTRO, fades
      // out across the first ~40% of SALT so it crosses cleanly into the
      // grid lighting up. Pulse uses sin() on cycleMs — same RAF tick,
      // no extra work.
      if (introGroupRef.current) {
        let introOp = 0;
        if (phase === "INTRO") introOp = 1;
        else if (phase === "SALT") introOp = Math.max(0, 1 - phaseProgress * 2.5);
        introGroupRef.current.setAttribute("opacity", introOp.toFixed(3));
      }
      if (introPulseRef.current && (phase === "INTRO" || phase === "SALT")) {
        const pulse = reducedMotion ? 0.85 : 0.55 + 0.4 * Math.sin(cycleMs * 0.004);
        introPulseRef.current.setAttribute("opacity", pulse.toFixed(3));
      }

      // Stats text
      if (statTextRef.current) {
        const newText = computeStats(phase, phaseProgress);
        if (statTextRef.current.textContent !== newText) {
          statTextRef.current.textContent = newText;
        }
      }

      // Master-key strip — visible during EXTRACT and HOLD
      if (phase === "EXTRACT" || phase === "HOLD") {
        const extractProgress = phase === "EXTRACT" ? phaseProgress : 1;
        if (mkGroupRef.current) mkGroupRef.current.setAttribute("opacity", extractProgress.toFixed(3));
        const mks = mkRefsRef.current;
        const mkTexts = mkTextRefsRef.current;
        for (let i = 0; i < MK_CELLS; i++) {
          const cell = mks[i];
          if (!cell) continue;
          const op = 0.8 + 0.2 * Math.sin(cycleMs * 0.003 + i * 0.4);
          cell.setAttribute("opacity", op.toFixed(3));
          const tx = mkTexts[i];
          if (tx) {
            const desired = cellHex(i + 1000, 9); // master-key byte stream
            if (tx.textContent !== desired) tx.textContent = desired;
            if (tx.getAttribute("opacity") !== "1") tx.setAttribute("opacity", "1");
          }
        }
      } else {
        if (mkGroupRef.current) mkGroupRef.current.setAttribute("opacity", "0");
      }

      // Arrows — visible during FILL_2 and FILL_3
      if (phase === "FILL_2" || phase === "FILL_3") {
        if (arrowGroupRef.current) arrowGroupRef.current.setAttribute("opacity", "1");
        const arrows = arrowRefsRef.current;
        const arrowSeed = Math.floor(cycleMs / 600);
        for (let a = 0; a < ARROW_COUNT; a++) {
          const arr = arrows[a];
          if (!arr) continue;
          const r1 = cellRand(arrowSeed * 11 + a, 1);
          const r2 = cellRand(arrowSeed * 11 + a, 2);
          const r3 = cellRand(arrowSeed * 11 + a, 3);
          const r4 = cellRand(arrowSeed * 11 + a, 4);
          const c1 = Math.floor(r1 * GRID_COLS);
          const rr1 = Math.floor(r2 * GRID_ROWS);
          const c2 = Math.floor(r3 * GRID_COLS);
          const rr2 = Math.floor(r4 * GRID_ROWS);
          const x1 = GRID_PAD_X + c1 * cellW + cellW / 2;
          const y1 = GRID_PAD_Y_TOP + rr1 * cellH + cellH / 2;
          const x2 = GRID_PAD_X + c2 * cellW + cellW / 2;
          const y2 = GRID_PAD_Y_TOP + rr2 * cellH + cellH / 2;
          const phaseT = (cycleMs * 0.0015 + a * 0.2) % 1;
          arr.setAttribute("x1", x1.toFixed(1));
          arr.setAttribute("y1", y1.toFixed(1));
          arr.setAttribute("x2", x2.toFixed(1));
          arr.setAttribute("y2", y2.toFixed(1));
          arr.setAttribute("opacity", ((1 - phaseT) * 0.7).toFixed(3));
        }
      } else {
        if (arrowGroupRef.current) arrowGroupRef.current.setAttribute("opacity", "0");
      }

      // ── PHASE-ONLY REACT STATE ─────────────────────────────────────
      // Only setPhaseState when phase ID changes — drives the title /
      // body / phase-dots / dot-glow. ~8 setStates per ~18s cycle.
      if (phase !== lastPhase) {
        lastPhase = phase;
        setPhaseState({ phase, phaseIdx });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startedAtRef.current = 0;
      pausedAtRef.current = 0;
      pauseAccumRef.current = 0;
    };
  }, [effectiveAutoPlay, loop, speed, t.cellOff, t.cellFill, t.cellHot, cellW, cellH, reducedMotion]);

  const currentPhaseDef = PHASES[phaseState.phaseIdx] ?? PHASES[0]!;

  const outerStyle = chromeless
    ? { background: "transparent", padding: 0 }
    : { background: t.bg, borderRadius: 12, padding: 16 };

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
      <FullscreenAffordance
        isFullscreen={isFullscreen}
        onToggle={toggleFullscreen}
        onPrev={stepBack}
        onNext={stepForward}
        accent={t.cellHot}
      />

      {showCaptions && (
        <div style={{ textAlign: "center", paddingBottom: 14, paddingLeft: 120, paddingRight: 120 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, lineHeight: 1.25 }}>
            {currentPhaseDef.title}
          </div>
          <div style={{ fontSize: 14, color: t.text, opacity: 0.85, marginTop: 5, maxWidth: 820, marginLeft: "auto", marginRight: "auto", lineHeight: 1.45 }}>
            {currentPhaseDef.body}
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }}
        aria-label="Argon2id memory-hard derivation visualisation"
      >
        <defs>
          {/* Static halo glow — Daniel 0.2.0: this is the "shimmer back"
              fix. The radial gradient is rendered ONCE and never updated,
              so the browser only blurs the buffer at mount + on container
              resize. Per-frame cost is zero, while the cells get a soft
              underlying glow that reads as the original feel. */}
          <radialGradient id={`argon-halo-${theme}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={t.cellGlow} stopOpacity="0.32" />
            <stop offset="55%" stopColor={t.cellGlow} stopOpacity="0.10" />
            <stop offset="100%" stopColor={t.cellGlow} stopOpacity="0" />
          </radialGradient>
          {/* 0.2.2 master-key strip shimmer — a thin moving highlight band
              traverses the gradient horizontally. Set as a fill on a small
              overlay rect inside the strip; the gradient itself doesn't
              animate, only the rect's transform translates via WAAPI. */}
          <linearGradient id={`argon-keyshimmer-${theme}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={t.cellHot} stopOpacity="0" />
            <stop offset="50%" stopColor={t.cellHot} stopOpacity="0.55" />
            <stop offset="100%" stopColor={t.cellHot} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`argon-bg-${theme}`} cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor={t.bg2} stopOpacity="0" />
            <stop offset="100%" stopColor={t.bg} stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width={VB_W} height={VB_H} fill={t.bg2} />
        <rect width={VB_W} height={VB_H} fill={`url(#argon-bg-${theme})`} />

        {/* Static halo glow behind the grid — restored "sex" without
            per-frame filter cost. */}
        <rect
          x={GRID_PAD_X - 30}
          y={GRID_PAD_Y_TOP - 30}
          width={VB_W - (GRID_PAD_X - 30) * 2}
          height={VB_H - (GRID_PAD_Y_TOP - 30) - (GRID_PAD_Y_BOT - 30)}
          fill={`url(#argon-halo-${theme})`}
          rx={20}
        />

        {/* Live stats strip — text updated imperatively via statTextRef.
            0.2.4: brightened + enlarged for legibility. */}
        <g>
          <text
            ref={statTextRef}
            x={VB_W / 2}
            y={38}
            textAnchor="middle"
            fill={t.text}
            fontSize="17"
            fontFamily="ui-monospace, monospace"
            letterSpacing="0.6"
            fontWeight="bold"
          >
            {computeStats(phaseState.phase, 0)}
          </text>
        </g>

        {/* Memory grid — cells animated via imperative refs */}
        <g>{cellsJsx}</g>

        {/* 0.3.0 — INTRO breathing precursor. Centred over the (empty)
            memory grid during the INTRO phase so the SVG isn't a dead
            canvas while the title narrates. A pulsing dot + halo to the
            left ("your password"), an arrow into a pill ("Argon2id"),
            suggests: a passphrase is about to enter this grid. Fades
            cleanly as SALT kicks in. */}
        <g ref={introGroupRef} opacity="0" pointerEvents="none">
          {(() => {
            const cy = GRID_PAD_Y_TOP + (VB_H - GRID_PAD_Y_TOP - GRID_PAD_Y_BOT) / 2;
            const dotCx = VB_W / 2 - 170;
            const pillX = VB_W / 2 - 40;
            const pillW = 230;
            const pillH = 56;
            const pillY = cy - pillH / 2;
            return (
              <>
                {/* halo behind the pulsing input dot */}
                <circle
                  cx={dotCx}
                  cy={cy}
                  r={42}
                  fill={`url(#argon-halo-${theme})`}
                  opacity={0.9}
                />
                {/* pulsing input dot — opacity driven in the RAF tick */}
                <circle
                  ref={introPulseRef}
                  cx={dotCx}
                  cy={cy}
                  r={14}
                  fill={t.cellHot}
                  opacity={0.85}
                />
                <text
                  x={dotCx}
                  y={cy + 44}
                  textAnchor="middle"
                  fill={t.text}
                  fontSize="13"
                  fontFamily="ui-monospace, monospace"
                  letterSpacing="1.5"
                  fontWeight="bold"
                  opacity={0.85}
                >
                  YOUR PASSPHRASE
                </text>
                {/* arrow from dot into pill */}
                <line
                  x1={dotCx + 22}
                  y1={cy}
                  x2={pillX - 6}
                  y2={cy}
                  stroke={t.accent}
                  strokeWidth={2}
                  opacity={0.65}
                />
                <polygon
                  points={`${pillX - 6},${cy - 5} ${pillX},${cy} ${pillX - 6},${cy + 5}`}
                  fill={t.accent}
                  opacity={0.85}
                />
                {/* Argon2id pill */}
                <rect
                  x={pillX}
                  y={pillY}
                  width={pillW}
                  height={pillH}
                  rx={10}
                  fill={t.bg2}
                  stroke={t.accent}
                  strokeWidth={1.5}
                  opacity={0.9}
                />
                <text
                  x={pillX + pillW / 2}
                  y={cy - 2}
                  textAnchor="middle"
                  fill={t.accent}
                  fontSize="18"
                  fontFamily="ui-monospace, monospace"
                  letterSpacing="2"
                  fontWeight="bold"
                >
                  Argon2id
                </text>
                <text
                  x={pillX + pillW / 2}
                  y={cy + 18}
                  textAnchor="middle"
                  fill={t.muted}
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                  letterSpacing="0.8"
                >
                  memory-hard KDF
                </text>
              </>
            );
          })()}
        </g>

        {/* Random "memory access" arrows during FILL_2 / FILL_3 — group
            opacity + line attributes updated imperatively */}
        <g ref={arrowGroupRef} opacity="0">{arrowsJsx}</g>

        {/* Master key extraction strip — visibility + per-cell opacity
            updated imperatively */}
        <g ref={mkGroupRef} opacity="0">
          <text
            x={VB_W / 2}
            y={VB_H - GRID_PAD_Y_BOT / 2 - 26}
            textAnchor="middle"
            fill={t.accent}
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            letterSpacing="2"
            fontWeight="bold"
          >
            32-BYTE MASTER KEY
          </text>
          {mkCellsJsx}
          {/* 0.2.2 strip shimmer — narrow gradient band travels across the
              key cells via WAAPI. Inherits group opacity so it only shows
              during EXTRACT/HOLD. */}
          <rect
            ref={mkShimmerRef}
            x={(VB_W - MK_CELLS * 16) / 2 - 60}
            y={VB_H - GRID_PAD_Y_BOT / 2 - 14}
            width={120}
            height={24}
            fill={`url(#argon-keyshimmer-${theme})`}
            opacity={0}
            style={{ transformBox: "fill-box", transformOrigin: "0 0", willChange: "transform, opacity", mixBlendMode: "screen" }}
          />
        </g>
      </svg>

      {showCaptions && (
        <div style={{ textAlign: "center", paddingTop: 12, fontSize: 14, color: "#cbd5e1", fontFamily: "ui-monospace, monospace", fontWeight: 600, letterSpacing: "0.5px" }}>
          Argon2id  ·  m = 64 MiB  ·  t = 3 (rounds)  ·  p = 4 (lanes)  ·  out = 32 bytes
        </div>
      )}

      {showControls && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 14 }}>
          {/* 0.2.4 — clickable phase dots. */}
          <div style={{ display: "flex", gap: 8 }}>
            {PHASES.map((p, i) => {
              const isActive = i === phaseState.phaseIdx;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Jump to phase ${i + 1}: ${p.title}`}
                  onClick={() => {
                    const target = (PHASE_BOUNDARIES[i] ?? 0) + (PHASES[i]?.ms ?? 0) * 0.65;
                    setManualMs(target);
                    startedAtRef.current = 0;
                    pauseAccumRef.current = 0;
                    setPaused(true);
                  }}
                  style={{
                    width: isActive ? 28 : 10,
                    height: 10,
                    borderRadius: 5,
                    background: isActive ? t.cellHot : t.cellOff,
                    border: "none",
                    transition: "all 200ms ease",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              );
            })}
          </div>
          {/* 0.2.4 — ◀ Play/Pause ▶ */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              type="button"
              aria-label="Previous phase"
              onClick={() => {
                const idx = phaseState.phaseIdx;
                const newIdx = idx <= 0 ? PHASES.length - 1 : idx - 1;
                const target = (PHASE_BOUNDARIES[newIdx] ?? 0) + (PHASES[newIdx]?.ms ?? 0) * 0.65;
                setManualMs(target);
                startedAtRef.current = 0;
                pauseAccumRef.current = 0;
                setPaused(true);
              }}
              style={{ background: "transparent", color: t.cellHot, border: `1px solid ${t.cellHot}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "ui-monospace, monospace" }}
            >
              ◀
            </button>
            <button
              type="button"
              aria-label={paused || manualMs !== null ? "Play" : "Pause"}
              onClick={() => {
                if (manualMs !== null) {
                  startedAtRef.current = 0;
                  pauseAccumRef.current = 0;
                  setManualMs(null);
                  setPaused(false);
                  return;
                }
                setPaused((v) => !v);
              }}
              style={{ background: t.cellHot, color: t.bg, border: `1px solid ${t.cellHot}`, borderRadius: 6, padding: "6px 18px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "ui-monospace, monospace", letterSpacing: "0.5px", minWidth: 60 }}
            >
              {paused || manualMs !== null ? "▶" : "❚❚"}
            </button>
            <button
              type="button"
              aria-label="Next phase"
              onClick={() => {
                const idx = phaseState.phaseIdx;
                const newIdx = idx >= PHASES.length - 1 ? 0 : idx + 1;
                const target = (PHASE_BOUNDARIES[newIdx] ?? 0) + (PHASES[newIdx]?.ms ?? 0) * 0.65;
                setManualMs(target);
                startedAtRef.current = 0;
                pauseAccumRef.current = 0;
                setPaused(true);
              }}
              style={{ background: "transparent", color: t.cellHot, border: `1px solid ${t.cellHot}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "ui-monospace, monospace" }}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
