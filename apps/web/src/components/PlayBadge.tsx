// @version 0.1.0 @date 2026-06-15
// PlayBadge (Daniel 2026-06-15) — an INLINE "Get it on Google Play" badge.
// Replaces the <img src="/play-badge/...png"> the Footer / Settings / Download
// used, which only rendered after a hard refresh: the PNG is a precached PWA
// asset, so the running (old) service worker served a precache that didn't
// include it until the SW updated. This badge is pure inline SVG + text — part
// of the JS bundle, no separate asset fetch, no precache race → it ALWAYS
// renders, first paint, every load. Sits inside the existing <a href=play-store>
// link at the call sites. Height scales from the wrapper's height class.

// Canonical Google Play "play triangle" (blue body / green tip / yellow fold /
// red fold) as four inline paths — no external asset.
function PlayTriangle(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-[55%] w-auto shrink-0" aria-hidden="true">
      <path fill="#00D2FF" d="M3.064 1.766C2.93 1.927 2.86 2.16 2.86 2.456v19.088c0 .296.07.529.204.69l.064.061L13.79 12.122v-.244L3.128 1.705l-.064.061z" />
      <path fill="#00F076" d="M17.341 15.69l-3.551-3.568v-.244l3.553-3.568.08.046 4.208 2.39c1.2.683 1.2 1.802 0 2.486l-4.208 2.39-.082.058z" />
      <path fill="#FFCE00" d="M17.423 15.633L13.79 12 3.064 22.79c.396.42 1.05.47 1.787.05l12.572-7.207z" />
      <path fill="#FF3B30" d="M17.423 8.367L4.851 1.16C4.114.74 3.46.79 3.064 1.21L13.79 12l3.633-3.633z" />
    </svg>
  );
}

/** "Get it on Google Play" badge — inline, always renders. Pass a height class
 *  (e.g. "h-10" / "h-12" / "h-16") to match the old <img> sizes at each site. */
export function PlayBadge({ className = "h-12" }: { readonly className?: string }): JSX.Element {
  return (
    <span className={`inline-flex items-center gap-2.5 rounded-lg bg-black border border-white/25 px-3.5 select-none ${className}`}>
      <PlayTriangle />
      <span className="flex flex-col leading-tight text-left">
        <span className="text-[9px] text-white/85 uppercase tracking-[0.12em]">Get it on</span>
        <span className="text-[17px] text-white font-medium -mt-0.5" style={{ fontFamily: "Roboto, Arial, sans-serif" }}>Google Play</span>
      </span>
    </span>
  );
}
