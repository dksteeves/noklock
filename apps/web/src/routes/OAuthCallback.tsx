// @version 0.1.0 @date 2026-05-13
//
// Handles the post-authorise redirect from Dropbox (and later Google /
// OneDrive). Reads the `code` query param, swaps it for an access token,
// then navigates back to wherever the user came from.

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { exchangeCode } from "../lib/dropbox-oauth.js";

export function OAuthCallback({ provider }: { readonly provider: "dropbox" }): JSX.Element {
  const nav = useNavigate();
  const loc = useLocation();
  const [status, setStatus] = useState<"working" | "done" | "error">("working");
  const [message, setMessage] = useState("Exchanging authorisation code for token…");

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const code = params.get("code");
    const errorParam = params.get("error");
    if (errorParam) {
      setStatus("error");
      setMessage(`Provider returned error: ${errorParam} ${params.get("error_description") ?? ""}`);
      return;
    }
    if (!code) {
      setStatus("error");
      setMessage("No authorisation code in URL.");
      return;
    }

    void (async () => {
      try {
        const { returnTo } = await exchangeCode(code);
        setStatus("done");
        setMessage("Authorised. Redirecting…");
        setTimeout(() => nav(returnTo, { replace: true }), 1200);
      } catch (e) {
        setStatus("error");
        setMessage((e as Error).message);
      }
    })();
  }, [loc.search, nav, provider]);

  return (
    <div className="space-y-4">
      <div className="card max-w-xl mx-auto text-center">
        <h1 className="text-xl font-bold font-display mb-2"><span className="grad">Connecting {provider}…</span></h1>
        <p className={`text-sm ${status === "error" ? "text-danger" : "text-text-on-dark/80"}`}>{message}</p>
        {status === "error" && (
          <button className="btn btn-secondary mt-4" onClick={() => nav("/settings")}>Back to Settings</button>
        )}
      </div>
    </div>
  );
}
