// @version 0.7.0 @date 2026-06-11
// 0.7.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.8):
//         NokSection reconnecting + disconnected → ONE <WalletGateCard/>.
// @version 0.6.0 @date 2026-06-05
// 0.6.0 — Daniel 2026-06-05: Migrate NokSection off the useWalletSettling +
//          WalletReconnecting shim onto useWalletGate directly. The page
//          chrome (Header / breadcrumb / vault title / ShareUrls / Passkey /
//          ForgetVault) renders unconditionally regardless of wallet state
//          so the user always sees the vault they navigated to. Only the
//          NokSection gates: gate.status === 'reconnecting' renders an
//          inline "Reconnecting your wallet…" indicator INSIDE the section
//          (not a full subtree replacement); gate.status === 'disconnected'
//          renders the existing ConnectWallet card; gate.status ===
//          'connected' renders the full NoK list + add-NoK UI. Mobile
//          unaffected — the change is a render-pattern swap, no layout
//          breakpoints touched.
// 0.5.0 — Daniel 2026-06-02: PasskeySection gates on the 24h auth-method
//          cool-down (round-3 §1.B + round-4 §1.B email-takeover
//          hardening). When `useAuthCooldown(address).status.inCooldown`
//          is true (because the user just added/removed an auth method
//          on this wallet) we render a disabled banner with the change
//          reason + a "contact us" prompt, and refuse to surface the
//          Add/Replace/Remove passkey controls until the 24h has
//          elapsed. The hook short-circuits with no network call when
//          address is null. Matched gates landed on UsdcLifetimePayment
//          + KeyExportCeremony in this same release.
// 0.4.0 — Daniel 2026-06-02: Add-passkey flow now mirrors Enrol/Restore
//          airgap engagement pattern. The PasskeySection add path derives
//          the master key from the master password and calls wrapMaster —
//          handling sensitive material — but in 0.3.0 it did NOT engage
//          the airgap first. Restore.tsx and Enrol.tsx both engage airgap
//          before touching the master; parity was broken. This release
//          adds an explicit "Go offline before adding passkey" step BEFORE
//          the master-password input (gated on `passkeyAirgapReady`), and
//          calls `leaveAirgap()` in finally on submit completion so normal
//          network access is restored. Remove path is UNCHANGED — removal
//          just clears the cached envelope, no master material touched, so
//          no airgap engagement is required.
// 0.3.0 — Daniel 2026-06-02: Add/Remove passkey now available on the per-vault
//          management surface (not just at initial enrol-time). Symmetric with
//          the optional passkey step in Enrol.tsx 1.7.0+. New PasskeySection
//          renders between ShareUrls and NoK:
//            - "Add passkey" gated by isPasskeySupported() — disabled with an
//              honest tooltip when WebAuthn isn't available, or when an
//              envelope already exists for this vault (the "already wrapped"
//              card then offers Replace + Remove).
//            - Add flow asks for this vault's manifest.json (so we have the
//              KDF params + a share descriptor to AEAD-verify against) and
//              the master password. We Argon2id-derive the master, AEAD-decrypt
//              one share descriptor (with the v2/v3-correct per-share key + AAD
//              when the manifest opts in) — that's the password check, just like
//              restore. On success we enrollPasskey → wrapMaster → cache the
//              envelope locally → synchronously wipe the master Uint8Array in
//              the SAME finally block (mirroring enrol-pipeline 0.5.0 hygiene).
//            - "Remove passkey" clears the cached envelope only; the platform
//              credential stays (no API to delete it programmatically), but
//              without the envelope it decrypts nothing.
// 0.2.0 — Daniel: (1) "Forget this vault" — confirm-gated local delete
//   (removeVaultFromIndex + forgetVaultShareUrls), honest caveat that it's
//   this-browser-only (cloud shares + on-chain NoKs untouched; Restore still
//   works). (2) Add-NoK now offers the EMAIL (Hybrid-E) path too via
//   useEmailNokMint — wallet|email toggle, matching /nok.
// @version 0.1.0 @date 2026-05-19
// /vault/:vaultId — one vault, everything for it in one focused place:
// its share URLs (edit/forget) AND its next-of-kin (list/revoke/add).
//
// Why this exists (Daniel): the Settings share-URL list was one flat
// dump of every vault (unusable with many), and adding a NoK to an
// existing vault meant hand-pasting the vault ID + manifest hash on
// /nok. Here both are scoped to ONE vault and the "Add NoK" form is
// PREFILLED — vaultId from the route, manifestHash from the local index
// (stored at enrol, Enrol 1.8.0). Pre-1.8.0 vaults have no stored hash:
// drop that vault's manifest.json and we derive it (same hash the SBT
// mint uses). The master-password path is unaffected by any of this.
//
// vaultId parity: the SBT stores asBytes32(vaultId); useNokList returns
// that bytes32. So per-vault NoK filtering compares asBytes32(localId)
// to entry.vaultId (both lower-cased). asBytes32 is reused from
// lib/sbt-contract (NOT re-implemented).

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import { manifest as manifestLib, kdf, aead } from "@soulchain/crypto-core";
import type { VaultManifest } from "@soulchain/crypto-core";
import { readVaults, removeVaultFromIndex, KIND_LABEL, KIND_BADGE, type VaultEntry } from "./Vaults.js";
import {
  getShareUrls,
  setShareUrl,
  forgetVaultShareUrls,
  type StoredShareUrls,
} from "../lib/shareUrls.js";
import { asBytes32 } from "../lib/sbt-contract.js";
import { parseManifestJson } from "../lib/restore-pipeline.js";
import { useNokList } from "../hooks/useNokList.js";
import { useNokMint } from "../hooks/useNokMint.js";
import { useEmailNokMint } from "../hooks/useEmailNokMint.js";
import { NokRow } from "../components/NokRow.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { useAuthCooldown, formatAuthCooldownChange } from "../hooks/useAuthCooldown.js";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { humanizeTxError } from "../lib/txError.js";
import {
  isPasskeySupported,
  enrollPasskey,
  wrapMaster,
  cacheEnvelopeLocal,
  loadEnvelopeLocal,
  removeEnvelopeLocal,
  envelopeToJson,
  type PasskeyEnvelope,
} from "../lib/webauthn.js";
import { LocalFileAdapter } from "@soulchain/storage-adapters";
import {
  enterAirgap,
  leaveAirgap,
  isAirgapped,
  isBrowserOnline,
  blockedFetchCount,
  subscribeAirgap,
} from "../lib/airgap-manager.js";

function manifestHashHex(m: unknown): string {
  const bytes = manifestLib.manifestHash(m as Parameters<typeof manifestLib.manifestHash>[0]);
  return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** asBytes32 can throw on non-hex / >32-byte ids — never crash the page. */
function vaultKey(id: string): string | null {
  try {
    return asBytes32(id).toLowerCase();
  } catch {
    return null;
  }
}

export function VaultDetail(): JSX.Element {
  const { vaultId = "" } = useParams<{ vaultId: string }>();
  const gate = useWalletGate();

  const vault = useMemo<VaultEntry | undefined>(
    () => readVaults().find((v) => v.vaultId === vaultId),
    [vaultId],
  );

  if (!vault) {
    return (
      <div className="card max-w-xl mx-auto text-center space-y-3 mt-8">
        <h1 className="text-2xl font-bold font-display"><span className="grad">Vault not on this device</span></h1>
        <p className="text-text-on-dark/80 text-sm">
          This browser has no record of vault <code className="font-mono break-all">{vaultId}</code>.
          That's expected if you enrolled it on another device — NoKLock keeps no
          server-side record. You don't need this page to recover: use{" "}
          <Link to="/restore" className="text-accent-cyan underline">Restore</Link> with your
          shares + master password on any device.
        </p>
        <Link to="/vaults" className="btn btn-secondary inline-block">← All vaults</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="card">
        <Link to="/vaults" className="text-sm text-accent-cyan hover:underline">← All vaults</Link>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`tier-badge ${KIND_BADGE[vault.kind]}`}>{KIND_LABEL[vault.kind]}</span>
          <h1 className="text-2xl font-bold font-display">{vault.label}</h1>
        </div>
        <div className="text-xs text-text-muted font-mono mt-2 break-all">vault {vault.vaultId}</div>
        <div className="text-sm text-text-on-dark/80 mt-1">
          {vault.summary} · created {new Date(vault.createdAt * 1000).toLocaleDateString()}
        </div>
        <div className="mt-3">
          <Link to={`/restore?vault=${vault.vaultId}`} className="btn btn-secondary text-xs">Restore this vault</Link>
        </div>
      </header>

      <ShareUrlsSection vaultId={vault.vaultId} />

      <PasskeySection vaultId={vault.vaultId} label={vault.label} />

      <NokSection
        vault={vault}
        gateStatus={gate.status}
      />

      <ForgetVaultSection vaultId={vault.vaultId} label={vault.label} />
    </div>
  );
}

// ---- Forget vault (local-only) --------------------------------------

function ForgetVaultSection({ vaultId, label }: { readonly vaultId: string; readonly label: string }): JSX.Element {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  function forget(): void {
    removeVaultFromIndex(vaultId);
    forgetVaultShareUrls(vaultId);
    navigate("/vaults");
  }
  return (
    <div className="card border-danger/30">
      <h2 className="font-bold font-display mb-1 text-danger/90">Forget this vault</h2>
      <p className="text-sm text-text-on-dark/80">
        Removes this vault from <strong>this browser's</strong> list only. It does <strong>not</strong> delete the
        encrypted share files in your clouds, and does <strong>not</strong> revoke any on-chain next-of-kin (revoke
        those above first if you want them gone). You can still restore it on any device via{" "}
        <Link to="/restore" className="text-accent-cyan underline">Restore</Link> with your shares + master password.
      </p>
      {!confirming ? (
        <button onClick={() => setConfirming(true)} className="btn btn-secondary text-sm mt-3 text-danger border-danger/40">
          Forget &ldquo;{label}&rdquo;…
        </button>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-text-on-dark">Remove from this browser?</span>
          <button onClick={forget} className="text-sm px-3 py-1.5 rounded bg-danger/20 text-danger font-semibold hover:opacity-80">Yes, forget it</button>
          <button onClick={() => setConfirming(false)} className="text-sm px-3 py-1.5 rounded bg-bg-surface text-text-on-dark/80 hover:opacity-80">Cancel</button>
        </div>
      )}
    </div>
  );
}

// ---- Share URLs (this vault only) -----------------------------------

// 0.x (Daniel 2026-06-15) — per-vault "uploaded" checklist state. Pure local
// (localStorage), zero PII, never sent anywhere. Lets the owner track WHICH
// shares they've actually pushed to a cloud location vs still pending — kills
// the "did I finish distributing?" ambiguity on the heaviest manual step.
function uploadedKey(vaultId: string): string { return `noklock.share-uploaded.${vaultId}`; }
function readUploaded(vaultId: string): Set<number> {
  try {
    if (typeof localStorage === "undefined") return new Set();
    const raw = localStorage.getItem(uploadedKey(vaultId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? new Set(arr.filter((x): x is number => typeof x === "number")) : new Set();
  } catch { return new Set(); }
}
function writeUploaded(vaultId: string, s: Set<number>): void {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(uploadedKey(vaultId), JSON.stringify([...s])); } catch { /* ignore */ }
}

function ShareUrlsSection({ vaultId }: { readonly vaultId: string }): JSX.Element {
  const [data, setData] = useState<StoredShareUrls | undefined>(() => getShareUrls(vaultId));
  const [editing, setEditing] = useState(false);
  const [uploaded, setUploaded] = useState<Set<number>>(() => readUploaded(vaultId));

  function onEdit(shareIndex: number, url: string): void {
    setShareUrl(vaultId, shareIndex, url);
    setData(getShareUrls(vaultId));
  }
  function onForget(): void {
    if (!confirm("Forget the URLs for this vault? Restore will need them re-pasted.")) return;
    forgetVaultShareUrls(vaultId);
    setData(getShareUrls(vaultId));
  }
  function toggleUploaded(shareIndex: number): void {
    setUploaded((prev) => {
      const next = new Set(prev);
      if (next.has(shareIndex)) next.delete(shareIndex); else next.add(shareIndex);
      writeUploaded(vaultId, next);
      return next;
    });
  }

  const total = data?.urls.length ?? 0;
  const doneCount = data ? data.urls.filter((u) => uploaded.has(u.shareIndex)).length : 0;
  const allDone = total > 0 && doneCount === total;

  return (
    <section className="card">
      <div className="flex justify-between items-baseline flex-wrap gap-2 mb-2">
        <h2 className="font-bold font-display">Share distribution</h2>
        {data && data.urls.length > 0 && (
          <div className="flex gap-2">
            <button className="btn btn-secondary text-xs" onClick={() => setEditing((e) => !e)}>
              {editing ? "Done" : "Edit"}
            </button>
            <button className="btn btn-secondary text-xs text-danger" onClick={onForget}>Forget</button>
          </div>
        )}
      </div>
      <p className="text-text-muted text-xs mb-3">
        The cloud links you pasted at enrolment, plus a checklist of which share files you've actually uploaded. Both live only in this browser — they never leave your device. Tick each off as you upload it so you can see at a glance what's still pending.
      </p>
      {!data || data.urls.length === 0 ? (
        <p className="text-text-muted text-sm">No share URLs saved on this device for this vault.</p>
      ) : (
        <div className="space-y-1">
          <div className={`text-xs mb-1 font-medium ${allDone ? "text-accent-green" : "text-amber-300"}`}>
            Distribution: {doneCount}/{total} uploaded{allDone ? " — all shares distributed ✓" : " — tick each when it's in its cloud location"}
          </div>
          {data.urls.map((u) => (
            <div key={u.shareIndex} className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5 shrink-0 cursor-pointer" title="Mark this share as uploaded">
                <input type="checkbox" checked={uploaded.has(u.shareIndex)} onChange={() => toggleUploaded(u.shareIndex)} />
                <span className="font-mono text-text-muted">share {u.shareIndex}:</span>
              </label>
              {editing ? (
                <input
                  type="url"
                  value={u.url}
                  onChange={(e) => onEdit(u.shareIndex, e.target.value)}
                  className="flex-1 bg-bg-deepest border border-bg-surface rounded px-2 py-1 font-mono text-xs"
                  spellCheck={false}
                />
              ) : (
                <a href={u.url} target="_blank" rel="noopener noreferrer" className={`font-mono hover:text-accent-cyan truncate ${uploaded.has(u.shareIndex) ? "text-text-on-dark/80" : "text-text-on-dark/80"}`}>
                  {u.url || <span className="text-text-muted italic">(empty)</span>}
                </a>
              )}
            </div>
          ))}
          <div className="text-[11px] text-text-muted pt-1">Updated {new Date(data.updatedAt).toLocaleString()}</div>
        </div>
      )}
    </section>
  );
}

// ---- Next-of-kin (this vault only) ----------------------------------

function NokSection({
  vault,
  gateStatus,
}: {
  readonly vault: VaultEntry;
  readonly gateStatus: "connected" | "reconnecting" | "disconnected";
}): JSX.Element {
  const { entries, loading, error: listError, refetch } = useNokList();
  const mint = useNokMint();
  const emailMint = useEmailNokMint();
  const [mode, setMode] = useState<"wallet" | "email">("wallet");
  const [nokWallet, setNokWallet] = useState("");
  const [nokEmail, setNokEmail] = useState("");
  const [droppedHash, setDroppedHash] = useState<string | null>(null);
  // 0.4.0 — whether the dropped manifest carries an M-of-N quorumPolicy. Drives
  // whether each heir ALSO gets a Voting token (single/no-quorum heir =
  // Activation only — one token, one pop-up).
  const [droppedQuorum, setDroppedQuorum] = useState(false);
  const [dropMsg, setDropMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const key = vaultKey(vault.vaultId);
  const mine = entries.filter((e) => key !== null && e.vaultId.toLowerCase() === key);
  const effectiveHash = vault.manifestHash ?? droppedHash;
  const walletValid = /^0x[a-fA-F0-9]{40}$/.test(nokWallet);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nokEmail.trim());

  async function onManifestFile(f: File): Promise<void> {
    setDropMsg(null);
    try {
      const m = parseManifestJson(await f.text());
      if (m.vaultId !== vault.vaultId) {
        setDropMsg(`That manifest is for a different vault (${m.vaultId.slice(0, 12)}…). Use this vault's manifest.json.`);
        return;
      }
      setDroppedHash(manifestHashHex(m));
      setDroppedQuorum(!!m.quorumPolicy);
      setDropMsg(
        m.quorumPolicy
          ? `Manifest verified — this vault uses ${m.quorumPolicy.M}-of-${m.quorumPolicy.N} quorum, so each heir also gets a Voting token. Add a next-of-kin below.`
          : "Manifest verified — manifest hash derived. You can add a next-of-kin below.",
      );
    } catch (e) {
      setDropMsg(`Couldn't read that file as a manifest: ${(e as Error).message}`);
    }
  }

  async function addNok(): Promise<void> {
    if (!effectiveHash) return;
    if (mode === "wallet") {
      if (!walletValid) return;
      await mint.mint({ nokWallet: nokWallet as Address, vaultId: vault.vaultId, manifestHash: effectiveHash, quorum: droppedQuorum });
      if (mint.step !== "error") { setNokWallet(""); setTimeout(() => void refetch(), 1500); }
    } else {
      if (!emailValid) return;
      await emailMint.mint({ email: nokEmail.trim(), vaultId: vault.vaultId, manifestHash: effectiveHash, quorum: droppedQuorum });
      if (emailMint.step !== "error") { setNokEmail(""); setTimeout(() => void refetch(), 1500); }
    }
  }

  return (
    <section className="card">
      <h2 className="font-bold font-display mb-1">Next-of-kin for this vault</h2>
      <p className="text-text-muted text-xs mb-3">
        Each next-of-kin is bound on-chain to <em>this</em> vault. They inherit it via the dead-man's switch; the master password is still what turns the released shares back into your data.
      </p>

      {gateStatus !== "connected" && (
        <WalletGateCard note="Connect your wallet to view or add next-of-kin for this vault." />
      )}

      {gateStatus === "connected" && (
        <>
          {listError && <div className="text-rose-400 text-sm mb-3 break-words">{listError}</div>}
          {loading ? (
            <p className="text-text-muted text-sm">Reading on-chain…</p>
          ) : mine.length === 0 ? (
            <p className="text-text-muted text-sm mb-3">No next-of-kin designated for this vault yet.</p>
          ) : (
            <div className="space-y-2 mb-3">
              {mine.map((e) => (
                <NokRow key={`${e.nokWallet}-${e.vaultId}`} entry={e} onRevoked={() => void refetch()} />
              ))}
            </div>
          )}

          <div className="border-t border-bg-surface pt-4 mt-2">
            <h3 className="font-bold font-display text-sm mb-2">Add a next-of-kin to this vault</h3>

            {effectiveHash ? (
              <p className="text-xs text-accent-green mb-2">Vault ID + manifest hash are filled in for you — no copying.</p>
            ) : (
              <div className="mb-3 p-3 rounded bg-bg-surface border border-bg-surface text-xs text-text-on-dark/80">
                This vault predates manifest-hash storage. Drop this vault's <code>manifest.json</code> so we can derive its hash (the same one the contract needs):
                <div className="mt-2">
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void onManifestFile(f); e.target.value = ""; }}
                  />
                  <button className="btn btn-secondary text-xs" onClick={() => fileRef.current?.click()}>Choose manifest.json</button>
                </div>
                {dropMsg && <div className="mt-2 text-text-muted">{dropMsg}</div>}
              </div>
            )}

            <div className="flex gap-2 mb-3 flex-wrap text-sm">
              <button onClick={() => setMode("wallet")} className={`px-3 py-1.5 rounded border ${mode === "wallet" ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-semibold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}>Wallet (heir already has one)</button>
              <button onClick={() => setMode("email")} className={`px-3 py-1.5 rounded border ${mode === "email" ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-semibold" : "bg-bg-surface border-bg-surface text-text-on-dark/80"}`}>Email (Hybrid-E — no wallet yet)</button>
            </div>

            {mode === "wallet" ? (
              <label className="block text-xs">
                <span className="text-text-muted">Next-of-kin wallet address</span>
                <input
                  type="text"
                  value={nokWallet}
                  onChange={(e) => setNokWallet(e.target.value)}
                  placeholder="0x…"
                  className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-xs"
                  spellCheck={false}
                />
              </label>
            ) : (
              <label className="block text-xs">
                <span className="text-text-muted">Next-of-kin email address</span>
                <input
                  type="email"
                  value={nokEmail}
                  onChange={(e) => setNokEmail(e.target.value)}
                  placeholder="heir@example.com"
                  className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-xs"
                  spellCheck={false}
                />
                <span className="block text-[11px] text-text-muted mt-1">Stored as a salted keccak hash on-chain; the plaintext stays in NoKLock's encrypted server table only long enough to send the activation email after the dead-man fires. They make a wallet at claim time.</span>
              </label>
            )}

            <div className="flex gap-3 mt-3 items-center">
              {mode === "wallet" ? (
                <button
                  className="btn btn-primary text-sm"
                  disabled={!walletValid || !effectiveHash || (mint.step !== "idle" && mint.step !== "done" && mint.step !== "error")}
                  onClick={() => void addNok()}
                >
                  {mint.step === "minting-activation" ? "Minting heir token…"
                    : mint.step === "minting-voting" ? "Minting voting token…"
                    : mint.step === "done" ? "Added ✓"
                    : droppedQuorum ? "Add next-of-kin (2 SBTs)" : "Add next-of-kin (1 SBT)"}
                </button>
              ) : (
                <button
                  className="btn btn-primary text-sm"
                  disabled={!emailValid || !effectiveHash || (emailMint.step !== "idle" && emailMint.step !== "done" && emailMint.step !== "error")}
                  onClick={() => void addNok()}
                >
                  {emailMint.step === "registering-email" ? "Registering email…"
                    : emailMint.step === "minting-activation" ? "Minting heir token…"
                    : emailMint.step === "minting-voting" ? "Minting voting token…"
                    : emailMint.step === "done" ? "Added ✓"
                    : droppedQuorum ? "Register email + mint (2 SBTs)" : "Register email + mint (1 SBT)"}
                </button>
              )}
              {((mode === "wallet" && mint.step !== "idle") || (mode === "email" && emailMint.step !== "idle")) && (
                <button className="btn btn-secondary text-sm" onClick={() => (mode === "wallet" ? mint.reset() : emailMint.reset())}>Reset</button>
              )}
            </div>

            {mode === "wallet" && (mint.txHashes.activation || mint.txHashes.voting) && (
              <div className="text-xs text-text-muted mt-3 space-y-0.5 font-mono">
                {mint.txHashes.activation && <div>activation: <Tx h={mint.txHashes.activation} /></div>}
                {mint.txHashes.voting && <div>voting: <Tx h={mint.txHashes.voting} /></div>}
              </div>
            )}
            {mode === "email" && emailMint.step === "done" && (
              <div className="text-xs text-accent-green mt-3">Email registered + SBTs escrowed. Your heir gets a claim link only if the dead-man's switch fires.</div>
            )}
            {mode === "wallet" && mint.error && <div className="text-sm text-rose-400 mt-2 break-words">{humanizeTxError(mint.error)}</div>}
            {mode === "email" && emailMint.error && <div className="text-sm text-rose-400 mt-2 break-words">{humanizeTxError(emailMint.error)}</div>}
          </div>
        </>
      )}
    </section>
  );
}

function Tx({ h }: { readonly h: `0x${string}` }): JSX.Element {
  return (
    <a href={`https://polygonscan.com/tx/${h}`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">
      {h.slice(0, 10)}…{h.slice(-6)}
    </a>
  );
}

// ---- Passkey (this vault only) -------------------------------------
//
// 0.4.0 (2026-06-02): Add-passkey now mirrors Enrol/Restore airgap engagement
// pattern. The master is derived in this component; if any background fetch
// fired during that window, the master could leak. Now gated.
//   - A "Go offline before adding passkey" step is rendered BEFORE the
//     master-password input. Live online/offline detection (subscribed to
//     the window online/offline events), live blocked-fetch counter, primary
//     "I am offline — engage airgap" button (gated on isBrowserOnline()
//     === false), secondary "Skip physical disconnect — engage software
//     airgap only" button. Both call enterAirgap() then set
//     passkeyAirgapReady=true.
//   - The master-password input + Add button is gated on passkeyAirgapReady.
//     Before airgap engaged → airgap card renders; after → existing add UI.
//   - On submit completion (success OR error), leaveAirgap() is called in
//     finally to restore normal network access. Mirrors Enrol's pattern.
//   - Remove path is UNCHANGED — remove just clears the cached envelope, no
//     master material touched. Remove button stays available without airgap
//     engagement.
//
// 0.3.0 — Daniel 2026-06-02: Symmetric with the optional passkey step in
// Enrol.tsx 1.7.0+. Lets the owner add (or replace, or remove) the WebAuthn
// passkey-unlock sidecar for an existing vault, on the management surface
// rather than only at enrol time. Cardinal invariant unchanged: passkey is
// additive convenience — the master password remains the sole canonical
// recovery + next-of-kin inheritance secret.
//
// Verification (the "is this really the password?" check) does NOT require
// share files — the manifest's per-share descriptors already carry the AEAD
// ciphertext + tag of each encrypted share. We Argon2id-derive the master,
// HKDF-extract (for v2/v3 baselines) or use master directly (v1), derive the
// per-share AEAD key, build the same vault-bound AAD that enrol used, and
// AEAD-decrypt the first descriptor. If the tag verifies, the password is
// correct — same authoritative check the restore pipeline does.

type PkUiState = "idle" | "verifying" | "enrolling" | "wrapping" | "done" | "error";

function PasskeySection({ vaultId, label }: { readonly vaultId: string; readonly label: string }): JSX.Element {
  const supported = isPasskeySupported();
  const [envelope, setEnvelope] = useState<PasskeyEnvelope | null>(() => loadEnvelopeLocal(vaultId));
  const [open, setOpen] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  // 0.5.0 — 24h cool-down gate (round-3 §1.B + round-4 §1.B). When a
  // recent auth-method change is in cool-down, refuse to surface the
  // add/replace/remove controls — an attacker who slipped a recovery
  // channel change through must not be able to immediately add a passkey
  // before the legitimate owner reads the broadcast email and revokes.
  const { address } = useAccount();
  const { status: cooldown } = useAuthCooldown(address ?? null);

  function refreshEnvelope(): void {
    setEnvelope(loadEnvelopeLocal(vaultId));
  }

  function onRemove(): void {
    removeEnvelopeLocal(vaultId);
    setConfirmingRemove(false);
    refreshEnvelope();
  }

  if (cooldown.inCooldown) {
    const untilIso =
      typeof cooldown.until === "number"
        ? new Date(cooldown.until * 1000).toLocaleString()
        : "—";
    const reason =
      cooldown.change !== null
        ? formatAuthCooldownChange(cooldown.change)
        : "an auth method was added";
    return (
      <section className="card border-amber-500/40 bg-amber-900/10">
        <h2 className="font-bold font-display mb-1">Passkey unlock — locked (24h)</h2>
        <p className="text-sm text-text-on-dark/85">
          24h security cool-down active — last change at {untilIso}. Reason: {reason}. If
          this wasn't you, contact us.
        </p>
        <p className="text-xs text-text-muted mt-2">
          Add / replace / remove passkey is disabled until the cool-down lifts. This gate
          protects against an attacker pivoting ownership immediately after slipping a
          recovery-channel change through.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="flex justify-between items-baseline flex-wrap gap-2 mb-1">
        <h2 className="font-bold font-display">Passkey unlock</h2>
        {envelope && (
          <span className="tier-badge bg-accent-green/20 text-accent-green border border-accent-green/30">enabled</span>
        )}
      </div>
      <p className="text-text-muted text-xs mb-3">
        Optional second unlock path on this device — Touch ID, Face ID, Windows Hello, or a hardware key.
        Master password is still the canonical recovery + next-of-kin inheritance secret; the passkey just
        wraps an encrypted copy of your unlocked master so you don't have to re-type the password on the
        devices you own. It is NEVER the only way in.
      </p>

      {envelope ? (
        <div className="space-y-3">
          <div className="text-sm text-text-on-dark/80">
            This vault already has a passkey envelope cached on this device — next unlock will offer the passkey first.
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn btn-secondary text-xs"
              onClick={() => { setOpen((v) => !v); setConfirmingRemove(false); }}
              disabled={!supported}
              title={!supported ? "Your browser/device does not support WebAuthn passkeys" : undefined}
            >
              {open ? "Cancel" : "Replace passkey"}
            </button>
            {!confirmingRemove ? (
              <button
                className="btn btn-secondary text-xs text-danger border-danger/40"
                onClick={() => { setConfirmingRemove(true); setOpen(false); }}
              >
                Remove passkey
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-text-on-dark/80">
                  Remove passkey — restored vault will require master password only?
                </span>
                <button onClick={onRemove} className="text-sm px-3 py-1.5 rounded bg-danger/20 text-danger font-semibold hover:opacity-80">
                  Yes, remove
                </button>
                <button onClick={() => setConfirmingRemove(false)} className="text-sm px-3 py-1.5 rounded bg-bg-surface text-text-on-dark/80 hover:opacity-80">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            className="btn btn-primary text-sm"
            onClick={() => setOpen((v) => !v)}
            disabled={!supported}
            title={!supported ? "Your browser/device does not support WebAuthn passkeys" : undefined}
          >
            {open ? "Cancel" : "Add passkey"}
          </button>
          {!supported && (
            <p className="text-xs text-text-muted">
              WebAuthn isn't available here. Master password unlock is unaffected.
            </p>
          )}
        </div>
      )}

      {open && supported && (
        <div className="mt-4 pt-4 border-t border-bg-surface">
          <AddPasskeyForm
            vaultId={vaultId}
            label={label}
            onDone={() => { setOpen(false); refreshEnvelope(); }}
          />
        </div>
      )}
    </section>
  );
}

function AddPasskeyForm({
  vaultId,
  label,
  onDone,
}: {
  readonly vaultId: string;
  readonly label: string;
  readonly onDone: () => void;
}): JSX.Element {
  const [manifest, setManifest] = useState<VaultManifest | null>(null);
  const [manifestMsg, setManifestMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [state, setState] = useState<PkUiState>("idle");
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // 0.4.0 — Airgap engagement gate (parity with Restore.tsx 0.13.0+ and
  // Enrol.tsx). The master-password input + Add button is gated on
  // `passkeyAirgapReady`. Before airgap engaged we render the airgap card;
  // after, the existing add-passkey UI.
  const [passkeyAirgapReady, setPasskeyAirgapReady] = useState(false);
  // Live online flag — subscribed to window online/offline events so the
  // "I am offline — engage airgap" button flips state in real time.
  const [online, setOnline] = useState<boolean>(() => isBrowserOnline());
  useEffect(() => {
    const update = (): void => setOnline(isBrowserOnline());
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  // Live blocked-fetch counter — surfaces the airgap doing its job.
  const [blockedCount, setBlockedCount] = useState(0);
  useEffect(() => {
    const unsubscribe = subscribeAirgap(() => setBlockedCount(blockedFetchCount()));
    return () => { unsubscribe(); };
  }, []);

  /** 0.4.0 — Explicit engage handler used by both the primary
   *  (physical-disconnect) and secondary (software-only) buttons. Mirrors
   *  the Restore.tsx 0.13.0+ engageAirgapAndAdvance helper. */
  function engageAirgapAndAdvance(): void {
    if (!isAirgapped()) enterAirgap();
    setPasskeyAirgapReady(true);
  }

  async function onManifestFile(f: File): Promise<void> {
    setManifestMsg(null);
    setErr(null);
    try {
      const m = parseManifestJson(await f.text());
      if (m.vaultId !== vaultId) {
        setManifestMsg(`That manifest is for a different vault (${m.vaultId.slice(0, 12)}…). Drop this vault's manifest.json.`);
        return;
      }
      if (m.shares.length === 0) {
        setManifestMsg("Manifest has no share descriptors — can't verify the password against it.");
        return;
      }
      setManifest(m);
      setManifestMsg("Manifest verified — ready to enrol passkey.");
    } catch (e) {
      setManifestMsg(`Couldn't read that file as a manifest: ${(e as Error).message}`);
    }
  }

  /** Step 1 verification: derive the master from the password + KDF params,
   *  then AEAD-decrypt the first share descriptor. If the tag verifies, the
   *  password is correct — same authoritative check the restore pipeline
   *  does. Returns the unwrapped master on success (caller owns wiping it).
   *  Throws on wrong password / tamper / unsupported baseline. */
  async function deriveAndVerify(mf: VaultManifest, pw: string): Promise<Uint8Array> {
    const master = await kdf.deriveMaster(pw, mf.kdf);
    const baseline = mf.cryptoBaseline ?? "v1";
    const useHkdf = baseline === "v2" || baseline === "v3";
    let prk: Uint8Array | null = null;
    let key: Uint8Array;
    try {
      if (useHkdf) {
        const salt = kdf.b64Decode(mf.kdf.saltB64);
        prk = kdf.hkdfExtract(salt, master);
        const desc = mf.shares[0]!;
        key = aead.deriveShareKeyV2(prk, desc.index);
      } else {
        key = master;
      }
      const desc = mf.shares[0]!;
      const iv = kdf.b64Decode(desc.ivB64);
      const cipherText = kdf.b64Decode(desc.cipherTextB64);
      const tag = desc.tagB64 ? kdf.b64Decode(desc.tagB64) : undefined;
      const aad = useHkdf ? aead.buildShareAADv2(mf.vaultId, desc.index, desc.cipher) : undefined;
      const plain = await aead.decrypt({
        kind: desc.cipher,
        key,
        iv,
        cipherText,
        ...(tag ? { tag } : {}),
        ...(aad ? { aad } : {}),
      });
      // Wipe the share plaintext + derived per-share key — we only needed
      // them to confirm the AEAD tag verified. Master is returned to caller.
      if (plain?.fill) plain.fill(0);
      if (prk && key !== master && key?.fill) key.fill(0);
      return master;
    } catch (e) {
      // Verification failed — wipe master before propagating; caller never
      // sees it. Same wipe pattern as restore-pipeline.ts 0.5.0.
      if (master?.fill) master.fill(0);
      throw e;
    } finally {
      if (prk?.fill) prk.fill(0);
    }
  }

  async function submit(): Promise<void> {
    if (!manifest) { setErr("Drop this vault's manifest.json first."); return; }
    if (!password) { setErr("Enter the master password for this vault."); return; }
    setErr(null);

    // Step 1 — verify password by AEAD-decrypting a share descriptor.
    let master: Uint8Array;
    try {
      setState("verifying");
      master = await deriveAndVerify(manifest, password);
    } catch {
      setState("error");
      setErr("That password didn't unlock this vault. Double-check it (case + characters) and try again.");
      return;
    }

    // Steps 2-5 — enrol passkey, wrap, cache, wipe. Memory hygiene: master
    // is .fill(0)'d synchronously in the SAME finally regardless of which
    // step throws (matches enrol-pipeline 0.5.0). cacheEnvelopeLocal writes
    // to localStorage; envelopeToJson writes the same blob to disk via
    // LocalFileAdapter so the user has a portable copy for other devices.
    try {
      setState("enrolling");
      const { credentialId, prfSalt, prfSecret } = await enrollPasskey(label || vaultId.slice(0, 8));
      setState("wrapping");
      const env = await wrapMaster(vaultId, master, credentialId, prfSalt, prfSecret);
      cacheEnvelopeLocal(env);
      try {
        await new LocalFileAdapter().put({
          path: `noklock/${vaultId}/passkey-unlock.json`,
          bytes: envelopeToJson(env),
          contentType: "application/json",
        });
      } catch { /* download blocked — localStorage cache is still the primary path */ }
      setState("done");
      setPassword("");
      // Brief success dwell then collapse the panel.
      setTimeout(() => { onDone(); }, 1400);
    } catch (e) {
      setState("error");
      setErr((e as Error).message || "Passkey enrolment failed.");
    } finally {
      // Step 5 — synchronous master wipe, same hygiene as enrol-pipeline 0.5.0.
      if (master?.fill) master.fill(0);
      // 0.4.0 — Leave airgap on completion (success OR error) so normal
      // network access is restored. Mirrors Enrol.tsx's pattern of
      // engaging airgap for the master-touching window then leaving it.
      try { if (isAirgapped()) leaveAirgap(); } catch { /* ignore */ }
    }
  }

  const busy = state === "verifying" || state === "enrolling" || state === "wrapping";

  // 0.4.0 — Airgap gate: before the user engages, render ONLY the airgap
  // engagement card. After engagement, render the existing add-passkey UI.
  // The master is derived (Argon2id over the master password) inside
  // deriveAndVerify; if any background fetch fired during that window, the
  // master could leak. Mirrors Restore.tsx's "Go offline now" step.
  if (!passkeyAirgapReady) {
    return (
      <div className="card sensitive-surface space-y-3 border-l-4 border-l-amber-400">
        <div className="text-[10px] font-mono uppercase tracking-wide text-amber-300">Step 0 · boundary</div>
        <h3 className="font-bold font-display text-lg">Go offline before adding passkey</h3>
        <p className="text-sm text-text-on-dark/85">
          Adding a passkey requires deriving your master key from the master password. Engage the airgap first so the master never leaks via a background network call.
        </p>
        <div className="text-sm">
          Browser online?{" "}
          <span className="font-mono">
            {online ? (
              <span className="text-danger">yes — turn it off</span>
            ) : (
              <span className="text-accent-green">no ✓</span>
            )}
          </span>
        </div>
        {isAirgapped() && (
          <div className="p-2 rounded bg-accent-green/10 border border-accent-green/40 text-xs">
            <strong className="text-accent-green">Software airgap engaged.</strong>{" "}
            <span className="font-mono">Fetches blocked since engaged: {blockedCount}</span>
            {blockedCount === 0
              ? <span className="text-accent-green"> ✓ no calls leaked</span>
              : <span className="text-amber-400"> — investigate before continuing</span>}
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            className="btn btn-primary"
            disabled={online}
            onClick={engageAirgapAndAdvance}
          >
            I am offline — engage airgap
          </button>
          <button
            className="btn btn-secondary text-sm"
            onClick={engageAirgapAndAdvance}
          >
            Skip physical disconnect — engage software airgap only
          </button>
        </div>
        <p className="text-xs text-text-muted">
          The software airgap intercepts every fetch / XHR / WebSocket / EventSource / SendBeacon / Worker / Service-Worker / WebRTC channel — but a compromised browser can still leak via a renderer exploit. Physical disconnect closes that gap.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card border border-emerald-500/40 bg-emerald-950/10 text-xs text-emerald-200 flex items-center justify-between gap-3 flex-wrap">
        <span>
          <strong>Airgap engaged ✓</strong> — all outbound network calls are being intercepted.
          <span className="font-mono ml-2">Blocked since engaged: {blockedCount}</span>
        </span>
      </div>

      <div className="text-xs text-text-on-dark/80">
        Two quick steps: (1) drop this vault's <code>manifest.json</code> so we can verify the password
        against it, then (2) enter the master password. We'll prompt your authenticator after that.
      </div>

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void onManifestFile(f); e.target.value = ""; }}
        />
        <button className="btn btn-secondary text-xs" onClick={() => fileRef.current?.click()} disabled={busy}>
          {manifest ? "Choose a different manifest.json" : "Choose manifest.json"}
        </button>
        {manifestMsg && (
          <div className={`mt-2 text-xs ${manifest ? "text-accent-green" : "text-rose-400"}`}>{manifestMsg}</div>
        )}
      </div>

      <label className="block text-xs">
        <span className="text-text-muted">Master password for this vault</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          spellCheck={false}
          disabled={busy || state === "done"}
          className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 text-sm"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="btn btn-primary text-sm"
          disabled={!manifest || !password || busy || state === "done"}
          onClick={() => void submit()}
        >
          {state === "verifying" ? "Verifying password…"
            : state === "enrolling" ? "Follow your device prompt…"
            : state === "wrapping" ? "Wrapping master…"
            : state === "done" ? "Passkey added ✓"
            : "Add passkey to this vault"}
        </button>
        {state === "error" && (
          <button className="btn btn-secondary text-sm" onClick={() => { setState("idle"); setErr(null); }}>Try again</button>
        )}
      </div>

      {state === "done" && (
        <div className="text-sm text-accent-green">
          Passkey added to vault &ldquo;{label}&rdquo;. Next unlock will offer passkey first.
        </div>
      )}
      {err && state !== "done" && (
        <div className="text-sm text-rose-400 break-words">
          {err} — your master password still fully protects this vault; you can simply skip the passkey.
        </div>
      )}
    </div>
  );
}
