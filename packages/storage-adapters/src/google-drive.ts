// @version 0.1.0 @date 2026-05-13
//
// Google Drive v3 adapter — scaffolded with full put/get/list/remove. Caller
// obtains access token via Google OAuth 2.0 (PWA's storage picker triggers
// the popup). Tokens expire — caller must refresh and reinstantiate.
//
// Files live in a dedicated app folder named "SoulChain"; we resolve and
// cache the folder ID on first put().

import type { StorageAdapter, AdapterDescriptor, PutOptions, PutResult, GetOptions, ListOptions, ListEntry } from "./types.js";

const API = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const APP_FOLDER = "SoulChain";

export class GoogleDriveAdapter implements StorageAdapter {
  readonly descriptor: AdapterDescriptor = {
    id: "google-drive",
    displayName: "Google Drive",
    requiresAuth: true,
    permanence: "user-deletable",
  };

  private _folderId: string | null = null;

  constructor(private readonly accessToken: string) {}

  async isReady(): Promise<boolean> {
    if (!this.accessToken) return false;
    try {
      const r = await fetch(`${API}/about?fields=user`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  private async ensureFolder(): Promise<string> {
    if (this._folderId) return this._folderId;
    const q = `name='${APP_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const search = await fetch(`${API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (search.ok) {
      const data = (await search.json()) as { files?: Array<{ id: string }> };
      if (data.files && data.files.length > 0) {
        this._folderId = data.files[0]!.id;
        return this._folderId;
      }
    }
    // Create the folder.
    const create = await fetch(`${API}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: APP_FOLDER, mimeType: "application/vnd.google-apps.folder" }),
    });
    if (!create.ok) throw new Error(`gdrive folder create ${create.status}`);
    const f = (await create.json()) as { id: string };
    this._folderId = f.id;
    return f.id;
  }

  async put(opts: PutOptions): Promise<PutResult> {
    const folderId = await this.ensureFolder();
    const meta = {
      name: opts.path.split("/").pop() ?? "share.bin",
      parents: [folderId],
    };
    const boundary = "soulchain_" + Math.random().toString(36).slice(2);
    const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: ${opts.contentType ?? "application/octet-stream"}\r\n\r\n`;
    const tail = `\r\n--${boundary}--`;
    const body = concatU8([new TextEncoder().encode(head), opts.bytes, new TextEncoder().encode(tail)]);
    const r = await fetch(`${UPLOAD}/files?uploadType=multipart&fields=id,size`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: body as BodyInit,
    });
    if (!r.ok) throw new Error(`gdrive upload ${r.status}`);
    const j = (await r.json()) as { id: string; size?: string };
    return { id: j.id, size: j.size ? parseInt(j.size, 10) : opts.bytes.byteLength };
  }

  async get(opts: GetOptions): Promise<Uint8Array | null> {
    // pathOrId here is the Drive file id (returned from put()).
    const r = await fetch(`${API}/files/${encodeURIComponent(opts.pathOrId)}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`gdrive get ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }

  async list(opts: ListOptions): Promise<readonly ListEntry[]> {
    const folderId = await this.ensureFolder();
    const q = `'${folderId}' in parents and trashed=false and name contains '${opts.prefix}'`;
    const r = await fetch(`${API}/files?q=${encodeURIComponent(q)}&fields=files(id,name,size,modifiedTime)`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!r.ok) throw new Error(`gdrive list ${r.status}`);
    const data = (await r.json()) as { files?: Array<{ id: string; name: string; size?: string; modifiedTime?: string }> };
    return (data.files ?? []).map((f) => ({
      path: f.name,
      size: f.size ? parseInt(f.size, 10) : 0,
      modifiedAt: f.modifiedTime ? Math.floor(new Date(f.modifiedTime).getTime() / 1000) : undefined,
    }));
  }

  async remove(pathOrId: string): Promise<boolean> {
    const r = await fetch(`${API}/files/${encodeURIComponent(pathOrId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return r.ok || r.status === 404;
  }
}

function concatU8(parts: Uint8Array[]): Uint8Array {
  let len = 0;
  for (const p of parts) len += p.byteLength;
  const out = new Uint8Array(len);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.byteLength; }
  return out;
}
