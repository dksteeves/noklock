// @version 0.1.0 @date 2026-05-13
//
// Dropbox OAuth 2.0 PKCE flow — entirely client-side, no SoulChain server
// involvement. Spec: https://developers.dropbox.com/oauth-guide
//
// User flow:
//   1. User pastes their Dropbox App Key into Settings
//   2. /settings calls beginAuthorise() — generates a random PKCE verifier,
//      stores it in localStorage, redirects browser to dropbox.com
//   3. User authorises at Dropbox
//   4. Dropbox redirects to /oauth/dropbox?code=...
//   5. OAuthCallback route reads stored verifier + posts to Dropbox's
//      token endpoint, gets {access_token, refresh_token}, stores them,
//      sends user back to /settings (or wherever they came from)
//
// The redirect URI Dropbox is told about MUST be registered in the
// developer's Dropbox app console exactly. We use ${origin}/oauth/dropbox.

import { getAppKey, setPkce, getPkce, setToken } from "./cloud-keys.js";

const AUTH_BASE = "https://www.dropbox.com/oauth2/authorize";
const TOKEN_URL = "https://api.dropboxapi.com/oauth2/token";

export function redirectUriForThisOrigin(): string {
  return `${window.location.origin}/oauth/dropbox`;
}

/** Generate a cryptographically random PKCE verifier (RFC 7636). */
function generateVerifier(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(bytes);
}

async function s256Challenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  return base64UrlEncode(digest);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Step 1 — kick off authorisation. Returns nothing; the browser navigates away. */
export async function beginAuthorise(returnTo: string = "/settings"): Promise<void> {
  const appKey = getAppKey("dropbox");
  if (!appKey || !appKey.appKey) {
    throw new Error("Paste your Dropbox App Key in Settings first.");
  }

  const verifier = generateVerifier();
  const challenge = await s256Challenge(verifier);
  setPkce("dropbox", { verifier, returnTo });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: appKey.appKey,
    redirect_uri: redirectUriForThisOrigin(),
    code_challenge: challenge,
    code_challenge_method: "S256",
    token_access_type: "offline", // request a refresh_token
  });
  window.location.assign(`${AUTH_BASE}?${params.toString()}`);
}

/** Step 2 — exchange the authorisation code for tokens. Called from
 *  the /oauth/dropbox route after Dropbox redirects back. */
export async function exchangeCode(code: string): Promise<{ returnTo: string }> {
  const pkce = getPkce("dropbox");
  if (!pkce) throw new Error("Lost PKCE state — start authorisation again from Settings.");
  const appKey = getAppKey("dropbox");
  if (!appKey) throw new Error("Lost App Key — paste it in Settings again.");

  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: appKey.appKey,
    code_verifier: pkce.verifier,
    redirect_uri: redirectUriForThisOrigin(),
  });

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Dropbox token exchange ${r.status}: ${txt.slice(0, 200)}`);
  }
  const j = (await r.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
  };

  setToken("dropbox", {
    accessToken: j.access_token,
    ...(j.refresh_token ? { refreshToken: j.refresh_token } : {}),
    ...(j.expires_in ? { expiresAt: Date.now() + j.expires_in * 1000 } : {}),
    ...(j.scope ? { scope: j.scope } : {}),
    authedAt: Date.now(),
  });
  setPkce("dropbox", null);

  return { returnTo: pkce.returnTo };
}
