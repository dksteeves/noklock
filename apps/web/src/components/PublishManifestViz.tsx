// @version 0.1.0 @date 2026-06-02
// PublishManifestViz — the ONLINE moment AFTER the manifest has been
// signed (Ed25519 offline) and BEFORE the encrypted share-vaults are
// distributed. The signed manifest.json is itself a small artefact that
// must be published alongside the shares so that future-you / heirs can
// find them. This viz makes that publish step visible in the pipeline.
//
// Visual: the signed manifest.json envelope (with a small green "signed"
// seal) animates upward from the local-device floor toward a cloud icon
// at the top. The envelope tilts, drifts up, and lands inside the cloud
// with a satisfying "saved" tick. The phases narrate the meaning:
//   INTRO   — "Signed manifest waiting to be published"
//   READY   — "Ed25519 signature locked in. Going online."
//   LIFT    — envelope rises toward the cloud
//   LAND    — envelope merges with the cloud, tick appears
//   HOLD    — "Published alongside the share-vaults"
//
// Footer legend: "Ed25519 signature · 64 bytes · published to chosen storage"

import { useEffect, useRef, useState, useCallback } from "react";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type PublishManifestPhase = "INTRO" | "READY" | "LIFT" | "LAND" | "HOLD";

interface PhaseDef {
  readonly id: PublishManifestPhase;
  readonly ms: number;
  readonly title: string;
  readonly body: string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO", ms: 1600, title: "Publish the signed manifest",
    body: "The manifest.json lists where the shares went. It is itself published alongside them so heirs (and future-you) can find them. The signature on the manifest comes from your seed — only your seed could have signed it." },
  { id: "READY", ms: 1800, title: "Ed25519 signature locked in — going online",
    body: "The 64-byte Ed25519 signature is baked into the manifest. The signing private key never leaves the airgapped session. From this point on the manifest is an inert, tamper-evident envelope ready for any storage provider." },
  { id: "LIFT", ms: 2600, title: "Envelope rises to chosen storage",
    body: "The signed manifest.json travels over standard HTTPS PUT to the cloud destination you picked. The body bytes are the canonical JSON plus its signature — opaque-looking but cryptographically self-verifying." },
  { id: "LAND", ms: 1800, title: "Saved · alongside the encrypted shares",
    body: "Storage acknowledges the upload. The manifest now sits in the cloud right next to the share-vaults it points at. Any heir with the URL can fetch it, verify the signature, and read the share URLs." },
  { id: "HOLD", ms: 1800, title: "Tamper-evident — only your seed could have signed it",
    body: "An attacker who modifies the URL list invalidates the Ed25519 signature. Anyone verifying with the public key (derived from your seed) will reject the forgery. Trust flows from the seed, not from the storage provider." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface PublishManifestVizProps {
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
  readonly phase: PublishManifestPhase;
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
  readonly seal: string;
  readonly grid: string;
}

const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan:    { text: "#e2e8f0", muted: "#94a3b8", bg: "#020617", bg2: "#0b1220", accent: "#22d3ee", accent2: "#67e8f9", cloud: "#f59e0b", seal: "#22c55e", grid: "#1e293b" },
  emerald: { text: "#e2e8f0", muted: "#94a3b8", bg: "#020a05", bg2: "#06120c", accent: "#10b981", accent2: "#6ee7b7", cloud: "#f59e0b", seal: "#22c55e", grid: "#14241c" },
};

const VB_W = 1200;
const VB_H = 520;

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }

export function PublishManifestViz({
  autoPlay = true,
  loop = true,
  speed = 1,
  showCaptions = true,
  showControls = true,
  chromeless = false,
  theme = "cyan",
  height = 480,
}: PublishManifestVizProps): JSX.Element {
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

  // Envelope geometry — starts low-centre, lifts up to the cloud
  // which sits high-centre.
  const envBaseX = VB_W / 2 - 90;
  const envBaseY = VB_H - 150;
  const envW = 180;
  const envH = 110;
  const cloudCX = VB_W / 2;
  const cloudCY = 130;

  // LIFT progress drives envelope position. Before LIFT it sits low;
  // during LIFT it rises with easing; LAND keeps it inside the cloud.
  const liftProgress =
    anim.phase === "LIFT" ? easeOut(anim.phaseProgress) :
    anim.phase === "LAND" || anim.phase === "HOLD" ? 1 : 0;
  const landed = anim.phase === "LAND" || anim.phase === "HOLD";
  // tick appears once envelope has merged into the cloud
  const tickProgress = anim.phase === "LAND" ? Math.min(1, anim.phaseProgress * 1.4) : (anim.phase === "HOLD" ? 1 : 0);

  const envX = envBaseX + (cloudCX - 90 - envBaseX) * liftProgress;
  const envY = envBaseY + (cloudCY - 30 - envBaseY) * liftProgress;
  const envTilt = Math.sin(liftProgress * Math.PI) * 6; // slight tilt mid-flight
  const envScale = 1 - liftProgress * 0.35; // shrinks as it nears cloud
  const envOpacity = landed ? Math.max(0.0, 1 - tickProgress) : 1;

  const outerStyle = chromeless ? { background: "transparent", padding: 0 } : { background: t.bg, borderRadius: 12, padding: 16 };

  const offlineState = useOfflineState();
  const skipMoodFilter = useSkipMoodFilter();

  return (
    <div
      ref={containerRef}
      style={{ ...outerStyle, ...(isFullscreen ? { background: "#020617", padding: 32 } : {}), color: t.text, position: "relative", filter: skipMoodFilter ? "none" : offlineMoodFilter(offlineState), transition: "filter 600ms ease" }}
      onMouseEnter={chromeless || isFullscreen ? undefined : () => setHovered(true)}
      onMouseLeave={chromeless || isFullscreen ? undefined : () => setHovered(false)}
      aria-label="Publish signed manifest to storage"
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

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }} aria-label="Publish signed manifest to storage">
        <defs>
          <filter id={`pub-glow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`pub-flight-${theme}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={t.accent} />
            <stop offset="100%" stopColor={t.cloud} />
          </linearGradient>
        </defs>

        <rect width={VB_W} height={VB_H} fill={t.bg2} />

        {/* Column header */}
        <text x={VB_W / 2} y={36} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3">
          SIGNED MANIFEST · GOING ONLINE
        </text>

        {/* Cloud at the top — destination */}
        <g opacity={anim.phase === "INTRO" ? 0.35 + Math.sin(anim.phaseProgress * Math.PI * 2) * 0.10 : 1}>
          <path
            d={`M ${cloudCX - 110} ${cloudCY + 16} Q ${cloudCX - 142} ${cloudCY + 16} ${cloudCX - 142} ${cloudCY - 18} Q ${cloudCX - 142} ${cloudCY - 50} ${cloudCX - 100} ${cloudCY - 50} Q ${cloudCX - 84} ${cloudCY - 82} ${cloudCX - 36} ${cloudCY - 74} Q ${cloudCX + 12} ${cloudCY - 82} ${cloudCX + 36} ${cloudCY - 42} Q ${cloudCX + 84} ${cloudCY - 42} ${cloudCX + 84} ${cloudCY - 2} Q ${cloudCX + 84} ${cloudCY + 30} ${cloudCX + 44} ${cloudCY + 30} L ${cloudCX - 110} ${cloudCY + 30} Z`}
            fill={landed ? "rgba(34, 211, 238, 0.20)" : "rgba(148, 163, 184, 0.08)"}
            stroke={landed ? t.accent : t.muted}
            strokeWidth="1.8"
            filter={landed ? `url(#pub-glow-${theme})` : undefined}
          />
          <text x={cloudCX} y={cloudCY + 4} textAnchor="middle" fill={landed ? t.accent : t.muted} fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
            CLOUD STORAGE
          </text>
          {tickProgress > 0 && (
            <g opacity={tickProgress}>
              <circle cx={cloudCX} cy={cloudCY + 22} r="11" fill={t.seal} opacity="0.9" />
              <path d={`M ${cloudCX - 5} ${cloudCY + 22} L ${cloudCX - 1} ${cloudCY + 26} L ${cloudCX + 6} ${cloudCY + 18}`} stroke="#022c22" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </g>

        {/* Vertical guide / flight trail from envelope origin up to cloud */}
        {liftProgress > 0 && liftProgress < 1 && (
          <line
            x1={envBaseX + envW / 2} y1={envBaseY + envH / 2}
            x2={envX + (envW * envScale) / 2} y2={envY + (envH * envScale) / 2}
            stroke={`url(#pub-flight-${theme})`}
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity={0.45}
          />
        )}

        {/* INTRO breathing — envelope only, dim */}
        {anim.phase === "INTRO" && (
          <text x={VB_W / 2} y={VB_H - 50} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3" opacity="0.7">
            SIGNED MANIFEST · WAITING TO BE PUBLISHED
          </text>
        )}

        {/* The envelope itself — JSON document with Ed25519 seal */}
        <g
          transform={`translate(${envX} ${envY}) scale(${envScale}) rotate(${envTilt} ${envW / 2} ${envH / 2})`}
          opacity={envOpacity}
          filter={liftProgress > 0 && liftProgress < 1 ? `url(#pub-glow-${theme})` : undefined}
        >
          {/* envelope rectangle */}
          <rect x="0" y="0" width={envW} height={envH} rx="8" fill="rgba(34, 211, 238, 0.12)" stroke={t.accent} strokeWidth="1.8" />
          {/* file label */}
          <text x={envW / 2} y={22} textAnchor="middle" fill={t.accent} fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
            manifest.json
          </text>
          {/* JSON lines */}
          <text x={12} y={42} fill={t.accent2} fontSize="9" fontFamily="ui-monospace, monospace">
            {`{ "vaultId": "v-93af…",`}
          </text>
          <text x={12} y={56} fill={t.accent2} fontSize="9" fontFamily="ui-monospace, monospace">
            {`  "shares": [url1, url2, …],`}
          </text>
          <text x={12} y={70} fill={t.accent2} fontSize="9" fontFamily="ui-monospace, monospace">
            {`  "kOfN": [3, 5],`}
          </text>
          <text x={12} y={84} fill={t.accent2} fontSize="9" fontFamily="ui-monospace, monospace">
            {`  "sig": "ed25519:5b8c…" }`}
          </text>
          {/* Ed25519 seal */}
          <g transform={`translate(${envW - 28} ${envH - 28})`}>
            <circle cx="0" cy="0" r="16" fill={t.seal} opacity="0.85" />
            <text x="0" y="3" textAnchor="middle" fill="#022c22" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="1">
              ED25
            </text>
          </g>
        </g>

        {/* Footer legend */}
        <text x={VB_W / 2} y={VB_H - 24} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2">
          Ed25519 signature · 64 bytes · published to chosen storage
        </text>
        <text x={VB_W / 2} y={VB_H - 8} textAnchor="middle" fill={t.muted} fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.6">
          tamper-evident · only the owner's seed could have signed it
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
