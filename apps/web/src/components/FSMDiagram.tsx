// @version 0.3.1 @date 2026-05-22
// 0.3.1 — spelling: state label ENROLED → ENROLLED (public-facing typo).
//         Matched on the Info FSM arch tab + Landing FSM box too.
// 0.3.0 — Daniel layout + font rework:
//   • Labels OUT of the gaps — every forward transition now arches OVER the
//     top of the row and its label (designateNoK, heartbeat, …) rides ON
//     that arch, well clear of the boxes. The heartbeat return arcs UNDER
//     the row with its label below. The cramped between-box text is gone.
//   • Even spacing — six happy-path boxes on a fixed 220px pitch, so the
//     gaps are uniform and the arches are identical.
//   • No right-edge clip — viewBox widened to 1320 (matches the tech-arch
//     diagram); ACTIVATED + CLAIMED now sit a full 35px inside the edge.
//   • Fonts — Jura for every title AND subtitle, Inter for everything else
//     (was JetBrains Mono as the default). On-chain anchors stay Inter.
// 0.2.0 — obvious marching-dash flow; near-white larger text; tighter top.
// 0.1.0 — initial (subtle opacity pulse — too faint, grey too small).

import { useT } from "../i18n/index.js";

export function FSMDiagram(): JSX.Element {
  const { t } = useT();
  return (
    <div className="my-2">
      <svg
        viewBox="0 0 1320 470"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-5xl mx-auto fsm-svg"
        role="img"
        aria-label="End-to-end finite state machine: a vault flows ENROLLED to HEIR_DESIGNATED to ALIVE; from ALIVE the wallet either keeps sending heartbeats (back to ALIVE) or lapses to DUE_SOON then IN_GRACE; from IN_GRACE Chainlink performUpkeep transitions to ACTIVATED; the heir then completes claimWithAttestation to CLAIMED. Side states: REVOKED (owner revoke before activation) and RECOVERED (M-of-N guardian recovery)."
      >
        <defs>
          <linearGradient id="fsmGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#7dd3fc" />
            <stop offset="50%"  stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <marker id="fsmArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2dd4bf" />
          </marker>
          <marker id="fsmArrowSide" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <style>{`
            .fsm-svg text { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
            .fsm-title { font-family: Jura, sans-serif; font-weight: 700; }
            .fsm-sub   { font-family: Jura, sans-serif; font-weight: 600; }
            .fsm-rect      { fill: #0b1a2b; stroke: #2dd4bf; stroke-width: 1.8; stroke-opacity: 0.7; }
            .fsm-rect-side { fill: #0b1a2b; stroke: #64748b; stroke-width: 1.4; stroke-opacity: 0.6; stroke-dasharray: 5 4; }

            /* base (dim) connector + the bright flowing overlay on top */
            .fsm-base { fill: none; stroke: #1f3b4d; stroke-width: 3; }
            .fsm-flow { fill: none; stroke: url(#fsmGrad); stroke-width: 3; stroke-dasharray: 10 12;
                        animation: fsm-march 0.9s linear infinite; }
            .fsm-flow-amber { fill: none; stroke: #fbbf24; stroke-width: 2.4; stroke-dasharray: 8 9;
                        animation: fsm-march 1.1s linear infinite; }
            .fsm-side-line { fill: none; stroke: #64748b; stroke-width: 1.6; stroke-opacity: 0.6; stroke-dasharray: 5 5; }
            @keyframes fsm-march { to { stroke-dashoffset: -22; } }

            /* state nodes brighten in sequence (subtle, on top of the flow) */
            .fsm-node { animation: fsm-glow 8s ease-in-out infinite; }
            @keyframes fsm-glow { 0%,100% { opacity: 0.82; } 50% { opacity: 1; } }
            .fsm-n1 { animation-delay: 0s }   .fsm-n2 { animation-delay: .6s }
            .fsm-n3 { animation-delay: 1.2s } .fsm-n4 { animation-delay: 1.8s }
            .fsm-n5 { animation-delay: 2.4s } .fsm-n6 { animation-delay: 3s }
            .fsm-n7 { animation-delay: 3.6s }

            @media (prefers-reduced-motion: reduce) {
              .fsm-flow, .fsm-flow-amber { animation-duration: 6s; }
              .fsm-node { animation: none; opacity: 1; }
            }
          `}</style>
        </defs>

        {/* ── Title (tight) ── */}
        <text x="660" y="26" textAnchor="middle" className="fsm-title" fill="#2dd4bf" fontSize="18">
          {t("fsm.title")}
        </text>
        <text x="660" y="48" textAnchor="middle" className="fsm-sub" fill="#cbd5e1" fontSize="12.5">
          {t("fsm.subtitle")}
        </text>

        {/* ════ HAPPY PATH ════
            Six boxes on a 220px pitch (centres 110·330·550·770·990·1210), each
            W150 (HEIR_DESIGNATED W160), y114–186. Forward transitions ARCH over
            the top (label rides the arch at y84); the heartbeat return ARCS
            under the row (label below at y224). */}

        {/* forward arches (over the top) */}
        {/* 1→2 ENROLLED → HEIR_DESIGNATED */}
        <path className="fsm-base" d="M 185 116 C 208 92 227 92 250 116" />
        <path className="fsm-flow" d="M 185 116 C 208 92 227 92 250 116" markerEnd="url(#fsmArrow)" />
        {/* 2→3 HEIR_DESIGNATED → ALIVE */}
        <path className="fsm-base" d="M 410 116 C 433 92 452 92 475 116" />
        <path className="fsm-flow" d="M 410 116 C 433 92 452 92 475 116" markerEnd="url(#fsmArrow)" />
        {/* 3→4 ALIVE → DUE_SOON (time elapses) */}
        <path className="fsm-base" d="M 625 116 C 648 92 672 92 695 116" />
        <path className="fsm-flow" d="M 625 116 C 648 92 672 92 695 116" markerEnd="url(#fsmArrow)" />
        {/* 4→3 DUE_SOON → ALIVE (heartbeat received — under the row, amber) */}
        <path className="fsm-base" d="M 695 184 C 672 208 648 208 625 184" />
        <path className="fsm-flow-amber" d="M 695 184 C 672 208 648 208 625 184" markerEnd="url(#fsmArrow)" />
        {/* 4→5 DUE_SOON → IN_GRACE (grace elapses) */}
        <path className="fsm-base" d="M 845 116 C 868 92 892 92 915 116" />
        <path className="fsm-flow" d="M 845 116 C 868 92 892 92 915 116" markerEnd="url(#fsmArrow)" />
        {/* 5→6 IN_GRACE → ACTIVATED (performUpkeep) */}
        <path className="fsm-base" d="M 1065 116 C 1088 92 1112 92 1135 116" />
        <path className="fsm-flow" d="M 1065 116 C 1088 92 1112 92 1135 116" markerEnd="url(#fsmArrow)" />
        {/* 6→7 ACTIVATED → CLAIMED (straight down) */}
        <line className="fsm-base" x1="1210" y1="186" x2="1210" y2="256" />
        <line className="fsm-flow" x1="1210" y1="186" x2="1210" y2="256" markerEnd="url(#fsmArrow)" />

        {/* transition labels — riding the arches (above the row) / below for the return */}
        <text x="217"  y="84"  textAnchor="middle" fill="#cbd5e1" fontSize="12">designateNoK()</text>
        <text x="442"  y="84"  textAnchor="middle" fill="#cbd5e1" fontSize="12">heartbeat()</text>
        <text x="660"  y="84"  textAnchor="middle" fill="#cbd5e1" fontSize="12">{t("fsm.transition.timeElapses")}</text>
        <text x="660"  y="228" textAnchor="middle" fill="#fbbf24" fontSize="12">heartbeat() ✓</text>
        <text x="880"  y="84"  textAnchor="middle" fill="#cbd5e1" fontSize="12">{t("fsm.transition.graceElapses")}</text>
        <text x="1100" y="84"  textAnchor="middle" fill="#cbd5e1" fontSize="12">performUpkeep()</text>
        <text x="1232" y="226" textAnchor="middle" fill="#10b981" fontSize="12">claim*()</text>

        {/* state boxes (drawn over connectors) */}
        {[
          { cx: 110,  w: 150, cls: "fsm-n1", name: t("fsm.state.enrolled.name"),       sub: t("fsm.state.enrolled.desc"),       anchor: "manifestHash (local)" },
          { cx: 330,  w: 160, cls: "fsm-n2", name: t("fsm.state.heirDesignated.name"), sub: t("fsm.state.heirDesignated.desc"), anchor: "SBT.balanceOf(heir)" },
          { cx: 550,  w: 150, cls: "fsm-n3", name: t("fsm.state.alive.name"),          sub: t("fsm.state.alive.desc"),          anchor: "Oracle.lastHeartbeat" },
          { cx: 770,  w: 150, cls: "fsm-n4", name: t("fsm.state.dueSoon.name"),        sub: t("fsm.state.dueSoon.desc"),        anchor: "lastHeartbeat + grace" },
          { cx: 990,  w: 150, cls: "fsm-n5", name: t("fsm.state.inGrace.name"),        sub: t("fsm.state.inGrace.desc"),        anchor: "Oracle.pendingActivation" },
          { cx: 1210, w: 150, cls: "fsm-n6", name: t("fsm.state.activated.name"),      sub: t("fsm.state.activated.desc"),      anchor: "SBT.tokenIsActivated" },
        ].map((s) => (
          <g key={s.name} className={`fsm-node ${s.cls}`}>
            <rect className="fsm-rect" x={s.cx - s.w / 2} y="114" width={s.w} height="72" rx="13" />
            <text x={s.cx} y="142" textAnchor="middle" className="fsm-title" fill="#5eead4" fontSize="15">{s.name}</text>
            <text x={s.cx} y="161" textAnchor="middle" className="fsm-sub"   fill="#e2e8f0" fontSize="11.5">{s.sub}</text>
            <text x={s.cx} y="178" textAnchor="middle" fill="#93a4b8" fontSize="10.5">{s.anchor}</text>
          </g>
        ))}

        {/* CLAIMED — terminal, below ACTIVATED, emerald */}
        <g className="fsm-node fsm-n7">
          <rect className="fsm-rect" x="1135" y="256" width="150" height="72" rx="13" style={{ stroke: "#10b981", strokeOpacity: 0.9 }} />
          <text x="1210" y="284" textAnchor="middle" className="fsm-title" fill="#10b981" fontSize="15">{t("fsm.state.claimed.name")}</text>
          <text x="1210" y="303" textAnchor="middle" className="fsm-sub"   fill="#e2e8f0" fontSize="11.5">{t("fsm.state.claimed.desc")}</text>
          <text x="1210" y="320" textAnchor="middle" fill="#93a4b8" fontSize="10.5">SBT.balanceOf(heir)</text>
        </g>

        {/* ════ SIDE STATES ════ */}
        {/* REVOKED — below HEIR_DESIGNATED (cx 330) */}
        <line className="fsm-side-line" x1="330" y1="186" x2="330" y2="294" markerEnd="url(#fsmArrowSide)" />
        <text x="346" y="244" fill="#cbd5e1" fontSize="11">revokeNoK()</text>
        <g>
          <rect className="fsm-rect-side" x="250" y="294" width="160" height="64" rx="11" />
          <text x="330" y="318" textAnchor="middle" className="fsm-title" fill="#cbd5e1" fontSize="13">REVOKED</text>
          <text x="330" y="336" textAnchor="middle" className="fsm-sub"   fill="#cbd5e1" fontSize="10.5">owner revoked NoK</text>
          <text x="330" y="351" textAnchor="middle" fill="#93a4b8" fontSize="10">SBT.revokeNoK() → burn</text>
        </g>

        {/* RECOVERED — below DUE_SOON (cx 770) */}
        <line className="fsm-side-line" x1="770" y1="186" x2="770" y2="294" markerEnd="url(#fsmArrowSide)" />
        <text x="786" y="244" fill="#cbd5e1" fontSize="11">recoverNoK()</text>
        <g>
          <rect className="fsm-rect-side" x="685" y="294" width="170" height="64" rx="11" />
          <text x="770" y="318" textAnchor="middle" className="fsm-title" fill="#cbd5e1" fontSize="13">RECOVERED</text>
          <text x="770" y="336" textAnchor="middle" className="fsm-sub"   fill="#cbd5e1" fontSize="10.5">M-of-N guardians + timelock</text>
          <text x="770" y="351" textAnchor="middle" fill="#93a4b8" fontSize="10">Recovery.executeRecovery()</text>
        </g>

        {/* ════ LEGEND ════ */}
        <line x1="40" y1="420" x2="66" y2="420" className="fsm-flow" />
        <text x="74" y="424" fill="#cbd5e1" fontSize="11">{t("fsm.legend.happyPath")}</text>
        <line x1="330" y1="420" x2="356" y2="420" className="fsm-flow-amber" />
        <text x="364" y="424" fill="#cbd5e1" fontSize="11">{t("fsm.legend.heartbeat")}</text>
        <line x1="660" y1="420" x2="686" y2="420" stroke="#64748b" strokeWidth="1.6" strokeDasharray="5 5" />
        <text x="694" y="424" fill="#cbd5e1" fontSize="11">{t("fsm.legend.sideStates")}</text>
        <text x="40" y="450" fill="#93a4b8" fontSize="10.5">{t("fsm.legend.anchorNote")}</text>
      </svg>
    </div>
  );
}
