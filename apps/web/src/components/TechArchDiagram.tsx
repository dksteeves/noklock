// @version 0.3.0 @date 2026-05-27
// 0.3.0 — Daniel deploys NoKLockAlerts (Live-Man's Switch) tomorrow. Added
//         it as the 6th contract row in the Polygon-column box; rows shrunk
//         38→38 with slightly tighter spacing so 6 fit in the existing box
//         dimensions without resizing the rest of the diagram. Title
//         updated 5→6; aria-label mentions Alerts + log-trigger.
// 0.2.1 — Daniel font pass: Jura for titles AND subtitles, Inter for
//   everything else (was JetBrains Mono as the default). Default face is
//   now Inter; box headers stay Jura (.ta-title); the descriptor line
//   under each header is Jura too (.ta-sub).
// 0.2.0 — Daniel review fixes:
//   • OVERLAPS gone — Form B's service list, the Chainlink box, and the
//     cross-column arrows used to sit on top of each other. Now four
//     well-separated columns, generous vertical room, and every long
//     cross-column arrow runs in its own clear lane (top lane / bottom
//     lanes) so no line crosses any text.
//   • Readability — sub-text is near-white and larger (no more 9px dark
//     grey); arrow labels sit in open gaps, not over boxes.
//   • Motion — the main data arrows now flow (marching teal dashes), same
//     idiom as the FSM diagram.
// 0.1.0 — initial (cramped; grey too small; arrows overlapped text).

export function TechArchDiagram(): JSX.Element {
  return (
    <div className="my-2">
      <svg
        viewBox="0 0 1320 660"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-5xl mx-auto ta-svg"
        role="img"
        aria-label="Technology architecture: the owner's browser (PWA + crypto-core) writes encrypted shares to the owner's own cloud accounts and sends signed transactions to Polygon's six verified contracts (License, SBT, Oracle, Recovery, Escrow, Alerts); Chainlink Automation calls Oracle.performUpkeep to fire the dead-man's switch and the Alerts log-trigger fires the Live-Man's Switch out-of-band notification; Form B is a read-only proxy + email-NoK attestor + watchdog; the heir's browser runs the same open-source PWA to claim and restore."
      >
        <defs>
          <linearGradient id="taGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7dd3fc" /><stop offset="50%" stopColor="#2dd4bf" /><stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <marker id="taArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2dd4bf" />
          </marker>
          <style>{`
            .ta-svg text { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
            .ta-title { font-family: Jura, sans-serif; font-weight: 700; }
            .ta-sub   { font-family: Jura, sans-serif; font-weight: 600; }
            .ta-rect  { fill: #0b1a2b; stroke: #2dd4bf; stroke-width: 1.6; stroke-opacity: 0.75; }
            .ta-rect-strong { fill: #08131e; stroke: url(#taGrad); stroke-width: 2.2; stroke-opacity: 0.95; }
            .ta-inner { fill: #0e2236; stroke: #2dd4bf; stroke-width: 1; stroke-opacity: 0.45; }
            .ta-base  { fill: none; stroke: #1f3b4d; stroke-width: 3; }
            .ta-flow  { fill: none; stroke: url(#taGrad); stroke-width: 3; stroke-dasharray: 10 12; animation: ta-march 0.95s linear infinite; }
            .ta-boundary { font-family: Inter, sans-serif; font-style: italic; }
            @keyframes ta-march { to { stroke-dashoffset: -22; } }
            @media (prefers-reduced-motion: reduce) { .ta-flow { animation-duration: 6s; } }
          `}</style>
        </defs>

        {/* trust boundary divider */}
        <line x1="305" y1="40" x2="305" y2="600" stroke="#3b4a5e" strokeWidth="1" strokeDasharray="3 6" />
        <text x="305" y="624" textAnchor="middle" className="ta-boundary" fill="#93a4b8" fontSize="11">trust boundary — your device ↔ the public chain</text>

        {/* column headers */}
        <text x="150" y="58" textAnchor="middle" className="ta-boundary" fill="#93a4b8" fontSize="12">owner's device · zero-trust</text>
        <text x="510" y="58" textAnchor="middle" className="ta-boundary" fill="#93a4b8" fontSize="12">Polygon mainnet · public · immutable</text>
        <text x="925" y="58" textAnchor="middle" className="ta-boundary" fill="#93a4b8" fontSize="12">NoKLock-operated · zero-PII · read-only</text>
        <text x="1190" y="58" textAnchor="middle" className="ta-boundary" fill="#93a4b8" fontSize="12">heir's device · symmetric</text>

        {/* ── Col 1: Owner PWA + storage ── */}
        <g>
          <rect className="ta-rect-strong" x="30" y="72" width="240" height="150" rx="12" />
          <text x="150" y="98" textAnchor="middle" className="ta-title" fill="#7dd3fc" fontSize="16">OWNER PWA</text>
          <text x="150" y="118" textAnchor="middle" className="ta-sub" fill="#cbd5e1" fontSize="11.5">noklock.app · service worker</text>
          <line x1="48" y1="130" x2="252" y2="130" stroke="#2dd4bf" strokeOpacity="0.3" />
          <text x="150" y="150" textAnchor="middle" fill="#e2e8f0" fontSize="11.5">@soulchain/crypto-core</text>
          <text x="150" y="168" textAnchor="middle" fill="#93a4b8" fontSize="10.5">Argon2id · SLIP-39 · AEAD · Ed25519</text>
          <line x1="48" y1="180" x2="252" y2="180" stroke="#2dd4bf" strokeOpacity="0.3" />
          <text x="150" y="200" textAnchor="middle" fill="#e2e8f0" fontSize="11.5">enrol · restore · designate</text>
          <text x="150" y="215" textAnchor="middle" fill="#93a4b8" fontSize="10.5">wagmi · viem · WalletConnect</text>
        </g>
        <g>
          <text x="150" y="285" textAnchor="middle" className="ta-boundary" fill="#93a4b8" fontSize="11">your cloud accounts (we hold no tokens)</text>
          {[["Google Drive", 298], ["Dropbox · OneDrive", 336], ["IPFS via Pinata", 374], ["Arweave / others", 412]].map(([label, y]) => (
            <g key={label as string}>
              <rect className="ta-rect" x="30" y={y as number} width="240" height="30" rx="7" />
              <text x="150" y={(y as number) + 19} textAnchor="middle" fill="#e2e8f0" fontSize="11.5">{label}</text>
            </g>
          ))}
        </g>

        {/* ── Col 2: 6 contracts ── */}
        <g>
          <rect className="ta-rect-strong" x="370" y="72" width="280" height="320" rx="12" />
          <text x="510" y="98" textAnchor="middle" className="ta-title" fill="#10b981" fontSize="16">6 NoKLock CONTRACTS</text>
          <text x="510" y="117" textAnchor="middle" className="ta-sub" fill="#93a4b8" fontSize="10.5">all source-verified · Ownable2Step</text>
          {[
            ["NoKLockLicense",  "ERC-1155 · USDC mints · founder cap",       126],
            ["NoKLockSBT",      "ERC-721 · ERC-5192 soulbound",              172],
            ["NoKLockOracle",   "dead-man switch · forwarder-only",          218],
            ["NoKLockRecovery", "M-of-N guardians · 24h timelock",           264],
            ["NoKLockEscrow",   "Hybrid-E email-NoK · EIP-712",              310],
            ["NoKLockAlerts",   "Live-Man's Switch · log-trigger keeper",    356],
          ].map(([name, sub, y]) => (
            <g key={name as string}>
              <rect className="ta-inner" x="386" y={y as number} width="248" height="38" rx="7" />
              <text x="398" y={(y as number) + 16} className="ta-title" fill="#5eead4" fontSize="12">{name}</text>
              <text x="398" y={(y as number) + 30} className="ta-sub" fill="#93a4b8" fontSize="9.5">{sub}</text>
            </g>
          ))}
        </g>

        {/* ── Col 3: Form B + Chainlink ── */}
        <g>
          <rect className="ta-rect-strong" x="790" y="72" width="270" height="248" rx="12" />
          <text x="925" y="98" textAnchor="middle" className="ta-title" fill="#7dd3fc" fontSize="16">FORM B</text>
          <text x="925" y="117" textAnchor="middle" className="ta-sub" fill="#93a4b8" fontSize="10.5">api.noklock.app · Fastify + SQLite</text>
          <line x1="806" y1="128" x2="1044" y2="128" stroke="#2dd4bf" strokeOpacity="0.3" />
          {[
            "RPC proxy (public Polygon)",
            "Indexer (NoKMinted, etc.)",
            "Email-NoK escrow attestor",
            "Heartbeat watcher (read-only)",
            "Email worker (SMTP via cPanel)",
            "Chainlink balance watchdog",
            "Owner-signed audit + flags",
          ].map((line, i) => (
            <text key={line} x="925" y={150 + i * 23} textAnchor="middle" fill="#e2e8f0" fontSize="11.5">{line}</text>
          ))}
        </g>
        <g>
          <rect className="ta-rect" x="790" y="338" width="270" height="66" rx="10" />
          <text x="925" y="362" textAnchor="middle" className="ta-title" fill="#22d3ee" fontSize="13">CHAINLINK AUTOMATION</text>
          <text x="925" y="380" textAnchor="middle" className="ta-sub" fill="#cbd5e1" fontSize="10.5">decentralised keeper network</text>
          <text x="925" y="395" textAnchor="middle" fill="#93a4b8" fontSize="10">forwarder-only → Oracle.performUpkeep</text>
        </g>

        {/* ── Col 4: Heir PWA ── */}
        <g>
          <rect className="ta-rect-strong" x="1090" y="72" width="200" height="248" rx="12" />
          <text x="1190" y="98" textAnchor="middle" className="ta-title" fill="#7dd3fc" fontSize="15">HEIR PWA</text>
          <text x="1190" y="117" textAnchor="middle" className="ta-sub" fill="#93a4b8" fontSize="10.5">noklock.app / nok-claim</text>
          <line x1="1106" y1="128" x2="1274" y2="128" stroke="#2dd4bf" strokeOpacity="0.3" />
          <text x="1190" y="148" textAnchor="middle" fill="#e2e8f0" fontSize="11">@soulchain/crypto-core</text>
          <text x="1190" y="164" textAnchor="middle" fill="#93a4b8" fontSize="10">SAME open-source build</text>
          <line x1="1106" y1="176" x2="1274" y2="176" stroke="#2dd4bf" strokeOpacity="0.3" />
          <text x="1190" y="196" textAnchor="middle" fill="#e2e8f0" fontSize="11">restore · claim · walkthrough</text>
          <text x="1190" y="212" textAnchor="middle" fill="#93a4b8" fontSize="10">decrypts shares locally only</text>
          <line x1="1106" y1="224" x2="1274" y2="224" stroke="#2dd4bf" strokeOpacity="0.3" />
          <text x="1190" y="244" textAnchor="middle" fill="#e2e8f0" fontSize="11">Trust Wallet · MetaMask · any EVM</text>
          <text x="1190" y="260" textAnchor="middle" fill="#93a4b8" fontSize="10">heir makes their own wallet</text>
        </g>

        {/* ════ ARROWS (each in a clear lane, labels in open gaps) ════ */}
        {/* Owner PWA → Contracts (signed txs) — gap col1/col2 at y=120 */}
        <line className="ta-base" x1="270" y1="120" x2="370" y2="120" />
        <line className="ta-flow" x1="270" y1="120" x2="370" y2="120" markerEnd="url(#taArrow)" />
        <text x="320" y="110" textAnchor="middle" fill="#cbd5e1" fontSize="11">signed txs</text>

        {/* Owner PWA → storage (share writes) */}
        <line className="ta-base" x1="150" y1="222" x2="150" y2="296" />
        <line className="ta-flow" x1="150" y1="222" x2="150" y2="296" markerEnd="url(#taArrow)" />
        <text x="214" y="262" textAnchor="middle" fill="#cbd5e1" fontSize="11">share writes</text>

        {/* Form B → Contracts (read) — gap col2/col3 at y=150, arrow points left */}
        <line className="ta-base" x1="790" y1="150" x2="650" y2="150" />
        <line className="ta-flow" x1="790" y1="150" x2="650" y2="150" markerEnd="url(#taArrow)" />
        <text x="720" y="140" textAnchor="middle" fill="#cbd5e1" fontSize="11">eth_getLogs (read)</text>

        {/* Chainlink → Oracle (performUpkeep) — from chainlink box left edge to contracts, lane at y=371 then up */}
        <path className="ta-base" d="M 790 371 L 700 371 L 700 261 L 650 261" />
        <path className="ta-flow" d="M 790 371 L 700 371 L 700 261 L 650 261" markerEnd="url(#taArrow)" />
        <text x="726" y="388" textAnchor="middle" fill="#22d3ee" fontSize="11">performUpkeep()</text>

        {/* Contracts → Heir PWA (SBT mint / activation) — TOP lane y=460 to avoid col3 */}
        <path className="ta-base" d="M 510 392 L 510 460 L 1190 460 L 1190 320" />
        <path className="ta-flow" d="M 510 392 L 510 460 L 1190 460 L 1190 320" markerEnd="url(#taArrow)" />
        <text x="850" y="452" textAnchor="middle" fill="#cbd5e1" fontSize="11">SBT mint · activation event → heir</text>

        {/* Heir PWA → Contracts (claimWithAttestation) — lower lane y=500 */}
        <path className="ta-base" d="M 1140 320 L 1140 500 L 560 500 L 560 392" />
        <path className="ta-flow" d="M 1140 320 L 1140 500 L 560 500 L 560 392" markerEnd="url(#taArrow)" />
        <text x="850" y="516" textAnchor="middle" fill="#cbd5e1" fontSize="11">claimWithAttestation() — heir → chain</text>

        {/* Form B → Owner PWA (cached reads) — bottom lane y=560 */}
        <path className="ta-base" d="M 925 320 L 925 560 L 150 560 L 150 428" />
        <path className="ta-flow" d="M 925 320 L 925 560 L 150 560 L 150 428" markerEnd="url(#taArrow)" />
        <text x="500" y="552" textAnchor="middle" fill="#cbd5e1" fontSize="11">cached reads · founder counter · referral leaderboard</text>

        {/* bottom strap */}
        <text x="660" y="648" textAnchor="middle" fill="#cbd5e1" fontSize="11.5">
          Trust root = the chain. Form B is a convenience cache — NoKLock's servers can disappear and your inheritance still completes via the on-chain path + a public Polygon RPC.
        </text>
      </svg>
    </div>
  );
}
