// @version 0.3.0 @date 2026-05-27
// 0.3.0 — Fire `partner_contest_drafted` on a successful card download/copy or
//         a successful playbook download/copy/print (any signal that the
//         partner actually produced a shareable contest artifact). Same
//         zero-PII rule: anon (event, day) +1 only.
// 0.2.0 — + Download .rtf (Wordpad/Word-readable, bold/headings/tables) and
//         Print / Save as PDF (opens styled HTML view + triggers browser
//         print dialog) on the Playbook tab — alongside the existing Copy
//         markdown / Download .md. All three drive off the same playbook
//         markdown the builder generates per-partner.
// 0.1.0 — Refer & Share contest builder — drop-in layer on top of NoKLock's on-chain
// referral program. 4-knob form (share % / trigger / prize / distribution) +
// the partner's group name + referrer wallet → live "Sample campaign" preview
// (cobrand card PNG, Telegram post body, 30-second admin pitch) and a per-
// partner Playbook tab (markdown) the partner uses to actually run it.
//
// Reuses lib/partnerCard.ts for the card PNG, lib/contestTemplate.ts for the
// post/pitch text, lib/contestPlaybook.ts for the partner-facing how-to-run-it
// doc. Honour-system payout, on-chain verifiability — see those files.

import { useEffect, useMemo, useRef, useState } from "react";
import { renderPartnerCardPng, canvasToPng, type PartnerCardConfig } from "../lib/partnerCard.js";
import {
  buildContestPostBody, buildContestPitch, polygonscanAddressUrl,
  type ContestConfig, type SharePct, type Distribution,
} from "../lib/contestTemplate.js";
import { buildContestPlaybook } from "../lib/contestPlaybook.js";
import { buildContestPlaybookRtf, openPlaybookPrintWindow } from "../lib/contestPlaybookExports.js";
import { trackEvent } from "../lib/track.js";

const SHARE_OPTIONS: SharePct[] = [2.5, 5, 7.5];
const TRIGGER_PRESETS: number[] = [50, 100, 250, 500];
const PRIZE_PRESETS: { label: string; value: string }[] = [
  { label: "1× Premium Lifetime + remainder USDC", value: "1 Premium Lifetime licence + remainder paid in USDC" },
  { label: "2× Standard licences + remainder USDC", value: "2 Standard licences + remainder paid in USDC" },
  { label: "Pure USDC pool",                         value: "the full pool paid in USDC" },
  { label: "5× Standard licences",                   value: "5 Standard licences, no USDC component" },
];

function downloadBlob(filename: string, data: Blob): void {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
function downloadText(filename: string, body: string, mime: string): void {
  downloadBlob(filename, new Blob([body], { type: mime + ";charset=utf-8" }));
}
async function copyText(t: string): Promise<boolean> {
  try { await navigator.clipboard?.writeText(t); return true; } catch { return false; }
}
async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    const C = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    if (!C || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new C({ [blob.type]: blob })]);
    return true;
  } catch { return false; }
}
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(typeof r.result === "string" ? r.result : "");
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(file);
  });
}
function slug(s: string): string {
  return (s || "partner").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "partner";
}
function tgShareHref(text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent("https://noklock.app")}&text=${encodeURIComponent(text)}`;
}

export function ContestBuilder(): JSX.Element {
  // Partner / card fields
  const [groupName, setGroupName] = useState("");
  const [referrerWallet, setReferrerWallet] = useState("");
  const [partnerUrl, setPartnerUrl] = useState("");
  const [partnerLogoSrc, setPartnerLogoSrc] = useState<string>("");
  // Contest knobs
  const [sharePct, setSharePct] = useState<SharePct>(5);
  const [triggerCount, setTriggerCount] = useState<number>(100);
  const [prize, setPrize] = useState<string>(PRIZE_PRESETS[0]!.value);
  const [distrKind, setDistrKind] = useState<"equal" | "raffle" | "weighted">("raffle");
  const [raffleWinners, setRaffleWinners] = useState<number>(1);
  const [currentCount, setCurrentCount] = useState<number>(0);
  // UI
  const [tab, setTab] = useState<"sample" | "playbook">("sample");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const distribution: Distribution = useMemo(() => {
    if (distrKind === "equal") return { kind: "equal" };
    if (distrKind === "weighted") return { kind: "weighted" };
    return { kind: "raffle", winners: Math.max(1, raffleWinners) };
  }, [distrKind, raffleWinners]);

  const cfg: ContestConfig = useMemo(() => ({
    groupName, referrerWallet, sharePct, triggerCount, prize, distribution, currentCount,
  }), [groupName, referrerWallet, sharePct, triggerCount, prize, distribution, currentCount]);

  const postBody = useMemo(() => buildContestPostBody(cfg), [cfg]);
  const pitch    = useMemo(() => buildContestPitch(cfg), [cfg]);
  const playbook = useMemo(() => buildContestPlaybook(cfg), [cfg]);

  // Live re-render the cobrand card whenever any card-relevant field changes.
  useEffect(() => {
    if (!canvasRef.current) return;
    const cardCfg: PartnerCardConfig = {
      partnerName: groupName,
      partnerUrl,
      tagline: groupName ? `Community Reward Drop · ${groupName}` : "Community Reward Drop",
      partnerLogoSrc,
    };
    void renderPartnerCardPng(canvasRef.current, cardCfg).catch((e: Error) => setMsg(`Card render failed: ${e.message}`));
  }, [groupName, partnerUrl, partnerLogoSrc]);

  async function onLogoFile(file: File | null): Promise<void> {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setMsg("Logo over 4 MB — please use a smaller file."); return; }
    setPartnerLogoSrc(await readAsDataUrl(file));
    setMsg(null);
  }

  async function onDownloadCard(): Promise<void> {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const blob = await canvasToPng(canvasRef.current);
      downloadBlob(`noklock-${slug(groupName)}-contest-card.png`, blob);
      setMsg("Card downloaded ✓");
      trackEvent("partner_contest_drafted");
    } catch (e) { setMsg(`Download failed: ${(e as Error).message}`); }
    setBusy(false);
  }
  async function onCopyCard(): Promise<void> {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const blob = await canvasToPng(canvasRef.current);
      const ok = await copyBlobToClipboard(blob);
      setMsg(ok ? "Card copied to clipboard ✓" : "Clipboard not available — use Download instead.");
      if (ok) trackEvent("partner_contest_drafted");
    } catch (e) { setMsg(`Copy failed: ${(e as Error).message}`); }
    setBusy(false);
  }

  return (
    <div className="card">
      <h3 className="font-bold font-display mb-1">Refer &amp; Share — contest builder</h3>
      <p className="text-xs text-text-muted mb-3">
        A drop-in layer on top of NoKLock's on-chain referral program: visiting your link gets the buyer 10% off; you earn 10% of what they pay in USDC, on-chain at mint, no claim step. Set 4 knobs, share the artifacts with the partner. <strong>Honour-system payout, on-chain verifiability</strong> — the partner pays out from their earned USDC; anyone in the group can independently calculate the pool from public chain data.
      </p>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-text-muted text-xs">Partner / group name</span>
          <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. DegenDAO" className="w-full bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm mt-1" />
        </label>
        <label className="block">
          <span className="text-text-muted text-xs">Partner referrer wallet (Polygon)</span>
          <input value={referrerWallet} onChange={(e) => setReferrerWallet(e.target.value.trim())} placeholder="0x…" className="w-full bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm mt-1 font-mono" />
        </label>
        <label className="block">
          <span className="text-text-muted text-xs">Partner URL (shown bottom-left of card)</span>
          <input value={partnerUrl} onChange={(e) => setPartnerUrl(e.target.value)} placeholder="degendao.xyz" className="w-full bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm mt-1 font-mono" />
        </label>
        <label className="block">
          <span className="text-text-muted text-xs">Partner logo (PNG/JPG/SVG, transparent preferred)</span>
          <input type="file" accept="image/*" onChange={(e) => void onLogoFile(e.target.files?.[0] ?? null)} className="w-full text-xs text-text-on-dark/80 mt-1 file:bg-bg-surface file:text-text-on-dark/90 file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 file:text-xs" />
        </label>

        <label className="block">
          <span className="text-text-muted text-xs">Pool share of earned referral USDC</span>
          <div className="flex gap-2 mt-1">
            {SHARE_OPTIONS.map((s) => (
              <button key={s} onClick={() => setSharePct(s)} className={`px-3 py-1.5 rounded border text-sm ${sharePct === s ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan" : "border-bg-surface text-text-on-dark/80 hover:bg-bg-surface"}`}>{s}%</button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="text-text-muted text-xs">Trigger (qualified signups)</span>
          <div className="flex gap-2 mt-1 flex-wrap">
            {TRIGGER_PRESETS.map((n) => (
              <button key={n} onClick={() => setTriggerCount(n)} className={`px-3 py-1.5 rounded border text-sm ${triggerCount === n ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan" : "border-bg-surface text-text-on-dark/80 hover:bg-bg-surface"}`}>{n}</button>
            ))}
            <input type="number" min={1} value={triggerCount} onChange={(e) => setTriggerCount(Math.max(1, Number(e.target.value) || 0))} className="w-20 bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm" />
          </div>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-text-muted text-xs">Prize (pick a preset or type your own)</span>
          <div className="flex gap-2 mt-1 flex-wrap">
            {PRIZE_PRESETS.map((p) => (
              <button key={p.label} onClick={() => setPrize(p.value)} className={`px-2 py-1 rounded border text-[11px] ${prize === p.value ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan" : "border-bg-surface text-text-on-dark/80 hover:bg-bg-surface"}`}>{p.label}</button>
            ))}
          </div>
          <input value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="e.g. 1 Premium Lifetime + remainder USDC" className="w-full bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm mt-2" />
        </label>

        <label className="block">
          <span className="text-text-muted text-xs">Distribution</span>
          <div className="flex gap-2 mt-1 flex-wrap items-center">
            {(["equal", "raffle", "weighted"] as const).map((k) => (
              <button key={k} onClick={() => setDistrKind(k)} className={`px-3 py-1.5 rounded border text-sm ${distrKind === k ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan" : "border-bg-surface text-text-on-dark/80 hover:bg-bg-surface"}`}>{k === "equal" ? "Equal" : k === "raffle" ? "Raffle" : "Weighted"}</button>
            ))}
            {distrKind === "raffle" && (
              <span className="text-xs text-text-muted ml-2">winners
                <input type="number" min={1} value={raffleWinners} onChange={(e) => setRaffleWinners(Math.max(1, Number(e.target.value) || 1))} className="w-16 bg-bg-deepest border border-bg-surface rounded px-2 py-1 text-sm ml-1" />
              </span>
            )}
          </div>
        </label>

        <label className="block">
          <span className="text-text-muted text-xs">Current signup count (you update this before each re-post)</span>
          <input type="number" min={0} value={currentCount} onChange={(e) => setCurrentCount(Math.max(0, Number(e.target.value) || 0))} className="w-full bg-bg-deepest border border-bg-surface rounded px-2 py-1.5 text-sm mt-1" />
        </label>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-bg-surface mt-2">
        <button onClick={() => setTab("sample")} className={`px-4 py-2 text-sm font-display border-b-2 -mb-px transition-colors ${tab === "sample" ? "border-accent-cyan text-accent-cyan" : "border-transparent text-text-on-dark/70 hover:text-text-on-dark"}`}>Sample campaign</button>
        <button onClick={() => setTab("playbook")} className={`px-4 py-2 text-sm font-display border-b-2 -mb-px transition-colors ${tab === "playbook" ? "border-accent-cyan text-accent-cyan" : "border-transparent text-text-on-dark/70 hover:text-text-on-dark"}`}>Partner playbook</button>
      </div>

      {tab === "sample" && (
        <div className="space-y-4 pt-4">
          <div>
            <h4 className="font-bold font-display text-sm mb-1">Announcement card (post with the message below)</h4>
            <div className="rounded-lg border border-bg-surface bg-black/30 p-2">
              <canvas ref={canvasRef} className="w-full max-w-full rounded" style={{ aspectRatio: "1200 / 675" }} />
            </div>
            <div className="flex flex-wrap gap-2 items-center mt-2">
              <button onClick={() => void onDownloadCard()} disabled={busy} className="btn btn-primary text-sm">{busy ? "Working…" : "Download card PNG"}</button>
              <button onClick={() => void onCopyCard()} disabled={busy} className="btn btn-secondary text-sm">Copy card to clipboard</button>
            </div>
          </div>

          <div>
            <h4 className="font-bold font-display text-sm mb-1">Telegram group post (the announcement message body)</h4>
            <pre className="text-sm whitespace-pre-wrap rounded border border-bg-surface bg-bg-deepest/60 p-3 text-text-on-dark/90">{postBody}</pre>
            <div className="flex flex-wrap gap-2 mt-2">
              <a href={tgShareHref(postBody)} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-1 rounded bg-accent-cyan/20 text-accent-cyan font-semibold hover:opacity-80">Share to Telegram ↗</a>
              <button onClick={() => void copyText(postBody).then((ok) => setMsg(ok ? "Post body copied ✓" : "Clipboard blocked"))} className="text-[11px] px-2 py-1 rounded bg-bg-surface text-text-on-dark/80 hover:opacity-80">Copy post body</button>
              <a href={polygonscanAddressUrl(referrerWallet || "0x")} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-1 rounded bg-bg-surface text-accent-cyan hover:opacity-80">Verify wallet on PolygonScan ↗</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold font-display text-sm mb-1">30-second admin pitch (DM to other group admins)</h4>
            <pre className="text-sm whitespace-pre-wrap rounded border border-bg-surface bg-bg-deepest/60 p-3 text-text-on-dark/90">{pitch}</pre>
            <button onClick={() => void copyText(pitch).then((ok) => setMsg(ok ? "Pitch copied ✓" : "Clipboard blocked"))} className="text-[11px] px-2 py-1 rounded bg-bg-surface text-text-on-dark/80 hover:opacity-80 mt-2">Copy pitch</button>
          </div>
        </div>
      )}

      {tab === "playbook" && (
        <div className="pt-4 space-y-2">
          <p className="text-xs text-text-muted">
            The single doc the partner uses to actually run the contest end-to-end. Customized to their group + wallet + knob settings above. Download as <strong>RTF</strong> (opens in Word / Wordpad), or copy the text to paste into Telegram / Notion / Google Docs.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { downloadText(`noklock-refer-share-${slug(groupName)}.rtf`, buildContestPlaybookRtf(cfg), "application/rtf"); trackEvent("partner_contest_drafted"); setMsg("Playbook downloaded as RTF ✓ (opens in Word / Wordpad)"); }} className="btn btn-primary text-sm">Download .rtf</button>
            <button onClick={() => void copyText(playbook).then((ok) => { if (ok) { trackEvent("partner_contest_drafted"); setMsg("Playbook text copied ✓"); } else { setMsg("Clipboard blocked"); } })} className="btn btn-secondary text-sm">Copy text</button>
            <button onClick={() => { const ok = openPlaybookPrintWindow(cfg); if (ok) { trackEvent("partner_contest_drafted"); setMsg("Print window opened — pick \"Save as PDF\" in the browser print dialog."); } else { setMsg("Pop-up blocked — allow pop-ups for noklock.app, or use Download .rtf."); } }} className="btn btn-secondary text-sm">Print / Save as PDF</button>
          </div>
          <pre className="text-xs whitespace-pre-wrap rounded border border-bg-surface bg-bg-deepest/60 p-3 text-text-on-dark/90 max-h-[60vh] overflow-y-auto">{playbook}</pre>
        </div>
      )}

      {msg && <p className="text-xs text-accent-cyan mt-3">{msg}</p>}
    </div>
  );
}
