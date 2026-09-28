/**
 * Featured's pure helpers — no React, no GSAP, no DOM reads — so the arithmetic
 * the section's behaviour depends on can be tested on its own (see
 * featured.utils.test.ts).
 */

import type { FeaturedStory } from '../../data/types'
import type { CopyInsets, ShareOutcome } from './featured.types'

/**
 * The real, published title of the Short. Deliberately the same English
 * string in every language (see data/featured.ts) — it names a specific
 * video, so it is not translated. Every control in a panel composes its
 * accessible name as `visible label — title`.
 */
export const storyTitle = (story: Pick<FeaturedStory, 'headlineLines'>) =>
  story.headlineLines.join(' ')

/**
 * The iframe src for a story, built at the moment of playing rather than
 * stored, so the autoplay flag can depend on the visitor. A click IS the
 * request to play, so autoplay after it is not "autoplay" in the sense the
 * reduced-motion preference is about — but someone who has asked for less
 * motion gets the player loaded paused with its controls anyway, and decides
 * for themselves.
 */
export const playerSrc = (embedUrl: string, reducedMotion: boolean) =>
  reducedMotion ? embedUrl : `${embedUrl}&autoplay=1`

/**
 * Which panel the pinned sequence is on. The horizontal tween's progress maps
 * linearly onto the rail, so 0, 1/(n-1), … 1 ARE the panel boundaries and the
 * nearest one is the active panel.
 */
export const activePanelIndex = (progress: number, panelCount: number) =>
  Math.round(progress * (panelCount - 1))

/** Same semantics as gsap.utils.clamp, without pulling GSAP into a pure module. */
const clamp = (min: number, max: number, value: number) =>
  value < min ? min : value > max ? max : value

/**
 * Right-edge safe zone, as a fraction of the viewport width. Entry stays at a
 * hard 0 until the copy's trailing edge is this far inside the viewport.
 */
export const SAFE_INSET_RATIO = 0.06

/**
 * Entry ramp: once safely inside from the right, opacity climbs to 1 over
 * this many px — comfortably short of a "pop," and there's plenty of real
 * travel room on this side (see FIRST_VISIBLE_FRAME logs during validation:
 * several hundred px between "just became safe" and "fully settled").
 */
export const ENTRY_FADE_TRAVEL_PX = 96

/**
 * Exit ramp: sized as a fraction of the panels' own measured rest-state left
 * inset (rather than a fixed px constant) so it always finishes comfortably
 * before copyLeft reaches that rest value — guaranteeing settled copy reaches
 * exactly opacity 1 — while still fading smoothly, well before the true left
 * edge, as this panel is pushed off-screen by the next one entering.
 */
export const exitFadeTravel = (insets: CopyInsets[]) =>
  Math.min(...insets.map((m) => m.textLeft)) * 0.6

/**
 * How visible one panel's readable text should be (0–1) for a given rendered
 * rail position.
 *
 * A panel's copy only ever risks being clipped by ONE edge at a time, and it's
 * a different edge depending on direction — never both at once, and never the
 * edge you'd naively guess from a single shared "inset from both edges" rule:
 *  - Entering (from the right): the block's *trailing* (right) edge is the
 *    last part still off-screen, so copyRight vs. the right edge is the only
 *    real constraint. Its own left inset is nowhere near the left edge this
 *    whole time (content is left-anchored inside a full-viewport panel, so
 *    copyLeft starts and stays large until long after this panel has already
 *    settled).
 *  - Exiting (to the left, as the NEXT panel enters): the block's copyLeft is
 *    what approaches the left edge.
 * A first version of this fix used one shared, symmetric "inside a safe zone
 * inset from both edges" rule for both directions — which broke the *settled*
 * state: a panel's own natural left inset (its content padding, ~80px at this
 * section's desktop breakpoints) is narrower than a viewport-ratio-based safe
 * inset would need it to be, so the shared rule stayed permanently
 * unsatisfiable on the left, snapping settled copy back to opacity 0 the
 * instant it finished entering (caught by scanning real rendered opacity
 * across the full scroll range, not just the reported bug's two transitions).
 * Splitting entry and exit into their own terms fixes that without touching
 * the already-approved exit fade's actual visual behavior (still a smooth,
 * ungated fade as this panel's own copy is pushed left off-screen by the next
 * one).
 *
 * `panelIndex * viewportWidth` is the panel's left edge on an untranslated
 * rail: every panel is exactly 100vw wide in the pinned layout.
 */
export function copyFocus({
  insets,
  panelIndex,
  railX,
  viewportWidth,
  exitTravel,
}: {
  insets: CopyInsets
  panelIndex: number
  railX: number
  viewportWidth: number
  exitTravel: number
}): number {
  const safeRight = viewportWidth * (1 - SAFE_INSET_RATIO)
  const panelOffset = panelIndex * viewportWidth + railX
  const copyLeft = panelOffset + insets.textLeft
  const copyRight = panelOffset + insets.textRight

  // Entry: hard 0 until the block's trailing (right) edge is inside the
  // conservative safe zone — never a partial value while still outside it, so
  // a still-entering block can never read as "already fading in." Then a
  // short ramp to 1.
  const rightMargin = safeRight - copyRight
  const entryFocus =
    rightMargin < 0 ? 0 : clamp(0, 1, rightMargin / ENTRY_FADE_TRAVEL_PX)

  // Exit: smooth (ungated) fade as copyLeft approaches the true left edge —
  // the already-approved "may fade before fully leaving the viewport"
  // behavior, just sized so it's still 1 at this panel's own settled position.
  const exitFocus = clamp(0, 1, copyLeft / exitTravel)

  return Math.min(entryFocus, exitFocus)
}

/**
 * Shares a Short's link and reports how that went.
 *
 * The platform's own share sheet, where there is one. It reports its own
 * outcome, so the caller shows nothing — and a visitor who dismisses the
 * sheet has not failed at anything, so a rejection is 'shared' (silence), not
 * an error message.
 *
 * Otherwise the clipboard, with a real result either way: the API is absent
 * outside secure contexts and can reject on a denied permission, and silently
 * doing nothing would look identical to succeeding.
 */
export async function shareLink(
  title: string,
  url: string,
  nav: Navigator | undefined = typeof navigator === 'undefined'
    ? undefined
    : navigator,
): Promise<ShareOutcome> {
  if (nav?.share) {
    try {
      await nav.share({ title, url })
    } catch {
      /* dismissed */
    }
    return 'shared'
  }
  try {
    if (!nav?.clipboard?.writeText) {
      throw new Error('clipboard unavailable')
    }
    await nav.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
