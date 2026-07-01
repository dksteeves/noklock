# Google Play badge asset

`PLAY_BADGE_SRC` (`src/lib/playStore.ts`) points at
`/play-badge/get-it-on-google-play.png` — i.e. this folder.

## Action before flipping the flag on

1. Download the official **"Get it on Google Play"** badge PNG from
   Google's brand-asset page:
   https://play.google.com/intl/en_us/badges/
   (English badge generator: pick PNG, language English, then save it.)
2. Save it here as **`get-it-on-google-play.png`** (exact filename — the
   const in `playStore.ts` is literal).
3. Recommended: the badge at ~2x height so the `h-10`/`h-12` CSS scaling
   stays crisp on retina. Transparent background preferred.

Do **not** redraw or recolour the badge — Google's brand guidelines require
the official artwork, unmodified. That is why this repo ships a README here
instead of a generated PNG.

## Flag

Nothing renders the badge until `VITE_PLAY_STORE_AVAILABLE=true` is set in
the build env (`apps/web/.env.production` or the deploy env). With the flag
off, `/download` shows "Coming soon to Google Play" and the footer/Settings
surfaces are hidden entirely — so a missing PNG here is harmless pre-launch.
