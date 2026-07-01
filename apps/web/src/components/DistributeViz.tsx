// @version 0.1.0 @date 2026-06-01
// DistributeViz — the ONLINE moment AFTER manifest signing. The pipeline
// up to this point ran airgapped (entropy → KDF → split → AEAD → manifest).
// Now the user goes online and the app uploads the encrypted share-vault
// files to the storage URLs they provided (cloud destinations: iCloud /
// Drive / Dropbox / OneDrive / S3 / etc.). The owner keeps the URL list
// (the manifest). Sharing the URL list is NOT sharing the shares — the
// shares are still AEAD-encrypted blobs at rest in storage.
//
// Visual: N share-vault tiles on the LEFT, M storage-destination cloud
// tiles on the RIGHT, animated arrows flying each share to its target
// over the upload phases. Captions explain that each share should ideally
// go to a different account/provider. Footer legend reads
// "N share-vaults · M storage destinations · all encrypted".

import { useEffect, useRef, useState, useCallback } from "react";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type DistributePhase = "INTRO" | "READY" | "UPLOAD" | "ACK" | "SAVED" | "HOLD";

interface PhaseDef {
  readonly id: DistributePhase;
  readonly ms: number;
  readonly title: string;
  readonly body: string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO",  ms: 1400, title: "Time to publish the encrypted share-vaults",
    body: "The airgapped half of the work is done. You're now online to push the encrypted share-vaults out to the cloud destinations YOU chose. Each share-vault is just bytes — encrypted at rest, useless on its own." },
  { id: "READY",  ms: 1800, title: "N share-vault files · M storage destinations",
    body: "The owner already picked the destinations (one URL per share). Each destination can be a different account/provider — iCloud, Drive, Dropbox, OneDrive, S3 — your choice. Diversifying providers diversifies risk." },
  { id: "UPLOAD", ms: 3200, title: "Upload to chosen storage provider",
    body: "Each encrypted share-vault flies to its assigned destination over standard HTTPS PUT/POST. Body bytes are the ciphertext + auth tag; the storage provider sees only opaque bytes." },
  { id: "ACK",    ms: 1800, title: "Each share goes to a different account (recommended)",
    body: "Providers acknowledge the uploads. If one provider later disappears, locks the account, or is breached, the remaining destinations still satisfy your K-of-N threshold. Defense in depth comes free here." },
  { id: "SAVED",  ms: 1800, title: "Owner keeps the URL list (the manifest)",
    body: "The manifest — the small JSON file listing where every share lives + the Ed25519 signature over the whole bundle — stays with the OWNER. Heirs receive (eventually) a copy of just this list." },
  { id: "HOLD",   ms: 1600, title: "Sharing the URL list ≠ sharing the shares",
    body: "The URLs say WHERE the shares are. The shares are still AEAD-encrypted. An attacker who steals the URL list still cannot open the shares without the passkey-derived master key the airgapped half produced." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface DistributeVizProps {
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly speed?: number;
  readonly showCaptions?: boolean;
  readonly showControls?: boolean;
  readonly chromeless?: boolean;
  readonly theme?: "cyan" | "emerald";
  readonly height?: number;
  /** N share-vaults; defaults to 5. */
  readonly n?: number;
  /** M storage destinations; defaults to 5 (1:1 by default). Can be less if
   *  user re-uses providers, but recommended = N. */
  readonly m?: number;
}

interface AnimState {
  readonly phase: DistributePhase;
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

export function DistributeViz({
  autoPlay = true,
  loop = true,
  speed = 1,
  showCaptions = true,
  showControls = true,
  chromeless = false,
  theme = "cyan",
  height = 480,
  n = 5,
  m = 5,
}: DistributeVizProps): JSX.Element {
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

  // Layout: N share tiles on the LEFT, M cloud tiles on the RIGHT.
  // Vertical centring: shares column at x ≈ 180, clouds column at x ≈ 980.
  const shareX = 180;
  const cloudX = 980;
  const shareSpacing = 70;
  const cloudSpacing = 70;
  const shareColTop = (VB_H - n * shareSpacing) / 2 + 20;
  const cloudColTop = (VB_H - m * cloudSpacing) / 2 + 20;

  const showShares = true; // shares always visible
  const showClouds = anim.phase !== "INTRO";

  // UPLOAD phase: arrows fly from shares to clouds. progress 0..1.
  const uploadProgress =
    anim.phase === "UPLOAD" ? easeOut(anim.phaseProgress) :
    anim.phase === "ACK" || anim.phase === "SAVED" || anim.phase === "HOLD" ? 1 : 0;
  const ackProgress =
    anim.phase === "ACK" || anim.phase === "SAVED" || anim.phase === "HOLD" ? 1 :
    anim.phase === "UPLOAD" ? Math.max(0, anim.phaseProgress - 0.8) * 5 : 0;

  const outerStyle = chromeless ? { background: "transparent", padding: 0 } : { background: t.bg, borderRadius: 12, padding: 16 };

  const offlineState = useOfflineState();
  const skipMoodFilter = useSkipMoodFilter();
  return (
    <div
      ref={containerRef}
      style={{ ...outerStyle, ...(isFullscreen ? { background: "#020617", padding: 32 } : {}), color: t.text, position: "relative", filter: skipMoodFilter ? "none" : offlineMoodFilter(offlineState), transition: "filter 600ms ease" }}
      onMouseEnter={chromeless || isFullscreen ? undefined : () => setHovered(true)}
      onMouseLeave={chromeless || isFullscreen ? undefined : () => setHovered(false)}
      aria-label="Share distribution to cloud storage"
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

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }} aria-label="Share distribution to cloud storage">
        <defs>
          <filter id={`dist-glow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`dist-flight-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.accent} />
            <stop offset="100%" stopColor={t.cloud} />
          </linearGradient>
          <marker id={`dist-arrow-${theme}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,5 L0,10 z" fill={t.accent2} />
          </marker>
        </defs>

        <rect width={VB_W} height={VB_H} fill={t.bg2} />

        {/* Column headers */}
        <text x={shareX + 30} y={36} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3">
          ENCRYPTED SHARES (local)
        </text>
        <text x={cloudX + 30} y={36} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3">
          STORAGE DESTINATIONS
        </text>

        {/* INTRO breathing precursor — dim share rectangles, no clouds yet. */}
        {anim.phase === "INTRO" && (
          <g opacity={0.35 + Math.sin(anim.phaseProgress * Math.PI * 2) * 0.15}>
            <text x={VB_W / 2} y={VB_H / 2 + 200} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3" opacity="0.7">
              ABOUT TO PUBLISH · {n} ENCRYPTED SHARE-VAULTS
            </text>
            <text x={VB_W / 2} y={VB_H / 2 + 222} textAnchor="middle" fill={t.muted} fontSize="10" fontFamily="ui-monospace, monospace" letterSpacing="1" opacity="0.5">
              going online · uploading over HTTPS to your chosen providers
            </text>
          </g>
        )}

        {/* N share-vault tiles on the LEFT */}
        {showShares && Array.from({ length: n }, (_, i) => {
          const x = shareX;
          const y = shareColTop + i * shareSpacing;
          // tile dims to "uploaded" once its arrow has landed
          const myUploadThreshold = (i + 1) / (n + 1);
          const uploaded = uploadProgress > myUploadThreshold;
          return (
            <g key={`share-${i}`} opacity={anim.phase === "INTRO" ? 0.4 + Math.sin(anim.phaseProgress * Math.PI * 2) * 0.15 : 1}>
              <rect
                x={x} y={y}
                width="80" height="54" rx="6"
                fill={uploaded ? "rgba(34, 211, 238, 0.10)" : "rgba(34, 211, 238, 0.18)"}
                stroke={t.accent}
                strokeWidth="1.5"
                opacity={uploaded ? 0.55 : 1}
              />
              <text x={x + 40} y={y + 20} textAnchor="middle" fill={t.accent} fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
                SHARE {i + 1}
              </text>
              <text x={x + 40} y={y + 38} textAnchor="middle" fill={t.accent2} fontSize="14" fontFamily="ui-monospace, monospace" fontWeight="bold">
                🔒
              </text>
              <text x={x + 40} y={y + 50} textAnchor="middle" fill={t.muted} fontSize="8" fontFamily="ui-monospace, monospace">
                AEAD
              </text>
            </g>
          );
        })}

        {/* M cloud tiles on the RIGHT */}
        {showClouds && Array.from({ length: m }, (_, j) => {
          const x = cloudX;
          const y = cloudColTop + j * cloudSpacing;
          const myAckThreshold = (j + 1) / (m + 1);
          const acked = ackProgress > myAckThreshold || anim.phase === "SAVED" || anim.phase === "HOLD";
          const label = CLOUD_LABELS[j % CLOUD_LABELS.length] ?? `Provider ${j + 1}`;
          return (
            <g key={`cloud-${j}`}>
              {/* Cloud silhouette */}
              <path
                d={`M ${x + 12} ${y + 26} Q ${x + 4} ${y + 26} ${x + 4} ${y + 18} Q ${x + 4} ${y + 10} ${x + 14} ${y + 10} Q ${x + 18} ${y + 2} ${x + 30} ${y + 4} Q ${x + 42} ${y + 2} ${x + 48} ${y + 12} Q ${x + 60} ${y + 12} ${x + 60} ${y + 22} Q ${x + 60} ${y + 30} ${x + 50} ${y + 30} L ${x + 12} ${y + 30} Z`}
                fill={acked ? "rgba(34, 211, 238, 0.18)" : "rgba(148, 163, 184, 0.08)"}
                stroke={acked ? t.accent : t.muted}
                strokeWidth="1.5"
                filter={acked ? `url(#dist-glow-${theme})` : undefined}
              />
              <text x={x + 32} y={y + 46} textAnchor="middle" fill={acked ? t.accent : t.muted} fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                {label}
              </text>
              {acked && (
                <text x={x + 32} y={y + 58} textAnchor="middle" fill={t.accent2} fontSize="10" fontFamily="ui-monospace, monospace">
                  ✓ saved
                </text>
              )}
            </g>
          );
        })}

        {/* Flying arrows — share i → cloud i (modulo m) — during UPLOAD/onward */}
        {uploadProgress > 0 && Array.from({ length: n }, (_, i) => {
          const fromX = shareX + 80;
          const fromY = shareColTop + i * shareSpacing + 27;
          const toIdx = i % m;
          const toX = cloudX;
          const toY = cloudColTop + toIdx * shareSpacing + 18;
          // staggered launch per share
          const myStart = i / (n + 1);
          const myEnd = myStart + 0.4;
          const localProgress = Math.max(0, Math.min(1, (uploadProgress - myStart) / (myEnd - myStart)));
          if (localProgress <= 0) return null;
          const curX = fromX + (toX - fromX) * localProgress;
          const curY = fromY + (toY - fromY) * localProgress + Math.sin(localProgress * Math.PI) * -40;
          return (
            <g key={`flight-${i}`}>
              {/* trail */}
              <line
                x1={fromX} y1={fromY}
                x2={curX} y2={curY}
                stroke={`url(#dist-flight-${theme})`}
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity={0.55}
              />
              {/* packet */}
              {localProgress < 1 && (
                <g transform={`translate(${curX} ${curY})`}>
                  <rect x="-12" y="-8" width="24" height="16" rx="3" fill={t.bg2} stroke={t.accent2} strokeWidth="1.5" filter={`url(#dist-glow-${theme})`} />
                  <text x="0" y="3" textAnchor="middle" fill={t.accent2} fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="bold">
                    PUT
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Footer legend */}
        <text x={VB_W / 2} y={VB_H - 24} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2">
          {n} share-vaults · {m} storage destinations · all encrypted
        </text>
        <text x={VB_W / 2} y={VB_H - 8} textAnchor="middle" fill={t.muted} fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.6">
          owner keeps the URL list (manifest) · shares stay encrypted at rest
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
