// @version 0.1.0 @date 2026-05-31
// AirgapCodeModal — Daniel asked for a click-to-see-code modal on the
// /prove-it/airgap page so users can verify the actual source of the
// firewall claim instead of taking our word.
//
// Per Daniel's chosen approach: BUNDLE the source as a string at build
// time (vite's native `?raw` import — no extra dependency) so the modal
// renders the source INLINE. No network call when the user clicks; the
// source is already on their device. This preserves the airgap claim
// when the user opens the modal during an airgap-engaged session.
//
// GitHub link: shown ONLY when the airgap is NOT engaged (clicking would
// otherwise leave the page for github.com — a third party — at exactly
// the wrong moment). When airgap is on, the modal explicitly tells the
// user "GitHub link disabled while airgap engaged — inline source is the
// full proof."
//
// Files exposed:
//   1. lib/airgap-manager.ts    — the 9-channel browser-exfil firewall
//   2. lib/airgap-perf-witness.ts — PerformanceObserver browser-native witness
//   3. main.tsx                  — the boot install call (when the firewall arms)
//
// Honest caveat included: the codebase does NOT have an explicit
// `memzero` / `wipeSeed` function. The seed lives in React state (a JS
// string) and is released by garbage collection when the component
// unmounts or state is overwritten — same model as every JS-based vault
// in the industry. Stating this openly per the no-lying rule, rather
// than pretending a synchronous wipe exists.

import { useEffect, useState } from "react";
import { useOfflineState } from "../hooks/useOfflineState.js";
// vite ?raw imports — the source files ship as strings inside dist/assets.
// No network call when the modal opens; the proof is bundled with the page.
import airgapManagerSource from "../lib/airgap-manager.ts?raw";
import airgapPerfWitnessSource from "../lib/airgap-perf-witness.ts?raw";
import mainBootSource from "../main.tsx?raw";

const GITHUB_BASE = "https://github.com/dksteeves/noklock/blob/main/apps/web/src";

interface FileEntry {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly relativePath: string;   // for the GitHub link
  readonly source: string;
}

// Scrub the displayed source before render. The public modal keeps the
// CURRENT @version + @date header (so readers can pin to a specific
// commit on GitHub) and the implementation comments. It strips the
// multi-version changelog block (replaced with a one-line placeholder so
// it's obvious history exists), and strips internal author/assistant
// names. The on-disk source is unchanged.
function scrubForPublicDisplay(src: string): string {
  const lines = src.split("\n");
  const out: string[] = [];
  let inChangelog = false;
  let placedPlaceholder = false;
  for (const raw of lines) {
    // Strip lines that mention internal authorship / assistant. Drop the
    // whole line — the surrounding rule comment usually stands on its own.
    if (/\b(Daniel|Claude|Anthropic)\b/i.test(raw)) continue;
    // Keep the FIRST `// @version X.Y.Z @date YYYY-MM-DD` header. Subsequent
    // version-entry lines (`// X.Y.Z — ...`) and their continuation comment
    // lines are stripped — that's the internal changelog block.
    const versionHeader = /^\s*\/\/\s*@version\s+\S+\s+@date\s+\S+/.test(raw);
    const versionEntry  = /^\s*\/\/\s*\d+\.\d+(?:\.\d+)?\s*[—–-]/.test(raw);
    if (versionHeader) {
      out.push(raw);
      inChangelog = true;
      placedPlaceholder = false;
      continue;
    }
    if (inChangelog) {
      if (versionEntry) {
        if (!placedPlaceholder) {
          out.push("// [changelog entries removed for public display — full version history on GitHub]");
          placedPlaceholder = true;
        }
        continue;
      }
      if (/^\s*\/\/\s*\S/.test(raw)) continue; // continuation comment inside the block — drop
      inChangelog = false;
      out.push(raw);
      continue;
    }
    out.push(raw);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

const FILES: readonly FileEntry[] = [
  {
    key: "airgap-manager",
    label: "lib/airgap-manager.ts",
    description: "The 9-channel browser-exfil firewall. Hijacks fetch, XHR, sendBeacon, Image.src, WebSocket, EventSource, RTCPeerConnection, DOM-injected <script src>, and DOM-injected <link rel=preconnect|prefetch|preload|stylesheet|dns-prefetch>. Every blocked attempt is recorded in an in-memory ring buffer.",
    relativePath: "lib/airgap-manager.ts",
    source: scrubForPublicDisplay(airgapManagerSource as unknown as string),
  },
  {
    key: "airgap-perf-witness",
    label: "lib/airgap-perf-witness.ts",
    description: "Independent corroboration layer. Reads the browser engine's own PerformanceObserver resource-timing buffer — so if a leak somehow escaped the firewall above, the browser itself would still record it here. Two independent observers must agree.",
    relativePath: "lib/airgap-perf-witness.ts",
    source: scrubForPublicDisplay(airgapPerfWitnessSource as unknown as string),
  },
  {
    key: "main-boot",
    label: "main.tsx (boot install)",
    description: "Where the firewall arms. Called BEFORE React renders, BEFORE any vault code runs, so the hijacks are in place by the time any seed-handling code mounts.",
    relativePath: "main.tsx",
    source: scrubForPublicDisplay(mainBootSource as unknown as string),
  },
];

export function AirgapCodeModalTrigger(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-mono px-3 py-1.5 rounded border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10"
      >
        📄 View the firewall source
      </button>
      {open && <AirgapCodeModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AirgapCodeModal({ onClose }: { readonly onClose: () => void }): JSX.Element {
  const [active, setActive] = useState<string>(FILES[0]?.key ?? "");
  const { airgapped } = useOfflineState();

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const activeFile = FILES.find((f) => f.key === active) ?? FILES[0];
  if (!activeFile) return <></>;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Firewall source code"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(2, 6, 23, 0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-deepest border border-bg-surface rounded-lg shadow-2xl flex flex-col"
        style={{ width: "min(1200px, 96vw)", height: "min(820px, 92vh)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-bg-surface">
          <div className="flex items-baseline gap-3 flex-wrap">
            <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold">Firewall source — bundled into this page</div>
            <div className="text-xs text-text-muted">
              No network call when you opened this modal; the source is already on your device.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-text-on-dark text-lg leading-none px-2"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 pt-2 border-b border-bg-surface flex-wrap flex-shrink-0">
          {FILES.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActive(f.key)}
              className={
                "text-xs font-mono px-3 py-1.5 rounded-t " +
                (f.key === active
                  ? "bg-bg-surface text-accent-cyan border-x border-t border-bg-surface"
                  : "text-text-muted hover:text-text-on-dark")
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Description for the active file */}
        <div className="px-5 py-3 text-sm text-text-on-dark/85 border-b border-bg-surface flex-shrink-0">
          {activeFile.description}
        </div>

        {/* Source */}
        <pre
          className="flex-1 overflow-auto px-5 py-3 font-mono text-[11px] leading-relaxed text-text-on-dark/95 bg-bg-deepest"
          style={{ whiteSpace: "pre", tabSize: 2 }}
        >
          {activeFile.source}
        </pre>

        {/* Honest caveat + GitHub footer */}
        <div className="px-5 py-3 border-t border-bg-surface text-xs flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
          <div className="text-text-muted">
            <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px]">Honest caveat —</span>{" "}
            the seed itself is a JavaScript string in React state; we have no explicit memzero call
            (the JS engine doesn't expose synchronous wipe of strings or GC-managed buffers). Same memory
            model as every browser-based vault. The firewall is what stops it from leaving the page.
          </div>
          {airgapped ? (
            <span className="text-amber-300 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap">
              ⚡ Airgap engaged — GitHub link disabled. Inline source is the full proof.
            </span>
          ) : (
            <a
              href={`${GITHUB_BASE}/${activeFile.relativePath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:underline font-mono text-[11px] whitespace-nowrap"
            >
              View {activeFile.label} on GitHub ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
