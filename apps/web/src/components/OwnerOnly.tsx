// @version 0.12.0 @date 2026-06-11
// 0.12.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.1): the
//          separate disconnected (Connect card) + reconnecting (busy card)
//          branches collapse into ONE shared <WalletGateCard/> via
//          `if (gate.status !== "connected") return <WalletGateCard/>`. The
//          card always shows the connect buttons (incl. while restoring) — the
//          only escape from a wedged auto-restore. Admin/owner logic and the
//          OFFCHAIN_ADMIN_AT_BOOT fast-path are UNCHANGED (auth not weakened).
// @version 0.11.0 @date 2026-06-11
// 0.11.0 — Daniel 2026-06-11: CONNECTED = TRUSTED, NEVER RE-VERIFY (companion
//          to useWalletGate 0.3.0, which now surfaces wagmi's address the
//          instant wagmi holds one instead of discarding it during
//          'reconnecting'). With the address always present for a live
//          wallet, this gate's decision for a CONNECTED wallet is now fully
//          SYNCHRONOUS and spinner-free:
//
//          (a) Allowlisted (env-baked OFFCHAIN_ADMINS) → children render
//              IMMEDIATELY. No RPC, no 'Verifying access…', no settling
//              state. Unchanged from 0.9.0 — but now it actually fires on
//              every document-load entry too, because the hook no longer
//              withholds the address while wagmi's status string lags.
//          (b) NOT allowlisted → the Not-Authorised card renders IMMEDIATELY
//              (denied state, NOT a spinner). The License.owner() on-chain
//              check runs in the BACKGROUND and, if it resolves to the
//              connected address, the card swaps to children. While it is
//              in flight the denied card carries a one-line note so a
//              genuine contract-owner wallet knows the unlock is coming.
//              Auth is NOT weakened: connected ≠ authorized — the allowlist
//              membership (or a resolved on-chain owner match) is still the
//              ONLY way through this gate.
//
//          DELETED: the 15s STILL_SETTLING timeout + Retry/Connect escape
//          (0.8.1) and the 'Verifying access…' card for connected wallets
//          (0.8.0). Both were band-aids around useWalletGate 0.2.0 nulling
//          the address during wagmi's reconnect window; they showed
//          spinners — and eventually a Connect button — to a wallet that
//          never disconnected. No timer gates a wallet anymore.
//
//          'reconnecting' is now GENUINELY no-address-only (hook guarantee):
//          a calm unbounded busy card for the cold-boot hydration window,
//          with the OFFCHAIN_ADMIN_AT_BOOT fast-path (0.10.0, storage-key
//          fixed in offchainAdmins 0.2.0 — it read the bare "noklock-wagmi"
//          key wagmi never writes) rendering children through that window
//          for admins. 'disconnected' (the ONLY state that shows Connect)
//          is now genuine: no address, and wagmi's reconnect cycle settled.
//          The boot fast-path is additionally scoped to status==='reconnecting'
//          so a stale module-scope flag can no longer render admin UI after
//          an explicit in-session disconnect.
// @version 0.10.0 @date 2026-06-07
// 0.10.0 — handoff §2.2 + §2.3: OFFCHAIN_ADMIN_AT_BOOT module-scope
//          fast-path + shared lib/offchainAdmins.ts allowlist source.
// @version 0.9.0 @date 2026-06-06
// 0.9.0 — Daniel 2026-06-06: synchronous offchain-admin fast-path before any
//         settling check; License.owner() RPC skipped for admins entirely.
//         ("i am connected and verified admin level .. why is it
//         reconnecting everytime when i am already fucking connected and
//         set as admin?")
// @version 0.8.1 @date 2026-06-05 — 15s stillSettling timeout escape
//         (REMOVED in 0.11.0).
// @version 0.8.0 @date 2026-06-04 — 'Verifying access…' collapse of
//         reconnecting + connected-while-owner-loading (REMOVED in 0.11.0
//         for connected wallets).
// 0.7.0 — Single-source useWalletGate migration.
// 0.6.x and earlier — see git / memory.

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useReadContract } from "wagmi";
import { LICENSE_ADDR, licenseAbi } from "../lib/contracts.js";
import { WalletGateCard } from "./WalletGateCard.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { isOffchainAdmin, isOffchainAdminAtBoot } from "../lib/offchainAdmins.js";

// 0.10.0 — computed ONCE at module load (handoff §2.2). Reads wagmi's
// persisted localStorage state synchronously (offchainAdmins 0.2.0 — now the
// REAL "noklock-wagmi.store" key) to decide whether the previously-connected
// wallet is an offchain admin BEFORE wagmi finishes rehydrating. Bridges
// ONLY the genuine no-address cold-boot window — see the scoped check below.
const OFFCHAIN_ADMIN_AT_BOOT = isOffchainAdminAtBoot();

export function OwnerOnly({ title, children }: { readonly title: string; readonly children: ReactNode }): JSX.Element {
  const gate = useWalletGate();

  // 0.11.0 — the admin decision is SYNCHRONOUS, from the connected address
  // against the env-baked allowlist. useWalletGate 0.3.0 guarantees
  // gate.address is populated whenever wagmi holds a live address (including
  // during the status-string 'reconnecting' lag), so this check always
  // receives the real address for a connected wallet.
  const lowerAddr = gate.address?.toLowerCase();
  const isAdminNow = isOffchainAdmin(gate.address);

  // 0.11.0 — background on-chain owner check. Only fires for a CONNECTED
  // non-admin wallet (admins never need it; no wallet = nothing to check).
  // It NEVER blocks render: the denied card below shows immediately and
  // swaps to children if/when this resolves to a match.
  const { data: ownerAddr, isLoading: ownerLoading, error: ownerErr } = useReadContract({
    abi: licenseAbi, address: LICENSE_ADDR, functionName: "owner",
    query: {
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: gate.status === "connected" && !isAdminNow,
    },
  });

  useEffect(() => {
    if (ownerErr) {
      // eslint-disable-next-line no-console
      console.warn("[OwnerOnly] License.owner() read failed; on-chain owner check is unavailable", ownerErr);
    }
  }, [ownerErr]);

  const isContractOwner =
    !!lowerAddr && !!ownerAddr && lowerAddr === ownerAddr.toString().toLowerCase();

  // ── 1. CONNECTED + ALLOWLISTED → children, instantly. Synchronous env
  // check, zero RPC, zero spinner, zero status-string dependence. This is
  // the path Daniel + Treasury hit on every gated page entry. ──
  if (isAdminNow) {
    return <>{children}</>;
  }

  // ── 2. Cold-boot bridge (genuine no-address window only). If wagmi's
  // persisted storage says the returning wallet is an allowlisted admin and
  // wagmi is still mid-rehydrate (no address yet), render children through
  // the gap instead of flashing a busy card. Scoped to 'reconnecting' so an
  // explicit in-session disconnect (status 'disconnected') can never reuse
  // the stale module-scope flag. Once the address lands, check 1 (or the
  // denied path) takes over with the real address. ──
  if (OFFCHAIN_ADMIN_AT_BOOT && gate.address === undefined && gate.status === "reconnecting") {
    return <>{children}</>;
  }

  // ── 3. NOT connected — genuine disconnection OR the no-address-yet boot
  // window. ONE surface: WalletGateCard, whose connect buttons are ALWAYS
  // live (the only escape from a wedged restore —
  // WALLET-CONNECT-ROOTCAUSE-2026-06-11). A wallet with a live address can
  // never reach here (useWalletGate 0.3.0 guarantee), so the admin/owner
  // logic below only ever runs for a genuinely connected wallet. ──
  if (gate.status !== "connected") {
    return <WalletGateCard />;
  }

  // ── 5. CONNECTED + NOT allowlisted. Background owner check may still
  // upgrade a contract-owner wallet to children; everyone else stays on the
  // denied card. The denied card renders IMMEDIATELY — never a spinner. ──
  if (isContractOwner) {
    return <>{children}</>;
  }

  return (
    <div className="card max-w-xl mx-auto space-y-3">
      <h1 className="text-3xl font-bold font-display"><span className="grad">{title}</span></h1>
      <p className="text-rose-300">Not authorised.</p>
      <p className="text-sm text-text-on-dark/80">Accepts the contract-owner wallet OR the off-chain admin (Treasury). Connected: <span className="font-mono text-xs">{gate.address}</span></p>
      {ownerLoading && (
        <p className="text-xs text-text-muted" aria-busy="true">
          The on-chain owner check is still running in the background — if this wallet is the contract owner, the page unlocks automatically when it completes.
        </p>
      )}
      {ownerErr && (
        <p className="text-xs text-amber-300/90">
          Note: the on-chain owner check could not be completed (RPC error). If you are the contract owner, this may be transient — retry shortly.
        </p>
      )}
    </div>
  );
}
