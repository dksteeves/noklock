// @version 0.1.0 @date 2026-05-23
// Allow-list HTML sanitizer for the rich-text editor (sealed letters + Updates).
// npm install is broken in this workspace, so no DOMPurify — we hand-roll an
// allow-list pass over the browser's own DOMParser tree. Used both BEFORE
// persisting (store clean) and at RENDER time (defence in depth — a restored
// letter may have been authored anywhere). The threat model is mostly self-XSS
// (a letter the user wrote, that they/their heir reveal), but we sanitize
// regardless: anything that isn't a known formatting tag is unwrapped or
// dropped, every attribute is stripped except a vetted href on <a>.

const ALLOWED_TAGS = new Set([
  "P", "BR", "B", "STRONG", "I", "EM", "U", "S", "STRIKE", "DEL",
  "UL", "OL", "LI", "H1", "H2", "H3", "H4", "BLOCKQUOTE", "A",
  "SPAN", "DIV", "CODE", "PRE", "HR",
  // 0.2.0 — Articles content hub: images + allow-listed video embeds + figures.
  "IMG", "IFRAME", "FIGURE", "FIGCAPTION",
]);

// Tags removed wholesale (including their contents) — never just unwrapped.
const DROP_WHOLE = new Set([
  "SCRIPT", "STYLE", "OBJECT", "EMBED", "LINK", "META", "HEAD",
  "NOSCRIPT", "TEMPLATE", "FORM", "INPUT", "TEXTAREA", "BUTTON", "SELECT",
  "SVG", "MATH", "VIDEO", "AUDIO", "SOURCE", "TITLE", "BASE",
]);

// 0.2.0 — <img>: only http(s) sources (NEVER data: — an SVG data-URI is an XSS
// vector). <iframe>: ONLY these video-embed origins, and only with a vetted
// attribute set. Anything else is dropped whole.
const IMG_SRC_RE = /^https?:\/\//i;
const VIDEO_SRC_RE = /^https:\/\/(?:www\.)?(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)[\w\-/?=&.]+$/i;

function cleanElement(node: Element): void {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 8 /* COMMENT */) {
      child.parentNode?.removeChild(child);
      continue;
    }
    if (child.nodeType !== 1 /* ELEMENT */) continue; // keep text nodes

    const el = child as Element;
    const tag = el.tagName.toUpperCase();

    if (DROP_WHOLE.has(tag)) {
      el.parentNode?.removeChild(el);
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      // Unwrap: clean the subtree, then hoist its children in place and drop
      // the disallowed wrapper (keeps the text, loses the unknown tag).
      cleanElement(el);
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
      continue;
    }

    // IFRAME — keep ONLY an allow-listed video embed; otherwise drop whole.
    if (tag === "IFRAME") {
      const src = (el.getAttribute("src") || "").trim();
      if (!VIDEO_SRC_RE.test(src)) { el.parentNode?.removeChild(el); continue; }
      for (const a of Array.from(el.attributes)) el.removeAttribute(a.name);
      el.setAttribute("src", src);
      el.setAttribute("loading", "lazy");
      el.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      el.setAttribute("allow", "fullscreen; picture-in-picture");
      el.setAttribute("allowfullscreen", "");
      el.setAttribute("frameborder", "0");
      el.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-presentation");
      continue; // iframe content is not part of our DOM — no recurse
    }

    // IMG — keep an http(s) src + alt only (NO data:, no event handlers).
    if (tag === "IMG") {
      const src = (el.getAttribute("src") || "").trim();
      const alt = el.getAttribute("alt") || "";
      if (!IMG_SRC_RE.test(src)) { el.parentNode?.removeChild(el); continue; }
      for (const a of Array.from(el.attributes)) el.removeAttribute(a.name);
      el.setAttribute("src", src);
      if (alt) el.setAttribute("alt", alt);
      el.setAttribute("loading", "lazy");
      continue;
    }

    // Other allowed tags → strip every attribute except a vetted href on <a>.
    for (const attr of Array.from(el.attributes)) {
      const keepHref =
        tag === "A" &&
        attr.name.toLowerCase() === "href" &&
        /^(https?:|mailto:)/i.test(attr.value.trim());
      if (!keepHref) el.removeAttribute(attr.name);
    }
    if (tag === "A" && el.getAttribute("href")) {
      el.setAttribute("rel", "noopener noreferrer nofollow");
      el.setAttribute("target", "_blank");
    }

    cleanElement(el); // recurse into the now-clean element
  }
}

/** Return an allow-listed, attribute-stripped copy of `dirty`. Safe to pass to
 *  dangerouslySetInnerHTML. SSR/prerender (no DOMParser) → strip all tags. */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    return dirty.replace(/<[^>]*>/g, ""); // server fallback: plain text only
  }
  const doc = new DOMParser().parseFromString(dirty, "text/html");
  cleanElement(doc.body);
  return doc.body.innerHTML;
}

/** True if the string carries real HTML markup (used to decide whether a
 *  stored value is rich HTML or legacy plain text). */
export function looksLikeHtml(s: string): boolean {
  return /<\/?(p|br|b|strong|i|em|u|s|ul|ol|li|h[1-4]|blockquote|a|span|div|code|pre|hr|img|iframe|figure|figcaption)\b[^>]*>/i.test(s);
}

/** Visible text content of an HTML string (for emptiness checks). */
export function htmlToPlainText(html: string): string {
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    return html.replace(/<[^>]*>/g, " ");
  }
  const doc = new DOMParser().parseFromString(sanitizeHtml(html), "text/html");
  return (doc.body.textContent ?? "").replace(/ /g, " ");
}

/** True if the HTML has any real (non-whitespace) text content. */
export function htmlHasText(html: string): boolean {
  return htmlToPlainText(html).trim().length > 0;
}
