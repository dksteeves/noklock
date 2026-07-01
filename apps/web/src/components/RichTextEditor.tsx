// @version 0.3.0 @date 2026-06-17
// 0.3.0 — Daniel 2026-06-17: (a) EDIT FIX — loading an existing article/update
//          to edit left the body empty: the editor only seeded content on mount
//          and the second effect only CLEARED on "". Replaced both with a single
//          external-sync effect guarded by a `lastEmitted` ref — it writes
//          valueHtml into the DOM for any EXTERNAL change (initial seed, reset to
//          "", OR loading content to edit) while skipping typing echoes (so the
//          caret never jumps). (b) + H4 heading button. (c) + sticky toolbar
//          (no longer scrolls out of view) + a fullscreen toggle for long edits.
// 0.2.0 — Daniel 2026-05-31 (NK0-a fix): the editor was seed-once via a
//          `[]`-dep useEffect, so when the parent called setBody("") after a
//          successful publish, the React state cleared but the contentEditable
//          retained the published content. (Superseded by 0.3.0's unified sync.)
// 0.1.0 — Lightweight rich-text editor (Daniel: "the sealed letter compose editor [should]
// be rtf and format toolbar enabled … plain text not good enough"). Also used by
// the Admin → Updates publisher (NK8). npm install is broken here, so no editor
// library — this is a contentEditable surface + a toolbar driving the built-in
// document.execCommand (deprecated but supported in every current browser). The
// HTML it emits is sanitized before storage AND again at render (RichTextView /
// sanitizeHtml), so the deprecated API is purely a UI convenience.

import { useEffect, useRef, useState } from "react";

interface Tool { readonly cmd: string; readonly arg?: string; readonly label: string; readonly title: string }
const TOOLS: readonly Tool[] = [
  { cmd: "bold", label: "B", title: "Bold" },
  { cmd: "italic", label: "i", title: "Italic" },
  { cmd: "underline", label: "U", title: "Underline" },
  { cmd: "formatBlock", arg: "H2", label: "H2", title: "Heading" },
  { cmd: "formatBlock", arg: "H3", label: "H3", title: "Subheading" },
  { cmd: "formatBlock", arg: "H4", label: "H4", title: "Sub-subheading" },
  { cmd: "insertUnorderedList", label: "• List", title: "Bulleted list" },
  { cmd: "insertOrderedList", label: "1. List", title: "Numbered list" },
  { cmd: "formatBlock", arg: "BLOCKQUOTE", label: "❝", title: "Quote" },
];

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function RichTextEditor({
  valueHtml,
  onChange,
  placeholder = "Write…",
  minHeight = 200,
}: {
  readonly valueHtml: string;
  readonly onChange: (html: string) => void;
  readonly placeholder?: string;
  readonly minHeight?: number;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  // The last HTML we emitted via onChange. Lets us tell a typing-echo
  // (valueHtml === lastEmitted → leave the caret alone) from an EXTERNAL set
  // (initial seed, reset, or loading an article to edit → write it in).
  const lastEmitted = useRef<string>("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (valueHtml === lastEmitted.current) return;     // typing echo — caret safe
    if (ref.current.innerHTML === valueHtml) return;   // already in sync
    ref.current.innerHTML = valueHtml || "";           // external: seed / reset / edit-load
    lastEmitted.current = valueHtml || "";
  }, [valueHtml]);

  // Esc exits fullscreen.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent): void => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const emit = (): void => {
    if (!ref.current) return;
    lastEmitted.current = ref.current.innerHTML;
    onChange(ref.current.innerHTML);
  };

  function exec(cmd: string, arg?: string): void {
    ref.current?.focus();
    try { document.execCommand(cmd, false, arg); } catch { /* unsupported cmd */ }
    emit();
  }

  function addLink(): void {
    const url = window.prompt("Link URL (https://… or mailto:…)");
    if (!url) return;
    if (!/^(https?:|mailto:)/i.test(url.trim())) {
      window.alert("Only http(s):// or mailto: links are allowed.");
      return;
    }
    exec("createLink", url.trim());
  }

  function addImage(): void {
    const url = window.prompt("Image URL (https://…)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url.trim())) { window.alert("Only http(s):// image URLs are allowed."); return; }
    const alt = window.prompt("Describe the image (alt text — for accessibility + SEO)") || "";
    exec("insertHTML", `<img src="${escapeHtmlAttr(url.trim())}" alt="${escapeHtmlAttr(alt)}" loading="lazy">`);
  }

  // Accepts a YouTube/Vimeo link OR a pasted <iframe> embed → canonical embed URL.
  function parseVideoEmbed(raw: string): string | null {
    const iframe = /<iframe[^>]+src=["']([^"']+)["']/i.exec(raw);
    const u = (iframe?.[1] ?? raw).trim();
    let m: RegExpExecArray | null;
    if ((m = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([\w-]{6,})/i.exec(u))) {
      return `https://www.youtube-nocookie.com/embed/${m[1]}`;
    }
    if ((m = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d{5,})/i.exec(u))) {
      return `https://player.vimeo.com/video/${m[1]}`;
    }
    return null;
  }

  function addVideo(): void {
    const raw = window.prompt("Paste a YouTube / Vimeo link, or an <iframe> embed code");
    if (!raw) return;
    const embed = parseVideoEmbed(raw);
    if (!embed) { window.alert("Only YouTube or Vimeo videos are supported — paste the link or the embed code."); return; }
    exec("insertHTML", `<iframe src="${escapeHtmlAttr(embed)}" allowfullscreen></iframe><p><br></p>`);
  }

  const btn = "text-xs px-2 py-1 rounded bg-bg-surface text-text-on-dark/85 hover:text-accent-cyan font-display";

  return (
    <div className={fullscreen
      ? "fixed inset-0 z-[60] flex flex-col bg-bg-deepest"
      : "rounded border border-bg-surface bg-bg-deepest"}>
      <div className="flex flex-wrap items-center gap-1 border-b border-bg-surface p-1.5 sticky top-0 z-10 bg-bg-deepest">
        {TOOLS.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.title}
            // mouseDown + preventDefault so clicking a tool doesn't blur the
            // editor / collapse the current selection before execCommand runs.
            onMouseDown={(e) => { e.preventDefault(); exec(t.cmd, t.arg); }}
            className={btn}
          >
            {t.label}
          </button>
        ))}
        <button type="button" title="Add link"
          onMouseDown={(e) => { e.preventDefault(); addLink(); }}
          className="text-xs px-2 py-1 rounded bg-bg-surface text-text-on-dark/85 hover:text-accent-cyan">🔗</button>
        <button type="button" title="Insert image (by URL)"
          onMouseDown={(e) => { e.preventDefault(); addImage(); }}
          className="text-xs px-2 py-1 rounded bg-bg-surface text-text-on-dark/85 hover:text-accent-cyan">🖼 Image</button>
        <button type="button" title="Embed a YouTube / Vimeo video (link or iframe)"
          onMouseDown={(e) => { e.preventDefault(); addVideo(); }}
          className="text-xs px-2 py-1 rounded bg-bg-surface text-text-on-dark/85 hover:text-accent-cyan">▶ Video</button>
        <button type="button" title="Clear formatting"
          onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}
          className="text-xs px-2 py-1 rounded bg-bg-surface text-text-on-dark/70 hover:text-accent-cyan">Clear</button>
        <button type="button" title={fullscreen ? "Exit fullscreen (Esc)" : "Edit fullscreen"}
          onMouseDown={(e) => { e.preventDefault(); setFullscreen((v) => !v); }}
          className="text-xs px-2 py-1 rounded bg-bg-surface text-text-on-dark/85 hover:text-accent-cyan ml-auto">
          {fullscreen ? "⤢ Exit fullscreen" : "⤢ Fullscreen"}</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        role="textbox"
        aria-multiline="true"
        spellCheck
        className={"rte-editable prose-noklock p-3 text-sm focus:outline-none overflow-auto " + (fullscreen ? "flex-1" : "")}
        style={fullscreen ? undefined : { minHeight }}
      />
    </div>
  );
}
