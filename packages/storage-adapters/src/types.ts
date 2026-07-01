// @version 0.1.0 @date 2026-05-13
//
// Common interface every storage adapter implements. Adapters are plug-and-play
// from the PWA's point of view — it doesn't know whether bytes are landing in
// Dropbox or Arweave, only that put/get/list/remove succeed.

export type AdapterId =
  | "local-file"
  | "share-url"
  | "dropbox"
  | "google-drive"
  | "onedrive"
  | "ipfs-pinata"
  | "arweave-irys";

export interface AdapterDescriptor {
  readonly id: AdapterId;
  readonly displayName: string;
  /** Whether the user must run an OAuth (or sign a wallet) flow before using it. */
  readonly requiresAuth: boolean;
  /** Whether bytes are permanent or can be deleted/expired by the provider. */
  readonly permanence: "ephemeral" | "user-deletable" | "permanent";
}

export interface PutOptions {
  /** Relative path inside the adapter's namespace, e.g. "soulchain/{vaultId}/share-3.json". */
  readonly path: string;
  /** Bytes to write. */
  readonly bytes: Uint8Array;
  /** Optional MIME type — defaults to application/octet-stream. */
  readonly contentType?: string;
}

export interface PutResult {
  /** Stable identifier the adapter assigns — opaque to callers (Dropbox file ID,
   *  IPFS CID, Arweave tx hash, etc.). */
  readonly id: string;
  /** Optional URL that retrieves the object (when meaningful). */
  readonly url?: string;
  /** Byte length actually written. */
  readonly size: number;
}

export interface GetOptions {
  /** Either a path (Dropbox/GDrive/OneDrive/local) or an id (IPFS CID, Arweave tx). */
  readonly pathOrId: string;
}

export interface ListOptions {
  readonly prefix: string;
}

export interface ListEntry {
  readonly path: string;
  readonly size: number;
  readonly modifiedAt?: number;
}

/**
 * Every adapter implements this interface. None of the methods throw for
 * "not found" — they return null instead so callers can probe cheaply.
 */
export interface StorageAdapter {
  readonly descriptor: AdapterDescriptor;
  /** True if the adapter is ready to use (auth completed, SDK loaded, etc.). */
  isReady(): Promise<boolean>;
  /** Begin auth flow (OAuth popup, wallet signature, etc.) — no-op for adapters that don't need it. */
  authenticate?(): Promise<void>;
  /** Sign out / forget tokens. */
  signOut?(): Promise<void>;
  put(opts: PutOptions): Promise<PutResult>;
  get(opts: GetOptions): Promise<Uint8Array | null>;
  list(opts: ListOptions): Promise<readonly ListEntry[]>;
  remove(pathOrId: string): Promise<boolean>;
}
