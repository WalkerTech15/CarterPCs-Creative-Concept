# fix-v19 — Credibility, decoration and motion refinement pass

Date: 2026-09-19 · Baseline: `7134451` (fix-v17) plus the owner's uncommitted Hardware
image change · Scope: targeted refinement, not a redesign.

---

## 1. Headline outcome

The site's single largest credibility problem was a **fabricated press row**. The Hero's
"Featured in" strip rendered Apple, Forbes, The Verge, HYPEBEAST, Linus Tech Tips and
uncrate as typographic wordmarks plus a bundled Apple logo. Nothing in this project
supports any of those relationships. It has been removed and replaced with the three
real CarterPCs channels, as working links.

Everything else in this pass follows the same rule: **if the page asserts something, a
visitor must be able to check it.** Decoration that restated nothing, and motion that
communicated nothing, were removed on the same principle.

---

## 2. Files changed, and why

### Credibility

| File | Change |
| --- | --- |
| `src/data/channels.ts` **(new)** | The three real channel URLs, shared by Hero and Footer so they cannot drift. Carries the full reasoning for retiring the wordmark row. |
| `src/sections/hero/Hero.tsx` | Removed `PRESS_MARKS`, `AppleMark` and the Apple logo import. The strip is now a real, non-`aria-hidden` link row. Stats values corrected. Added the dated provenance line. Removed the index rail. |
| `src/sections/hero/Hero.module.css` | `.stripLink` / `.stripArrow` replace the six `.mark*` wordmark styles; `.statsSource` added; index-rail rules deleted; stat-label collision fixed. |
| `src/components/footer/Footer.tsx` | Now imports `CHANNELS` instead of keeping a second private copy of the same three URLs. |
| `src/i18n/en.ts`, `fr.ts`, `es.ts` | `featuredIn` → `channelsLabel`; `ctaSecondary` relabelled; `statsSource` added. |
| `src/styles/global.css` | Deleted the light-theme filter that existed only to correct the Apple glyph. |
| `src/assets/hero/apple-logo.svg` | **Deleted** — a third-party brand mark with no remaining reference. |

### Decoration

| File | Change |
| --- | --- |
| `src/sections/creator/Creator.tsx` / `.module.css` | Removed the section index rail (96 CSS lines). |
| `src/sections/featured/Featured.tsx` / `.module.css` | Removed the far-right vertical `.sequence` rail. |
| `src/sections/content-universe/ContentUniverse.tsx` / `.module.css` | Removed the connecting-thread SVG and its styles; replaced the two empty placeholder crops with the real Shorts. |

### Motion

| File | Change |
| --- | --- |
| `src/sections/hardware/Hardware.tsx` | Removed the pinned depth-separation timeline (and the now-unused `ScrollTrigger` import). |
| `src/sections/content-universe/ContentUniverse.tsx` | Removed the thread-draw tween and the third compositional state; pin shortened 1.1vh → 0.7vh. |

### Data and tests

| File | Change |
| --- | --- |
| `src/data/contentUniverse.ts` | `media: boolean` → `shortIndex: string \| null`, naming which real Short belongs to each territory. |
| `src/app/App.test.tsx` | Updated the two stat assertions; added three regression tests (press claims, figures, Content Universe media). 43 → 46 tests. |
| `e2e/app.spec.ts` | Removed the obsolete sequence-rail test; marked two long Hardware tests `test.slow()`. 74 → 73 tests. |

**Net: 674 insertions, 1052 deletions across 20 tracked files, plus one new file.**

---

## 3. Before / after — the visual system

**Hero.** Before, the composition ended on a row of publication names under the words
"Featured in", with a 10px disclaimer beneath it. After, it ends on "Watch on —
YouTube / Instagram / TikTok", each a real link with a hover-nudged arrow. The beat
in the composition is identical: same divider, same baseline, same quiet ink. What
changed is that it is now true, and that it does something.

**One progression language instead of three.** The page previously ran three competing
position notations: the `NN / Name` meta label each section carries, decorative tick
rails in Hero and Creator, and a vertical mark rail in Featured. The rails could not be
read — Hero's had two ticks and Creator's five, both claiming a denominator of six — and
Featured's third rail was documented in its own source as restating the indicator above
it. The meta labels and the environmental numerals now carry section identity alone.
Featured keeps its progress dots, because those track real content position.

**Content Universe is now an index.** Its two most prominent territories were
illustrated with empty clipped rectangles holding a blurred colour field, described in
the code as "deliberately obscured future footage". On the light theme they read as
images that had failed to load. They now hold the two real Shorts that belong to those
territories, as links to the videos. Both windows are 9:16 — not styling, arithmetic:
the posters are 1280×720 thumbnails that YouTube pads with a blurred zoom of itself, and
`cover` on a 9:16 box lands exactly on the real centre column, so the filler never shows.
The decorative thread that wandered across the field is gone.

**Motion is now purposeful only.** Hardware held the page for 0.65 of a viewport while
two decorative planes pulled apart and recomposed to the exact frame they started from.
Its own source noted the movement had been *enlarged* once because a recording showed it
was imperceptible — motion there to be noticed, not to communicate. Removed. Content
Universe's third compositional state (explicitly "not a rewind") is gone, leaving one
directional move. **Featured's horizontal pin is now the page's only borrowed-scroll
moment,** which is what makes it read as a signature rather than a habit.

**Glass was already disciplined** and was left alone: the nav scrim and one Hero card
blur, both with non-`backdrop-filter` fallbacks. No glass was added.

---

## 4. Every claim removed or changed

| Claim | Status | Reason |
| --- | --- | --- |
| "Featured in" + Apple, Forbes, The Verge, HYPEBEAST, Linus Tech Tips, uncrate | **Removed** | No press feature, affiliation or endorsement is evidenced anywhere in the project. `aria-hidden` was not a defence: a sighted visitor reads publication names under "Featured in" as a claim. |
| `3.0M+` YouTube Subscribers | **Changed → `2.9M+`** | The cited reading is 2.94M. A "+" is a floor claim, so rounding *up* overstates the source. |
| `7.0B+` Total YouTube Views | **Changed → `6.8B+`** | The cited reading is 6,868,093,822 — below 7.0B. Same reasoning. |
| Undated statistics | **Fixed** | Both figures now carry a visible dated line: tracker reading, 28 July 2026, rounded down. |
| "Watch Reel" / "Voir la vidéo" / "Ver el vídeo" | **Changed → "Watch the Shorts"** | No reel exists; the button has always scrolled to the three Shorts. It now says so. |
| Content Universe placeholder media | **Replaced with real Shorts** | Two empty crops implied footage that did not exist. |

**Kept, because supported:** "Millions across platforms" (2.94M subscribers), "Dozens"
for builds (deliberately qualitative — no counter exists), all section copy, and the
unofficial/non-affiliation messaging in Hero, Closing and Footer, which is unchanged.

---

## 5. Asset provenance — needs your decision

**`src/assets/hardware/hardware-workshop-build.png` — untracked, and wired into the
Hardware section by an uncommitted change that predates this session.**

I did not put it there, and I have left it exactly as found — not replaced, not
re-encoded, not cropped.

What I verified: the file is 1536×1024 (meeting fix-v16's ≥1400×1000 spec) and I
inspected all four corners at 4× with brightness and contrast lifted.
**The four-pointed star badge that stopped fix-v18 is not present in this file**
(`evidence/10-hardware-asset-corner.png`). So this appears to be the clean re-supply
fix-v18 asked for, and on that basis I left it in place.

What I cannot verify, and what needs you:

1. **Licence and origin.** Nothing in the repo records where this file came from or what
   licence covers portfolio use. fix-v18's stopped attempt involved an AI-generated
   source, and this file's dimensions are typical of the same class of tool. Absence of
   a badge is not evidence of provenance.
2. **The same question applies to `creator-workshop-filming-setup.png`** — also
   1536×1024, already committed, and documented only as "the supplied asset".
3. **It ships as a 1.96 MB PNG.** Creator's image has a WebP derivative at 112 kB; this
   one has none, so it is the largest single asset in the build. I deliberately did not
   create one: making a derivative of a file whose provenance I am flagging would be the
   wrong order of operations. Once you confirm origin, a WebP pass is a small,
   self-contained win.

No other asset changed, except the deleted Apple logo.

---

## 6. Validation — actual results

All run after the final edit, in this order:

| Step | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | **Pass**, 0 errors |
| Lint | `npm run lint` | **Pass**, 0 errors, 0 warnings |
| Unit | `npm run test:run` | **46/46 pass** (was 43; +3 new regression tests) |
| Build | `npm run build` | **Pass**, 61 modules, built in 886 ms |
| E2E | `npx playwright test` | **73/73 pass** (was 74; one obsolete test removed) |
| Whitespace | `git diff --check` | **Clean**, exit 0 |

### Browser matrix — measured, not eyeballed

Run against the production build on `:4173`. Checked per section for page overflow,
elements past the right edge, unresolved anchors, and console errors.

- **Widths:** 320, 390, 768, 1024, 1240, 1280, 1440, 1920
- **Languages:** EN, FR, ES
- **Themes:** dark, light, and system (via `prefers-color-scheme`)
- **Reduced motion:** EN, ES and FR at desktop and mobile

**Result: no horizontal page overflow, no broken anchors, no console errors, in any
combination.** The only flagged elements are Featured's off-screen panels 2 and 3, which
are the horizontal track by design and are contained by `overflow: clip`.

Reduced motion renders every section fully present with nothing mid-animation
(`evidence/09-universe-reduced-motion.png`).

### One extra defect found and fixed during verification

The By The Numbers stat labels were **overlapping** — they are `white-space: nowrap`
inside fixed grid columns, so a label wider than its column runs into its neighbour
rather than wrapping. Measured ink-to-ink gaps at 1240–1280px: **−6px (EN), −11px (FR),
−5px (ES)**, with FR still touching at exactly 0px at 1440. This pre-dates this session.
Fixed by dropping the label to 9px and rebalancing the column split to
`1.12fr / 1.22fr / 0.78fr` — the middle column carries the longest label in all three
languages but the narrowest value. **All gaps are now positive (worst case +7px) and
every label sits inside the card at every width in every language.**

---

## 7. Git status

Nothing was committed, pushed, staged, reset, cleaned or reverted. No prior report
folder was modified.

```
 M e2e/app.spec.ts
 M src/app/App.test.tsx
 D src/assets/hero/apple-logo.svg
 M src/components/footer/Footer.tsx
 M src/data/contentUniverse.ts
 M src/i18n/en.ts
 M src/i18n/es.ts
 M src/i18n/fr.ts
 M src/sections/closing/Closing.tsx
 M src/sections/content-universe/ContentUniverse.module.css
 M src/sections/content-universe/ContentUniverse.tsx
 M src/sections/creator/Creator.module.css
 M src/sections/creator/Creator.tsx
 M src/sections/featured/Featured.module.css
 M src/sections/featured/Featured.tsx
 M src/sections/hardware/Hardware.module.css
 M src/sections/hardware/Hardware.tsx
 M src/sections/hero/Hero.module.css
 M src/sections/hero/Hero.tsx
 M src/styles/global.css
?? Claude report/fix-v18/
?? Claude report/fix-v19/
?? src/assets/hardware/
?? src/data/channels.ts
```

`src/assets/hardware/` and the Hardware edits inside `Hardware.tsx` /
`Hardware.module.css` include the owner's pre-existing uncommitted work, which this pass
left intact. The deleted Apple logo is recoverable with
`git checkout -- src/assets/hero/apple-logo.svg`.

---

## 8. Deliberately not changed

- **Featured's horizontal pin** — real content progression, and now the page's only
  borrowed-scroll moment. Kept as the signature.
- **All section copy** except the specific unsupported claims in §4.
- **The environmental numerals** (04, 05, 06) and the section meta labels — these *are*
  the progression language everything else was measured against.
- **Content Universe's `.spine`** below desktop, where the entries genuinely are one
  vertical list and a line down them describes the layout.
- **Glass treatment** — already limited to the nav scrim and one Hero card, both with
  fallbacks. Nothing added, nothing widened.
- **Real Shorts, click-to-play, one-player-at-a-time, the action rail, navigation,
  translations, theme switching, keyboard support and responsive behaviour** — all
  verified unchanged by the passing e2e suite.
- **App architecture, dependencies, routes, deployment config** — untouched.
- **Three pre-existing Prettier formatting warnings** (`ContentUniverse.module.css`,
  `Featured.tsx`, `e2e/app.spec.ts`). I confirmed these fail identically at `HEAD`, so
  they are not from this pass; reformatting them would have buried the real diff. Worth
  a separate housekeeping commit.
- **The hardware PNG's missing WebP derivative** — blocked on the provenance answer in §5.

---

## 9. Suggested next steps

1. **Answer the provenance question in §5** — it is the only thing in this report that
   needs you rather than more work.
2. **Refresh the two YouTube figures and the date together** before any production
   release; the reading is now nearly two months old.
3. **Consider the standing repo-hygiene issue:** `Claude report/` is ~189 MB of
   screenshots, videos and PDFs committed to git history. It permanently inflates clone
   size and is unrelated to the deployed product.
