# CarterPCs AI Report — Maintainability refactor (Featured, data, tests, docs)

## Objective

Make the project easier to understand and fix by organising Featured, the content data, the tests and the CSS by responsibility. Behaviour and visual output must not change.

## Scope

- **In scope:** `src/sections/featured/*`, `src/data/*`, Featured's unit and e2e tests, and the docs sync (`docs/ARCHITECTURE.md`, one status line in `docs/TECH_STACK.md`).
- **Not touched:** other sections' code; copy, translations, assets, dependencies, tokens, breakpoints.
- **Base commit:** `8067d78` (worktree clean at start).

## Model and reasoning level

Claude Opus 5.5, high effort. The request specified Opus 5 / high.

## Checklist

- [x] Read project instructions and reports (`AI_WORKFLOW.md`, `AI_REPORT.md`, `docs/*`; no `AGENTS.md` exists)
- [x] Map current architecture
- [x] Identify safe refactor boundaries
- [x] Refactor one category at a time (data → Featured TS → Featured CSS → tests → docs)
- [x] Preserve behavior and visual output (verified by diff, see below)
- [x] Update tests
- [x] Run typecheck, lint, tests, build, and diff checks
- [x] Verify responsive and accessibility behavior
- [x] Update AI_REPORT.md

## Files changed and why

### Featured — `src/sections/featured/`

`Featured.tsx` went from 798 lines to about 100. Its old contents were split by responsibility:

| File | Responsibility |
| :--- | :--- |
| `Featured.tsx` (modified) | Section shell (intro, track, rail); wires state and motion; map of the files below |
| `FeaturedPanel.tsx` (new) | One story: decorative stage, media + rail group, copy column, progress |
| `FeaturedMedia.tsx` (new) | Poster ⇄ nocookie player swap in the 9:16 frame; Play / Close |
| `FeaturedActionRail.tsx` (new) | Like / Comments / Share / Watch, plus the four icons (single consumer, so kept local) |
| `FeaturedProgress.tsx` (new) | Per-panel sequence ticks |
| `useFeaturedPlayer.ts` (new) | One player at a time, Escape to close, focus restoration |
| `useFeaturedActions.ts` (new) | Local like set; share state and its 4s notice timer |
| `useFeaturedSequence.ts` (new) | GSAP intro wipe; desktop pin/scrub/snap; per-frame copy fade |
| `featured.utils.ts` (new) | Pure helpers: `storyTitle`, `playerSrc`, `activePanelIndex`, `copyFocus`/`exitFadeTravel` (fade math lifted verbatim), `shareLink` |
| `featured.types.ts` (new) | `ShareOutcome`, `ShareNotice`, `CopyInsets` — each shared by at least two files |

CSS was split verbatim by line range. Every original line landed in exactly one file; the only additions are three `@media` wrappers and header comments.

| File | Lines | Owns |
| :--- | ---: | :--- |
| `Featured.module.css` | 890 → 515 | Section, panel layout, decorative stage, copy, desktop horizontal layout |
| `Featured.media.module.css` (new) | — | Frame, poster, player, Play / Close |
| `Featured.rail.module.css` (new) | — | Action rail |
| `Featured.progress.module.css` (new) | — | Progress ticks |

### Data — `src/data/`

- `types.ts` (new): holds `FeaturedStory`, `HardwareBeat`, `ContentCategory`, and a `LocalizedSource<T, K>` type. That type replaces three hand-written `*Source` interfaces that each repeated the public field list.
- `featured.ts`, `hardware.ts`, `contentUniverse.ts` (modified): now import those types. Net 16 lines added, 91 removed. No content changed.

### Tests

- `src/app/App.test.tsx` (modified):
  - Featured's nine behaviour tests moved out, verbatim apart from the render call.
  - A slim page-level test "no iframe anywhere on first render" was added, so the whole-page guarantee stays covered.
- `src/sections/featured/Featured.test.tsx` (new): the nine moved tests, rendering Featured inside `PreferencesProvider`.
- `src/sections/featured/featured.utils.test.ts` (new): 13 tests, including the copy-fade regression (settled copy must be exactly opacity 1).
- `src/data/data.test.ts` (new): 5 integrity tests:
  - every language is complete;
  - each embed ID matches its watch URL, on the nocookie host;
  - structure is identical across languages;
  - every `shortIndex` exists;
  - channels are https.
- `e2e/featured.spec.ts` (new): the Featured block of `app.spec.ts` (HEAD lines 61–612), moved verbatim apart from one comment.
- `e2e/helpers.ts` (new): the shared `primaryNav` helper.
- `e2e/app.spec.ts` (modified): the block was removed.

### Docs and comments

- `docs/ARCHITECTURE.md`, restructured into:
  1. Implemented site
  2. Status of the original 11-section plan
  3. Planned sections
  4. Removed concepts
  5. Deferred ideas (Three.js, custom cursor, code splitting, …)
  6. The original pre-build spec, verbatim and bannered as design intent. It is kept because code comments cite its §3–§6.
- `docs/TECH_STACK.md`: one stale line ("no source code exists yet") replaced with a status pointer.
- `src/sections/content-universe/ContentUniverse.module.css`: two comments re-pointed to `Featured.media.module.css`.

## Refactor categories created

- Components: panel, media, rail, progress
- Hooks: player/keyboard/focus, actions, GSAP sequence
- Pure utils and shared types
- CSS: base, media, rail, progress
- Content types
- Tests: section, utils, data, e2e

`Featured.motion.module.css` was **not** created. Featured has no CSS-owned motion: its transitions are colour-only and belong to their controls, and the horizontal layout can't be separated from the base track/rail/panel classes without double-classing.

## Behavior preserved

All of the following are covered by tests and the browser checks:

- click-to-play, with zero iframes before a press;
- one active player at a time;
- Escape to close;
- focus moving to Close on open, and back to Play on close;
- the action rail: order, local-only like, share sheet or clipboard with a live region, links opening in a new tab with `noreferrer`;
- translated labels;
- reduced motion: no pin, vertical stack, player loaded paused;
- the desktop horizontal pin, snap, and copy fade;
- the mobile stacked fallback;
- the real YouTube URLs;
- accessible names.

The e2e selectors that match on class-name fragments (`track`, `rail`, `actions`, `progress`) still match, because class names are unchanged. CSS Modules hash per file, so every descendant selector was kept in the same file as both of its classes.

## Tests and exact results

| Command | Baseline (HEAD) | After |
| :--- | :--- | :--- |
| `npm run typecheck` | exit 0 | exit 0 |
| `npm run lint` | exit 0 | exit 0 |
| `npm run test:run` / `npx vitest run` | 1 file, 46/46 passed (36.9s), exit 0 | 4 files, **65/65 passed** (51.3s), exit 0 |
| `npm run build` | exit 0 | exit 0 |
| `npx playwright test` | 73/73 passed (1.2m), exit 0 | **73/73 passed** (1.4m), exit 0 — 57 in `app.spec.ts`, 16 in `featured.spec.ts` |
| `git diff --check` | — | exit 0 |
| Ad-hoc `tsc --strict` on `e2e/*.ts` (not covered by `tsc -b`) | — | exit 0 |

The 46 original unit tests were first run **unchanged** against the refactored code: 46/46 passed.

**Vitest hang from the previous report:** not reproduced. Every run finished normally, with no duplicate processes. jsdom logs repeated `Not implemented: Window's scrollTo()` noise. That is harmless, but it floods the verbose output and may be why an earlier run looked hung.

## Browser and responsive checks (Chromium, production builds)

The baseline build (HEAD, port 4180) and the refactored build (port 4181) were compared with scripted Playwright captures.

**Computed-style fingerprint of `#featured`.** Every element, every CSS property, plus geometry, across 26 states:
- 320, 375, 390, 768, 1024, 1280, 1440 and 1920px, plus 844×390 landscape;
- motion allowed and reduced;
- dark and light themes;
- EN, FR and ES.

Result: **0 DOM, 0 geometry and 0 style differences.**

**Screenshots:** 40 captured, **35 pixel-identical**. The other 5 are mid-sequence pin frames with at most 2 pixels over an 8-level delta. A baseline-vs-baseline run showed the same noise level (scrub timing).

**Behavioural checks** at 10 viewports (the list above plus 667×375 landscape) × 2 motion modes, with results identical before and after:
- **Anchor landing:** the "Work" link lands `#featured` with its title 161–215px below the bar.
- **Images:** all three posters decode.
- **Layout:** 0 overlap between the frame and the headline or support text, or between the rail and the frame; the rail sits beside the frame on desktop and below it on mobile; the frame stays 9:16.
- **Overflow:** 0 horizontal overflow.
- **Console and network:** 0 console errors, 0 first-party failed requests.

## Accessibility results

- Tab order through a panel is Play → Like → Comments → Share → Watch, each with a solid 2px focus ring.
- Accessible names keep the pattern `visible label — title`.
- `aria-pressed` on Like and `role="status"` on the notice are preserved.
- Focus goes to Close when a player opens and returns to Play on Escape, at every tested viewport.
- The decorative stage and progress stay `aria-hidden`.

## Bundle and performance impact

| Asset | HEAD | After | Delta |
| :--- | :--- | :--- | :--- |
| JS | 386.96 kB (130.25 kB gzip) | 388.44 kB (130.85 kB gzip) | +1.48 kB raw / +0.60 kB gzip, from module boundaries |
| CSS | 59.74 kB (10.70 kB gzip) | 59.91 kB (10.73 kB gzip) | +0.17 kB / +0.03 kB gzip, from the repeated `@media` wrappers |

No runtime behaviour change and no new dependencies.

## Known limitations

- Only Featured was split. Hero (480 lines TSX, 1,155 lines CSS), Nav (479 / 550) and ContentUniverse (411 / 665) are the next candidates.
- Hero's `STATS`/`TILES` stay in `Hero.tsx`, next to their provenance notes.
- `e2e/app.spec.ts` (1,694 lines) could be split per section in the same way.
- Six unreferenced assets are **not deleted** and await approval: `src/assets/featured/{apple-samsung-short,apple-wwdc,pc-250k-short,pc-part-compatibility,thinkpad-short,vintage-tech}.jpg`, about 511 KB of repo weight. They are not bundled.
- The `--z-cursor` token is unused (the custom cursor is deferred); it was left in place.

## Pre-existing failures

- **Prettier** was already dirty at HEAD in `e2e/app.spec.ts`, `src/sections/featured/Featured.tsx` and `ContentUniverse.module.css`.
  - The new `Featured.tsx` is clean.
  - `e2e/featured.spec.ts` is kept byte-identical to the moved lines, so it inherits their formatting.
  - Every other new or modified file passes `prettier --check`.
- There are no failing tests at HEAD or after.

## Commit verdict

**Yes.** Typecheck, lint, 65/65 unit tests, 73/73 e2e tests, the build, `git diff --check`, and the rendered-UI diff all pass, and nothing in the rendered page changed.

Stage these files explicitly:

- **Modified:**
  - `docs/ARCHITECTURE.md`
  - `docs/TECH_STACK.md`
  - `e2e/app.spec.ts`
  - `src/app/App.test.tsx`
  - `src/data/contentUniverse.ts`
  - `src/data/featured.ts`
  - `src/data/hardware.ts`
  - `src/sections/content-universe/ContentUniverse.module.css`
  - `src/sections/featured/Featured.module.css`
  - `src/sections/featured/Featured.tsx`
- **New:**
  - `e2e/featured.spec.ts`
  - `e2e/helpers.ts`
  - `src/data/data.test.ts`
  - `src/data/types.ts`
  - every other untracked file under `src/sections/featured/`
- **Your call:** `AI_REPORT.md`.
- **Do not stage:** `Claude report/fix-v20/`.

Suggested message: `refactor: split Featured and content data by responsibility`

## Confirmation

Nothing was committed, pushed, or deployed. Nothing was staged: a temporary `git add -N` used for `git diff --check` was reset.
