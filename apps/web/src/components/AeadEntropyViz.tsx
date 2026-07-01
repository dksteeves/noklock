// @version 0.3.1 @date 2026-06-01
// 0.3.1 — Copy fix: PICK-phase title "Pick a cipher per share" →
//         "Assign a cipher per share". NoKLock assigns the cipher
//         deterministically per (master, share-index); the user does
//         not pick. Removes the "as if the user chooses" reading.
// 0.3.0 — INTRO phase now renders content — no more empty SVG blank
//         during INTRO sub-phase. OPTION A (expectations skeleton):
//         both plaintext + ciphertext grids fade in at ~22% opacity
//         with a gentle breathing pulse (sin wave on cycleMs) so the
//         viewer gets a "where this is going" preview that brightens
//         as PLAIN phase takes over. Per-cell text labels stay hidden
//         during INTRO so the preview reads as quiet skeleton, not
//         clutter. Centre pipeline + entropy text already visible —
//         INTRO now matches that level of presence on both sides.
// 0.2.2 — SEX-UP pass: plaintext + ciphertext halo gradient stops
//         brightened (0.22 → 0.35 centre, 0.06 → 0.11 mid). Both grids
//         now read more luminous against the dark backdrop. Still
//         rendered once at mount, zero per-frame cost.
// 0.2.0 — TIER 1 PERF: imperative refs for the 256 cells (128 plaintext +
//         128 ciphertext), group-opacity, particles, entropy text, and
//         the cipher pipeline label. React state setPhaseState fires only
//         when phase ID or variant changes. Per-frame React reconciliation
//         drops from ~256 cell diffs at 30 Hz → 0. The cells animate at
//         the full 60 Hz via direct DOM mutation.
//
//         Static halo glow restored behind both grids (one filter, never
//         re-rendered) so the visual richness from the early version is
//         back — at zero per-frame cost.
// 0.1.0 — Initial implementation.

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type AeadPhase = "INTRO" | "PLAIN" | "PICK" | "ENCRYPT" | "ENTROPY" | "VERIFY" | "DECRYPT" | "HOLD";

interface PhaseDef {
  readonly id: AeadPhase;
  readonly ms: number;
  readonly title: string;
  readonly body: string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO",   ms: 1400, title: "Each share is encrypted before it leaves your browser",
    body: "Before a Shamir share goes anywhere, it gets wrapped with an authenticated cipher. Same primitive used in TLS, Signal, and WireGuard." },
  { id: "PLAIN",   ms: 2200, title: "Plaintext has structure",
    body: "Your share bytes carry patterns — repeated values, low entropy, recognisable structure. Anyone reading them could deduce what they hold." },
  { id: "PICK",    ms: 1800, title: "Assign a cipher per share",
    body: "Each share rolls XChaCha20-Poly1305 or AES-256-GCM at random — twin tracks of audited authenticated encryption. No single algorithm is a single point of failure." },
  { id: "ENCRYPT", ms: 3000, title: "Encrypt — bytes become indistinguishable from noise",
    body: "The cipher mixes your share with a 256-bit key and a fresh nonce. Output is statistically uniform — any pattern in the plaintext is erased." },
  { id: "ENTROPY", ms: 2200, title: "Ciphertext = uniform random",
    body: "Entropy ≈ 8.0 bits per byte (the maximum). The ciphertext is provably indistinguishable from random noise to anyone without the key." },
  { id: "VERIFY",  ms: 2000, title: "Authentication tag — tamper-evident",
    body: "A 128-bit MAC tag computed over the ciphertext + associated data. If a single bit is flipped in storage, the tag fails and decryption rejects." },
  { id: "DECRYPT", ms: 2400, title: "Decrypt — the share returns intact",
    body: "Given the right key + nonce, the ciphertext flows back to byte-identical plaintext. Tag verification runs first; only valid ciphertext gets decrypted." },
  { id: "HOLD",    ms: 1600, title: "AEAD = confidentiality + integrity in one primitive",
    body: "Same construction protecting modern internet traffic — peer-reviewed for 15+ years, deployed at planet scale, audited browser-side implementation." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
// Cumulative phase start times, so the manual ◀/▶ step buttons can jump
// straight to the start of any phase. Added 0.2.4 (Daniel).
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface AeadEntropyVizProps {
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
  readonly text: string;
  readonly muted: string;
  readonly bg: string;
  readonly bg2: string;
  readonly accent: string;
  readonly accent2: string;
  readonly plaintext: string;
  readonly ciphertext: string;
  readonly plaintextGlow: string;
  readonly ciphertextGlow: string;
  readonly pipe: string;
  readonly grid: string;
}

const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan: {
    text:           "#e2e8f0",
    muted:          "#94a3b8",
    bg:             "#020617",
    bg2:            "#0b1220",
    accent:         "#22d3ee",
    accent2:        "#67e8f9",
    plaintext:      "#06b6d4",
    ciphertext:     "#67e8f9",
    plaintextGlow:  "#22d3ee",
    ciphertextGlow: "#67e8f9",
    pipe:           "#22d3ee",
    grid:           "#1e293b",
  },
  emerald: {
    text:           "#e2e8f0",
    muted:          "#94a3b8",
    bg:             "#020a05",
    bg2:            "#06120c",
    accent:         "#10b981",
    accent2:        "#6ee7b7",
    plaintext:      "#059669",
    ciphertext:     "#6ee7b7",
    plaintextGlow:  "#10b981",
    ciphertextGlow: "#6ee7b7",
    pipe:           "#10b981",
    grid:           "#14241c",
  },
};

const VB_W = 1200;
const VB_H = 520;
const GRID_COLS = 16;
const GRID_ROWS = 8;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;
const CELL_SIZE = 22;
const CELL_GAP = 2;
const GRID_PIXEL_W = GRID_COLS * (CELL_SIZE + CELL_GAP);
const GRID_PIXEL_H = GRID_ROWS * (CELL_SIZE + CELL_GAP);
const PARTICLE_COUNT = 12; // 6 per side

function plaintextByte(i: number, variant: number): number {
  const wave = Math.sin((i / TOTAL_CELLS) * Math.PI * 3 + variant) * 60 + 90;
  const row = Math.floor(i / GRID_COLS);
  const col = i % GRID_COLS;
  return Math.floor((wave + row * 8 + col * 3 + variant * 7) % 256);
}

function ciphertextByte(i: number, variant: number, salt: number): number {
  const v = ((i * 2654435761) ^ (variant * 1597334677) ^ (salt * 3266489917)) >>> 0;
  return v & 0xff;
}

function byteToColor(value: number, baseColor: string): string {
  const intensity = 0.35 + (value / 255) * 0.55;
  const m = baseColor.match(/^#([0-9a-f]{6})$/i);
  if (!m || !m[1]) return baseColor;
  const r = parseInt(m[1].substring(0, 2), 16);
  const g = parseInt(m[1].substring(2, 4), 16);
  const b = parseInt(m[1].substring(4, 6), 16);
  return `rgb(${Math.round(r * intensity)}, ${Math.round(g * intensity)}, ${Math.round(b * intensity)})`;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const CIPHERS = ["XChaCha20-Poly1305", "AES-256-GCM"];

// 0.3.0 — INTRO returns a low (skeleton) opacity for BOTH sides so the
// viewer gets a "here's where this is going" preview during INTRO,
// instead of staring at an empty dark canvas. The breathing pulse is
// layered on at the call site using cycleMs.
const INTRO_SKELETON_OPACITY = 0.22;
function computeGridOpacity(phase: AeadPhase, phaseProgress: number, isPlain: boolean): number {
  if (isPlain) {
    switch (phase) {
      case "INTRO":   return INTRO_SKELETON_OPACITY;
      case "PLAIN":   return INTRO_SKELETON_OPACITY + (1 - INTRO_SKELETON_OPACITY) * phaseProgress;
      case "PICK":    return 1;
      case "ENCRYPT": return 1 - phaseProgress * 0.7;
      case "ENTROPY": return 0.3;
      case "VERIFY":  return 0.3;
      case "DECRYPT": return phaseProgress;
      case "HOLD":    return 1;
    }
  } else {
    switch (phase) {
      case "INTRO":   return INTRO_SKELETON_OPACITY;
      case "PLAIN":   return 0;
      case "PICK":    return 0;
      case "ENCRYPT": return phaseProgress;
      case "ENTROPY": return 1;
      case "VERIFY":  return 1;
      case "DECRYPT": return 1 - phaseProgress;
      case "HOLD":    return 0;
    }
  }
}

function computeLiveEntropy(phase: AeadPhase, phaseProgress: number): number {
  if (phase === "PLAIN") return 4.2 + phaseProgress * 0.3;
  if (phase === "PICK") return 4.5;
  if (phase === "ENCRYPT") return 4.5 + phaseProgress * 3.5;
  return 7.99;
}

interface PhaseState {
  readonly phase: AeadPhase;
  readonly phaseIdx: number;
  readonly variant: number;
}

export function AeadEntropyViz({
  autoPlay = true,
  loop = true,
  speed = 1,
  showCaptions = true,
  showControls = true,
  chromeless = false,
  theme = "cyan",
  height = 480,
}: AeadEntropyVizProps): JSX.Element {
  const t = THEMES[theme];

  // React state — driven ONLY by phase + variant changes.
  const [phaseState, setPhaseState] = useState<PhaseState>({ phase: "INTRO", phaseIdx: 0, variant: 0 });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  // 0.2.4 — manualMs lets ◀/▶ step buttons jump the tick to a target
  // elapsed time. When non-null, the tick lock-syncs to it instead of
  // following wall-clock.
  const [manualMs, setManualMs] = useState<number | null>(null);
  // 0.2.3 — reducedMotion gate REMOVED. The animation IS the lesson.
  const effectiveAutoPlay = autoPlay;

  // 0.2.1 — paused/hovered routed via refs to stop useEffect re-runs
  // resetting the timing accumulator. See ArgonGridViz 0.2.1 comment.
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;
  const manualMsRef = useRef<number | null>(manualMs);
  manualMsRef.current = manualMs;

  // Imperative refs
  const plainRefsRef = useRef<(SVGRectElement | null)[]>([]);
  if (plainRefsRef.current.length !== TOTAL_CELLS) {
    plainRefsRef.current = new Array<SVGRectElement | null>(TOTAL_CELLS).fill(null);
  }
  const cipherRefsRef = useRef<(SVGRectElement | null)[]>([]);
  if (cipherRefsRef.current.length !== TOTAL_CELLS) {
    cipherRefsRef.current = new Array<SVGRectElement | null>(TOTAL_CELLS).fill(null);
  }
  // 0.2.3 — per-cell hex byte text refs. Plaintext shows ASCII-ish
  // bytes (visually "readable-ish"); ciphertext shows random-looking
  // hex. Visual contrast makes "encryption changes the bytes" obvious.
  const plainTextRefsRef = useRef<(SVGTextElement | null)[]>([]);
  if (plainTextRefsRef.current.length !== TOTAL_CELLS) {
    plainTextRefsRef.current = new Array<SVGTextElement | null>(TOTAL_CELLS).fill(null);
  }
  const cipherTextRefsRef = useRef<(SVGTextElement | null)[]>([]);
  if (cipherTextRefsRef.current.length !== TOTAL_CELLS) {
    cipherTextRefsRef.current = new Array<SVGTextElement | null>(TOTAL_CELLS).fill(null);
  }
  const particleRefsRef = useRef<(SVGCircleElement | null)[]>([]);
  if (particleRefsRef.current.length !== PARTICLE_COUNT) {
    particleRefsRef.current = new Array<SVGCircleElement | null>(PARTICLE_COUNT).fill(null);
  }
  const plainGroupRef = useRef<SVGGElement | null>(null);
  const cipherGroupRef = useRef<SVGGElement | null>(null);
  const particleGroupRef = useRef<SVGGElement | null>(null);
  const verifyGroupRef = useRef<SVGGElement | null>(null);
  const entropyTextRef = useRef<SVGTextElement | null>(null);
  const cipherLabelRef = useRef<SVGTextElement | null>(null);

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
  useArrowStepNav(stepBack, stepForward);
  useRegisterVizSubStep({
    getPhaseIdx: () => phaseState.phaseIdx,
    totalPhases: PHASES.length,
    jumpToPhase: goToPhase,
  });
  const toggleFullscreen = useCallback((): void => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void containerRef.current.requestFullscreen();
  }, []);

  // Layout
  const plainGridX = (VB_W / 2 - GRID_PIXEL_W) / 2;
  const cipherGridX = VB_W / 2 + (VB_W / 2 - GRID_PIXEL_W) / 2;
  const gridY = (VB_H - GRID_PIXEL_H) / 2;

  // Memoised cell grids — render once, then mutated via refs.
  const plainCellsJsx = useMemo(() => (
    Array.from({ length: TOTAL_CELLS }, (_, i) => {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const x = plainGridX + col * (CELL_SIZE + CELL_GAP);
      const y = gridY + row * (CELL_SIZE + CELL_GAP);
      return (
        <g key={`p-${i}`}>
          <rect
            ref={(el) => { plainRefsRef.current[i] = el; }}
            x={x} y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={t.plaintext}
            opacity="1"
            rx={2}
          />
          <text
            ref={(el) => { plainTextRefsRef.current[i] = el; }}
            x={x + CELL_SIZE / 2}
            y={y + CELL_SIZE / 2 + 3.5}
            textAnchor="middle"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fontWeight="bold"
            fill={t.bg}
            opacity="0"
            pointerEvents="none"
          />
        </g>
      );
    })
  ), [t.plaintext, t.bg, plainGridX, gridY]);

  const cipherCellsJsx = useMemo(() => (
    Array.from({ length: TOTAL_CELLS }, (_, i) => {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const x = cipherGridX + col * (CELL_SIZE + CELL_GAP);
      const y = gridY + row * (CELL_SIZE + CELL_GAP);
      return (
        <g key={`c-${i}`}>
          <rect
            ref={(el) => { cipherRefsRef.current[i] = el; }}
            x={x} y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={t.ciphertext}
            opacity="1"
            rx={2}
          />
          <text
            ref={(el) => { cipherTextRefsRef.current[i] = el; }}
            x={x + CELL_SIZE / 2}
            y={y + CELL_SIZE / 2 + 3.5}
            textAnchor="middle"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fontWeight="bold"
            fill={t.bg}
            opacity="0"
            pointerEvents="none"
          />
        </g>
      );
    })
  ), [t.ciphertext, t.bg, cipherGridX, gridY]);

  const particlesJsx = useMemo(() => (
    Array.from({ length: PARTICLE_COUNT }, (_, i) => (
      <circle
        key={`fp-${i}`}
        ref={(el) => { particleRefsRef.current[i] = el; }}
        cx={0}
        cy={VB_H / 2}
        r="3.5"
        fill={t.pipe}
        opacity="0"
      />
    ))
  ), [t.pipe]);

  // The RAF tick — full 60fps, direct DOM mutation, React state only on
  // phase or variant change.
  useEffect(() => {
    if (!effectiveAutoPlay) return;
    let lastPhase: AeadPhase | null = null;
    let lastVariant = 0;
    let lastCycleMs = 0;
    let currentVariant = phaseState.variant;

    const tick = (now: number): void => {
      if (startedAtRef.current === 0) { startedAtRef.current = hasSkippedIntroRef.current ? now : (now - (PHASES[0]?.ms ?? 0)); hasSkippedIntroRef.current = true; } /* skip INTRO on first mount only, NOT on subsequent resets (pause/scrub/phase-jump preserve user position) */
      // 0.2.4 — If user clicked ◀ or ▶ to step to a phase, manualMsRef
      // holds the target elapsed value. The tick treats that as the
      // authoritative time and bypasses pause/speed/accum.
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
        if (lastPhase !== "HOLD") {
          lastPhase = "HOLD";
          setPhaseState({ phase: "HOLD", phaseIdx: PHASES.length - 1, variant: currentVariant });
        }
        return;
      }

      const wrapped = ((elapsed % TOTAL_CYCLE_MS) + TOTAL_CYCLE_MS) % TOTAL_CYCLE_MS;
      let acc = 0;
      let phase: AeadPhase = "INTRO";
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

      // Cycle-wrap → variant flip
      if (lastCycleMs > TOTAL_CYCLE_MS * 0.7 && cycleMs < TOTAL_CYCLE_MS * 0.3) {
        currentVariant = (currentVariant + 1) % 5;
      }
      lastCycleMs = cycleMs;

      const cipher = CIPHERS[currentVariant % 2] ?? CIPHERS[0]!;

      // ── IMPERATIVE DOM UPDATES ─────────────────────────────────────

      // 0.3.0 — INTRO breath pulse: gentle sin wave on cycleMs so the
      // skeleton-preview grids feel "alive" rather than flat. ±20% of
      // the base skeleton opacity, ~1.2s period. Zero cost — one cos()
      // call.
      const introBreath = phase === "INTRO"
        ? 1 + 0.2 * Math.sin((cycleMs / 1000) * Math.PI * 1.6)
        : 1;

      // Plaintext grid
      const plainOpacity = computeGridOpacity(phase, phaseProgress, true) * introBreath;
      if (plainGroupRef.current) plainGroupRef.current.setAttribute("opacity", plainOpacity.toFixed(3));
      if (plainOpacity > 0.01) {
        const plains = plainRefsRef.current;
        const pTexts = plainTextRefsRef.current;
        const encryptProgress = phase === "ENCRYPT" ? phaseProgress : (
          phase === "INTRO" || phase === "PLAIN" || phase === "PICK" ? 0 : 1
        );
        // 0.3.0 — During INTRO, keep per-cell text labels hidden so the
        // skeleton reads as a quiet preview, not cluttered text.
        const showCellText = phase !== "INTRO";
        for (let i = 0; i < TOTAL_CELLS; i++) {
          const cell = plains[i];
          if (!cell) continue;
          const byte = plaintextByte(i, currentVariant);
          const color = byteToColor(byte, t.plaintext);
          const cellFill = phase === "ENCRYPT" && i / TOTAL_CELLS < encryptProgress ? 0.3 : 1;
          cell.setAttribute("fill", color);
          cell.setAttribute("opacity", cellFill.toFixed(3));
          // Plaintext shows the byte as printable-ASCII-ish (a–z + a few)
          // — gives the user a strong visual "this is text-ish data".
          const tx = pTexts[i];
          if (tx) {
            const ch = String.fromCharCode(0x61 + (byte % 26)); // a..z
            if (tx.textContent !== ch) tx.textContent = ch;
            const op = showCellText ? (cellFill * 0.95).toFixed(3) : "0";
            if (tx.getAttribute("opacity") !== op) tx.setAttribute("opacity", op);
          }
        }
      } else {
        // grid is hidden — also hide labels so they don't ghost.
        const pTexts = plainTextRefsRef.current;
        for (let i = 0; i < TOTAL_CELLS; i++) {
          const tx = pTexts[i];
          if (tx && tx.getAttribute("opacity") !== "0") tx.setAttribute("opacity", "0");
        }
      }

      // Ciphertext grid
      const cipherOpacity = computeGridOpacity(phase, phaseProgress, false) * introBreath;
      if (cipherGroupRef.current) cipherGroupRef.current.setAttribute("opacity", cipherOpacity.toFixed(3));
      if (cipherOpacity > 0.01) {
        const ciphers = cipherRefsRef.current;
        const cTexts = cipherTextRefsRef.current;
        const saltStep = Math.floor(cycleMs / 300);
        // 0.3.0 — During INTRO, keep per-cell hex labels hidden too.
        const showCellText = phase !== "INTRO";
        for (let i = 0; i < TOTAL_CELLS; i++) {
          const cell = ciphers[i];
          if (!cell) continue;
          const byte = ciphertextByte(i, currentVariant, saltStep);
          const color = byteToColor(byte, t.ciphertext);
          const cellShow = phase === "ENCRYPT" ? Math.max(0, Math.min(1, phaseProgress * 1.5 - i / TOTAL_CELLS)) : 1;
          const cellHide = phase === "DECRYPT" ? 1 - phaseProgress : 1;
          const opacity = cellShow * cellHide;
          cell.setAttribute("fill", color);
          cell.setAttribute("opacity", opacity.toFixed(3));
          // Ciphertext shows raw 2-char hex bytes — looks unambiguously
          // random vs the printable-letter plaintext.
          const tx = cTexts[i];
          if (tx) {
            const hex = byte.toString(16).padStart(2, "0");
            if (tx.textContent !== hex) tx.textContent = hex;
            const op = showCellText ? (opacity * 0.95).toFixed(3) : "0";
            if (tx.getAttribute("opacity") !== op) tx.setAttribute("opacity", op);
          }
        }
      } else {
        const cTexts = cipherTextRefsRef.current;
        for (let i = 0; i < TOTAL_CELLS; i++) {
          const tx = cTexts[i];
          if (tx && tx.getAttribute("opacity") !== "0") tx.setAttribute("opacity", "0");
        }
      }

      // Cipher label
      if (cipherLabelRef.current && cipherLabelRef.current.textContent !== cipher) {
        cipherLabelRef.current.textContent = cipher;
      }

      // Flow particles — visible during ENCRYPT / DECRYPT
      if (phase === "ENCRYPT" || phase === "DECRYPT") {
        if (particleGroupRef.current) particleGroupRef.current.setAttribute("opacity", "1");
        const particles = particleRefsRef.current;
        const dir = phase === "DECRYPT" ? -1 : 1;
        // First half — between plain grid and cipher pipe (left → right when ENCRYPT)
        for (let p = 0; p < 6; p++) {
          const c = particles[p];
          if (!c) continue;
          const phaseT = (cycleMs * 0.002 + p * 0.17) % 1;
          const px = dir > 0
            ? plainGridX + GRID_PIXEL_W + (VB_W / 2 - 90 - (plainGridX + GRID_PIXEL_W)) * phaseT
            : cipherGridX - (cipherGridX - (VB_W / 2 + 90)) * phaseT;
          c.setAttribute("cx", px.toFixed(1));
          c.setAttribute("opacity", (1 - phaseT * 0.5).toFixed(3));
        }
        // Second half — between cipher pipe and cipher grid
        for (let p = 0; p < 6; p++) {
          const c = particles[6 + p];
          if (!c) continue;
          const phaseT = (cycleMs * 0.002 + p * 0.17 + 0.5) % 1;
          const px = dir > 0
            ? VB_W / 2 + 90 + (cipherGridX - (VB_W / 2 + 90)) * phaseT
            : (VB_W / 2 - 90) - ((VB_W / 2 - 90) - (plainGridX + GRID_PIXEL_W)) * phaseT;
          c.setAttribute("cx", px.toFixed(1));
          c.setAttribute("opacity", (1 - phaseT * 0.5).toFixed(3));
        }
      } else {
        if (particleGroupRef.current) particleGroupRef.current.setAttribute("opacity", "0");
      }

      // Verify tag — visible during VERIFY
      if (verifyGroupRef.current) {
        verifyGroupRef.current.setAttribute("opacity", phase === "VERIFY" ? phaseProgress.toFixed(3) : "0");
      }

      // Live entropy text
      if (entropyTextRef.current) {
        const liveEntropy = computeLiveEntropy(phase, phaseProgress);
        const newContent = liveEntropy.toFixed(2);
        // Update the inner tspan (the numeric value)
        const tspan = entropyTextRef.current.querySelector("tspan");
        if (tspan && tspan.textContent !== newContent) {
          tspan.textContent = newContent;
        }
      }

      // ── PHASE / VARIANT REACT STATE ────────────────────────────────
      if (phase !== lastPhase || currentVariant !== lastVariant) {
        lastPhase = phase;
        lastVariant = currentVariant;
        setPhaseState({ phase, phaseIdx, variant: currentVariant });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAutoPlay, loop, speed, t.plaintext, t.ciphertext, t.pipe]);

  const currentPhaseDef = PHASES[phaseState.phaseIdx] ?? PHASES[0]!;
  const cipher = CIPHERS[phaseState.variant % 2] ?? CIPHERS[0]!;

  const outerStyle = chromeless
    ? { background: "transparent", padding: 0 }
    : { background: t.bg, borderRadius: 12, padding: 16 };

  const offlineState = useOfflineState();
  const skipMoodFilter = useSkipMoodFilter();
  return (
    <div
      ref={containerRef}
      style={{ ...outerStyle, ...(isFullscreen ? { background: "#020617", padding: 32 } : {}), color: t.text, position: "relative", filter: skipMoodFilter ? "none" : offlineMoodFilter(offlineState), transition: "filter 600ms ease" }}
      onMouseEnter={chromeless || isFullscreen ? undefined : () => setHovered(true)}
      onMouseLeave={chromeless || isFullscreen ? undefined : () => setHovered(false)}
    >
      <OfflineMoodPill />
      <FullscreenAffordance
        isFullscreen={isFullscreen}
        onToggle={toggleFullscreen}
        onPrev={stepBack}
        onNext={stepForward}
        accent={t.accent}
      />

      {showCaptions && (
        <div style={{ textAlign: "center", paddingBottom: 14, paddingLeft: 120, paddingRight: 120 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, lineHeight: 1.25 }}>{currentPhaseDef.title}</div>
          <div style={{ fontSize: 14, color: t.text, opacity: 0.85, marginTop: 5, maxWidth: 820, marginLeft: "auto", marginRight: "auto", lineHeight: 1.45 }}>
            {currentPhaseDef.body}
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }} aria-label="AEAD encryption visualisation">
        <defs>
          <pattern id={`aead-bg-grid-${theme}`} width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={t.grid} strokeWidth="0.5" />
          </pattern>
          {/* 0.2.2 — halo stops brightened (0.22 → 0.35 centre, 0.06 →
              0.11 mid). Still rendered once, zero per-frame cost. */}
          <radialGradient id={`aead-halo-plain-${theme}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={t.plaintextGlow} stopOpacity="0.35" />
            <stop offset="55%" stopColor={t.plaintextGlow} stopOpacity="0.11" />
            <stop offset="100%" stopColor={t.plaintextGlow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`aead-halo-cipher-${theme}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={t.ciphertextGlow} stopOpacity="0.35" />
            <stop offset="55%" stopColor={t.ciphertextGlow} stopOpacity="0.11" />
            <stop offset="100%" stopColor={t.ciphertextGlow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={VB_W} height={VB_H} fill={t.bg2} />
        <rect width={VB_W} height={VB_H} fill={`url(#aead-bg-grid-${theme})`} opacity="0.4" />

        {/* Halo glows behind each grid */}
        <rect x={plainGridX - 30} y={gridY - 30} width={GRID_PIXEL_W + 60} height={GRID_PIXEL_H + 60} fill={`url(#aead-halo-plain-${theme})`} rx={20} />
        <rect x={cipherGridX - 30} y={gridY - 30} width={GRID_PIXEL_W + 60} height={GRID_PIXEL_H + 60} fill={`url(#aead-halo-cipher-${theme})`} rx={20} />

        {/* Labels for the two halves — 0.2.4 brightened + enlarged. */}
        <text x={VB_W / 4} y={40} textAnchor="middle" fill={t.accent} fontSize="16" fontFamily="ui-monospace, monospace" letterSpacing="2.5" fontWeight="bold">
          PLAINTEXT  ·  STRUCTURED
        </text>
        <text x={3 * VB_W / 4} y={40} textAnchor="middle" fill={t.accent} fontSize="16" fontFamily="ui-monospace, monospace" letterSpacing="2.5" fontWeight="bold">
          CIPHERTEXT  ·  UNIFORM RANDOM
        </text>

        {/* Plaintext grid — cells animated imperatively */}
        <g ref={plainGroupRef} opacity="0">{plainCellsJsx}</g>

        {/* Ciphertext grid — cells animated imperatively */}
        <g ref={cipherGroupRef} opacity="0">{cipherCellsJsx}</g>

        {/* Center cipher pipeline */}
        <g>
          <rect x={VB_W / 2 - 90} y={VB_H / 2 - 28} width={180} height={56} rx={8} fill="rgba(2,6,23,0.65)" stroke={t.pipe} strokeWidth="2" />
          <text ref={cipherLabelRef} x={VB_W / 2} y={VB_H / 2 + 5} textAnchor="middle" fill={t.accent2} fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="bold">
            {cipher}
          </text>
          <text x={VB_W / 2} y={VB_H / 2 + 24} textAnchor="middle" fill={t.muted} fontSize="10" fontFamily="ui-monospace, monospace" letterSpacing="1">
            key + nonce + AAD
          </text>

          {/* Flow particles — refs assigned for imperative mutation */}
          <g ref={particleGroupRef} opacity="0">{particlesJsx}</g>

          {/* Verify tag — opacity updated imperatively */}
          <g ref={verifyGroupRef} opacity="0">
            <rect x={VB_W / 2 - 60} y={VB_H / 2 + 38} width={120} height={26} rx={4} fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1.5" />
            <text x={VB_W / 2} y={VB_H / 2 + 55} textAnchor="middle" fill="#6ee7b7" fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="1.5" fontWeight="bold">
              ✓ TAG VERIFIED
            </text>
          </g>
        </g>

        {/* Live entropy stat at bottom — 0.2.4 brightened + enlarged. */}
        <g>
          <text ref={entropyTextRef} x={VB_W / 2} y={VB_H - 40} textAnchor="middle" fill={t.text} fontSize="17" fontFamily="ui-monospace, monospace" letterSpacing="0.6" fontWeight="bold">
            entropy: <tspan fill={t.accent2} fontWeight="bold">4.20</tspan> bits/byte  ·  (max 8.00)
          </text>
        </g>
      </svg>

      {showCaptions && (
        <div style={{ textAlign: "center", paddingTop: 12, fontSize: 14, color: "#cbd5e1", fontFamily: "ui-monospace, monospace", fontWeight: 600, letterSpacing: "0.5px" }}>
          XChaCha20-Poly1305 (24-byte nonce) · AES-256-GCM (12-byte nonce) · 128-bit MAC tag · per-share random cipher
        </div>
      )}

      {showControls && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 12 }}>
          {/* Clickable phase dots — jump to any phase. */}
          <div style={{ display: "flex", gap: 8 }}>
            {PHASES.map((p, i) => {
              const isActive = i === phaseState.phaseIdx;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Jump to phase ${i + 1}: ${p.title}`}
                  onClick={() => {
                    // 0.2.5 — land at 65% through the phase so the user
                    // sees the phase's narrative mid-stream, not the
                    // empty 0%-progress frame.
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
                    background: isActive ? t.accent2 : "rgba(148, 163, 184, 0.4)",
                    border: "none",
                    transition: "all 200ms ease",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              );
            })}
          </div>
          {/* 0.2.4 — ◀ Play / Pause ▶ row. */}
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
              style={{ background: "transparent", color: t.accent2, border: `1px solid ${t.accent2}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "ui-monospace, monospace" }}
            >
              ◀
            </button>
            <button
              type="button"
              aria-label={paused || manualMs !== null ? "Play" : "Pause"}
              onClick={() => {
                if (manualMs !== null) {
                  // Resume autoplay from the current frame.
                  startedAtRef.current = 0;
                  pauseAccumRef.current = 0;
                  setManualMs(null);
                  setPaused(false);
                  return;
                }
                setPaused((v) => !v);
              }}
              style={{ background: t.accent2, color: t.bg, border: `1px solid ${t.accent2}`, borderRadius: 6, padding: "6px 18px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "ui-monospace, monospace", letterSpacing: "0.5px", minWidth: 60 }}
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
              style={{ background: "transparent", color: t.accent2, border: `1px solid ${t.accent2}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "ui-monospace, monospace" }}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
