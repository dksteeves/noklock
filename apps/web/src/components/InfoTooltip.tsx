// @version 0.3.0 @date 2026-05-19
// 0.3.0 — REWRITE: popover now renders in a PORTAL to <body> with
//         position:fixed, coordinates computed from the trigger's
//         bounding rect and clamped to the viewport. This is the only
//         reliable fix for the CompetitorTable: an absolutely-positioned
//         child was (a) clipped by the table's overflow-x-auto wrapper
//         (cut off on the left), (b) painted over by following rows
//         (stacking context trapped inside the table), and (c)
//         shimmering as the cursor crossed it. The portal escapes ALL
//         overflow/stacking contexts; pointer-events-none stops the
//         hover-thrash flicker; it closes on scroll/resize so it can't
//         drift away from its trigger in the horizontally-scrolling
//         table. Public API (<InfoTooltip hint=... />) is unchanged.
// 0.2.x — i18n: hint run through localizeTip; z-index band-aids (replaced).
//
// Tiny accessible info tooltip — an inline (i) that reveals a hint on
// hover OR keyboard focus OR tap (mobile). No deps beyond react-dom.

import { useId, useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useT } from "../i18n/index.js";
import { localizeTip } from "../i18n/tooltips.js";

const W = 240; // px — must match the w-[240px] below

export function InfoTooltip({ hint }: { readonly hint: string }): JSX.Element {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const { lang } = useT();
  const shown = localizeTip(lang, hint);
  const open = pos !== null;

  const place = useCallback(() => {
    const el = btnRef.current;
    if (!el || typeof window === "undefined") return;
    const r = el.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, r.left + r.width / 2 - W / 2),
      window.innerWidth - W - 8,
    );
    // Below the icon by default; if that would run off the bottom,
    // sit it above instead. position:fixed → viewport coords.
    const below = r.bottom + 6;
    const top = below + 120 > window.innerHeight ? Math.max(8, r.top - 6 - 110) : below;
    setPos({ top, left });
  }, []);

  const close = useCallback(() => setPos(null), []);

  // While open, any scroll (the table scrolls horizontally) or resize
  // would detach the popover from its trigger — just dismiss it.
  useEffect(() => {
    if (!open) return;
    const onMove = (): void => close();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, close]);

  return (
    <span className="inline-block align-middle">
      <button
        ref={btnRef}
        type="button"
        aria-label="More info"
        aria-describedby={open ? id : undefined}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-text-muted/60 text-[10px] leading-none text-text-muted hover:text-accent-cyan hover:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan"
        onMouseEnter={place}
        onMouseLeave={close}
        onFocus={place}
        onBlur={close}
        onClick={(e) => { e.preventDefault(); if (open) close(); else place(); }}
      >
        i
      </button>
      {open && pos && typeof document !== "undefined" &&
        createPortal(
          <span
            role="tooltip"
            id={id}
            className="pointer-events-none fixed z-[2147483000] w-[240px] rounded border border-bg-surface bg-bg-deepest p-2 text-xs font-normal normal-case tracking-normal text-text-on-dark/90 shadow-xl"
            style={{ top: pos.top, left: pos.left }}
            lang={lang === "zh-Hans" ? "zh" : lang}
          >
            {shown}
          </span>,
          document.body,
        )}
    </span>
  );
}
