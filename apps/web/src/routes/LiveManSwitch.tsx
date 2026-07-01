// @version 0.1.0 @date 2026-05-25
// /live-mans-switch (Advanced nav) — dedicated page for the Live-Man's Switch
// (Daniel 2026-05-25: give it its own page, not just a Settings card; add a
// test/demo). Page = plain-English explainer + a NO-SPEND alert preview (works
// even before the contract is deployed) + the real registration card
// (LiveManSwitchCard, which also has the on-chain "Send test alert") + how-it-
// works + a link to the full Heir-Proof writeup.

import { useState } from "react";
import { Link } from "react-router-dom";
import { LiveManSwitchCard } from "../components/LiveManSwitchCard.js";

export function LiveManSwitch(): JSX.Element {
  const [demo, setDemo] = useState(false);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-display"><span className="grad">Live-Man's Switch</span></h1>
        <p className="text-text-on-dark/80 text-sm mt-2 max-w-2xl">
          The counterpart to the dead-man's switch. A next-of-kin can never trigger your inheritance — only your own silence past the grace period can — and a guardian recovery gives you days to cancel. The Live-Man's Switch makes sure you actually HEAR about it: it reaches you out-of-band (a ping to a wallet you watch, plus an optional email) so you can cancel or check in, even without opening this app.
        </p>
      </header>

      {/* No-spend preview — works even before the contract is deployed */}
      <div className="card">
        <h2 className="font-bold font-display mb-1">See what an alert looks like</h2>
        <p className="text-xs text-text-muted mb-3">A no-cost preview — sends nothing on-chain. This is exactly the in-app banner you'd see; you'd also get the wallet ping (and the optional email).</p>
        <button className="btn btn-secondary text-sm" onClick={() => setDemo((v) => !v)}>
          {demo ? "Hide preview" : "Preview an alert"}
        </button>
        {demo && (
          <div className="mt-3 rounded-lg border border-rose-500/60 bg-rose-900/40 text-rose-50 text-sm px-4 py-2">
            ⚠ A wallet recovery was started against your wallet.{" "}
            <strong>If this wasn't you, cancel it before &lt;your cancellation deadline&gt;.</strong>{" "}
            <span className="underline font-semibold">Review &amp; cancel →</span>
            <span className="ml-2 text-xs opacity-70">(preview — not a real alert)</span>
          </div>
        )}
      </div>

      {/* The real registration + the on-chain "Send test alert" */}
      <LiveManSwitchCard />

      <div className="card">
        <h2 className="font-bold font-display mb-2">How it works</h2>
        <ul className="space-y-2 text-sm text-text-on-dark/90 list-disc list-inside">
          <li><strong>Register watchers + fund.</strong> Add 1–2 wallets you check regularly (not this one) and pre-fund a little POL. Stored on-chain; pings can only ever go to your own registered wallets.</li>
          <li><strong>If a recovery is started against you</strong>, each watcher gets a tiny POL ping — most wallet apps surface an incoming transfer — plus a permanent on-chain record. Turn on incoming-transfer notifications in your wallet so you don't miss it.</li>
          <li><strong>You cancel in time.</strong> If it wasn't you, cancel the recovery from your wallet within the window (1–30 days, default 7). If it was a real loss, do nothing and recovery completes.</li>
          <li><strong>Self-funded + on-chain</strong> — you fund your own pings, so it keeps working even if NoKLock disappears.</li>
          <li><strong>Optional email</strong> (off by default) — reliable delivery, but it depends on NoKLock's server. The wallet ping does not.</li>
        </ul>
        <p className="text-xs text-text-muted mt-3">
          Honest about it: a wallet push is best-effort (MetaMask mobile notifies by default; some wallets need notifications switched on) — the on-chain record is always there. Full writeup: <Link to="/info?tab=architecture" className="text-accent-cyan underline">Info → Architecture → Heir-Proof</Link>.
        </p>
      </div>
    </div>
  );
}
