// @version 0.2.0 @date 2026-06-15
// 0.2.0 — Daniel 2026-06-15 refinements: self-contained DISPLAY model (no longer
//   derived 1:1 from the 13-step machine) so the expert view is a curated,
//   honest granular picture:
//     • the automated "NoKLock secures it" phase now EXPANDS to its real crypto
//       sub-steps (Argon2id → Shamir split → AEAD encrypt → manifest → wipe),
//       not one opaque "running" box;
//     • the two duress steps COMBINE into one "Set duress / Decoy secret" box;
//     • "store" is reframed as app-packages / you-just-Save / optional CLI / note
//       where each went;
//     • OPTIONAL is marked on every optional box AND on the whole "verify &
//       protect" phase.
// 0.1.0 — simple-by-default phases + click-to-expert, cyan=auto / amber=you tint.
//
// COLLAPSED (default) = 4 plain phases so it doesn't read as a 13-step manual
// slog; "Show all steps" expands to the curated granular view. Every phase/step
// is tinted by ACTOR — cyan = NoKLock does it automatically, amber = your step —
// so the user sees most of the heavy lifting is automated and their own steps
// are few and simple. Current position is highlighted in both views.

import { useState } from "react";
import { FlowSteps, type FlowStep, type FlowStepState } from "./FlowSteps.js";

type Actor = "noklock" | "you";

interface Entry {
  readonly key: string;               // stable id used for the active highlight
  readonly label: string;
  readonly sub?: string;
  readonly actor: Actor;
  readonly optional?: boolean;
  readonly state?: FlowStepState;
  readonly activeFor: readonly string[]; // real Enrol Step ids that light this box
}

interface Phase {
  readonly id: string;
  readonly title: string;
  readonly blurb: string;
  readonly actor: Actor;
  readonly optional?: boolean;
  readonly entries: readonly Entry[];
}

const PHASES: readonly Phase[] = [
  {
    id: "prepare", title: "You prepare", actor: "you",
    blurb: "Go offline, enter your secret, set a master password.",
    entries: [
      { key: "welcome",   label: "Welcome",          sub: "Quick intro",        actor: "you", state: "online",   activeFor: ["welcome"] },
      { key: "free-tools", label: "Free tools",       sub: "Apple + Google",     actor: "you", optional: true, state: "online", activeFor: ["free-tools-checkpoint"] },
      { key: "airgap",    label: "Go offline",        sub: "Wi-Fi/cell off",     actor: "you", state: "boundary", activeFor: ["airgap"] },
      { key: "content",   label: "Enter your secret", sub: "seed / letter / file", actor: "you", state: "offline", activeFor: ["content"] },
      { key: "threshold", label: "Threshold",         sub: "M of N (defaults set)", actor: "you", state: "offline", activeFor: ["threshold-select"] },
      { key: "password",  label: "Master password",   sub: "the one key",        actor: "you", state: "offline", activeFor: ["passkey"] },
      { key: "duress",    label: "Set duress",        sub: "Decoy secret",       actor: "you", optional: true, state: "offline", activeFor: ["duress-offer", "duress-entry"] },
    ],
  },
  {
    id: "secure", title: "NoKLock secures it", actor: "noklock",
    blurb: "Splits + encrypts into shares — automatic, in your browser. Nothing leaves the device.",
    entries: [
      { key: "kdf",      label: "Derive key",     sub: "Argon2id",       actor: "noklock", state: "offline", activeFor: ["running"] },
      { key: "split",    label: "Shamir split",   sub: "M-of-N shares",  actor: "noklock", state: "offline", activeFor: ["running"] },
      { key: "encrypt",  label: "Encrypt shares", sub: "AEAD",           actor: "noklock", state: "offline", activeFor: ["running"] },
      { key: "manifest", label: "Build manifest", sub: "recovery map",   actor: "noklock", state: "offline", activeFor: ["running"] },
      { key: "wipe",     label: "Wipe memory",    sub: "zero the secret", actor: "noklock", state: "offline", activeFor: ["running"] },
    ],
  },
  {
    id: "store", title: "You store the shares", actor: "you",
    blurb: "NoKLock packages the encrypted files; you just hit Save (or use the optional CLI to upload), then note where each one went.",
    entries: [
      { key: "package",   label: "Package files", sub: "app bundles them", actor: "noklock", state: "offline",  activeFor: ["download"] },
      { key: "save",      label: "Save files",    sub: "you just hit Save", actor: "you",     state: "offline",  activeFor: ["download"] },
      { key: "cli",       label: "CLI upload",    sub: "automates it",      actor: "noklock", optional: true, state: "boundary", activeFor: [] },
      { key: "locations", label: "Note locations", sub: "where each went",  actor: "you",     state: "boundary", activeFor: ["share-urls"] },
    ],
  },
  {
    id: "protect", title: "You verify & protect", actor: "you", optional: true,
    blurb: "Optional — a test-restore drill, then a next-of-kin so it can be inherited. Skip either and add it later from /restore or /nok.",
    entries: [
      { key: "drill", label: "Test-restore", sub: "Drill", actor: "you",     optional: true, state: "offline", activeFor: ["test-restore"] },
      { key: "nok",   label: "Next-of-kin",  sub: "Heir",  actor: "you",     optional: true, state: "online",  activeFor: ["nok-designate"] },
      { key: "done",  label: "Done",         sub: "Sealed", actor: "noklock", state: "online", activeFor: ["done"] },
    ],
  },
];

const ALL_ENTRIES = PHASES.flatMap((p) => p.entries);

function phaseChrome(actor: Actor, active: boolean): string {
  if (actor === "noklock") {
    return active
      ? "border-accent-cyan bg-accent-cyan/15 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
      : "border-accent-cyan/40 bg-accent-cyan/5";
  }
  return active
    ? "border-amber-400 bg-amber-400/15 shadow-[0_0_18px_rgba(251,191,36,0.30)]"
    : "border-amber-400/40 bg-amber-400/5";
}

export function EnrolProcessMap({ activeId }: { readonly activeId?: string }): JSX.Element {
  const [expert, setExpert] = useState(false);

  // Map the real active Step id onto the display entry that should light up.
  const activeKey = activeId ? ALL_ENTRIES.find((e) => e.activeFor.includes(activeId))?.key : undefined;
  const currentPhase = activeKey ? PHASES.findIndex((p) => p.entries.some((e) => e.key === activeKey)) : 0;

  // Global 1-based numbering across the curated entries (for the expert strip).
  let n = 0;
  const numbered = new Map<string, number>();
  for (const e of ALL_ENTRIES) numbered.set(e.key, ++n);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            <span className="text-text-muted">NoKLock does it automatically</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-text-muted">your step</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpert((v) => !v)}
          className="text-xs text-accent-cyan hover:underline shrink-0"
          aria-expanded={expert}
        >
          {expert ? "◂ Simple view" : `Show all ${ALL_ENTRIES.length} steps ▸`}
        </button>
      </div>

      {!expert ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {PHASES.map((p, i) => {
              const active = i === currentPhase;
              const done = currentPhase > i;
              return (
                <div key={p.id} className={`rounded-lg border p-2.5 transition-all ${phaseChrome(p.actor, active)} ${done ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] uppercase tracking-wider font-bold ${p.actor === "noklock" ? "text-accent-cyan" : "text-amber-300"}`}>
                      {p.actor === "noklock" ? "Automatic" : "Your step"}
                    </span>
                    {done ? <span className="text-[10px] text-accent-green">done ✓</span> : active ? <span className="text-[10px] text-text-on-dark font-bold">● now</span> : null}
                  </div>
                  <div className="font-display font-bold text-[13px] mt-1 leading-tight text-text-on-dark">
                    {p.title}{p.optional && <span className="ml-1 text-[9px] uppercase tracking-wide text-amber-300/90 font-mono">· optional</span>}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5 leading-snug">{p.blurb}</div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-text-muted text-center">
            Four phases — only one is work NoKLock does for you, and the last is optional. Your steps are short and precise.{" "}
            <button type="button" onClick={() => setExpert(true)} className="text-accent-cyan hover:underline">See every step ▸</button>
          </p>
        </>
      ) : (
        <div className="space-y-2.5">
          {PHASES.map((p) => {
            const steps: FlowStep[] = p.entries.map((e) => ({
              id: e.key,
              n: numbered.get(e.key) ?? 0,
              label: e.label,
              sub: e.sub,
              state: e.state,
              actor: e.actor,
              optional: e.optional,
            }));
            return (
              <div key={p.id} className={`rounded-lg border p-2.5 ${p.actor === "noklock" ? "border-accent-cyan/30 bg-accent-cyan/5" : "border-amber-400/25 bg-amber-400/[0.03]"}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[9px] uppercase tracking-wider font-bold ${p.actor === "noklock" ? "text-accent-cyan" : "text-amber-300"}`}>
                    {p.actor === "noklock" ? "NoKLock — automatic" : "Your step"}
                  </span>
                  <span className="text-[12px] text-text-on-dark font-display font-bold">{p.title}</span>
                  {p.optional && <span className="text-[9px] uppercase tracking-wide text-amber-300/90 font-mono">· whole phase optional</span>}
                </div>
                <FlowSteps perRow={7} activeId={activeKey} steps={steps} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
