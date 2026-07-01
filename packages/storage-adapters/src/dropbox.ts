// @version 0.1.0 @date 2026-05-13
//
// Dropbox adapter — Dropbox API v2 via plain fetch. We hit Dropbox content
// endpoints directly so we don't pull the official SDK (saves ~150 KB of
// bundle).
//
// Caller is responsible for obtaining the access token via Dropbox OAuth 2
// PKCE flow (the PWA's wallet-connect layer triggers this when the user
// picks "Connect Dropbox" in the storage picker).

import type { StorageAdapter, AdapterDescriptor, PutOptions, PutResult, GetOptions, ListOptions, ListEntry } from "./types.js";

const API = "https://api.dropboxapi.com/2";
const CONTENT = "https://content.dropboxapi.com/2";

export class DropboxAdapter implements StorageAdapter {
  readonly descriptor: AdapterDescriptor = {
    id: "dropbox",
    displayName: "Dropbox",
    requiresAuth: true,
    permanence: "user-deletable",
  };

  constructor(private readonly accessToken: string) {}

  async isReady(): Promise<boolean> {
    if (!this.accessToken) return false;
    try {
      const r = await fetch(`${API}/users/get_current_account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  async put(opts: PutOptions): Promise<PutResult> {
    const path = normalisePath(opts.path);
    // Copy to a plain ArrayBuffer so the fetch body type is uniform across runtimes.
    const buf = new ArrayBuffer(opts.bytes.byteLength);
    new Uint8Array(buf).set(opts.bytes);
    const r = await fetch(`${CONTENT}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path,
          mode: "overwrite",
          autorename: false,
          mute: true,
          strict_conflict: false,
        }),
      },
      body: buf,
    });
    if (!r.ok) throw await dropboxError(r);
    const meta = (await r.json()) as { id: string; size?: number };
    return { id: meta.id, size: meta.size ?? opts.bytes.byteLength };
  }

  async get(opts: GetOptions): Promise<Uint8Array | null> {
    const path = normalisePath(opts.pathOrId);
    const r = await fetch(`${CONTENT}/files/download`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({ path }),
      },
    });
    if (r.status === 409 || r.status === 404) return null;
    if (!r.ok) throw await dropboxError(r);
    return new Uint8Array(await r.arrayBuffer());
  }

  async list(opts: ListOptions): Promise<readonly ListEntry[]> {
    const path = normalisePath(opts.prefix);
    const r = await fetch(`${API}/files/list_folder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path, recursive: false, include_media_info: false }),
    });
    if (!r.ok) throw await dropboxError(r);
    const body = (await r.json()) as { entries?: Array<{ ".tag": string; path_display?: string; size?: number; server_modified?: string }> };
    const out: ListEntry[] = [];
    for (const e of body.entries ?? []) {
      if (e[".tag"] === "file") {
        out.push({
          path: e.path_display ?? "",
          size: e.size ?? 0,
          modifiedAt: e.server_modified ? Math.floor(new Date(e.server_modified).getTime() / 1000) : undefined,
        });
      }
    }
    return out;
  }

  async remove(pathOrId: string): Promise<boolean> {
    const path = normalisePath(pathOrId);
    const r = await fetch(`${API}/files/delete_v2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    });
    return r.ok;
  }
}

function normalisePath(p: string): string {
  let s = p.trim();
  if (!s.startsWith("/")) s = "/" + s;
  return s;
}

async function dropboxError(r: Response): Promise<Error> {
  const text = await r.text().catch(() => "");
  return new Error(`dropbox ${r.status}: ${text.slice(0, 200)}`);
}
