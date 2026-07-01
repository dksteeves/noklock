// @version 0.3.0 @date 2026-06-11
// 0.3.0 — Daniel 2026-06-11 wallet rebuild (WALLET-REBUILD-EXEC §B3.12):
//         dropped useWalletSettling + WalletReconnecting → ONE
//         <WalletGateCard/> on `gate.status !== "connected" && contractsLive`.
// @version 0.2.0 @date 2026-06-03
// 0.2.0 — LOW-3: vault-context UI labels in the Recover tab. Queries
//         idx_nok_minted (via useNokList) for vaults the connected wallet
//         holds NoK roles in, and renders a truncated vaultId + role
//         badge list so guardians can recognize which vault they are
//         voting on instead of staring at a bare lost-wallet address.
// 0.1.0 — initial three-tab guardian UI.
// /recovery — social-recovery guardian UI for NoKLockRecovery.sol.
//
// Three surfaces in one page, tabbed:
//   • "My guardians" — set/update your own M-of-N guardian list (every user
//     can do this for THEMSELVES; permissionless + self-scoped on the
//     contract — see audit-clarity write-up on Info → Contracts).
//   • "Recover a wallet" — guardian actions: look up a lost-wallet,
//     initiate / support / view-in-progress request, execute after delay.
//   • "Cancel my recovery" — if YOU still control the original wallet and
//     someone else initiated recovery on you (collusion defence), cancel
//     it from inside the time-lock window.
//
// Closes the "Free-tier advertises social recovery, zero UI" veracity gap
// (Section A row): the contract has been deployed since launch — only the
// UI was missing.

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import type { Address } from "viem";
import { RECOVERY_ADDR } from "../lib/contracts.js";
import { recoveryAbi } from "../lib/recovery-contract.js";
import { WalletGateCard } from "../components/WalletGateCard.js";
import { useWalletGate } from "../hooks/useWalletGate.js";
import { humanizeTxError } from "../lib/txError.js";
import { PageHelp } from "../components/PageHelp.js";
import { useDocumentHead } from "../lib/seo.js";
import { useNokList, SBT_ROLE_NAME, type NokEntry } from "../hooks/useNokList.js";

type Tab = "my-guardians" | "recover" | "cancel";

function isAddr(s: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(s);
}

export function Recovery(): JSX.Element {
  useDocumentHead("/recovery");
  const { address } = useAccount();
  const gate = useWalletGate();
  const isConnected = gate.status === "connected";
  const [tab, setTab] = useState<Tab>("my-guardians");
  const contractsLive = RECOVERY_ADDR !== "0x0000000000000000000000000000000000000000";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-display"><span className="grad">Social recovery</span></h1>
        <p className="text-text-on-dark/85 mt-2 max-w-3xl">
          Guardians are people you trust to help you re-take an SBT inheritance designation if you ever lose your wallet. They are <strong>separate from your NoKs</strong> — guardians help YOU recover access; NoKs receive YOUR vault after you die. M-of-N quorum, time-locked, and you (the original wallet) retain a cancellation window if anyone tries to misuse the flow.
        </p>
        <p className="text-text-muted text-xs mt-2">
          Verifiable on PolygonScan — the recovery contract is deployed at <a href={`https://polygonscan.com/address/${RECOVERY_ADDR}#code`} target="_blank" rel="noopener noreferrer" className="text-accent-cyan underline font-mono">{RECOVERY_ADDR.slice(0, 10)}…{RECOVERY_ADDR.slice(-6)}</a>.
        </p>
      </header>

      {!contractsLive && (
        <div className="card border-2 border-danger">
          <h2 className="font-bold text-danger mb-2">Recovery contract not configured</h2>
          <p className="text-sm">Set <code>VITE_RECOVERY_CONTRACT_ADDR</code> in <code>.env</code>.</p>
        </div>
      )}

      {gate.status !== "connected" && contractsLive && (
        <WalletGateCard note="Connect a wallet to manage guardians or assist someone's recovery." />
      )}

      {isConnected && contractsLive && (
        <>
          <nav className="flex flex-wrap gap-2">
            <TabPill active={tab === "my-guardians"} onClick={() => setTab("my-guardians")} label="My guardians" />
            <TabPill active={tab === "recover"}      onClick={() => setTab("recover")}      label="Recover a wallet" />
            <TabPill active={tab === "cancel"}       onClick={() => setTab("cancel")}       label="Cancel my recovery" />
          </nav>

          {tab === "my-guardians" && <MyGuardians address={address as Address} />}
          {tab === "recover"      && <RecoverWallet me={address as Address} />}
          {tab === "cancel"       && <CancelMyRecovery me={address as Address} />}
        </>
      )}

      <PageHelp
        docsId="recovery-docs"
        heading="About social recovery"
        entries={[
          {
            title: "Guardians vs NoKs — what's the difference?",
            body: (
              <p>
                Two completely separate roles. <strong>Guardians</strong> help YOU recover access if you lose your wallet — they vote (M-of-N) to swap an SBT designation FROM your old wallet TO your new one. <strong>Next-of-kin (NoKs)</strong> receive your vault after you stop checking in (the dead-man's switch fires). The same person could play both roles for you, but in the contract they are separate sets — guardians can never claim your vault, only help reassign access.
              </p>
            ),
          },
          {
            title: "How does the M-of-N quorum protect me?",
            body: (
              <p>
                You choose how many guardians (up to 9) and what quorum to require (e.g. 2-of-3, 3-of-5). A single compromised guardian cannot recover your account. Even if M-of-N guardians ARE compromised and they vote your account away, a <strong>time-lock</strong> kicks in afterwards (default 7 days). During that window, you can sign a cancel transaction <em>from your original wallet</em> and the recovery is voided. Only after the time-lock elapses with no cancel can anyone execute the recovery on chain.
              </p>
            ),
          },
          {
            title: "What does 'permissionless' setGuardians mean? Is that a security flaw?",
            body: (
              <p>
                No — it's a deliberate design choice. The <code>setGuardians</code> function on the Recovery contract has no caller restriction modifier, which the SolidityScan free-tier scanner flags. But the function only writes to the storage slot for <code>guardiansOf[msg.sender]</code> — i.e. each user can ONLY change their OWN guardian list. There's no way to change another user's guardians regardless of whether the function is "public" or has modifiers. Read the source on Info → Contracts.
              </p>
            ),
          },
          {
            title: "How does this interact with the dead-man's switch?",
            body: (
              <p>
                It doesn't — they're independent. Social recovery is for <em>you</em> regaining access (still alive, still in control, just lost your device). The dead-man's switch is for after you stop checking in (absence). Both can be configured on the same vault. If you have BOTH set up and you lose your wallet today, you can recover via guardians without your NoKs ever being activated.
              </p>
            ),
          },
        ]}
      />
    </div>
  );
}

function TabPill({ active, onClick, label }: { readonly active: boolean; readonly onClick: () => void; readonly label: string }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? "grad-bg text-text-primary font-bold border-transparent"
          : "bg-bg-surface text-text-on-dark/80 border-bg-surface hover:bg-bg-deepest"
      }`}
    >
      {label}
    </button>
  );
}

// -- My guardians ---------------------------------------------------------

function MyGuardians({ address }: { readonly address: Address }): JSX.Element {
  const { writeContractAsync } = useWriteContract();
  const [draft, setDraft] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(2);
  const [err, setErr] = useState<string | null>(null);
  const [tx, setTx] = useState<`0x${string}` | null>(null);

  const { data: current, refetch: refetchG } = useReadContract({
    address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "getGuardians",
    args: [address], query: { refetchInterval: 8_000 },
  });
  const { data: curT } = useReadContract({
    address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "thresholdOf",
    args: [address], query: { refetchInterval: 8_000 },
  });
  const { data: defaultT } = useReadContract({
    address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "DEFAULT_THRESHOLD",
  });
  const { data: maxG } = useReadContract({
    address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "MAX_GUARDIANS",
  });

  const guardians = (current as readonly Address[] | undefined) ?? [];
  const effectiveT = Number(curT ?? 0) || Number(defaultT ?? 0) || 2;

  async function submit(): Promise<void> {
    setErr(null); setTx(null);
    const lines = draft.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    if (lines.length === 0) { setErr("Add at least one guardian address."); return; }
    for (const a of lines) {
      if (!isAddr(a)) { setErr(`Not a valid address: ${a}`); return; }
      if (a.toLowerCase() === address.toLowerCase()) { setErr("You can't be your own guardian."); return; }
    }
    const n = lines.length;
    if (Number(maxG) && n > Number(maxG)) { setErr(`Maximum ${Number(maxG)} guardians.`); return; }
    if (threshold < 1 || threshold > n) { setErr(`Threshold must be 1..${n}.`); return; }
    try {
      const hash = await writeContractAsync({
        address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "setGuardians",
        args: [lines as readonly Address[], threshold],
      });
      setTx(hash);
      setTimeout(() => void refetchG(), 1500);
      setDraft("");
    } catch (e) {
      setErr(humanizeTxError(e));
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="font-bold font-display"><span className="grad">My guardian set</span></h2>
      <div>
        <p className="text-text-muted text-sm mb-1">Currently configured:</p>
        {guardians.length === 0 ? (
          <p className="text-sm">No guardians configured yet. Until you set them, social recovery is unavailable for your wallet.</p>
        ) : (
          <ul className="text-sm font-mono space-y-0.5">
            {guardians.map((g) => <li key={g}>{g}</li>)}
            <li className="text-text-muted mt-1 text-xs font-sans">Threshold: <strong>{effectiveT}-of-{guardians.length}</strong></li>
          </ul>
        )}
      </div>

      <div className="border-t border-bg-surface pt-3 space-y-2">
        <p className="text-text-muted text-sm">Replace your guardian list with the addresses below (comma-, space- or newline-separated). Threshold = how many of them must agree to recover your account.</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="0xabc..., 0xdef..., 0x123..."
          rows={4}
          className="block w-full bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
        />
        <label className="block text-sm">
          <span className="text-text-muted">Threshold (M-of-N)</span>
          <input
            type="number" min={1} max={9}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="block w-24 mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm"
          />
        </label>
        <button className="btn btn-primary text-sm" onClick={() => void submit()}>Save guardian set</button>
        {tx && <div className="text-xs font-mono text-text-muted">tx: {tx.slice(0, 10)}…{tx.slice(-6)}</div>}
        {err && <div className="text-sm text-danger">{err}</div>}
      </div>
    </div>
  );
}

// -- Vault-context panel (which vaults am I a NoK on?) -------------------
//
// Reads idx_nok_minted (via useNokList) for the connected wallet. Shows
// every vault where the guardian holds at least one SBT role, with a
// truncated vaultId and a role-name badge per row. Lets guardians match
// the lost-wallet address they're about to type against vaults they
// actually recognise rather than a bare hex string.

function VaultIdShort({ id }: { readonly id: `0x${string}` }): JSX.Element {
  return <span className="font-mono text-xs">{id.slice(0, 10)}…{id.slice(-6)}</span>;
}

function RoleBadge({ role }: { readonly role: number }): JSX.Element {
  const name = SBT_ROLE_NAME[role] ?? `Role ${role}`;
  const tone =
    role === 0 ? "bg-accent-teal/15 text-accent-teal border-accent-teal/40"
    : role === 1 ? "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40"
    : "bg-amber-500/15 text-amber-500 border-amber-500/40";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${tone}`}>
      {name}
    </span>
  );
}

function MyVaultContext(): JSX.Element {
  const { entries, loading, error } = useNokList();
  if (loading) {
    return (
      <div className="rounded border border-bg-surface bg-bg-deepest/40 p-3 text-xs text-text-muted">
        Loading vaults you're a NoK on…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded border border-bg-surface bg-bg-deepest/40 p-3 text-xs text-text-muted">
        Couldn't load your vault context: {error}
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="rounded border border-bg-surface bg-bg-deepest/40 p-3 text-xs text-text-muted">
        You don't currently hold any NoK SBTs. Anyone can still act as a guardian — guardians are configured separately from NoK designations. If you ARE a guardian, paste the lost wallet's address below.
      </div>
    );
  }
  return (
    <div className="rounded border border-accent-teal/30 bg-accent-teal/5 p-3 text-sm space-y-2">
      <div className="font-bold text-accent-teal text-xs uppercase tracking-wide">Vaults you're a NoK on</div>
      <p className="text-text-muted text-xs">
        These are vaults where your connected wallet holds SBT roles. Use them to recognise which vault a recovery request relates to before voting.
      </p>
      <ul className="space-y-1.5">
        {entries.map((e: NokEntry) => {
          const roles = Object.keys(e.tokensByRole).map((r) => Number(r)).sort();
          return (
            <li key={`${e.nokWallet}|${e.vaultId}`} className="flex flex-wrap items-center gap-2">
              <VaultIdShort id={e.vaultId} />
              <span className="flex flex-wrap gap-1">
                {roles.map((r) => <RoleBadge key={r} role={r} />)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// -- Recover a wallet (guardian-initiated) -------------------------------

function RecoverWallet({ me }: { readonly me: Address }): JSX.Element {
  const { writeContractAsync } = useWriteContract();
  const [lostWallet, setLostWallet] = useState("");
  const [oldTokenId, setOldTokenId] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [newTokenUri, setNewTokenUri] = useState("ipfs://noklock-nok-v1-recovered/{id}.json");
  const [err, setErr] = useState<string | null>(null);
  const [tx, setTx] = useState<`0x${string}` | null>(null);

  const lostAddrValid = isAddr(lostWallet);

  const { data: amIGuardian } = useReadContract({
    address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "isGuardian",
    args: lostAddrValid ? [lostWallet as Address, me] : undefined,
    query: { enabled: lostAddrValid },
  });
  const { data: req, refetch: refetchReq } = useReadContract({
    address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "getRequest",
    args: lostAddrValid ? [lostWallet as Address] : undefined,
    query: { enabled: lostAddrValid, refetchInterval: 8_000 },
  });

  // getRequest returns a tuple typed as [bigint, address, uint8, uint64, uint64, bool, bool]
  const r = (req as readonly [bigint, Address, number, bigint, bigint, boolean, boolean] | undefined);
  const hasRequest = !!r && r[1] !== "0x0000000000000000000000000000000000000000" && !r[5] && !r[6];

  async function doInitiate(): Promise<void> {
    setErr(null); setTx(null);
    if (!lostAddrValid) { setErr("Invalid lost wallet"); return; }
    if (!/^[0-9]+$/.test(oldTokenId)) { setErr("Token id must be a decimal integer"); return; }
    if (!isAddr(newWallet)) { setErr("Invalid proposed new wallet"); return; }
    try {
      const hash = await writeContractAsync({
        address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "initiateRecovery",
        args: [lostWallet as Address, BigInt(oldTokenId), newWallet as Address, newTokenUri],
      });
      setTx(hash);
      setTimeout(() => void refetchReq(), 1500);
    } catch (e) {
      setErr(humanizeTxError(e));
    }
  }

  async function doSupport(): Promise<void> {
    setErr(null); setTx(null);
    if (!lostAddrValid) { setErr("Invalid lost wallet"); return; }
    try {
      const hash = await writeContractAsync({
        address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "supportRecovery",
        args: [lostWallet as Address],
      });
      setTx(hash);
      setTimeout(() => void refetchReq(), 1500);
    } catch (e) { setErr(humanizeTxError(e)); }
  }

  async function doExecute(): Promise<void> {
    setErr(null); setTx(null);
    if (!lostAddrValid) { setErr("Invalid lost wallet"); return; }
    try {
      const hash = await writeContractAsync({
        address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "executeRecovery",
        args: [lostWallet as Address],
      });
      setTx(hash);
      setTimeout(() => void refetchReq(), 1500);
    } catch (e) { setErr(humanizeTxError(e)); }
  }

  const nowSec = Math.floor(Date.now() / 1000);

  return (
    <div className="card space-y-4">
      <h2 className="font-bold font-display"><span className="grad">Recover someone's wallet</span></h2>
      <p className="text-text-muted text-sm">
        Use this if you are listed as a guardian for someone whose wallet has been lost. You'll initiate or vote on a recovery request. The contract enforces the M-of-N quorum + time-lock; the lost wallet's original owner can still cancel during the time-lock window.
      </p>

      <MyVaultContext />

      <label className="block text-sm">
        <span className="text-text-muted">Lost wallet address</span>
        <input type="text" value={lostWallet} onChange={(e) => setLostWallet(e.target.value)} placeholder="0x..." className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
      </label>
      {lostAddrValid && (
        <div className="text-xs text-text-muted">
          You are {amIGuardian ? <strong className="text-accent-teal">a registered guardian</strong> : <strong className="text-danger">NOT a registered guardian</strong>} for this wallet.
        </div>
      )}

      {lostAddrValid && hasRequest && r && (
        <div className="rounded border border-amber-500/40 bg-amber-500/5 p-3 text-sm space-y-1">
          <div className="font-bold">In-progress recovery request</div>
          <div>Old token id: <span className="font-mono">{r[0].toString()}</span></div>
          <div>Proposed new wallet: <span className="font-mono break-all">{r[1]}</span></div>
          <div>Votes: <strong>{r[2]}</strong></div>
          <div>Quorum met at: <span className="font-mono">{r[3] > 0n ? new Date(Number(r[3]) * 1000).toISOString().slice(0, 16) + "Z" : "—"}</span></div>
          <div>Executable after: <span className="font-mono">{r[4] > 0n ? new Date(Number(r[4]) * 1000).toISOString().slice(0, 16) + "Z" : "—"}</span></div>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-primary text-sm" onClick={() => void doSupport()}>Add my support vote</button>
            {r[4] > 0n && nowSec >= Number(r[4]) && (
              <button className="btn btn-danger text-sm" onClick={() => void doExecute()}>Execute recovery</button>
            )}
          </div>
        </div>
      )}

      {!hasRequest && lostAddrValid && (
        <div className="border-t border-bg-surface pt-3 space-y-3">
          <p className="text-sm text-text-on-dark/85">No active request. Initiate one (will count as the first vote):</p>
          <label className="block text-sm">
            <span className="text-text-muted">Old SBT token id (decimal)</span>
            <input type="text" value={oldTokenId} onChange={(e) => setOldTokenId(e.target.value)} placeholder="123" className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-text-muted">Proposed new wallet for the lost user</span>
            <input type="text" value={newWallet} onChange={(e) => setNewWallet(e.target.value)} placeholder="0x..." className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-text-muted">New token URI (optional override)</span>
            <input type="text" value={newTokenUri} onChange={(e) => setNewTokenUri(e.target.value)} className="block w-full mt-1 bg-bg-deepest border border-bg-surface rounded p-2 font-mono text-xs" />
          </label>
          <button className="btn btn-primary text-sm" onClick={() => void doInitiate()}>Initiate recovery (1st vote)</button>
        </div>
      )}

      {tx && <div className="text-xs font-mono text-text-muted">tx: {tx.slice(0, 10)}…{tx.slice(-6)}</div>}
      {err && <div className="text-sm text-danger">{err}</div>}
    </div>
  );
}

// -- Cancel my recovery (original-wallet safety net) ---------------------

function CancelMyRecovery({ me }: { readonly me: Address }): JSX.Element {
  const { writeContractAsync } = useWriteContract();
  const [err, setErr] = useState<string | null>(null);
  const [tx, setTx] = useState<`0x${string}` | null>(null);

  const { data: req } = useReadContract({
    address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "getRequest",
    args: [me], query: { refetchInterval: 8_000 },
  });
  const r = req as readonly [bigint, Address, number, bigint, bigint, boolean, boolean] | undefined;
  const hasActive = !!r && r[1] !== "0x0000000000000000000000000000000000000000" && !r[5] && !r[6];

  async function doCancel(): Promise<void> {
    setErr(null); setTx(null);
    try {
      const hash = await writeContractAsync({
        address: RECOVERY_ADDR, abi: recoveryAbi, functionName: "cancelRecovery",
        args: [],
      });
      setTx(hash);
    } catch (e) { setErr(humanizeTxError(e)); }
  }

  return (
    <div className="card space-y-3">
      <h2 className="font-bold font-display"><span className="grad">Cancel a recovery on me</span></h2>
      <p className="text-text-muted text-sm">
        Sign from your <strong>original</strong> wallet if you regained access during a recovery time-lock and want to void it. Useful if a guardian initiated recovery while you were temporarily out of reach.
      </p>
      {hasActive && r ? (
        <div className="rounded border border-amber-500/40 bg-amber-500/5 p-3 text-sm space-y-1">
          <div className="font-bold">Active request against your wallet</div>
          <div>Votes: <strong>{r[2]}</strong></div>
          <div>Executable after: <span className="font-mono">{r[4] > 0n ? new Date(Number(r[4]) * 1000).toISOString().slice(0, 16) + "Z" : "(quorum not met yet)"}</span></div>
          <button className="btn btn-danger text-sm mt-2" onClick={() => void doCancel()}>Cancel recovery</button>
        </div>
      ) : (
        <p className="text-sm text-text-on-dark/85">No active recovery request against your wallet. Nothing to cancel.</p>
      )}
      {tx && <div className="text-xs font-mono text-text-muted">tx: {tx.slice(0, 10)}…{tx.slice(-6)}</div>}
      {err && <div className="text-sm text-danger">{err}</div>}
    </div>
  );
}
