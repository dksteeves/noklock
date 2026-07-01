// @version 0.1.0 @date 2026-06-02
// NokMintViz — the on-chain SBT mint moment. The owner calls
// NoKLockSBT.mint(heir, vaultId, manifestHash) on Polygon mainnet. The
// transaction is broadcast, picked up by a block, and confirmed.
//
// This is the ONLY on-chain footprint the vault leaves. It is what
// allows a future heir to prove eligibility to claim — the SBT is
// soulbound (ERC-5192, non-transferable) and ties heir wallet ↔ vaultId
// ↔ manifestHash on-chain.
//
// Visual: a transaction pill on the LEFT broadcasts via animated dots
// to a Polygon block grid in the MIDDLE. Once mined, a confirmation
// counter ticks 1/12 → 12/12 with green ticks landing on each new
// confirmation. An "ETHERSCAN:" pseudo-readout shows the truncated tx
// hash. Footer legend: "Polygon mainnet · ERC-5192 soulbound · ~0.01 MATIC gas".

import { useEffect, useRef, useState, useCallback } from "react";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type NokMintPhase = "INTRO" | "SIGN" | "BROADCAST" | "MINED" | "CONFIRM" | "DONE" | "HOLD";

interface PhaseDef {
  readonly id: NokMintPhase;
  readonly ms: number;
  readonly title: string;
  readonly body: string;
}

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO", ms: 1400, title: "Mint a Next-of-Kin SBT",
    body: "The on-chain SBT records vaultId + manifestHash + heir wallet. It is the only on-chain footprint your vault has — and it is what lets a future heir prove eligibility to claim." },
  { id: "SIGN", ms: 1800, title: "Wallet signs the mint transaction",
    body: "The owner's wallet (e.g. Trust Wallet or a hardware signer) signs NoKLockSBT.mint(heir, vaultId, manifestHash). No private key leaves the wallet; only the signature is produced." },
  { id: "BROADCAST", ms: 2400, title: "Broadcast to Polygon mainnet",
    body: "The signed transaction is sent over JSON-RPC to a Polygon node. Within seconds it propagates across the network and lands in the mempool, waiting for a validator to include it in a block." },
  { id: "MINED", ms: 1800, title: "Picked up by the next block",
    body: "A Polygon validator includes the transaction in the next block. The block hash anchors the state change. From this moment the SBT exists on-chain — but most apps wait for additional confirmations before treating it as final." },
  { id: "CONFIRM", ms: 3200, title: "12 confirmations · economically final",
    body: "Each new block builds on the previous one. After ~12 confirmations the cost of reorganising the chain to undo this mint is astronomical. The SBT is now considered economically final on Polygon." },
  { id: "DONE", ms: 1800, title: "Soulbound · cannot be transferred",
    body: "ERC-5192 marks the SBT as non-transferable — it is bonded to the heir's wallet address forever. No secondary market, no accidental sale, no rug-pull vector. The heir's wallet IS the credential." },
  { id: "HOLD", ms: 1600, title: "Heir can now prove eligibility on-chain",
    body: "When the heir later claims, the contract reads this SBT and validates the manifestHash matches the share-vaults they present. The on-chain SBT is the bridge between off-chain shares and on-chain eligibility." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface NokMintVizProps {
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
  readonly phase: NokMintPhase;
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
  readonly polygon: string;
  readonly confirm: string;
  readonly grid: string;
}

const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan:    { text: "#e2e8f0", muted: "#94a3b8", bg: "#020617", bg2: "#0b1220", accent: "#22d3ee", accent2: "#67e8f9", polygon: "#8247e5", confirm: "#22c55e", grid: "#1e293b" },
  emerald: { text: "#e2e8f0", muted: "#94a3b8", bg: "#020a05", bg2: "#06120c", accent: "#10b981", accent2: "#6ee7b7", polygon: "#8247e5", confirm: "#22c55e", grid: "#14241c" },
};

const VB_W = 1200;
const VB_H = 520;

// Truncated mock tx hash that scrolls / reveals through phases.
const TX_HASH = "0xabc1f4e9c4a37f0d8e2b9c6a51c8b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9";
const HEIR_ADDR = "0x742d35Cc6634C0532925a3b8443e4f1a2b3c4d5e";
const VAULT_ID = "0x93af2c7e";
const MANIFEST_HASH = "0x5b8c3d12";

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }

export function NokMintViz({
  autoPlay = true,
  loop = true,
  speed = 1,
  showCaptions = true,
  showControls = true,
  chromeless = false,
  theme = "cyan",
  height = 480,
}: NokMintVizProps): JSX.Element {
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

  // Layout regions
  const TX_PILL_X = 110;
  const TX_PILL_Y = VB_H / 2 - 60;
  const TX_PILL_W = 280;
  const TX_PILL_H = 120;

  const BLOCK_GRID_X = 540;
  const BLOCK_GRID_Y = VB_H / 2 - 90;
  const BLOCK_GRID_COLS = 4;
  const BLOCK_GRID_ROWS = 3;
  const BLOCK_SIZE = 56;
  const BLOCK_GAP = 12;

  // Progress flags per phase
  const broadcastProgress =
    anim.phase === "BROADCAST" ? easeOut(anim.phaseProgress) :
    anim.phase === "MINED" || anim.phase === "CONFIRM" || anim.phase === "DONE" || anim.phase === "HOLD" ? 1 : 0;
  const mined = anim.phase === "MINED" || anim.phase === "CONFIRM" || anim.phase === "DONE" || anim.phase === "HOLD";
  const totalBlocks = BLOCK_GRID_COLS * BLOCK_GRID_ROWS; // 12 confirmations
  // Confirmations count: 1 at MINED, grows through CONFIRM to 12, holds at 12 after.
  const confirmations =
    anim.phase === "MINED" ? 1 :
    anim.phase === "CONFIRM" ? Math.min(totalBlocks, 1 + Math.floor(anim.phaseProgress * (totalBlocks - 1) + 0.5)) :
    anim.phase === "DONE" || anim.phase === "HOLD" ? totalBlocks :
    0;
  const txSigned = anim.phase !== "INTRO" && anim.phase !== "SIGN";
  // tx hash reveal — partial during SIGN, full afterwards
  const hashReveal =
    anim.phase === "INTRO" ? 0 :
    anim.phase === "SIGN" ? Math.min(1, anim.phaseProgress) :
    1;
  const visibleHash = TX_HASH.slice(0, Math.max(6, Math.floor(TX_HASH.length * hashReveal)));
  const displayHash = visibleHash.length < TX_HASH.length ? `${visibleHash}…` : `${TX_HASH.slice(0, 10)}…${TX_HASH.slice(-6)}`;

  const outerStyle = chromeless ? { background: "transparent", padding: 0 } : { background: t.bg, borderRadius: 12, padding: 16 };

  const offlineState = useOfflineState();
  const skipMoodFilter = useSkipMoodFilter();

  return (
    <div
      ref={containerRef}
      style={{ ...outerStyle, ...(isFullscreen ? { background: "#020617", padding: 32 } : {}), color: t.text, position: "relative", filter: skipMoodFilter ? "none" : offlineMoodFilter(offlineState), transition: "filter 600ms ease" }}
      onMouseEnter={chromeless || isFullscreen ? undefined : () => setHovered(true)}
      onMouseLeave={chromeless || isFullscreen ? undefined : () => setHovered(false)}
      aria-label="On-chain NoK SBT mint"
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

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }} aria-label="On-chain NoK SBT mint">
        <defs>
          <filter id={`mint-glow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`mint-flight-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={t.accent} />
            <stop offset="100%" stopColor={t.polygon} />
          </linearGradient>
        </defs>

        <rect width={VB_W} height={VB_H} fill={t.bg2} />

        {/* Column headers */}
        <text x={TX_PILL_X + TX_PILL_W / 2} y={36} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3">
          TRANSACTION
        </text>
        <text x={BLOCK_GRID_X + (BLOCK_GRID_COLS * (BLOCK_SIZE + BLOCK_GAP)) / 2} y={36} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3">
          POLYGON BLOCKS · CONFIRMATIONS
        </text>

        {/* INTRO breathing */}
        {anim.phase === "INTRO" && (
          <g opacity={0.35 + Math.sin(anim.phaseProgress * Math.PI * 2) * 0.15}>
            <text x={VB_W / 2} y={VB_H - 50} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="3" opacity="0.8">
              READY TO MINT · NoKLockSBT.mint(heir, vaultId, manifestHash)
            </text>
          </g>
        )}

        {/* Transaction pill — LEFT */}
        <g opacity={anim.phase === "INTRO" ? 0.5 : 1}>
          <rect
            x={TX_PILL_X} y={TX_PILL_Y}
            width={TX_PILL_W} height={TX_PILL_H} rx="10"
            fill="rgba(34, 211, 238, 0.10)"
            stroke={txSigned ? t.accent : t.muted}
            strokeWidth="1.8"
            filter={txSigned ? `url(#mint-glow-${theme})` : undefined}
          />
          <text x={TX_PILL_X + 14} y={TX_PILL_Y + 22} fill={t.accent} fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
            tx · {txSigned ? "SIGNED" : "PENDING SIGNATURE"}
          </text>
          <text x={TX_PILL_X + 14} y={TX_PILL_Y + 42} fill={t.accent2} fontSize="10" fontFamily="ui-monospace, monospace">
            NoKLockSBT.mint(
          </text>
          <text x={TX_PILL_X + 24} y={TX_PILL_Y + 56} fill={t.text} fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.85">
            heir: {HEIR_ADDR.slice(0, 10)}…
          </text>
          <text x={TX_PILL_X + 24} y={TX_PILL_Y + 70} fill={t.text} fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.85">
            vaultId: {VAULT_ID}
          </text>
          <text x={TX_PILL_X + 24} y={TX_PILL_Y + 84} fill={t.text} fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.85">
            manifestHash: {MANIFEST_HASH}
          </text>
          <text x={TX_PILL_X + 14} y={TX_PILL_Y + 100} fill={t.accent2} fontSize="10" fontFamily="ui-monospace, monospace">
            )
          </text>
        </g>

        {/* Broadcast packets — flying tx pill → first block */}
        {broadcastProgress > 0 && broadcastProgress < 1 && Array.from({ length: 5 }, (_, i) => {
          const stagger = i / 5;
          const local = Math.max(0, Math.min(1, (broadcastProgress - stagger) * 2));
          if (local <= 0 || local >= 1) return null;
          const fromX = TX_PILL_X + TX_PILL_W;
          const fromY = TX_PILL_Y + TX_PILL_H / 2;
          const toX = BLOCK_GRID_X;
          const toY = BLOCK_GRID_Y + BLOCK_SIZE / 2;
          const cx = fromX + (toX - fromX) * local;
          const cy = fromY + (toY - fromY) * local + Math.sin(local * Math.PI) * -30;
          return (
            <g key={`packet-${i}`}>
              <circle cx={cx} cy={cy} r="4" fill={t.accent2} filter={`url(#mint-glow-${theme})`} />
            </g>
          );
        })}

        {/* Block grid — 3x4 = 12 confirmations */}
        {Array.from({ length: totalBlocks }, (_, idx) => {
          const col = idx % BLOCK_GRID_COLS;
          const row = Math.floor(idx / BLOCK_GRID_COLS);
          const x = BLOCK_GRID_X + col * (BLOCK_SIZE + BLOCK_GAP);
          const y = BLOCK_GRID_Y + row * (BLOCK_SIZE + BLOCK_GAP);
          const confirmedHere = idx < confirmations;
          const isLatest = idx === confirmations - 1;
          // pulse on the latest confirmation
          const pulse = isLatest ? (1 + Math.sin(Date.now() / 180) * 0.05) : 1;
          return (
            <g key={`block-${idx}`}>
              <rect
                x={x} y={y}
                width={BLOCK_SIZE} height={BLOCK_SIZE} rx="6"
                fill={confirmedHere ? "rgba(34, 211, 238, 0.18)" : "rgba(148, 163, 184, 0.06)"}
                stroke={confirmedHere ? t.accent : t.muted}
                strokeWidth={confirmedHere ? 1.8 : 1}
                opacity={confirmedHere ? 1 : 0.45}
                transform={isLatest ? `translate(${x + BLOCK_SIZE / 2} ${y + BLOCK_SIZE / 2}) scale(${pulse}) translate(${-(x + BLOCK_SIZE / 2)} ${-(y + BLOCK_SIZE / 2)})` : undefined}
                filter={confirmedHere ? `url(#mint-glow-${theme})` : undefined}
              />
              {/* Polygon-purple corner accent on each block */}
              <rect
                x={x + BLOCK_SIZE - 8} y={y + 2}
                width={6} height={6}
                fill={t.polygon}
                opacity={confirmedHere ? 0.9 : 0.25}
              />
              <text x={x + BLOCK_SIZE / 2} y={y + BLOCK_SIZE / 2 + 4} textAnchor="middle" fill={confirmedHere ? t.accent : t.muted} fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">
                #{idx + 1}
              </text>
              {confirmedHere && (
                <text x={x + BLOCK_SIZE / 2} y={y + BLOCK_SIZE - 8} textAnchor="middle" fill={t.confirm} fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  ✓
                </text>
              )}
            </g>
          );
        })}

        {/* Confirmation counter */}
        {mined && (
          <text
            x={BLOCK_GRID_X + (BLOCK_GRID_COLS * (BLOCK_SIZE + BLOCK_GAP)) / 2}
            y={BLOCK_GRID_Y + BLOCK_GRID_ROWS * (BLOCK_SIZE + BLOCK_GAP) + 14}
            textAnchor="middle"
            fill={confirmations >= totalBlocks ? t.confirm : t.accent}
            fontSize="13"
            fontFamily="ui-monospace, monospace"
            fontWeight="bold"
            letterSpacing="2"
          >
            {confirmations} / {totalBlocks} CONFIRMATIONS
          </text>
        )}

        {/* Etherscan-style readout (Polygonscan) at bottom of tx pill area */}
        {anim.phase !== "INTRO" && (
          <g>
            <text x={TX_PILL_X} y={TX_PILL_Y + TX_PILL_H + 28} fill={t.muted} fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="2">
              POLYGONSCAN
            </text>
            <text x={TX_PILL_X} y={TX_PILL_Y + TX_PILL_H + 46} fill={t.accent2} fontSize="10" fontFamily="ui-monospace, monospace">
              tx: {displayHash}
            </text>
            {mined && (
              <text x={TX_PILL_X} y={TX_PILL_Y + TX_PILL_H + 62} fill={t.confirm} fontSize="10" fontFamily="ui-monospace, monospace">
                status: {confirmations >= totalBlocks ? "✓ Final" : `✓ Mined (block #${17_000_000 + (confirmations - 1)})`}
              </text>
            )}
          </g>
        )}

        {/* Polygon network badge */}
        <g transform={`translate(${VB_W - 160} ${56})`}>
          <rect x="0" y="0" width="140" height="26" rx="13" fill={t.polygon} opacity="0.18" stroke={t.polygon} strokeWidth="1" />
          <circle cx="14" cy="13" r="5" fill={t.polygon} />
          <text x="74" y="17" textAnchor="middle" fill={t.polygon} fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
            POLYGON MAINNET
          </text>
        </g>

        {/* Footer legend */}
        <text x={VB_W / 2} y={VB_H - 24} textAnchor="middle" fill={t.muted} fontSize="11" fontFamily="ui-monospace, monospace" letterSpacing="2">
          Polygon mainnet · ERC-5192 soulbound · ~0.01 MATIC gas
        </text>
        <text x={VB_W / 2} y={VB_H - 8} textAnchor="middle" fill={t.muted} fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.6">
          the only on-chain footprint your vault has · binds heir wallet ↔ vaultId ↔ manifestHash
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
