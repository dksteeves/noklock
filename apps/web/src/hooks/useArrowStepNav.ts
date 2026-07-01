// @version 0.1.0 @date 2026-05-30
// Always-on ArrowLeft / ArrowRight step navigation for viz components.
// Previously this lived inside <FullscreenAffordance/> and only activated
// in fullscreen; Daniel 2026-05-30: "keyboard arrow forward back controls
// on viz would be great" → moved here so the keys work whenever a viz
// is mounted, fullscreen or not.
//
// Scoped to ignore form-input focus so typing in a search box / textarea
// elsewhere on the page doesn't accidentally step a viz.

import { useEffect } from "react";

interface Opts {
  /** Whether the listener should be active. Defaults to true. */
  readonly enabled?: boolean;
}

function isFormFocus(): boolean {
  if (typeof document === "undefined") return false;
  const a = document.activeElement;
  if (!a) return false;
  const tag = a.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  // contenteditable
  if ((a as HTMLElement).isContentEditable) return true;
  return false;
}

export function useArrowStepNav(
  onPrev: (() => void) | undefined,
  onNext: (() => void) | undefined,
  opts: Opts = {},
): void {
  const enabled = opts.enabled !== false;
  useEffect(() => {
    if (!enabled) return;
    if (!onPrev && !onNext) return;
    const handler = (e: KeyboardEvent): void => {
      // Don't hijack arrows while the user is typing in a form field.
      if (isFormFocus()) return;
      // Don't fight with browser-defaults inside a contenteditable iframe etc.
      if (e.defaultPrevented) return;
      if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
        e.preventDefault();
      } else if (e.key === "ArrowRight" && onNext) {
        onNext();
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled, onPrev, onNext]);
}
