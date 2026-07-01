// @version 0.2.0 @date 2026-05-27
// 0.2.0 — Fire `partner_card_built` on a successful Download OR Copy. Same
//         zero-PII rule as the rest of the analytics: anon (event, day) +1
//         only; suppressed for excluded admin/treasury wallets.
// 0.1.0 — Standalone partner-card builder. Renders a Daniel-approved cobrand
// "Partner × NoKLock" PNG (1200×675) via lib/partnerCard.ts (Canvas 2D, zero
// deps — workspace `npm install` is broken so no html-to-image / html2canvas).
//
// Use cases (independent of contests):
//   * announcing a new partnership;
//   * a Telegram channel banner;
//   * an X share card pinned at the top of the announcement reply chain.
//
// The Refer & Share ContestBuilder reuses the same renderer for its "Sample
// campaign" tab so the partner sees the actual artifact, not a description.

import { useEffect, useRef, useState } from "react";
import { renderPartnerCardPng, canvasToPng, type PartnerCardConfig } from "../lib/partnerCard.js";
import { trackEvent } from "../lib/track.js";

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    const C = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    if (!C || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new C({ [blob.type]: blob })]);
    return true;
  } catch {
    return false;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(typeof r.result === "string" ? r.result : "");
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

export function PartnerCardBuilder(): JSX.Element {
  const [partnerName, setPartnerName] = useState("");
  const [partnerUrl, setPartnerUrl] = useState("");
  // 0.2.0 — Daniel 2026-05-30: reframed default to push STORE & RESTORE
  // first (the primary value); inheritance is the bonus on top. The
  // first sentence a partner shares should be the one most users see
  // themselves in — most people care about losing their seed before
  // they care about leaving it behind.
  const [tagline, setTagline] = useState("Self-custodial Seed Store & Restore — chain-protected, you keep the keys.");
  const [partnerLogoSrc, setPartnerLogoSrc] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cfg: PartnerCardConfig = { partnerName, partnerUrl, tagline, partnerLogoSrc };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!canvasRef.current) return;
      try {
        await renderPartnerCardPng(canvasRef.current, cfg);
      } catch (e) {
        if (!cancelled) setMsg(`Render failed: ${(e as Error).message}`);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerName, partnerUrl, tagline, partnerLogoSrc]);

  async function onLogoFile(file: File | null): Promise<void> {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setMsg("Logo over 4 MB — please use a smaller file."); return; }
    const url = await readAsDataUrl(file);
    setPartnerLogoSrc(url);
    setMsg(null);
  }

  async function onDownload(): Promise<void> {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const blob = await canvasToPng(canvasRef.current);
      const slug = (partnerName || "partner").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "partner";
      downloadBlob(`noklock-${slug}-card.png`, blob);
      setMsg("Downloaded ✓");
      trackEvent("partner_card_built");
    } catch (e) {
      setMsg(`Download failed: ${(e as Error).message}`);
    }
    setBusy(false);
  }

  async function onCopy(): Promise<void> {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const blob = await canvasToPng(canvasRef.current);
      const ok = await copyBlobToClipboard(blob);
      setMsg(ok ? "Copied to clipboard ✓ (paste into Telegram / X / anywhere that accepts images)" : "Clipboard not available — use Download instead.");
      if (ok) trackEvent("partner_card_built");
    } catch (e) {
      setMsg(`Copy failed: ${(e as Error).message}`);
    }
    setBusy(false);
  }

  return (
    <div className="card">
      <h3 className="font-bold font-display mb-1">Partner card builder</h3>
      <p className="text-xs text-text-muted mb-3">
        Cobrand "Partner × NoKLock" PNG (1200×675) — Telegram, X, channel banner, anywhere. Upload the partner's logo, type a one-line tagline, click Download.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-text-muted text-xs">Partner name</span>
          <input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="e.g. DegenDAO" className="w-full bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm mt-1" />
        </label>
        <label className="block">
          <span className="text-text-muted text-xs">Partner URL (shown bottom-left)</span>
          <input value={partnerUrl} onChange={(e) => setPartnerUrl(e.target.value)} placeholder="degendao.xyz" className="w-full bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm mt-1 font-mono" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-text-muted text-xs">Tagline (1 line, ~80 chars max — auto-scales)</span>
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm mt-1" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-text-muted text-xs">Partner logo (PNG/JPG/SVG, transparent preferred)</span>
          <input type="file" accept="image/*" onChange={(e) => void onLogoFile(e.target.files?.[0] ?? null)} className="w-full text-xs text-text-on-dark/80 mt-1 file:bg-bg-surface file:text-text-on-dark/90 file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 file:text-xs" />
          {partnerLogoSrc && <button onClick={() => setPartnerLogoSrc("")} className="text-[11px] text-text-muted hover:text-danger mt-1">Clear logo</button>}
        </label>
      </div>

      <div className="rounded-lg border border-bg-surface bg-black/30 p-2">
        <canvas ref={canvasRef} className="w-full max-w-full rounded" style={{ aspectRatio: "1200 / 675" }} />
      </div>

      <div className="flex flex-wrap gap-2 items-center mt-3">
        <button onClick={() => void onDownload()} disabled={busy} className="btn btn-primary text-sm">
          {busy ? "Working…" : "Download PNG"}
        </button>
        <button onClick={() => void onCopy()} disabled={busy} className="btn btn-secondary text-sm">
          Copy image
        </button>
        {msg && <span className="text-xs text-text-muted">{msg}</span>}
      </div>
    </div>
  );
}
