// @version 0.1.0 @date 2026-05-23
// Renders sanitized rich-text HTML (sealed-letter reveal + Updates display).
// Always sanitizes at render — never trust stored/restored HTML. For legacy
// plain-text values (no markup) callers can branch on looksLikeHtml() and use
// a <pre> instead; this component is for the rich path.

import { sanitizeHtml } from "../lib/sanitizeHtml.js";

export function RichTextView({ html, className }: { readonly html: string; readonly className?: string }): JSX.Element {
  return (
    <div
      className={`prose-noklock ${className ?? ""}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
