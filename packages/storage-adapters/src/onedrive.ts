// @version 0.1.0 @date 2026-05-13
//
// OneDrive adapter via Microsoft Graph v1.0. Uses the "special" `approot`
// drive so the SoulChain folder is sandboxed to this app and doesn't pollute
// the user's main drive. Caller obtains access token via MSAL.

import type { StorageAdapter, AdapterDescriptor, PutOptions, PutResult, GetOptions, ListOptions, ListEntry } from "./types.js";

const API = "https://graph.microsoft.com/v1.0";
const APP_ROOT = "/me/drive/special/approot";

export class OneDriveAdapter implements StorageAdapter {
  readonly descriptor: AdapterDescriptor = {
    id: "onedrive",
    displayName: "OneDrive",
    requiresAuth: true,
    permanence: "user-deletable",
  };

  constructor(private readonly accessToken: string) {}

  async isReady(): Promise<boolean> {
    if (!this.accessToken) return false;
    try {
      const r = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  async put(opts: PutOptions): Promise<PutResult> {
    const path = opts.path.replace(/^\/+/, "");
    const buf = new ArrayBuffer(opts.bytes.byteLength);
    new Uint8Array(buf).set(opts.bytes);
    const r = await fetch(`${API}${APP_ROOT}:/${encodeURIComponent(path)}:/content`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": opts.contentType ?? "application/octet-stream",
      },
      body: buf,
    });
    if (!r.ok) throw new Error(`onedrive put ${r.status}`);
    const data = (await r.json()) as { id: string; size?: number };
    return { id: data.id, size: data.size ?? opts.bytes.byteLength };
  }

  async get(opts: GetOptions): Promise<Uint8Array | null> {
    const path = opts.pathOrId.replace(/^\/+/, "");
    const r = await fetch(`${API}${APP_ROOT}:/${encodeURIComponent(path)}:/content`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`onedrive get ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }

  async list(opts: ListOptions): Promise<readonly ListEntry[]> {
    const path = opts.prefix.replace(/^\/+/, "");
    const url = path
      ? `${API}${APP_ROOT}:/${encodeURIComponent(path)}:/children`
      : `${API}${APP_ROOT}/children`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!r.ok) throw new Error(`onedrive list ${r.status}`);
    const data = (await r.json()) as { value?: Array<{ name: string; size: number; lastModifiedDateTime?: string; folder?: unknown }> };
    return (data.value ?? [])
      .filter((e) => !e.folder)
      .map((e) => ({
        path: e.name,
        size: e.size,
        modifiedAt: e.lastModifiedDateTime ? Math.floor(new Date(e.lastModifiedDateTime).getTime() / 1000) : undefined,
      }));
  }

  async remove(pathOrId: string): Promise<boolean> {
    const r = await fetch(`${API}/me/drive/items/${encodeURIComponent(pathOrId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return r.ok || r.status === 404;
  }
}
