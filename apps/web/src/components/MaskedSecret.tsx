// @version 0.2.0 @date 2026-05-19
// 0.2.0 — HARD-STOP browser password managers (Daniel: Chrome offered to
//         save the vault master password — that is dangerous: each vault
//         has its OWN password; a saved/generated/autofilled credential
//         is both WRONG and a leak). Root cause: a <input type=password>
//         is a credential field to Chrome's manager no matter what
//         autocomplete tricks you add. Fix: it is now ALWAYS
//         type=text, visually masked with CSS -webkit-text-security
//         (Chromium/WebKit) — a text input is not a credential field, so
//         no save / generate / autofill prompt is ever shown. The
//         press-and-hold eye just toggles the mask class. Engines without
//         -webkit-text-security (e.g. Firefox) fall back to type=password
//         so the secret is NEVER shown in clear — Firefox's manager
//         honours the anti-autofill attributes far better than Chrome's.
// 0.1.0 — Vault master-password input: anti-autofill attrs + press-and-
//         hold eye to reveal. Shared by Enrol (enrol + duress) and Restore.

import { useId, useState } from "react";

// Chromium & WebKit support -webkit-text-security; Gecko does not. When
// supported we can safely use a NON-credential text input (the masking
// is pure CSS) and the password manager leaves it alone entirely.
function supportsTextSecurity(): boolean {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  return CSS.supports("-webkit-text-security", "disc");
}

export function MaskedSecret({
  value,
  onChange,
  id,
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly id?: string;
}): JSX.Element {
  const [show, setShow] = useState(false);
  const nm = useId();
  const cssMask = supportsTextSecurity();

  // Preferred path: plain text input, masked by CSS → Chrome/Edge never
  // treat it as a password, so never offer to save/generate/autofill it.
  // Fallback (no -webkit-text-security): a real password input so the
  // value is never rendered in clear; the hold-to-reveal still works.
  const inputType = cssMask ? "text" : show ? "text" : "password";
  const maskClass = cssMask ? (show ? "nk-secret-shown" : "nk-secret") : "";

  return (
    <div className="relative">
      <input
        {...(id ? { id } : {})}
        type={inputType}
        className={`w-full bg-bg-deepest border border-bg-surface rounded p-3 pr-12 font-mono ${maskClass}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Randomised, non-credential name + every known opt-out signal.
        name={`nk-mp-${nm}`}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        data-bwignore="true"
        data-form-type="other"
        aria-label="Vault master password"
      />
      <button
        type="button"
        aria-label="Hold to reveal the password"
        title="Hold to reveal"
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-9 items-center justify-center rounded text-text-muted hover:text-accent-cyan select-none"
        onMouseDown={() => setShow(true)}
        onMouseUp={() => setShow(false)}
        onMouseLeave={() => setShow(false)}
        onTouchStart={(e) => { e.preventDefault(); setShow(true); }}
        onTouchEnd={() => setShow(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
