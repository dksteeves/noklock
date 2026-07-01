// @version 0.2.0 @date 2026-06-11
// 0.2.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC-2026-06-11):
//         bind to the SPECIFIC wallet, not "whichever extension injected
//         window.ethereum". wagmi v2's EIP-6963 discovery (on by default)
//         exposes one connector per installed wallet (id = rdns, real name,
//         icon). Connecting through the named connector makes wagmi persist
//         THAT wallet's id, so reconnect-on-mount rebinds the same wallet
//         deterministically (with >1 extension the generic 'injected'
//         connector binds a random winner — part of the 2026-06-11 desktop
//         chaos while MetaMask was temporarily installed). Generic injected
//         is kept only as a fallback when nothing announced. Per-button
//         pending state; WalletConnect unchanged.
// 0.1.0 — shared connect control (injected + WalletConnect).

import { useConnect, type Connector } from "wagmi";

export function ConnectWallet({ className }: { readonly className?: string }): JSX.Element {
  const { connectors, connect, isPending, variables } = useConnect();

  const hasWindowEthereum =
    typeof window !== "undefined" &&
    !!(window as unknown as { ethereum?: unknown }).ethereum;

  // EIP-6963-discovered wallets: type 'injected' with a wallet-specific id
  // (rdns, e.g. "com.trustwallet.app"). The explicitly-configured generic
  // connector has id === "injected".
  const named = connectors.filter((c) => c.type === "injected" && c.id !== "injected");
  const generic = connectors.find((c) => c.id === "injected");
  const wc = connectors.find((c) => c.type === "walletConnect");

  const list: { c: Connector; label: string }[] = [];
  if (named.length > 0) {
    for (const c of named) list.push({ c, label: c.name });
  } else if (generic && hasWindowEthereum) {
    list.push({ c: generic, label: "Browser wallet" });
  }
  if (wc) list.push({ c: wc, label: list.length > 0 ? "WalletConnect / mobile" : "Connect a wallet (scan QR)" });
  if (list.length === 0 && generic) list.push({ c: generic, label: "Connect wallet" });

  if (list.length === 0) {
    return (
      <p className="text-xs text-text-muted">
        No wallet detected. Install a browser wallet or open NoKLock on a device with a wallet app.
      </p>
    );
  }

  const pendingUid = isPending ? (variables?.connector as Connector | undefined)?.uid : undefined;

  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-center">
      {list.map(({ c, label }) => (
        <button
          key={c.uid}
          className={className ?? "btn btn-primary"}
          // Disable ONLY the button whose connect is in flight — never the
          // others. If one wallet's eth_requestAccounts hangs (the wedge class
          // this whole rebuild targets), the remaining buttons (e.g. the
          // WalletConnect fallback) must stay live. (Fable review 2026-06-11.)
          disabled={pendingUid === c.uid}
          onClick={() => connect({ connector: c })}
        >
          {c.icon ? (
            <img src={c.icon} alt="" aria-hidden className="inline-block w-4 h-4 mr-2 align-text-bottom" />
          ) : null}
          {pendingUid === c.uid ? "Connecting…" : label}
        </button>
      ))}
    </div>
  );
}
