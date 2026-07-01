// @version 0.2.0 @date 2026-05-18
// 0.2.0 — VERACITY FIX. The old banner claimed "hardware-wallet support
//         (Ledger / Trezor via WebHID) doesn't work in <browser>". That
//         was false: NoKLock has NO custom WebHID/USB driver. Hardware
//         wallets work the standard way — via MetaMask / Trust / any
//         injected wallet or WalletConnect — and that works in EVERY
//         browser. Text entry, the master password and the wallet
//         connectors have no browser-specific limitation. The only
//         genuinely browser-variable thing is the OPTIONAL WebAuthn
//         passkey unlock (Face / Touch / security key). So this banner
//         now states only the truth: if passkey isn't available here,
//         your master password works everywhere and is your primary key
//         anyway — nothing is blocked. Calm/informational, not an alarm.
// 0.1.1 — (superseded) dropped unpublished "Phase 3" roadmap label.
// 0.1.0 — (superseded) WebHID hardware-wallet banner — false premise.

import { useEffect, useState } from "react";

const DISMISS_KEY = "soulchain.browser-banner.dismissed";

function passkeyAvailable(): boolean {
  if (typeof window === "undefined") return true; // SSR/prerender: assume ok, don't flash
  return typeof (window as unknown as { PublicKeyCredential?: unknown }).PublicKeyCredential !== "undefined";
}

export function BrowserBanner(): JSX.Element | null {
  const [available] = useState<boolean>(() => passkeyAvailable());
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    if (dismissed) {
      try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    }
  }, [dismissed]);

  // Nothing to say when the optional passkey is available — every other
  // feature works in every browser, so we stay silent (no false alarm).
  if (available || dismissed) return null;

  return (
    <div className="bg-bg-surface/60 border-b border-white/10 text-sm">
      <div className="container mx-auto px-4 max-w-6xl py-2 flex items-start justify-between gap-3">
        <div className="text-text-muted flex-1">
          <strong className="text-text-on-dark/80">Heads-up:</strong> the optional
          Face / Touch / security-key passkey unlock isn't available in this
          browser. Nothing is blocked — your <strong>master password works in
          every browser</strong> and is your primary recovery &amp; inheritance key
          anyway. Hardware wallets (Ledger / Trezor) still work normally via
          MetaMask / Trust or WalletConnect.
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-text-muted hover:text-text-on-dark text-xs"
          aria-label="Dismiss banner"
        >
          dismiss ×
        </button>
      </div>
    </div>
  );
}
