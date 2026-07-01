// @version 0.2.0 @date 2026-06-01
// Bip39Viz — covers BOTH the "gen" (generate entropy) and "valid" (BIP-39
// checksum verify) pipeline steps as one conceptual moment. 128 bits of
// entropy materialise as a grid of colourful random cells → coalesce
// into 12 BIP-39 word tiles → the last 4 checksum bits glow green to
// signal verification.
//
// CHANGELOG
// 0.2.0 (2026-06-01) — INTRO phase now renders content — no more empty SVG
//   blank during INTRO sub-phase. Adds "expectations skeleton" preview: the
//   final layout (16 byte cells + 12 word tiles) is rendered at ~22% opacity
//   with a soft breathing pulse so the viewer sees WHERE the animation is
//   going before the real cells materialise in ENTROPY. Fades cleanly to 0
//   as ENTROPY phase takes over.

import { useEffect, useRef, useState, useCallback } from "react";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type Bip39Phase = "INTRO" | "ENTROPY" | "WORDS" | "CHECKSUM" | "HOLD";

interface PhaseDef {
  readonly id: Bip39Phase;
  readonly ms: number;
  readonly title: string;
  readonly body: string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO",    ms: 1200, title: "Generate 128 bits of entropy",
    body: "The browser's cryptographic RNG draws 16 random bytes — the same primitive that powers every TLS handshake and crypto wallet keygen on Earth." },
  { id: "ENTROPY",  ms: 2000, title: "16 random bytes appear",
    body: "Each byte is one of 256 possible values. The combinatorial space is 2¹²⁸ ≈ 3.4 × 10³⁸ — more than the atoms in 10 trillion solar systems." },
  { id: "WORDS",    ms: 2400, title: "Encode as 12 BIP-39 words",
    body: "The bits regroup into 12 chunks of 11 bits each. Each chunk indexes into the standard 2048-word BIP-39 dictionary, giving you the mnemonic you can write down." },
  { id: "CHECKSUM", ms: 2000, title: "Verify the checksum",
    body: "The last 4 bits of the 12th word are a SHA-256 checksum over the entropy. Type the wrong word and the checksum fails — a wallet will refuse to import it." },
  { id: "HOLD",     ms: 1400, title: "Recoverable on any compatible wallet",
    body: "BIP-39 is the universal mnemonic standard since 2013. Your 12 words restore on Ledger, Trezor, MetaMask, Phantom — anywhere that speaks BIP-39." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface Bip39VizProps {
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly speed?: number;
  readonly showCaptions?: boolean;
  readonly showControls?: boolean;
  readonly chromeless?: boolean;
  readonly theme?: "cyan" | "emerald";
  readonly height?: number;
}

interface AnimState { readonly phase: Bip39Phase; readonly phaseProgress: number; readonly cycleMs: number; }
interface ThemeColors {
  readonly text: string; readonly muted: string; readonly bg: string; readonly bg2: string;
  readonly cell: string; readonly cellHot: string; readonly accent: string; readonly accent2: string; readonly success: string;
}
const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan:    { text: "#e2e8f0", muted: "#94a3b8", bg: "#020617", bg2: "#0b1220", cell: "#06b6d4", cellHot: "#67e8f9", accent: "#22d3ee", accent2: "#67e8f9", success: "#6ee7b7" },
  emerald: { text: "#e2e8f0", muted: "#94a3b8", bg: "#020a05", bg2: "#06120c", cell: "#059669", cellHot: "#6ee7b7", accent: "#10b981", accent2: "#6ee7b7", success: "#6ee7b7" },
};

const VB_W = 1200;
const VB_H = 480;

// First 12 BIP-39 words — deterministic per cycle variant for the viz.
const SAMPLE_WORDS = [
  ["abandon", "ability", "absorb", "abstract", "accept", "across", "actor", "actual", "adapt", "advance", "afford", "agent"],
  ["always", "amazing", "ancient", "answer", "appear", "april", "arena", "arrange", "arrest", "artist", "aspect", "assist"],
  ["banana", "barrier", "battle", "beauty", "become", "benefit", "between", "biology", "blossom", "brisk", "bundle", "bureau"],
];

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }

function deriveByte(i: number, variant: number): number {
  const v = ((i * 2654435761) ^ (variant * 1597334677)) >>> 0;
  return v & 0xff;
}
function byteToColor(byte: number, base: string): string {
  const intensity = 0.4 + (byte / 255) * 0.55;
  const m = base.match(/^#([0-9a-f]{6})$/i);
  if (!m || !m[1]) return base;
  const r = parseInt(m[1].substring(0, 2), 16);
  const g = parseInt(m[1].substring(2, 4), 16);
  const b = parseInt(m[1].substring(4, 6), 16);
  return `rgb(${Math.round(r * intensity)}, ${Math.round(g * intensity)}, ${Math.round(b * intensity)})`;
}

export function Bip39Viz({
  autoPlay = true,
  loop = true,
  speed = 1,
  showCaptions = true,
  showControls = true,
  chromeless = false,
  theme = "cyan",
  height = 440,
}: Bip39VizProps): JSX.Element {
  const t = THEMES[theme];

  const [anim, setAnim] = useState<AnimState>({ phase: "INTRO", phaseProgress: 0, cycleMs: 0 });
  const [paused, setPaused] = useState(false);
  const [manualMs, setManualMs] = useState<number | null>(null);
  // 0.1.2 — reducedMotion gate REMOVED. The animation IS the lesson.
  const effectiveAutoPlay = autoPlay;
  // 0.1.1 — paused/hovered via refs to stop tick-restart on every interaction (Argon 0.2.1 fix).
  const manualMsRef = useRef<number | null>(manualMs);
  manualMsRef.current = manualMs;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;
  const [variant, setVariant] = useState(0);
  const lastCycleMsRef = useRef(0);

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
  // 0.1.3 — Named step handlers for FullscreenAffordance arrow-key nav.
  const goToPhase = useCallback((newIdx: number): void => {
    const target = (PHASE_BOUNDARIES[newIdx] ?? 0) + (PHASES[newIdx]?.ms ?? 0) * 0.65;
    setManualMs(target);
    startedAtRef.current = 0;
    pauseAccumRef.current = 0;
    setPaused(true);
  }, []);
  const phaseIdxForStep = (): number => PHASES.findIndex((p) => p.id === anim.phase);
  const stepBack = useCallback((): void => {
    const idx = phaseIdxForStep();
    goToPhase(idx <= 0 ? PHASES.length - 1 : idx - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim.phase, goToPhase]);
  const stepForward = useCallback((): void => {
    const idx = phaseIdxForStep();
    goToPhase(idx >= PHASES.length - 1 ? 0 : idx + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim.phase, goToPhase]);
  useArrowStepNav(stepBack, stepForward);
  useRegisterVizSubStep({
    getPhaseIdx: () => PHASES.findIndex((p) => p.id === anim.phase),
    totalPhases: PHASES.length,
    jumpToPhase: goToPhase,
  });

  const computeFromMs = useCallback((cycleMs: number): AnimState => {
    const wrapped = ((cycleMs % TOTAL_CYCLE_MS) + TOTAL_CYCLE_MS) % TOTAL_CYCLE_MS;
    let acc = 0;
    for (const p of PHASES) {
      if (wrapped < acc + p.ms) {
        return { phase: p.id, phaseProgress: easeInOut(Math.max(0, Math.min(1, (wrapped - acc) / p.ms))), cycleMs: wrapped };
      }
      acc += p.ms;
    }
    return { phase: "INTRO", phaseProgress: 0, cycleMs: 0 };
  }, []);

  const lastSetAtRef = useRef(0);
  useEffect(() => {
    if (!effectiveAutoPlay) return;
    const tick = (now: number): void => {
      if (startedAtRef.current === 0) { startedAtRef.current = hasSkippedIntroRef.current ? now : (now - (PHASES[0]?.ms ?? 0)); hasSkippedIntroRef.current = true; } /* skip INTRO on first mount only, NOT on subsequent resets (pause/scrub/phase-jump preserve user position) */
      const manualMsVal = manualMsRef.current;
      if (manualMsVal === null && (pausedRef.current || hoveredRef.current)) {
        if (pausedAtRef.current === 0) pausedAtRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (manualMsVal === null && pausedAtRef.current !== 0) { pauseAccumRef.current += now - pausedAtRef.current; pausedAtRef.current = 0; }
      const elapsed = manualMsVal !== null ? manualMsVal : (now - startedAtRef.current - pauseAccumRef.current) * speed;
      if (!loop && elapsed >= TOTAL_CYCLE_MS) {
        setAnim({ phase: "HOLD", phaseProgress: 1, cycleMs: TOTAL_CYCLE_MS - 1 });
        return;
      }
      if (now - lastSetAtRef.current >= 33) {
        lastSetAtRef.current = now;
        setAnim(computeFromMs(elapsed));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startedAtRef.current = 0; pausedAtRef.current = 0; pauseAccumRef.current = 0; lastSetAtRef.current = 0;
    };
  }, [effectiveAutoPlay, loop, speed, computeFromMs]);

  useEffect(() => {
    if (lastCycleMsRef.current > TOTAL_CYCLE_MS * 0.7 && anim.cycleMs < TOTAL_CYCLE_MS * 0.3) {
      setVariant((v) => (v + 1) % SAMPLE_WORDS.length);
    }
    lastCycleMsRef.current = anim.cycleMs;
  }, [anim.cycleMs]);

  const currentPhaseIdx = PHASES.findIndex((p) => p.id === anim.phase);
  const currentPhaseDef = PHASES[currentPhaseIdx] ?? PHASES[0]!;
  const words = SAMPLE_WORDS[variant] ?? SAMPLE_WORDS[0]!;

  // ── Layout ────────────────────────────────────────────────────────────
  // Top half: 16 byte cells in a horizontal row (during ENTROPY phase).
  // Bottom half: 12 word tiles in a 3-row × 4-col grid (during WORDS+).
  const byteRowY = 140;
  const byteCellSize = 50;
  const byteRowW = 16 * (byteCellSize + 6);
  const byteRowX = (VB_W - byteRowW) / 2;

  const wordTileW = 170;
  const wordTileH = 50;
  const wordGap = 14;
  const wordCols = 4;
  const wordRowH = wordTileH + wordGap;
  const wordsBlockW = wordCols * wordTileW + (wordCols - 1) * wordGap;
  const wordsBlockX = (VB_W - wordsBlockW) / 2;
  const wordsBlockY = 240;

  // Visibility
  const showEntropy = anim.phase === "ENTROPY" || anim.phase === "WORDS";
  const showWords = anim.phase === "WORDS" || anim.phase === "CHECKSUM" || anim.phase === "HOLD";
  const checksumGlow = anim.phase === "CHECKSUM" ? anim.phaseProgress : (anim.phase === "HOLD" ? 1 : 0);

  const outerStyle = chromeless ? { background: "transparent", padding: 0 } : { background: t.bg, borderRadius: 12, padding: 16 };

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
          <div style={{ fontSize: 14, color: t.text, opacity: 0.85, marginTop: 5, maxWidth: 820, marginLeft: "auto", marginRight: "auto", lineHeight: 1.45 }}>{currentPhaseDef.body}</div>
        </div>
      )}

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }} aria-label="BIP-39 mnemonic generation visualisation">
        <rect width={VB_W} height={VB_H} fill={t.bg2} />

        {/* 0.2.0 — INTRO "expectations skeleton": faded preview of the final
            layout so the SVG canvas is never blank. Soft breathing pulse hints
            that this is a precursor; fades to 0 as ENTROPY begins to claim the
            stage with the real, fully-saturated cells. */}
        {(anim.phase === "INTRO" || (anim.phase === "ENTROPY" && anim.phaseProgress < 0.35)) && (() => {
          const introHold = anim.phase === "INTRO" ? 1 : Math.max(0, 1 - anim.phaseProgress / 0.35);
          const breathe = 0.85 + 0.15 * Math.sin((anim.cycleMs / 1000) * Math.PI * 1.6);
          const baseOpacity = 0.22 * introHold * breathe;
          return (
            <g opacity={baseOpacity} aria-hidden="true">
              {/* Top label preview */}
              <text x={VB_W / 2} y={byteRowY - 30} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2" fontWeight="bold">
                16 BYTES · 128 BITS OF ENTROPY
              </text>
              {/* 16 byte cell outlines */}
              {Array.from({ length: 16 }, (_, i) => {
                const x = byteRowX + i * (byteCellSize + 6);
                return (
                  <rect key={`intro-b-${i}`} x={x} y={byteRowY} width={byteCellSize} height={byteCellSize}
                    fill="none" stroke={t.accent} strokeWidth={1} strokeDasharray="3 3" rx={4} />
                );
              })}
              {/* Bottom label preview */}
              <text x={VB_W / 2} y={wordsBlockY - 14} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2" fontWeight="bold">
                12 BIP-39 WORDS · YOUR MNEMONIC
              </text>
              {/* 12 word tile outlines (3×4 grid) */}
              {Array.from({ length: 12 }, (_, i) => {
                const col = i % wordCols;
                const row = Math.floor(i / wordCols);
                const x = wordsBlockX + col * (wordTileW + wordGap);
                const y = wordsBlockY + row * wordRowH;
                return (
                  <rect key={`intro-w-${i}`} x={x} y={y} width={wordTileW} height={wordTileH}
                    fill="none" stroke={t.accent2} strokeWidth={1} strokeDasharray="4 4" rx={6} />
                );
              })}
            </g>
          );
        })()}

        {/* Top section label */}
        {showEntropy && (
          <text x={VB_W / 2} y={byteRowY - 30} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2" fontWeight="bold">
            16 BYTES · 128 BITS OF ENTROPY
          </text>
        )}

        {/* 16 byte cells */}
        {showEntropy && Array.from({ length: 16 }, (_, i) => {
          const byte = deriveByte(i, variant);
          const x = byteRowX + i * (byteCellSize + 6);
          const appearProgress = anim.phase === "ENTROPY"
            ? Math.max(0, Math.min(1, anim.phaseProgress * 1.5 - i / 16))
            : 1;
          const fadeOut = anim.phase === "WORDS" ? 1 - anim.phaseProgress * 0.6 : 1;
          return (
            <g key={`b-${i}`} opacity={appearProgress * fadeOut}>
              <rect x={x} y={byteRowY} width={byteCellSize} height={byteCellSize} fill={byteToColor(byte, t.cell)} rx={4} />
              <text x={x + byteCellSize / 2} y={byteRowY + byteCellSize + 14} textAnchor="middle" fill={t.muted} fontSize="9" fontFamily="ui-monospace, monospace">
                {byte.toString(16).padStart(2, "0")}
              </text>
            </g>
          );
        })}

        {/* Bottom section label */}
        {showWords && (
          <text x={VB_W / 2} y={wordsBlockY - 14} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2" fontWeight="bold">
            12 BIP-39 WORDS · YOUR MNEMONIC
          </text>
        )}

        {/* 12 word tiles in 3x4 grid */}
        {showWords && words.map((word, i) => {
          const col = i % wordCols;
          const row = Math.floor(i / wordCols);
          const x = wordsBlockX + col * (wordTileW + wordGap);
          const y = wordsBlockY + row * wordRowH;
          const appearProgress = anim.phase === "WORDS"
            ? Math.max(0, Math.min(1, anim.phaseProgress * 1.5 - i / 12))
            : 1;
          const isChecksum = i === 11;
          const glowing = isChecksum && checksumGlow > 0;
          const fill = glowing ? "rgba(110, 231, 183, 0.18)" : "rgba(34, 211, 238, 0.10)";
          const stroke = glowing ? t.success : t.accent;
          return (
            <g key={`w-${i}`} opacity={appearProgress}>
              <rect x={x} y={y} width={wordTileW} height={wordTileH} fill={fill} stroke={stroke} strokeWidth={glowing ? 2 : 1.5} rx={6} />
              <text x={x + 14} y={y + 22} fill={t.muted} fontSize="10" fontFamily="ui-monospace, monospace">
                {String(i + 1).padStart(2, "0")}
              </text>
              <text x={x + wordTileW / 2} y={y + 33} textAnchor="middle" fill={glowing ? t.success : t.accent2} fontSize="16" fontFamily="ui-monospace, monospace" fontWeight="bold">
                {word}
              </text>
            </g>
          );
        })}

        {/* Checksum verification banner */}
        {(anim.phase === "CHECKSUM" || anim.phase === "HOLD") && (
          <g opacity={easeOut(Math.min(1, checksumGlow * 1.5))}>
            <rect x={VB_W / 2 - 230} y={VB_H - 56} width="460" height="36" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke={t.success} strokeWidth="2" />
            <text x={VB_W / 2} y={VB_H - 32} textAnchor="middle" fill={t.success} fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
              ✓ BIP-39 CHECKSUM VALID · 12-WORD MNEMONIC
            </text>
          </g>
        )}
      </svg>

      {showCaptions && (
        <div style={{ textAlign: "center", paddingTop: 12, fontSize: 14, color: "#cbd5e1", fontFamily: "ui-monospace, monospace", fontWeight: 600, letterSpacing: "0.5px" }}>
          BIP-39 · 12 words · 128-bit entropy + 4-bit checksum · English wordlist (2048 words)
        </div>
      )}

      {showControls && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {PHASES.map((p, i) => {
              const isActive = i === currentPhaseIdx;
              return (
                <button key={p.id} type="button" aria-label={`Jump to phase ${i + 1}: ${p.title}`}
                  onClick={() => {
                    const target = (PHASE_BOUNDARIES[i] ?? 0) + (PHASES[i]?.ms ?? 0) * 0.65;
                    setManualMs(target);
                    startedAtRef.current = 0; pauseAccumRef.current = 0; setPaused(true);
                  }}
                  style={{ width: isActive ? 28 : 10, height: 10, borderRadius: 5, background: isActive ? t.accent2 : "rgba(148, 163, 184, 0.4)", border: "none", transition: "all 200ms ease", cursor: "pointer", padding: 0 }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button type="button" aria-label="Previous phase"
              onClick={() => {
                const newIdx = currentPhaseIdx <= 0 ? PHASES.length - 1 : currentPhaseIdx - 1;
                const target = (PHASE_BOUNDARIES[newIdx] ?? 0) + (PHASES[newIdx]?.ms ?? 0) * 0.65;
                setManualMs(target);
                startedAtRef.current = 0; pauseAccumRef.current = 0; setPaused(true);
              }}
              style={{ background: "transparent", color: t.accent2, border: `1px solid ${t.accent2}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "ui-monospace, monospace" }}>◀</button>
            <button type="button" aria-label={paused || manualMs !== null ? "Play" : "Pause"}
              onClick={() => {
                if (manualMs !== null) { startedAtRef.current = 0; pauseAccumRef.current = 0; setManualMs(null); setPaused(false); return; }
                setPaused((v) => !v);
              }}
              style={{ background: t.accent2, color: t.bg, border: `1px solid ${t.accent2}`, borderRadius: 6, padding: "6px 18px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "ui-monospace, monospace", letterSpacing: "0.5px", minWidth: 60 }}>
              {paused || manualMs !== null ? "▶" : "❚❚"}
            </button>
            <button type="button" aria-label="Next phase"
              onClick={() => {
                const newIdx = currentPhaseIdx >= PHASES.length - 1 ? 0 : currentPhaseIdx + 1;
                const target = (PHASE_BOUNDARIES[newIdx] ?? 0) + (PHASES[newIdx]?.ms ?? 0) * 0.65;
                setManualMs(target);
                startedAtRef.current = 0; pauseAccumRef.current = 0; setPaused(true);
              }}
              style={{ background: "transparent", color: t.accent2, border: `1px solid ${t.accent2}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "ui-monospace, monospace" }}>▶</button>
          </div>
        </div>
      )}
    </div>
  );
}
