// @version 0.1.0 @date 2026-05-30
// /prove-it/noklock-proof — Daniel 2026-05-30: prove that the chain runs
// without us. If NoKLock vanished tomorrow — server, domain, company —
// your inheritance still fires and your seed still restores.
//
// Three concrete demonstrations on this page:
//   1. The 6 contract addresses on PolygonScan, source-verified.
//   2. The Chainlink Automation registry — we don't run the keeper;
//      Chainlink's decentralized network does. Link to our upkeep so the
//      user can confirm LINK funding live.
//   3. The public-RPC fallback chain in main.tsx — every contract read
//      survives api.noklock.app going dark.
//
// Honest framing: a thin company-operated convenience layer (off-chain
// heartbeat, email-only NoK rebind) WOULD stop if NoKLock disappeared.
// The dead-man's switch and the on-chain inheritance path do NOT.
// Both surfaces called out explicitly; nothing is hidden.

import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/seo.js";
import {
  LICENSE_ADDR, SBT_ADDR, ORACLE_ADDR, RECOVERY_ADDR, ESCROW_ADDR, ALERTS_ADDR,
} from "../lib/contracts.js";
import { BRAND_NAME } from "../lib/brand.js";
import { ChainlinkUpkeepStatus } from "../components/ChainlinkUpkeepStatus.js";

// Chainlink Automation Registry on Polygon PoS (verified via research workflow
// 2026-05-30 — matches the address pinned in chainlink-watchdog.ts).
const CHAINLINK_REGISTRY = "0x08a8eea76D2395807Ce7D1FC942382515469cCA1";

const CONTRACTS: ReadonlyArray<{ name: string; addr: string; role: string }> = [
  { name: "License",  addr: LICENSE_ADDR,  role: "Mints + tracks paid licences. Pure on-chain; no NoKLock server involved in licence reads or writes." },
  { name: "SBT",      addr: SBT_ADDR,      role: "Mints the soul-bound Activation NFT (the trigger) per next-of-kin — plus a Voting NFT per heir for M-of-N quorum vaults. Non-transferable by ERC-5192 contract enforcement." },
  { name: "Oracle",   addr: ORACLE_ADDR,   role: "The dead-man's switch. Forwarder-gated to Chainlink Automation. Flips Activation tokens from LockedInactive → LockedActive after your heartbeat goes stale for the full grace period." },
  { name: "Recovery", addr: RECOVERY_ADDR, role: "Guardian social-recovery. Cancel-window enforced (1-30 days, default 7) during which YOU can call cancelRecovery() from your wallet." },
  { name: "Escrow",   addr: ESCROW_ADDR,   role: "Hybrid-E email-bound rebind for email-only next-of-kin. The heir's signature is REQUIRED — no single key can rebind unilaterally." },
  { name: "Alerts",   addr: ALERTS_ADDR,   role: "The Live-Man's Switch. The owner registers watcher wallets; a Chainlink log-trigger pings them on-chain when a recovery starts — a decentralized out-of-band heads-up. No funds, no keys." },
];

const RPC_FALLBACK_CHAIN: ReadonlyArray<{ url: string; operator: string }> = [
  { url: "https://api.noklock.app/v1/rpc",                  operator: "NoKLock proxy (preferred for IP privacy from public nodes)" },
  { url: "https://polygon-rpc.com",                          operator: "Polygon official" },
  { url: "https://polygon-bor-rpc.publicnode.com",           operator: "PublicNode" },
  { url: "https://rpc.ankr.com/polygon",                     operator: "Ankr" },
  { url: "https://1rpc.io/matic",                            operator: "1RPC" },
];

export function ProveItNoKLockProof(): JSX.Element {
  useDocumentHead("/prove-it/noklock-proof");
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h1 className="text-3xl font-bold font-display"><span className="grad">Prove the chain runs without us</span></h1>
          <Link to="/prove-it" className="text-xs text-text-muted hover:text-accent-cyan">← back to Prove-It hub</Link>
        </div>
        <p className="text-text-on-dark/80 text-base mt-2 max-w-3xl">
          If {BRAND_NAME} vanished tomorrow — server gone, domain gone, company gone — your inheritance still fires and your seed still restores.
          Everything below is verifiable from public infrastructure ({BRAND_NAME} has no privileged access to any of it).
        </p>
      </header>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">1 · Contracts</div>
        <h2 className="text-xl font-bold font-display mb-1">{CONTRACTS.length} immutable contracts on Polygon PoS</h2>
        <p className="text-sm text-text-muted mb-4">
          All source-verified on PolygonScan. {BRAND_NAME} cannot upgrade them, pause them, drain them, or steal from them — they're frozen bytecode.
          Click any name to read the exact code that holds your inheritance.
        </p>
        <ul className="space-y-3">
          {CONTRACTS.map((c) => (
            <li key={c.addr} className="rounded-lg border border-bg-surface bg-bg-deepest/60 px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                <h3 className="font-bold font-display text-lg">{c.name}</h3>
                <a
                  href={`https://polygonscan.com/address/${c.addr}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent-cyan hover:underline"
                >
                  {c.addr} ↗
                </a>
              </div>
              <p className="text-sm text-text-on-dark/85">{c.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">2 · Keeper</div>
        <h2 className="text-xl font-bold font-display mb-1">We don't run the dead-man's switch — Chainlink does</h2>
        <p className="text-sm text-text-on-dark/85 mb-4">
          The trigger that flips your inheritance tokens from inactive to active is fired by{" "}
          <strong className="text-accent-cyan">Chainlink Automation</strong> — a decentralized network of independent keepers, the same infrastructure
          that secures over $20 billion in DeFi protocols. {BRAND_NAME} pre-funds the upkeep in LINK; Chainlink does the
          firing. If {BRAND_NAME} shuts down, the upkeep keeps running as long as the LINK balance lasts.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            Registry on Polygon:{" "}
            <a href={`https://polygonscan.com/address/${CHAINLINK_REGISTRY}#code`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent-cyan hover:underline">
              {CHAINLINK_REGISTRY} ↗
            </a>
          </li>
          <li>
            Browse all live upkeeps:{" "}
            <a href="https://automation.chain.link/polygon" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">
              automation.chain.link/polygon ↗
            </a>
          </li>
          <li className="text-text-muted">
            Forwarder-gated: the Oracle contract REJECTS calls from any address that isn't the registered Chainlink forwarder.
            {BRAND_NAME} can't trigger your inheritance early even if we wanted to.
          </li>
        </ul>
      </section>

      <section className="card border-accent-cyan/40">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">2a · Survives-us funding</div>
        <h2 className="text-xl font-bold font-display mb-1">If we're gone — anyone can keep the keeper alive</h2>
        {/* 0.2.0 — Live Chainlink upkeep status widget. Audit Q1 (Daniel
            2026-06-01) — surface address + balance + Top-up CTA so the
            community-funded fallback is one click, not buried in a generic
            "browse all upkeeps" link. No contract redeploy needed; the
            permissionless funding path is in Chainlink's design. */}
        <div className="mb-4">
          <ChainlinkUpkeepStatus />
        </div>
        <p className="text-sm text-text-on-dark/85 mb-3">
          Chainlink Automation upkeeps on Polygon have a <strong>public LINK-token balance</strong>. ANY wallet can top it up;
          you don't need to be the original creator and you don't need to be {BRAND_NAME}. If we vanish and the LINK balance
          drops low, the community of {BRAND_NAME} users (or even one user with skin in the game) can keep it funded indefinitely
          — and the firing logic continues unchanged.
        </p>
        <p className="text-sm text-text-on-dark/85 mb-3">
          The upkeep is a public on-chain record. The Chainlink dashboard shows: current LINK balance, recent performUpkeep history,
          minimum balance, and a one-click "Add funds" button on a wallet you control.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>Watch / fund the Oracle upkeep:</strong>{" "}
            <a href="https://automation.chain.link/polygon" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">
              automation.chain.link/polygon ↗
            </a>{" "}
            — search for the Oracle contract address (<a href={`https://polygonscan.com/address/${ORACLE_ADDR}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent-cyan hover:underline">{ORACLE_ADDR.slice(0, 10)}…{ORACLE_ADDR.slice(-8)} ↗</a>) to find the upkeep, then "Add funds".
          </li>
          <li>
            <strong>LINK token (Polygon PoS):</strong>{" "}
            <a href="https://polygonscan.com/token/0xb0897686c545045aFc77CF20eC7A532E3120E0F1" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-accent-cyan hover:underline">
              0xb089…E0F1 ↗
            </a>{" "}
            (the ERC-677 address Automation accepts). Bridge if needed via the official Polygon bridge.
          </li>
          <li className="text-text-muted">
            This isn't a {BRAND_NAME} promise — it's a property of how Chainlink Automation works on Polygon. If we shut down without warning, the upkeep keeps firing as long as someone keeps funding it. The community can verify the LINK balance + cron history at any time without our involvement.
          </li>
        </ul>
      </section>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">3 · RPC</div>
        <h2 className="text-xl font-bold font-display mb-1">Every contract read survives {BRAND_NAME} going dark</h2>
        <p className="text-sm text-text-on-dark/85 mb-4">
          The app reads Polygon through a fallback chain in <code className="font-mono text-xs text-accent-cyan">main.tsx</code>:
          the NoKLock RPC proxy first (for IP privacy from public nodes), then four independent public Polygon RPCs.
          If {BRAND_NAME}'s proxy is down, the app silently falls over to a public node and keeps reading. The user sees nothing.
        </p>
        <ol className="space-y-1 font-mono text-xs">
          {RPC_FALLBACK_CHAIN.map((r, i) => (
            <li key={r.url} className="flex flex-wrap gap-2">
              <span className="text-text-muted">{i + 1}.</span>
              <span className="text-accent-cyan break-all">{r.url}</span>
              <span className="text-text-muted">— {r.operator}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-text-muted mt-3">
          Test it yourself: temporarily block <code>api.noklock.app</code> in your hosts file. Open this app. Reads still work.
        </p>
      </section>

      <section className="card border-amber-700/40 bg-amber-950/10">
        <div className="text-[10px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-2">Honest caveats</div>
        <h2 className="text-xl font-bold font-display mb-1">What WOULD stop if {BRAND_NAME} disappeared</h2>
        <p className="text-sm text-text-on-dark/85 mb-3">
          We refuse to claim 100% trustlessness when it isn't 100% true. Two convenience surfaces are operated by us:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="text-text-on-dark/85">
            <strong className="text-amber-200">Off-chain heartbeat (Form B):</strong> the optional convenience that lets you check in via email or wallet sign instead of an on-chain tx.
            Stops working. <strong>Trustless fallback:</strong> call <code className="font-mono text-xs">selfHeartbeat()</code> directly on the Oracle contract from any wallet client (MetaMask, Etherscan, anywhere). One tx every grace period.
          </li>
          <li className="text-text-on-dark/85">
            <strong className="text-amber-200">Email-only next-of-kin (Hybrid-E rebind):</strong> if your heir signed up with email only (no wallet at designation time), the rebind ceremony uses our Escrow attestor.
            Stops working. <strong>Trustless fallback:</strong> the heir holding their own wallet at designation time (the recommended primary path) bypasses Escrow entirely. They claim direct from the SBT contract.
          </li>
        </ul>
        <p className="text-xs text-text-muted mt-3">
          Translation: the trustless core protects every paid licence holder. The convenience layer is a layer ON TOP — when present it's nicer; when gone, the core is unaffected.
        </p>
      </section>

      <section className="card">
        <div className="text-[10px] uppercase tracking-[0.22em] text-accent-cyan font-bold mb-2">Self-verify</div>
        <h2 className="text-xl font-bold font-display mb-1">Don't take our word for it</h2>
        <ul className="space-y-2 text-sm text-text-on-dark/85">
          <li>Open <a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">polygonscan.com</a>. Paste any of the {CONTRACTS.length} addresses above. Read the verified source.</li>
          <li>Block <code className="font-mono text-xs">api.noklock.app</code> in your hosts file. Reload this app. Notice nothing changes for contract reads.</li>
          <li>Read the LINK balance + cron history of our Chainlink upkeep at <a href="https://automation.chain.link/polygon" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">automation.chain.link/polygon ↗</a></li>
          <li>For deeper validation — independent audit, formal-method walkthrough, or live-fire test of any specific scenario — email <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>.</li>
        </ul>
      </section>
    </div>
  );
}
