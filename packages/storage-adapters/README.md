# @soulchain/storage-adapters

Pluggable backends for NoKLock encrypted shares. All adapters implement the same `StorageAdapter` interface (`put`, `get`, `list`, `remove`, `isReady`, `authenticate?`, `signOut?`) so the PWA's enrolment flow doesn't care which backend it's talking to.

## Adapters

| Id | Status | Auth | Permanence |
|---|---|---|---|
| `local-file` | ✅ Full (FS Access API + download fallback) | None | User-deletable |
| `dropbox` | ✅ Full (Dropbox API v2 via fetch) | OAuth 2 PKCE access token | User-deletable |
| `google-drive` | ✅ Full (Drive v3 multipart upload) | Google OAuth access token | User-deletable |
| `onedrive` | ✅ Full (Microsoft Graph approot) | MSAL access token | User-deletable |
| `ipfs-pinata` | ✅ Full (Pinata pinFileToIPFS) | Pinata JWT | Ephemeral (pin TTL) |
| `arweave-irys` | ⚠️ Read-only — `put()` throws until Phase 2 wagmi-signed-upload lands | Wallet signature | **Permanent** |

The minimum to ship Phase 1 end-to-end with no OAuth at all is `local-file` only — the user picks a folder on their disk, NoKLock writes 5 share files into it, and they later upload them to wherever they like (a USB stick, a paper printout, a friend, anywhere). This is the "pirate" path.

The recommended Phase 1 default is `local-file` + `dropbox` + `ipfs-pinata` — three independent backends that satisfy the 3-of-5 threshold without colluding.

## Usage

```ts
import { makeAdapter, descriptors } from "@soulchain/storage-adapters";

// Render the picker
for (const d of descriptors) {
  console.log(d.id, d.displayName, "auth?", d.requiresAuth);
}

// Instantiate
const dbx = makeAdapter("dropbox", { dropbox: { accessToken: oauthToken } });
const ready = await dbx.isReady();          // tests the token
const result = await dbx.put({               // upload an encrypted share
  path: `soulchain/${vaultId}/share-3.json`,
  bytes: encryptedShareBytes,
  contentType: "application/json",
});
console.log("uploaded with id", result.id);

// Later, restore
const bytes = await dbx.get({ pathOrId: `soulchain/${vaultId}/share-3.json` });
```

## Notes by adapter

### `local-file`
- If the browser supports the File System Access API (Chrome/Edge), `authenticate()` opens a directory picker and subsequent `put()`s write directly into the chosen folder under a `soulchain/` subdirectory.
- Otherwise, `put()` triggers a per-share file download (Firefox/Safari fallback). `get()` requires the FSA path; in download-mode restore, the PWA's drag-drop input feeds bytes directly into `crypto-core.aead.decrypt()` without going through this adapter.

### `dropbox`
- Caller obtains the access token via Dropbox OAuth 2 PKCE. The PWA's storage picker triggers a popup at `https://www.dropbox.com/oauth2/authorize?...`.
- Uses the `/2/files/upload` content endpoint directly (no SDK).
- `get()` returns null on 404/409 so callers can probe cheaply.

### `google-drive`
- Caller obtains the access token via Google OAuth 2 PKCE; the PWA's storage picker triggers a popup.
- Creates and caches a top-level `SoulChain` folder on first `put()`; all share files land there.
- `get(pathOrId)` expects the Drive file ID (returned by `put`).

### `onedrive`
- Caller obtains the access token via MSAL (Microsoft Authentication Library) v3 PKCE.
- Uses the `approot` special drive so files are sandboxed to the SoulChain app and don't pollute the user's main drive.

### `ipfs-pinata`
- Caller pastes a Pinata JWT once (settings screen).
- Free tier: 1 GB pinned storage, ~10k pins, plenty for NoKLock.
- `get(cid)` reads through the public Pinata gateway. CIDs are public — encryption is mandatory before pinning (crypto-core's AEAD does this; never write plaintext to IPFS).

### `arweave-irys`
- Permanent storage — every share written here lives "forever" on Arweave.
- Phase 1: `get()` works (read-only gateway); `put()` throws until Phase 2 wires up the wagmi/viem EIP-712 signature flow required to pay for and authorise the upload through Irys.
- Each share is ~1 KB; cost per share on Irys is fractions of a cent.

## Testing

```bash
cd packages/storage-adapters
npm install
npm test
```

Tests cover the adapter interface contract using mock fetch responses. Real cloud-provider tests require live credentials and are run by the PWA's integration test suite, not here.
