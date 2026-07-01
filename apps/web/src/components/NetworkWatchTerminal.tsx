// @version 0.1.0 @date 2026-05-30
// Live scrolling terminal showing every network event the browser made
// since the page loaded. Subscribes to airgap-manager's ring buffer
// (extended hijacks + PerformanceObserver witness both feed it) and
// re-renders as events arrive. Sticky-bottom auto-scroll like a chat
// log; the user can scroll up to inspect history without it snapping
// back. Used by /prove-it/airgap as the primary demonstration surface.
//
// Color logic:
//   - blocked === true                 → red dot     (hijack rejected an attempt)
//   - channel === "perf-witness" + airgap → MUST BE EMPTY (real leak detector)
//   - channel === "perf-witness" + normal → grey dot (expected asset load)
//   - all other normal-mode events     → cyan dot
//
// When `airgapped === true` and zero events have arrived since the
// airgap engaged, the terminal shows a big "✓ NO TRAFFIC" placeholder
// to make the proof unmistakable.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type AirgapChannel,
  type AirgapEvent,
  getAirgapEvents,
  isAirgapped,
  subscribeAirgap,
} from "../lib/airgap-manager.js";

interface Props {
  /** Max rows to render (newest at top). Default 200; the ring buffer
   *  caps at 500 so older events fall off naturally. */
  readonly maxRows?: number;
  /** Inline-friendly height. Default 380. */
  readonly height?: number;
}

const CHANNEL_LABEL: Record<AirgapChannel, string> = {
  fetch:            "FETCH",
  xhr:              "XHR",
  beacon:           "BEACON",
  image:            "IMG",
  websocket:        "WS",
  eventsource:      "ES",
  rtc:              "RTC",
  "link-injection": "LINK",
  "script-injection":"SCRIPT",
  "perf-witness":   "PERF",
};

export function NetworkWatchTerminal({ maxRows = 200, height = 380 }: Props): JSX.Element {
  const [, setTick] = useState(0);
  const [stickyBottom, setStickyBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Re-render whenever airgap-manager fires a notify().
  useEffect(() => subscribeAirgap(() => setTick((n) => n + 1)), []);

  // Auto-scroll to bottom on new events, BUT only if user hasn't
  // scrolled up to inspect. Sticky-bottom pattern.
  useEffect(() => {
    if (!stickyBottom) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  const onScroll = useCallback((): void => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setStickyBottom(atBottom);
  }, []);

  const all = getAirgapEvents();
  const recent = all.slice(-maxRows);
  const airgap = isAirgapped();
  // Count events that happened DURING the airgap phase only.
  const sinceAirgap = airgap ? all.filter((e) => e.phase === "airgapped") : [];
  const blockedDuringAirgap = sinceAirgap.filter((e) => e.blocked).length;
  const leakedDuringAirgap = sinceAirgap.filter((e) => !e.blocked).length;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-bg-surface flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold">Network watch</div>
          <h3 className="text-base font-bold font-display mt-0.5">
            {airgap ? (
              <span className="text-emerald-300">● Airgap engaged · live</span>
            ) : (
              <span>○ Normal · live (passive witness only)</span>
            )}
          </h3>
        </div>
        <div className="text-xs font-mono text-text-muted">
          {airgap ? (
            <>
              <span className="text-rose-300">{blockedDuringAirgap} blocked</span>
              <span className="opacity-50"> · </span>
              <span className={leakedDuringAirgap > 0 ? "text-rose-400 font-bold" : "text-text-muted"}>{leakedDuringAirgap} leaked</span>
            </>
          ) : (
            <>{all.length} total · {recent.length} shown</>
          )}
        </div>
      </div>

      {/* Scrolling event log */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="font-mono text-[11px] overflow-y-auto"
        style={{ height }}
      >
        {recent.length === 0 ? (
          <EmptyState airgap={airgap} />
        ) : (
          <ol>
            {recent.map((e) => <Row key={e.id} ev={e} />)}
            {airgap && sinceAirgap.length === 0 && (
              <li className="px-4 py-6 text-center">
                <div className="text-emerald-300 text-2xl mb-1">✓</div>
                <div className="text-emerald-300 font-bold uppercase tracking-wider text-xs">No traffic since airgap engaged</div>
                <div className="text-text-muted text-[10px] mt-1">Type a seed phrase now. This line stays at zero.</div>
              </li>
            )}
          </ol>
        )}
      </div>

      {/* Legend + caption */}
      <div className="px-4 py-3 border-t border-bg-surface text-[10px] text-text-muted leading-relaxed">
        <div className="flex flex-wrap gap-3 mb-2">
          <Legend color="bg-rose-400" label="blocked" />
          <Legend color="bg-emerald-400" label="airgap clean" />
          <Legend color="bg-accent-cyan" label="normal" />
          <Legend color="bg-slate-500" label="browser-witness (perf timing)" />
        </div>
        <p>
          <strong>Covers:</strong> fetch · XHR · sendBeacon · Image.src · WebSocket · EventSource · RTCPeerConnection · DOM-injected &lt;script&gt;/&lt;link&gt; · plus the browser's own PerformanceObserver resource-timing (independent witness).{" "}
          <strong>Not covered:</strong> ServiceWorker fetch (none installed) · build-time injected hints · native import() · browser extensions or OS-level proxies (outside the page sandbox).
        </p>
      </div>
    </div>
  );
}

function EmptyState({ airgap }: { readonly airgap: boolean }): JSX.Element {
  return (
    <div className="px-4 py-8 text-center text-text-muted text-sm">
      {airgap ? (
        <>
          <div className="text-emerald-300 text-3xl mb-2">✓</div>
          <div className="text-emerald-300 font-bold uppercase tracking-wider text-xs">No traffic since airgap engaged</div>
          <div className="text-[10px] mt-1">Type a seed phrase now. This line stays at zero.</div>
        </>
      ) : (
        <>
          <div>Waiting for the browser to report resource loads…</div>
          <div className="text-[10px] mt-1">(PerformanceObserver populates this within ~250 ms of mount.)</div>
        </>
      )}
    </div>
  );
}

function Row({ ev }: { readonly ev: AirgapEvent }): JSX.Element {
  const dotColor =
    ev.blocked
      ? "bg-rose-400"
      : ev.channel === "perf-witness"
        ? ev.phase === "airgapped"
          ? "bg-rose-500"  // perf-witness during airgap = REAL LEAK
          : "bg-slate-500"
        : "bg-accent-cyan";
  const textColor =
    ev.blocked
      ? "text-rose-200"
      : ev.channel === "perf-witness" && ev.phase === "airgapped"
        ? "text-rose-300 font-bold"
        : "text-text-muted";
  const time = formatTime(ev.wallClock);
  return (
    <li className="grid grid-cols-[auto_auto_auto_1fr] gap-x-3 px-3 py-1 hover:bg-bg-surface/30 items-baseline border-b border-bg-surface/30 last:border-0">
      <span className={`inline-block w-2 h-2 rounded-full self-center ${dotColor}`} aria-hidden />
      <span className="text-text-muted">{time}</span>
      <span className="text-accent-cyan w-12">{CHANNEL_LABEL[ev.channel]}</span>
      <span className={`break-all ${textColor}`} title={ev.reason ?? ""}>{ev.url}</span>
    </li>
  );
}

function Legend({ color, label }: { readonly color: string; readonly label: string }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-2 h-2 rounded-full ${color}`} aria-hidden />
      <span>{label}</span>
    </span>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    const ms = String(d.getMilliseconds()).padStart(3, "0");
    return `${h}:${m}:${s}.${ms}`;
  } catch {
    return iso.slice(11, 23);
  }
}
