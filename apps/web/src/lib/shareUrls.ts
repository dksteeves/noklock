// @version 0.1.0 @date 2026-05-19
// Share-URL store helpers. Extracted verbatim from Settings.tsx so the
// new per-vault page (VaultDetail) and Settings share ONE implementation
// of the localStorage shape + mutations — no logic fork. Pure storage
// (no React); callers re-read after a mutation.
//
// These are the share file links the user pasted during enrolment. They
// live ONLY in this browser's localStorage and never leave the device.

const SHARE_URLS_KEY = "soulchain.share-urls";

export interface StoredShareUrls {
  readonly vaultId: string;
  readonly urls: readonly { readonly shareIndex: number; readonly url: string }[];
  readonly updatedAt: number;
}

export function readStoredShareUrls(): StoredShareUrls[] {
  try {
    const raw = localStorage.getItem(SHARE_URLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredShareUrls[]) : [];
  } catch {
    return [];
  }
}

export function writeStoredShareUrls(s: StoredShareUrls[]): void {
  try {
    localStorage.setItem(SHARE_URLS_KEY, JSON.stringify(s));
  } catch {
    /* ignore — quota / private mode */
  }
}

/** The pasted URLs for one vault (or undefined if none on this device). */
export function getShareUrls(vaultId: string): StoredShareUrls | undefined {
  return readStoredShareUrls().find((v) => v.vaultId === vaultId);
}

/** Edit one share URL of one vault; persists and returns the new list. */
export function setShareUrl(vaultId: string, shareIndex: number, url: string): StoredShareUrls[] {
  const next = readStoredShareUrls().map((v) =>
    v.vaultId === vaultId
      ? { ...v, urls: v.urls.map((u) => (u.shareIndex === shareIndex ? { ...u, url } : u)), updatedAt: Date.now() }
      : v,
  );
  writeStoredShareUrls(next);
  return next;
}

/** Forget all pasted URLs for one vault; persists and returns the new list. */
export function forgetVaultShareUrls(vaultId: string): StoredShareUrls[] {
  const next = readStoredShareUrls().filter((v) => v.vaultId !== vaultId);
  writeStoredShareUrls(next);
  return next;
}
