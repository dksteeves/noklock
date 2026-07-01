// @version 0.1.0 @date 2026-05-26
// Per-partner playbook exports beyond markdown: RTF (Daniel's preferred doc
// format; opens in Wordpad/Word with bold/headings/tables intact) and a Print/
// Save-as-PDF window (opens a styled HTML view and triggers the browser's
// print dialog — user picks "Save as PDF" or a printer). No npm deps — the
// workspace `npm install` is broken, so RTF and HTML are both hand-rolled
// from the same markdown the .md download uses.

import type { ContestConfig } from "./contestTemplate.js";
import { buildContestPlaybook } from "./contestPlaybook.js";

// ── RTF ─────────────────────────────────────────────────────────────────────

function escapeRtfText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    // Non-ASCII → RTF unicode escape so Wordpad renders cleanly.
    .replace(/[-￿]/g, (c) => `\\u${c.charCodeAt(0)}?`);
}

/** Inline markdown → RTF for a single line. Order matters: do link rewriting
 *  BEFORE escape (so `(` `)` `[` `]` are still raw), then escape, then apply
 *  markdown markers (which are ASCII and survive the escape untouched), so the
 *  resulting `\b` / `\i` / `\f1` groups insert into already-escaped content
 *  without double-escaping. */
function inlineMdToRtf(s: string): string {
  let t = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
  t = escapeRtfText(t);
  t = t.replace(/\*\*([^*]+)\*\*/g, "{\\b $1}");
  t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1{\\i $2}");
  t = t.replace(/`([^`]+)`/g, "{\\f1 $1\\f0}");
  return t;
}

function markdownToRtf(md: string): string {
  const out: string[] = [];
  out.push(
    "{\\rtf1\\ansi\\ansicpg1252\\deff0" +
      "{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}{\\f1\\fnil\\fcharset0 Consolas;}}\n" +
      "\\f0\\fs22\n",
  );
  const lines = md.split(/\r?\n/);
  let inFence = false;
  for (const raw of lines) {
    if (raw.trimStart().startsWith("```")) {
      inFence = !inFence;
      out.push("\\par\n");
      continue;
    }
    if (inFence) {
      out.push(`{\\f1\\fs20 ${escapeRtfText(raw)}}\\par\n`);
      continue;
    }
    if (raw.trim() === "") {
      out.push("\\par\n");
      continue;
    }
    if (raw.trim() === "---") {
      out.push("\\par{\\fs18 ________________________________________}\\par\n");
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = /^# (.+)$/.exec(raw))) {
      out.push(`{\\b\\fs36 ${inlineMdToRtf(m[1]!)}}\\par\n`);
      continue;
    }
    if ((m = /^## (.+)$/.exec(raw))) {
      out.push(`\\par{\\b\\fs30 ${inlineMdToRtf(m[1]!)}}\\par\n`);
      continue;
    }
    if ((m = /^### (.+)$/.exec(raw))) {
      out.push(`{\\b\\fs26 ${inlineMdToRtf(m[1]!)}}\\par\n`);
      continue;
    }
    // Table row: `| a | b | c |` — skip separator rows. Tab-separated cells
    // render readably in Wordpad without a full RTF table block.
    if (/^\s*\|.*\|\s*$/.test(raw)) {
      if (/^\s*\|\s*[-: ]+\s*(\|\s*[-: ]+\s*)+\|\s*$/.test(raw)) continue;
      const cells = raw
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim());
      out.push(cells.map((c) => inlineMdToRtf(c)).join("\\tab "));
      out.push("\\par\n");
      continue;
    }
    if (/^\s*[-*+] /.test(raw)) {
      const body = raw.replace(/^\s*[-*+] /, "");
      out.push(`\\bullet  ${inlineMdToRtf(body)}\\par\n`);
      continue;
    }
    if ((m = /^\s*(\d+)\. (.+)$/.exec(raw))) {
      out.push(`${m[1]}. ${inlineMdToRtf(m[2]!)}\\par\n`);
      continue;
    }
    out.push(`${inlineMdToRtf(raw)}\\par\n`);
  }
  out.push("}\n");
  return out.join("");
}

export function buildContestPlaybookRtf(cfg: ContestConfig): string {
  return markdownToRtf(buildContestPlaybook(cfg));
}

// ── HTML (for the Print / Save-as-PDF window) ────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

/** Inline markdown → HTML. Pull links out into placeholders BEFORE HTML escape
 *  so the `<` `>` in the resulting `<a>` tag don't get themselves escaped,
 *  then re-inflate after the inline markdown markers have been substituted. */
function inlineMdToHtml(s: string): string {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: Array<{ text: string; url: string }> = [];
  let t = s.replace(linkRe, (_, text: string, url: string) => `LINK${links.push({ text, url }) - 1}`);
  t = escapeHtml(t);
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/LINK(\d+)/g, (_, i: string) => {
    const l = links[Number(i)]!;
    return `<a href="${encodeURI(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.text)}</a>`;
  });
  return t;
}

function markdownToHtml(md: string): string {
  const out: string[] = [];
  const lines = md.split(/\r?\n/);
  let inFence = false;
  let inList = false;
  let inOl = false;
  let inTable = false;
  let tableCols = 0;

  function closeBlocks(): void {
    if (inList) { out.push("</ul>"); inList = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
    if (inTable) { out.push("</tbody></table>"); inTable = false; tableCols = 0; }
  }

  for (const raw of lines) {
    if (raw.trimStart().startsWith("```")) {
      closeBlocks();
      if (!inFence) { out.push("<pre>"); inFence = true; }
      else { out.push("</pre>"); inFence = false; }
      continue;
    }
    if (inFence) {
      out.push(escapeHtml(raw) + "\n");
      continue;
    }
    if (raw.trim() === "") { closeBlocks(); continue; }
    if (raw.trim() === "---") { closeBlocks(); out.push("<hr>"); continue; }

    let m: RegExpExecArray | null;
    if ((m = /^# (.+)$/.exec(raw))) { closeBlocks(); out.push(`<h1>${inlineMdToHtml(m[1]!)}</h1>`); continue; }
    if ((m = /^## (.+)$/.exec(raw))) { closeBlocks(); out.push(`<h2>${inlineMdToHtml(m[1]!)}</h2>`); continue; }
    if ((m = /^### (.+)$/.exec(raw))) { closeBlocks(); out.push(`<h3>${inlineMdToHtml(m[1]!)}</h3>`); continue; }

    if (/^\s*\|.*\|\s*$/.test(raw)) {
      if (/^\s*\|\s*[-: ]+\s*(\|\s*[-: ]+\s*)+\|\s*$/.test(raw)) continue;
      const cells = raw.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      if (!inTable) {
        closeBlocks();
        out.push("<table><thead><tr>" + cells.map((c) => `<th>${inlineMdToHtml(c)}</th>`).join("") + "</tr></thead><tbody>");
        inTable = true;
        tableCols = cells.length;
      } else {
        const padded = cells.slice(0, tableCols);
        while (padded.length < tableCols) padded.push("");
        out.push("<tr>" + padded.map((c) => `<td>${inlineMdToHtml(c)}</td>`).join("") + "</tr>");
      }
      continue;
    }

    if (/^\s*[-*+] /.test(raw)) {
      if (inOl) { out.push("</ol>"); inOl = false; }
      if (inTable) { out.push("</tbody></table>"); inTable = false; tableCols = 0; }
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inlineMdToHtml(raw.replace(/^\s*[-*+] /, ""))}</li>`);
      continue;
    }
    if ((m = /^\s*(\d+)\. (.+)$/.exec(raw))) {
      if (inList) { out.push("</ul>"); inList = false; }
      if (inTable) { out.push("</tbody></table>"); inTable = false; tableCols = 0; }
      if (!inOl) { out.push("<ol>"); inOl = true; }
      out.push(`<li>${inlineMdToHtml(m[2]!)}</li>`);
      continue;
    }

    closeBlocks();
    out.push(`<p>${inlineMdToHtml(raw)}</p>`);
  }
  closeBlocks();
  if (inFence) out.push("</pre>");
  return out.join("\n");
}

export function buildContestPlaybookHtml(cfg: ContestConfig): string {
  const title = `NoKLock x ${cfg.groupName || "Partner"} - Refer & Share Playbook`;
  const body = markdownToHtml(buildContestPlaybook(cfg));
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: -apple-system, system-ui, "Segoe UI", Roboto, Inter, sans-serif; line-height: 1.55; color: #1a202c; max-width: 760px; margin: 32px auto; padding: 0 24px; background: #fff; }
  h1 { font-size: 28px; margin-top: 0; margin-bottom: 4px; }
  h1 + p em { color: #718096; }
  h2 { font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 32px; }
  h3 { font-size: 16px; margin-top: 24px; }
  p, ul, ol, table, pre, hr { margin: 12px 0; }
  pre { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; overflow-x: auto; font-family: ui-monospace, "Cascadia Code", "Consolas", monospace; font-size: 12.5px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
  code { background: #f7fafc; padding: 1px 4px; border-radius: 3px; font-family: ui-monospace, "Cascadia Code", "Consolas", monospace; font-size: 90%; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #f7fafc; }
  ul, ol { padding-left: 22px; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
  a { color: #2b6cb0; word-break: break-word; }
  @media print {
    body { max-width: none; margin: 0; padding: 12mm; font-size: 11pt; }
    h1 { font-size: 22pt; }
    h2 { font-size: 14pt; }
    h3 { font-size: 12pt; }
    pre, code { font-size: 9.5pt; }
    a { color: #1a202c; text-decoration: none; }
  }
</style></head><body>
${body}
</body></html>`;
}

/** Open the playbook in a new tab styled for both screen and print, and
 *  trigger the browser print dialog. Users can pick "Save as PDF" as the
 *  destination — that's the universal way to get a PDF without bundling a
 *  PDF library (which the broken workspace install wouldn't support). */
export function openPlaybookPrintWindow(cfg: ContestConfig): boolean {
  const w = window.open("", "_blank");
  if (!w) return false; // pop-up blocked
  const html = buildContestPlaybookHtml(cfg);
  w.document.open();
  w.document.write(html);
  w.document.close();
  const fire = (): void => {
    try { w.focus(); w.print(); } catch { /* ignore */ }
  };
  if (w.document.readyState === "complete") window.setTimeout(fire, 250);
  else w.addEventListener("load", () => window.setTimeout(fire, 250));
  return true;
}
