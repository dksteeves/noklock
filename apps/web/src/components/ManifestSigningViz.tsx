// @version 0.3.0 @date 2026-06-01
// 0.3.0 — INTRO phase now renders content — no more empty SVG blank
//         during INTRO sub-phase. Option A "expectations skeleton":
//         iris bloom no longer hard-zeros during INTRO. Instead it
//         renders a faded ~25% opacity preview at 0.55 scale, giving
//         the viewer a "where this is going" silhouette that brightens
//         and expands as HASH progresses. Also adds a subtle
//         "PRIMITIVE: SHA-256 → Ed25519" overlay ribbon visible during
//         INTRO only, fading out as the iris blooms (no clutter once
//         the main animation kicks in).
// 0.2.2 — SEX-UP pass: 24 ambient twinkle sparkles around the iris
//         (compositor-thread WAAPI animations, staggered delay, zero
//         React cost). Halo gradient stops brightened (0.30 → 0.45 at
//         centre, 0.08 → 0.14 mid). Sparkles suppressed under
//         OS prefers-reduced-motion.
// 0.2.0 — TIER 1 PERF: imperative refs for every per-frame animation:
//         iris group scale (bloom from centre), stamp position (descent),
//         iris flash overlay, burst rings (radius + opacity), verify rings
//         (radius + opacity), signature band opacity, verified-badge fade.
//         The 128 iris paths render ONCE at full size via useMemo (their
//         `d` is constant — only the parent group's scale transform
//         animates). Per-cycle variant change re-renders the iris colours
//         (8 times per ~12s cycle). React state setPhaseState fires only
//         on phase change (~7 times per cycle) or variant change.
//
//         Static halo glow restored behind the iris (radial gradient, no
//         filter — zero per-frame cost) so the "wax-seal" moment still
//         has the sex it had at 0.1.0.
// 0.1.0 — Initial.

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { FullscreenAffordance, useRegisterVizSubStep } from "./FullscreenAffordance.js";
import { useArrowStepNav } from "../hooks/useArrowStepNav.js";
import { OfflineMoodPill, offlineMoodFilter, useOfflineState, useSkipMoodFilter } from "./OfflineMoodOverlay.js";

export type ManifestPhase = "INTRO" | "HASH" | "DESCEND" | "STAMP" | "SIGN" | "VERIFY" | "HOLD";

interface PhaseDef { readonly id: ManifestPhase; readonly ms: number; readonly title: string; readonly body: string; }

const PHASES: readonly PhaseDef[] = [
  { id: "INTRO",   ms: 1400, title: "Your manifest is ready to sign",
    body: "The vault's manifest — every share location, every cipher choice, every parameter — gets canonicalised into a single ordered byte string. JSON keys sorted; whitespace stripped; encoding pinned." },
  { id: "HASH",    ms: 2400, title: "SHA-256 collapses it to 256 bits",
    body: "Every byte of the manifest feeds into SHA-256. Out comes 32 bytes — visualised here as a radial iris where each ring segment is one byte. Two different manifests produce visibly different patterns." },
  { id: "DESCEND", ms: 1800, title: "Ed25519 private key approaches",
    body: "Your signing key — derived deterministically from your master via HKDF — descends with momentum to seal the manifest. The key never persists; it's recomputed every time it's needed and zeroed after." },
  { id: "STAMP",   ms: 1000, title: "Impact — the wax seal sets",
    body: "The signature commits the exact iris pattern to a specific keypair. Any future tamper changes the iris; the signature no longer verifies; the manifest is rejected before any vault state changes." },
  { id: "SIGN",    ms: 2200, title: "64-byte Ed25519 signature emerges",
    body: "The signature is short (just 64 bytes), fast to verify (~50µs on modern hardware), and quantum-bounded under the Grover limit. Same primitive used by SSH, Tor, and modern TLS handshakes." },
  { id: "VERIFY",  ms: 2000, title: "Anyone can verify — without your private key",
    body: "Verification uses ONLY the public key. The vault contract, your heir's browser, an auditor's command-line — all confirm the manifest is yours without needing access to anything secret." },
  { id: "HOLD",    ms: 1600, title: "Cryptographically committed",
    body: "Iris + signature together form a tamper-evident receipt. The manifest cannot be silently changed; if it is, restoration fails loudly. This is what makes the integrity claim provable, not asserted." },
];

export const TOTAL_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
export const PHASES_COUNT = PHASES.length;
// 0.2.4 — cumulative phase start times for ◀/▶ step buttons.
const PHASE_BOUNDARIES = (() => {
  let acc = 0;
  return PHASES.map((p) => { const start = acc; acc += p.ms; return start; });
})();

export interface ManifestSigningVizProps {
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
  readonly text: string; readonly muted: string; readonly bg: string; readonly bg2: string;
  readonly iris: string; readonly iris2: string; readonly stamp: string; readonly burst: string;
  readonly accent: string; readonly accent2: string;
}
const THEMES: Record<"cyan" | "emerald", ThemeColors> = {
  cyan:    { text: "#e2e8f0", muted: "#94a3b8", bg: "#020617", bg2: "#0b1220", iris: "#06b6d4", iris2: "#67e8f9", stamp: "#fbbf24", burst: "#fde68a", accent: "#22d3ee", accent2: "#67e8f9" },
  emerald: { text: "#e2e8f0", muted: "#94a3b8", bg: "#020a05", bg2: "#06120c", iris: "#059669", iris2: "#6ee7b7", stamp: "#fbbf24", burst: "#fde68a", accent: "#10b981", accent2: "#6ee7b7" },
};

const VB_W = 1200;
const VB_H = 520;
const CX = VB_W / 2;
const CY = VB_H / 2;

const IRIS_SEGMENTS = 32;
const IRIS_RINGS = 4;
const IRIS_OUTER_R = 130;
const IRIS_INNER_R = 60;

// 0.2.2: ambient twinkle sparkles around the iris — purely decorative,
// driven by WAAPI on the compositor thread, zero React cost. Positions
// computed deterministically from index so the constellation stays the
// same between renders.
const SPARKLE_COUNT = 24;
interface Sparkle { readonly x: number; readonly y: number; readonly r: number; readonly delay: number; }
function makeSparkles(): readonly Sparkle[] {
  const out: Sparkle[] = [];
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    const a = (i / SPARKLE_COUNT) * Math.PI * 2 + (i % 3) * 0.21;
    const rad = IRIS_OUTER_R + 50 + ((i * 17) % 110);
    out.push({
      x: 600 + Math.cos(a) * rad,
      y: 260 + Math.sin(a) * rad,
      r: 1.2 + ((i * 0.31) % 1.6),
      delay: (i * 230) % 2800,
    });
  }
  return out;
}
const BURST_RING_COUNT = 4;
const VERIFY_RING_COUNT = 3;

function easeInOut(t: number): number { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }
function easeInQuad(t: number): number { return t * t; }

function hashByte(segIdx: number, ringIdx: number, variant: number): number {
  const v = ((segIdx * 2654435761) ^ (ringIdx * 1597334677) ^ (variant * 3266489917)) >>> 0;
  return v & 0xff;
}

function pol(angle: number, r: number): [number, number] {
  return [CX + Math.cos(angle) * r, CY + Math.sin(angle) * r];
}

function arcPath(startAngle: number, endAngle: number, innerR: number, outerR: number): string {
  const [x1, y1] = pol(startAngle, outerR);
  const [x2, y2] = pol(endAngle,   outerR);
  const [x3, y3] = pol(endAngle,   innerR);
  const [x4, y4] = pol(startAngle, innerR);
  const sweep = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerR} ${outerR} 0 ${sweep} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${innerR} ${innerR} 0 ${sweep} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
}

interface PhaseState {
  readonly phase: ManifestPhase;
  readonly phaseIdx: number;
  readonly variant: number;
}

export function ManifestSigningViz({
  autoPlay = true,
  loop = true,
  speed = 1,
  showCaptions = true,
  showControls = true,
  chromeless = false,
  theme = "cyan",
  height = 480,
}: ManifestSigningVizProps): JSX.Element {
  const t = THEMES[theme];

  const [phaseState, setPhaseState] = useState<PhaseState>({ phase: "INTRO", phaseIdx: 0, variant: 0 });
  const [paused, setPaused] = useState(false);
  const [manualMs, setManualMs] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  // 0.2.3 — reducedMotion only suppresses decorative sparkles, NOT the
  // main lesson animation. Was blanking the viz for any user with OS
  // reduce-motion on.
  const effectiveAutoPlay = autoPlay;

  // 0.2.1 — paused/hovered routed via refs (see ArgonGridViz 0.2.1).
  const manualMsRef = useRef<number | null>(manualMs);
  manualMsRef.current = manualMs;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;

  // Imperative refs
  const irisGroupRef = useRef<SVGGElement | null>(null);
  const irisFlashRef = useRef<SVGCircleElement | null>(null);
  const stampGroupRef = useRef<SVGGElement | null>(null);
  // 0.2.3 — 64-char hex string of the synthetic SHA-256 output. Builds
  // up character-by-character during HASH phase so the user sees the
  // actual byte-string the iris is encoding. Much more legible than
  // labelling 128 tiny arc segments. Persists through STAMP / SIGN /
  // VERIFY so the connection between "the iris" and "the hash bytes"
  // stays anchored.
  const hashHexTopRef = useRef<SVGTextElement | null>(null);
  const hashHexBotRef = useRef<SVGTextElement | null>(null);
  const burstRefsRef = useRef<(SVGCircleElement | null)[]>([]);
  if (burstRefsRef.current.length !== BURST_RING_COUNT) {
    burstRefsRef.current = new Array<SVGCircleElement | null>(BURST_RING_COUNT).fill(null);
  }
  const verifyRefsRef = useRef<(SVGCircleElement | null)[]>([]);
  if (verifyRefsRef.current.length !== VERIFY_RING_COUNT) {
    verifyRefsRef.current = new Array<SVGCircleElement | null>(VERIFY_RING_COUNT).fill(null);
  }
  const burstGroupRef = useRef<SVGGElement | null>(null);
  const verifyGroupRef = useRef<SVGGElement | null>(null);
  const signGroupRef = useRef<SVGGElement | null>(null);
  const verifiedBadgeRef = useRef<SVGGElement | null>(null);
  // 0.3.0 — INTRO ribbon ("PRIMITIVE: SHA-256 → Ed25519")
  const introRibbonRef = useRef<SVGGElement | null>(null);

  // 0.2.2 ambient sparkles — WAAPI driven, mounted-once, twinkle forever.
  const sparkles = useRef(makeSparkles());
  const sparkleRefs = useRef<(SVGCircleElement | null)[]>([]);
  useEffect(() => {
    if (reducedMotion) return;
    const animations: Animation[] = [];
    sparkleRefs.current.forEach((el, i) => {
      if (!el) return;
      const s = sparkles.current[i];
      if (!s) return;
      try {
        const a = el.animate(
          [
            { opacity: 0.05 },
            { opacity: 0.85 },
            { opacity: 0.05 },
          ],
          { duration: 2800 + (i % 5) * 320, iterations: Infinity, easing: "ease-in-out", delay: -s.delay }
        );
        animations.push(a);
      } catch { /* WAAPI unavailable — sparkles stay dim, no break */ }
    });
    return () => animations.forEach((a) => a.cancel());
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

  // Iris paths — full-size, rendered once per (theme, variant) change.
  // Bloom from centre is achieved by animating the parent group's scale.
  const irisPathsJsx = useMemo(() => {
    const out: JSX.Element[] = [];
    for (let ringIdx = 0; ringIdx < IRIS_RINGS; ringIdx++) {
      const ringInner = IRIS_INNER_R + ((IRIS_OUTER_R - IRIS_INNER_R) / IRIS_RINGS) * ringIdx;
      const ringOuter = IRIS_INNER_R + ((IRIS_OUTER_R - IRIS_INNER_R) / IRIS_RINGS) * (ringIdx + 1);
      for (let segIdx = 0; segIdx < IRIS_SEGMENTS; segIdx++) {
        const a0 = (segIdx / IRIS_SEGMENTS) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((segIdx + 1) / IRIS_SEGMENTS) * Math.PI * 2 - Math.PI / 2;
        const byte = hashByte(segIdx, ringIdx, phaseState.variant);
        const fillOpacity = 0.25 + (byte / 255) * 0.55;
        const color = byte > 127 ? t.iris2 : t.iris;
        out.push(
          <path
            key={`iris-${ringIdx}-${segIdx}`}
            d={arcPath(a0, a1, ringInner, ringOuter)}
            fill={color}
            opacity={fillOpacity}
            stroke={t.bg2}
            strokeWidth="1"
          />
        );
      }
    }
    return out;
  }, [t.iris, t.iris2, t.bg2, phaseState.variant]);

  const burstRingsJsx = useMemo(() => (
    Array.from({ length: BURST_RING_COUNT }, (_, i) => (
      <circle
        key={`burst-${i}`}
        ref={(el) => { burstRefsRef.current[i] = el; }}
        cx={CX}
        cy={CY}
        r={IRIS_OUTER_R}
        fill="none"
        stroke={t.burst}
        strokeWidth={3 - i * 0.5}
        opacity="0"
      />
    ))
  ), [t.burst]);

  const verifyRingsJsx = useMemo(() => (
    Array.from({ length: VERIFY_RING_COUNT }, (_, i) => (
      <circle
        key={`vr-${i}`}
        ref={(el) => { verifyRefsRef.current[i] = el; }}
        cx={CX}
        cy={CY}
        r={IRIS_OUTER_R + 30}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        opacity="0"
        strokeDasharray="4 6"
      />
    ))
  ), []);

  // Signature hex string (deterministic from variant)
  const sigHex = useMemo(() => {
    let s = "";
    for (let i = 0; i < 16; i++) {
      const v = ((i * 16777619) ^ (phaseState.variant * 2166136261)) >>> 0;
      s += (v & 0xff).toString(16).padStart(2, "0");
    }
    return s.toUpperCase();
  }, [phaseState.variant]);

  // RAF tick — drives all per-frame DOM updates imperatively. React state
  // only on phase / variant change.
  useEffect(() => {
    if (!effectiveAutoPlay) return;
    let lastPhase: ManifestPhase | null = null;
    let lastVariant = phaseState.variant;
    let lastCycleMs = 0;
    let currentVariant = phaseState.variant;

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
        if (lastPhase !== "HOLD") {
          lastPhase = "HOLD";
          setPhaseState({ phase: "HOLD", phaseIdx: PHASES.length - 1, variant: currentVariant });
        }
        return;
      }

      const wrapped = ((elapsed % TOTAL_CYCLE_MS) + TOTAL_CYCLE_MS) % TOTAL_CYCLE_MS;
      let acc = 0;
      let phase: ManifestPhase = "INTRO";
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

      // Variant flip on cycle wrap
      if (lastCycleMs > TOTAL_CYCLE_MS * 0.7 && cycleMs < TOTAL_CYCLE_MS * 0.3) {
        currentVariant = (currentVariant + 1) % 5;
      }
      lastCycleMs = cycleMs;

      // ── IMPERATIVE DOM UPDATES ─────────────────────────────────────

      // 0.3.0 — Iris bloom: during INTRO show a faded preview (Option A
      // "expectations skeleton") at 0.55 scale / 0.25 opacity so the
      // viewer sees where this is going. HASH then animates from that
      // preview state up to full bloom. Avoids the dead-air blank
      // canvas during the INTRO sub-phase.
      const INTRO_SCALE = 0.55;
      const INTRO_OPACITY = 0.25;
      let irisScale: number;
      let irisOpacity: number;
      if (phase === "INTRO") {
        irisScale = INTRO_SCALE;
        irisOpacity = INTRO_OPACITY;
      } else if (phase === "HASH") {
        const p = easeOut(phaseProgress);
        irisScale = INTRO_SCALE + (1 - INTRO_SCALE) * p;
        irisOpacity = INTRO_OPACITY + (1 - INTRO_OPACITY) * p;
      } else {
        irisScale = 1;
        irisOpacity = 1;
      }
      if (irisGroupRef.current) {
        irisGroupRef.current.setAttribute(
          "transform",
          `translate(${CX} ${CY}) scale(${irisScale.toFixed(3)}) translate(${-CX} ${-CY})`
        );
        irisGroupRef.current.setAttribute("opacity", irisOpacity.toFixed(3));
      }

      // 0.3.0 — INTRO ribbon ("PRIMITIVE: SHA-256 → Ed25519"): visible
      // through INTRO, fades out during first 25% of HASH so it gets
      // out of the way of the iris bloom.
      if (introRibbonRef.current) {
        let ribbonOp = 0;
        if (phase === "INTRO") ribbonOp = 0.85;
        else if (phase === "HASH") ribbonOp = Math.max(0, 0.85 * (1 - phaseProgress * 4));
        introRibbonRef.current.setAttribute("opacity", ribbonOp.toFixed(3));
      }

      // Iris flash on stamp impact
      const irisFlash = phase === "STAMP" ? 1 - phaseProgress : 0;
      if (irisFlashRef.current) {
        irisFlashRef.current.setAttribute("opacity", (irisFlash * 0.5).toFixed(3));
      }

      // 0.2.3 — Hash hex string (64 chars total, split across two lines
      // of 32 hex chars). Builds up character-by-character during HASH
      // phase; fully visible from end of HASH through HOLD; hidden in
      // INTRO. Bytes come from the same deterministic hashByte function
      // the iris segments use, so user can mentally map "this hex char
      // ↔ that arc segment."
      const charsShown = phase === "INTRO"
        ? 0
        : phase === "HASH"
          ? Math.floor(easeOut(phaseProgress) * 64)
          : 64;
      if (hashHexTopRef.current) {
        const allHex: string[] = [];
        for (let n = 0; n < 32; n++) {
          const seg = n % IRIS_SEGMENTS;
          const ring = Math.floor(n / IRIS_SEGMENTS) % IRIS_RINGS;
          allHex.push(hashByte(seg, ring, currentVariant).toString(16).padStart(2, "0"));
        }
        const visible = allHex.join("").substring(0, charsShown);
        if (hashHexTopRef.current.textContent !== visible) hashHexTopRef.current.textContent = visible;
        hashHexTopRef.current.setAttribute("opacity", charsShown > 0 ? "0.95" : "0");
      }

      // Stamp position + opacity
      let stampY = CY - 400;
      let stampOpacity = 0;
      if (phase === "DESCEND") {
        stampY = (CY - 350) + ((CY - 10) - (CY - 350)) * easeInQuad(phaseProgress);
        stampOpacity = 0.6 + phaseProgress * 0.4;
      } else if (phase === "STAMP" || phase === "SIGN" || phase === "VERIFY" || phase === "HOLD") {
        stampY = CY - 10;
        stampOpacity = 1;
      }
      if (stampGroupRef.current) {
        const translateY = stampY - (CY - 10); // relative to default (CY - 10)
        stampGroupRef.current.setAttribute("transform", `translate(0 ${translateY.toFixed(1)})`);
        stampGroupRef.current.setAttribute("opacity", stampOpacity.toFixed(3));
      }

      // Burst rings during STAMP
      const burstProgress = phase === "STAMP" ? phaseProgress : 0;
      if (burstGroupRef.current) {
        burstGroupRef.current.setAttribute("opacity", burstProgress > 0 ? "1" : "0");
      }
      if (burstProgress > 0) {
        const bursts = burstRefsRef.current;
        for (let r = 0; r < BURST_RING_COUNT; r++) {
          const ring = bursts[r];
          if (!ring) continue;
          const ringR = IRIS_OUTER_R + (burstProgress * 250 - r * 30);
          if (ringR < IRIS_OUTER_R) {
            ring.setAttribute("opacity", "0");
          } else {
            ring.setAttribute("r", ringR.toFixed(1));
            ring.setAttribute("opacity", ((1 - burstProgress) * 0.9).toFixed(3));
          }
        }
      }

      // Signature band — SIGN/VERIFY only. During HOLD the band FADES
      // OUT as the VERIFIED badge fades IN so they don't overlap (the
      // badge sits at the same y position to use the same screen real
      // estate). Daniel: "verified button overlaps other text".
      const signProgress = phase === "SIGN" ? phaseProgress
                         : phase === "VERIFY" ? 1
                         : phase === "HOLD" ? Math.max(0, 1 - phaseProgress * 2.5)
                         : 0;
      if (signGroupRef.current) {
        signGroupRef.current.setAttribute("opacity", signProgress.toFixed(3));
      }

      // Verify expanding rings during VERIFY
      const verifyRings = phase === "VERIFY" ? phaseProgress : 0;
      if (verifyGroupRef.current) {
        verifyGroupRef.current.setAttribute("opacity", verifyRings > 0 ? "1" : "0");
      }
      if (verifyRings > 0) {
        const vrings = verifyRefsRef.current;
        for (let r = 0; r < VERIFY_RING_COUNT; r++) {
          const ring = vrings[r];
          if (!ring) continue;
          const ringR = IRIS_OUTER_R + 30 + verifyRings * 80 - r * 20;
          ring.setAttribute("r", ringR.toFixed(1));
          ring.setAttribute("opacity", ((1 - verifyRings) * 0.7).toFixed(3));
        }
      }

      // Verified badge during HOLD
      if (verifiedBadgeRef.current) {
        const verifiedOp = phase === "HOLD" ? Math.min(1, phaseProgress * 2) : 0;
        verifiedBadgeRef.current.setAttribute("opacity", verifiedOp.toFixed(3));
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
      startedAtRef.current = 0; pausedAtRef.current = 0; pauseAccumRef.current = 0;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAutoPlay, loop, speed]);

  const currentPhaseDef = PHASES[phaseState.phaseIdx] ?? PHASES[0]!;

  // Stamp inner geometry (static — only the group transform animates)
  const stampW = 80, stampH = 70;
  const stampW2 = stampW / 2, stampH2 = stampH / 2, stampDx = stampW * 0.25;
  const stampCx = CX;
  const stampCy = CY - 10;
  const stampD = `M ${stampCx - stampW2 + stampDx} ${stampCy - stampH2} L ${stampCx + stampW2 - stampDx} ${stampCy - stampH2} L ${stampCx + stampW2} ${stampCy} L ${stampCx + stampW2 - stampDx} ${stampCy + stampH2} L ${stampCx - stampW2 + stampDx} ${stampCy + stampH2} L ${stampCx - stampW2} ${stampCy} Z`;

  // Phase visibility — which optional groups are rendered at all. Conditional
  // rendering only changes on phase boundaries; React handles this fine.
  const irisCaptionVisible = phaseState.phase !== "INTRO";
  const stampInTree = phaseState.phase === "DESCEND" || phaseState.phase === "STAMP" || phaseState.phase === "SIGN" || phaseState.phase === "VERIFY" || phaseState.phase === "HOLD";

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

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: isFullscreen ? "calc(100vh - 220px)" : height, display: "block" }} aria-label="Manifest signing visualisation">
        <defs>
          {/* Static halo glow behind the iris — restored 0.2.0 */}
          <radialGradient id={`manifest-halo-${theme}`} cx="50%" cy="50%" r="35%">
            <stop offset="0%" stopColor={t.iris2} stopOpacity="0.45" />
            <stop offset="55%" stopColor={t.iris2} stopOpacity="0.14" />
            <stop offset="100%" stopColor={t.iris2} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={VB_W} height={VB_H} fill={t.bg2} />

        {/* 0.2.2 ambient sparkles — twinkle on the compositor thread.
            Rendered once; opacity animated via WAAPI in the useEffect above. */}
        <g>
          {sparkles.current.map((s, i) => (
            <circle
              key={`sp-${i}`}
              ref={(el) => { sparkleRefs.current[i] = el; }}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={t.iris2}
              opacity={0.05}
              style={{ willChange: "opacity" }}
            />
          ))}
        </g>

        {/* Halo behind the iris (static — zero per-frame cost) */}
        <rect
          x={CX - IRIS_OUTER_R - 60}
          y={CY - IRIS_OUTER_R - 60}
          width={(IRIS_OUTER_R + 60) * 2}
          height={(IRIS_OUTER_R + 60) * 2}
          fill={`url(#manifest-halo-${theme})`}
          rx={IRIS_OUTER_R + 60}
        />

        {/* 0.3.0 — INTRO "expectations skeleton" ribbon: tells the
            viewer what primitives the upcoming sequence will use.
            Fades out as soon as HASH starts so it never competes
            with the active animation. */}
        <g ref={introRibbonRef} opacity="0">
          <rect
            x={CX - 250}
            y={CY - IRIS_OUTER_R - 60}
            width={500}
            height={32}
            rx={16}
            fill="rgba(34, 211, 238, 0.06)"
            stroke={t.accent}
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity={0.6}
          />
          <text
            x={CX}
            y={CY - IRIS_OUTER_R - 39}
            textAnchor="middle"
            fill={t.accent2}
            fontSize="12"
            fontFamily="ui-monospace, monospace"
            letterSpacing="2.5"
            fontWeight="bold"
          >
            PRIMITIVE: SHA-256 → Ed25519
          </text>
          <text
            x={CX}
            y={CY + IRIS_OUTER_R + 28}
            textAnchor="middle"
            fill={t.muted}
            fontSize="11"
            fontFamily="ui-monospace, monospace"
            letterSpacing="1.5"
            opacity={0.85}
          >
            about to: canonicalise manifest · hash · sign · verify
          </text>
        </g>

        {/* Iris group — parent transform animates the bloom from centre */}
        <g ref={irisGroupRef} opacity="0" transform={`translate(${CX} ${CY}) scale(0) translate(${-CX} ${-CY})`}>
          {irisPathsJsx}
          <circle cx={CX} cy={CY} r={IRIS_INNER_R} fill="none" stroke={t.iris2} strokeWidth="1.5" opacity={0.5} />
          <circle cx={CX} cy={CY} r={IRIS_OUTER_R} fill="none" stroke={t.iris2} strokeWidth="1.5" opacity={0.4} />
          <circle cx={CX} cy={CY} r="4" fill={t.iris2} />
          <text x={CX} y={CY + 4} textAnchor="middle" fill={t.bg} fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">256</text>
        </g>

        {/* Iris flash overlay — opacity updated imperatively */}
        <circle ref={irisFlashRef} cx={CX} cy={CY} r={IRIS_OUTER_R} fill={t.burst} opacity="0" />

        {/* Iris caption (visible after INTRO) */}
        {irisCaptionVisible && (
          <text x={CX} y={CY + IRIS_OUTER_R + 26} textAnchor="middle" fill={t.accent} fontSize="14" fontFamily="ui-monospace, monospace" letterSpacing="2.5" fontWeight="bold">
            SHA-256 · 256-BIT FINGERPRINT
          </text>
        )}

        {/* 0.2.3 — 64-char hex string of the (synthetic) hash. Builds
            up during HASH phase, persists through STAMP/SIGN/VERIFY.
            Single line just under the iris caption, small monospace.
            Sits ABOVE the signature band (which is at +60/+72) — kept
            tight so the VERIFIED badge below has its own breathing room. */}
        <text
          ref={hashHexTopRef}
          x={CX}
          y={CY + IRIS_OUTER_R + 42}
          textAnchor="middle"
          fill={t.iris2}
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.5"
          fontWeight="bold"
          opacity="0"
        />
        {/* (bottom line is not rendered; we now show the full 64 chars
            on one line. Ref kept null-safe via a hidden no-op text node
            so the existing tick logic doesn't need a conditional path.) */}
        <text ref={hashHexBotRef} opacity="0" />

        {/* Light burst rings — imperative refs */}
        <g ref={burstGroupRef} opacity="0">{burstRingsJsx}</g>

        {/* Hex stamp — only rendered when in scene; group transform + opacity animate */}
        {stampInTree && (
          <g ref={stampGroupRef} opacity="1">
            <path d={stampD} fill="rgba(251, 191, 36, 0.25)" stroke={t.stamp} strokeWidth="2.5" />
            <text x={stampCx} y={stampCy + 5} textAnchor="middle" fill={t.stamp} fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
              Ed25519
            </text>
          </g>
        )}

        {/* Signature band — group opacity animated; band itself static */}
        <g ref={signGroupRef} opacity="0">
          <text x={CX} y={CY + IRIS_OUTER_R + 60} textAnchor="middle" fill={t.muted} fontSize="10" fontFamily="ui-monospace, monospace" letterSpacing="2" fontWeight="bold">
            64-BYTE SIGNATURE (first 16 shown)
          </text>
          <rect x={CX - 320} y={CY + IRIS_OUTER_R + 72} width={640} height={36} rx={6} fill="rgba(34, 211, 238, 0.10)" stroke={t.accent} strokeWidth="1.5" />
          <text x={CX} y={CY + IRIS_OUTER_R + 95} textAnchor="middle" fill={t.accent2} fontSize="13" fontFamily="ui-monospace, monospace" letterSpacing="3" fontWeight="bold">
            {sigHex}
          </text>
        </g>

        {/* Verify expanding rings — imperative refs */}
        <g ref={verifyGroupRef} opacity="0">{verifyRingsJsx}</g>

        {/* 0.2.3 — Verified badge moved INTO the signature-band y-slot.
            Sig band fades out during HOLD as this fades in (handled in
            the tick), so the two never overlap visually. */}
        <g ref={verifiedBadgeRef} opacity="0">
          <rect x={CX - 100} y={CY + IRIS_OUTER_R + 72} width={200} height={36} rx={6} fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2" />
          <text x={CX} y={CY + IRIS_OUTER_R + 95} textAnchor="middle" fill="#6ee7b7" fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="bold" letterSpacing="2">
            ✓ VERIFIED
          </text>
        </g>
      </svg>

      {showCaptions && (
        <div style={{ textAlign: "center", paddingTop: 12, fontSize: 14, color: "#cbd5e1", fontFamily: "ui-monospace, monospace", fontWeight: 600, letterSpacing: "0.5px" }}>
          SHA-256 manifest hash · Ed25519 signature · 64 bytes · verifiable with public key alone
        </div>
      )}

      {showControls && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 12 }}>
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
                  style={{ width: isActive ? 28 : 10, height: 10, borderRadius: 5, background: isActive ? t.accent2 : "rgba(148, 163, 184, 0.4)", border: "none", transition: "all 200ms ease", cursor: "pointer", padding: 0 }}
                />
              );
            })}
          </div>
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
