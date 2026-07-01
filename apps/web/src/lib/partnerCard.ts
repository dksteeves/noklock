// @version 0.1.0 @date 2026-05-26
// Partner-card PNG renderer (Canvas 2D, ZERO npm deps — the workspace's
// `npm install` is broken so no html-to-image / html2canvas, this is pure
// browser primitives). Renders the Daniel-approved cobrand layout: partner
// logo × NoKLock logo, tagline, footer URLs, NoKLock-branded gradient
// background. 1200×675 (16:9) is the sweet spot for both X share cards and
// Telegram inline link previews.

const CARD_W = 1200;
const CARD_H = 675;
const NOKLOCK_LOGO_SRC = "/logo-512.png";

const COLORS = {
  bgFrom: "#0b1220",       // deep navy top-left
  bgTo: "#172033",         // slightly lighter bottom-right
  accentCyan: "#22d3ee",
  accentTeal: "#5eead4",
  textOn: "#e2e8f0",
  textMuted: "#94a3b8",
  border: "#1e293b",
};

export interface PartnerCardConfig {
  /** Partner display name (used in the eyebrow + tagline placeholder). */
  readonly partnerName: string;
  /** Optional URL shown bottom-left (e.g. "partner.com"). */
  readonly partnerUrl?: string;
  /** Single-line tagline shown under the logos. */
  readonly tagline: string;
  /** Data URL or absolute URL of the partner logo. */
  readonly partnerLogoSrc: string;
}

// Cache loaded images so live preview re-renders are instant.
const _imgCache = new Map<string, HTMLImageElement>();
function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = _imgCache.get(src);
  if (hit && hit.complete && hit.naturalWidth > 0) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // harmless for same-origin and data URLs
    img.onload = () => {
      _imgCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`partnerCard: failed to load ${src.slice(0, 64)}`));
    img.src = src;
  });
}

/** Draw an image fitted (letterboxed) inside a (cx,cy,w,h) box, preserving
 *  aspect ratio. Never crops. */
function drawFitted(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, boxW: number, boxH: number): void {
  if (!img.naturalWidth || !img.naturalHeight) return;
  const scale = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
}

/** Draw a "logo placeholder" panel (rounded rect with the first letter)
 *  when the partner hasn't uploaded a logo yet, so the preview always shows
 *  the layout. */
function drawLogoPlaceholder(ctx: CanvasRenderingContext2D, cx: number, cy: number, boxW: number, boxH: number, letter: string): void {
  const x = cx - boxW / 2;
  const y = cy - boxH / 2;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.strokeStyle = "rgba(148,163,184,0.35)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  roundRect(ctx, x, y, boxW, boxH, 20);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = "700 120px 'Jura', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter || "?", cx, cy + 4);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

/** Render the cobrand partnership card into the given canvas. Resolves once
 *  the canvas has been drawn (so callers can blob/copy it immediately). */
export async function renderPartnerCardPng(canvas: HTMLCanvasElement, cfg: PartnerCardConfig): Promise<void> {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("partnerCard: 2d context unavailable");

  // Ensure the Jura brand font is ready before drawing text (otherwise the
  // first preview uses a fallback font and re-renders visibly). document.fonts
  // is part of modern lib.dom typings; the try/catch covers legacy browsers
  // where it isn't defined.
  try {
    await document.fonts.ready;
  } catch {
    /* not blocking — proceed with fallback fonts */
  }

  // ── Background: diagonal gradient + a soft cyan glow in the corner.
  const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  grad.addColorStop(0, COLORS.bgFrom);
  grad.addColorStop(1, COLORS.bgTo);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  const glow = ctx.createRadialGradient(CARD_W - 60, 80, 0, CARD_W - 60, 80, 540);
  glow.addColorStop(0, "rgba(34,211,238,0.18)");
  glow.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Thin accent border so the card reads as one bounded object on dark Telegram backdrops.
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, CARD_W - 2, CARD_H - 2);

  // ── Eyebrow: PARTNERSHIP (top-centered, accent-teal).
  ctx.fillStyle = COLORS.accentTeal;
  ctx.font = "600 18px 'Jura', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("PARTNERSHIP", CARD_W / 2, 70);

  // ── Centerline: partner logo  ×  NoKLock logo.
  // Two logo boxes (300×300) separated by a big ×.
  const boxW = 300;
  const boxH = 300;
  const cy = 300;
  const leftCx = CARD_W / 2 - 230;
  const rightCx = CARD_W / 2 + 230;

  // Partner logo (left).
  if (cfg.partnerLogoSrc) {
    try {
      const img = await loadImage(cfg.partnerLogoSrc);
      drawFitted(ctx, img, leftCx, cy, boxW, boxH);
    } catch {
      drawLogoPlaceholder(ctx, leftCx, cy, boxW, boxH, (cfg.partnerName || "?").charAt(0).toUpperCase());
    }
  } else {
    drawLogoPlaceholder(ctx, leftCx, cy, boxW, boxH, (cfg.partnerName || "?").charAt(0).toUpperCase());
  }

  // "×" — large, cyan, vertically centered between the two boxes.
  ctx.fillStyle = COLORS.accentCyan;
  ctx.font = "300 130px 'Jura', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("×", CARD_W / 2, cy + 8);

  // NoKLock logo (right).
  try {
    const noklockImg = await loadImage(NOKLOCK_LOGO_SRC);
    drawFitted(ctx, noklockImg, rightCx, cy, boxW, boxH);
  } catch {
    drawLogoPlaceholder(ctx, rightCx, cy, boxW, boxH, "N");
  }

  // Brand caption row under the logos so partner viewers know which side is which.
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = "500 18px 'Jura', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText((cfg.partnerName || "Partner").toUpperCase(), leftCx, cy + boxH / 2 + 36);
  ctx.fillText("NoKLock".toUpperCase(), rightCx, cy + boxH / 2 + 36);

  // ── Tagline (1 line, wrap-safe). Centered, white.
  const tagline = (cfg.tagline || "").trim();
  if (tagline) {
    ctx.fillStyle = COLORS.textOn;
    ctx.font = "600 30px 'Jura', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    drawWrappedLine(ctx, tagline, CARD_W / 2, 570, CARD_W - 120);
  }

  // ── Footer: partner URL left, noklock.app right.
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = "500 18px 'JetBrains Mono', ui-monospace, monospace";
  ctx.textBaseline = "alphabetic";
  if (cfg.partnerUrl) {
    ctx.textAlign = "left";
    ctx.fillText(cfg.partnerUrl, 50, CARD_H - 32);
  }
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.accentCyan;
  ctx.fillText("noklock.app", CARD_W - 50, CARD_H - 32);
}

/** Draw a single line of text, scaling its font size down if it overflows
 *  maxWidth, so the tagline always fits. */
function drawWrappedLine(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number): void {
  let size = 30;
  while (size >= 18) {
    ctx.font = `600 ${size}px 'Jura', system-ui, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      ctx.fillText(text, x, y);
      return;
    }
    size -= 2;
  }
  // Last resort: hard-truncate.
  ctx.font = `600 18px 'Jura', system-ui, sans-serif`;
  let t = text;
  while (t.length > 4 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
  ctx.fillText(t + "…", x, y);
}

/** Export the canvas as a PNG Blob (for download + clipboard copy). */
export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas.toBlob returned null"))), "image/png");
  });
}
