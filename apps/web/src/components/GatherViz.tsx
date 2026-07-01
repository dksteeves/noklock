// @version 0.1.0 @date 2026-06-01
// GatherViz — the ONLINE moment at the START of restore. The heir has
// (eventually) received the manifest — a small JSON listing the URLs of
// the N share-vault files. They go online and download ANY K of those N
// — they do not need all N, and they don't need any specific subset:
// any K satisfies the SLIP-39 threshold-scheme math.
//
// Visual mirror of DistributeViz: M cloud destinations on the LEFT, the
// heir's local "K share-vaults retrieved" pile on the RIGHT, arrows
// flying packets back. Captions hammer the K-of-N point: any K works,
// you do not need all N. Footer legend reads
// "K share-vaults gathered · need K of N · any K works".
//
// After GATHER the airgap is RE-ENGAGED for restore — this is the LAST
// online step in the heir's flow.

import { useEffect, useRef, useState, useCallback } from "react";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type GatherPhase = "INTRO" | "MANIFEST" | "FETCH" | "ENOUGH" | "READY" | "HOLD";

interface PhaseDef {
  readonly id: GatherPhase;
  readonly ms: number;
  readonly title: string;
  readonly body: string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO",    ms: 1400, title: "Heir online — gather share-vaults",
    body: "The heir has received the manifest (the small JSON listing where every share lives). They go online once to collect K share-vaults, then they go OFFLINE for the actual restore." },
  { id: "MANIFEST", ms: 1800, title: "The manifest names where the shares live",
    body: "The Ed25519 signature on the manifest proves it came from the owner. The body of the manifest lists N URLs — one per share-vault. The heir reads URLs from this list." },
  { id: "FETCH",    ms: 3200, title: "Fetch any K of the N URLs",
    body: "The heir downloads K share-vault files (HTTPS GET). The remaining N-K can stay where they are — they're not needed. Each downloaded file is still AEAD-encrypted ciphertext." },
  { id: "ENOUGH",   ms: 1800, title: "Any K of the N works",
    body: "It does NOT matter WHICH K. Lost one provider? Use the others. Some providers slow? Pick the fastest. The threshold scheme tolerates any subset of size K." },
  { id: "READY",    ms: 1800, title: "K share-vaults retrieved — now go offline",
    body: "The heir now has K encrypted files locally. Restore from here is FULLY OFFLINE — decrypt each, interpolate the polynomial, recover the master, decrypt the content. The network is no longer needed." },
  { id: "HOLD",     ms: 1600, title: "User only needs K, not all N",
    body: "The K-of-N math is the whole point: lost shares, dead providers, account locks — none of these block recovery as long as K survive. The owner picked N > K precisely for this margin." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface GatherVizProps {
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly speed?: number;
  readonly showCaptions?: boolean;
  readonly showControls?: boolean;
  readonly chromeless?: boolean;
  readonly theme?: "cyan" | "emerald";
  readonly height?: number;
  /** N total storage destinations the owner used. Default 5. */
  readonly n?: number;
  /** K threshold (number of shares the heir actually fetches). Default 3. */
  readonly k?: number;
}

interface AnimState {
  readonly phase: GatherPhase;
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
  readonly cloud: string;
  readonly grid: string;
}

const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan:    { text: "#e2e8f0", muted: "#94a3b8", bg: "#020617", bg2: "#0b1220", accent: "#22d3ee", accent2: "#67e8f9", cloud: "#f59e0b", grid: "#1e293b" },
  emerald: { text: "#e2e8f0", muted: "#94a3b8", bg: "#020a05", bg2: "#06120c", accent: "#10b981", accent2: "#6ee7b7", cloud: "#f59e0b", grid: "#14241c" },
};

const VB_W = 1200;
const VB_H = 520;

const CLOUD_LABELS = ["iCloud", "Drive", "Dropbox", "OneDrive", "S3", "Box", "Mega", "pCloud"];

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }

export function GatherViz({
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
}: GatherVizProps): JSX.Element {
  const t = THEMES[theme];

  const [anim, setAnim] = useState<AnimState>({ phase: "INTRO", phaseProgress: 0, cycleMs: 0 });
  const [paused, setPaused] = useState(false);
  const [manualMs, setManualMs] = useState<number | null>(null);
  const effectiveAutoPlay = autoPlay;
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
      if (startedAtRef.current === 0) { startedAtRef.current = hasSkippedIntroRef.current ? now : (now - (PHASES[0]?.ms ?? 0)); hasSkippedIntroRef.current = true; }
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

  // Layout: N cloud tiles on the LEFT, heir's local pile on the RIGHT.
  const cloudX = 180;
  const heirX = 980;
  const cloudSpacing = 70;
  const cloudColTop = (VB_H - n * cloudSpacing) / 2 + 20;
  const heirPileTop = (VB_H - k * 60) / 2 + 20;
  const heirSpacing = 70;

  // Choose K of N — fixed pseudo-random selection so the same K appear
  // each cycle (first K indices skipping every second from N): for n=5,
  // k=3 we pick indices [0, 2, 4]; for n=5, k=3 alternative would be [1,
  // 2, 4]. We'll use [0, 1, 3] for visual clarity.
  const chosenSet = (() => {
    const s = new Set<number>();
    // Spread K picks across N positions
    for (let i = 0; i < k; i++) {
      const idx = Math.floor((i + 0.5) * n / k);
      s.add(Math.min(n - 1, idx));
    }
    // Ensure exactly k entries
    let extra = 0;
    while (s.size < k && extra < n) {
      if (!s.has(extra)) s.add(extra);
      extra++;
    }
    return s;
  })();

  const fetchProgress =
    anim.phase === "FETCH" ? easeOut(anim.phaseProgress) :
    anim.phase === "ENOUGH" || anim.phase === "READY" || anim.phase === "HOLD" ? 1 : 0;
  const heirVisible =
    anim.phase === "ENOUGH" || anim.phase === "READY" || anim.phase === "HOLD" ? 1 :
    anim.phase === "FETCH" ? Math.max(0, anim.phaseProgress - 0.6) * 2.5 : 0;

  const outerStyle = chromeless ? { background: "transparent", padding: 0 } : { background: t.bg, borderRadius: 12, padding: 16 };

  const offlineState = useOfflineState();
  const skipMoodFilter = useSkipMoodFilter();
  return (
    <div
      ref={containerRef}
      style={{ ...outerStyle, ...(isFullscreen ? { background: "#020617", padding: 32 } : {}), color: t.text, position: "relative", filter: skipMoodFilter ? "none" : offlineMoodFilter(offlineState), transition: "filter 600ms ease" }}
      onMouseEnter={chromeless || isFullscreen ? undefined : () => setHovered(true)}
      onMouseLeave={chromeless || isFullscreen ? undefined : () => setHovered(false)}
      aria-label="Heir gathers K share-vaults from storage"
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

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }} aria-label="Heir gathers K share-vaults from storage">
        <defs>
          <filter id={`gather-glow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`gather-flight-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.cloud} />
            <stop offset="100%" stopColor={t.accent} />
          </linearGradient>
          <marker id={`gather-arrow-${theme}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,5 L0,10 z" fill={t.accent2} />
          </marker>
        </defs>

        <rect width={VB_W} height={VB_H} fill={t.bg2} />

        {/* Column headers */}
        <text x={cloudX + 30} y={36} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3">
          STORAGE DESTINATIONS (N = {n})
        </text>
        <text x={heirX + 30} y={36} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3">
          HEIR&apos;S LOCAL PILE (K = {k})
        </text>

        {/* INTRO breathing precursor */}
        {anim.phase === "INTRO" && (
          <g opacity={0.35 + Math.sin(anim.phaseProgress * Math.PI * 2) * 0.15}>
            <text x={VB_W / 2} y={VB_H / 2 + 200} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3" opacity="0.7">
              ABOUT TO GATHER · ANY {k} OF {n} SHARES
            </text>
            <text x={VB_W / 2} y={VB_H / 2 + 222} textAnchor="middle" fill={t.muted} fontSize="10" fontFamily="ui-monospace, monospace" letterSpacing="1" opacity="0.5">
              online once · then airgapped for the rest of restore
            </text>
          </g>
        )}

        {/* MANIFEST phase — a manifest icon in the centre, glowing */}
        {(anim.phase === "MANIFEST" || anim.phase === "INTRO") && (
          <g transform={`translate(${VB_W / 2} ${VB_H / 2 - 30})`} opacity={anim.phase === "MANIFEST" ? 1 : 0.35}>
            <rect x="-60" y="-40" width="120" height="80" rx="6" fill={t.bg} stroke={t.accent} strokeWidth="1.5" filter={`url(#gather-glow-${theme})`} />
            <text x="0" y="-18" textAnchor="middle" fill={t.muted} fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="2">MANIFEST</text>
            <text x="0" y="0" textAnchor="middle" fill={t.accent} fontSize="11" fontFamily="ui-monospace, monospace">{`{ urls: [...] }`}</text>
            <text x="0" y="18" textAnchor="middle" fill={t.accent2} fontSize="9" fontFamily="ui-monospace, monospace">Ed25519 ✓</text>
            <text x="0" y="32" textAnchor="middle" fill={t.muted} fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.7">signed by owner</text>
          </g>
        )}

        {/* N cloud tiles on the LEFT */}
        {anim.phase !== "INTRO" && Array.from({ length: n }, (_, i) => {
          const x = cloudX;
          const y = cloudColTop + i * cloudSpacing;
          const isChosen = chosenSet.has(i);
          const myFetchThreshold = (() => {
            // Order the chosen indices for staggered animation
            const arr = Array.from(chosenSet).sort((a, b) => a - b);
            const pos = arr.indexOf(i);
            return pos >= 0 ? (pos + 0.5) / (k + 0.5) : 1.5;
          })();
          const fetched = isChosen && fetchProgress > myFetchThreshold;
          const skipped = !isChosen && (anim.phase === "ENOUGH" || anim.phase === "READY" || anim.phase === "HOLD");
          const label = CLOUD_LABELS[i % CLOUD_LABELS.length] ?? `Provider ${i + 1}`;
          return (
            <g key={`cloud-${i}`} opacity={skipped ? 0.35 : 1}>
              <path
                d={`M ${x + 12} ${y + 26} Q ${x + 4} ${y + 26} ${x + 4} ${y + 18} Q ${x + 4} ${y + 10} ${x + 14} ${y + 10} Q ${x + 18} ${y + 2} ${x + 30} ${y + 4} Q ${x + 42} ${y + 2} ${x + 48} ${y + 12} Q ${x + 60} ${y + 12} ${x + 60} ${y + 22} Q ${x + 60} ${y + 30} ${x + 50} ${y + 30} L ${x + 12} ${y + 30} Z`}
                fill={fetched ? "rgba(34, 211, 238, 0.10)" : isChosen ? "rgba(34, 211, 238, 0.18)" : "rgba(148, 163, 184, 0.08)"}
                stroke={isChosen ? t.accent : t.muted}
                strokeWidth={isChosen ? 1.5 : 1}
                strokeDasharray={skipped ? "3 3" : undefined}
              />
              <text x={x + 32} y={y + 46} textAnchor="middle" fill={isChosen ? t.accent : t.muted} fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                {label}
              </text>
              <text x={x + 32} y={y + 58} textAnchor="middle" fill={t.muted} fontSize="8" fontFamily="ui-monospace, monospace">
                {skipped ? "skipped (not needed)" : isChosen ? (fetched ? "✓ fetched" : "fetching…") : "available"}
              </text>
            </g>
          );
        })}

        {/* Heir's local pile (RIGHT) — appears as fetches complete */}
        {heirVisible > 0 && (() => {
          const ordered = Array.from(chosenSet).sort((a, b) => a - b);
          return ordered.map((srcIdx, pileIdx) => {
            const myAppearAt = (pileIdx + 0.5) / (k + 0.5);
            if (heirVisible < myAppearAt) return null;
            const x = heirX;
            const y = heirPileTop + pileIdx * heirSpacing;
            return (
              <g key={`heir-${pileIdx}`} opacity={Math.min(1, (heirVisible - myAppearAt) * 4)}>
                <rect
                  x={x} y={y}
                  width="80" height="54" rx="6"
                  fill="rgba(34, 211, 238, 0.18)"
                  stroke={t.accent}
                  strokeWidth="1.5"
                />
                <text x={x + 40} y={y + 20} textAnchor="middle" fill={t.accent} fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
                  SHARE {srcIdx + 1}
                </text>
                <text x={x + 40} y={y + 38} textAnchor="middle" fill={t.accent2} fontSize="14" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  🔒
                </text>
                <text x={x + 40} y={y + 50} textAnchor="middle" fill={t.muted} fontSize="8" fontFamily="ui-monospace, monospace">
                  encrypted
                </text>
              </g>
            );
          });
        })()}

        {/* Flying arrows — cloud i → heir pile slot (left to right) — during FETCH */}
        {fetchProgress > 0 && (() => {
          const ordered = Array.from(chosenSet).sort((a, b) => a - b);
          return ordered.map((srcIdx, pileIdx) => {
            const fromX = cloudX + 64;
            const fromY = cloudColTop + srcIdx * cloudSpacing + 18;
            const toX = heirX;
            const toY = heirPileTop + pileIdx * heirSpacing + 27;
            const myStart = pileIdx / (k + 1);
            const myEnd = myStart + 0.5;
            const localProgress = Math.max(0, Math.min(1, (fetchProgress - myStart) / (myEnd - myStart)));
            if (localProgress <= 0) return null;
            const curX = fromX + (toX - fromX) * localProgress;
            const curY = fromY + (toY - fromY) * localProgress + Math.sin(localProgress * Math.PI) * -40;
            return (
              <g key={`flight-${pileIdx}`}>
                <line
                  x1={fromX} y1={fromY}
                  x2={curX} y2={curY}
                  stroke={`url(#gather-flight-${theme})`}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity={0.55}
                />
                {localProgress < 1 && (
                  <g transform={`translate(${curX} ${curY})`}>
                    <rect x="-12" y="-8" width="24" height="16" rx="3" fill={t.bg2} stroke={t.accent2} strokeWidth="1.5" filter={`url(#gather-glow-${theme})`} />
                    <text x="0" y="3" textAnchor="middle" fill={t.accent2} fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="bold">
                      GET
                    </text>
                  </g>
                )}
              </g>
            );
          });
        })()}

        {/* Footer legend */}
        <text x={VB_W / 2} y={VB_H - 24} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2">
          {k} share-vaults gathered · need K of N · any K works
        </text>
        <text x={VB_W / 2} y={VB_H - 8} textAnchor="middle" fill={t.muted} fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.6">
          last online step · airgap re-engages for decrypt/interpolate/restore
        </text>
      </svg>

      {showControls && !chromeless && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10, fontSize: 11, color: t.muted }}>
          <button onClick={stepBack}  style={{ background: "transparent", border: `1px solid ${t.muted}`, color: t.muted, padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "ui-monospace, monospace" }}>◀</button>
          <button onClick={() => setPaused((p) => !p)} style={{ background: "transparent", border: `1px solid ${t.muted}`, color: t.muted, padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "ui-monospace, monospace" }}>{paused ? "▶" : "❚❚"}</button>
          <button onClick={stepForward} style={{ background: "transparent", border: `1px solid ${t.muted}`, color: t.muted, padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "ui-monospace, monospace" }}>▶</button>
        </div>
      )}
    </div>
  );
}
