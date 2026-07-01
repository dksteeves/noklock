// @version 0.1.0 @date 2026-06-13
// NL-2 Phase 3 (managed-wallet chunk A) — LIVE Privy-bound implementation of
// the HeirClaimSession surface.
//
// ───────────────────────── DCE NO-LEAK CONTRACT ─────────────────────────
// This module is the ONLY web module (besides ManagedWalletProvider's lazy
// shell) permitted to top-level-import `@privy-io/react-auth`. It is reached
// EXCLUSIVELY through the flag-on dynamic-import boundary in
// lib/managed-wallet.ts (`useHeirClaim()`), whose gate is the inline literal
// `import.meta.env.VITE_MANAGED_WALLET_ENABLED === "true"`. Because the only
// import() of this file lives inside a branch Vite proves unreachable when the
// flag is off, Rollup keeps the Privy SDK in THIS lazy chunk and never pulls a
// byte of it into the entry / the shared lib chunk that every flag-off page
// imports. Confirm via the post-build dist-scan (grep for "@privy-io" /
// "permissionless" / "pimlico" chunk names → expect zero when the flag is
// unset). See managed-wallet.ts header rules 1-3 + ManagedWalletProvider.tsx
// lines 42-48 for the canonical statement.
//
// WHY A SEPARATE MODULE (vs. binding the hook inline in managed-wallet.ts):
// managed-wallet.ts is imported by ManagedHeirSignin, HeirRestore, and
// KeyExportCeremony for the shared HeirClaimSession TYPE surface. If the Privy
// import lived at the top of that lib, it would land in the lib chunk that
// EVERY flag-off page imports — defeating the whole tree-shake. So the lib's
// useHeirClaim() returns the no-op session unless the flag is on, and on the
// flag-on path delegates here, which executes the real `usePrivy()` /
// `useWallets()` hooks. The TYPE (HeirClaimSession) stays in the lib (types are
// erased, zero runtime cost); the IMPLEMENTATION lives here.
//
// HOOK-CONTEXT INVARIANT: usePrivy()/useWallets() are React hooks — they only
// run inside a subtree wrapped by <PrivyProvider/>. PrivyProvider mounts ONLY
// on the flag-on lazy path (ManagedWalletProvider's React.lazy shell), so the
// component that consumes useLiveHeirClaim() (ManagedHeirSignin, itself
// lazy-loaded only when the flag is on per HeirRestore 0.5.1) is guaranteed to
// be inside that provider subtree.

import { useCallback, useEffect, useMemo } from "react";
import {
  usePrivy,
  useWallets,
  useExportWallet,
  useSignMessage,
  getEmbeddedConnectedWallet,
} from "@privy-io/react-auth";
import type { HeirClaimSession } from "./managed-wallet.js";
import { publishLiveHeirClaim } from "./managed-wallet.js";

/**
 * Live HeirClaimSession bound to the real Privy hooks. Surface-identical to
 * `noopHeirClaimSession()` in managed-wallet.ts so all 12 gate consumers keep
 * working unchanged — the only difference is that here the values come from
 * Privy instead of being inert stubs.
 *
 * Field mapping (per privyConfig spec + Privy v3 API):
 *   - login()        → usePrivy().login() — opens the Privy hosted modal
 *                      (passwordless: email OTP / Google / Apple / passkey per
 *                      getPrivyConfig().loginMethods).
 *   - authenticated  → usePrivy().authenticated (gated on ready — false until
 *                      the SDK has hydrated so callers never read a stale true).
 *   - user           → usePrivy().user.
 *   - embedded       → the Privy-provisioned embedded EOA (createOnLogin:
 *                      "users-without-wallets"). `ready` reflects the SDK
 *                      ready flag AND the embedded wallet being present.
 *   - sign(message)  → useSignMessage().signMessage (embedded-wallet personal
 *                      sign) — returns the 0x signature string.
 *   - exportWallet() → useExportWallet().exportWallet — opens Privy's secure
 *                      key-reveal iframe (KeyExportCeremony "Export private
 *                      key" branch). NoKLock/id.asserro never sees the key.
 *   - linkPasskey()  → usePrivy().linkPasskey — binds a passkey to the
 *                      embedded wallet (replaces the NL-1 "Available in NL-2"
 *                      stub). KeyExportCeremony "Bind passkey" branch.
 *   - hasPasskey     → derived from user.linkedAccounts (a `passkey` account
 *                      means one is already bound).
 */
export function useLiveHeirClaim(): HeirClaimSession {
  const { ready, authenticated, user, login, linkPasskey } = usePrivy();
  const { wallets } = useWallets();
  const { exportWallet } = useExportWallet();
  const { signMessage } = useSignMessage();

  // Resolve the Privy-provisioned embedded EOA from the wallet list. Privy's
  // own helper picks the embedded (vs. externally-connected) wallet; we only
  // surface it once the SDK is ready so we never report a half-hydrated
  // address.
  const embeddedWallet = useMemo(
    () => (ready ? getEmbeddedConnectedWallet(wallets) : null),
    [ready, wallets],
  );

  const embeddedAddress = useMemo<`0x${string}` | null>(() => {
    const addr = embeddedWallet?.address;
    return addr ? (addr as `0x${string}`) : null;
  }, [embeddedWallet]);

  // hasPasskey — a linked account of type "passkey" means the user has already
  // bound a passkey to this wallet (KeyExportCeremony can short-circuit to
  // "already bound").
  const hasPasskey = useMemo<boolean>(() => {
    const accounts = user?.linkedAccounts ?? [];
    return accounts.some((a) => a.type === "passkey");
  }, [user]);

  const sign = useCallback(
    async (message: string): Promise<string> => {
      if (!embeddedAddress) {
        throw new Error("No embedded wallet to sign with — sign in first.");
      }
      const { signature } = await signMessage(
        { message },
        { address: embeddedAddress },
      );
      return signature;
    },
    [embeddedAddress, signMessage],
  );

  const doLogin = useCallback((): void => {
    // login() opens the Privy modal; loginMethods come from the client config
    // (getPrivyConfig) so we don't re-specify them here. Passwordless only.
    login();
  }, [login]);

  const doExportWallet = useCallback(async (): Promise<void> => {
    if (embeddedAddress) {
      await exportWallet({ address: embeddedAddress });
    } else {
      await exportWallet();
    }
  }, [exportWallet, embeddedAddress]);

  const doLinkPasskey = useCallback(async (): Promise<void> => {
    // usePrivy().linkPasskey opens the Privy modal to bind a passkey. Replaces
    // the NL-1 stub that threw "Available in NL-2".
    await linkPasskey();
  }, [linkPasskey]);

  return useMemo<HeirClaimSession>(
    () => ({
      login: doLogin,
      // Gate authenticated on `ready` — Privy docs: never read `authenticated`
      // before `ready` is true.
      authenticated: ready ? authenticated : false,
      user: user ?? null,
      embedded: {
        address: embeddedAddress,
        // The embedded wallet is "ready" once the SDK is ready AND the
        // embedded EOA exists. ManagedHeirSignin mounts the mandatory
        // KeyExportCeremony only when both are true.
        ready: ready && embeddedAddress !== null,
      },
      sign,
      exportWallet: doExportWallet,
      linkPasskey: doLinkPasskey,
      hasPasskey,
    }),
    [
      doLogin,
      ready,
      authenticated,
      user,
      embeddedAddress,
      sign,
      doExportWallet,
      doLinkPasskey,
      hasPasskey,
    ],
  );
}

/**
 * LiveHeirClaimBridge — flag-on-only publisher.
 *
 * Mounted inside ManagedWalletProvider's lazy Privy shell (so it lives WITHIN
 * the <PrivyProvider/> subtree, satisfying the hook-context invariant). On
 * every render it computes the live session via useLiveHeirClaim() and pushes
 * it into the module-level store in managed-wallet.ts via publishLiveHeirClaim.
 * That lets the lib's useHeirClaim() — which takes NO static dependency on this
 * Privy-importing module — surface the live session to all 12 consumers (incl.
 * useWalletGate) through a pure external-store read, with the Privy SDK
 * confined to THIS lazy chunk.
 *
 * Renders nothing. On unmount it publishes null so every consumer reverts to
 * the shared no-op session.
 */
export function LiveHeirClaimBridge(): null {
  const session = useLiveHeirClaim();
  // Publish synchronously each render (useSyncExternalStore consumers will
  // read the new snapshot on their next render). useEffect handles the
  // unmount-revert.
  publishLiveHeirClaim(session);
  useEffect(() => {
    return () => {
      publishLiveHeirClaim(null);
    };
  }, []);
  return null;
}
