# Components archive

This folder preserves components that have been retired from the live
build but contain design + implementation lessons worth keeping. Per
Daniel 2026-05-22: *"never delete things of value as lessons can be
lost"*. Files here are NOT imported by the app — they sit on disk only.

## Index

### `HeroDiagram.2026-05-22.tsx`

The original Landing hero diagram. Showed the crypto pipeline: **YOUR
CONTENT → ARGON2id → SPLIT + ENCRYPT → 5 cloud storage destinations + a
soulbound NFT minted to next-of-kin + a Chainlink dead-man's switch**.

Retired 2026-05-22 when the Landing hero was replaced by the new
animated **FSM diagram** (`components/FSMDiagram.tsx`). Rationale:

1. The state-machine view is NoKLock's stronger marketing claim — every
   competitor has a pipeline; only NoKLock has a publicly-witnessable
   on-chain FSM.
2. The new `components/TechArchDiagram.tsx` on `Info → Architecture →
   Technology` is a superset of the old pipeline; keeping both on the
   Landing page split visual attention and doubled the maintenance
   surface.

What's worth preserving from this file:

- **The animation pattern** — a single CSS animation drives a flowing
  dash on every connecting path (`hero-flow` + `@keyframes hero-flow-dash`).
  Cheap, scalable, 60fps on mobile. The new FSM diagram uses the same
  idea with per-state staggered keyframes for the sequential
  highlight.
- **The 5-destination fanout layout** — vertical column of provider
  cards on the right with bezier paths from a single fanout origin.
  This pattern is reused in the new TechArchDiagram for the storage
  providers stack.
- **The local-tagline strap** — the "Every step runs locally in your
  browser" line above the diagram. The new FSM diagram has a similar
  strap ("every state on-chain · every transition cryptographically
  signed · verify your vault's state any time").
- **The `t("diag.yourSeed")` i18n key** — that key is still alive in
  every locale (re-valued to "YOUR CONTENT" / "IHR INHALT" etc on
  2026-05-21) and used by other components; do not delete from
  `locales/*.ts`.

## How to restore (if ever needed)

```bash
cp src/components/_archive/HeroDiagram.2026-05-22.tsx src/components/HeroDiagram.tsx
```

Then re-import in `routes/Landing.tsx` and remove the `<FSMDiagram />`
mount in its place.
