// @version 0.4.1 @date 2026-05-21
// 0.4.1 — Daniel 2026-05-21: the input box now reflects all 4 supported
//         content types (seed, letter, document, image). The previous
//         "YOUR SEED · 12 or 24 words" box implied seed-only; veracity
//         gap closed. Box height grown 70 → 100, vertically centred on
//         y=190 to keep the arrow line. Header `diag.yourSeed` re-valued
//         to "YOUR CONTENT" across all 6 locales (key name preserved to
//         minimise churn). diag.seedWords no longer rendered.
// 0.4.0 — i18n: non-technical labels + the local-only tagline are now
//         keyed t() (fully translated 6 locales). Technical tokens
//         (ARGON2id, SLIP-39, AES-GCM, ERC-5192, Polygon, provider
//         names…) deliberately stay literal — universal.
// 0.3.1 — WS-B/veracity: tagline "...or your passkey" → "...or your
//         master password" (the entered secret is the master password;
//         passkey is a separate optional WebAuthn feature).
//
// 0.3.0 — adopted Daniel's TenzaONE animation style (longer dashes,
//         slower flow, rounded caps, hover glow on nodes). Fixed the
//         Chainlink/Arweave overlap by moving the dead-man to its own
//         bottom-right corner. Reduced overall height + removed the
//         vertical padding gap that was making the section feel hollow.
//
// 0.2.0 — staggered fade + flowing arrows + breathing glow.

import { useT } from "../i18n/index.js";

export function HeroDiagram(): JSX.Element {
  const { t } = useT();
  return (
    <div className="hero-diagram-canvas">
      <style>{HERO_CSS}</style>
      <svg
        viewBox="0 0 1200 380"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-5xl mx-auto"
        role="img"
        aria-label="Animated diagram showing your content (seed phrase, sealed letter, document, or image) being derived, split into 5 encrypted shares, distributed across cloud providers, plus a soul-bound NFT minted to next-of-kin on Polygon with a Chainlink dead-man's switch."
      >
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#7dd3fc" />
            <stop offset="45%"  stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <marker id="heroArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 0 6 L 7 3 z" fill="#2dd4bf" opacity="0.85" />
          </marker>
        </defs>

        {/* --- Row 1 horizontal pipeline: Seed → Argon → Split → fanout --- */}

        {/* Content input — Daniel 2026-05-21: was "YOUR SEED · 12 or 24 words";
            updated to reflect the 4 supported content types (seed, letter,
            document, image). Box taller (h=100) to fit the stacked listing
            but vertically centred on y=190 to keep the arrow alignment with
            the rest of the row. Reuses diag.yourSeed i18n key as the header
            (re-valued to "YOUR CONTENT" in every locale). */}
        <g className="hero-node" style={{ color: "#7dd3fc" }}>
          <rect className="hero-node-rect" x="20" y="140" width="170" height="100" rx="10"
                fill="#0a1626" stroke="#7dd3fc" strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="4 3" />
          <text x="105" y="170" textAnchor="middle" fill="#7dd3fc" fontSize="14" fontFamily="Jura" fontWeight="700">{t("diag.yourSeed")}</text>
          <text x="105" y="195" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="JetBrains Mono">seed · letter</text>
          <text x="105" y="213" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="JetBrains Mono">document · image</text>
          <circle cx="178" cy="155" r="3" fill="#7dd3fc" className="hero-pulse-dot" />
        </g>

        {/* Argon2id KDF */}
        <g className="hero-node" style={{ color: "#2dd4bf" }}>
          <rect className="hero-node-rect" x="240" y="155" width="170" height="70" rx="10"
                fill="#0a1626" stroke="#2dd4bf" strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="4 3" />
          <text x="325" y="190" textAnchor="middle" fill="#2dd4bf" fontSize="14" fontFamily="Jura" fontWeight="700">ARGON2id</text>
          <text x="325" y="208" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">m=64MiB · t=3 · p=4</text>
        </g>

        {/* Split + Encrypt — emphasised */}
        <g className="hero-node hero-node-strong" style={{ color: "#10b981" }}>
          <rect className="hero-node-rect" x="460" y="140" width="200" height="100" rx="12"
                fill="#08131e" stroke="url(#heroGrad)" strokeWidth="2" strokeOpacity="0.85" />
          <text x="560" y="170" textAnchor="middle" fill="#10b981" fontSize="14" fontFamily="Jura" fontWeight="700">{t("diag.splitEncrypt")}</text>
          <text x="560" y="190" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="JetBrains Mono">SLIP-39 · 3-of-5</text>
          <text x="560" y="208" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="JetBrains Mono">AES-GCM | XChaCha20</text>
          <text x="560" y="226" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="JetBrains Mono">Ed25519 manifest sig</text>
        </g>

        {/* Flowing arrows on Row 1 */}
        <path className="hero-flow" d="M 190 190 C 210 190 220 190 240 190" markerEnd="url(#heroArrow)" />
        <path className="hero-flow" d="M 410 190 C 430 190 440 190 460 190" markerEnd="url(#heroArrow)" />

        {/* --- Fanout to 5 share destinations --- */}
        {[0, 1, 2, 3, 4].map((i) => {
          // Targets at x=900..1080, y=20..280 spaced
          const targetY = 30 + i * 60;
          return (
            <path
              key={i}
              className="hero-flow"
              d={`M 660 190 C 760 190 800 ${targetY + 21} 900 ${targetY + 21}`}
              markerEnd="url(#heroArrow)"
            />
          );
        })}

        {/* Share destinations — vertical column right side */}
        {[
          { label: "Google Drive", sub: "share 1" },
          { label: "Dropbox",      sub: "share 2" },
          { label: "OneDrive",     sub: "share 3" },
          { label: "IPFS · Pinata",sub: "share 4" },
          { label: "Arweave",      sub: "share 5" },
        ].map((d, i) => {
          const y = 30 + i * 60;
          return (
            <g key={d.label} className="hero-node" style={{ color: "#38bdf8" }}>
              <rect className="hero-node-rect" x="900" y={y} width="180" height="42" rx="8"
                    fill="#08131e" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 3" />
              <text x="990" y={y + 18} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontFamily="Inter">{d.label}</text>
              <text x="990" y={y + 33} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">{d.sub} · ~1 KB</text>
            </g>
          );
        })}

        {/* --- Row 2: NoK + Dead-man at bottom (no overlap with shares) --- */}

        {/* Vertical drop from Split → NoK */}
        <path className="hero-flow" d="M 560 240 C 560 270 560 280 560 300" markerEnd="url(#heroArrow)" />

        {/* Soul-bound NFT — emphasised */}
        <g className="hero-node hero-node-strong" style={{ color: "#10b981" }}>
          <rect className="hero-node-rect" x="460" y="300" width="200" height="70" rx="12"
                fill="#08131e" stroke="url(#heroGrad)" strokeWidth="2" strokeOpacity="0.85" />
          <text x="560" y="328" textAnchor="middle" fill="#10b981" fontSize="13" fontFamily="Jura" fontWeight="700">{t("diag.sbt")}</text>
          <text x="560" y="346" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">ERC-5192 · Polygon</text>
          <text x="560" y="362" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">{t("diag.nokWallet")}</text>
        </g>

        {/* Horizontal arrow NoK → Chainlink */}
        <path className="hero-flow" d="M 660 335 C 700 335 720 335 770 335" markerEnd="url(#heroArrow)" />

        {/* Chainlink dead-man — bottom-right corner */}
        <g className="hero-node" style={{ color: "#22d3ee" }}>
          <circle className="hero-node-rect" cx="830" cy="335" r="38"
                  fill="#08131e" stroke="url(#heroGrad)" strokeWidth="2" strokeOpacity="0.85" />
          <text x="830" y="332" textAnchor="middle" fill="#22d3ee" fontSize="11" fontFamily="Jura" fontWeight="700">CHAINLINK</text>
          <text x="830" y="348" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">{t("diag.deadman")}</text>
        </g>

        {/* Tagline — bigger + brighter per Daniel feedback */}
        <text x="600" y="22" textAnchor="middle" fill="#e2e8f0" fontSize="15" fontFamily="Inter" fontWeight="600">
          {t("diag.localOnly")}
        </text>
      </svg>
    </div>
  );
}

const HERO_CSS = `
  /* Canvas — own panel, no parent padding bleeding through */
  .hero-diagram-canvas {
    background: #070c18;
    padding: 16px;
    border-radius: 14px;
    width: 100%;
    overflow-x: auto;
  }

  /* Nodes — hover glow per Daniel's TenzaONE sample */
  .hero-node {
    cursor: pointer;
  }
  .hero-node-rect {
    transition: filter 0.25s, stroke-opacity 0.25s;
  }
  .hero-node:hover .hero-node-rect {
    filter: brightness(1.35) drop-shadow(0 0 8px currentColor);
    stroke-opacity: 1;
  }

  /* Flowing arrows — matches the TenzaONE flow-slow style */
  .hero-flow {
    fill: none;
    stroke: #2dd4bf;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-dasharray: 14 8;
    opacity: 0.7;
    animation: heroFlowFwd 2.5s linear infinite;
  }
  @keyframes heroFlowFwd {
    to { stroke-dashoffset: -44; }
  }

  /* Strong nodes (the two brand-gradient boxes + Chainlink) — gentle breathing */
  .hero-node-strong .hero-node-rect {
    animation: heroBreathe 4s ease-in-out infinite;
  }
  @keyframes heroBreathe {
    0%, 100% { filter: drop-shadow(0 0 0 rgba(45, 212, 191, 0)); }
    50%      { filter: drop-shadow(0 0 10px rgba(45, 212, 191, 0.45)); }
  }

  /* Pulsing dot on the seed input */
  .hero-pulse-dot {
    transform-origin: center;
    transform-box: fill-box;
    animation: heroPulse 1.8s ease-in-out infinite;
  }
  @keyframes heroPulse {
    0%, 100% { transform: scale(1);   opacity: 0.6; }
    50%      { transform: scale(2.2); opacity: 1.0; }
  }

  /* Reduced-motion preference */
  @media (prefers-reduced-motion: reduce) {
    .hero-flow, .hero-node-strong .hero-node-rect, .hero-pulse-dot {
      animation: none;
    }
  }
`;
