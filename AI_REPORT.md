# CarterPCs AI Report — QA pass on the committed Featured/data refactor

## Objective

QA-only verification of the Featured/data/tests refactor now on `main` (commits `5e4f153`, `bf73ed9`, `59540a6`). No features added, no redesign, no PDF or screenshot matrix — text diagnostics and DOM measurements per the updated `AI_WORKFLOW.md` "Efficient visual evidence" rule.

## Model and effort

Claude Sonnet 5, default effort (QA/verification task).

## Scope

- **Checked:** typecheck, lint, full Vitest suite, full Playwright suite, production build, unused assets, git diff/status, Featured click-to-play + keyboard + reduced motion + translations across viewports, full-page console/overflow scan.
- **Not touched:** no code changes were needed (no defects found). Nothing staged, committed, pushed, or deployed. Vercel settings untouched.

## Git status at start

- `HEAD` = `59540a6` (the refactor's docs-sync commit). Working tree: `AI_WORKFLOW.md` modified (pre-existing uncommitted workflow update, not mine), `Claude report/fix-v20/` untracked (prior session's evidence folder). No refactor changes are pending — they are already committed.

## Results

| Check | Result |
| :--- | :--- |
| `npm run typecheck` | **Pass**, exit 0, no output |
| `npm run lint` | **Pass**, exit 0, no output |
| `npx vitest run` | **Pass** — 4 files, **65/65 tests**, 18.2s, exit 0. No hang. |
| `npx playwright test` | **Pass** — **73/73 tests** (57 in `app.spec.ts`, 16 in `featured.spec.ts`), 57.3s, exit 0 |
| `npm run build` | **Pass**, exit 0. JS 388.44 kB (130.85 kB gzip), CSS 59.91 kB (10.73 kB gzip) |
| `git diff --check` | **Pass**, exit 0 (no whitespace/line-ending errors) |

## Featured behaviour (DOM/text checks, no screenshots taken)

Scripted Playwright checks against the production build (`vite preview`), covering desktop/tablet/mobile widths (1440, 768, 390, 320) × motion (allowed/reduced) × language (en/fr/es) = 24 combinations:

- **No iframe on load**, every combination.
- **Click-to-play via keyboard** (focus + Enter): exactly one iframe opens, `youtube-nocookie.com` host, focus moves to the Close control (localized label: "Close player" / "Fermer le lecteur" / "Cerrar el reproductor").
- **Escape**: iframe removed, focus restored to a Play control, every combination.
- **Reduced motion**: embed src has no `&autoplay=1`; motion-allowed: it does. Correct in every combination.
- **Horizontal overflow**: 0px at every viewport.
- **Console errors**: 0 in every combination.
- **Translations**: EN/FR/ES accessible names all correct and distinct (verified above per-language).

A full-page scroll check (1440×900, 390×844, 1024×768) additionally confirmed: 0 horizontal overflow, 0 console errors, and landmark integrity (`main#main-content`, `nav`, `footer`, exactly one `h1`) across the whole page, not just Featured.

## Network requests

The scripted check flagged 12 "failed/4xx" entries, all of the same kind: `youtube-nocookie.com` player script/telemetry requests and one `fonts.gstatic.com` woff2 request, **all fired only after Play is pressed**, by the YouTube iframe's own embedded page — not by this app. Confirmed first-party: `src/styles/global.css` self-hosts its font via `@font-face`/`font-display: block`; `fonts.gstatic.com` is never referenced in app source. **0 first-party failed requests.** This is unrelated to the refactor — the embed URL and host are unchanged from before it.

## Bundle and unused assets

- Bundle sizes match the refactor's own report exactly (388.44 kB / 59.91 kB JS/CSS).
- Same 6 unreferenced files as previously documented, pre-existing and not introduced by this refactor, not bundled: `src/assets/featured/{apple-samsung-short,apple-wwdc,pc-250k-short,pc-part-compatibility,thinkpad-short,vintage-tech}.jpg` (~511 KB total). No change recommended without the user's approval to delete.

## Pre-existing issues (unchanged, not introduced by the refactor)

- **Prettier** reports 3 files with formatting differences: `e2e/app.spec.ts`, `e2e/featured.spec.ts`, `src/sections/content-universe/ContentUniverse.module.css`. This matches exactly what the refactor's own report documented as dirty at its base commit; `e2e/featured.spec.ts` inherited it because it was moved byte-identical out of the already-dirty `app.spec.ts`. Not a regression, not fixed here (out of QA scope; fixing would touch files beyond what was asked).
- `--z-cursor` design token remains unused (deferred custom cursor feature, documented in `docs/ARCHITECTURE.md` Part 5).

## Known limitations of this QA pass

- No screenshots or recordings were captured, per the updated workflow rule and because no visual defect was found to prove.
- Did not re-run the pixel-diff/computed-style fingerprint from the prior session; relied on the scripted DOM/behavioural checks above plus the full Playwright and Vitest suites, which already assert the same invariants (geometry, focus, overlap, overflow) as automated tests.
- Did not audit sections outside Featured/data for defects beyond the full-page console/overflow/landmark scan; the refactor's own scope was limited to Featured/data, and no other section's code changed.

## Commit verdict

**Yes.** Typecheck, lint, 65/65 unit tests, 73/73 e2e tests, the build, and `git diff --check` all pass. Featured's click-to-play, one-player-at-a-time, Escape handling, focus restoration, reduced-motion autoplay withholding, and translations all verified correct in the browser. No first-party console errors or failed requests. No new issues found.

The refactor commits (`5e4f153`, `bf73ed9`, `59540a6`) are already on `main` — no further commit action is needed from this pass.

## Confirmation

Nothing was staged, committed, pushed, or deployed during this QA pass. No Vercel settings were touched. No files were modified except this report.
