// @version 0.1.0 @date 2026-05-22
// Footer feedback popup. Daniel 2026-05-22: both "Found a bug?" and "Tell
// us what's rough" should open a small contact form (name + email required,
// subject required + prefilled, description required) instead of jumping to
// the FAQ / a bare mailto.
//
// Backend: NONE by design (no public unauth endpoint to spam; no Form B
// redeploy). On submit it composes a fully-prefilled mailto to
// hello@noklock.app and opens the user's mail app — so we still get their
// real email + structured details. (If we later want a true in-app submit
// that lands even without a mail client, that's a Form B /v1/feedback
// endpoint — a separate opt-in.)

import { useEffect, useState } from "react";

interface Props {
  readonly open: boolean;
  readonly defaultSubject: string;
  readonly kind: "bug" | "rough";
  readonly onClose: () => void;
}

export function FeedbackModal({ open, defaultSubject, kind, onClose }: Props): JSX.Element | null {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [desc, setDesc] = useState("");

  useEffect(() => { setSubject(defaultSubject); }, [defaultSubject]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSend = name.trim().length > 0 && emailOk && subject.trim().length > 0 && desc.trim().length > 0;

  function send(): void {
    const body = `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${desc.trim()}`;
    const href = `mailto:hello@noklock.app?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fb-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-bg-deepest border border-bg-surface rounded-lg shadow-2xl w-full max-w-lg p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 id="fb-title" className="text-xl font-bold font-display">
            <span className="grad">{kind === "bug" ? "Report a bug" : "Tell us what's rough"}</span>
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-text-muted hover:text-text-on-dark text-lg leading-none">✕</button>
        </div>
        <p className="text-sm text-text-muted">
          {kind === "bug"
            ? "Anything broken — front-end, contracts, docs, a false claim. Reproducer steps help. Verified bugs earn a free Lifetime licence."
            : "A label that confused you, a step that's unclear, copy that doesn't land, a flow we missed — anything. We read all of it."}
        </p>

        <div className="grid sm:grid-cols-2 gap-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *"
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email *"
            className="bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
        </div>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject *"
          className="w-full bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5}
          placeholder={kind === "bug" ? "What happened, and how to reproduce it (page / address / function if you know)…" : "What felt rough, and where…"}
          className="w-full bg-bg-deepest border border-bg-surface rounded p-2 text-sm" />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="text-xs text-text-muted">
            Opens your email with everything filled in. Prefer to write directly? <a href="mailto:hello@noklock.app" className="text-accent-cyan hover:underline">hello@noklock.app</a>
          </p>
          <button className="btn btn-primary" disabled={!canSend} onClick={send}
            title={canSend ? "Send" : "Fill name, a valid email, subject and description"}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
