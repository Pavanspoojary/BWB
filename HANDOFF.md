# HANDOFF.md — builtwhilebroke 3D world + hunt board

> Paste the prompt below into another AI to continue work on this project.

---

You are taking over development of `builtwhilebroke` — an Astro 5 + Tailwind + Three.js site whose centerpiece is a hand-drawn **doodle-style 3D world** (cream paper, blue/red ink, Patrick Hand aesthetic, custom post-process ink shader) plus a Product-Hunt-style listings page. Working dir: `/Users/pavanspoojary/Developer/builtwhilebroke`. Verify with `npm run check` (0 errors), `npm run build` (45+ pages), `node tests/e2e/runner.mjs` (108/108 pass). Never break those.

## WHAT EXISTS TODAY (all working, walk-mode only — god/orbit view removed)

1. **Blank paper island** (`DistrictManager.buildPaperGround`) — cylinder island r=58 in cyan water with foam ring. Radial walk leash at r=56. No sun/clouds/planes (removed). Shader paper-lines off via `uPaperLines=0`.
2. **10-floor tower, lobby = L0** (`FirstFloor.ts`, `SecondFloor.ts`, `UpperFloors.ts`):
   - L0 premium lobby: marble checker, chandeliers, reception + slat feature wall, 4 lounges, piano, sculptures, fireplace nook, elevator-bank decor, art, sconces, café nook, directory, 8 columns (middle row removed, entry stairs removed, west grand stair removed).
   - L1 discussion hall: stage, chair arcs, whiteboards, slat wall, baffles, coffee counter, terrace.
   - L2–L9 (`UpperFloors.ts`, `FLOOR_BASES`/`FLOOR_NAMES` exports): bullpen, meeting suites, CAFETERIA (L4), dev den, studio, ARCADE (L7), exec, corner offices. Ribbon windows, columns, pendants per floor. Roof crown + machine room + beacon.
   - Player is hard-clamped INSIDE the hall (`hallClampX/Z` in `CameraController`); spawn L0 at (0,3.5,20).
3. **Glass lift shaft** (x 34–39, z ±2.5, lobby→roof) with per-floor west doorways, number plates, landing grates capping every slab hole (critical: open holes = falls). **Lift UX:** HUD chip (`#lift-chip`) shows floor when in cab; **W/S** steps floors (only when facing the east panel — `doorFacing() < 0.5`, facing doors walks out); **digits 0–9** hop anywhere (1 waits 1.5s for a possible 0 = top floor L9, numpad supported, ignored while typing); rides clear held keys + 450ms move suppression; arrival faces the doorway.
4. **Menu** (`DoodleDistrictView.astro` landing overlay): movement settings sliders (walk/sprint/look/jump, localStorage, sprint≥walk enforced), promo-code box, product-list CTA → `/product`. L key → `/product`.
5. **`/product` page** (doodle-styled): free hunt board on **Supabase** — `products` table (with `base_upvotes` seeds) + `product_votes` table (unique per browser-voter, toggle vote/unvote), RLS open, offline localStorage fallback with LIVE/OFFLINE pill. Migration `product_hunt_board` applied; types in `src/lib/types.ts`.
6. **Parked/dormant (do NOT resurrect unless asked):** `ProceduralTown.ts`, `VertexCityBuilder.ts`, secret collectibles, billboard/ad system, speedrun, 2D map modal, 15-district registry paths.

## CONVENTIONS

- Colliders auto-scan meshes (≥0.7 tall, ≥0.3 thick — thinner = ghost); mark decor `noCollision`.
- Merge static trim via `mergeGeometries`, and ALWAYS flag merged meshes `noCollision` or they become one giant phantom wall.
- Player radius 0.65, step-up 0.65.
- Test-locked DOM ids (`ad-sponsor-form`, `btn-mode-orbit`, etc.) must stay in dist HTML.
- Supabase anon key is public-by-design (RLS enforced); never expose service keys.
- A second agent has edited this repo concurrently — check `git log`/`git status` before touching shared files.

## First task for you

[PASTE TASK HERE]
