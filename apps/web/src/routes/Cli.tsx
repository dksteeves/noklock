// @version 0.1.1 @date 2026-06-03
// 0.1.1 — Daniel 2026-06-03: REPO_URL trimmed to https://github.com/dksteeves/noklock
//         (was /tree/main/tools/noklock-cli which 404s because the CLI folder
//         has not been pushed to the public repo yet). Once Daniel pushes the
//         tools/noklock-cli/ subtree, the deep links will resolve.
// @version 0.1.0 @date 2026-06-03
// /cli — landing page for noklock-cli, the open-source companion CLI.
//
// Public marketing route. Explains what the CLI is, why it exists, how to
// install, and how it preserves the non-custodial trust model. Links to the
// GitHub repo for source-read and install instructions.

import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/seo.js";

const REPO_URL = "https://github.com/dksteeves/noklock";

export function Cli(): JSX.Element {
  useDocumentHead("/cli");
  return (
    <article className="prose-invert max-w-3xl mx-auto space-y-6 py-4">
      <header className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold">Optional companion tool</div>
        <h1 className="text-3xl font-bold font-display">
          <span className="grad">noklock-cli</span>
        </h1>
        <p className="text-text-muted">
          Open-source command-line tool that automates share upload + download to your storage provider.
        </p>
      </header>

      <div className="card border-accent-cyan/40 bg-accent-cyan/5 space-y-2">
        <div className="font-semibold text-accent-cyan">Why it exists</div>
        <p className="text-sm leading-snug">
          NoKLock&apos;s PWA is non-custodial: we never hold your storage tokens, never see your shares, never have the option to leak them. If the PWA did the auto-upload, it would need OAuth tokens with write access to your Dropbox / Drive / OneDrive — that would break the trust model.
        </p>
        <p className="text-sm leading-snug">
          The CLI runs on <strong>your</strong> machine with <strong>your</strong> tokens. NoKLock never sees them. Same security guarantee whether you upload manually through your browser or via this tool — just faster for 3+ shares.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-display"><span className="grad">Status</span></h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bg-surface text-text-muted">
              <th className="text-left p-2">Version</th>
              <th className="text-left p-2">Provider</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-bg-surface">
              <td className="p-2 font-mono">0.1.x</td>
              <td className="p-2">Dropbox</td>
              <td className="p-2 text-accent-cyan">Live</td>
            </tr>
            <tr className="border-b border-bg-surface">
              <td className="p-2 font-mono">0.2.x</td>
              <td className="p-2">Google Drive</td>
              <td className="p-2 text-text-muted">Roadmap (Q3 2026)</td>
            </tr>
            <tr className="border-b border-bg-surface">
              <td className="p-2 font-mono">0.3.x</td>
              <td className="p-2">OneDrive</td>
              <td className="p-2 text-text-muted">Roadmap (Q4 2026)</td>
            </tr>
            <tr className="border-b border-bg-surface">
              <td className="p-2 font-mono">0.4.x</td>
              <td className="p-2">S3 / R2 / B2 (S3-compatible)</td>
              <td className="p-2 text-text-muted">Roadmap (Q1 2027)</td>
            </tr>
            <tr>
              <td className="p-2 font-mono">0.5.x</td>
              <td className="p-2">Local path / external drive</td>
              <td className="p-2 text-text-muted">Roadmap (Q1 2027)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-display"><span className="grad">Install</span></h2>
        <p className="text-sm">Requires Node.js 20 or later.</p>
        <pre className="card font-mono text-xs overflow-x-auto whitespace-pre">
{`# Until published to npm (target: Q3 2026), clone + build:
git clone https://github.com/dksteeves/noklock.git
cd noklock/tools/noklock-cli
npm install
npm run build
npm link            # makes \`noklock\` available globally

# Verify:
noklock version     # -> 0.1.0`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-display"><span className="grad">Quick start — upload after enrol</span></h2>
        <pre className="card font-mono text-xs overflow-x-auto whitespace-pre">
{`noklock upload \\
  --provider dropbox \\
  --token $DROPBOX_TOKEN \\
  --shares ./enrol-output/shares/ \\
  --remote /Apps/NoKLock/vault-0xabc.../`}
        </pre>
        <p className="text-xs text-text-muted">Pass the token via env var to keep it out of shell history. See the README for full flag docs.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-display"><span className="grad">Quick start — download for restore</span></h2>
        <pre className="card font-mono text-xs overflow-x-auto whitespace-pre">
{`noklock download \\
  --provider dropbox \\
  --token $DROPBOX_TOKEN \\
  --remote /Apps/NoKLock/vault-0xabc.../ \\
  --output ./restore-staging/

# Then drag the contents of ./restore-staging/ into the PWA restore UI.`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-display"><span className="grad">Trust model</span></h2>
        <div className="card text-sm space-y-2">
          <div><strong>What the CLI sees, with your permission:</strong></div>
          <ul className="list-disc list-inside text-text-muted space-y-1">
            <li>Your share files (it has to read them to upload)</li>
            <li>Your storage token (you pass it in via flag or env var)</li>
            <li>The remote path you ask it to write to</li>
          </ul>
          <div className="pt-2"><strong>What it does NOT do:</strong></div>
          <ul className="list-disc list-inside text-text-muted space-y-1">
            <li>Connect to any noklock.app server</li>
            <li>Phone home with telemetry</li>
            <li>Log your token to disk</li>
            <li>Persist anything except its own source code</li>
          </ul>
          <p className="pt-2 text-xs text-text-muted">~250 lines of TypeScript. BUSL-1.1 source-visible. Audit it in 10 minutes. <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">Read the source.</a></p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-display"><span className="grad">Source &amp; license</span></h2>
        <ul className="text-sm space-y-2">
          <li><strong>Repository:</strong> <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">github.com/dksteeves/noklock</a></li>
          <li><strong>License:</strong> BUSL-1.1 (same as the NoKLock PWA)</li>
          <li><strong>Issues / contributions:</strong> file in the GitHub repo</li>
        </ul>
      </section>

      <div className="card flex gap-3 flex-wrap">
        <Link to="/manual" className="btn btn-secondary text-sm">User manual</Link>
        <Link to="/help" className="btn btn-secondary text-sm">Help — where do my shares go?</Link>
        <Link to="/info?tab=architecture" className="btn btn-secondary text-sm">Trust architecture</Link>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary text-sm">Open the repo →</a>
      </div>

      <div className="border-t border-bg-surface pt-4 text-xs text-text-muted flex gap-4 flex-wrap">
        <Link to="/" className="hover:text-accent-cyan">Home</Link>
        <Link to="/manual" className="hover:text-accent-cyan">Manual</Link>
        <Link to="/help" className="hover:text-accent-cyan">Help</Link>
        <Link to="/info" className="hover:text-accent-cyan">Info</Link>
        <Link to="/prove-it/source" className="hover:text-accent-cyan">Source display</Link>
      </div>
    </article>
  );
}
