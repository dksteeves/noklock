// @version 0.1.0 @date 2026-05-13
//
// localStorage management for cloud-provider OAuth credentials. Each user
// supplies their OWN app key / client id at https://www.dropbox.com/developers
// (or Google / Microsoft equivalents). Nothing of this leaves the browser —
// not even to SoulChain's back-end. We chose this over baking-in a single
// SoulChain-owned OAuth app for three reasons:
//
//   1. Rate limits at the provider don't get exhausted by other SoulChain users
//   2. The provider's OAuth review process doesn't gate SoulChain users
//   3. Strong privacy story — we literally cannot see anyone's cloud
//
// Tokens are stored in localStorage and never sent to our servers.

const NS = "soulchain.cloud.";

export interface CloudAppKey {
  /** App key / client ID from the provider's developer console. */
  readonly appKey: string;
  /** When the user pasted it. */
  readonly addedAt: number;
}

export interface CloudToken {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt?: number;
  readonly scope?: string;
  readonly authedAt: number;
}

export type CloudProvider = "dropbox" | "google-drive" | "onedrive";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T | null): void {
  try {
    if (value === null) localStorage.removeItem(NS + key);
    else localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    /* localStorage full / disabled — best-effort */
  }
}

export function getAppKey(p: CloudProvider): CloudAppKey | null {
  return read<CloudAppKey>(`appkey.${p}`);
}

export function setAppKey(p: CloudProvider, appKey: string): void {
  if (!appKey.trim()) {
    write(`appkey.${p}`, null);
    return;
  }
  write<CloudAppKey>(`appkey.${p}`, { appKey: appKey.trim(), addedAt: Date.now() });
}

export function getToken(p: CloudProvider): CloudToken | null {
  return read<CloudToken>(`token.${p}`);
}

export function setToken(p: CloudProvider, token: CloudToken | null): void {
  write(`token.${p}`, token);
}

export function clearAll(p: CloudProvider): void {
  setAppKey(p, "");
  setToken(p, null);
  write(`pkce.${p}`, null);
}

export interface PkceState {
  readonly verifier: string;
  readonly returnTo: string;
}

export function getPkce(p: CloudProvider): PkceState | null {
  return read<PkceState>(`pkce.${p}`);
}

export function setPkce(p: CloudProvider, state: PkceState | null): void {
  write(`pkce.${p}`, state);
}
