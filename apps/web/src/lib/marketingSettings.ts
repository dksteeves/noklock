// @version 0.1.0 @date 2026-05-23
// Editable marketing settings for Marketing → Settings (Daniel: "edit
// hashtags, add and edit socials etc accounts, all built in"). Owner-only
// admin config, stored in localStorage (no server, no redeploy). Custom
// hashtags ADD to the static bank; socials default to X + Reddit and are
// fully editable.

const HASHTAG_KEY = "noklock.mkt.hashtags";
const SOCIALS_KEY = "noklock.mkt.socials";

export interface Social { readonly label: string; readonly handle: string; readonly url: string }

const DEFAULT_SOCIALS: readonly Social[] = [
  { label: "X / Twitter", handle: "@noklock_app", url: "https://x.com/noklock_app" },
  { label: "Reddit", handle: "u/Spirited_Future_4682", url: "https://www.reddit.com/user/Spirited_Future_4682/" },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function writeJson(key: string, v: unknown): void {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}

// --- custom hashtags (added on top of the static bank) ---
export function getCustomHashtags(): string[] { return readJson<string[]>(HASHTAG_KEY, []); }
export function addCustomHashtag(tag: string): string[] {
  let t = tag.trim();
  if (!t) return getCustomHashtags();
  if (!t.startsWith("#")) t = `#${t}`;
  t = t.replace(/\s+/g, "");
  const cur = getCustomHashtags();
  if (cur.some((x) => x.toLowerCase() === t.toLowerCase())) return cur;
  const next = [...cur, t];
  writeJson(HASHTAG_KEY, next);
  return next;
}
export function removeCustomHashtag(tag: string): string[] {
  const next = getCustomHashtags().filter((x) => x !== tag);
  writeJson(HASHTAG_KEY, next);
  return next;
}

// --- socials / accounts (editable; defaults to X + Reddit) ---
export function getSocials(): Social[] {
  const stored = readJson<Social[] | null>(SOCIALS_KEY, null);
  return stored ?? [...DEFAULT_SOCIALS];
}
export function setSocials(socials: readonly Social[]): void { writeJson(SOCIALS_KEY, socials); }
export function resetSocials(): Social[] { writeJson(SOCIALS_KEY, [...DEFAULT_SOCIALS]); return [...DEFAULT_SOCIALS]; }
