// @version 0.8.0 @date 2026-06-11
// 0.8.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.6):
//         reconnecting + disconnected fragments → ONE <WalletGateCard/>.
// @version 0.7.0 @date 2026-06-05
// 0.7.0 — useWalletGate migration: drop the useWalletSettling shim +
//         WalletReconnecting full-subtree replacement. Read gate.status
//         tri-state directly (connected | reconnecting | disconnected).
//         Page chrome (header + SubTabBar + Info tab) now stays mounted
//         across all three states; the `reconnecting` branch shows an
//         inline aria-busy indicator card instead of tearing the page
//         down, and `disconnected` keeps the existing ConnectWallet card.
// 0.6.1 — H20 FIX (Daniel 2026-06-03): debounce mint submit. Previously
//         doMint() had no in-flight guard at the doMint-entry layer —
//         only the button's `disabled={busy(...)}` reacted to the
//         underlying useNokMint/useEmailNokMint step transitioning out
//         of "idle". Between the click and the first hook step change
//         there was a brief window (validators run, alert dialogs, async
//         await of `mint.mint(...)`) where rapid double-clicks /
//         touch-double-tap / wallet-prompt-already-open / re-entrant
//         click could fire a second doMint() and queue a duplicate
//         3-SBT mint to the wallet. New `isSubmitting` state at
//         component scope is flipped synchronously at doMint entry,
//         re-entrant calls return immediately, and a try/finally
//         guarantees the flag is cleared regardless of throw. Button
//         `disabled` now ORs the new flag with the existing busy()
//         check so the visual state still reflects mint progress.
// 0.6.0 — H19 FIX (Daniel 2026-06-03): doMint vault-id, manifest-hash and
//         wallet-address checks now delegate to the shared hex-shape
//         validators in src/lib/validators.ts (`isValidVaultId` /
//         `isValidHash` / `isValidEthAddress`) instead of three different
//         inline regexes. The prior checks accepted ANY-length hex
//         (`/^[a-fA-F0-9]+$/` after stripping `0x`) for vaultId and
//         manifestHash — meaning a 6-char paste, a truncated copy, or an
//         odd-byte hex string slipped through and only failed at the SBT
//         contract level with an uninformative revert ("execution
//         reverted"). The new helpers enforce the exact 32-byte (0x + 64
//         hex) shape and trim whitespace. Wallet path uses
//         `isValidEthAddress` (matches Enrol.tsx 2.6.0 for parity).
//         Email path unchanged — already routed through `isValidEmail`
//         via H18 / 0.5.1. The trimmed values are passed downstream so
//         the SBT mint payload is canonical (no trailing newline / space
//         going on-chain or into Form B's email-hash table).
// 0.5.1 — H18 fix: NoK email designate form now uses the shared
//         `isValidEmail` from lib/validators.ts instead of the weak
//         `.includes("@")` check (enforces shape, max 254 chars, rejects
//         RTL/bidi/zero-width spoof characters).
// 0.5.0 — M-of-N pre-v0.6 honesty disclosure: qualify the header Voting-token
//         parenthetical AND the "Multi-NoK + quorum" prose block to make clear
//         that M-of-N quorum enforcement only applies from v0.6 onwards;
//         vaults enrolled before v0.6 remain owner-restorable — re-enrol to
//         upgrade. Per mofn-restore-quorum-fix-plan.md §K.BEFORE.
// 0.4.0 — Sub-tabs (Daniel): Designate (the existing flow) + "How it works /
//         your options" Info tab — the 2 NoK process diagrams (NokDiagrams)
//         + a "do it your way" guide to the ways to set up an heir (existing
//         wallet, email/Hybrid-E, pre-provisioned software wallet, pre-loaded
//         hardware wallet held/handed-over, distribute-vs-hold, in-person vs
//         remote, quorum). Uses the shared SubTabBar.
// 0.3.0 — Section D Hybrid-E PWA wiring: the "+ Designate" form now has a
//         mode toggle (wallet | email). Wallet mode = unchanged. Email mode
//         registers the email at Form B (returns emailHash + nonce) then
//         mints the heir's SBT(s) to the escrow via `designateByEmail` — handled by
//         the new useEmailNokMint hook. The escrow holds the soulbound
//         tokens until the heir completes the /nok-claim/:nonce
//         walkthrough after the dead-man fires. Header reworded to lead
//         with the soulbound-NFT differentiator (§P SBT visibility).
// 0.2.5 — "+ Designate" form: optional dropdown of THIS browser's
//         vaults that auto-fills Vault ID + manifest hash (no hand-
//         copying). Manual entry kept. Per-vault page (/vault/:id) is
//         the richer path for adding a NoK to a specific vault.
// 0.2.4 — Reconnect guard → shared useWalletSettling grace window
//         (precondition Daniel set — archive RPC/indexer in — now met;
//         fixes the fast-load false "connect" flash).
// 0.2.3 — Reverted useReconnectGate → simple status guard (Daniel).
//         Mint errors now go through humanizeTxError (concise:
//         cancelled / failed + reason, no raw viem dump).
// 0.2.2 — Pruned-RPC error now shows an honest plain explanation (it's
//         an RPC/infra limit, your on-chain data is intact) instead of
//         a raw red viem stack. NOT a data fix — only an archive RPC is.
// 0.2.1 — reconnect guard moved to the shared useReconnectGate hook
//         (adds the initial-grace window — the bare status check still
//         flashed the connect prompt during wagmi's async restore).
// 0.2.0 — wallet-reconnect guard: during the persisted-session restore
//         window show "Reconnecting…" instead of the connect prompt.
// 0.1.0 — initial.
//
// /nok — designate, list, and revoke next-of-kin. Reads existing NoKs from
// the SBT contract via NoKMinted event scan. Mint flow uses the same
// useNokMint hook the Enrol wizard uses (so the two stay in sync).

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import { readVaults } from "./Vaults.js";
import { useNokList } from "../hooks/useNokList.js";
import { useNokMint } from "../hooks/useNokMint.js";
import { useEmailNokMint } from "../hooks/useEmailNokMint.js";
import { NokRow } from "../components/NokRow.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { humanizeRpcError } from "../lib/rpcError.js";
import { humanizeTxError } from "../lib/txError.js";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { SBT_ADDR } from "../lib/contracts.js";
import { isValidEmail, isValidEthAddress, isValidVaultId, isValidHash } from "../lib/validators.js";
import { SubTabBar } from "../components/SubTabBar.js";
import { NokDiagrams } from "../components/ProcessDiagrams.js";
import { Link } from "react-router-dom";

export function Nok(): JSX.Element {
  const [sub, setSub] = useState<"main" | "info">("main");
  const { address } = useAccount();
  const gate = useWalletGate();
  const { entries, loading, error: listError, refetch } = useNokList();
  const mint = useNokMint();
  const emailMint = useEmailNokMint();
  const [showAdd, setShowAdd] = useState(false);
  const [mode, setMode] = useState<"wallet" | "email">("wallet");
  const [nokWallet, setNokWallet] = useState("");
  const [nokEmail, setNokEmail] = useState("");
  const [vaultId, setVaultId] = useState("");
  const [manifestHash, setManifestHash] = useState("");
  // 0.6.1 (H20) — synchronous re-entry guard. Flipped at doMint() entry,
  // cleared in finally. Re-entrant clicks return immediately.
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Local vaults (this browser) — pick one to auto-fill the hex fields
  // instead of hand-copying from manifest.json. Manual entry still works.
  const localVaults = useMemo(() => readVaults(), []);

  const contractsLive = SBT_ADDR !== "0x0000000000000000000000000000000000000000";

  async function doMint(): Promise<void> {
    // H20 (0.6.1): synchronous re-entry guard. Returns immediately on a
    // double-click / re-entrant call so the wallet doesn't get prompted
    // twice and the underlying mint hook isn't run in parallel.
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // H19 (0.6.0): strict 32-byte-hex shape, not any-length-hex. Helpers
      // trim whitespace then enforce 0x + 64-hex exactly.
      if (!isValidVaultId(vaultId)) { alert("Vault ID must be 0x + 64 hex characters (32 bytes)"); return; }
      if (!isValidHash(manifestHash)) { alert("Manifest hash must be 0x + 64 hex characters (32 bytes)"); return; }
      const trimmedVaultId = vaultId.trim();
      const trimmedManifestHash = manifestHash.trim();
      if (mode === "wallet") {
        if (!isValidEthAddress(nokWallet)) { alert("Invalid NoK wallet address"); return; }
        await mint.mint({ nokWallet: nokWallet.trim() as Address, vaultId: trimmedVaultId, manifestHash: trimmedManifestHash });
        if (mint.step !== "error") {
          setShowAdd(false);
          setNokWallet(""); setVaultId(""); setManifestHash("");
          setTimeout(() => void refetch(), 1500);
        }
      } else {
        if (!isValidEmail(nokEmail)) { alert("Please enter a valid email address"); return; }
        await emailMint.mint({ email: nokEmail.trim(), vaultId: trimmedVaultId, manifestHash: trimmedManifestHash });
        if (emailMint.step !== "error") {
          setShowAdd(false);
          setNokEmail(""); setVaultId(""); setManifestHash("");
          setTimeout(() => void refetch(), 1500);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-display"><span className="grad">Next-of-Kin</span></h1>
        <p className="text-text-muted text-sm mt-2">
          Designate inheritance contacts. Each heir gets one soul-bound Activation NFT on Polygon — the dead-man's-switch trigger. M-of-N quorum vaults add a Voting NFT per heir. Mint once, manage forever, revoke any time.
        </p>
        <div className="mt-3 p-3 rounded bg-bg-surface text-sm text-text-on-dark/80 border border-bg-surface space-y-2">
          <div>
            <strong className="text-accent-cyan">Each heir gets ONE soulbound NFT (ERC-5192) on Polygon</strong> — the Activation token (the dead-man's-switch trigger). One heir, one token, one transaction. Only if you set up <strong>M-of-N quorum</strong> does each heir <em>also</em> get a Voting token (enforced from v0.6 onwards — vaults enrolled before v0.6 remain owner-restorable; re-enrol to upgrade). ERC-5192 means the token is <em>locked to your heir's wallet forever</em> — never transferable, never sellable, never seizable. It's a rare-in-production use of the standard and it's what makes inheritance autonomous + tamper-evident.
          </div>
          <div>
            <strong className="text-accent-cyan">Wallet vs email — two paths:</strong> if your heir already has a crypto wallet, designate by wallet (the SBTs go straight to them). If not, designate by <strong>email</strong> — the SBTs are held in escrow until the dead-man fires; then the heir gets a walkthrough email at <a href="/nok-claim" className="text-accent-cyan underline">/nok-claim/&lt;nonce&gt;</a> that walks them through creating a wallet and claiming the inheritance NFT. The email path is "Hybrid E".
          </div>
          <div>
            <strong className="text-accent-cyan">Multi-NoK + quorum:</strong> designate several NoKs, each a different person, each their own wallet (or email). If you set the quorum to 2-of-3, then any 2 of your 3 designated NoKs must each sign a release transaction from their own wallet before the inheritance unlocks — defending against any single NoK being socially-engineered, coerced, or compromised. <em>M-of-N quorum enforcement is enabled from v0.6 onwards; vaults enrolled before v0.6 remain owner-restorable by their owner — re-enrol to upgrade.</em>
          </div>
        </div>
      </header>

      <SubTabBar
        items={[{ id: "main", label: "Designate" }, { id: "info", label: "How it works / your options" }]}
        active={sub}
        onPick={(id) => setSub(id as "main" | "info")}
      />

      {sub === "info" && <NokInfoTab />}

      {sub === "main" && (<>
      {!contractsLive && (
        <div className="card border-2 border-danger">
          <h2 className="font-bold text-danger mb-2">Contracts not deployed</h2>
          <p className="text-sm text-text-on-dark/80">
            Set <code>VITE_SBT_CONTRACT_ADDR</code> in <code>apps/web/.env.local</code> to the deployed NoKLockSBT address (Polygon mainnet or Amoy testnet), then restart the dev server. Until then this page is read-only and mint attempts will fail.
          </p>
        </div>
      )}

      {gate.status !== "connected" && (
        <WalletGateCard note="Connect a wallet to manage your NoKs." />
      )}

      {gate.status === "connected" && (
        <>
          <div className="card flex justify-between items-baseline">
            <div>
              <h2 className="font-bold font-display">Designated NoKs</h2>
              <p className="text-text-muted text-sm mt-1">
                {loading ? "Reading on-chain…" : entries.length === 0 ? "None yet." : `${entries.length} designated.`}
              </p>
            </div>
            <button className="btn btn-primary text-sm" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? "Cancel" : "+ Designate"}
            </button>
          </div>

          {showAdd && (
            <div className="card sensitive-surface">
              <h3 className="font-bold font-display mb-3">New NoK designation</h3>

              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMode("wallet")}
                  className={`px-3 py-1.5 rounded text-sm border ${mode === "wallet" ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-bold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}
                >
                  Wallet (heir already has one)
                </button>
                <button
                  type="button"
                  onClick={() => setMode("email")}
                  className={`px-3 py-1.5 rounded text-sm border ${mode === "email" ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-bold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}
                >
                  Email (Hybrid-E — heir without a wallet yet)
                </button>
              </div>

              <div className="space-y-3 text-sm">
                {mode === "wallet" ? (
                  <label className="block">
                    <span className="text-text-muted">NoK wallet address</span>
                    <input type="text" value={nokWallet} onChange={(e) => setNokWallet(e.target.value)} placeholder="0x..." className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
                  </label>
                ) : (
                  <label className="block">
                    <span className="text-text-muted">NoK email address</span>
                    <input type="email" value={nokEmail} onChange={(e) => setNokEmail(e.target.value)} placeholder="heir@example.com" className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
                    <span className="block text-xs text-text-muted mt-1">
                      Stored as a salted keccak hash on-chain — the plaintext stays in NoKLock's encrypted server table only long enough to send the activation email after the dead-man fires.
                    </span>
                  </label>
                )}
                {/* Owner-choice disclosure + B-1 steer (Daniel 2026-06-16). An
                    email-only heir depends on a live notification channel + (today)
                    NoKLock's attestor to claim. Disclose it honestly + give the
                    owner the menu to harden it; the custody of the secret never
                    depended on us — this hardens the notification + claim path. */}
                {mode === "email" && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs space-y-2 text-text-on-dark/85">
                    <p className="font-bold text-amber-300">Designating by email — read this honestly first.</p>
                    <p>
                      Your inheritance still <strong>fires and is claimable on-chain</strong> even if NoKLock disappears. What we <strong>cannot</strong> fully decentralise is auto-<em>notifying</em> a human (a blockchain can't push to an inbox), and an email-only heir currently needs NoKLock's signature to claim the escrowed token. So harden it — <strong>your choice, pick as many as you like:</strong>
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong className="text-text-on-dark">Most NoKLock-proof:</strong> have your heir claim with a <strong>managed wallet</strong> (arriving with Managed mode) — they hold the token + claim directly, no NoKLock signature needed. Until then, <strong>also give a real heir wallet</strong> as a fallback (use the <em>Wallet</em> tab above) so they never depend solely on our attestor.</li>
                      <li><strong className="text-text-on-dark">On-chain backstop:</strong> register your <a href="/live-mans-switch" className="text-accent-cyan underline">Live-Man's Switch</a> watchers — an on-chain ping that survives us.</li>
                      <li><strong className="text-text-on-dark">Operator-free floor:</strong> save the <a href="/heir-claim.html" target="_blank" rel="noopener" className="text-accent-cyan underline">static heir-claim page</a> — a single self-contained file (right-click → Save) that reads the public chain with zero NoKLock servers.</li>
                      <li><strong className="text-text-on-dark">Human carrier:</strong> tell a trusted executor / lawyer / guardian out-of-band: "if something happens to me, point my heir at the chain." Survives total tech loss.</li>
                    </ul>
                  </div>
                )}
                {localVaults.length > 0 && (
                  <label className="block">
                    <span className="text-text-muted">Pick one of your vaults (auto-fills the fields below)</span>
                    <select
                      className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm"
                      defaultValue=""
                      onChange={(e) => {
                        const v = localVaults.find((x) => x.vaultId === e.target.value);
                        if (!v) return;
                        setVaultId(v.vaultId);
                        setManifestHash(v.manifestHash ?? "");
                      }}
                    >
                      <option value="">— choose a vault —</option>
                      {localVaults.map((v) => (
                        <option key={v.vaultId} value={v.vaultId}>
                          {v.label} ({v.vaultId.slice(0, 10)}…){v.manifestHash ? "" : " — needs manifest.json"}
                        </option>
                      ))}
                    </select>
                    <span className="block text-xs text-text-muted mt-1">
                      Vaults enrolled before this update have no stored manifest hash — open them from <a className="text-accent-cyan underline" href="/vaults">Vaults</a> to derive it, or paste it manually below.
                    </span>
                  </label>
                )}
                <label className="block">
                  <span className="text-text-muted">Vault ID (from your enrolment manifest)</span>
                  <input type="text" value={vaultId} onChange={(e) => setVaultId(e.target.value)} placeholder="0x..." className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
                </label>
                <label className="block">
                  <span className="text-text-muted">Manifest hash (from manifest.json)</span>
                  <input type="text" value={manifestHash} onChange={(e) => setManifestHash(e.target.value)} placeholder="0x..." className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
                </label>
              </div>

              <div className="flex gap-3 mt-4 items-center">
                <button className="btn btn-primary text-sm" disabled={isSubmitting || busy(mode === "wallet" ? mint.step : emailMint.step)} onClick={() => void doMint()}>
                  {mode === "wallet"
                    ? (labelFor(mint.step) ?? "Mint heir token")
                    : (labelForEmail(emailMint.step) ?? "Register email + mint heir token")}
                </button>
                {mode === "wallet" && mint.step !== "idle" && (
                  <button className="btn btn-secondary text-sm" onClick={mint.reset}>Reset</button>
                )}
                {mode === "email" && emailMint.step !== "idle" && (
                  <button className="btn btn-secondary text-sm" onClick={emailMint.reset}>Reset</button>
                )}
              </div>

              {mode === "wallet" && (mint.txHashes.activation || mint.txHashes.voting) && (
                <div className="text-xs text-text-muted mt-3 space-y-0.5 font-mono">
                  {mint.txHashes.activation && <div>activation: {tx(mint.txHashes.activation)}</div>}
                  {mint.txHashes.voting && <div>voting: {tx(mint.txHashes.voting)}</div>}
                </div>
              )}
              {mode === "email" && (emailMint.txHashes.activation || emailMint.txHashes.voting) && (
                <div className="text-xs text-text-muted mt-3 space-y-0.5 font-mono">
                  {emailMint.emailHash && <div>emailHash: {emailMint.emailHash.slice(0, 18)}…</div>}
                  {emailMint.nonce && <div>nonce: {emailMint.nonce.slice(0, 18)}…</div>}
                  {emailMint.txHashes.activation && <div>activation: {tx(emailMint.txHashes.activation)}</div>}
                  {emailMint.txHashes.voting && <div>voting: {tx(emailMint.txHashes.voting)}</div>}
                </div>
              )}
              {mode === "wallet" && mint.error && <div className="text-sm text-danger mt-2 break-words">{humanizeTxError(mint.error)}</div>}
              {mode === "email" && emailMint.error && <div className="text-sm text-danger mt-2 break-words">{humanizeTxError(emailMint.error)}</div>}
            </div>
          )}

          {listError && (
            humanizeRpcError(listError)
              ? <div className="card border-amber-500/40 border bg-amber-500/10 text-amber-200 text-sm">{humanizeRpcError(listError)}</div>
              : <div className="card border-danger border text-danger text-sm">{listError}</div>
          )}

          {!loading && entries.map((entry) => (
            <NokRow key={`${entry.nokWallet}-${entry.vaultId}`} entry={entry} onRevoked={() => void refetch()} />
          ))}
        </>
      )}

      {/* Suppress unused warning for address */}
      {address && null}
      </>)}
    </div>
  );
}

// /nok Info sub-tab — the 2 NoK process diagrams + a "do it your way" guide to
// the different ways a user can set up their heir's access.
function NokInfoTab(): JSX.Element {
  return (
    <div className="space-y-6">
      <NokDiagrams />

      <div className="card space-y-3">
        <h2 className="text-xl font-bold font-display"><span className="grad">Do it your way — ways to set up your heir</span></h2>
        <p className="text-sm text-text-on-dark/85">
          A next-of-kin just needs a wallet address (or an email) that <em>they'll</em> be able to control when the
          time comes. How you arrange that is up to you — here are the common ways, from simplest to most hands-on:
        </p>
        <ul className="space-y-3 text-sm text-text-on-dark/90">
          <li>
            <strong className="text-accent-cyan">1. Heir already has a wallet.</strong> Simplest path — designate their
            existing wallet address. The soulbound NFTs go straight to it. Make sure it's an address they'll still
            control years from now (not an exchange deposit address).
          </li>
          <li>
            <strong className="text-accent-cyan">2. Heir has no wallet (Email / Hybrid-E).</strong> Designate them by
            email. The NFTs wait in escrow; if your dead-man's switch fires they get a plain-language walkthrough at{" "}
            <Link to="/nok-claim" className="text-accent-cyan hover:underline">/nok-claim</Link> to make a wallet and
            claim. Best for non-crypto family — nothing for them to set up today.
          </li>
          <li>
            <strong className="text-accent-cyan">3. Pre-provision a software wallet for them.</strong> Create a fresh
            wallet now (MetaMask, Trust, Rabby…), designate <em>its</em> address, and seal the seed phrase for them —
            paper in a home safe, with your lawyer, or in a sealed envelope. They import it when needed. You stay in
            control until you hand it over.
          </li>
          <li>
            <strong className="text-accent-cyan">4. Pre-load a hardware wallet.</strong> Set up a Ledger / Trezor /
            Keystone, designate its address, and either hand it to your heir now or store it (safe, lawyer, bank box)
            to be given on death. Keep the recovery sheet + PIN <em>separate</em> from the device. The most robust
            option for larger estates.
          </li>
          <li>
            <strong className="text-accent-cyan">5. Distribute now vs hold for delivery.</strong> Give your heir their
            wallet/access today (you trust them with it early) — or have a third party (executor, lawyer, a safe-deposit
            box) hold it and release it only on death. NoKLock's on-chain trigger handles <em>when</em>; you choose
            <em> who holds what</em> until then.
          </li>
          <li>
            <strong className="text-accent-cyan">6. In person or remote.</strong> Do the setup together at one machine,
            or guide them remotely. Either way the address is all the contract needs — the rest is your family's
            arrangement.
          </li>
          <li>
            <strong className="text-accent-cyan">7. Combine with a quorum.</strong> Name several heirs and require an
            M-of-N vote (e.g. 2-of-3) so no single person can act alone — pair any of the above with this for
            social-engineering resistance. An attorney or executor can be one of the signers.
          </li>
        </ul>
        <p className="text-xs text-text-muted">
          Whichever you choose, run a <Link to="/restore" className="text-accent-cyan hover:underline">test restore</Link> with
          throwaway data first, and keep an independent backup (defence in depth). The on-chain switch + your grace
          window stay the real guarantee. Use the <strong>Designate</strong> tab above to add a next-of-kin.
        </p>
      </div>
    </div>
  );
}

function labelFor(step: string): string | null {
  switch (step) {
    case "minting-activation": return "Minting your heir's token…";
    case "minting-voting":     return "Minting the voting token (quorum)…";
    case "done":               return "Minted ✓";
    default: return null;
  }
}

function labelForEmail(step: string): string | null {
  switch (step) {
    case "registering-email":  return "Registering email…";
    case "minting-activation": return "Minting your heir's token to escrow…";
    case "minting-voting":     return "Minting the voting token to escrow (quorum)…";
    case "done":               return "Designated ✓";
    default: return null;
  }
}

function busy(step: string): boolean {
  return step !== "idle" && step !== "done" && step !== "error";
}

function tx(hash: `0x${string}`): JSX.Element {
  return (
    <a href={`https://polygonscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">
      {hash.slice(0, 10)}…{hash.slice(-6)}
    </a>
  );
}
