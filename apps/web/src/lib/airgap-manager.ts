// @version 0.4.0 @date 2026-06-01
// 0.4.0 — Daniel 2026-06-01 (AUDIT FIX 4): Image.src hijack now THROWS
//          instead of silently substituting a 1×1 transparent data URI.
//          Audit flagged the asymmetry — fetch/XHR/beacon/WebSocket all
//          throw/abort under airgap, but Image silently faked success,
//          which would make injected tracking-pixel exfil appear to work
//          to attacker code. Now symmetric.
// 0.3.0 — @date 2026-05-30
//
// 0.3.0 — Daniel: the airgap-proof feature. Extended from fetch-only
//         hijacking to ALL outbound channels a browser exposes:
//         XMLHttpRequest, navigator.sendBeacon, Image.src, WebSocket,
//         EventSource, RTCPeerConnection, plus a MutationObserver that
//         catches DOM-time `<script src>` / `<link rel=preconnect|preload|
//         stylesheet>` injection. Replaced the bare `_blockedCount: number`
//         with a bounded ring buffer of `AirgapEvent` records (one per
//         attempt, with URL/timestamp/channel/blocked/reason) so the new
//         <NetworkWatchTerminal/> can render every event live. All exports
//         from 0.2.0 stay valid (back-compat) — `blockedFetchCount()` is
//         now a derived getter that sums blocked events. New exports:
//         `getAirgapEvents()`, `clearAirgapEvents()`, `recordAirgapEvent()`
//         (so the PerformanceObserver witness can push), `installAirgapHijacks()`
//         (idempotent boot-time installer — call once from main.tsx).
//
// 0.2.0 — added blocked-fetch counter + change-event subscription so the
//         Enrol UI can render a visible "fetches blocked since airgap engaged: N"
//         badge.
// 0.1.0 — circuit-breaker fetch hijack during enrolment.

type Mode = "normal" | "airgapped";

export type AirgapChannel =
  | "fetch" | "xhr" | "beacon" | "image" | "websocket"
  | "eventsource" | "rtc" | "link-injection" | "script-injection"
  | "perf-witness";

export interface AirgapEvent {
  readonly id: number;
  readonly t: number;
  readonly wallClock: string;
  readonly channel: AirgapChannel;
  readonly url: string;
  readonly blocked: boolean;
  readonly reason?: string;
  readonly phase: "airgapped" | "normal";
}

const MAX_EVENTS = 500;
const _events: AirgapEvent[] = [];
let _nextId = 1;

let _mode: Mode = "normal";
const _listeners = new Set<() => void>();
let _installed = false;
let _engagedAt = 0;

const _origFetch = globalThis.fetch.bind(globalThis);

function notify(): void {
  _listeners.forEach((l) => { try { l(); } catch { /* ignore */ } });
}

/** Internal — push a new record into the ring buffer + notify. Also
 *  exported so the PerformanceObserver witness module can push
 *  resource-timing events as the browser's independent corroboration. */
export function recordAirgapEvent(
  e: Omit<AirgapEvent, "id" | "t" | "wallClock" | "phase"> & { phase?: AirgapEvent["phase"] },
): void {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const wall = new Date().toISOString();
  const record: AirgapEvent = {
    id: _nextId++,
    t: _engagedAt > 0 ? now - _engagedAt : 0,
    wallClock: wall,
    channel: e.channel,
    url: e.url,
    blocked: e.blocked,
    ...(e.reason !== undefined ? { reason: e.reason } : {}),
    phase: e.phase ?? (_mode === "airgapped" ? "airgapped" : "normal"),
  };
  _events.push(record);
  if (_events.length > MAX_EVENTS) _events.shift();
  notify();
}

/** Snapshot of the ring buffer for the UI. Cheap. */
export function getAirgapEvents(): readonly AirgapEvent[] {
  return _events.slice();
}

export function clearAirgapEvents(): void {
  _events.length = 0;
  notify();
}

// ============================================================================
// Hijacks. Each is gated on `_mode === "airgapped"`; when not airgapped,
// the original behaviour runs unmodified. When airgapped, the attempt is
// recorded (with the URL extracted as best we can) and the native action
// is suppressed (throw / no-op / return false / abort, whichever fits
// the channel's normal failure mode).
// ============================================================================

function urlOf(input: unknown): string {
  try {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.toString();
    if (typeof input === "object" && input !== null && "url" in input) {
      const v = (input as { url?: unknown }).url;
      if (typeof v === "string") return v;
    }
  } catch { /* ignore */ }
  return "(opaque)";
}

function installFetchHijack(): void {
  globalThis.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (_mode === "airgapped") {
      const u = urlOf(input);
      recordAirgapEvent({ channel: "fetch", url: u, blocked: true, reason: "airgap engaged" });
      throw new Error(`[airgap] fetch blocked during enrolment: ${u}`);
    }
    return _origFetch(input, init);
  };
}

function installXhrHijack(): void {
  if (typeof XMLHttpRequest === "undefined") return;
  const proto = XMLHttpRequest.prototype;
  const origOpen = proto.open;
  const origSend = proto.send;
  proto.open = function (this: XMLHttpRequest & { __airgapUrl?: string }, _method: string, url: string | URL, ..._rest: unknown[]): void {
    this.__airgapUrl = typeof url === "string" ? url : url.toString();
    // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-explicit-any
    return origOpen.apply(this, arguments as any);
  };
  proto.send = function (this: XMLHttpRequest & { __airgapUrl?: string }, body?: Document | XMLHttpRequestBodyInit | null): void {
    if (_mode === "airgapped") {
      const u = this.__airgapUrl ?? "(unknown)";
      recordAirgapEvent({ channel: "xhr", url: u, blocked: true, reason: "airgap engaged" });
      // Abort the in-flight request immediately instead of sending.
      try { this.abort(); } catch { /* ignore */ }
      return;
    }
    return origSend.call(this, body ?? null);
  };
}

function installBeaconHijack(): void {
  if (typeof navigator === "undefined") return;
  const orig = navigator.sendBeacon?.bind(navigator);
  if (!orig) return;
  navigator.sendBeacon = function (url: string | URL, data?: BodyInit | null): boolean {
    if (_mode === "airgapped") {
      recordAirgapEvent({ channel: "beacon", url: urlOf(url), blocked: true, reason: "airgap engaged" });
      return false;
    }
    return orig(url, data);
  };
}

function installImageHijack(): void {
  if (typeof HTMLImageElement === "undefined") return;
  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
  if (!desc || !desc.set) return;
  const origSet = desc.set;
  const origGet = desc.get;
  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: true,
    enumerable: true,
    get() { return origGet ? origGet.call(this) : ""; },
    set(value: string) {
      if (_mode === "airgapped" && typeof value === "string" && value && !value.startsWith("data:")) {
        // 0.4.0 — Daniel 2026-06-01 (AUDIT FIX 4): symmetric refusal with
        // the other channels (fetch/xhr/beacon/websocket all throw/abort).
        // Previously we silently substituted a 1×1 transparent data URI,
        // which made injected tracking-pixel exfil APPEAR successful to
        // attacker code (onload fired with no real request). Now: record
        // the block AND throw — attacker code sees the failure, error
        // surfaces in DevTools, behaviour matches every other hijack.
        recordAirgapEvent({ channel: "image", url: value, blocked: true, reason: "airgap engaged" });
        throw new Error("airgap: Image.src blocked while airgap is engaged");
      }
      return origSet.call(this, value);
    },
  });
}

function installWebSocketHijack(): void {
  if (typeof WebSocket === "undefined") return;
  const Orig = WebSocket;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Wrapped = function (this: WebSocket, url: string | URL, protocols?: string | string[]): WebSocket {
    if (_mode === "airgapped") {
      recordAirgapEvent({ channel: "websocket", url: urlOf(url), blocked: true, reason: "airgap engaged" });
      throw new Error(`[airgap] WebSocket blocked: ${urlOf(url)}`);
    }
    return new Orig(url, protocols);
  } as unknown as typeof WebSocket;
  Wrapped.prototype = Orig.prototype;
  // Copy the WebSocket state constants via Object.defineProperty so TS
  // doesn't complain about read-only assignment.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.assign(Wrapped as any, { CONNECTING: Orig.CONNECTING, OPEN: Orig.OPEN, CLOSING: Orig.CLOSING, CLOSED: Orig.CLOSED });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).WebSocket = Wrapped;
}

function installEventSourceHijack(): void {
  if (typeof EventSource === "undefined") return;
  const Orig = EventSource;
  const Wrapped = function (this: EventSource, url: string | URL, init?: EventSourceInit): EventSource {
    if (_mode === "airgapped") {
      recordAirgapEvent({ channel: "eventsource", url: urlOf(url), blocked: true, reason: "airgap engaged" });
      throw new Error(`[airgap] EventSource blocked: ${urlOf(url)}`);
    }
    return new Orig(url, init);
  } as unknown as typeof EventSource;
  Wrapped.prototype = Orig.prototype;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.assign(Wrapped as any, { CONNECTING: Orig.CONNECTING, OPEN: Orig.OPEN, CLOSED: Orig.CLOSED });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).EventSource = Wrapped;
}

function installRtcHijack(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (typeof g.RTCPeerConnection === "undefined") return;
  const Orig = g.RTCPeerConnection;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Wrapped = function (this: any, ...args: unknown[]): any {
    if (_mode === "airgapped") {
      recordAirgapEvent({ channel: "rtc", url: "(RTCPeerConnection)", blocked: true, reason: "airgap engaged" });
      throw new Error("[airgap] RTCPeerConnection blocked");
    }
    return new Orig(...args);
  } as unknown as typeof g.RTCPeerConnection;
  Wrapped.prototype = Orig.prototype;
  g.RTCPeerConnection = Wrapped;
}

function installMutationObserver(): void {
  if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;
  const obs = new MutationObserver((mutations) => {
    if (_mode !== "airgapped") return;
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return;
        // Script tags with src
        if (n.tagName === "SCRIPT") {
          const src = n.getAttribute("src");
          if (src) {
            recordAirgapEvent({ channel: "script-injection", url: src, blocked: true, reason: "DOM injection during airgap" });
            n.remove();
          }
        }
        // <link rel=preconnect|prefetch|preload|stylesheet|dns-prefetch>
        if (n.tagName === "LINK") {
          const rel = (n.getAttribute("rel") ?? "").toLowerCase();
          const href = n.getAttribute("href");
          if (href && /preconnect|prefetch|preload|stylesheet|dns-prefetch/.test(rel)) {
            recordAirgapEvent({ channel: "link-injection", url: href, blocked: true, reason: `link rel=${rel}` });
            n.remove();
          }
        }
      });
    }
  });
  try {
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch { /* document not ready */ }
}

/** Idempotent boot-time installer. Call once from main.tsx. Safe to call
 *  multiple times — subsequent calls are no-ops. */
export function installAirgapHijacks(): void {
  if (_installed) return;
  _installed = true;
  installFetchHijack();
  installXhrHijack();
  installBeaconHijack();
  installImageHijack();
  installWebSocketHijack();
  installEventSourceHijack();
  installRtcHijack();
  installMutationObserver();
}

// ============================================================================
// Existing public surface — back-compat with 0.2.0 callers.
// ============================================================================

export function enterAirgap(): void {
  _mode = "airgapped";
  _engagedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (typeof document !== "undefined") document.documentElement.dataset.airgap = "true";
  notify();
  // eslint-disable-next-line no-console
  console.warn("[airgap] active — all outbound channels hijacked");
}

export function leaveAirgap(): void {
  _mode = "normal";
  _engagedAt = 0;
  if (typeof document !== "undefined") delete document.documentElement.dataset.airgap;
  notify();
  // eslint-disable-next-line no-console
  console.warn("[airgap] cleared");
}

/** Run an async fn with the airgap TEMPORARILY lifted, restoring the prior mode
 *  afterwards (even on throw). For PRE-DECRYPT online coordination that
 *  legitimately needs the network and exposes NO seed — specifically the M-of-N
 *  quorum owner/heir authorization round-trip (fetch a one-shot challenge nonce
 *  + the Form-B attestation). The actual seed decrypt still runs airgapped (it
 *  re-engages after this resolves). Daniel 2026-06-15: the owner-challenge fork
 *  was documented to "allow the explicit attestation POST/GET while blocking
 *  everything else", but the fetch hijack blocked it too — so quorum restore was
 *  dead-locked behind the tab-wide airgap. This is that intended carve-out, made
 *  explicit + bounded (only the wrapped call is online; nothing else). */
export async function runOnline<T>(fn: () => Promise<T>): Promise<T> {
  const wasAirgapped = _mode === "airgapped";
  if (wasAirgapped) _mode = "normal";
  try {
    return await fn();
  } finally {
    if (wasAirgapped) _mode = "airgapped";
  }
}

export function isAirgapped(): boolean {
  return _mode === "airgapped";
}

/** 0.3.0 — derived getter for back-compat with the existing Enrol badge. */
export function blockedFetchCount(): number {
  return _events.filter((e) => e.blocked && e.channel === "fetch").length;
}

/** 0.3.0 — total blocked events across ALL channels (for the new terminal). */
export function blockedTotalCount(): number {
  return _events.filter((e) => e.blocked).length;
}

export function subscribeAirgap(listener: () => void): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

export function isBrowserOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
