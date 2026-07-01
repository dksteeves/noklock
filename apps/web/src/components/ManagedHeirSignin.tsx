// @version 0.3.0 — 2026-06-13 — NL-2 Phase 3 chunk A. Mounts only when VITE_MANAGED_WALLET_ENABLED=true.
//
// 0.3.0 (NL-2 Phase 3): useHeirClaim() now returns the REAL Privy-bound session
// (published by ManagedWalletProvider's lazy LiveHeirClaimBridge), so login() ->
// embedded-wallet provisioning -> the mandatory KeyExportCeremony is driven by
// live Privy. session.linkPasskey is now the real usePrivy().linkPasskey and
// session.hasPasskey reads user.linkedAccounts — so we pass passkeyAvailable
// (omit / true) to KeyExportCeremony, flipping the passkey-bind button from the
// NL-1 "Available NL-2" stub copy to the live binding flow. No structural change
// to the stage machine; the flag-off card copy is unchanged (this component is
// still lazy-loaded only on the flag-on path per HeirRestore 0.5.1, but the
// belt-and-braces flag-off branch stays for direct mounts / tests).
//
// 0.2.0 (LOW-13): Thread session.linkPasskey + session.hasPasskey into
// KeyExportCeremony so the passkey-bind button is no longer dead in NL-1.
// The hook surface (managed-wallet.ts 0.2.0) returns a stub linkPasskey
// that throws "Available in NL-2" in flag-off builds — the ceremony's
// existing error-surfacing path renders that message inline so the user
// gets a clear nudge instead of a silent dead click. NL-2 swaps the stub
// for the real Privy hook with zero call-site churn.
//
// CANONICAL: MANAGED-WALLET-PLAN-v1.md §3.1 NL-1 + round-3 §1.A (mandatory
// key export at signup) + round-2 §2.1 (useHeirClaim hook surface).
//
// Renders a "Sign in to claim" card with passkey / email / google / apple
// buttons. Uses the `useHeirClaim()` hook from `lib/managed-wallet.ts` as the
// single source of truth for managed-mode auth state (login, authenticated,
// embedded wallet address). The hook is flag-aware: when the managed-wallet
// flag is off it returns a no-op session, so this component renders the
// "managed signin disabled" branch and the caller can fall back to the
// self-custody connect-wallet path.
//
// Flow:
//   1. Heir lands on the card → picks passkey / email / google / apple.
//   2. We call `session.login()` (Privy hosted UI opens).
//   3. Once `session.authenticated === true` AND `session.embedded.address`
//      is non-null AND `session.embedded.ready === true`, we mount the
//      mandatory <KeyExportCeremony/>. The ceremony BLOCKS until the heir
//      completes one of: export-and-confirm / bind-passkey / explicit accept-
//      risk. There is no skip.
//   4. After the ceremony fires `onComplete`, we call `props.onSignedIn(addr)`
//      and the parent page (heir-restore) takes over.
//
// FLAG-GATE: `VITE_MANAGED_WALLET_ENABLED !== "true"` makes useHeirClaim()
// return the no-op session, which surfaces here as a flag-off card with a
// friendly nudge back to the self-custody path. The component remains
// importable in all builds — no dynamic-import gymnastics needed since the
// hook itself encapsulates the flag check.

import { useCallback, useEffect, useState } from "react";
import { KeyExportCeremony } from "./KeyExportCeremony.js";
import { useHeirClaim, MANAGED_WALLET_ENABLED } from "../lib/managed-wallet.js";

export interface ManagedHeirSigninProps {
  /** Fired once the heir has a Privy-provisioned wallet AND has completed
   *  the mandatory KeyExportCeremony. Address is the embedded EOA. */
  readonly onSignedIn: (address: `0x${string}`) => void;
}

type LoginMethodId = "passkey" | "email" | "google" | "apple";

interface LoginMethodMeta {
  readonly id: LoginMethodId;
  readonly label: string;
  readonly hint: string;
  readonly recommended?: boolean;
}

const LOGIN_METHODS: ReadonlyArray<LoginMethodMeta> = [
  {
    id: "passkey",
    label: "Continue with passkey",
    hint: "Face ID, Touch ID, Windows Hello, YubiKey.",
    recommended: true,
  },
  { id: "email", label: "Continue with email", hint: "One-time code to your inbox." },
  { id: "google", label: "Continue with Google", hint: "Sign in with a Google account." },
  { id: "apple", label: "Continue with Apple", hint: "Sign in with Apple ID." },
];

// Internal stage — orthogonal to the hook's state, used only to gate UI
// affordances (loading spinner on the picked button, ceremony mount, etc).
type Stage = "idle" | "authenticating" | "provisioning" | "ceremony" | "done";

function ManagedHeirSignin(props: ManagedHeirSigninProps): JSX.Element {
  const { onSignedIn } = props;
  const session = useHeirClaim();

  const [stage, setStage] = useState<Stage>("idle");
  const [pickedMethod, setPickedMethod] = useState<LoginMethodId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const embeddedAddress = session.embedded.address;
  const embeddedReady = session.embedded.ready;

  // Drive stage transitions off the hook's reactive surface so the ceremony
  // mounts the moment the embedded wallet is provisioned.
  useEffect(() => {
    if (stage === "done") return;
    if (!session.authenticated) {
      // If we drop back to unauthenticated (e.g. session timeout), reset to
      // idle UNLESS the ceremony has already been gated open.
      setStage((s) => (s === "ceremony" ? s : "idle"));
      return;
    }
    if (!embeddedAddress || !embeddedReady) {
      setStage((s) => (s === "ceremony" ? s : "provisioning"));
      return;
    }
    setStage((s) => (s === "done" ? s : "ceremony"));
  }, [session.authenticated, embeddedAddress, embeddedReady, stage]);

  const handlePick = useCallback(
    async (method: LoginMethodId): Promise<void> => {
      setError(null);
      setPickedMethod(method);
      setStage("authenticating");
      try {
        await session.login();
        // Post-login transitions are driven by the effect above; if the
        // hook is the no-op session (flag off), authenticated stays false
        // and we surface a friendly error.
        if (!MANAGED_WALLET_ENABLED) {
          throw new Error(
            "Managed signin is disabled in this build. Use the connect-wallet path instead.",
          );
        }
      } catch (e) {
        setError((e as Error).message ?? "Login failed. Please try again.");
        setStage("idle");
        setPickedMethod(null);
      }
    },
    [session],
  );

  const handleCeremonyComplete = useCallback((): void => {
    if (!embeddedAddress) {
      setError("Embedded wallet address went missing — please refresh and retry.");
      setStage("idle");
      return;
    }
    setStage("done");
    onSignedIn(embeddedAddress);
  }, [embeddedAddress, onSignedIn]);

  // ----------------------------- render -----------------------------

  // Mount-time guard: when the build flag is off the hook returns a no-op
  // session and `login()` is a no-op. We still render the card (so callers
  // get a clear "disabled" UI rather than a blank slot) but every button
  // is disabled and we nudge toward the self-custody path.
  const flagOff = !MANAGED_WALLET_ENABLED;

  if (stage === "ceremony" && embeddedAddress) {
    return (
      <KeyExportCeremony
        onComplete={handleCeremonyComplete}
        exportWallet={session.exportWallet}
        linkPasskey={session.linkPasskey}
        hasPasskey={session.hasPasskey}
        embeddedAddress={embeddedAddress}
        // 0.3.0 (NL-2 Phase 3): linkPasskey is now the real Privy hook, so the
        // passkey-bind button drives the live binding flow. passkeyAvailable
        // defaults to true in KeyExportCeremony; we pass it explicitly for
        // clarity. (NL-1 passed false to surface the "Available NL-2" stub.)
        passkeyAvailable={true}
      />
    );
  }

  if (stage === "done" && embeddedAddress) {
    return (
      <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-emerald-500/50 p-5 text-sm text-emerald-200">
        Signed in &amp; backed up ✓
        <div className="font-mono text-xs mt-1 break-all text-slate-200/80">
          {embeddedAddress}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-700 p-6 space-y-5">
      <header className="space-y-1">
        <h2 className="text-lg font-bold font-display text-slate-100">
          Sign in to claim
        </h2>
        <p className="text-sm text-slate-300/85">
          You don&rsquo;t need a crypto wallet. Sign in with your phone&rsquo;s
          passkey (recommended), email, Google, or Apple &mdash; NoKLock will
          provision a wallet for you and walk you through backing it up before
          you continue.
        </p>
      </header>

      {flagOff && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
          Managed signin is disabled in this build. Use the connect-wallet
          path instead, or contact NoKLock support.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/50 bg-rose-950/20 px-3 py-2 text-xs text-rose-200 break-words">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {LOGIN_METHODS.map((m) => {
          const isBusy =
            stage === "authenticating" && pickedMethod === m.id;
          const disabled =
            flagOff ||
            stage === "authenticating" ||
            stage === "provisioning";
          return (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              onClick={() => void handlePick(m.id)}
              className={
                "w-full text-left rounded-xl border px-4 py-3 transition-colors " +
                "flex items-center justify-between gap-3 " +
                (m.recommended
                  ? "border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10 "
                  : "border-slate-700 bg-slate-800/40 hover:bg-slate-800/70 ") +
                "disabled:opacity-50 disabled:cursor-not-allowed"
              }
            >
              <span className="space-y-0.5">
                <span className="block text-sm font-semibold text-slate-100">
                  {m.label}
                  {m.recommended && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-cyan-300">
                      recommended
                    </span>
                  )}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {m.hint}
                </span>
              </span>
              <span className="text-xs text-slate-400">
                {isBusy ? "Opening…" : "→"}
              </span>
            </button>
          );
        })}
      </div>

      {stage === "provisioning" && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-950/10 px-3 py-2 text-xs text-amber-200">
          Provisioning your managed wallet&hellip; this usually takes a few
          seconds. Don&rsquo;t close this tab.
        </div>
      )}

      <p className="text-[10px] text-slate-500 leading-relaxed">
        After signing in you&rsquo;ll be walked through a one-time mandatory
        key backup so you&rsquo;re never dependent on a single third party. You
        can export the raw key, bind a passkey, or explicitly proceed without
        backup &mdash; but you cannot skip the choice.
      </p>
    </div>
  );
}

export default ManagedHeirSignin;
export { ManagedHeirSignin };
