// @version 0.2.0 — 2026-06-13 — NL-2 Phase 3 chunk A. Same conditional Privy
// wrap (DCE pattern unchanged — this file is the canonical reference), now the
// lazy shell ALSO mounts <LiveHeirClaimBridge/> INSIDE <PrivyProvider/> so the
// live (Privy-bound) HeirClaimSession publishes into managed-wallet.ts's store
// for every useHeirClaim() consumer. Both Privy AND the bridge resolve in this
// lazy chunk, never the entry. appId source-of-truth stays build-time
// VITE_PRIVY_APP_ID (open-question A resolved: build-time authoritative; the
// lib module-load guard at managed-wallet.ts:42-46 remains the primary gate,
// runtime-config.privy_app_id is informational/divergence-warning only — it is
// NOT awaited before mount, which keeps this shell's DCE shape identical).
//
// CHANGELOG
//   0.2.0 — 2026-06-13: lazy shell mounts LiveHeirClaimBridge (publishes the
//     live session); no change to the flag-literal DCE gate.
//   0.1.1 — Daniel 2026-06-02: added PRIVY_APP_ID guard inside component body
//     for defence-in-depth (lib's module-load throw is the primary guard; this
//     catches test-mocked-lib + future tenant misconfigurations).
//   0.1.0 — 2026-06-02: initial NL-1 conditional Privy wrap.
//
// NL-1 Foundation — Managed-wallet provider (Privy embedded wallets).
//
// FLAG-OFF (default):
//   - Returns children verbatim.
//   - NEVER imports @privy-io/react-auth at runtime. The `import()` call
//     and React.lazy() factory live inside a branch whose condition is
//     directly `import.meta.env.VITE_MANAGED_WALLET_ENABLED === "true"`
//     — Vite statically inlines that env value at build time so when the
//     flag is anything other than "true", Rollup eliminates the dead
//     branch (and the dynamic import inside it) entirely. Confirmed via
//     dist/ scan: no Privy chunks emitted when flag != "true".
//
// FLAG-ON:
//   - The branch is alive, the dynamic import is reachable, and Rollup
//     emits the Privy chunk. React.lazy() mounts <PrivyProvider/> around
//     children when the lazy chunk resolves.
//   - Children render after the chunk resolves; a tiny no-flash fallback
//     keeps the tree mounted during load.
//
// See lib/managed-wallet.ts for the flag + config; round-2 §2.1 for the
// final config shape; MANAGED-WALLET-PLAN-v1.md §3.1 NL-1 for the plan.

import React, { Suspense } from "react";
import {
  PRIVY_APP_ID,
  getPrivyConfig,
} from "../lib/managed-wallet.js";

export interface ManagedWalletProviderProps {
  children: React.ReactNode;
}

// IMPORTANT: this is read directly here (not via the lib's MANAGED_WALLET_ENABLED
// export) so Vite's static-replace pass sees a literal comparison and can
// dead-code-eliminate the entire flag-on branch including its `import()`
// expression. Reading via a re-export defeats Rollup's reachability analysis
// in some Vite versions and would leak the Privy chunk into the dist.
const MANAGED_WALLET_ENABLED_INLINE: boolean =
  import.meta.env.VITE_MANAGED_WALLET_ENABLED === "true";

// Lazy shell holder. Only assigned when the flag is on, so the dynamic
// `import("@privy-io/react-auth")` expression lives inside a branch Vite
// proves unreachable at build time when the flag is off.
let LazyPrivyShell:
  | React.LazyExoticComponent<React.FC<{ children: React.ReactNode }>>
  | null = null;

if (MANAGED_WALLET_ENABLED_INLINE) {
  LazyPrivyShell = React.lazy(async () => {
    // Only reached on the flag-on build. Dynamic import keeps Privy in its
    // own chunk so the main entry stays slim even when managed wallets are
    // live (the SDK loads lazily on heir-claim screens).
    const mod = await import("@privy-io/react-auth");
    const PrivyProvider = mod.PrivyProvider;
    // Reached ONLY here (flag-on lazy chunk). Pulling the live module in via
    // the SAME dynamic-import boundary keeps Privy + the bridge in this chunk,
    // never the entry / shared lib chunk. The bridge is the publisher that
    // feeds managed-wallet.ts's useHeirClaim() store.
    const live = await import("../lib/managed-wallet-live.js");
    const LiveHeirClaimBridge = live.LiveHeirClaimBridge;

    const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <PrivyProvider
        appId={PRIVY_APP_ID as string}
        // Cast: lib/managed-wallet.ts intentionally keeps its return type
        // SDK-import-free so the lib module itself stays Privy-free.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config={getPrivyConfig() as any}
      >
        {/* Publishes the live HeirClaimSession into the lib store. Rendered
            INSIDE PrivyProvider so usePrivy()/useWallets() have their required
            context. Renders nothing. */}
        <LiveHeirClaimBridge />
        {children}
      </PrivyProvider>
    );

    return { default: Shell };
  });
}

const ManagedWalletProvider: React.FC<ManagedWalletProviderProps> = ({
  children,
}) => {
  if (!MANAGED_WALLET_ENABLED_INLINE || LazyPrivyShell === null) {
    // No-op pass-through. With the static-inline flag this branch is the
    // only path the bundler emits when the flag is off.
    return <>{children}</>;
  }

  // Defence-in-depth: the lib's module-load throw is the primary guard
  // against a flag-on build that ships without a PRIVY_APP_ID. This second
  // check catches paths where the lib has been mocked (e.g. unit tests
  // that bypass the throw) or future tenant misconfigurations that slip
  // past build-time checks. If the app id is missing/empty, fall back to
  // a no-op pass-through rather than mounting a broken PrivyProvider.
  if (!PRIVY_APP_ID || PRIVY_APP_ID.length === 0) {
    return <>{children}</>;
  }

  // Flag-on: render the lazy Privy shell. Keep children mounted via the
  // fallback so we don't flash blank while the chunk loads (the chunk is
  // small and usually already cached on second paint).
  const Shell = LazyPrivyShell;
  return (
    <Suspense fallback={<>{children}</>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
};

export default ManagedWalletProvider;
