// @version 0.1.0 @date 2026-05-23
// First-use wallet-connection trust explainer (Daniel 2026-05-23). Wallet-
// connection anxiety is a real conversion killer — sharpest here, because
// NoKLock's whole pitch is "protect your seed", so the audience is primed to
// distrust any site that wants to touch a wallet. Two parts:
//   1. What connecting actually does (read-only, address only, no spend, we
//      never see your seed; the only signing prompts are actions YOU start).
//   2. Prove it yourself — connect a throwaway/empty wallet first and watch
//      that nothing is ever requested without your action. Ties into the
//      /prove-it "proof, not promises" ethos.
// Collapsible <details>; pass defaultOpen on the /prove-it page.

export function ConnectExplainer({ defaultOpen = false }: { readonly defaultOpen?: boolean }): JSX.Element {
  return (
    <details className="card" open={defaultOpen}>
      <summary className="font-bold font-display cursor-pointer">
        New to wallets? <span className="text-text-muted font-normal text-sm">What "Connect" actually does — and how to test us first</span>
      </summary>

      <div className="mt-4 space-y-5 text-sm">
        <section>
          <h3 className="font-bold text-accent-cyan mb-2">What connecting does (and doesn't)</h3>
          <ul className="space-y-2 text-text-on-dark/90">
            <li>
              <span className="text-accent-green font-semibold">Connecting shares only your public address — read-only.</span>{" "}
              No transaction, no signature, no spend. A plain connect usually doesn't even pop an approval.
            </li>
            <li>
              <span className="text-accent-green font-semibold">NoKLock never sees your seed phrase.</span>{" "}
              Your vault's master password is a separate layer that never touches your wallet — we couldn't read either if we tried.
            </li>
            <li>
              <span className="text-accent-green font-semibold">The only prompts that sign or cost gas are actions you choose</span>{" "}
              — mint a licence, designate an heir, send a heartbeat. Each is named before you click, your wallet shows you exactly what it is, and you can reject any of them.
            </li>
            <li>
              <span className="text-accent-green font-semibold">Disconnect anytime</span>{" "}
              (top-right). Your wallet address is your only identity here — there's no account, email, or password held for you.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-accent-cyan mb-2">Don't trust us — test us (with a throwaway wallet)</h3>
          <p className="text-text-muted mb-2">The safest way to satisfy yourself before connecting your real wallet:</p>
          <ol className="space-y-2 text-text-on-dark/90 list-decimal list-inside">
            <li>Add a brand-new, <span className="font-semibold">empty</span> account in MetaMask / Rabby / Trust (or install a fresh one). Put nothing in it.</li>
            <li>Connect that empty wallet here. Notice it only asks to share an address — no funds are ever at risk.</li>
            <li>Click around — Dashboard, NoK, Heartbeat. Watch that nothing is requested unless <span className="font-semibold">you</span> start it; and when it is, your wallet shows you the exact request first.</li>
            <li>Satisfied? Disconnect the burner and connect your real wallet — or just keep using a dedicated wallet for NoKLock. Plenty of people do.</li>
          </ol>
          <p className="text-text-muted mt-3">
            Want to verify the maths too, not just the manners?{" "}
            <a href="/prove-it" className="text-accent-cyan underline">Prove It</a> runs the real NoKLock encryption pipeline on throwaway data, right in your browser — nothing leaves your machine.
          </p>
        </section>
      </div>
    </details>
  );
}
