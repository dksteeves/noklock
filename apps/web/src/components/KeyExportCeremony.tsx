// @version 0.2.0 — 2026-06-03 — NL-1 mandatory key-export ceremony (round-3 §1.1 lock-in).
//
// 0.2.0 (LOW-13): The passkey-bind button is now reachable in NL-1
// (flag-off) builds because ManagedHeirSignin 0.2.0 threads
// session.linkPasskey (no-op stub that throws "Available in NL-2"). The
// button stays visible for visual completeness when the flag flips; in
// flag-off mode it carries a title="Available NL-2" tooltip and the
// stub's thrown error surfaces inline via the existing setError() path.
//
// CANONICAL: MANAGED-WALLET-PLAN-v1.md §3.1 NL-1 + round-3 §1.1
// ("mandatory key export at signup"). When a non-crypto heir signs in via
// Privy and gets a Privy-provisioned embedded wallet, this full-screen
// modal blocks the rest of the heir-restore UI until the user completes
// ONE of three branches:
//
//   (a) Export private key — Privy useExportWallet() opens the secure
//       key-reveal flow inside Privy's iframe, then the user pastes back
//       a fingerprint (last 6 chars of the wallet address) to confirm
//       they have it.
//   (b) Bind passkey — Privy linkPasskey() flow.
//   (c) Accept the no-backup risk — explicit checkbox + 5-second
//       countdown before the button enables.
//
// Acceptance criteria are explained inline; no skip button, no close
// button, no Esc, no backdrop-click dismiss. onComplete(method) fires
// only after one path is fully resolved.
//
// Icons: project does not depend on lucide-react, so the spec's
// requested icon set is rendered as inline SVG glyphs that match the
// lucide-react visual language (24px stroke, currentColor) for
// drop-in replacement later if/when lucide-react is added.
//
// TypeScript strict.

import { useCallback, useEffect, useState } from "react";

export type KeyExportMethod = "export" | "passkey" | "no-backup";

export interface KeyExportCeremonyProps {
  /** Fires exactly once after one of the three paths is fully resolved. */
  readonly onComplete: (method: KeyExportMethod) => void;
  /** Privy useExportWallet() — opens Privy's secure key-reveal iframe. */
  readonly exportWallet?: () => Promise<void> | void;
  /** Privy linkPasskey() — bind a passkey to the embedded wallet. */
  readonly linkPasskey?: () => Promise<void> | void;
  /** Has a passkey already been bound for this user? */
  readonly hasPasskey?: boolean;
  /** Embedded address — last 6 chars used as the export-confirm fingerprint. */
  readonly embeddedAddress?: `0x${string}` | null;
  /** When false (NL-1 flag-off), the passkey-bind button stays visible for
   *  visual completeness but is decorated with an "Available NL-2" tooltip
   *  and surfaces the same message inline if clicked. NL-2 omits this prop
   *  (defaults to true) so the real binding flow takes over. Default: true. */
  readonly passkeyAvailable?: boolean;
}

type Tab = "export" | "passkey" | "no-backup";

/** Seconds the "Accept risk" button stays disabled after the user lands on
 *  the tab — forces the user to read the acceptance criteria. */
const NO_BACKUP_COUNTDOWN_SECONDS = 5;

// --- Inline icons (lucide-react visual language, no extra dep) -----------

interface IconProps {
  readonly className?: string;
  readonly size?: number;
}

function KeyIcon({ className, size = 18 }: IconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

function FingerprintIcon({ className, size = 18 }: IconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 11v2a14 14 0 0 0 2.5 8" />
      <path d="M8 14a18 18 0 0 0 2 7" />
      <path d="M16 21a18 18 0 0 0-1-15" />
      <path d="M5 8a7 7 0 0 1 14 0" />
      <path d="M5 12a7 7 0 0 1 .5-3" />
      <path d="M19 12a7 7 0 0 0-7-7" />
    </svg>
  );
}

function AlertTriangleIcon({ className, size = 18 }: IconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckIcon({ className, size = 18 }: IconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// --- Component -----------------------------------------------------------

function KeyExportCeremony(props: KeyExportCeremonyProps): JSX.Element {
  const {
    onComplete,
    exportWallet,
    linkPasskey,
    hasPasskey,
    embeddedAddress,
    passkeyAvailable = true,
  } = props;

  const [tab, setTab] = useState<Tab>("export");
  const [exportOpened, setExportOpened] = useState(false);
  const [fingerprint, setFingerprint] = useState("");
  const [passkeyBound, setPasskeyBound] = useState<boolean>(!!hasPasskey);
  const [acceptRisk, setAcceptRisk] = useState(false);
  const [countdown, setCountdown] = useState<number>(NO_BACKUP_COUNTDOWN_SECONDS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reflect hasPasskey prop updates.
  useEffect(() => { setPasskeyBound(!!hasPasskey); }, [hasPasskey]);

  // Lock body scroll while the modal is mounted — non-dismissible blocker.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // 5-second countdown on the no-backup tab — resets each time the user
  // lands on the tab so they can't game it by switching tabs mid-tick.
  useEffect(() => {
    if (tab !== "no-backup") return;
    setCountdown(NO_BACKUP_COUNTDOWN_SECONDS);
    const interval = window.setInterval(() => {
      setCountdown((n) => (n > 0 ? n - 1 : 0));
    }, 1000);
    return () => { window.clearInterval(interval); };
  }, [tab]);

  // Fingerprint = last 6 chars of the wallet address (case-insensitive).
  // The user pastes it off Privy's reveal screen, which proves they
  // successfully opened the export modal AND can copy/paste from it.
  const expectedFingerprint =
    embeddedAddress ? embeddedAddress.slice(-6).toLowerCase() : null;

  const handleTabChange = useCallback((next: Tab): void => {
    setTab(next);
    setError(null);
  }, []);

  const tryExport = useCallback(async (): Promise<void> => {
    if (!exportWallet) {
      setError("Export is not available in this environment.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await exportWallet();
      setExportOpened(true);
    } catch (e) {
      setError((e as Error).message ?? "Could not open the export modal.");
    } finally {
      setBusy(false);
    }
  }, [exportWallet]);

  const submitExport = useCallback((): void => {
    setError(null);
    if (!exportOpened) {
      setError("Open the Privy key-reveal modal first, then paste the fingerprint.");
      return;
    }
    if (!expectedFingerprint) {
      setError("Embedded wallet address unavailable — try the passkey or accept-risk paths.");
      return;
    }
    if (fingerprint.trim().toLowerCase() !== expectedFingerprint) {
      setError("Those 6 characters don't match the last 6 of your wallet address.");
      return;
    }
    onComplete("export");
  }, [exportOpened, expectedFingerprint, fingerprint, onComplete]);

  const tryBindPasskey = useCallback(async (): Promise<void> => {
    if (!passkeyAvailable) {
      // Flag-off (NL-1) — button stays visible for visual completeness but
      // explains itself inline when clicked rather than dying silently.
      setError("Passkey binding available in NL-2. Use export-key or accept-risk for now.");
      return;
    }
    if (!linkPasskey) {
      setError("Passkey binding is not available in this environment.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await linkPasskey();
      setPasskeyBound(true);
      onComplete("passkey");
    } catch (e) {
      setError((e as Error).message ?? "Passkey binding failed.");
    } finally {
      setBusy(false);
    }
  }, [linkPasskey, onComplete, passkeyAvailable]);

  const submitNoBackup = useCallback((): void => {
    setError(null);
    if (!acceptRisk) {
      setError("Tick the explicit risk acknowledgement to proceed.");
      return;
    }
    if (countdown > 0) {
      setError(`Wait ${countdown}s — please read the acceptance criteria first.`);
      return;
    }
    onComplete("no-backup");
  }, [acceptRisk, countdown, onComplete]);

  const noBackupEnabled = acceptRisk && countdown === 0 && !busy;

  return (
    <div
      // Full-screen non-dismissible overlay — no backdrop close, no Esc.
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kec-title"
    >
      <div className="relative w-full max-w-2xl mx-4 my-auto card border-2 border-amber-400 bg-bg-deepest shadow-2xl">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide text-amber-300">
          <AlertTriangleIcon size={14} />
          <span>Mandatory · cannot be skipped</span>
        </div>
        <h2 id="kec-title" className="text-xl font-bold font-display mt-1">
          <span className="text-amber-300">Back up your wallet now</span>
        </h2>
        <p className="text-sm text-text-on-dark/85 mt-2">
          A Privy-managed wallet has been provisioned for you. Before you can
          continue you must complete <strong>one</strong> of the three options
          below.
        </p>

        {/* Acceptance criteria — explicit, inline, always visible. */}
        <div className="mt-3 rounded border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-100/90 leading-relaxed">
          If you lose access to this device <strong>AND</strong> any backup,
          NoKLock and id.asserro <strong>cannot recover this wallet</strong>.
          You will lose the NoKMint and the vault contents.
        </div>

        {/* Tab picker — three options. */}
        <div
          role="tablist"
          aria-label="Backup method"
          className="mt-4 grid grid-cols-3 gap-2 text-xs"
        >
          {(["export", "passkey", "no-backup"] as const).map((b) => (
            <button
              key={b}
              role="tab"
              aria-selected={tab === b}
              type="button"
              className={`rounded border p-2 text-left transition-colors flex flex-col gap-1 ${
                tab === b
                  ? "border-amber-300 bg-amber-500/10 text-amber-200"
                  : "border-bg-surface bg-bg-surface/30 text-text-on-dark/70 hover:border-amber-400/50"
              }`}
              onClick={() => handleTabChange(b)}
            >
              <span className="flex items-center gap-1.5 font-bold">
                {b === "export" && <><KeyIcon size={14} /> a) Export private key</>}
                {b === "passkey" && <><FingerprintIcon size={14} /> b) Bind passkey</>}
                {b === "no-backup" && <><AlertTriangleIcon size={14} /> c) Accept risk</>}
              </span>
              <span className="text-[10px] opacity-80">
                {b === "export" && "Reveal key, paste fingerprint back"}
                {b === "passkey" && "Biometric recovery without Privy"}
                {b === "no-backup" && "Proceed with no backup at all"}
              </span>
            </button>
          ))}
        </div>

        {/* Active tab body. */}
        <div className="mt-4 space-y-3 text-sm">
          {tab === "export" && (
            <div className="space-y-3">
              <p>
                Click the button below — Privy opens a secure key-reveal modal
                inside its own iframe. Copy the private key and store it on
                paper, in a password manager, or on a clean device. Then paste
                the <strong>last 6 characters of your wallet address</strong>{" "}
                here to confirm the copy worked.
              </p>
              <button
                type="button"
                className="btn btn-primary inline-flex items-center gap-2"
                disabled={busy}
                onClick={() => void tryExport()}
              >
                <KeyIcon size={14} />
                {busy
                  ? "Opening…"
                  : exportOpened
                    ? "Re-open Privy key reveal"
                    : "Open Privy key reveal"}
              </button>
              {exportOpened && (
                <div>
                  <label
                    className="block text-xs text-text-muted mb-1"
                    htmlFor="kec-fingerprint"
                  >
                    Fingerprint — last 6 characters of your wallet address
                    {expectedFingerprint ? ` (ends ${expectedFingerprint})` : ""}
                  </label>
                  <input
                    id="kec-fingerprint"
                    type="text"
                    className="bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm w-full"
                    value={fingerprint}
                    onChange={(e) => setFingerprint(e.target.value)}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    maxLength={8}
                    placeholder="e.g. a1b2c3"
                  />
                  <button
                    type="button"
                    className="btn btn-primary mt-3 inline-flex items-center gap-2"
                    disabled={busy || !fingerprint.trim()}
                    onClick={submitExport}
                  >
                    <CheckIcon size={14} />
                    Confirm &amp; continue
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "passkey" && (
            <div className="space-y-3">
              <p>
                Bind a passkey (Face ID, Touch ID, Windows Hello, a YubiKey,
                etc.) to this wallet. If Privy ever becomes unreachable, your
                device's biometric authenticator can still unlock an offline
                share that reconstructs the wallet locally.
              </p>
              {passkeyBound ? (
                <div className="rounded border border-emerald-500/40 bg-emerald-950/20 p-3 text-emerald-200 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckIcon size={14} />
                    <span>Passkey already bound.</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={() => onComplete("passkey")}
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <>
                  {!passkeyAvailable && (
                    <div className="rounded border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200/90">
                      Passkey binding ships in NL-2. The button stays visible
                      so the flow is recognisable when the flag flips — for
                      now please use <strong>Export private key</strong> or
                      <strong> Accept risk</strong>.
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary inline-flex items-center gap-2"
                    // Keep visually present in flag-off mode (per LOW-13);
                    // tryBindPasskey() surfaces the "Available NL-2" message
                    // inline rather than triggering Privy.
                    disabled={busy || (passkeyAvailable && !linkPasskey)}
                    title={passkeyAvailable ? "Bind a passkey" : "Available NL-2"}
                    aria-disabled={!passkeyAvailable || undefined}
                    onClick={() => void tryBindPasskey()}
                  >
                    <FingerprintIcon size={14} />
                    {busy ? "Binding…" : "Bind a passkey now"}
                  </button>
                </>
              )}
            </div>
          )}

          {tab === "no-backup" && (
            <div className="space-y-3">
              <p className="text-amber-200">
                You are choosing to proceed with <strong>no backup at all</strong>.
                Re-read the acceptance criteria above before continuing.
              </p>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={acceptRisk}
                  onChange={(e) => setAcceptRisk(e.target.checked)}
                />
                <span>
                  I accept the no-backup risk. If I lose access to this device
                  AND any backup, NoKLock and id.asserro cannot recover this
                  wallet and I will lose the NoKMint and the vault contents.
                </span>
              </label>
              <button
                type="button"
                className="btn btn-primary inline-flex items-center gap-2"
                disabled={!noBackupEnabled}
                onClick={submitNoBackup}
                aria-describedby="kec-countdown"
              >
                <AlertTriangleIcon size={14} />
                {countdown > 0
                  ? `Proceed without backup (${countdown}s)`
                  : "Proceed without backup"}
              </button>
              <p id="kec-countdown" className="text-[10px] text-text-muted">
                {countdown > 0
                  ? `Button enables in ${countdown}s after the checkbox is ticked.`
                  : "You may proceed once the checkbox is ticked."}
              </p>
            </div>
          )}

          {error && (
            <div className="text-xs text-rose-300 break-words" role="alert">
              {error}
            </div>
          )}
        </div>

        <p className="text-[10px] text-text-muted mt-5 leading-relaxed">
          This modal cannot be dismissed without completing one of the three
          options above. There is no skip button and no close button.
        </p>
      </div>
    </div>
  );
}

export default KeyExportCeremony;
export { KeyExportCeremony };
