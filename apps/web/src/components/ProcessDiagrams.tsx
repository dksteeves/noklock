// @version 0.7.0 @date 2026-06-04
// 0.7.0 — Daniel 2026-06-04: REMOVE the dotted cyan AIRGAPPED box from
//         EnrolFlow + RestoreFlow. The box wrapped only a partial offline
//         region (e.g. enrol box covered 2,3 + 7,8 but NOT 4,5,6 which are
//         also offline), making it actively misleading. Replaced with a
//         compact color LEGEND at the top of each diagram: yellow square =
//         AIRGAPPED (offline), green square = CONNECTED (online), half-yellow/
//         half-green square = BOUNDARY (online↔offline transition step).
//         Each step's individual yellow/green/half color already encodes the
//         state — the legend explains it. Caption updated accordingly.
// @version 0.6.0 @date 2026-06-02
// 0.6.0 — 2-row redesign (Daniel 2026-06-02): EnrolFlow + RestoreFlow promoted
//         from single-row 1180x260 to 2-row ~1180x520 with the airgap boundary
//         INSIDE the process (not first-N-then-online-1). Enrol now has 10
//         steps: 1 ONLINE (begin/connect) → 2 BOUNDARY (go offline) → 3-7
//         OFFLINE (seed/Argon/split/AEAD/manifest) → 8 BOUNDARY (distribute)
//         → 9-10 ONLINE (optional NoK mint, done). Restore now has 8 steps:
//         1 ONLINE (gather) → 2 BOUNDARY (go offline) → 3-8 OFFLINE. Both
//         diagrams: dotted cyan box (1.5px dashed #06b6d4) around the OFFLINE
//         region, AIRGAPPED label top-left; ONLINE steps green-tint
//         (#0f1f15/#22c55e); OFFLINE yellow-tint (#1f1d0f/#eab308); BOUNDARY
//         half-and-half (split fill). NoK mint marked optional (dashed
//         border) — only relevant if user designates an heir.
// 0.5.0 — Online/offline transition pass (Daniel 2026-06-01): EnrolFlow + RestoreFlow
//         now visualise the airgap boundary explicitly. Dotted box labelled
//         "AIRGAPPED — offline" encloses the offline steps (seed/Argon/split/
//         AEAD/manifest in enrol; sig-verify/Argon/AEAD/combine/seed-back in
//         restore). Online steps (Distribute = post-manifest upload of share
//         vaults to chosen storage URLs; Gather = heir collects K share-vaults
//         online before going offline) sit outside the box with crossing
//         arrows that label the boundary transition. Matches the new
//         "distribute" + "gather" viz steps in /enrol/seed pipeline and the
//         /restore "force offline" step. Tooltips reworded to call out
//         the online↔offline transition at each crossing.
// 0.4.0 — Daniel reframe: protection is the primary use case (most users
//         worry about losing a seed / having it accessed by someone — not
//         about dying). Inheritance is the OPTIONAL layer on top. Updated:
//         (a) top intro paragraph names this directly; (b) flows grouped
//         into two visual sections: "Foundation — protect your secret"
//         (Enrol / Restore / Duress) and "Optional — let someone inherit
//         it" (NoK + dead-man / Multi-NoK quorum / Live-Man's Switch);
//         (c) Duress moved from §4 to §3 so all protection flows sit
//         together before the inheritance divider. Section numbering kept
//         monotonic 1-6 so deep-links don't break.
// 0.3.5 — Flow-accuracy audit (Daniel item a2). EnrolFlow "Download":
//         now states files leave via download OR a picked local folder
//         (no cloud push) + per-account spread. RestoreFlow: nothing is
//         auto-fetched — restore works from the share FILES you supply;
//         the URL fetch is one-direct-link-at-a-time. Removed the false
//         "fetch share URLs from the manifest" / "share-URL manifest is
//         released" claims in NokFlow + MultiNokFlow (the manifest holds
//         NO URLs and the contract stores/releases none — it authorizes;
//         the NoK recovers from the locations the owner provisioned).
// 0.3.4 — WS-H: one zero-PII "how_it_works_run" event on first
//         interaction with the process explainer (once per mount).
// 0.3.3 — WS-B/veracity: the user-facing diagram tooltips + the duress
//         intro still called the master password a "passkey" (the old
//         misnomer the rest of the app already fixed). All 9 user-facing
//         "passkey" references here → "master password" / "duress master
//         password"; the real WebAuthn passkey is a separate optional
//         feature (see Info → Passkeys & access), not what these show.
// 0.3.2 — Veracity: Designate-step tooltip "Phase 3: ... email" → "On the
//         roadmap: ... email" (we don't publish a phase roadmap; email
//         designation is not yet user-exposed).
// 0.3.1 — Round 3 wave 2: NokFlow viewBox -30..430 (was 0..360) so "yes →
//         re-arm" curve label has top room; bottom captions moved y=325→365
//         and y=345→388 so they no longer overlap step 5/6 sub labels.
// 0.3.0 — Round 3 polish: replace SVG native <title> tooltips (browser-default
//         styling, slow delay, no wrap control) with a React-state popover.
//         Single popover element, positioned by mouse coords, max-width 280px,
//         dark bg + light text, immediate response. Step + decision-diamond
//         <g> handlers wired through onTip prop drill.
// 0.2.0 — Caption/sub typography bumped (12→14, 10→12) and brightness raised
//         (#64748b → #94a3b8 for subs and footer). Yes/No labels on the
//         NoK decision diamond moved to sit ON the arrows so it's clear
//         which arrow each label belongs to. Every Step accepts an optional
//         tooltip rendered as a hover-only <title>. Two new diagrams added:
//         DuressFlow + MultiNokFlow.
//
// ProcessDiagrams — five SVG flow diagrams rendered on /info?tab=process:
//   1. Enrolment pipeline
//   2. Restore pipeline
//   3. NoK trigger + dead-man's switch on-chain flow
//   4. Duress (decoy vault on coercion)
//   5. Multi-NoK quorum (M-of-N voting)
//
// Style: matches the TenzaONE numbered-circles-with-arrows visual idiom +
// NoKLock brand gradient. Plain SVG inline, no external assets.

import { useRef, useState } from "react";
import { trackEvent } from "../lib/track.js";

interface Tip {
  readonly text: string;
  readonly x: number;
  readonly y: number;
}
type TipFn = (tip: Tip | null) => void;

export function ProcessDiagrams(): JSX.Element {
  const [tip, setTip] = useState<Tip | null>(null);
  // WS-H: count one "how it works" engagement per mount, on first
  // interaction with the process explainer (zero-PII aggregate).
  const fired = useRef(false);
  const onTip: TipFn = (t) => {
    if (t && !fired.current) { fired.current = true; trackEvent("how_it_works_run"); }
    setTip(t);
  };
  return (
    <div className="space-y-8" onMouseLeave={() => setTip(null)}>
      {/* Top intro — frames the page around protection first, inheritance optional */}
      <div className="card border-accent-cyan/30">
        <p className="text-sm text-text-on-dark/85">
          NoKLock has one job before anything else: make sure you can&apos;t lose a seed phrase / sealed letter / document / image, and that nobody else can access it either. That&apos;s flows <strong>1&ndash;3</strong> below (Enrol / Restore / Duress) and they cover most users on their own. Flows <strong>4&ndash;6</strong> add an <strong>optional</strong> layer: letting someone you choose inherit the vault when you stop checking in. Skip the second half entirely if you just want personal backup.
        </p>
      </div>

      {/* ───────── Foundation — protect your secret ───────── */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold font-display shrink-0"><span className="grad">Foundation &mdash; protect your secret</span></h2>
        <div className="flex-1 h-px bg-accent-cyan/20" />
      </div>

      <section className="card">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">1. Enrolment</span></h2>
        <p className="text-sm text-text-on-dark/80 mb-4">Ten steps across two rows. <strong>Top row</strong>: step 1 begins online (wallet connect) &rarr; step 2 is the <strong>boundary</strong> crossing where the airgap is armed &rarr; steps 3&ndash;5 (seed entry, Argon2id, SLIP-39 split) run offline. <strong>Bottom row</strong>: steps 6&ndash;7 (per-share AEAD, manifest sign) finish the cryptography offline &rarr; step 8 is the <strong>boundary</strong> back online (distribute encrypted vaults to the storage URLs you chose) &rarr; step 9 is the optional on-chain NoK mint (only if you designate an heir) &rarr; step 10 = done. The dotted cyan box is the <strong>airgap boundary</strong>; boundary steps sit half-inside, half-outside to show the transition. Hover any step for detail.</p>
        <div className="w-full overflow-x-auto">
          <EnrolFlow onTip={onTip} />
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">2. Restore</span></h2>
        <p className="text-sm text-text-on-dark/80 mb-4">Eight steps across two rows. <strong>Top row</strong>: step 1 begins online (gather K share-vaults from where they were distributed) &rarr; step 2 is the <strong>boundary</strong> crossing where the airgap is forced back on &rarr; steps 3&ndash;4 (drop files / paste URLs, master password + Argon2id) run offline. <strong>Bottom row</strong>: steps 5&ndash;8 (verify manifest, decrypt shares, Shamir recombine, seed recovered) finish entirely offline &mdash; the seed never leaves the browser. The dotted cyan box is the <strong>airgap boundary</strong>; step 2 sits half-inside, half-outside to show the transition. Hover any step for detail.</p>
        <div className="w-full overflow-x-auto">
          <RestoreFlow onTip={onTip} />
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">3. Duress (coercion defence)</span></h2>
        <p className="text-sm text-text-on-dark/80 mb-4">If someone forces you to open NoKLock at gunpoint or wrench (the $5-wrench attack), you give them the duress master password. They unlock a believable, low-value decoy vault. Your real vault stays untouched and indistinguishable on disk. Hover any step for detail.</p>
        <div className="w-full overflow-x-auto">
          <DuressFlow onTip={onTip} />
        </div>
      </section>

      {/* ───────── Optional — let someone inherit it ───────── */}
      <div className="flex items-center gap-3 pt-4">
        <h2 className="text-2xl font-bold font-display shrink-0"><span className="grad">Optional &mdash; let someone inherit it</span></h2>
        <div className="flex-1 h-px bg-accent-cyan/20" />
      </div>
      <p className="text-sm text-text-muted -mt-4">Everything below this line is opt-in. Your Step&nbsp;1 vaults work fine without any of it.</p>

      <section className="card">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">4. NoK + dead-man&apos;s switch</span></h2>
        <p className="text-sm text-text-on-dark/80 mb-4">How designation + heartbeat + grace + activation chain together. All on-chain except the off-chain heartbeat shortcut (free path) which any user can replace with a direct on-chain selfHeartbeat call. Hover any step for detail.</p>
        <div className="w-full overflow-x-auto">
          <NokFlow onTip={onTip} />
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">5. Multi-NoK quorum</span></h2>
        <p className="text-sm text-text-on-dark/80 mb-4">Each NoK is a different person with their own wallet. After the dead-man&apos;s switch fires, the contract waits for M-of-N votes (e.g. 2-of-3) from those independent wallets before release. No single NoK can act alone &mdash; defends against any one being coerced, compromised, or colluding. Hover any step for detail.</p>
        <div className="w-full overflow-x-auto">
          <MultiNokFlow onTip={onTip} />
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">6. Live-Man&apos;s Switch (Heir-Proof)</span></h2>
        <p className="text-sm text-text-on-dark/80 mb-4">A next-of-kin can&apos;t trigger inheritance, and a guardian recovery gives you days to cancel &mdash; but only if you know it started. You register where to reach you; if a recovery is started against your wallet you&apos;re pinged out-of-band so you can cancel in time. Self-funded + on-chain, so it survives even if NoKLock disappears. Hover any step for detail.</p>
        <div className="w-full overflow-x-auto">
          <LiveManSwitchFlow onTip={onTip} />
        </div>
      </section>

      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 max-w-xs px-3 py-2 rounded bg-bg-deepest text-text-on-dark text-xs leading-relaxed shadow-lg border border-accent-cyan/40"
          style={{
            left: Math.min(tip.x + 14, (typeof window !== "undefined" ? window.innerWidth : 1200) - 320),
            top: tip.y + 14,
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}

// Just the two next-of-kin diagrams (designation→dead-man + multi-NoK quorum),
// with the same hover-tooltip mechanism. Used on the /nok Info sub-tab.
export function NokDiagrams(): JSX.Element {
  const [tip, setTip] = useState<Tip | null>(null);
  const fired = useRef(false);
  const onTip: TipFn = (t) => { if (t && !fired.current) { fired.current = true; trackEvent("how_it_works_run"); } setTip(t); };
  return (
    <div className="space-y-8" onMouseLeave={() => setTip(null)}>
      <section className="card">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">Designation → dead-man's switch</span></h2>
        <p className="text-sm text-text-on-dark/80 mb-4">How naming a next-of-kin chains into the on-chain trigger: you designate an heir → the contract mints one soulbound Activation NFT (M-of-N quorum vaults add a Voting NFT per heir) → the Activation token sits inert and queued → while your heartbeats arrive, nothing happens → if they stop for your whole grace window, Chainlink Automation fires activation and the heir can claim. Hover any step for detail.</p>
        <div className="w-full overflow-x-auto"><NokFlow onTip={onTip} /></div>
      </section>
      <section className="card">
        <h2 className="text-xl font-bold font-display mb-2"><span className="grad">Multi-NoK quorum (M-of-N)</span></h2>
        <p className="text-sm text-text-on-dark/80 mb-4">When you name several heirs, release waits for M-of-N votes (e.g. 2-of-3) from their independent wallets after the switch fires. No single heir can act alone — it defends against any one being coerced, compromised, or colluding. Hover any step for detail.</p>
        <div className="w-full overflow-x-auto"><MultiNokFlow onTip={onTip} /></div>
      </section>
      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 max-w-xs px-3 py-2 rounded bg-bg-deepest text-text-on-dark text-xs leading-relaxed shadow-lg border border-accent-cyan/40"
          style={{
            left: Math.min(tip.x + 14, (typeof window !== "undefined" ? window.innerWidth : 1200) - 320),
            top: tip.y + 14,
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}

const COMMON_DEFS = (
  <defs>
    <linearGradient id="pfGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stopColor="#7dd3fc" />
      <stop offset="45%"  stopColor="#2dd4bf" />
      <stop offset="100%" stopColor="#10b981" />
    </linearGradient>
    <marker id="pfArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
    </marker>
  </defs>
);

function tipHandlers(tooltip: string | undefined, onTip: TipFn) {
  if (!tooltip) return {};
  return {
    onMouseEnter: (e: React.MouseEvent) => onTip({ text: tooltip, x: e.clientX, y: e.clientY }),
    onMouseMove:  (e: React.MouseEvent) => onTip({ text: tooltip, x: e.clientX, y: e.clientY }),
    onMouseLeave: () => onTip(null),
    onFocus:      (e: React.FocusEvent) => {
      const r = (e.currentTarget as unknown as Element).getBoundingClientRect();
      onTip({ text: tooltip, x: r.left + r.width / 2, y: r.top });
    },
    onBlur: () => onTip(null),
    tabIndex: 0,
  };
}

function Step({ x, y, n, label, sub, tooltip, onTip }: {
  readonly x: number;
  readonly y: number;
  readonly n: number;
  readonly label: string;
  readonly sub?: string;
  readonly tooltip?: string;
  readonly onTip: TipFn;
}): JSX.Element {
  return (
    <g style={{ cursor: tooltip ? "help" : "default" }} {...tipHandlers(tooltip, onTip)}>
      <circle cx={x} cy={y} r="28" fill="#162032" stroke="url(#pfGrad)" strokeWidth="2" />
      <text x={x} y={y + 5} textAnchor="middle" fill="#e2e8f0" fontSize="16" fontFamily="Jura" fontWeight="700">{n}</text>
      <text x={x} y={y + 52} textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="Inter" fontWeight="600">{label}</text>
      {sub && <text x={x} y={y + 70} textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="JetBrains Mono">{sub}</text>}
    </g>
  );
}

function arrowLine(x1: number, y1: number, x2: number, y2: number): JSX.Element {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pfArrow)" />;
}

// 0.6.0 — typed step box for the airgap diagrams. "online" = subtle green
// tint; "offline" = subtle yellow tint; "boundary" = half-and-half split
// (left half green/online, right half yellow/offline, dashed centre line
// to suggest the transition). Renders as a rounded rectangle (not the
// gradient circle used by the generic Step) so the colour coding reads
// at a glance across both rows.
type StepKind = "online" | "offline" | "boundary";
function StepBox({ x, y, n, label, sub, tooltip, kind, optional, onTip }: {
  readonly x: number;
  readonly y: number;
  readonly n: number;
  readonly label: string;
  readonly sub?: string;
  readonly tooltip?: string;
  readonly kind: StepKind;
  readonly optional?: boolean;
  readonly onTip: TipFn;
}): JSX.Element {
  const w = 130, h = 70;
  const left = x - w / 2;
  const top = y - h / 2;
  const onlineFill = "#0f1f15";
  const onlineStroke = "#22c55e";
  const offlineFill = "#1f1d0f";
  const offlineStroke = "#eab308";
  const strokeDash = optional ? "5 3" : undefined;
  return (
    <g style={{ cursor: tooltip ? "help" : "default" }} {...tipHandlers(tooltip, onTip)}>
      {kind === "boundary" ? (
        <>
          {/* Left half — online (green) */}
          <path d={`M ${left + 10} ${top} L ${left + w / 2} ${top} L ${left + w / 2} ${top + h} L ${left + 10} ${top + h} Q ${left} ${top + h} ${left} ${top + h - 10} L ${left} ${top + 10} Q ${left} ${top} ${left + 10} ${top} Z`} fill={onlineFill} stroke={onlineStroke} strokeWidth="1.8" strokeDasharray={strokeDash} />
          {/* Right half — offline (yellow) */}
          <path d={`M ${left + w / 2} ${top} L ${left + w - 10} ${top} Q ${left + w} ${top} ${left + w} ${top + 10} L ${left + w} ${top + h - 10} Q ${left + w} ${top + h} ${left + w - 10} ${top + h} L ${left + w / 2} ${top + h} Z`} fill={offlineFill} stroke={offlineStroke} strokeWidth="1.8" strokeDasharray={strokeDash} />
          {/* Centre transition line */}
          <line x1={left + w / 2} y1={top + 4} x2={left + w / 2} y2={top + h - 4} stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
        </>
      ) : (
        <rect x={left} y={top} width={w} height={h} rx={10}
              fill={kind === "online" ? onlineFill : offlineFill}
              stroke={kind === "online" ? onlineStroke : offlineStroke}
              strokeWidth="1.8"
              strokeDasharray={strokeDash} />
      )}
      <text x={x} y={y - 14} textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="Jura" fontWeight="700">{n}</text>
      <text x={x} y={y + 4} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontFamily="Inter" fontWeight="600">{label}</text>
      {sub && <text x={x} y={y + 22} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">{sub}</text>}
      {optional && <text x={x} y={top - 6} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700">OPTIONAL</text>}
    </g>
  );
}

// Compact color legend for the Enrol + Restore flow SVGs. Three swatches:
// yellow = AIRGAPPED (offline), green = CONNECTED (online), half-and-half =
// BOUNDARY (the online↔offline transition step itself).
function FlowLegend({ x, y }: { readonly x: number; readonly y: number }): JSX.Element {
  const sw = 14;           // swatch size
  const gap = 6;            // swatch-to-label gap
  const labelGap = 28;      // label-to-next-swatch gap
  const onlineFill = "#0f1f15";
  const onlineStroke = "#22c55e";
  const offlineFill = "#1f1d0f";
  const offlineStroke = "#eab308";
  // Layout: [swatch][label][gap][swatch][label][gap][swatch][label]
  const yMid = y + sw / 2 + 4; // baseline alignment
  const x0 = x;
  const x0Label = x0 + sw + gap;
  const w1 = 110;
  const x1 = x0Label + w1 + labelGap;
  const x1Label = x1 + sw + gap;
  const w2 = 110;
  const x2 = x1Label + w2 + labelGap;
  const x2Label = x2 + sw + gap;
  return (
    <g aria-label="Legend: yellow is airgapped (offline); green is connected (online); half-and-half is the boundary transition step">
      {/* Connected (green) */}
      <rect x={x0} y={y} width={sw} height={sw} rx={3} fill={onlineFill} stroke={onlineStroke} strokeWidth="1.5" />
      <text x={x0Label} y={yMid + 4} fill="#cbd5e1" fontSize="11" fontFamily="Inter" fontWeight="600">connected (online)</text>
      {/* Airgapped (yellow) */}
      <rect x={x1} y={y} width={sw} height={sw} rx={3} fill={offlineFill} stroke={offlineStroke} strokeWidth="1.5" />
      <text x={x1Label} y={yMid + 4} fill="#cbd5e1" fontSize="11" fontFamily="Inter" fontWeight="600">airgapped (offline)</text>
      {/* Boundary (half-and-half) */}
      <g>
        <path d={`M ${x2 + 3} ${y} L ${x2 + sw / 2} ${y} L ${x2 + sw / 2} ${y + sw} L ${x2 + 3} ${y + sw} Q ${x2} ${y + sw} ${x2} ${y + sw - 3} L ${x2} ${y + 3} Q ${x2} ${y} ${x2 + 3} ${y} Z`} fill={onlineFill} stroke={onlineStroke} strokeWidth="1.5" />
        <path d={`M ${x2 + sw / 2} ${y} L ${x2 + sw - 3} ${y} Q ${x2 + sw} ${y} ${x2 + sw} ${y + 3} L ${x2 + sw} ${y + sw - 3} Q ${x2 + sw} ${y + sw} ${x2 + sw - 3} ${y + sw} L ${x2 + sw / 2} ${y + sw} Z`} fill={offlineFill} stroke={offlineStroke} strokeWidth="1.5" />
      </g>
      <text x={x2Label} y={yMid + 4} fill="#cbd5e1" fontSize="11" fontFamily="Inter" fontWeight="600">boundary (transition step)</text>
    </g>
  );
}

function EnrolFlow({ onTip }: { readonly onTip: TipFn }): JSX.Element {
  // 0.7.0 — 2-row layout, 10 steps. Row 1: 1 ONLINE, 2 BOUNDARY, 3-5 OFFLINE.
  // Row 2: 6-7 OFFLINE, 8 BOUNDARY, 9 ONLINE (OPTIONAL NoK mint), 10 ONLINE.
  // Legend at top: yellow = AIRGAPPED, green = CONNECTED, half = BOUNDARY.
  const row1 = 130;
  const row2 = 380;
  const r1x0 = 110, r1x1 = 320, r1x2 = 530, r1x3 = 740, r1x4 = 950;
  const r2x0 = 110, r2x1 = 320, r2x2 = 530, r2x3 = 740, r2x4 = 950;
  return (
    <svg viewBox="0 0 1180 540" className="w-full h-auto max-w-5xl mx-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Enrolment flow — 10 steps across 2 rows; yellow steps are airgapped, green are connected, half-and-half are the online↔offline boundary">
      {COMMON_DEFS}
      <FlowLegend x={20} y={28} />

      {/* Row 1 */}
      <StepBox onTip={onTip} x={r1x0} y={row1} n={1} label="Begin"          sub="wallet connect"   kind="online"   tooltip="ONLINE. You open NoKLock and connect your wallet (WalletConnect, MetaMask, etc.). At this moment the PWA still has full network access — you have not yet entered any sensitive material." />
      {arrowLine(r1x0 + 65, row1, r1x1 - 65, row1)}
      <StepBox onTip={onTip} x={r1x1} y={row1} n={2} label="Go offline"     sub="boundary"          kind="boundary" tooltip="BOUNDARY — online ↔ offline transition. The airgap manager arms: every fetch() from this tab is intercepted, service worker shifts to airgap mode, and you are prompted to put the device itself into airplane mode. Step 2 sits half-inside the dotted box because it IS the transition." />
      {arrowLine(r1x1 + 65, row1, r1x2 - 65, row1)}
      <StepBox onTip={onTip} x={r1x2} y={row1} n={3} label="Seed entry"     sub="BIP39 12/24"      kind="offline"  tooltip="OFFLINE. You type or paste a 12 or 24 word BIP39 mnemonic. Checksum is validated locally in the browser. Network is blocked." />
      {arrowLine(r1x2 + 65, row1, r1x3 - 65, row1)}
      <StepBox onTip={onTip} x={r1x3} y={row1} n={4} label="Argon2id"       sub="m=64MiB t=3 p=4"  kind="offline"  tooltip="OFFLINE. The master password is run through Argon2id, a GPU/ASIC-resistant KDF, to derive a 32-byte master key. Slow on purpose (~250ms) to defeat brute force." />
      {arrowLine(r1x3 + 65, row1, r1x4 - 65, row1)}
      <StepBox onTip={onTip} x={r1x4} y={row1} n={5} label="SLIP-39 split"  sub="3-of-5 GF(256)"   kind="offline"  tooltip="OFFLINE. The master secret is split into N Shamir shares over GF(256). Any T shares can reconstruct; T-1 reveal nothing (information-theoretic security)." />

      {/* Vertical connector row 1 → row 2 (down on the right, then left across row 2 start) */}
      <path d={`M ${r1x4} ${row1 + 40} L ${r1x4} ${(row1 + row2) / 2} L ${r2x0} ${(row1 + row2) / 2} L ${r2x0} ${row2 - 40}`} fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pfArrow)" />

      {/* Row 2 */}
      <StepBox onTip={onTip} x={r2x0} y={row2} n={6} label="Per-share AEAD" sub="GCM | XChaCha"    kind="offline"  tooltip="OFFLINE. Each share is encrypted with AEAD (AES-256-GCM or XChaCha20-Poly1305, deterministic per share index). Tampering is detected at the tag, not the plaintext." />
      {arrowLine(r2x0 + 65, row2, r2x1 - 65, row2)}
      <StepBox onTip={onTip} x={r2x1} y={row2} n={7} label="Manifest sign"  sub="Ed25519"          kind="offline"  tooltip="OFFLINE. A manifest listing share filenames + hashes is signed with an Ed25519 key derived from your master password. Any tampering with the manifest fails verification at restore." />
      {arrowLine(r2x1 + 65, row2, r2x2 - 65, row2)}
      <StepBox onTip={onTip} x={r2x2} y={row2} n={8} label="Distribute"     sub="boundary"          kind="boundary" tooltip="BOUNDARY — offline ↔ online transition. The airgap is released and each encrypted share-vault is uploaded (or you place it) to the storage URL you chose — one cloud per share, plus IPFS / Arweave if you want permanence. The vaults are already AEAD-sealed; the upload itself is not security-sensitive." />
      {arrowLine(r2x2 + 65, row2, r2x3 - 65, row2)}
      <StepBox onTip={onTip} x={r2x3} y={row2} n={9} label="NoK mint"        sub="on-chain SBT" kind="online" optional tooltip="ONLINE — OPTIONAL. ONLY if you choose to designate an heir: one soulbound Activation NFT is minted to the NoK's wallet on Polygon (M-of-N quorum vaults add a Voting NFT per heir). If you are using NoKLock for personal backup only (no inheritance) this step is skipped entirely — your shares already exist and recover fine without it." />
      {arrowLine(r2x3 + 65, row2, r2x4 - 65, row2)}
      <StepBox onTip={onTip} x={r2x4} y={row2} n={10} label="Done"           sub="vault sealed"    kind="online"   tooltip="ONLINE. Vault is sealed. Encrypted shares live at your chosen storage URLs, the signed manifest holds the integrity record, and (if applicable) the on-chain SBTs are queued for the dead-man's switch. You can disconnect, close the tab, refresh — the secret is recoverable any time you bring back K shares." />

      {/* Caption */}
      <text x={590} y={510} textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="Inter">Boundary lives INSIDE the process: steps 2 + 8 are the transitions (half-green / half-yellow).</text>
    </svg>
  );
}

function RestoreFlow({ onTip }: { readonly onTip: TipFn }): JSX.Element {
  // 0.7.0 — 2-row layout, 8 steps. Row 1: 1 ONLINE (gather), 2 BOUNDARY,
  // 3-4 OFFLINE. Row 2: 5-8 OFFLINE. Legend at top encodes the color scheme.
  const row1 = 130;
  const row2 = 380;
  const r1x0 = 110, r1x1 = 380, r1x2 = 650, r1x3 = 920;
  const r2x0 = 260, r2x1 = 530, r2x2 = 800, r2x3 = 1070;
  return (
    <svg viewBox="0 0 1180 540" className="w-full h-auto max-w-5xl mx-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Restore flow — 8 steps across 2 rows; yellow steps are airgapped, green are connected, half-and-half is the boundary">
      {COMMON_DEFS}
      <FlowLegend x={20} y={28} />

      {/* Row 1 */}
      <StepBox onTip={onTip} x={r1x0} y={row1} n={1} label="Gather"          sub="download K shares" kind="online"   tooltip="ONLINE. You (or the heir) reconnect to the network and download at least the threshold number of encrypted share-vault files from where they were distributed (cloud links, IPFS gateway, Arweave permanent URL). The vaults are AEAD-sealed so the download itself reveals nothing — but it is the only online step." />
      {arrowLine(r1x0 + 65, row1, r1x1 - 65, row1)}
      <StepBox onTip={onTip} x={r1x1} y={row1} n={2} label="Go offline"     sub="boundary"          kind="boundary" tooltip="BOUNDARY — online ↔ offline transition. The /restore route forces the airgap back on: fetch() is intercepted, you are prompted to switch the device into airplane mode. From here every step runs with no network. Step 2 sits half-inside the dotted box because it IS the transition." />
      {arrowLine(r1x1 + 65, row1, r1x2 - 65, row1)}
      <StepBox onTip={onTip} x={r1x2} y={row1} n={3} label="Drop files"     sub="or paste URLs"    kind="offline"  tooltip="OFFLINE. You drop the downloaded share-vault files into the /restore page (or paste one direct link at a time). Nothing is auto-fetched — restore works from the share FILES you supply. The page only sees what you give it." />
      {arrowLine(r1x2 + 65, row1, r1x3 - 65, row1)}
      <StepBox onTip={onTip} x={r1x3} y={row1} n={4} label="Master password" sub="Argon2id"          kind="offline"  tooltip="OFFLINE. You enter the master password. Argon2id re-derives the master secret using the KDF parameters captured in the manifest. Slow on purpose (~250ms) — defeats brute force." />

      {/* Connector row 1 → row 2 */}
      <path d={`M ${r1x3} ${row1 + 40} L ${r1x3} ${(row1 + row2) / 2} L ${r2x0} ${(row1 + row2) / 2} L ${r2x0} ${row2 - 40}`} fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pfArrow)" />

      {/* Row 2 */}
      <StepBox onTip={onTip} x={r2x0} y={row2} n={5} label="Verify manifest" sub="Ed25519"          kind="offline"  tooltip="OFFLINE. The manifest signature is verified against the public key derived from your master password. If verification fails, restore stops immediately — tampering or wrong master password." />
      {arrowLine(r2x0 + 65, row2, r2x1 - 65, row2)}
      <StepBox onTip={onTip} x={r2x1} y={row2} n={6} label="Decrypt shares" sub="AEAD tag-verified" kind="offline"  tooltip="OFFLINE. Each share is AEAD-decrypted. Any tampered share fails its tag and the restore aborts (fail-safe — never silently corrupt the output)." />
      {arrowLine(r2x1 + 65, row2, r2x2 - 65, row2)}
      <StepBox onTip={onTip} x={r2x2} y={row2} n={7} label="Recombine"      sub="Shamir GF(256)"   kind="offline"  tooltip="OFFLINE. The T decrypted shares are combined via Lagrange interpolation in GF(256). Below threshold returns nothing; at or above threshold yields the master secret." />
      {arrowLine(r2x2 + 65, row2, r2x3 - 65, row2)}
      <StepBox onTip={onTip} x={r2x3} y={row2} n={8} label="Seed recovered" sub="browser only"     kind="offline"  tooltip="OFFLINE. The original BIP39 mnemonic is reconstructed in the browser. Words are revealed only while the reveal button is held (shoulder-surfing defence). Refresh the page when done to clear it from memory — the seed never touches a network." />

      {/* Caption */}
      <text x={590} y={510} textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="Inter">Boundary lives INSIDE the process: step 2 is the transition (half-green / half-yellow).</text>
    </svg>
  );
}

function LiveManSwitchFlow({ onTip }: { readonly onTip: TipFn }): JSX.Element {
  const ys = 90;
  return (
    <svg viewBox="0 0 1100 200" className="w-full h-auto max-w-5xl mx-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Live-Man's Switch flow">
      {COMMON_DEFS}
      <Step onTip={onTip} x={60}   y={ys} n={1} label="Register"        sub="watchers + fund"      tooltip="In Settings you register 1-2 wallets you check regularly and pre-fund a little POL. Stored on-chain in NoKLockAlerts; you fund your OWN pings, so it survives even if NoKLock disappears, and pings can only go to YOUR own wallets." />
      {arrowLine(95, ys, 215, ys)}
      <Step onTip={onTip} x={260}  y={ys} n={2} label="Recovery starts" sub="a guardian initiates"  tooltip="A guardian initiates a social-recovery against your wallet (the on-chain RecoveryInitiated event). This is the moment you need to know about — you have a cancellation window to stop it." />
      {arrowLine(305, ys, 415, ys)}
      <Step onTip={onTip} x={460}  y={ys} n={3} label="Keeper detects"  sub="Chainlink log-trigger" tooltip="A Chainlink Automation log-trigger watches that event and calls NoKLockAlerts — decentralised keeper infrastructure, not a NoKLock server. (v2 makes the ping fire atomically inside the recovery tx, removing even this dependency.)" />
      {arrowLine(505, ys, 615, ys)}
      <Step onTip={onTip} x={660}  y={ys} n={4} label="Alerts ping"     sub="POL dust + event"      tooltip="NoKLockAlerts sends each watcher wallet a tiny POL transfer (from your own escrow) and emits a permanent on-chain AlertPinged record. The event also drives your optional email." />
      {arrowLine(705, ys, 815, ys)}
      <Step onTip={onTip} x={860}  y={ys} n={5} label="You're notified" sub="wallet · email · banner" tooltip="Your wallet app surfaces the incoming transfer (best-effort push — turn on incoming-transfer notifications; the on-chain record is always there), and/or the opt-in email arrives, and/or the in-app banner shows if you open NoKLock." />
      {arrowLine(905, ys, 1015, ys)}
      <Step onTip={onTip} x={1060} y={ys} n={6} label="Cancel in time"  sub="cancelRecovery()"      tooltip="If it wasn't you, call cancelRecovery() from your wallet within the cancellation window (1-30 days, default 7) and the recovery is stopped cold. If it was a real loss, do nothing and recovery completes after the delay." />
    </svg>
  );
}

function NokFlow({ onTip }: { readonly onTip: TipFn }): JSX.Element {
  const top = 80;
  const bot = 240;
  const heartbeatTip = "The smart contract checks at every Chainlink upkeep cycle: was a heartbeat received within the grace period? If yes, loop back. If no, fire activation.";
  return (
    <svg viewBox="0 -30 1100 430" className="w-full h-auto max-w-5xl mx-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="NoK and dead-man flow">
      {COMMON_DEFS}

      <Step onTip={onTip} x={60}   y={top} n={1} label="Designate"        sub="paste NoK wallet"          tooltip="You enter the NoK's Polygon wallet address. (On the roadmap: optionally just their email — NoKLock mints to an escrow contract and onboards them at activation.)" />
      {arrowLine(95, top, 195, top)}
      <Step onTip={onTip} x={230}  y={top} n={2} label="Mint heir SBT"    sub="Activation (+Vote if quorum)" tooltip="An ERC-5192 soul-bound Activation token (the trigger) is minted to the NoK's wallet — one heir, one token. M-of-N quorum vaults also mint a Voting token per heir for the heir-cooperation release." />
      {arrowLine(265, top, 365, top)}
      <Step onTip={onTip} x={400}  y={top} n={3} label="Queue activation" sub="oracle.queue(...)"         tooltip="The Activation SBT is queued in the on-chain oracle. From now on, Chainlink Automation watches your heartbeat." />
      {arrowLine(435, top, 535, top)}
      <Step onTip={onTip} x={570}  y={top} n={4} label="Heartbeat"        sub="weekly · monthly · daily"  tooltip="You check in periodically: PWA login, email link click, wallet sign, or on-chain wallet activity. Any one resets the grace timer." />

      <g style={{ cursor: "help" }} {...tipHandlers(heartbeatTip, onTip)}>
        <polygon points="720,80 800,40 880,80 800,120" fill="#162032" stroke="url(#pfGrad)" strokeWidth="2" />
        <text x="800" y="76" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontFamily="Jura" fontWeight="700">Heartbeat?</text>
        <text x="800" y="92" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono">in grace?</text>
      </g>
      {arrowLine(605, top, 720, top)}

      {/* yes — back to step 4 (re-arm). Yes label placed ON the curve, near step 4 */}
      <path d="M 800 40 Q 800 0, 570 0 Q 570 25, 570 60" fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pfArrow)" />
      <text x={680} y={-8} textAnchor="middle" fill="#10b981" fontSize="13" fontFamily="Jura" fontWeight="700">yes → re-arm</text>

      {/* no — drop to bottom row. No label placed ON the vertical arrow */}
      <line x1="800" y1="120" x2="800" y2="210" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pfArrow)" />
      <text x={820} y={170} fill="#b91c1c" fontSize="13" fontFamily="Jura" fontWeight="700">no → trigger</text>

      {/* Bottom row — activation */}
      <Step onTip={onTip} x={800} y={bot} n={5} label="performUpkeep" sub="Chainlink fires"  tooltip="Chainlink Automation calls performUpkeep() on the oracle. The Activation SBT flips from LockedInactive to LockedActive on-chain. This is the legal moment of activation." />
      {arrowLine(835, bot, 935, bot)}
      <Step onTip={onTip} x={970} y={bot} n={6} label="SBT active"   sub="NoK can recover"   tooltip="The NoK's PWA detects the active SBT on next visit. After M-of-N quorum the on-chain authorization is satisfied; they then recover offline from the share files/locations you provisioned for them — exactly like your own restore. NoKLock stores no share URLs on-chain." />

      <text x={550} y={365} textAnchor="middle" fill="#94a3b8" fontSize="13" fontFamily="Inter">User stays alive → loop 4 → 'Heartbeat?' resets the timer indefinitely.</text>
      <text x={550} y={388} textAnchor="middle" fill="#94a3b8" fontSize="13" fontFamily="Inter">User goes silent past grace period → activation fires automatically.</text>
    </svg>
  );
}

function DuressFlow({ onTip }: { readonly onTip: TipFn }): JSX.Element {
  const ys = 90;
  return (
    <svg viewBox="0 0 1100 220" className="w-full h-auto max-w-5xl mx-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Duress flow">
      {COMMON_DEFS}
      <Step onTip={onTip} x={60}   y={ys} n={1} label="Two passwords"    sub="real + duress"    tooltip="At enrolment you set BOTH a real master password AND a duress master password. Both are valid; both unlock NoKLock. The two derive different master secrets." />
      {arrowLine(95, ys, 195, ys)}
      <Step onTip={onTip} x={230}  y={ys} n={2} label="Two vaults"       sub="parallel pipeline" tooltip="NoKLock runs the entire split+encrypt+distribute pipeline TWICE — once for your real seed, once for a low-value decoy seed you also enter. Files land on disk indistinguishably." />
      {arrowLine(265, ys, 365, ys)}
      <Step onTip={onTip} x={400}  y={ys} n={3} label="Coercion"          sub="$5-wrench attack" tooltip="An attacker forces you to unlock NoKLock. You comply: you enter the duress master password." />
      {arrowLine(435, ys, 535, ys)}
      <Step onTip={onTip} x={570}  y={ys} n={4} label="Decoy unlocks"    sub="believable balance" tooltip="The duress master password unlocks the decoy vault — a real but low-value wallet you'd be willing to give up. Attacker sees plausible holdings, leaves satisfied." />
      {arrowLine(605, ys, 705, ys)}
      <Step onTip={onTip} x={740}  y={ys} n={5} label="Real vault"        sub="untouched"        tooltip="Your real vault was encrypted with a different master-password derivation. It was never touched. There is no on-disk artifact distinguishing real from decoy — the attacker cannot tell there's a second vault." />
      {arrowLine(775, ys, 875, ys)}
      <Step onTip={onTip} x={910}  y={ys} n={6} label="Recovery later"   sub="real password"   tooltip="Once safe, you unlock the real vault with the real master password from a different device. Your seed was never exposed." />
    </svg>
  );
}

function MultiNokFlow({ onTip }: { readonly onTip: TipFn }): JSX.Element {
  // 0.5.1 — Lane-based redraw (Daniel-approved 2026-05-20). Three horizontal
  // lanes A/B/C with NO crossings between them; arrows go strictly left-to-
  // right within a lane or from the centred "Dead-man fires" hub. One NoK
  // (lane A) is explicitly marked as PHISHED to visualise the social-
  // engineering defence: even a successfully phished A still produces just
  // ONE vote — quorum (2-of-3) still requires B or C, whose wallets the
  // attacker hasn't touched.
  const quorumTip = "The contract counts votes from DISTINCT NoK wallets. As soon as M votes from M DIFFERENT addresses arrive, the on-chain release authorization opens. M=2 is the default for 3 NoKs. The chain authorizes release; the shares themselves live in the locations you provisioned, not on-chain.";
  const coercedTip = "ATTACK SCENARIO: NoK A's wallet has been phished, coerced, or otherwise compromised by an attacker. The attacker can produce A's signature — ONE vote. But quorum is 2-of-3: the attacker still needs B's OR C's signature, from a wallet the attacker hasn't reached. Independent wallets = independent attack surfaces = phishing-one-doesn't-help.";
  const failTip = "If NoK A were the ONLY designated NoK (no quorum), a successful phish would release everything. With M-of-N quorum, that single vote fails the threshold — the chain rejects the release until M independent signatures arrive.";

  // Lane y-coords
  const A = 80, B = 180, C = 280;
  return (
    <svg viewBox="0 0 1200 420" className="w-full h-auto max-w-5xl mx-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Multi-NoK quorum + social-engineering defence flow">
      {COMMON_DEFS}

      {/* Lane labels (left margin) — keep diagram intuitive at a glance. */}
      <text x={20} y={A + 5} fill="#475569" fontSize="11" fontFamily="JetBrains Mono">Lane A</text>
      <text x={20} y={B + 5} fill="#475569" fontSize="11" fontFamily="JetBrains Mono">Lane B</text>
      <text x={20} y={C + 5} fill="#475569" fontSize="11" fontFamily="JetBrains Mono">Lane C</text>

      {/* Step 1 — You designate. Centered vertically; three arrows fan out. */}
      <Step onTip={onTip} x={100} y={B} n={1} label="You designate" sub="3 NoKs" tooltip="You designate THREE different people, each with their own crypto wallet. Three different humans, three different addresses, three different attack-surface contexts. The same wallet address never appears twice on this vault." />
      {arrowLine(135, B - 10, 175, A + 10)}
      {arrowLine(135, B,     175, B)}
      {arrowLine(135, B + 10, 175, C - 10)}

      {/* Steps 2/3/4 — NoK A/B/C, each in its own lane. NoK A is marked
          PHISHED to visualise the attack scenario. */}
      <Step onTip={onTip} x={210} y={A} n={2} label="NoK A" sub="wallet 0xAAA…" tooltip="NoK A — a person you trust, e.g. your spouse. Their wallet address goes on-chain. They receive an SBT to that address. In this diagram we are imagining A has been phished by an attacker (see red 'PHISHED' badge) to illustrate the multi-NoK defence." />
      <Step onTip={onTip} x={210} y={B} n={3} label="NoK B" sub="wallet 0xBBB…" tooltip="NoK B — a DIFFERENT person, e.g. your sibling. Different wallet, different SBT, different attack surface. The attacker who phished A does NOT have B's credentials." />
      <Step onTip={onTip} x={210} y={C} n={4} label="NoK C" sub="wallet 0xCCC…" tooltip="NoK C — a third independent person, e.g. your lawyer or close friend. Different wallet again. Independent attack surface. The attacker who phished A does NOT have C's credentials either." />

      {/* PHISHED badge on NoK A — small red circle + label */}
      <g style={{ cursor: "help" }} {...tipHandlers(coercedTip, onTip)}>
        <circle cx={245} cy={A - 25} r="10" fill="#dc2626" stroke="#fecaca" strokeWidth="1.5" />
        <text x={245} y={A - 21} textAnchor="middle" fill="#fff" fontSize="11" fontFamily="Jura" fontWeight="700">!</text>
        <text x={265} y={A - 22} fill="#fca5a5" fontSize="10" fontFamily="JetBrains Mono" fontWeight="700">PHISHED</text>
      </g>

      {/* Step 5 — Dead-man fires. Vertical centre hub at lane B y. Each NoK
          lane feeds in horizontally; output fans out horizontally back to
          the same lanes. No crossings. */}
      {arrowLine(245, A, 380, A)}
      {arrowLine(245, B, 380, B)}
      {arrowLine(245, C, 380, C)}
      <g style={{ cursor: "help" }} {...tipHandlers("The dead-man's switch fires. All three Activation SBTs flip to LockedActive on-chain simultaneously. The contract opens the voting window — but no NoK can act alone yet; quorum is the gate.", onTip)}>
        <rect x={395} y={A - 20} width={70} height={C - A + 40} rx={10} fill="#162032" stroke="url(#pfGrad)" strokeWidth="2" />
        <text x={430} y={B - 12} textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="Jura" fontWeight="700">5</text>
        <text x={430} y={B + 8} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontFamily="Inter" fontWeight="600">Dead-man</text>
        <text x={430} y={B + 26} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontFamily="Inter" fontWeight="600">fires</text>
        <text x={430} y={B + 44} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">grace expires</text>
      </g>
      {arrowLine(465, A, 590, A)}
      {arrowLine(465, B, 590, B)}
      {arrowLine(465, C, 590, C)}

      {/* Steps 6/7/8 — Votes in their respective lanes. NoK A votes (attacker
          uses A's stolen wallet). NoK B votes independently. NoK C abstains. */}
      <Step onTip={onTip} x={625} y={A} n={6} label="A 'votes'" sub="from phished 0xAAA" tooltip="The attacker uses NoK A's phished wallet to sign a release transaction. ONE vote arrives on-chain. The contract has no way to know A was phished — it only sees a valid signature from A's address." />
      <Step onTip={onTip} x={625} y={B} n={7} label="B votes" sub="signs from 0xBBB" tooltip="NoK B (whose wallet was never reached by the attacker) sees the dead-man's switch has fired, recognises the inheritance is legitimate, and signs from their own wallet. Independent vote — independent wallet." />
      <Step onTip={onTip} x={625} y={C} n={8} label="C abstains" sub="(doesn't sign)" tooltip="NoK C never signs (maybe lost their wallet, maybe travelling, maybe deliberately holding off). With M=2 of N=3 already met (A + B), C is not required. With M=3 of N=3 their abstention would block the release entirely." />

      {/* Quorum diamond — fed by votes from A and B (not C). */}
      <g style={{ cursor: "help" }} {...tipHandlers(quorumTip, onTip)}>
        <polygon points="810,140 880,180 810,220 740,180" fill="#162032" stroke="url(#pfGrad)" strokeWidth="2" />
        <text x={810} y={175} textAnchor="middle" fill="#e2e8f0" fontSize="13" fontFamily="Jura" fontWeight="700">2-of-3?</text>
        <text x={810} y={193} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono">quorum</text>
      </g>
      {arrowLine(660, A, 750, 155)}
      {arrowLine(660, B, 740, 180)}
      {/* NoK C abstains — no arrow to quorum */}

      {/* Step 9 — Authorized */}
      {arrowLine(880, B, 990, B)}
      <Step onTip={onTip} x={1025} y={B} n={9} label="Authorized" sub="quorum satisfied" tooltip="A + B = 2 votes from 2 DISTINCT wallets. With 2-of-3 met, the on-chain release authorization opens. The NoKs then reconstruct the seed offline from the share files / locations you provisioned — the chain authorizes the release; it does not store or hand out the share contents themselves." />

      {/* What-if path: if ONLY A had been phished and B / C never voted,
          the rejection path would be: A's vote alone → quorum FAILS. Show
          this as a dashed red rejection arc to drive home the defence. */}
      <g style={{ cursor: "help" }} {...tipHandlers(failTip, onTip)}>
        <path d="M 660 90 Q 720 60, 770 130" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
        <text x={715} y={50} textAnchor="middle" fill="#fca5a5" fontSize="11" fontFamily="JetBrains Mono">if A alone…</text>
        <text x={715} y={64} textAnchor="middle" fill="#fca5a5" fontSize="11" fontFamily="JetBrains Mono">→ FAILS quorum</text>
      </g>

      {/* Caption */}
      <text x={600} y={368} textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="Inter" fontWeight="600">A phished NoK alone never reaches quorum — the chain requires M signatures from M DIFFERENT wallets.</text>
      <text x={600} y={388} textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="Inter">Phishing one heir does not phish the others. Each NoK is an independent attack surface — the attacker has to compromise M of them, separately, to win.</text>
    </svg>
  );
}
