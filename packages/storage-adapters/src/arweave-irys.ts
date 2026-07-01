// @version 0.1.0 @date 2026-05-13
//
// Arweave via Irys (formerly Bundlr). Permanent storage — every byte
// written here lives "forever" on Arweave. Bytes are tiny (a single share
// is <1 KB) so upload cost is fractions of a cent.
//
// This adapter is intentionally PROTOCOL-ONLY for now — it speaks the Irys
// HTTP API directly (POST /tx + GET https://gateway.irys.xyz/{txId}). The
// caller signs the upload using their own wallet, paid in MATIC or USDC.
//
// Full signed-upload flow lands in Phase 2 when wagmi/viem wires up the
// EIP-712 typed-data signature required by Irys. For now, get() works
// (read-only Arweave gateway access) and put() throws a clear "not yet
// implemented" so the rest of the pipeline can be built around it.

import type { StorageAdapter, AdapterDescriptor, PutOptions, PutResult, GetOptions, ListOptions, ListEntry } from "./types.js";

const GATEWAY = "https://gateway.irys.xyz";

export class IrysArweaveAdapter implements StorageAdapter {
  readonly descriptor: AdapterDescriptor = {
    id: "arweave-irys",
    displayName: "Arweave (permanent, via Irys)",
    requiresAuth: true,
    permanence: "permanent",
  };

  constructor(_bundlerUrl?: string) {
    // bundlerUrl will be wired in Phase 2 once the signed-upload flow lands.
    void _bundlerUrl;
  }

  async isReady(): Promise<boolean> {
    // Read-only access via gateway is always available.
    return true;
  }

  async put(_opts: PutOptions): Promise<PutResult> {
    throw new Error(
      "arweave-irys: signed upload requires wagmi/viem wiring — Phase 2. Use Pinata IPFS or Dropbox in Phase 1."
    );
  }

  async get(opts: GetOptions): Promise<Uint8Array | null> {
    // pathOrId here is the Arweave tx hash.
    const r = await fetch(`${GATEWAY}/${opts.pathOrId}`);
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`irys gateway ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }

  async list(_opts: ListOptions): Promise<readonly ListEntry[]> {
    // Arweave doesn't natively support a list-by-prefix call; querying tags
    // via GraphQL requires more infrastructure than is justified for Phase 1.
    return [];
  }

  async remove(_pathOrId: string): Promise<boolean> {
    // Arweave is permanent — nothing to remove. Caller should treat this as
    // a no-op rather than an error.
    return false;
  }
}
