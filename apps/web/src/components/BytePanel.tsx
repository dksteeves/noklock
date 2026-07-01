// @version 0.2.0 @date 2026-05-29
// 0.2.0 — Hybrid reveal UX (Daniel feedback):
//   • Press-and-hold "Peek" button now reveals an INLINE mini-preview
//     right under the button — fingerprint hex, side-by-side. No modal,
//     no cursor-leaves-button-and-vanishes bug.
//   • Separate "Expand to compare" button opens a click-to-toggle modal
//     that stays open until dismissed (Esc / backdrop / close button).
//     User can move their cursor freely to read the bytes.
// 0.1.0 — Initial bottom-bar artefact comparison.

import { useEffect, useState } from "react";

interface Props {
  readonly original: Uint8Array | null;
  readonly recovered: Uint8Array | null;
  readonly match: boolean | null;
  readonly kindLabel?: string;
  readonly originalText?: string | null;
  readonly recoveredText?: string | null;
  readonly originalDataUrl?: string | null;
  readonly recoveredDataUrl?: string | null;
}

export function BytePanel({
  original,
  recovered,
  match,
  kindLabel = "artefact",
  originalText,
  recoveredText,
  originalDataUrl,
  recoveredDataUrl,
}: Props): JSX.Element {
  const [peekHeld, setPeekHeld] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Close the modal on Esc.
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent): void => { if (e.key === "Escape") setModalOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const hasOriginal = !!original && original.length > 0;
  const hasRecovered = !!recovered && recovered.length > 0;

  return (
    <div className="card" style={{ position: "relative" }}>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold">
            Before &amp; after
          </div>
          <h3 className="text-base font-bold font-display mt-0.5">
            The {kindLabel} you put in vs. what came out
          </h3>
        </div>
        {match !== null && (
          <span
            className={
              match
                ? "tier-badge bg-emerald-700/40 text-emerald-300"
                : "tier-badge bg-rose-700/40 text-rose-300"
            }
          >
            {match ? "✓ byte-for-byte match" : "✗ MISMATCH"}
          </span>
        )}
      </div>

      {/* Always-visible summary tiles. */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        <ByteTile label="Original (in)" bytes={original} disabled={!hasOriginal} />
        <div className="hidden sm:flex items-center justify-center text-text-muted text-2xl">→</div>
        <ByteTile label="Recovered (out)" bytes={recovered} disabled={!hasRecovered} accent={match === true} />
      </div>

      {(hasOriginal || hasRecovered) && (
        <>
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-text-muted">
              Peek = press &amp; hold for a quick fingerprint glimpse. Expand = open the full side-by-side comparison (stays open until you close it).
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onMouseDown={() => setPeekHeld(true)}
                onMouseUp={() => setPeekHeld(false)}
                onMouseLeave={() => setPeekHeld(false)}
                onTouchStart={(e) => { e.preventDefault(); setPeekHeld(true); }}
                onTouchEnd={() => setPeekHeld(false)}
                className="btn btn-secondary text-xs whitespace-nowrap select-none"
              >
                Peek (hold)
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn btn-primary text-xs whitespace-nowrap"
              >
                Expand to compare ↗
              </button>
            </div>
          </div>

          {/* 0.2.0 — INLINE mini-preview. Visible only while Peek is held;
              shows a 32-byte hex fingerprint pair so the user can spot at
              a glance whether the bytes line up. No modal = cursor can
              stay on the button without the content vanishing. */}
          {peekHeld && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 font-mono text-[11px]">
              <div className="rounded border border-accent-cyan/40 bg-bg-deepest/70 p-2">
                <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Original — first 32 bytes</div>
                <div className="text-accent-cyan break-all">{original ? hexShort(original, 32) : "—"}</div>
              </div>
              <div className="rounded border border-accent-green/40 bg-bg-deepest/70 p-2">
                <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Recovered — first 32 bytes</div>
                <div className="text-accent-green break-all">{recovered ? hexShort(recovered, 32) : "—"}</div>
              </div>
            </div>
          )}
        </>
      )}

      {modalOpen && (hasOriginal || hasRecovered) && (
        <BytePopup
          original={original}
          recovered={recovered}
          originalText={originalText ?? null}
          recoveredText={recoveredText ?? null}
          originalDataUrl={originalDataUrl ?? null}
          recoveredDataUrl={recoveredDataUrl ?? null}
          onDismiss={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function ByteTile({
  label,
  bytes,
  disabled,
  accent = false,
}: {
  readonly label: string;
  readonly bytes: Uint8Array | null;
  readonly disabled: boolean;
  readonly accent?: boolean;
}): JSX.Element {
  const fp = bytes ? fingerprint(bytes) : null;
  const count = bytes?.length ?? 0;
  return (
    <div
      className={
        "rounded-lg border px-4 py-3 " +
        (disabled
          ? "border-bg-surface/50 bg-bg-deepest/30 text-text-muted"
          : accent
            ? "border-accent-green/50 bg-emerald-950/30"
            : "border-bg-surface bg-bg-deepest/60")
      }
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold mb-1">{label}</div>
      <div className="font-mono text-sm text-text-on-dark/90">
        {disabled ? "—" : `${count.toLocaleString()} bytes`}
      </div>
      <div className="font-mono text-[11px] text-text-muted mt-1 truncate">
        {disabled ? "(awaiting run)" : `fp ${fp}`}
      </div>
    </div>
  );
}

function BytePopup({
  original,
  recovered,
  originalText,
  recoveredText,
  originalDataUrl,
  recoveredDataUrl,
  onDismiss,
}: {
  readonly original: Uint8Array | null;
  readonly recovered: Uint8Array | null;
  readonly originalText: string | null;
  readonly recoveredText: string | null;
  readonly originalDataUrl: string | null;
  readonly recoveredDataUrl: string | null;
  readonly onDismiss: () => void;
}): JSX.Element {
  const renderImage = !!originalDataUrl || !!recoveredDataUrl;
  const renderText = !renderImage && (!!originalText || !!recoveredText);
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 6, 23, 0.92)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0b1220",
          border: "1px solid #1e293b",
          borderRadius: 12,
          padding: 24,
          maxWidth: 1100,
          width: "100%",
          maxHeight: "92vh",
          overflow: "auto",
          color: "#e2e8f0",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.55)",
        }}
      >
        <div className="flex items-baseline justify-between mb-4 gap-3">
          <h3 className="text-lg font-bold font-display">
            <span className="grad">Side-by-side: original vs. recovered</span>
          </h3>
          <button
            type="button"
            onClick={onDismiss}
            className="btn btn-secondary text-xs"
            aria-label="Close comparison"
          >
            Close ✕
          </button>
        </div>

        {renderImage ? (
          <div className="flex flex-wrap gap-8 justify-center">
            {originalDataUrl && (
              <div className="text-center">
                <div className="text-text-muted text-xs mb-2 uppercase tracking-wider">Original</div>
                <img src={originalDataUrl} alt="original" className="w-48 h-48 rounded border border-bg-surface" />
              </div>
            )}
            {recoveredDataUrl && (
              <div className="text-center">
                <div className="text-text-muted text-xs mb-2 uppercase tracking-wider">Recovered</div>
                <img src={recoveredDataUrl} alt="recovered" className="w-48 h-48 rounded border border-accent-green" />
              </div>
            )}
          </div>
        ) : renderText ? (
          <div className="grid md:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <div className="text-text-muted mb-1 uppercase tracking-wider text-[10px]">Original</div>
              <pre className="whitespace-pre-wrap break-words text-accent-cyan max-h-[60vh] overflow-auto p-3 bg-bg-deepest rounded border border-bg-surface">{originalText}</pre>
            </div>
            <div>
              <div className="text-text-muted mb-1 uppercase tracking-wider text-[10px]">Recovered</div>
              <pre className="whitespace-pre-wrap break-words text-accent-green max-h-[60vh] overflow-auto p-3 bg-bg-deepest rounded border border-accent-green/40">{recoveredText}</pre>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 font-mono text-[11px]">
            <div>
              <div className="text-text-muted mb-1 uppercase tracking-wider text-[10px]">Original (hex)</div>
              <pre className="whitespace-pre-wrap break-all text-accent-cyan max-h-[60vh] overflow-auto p-3 bg-bg-deepest rounded border border-bg-surface">{original ? hexBlock(original) : "—"}</pre>
            </div>
            <div>
              <div className="text-text-muted mb-1 uppercase tracking-wider text-[10px]">Recovered (hex)</div>
              <pre className="whitespace-pre-wrap break-all text-accent-green max-h-[60vh] overflow-auto p-3 bg-bg-deepest rounded border border-accent-green/40">{recovered ? hexBlock(recovered) : "—"}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function fingerprint(bytes: Uint8Array): string {
  if (bytes.length === 0) return "(empty)";
  if (bytes.length <= 8) return toHex(bytes);
  return `${toHex(bytes.slice(0, 4))}…${toHex(bytes.slice(-4))}`;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// First N bytes as hex (space-grouped per byte). Used by the inline peek.
function hexShort(bytes: Uint8Array, max: number): string {
  const slice = bytes.length > max ? bytes.slice(0, max) : bytes;
  const hex = toHex(slice);
  const grouped = hex.match(/.{1,2}/g)?.join(" ") ?? hex;
  return bytes.length > max ? `${grouped} …` : grouped;
}

function hexBlock(bytes: Uint8Array): string {
  const cap = 4096;
  const shown = bytes.length > cap ? bytes.slice(0, cap) : bytes;
  const lines: string[] = [];
  for (let i = 0; i < shown.length; i += 16) {
    const row = shown.slice(i, i + 16);
    lines.push(`${i.toString(16).padStart(6, "0")}  ${toHex(row).match(/.{1,2}/g)!.join(" ")}`);
  }
  if (bytes.length > cap) {
    lines.push(`…  (${(bytes.length - cap).toLocaleString()} more bytes — truncated for display)`);
  }
  return lines.join("\n");
}
