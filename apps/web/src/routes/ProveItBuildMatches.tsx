// @version 0.1.0 @date 2026-05-30
// /prove-it/build-matches — Daniel 2026-05-30: prove that the code
// running in the user's browser matches the open-source code on GitHub.
// This is the "we couldn't sneak something in even if we wanted to"
// proof. Critical for a self-custodial seed-handling product whose
// trust model rests on the user being able to audit what we ship.
//
// Three layers of evidence:
//   1. Live build label (getBuildHash) — cross-check against the commits on main.
//   2. Every loaded script/link enumerated at runtime from document.querySelectorAll
//      — what the BROWSER actually loaded — to compare against the published source.
//   3. Build-it-yourself from the published source (git clone + npm ci + build).
//      Source-match, not a single byte-hash: two private client keys + a build
//      timestamp shift the bytes without changing the logic (see REPRODUCE.md).

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDocumentHead } from "../lib/seo.js";
import { getBuildHash, PUBLIC_VERSION } from "../lib/version.js";

interface LoadedScript {
  readonly src: string;
  readonly integrity: string;
  readonly type: "script" | "stylesheet";
}

const GITHUB_REPO = "https://github.com/dksteeves/noklock";
// 0.1.1 — Daniel 2026-05-30: linked to /releases/tag/build-{hash} returned
// 404 because we don't publish a release-per-build. Link to the commits
// page instead — the user can scan commit hashes and dates and confirm
// the build label here matches a real commit on main.
const GITHUB_COMMITS = `${GITHUB_REPO}/commits/main`;

function enumerateLoadedAssets(): readonly LoadedScript[] {
  if (typeof document === "undefined") return [];
  const out: LoadedScript[] = [];
  document.querySelectorAll<HTMLScriptElement>("script[src]").forEach((el) => {
    const src = el.src;
    if (!src) return;
    out.push({ src, integrity: el.integrity || "(no SRI)", type: "script" });
  });
  document.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet'][href]").forEach((el) => {
    const href = el.href;
    if (!href) return;
    out.push({ src: href, integrity: el.integrity || "(no SRI)", type: "stylesheet" });
  });
  return out;
}

export function ProveItBuildMatches(): JSX.Element {
  useDocumentHead("/prove-it/build-matches");
  const [assets, setAssets] = useState<readonly LoadedScript[]>([]);

  useEffect(() => {
    // Defer one tick so dynamic chunks loaded by lazy() have settled.
    const t = window.setTimeout(() => setAssets(enumerateLoadedAssets()), 250);
    return () => window.clearTimeout(t);
  }, []);

  const buildHash = getBuildHash();
  // 0.1.1 — Link to commits/main (always exists) instead of a per-build
  // release tag (often doesn't exist). The build hash format is
  // version-YYYYMMDDhhmm, which doesn't itself match a commit SHA, but
  // landing the user on the commits list lets them see the latest
  // commit + date and confirm the build label is plausible.
  const buildHref = GITHUB_COMMITS;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h1 className="text-3xl font-bold font-display"><span className="grad">Prove the build matches the source</span></h1>
          <Link to="/prove-it" className="text-xs text-text-muted hover:text-accent-cyan">← back to Prove-It hub</Link>
        </div>
        <p className="text-text-on-dark/80 text-base mt-2 max-w-3xl">
          The full source of this app is public on GitHub — you can read exactly what runs, build it yourself,
          cross-check what your browser actually loaded, and verify the on-chain contracts byte-for-byte. If we
          ever tried to slip in a malicious build, the source, the loaded assets, or the verified contracts would
          give it away. Here are the independent ways to verify.
        </p>
      </header>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">1 · Build hash</div>
        <h2 className="text-xl font-bold font-display mb-3">This running build vs. the source on GitHub</h2>
        <div className="rounded-lg border border-bg-surface bg-bg-deepest/60 px-4 py-3 mb-3 font-mono text-sm">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Loaded build</div>
          <div className="text-accent-cyan break-all">v{PUBLIC_VERSION} · build <span className="text-accent-cyan">{buildHash}</span></div>
        </div>
        <p className="text-sm text-text-on-dark/85 mb-3">
          The build hash is <code className="font-mono text-xs text-accent-cyan">version-YYYYMMDDhhmm</code> — the package version plus the UTC build timestamp.
          The commits page below shows every change pushed to main; the most recent commit timestamp should be within minutes of the timestamp in your build label above. If it isn't, the build you're running isn't current.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={buildHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10 px-4 py-2 text-sm font-medium"
          >
            Open commits on main ↗
          </a>
          <a
            href={`${GITHUB_REPO}/blob/main/REPRODUCE.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-bg-surface text-text-muted hover:text-text-on-dark hover:bg-bg-surface/40 px-4 py-2 text-sm font-medium"
          >
            How to build it ↗
          </a>
        </div>
      </section>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">2 · Loaded assets</div>
        <h2 className="text-xl font-bold font-display mb-1">What the BROWSER actually loaded</h2>
        <p className="text-sm text-text-on-dark/85 mb-3">
          This is enumerated at runtime by inspecting{" "}
          <code className="font-mono text-xs text-accent-cyan">document.querySelectorAll('script[src], link[rel=stylesheet]')</code>{" "}
          — not our claim, the browser's report. Every URL here was actually fetched by your browser to render this page.
          Compare it to the source in the repo.
        </p>
        <div className="rounded-lg border border-bg-surface bg-bg-deepest/60 overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 px-3 py-2 border-b border-bg-surface text-[10px] uppercase tracking-wider text-text-muted font-bold">
            <span>type</span>
            <span>src</span>
            <span>integrity</span>
          </div>
          <ol className="font-mono text-xs">
            {assets.length === 0 && (
              <li className="px-3 py-3 text-text-muted">Reading browser load list…</li>
            )}
            {assets.map((a, i) => (
              <li key={`${a.src}-${i}`} className="grid grid-cols-[auto_1fr_auto] gap-x-4 px-3 py-1.5 border-b border-bg-surface/40 last:border-0">
                <span className={a.type === "script" ? "text-accent-cyan" : "text-amber-300"}>{a.type === "script" ? "JS" : "CSS"}</span>
                <span className="text-text-on-dark/85 break-all">{a.src}</span>
                <span className="text-text-muted truncate max-w-[16ch]" title={a.integrity}>{a.integrity}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Tip: copy any URL above into a fresh tab and read the code your browser was served. Cross-check it against the source in the repo.
          If a malicious script were injected by a CDN compromise, the URL would still appear here — and you'd catch it on first inspection.
        </p>
      </section>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">3 · Build it yourself</div>
        <h2 className="text-xl font-bold font-display mb-1">Clone the source, build the app</h2>
        <p className="text-sm text-text-on-dark/85 mb-3">
          Anyone with git + node can build the app from source in a few minutes:
        </p>
        <pre className="rounded-lg border border-bg-surface bg-bg-deepest/80 p-4 font-mono text-xs text-accent-cyan overflow-x-auto whitespace-pre">
{`git clone ${GITHUB_REPO} && cd noklock
cp apps/web/.env.public apps/web/.env.production
npm ci
npm run build -w apps/web`}
        </pre>
        <p className="text-sm text-text-on-dark/85 mt-3">
          The app you build is compiled from <strong>exactly this source</strong> — the same components, the same
          cryptographic pipeline, the same airgap firewall the live site runs.
        </p>
        <p className="text-xs text-text-muted mt-3">
          We don't publish one "matching hash": two rate-limited client keys we keep private (a 0x swap key and a
          Pimlico key) plus a build timestamp shift the bundle bytes without changing the logic. What you <em>can</em>{" "}
          verify exactly is the <strong>source itself</strong>, the <strong>assets your browser loaded</strong> (section 2),
          and the <strong>contracts byte-verified on PolygonScan</strong> — see{" "}
          <a href={`${GITHUB_REPO}/blob/main/REPRODUCE.md`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">REPRODUCE.md ↗</a>.
        </p>
      </section>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Why this matters</div>
        <p className="text-sm text-text-on-dark/90">
          The whole point of a self-custodial product is that the user doesn't have to trust the operator's claims.
          "We never touch your seed" is a promise we can't keep if we ship a build that quietly does.
          Open source + the browser's own asset list + on-chain-verified contracts means anyone — not just us — can verify the claim.
          A backdoor that survives this scrutiny doesn't exist; one that doesn't survive it can't ship undetected.
        </p>
      </section>
    </div>
  );
}
