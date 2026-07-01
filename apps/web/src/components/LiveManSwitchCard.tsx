// @version 0.1.0 @date 2026-05-25
// Live-Man's Switch registration (ACTIVE PLAN 10). Settings card, mounted below
// the Vault-defaults card. Lets the owner register out-of-band alert channels so
// they're notified — WITHOUT opening the app — if a social-recovery is started
// against their wallet (the on-chain veto window is useless if you never learn
// the clock started). Two channels:
//   • WALLET (on-chain, zero-PII, survives NoKLock): register 1-2 "watcher"
//     wallets you check regularly + pre-fund a little POL. NoKLockAlerts dust-
//     pings them (best-effort wallet push) + emits a permanent AlertPinged event.
//   • EMAIL (opt-in, off by default): the ONLY thing that leaves your device;
//     reliable delivery but depends on NoKLock's server.
// Honest about each channel's reliability + independence.

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useSignMessage } from "wagmi";
import { parseEther, formatEther, type Address } from "viem";
import { ALERTS_ADDR, alertsAbi } from "../lib/contracts.js";
import { humanizeTxError } from "../lib/txError.js";
import { ConnectWallet } from "./ConnectWallet.js";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://api.noklock.app/v1";
const PING_POL = "0.001"; // matches NoKLockAlerts.PING_AMOUNT (1e15 wei)
const ZERO = "0x0000000000000000000000000000000000000000";

function isAddr(s: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(s);
}

export function LiveManSwitchCard(): JSX.Element {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();
  const live = ALERTS_ADDR !== ZERO;

  const [draft, setDraft] = useState("");
  const [fundPol, setFundPol] = useState("0.05");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: watchers, refetch: refetchW } = useReadContract({
    address: ALERTS_ADDR, abi: alertsAbi, functionName: "getWatchers",
    args: address ? [address] : undefined,
    query: { enabled: !!address && live, refetchInterval: 10_000 },
  });
  const { data: funding, refetch: refetchF } = useReadContract({
    address: ALERTS_ADDR, abi: alertsAbi, functionName: "fundingOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && live, refetchInterval: 10_000 },
  });

  const current = (watchers as readonly Address[] | undefined) ?? [];
  const fundWei = (funding as bigint | undefined) ?? 0n;
  const pingsLeft = Number(fundWei / parseEther(PING_POL));
  const lowFunds = current.length > 0 && pingsLeft < current.length * 2;

  function reset(): void { setErr(null); setMsg(null); }

  async function saveWatchers(): Promise<void> {
    reset();
    const list = draft.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) { setErr("Add at least one watcher address."); return; }
    if (list.length > 2) { setErr("Up to 2 watcher wallets."); return; }
    for (const a of list) {
      if (!isAddr(a)) { setErr(`Not a valid address: ${a}`); return; }
      if (address && a.toLowerCase() === address.toLowerCase()) { setErr("A watcher must be a DIFFERENT wallet than this one (one you check regularly)."); return; }
    }
    let value: bigint;
    try { value = parseEther((fundPol || "0").trim()); } catch { setErr("Invalid POL amount."); return; }
    setBusy(true);
    try {
      const hash = await writeContractAsync({
        address: ALERTS_ADDR, abi: alertsAbi, functionName: "registerWatchers",
        args: [list as readonly Address[]], value,
      });
      setMsg(`Saved. ${value > 0n ? "A test ping was sent to your watcher wallet(s) — check the wallet app. " : ""}Tx ${hash.slice(0, 10)}…`);
      setDraft("");
      setTimeout(() => { void refetchW(); void refetchF(); }, 2500);
    } catch (e) { setErr(humanizeTxError(e)); }
    setBusy(false);
  }

  async function topUp(): Promise<void> {
    reset();
    let value: bigint;
    try { value = parseEther((fundPol || "0").trim()); } catch { setErr("Invalid POL amount."); return; }
    if (value <= 0n) { setErr("Enter a POL amount to add."); return; }
    setBusy(true);
    try {
      await writeContractAsync({ address: ALERTS_ADDR, abi: alertsAbi, functionName: "topUp", args: [], value });
      setMsg("Funding added.");
      setTimeout(() => void refetchF(), 2500);
    } catch (e) { setErr(humanizeTxError(e)); }
    setBusy(false);
  }

  async function withdrawAll(): Promise<void> {
    reset();
    if (fundWei <= 0n) { setErr("No funding to withdraw."); return; }
    setBusy(true);
    try {
      await writeContractAsync({ address: ALERTS_ADDR, abi: alertsAbi, functionName: "withdrawFunding", args: [fundWei] });
      setMsg("Withdrawn.");
      setTimeout(() => void refetchF(), 2500);
    } catch (e) { setErr(humanizeTxError(e)); }
    setBusy(false);
  }

  async function testWallet(): Promise<void> {
    reset();
    setBusy(true);
    try {
      await writeContractAsync({ address: ALERTS_ADDR, abi: alertsAbi, functionName: "testPing", args: [] });
      setMsg("Test ping sent — check your watcher wallet app for an incoming 0.001 POL.");
      setTimeout(() => void refetchF(), 2500);
    } catch (e) { setErr(humanizeTxError(e)); }
    setBusy(false);
  }

  async function saveEmail(): Promise<void> {
    reset();
    const e = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { setErr("Enter a valid email."); return; }
    setBusy(true);
    try {
      const signature = await signMessageAsync({ message: `NoKLock alert email opt-in: ${e}` });
      const r = await fetch(`${API_BASE}/owner-alerts/optin`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, signature }),
      });
      if (!r.ok) throw new Error(`opt-in failed: ${r.status}`);
      setMsg("Email alert opt-in saved. Use 'Send test email' to confirm delivery.");
    } catch (err2) { setErr((err2 as Error).message); }
    setBusy(false);
  }

  async function testEmail(): Promise<void> {
    reset();
    setBusy(true);
    try {
      const signature = await signMessageAsync({ message: "NoKLock alert email test" });
      const r = await fetch(`${API_BASE}/owner-alerts/test`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      if (!r.ok) throw new Error(`test failed: ${r.status}`);
      setMsg("Test email queued — check your inbox (and spam).");
    } catch (err2) { setErr((err2 as Error).message); }
    setBusy(false);
  }

  return (
    <div className="card">
      <h2 className="font-bold font-display mb-1">Live-Man's Switch — alerts <span className="text-text-muted text-sm font-normal">(get warned if someone tries to take your vault)</span></h2>
      <p className="text-sm text-text-on-dark/80 mb-3">
        The dead-man's switch only fires if YOU go silent, and a guardian recovery gives you days to cancel — but only if you know it started. Register where to reach you so you're alerted <strong>without opening this app</strong>.
      </p>

      {!live ? (
        <p className="text-sm text-text-muted">
          Alerts activate with the next on-chain deploy (very soon). When live: you'll register 1–2 wallets you check regularly (plus an optional email); if a guardian recovery is ever started against your wallet, you'll be pinged out-of-band — most wallet apps show the incoming transfer — so you can cancel it in time, even without opening this app. You fund your own pings, so it keeps working even if NoKLock disappears.
        </p>
      ) : !isConnected ? (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Connect your wallet to register alert channels.</p>
          <ConnectWallet />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Wallet channel */}
          <section>
            <h3 className="font-bold text-accent-cyan mb-1">Wallet alert <span className="text-text-muted text-xs font-normal">— private · survives NoKLock · best-effort push</span></h3>
            <p className="text-xs text-text-muted mb-2">
              Register 1–2 wallets you check regularly (NOT this one). If a recovery starts against you, each gets a tiny <strong>{PING_POL} POL</strong> ping — most wallet apps surface an incoming transfer, and there's always a permanent on-chain record. You pre-fund your own pings, so this keeps working even if NoKLock disappears. Turn on incoming-transfer notifications in your wallet app to be sure you see it.
            </p>
            {current.length > 0 && (
              <div className="text-xs text-text-on-dark/80 mb-2">
                Current watchers: {current.map((w) => <span key={w} className="font-mono">{w.slice(0, 6)}…{w.slice(-4)} </span>)}
                · Funding: <span className="font-mono">{formatEther(fundWei)} POL</span> (~{pingsLeft} pings)
                {lowFunds && <span className="text-amber-300"> · low — top up</span>}
              </div>
            )}
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2}
              placeholder="0xYourEverydayWallet…  (and optionally a 2nd, comma/space separated)"
              className="w-full bg-bg-deepest border border-bg-surface rounded p-2 text-sm font-mono mb-2" />
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-text-muted">Fund POL</label>
              <input value={fundPol} onChange={(e) => setFundPol(e.target.value)} className="w-24 bg-bg-deepest border border-bg-surface rounded px-2 py-1 text-sm" />
              <button onClick={() => void saveWatchers()} disabled={busy} className="btn btn-primary text-sm">{busy ? "…" : "Save watchers + fund"}</button>
              <button onClick={() => void topUp()} disabled={busy} className="btn btn-secondary text-sm">Top up</button>
              {current.length > 0 && <button onClick={() => void testWallet()} disabled={busy} className="btn btn-secondary text-sm">Send test alert</button>}
              {fundWei > 0n && <button onClick={() => void withdrawAll()} disabled={busy} className="text-xs text-text-muted hover:underline">Withdraw funding</button>}
            </div>
          </section>

          {/* Email channel */}
          <section className="border-t border-bg-surface/40 pt-4">
            <h3 className="font-bold text-accent-cyan mb-1">Email alert <span className="text-text-muted text-xs font-normal">— optional · reliable · the only thing that leaves your device</span></h3>
            <p className="text-xs text-text-muted mb-2">
              Off by default. If you add one, we email you when a recovery starts against your wallet. Reliable delivery, but it depends on NoKLock's server (the wallet alert above does not).
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                className="flex-1 min-w-[12rem] bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm" />
              <button onClick={() => void saveEmail()} disabled={busy} className="btn btn-secondary text-sm">Save email (sign)</button>
              <button onClick={() => void testEmail()} disabled={busy} className="btn btn-secondary text-sm">Send test email</button>
            </div>
          </section>

          {err && <div className="text-sm text-rose-400 break-words">{err}</div>}
          {msg && <div className="text-sm text-accent-teal break-words">{msg}</div>}
        </div>
      )}
    </div>
  );
}
