# fix-v18 — Hardware image: STOPPED at the clean-source check

Date: 2026-08-11 · Task: add `C:\Users\Vu Nhat Minh\Downloads\pc.jpg` as the Section 04 main visual.

## Re-check (same day, task re-submitted)

The task was re-sent describing the image as "approved clean", with the same source path. The file
on disk was re-read and re-inspected: **identical file** (72,147 bytes, 1024×572, same content),
and the **same four-pointed star badge is still present at the same bottom-right position** —
`evidence/03-recheck-same-badge.png`. The preview image attached to the re-submission itself also
shows the badge in its bottom-right corner. Calling the file clean does not change its pixels: the
stop condition still holds, and nothing was implemented. To proceed, the file at that path (or a
new path) must actually be a badge-free export — see "What is needed to proceed" below.

## Verdict: the supplied image is NOT clean — no implementation was performed

The task's precondition — "Confirm the image is a clean, licensed version with no watermark or
third-party attribution mark. Stop and report if the supplied image is not clean." — **fails**.

### What was found

- **Bottom-right corner: an overlaid four-pointed star glyph** (light grey, flat, UI-style),
  sitting on top of the desk surface at roughly x≈985, y≈515 of the 1024×572 frame. It is not part
  of the photographed scene — it is not a light source, reflection, or object; it is a flat badge
  composited over the image. This sparkle glyph is the attribution stamp commonly applied by
  AI-image tools to mark generated output. Evidence: `evidence/01-bottom-right-corner-4x.png`
  (4× zoom — the glyph is unmistakable).
- The other three corners are free of marks (`evidence/02-other-corners-clean.png`).
- Reference copy of the supplied file as received: `evidence/00-supplied-image-reference.png`.
  The source file in Downloads was read only — not modified, moved, or edited.

### Why this stops the task

The instructions are explicit: do not remove, hide, crop around, or alter any watermark — and any
framing I could ship (`object-fit: cover` with responsive `object-position`) would either show the
badge inside the media window or push it out of frame, which is exactly the forbidden
"crop around". So the only compliant action is to stop and report.

### Secondary concern to address alongside the re-supply

The file is **1024×572px**. The Hardware media surface renders up to ~968×691 (2560×900 class)
and the layer's crop is portrait-leaning (its box is taller than 16:9), so a 572px-tall source
would be upscaled and still under-cover the box vertically. When supplying the clean version,
prefer the fix-v16 spec: **≥1400×1000px** (or the same art at its original resolution), subject in
the right two-thirds — this image's composition is otherwise exactly right for the slot (PC and
hands right, dark negative space left).

## What is needed to proceed

1. A version of this image (or equivalent approved photography) **without the corner badge** —
   exported clean from the source tool/licensor, not retouched to remove the mark.
2. Confirmation of the licence covering portfolio use.
3. Ideally ≥1400×1000px per the media-slot spec.

On re-supply, the implementation plan is ready: WebP derivative (source preserved unchanged),
`.mediaLayer` drop-in behind the existing silhouette treatment (radius, edge, mask), responsive
`object-position` keeping the PC clear of the text column, decorative `alt=""` with the rationale
documented (the surrounding copy carries the information), and the full QA matrix from the task.

## Changed files

**None.** No source file, test, translation, or asset was touched; the Downloads image was read
only. `git status` on baseline `7134451` (fix-v17, committed by the owner):
```
?? Claude report/fix-v18/
```
— this stop-report folder is the only addition. Nothing committed, pushed, reset, cleaned, or
reverted. Validation chain not run — there is no change to validate; fix-v17's chain (typecheck 0,
lint 0, unit 43/43, build pass, e2e 74/74 ×3, diff clean) remains the last state of the tree.
