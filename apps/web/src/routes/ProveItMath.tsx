// @version 0.3.0 @date 2026-06-01
// 0.3.0 — Daniel 2026-06-01: Mount the SimAirgap simulation. This page
//          runs the actual NoKLock crypto pipeline (BIP-39 → Argon2id →
//          SLIP-39 → AEAD → manifest → restore) on throwaway data in the
//          user's browser — every primitive shown here is a step the user
//          would do AIRGAPPED in the real flow. So we wrap the whole
//          dashboard in <SimAirgapProvider enabled> + <SimAirgapMoodOverlay>
//          with a <SimAirgapBadge/> visible top-right. The simulation is
//          purely visual (filter + pill); the real airgap-manager is not
//          engaged. Mirrors the wrap on /viz/pipeline 0.6.0.
//
// 0.2.0 — Polish round 1 (Daniel feedback):
//   • Dropped page-level Replay button. After Prove, the right pane viz
//     auto-walks through every step at lesson pace; user can interrupt
//     with the viz's own play/pause/◀/▶. Single playback authority.
//   • Generate now PUSHES the first "gen" step into the log immediately
//     so the user gets visible feedback the moment they click.
//   • Inline seed-reveal card appears RIGHT UNDER the button row (not
//     below the fold in the byte panel) — press-and-hold to peek.
//   • Right pane shows the NoKLockSpinner when activeStep === null
//     (i.e. before Generate). No viz autoplay until there's something
//     to show.
//   • Prove button disables after proven; "Reset" button appears.
//   • Step titles renamed so they don't read as near-duplicates.
//
// 0.1.0 — Initial v2 build. See git history.

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { bip39, kdf, slip39, aead, manifest } from "@soulchain/crypto-core";
import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/seo.js";
import { trackEvent } from "../lib/track.js";
import { ConnectExplainer } from "../components/ConnectExplainer.js";
import { NoKLockSpinner } from "../components/NoKLockSpinner.js";
import { ProveStepLog, type ProveLogEntry } from "../components/ProveStepLog.js";
import { BytePanel } from "../components/BytePanel.js";
import type { ProveItStepKey } from "../components/ProveItVizPanel.js";
import {
  SimAirgapProvider,
  SimAirgapMoodOverlay,
  SimAirgapBadge,
} from "../components/SimAirgapMood.js";

const ProveItVizPanel = lazy(() =>
  import("../components/ProveItVizPanel.js").then((m) => ({ default: m.ProveItVizPanel })),
);

type Kind = "seed" | "letter" | "image" | "document";

const KIND_LABEL: Record<Kind, string> = {
  seed: "Seed phrase",
  letter: "Sealed letter",
  image: "Image",
  document: "Document",
};

const KIND_SUB: Record<Kind, string> = {
  seed: "12-word mnemonic → master → 3-of-5 shares → restore",
  letter: "Plain text → AEAD → 3-of-5 shares → restore",
  image: "≤1 MB image → AEAD → 3-of-5 shares → restore",
  document: "≤1 MB document → AEAD → 3-of-5 shares → restore",
};

// Total steps for the progress label.
const STEP_COUNTS: Record<Kind, number> = { seed: 8, letter: 9, image: 9, document: 9 };

// Step order for the post-Prove auto-walk. Same sequence as the live run.
const WALK_ORDER_SEED: readonly ProveItStepKey[] = [
  "gen", "valid", "kdf", "split", "enc", "manifest", "restore", "compare",
];
const WALK_ORDER_BYTES: readonly ProveItStepKey[] = [
  "gen", "kdf", "content-enc", "split", "wrap", "manifest", "restore", "compare",
];

// Per-step dwell time during the post-Prove auto-walk (ms). 0.3.0 —
// tuned per-step so heavy vizzes (Argon ~18s cycle, Shamir ~16s) get
// time to tell their story while quick ones (gen, valid, compare) move
// fast. Was uniform 5s which truncated half the story on slow vizzes.
const WALK_DWELL: Record<ProveItStepKey, number> = {
  gen:         3500,
  valid:       3500,
  kdf:        12000,
  split:      12000,
  enc:        10000,
  wrap:        9000,
  "content-enc": 9000,
  manifest:    9000,
  // 0.6.0 — distribute + gather are illustrative-only on this route (the
  // live math proof doesn't actually upload), so the dwells match other
  // mid-cycle steps. /viz/pipeline derives dwell from each viz's real
  // TOTAL_CYCLE_MS; this route is the manual-step proof where the
  // animation just illustrates the shape.
  // 0.x — Daniel 2026-06-02: publish-manifest + nok-mint added for the
  // 12-step pipeline. Same illustrative-only treatment on /prove-it/math.
  "publish-manifest": 10000,
  "nok-mint":         10000,
  distribute: 10000,
  gather:     10000,
  restore:    10000,
  compare:     5000,
  error:       4000,
};
const WALK_DWELL_DEFAULT = 5000;

interface ProvenState {
  readonly originalBytes: Uint8Array;
  readonly recoveredBytes: Uint8Array;
  readonly match: boolean;
  readonly originalText: string | null;
  readonly recoveredText: string | null;
  readonly originalDataUrl: string | null;
  readonly recoveredDataUrl: string | null;
}

// 0.3.0 @date 2026-05-30 — Promoted from TestProveV2 to ProveItMath. Now
// the canonical math-proof page at /prove-it/math. Hub at /prove-it
// lists this alongside the planned /prove-it/airgap proof.
export function ProveItMath(): JSX.Element {
  useDocumentHead("/prove-it/math");
  const [kind, setKind] = useState<Kind>("seed");
  return (
    <SimAirgapProvider enabled={true}>
      <SimAirgapMoodOverlay>
        <SimAirgapBadge />
        <div className="space-y-4">
          <header>
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h1 className="text-3xl font-bold font-display">
                <span className="grad">Prove the math</span>
              </h1>
              <Link to="/prove-it" className="text-xs text-text-muted hover:text-accent-cyan">
                ← back to Prove-It hub
              </Link>
            </div>
            <p className="text-text-on-dark/80 text-sm mt-2 max-w-2xl">
              Runs the actual NoKLock crypto pipeline on throwaway test data in your browser. After Prove
              completes, the right pane auto-walks the algorithms at lesson-pace so you can SEE every
              primitive in motion. Pick a content kind, hit Generate, then Prove.
            </p>
          </header>

          <ConnectExplainer />

          <KindPicker kind={kind} onPick={setKind} />

          <ProveDashboard key={kind} kind={kind} />
        </div>
      </SimAirgapMoodOverlay>
    </SimAirgapProvider>
  );
}

function KindPicker({ kind, onPick }: { readonly kind: Kind; readonly onPick: (k: Kind) => void }): JSX.Element {
  return (
    <div>
      <div className="flex flex-wrap gap-0 border-b border-bg-surface">
        {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onPick(k)}
            className={
              "px-3 py-2 text-sm font-display border-b-2 -mb-px whitespace-nowrap transition-colors " +
              (kind === k
                ? "border-accent-cyan text-accent-cyan font-bold"
                : "border-transparent text-text-muted hover:text-text-on-dark")
            }
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-muted mt-1 font-mono">{KIND_SUB[kind]}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProveDashboard — top buttons + step log + viz + byte-panel grid.
// ---------------------------------------------------------------------------

interface DashboardProps { readonly kind: Kind }

function ProveDashboard({ kind }: DashboardProps): JSX.Element {
  const [generated, setGenerated] = useState<GeneratedArtefact | null>(null);
  const [running, setRunning] = useState(false);
  const [entries, setEntries] = useState<readonly ProveLogEntry[]>([]);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [proven, setProven] = useState<ProvenState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 0.2.0 — auto-walk runs ONCE after Prove completes, then stops. User
  // can interrupt by clicking any step in the log or by using the viz's
  // own controls.
  const walkTimerRef = useRef<number | null>(null);
  const [walking, setWalking] = useState(false);

  const stepDataMap = useRef<Map<string, { k: string; v: string }[]>>(new Map());

  // 0.3.0 — Dashboard-level fullscreen. Wraps the ENTIRE layout (top
  // buttons + step log + viz pane + byte panel) so the user can present
  // / record the whole proof flow, not just the viz inside. Browser
  // Fullscreen API on the wrapper div.
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const [isDashFs, setIsDashFs] = useState(false);
  useEffect(() => {
    const onChange = (): void => setIsDashFs(document.fullscreenElement === dashboardRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleDashFs = useCallback((): void => {
    if (!dashboardRef.current) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void dashboardRef.current.requestFullscreen();
  }, []);

  useEffect(() => () => clearTimer(walkTimerRef), []);

  const totalSteps = STEP_COUNTS[kind];

  const append = useCallback((entry: ProveLogEntry, lines: { k: string; v: string }[]): void => {
    setEntries((prev) => [...prev, entry]);
    stepDataMap.current.set(String(entry.key), lines);
    setActiveStep(String(entry.key));
  }, []);

  const reset = useCallback((): void => {
    setEntries([]);
    setActiveStep(null);
    setProven(null);
    setErrorMsg(null);
    setGenerated(null);
    stepDataMap.current = new Map();
    clearTimer(walkTimerRef);
    setWalking(false);
  }, []);

  // ─── GENERATE ────────────────────────────────────────────────────────────
  const onGenerate = useCallback(async (): Promise<void> => {
    // Soft reset of run state; keep kind.
    setEntries([]);
    setActiveStep(null);
    setProven(null);
    setErrorMsg(null);
    setGenerated(null);
    stepDataMap.current = new Map();
    clearTimer(walkTimerRef);
    setWalking(false);
    try {
      const g = await generateArtefact(kind);
      setGenerated(g);
      // 0.2.0 — populate the first "gen" entry IMMEDIATELY so the user
      // sees feedback. Without this the left pane stayed "No steps yet"
      // and Daniel didn't know if Generate had done anything.
      const lines: { k: string; v: string }[] =
        kind === "seed"
          ? [
              { k: "entropy bytes", v: `${g.entropy?.length ?? 0} (128 bits)` },
              { k: "wordlist", v: "BIP-39 English · 2048 words" },
              { k: "mnemonic", v: "[press the peek button below to see it]" },
            ]
          : [
              { k: "content bytes", v: String(g.bytes.length) },
              { k: "master password", v: "[synthetic, only used in this demo]" },
              { k: "master password chars", v: String(g.passkey?.length ?? 0) },
            ];
      const title = kind === "seed" ? "Test seed generated" : `Test ${kind} generated`;
      const entry: ProveLogEntry = { key: "gen", title, ms: 0, ok: true };
      setEntries([entry]);
      stepDataMap.current.set("gen", lines);
      setActiveStep("gen");
    } catch (e) {
      setErrorMsg((e as Error).message);
    }
  }, [kind]);

  // ─── PROVE ──────────────────────────────────────────────────────────────
  const onProve = useCallback(async (): Promise<void> => {
    if (!generated || running || proven) return;
    trackEvent("prove_it_run");
    setRunning(true);
    setProven(null);
    setErrorMsg(null);
    // Keep the gen entry (user just generated) so the log doesn't blank.
    setEntries((prev) => prev.slice(0, 1));
    setActiveStep("gen");
    try {
      const result = await runPipeline(kind, generated, append);
      setProven(result);
      // 0.2.0 — auto-walk through every step at lesson pace once Prove
      // completes. User can interrupt via the viz controls or by
      // clicking any step in the left log.
      startAutoWalk(kind, walkTimerRef, setWalking, setActiveStep);
    } catch (e) {
      setErrorMsg((e as Error).message);
      append(
        { key: "error", title: "Pipeline error", ms: 0, ok: false },
        [{ k: "message", v: (e as Error).message }],
      );
    } finally {
      setRunning(false);
    }
  }, [generated, kind, proven, running, append]);

  // Stop the auto-walk if the user picks a step manually.
  const onPickStep = useCallback((k: string): void => {
    setActiveStep(k);
    clearTimer(walkTimerRef);
    setWalking(false);
  }, []);

  // 0.3.0 — Live ↩ from inside the viz: restart the auto-walk from gen
  // so the user sees the full sequence again instead of jumping to
  // wherever Prove last landed. Only fires if Prove already ran.
  const onLiveReset = useCallback((): void => {
    if (!proven) return;
    setActiveStep("gen");
    startAutoWalk(kind, walkTimerRef, setWalking, setActiveStep);
  }, [proven, kind]);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={dashboardRef}
      className="space-y-4"
      style={isDashFs ? { background: "#020617", padding: 24, overflowY: "auto", position: "relative" } : { position: "relative" }}
    >
      <TopButtonRow
        kind={kind}
        generated={!!generated}
        running={running}
        proven={!!proven}
        walking={walking}
        isDashFs={isDashFs}
        onGenerate={() => void onGenerate()}
        onProve={() => void onProve()}
        onReset={reset}
        onToggleDashFs={toggleDashFs}
      />

      {/* 0.2.0 — Inline seed/artefact reveal, right under the buttons so
          the user can't miss it. Press-and-hold to peek. */}
      {generated && !proven && <InlineRevealCard kind={kind} g={generated} />}

      {errorMsg && (
        <div className="card border-rose-500/60 border bg-rose-950/30">
          <div className="text-rose-200 text-sm font-mono">{errorMsg}</div>
        </div>
      )}

      {/* Main two-pane grid: step log on the left, replay viz on the right. */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] gap-4">
        <ProveStepLog
          entries={entries}
          totalSteps={totalSteps}
          activeKey={activeStep}
          onPickStep={onPickStep}
          running={running}
        />

        {/* Right pane: spinner before any action, viz once activeStep set. */}
        {activeStep === null ? (
          <div className="card flex flex-col items-center justify-center py-10">
            <NoKLockSpinner size={192} label="Pick a Vault type and hit Generate" inline />
            <p className="text-xs text-text-muted text-center mt-4 max-w-md px-6">
              The viz will light up as soon as you start the run.
            </p>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="card flex items-center justify-center" style={{ minHeight: 420 }}>
                <NoKLockSpinner size={88} label={running ? "Running pipeline…" : "Loading viz…"} inline />
              </div>
            }
          >
            <ProveItVizPanel
              stepKey={(activeStep as ProveItStepKey | null) ?? "gen"}
              running={running || walking}
              stepData={stepDataMap.current}
              height={420}
              mode={proven ? "your-run" : "demo"}
              stepOrder={kind === "seed" ? WALK_ORDER_SEED : WALK_ORDER_BYTES}
              onLiveReset={onLiveReset}
            />
          </Suspense>
        )}
      </div>

      <BytePanel
        original={generated?.bytes ?? null}
        recovered={proven?.recoveredBytes ?? null}
        match={proven?.match ?? null}
        kindLabel={kind}
        originalText={generated?.text ?? null}
        recoveredText={proven?.recoveredText ?? null}
        originalDataUrl={generated?.dataUrl ?? null}
        recoveredDataUrl={proven?.recoveredDataUrl ?? null}
      />

      {proven && (
        <p className="text-xs text-text-muted text-center">
          {walking ? "Walking through every step — click any step in the log to jump there." :
            "Click any step in the log to jump the viz to it. Use the viz's own controls to play / pause / scrub."}
        </p>
      )}
    </div>
  );
}

function startAutoWalk(
  kind: Kind,
  timerRef: React.MutableRefObject<number | null>,
  setWalking: (v: boolean) => void,
  setActive: (k: string | null) => void,
): void {
  const order = kind === "seed" ? WALK_ORDER_SEED : WALK_ORDER_BYTES;
  setWalking(true);
  setActive(order[0] ?? null);
  clearTimer(timerRef);
  // 0.3.0 — recursive setTimeout instead of setInterval so each step
  // gets its own dwell duration from WALK_DWELL. Heavy vizzes (Argon,
  // Shamir) get ~12s; quick ones (gen, valid, compare) get 3–5s.
  const scheduleNext = (idx: number): void => {
    const currentKey = order[idx];
    const dwell = (currentKey && WALK_DWELL[currentKey]) || WALK_DWELL_DEFAULT;
    timerRef.current = window.setTimeout(() => {
      const nextIdx = idx + 1;
      if (nextIdx >= order.length) {
        clearTimer(timerRef);
        setWalking(false);
        return;
      }
      setActive(order[nextIdx] ?? null);
      scheduleNext(nextIdx);
    }, dwell);
  };
  scheduleNext(0);
}

function clearTimer(ref: React.MutableRefObject<number | null>): void {
  if (ref.current !== null) {
    // 0.3.0 — timer is now setTimeout (not setInterval); clear both for safety.
    window.clearTimeout(ref.current);
    window.clearInterval(ref.current);
    ref.current = null;
  }
}

function TopButtonRow({
  kind, generated, running, proven, walking, isDashFs,
  onGenerate, onProve, onReset, onToggleDashFs,
}: {
  readonly kind: Kind;
  readonly generated: boolean;
  readonly running: boolean;
  readonly proven: boolean;
  readonly walking: boolean;
  readonly isDashFs: boolean;
  readonly onGenerate: () => void;
  readonly onProve: () => void;
  readonly onReset: () => void;
  readonly onToggleDashFs: () => void;
}): JSX.Element {
  const proveReady = generated && !proven && !running;
  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mr-2">
          Pipeline
        </span>
        <button
          type="button"
          className={"btn text-sm " + (generated || proven ? "btn-secondary" : "btn-primary")}
          onClick={onGenerate}
          disabled={running || walking}
        >
          1. Generate test {kind}
        </button>
        <button
          type="button"
          className={"btn text-sm " + (proveReady ? "btn-primary nk-pulse-ring" : "btn-secondary")}
          onClick={onProve}
          disabled={running || !generated || proven}
        >
          {running ? "Proving…" : proven ? "✓ Proven" : "2. Prove"}
        </button>
        {proven && (
          <button
            type="button"
            className="btn btn-secondary text-sm"
            onClick={onReset}
            disabled={running}
          >
            Reset
          </button>
        )}
        {/* 0.3.0 — Fullscreen the WHOLE dashboard (step log + viz + byte panel)
            so the user can present / record the entire proof flow. */}
        <button
          type="button"
          className="btn btn-secondary text-sm"
          onClick={onToggleDashFs}
          title={isDashFs ? "Exit fullscreen (Esc)" : "Fullscreen the whole dashboard"}
        >
          {isDashFs ? "⤓ Exit fullscreen" : "⤢ Fullscreen"}
        </button>
        <div className="ml-auto text-xs text-text-muted">
          {!generated && !proven ? "Click Generate to begin." :
            generated && !proven && !running ? <span className="text-accent-cyan font-semibold">Ready — hit Prove ↑</span> :
            running ? "Running pipeline…" :
            walking ? "Walking through every step at lesson pace." :
            "Proved. Pick any step in the log to inspect."}
        </div>
      </div>
    </div>
  );
}

function InlineRevealCard({
  kind, g,
}: {
  readonly kind: Kind;
  readonly g: GeneratedArtefact;
}): JSX.Element {
  const [held, setHeld] = useState(false);
  const what = kind === "seed" ? "seed phrase" : kind === "image" ? "image" : kind;
  return (
    <div className="card">
      <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold">
            Your synthetic {what}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Generated locally, never sent anywhere. Press &amp; hold the button to peek.
          </p>
        </div>
        <button
          type="button"
          onMouseDown={() => setHeld(true)}
          onMouseUp={() => setHeld(false)}
          onMouseLeave={() => setHeld(false)}
          onTouchStart={(e) => { e.preventDefault(); setHeld(true); }}
          onTouchEnd={() => setHeld(false)}
          className="btn btn-secondary text-xs whitespace-nowrap select-none"
        >
          Press &amp; hold to peek
        </button>
      </div>
      <div
        className="sensitive-surface select-none text-sm border border-bg-surface rounded p-3 bg-bg-deepest/50"
        style={{ minHeight: 64 }}
      >
        {held ? (
          kind === "image" && g.dataUrl ? (
            <div className="text-center">
              <img src={g.dataUrl} alt="generated" className="w-24 h-24 rounded border border-bg-surface mx-auto" />
            </div>
          ) : g.text ? (
            <pre className="font-mono whitespace-pre-wrap break-words text-accent-cyan max-h-40 overflow-auto text-xs">{g.text}</pre>
          ) : (
            <div className="text-text-muted text-center">No preview available.</div>
          )
        ) : (
          <div className="text-text-muted text-center py-3 text-xs">
            (hidden — press and hold the button)
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// Pipeline runner (unchanged from 0.1.0)
// ===========================================================================

interface GeneratedArtefact {
  readonly bytes: Uint8Array;
  readonly text: string | null;
  readonly dataUrl: string | null;
  readonly mnemonic: string | null;
  readonly entropy: Uint8Array | null;
  readonly passkey: string | null;
}

async function generateArtefact(kind: Kind): Promise<GeneratedArtefact> {
  if (kind === "seed") {
    const ent = crypto.getRandomValues(new Uint8Array(16));
    const mnemonic = bip39.entropyToWords(ent);
    return {
      bytes: new TextEncoder().encode(mnemonic),
      text: mnemonic,
      dataUrl: null,
      mnemonic,
      entropy: ent,
      passkey: null,
    };
  }
  if (kind === "letter") {
    const stamp = new Date().toISOString();
    const text =
      "Dear future me,\n\nIf you are reading this, NoKLock's pipeline worked. " +
      "The content of this letter was encrypted in your browser, split via SLIP-39 into 5 shares, " +
      "of which any 3 can rebuild it. NoKLock never saw a single byte.\n\n" +
      `Generated: ${stamp}\nThreshold: 3-of-5\n— end of test letter —`;
    return {
      bytes: new TextEncoder().encode(text),
      text,
      dataUrl: null,
      mnemonic: null,
      entropy: null,
      passkey: generatePasskey(),
    };
  }
  if (kind === "document") {
    const stamp = new Date().toISOString();
    const text = [
      "LAST WILL AND TESTAMENT — TEST DOCUMENT, NOT BINDING",
      `Drawn: ${stamp}`,
      "",
      "I direct that all my crypto assets, sealed letters, and digital documents",
      "be inheritable via the NoKLock dead-man's switch I have configured on the",
      "Polygon mainnet contract suite.",
      "",
      "My designated next of kin shall be granted the soul-bound NFT triggers",
      "necessary to retrieve the share-URL manifest and reconstruct my master",
      "secret using any 3 of 5 shares stored in their respective cloud locations.",
      "",
      "— end of test document —",
    ].join("\n");
    return {
      bytes: new TextEncoder().encode(text),
      text,
      dataUrl: null,
      mnemonic: null,
      entropy: null,
      passkey: generatePasskey(),
    };
  }
  const { bytes, dataUrl } = await generateSyntheticImage();
  return {
    bytes,
    text: null,
    dataUrl,
    mnemonic: null,
    entropy: null,
    passkey: generatePasskey(),
  };
}

async function generateSyntheticImage(): Promise<{ bytes: Uint8Array; dataUrl: string }> {
  return new Promise((resolve) => {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    const ctx = c.getContext("2d");
    if (!ctx) { resolve({ bytes: new Uint8Array(0), dataUrl: "" }); return; }
    const seed = Math.floor(Math.random() * 256);
    const grad = ctx.createLinearGradient(0, 0, 128, 128);
    grad.addColorStop(0, `hsl(${seed}, 80%, 50%)`);
    grad.addColorStop(0.5, `hsl(${(seed + 90) % 360}, 80%, 50%)`);
    grad.addColorStop(1, `hsl(${(seed + 180) % 360}, 80%, 50%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const finish = (): void => {
      c.toBlob(async (blob) => {
        if (!blob) { resolve({ bytes: new Uint8Array(0), dataUrl: "" }); return; }
        const buf = new Uint8Array(await blob.arrayBuffer());
        const dataUrl = await new Promise<string>((res) => {
          const fr = new FileReader();
          fr.onload = () => res(typeof fr.result === "string" ? fr.result : "");
          fr.readAsDataURL(blob);
        });
        resolve({ bytes: buf, dataUrl });
      }, "image/png");
    };
    const logo = new Image();
    logo.onload = () => {
      const maxW = 96, maxH = 96;
      const r = Math.min(maxW / logo.width, maxH / logo.height);
      const w = logo.width * r;
      const h = logo.height * r;
      ctx.drawImage(logo, (128 - w) / 2, (128 - h) / 2, w, h);
      finish();
    };
    logo.onerror = () => finish();
    logo.src = "/logo-192.png";
  });
}

function generatePasskey(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}

type AppendFn = (entry: ProveLogEntry, lines: { k: string; v: string }[]) => void;

async function runPipeline(
  kind: Kind,
  art: GeneratedArtefact,
  append: AppendFn,
): Promise<ProvenState> {
  await new Promise((r) => setTimeout(r, 30));
  if (kind === "seed") return runSeedPipeline(art, append);
  return runBytesPipeline(kind, art, append);
}

async function runSeedPipeline(art: GeneratedArtefact, append: AppendFn): Promise<ProvenState> {
  if (!art.entropy || !art.mnemonic) throw new Error("Seed artefact missing entropy/mnemonic");
  const ent = art.entropy;
  const mnemonic = art.mnemonic;
  let t = 0;

  // NOTE: the "gen" entry is now emitted by onGenerate, NOT here. We
  // pick up from BIP-39 checksum.

  // valid — 0.2.0 renamed
  t = performance.now();
  const okBip = bip39.isValidBip39(mnemonic);
  append(
    { key: "valid", title: "BIP-39 checksum passed", ms: round(performance.now() - t), ok: okBip },
    [
      { k: "word count", v: String(bip39.wordCount(mnemonic)) },
      { k: "checksum bits", v: "4 (12-word seed)" },
      { k: "result", v: okBip ? "valid ✓" : "INVALID" },
    ],
  );

  // kdf
  t = performance.now();
  const salt = kdf.generateSalt();
  const kdfParams = { ...kdf.ARGON2ID_DEFAULTS, saltB64: kdf.b64Encode(salt) };
  const master = await kdf.deriveMaster(mnemonic, kdfParams);
  append(
    { key: "kdf", title: "Master derived via Argon2id (64 MiB)", ms: round(performance.now() - t), ok: master.length === 32 },
    [
      { k: "algorithm", v: "Argon2id (RFC 9106)" },
      { k: "memory", v: `${kdfParams.memKiB.toLocaleString()} KiB (64 MiB)` },
      { k: "time cost", v: `t=${kdfParams.timeCost}` },
      { k: "parallelism", v: `p=${kdfParams.parallelism}` },
      { k: "salt", v: hexPreview(salt) },
      { k: "output bytes", v: String(master.length) },
    ],
  );

  // split
  t = performance.now();
  const shares = slip39.split(ent, 3, 5);
  append(
    { key: "split", title: "Shamir 3-of-5 split (SLIP-39)", ms: round(performance.now() - t), ok: shares.length === 5 },
    [
      { k: "threshold", v: "3" },
      { k: "total shares", v: "5" },
      { k: "field", v: "GF(256) · poly x^8+x^4+x^3+x+1" },
      ...shares.map((sh, i) => ({ k: `share ${i + 1}`, v: `index=${sh.index} · ${sh.bytes.length} bytes` })),
    ],
  );

  // enc
  t = performance.now();
  const encShares: { kind: string; cipherText: Uint8Array; iv: Uint8Array; tag?: Uint8Array; index: number; bytes: Uint8Array }[] = [];
  for (const sh of shares) {
    const k = aead.pickCipher(master, sh.index);
    const r = await aead.encrypt({ kind: k, key: master, plaintext: sh.bytes });
    encShares.push({ kind: k, cipherText: r.cipherText, iv: r.iv, ...(r.tag ? { tag: r.tag } : {}), index: sh.index, bytes: sh.bytes });
  }
  append(
    { key: "enc", title: "Per-share AEAD wrap", ms: round(performance.now() - t), ok: encShares.length === 5 },
    [
      { k: "cipher mix", v: "AES-256-GCM + XChaCha20-Poly1305 (random per share)" },
      ...encShares.map((e) => ({ k: `share ${e.index}`, v: `${e.kind} · ct=${e.cipherText.length}B` })),
    ],
  );

  // manifest
  t = performance.now();
  const manifestBody = {
    version: 1 as const,
    vaultId: kdf.b64Encode(crypto.getRandomValues(new Uint8Array(16))).slice(0, 32),
    createdAt: Math.floor(Date.now() / 1000),
    shamir: { threshold: 3, total: 5 },
    kdf: kdfParams,
    shares: shares.map((sh, i) => ({
      index: sh.index,
      cipher: encShares[i]!.kind as "AES-256-GCM" | "XChaCha20-Poly1305",
      ivB64: kdf.b64Encode(encShares[i]!.iv),
      cipherTextB64: kdf.b64Encode(encShares[i]!.cipherText),
      ...(encShares[i]!.tag ? { tagB64: kdf.b64Encode(encShares[i]!.tag!) } : {}),
      compressedLen: encShares[i]!.cipherText.length,
      originalLen: sh.bytes.length,
    })),
  };
  const signed = await manifest.signManifest(manifestBody, master);
  const sigOk = await manifest.verifyManifest(signed);
  append(
    { key: "manifest", title: "Manifest signed (Ed25519)", ms: round(performance.now() - t), ok: sigOk },
    [
      { k: "algorithm", v: "Ed25519 over canonical-JSON" },
      { k: "signer pubkey bytes", v: String(kdf.b64Decode(signed.signerPubB64).length) },
      { k: "signature bytes", v: String(kdf.b64Decode(signed.signatureB64).length) },
      { k: "self-verify", v: sigOk ? "passes ✓" : "FAILED" },
    ],
  );

  // restore
  t = performance.now();
  const decryptedShares = await Promise.all(encShares.map(async (es) => ({
    index: es.index,
    bytes: await aead.decrypt({
      kind: es.kind as "AES-256-GCM" | "XChaCha20-Poly1305",
      key: master,
      iv: es.iv,
      cipherText: es.cipherText,
      ...(es.tag ? { tag: es.tag } : {}),
    }),
  })));
  const picked = decryptedShares.slice(0, 3);
  const recoveredEntropy = slip39.combine(picked, 3);
  const recoveredMnemonic = bip39.entropyToWords(recoveredEntropy);
  append(
    { key: "restore", title: "Reconstructed from any 3 of 5", ms: round(performance.now() - t), ok: true },
    [
      { k: "shares used", v: picked.map((p) => p.index).join(", ") },
      { k: "interpolation", v: "Lagrange at x=0 in GF(256)" },
      { k: "entropy out bytes", v: String(recoveredEntropy.length) },
    ],
  );

  // compare
  const equal = recoveredMnemonic === mnemonic;
  append(
    { key: "compare", title: equal ? "Round-trip match ✓" : "Round-trip MISMATCH ✗", ms: 0, ok: equal },
    [
      { k: "byte-for-byte", v: equal ? "identical ✓" : "DIFFER" },
    ],
  );

  return {
    originalBytes: art.bytes,
    recoveredBytes: new TextEncoder().encode(recoveredMnemonic),
    match: equal,
    originalText: art.text,
    recoveredText: recoveredMnemonic,
    originalDataUrl: null,
    recoveredDataUrl: null,
  };
}

async function runBytesPipeline(
  kind: Exclude<Kind, "seed">,
  art: GeneratedArtefact,
  append: AppendFn,
): Promise<ProvenState> {
  if (!art.passkey) throw new Error("Bytes artefact missing passkey");
  const contentBytes = art.bytes;
  const passkey = art.passkey;
  let t = 0;

  // (Gen entry already pushed by onGenerate.)

  t = performance.now();
  const salt = kdf.generateSalt();
  const kdfParams = { ...kdf.ARGON2ID_DEFAULTS, saltB64: kdf.b64Encode(salt) };
  const master = await kdf.deriveMaster(passkey, kdfParams);
  append(
    { key: "kdf", title: "Master derived via Argon2id (64 MiB)", ms: round(performance.now() - t), ok: master.length === 32 },
    [
      { k: "input", v: "master password (string)" },
      { k: "params", v: "m=64 MiB · t=3 · p=4 · 32B output" },
      { k: "salt", v: hexPreview(salt) },
    ],
  );

  t = performance.now();
  const contentCipher = await aead.encrypt({ kind: "AES-256-GCM", key: master, plaintext: contentBytes });
  append(
    { key: "content-enc", title: `${kind} AEAD-encrypted`, ms: round(performance.now() - t), ok: true },
    [
      { k: "cipher", v: "AES-256-GCM" },
      { k: "plaintext bytes", v: String(contentBytes.length) },
      { k: "ciphertext bytes", v: String(contentCipher.cipherText.length) },
      { k: "iv bytes", v: String(contentCipher.iv.length) },
    ],
  );

  t = performance.now();
  const shares = slip39.split(master, 3, 5);
  append(
    { key: "split", title: "Master split 3-of-5 (SLIP-39)", ms: round(performance.now() - t), ok: true },
    [
      { k: "scheme", v: "SLIP-39 over GF(256), byte-parallel" },
      { k: "threshold", v: "3 of 5" },
      { k: "share size", v: `${shares[0]!.bytes.length} bytes each` },
    ],
  );

  t = performance.now();
  const encShares = await Promise.all(shares.map(async (s) => {
    const k = aead.pickCipher(master, s.index);
    const enc = await aead.encrypt({ kind: k, key: master, plaintext: s.bytes });
    return { index: s.index, kind: k, iv: enc.iv, cipherText: enc.cipherText, tag: enc.tag };
  }));
  append(
    { key: "wrap", title: "Per-share AEAD wrap", ms: round(performance.now() - t), ok: true },
    [
      { k: "ciphers", v: encShares.map((e) => `${e.index}:${e.kind === "AES-256-GCM" ? "GCM" : "XChaCha"}`).join(", ") },
      { k: "wrapped sizes", v: encShares.map((e) => e.cipherText.length).join(", ") + " bytes" },
    ],
  );

  t = performance.now();
  const manifestBody = {
    version: 1 as const,
    vaultId: kdf.b64Encode(crypto.getRandomValues(new Uint8Array(16))).slice(0, 32),
    createdAt: Math.floor(Date.now() / 1000),
    shamir: { threshold: 3, total: 5 },
    kdf: kdfParams,
    shares: shares.map((sh, i) => ({
      index: sh.index,
      cipher: encShares[i]!.kind as "AES-256-GCM" | "XChaCha20-Poly1305",
      ivB64: kdf.b64Encode(encShares[i]!.iv),
      cipherTextB64: kdf.b64Encode(encShares[i]!.cipherText),
      ...(encShares[i]!.tag ? { tagB64: kdf.b64Encode(encShares[i]!.tag!) } : {}),
      compressedLen: encShares[i]!.cipherText.length,
      originalLen: sh.bytes.length,
    })),
  };
  const signed = await manifest.signManifest(manifestBody, master);
  const sigOk = await manifest.verifyManifest(signed);
  append(
    { key: "manifest", title: sigOk ? "Manifest signed (Ed25519)" : "Manifest sign FAILED", ms: round(performance.now() - t), ok: sigOk },
    [
      { k: "algorithm", v: "Ed25519 over canonical-JSON" },
      { k: "self-verify", v: sigOk ? "passes ✓" : "FAILED" },
    ],
  );

  t = performance.now();
  const decryptedShares = await Promise.all(encShares.map(async (es) => ({
    index: es.index,
    bytes: await aead.decrypt({
      kind: es.kind as "AES-256-GCM" | "XChaCha20-Poly1305",
      key: master,
      iv: es.iv,
      cipherText: es.cipherText,
      ...(es.tag ? { tag: es.tag } : {}),
    }),
  })));
  const picked = decryptedShares.slice(0, 3);
  const recoveredMaster = slip39.combine(picked, 3);
  const recoveredBytes = await aead.decrypt({
    kind: "AES-256-GCM",
    key: recoveredMaster,
    iv: contentCipher.iv,
    cipherText: contentCipher.cipherText,
    ...(contentCipher.tag ? { tag: contentCipher.tag } : {}),
  });
  append(
    { key: "restore", title: "Master reconstructed + content decrypted", ms: round(performance.now() - t), ok: recoveredMaster.length === 32 },
    [
      { k: "shares used", v: picked.map((p) => p.index).join(", ") },
      { k: "interpolation", v: "Lagrange at x=0 in GF(256)" },
      { k: "recovered bytes", v: String(recoveredBytes.length) },
    ],
  );

  const equal = recoveredBytes.length === contentBytes.length && recoveredBytes.every((b, i) => b === contentBytes[i]);
  append(
    { key: "compare", title: equal ? "Round-trip match ✓" : "Round-trip MISMATCH ✗", ms: 0, ok: equal },
    [
      { k: "original bytes", v: String(contentBytes.length) },
      { k: "recovered bytes", v: String(recoveredBytes.length) },
      { k: "byte-for-byte", v: equal ? "identical ✓" : "DIFFER" },
    ],
  );

  let recoveredText: string | null = null;
  let recoveredDataUrl: string | null = null;
  if (kind === "letter" || kind === "document") {
    try { recoveredText = new TextDecoder().decode(recoveredBytes); } catch { /* ignore */ }
  } else if (kind === "image") {
    const blob = new Blob([recoveredBytes as BlobPart], { type: "image/png" });
    recoveredDataUrl = await new Promise<string>((res) => {
      const fr = new FileReader();
      fr.onload = () => res(typeof fr.result === "string" ? fr.result : "");
      fr.readAsDataURL(blob);
    });
  }

  return {
    originalBytes: contentBytes,
    recoveredBytes,
    match: equal,
    originalText: art.text,
    recoveredText,
    originalDataUrl: art.dataUrl,
    recoveredDataUrl,
  };
}

function round(ms: number): number { return Math.round(ms * 10) / 10; }

function hexPreview(bytes: Uint8Array): string {
  const n = bytes.length;
  if (n <= 8) return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const head = Array.from(bytes.slice(0, 4)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const tail = Array.from(bytes.slice(-4)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${head}…${tail} (${n} bytes)`;
}
