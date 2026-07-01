// @version 0.1.0 @date 2026-05-20
// Section H5: per-page Help → docs accordion. A small button at the top of
// a page (or anywhere) smooth-scrolls to a bottom <section id> that holds
// collapsible <details> blocks with plain-English doc content. Used on
// Heartbeat, DeadMan, NoK, Prove-It, Vaults, Restore, NokClaim — one
// component, page-specific docs content passed in.

import type { ReactNode } from "react";

export interface HelpEntry {
  readonly title: string;
  readonly body: ReactNode;
}

export interface PageHelpProps {
  /** Anchor id rendered on the docs section + linked to by the top button. */
  readonly docsId: string;
  /** Button label at the top of the page (e.g. "Help · what does this page do?"). */
  readonly buttonLabel?: string;
  /** Heading shown above the accordion at the bottom of the page. */
  readonly heading?: string;
  /** Content entries — each becomes one <details>. */
  readonly entries: readonly HelpEntry[];
}

/** Inline-render at the TOP of a page: a small button that scrolls to docs. */
export function PageHelpButton({ docsId, buttonLabel = "Help — what is this page?" }: { readonly docsId: string; readonly buttonLabel?: string }): JSX.Element {
  function jump(): void {
    const el = document.getElementById(docsId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <button onClick={jump} className="text-xs text-accent-cyan hover:underline">
      ↓ {buttonLabel}
    </button>
  );
}

/** Render at the BOTTOM of a page: the accordion docs section. */
export function PageHelpDocs({ docsId, heading = "About this page", entries }: PageHelpProps): JSX.Element {
  return (
    <section id={docsId} className="card scroll-mt-20">
      <h2 className="font-bold font-display mb-2"><span className="grad">{heading}</span></h2>
      <div className="space-y-2 text-sm">
        {entries.map((e, i) => (
          <details key={i} className="border border-bg-surface rounded p-3 bg-bg-deepest/50">
            <summary className="cursor-pointer font-bold text-text-on-dark">{e.title}</summary>
            <div className="mt-3 text-text-on-dark/85 space-y-2">{e.body}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Convenience: both pieces on one component (button at top, docs at bottom). */
export function PageHelp(props: PageHelpProps): JSX.Element {
  return (
    <>
      <PageHelpButton docsId={props.docsId} buttonLabel={props.buttonLabel} />
      <PageHelpDocs {...props} />
    </>
  );
}
