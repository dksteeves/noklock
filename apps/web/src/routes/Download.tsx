// @version 0.1.0 @date 2026-06-10
// /download — "Get the NoKLock app" landing page.
//
// 0.1.0 — Daniel 2026-06-10: NEW. Single page that surfaces the Google Play
//         badge (big) when the listing is live, plus the iOS Add-to-Home-
//         Screen path. The Play badge is gated by PLAY_STORE_AVAILABLE
//         (lib/playStore.ts) so before launch the page shows "Coming soon
//         to Google Play" instead of a badge that links to a non-existent
//         listing — i.e. /download is NEVER a broken page. Dep-free: no QR
//         npm package, just the badge image + link + text.
//
// The route is registered unconditionally in App.tsx (it self-handles the
// pre-launch state). Only the FOOTER link to it is flag-gated.

import { useDocumentHead } from "../lib/seo.js";
import { useT } from "../i18n/index.js";
import { PLAY_STORE_AVAILABLE, PLAY_STORE_URL } from "../lib/playStore.js";
import { PlayBadge } from "../components/PlayBadge.js";

export function Download(): JSX.Element {
  useDocumentHead("/download");
  const { t } = useT();
  return (
    <article className="prose-invert max-w-2xl mx-auto space-y-8 py-6 text-center">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold font-display">
          <span className="grad">{t("download.title", "Get the NoKLock app")}</span>
        </h1>
      </header>

      {PLAY_STORE_AVAILABLE ? (
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
          aria-label={t("download.title", "Get the NoKLock app")}
        >
          <PlayBadge className="h-16 mx-auto" />
        </a>
      ) : (
        <div className="text-text-muted text-lg font-semibold">
          {t("download.comingSoon", "Coming soon to Google Play")}
        </div>
      )}

      <div className="space-y-2 text-sm text-text-on-dark/80 max-w-md mx-auto">
        <p>
          <strong>Android:</strong>{" "}
          {t("download.androidNote", "tap the badge above to install NoKLock from Google Play.")}
        </p>
        <p>
          <strong>iOS:</strong>{" "}
          {t("download.iosNote", "open noklock.app in Safari → tap Share → Add to Home Screen.")}
        </p>
      </div>
    </article>
  );
}
