// @version 0.6.0 @date 2026-06-11
// 0.6.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.7):
//         reconnecting + connect fragments → ONE step-gated <WalletGateCard/>.
// @version 0.5.0 @date 2026-06-05
// 0.5.0 — Daniel 2026-06-05: migrate off useWalletSettling shim onto
//          useWalletGate tri-state directly. The page chrome (header / h1)
//          now renders in ALL gate states; a 'reconnecting' wallet shows an
//          inline "Reconnecting your wallet…" card BELOW the header instead
//          of replacing the whole subtree with WalletReconnecting. Dropped
//          the WalletReconnecting + useWalletSettling imports.
// 0.4.0 — Daniel 2026-06-01: M-of-N Stage 1 step D.5 [mofn-restore-quorum-fix-plan §D.5].
//          After a successful `claimWithAttestation`, the heir's wallet
//          signs a `HeirClaimEnvelope` (lib/heir-claim-envelope.ts) and the
//          page auto-downloads it as
//          `noklock-claim-envelope-<short-hash>.json`. The heir keeps this
//          file with their share files — `/heir/restore` requires it as
//          the unambiguous "I am a HEIR for this vault" credential before
//          showing the quorum vote button.
//          Replaced the misleading "the restore page will tell you if
//          you're waiting on more votes" copy with an honest link pointing
//          at the new `/heir/restore` route. Honesty: this is the heir's
//          signed claim — they drop it on the next page to vote toward
//          quorum; they are NOT yet able to decrypt the vault alone.
// 0.3.1 — Added a "Full app guide" button to /manual next to the heir-guide
//         button (Daniel: the claim landing page should also offer the user
//         manual). Wording-only change.
// 0.3.0 — bare /nok-claim (no nonce) now renders a friendly placeholder/info
//         state (what the page is, needs the email's unique link, designator
//         vs heir guidance + links) instead of a terse error. App.tsx adds the
//         bare route so it no longer 404s.
// 0.2.0 — Daniel 2026-05-20: prominent "First time here? Read the heir
//         guide first →" link in the header pointing to /heir, the new
//         public plain-language heir guide. Activation email also now
//         references the guide URL before the claim link.
// 0.1.0 — Section D heir walkthrough — /nok-claim/:nonce. Lands the email-NoK after
// the dead-man's switch has fired + the email-watcher has emailed them. UI:
//   1. Explain plainly what happened + what they're about to do
//   2. Connect or create a wallet
//   3. POST to /v1/nok/claim/:nonce → server signs EIP-712 attestation
//   4. Submit signature to NoKLockEscrow.claimWithAttestation
//   5. Heir owns a fresh soulbound NFT — show next steps to restore the vault
//
// Form B contract:
//   GET  /v1/nok/walkthrough-status/:nonce  → { vaultId, role, status,
//                                              claimedByWallet, expiresAt }
//   POST /v1/nok/claim/:nonce { claimingWallet } → {
//     ok, tokenId, attestation: { signature, signer, domain, message }
//   }
//   (Note: Form B follow-up — add `tokenId` to the response payload by
//   joining nok_emails on the NoKDesignatedByEmail indexer event. Marked
//   TODO below. UI handles the missing case gracefully if the server hasn't
//   shipped it yet.)
//
// Heir audience = non-technical, non-English likely. Copy is deliberately
// plain. i18n hooks are stubbed for the K3 dedicated heir guide pass.

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAccount, useWriteContract, useSignTypedData } from "wagmi";
import type { Address, Hex } from "viem";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { PageHelp } from "../components/PageHelp.js";
import { ESCROW_ADDR, escrowAbi } from "../lib/contracts.js";
import { humanizeTxError } from "../lib/txError.js";
import { useDocumentHead } from "../lib/seo.js";
import { generateClaimEnvelope } from "../lib/heir-claim-envelope.js";

const API_URL = (import.meta.env.VITE_API_URL ?? "https://api.noklock.app").replace(/\/+$/, "");
const HEIR_TOKEN_URI = "ipfs://noklock-nok-v1-heir/{id}.json";

interface StatusResponse {
  readonly vaultId?: string;
  readonly role?: string;
  readonly status?: "pending" | "claimed" | "expired";
  readonly claimedByWallet?: string | null;
  readonly expiresAt?: number | null;
  readonly error?: string;
}

interface AttestationResponse {
  readonly ok?: boolean;
  readonly tokenId?: string;
  readonly attestation?: {
    readonly signature: Hex;
    readonly signer: Address;
    readonly domain: { name: string; version: string; chainId: number; verifyingContract?: Address };
    readonly message: {
      readonly vaultId: Hex;
      readonly emailHash: Hex;
      readonly claimingWallet: Address;
      readonly nonce: Hex;
      readonly expiresAt: string;
    };
  };
  readonly error?: string;
}

type Step =
  | "intro"
  | "connecting"
  | "fetching-status"
  | "ready-to-claim"
  | "requesting-attestation"
  | "submitting-claim"
  | "claimed"
  | "expired"
  | "error";

export function NokClaim(): JSX.Element {
  useDocumentHead("/nok-claim");
  const { nonce } = useParams<{ nonce: string }>();
  const { address } = useAccount();
  const gate = useWalletGate();
  const isConnected = gate.status === "connected";
  const { writeContractAsync } = useWriteContract();
  const { signTypedDataAsync } = useSignTypedData();

  const [step, setStep] = useState<Step>("intro");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [newTokenId, setNewTokenId] = useState<bigint | null>(null);

  // Auto-fetch status when the page mounts (read-only).
  useEffect(() => {
    if (!nonce) return;
    void (async () => {
      setStep("fetching-status");
      try {
        const r = await fetch(`${API_URL}/v1/nok/walkthrough-status/${nonce}`);
        const body = (await r.json()) as StatusResponse;
        if (!r.ok || body.error) {
          setError(body.error ?? `Status fetch failed (${r.status})`);
          setStep("error");
          return;
        }
        setStatus(body);
        if (body.status === "claimed") {
          setStep("claimed");
        } else if (body.status === "expired") {
          setStep("expired");
        } else {
          setStep("intro");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStep("error");
      }
    })();
  }, [nonce]);

  async function requestAttestationAndClaim(): Promise<void> {
    if (!nonce || !address) return;
    setStep("requesting-attestation");
    setError(null);
    try {
      const r = await fetch(`${API_URL}/v1/nok/claim/${nonce}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimingWallet: address }),
      });
      const body = (await r.json()) as AttestationResponse;
      if (!r.ok || body.error || !body.attestation) {
        setError(body.error ?? `Claim failed (${r.status})`);
        setStep("error");
        return;
      }
      // tokenId may be missing if the Form B response hasn't been
      // extended yet (TODO note). In that case we cannot submit on-chain.
      if (!body.tokenId) {
        setError("Server response is missing tokenId — Form B needs an update to look up the SBT id by emailHash. Once that's deployed, this page will complete the claim automatically. (Status confirmed valid; nothing to retry on your side right now.)");
        setStep("error");
        return;
      }

      // Submit to NoKLockEscrow.
      setStep("submitting-claim");
      const tokenId = BigInt(body.tokenId);
      const { signature, message } = body.attestation;
      const hash = await writeContractAsync({
        address: ESCROW_ADDR,
        abi: escrowAbi,
        functionName: "claimWithAttestation",
        args: [
          tokenId,
          address,
          message.nonce,
          BigInt(message.expiresAt),
          signature,
          HEIR_TOKEN_URI,
        ],
      });
      setTxHash(hash);
      setNewTokenId(tokenId);
      setStep("claimed");

      // 0.4.0 — Generate + auto-download the heir-claim envelope so the
      // heir carries an unambiguous, self-signed "I am a HEIR for this
      // vault" credential into /heir/restore (plan §D.5). manifestHash is
      // bytes32(0) here because the manifest itself is not known at
      // claim time — the envelope's primary purpose at this step is to
      // bind {vaultId, activationTokenId, heirWallet} to the heir's
      // signature so /heir/restore can detect heir-mode unambiguously.
      // Best-effort: failure is swallowed so a wallet that refuses to
      // sign the envelope doesn't roll back a successful claim.
      try {
        const env = await generateClaimEnvelope({
          vaultId: message.vaultId,
          activationTokenId: tokenId.toString(),
          manifestHash: ("0x" + "0".repeat(64)) as Hex,
          heirWallet: address,
          signTypedData: signTypedDataAsync,
        });
        const blob = new Blob([JSON.stringify(env, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const shortHash = message.vaultId.slice(2, 10);
        a.download = `noklock-claim-envelope-${shortHash}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch { /* envelope is best-effort; don't roll back a successful claim */ }
    } catch (e) {
      setError(humanizeTxError(e));
      setStep("error");
    }
  }

  if (!nonce) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="card space-y-3">
          <h1 className="text-2xl font-bold font-display"><span className="grad">Next-of-kin claim</span></h1>
          <p className="text-text-on-dark/90">
            This is the page a designated next-of-kin lands on to claim an inheritance — but it needs the
            <strong> unique link from the activation email</strong> to do anything. That link looks like
            <code className="mx-1 text-xs">noklock.app/nok-claim/&lt;your code&gt;</code> and only arrives by email
            <em> after</em> the person who designated you stops checking in past their grace period.
          </p>
          <div className="rounded-lg border border-bg-surface bg-bg-deepest/50 p-3 text-sm text-text-on-dark/85">
            <p className="font-bold mb-1">If you received an inheritance email</p>
            <p>Open it and click the claim link there — it carries your code. If you can't find the email, check spam; the link is valid for 30 days from when it was sent.</p>
          </div>
          <div className="rounded-lg border border-bg-surface bg-bg-deepest/50 p-3 text-sm text-text-on-dark/85">
            <p className="font-bold mb-1">If you're setting up your own plan</p>
            <p>This is what your heir will see when the time comes. To designate someone now, go to <Link to="/nok" className="text-accent-cyan hover:underline">Next-of-kin</Link>. To understand exactly what your heir does, read the <Link to="/heir" className="text-accent-cyan hover:underline">heir guide</Link>.</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link to="/heir" className="btn btn-primary">Read the heir guide</Link>
            <Link to="/manual" className="btn btn-secondary">Full app guide</Link>
            <Link to="/nok" className="btn btn-secondary">Designate a next-of-kin</Link>
          </div>
          <p className="text-xs text-text-muted">Reach us at <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-display">
          <span className="grad">Inheritance claim</span>
        </h1>
        <p className="text-text-on-dark/85 mt-2 max-w-2xl">
          Someone designated you as their next-of-kin through NoKLock. Their wallet has stopped checking in for the configured grace period, so the on-chain dead-man's switch has fired and you are now entitled to claim the inheritance trigger. This page walks you through the rest in a few simple steps.
        </p>
        <p className="text-xs text-text-muted mt-3">
          The thing you'll receive is a <strong>soulbound NFT (ERC-5192)</strong> — a non-transferable token minted to your wallet that proves on Polygon that you are the rightful heir. It cannot be sold, moved or seized. Together with the off-chain shares you and the original owner agreed on, plus the master password they shared with you, it lets you restore their vault.
        </p>

        {/* 0.2.0 — link to the public heir guide ABOVE the claim flow.
            First-time heirs almost certainly want context before clicking
            anything; the guide answers "is this real / what do I need /
            what if I don't have everything" before they sign anything. */}
        <div className="mt-4 p-3 rounded border border-amber-500/40 bg-amber-950/10 text-sm">
          <strong className="text-amber-300">First time here?</strong>{" "}
          <Link to="/heir" className="text-accent-cyan hover:underline font-semibold">Read the heir guide first →</Link>
          <span className="text-text-muted"> — 5 minute plain-language walkthrough: what just happened, is this real, what you need, step-by-step. No wallet required to read.</span>
          <div className="mt-2">
            <Link to="/manual" className="text-accent-cyan hover:underline text-xs">Also: full app user guide →</Link>
          </div>
        </div>
      </header>

      {/* Status banner */}
      {status?.vaultId && (
        <div className="card">
          <h2 className="font-bold font-display mb-2">Claim details</h2>
          <table className="text-sm w-full">
            <tbody>
              <tr><td className="text-text-muted pr-3 py-0.5">Vault</td><td className="font-mono break-all">{status.vaultId}</td></tr>
              <tr><td className="text-text-muted pr-3 py-0.5">Role</td><td className="font-mono">{status.role ?? "—"}</td></tr>
              <tr><td className="text-text-muted pr-3 py-0.5">Expires</td><td className="font-mono">{status.expiresAt ? new Date(status.expiresAt * 1000).toISOString().replace("T", " ").slice(0, 16) + "Z" : "—"}</td></tr>
              <tr><td className="text-text-muted pr-3 py-0.5">Status</td><td className="font-mono">{status.status}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Wallet step — ONE surface (connect buttons always live, incl. while restoring) */}
      {!isConnected && step !== "claimed" && step !== "expired" && (
        <WalletGateCard
          title="Step 1 — connect or create a wallet"
          note="If you already have a Polygon wallet (MetaMask, Rabby, Trust, etc.), connect it below. If you don't, install one first — your inheritance NFT goes to that wallet, so it should be a wallet only YOU control. We never see your wallet's private key."
        />
      )}

      {/* Ready to claim */}
      {isConnected && step !== "claimed" && step !== "expired" && step !== "submitting-claim" && step !== "requesting-attestation" && (
        <div className="card space-y-3">
          <h2 className="font-bold font-display">Step 2 — request &amp; submit your claim</h2>
          <p className="text-sm text-text-on-dark/85">
            One button does it all: NoKLock's server signs a time-limited cryptographic statement that proves you are the heir for this specific email, your wallet sends that statement to the on-chain escrow contract, and the escrow burns the placeholder NFT and mints a fresh one to you. Total: one transaction, a few cents in gas.
          </p>
          <p className="text-xs text-text-muted">
            Wallet to receive: <span className="font-mono">{address}</span>
          </p>
          <button className="btn btn-primary" onClick={() => void requestAttestationAndClaim()}>
            Claim my inheritance NFT
          </button>
        </div>
      )}

      {/* Submitting */}
      {(step === "requesting-attestation" || step === "submitting-claim") && (
        <div className="card text-sm text-text-on-dark/85">
          {step === "requesting-attestation" && "Asking the server to sign your claim attestation…"}
          {step === "submitting-claim" && "Submitting the claim to the on-chain escrow… (approve the tx in your wallet)"}
        </div>
      )}

      {/* Claimed */}
      {step === "claimed" && (
        <div className="card border border-accent-teal/40 bg-accent-teal/5 space-y-3">
          <h2 className="font-bold font-display text-accent-teal">✓ Claim succeeded</h2>
          <p className="text-sm text-text-on-dark/90">
            Your soulbound inheritance NFT is now in your wallet. The chain has recorded that you are the rightful heir for this vault — this cannot be undone or taken from you.
          </p>
          {txHash && (
            <p className="text-xs text-text-muted">
              Transaction: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan underline font-mono">{txHash.slice(0, 10)}…{txHash.slice(-6)}</a>
            </p>
          )}
          {newTokenId !== null && (
            <p className="text-xs text-text-muted">
              Your NFT token id: <span className="font-mono">{newTokenId.toString()}</span>
            </p>
          )}
          <div className="border-t border-bg-surface pt-3 mt-2 text-sm text-text-on-dark/90 space-y-2">
            <p className="font-bold">What to do next:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Collect the off-chain shares (the share files or share URLs) the original owner left with you OR stored with you ahead of time.</li>
              <li>Gather the <strong>master password</strong> the owner shared with you. This is the single key that decrypts the vault. NoKLock never had it.</li>
              <li>Open <Link to="/heir/restore" className="text-accent-cyan underline font-semibold">Continue to heir restore (M-of-N quorum required) →</Link>, drop your <code className="font-mono">claim-envelope.json</code> (just auto-downloaded), drop the share files, type the master password.</li>
            </ol>
            <p className="text-xs text-text-muted mt-2">
              The auto-downloaded <code className="font-mono">claim-envelope.json</code> is your signed claim — you drop it on the next page to vote toward the M-of-N quorum. If multiple heirs were designated, the vault stays locked until enough of them have each cast a vote; the heir-restore page shows the live tally.
            </p>
          </div>
        </div>
      )}

      {/* Expired */}
      {step === "expired" && (
        <div className="card border border-danger/40 bg-danger/5 space-y-2">
          <h2 className="font-bold font-display text-danger">Claim link expired</h2>
          <p className="text-sm text-text-on-dark/90">
            The activation link for this claim has expired. The original owner of the vault (or a co-NoK) can reach out to NoKLock support to re-issue a fresh activation email. Reach <a href="mailto:hello@noklock.app" className="text-accent-cyan underline">hello@noklock.app</a> with the original email you received.
          </p>
        </div>
      )}

      {/* Error */}
      {step === "error" && error && (
        <div className="card border border-danger/40 bg-danger/5 space-y-2">
          <h2 className="font-bold font-display text-danger">Something went wrong</h2>
          <p className="text-sm text-text-on-dark/90 break-words">{error}</p>
          <p className="text-xs text-text-muted">
            Reach <a href="mailto:hello@noklock.app" className="text-accent-cyan underline">hello@noklock.app</a> if this persists.
          </p>
        </div>
      )}

      <PageHelp
        docsId="nok-claim-docs"
        buttonLabel="What is this page? Plain-English explainer"
        heading="About this claim page"
        entries={[
          {
            title: "What just happened — why am I here?",
            body: (
              <p>
                The person who designated you as their next-of-kin (NoK) on NoKLock has stopped checking in. NoKLock's dead-man's switch — a Chainlink Automation upkeep that runs autonomously on the Polygon blockchain — has fired. That's a deliberate, predictable mechanism, not a glitch. The vault owner set it up so that <em>if</em> they ever became absent (death, incapacity, lost wallet), you (and any other designated heirs) would be cryptographically empowered to inherit. You're at that step now.
              </p>
            ),
          },
          {
            title: "What is a soulbound NFT and why is it the inheritance proof?",
            body: (
              <>
                <p>
                  A regular NFT is like a deed — it can be sold, transferred, or stolen from your wallet. A <strong>soulbound</strong> NFT (formally: ERC-5192) is a special kind that <em>cannot leave the wallet it's minted to</em>. Once it's yours, it's yours — no one can buy it, take it, or move it.
                </p>
                <p>
                  This makes it the perfect way to prove on-chain that you're the rightful heir. NoKLock uses ERC-5192 for the inheritance trigger — a rare-in-production use of the standard, but exactly what the standard was designed for. You can verify the contract on PolygonScan.
                </p>
              </>
            ),
          },
          {
            title: "What does NoKLock actually do during this claim?",
            body: (
              <>
                <p>
                  Two pieces. (1) Off-chain: NoKLock's server signs a short, time-limited statement (an EIP-712 typed-data attestation) that says "the wallet you're connected with is the rightful heir for the email this nonce belongs to." The server can only sign this if the dead-man's switch has fired AND the activation email link belongs to you. (2) On-chain: your wallet sends that signed statement to the escrow contract, which verifies the signature, burns the placeholder NFT that was held in escrow, and mints a fresh soulbound NFT directly to you.
                </p>
                <p>
                  The server cannot mint an NFT to anyone else for this nonce — the nonce is one-use, and the attestation is bound to the wallet that submits it. Even if NoKLock's server were compromised, an attacker still couldn't redirect inheritance to themselves without controlling YOUR wallet AND being inside the small claim window.
                </p>
              </>
            ),
          },
          {
            title: "What about my master password / the vault shares?",
            body: (
              <p>
                NoKLock never had the master password and never had the vault shares. Those live with you and the people the original owner trusted. The NFT you receive here is the <em>permission</em> — but to actually decrypt and read the vault contents (seed phrases, sealed letters, documents), you ALSO need the shares + the master password the owner shared with you ahead of time. If you don't have those, talk to whoever else the owner designated; in a properly-set-up vault, the shares were distributed across multiple trusted parties.
              </p>
            ),
          },
          {
            title: "Can I delete this and back out?",
            body: (
              <p>
                Yes — if you don't want this inheritance, just close this tab and don't submit the claim. The activation link will expire on its own. (The escrow's contract owner can also revoke a binding administratively if there's been a mistake; reach <a href="mailto:hello@noklock.app" className="text-accent-cyan underline">hello@noklock.app</a> if that applies.)
              </p>
            ),
          },
        ]}
      />
    </div>
  );
}
