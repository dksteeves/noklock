// @version 0.1.0 @date 2026-05-23
// Reusable sub-tab pill bar (Daniel 2026-05-23) — extracted from the inline
// version in Info.tsx so /nok (and any page) can reuse it. Slim, nests under a
// parent tab. Props: items [{id,label}], the active id, and onPick(id).

export function SubTabBar(props: {
  readonly items: readonly { id: string; label: string }[];
  readonly active: string;
  readonly onPick: (id: string) => void;
}): JSX.Element {
  return (
    <nav className="flex flex-nowrap gap-2 overflow-x-auto pb-1 border-b border-bg-surface/40">
      {props.items.map((it) => (
        <button
          key={it.id}
          onClick={() => props.onPick(it.id)}
          className={`px-3 py-1.5 rounded-t text-xs whitespace-nowrap shrink-0 transition-colors border-b-2 -mb-px ${
            props.active === it.id
              ? "border-accent-cyan text-accent-cyan font-bold"
              : "border-transparent text-text-muted hover:text-text-on-dark"
          }`}
          aria-current={props.active === it.id ? "page" : undefined}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}
