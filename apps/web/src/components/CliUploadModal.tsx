// @version 0.1.0 @date 2026-06-03
// CliUploadModal — pre-filled noklock-cli command for the Enrol "Save shares" step.
//
// Daniel-locked design 2026-06-03:
//   1. Pre-filled command modal (not buttons or sidebar tips). Reason:
//      keeps token explicitly out of the PWA — the command is informational,
//      the user runs it themselves with their own token.
//   2. ALWAYS-ON inline checkbox EVERY enrol session (no localStorage memory
//      of prior consent). Reason: stronger informed-consent paper trail,
//      no silent re-arm of consent if the user changes machines / browsers /
//      mental state between enrols.
//
// Trust model communicated in copy:
//   - Token NEVER touches NoKLock UI
//   - User must paste it into their own shell
//   - Link to /cli for full install + audit
//
// Mount pattern (when Enrol.tsx integrates):
//   const [cliModalOpen, setCliModalOpen] = useState(false);
//   ...
//   <button onClick={() => setCliModalOpen(true)}>Generate noklock-cli upload command</button>
//   {cliModalOpen && (
//     <CliUploadModal
//       vaultId={vaultIdHex}
//       shareFilenames={shareFileList.map(f => f.name)}
//       onClose={() => setCliModalOpen(false)}
//     />
//   )}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export interface CliUploadModalProps {
  /** Hex vaultId from enrol manifest. Used to suggest a default remote folder name. */
  readonly vaultId: string;
  /** List of share filenames being saved this session (used to size the upload command's --shares dir hint). */
  readonly shareFilenames: readonly string[];
  /** Close callback. */
  readonly onClose: () => void;
}

function shortVault(vaultId: string): string {
  const hex = vaultId.replace(/^0x/, "");
  if (hex.length <= 10) return hex;
  return `${hex.slice(0, 6)}...${hex.slice(-4)}`;
}

export function CliUploadModal({ vaultId, shareFilenames, onClose }: CliUploadModalProps): JSX.Element {
  const [consented, setConsented] = useState(false);
  const [copied, setCopied] = useState(false);

  // ESC to close (don't trap focus; this is informational, not destructive).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const remoteSuggestion = `/Apps/NoKLock/vault-${shortVault(vaultId)}/`;
  const shareCount = shareFilenames.length;
  const sharesHint = shareCount > 0
    ? `./enrol-output/shares/   # ${shareCount} share${shareCount === 1 ? "" : "s"} from this session`
    : "./enrol-output/shares/";

  const cmd =
`# 1. Make sure noklock-cli is installed (one-time):
#    See /cli or github.com/dksteeves/noklock/tree/main/tools/noklock-cli

# 2. Get a Dropbox token at dropbox.com/developers/apps
#    Scopes needed: files.content.write + files.content.read

# 3. Export the token in YOUR shell (NOT in this browser):
export NOKLOCK_DROPBOX_TOKEN=<your-token-here>

# 4. Run the upload:
noklock upload \\
  --provider dropbox \\
  --shares ${sharesHint}
  --remote ${remoteSuggestion}`;

  const copyToClipboard = async () => {
    if (!consented) return;
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: leave it for user to copy manually
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cli-modal-title"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="card max-w-2xl w-full my-8 space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-1">
              Optional speed-up
            </div>
            <h2 id="cli-modal-title" className="text-xl font-bold font-display">
              <span className="grad">Auto-upload via noklock-cli</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-on-dark text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="space-y-2 text-sm">
          <p>
            <strong>The command below runs on YOUR machine with YOUR Dropbox token.</strong>{" "}
            NoKLock servers are never contacted by the CLI. The token never enters this browser tab or our infrastructure.
          </p>
          <p className="text-text-muted text-xs">
            Why a CLI instead of in-app auto-upload? Because storing OAuth tokens in our PWA would break our non-custodial promise.{" "}
            <Link to="/cli" className="text-accent-cyan hover:underline" target="_blank" rel="noopener noreferrer">
              Read the trust note
            </Link>
            {" "}for the full reasoning.
          </p>
        </div>

        <div className="rounded border border-amber-500/40 bg-amber-500/5 p-3 space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              <strong>I understand:</strong> the CLI runs on my machine with my token. NoKLock never sees the token. I am responsible for keeping the token secret. If I haven&apos;t installed noklock-cli yet, I will go to{" "}
              <Link to="/cli" className="text-accent-cyan hover:underline" target="_blank" rel="noopener noreferrer">
                /cli
              </Link>{" "}
              first.
            </span>
          </label>
        </div>

        <pre className="card bg-bg-deepest font-mono text-[11px] leading-snug overflow-x-auto whitespace-pre max-h-[40vh]">
{cmd}
        </pre>

        <div className="flex gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-sm"
          >
            Cancel — I&apos;ll upload manually
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!consented}
            className={`btn text-sm ${consented ? "btn-primary" : "opacity-40 cursor-not-allowed"}`}
            aria-disabled={!consented}
          >
            {copied ? "✓ Copied" : "Copy command"}
          </button>
        </div>

        <p className="text-xs text-text-muted">
          After running the command in your shell, verify the upload with:{" "}
          <code className="text-text-on-dark">noklock list --provider dropbox --remote {remoteSuggestion}</code>
        </p>
      </div>
    </div>
  );
}
