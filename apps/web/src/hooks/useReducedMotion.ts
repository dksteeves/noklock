// @version 0.1.0 @date 2026-05-29
// Reads the OS-level `prefers-reduced-motion` media query and returns
// whether the user has asked their device for less motion. Used by all 7
// pipeline vizzes to skip the looping autoplay animation and jump to the
// end-state of each phase cycle (the "lesson-complete" frame) instead.
//
// Users typically enable this for vestibular disorders, motion sickness,
// migraines, or general focus. We respect it without changing what the
// majority of users see.
//
// Implementation: matchMedia() reactively — the hook re-renders if the
// user toggles the OS setting while the page is open.

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent): void => setReduced(e.matches);
    // Some older Safari versions only support addListener/removeListener.
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    mq.addListener(handler);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return () => mq.removeListener(handler);
  }, []);

  return reduced;
}
