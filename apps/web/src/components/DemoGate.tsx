// @version 0.1.0 @date 2026-05-29
// /shamir, /argon, /aead, /restore-viz, /roundtrip, /bip39, /manifest exist
// as screen-record fodder — clean fullscreen-looped viz for making social
// clips. Daniel asked these be gated behind `?demo=record` so casual
// visitors don't land in them via search; recording sessions just append
// the flag. Sets `<meta name="robots" content="noindex">` on the page so
// search engines drop the URL even if someone shares it.
//
// If the query flag is missing, renders a calm "demo recording mode"
// gate instead of the underlying viz showcase. Owners reading this can
// still jump in by appending the param.

import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

interface Props {
  readonly routeName: string;
  readonly children: React.ReactNode;
}

export function DemoGate({ routeName, children }: Props): JSX.Element {
  const [params] = useSearchParams();
  const enabled = params.get("demo") === "record";

  // Ensure robots noindex while on a showcase URL — even when gated, the
  // URL itself shouldn't be indexed. Adds + removes the meta on mount.
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"][data-demo-gate="1"]');
    if (existing) return; // already there
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex,nofollow";
    m.setAttribute("data-demo-gate", "1");
    document.head.appendChild(m);
    return () => {
      const tag = document.querySelector('meta[name="robots"][data-demo-gate="1"]');
      tag?.parentNode?.removeChild(tag);
    };
  }, []);

  if (enabled) return <>{children}</>;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "radial-gradient(ellipse at center, #0b1220 0%, #020617 80%)",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      fontFamily: "Inter, system-ui, sans-serif",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#22d3ee", fontWeight: 700, marginBottom: 12 }}>
        demo recording mode
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, maxWidth: 720 }}>
        {routeName} is a screen-recording surface, not a public page.
      </h1>
      <p style={{ fontSize: 15, color: "#94a3b8", maxWidth: 560, marginBottom: 24, lineHeight: 1.5 }}>
        If you came here from a search result or an old link, you probably want{" "}
        <Link to="/prove-it" style={{ color: "#22d3ee", textDecoration: "underline" }}>/prove-it</Link>{" "}
        — the full pipeline demonstration with playback controls.
      </p>
      <p style={{ fontSize: 13, color: "#64748b", maxWidth: 560 }}>
        Recording? Append <code style={{ background: "#0f172a", padding: "2px 6px", borderRadius: 4, color: "#e2e8f0" }}>?demo=record</code> to the URL.
      </p>
    </div>
  );
}
