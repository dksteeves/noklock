// @version 0.2.0 @date 2026-05-13
//
// Public surface. The PWA imports `descriptors` to render the "Connect a
// storage backend" picker, and `makeAdapter` to instantiate the chosen one.
//
// 0.2.0 — added the ShareUrlAdapter + PROVIDERS list as the primary storage
//         pathway. OAuth-based adapters (Dropbox / GDrive / OneDrive) remain
//         exported for legacy use but the recommended flow is now manual
//         upload + share-URL paste.

import type { AdapterId, AdapterDescriptor, StorageAdapter } from "./types.js";
import { DropboxAdapter } from "./dropbox.js";
import { GoogleDriveAdapter } from "./google-drive.js";
import { OneDriveAdapter } from "./onedrive.js";
import { PinataIpfsAdapter } from "./ipfs-pinata.js";
import { IrysArweaveAdapter } from "./arweave-irys.js";
import { LocalFileAdapter } from "./local-file.js";
import { ShareUrlAdapter } from "./share-url.js";

export * from "./types.js";
export { DropboxAdapter } from "./dropbox.js";
export { GoogleDriveAdapter } from "./google-drive.js";
export { OneDriveAdapter } from "./onedrive.js";
export { PinataIpfsAdapter } from "./ipfs-pinata.js";
export { IrysArweaveAdapter } from "./arweave-irys.js";
export { LocalFileAdapter } from "./local-file.js";
export { ShareUrlAdapter, PROVIDERS, detectProvider, normaliseShareUrl } from "./share-url.js";
export type { ShareUrlProvider, ProviderDescriptor } from "./share-url.js";

export const descriptors: readonly AdapterDescriptor[] = [
  { id: "local-file",    displayName: "Local download (manual)", requiresAuth: false, permanence: "user-deletable" },
  { id: "dropbox",       displayName: "Dropbox",                  requiresAuth: true,  permanence: "user-deletable" },
  { id: "google-drive",  displayName: "Google Drive",             requiresAuth: true,  permanence: "user-deletable" },
  { id: "onedrive",      displayName: "OneDrive",                 requiresAuth: true,  permanence: "user-deletable" },
  { id: "ipfs-pinata",   displayName: "IPFS (Pinata pin)",        requiresAuth: true,  permanence: "ephemeral"      },
  { id: "arweave-irys",  displayName: "Arweave (permanent)",      requiresAuth: true,  permanence: "permanent"      },
];

export interface AdapterConfig {
  readonly dropbox?: { readonly accessToken: string };
  readonly googleDrive?: { readonly accessToken: string };
  readonly oneDrive?: { readonly accessToken: string };
  readonly pinata?: { readonly jwt: string };
  readonly irys?: { readonly bundlerUrl?: string };
}

export function makeAdapter(id: AdapterId, cfg: AdapterConfig = {}): StorageAdapter {
  switch (id) {
    case "local-file":
      return new LocalFileAdapter();
    case "share-url":
      return new ShareUrlAdapter();
    case "dropbox":
      return new DropboxAdapter(cfg.dropbox?.accessToken ?? "");
    case "google-drive":
      return new GoogleDriveAdapter(cfg.googleDrive?.accessToken ?? "");
    case "onedrive":
      return new OneDriveAdapter(cfg.oneDrive?.accessToken ?? "");
    case "ipfs-pinata":
      return new PinataIpfsAdapter(cfg.pinata?.jwt ?? "");
    case "arweave-irys":
      return new IrysArweaveAdapter(cfg.irys?.bundlerUrl);
    default: {
      const _exhaustive: never = id;
      throw new Error(`unknown adapter: ${String(_exhaustive)}`);
    }
  }
}
