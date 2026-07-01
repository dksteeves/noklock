// @version 0.1.0 @date 2026-05-29
// Tiny brand-aware loading spinner. The NoKLock logo mark rotates on a
// pure CSS keyframe (zero JS, zero React state, runs on the compositor
// thread). Used wherever a viz chunk is fetching or a viz is between
// mount and first paint — replaces the previous bare "Loading viz…" text
// so the user gets a brand-aware "yes, something is happening" cue
// instead of a blank rectangle.
//
// Sizes default to mid-page (96 px); the host can override with `size`.
// `label` is read by screen readers via aria-live, with a visible mute
// fallback below the mark.
//
// Respects prefers-reduced-motion: if set, the mark fades opacity
// pulses instead of rotating (no vestibular trigger). This matches the
// rest of the app's reduce-motion stance (only DECORATIVE motion is
// suppressed; functional state remains).

import { useEffect, useState } from "react";

interface Props {
  readonly size?: number;
  readonly label?: string;
  /** When true, fill the parent container instead of mid-page minimum.
   *  Used for inline (within-card) embeds. */
  readonly inline?: boolean;
}

export function NoKLockSpinner({ size = 96, label = "Loading…", inline = false }: Props): JSX.Element {
  const reduced = useReducedMotionLocal();
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        minHeight: inline ? 0 : 240,
        width: "100%",
        color: "#94a3b8",
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      <img
        src="/logo-192.png"
        alt=""
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          // Keyframes live in index.css (global) so the animation is
          // guaranteed resolved before paint. We stack TWO animations:
          // a smooth rotation + a subtle drop-shadow glow pulse so even
          // if the user's eye is on the label, the motion catches it.
          animation: reduced
            ? "nkPulse 1.8s ease-in-out infinite"
            : "nkSpin 1.4s linear infinite, nkGlow 2.4s ease-in-out infinite",
          willChange: "transform, opacity, filter",
        }}
      />
      {label ? <span style={{ opacity: 0.85 }}>{label}</span> : null}
    </div>
  );
}

// Local copy of the reduce-motion read — avoids importing the shared
// hook (which some vizzes have intentionally decoupled). One-shot read
// at mount, listen for OS-level changes via matchMedia. Safe everywhere.
function useReducedMotionLocal(): boolean {
  const [r, setR] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent): void => setR(e.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    mq.addListener(handler);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return () => mq.removeListener(handler);
  }, []);
  return r;
}
