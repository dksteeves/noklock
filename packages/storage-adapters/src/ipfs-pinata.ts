// @version 0.1.0 @date 2026-05-13
//
// IPFS via Pinata — pin encrypted shares to IPFS. Pinata's free tier allows
// 1 GB of pinned storage, plenty for SoulChain shares (a single share is
// typically < 1 KB).
//
// Caller supplies a Pinata JWT (Pinata calls this "API Key (V3)"). The JWT
// is opaque — the user generates it once at https://app.pinata.cloud/ and
// pastes it into the PWA settings.

import type { StorageAdapter, AdapterDescriptor, PutOptions, PutResult, GetOptions, ListOptions, ListEntry } from "./types.js";

const API = "https://api.pinata.cloud";
const GATEWAY = "https://gateway.pinata.cloud/ipfs";

export class PinataIpfsAdapter implements StorageAdapter {
  readonly descriptor: AdapterDescriptor = {
    id: "ipfs-pinata",
    displayName: "IPFS (Pinata pin)",
    requiresAuth: true,
    permanence: "ephemeral",
  };

  constructor(private readonly jwt: string) {}

  async isReady(): Promise<boolean> {
    if (!this.jwt) return false;
    try {
      const r = await fetch(`${API}/data/testAuthentication`, {
        headers: { Authorization: `Bearer ${this.jwt}` },
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  async put(opts: PutOptions): Promise<PutResult> {
    const blob = new Blob([opts.bytes as BlobPart], { type: opts.contentType ?? "application/octet-stream" });
    const filename = opts.path.split("/").pop() ?? "share.bin";
    const fd = new FormData();
    fd.append("file", blob, filename);
    fd.append("pinataMetadata", JSON.stringify({ name: opts.path }));
    fd.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const r = await fetch(`${API}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.jwt}` },
      body: fd,
    });
    if (!r.ok) throw await pinataError(r);
    const data = (await r.json()) as { IpfsHash: string; PinSize?: number };
    return {
      id: data.IpfsHash,
      url: `${GATEWAY}/${data.IpfsHash}`,
      size: data.PinSize ?? opts.bytes.byteLength,
    };
  }

  /** For IPFS, pathOrId is the CID. The path passed at put-time becomes Pinata metadata only. */
  async get(opts: GetOptions): Promise<Uint8Array | null> {
    const cid = opts.pathOrId;
    const r = await fetch(`${GATEWAY}/${cid}`, { method: "GET" });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`pinata gateway ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }

  async list(opts: ListOptions): Promise<readonly ListEntry[]> {
    const q = new URLSearchParams({
      status: "pinned",
      pageLimit: "100",
      metadata: JSON.stringify({ name: { value: opts.prefix, op: "iLike" } }),
    });
    const r = await fetch(`${API}/data/pinList?${q.toString()}`, {
      headers: { Authorization: `Bearer ${this.jwt}` },
    });
    if (!r.ok) throw await pinataError(r);
    const data = (await r.json()) as { rows?: Array<{ ipfs_pin_hash: string; size: number; metadata?: { name?: string }; date_pinned?: string }> };
    return (data.rows ?? []).map((row) => ({
      path: row.metadata?.name ?? row.ipfs_pin_hash,
      size: row.size,
      modifiedAt: row.date_pinned ? Math.floor(new Date(row.date_pinned).getTime() / 1000) : undefined,
    }));
  }

  async remove(pathOrId: string): Promise<boolean> {
    // pathOrId here is the CID (Pinata pin hash).
    const r = await fetch(`${API}/pinning/unpin/${pathOrId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.jwt}` },
    });
    return r.ok;
  }
}

async function pinataError(r: Response): Promise<Error> {
  const text = await r.text().catch(() => "");
  return new Error(`pinata ${r.status}: ${text.slice(0, 200)}`);
}
