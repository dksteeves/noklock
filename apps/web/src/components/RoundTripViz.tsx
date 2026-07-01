// @version 0.2.0 @date 2026-06-01
// RoundTripViz — the celebratory finale. Original bytes ≡ reconstructed
// bytes, shown as side-by-side strips with each byte highlighted in
// sequence to confirm the match. Then a final green "INTEGRITY VERIFIED".
//
// Smaller than the other vizzes — this is the moment of validation, not
// a teaching beat. ~8s loop.
//
// CHANGELOG
// 0.2.0 (2026-06-01) — INTRO phase now renders content — no more empty SVG
//   blank during INTRO sub-phase. Option A "expectations skeleton": the
//   two byte strips are previewed at ~25% opacity during INTRO and brighten
//   into full intensity as STRIPS phase begins. Strip labels also fade in.
//   A subtle "ABOUT TO VERIFY · 32 / 32" pre-banner sits at the bottom
//   during INTRO. Zero new per-frame cost (opacity derived from phase).

import { useEffect, useRef, useState, useCallback } from "react";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type RoundTripPhase = "INTRO" | "STRIPS" | "MATCH_SCAN" | "SUCCESS" | "HOLD";

interface PhaseDef {
  readonly id: RoundTripPhase;
  readonly ms: number;
  readonly title: string;
  readonly body: string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO",      ms: 1200, title: "Verify the round-trip",            body: "The protocol's promise: what went in comes out byte-identical. Let's prove it." },
  { id: "STRIPS",     ms: 1400, title: "Original vs Recovered — byte by byte", body: "Two strips of 32 bytes. The original (before the pipeline ran) and the recovered (after the pipeline ran in reverse)." },
  { id: "MATCH_SCAN", ms: 3000, title: "Byte-by-byte comparison",          body: "Each pair checked in order. A single mismatch would halt the comparison — there are none." },
  { id: "SUCCESS",    ms: 1600, title: "Integrity verified ✓",              body: "Bit-for-bit equality across all 32 bytes. The cryptographic round-trip is sound — your data is exactly what it was." },
  { id: "HOLD",       ms: 1200, title: "Provable, not asserted",            body: "Run it on your machine. Inspect every byte. No black box; no trust required." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface RoundTripVizProps {
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly speed?: number;
  readonly showCaptions?: boolean;
  readonly showControls?: boolean;
  readonly chromeless?: boolean;
  readonly theme?: "cyan" | "emerald";
  readonly height?: number;
}

interface AnimState {
  readonly phase: RoundTripPhase;
  readonly phaseProgress: number;
  readonly cycleMs: number;
}

interface ThemeColors {
  readonly text: string;
  readonly muted: string;
  readonly bg: string;
  readonly bg2: string;
  readonly accent: string;
  readonly accent2: string;
  readonly success: string;
  readonly success2: string;
}

const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan:    { text: "#e2e8f0", muted: "#94a3b8", bg: "#020617", bg2: "#0b1220", accent: "#22d3ee", accent2: "#67e8f9", success: "#10b981", success2: "#6ee7b7" },
  emerald: { text: "#e2e8f0", muted: "#94a3b8", bg: "#020a05", bg2: "#06120c", accent: "#10b981", accent2: "#6ee7b7", success: "#10b981", success2: "#6ee7b7" },
};

const VB_W = 1200;
const VB_H = 460;
const BYTE_COUNT = 32;
const BYTE_W = 28;
const BYTE_GAP = 4;
const STRIP_W = BYTE_COUNT * (BYTE_W + BYTE_GAP);

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Same deterministic byte values for original + recovered (the whole point
// of the success animation: they're equal).
function byteValue(i: number, variant: number): number {
  const v = ((i * 2654435761) ^ (variant * 1597334677)) >>> 0;
  return v & 0xff;
}
function byteToColor(value: number, base: string): string {
  const intensity = 0.45 + (value / 255) * 0.5;
  const m = base.match(/^#([0-9a-f]{6})$/i);
  if (!m || !m[1]) return base;
  const r = parseInt(m[1].substring(0, 2), 16);
  const g = parseInt(m[1].substring(2, 4), 16);
  const b = parseInt(m[1].substring(4, 6), 16);
  return `rgb(${Math.round(r * intensity)}, ${Math.round(g * intensity)}, ${Math.round(b * intensity)})`;
}

export function RoundTripViz({
  autoPlay = true,
  loop = true,
  speed = 1,
  showCaptions = true,
  showControls = true,
  chromeless = false,
  theme = "cyan",
  height = 420,
}: RoundTripVizProps): JSX.Element {
  const t = THEMES[theme];

  const [anim, setAnim] = useState<AnimState>({ phase: "INTRO", phaseProgress: 0, cycleMs: 0 });
  const [paused, setPaused] = useState(false);
  const [manualMs, setManualMs] = useState<number | null>(null);
  // 0.1.2 — reducedMotion gate REMOVED. The animation IS the lesson.
  const effectiveAutoPlay = autoPlay;
  // 0.1.1 — paused/hovered via refs (Argon 0.2.1 fix).
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
  const goToPhase = useCallback((newIdx: number): void => {
    const target = (PHASE_BOUNDARIES[newIdx] ?? 0) + (PHASES[newIdx]?.ms ?? 0) * 0.65;
    setManualMs(target);
    startedAtRef.current = 0;
    pauseAccumRef.current = 0;
    setPaused(true);
  }, []);
  const stepBack = useCallback((): void => {
    const idx = PHASES.findIndex((p) => p.id === anim.phase);
    goToPhase(idx <= 0 ? PHASES.length - 1 : idx - 1);
  }, [anim.phase, goToPhase]);
  const stepForward = useCallback((): void => {
    const idx = PHASES.findIndex((p) => p.id === anim.phase);
    goToPhase(idx >= PHASES.length - 1 ? 0 : idx + 1);
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
      if (manualMsVal === null && pausedAtRef.current !== 0) {
        pauseAccumRef.current += now - pausedAtRef.current;
        pausedAtRef.current = 0;
      }
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
      startedAtRef.current = 0;
      pausedAtRef.current = 0;
      pauseAccumRef.current = 0;
      lastSetAtRef.current = 0;
    };
  }, [effectiveAutoPlay, loop, speed, computeFromMs]);

  useEffect(() => {
    if (lastCycleMsRef.current > TOTAL_CYCLE_MS * 0.7 && anim.cycleMs < TOTAL_CYCLE_MS * 0.3) {
      setVariant((v) => (v + 1) % 4);
    }
    lastCycleMsRef.current = anim.cycleMs;
  }, [anim.cycleMs]);

  const currentPhaseIdx = PHASES.findIndex((p) => p.id === anim.phase);
  const currentPhaseDef = PHASES[currentPhaseIdx] ?? PHASES[0]!;

  // 0.2.0 — INTRO no longer hides the strips; it previews them at ~25%
  // opacity and brightens into full intensity as STRIPS phase begins.
  // This kills the "empty dark canvas" dead-air during INTRO.
  const isIntro = anim.phase === "INTRO";
  const stripOpacity = isIntro ? 0.22 + anim.phaseProgress * 0.10 : 1;
  const labelOpacity = isIntro ? 0.35 + anim.phaseProgress * 0.25 : 1;
  const scanProgress = anim.phase === "MATCH_SCAN" ? anim.phaseProgress : (
    anim.phase === "STRIPS" || isIntro ? 0 : 1
  );
  const allMatched = anim.phase === "SUCCESS" || anim.phase === "HOLD";

  const stripY1 = VB_H / 2 - 70;
  const stripY2 = VB_H / 2 + 10;
  const stripX = (VB_W - STRIP_W) / 2;

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
          <div style={{ fontSize: 22, fontWeight: 700, color: allMatched ? t.success2 : t.text, lineHeight: 1.25 }}>{currentPhaseDef.title}</div>
          <div style={{ fontSize: 14, color: t.text, opacity: 0.85, marginTop: 5, maxWidth: 820, marginLeft: "auto", marginRight: "auto", lineHeight: 1.45 }}>{currentPhaseDef.body}</div>
        </div>
      )}

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }} aria-label="Round-trip byte-match visualisation">
        <defs>
          {/* 0.2.0 — static radial halo behind the byte strips. Rendered
              once, zero per-frame cost. */}
          <radialGradient id={`rt-halo-${theme}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={t.accent} stopOpacity="0.32" />
            <stop offset="55%" stopColor={t.accent} stopOpacity="0.10" />
            <stop offset="100%" stopColor={t.accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={VB_W} height={VB_H} fill={t.bg2} />

        {/* 0.2.0 halo behind the strip region — gives the centre a glow
            without a per-frame filter. */}
        <rect
          x={VB_W * 0.06}
          y={VB_H * 0.18}
          width={VB_W * 0.88}
          height={VB_H * 0.64}
          fill={`url(#rt-halo-${theme})`}
          rx={20}
        />

        {/* 0.2.0 — strips always rendered; opacity controlled per-phase so
            INTRO previews them at ~25% and they brighten into full intensity
            at the STRIPS phase. Kills the empty-canvas dead-air. */}
        <g opacity={stripOpacity}>
            {/* Labels */}
            <text x={VB_W / 2} y={stripY1 - 16} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2" fontWeight="bold" opacity={labelOpacity}>
              ORIGINAL · 32 BYTES (BEFORE PIPELINE)
            </text>
            <text x={VB_W / 2} y={stripY2 + BYTE_W + 24} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2" fontWeight="bold" opacity={labelOpacity}>
              RECOVERED · 32 BYTES (AFTER FULL ROUND-TRIP)
            </text>

            {/* Original strip */}
            {Array.from({ length: BYTE_COUNT }, (_, i) => {
              const x = stripX + i * (BYTE_W + BYTE_GAP);
              const byte = byteValue(i, variant);
              const matched = scanProgress * BYTE_COUNT > i;
              return (
                <rect key={`orig-${i}`} x={x} y={stripY1} width={BYTE_W} height={BYTE_W} fill={byteToColor(byte, t.accent)} opacity={1} rx={2} stroke={matched ? t.success2 : "none"} strokeWidth={matched ? 1.5 : 0} />
              );
            })}

            {/* Recovered strip */}
            {Array.from({ length: BYTE_COUNT }, (_, i) => {
              const x = stripX + i * (BYTE_W + BYTE_GAP);
              const byte = byteValue(i, variant);
              const matched = scanProgress * BYTE_COUNT > i;
              return (
                <rect key={`rec-${i}`} x={x} y={stripY2} width={BYTE_W} height={BYTE_W} fill={byteToColor(byte, t.accent)} opacity={1} rx={2} stroke={matched ? t.success2 : "none"} strokeWidth={matched ? 1.5 : 0} />
              );
            })}
        </g>

        {/* 0.2.0 — INTRO pre-banner. Subtle muted-tone overlay at the
            bottom telling the viewer what's about to happen. Fades out
            as STRIPS phase kicks in. */}
        {isIntro && (
          <g opacity={Math.max(0, 1 - anim.phaseProgress * 0.6)}>
            <rect x={VB_W / 2 - 230} y={VB_H - 50} width="460" height="32" rx="6" fill="rgba(34, 211, 238, 0.08)" stroke={t.muted} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="4 4" />
            <text x={VB_W / 2} y={VB_H - 30} textAnchor="middle" fill={t.muted} fontSize="12" fontFamily="ui-monospace, monospace" letterSpacing="2" fontWeight="bold">
              ABOUT TO VERIFY · 32 BYTES IN ≡ 32 BYTES OUT
            </text>
          </g>
        )}

        {!isIntro && (
          <>
            {/* Match scanner cursor (during MATCH_SCAN) */}
            {anim.phase === "MATCH_SCAN" && (() => {
              const cursorX = stripX + scanProgress * STRIP_W;
              return (
                <g>
                  <line x1={cursorX} y1={stripY1 - 6} x2={cursorX} y2={stripY2 + BYTE_W + 6} stroke={t.success2} strokeWidth="2" filter={`url(#rt-glow-${theme})`} />
                </g>
              );
            })()}

            {/* Match check marks (during SUCCESS) */}
            {allMatched && (() => {
              const checkY = (stripY1 + stripY2 + BYTE_W) / 2;
              return (
                <g>
                  {Array.from({ length: BYTE_COUNT }, (_, i) => {
                    const x = stripX + i * (BYTE_W + BYTE_GAP) + BYTE_W / 2;
                    return <text key={`m-${i}`} x={x} y={checkY + 4} textAnchor="middle" fill={t.success2} fontSize="14" fontWeight="bold">✓</text>;
                  })}
                </g>
              );
            })()}

            {/* SUCCESS banner */}
            {allMatched && (
              <g filter={`url(#rt-glow-${theme})`}>
                <rect x={VB_W / 2 - 250} y={VB_H - 50} width="500" height="36" rx="6" fill="rgba(16, 185, 129, 0.18)" stroke={t.success} strokeWidth="2" />
                <text x={VB_W / 2} y={VB_H - 26} textAnchor="middle" fill={t.success2} fontSize="14" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
                  INTEGRITY VERIFIED · 32 / 32 BYTES MATCH
                </text>
              </g>
            )}
          </>
        )}
      </svg>

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
                  style={{ width: isActive ? 28 : 10, height: 10, borderRadius: 5, background: isActive ? t.success2 : "rgba(148, 163, 184, 0.4)", border: "none", transition: "all 200ms ease", cursor: "pointer", padding: 0 }}
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
              style={{ background: "transparent", color: t.success2, border: `1px solid ${t.success2}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "ui-monospace, monospace" }}>◀</button>
          <button
            type="button"
            onClick={() => {
              if (manualMs !== null) { startedAtRef.current = 0; pauseAccumRef.current = 0; setManualMs(null); setPaused(false); return; }
              setPaused((v) => !v);
            }}
            style={{ background: t.success2, color: t.bg, border: `1px solid ${t.success2}`, borderRadius: 6, padding: "6px 18px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "ui-monospace, monospace", letterSpacing: "0.5px", minWidth: 60 }}
          >
            {paused || manualMs !== null ? "▶" : "❚❚"}
          </button>
            <button type="button" aria-label="Next phase"
              onClick={() => {
                const newIdx = currentPhaseIdx >= PHASES.length - 1 ? 0 : currentPhaseIdx + 1;
                const target = (PHASE_BOUNDARIES[newIdx] ?? 0) + (PHASES[newIdx]?.ms ?? 0) * 0.65;
                setManualMs(target);
                startedAtRef.current = 0; pauseAccumRef.current = 0; setPaused(true);
              }}
              style={{ background: "transparent", color: t.success2, border: `1px solid ${t.success2}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontFamily: "ui-monospace, monospace" }}>▶</button>
          </div>
        </div>
      )}
    </div>
  );
}
