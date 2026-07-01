// @version 0.1.0 @date 2026-05-27
// Inline SVG process flow for /refer?tab=community-owners. Five steps,
// left-to-right on desktop, top-to-bottom on narrow viewports. Pure SVG
// (zero deps); colour-coded with the brand cyan / teal / green tokens via
// CSS custom properties so it matches dark + print themes automatically.

interface StepDef {
  readonly n: number;
  readonly title: string;
  readonly body: string;
}

const STEPS: readonly StepDef[] = [
  { n: 1, title: "Cobrand a card",   body: "Generate a NoKLock × your-brand PNG in the builder below." },
  { n: 2, title: "Share your link",  body: "Post it in your channel — Telegram, X, Discord, anywhere." },
  { n: 3, title: "People buy",       body: "Visitors get 10% off; the contract locks your wallet as referrer." },
  { n: 4, title: "USDC arrives",     body: "10% of every paid licence lands in your wallet on-chain at mint." },
  { n: 5, title: "Pool pays winners",body: "Pre-commit a slice as a community contest; pay winners from your own wallet." },
];

export function CommunityOwnersFlow(): JSX.Element {
  return (
    <div className="rounded-lg border border-bg-surface bg-bg-deepest/40 p-4">
      <div className="text-xs text-text-muted mb-3 text-center">How the partner flow works — 5 steps, fully on-chain</div>
      {/* Desktop / wide: horizontal pill row with arrows. Wraps to vertical on small screens. */}
      <ol className="flex flex-wrap gap-2 sm:gap-1 items-stretch justify-center">
        {STEPS.map((s, i) => (
          <li key={s.n} className="flex items-stretch gap-1 sm:gap-1 min-w-[9rem] flex-1 sm:max-w-[12rem]">
            <div className="flex-1 rounded-lg border border-accent-cyan/30 bg-bg-deepest/60 p-2 text-center">
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-cyan/15 border border-accent-cyan/40 text-accent-cyan text-xs font-bold mb-1">{s.n}</div>
              <div className="font-display font-bold text-sm">{s.title}</div>
              <div className="text-[11px] text-text-muted leading-snug mt-1">{s.body}</div>
            </div>
            {i < STEPS.length - 1 && (
              <svg className="shrink-0 self-center text-accent-cyan hidden sm:block" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M2 7 H11 M8 4 L11 7 L8 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
