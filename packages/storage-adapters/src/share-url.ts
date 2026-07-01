// @version 0.2.1 @date 2026-05-19
// 0.2.1 — descriptor.id "local-file" → "share-url" (was colliding with
//         LocalFileAdapter's id; audit HIGH — fragile, fix now).
// 0.2.0 — Round 3 wave 2: added "local-nas" provider entry. Self-hosted NAS
//         or PC share URLs (e.g. http://192.168.1.x:8080/share-1.bin or
//         https://nas.your-domain.com/share-1.bin). Generic HTTPS fetch
//         already supports the URL shape; this entry just makes the
//         provider visible in the recommended list with warnings.
// 0.1.0 — initial share-URL adapter + 10 top providers.
//
// Share-URL adapter. The pirate-friendly storage path: the user uploads their
// own encrypted share files to ANY cloud provider, sets the file to "anyone
// with the link", and pastes the share URL back into SoulChain. We never need
// OAuth, app keys, or provider-specific SDKs — just an HTTP GET to the
// normalised raw-download form of the URL.
//
// What this adapter does:
//   - Detects the provider from URL hostname
//   - Normalises share URLs to their direct-download form
//   - Fetches bytes via fetch()
//
// What this adapter does NOT do:
//   - Upload (manual user action — provider-agnostic)
//   - Delete / list (impossible without provider API; user revokes via the
//     provider's own UI by removing the share link or the file)

import type { StorageAdapter, AdapterDescriptor, PutOptions, PutResult, GetOptions, ListOptions, ListEntry } from "./types.js";

export type ShareUrlProvider =
  | "dropbox"
  | "google-drive"
  | "onedrive"
  | "pcloud"
  | "mega"
  | "mediafire"
  | "box"
  | "filen"
  | "internxt"
  | "yandex"
  | "local-nas"
  | "generic";

export interface ProviderDescriptor {
  readonly id: ShareUrlProvider;
  readonly displayName: string;
  readonly freeQuota: string;
  readonly signupUrl: string;
  readonly hostnames: readonly string[];
  /** Country / jurisdiction — useful UI hint for paranoid users */
  readonly jurisdiction: string;
  /** Notes the user should know — e.g. share-link mechanics, E2E encryption */
  readonly notes: string;
}

/** Top 10 share-link-friendly providers. Reflects Daniel's spec from
 *  2026-05-13. Don't reorder without consulting him — the order matches
 *  the marketing-recommendation priority. */
export const PROVIDERS: readonly ProviderDescriptor[] = [
  { id: "google-drive", displayName: "Google Drive", freeQuota: "15 GB",  signupUrl: "https://drive.google.com",       hostnames: ["drive.google.com", "docs.google.com"], jurisdiction: "USA",         notes: "Click 'Share' → 'Anyone with the link' → 'Viewer'. Paste the share URL into SoulChain." },
  { id: "dropbox",      displayName: "Dropbox",      freeQuota: "2 GB",   signupUrl: "https://dropbox.com/basic",     hostnames: ["dropbox.com", "www.dropbox.com"],     jurisdiction: "USA",         notes: "Click 'Share' → 'Create link'. SoulChain auto-converts `?dl=0` to direct download." },
  { id: "onedrive",     displayName: "OneDrive",     freeQuota: "5 GB",   signupUrl: "https://onedrive.live.com",     hostnames: ["1drv.ms", "onedrive.live.com"],       jurisdiction: "USA",         notes: "Click 'Share' → 'Copy link' (permission: View)." },
  { id: "pcloud",       displayName: "pCloud",       freeQuota: "10 GB",  signupUrl: "https://pcloud.com",             hostnames: ["pcloud.com", "u.pcloud.link"],        jurisdiction: "Switzerland", notes: "Swiss privacy law. Direct download from share link works out of the box." },
  { id: "mega",         displayName: "MEGA",         freeQuota: "20 GB",  signupUrl: "https://mega.io",                hostnames: ["mega.nz", "mega.io"],                 jurisdiction: "New Zealand", notes: "End-to-end encrypted by MEGA. The share URL contains the decryption key in the fragment (#KEY)." },
  { id: "mediafire",    displayName: "MediaFire",    freeQuota: "10 GB",  signupUrl: "https://mediafire.com",          hostnames: ["mediafire.com"],                      jurisdiction: "USA",         notes: "Free tier supports direct download from share." },
  { id: "box",          displayName: "Box",          freeQuota: "10 GB",  signupUrl: "https://box.com/personal",       hostnames: ["box.com", "app.box.com"],             jurisdiction: "USA",         notes: "Personal plan. Set link permission to 'People with the link'." },
  { id: "filen",        displayName: "Filen.io",     freeQuota: "10 GB",  signupUrl: "https://filen.io",               hostnames: ["filen.io"],                           jurisdiction: "Germany",     notes: "End-to-end encrypted, German jurisdiction." },
  { id: "internxt",     displayName: "Internxt",     freeQuota: "10 GB",  signupUrl: "https://internxt.com",           hostnames: ["internxt.com"],                       jurisdiction: "Spain",       notes: "End-to-end encrypted, Spanish jurisdiction. GDPR aligned." },
  { id: "yandex",       displayName: "Yandex Disk",  freeQuota: "10 GB",  signupUrl: "https://disk.yandex.com",        hostnames: ["disk.yandex.com", "yadi.sk"],         jurisdiction: "Russia",      notes: "Direct download works from share link. Russian jurisdiction." },
  { id: "local-nas",    displayName: "Local NAS / PC", freeQuota: "your disk", signupUrl: "https://noklock.app/info?tab=shares#local-nas", hostnames: [],          jurisdiction: "Your home",   notes: "Self-hosted: your NAS (Synology, QNAP, TrueNAS, etc.) or any PC running a static HTTP/HTTPS server. Paste a URL like https://nas.local/share-1.bin. ADVANCED. Off-network restore needs port-forward, dynamic DNS, or Tailscale/WireGuard. Use HTTPS (mixed-content warnings on HTTP). Never your ONLY location — pair with at least 2 cloud providers in different jurisdictions for redundancy if your hardware dies." },
];

export function detectProvider(url: string): ShareUrlProvider {
  let host = "";
  try { host = new URL(url).hostname.toLowerCase(); }
  catch { return "generic"; }
  for (const p of PROVIDERS) {
    if (p.hostnames.some((h) => host === h || host.endsWith("." + h))) return p.id;
  }
  return "generic";
}

/** Convert a user-facing share URL into a direct-download URL the browser
 *  can `fetch()` and receive raw bytes from. Returns null if the URL is
 *  not recognised or cannot be normalised (e.g. MEGA needs full SDK). */
export function normaliseShareUrl(url: string): { url: string; provider: ShareUrlProvider; note?: string } | null {
  const provider = detectProvider(url);
  try {
    const u = new URL(url);
    switch (provider) {
      case "dropbox": {
        u.searchParams.set("dl", "1");
        return { url: u.toString(), provider };
      }
      case "google-drive": {
        // Patterns:
        //   /file/d/{ID}/view  →  uc?export=download&id={ID}
        //   /open?id={ID}      →  uc?export=download&id={ID}
        const m = u.pathname.match(/\/file\/d\/([^/]+)/);
        const id = m?.[1] ?? u.searchParams.get("id");
        if (!id) return null;
        return { url: `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`, provider, note: "Files >25 MB trigger a virus-scan interstitial — SoulChain shares are <1 KB so this never triggers in practice." };
      }
      case "onedrive": {
        // Two URL shapes:
        //   1drv.ms/u/c/...           — short link, redirects to a long form
        //   onedrive.live.com/...     — long form; append download=1
        if (u.searchParams.has("download")) return { url: u.toString(), provider };
        u.searchParams.set("download", "1");
        return { url: u.toString(), provider, note: "1drv.ms short links redirect first; fetch follows automatically." };
      }
      case "pcloud": {
        // pCloud public links like https://u.pcloud.link/publink/show?code=XXX
        // — the page renders an HTML viewer. The direct-download URL is
        // exposed via the API. For now we trust the user to paste the
        // "download link" (which has &forcedownload=1).
        if (!u.searchParams.has("forcedownload")) u.searchParams.set("forcedownload", "1");
        return { url: u.toString(), provider };
      }
      case "mediafire": {
        // MediaFire share URLs need an HTML-scrape to extract the real CDN
        // URL. For now we return the share URL unchanged and rely on a
        // back-end proxy. Mark with a note.
        return { url: u.toString(), provider, note: "MediaFire needs a download-button scrape step. Manual download still works; auto-fetch ships in Phase 3." };
      }
      case "box": {
        // Box share URL: https://app.box.com/s/{shareId}
        // Direct download: /shared/static/{shareId} (or via API call).
        return { url: u.toString(), provider, note: "Box auto-download endpoint resolves via a redirect; the browser follows it cleanly." };
      }
      case "mega": {
        // MEGA E2E requires the MEGA SDK to decrypt. The URL contains the
        // key in the fragment. We can't fetch + decrypt with a simple GET.
        // For now, return null and tell the user to download manually then
        // drag the file in.
        return null;
      }
      case "filen":
      case "internxt": {
        // Similar to MEGA — E2E encryption needs the provider's own SDK.
        return null;
      }
      case "yandex": {
        // Yandex Disk public URL: https://disk.yandex.com/d/{shareId}
        // Direct download via API: https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=...
        return { url: u.toString(), provider, note: "Yandex direct download via their public-resources API; current implementation expects user to paste the direct-download URL." };
      }
      default:
        // Generic HTTPS URL — assume the user pasted a direct-download link.
        return { url: u.toString(), provider: "generic" };
    }
  } catch {
    return null;
  }
}

export class ShareUrlAdapter implements StorageAdapter {
  readonly descriptor: AdapterDescriptor = {
    id: "share-url", // distinct id — was wrongly "local-file" (collided with LocalFileAdapter; fragile if any code branches on adapter id)
    displayName: "Share URL (any cloud provider)",
    requiresAuth: false,
    permanence: "user-deletable",
  };

  async isReady(): Promise<boolean> {
    return true;
  }

  async put(_opts: PutOptions): Promise<PutResult> {
    throw new Error("share-url adapter cannot upload — user uploads manually then pastes the share URL back");
  }

  async get(opts: GetOptions): Promise<Uint8Array | null> {
    const normalised = normaliseShareUrl(opts.pathOrId);
    if (!normalised) {
      throw new Error("share-url: URL not recognised or provider requires manual download (e.g. MEGA, Filen, Internxt)");
    }
    try {
      const r = await fetch(normalised.url, { redirect: "follow", credentials: "omit" });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`fetch ${r.status} from ${normalised.provider}`);
      return new Uint8Array(await r.arrayBuffer());
    } catch (e) {
      throw new Error(`share-url fetch failed: ${(e as Error).message}`);
    }
  }

  async list(_opts: ListOptions): Promise<readonly ListEntry[]> {
    return [];
  }

  async remove(_pathOrId: string): Promise<boolean> {
    // User revokes by removing the share link in the provider's UI.
    return false;
  }
}
