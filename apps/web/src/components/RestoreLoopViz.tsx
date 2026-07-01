// @version 0.2.0 @date 2026-06-01
// Changelog:
//   0.2.0 (2026-06-01) — INTRO phase now renders content — no more empty
//     SVG blank during INTRO sub-phase. Renders K dim share-vault
//     placeholders with a soft pulsing halo (breathing precursor) +
//     subtle "ABOUT TO GATHER" hint line. Tees up GATHER without
//     competing with the active animation.
// RestoreLoopViz — the reverse pipeline. After the user has stored their
// shares, they need to come back and reconstruct. This viz shows:
//   1. K vault-shares gathered from their N storage locations
//   2. Each AEAD-decrypted back to raw share bytes
//   3. Lagrange interpolation fits the unique polynomial through K points
//   4. Master key extracted from P(0)
//   5. AEAD-decryption of the actual content with master key
//   6. Original bytes recovered
//
// This is the "round-trip-success" story: every step that protected your
// data, run in reverse, returns it intact. Composes the conceptual moves
// from Argon + Shamir + AEAD without re-running them.

import { useEffect, useRef, useState, useCallback } from "react";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type RestorePhase =
  | "INTRO" | "GATHER" | "DECRYPT" | "INTERPOLATE" | "EXTRACT" | "DECRYPT_CONTENT" | "RESTORED" | "HOLD";

interface PhaseDef {
  readonly id: RestorePhase;
  readonly ms: number;
  readonly title: string;
  readonly body: string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO",           ms: 1400, title: "Time to restore your vault",
    body: "You're back to recover what you stored. The flow we just showed forwards now plays in reverse — every protection unwinds, your secret returns." },
  { id: "GATHER",          ms: 2200, title: "Gather K shares from your locations",
    body: "Visit K of the N storage locations you used (any K — not the same ones each time). Each yields a share-vault holding AEAD-encrypted bytes." },
  { id: "DECRYPT",         ms: 2400, title: "Decrypt each share-vault",
    body: "The cipher reverses. Authentication tags verify integrity — any single bit of tamper and decryption rejects. Inside: raw share bytes (numbers on the curve)." },
  { id: "INTERPOLATE",     ms: 2800, title: "Lagrange interpolation through K points",
    body: "K points define the unique polynomial of degree K-1. The math hands us back the curve we threw away — every coefficient reconstructed exactly." },
  { id: "EXTRACT",         ms: 2000, title: "Extract the master key at P(0)",
    body: "Evaluate the recovered polynomial at x=0. The constant term IS your master key — the same 32 bytes that left this browser to be Shamir-split." },
  { id: "DECRYPT_CONTENT", ms: 2200, title: "Decrypt your vault content",
    body: "Master key in hand, the content AEAD unwraps. Sealed letter / seed / document — whatever you stored, returns byte-identical." },
  { id: "RESTORED",        ms: 1800, title: "Restored — byte-for-byte intact",
    body: "Original bytes ≡ recovered bytes. The pipeline's integrity is provable, not asserted. You verify it yourself; we never touched it." },
  { id: "HOLD",            ms: 1400, title: "Self-custodial restore — no provider required",
    body: "Notice what didn't happen: nobody asked us for permission. The math + your shares + your password are sufficient. The protocol survives us." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface RestoreLoopVizProps {
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly speed?: number;
  readonly showCaptions?: boolean;
  readonly showControls?: boolean;
  readonly chromeless?: boolean;
  readonly theme?: "cyan" | "emerald";
  readonly height?: number;
  readonly n?: number;
  readonly k?: number;
}

interface AnimState {
  readonly phase: RestorePhase;
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
  readonly secret: string;
  readonly grid: string;
}

const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan:    { text: "#e2e8f0", muted: "#94a3b8", bg: "#020617", bg2: "#0b1220", accent: "#22d3ee", accent2: "#67e8f9", secret: "#fbbf24", grid: "#1e293b" },
  emerald: { text: "#e2e8f0", muted: "#94a3b8", bg: "#020a05", bg2: "#06120c", accent: "#10b981", accent2: "#6ee7b7", secret: "#fbbf24", grid: "#14241c" },
};

const VB_W = 1200;
const VB_H = 520;

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }

export function RestoreLoopViz({
  autoPlay = true,
  loop = true,
  speed = 1,
  showCaptions = true,
  showControls = true,
  chromeless = false,
  theme = "cyan",
  height = 480,
  n = 5,
  k = 3,
}: RestoreLoopVizProps): JSX.Element {
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

  const currentPhaseIdx = PHASES.findIndex((p) => p.id === anim.phase);
  const currentPhaseDef = PHASES[currentPhaseIdx] ?? PHASES[0]!;

  // Layout: K vault icons on the left, "decrypt → polynomial fit → master key" on the right
  const vaultRowY = VB_H / 2 - 70;
  const vaultSpacing = 130;
  const vaultStartX = (VB_W - (k - 1) * vaultSpacing - 80) / 2;

  // 0.1.3 — Polynomial display now SPANS the share row exactly, so each
  // share's centre column has a matching curve point directly below it.
  // (Previously the curve was a sine wiggle decoupled from the share
  // positions; Daniel: "curve off the mark, meaningless the way drawn".)
  const polyX0 = vaultStartX - 20;
  const polyX1 = vaultStartX + (k - 1) * vaultSpacing + 100;
  const polyY = VB_H / 2 + 90;
  // Curve formula in one place — reused by the drawn path AND the
  // share→curve dashed lines so they ALWAYS land on the actual curve.
  function curveYAt(x: number): number {
    const u = (x - polyX0) / (polyX1 - polyX0); // 0..1
    return polyY - Math.sin(u * Math.PI * 2) * 50 - Math.cos(u * Math.PI) * 30 + 20;
  }

  const showVaults = anim.phase === "GATHER" || anim.phase === "DECRYPT" || anim.phase === "INTERPOLATE";
  const showDecrypted = anim.phase === "DECRYPT" || anim.phase === "INTERPOLATE" || anim.phase === "EXTRACT";
  const showCurve = anim.phase === "INTERPOLATE" || anim.phase === "EXTRACT" || anim.phase === "DECRYPT_CONTENT" || anim.phase === "RESTORED" || anim.phase === "HOLD";
  const showMasterKey = anim.phase === "EXTRACT" || anim.phase === "DECRYPT_CONTENT" || anim.phase === "RESTORED" || anim.phase === "HOLD";
  const showContent = anim.phase === "DECRYPT_CONTENT" || anim.phase === "RESTORED" || anim.phase === "HOLD";
  const showSuccess = anim.phase === "RESTORED" || anim.phase === "HOLD";

  // Curve drawing — samples the same curveYAt() formula so the path
  // matches the dashed-line drop points exactly.
  function curvePath(): string {
    const segments = 40;
    let d = "";
    for (let i = 0; i <= segments; i++) {
      const x = polyX0 + (polyX1 - polyX0) * (i / segments);
      const y = curveYAt(x);
      d += (i === 0 ? "M" : "L") + ` ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return d;
  }
  const curveDrawProgress = anim.phase === "INTERPOLATE" ? easeOut(anim.phaseProgress) : 1;

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

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }} aria-label="Restore loop visualisation">
        <defs>
          <filter id={`rl-glow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`rl-curve-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.accent} />
            <stop offset="100%" stopColor={t.accent2} />
          </linearGradient>
        </defs>

        <rect width={VB_W} height={VB_H} fill={t.bg2} />

        {/* 0.2.0 — INTRO breathing precursor. Dim K share-vault outlines
            with a soft pulsing halo, hinting at what's about to be
            gathered. No labels — just the silhouette breathing. */}
        {anim.phase === "INTRO" && (
          <g opacity={0.35 + Math.sin(anim.phaseProgress * Math.PI * 2) * 0.15}>
            {Array.from({ length: k }, (_, i) => {
              const x = vaultStartX + i * vaultSpacing;
              const y = vaultRowY;
              return (
                <g key={`intro-v-${i}`}>
                  <rect x={x - 4} y={y - 4} width="88" height="98" rx="8" fill="none" stroke={t.accent} strokeWidth="1" opacity="0.25" filter={`url(#rl-glow-${theme})`} />
                  <rect x={x} y={y} width="80" height="90" rx="6" fill="rgba(148, 163, 184, 0.04)" stroke={t.muted} strokeWidth="1" strokeDasharray="3 4" />
                  <text x={x + 40} y={y + 52} textAnchor="middle" fill={t.muted} fontSize="20" fontFamily="ui-monospace, monospace" opacity="0.6">
                    🔒
                  </text>
                </g>
              );
            })}
            <text x={VB_W / 2} y={vaultRowY + 140} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3" opacity="0.7">
              ABOUT TO GATHER · K = {k} SHARES
            </text>
            <text x={VB_W / 2} y={vaultRowY + 162} textAnchor="middle" fill={t.muted} fontSize="10" fontFamily="ui-monospace, monospace" letterSpacing="1" opacity="0.5">
              forward pipeline reversed — decrypt · interpolate · extract · decrypt · restore
            </text>
          </g>
        )}

        {/* K share vault icons (top row) */}
        {showVaults && Array.from({ length: k }, (_, i) => {
          const x = vaultStartX + i * vaultSpacing;
          const y = vaultRowY;
          const isDecrypted = showDecrypted && (
            anim.phase === "DECRYPT" ? i / k < anim.phaseProgress * 1.2 : true
          );
          return (
            <g key={`v-${i}`}>
              <rect x={x} y={y} width="80" height="90" rx="6" fill={isDecrypted ? "rgba(34, 211, 238, 0.12)" : "rgba(148, 163, 184, 0.08)"} stroke={isDecrypted ? t.accent : t.muted} strokeWidth="1.5" />
              <text x={x + 40} y={y + 22} textAnchor="middle" fill={isDecrypted ? t.accent : t.muted} fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
                SHARE
              </text>
              <text x={x + 40} y={y + 52} textAnchor="middle" fill={isDecrypted ? t.accent2 : t.muted} fontSize="20" fontFamily="ui-monospace, monospace" fontWeight="bold">
                {isDecrypted ? "✓" : "🔒"}
              </text>
              <text x={x + 40} y={y + 78} textAnchor="middle" fill={isDecrypted ? t.accent : t.muted} fontSize="10" fontFamily="ui-monospace, monospace">
                {isDecrypted ? "decrypted" : "locked"}
              </text>
            </g>
          );
        })}

        {/* Polynomial curve (during INTERPOLATE → ) */}
        {showCurve && (
          <g opacity={anim.phase === "DECRYPT_CONTENT" ? 1 - anim.phaseProgress * 0.6 : 1}>
            <path
              d={curvePath()}
              fill="none"
              stroke={`url(#rl-curve-${theme})`}
              strokeWidth="3"
              strokeLinecap="round"
              filter={`url(#rl-glow-${theme})`}
              style={{
                strokeDasharray: 1500,
                strokeDashoffset: 1500 * (1 - curveDrawProgress),
              }}
            />
            {/* 0.1.3 — Dashed lines from each share down to its REAL
                point on the polynomial. Plus a small dot at the curve.
                Only show point labels during INTERPOLATE/EXTRACT — they
                clutter the "VAULT CONTENT RECOVERED" success state. */}
            {curveDrawProgress > 0.5 && Array.from({ length: k }, (_, i) => {
              const cx = vaultStartX + i * vaultSpacing + 40;
              const cyTop = vaultRowY + 90; // bottom of share box
              const cyCurve = curveYAt(cx);
              const lineProgress = Math.min(1, (curveDrawProgress - 0.5) * 2);
              const cyDrawn = cyTop + (cyCurve - cyTop) * lineProgress;
              const showLabels = anim.phase === "INTERPOLATE" || anim.phase === "EXTRACT";
              return (
                <g key={`share-line-${i}`}>
                  <line
                    x1={cx} y1={cyTop}
                    x2={cx} y2={cyDrawn}
                    stroke={t.accent}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.7"
                  />
                  {lineProgress >= 1 && (
                    <>
                      <circle cx={cx} cy={cyCurve} r="5" fill={t.accent2} opacity="0.95" />
                      <circle cx={cx} cy={cyCurve} r="2.5" fill={t.bg} opacity="1" />
                      {showLabels && (
                        <text x={cx} y={cyCurve - 10} textAnchor="middle" fill={t.muted} fontSize="9" fontFamily="ui-monospace, monospace">
                          (x{i + 1}, y{i + 1})
                        </text>
                      )}
                    </>
                  )}
                </g>
              );
            })}
            {(anim.phase === "INTERPOLATE" || anim.phase === "EXTRACT") && (
              <text x={(polyX0 + polyX1) / 2} y={polyY + 70} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="1">
                degree {k - 1} polynomial reconstructed
              </text>
            )}
          </g>
        )}

        {/* Master key extraction (during EXTRACT → ) */}
        {showMasterKey && (
          <g filter={`url(#rl-glow-${theme})`}>
            <rect x={VB_W / 2 - 140} y={polyY - 130} width="280" height="50" rx="8" fill="rgba(251, 191, 36, 0.15)" stroke={t.secret} strokeWidth="2" />
            <text x={VB_W / 2} y={polyY - 113} textAnchor="middle" fill={t.secret} fontSize="10" fontFamily="ui-monospace, monospace" letterSpacing="2" fontWeight="bold">
              MASTER KEY  ·  P(0)
            </text>
            <text x={VB_W / 2} y={polyY - 94} textAnchor="middle" fill={t.secret} fontSize="14" fontFamily="ui-monospace, monospace" fontWeight="bold">
              32 bytes derived ✓
            </text>
          </g>
        )}

        {/* Content decryption box (during DECRYPT_CONTENT) */}
        {showContent && (
          <g opacity={anim.phase === "DECRYPT_CONTENT" ? easeOut(anim.phaseProgress) : 1}>
            <rect x={VB_W / 2 - 200} y={VB_H - 80} width="400" height="50" rx="8" fill={showSuccess ? "rgba(16, 185, 129, 0.15)" : "rgba(34, 211, 238, 0.1)"} stroke={showSuccess ? "#10b981" : t.accent} strokeWidth="2" />
            <text x={VB_W / 2} y={VB_H - 60} textAnchor="middle" fill={showSuccess ? "#6ee7b7" : t.accent2} fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="1.5">
              {showSuccess ? "✓ VAULT CONTENT RECOVERED" : "DECRYPTING CONTENT…"}
            </text>
            <text x={VB_W / 2} y={VB_H - 40} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace">
              {showSuccess ? "byte-identical to the original" : "AEAD reverse with master key"}
            </text>
          </g>
        )}
      </svg>

      {showCaptions && (
        <div style={{ textAlign: "center", paddingTop: 12, fontSize: 14, color: "#cbd5e1", fontFamily: "ui-monospace, monospace", fontWeight: 600, letterSpacing: "0.5px" }}>
          K={k} of N={n} shares required  ·  Lagrange interpolation  ·  no provider, no API, no permission needed
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
            <button type="button"
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
