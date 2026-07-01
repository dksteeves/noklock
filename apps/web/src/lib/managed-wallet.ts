// @version 0.3.0 @date 2026-06-13
// NL-1 Foundation — Managed-wallet (Privy) feature-flag + config + hook.
//
// 0.3.0 (2026-06-13, NL-2 Phase 3 chunk A): WIRE useHeirClaim() to the REAL
// Privy hooks WITHOUT pulling Privy into this lib chunk.
//
//   ╔══════════════════ LOCKED DCE NO-LEAK RULE (rule 1+2) ══════════════════╗
//   ║ This lib is imported by ManagedHeirSignin, HeirRestore,                ║
//   ║ KeyExportCeremony AND useWalletGate (which runs on EVERY flag-off      ║
//   ║ page). It MUST stay Privy-import-free at module top — adding           ║
//   ║ `import { usePrivy } from "@privy-io/react-auth"` here would land      ║
//   ║ Privy in the shared lib chunk that every flag-off page imports,        ║
//   ║ defeating the tree-shake. So the live Privy-bound implementation lives ║
//   ║ in lib/managed-wallet-live.ts, reached ONLY via the flag-on lazy       ║
//   ║ dynamic import inside ManagedWalletProvider's shell. That shell        ║
//   ║ renders <LiveHeirClaimBridge/> (also flag-on-only), which calls the    ║
//   ║ live hook and publishes the session into a module-level store here.    ║
//   ║ useHeirClaim() then just READS that store via useSyncExternalStore —   ║
//   ║ a pure, import-free, rules-of-hooks-safe read that returns the no-op   ║
//   ║ session until the bridge publishes (i.e. until the flag is on AND the  ║
//   ║ Privy chunk has mounted). The HeirClaimSession TYPE stays here (types  ║
//   ║ are erased — zero runtime cost).                                       ║
//   ╚════════════════════════════════════════════════════════════════════════╝
//
// 0.2.0 (2026-06-03, LOW-13): Extend HeirClaimSession surface with
// `linkPasskey()` + `hasPasskey` so KeyExportCeremony's passkey-bind tab is
// reachable in NL-1 (flag-off) builds via a no-op stub that surfaces an
// "Available NL-2" message rather than a dead button. The real Privy
// linkPasskey() wiring lands in NL-2 with zero call-site churn — same
// pattern already used for login() / exportWallet().
//
// Rationale (see docs/MANAGED-WALLET-PLAN-v1.md §3.1 NL-1 and round-2 §2.1):
// NoKLock Stage-1 keeps the self-custody flow byte-identical; the managed
// (Privy embedded wallet) path is gated by VITE_MANAGED_WALLET_ENABLED so it
// can be flipped on per-tenant / per-env without touching the existing tree.
// When the flag is OFF, ManagedWalletProvider is a no-op pass-through and
// Privy SDK code is NEVER imported (tree-shaken out — see provider).
//
// Stage 1 = heir-only managed path. The owner-side enrolment, restore, vault
// management remains 100% self-custody / airgap-first; the managed wallet
// exists so a non-crypto heir can claim without ever installing a wallet
// (passkey / email / Google / Apple login -> embedded EOA -> server-sponsored
// gas via Pimlico paymaster on Polygon PoS).
//
// SECURITY NOTE: the config below sets requireUserPasswordOnCreate=false
// because Stage-1 heirs are protected by the NoKLock quorum + the owner-
// authored sealed envelope — the embedded wallet is a one-shot claim
// vehicle, NOT a long-lived custody account. The wallet is exportable at
// any time (Privy: exportWallet) so an heir who wants self-custody can
// migrate the same day.

import { useSyncExternalStore } from "react";

export const MANAGED_WALLET_ENABLED: boolean =
  import.meta.env.VITE_MANAGED_WALLET_ENABLED === "true";

export const PRIVY_APP_ID: string | undefined =
  import.meta.env.VITE_PRIVY_APP_ID as string | undefined;

export const PIMLICO_API_KEY: string | undefined =
  import.meta.env.VITE_PIMLICO_API_KEY as string | undefined;

// Module-load guard — fail fast if the flag is flipped on without an app id.
// We do NOT want a half-configured managed-wallet path to ship to users.
if (MANAGED_WALLET_ENABLED && (!PRIVY_APP_ID || PRIVY_APP_ID.length === 0)) {
  throw new Error(
    "[NL-1] VITE_PRIVY_APP_ID required when VITE_MANAGED_WALLET_ENABLED=true",
  );
}

// Privy provider config — round-2 §2.1 exact shape. Returned as a plain
// object so this module stays free of any Privy SDK import (the SDK only
// loads inside ManagedWalletProvider's dynamic-import branch when the flag
// is enabled). The provider casts to PrivyClientConfig at the import site.
export interface PrivyConfigShape {
  loginMethods: Array<"passkey" | "email" | "google" | "apple">;
  appearance: {
    theme: "dark" | "light";
    accentColor: `#${string}`;
    logo: string;
    showWalletLoginFirst: boolean;
  };
  embeddedWallets: {
    createOnLogin: "users-without-wallets" | "all-users" | "off";
    noPromptOnSignature: boolean;
    requireUserPasswordOnCreate: boolean;
  };
  legal: {
    termsAndConditionsUrl: string;
    privacyPolicyUrl: string;
  };
}

export function getPrivyConfig(): PrivyConfigShape {
  return {
    loginMethods: ["passkey", "email", "google", "apple"],
    appearance: {
      theme: "dark",
      accentColor: "#06b6d4",
      logo: "/icons/icon-192.png",
      showWalletLoginFirst: false,
    },
    embeddedWallets: {
      createOnLogin: "users-without-wallets",
      noPromptOnSignature: false,
      requireUserPasswordOnCreate: false,
    },
    legal: {
      termsAndConditionsUrl: "https://noklock.app/terms",
      privacyPolicyUrl: "https://noklock.app/privacy",
    },
  };
}

// Hook surface returned by useHeirClaim() — kept stable across managed /
// no-op modes so call-sites compile + render identically. Round-2 §2.1
// signature.
export interface HeirClaimSession {
  login: () => Promise<void> | void;
  authenticated: boolean;
  user: unknown | null;
  embedded: { address: `0x${string}` | null; ready: boolean };
  sign: (message: string) => Promise<string>;
  exportWallet: () => Promise<void> | void;
  /** Privy linkPasskey() — bind a passkey to the embedded wallet. NL-1 stub
   *  throws "Available NL-2" so KeyExportCeremony surfaces the message in
   *  flag-off builds instead of leaving the button dead. NL-2 wires the
   *  real `usePrivy().linkPasskey` with zero call-site churn. */
  linkPasskey: () => Promise<void> | void;
  /** Whether a passkey is already bound to this embedded wallet. Always
   *  false in NL-1 (flag-off). NL-2 reads from `user.linkedAccounts`. */
  hasPasskey: boolean;
}

// Mock / no-op session returned when the flag is OFF. Surface-compatible so
// downstream components don't branch on the flag — they just see "not
// authenticated, no wallet, login() does nothing" which is the correct
// fallback (self-custody flow handles its own connect).
function noopHeirClaimSession(): HeirClaimSession {
  return {
    login: () => undefined,
    authenticated: false,
    user: null,
    embedded: { address: null, ready: false },
    sign: async () => {
      throw new Error("[NL-1] Managed wallet disabled (flag off)");
    },
    exportWallet: () => undefined,
    // Passkey-bind is NL-2; throwing here lets KeyExportCeremony surface a
    // clear "Available in NL-2" inline message rather than silently doing
    // nothing when the user clicks the bind button.
    linkPasskey: async () => {
      throw new Error("Passkey binding available in NL-2.");
    },
    hasPasskey: false,
  };
}

// ───────────────────────── live-session store ──────────────────────────
// Module-level publish/subscribe slot for the LIVE (Privy-bound) session.
// PUBLISHED ONLY by <LiveHeirClaimBridge/> on the flag-on lazy path (see the
// 0.3.0 header + ManagedWalletProvider). When nothing has published (flag off,
// or the Privy chunk hasn't mounted yet) the store holds null and useHeirClaim
// falls back to a single shared no-op session — so the 11 flag-off consumers
// (chiefly useWalletGate, which runs on every page) get the inert
// "not-authenticated, no wallet" surface without ever importing Privy.
//
// This indirection is the load-bearing DCE trick: useHeirClaim() takes NO
// static dependency on managed-wallet-live.ts (hence no Privy in this chunk);
// the only edge into the live module is the bridge's flag-on dynamic import.

const SHARED_NOOP_SESSION: HeirClaimSession = noopHeirClaimSession();

let liveSession: HeirClaimSession | null = null;
const liveListeners = new Set<() => void>();

/** Called by <LiveHeirClaimBridge/> (flag-on only) every render with the
 *  freshly-computed live session. Notifies subscribers so any mounted
 *  useHeirClaim() consumer re-reads. Pass null on bridge unmount to revert
 *  every consumer to the no-op session. */
export function publishLiveHeirClaim(session: HeirClaimSession | null): void {
  if (session === liveSession) return;
  liveSession = session;
  for (const l of liveListeners) l();
}

function subscribeLiveHeirClaim(cb: () => void): () => void {
  liveListeners.add(cb);
  return () => { liveListeners.delete(cb); };
}

function getLiveSnapshot(): HeirClaimSession {
  return liveSession ?? SHARED_NOOP_SESSION;
}

// Heir-claim hook — flag-aware, Privy-IMPORT-FREE read of the published live
// session. On a flag-off build the store is never populated (the bridge is
// dead code, tree-shaken with the rest of the Privy chunk), so this always
// returns the shared no-op session. On a flag-on build, once
// ManagedWalletProvider's lazy Privy shell + the bridge have mounted, this
// returns the real Privy-bound session — and every consumer (ManagedHeirSignin,
// useWalletGate, …) re-renders via the external-store subscription with zero
// call-site churn. Calling hooks here is unconditional (always exactly one
// useSyncExternalStore), so rules-of-hooks hold across the flag flip.
export function useHeirClaim(): HeirClaimSession {
  return useSyncExternalStore(
    subscribeLiveHeirClaim,
    getLiveSnapshot,
    getLiveSnapshot,
  );
}
