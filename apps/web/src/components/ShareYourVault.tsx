// @version 0.1.0 @date 2026-06-15
// ShareYourVault (Daniel 2026-06-15) — a social-share CTA shown ONLY on a vault
// store SUCCESS screen (the Enrol "done" step), never on a test/drill. Lets a
// user broadcast that they created a vault with NoKLock, carrying THEIR referral
// link so a share can convert AND credit them. Uses the Web Share API where
// available (mobile / installed PWA), with an X-intent link + copy-message
// fallback on desktop. Tier-aware copy (free vs premium). No new tracking — the
// referral attribution already happens on the landing side when the link opens.

import { useState } from "react";
import { BRAND_NAME } from "../lib/brand.js";

const SITE = "https://noklock.app";

// What the user just stored, in shareable words (per enrol kind).
const KIND_SHARE_NOUN: Record<string, string> = {
  seed: "seed phrase",
  letter: "sealed letter",
  document: "important documents",
  image: "private files",
};

export function ShareYourVault({
  kind,
  isPremium,
  refAddress,
}: {
  readonly kind: string;
  readonly isPremium: boolean;
  readonly refAddress?: string | null;
}): JSX.Element {
  const [copied, setCopied] = useState(false);

  // Canonical referral link (the production domain, not a localhost origin —
  // a share has to point somewhere real). Falls back to the bare site if no
  // valid wallet is connected to attribute the referral to.
  const link =
    refAddress && /^0x[a-fA-F0-9]{40}$/.test(refAddress) ? `${SITE}/?ref=${refAddress}` : SITE;

  const noun = KIND_SHARE_NOUN[kind] ?? "crypto secret";
  const shareText = isPremium
    ? `I just secured my ${noun} with ${BRAND_NAME} Premium — self-custody crypto inheritance where no company ever holds my keys. Split, encrypted, and recoverable by my next-of-kin if anything ever happens to me.`
    : `I just backed up my ${noun} with ${BRAND_NAME} — self-custody crypto inheritance where no company ever holds my keys. Free to start.`;

  async function copyMessage(): Promise<void> {
    try {
      await navigator.clipboard.writeText(`${shareText} ${link}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  async function doShare(): Promise<void> {
    const shareData = { title: `${BRAND_NAME} — self-custody inheritance`, text: shareText, url: link };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* user cancelled or share failed — fall through to copy */
    }
    await copyMessage();
  }

  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`;

  return (
    <div className="mt-3 rounded-lg border border-accent-cyan/30 bg-bg-deepest/40 p-3">
      <p className="text-sm text-text-on-dark/90">
        <strong>Spread the word.</strong> Share that you created {isPremium ? "a Premium vault" : "a vault"} with{" "}
        {BRAND_NAME} — your link credits you if someone joins through it.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button className="btn btn-primary text-sm" onClick={() => void doShare()}>
          Share ↗
        </button>
        <a className="btn btn-secondary text-sm" href={xIntent} target="_blank" rel="noopener noreferrer">
          Post on X
        </a>
        <button className="btn btn-secondary text-sm" onClick={() => void copyMessage()}>
          {copied ? "Copied ✓" : "Copy message"}
        </button>
      </div>
      <p className="text-[11px] text-text-muted mt-2 break-all">
        Your referral link: <span className="font-mono text-accent-cyan">{link}</span>
      </p>
    </div>
  );
}
