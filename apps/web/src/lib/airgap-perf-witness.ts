// @version 0.1.0 @date 2026-05-30
// Independent "browser-native witness" for the airgap claim. The hijacks
// in airgap-manager.ts override fetch / XHR / sendBeacon / Image / etc.
// to suppress and record outbound attempts — but a sufficiently paranoid
// user could ask "what if the hijack itself is lying?" This module
// answers: PerformanceObserver({type: "resource"}) reads the browser's
// OWN resource-timing buffer, populated by the browser engine, not by
// any JS we wrote. If a request goes out that our hijacks somehow
// missed, the browser will still record it here and the airgap terminal
// will surface it.
//
// During the airgap phase, the expectation is ZERO new perf-witness
// events. If any appear, that's a real leak and the UI must red-flag it.
//
// `buffered: true` flushes the boot-time resource loads (the app shell
// chunks loaded before this observer attached) so the terminal can show
// "here are the N same-origin assets the app needed to start" as the
// pre-airgap baseline.

import { recordAirgapEvent, isAirgapped } from "./airgap-manager.js";

let _attached = false;

export function installAirgapPerfWitness(): void {
  if (_attached) return;
  _attached = true;
  if (typeof PerformanceObserver === "undefined") return;
  try {
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        const url = entry.name;
        if (!url) continue;
        const sameOrigin =
          typeof location !== "undefined" &&
          (url.startsWith(location.origin) || url.startsWith("/"));
        recordAirgapEvent({
          channel: "perf-witness",
          url,
          blocked: false,
          reason: sameOrigin ? "same-origin asset" : "cross-origin",
          phase: isAirgapped() ? "airgapped" : "normal",
        });
      }
    });
    obs.observe({ type: "resource", buffered: true });
  } catch {
    // PerformanceObserver not supported or rejected our options — silent skip.
  }
}
