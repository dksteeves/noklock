// @version 0.3.0 @date 2026-05-28
// 0.3.0 — Daniel 2026-05-28: caught a regression where running Prove-It
//         triggered the "Updating to the latest version…" stale-recovery
//         path and REVERTED Daniel to the previous build. Root cause: the
//         lazy-loaded ProveItVizPanel chunk hit a transient load error
//         (likely a SW-cache transition); ErrorBoundary caught the React
//         error and ran attemptStaleRecovery() unconditionally, which
//         purged the SW + caches + hard-reloaded; the post-reload fetch
//         hit a stale CDN edge cache and served the previous build's
//         index.html. Fix: only auto-recover for clearly chunk-load /
//         dynamic-import / stale-bundle errors. Any other render error
//         shows the regular "Something broke" card — manual recovery
//         via "Try again" or refresh, no aggressive SW purge.
// 0.2.1 — Recovery one-shot is now keyed to the BUILD id (not a bare
//         "1"). So each deployed build gets exactly one auto-recovery
//         per tab — a stale-bundle crash on ANY page (admin/home/…)
//         self-heals once for that build, and the next deploy gets a
//         fresh budget — while a genuinely-broken build still can't
//         loop (same build id stored → card shown). Pairs with the
//         main.tsx SW-controllerchange reload for the non-throwing case.
// 0.2.0 — Stale-service-worker SELF-HEAL. After a deploy, a returning
//         browser can be served the PREVIOUS precached bundle by the old
//         service worker for one navigation (vite-plugin-pwa autoUpdate
//         has a one-load activation lag). That old bundle can be a build
//         with a since-fixed bug (this is exactly the TrustBlock
//         "o.toFixed" crash Daniel saw: server already serves the fixed
//         build — proven by curl — but the SW replayed the old one). On
//         the FIRST contained error per browser-session we now purge all
//         caches + unregister service workers + hard-reload ONCE, so the
//         fresh build loads with no manual hard-refresh. A sessionStorage
//         one-shot prevents any reload loop — if the fresh build also
//         throws (a real bug) the recovery card shows instead.
// 0.1.0 — App-wide React error boundary.
//
// Why this exists: the app previously had ZERO error boundaries. React 18
// unmounts the entire root when a render throws and nothing catches it —
// so one bad component (e.g. the /admin Audit tab's render-phase setState)
// blanked the WHOLE site to white instead of degrading one page. This
// contains any render-time throw to a recoverable card while keeping the
// rest of the shell (TopNav, Footer) alive as the escape hatch.
//
// Zero telemetry by design — consistent with the no-PII posture. The error
// is logged to the console for the owner/dev only; nothing is sent anywhere.

import { Component, type ErrorInfo, type ReactNode } from "react";

// Per-build, per-tab one-shot. The stored value is the build id we last
// auto-recovered on. Different build (a new deploy, OR the stale bundle
// vs the fresh one) → recover once. Same build already recovered → it's
// a genuine bug in the live build, show the card (never loop).
declare const __BUILD_VERSION__: string;
const RECOVERY_KEY = "nk-eb-stale-recovery";

function currentBuild(): string {
  try {
    return typeof __BUILD_VERSION__ === "string" ? __BUILD_VERSION__ : "?";
  } catch {
    return "?";
  }
}

/** Heuristic: is this React render error a chunk-load / dynamic-import
 *  failure? Those are the only errors where wiping SW + caches + reload
 *  is the right answer. Everything else (a bug in our code, a network
 *  fetch failure in a hook, etc.) should show the regular error card and
 *  let the user decide. */
function isStaleBundleError(error: Error): boolean {
  const msg = (error.message || "").toLowerCase();
  const name = (error.name || "").toLowerCase();
  return (
    name === "chunkloaderror" ||
    msg.includes("chunkloaderror") ||
    msg.includes("loading chunk") ||
    msg.includes("loading css chunk") ||
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("dynamically imported module") ||
    msg.includes("importing a module script failed") ||
    msg.includes("error loading dynamically imported module")
  );
}

function attemptStaleRecovery(): boolean {
  try {
    if (typeof sessionStorage === "undefined") return false;
    const build = currentBuild();
    if (sessionStorage.getItem(RECOVERY_KEY) === build) return false; // already recovered on this build
    sessionStorage.setItem(RECOVERY_KEY, build);
  } catch {
    return false; // storage blocked → don't risk a loop, just show the card
  }
  // Purge SW + caches, then hard-reload to pull the fresh build from the
  // server (which — verified — already serves the fixed bundle + CSP).
  void (async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* best-effort — reload anyway */
    } finally {
      window.location.reload();
    }
  })();
  return true;
}

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly error: Error | null;
  readonly recovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, recovering: false };

  static getDerivedStateFromError(error: Error): State {
    return { error, recovering: false };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Console only. No network, no analytics, no PII — by design.
    // eslint-disable-next-line no-console
    console.error("[NoKLock] render error contained by ErrorBoundary:", error, info.componentStack);
    // 0.3.0 — ONLY trigger the aggressive SW-purge-and-reload path for
    // clearly chunk-load / dynamic-import / stale-bundle errors. Other
    // render errors show the regular card instead. This prevents the
    // regression Daniel hit on 2026-05-28: a transient lazy-chunk load
    // error during a SW cache transition cascaded into a full SW purge
    // + hard reload that served the previous build from a stale CDN
    // edge cache. The card path is safer for unknown errors — the user
    // can decide whether to reload.
    if (isStaleBundleError(error) && attemptStaleRecovery()) {
      this.setState({ recovering: true });
    }
  }

  private readonly reset = (): void => this.setState({ error: null, recovering: false });

  render(): ReactNode {
    const { error, recovering } = this.state;
    if (!error) return this.props.children;

    if (recovering) {
      return (
        <div className="card max-w-xl mx-auto text-center space-y-3 mt-12">
          <h1 className="text-2xl font-bold font-display"><span className="grad">Updating to the latest version…</span></h1>
          <p className="text-text-on-dark/80 text-sm">
            Refreshing once to load the newest build. Your data is safe — keys, seeds
            and shares are client-side and never touched here.
          </p>
        </div>
      );
    }

    return (
      <div className="card max-w-xl mx-auto text-center space-y-4 mt-12">
        <h1 className="text-3xl font-bold font-display"><span className="grad">Something broke</span></h1>
        <p className="text-text-on-dark/80">
          This page hit an error and stopped rendering. Your data is safe — nothing here
          ever touches your keys, seeds, or shares; all of that is client-side and
          encrypted. Try again, or head back home.
        </p>
        <pre className="text-left text-xs text-text-muted bg-bg-deepest border border-bg-surface rounded p-3 overflow-x-auto whitespace-pre-wrap break-words">
          {error.message || "Unknown render error"}
        </pre>
        <div className="flex gap-3 justify-center">
          <button type="button" className="btn btn-primary" onClick={this.reset}>Try again</button>
          <a className="btn btn-secondary" href="/">Go home</a>
        </div>
      </div>
    );
  }
}
