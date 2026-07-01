// @version 0.1.0 @date 2026-05-13
//
// Local-file adapter — uses the browser's File System Access API where
// available, and falls back to a "download per share" + drag-drop restore
// approach in browsers that don't support it (Firefox, Safari).
//
// This adapter requires no OAuth. It exists so users can try SoulChain
// without connecting any cloud provider at all — the most pirate-friendly
// option.

import type { StorageAdapter, AdapterDescriptor, PutOptions, PutResult, GetOptions, ListOptions, ListEntry } from "./types.js";

const ROOT_DIR_NAME = "soulchain";
// Minimal FSA shape we depend on; declared inline to avoid pulling DOM lib mismatches.
interface FSAFile {
  readonly name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
  remove?(): Promise<void>;
}
interface FSADir {
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FSADir>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FSAFile>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  // values() yields handles. We type loosely to avoid Node lib mismatches.
  values(): AsyncIterable<{ kind: "file" | "directory"; name: string }>;
}
declare global {
  interface Window {
    showDirectoryPicker?(options?: { mode?: "read" | "readwrite" }): Promise<FSADir>;
  }
}

export class LocalFileAdapter implements StorageAdapter {
  readonly descriptor: AdapterDescriptor = {
    id: "local-file",
    displayName: "Local download (manual)",
    requiresAuth: false,
    permanence: "user-deletable",
  };

  private _root: FSADir | null = null;

  async isReady(): Promise<boolean> {
    return this._root !== null || !!window.showDirectoryPicker;
  }

  /** Optional — opens the directory picker so subsequent put()s write directly to disk. */
  async authenticate(): Promise<void> {
    if (typeof window === "undefined" || !window.showDirectoryPicker) {
      throw new Error("local-file: this browser doesn't support the File System Access API. Use the per-share download fallback below.");
    }
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    this._root = await handle.getDirectoryHandle(ROOT_DIR_NAME, { create: true });
  }

  async signOut(): Promise<void> {
    this._root = null;
  }

  async put(opts: PutOptions): Promise<PutResult> {
    if (this._root) {
      const { dir, file } = splitPath(opts.path);
      const dirHandle = await ensureDir(this._root, dir);
      const fileHandle = await dirHandle.getFileHandle(file, { create: true });
      const w = await fileHandle.createWritable();
      // Copy into a plain ArrayBuffer so the writer accepts it across runtimes.
      const buf = new ArrayBuffer(opts.bytes.byteLength);
      new Uint8Array(buf).set(opts.bytes);
      await w.write(buf);
      await w.close();
      return { id: opts.path, size: opts.bytes.byteLength };
    }

    // Fallback — trigger a browser download.
    const blob = new Blob([opts.bytes as BlobPart], { type: opts.contentType ?? "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = opts.path.split("/").pop() ?? "soulchain-share.bin";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return { id: opts.path, size: opts.bytes.byteLength };
  }

  async get(opts: GetOptions): Promise<Uint8Array | null> {
    if (!this._root) return null;
    try {
      const { dir, file } = splitPath(opts.pathOrId);
      const dirHandle = await ensureDir(this._root, dir);
      const fileHandle = await dirHandle.getFileHandle(file);
      const f = await fileHandle.getFile();
      return new Uint8Array(await f.arrayBuffer());
    } catch {
      return null;
    }
  }

  async list(opts: ListOptions): Promise<readonly ListEntry[]> {
    if (!this._root) return [];
    const entries: ListEntry[] = [];
    const start = await ensureDir(this._root, opts.prefix);
    for await (const entry of start.values()) {
      if (entry.kind === "file") {
        try {
          const fh = await start.getFileHandle(entry.name);
          const f = await fh.getFile();
          entries.push({ path: `${opts.prefix}/${entry.name}`.replace(/^\/+/, ""), size: f.size, modifiedAt: f.lastModified });
        } catch {
          // skip unreadable
        }
      }
    }
    return entries;
  }

  async remove(pathOrId: string): Promise<boolean> {
    if (!this._root) return false;
    try {
      const { dir, file } = splitPath(pathOrId);
      const dirHandle = await ensureDir(this._root, dir);
      await dirHandle.removeEntry(file);
      return true;
    } catch {
      return false;
    }
  }
}

function splitPath(p: string): { dir: string; file: string } {
  const ix = p.lastIndexOf("/");
  return ix < 0 ? { dir: "", file: p } : { dir: p.slice(0, ix), file: p.slice(ix + 1) };
}

async function ensureDir(root: FSADir, dir: string): Promise<FSADir> {
  if (dir === "") return root;
  let cur: FSADir = root;
  for (const part of dir.split("/").filter(Boolean)) {
    cur = await cur.getDirectoryHandle(part, { create: true });
  }
  return cur;
}
