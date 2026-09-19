import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  gsap,
  ScrollTrigger,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import { getContentCategories } from '../../data/contentUniverse'
import { getFeaturedStories } from '../../data/featured'
import styles from './ContentUniverse.module.css'

/**
 * Content Universe, per ARCHITECTURE.md's Section 6 spec: "an archive/
 * overview of the breadth of CarterPCs' content categories." Where Featured
 * (03) is three curated stories and Hardware (04) is one dominant physical
 * object, this section is six typographic territories coexisting in one
 * shared editorial field. See data/contentUniverse.ts for category sourcing.
 *
 * VISUAL SYSTEM (post-refinement — the first shipped pass failed review for
 * reading as scattered labels around a faint background numeral):
 *
 * 1. The environmental "05" is no longer one distant backdrop glyph behind
 *    the whole section. It's split into two digits that live INSIDE the
 *    pinned field: the "0" anchors the Hardware territory (upper left), the
 *    "5" anchors Mobile Tech (lower right) — so the two dominant categories
 *    each visibly inhabit a digit of the section number, and the diagonal
 *    between the digits IS the composition's main axis. Entries and media
 *    genuinely occlude the digits (real z-order, not transparency tricks),
 *    and both digits move during the pin, so the numeral participates in
 *    every compositional state instead of sitting inert behind them.
 *
 * 2. The two tier-1 entries each carry one absolutely-positioned media crop
 *    that OVERLAPS its own typography and crosses into neighboring grid
 *    regions: Hardware's is a wide crop with a hard diagonal-cut corner
 *    extending right into the field's former dead center (across the "0");
 *    Mobile Tech's is a vertical crop — closer to the native shape of the
 *    short-form content the site documents — slipping behind the headline
 *    and across the "5". Different silhouettes on purpose: identical
 *    windows read as a grid.
 *
 *    Those two crops now hold the REAL Shorts that belong to those two
 *    territories (data/contentUniverse.ts's `shortIndex` names which, and
 *    says why), as links out to the videos themselves. They previously held
 *    a blurred colour field standing in for footage that did not exist —
 *    which is what made this section an abstract taxonomy rather than an
 *    index of anything. The territories a visitor can actually go and watch
 *    are now the two the composition gives the most space to.
 *
 * REMOVED — the connecting thread: a single SVG path that wandered the
 *    field in category order and drew itself across two viewports of
 *    scroll. It joined six territories the section's own copy calls
 *    coexisting rather than sequential, so the one thing it asserted was
 *    the opposite of the point, and on the light theme it read as a stray
 *    hairline across the composition. The `.spine` that performs the same
 *    connective job in the sub-desktop stacked layout is kept: there the
 *    entries genuinely are one vertical list, so a line down them is
 *    describing the layout rather than decorating it.
 *
 * MOTION (two compositional states, one pinned timeline):
 *  - State A (entry): the full field — breadth, hierarchy, both digits
 *    framing the diagonal.
 *  - A→B: the composition's center of gravity travels down-right, once:
 *    Hardware recedes and slides left as its crop narrows, Mobile Tech
 *    advances toward center as its crop opens taller, the "5" slides toward
 *    center while the "0" retreats, and the tier-2/3 territories re-space
 *    around the new dominant. Real x/y/clip recomposition, not opacity-only
 *    emphasis.
 *  A third state used to follow — a further resettling into a more evenly
 *  weighted constellation, deliberately not a rewind to A. It was dropped:
 *  two states make one legible statement about where the weight of this
 *  content sits, and the third turned that statement into drifting. The pin
 *  is correspondingly shorter, so the section gives the scroll back sooner.
 *  All six categories stay mounted and legible throughout — never a
 *  slideshow. Coordinated per-territory groups (one tween per article via
 *  data-cat), one timeline, one ScrollTrigger.
 */
function ContentUniverse() {
  const reducedMotion = useReducedMotion()
  const { t, language } = usePreferences()
  const rootRef = useRef<HTMLElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)

  // Only the copy changes with language — `id` (the pin's `[data-cat]`
  // selector) and `tier` (which row an entry lands in) are language-
  // independent, so the choreography below addresses the same six elements
  // in the same three rows in every language.
  const categories = useMemo(() => getContentCategories(language), [language])
  const dominant = categories.filter((c) => c.tier === 1)
  const secondary = categories.filter((c) => c.tier === 2)
  const tertiary = categories.filter((c) => c.tier === 3)

  // The same three Shorts Featured renders, resolved by index so the two
  // sections can never show a different title or link for the same video.
  // Only the two tier-1 territories name one (see `shortIndex`).
  const shortsByIndex = useMemo(() => {
    const stories = getFeaturedStories(language)
    return new Map(stories.map((story) => [story.index, story]))
  }, [language])

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      // Resolved once, inside the context, so the onComplete below acts on
      // the same scoped elements (see Creator.tsx for the same note).
      const headlineLines = gsap.utils.toArray<HTMLElement>(
        '[data-headline-line]',
      )

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 75%',
            once: true,
          },
        })
        .fromTo(
          headlineLines,
          { clipPath: HEADLINE_WIPE_FROM },
          {
            clipPath: HEADLINE_WIPE_TO,
            duration: 0.9,
            // See HEADLINE_WIPE_* — no live cropping rectangle at rest.
            onComplete: () =>
              gsap.set(headlineLines, { clearProps: 'clipPath' }),
          },
        )
        .from(
          '[data-reveal]',
          { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 },
          '-=0.6',
        )
        // Opacity ONLY — the pin below owns x/y/scale on these same
        // elements, and the entrance is realtime while the pin is
        // scroll-scrubbed. Sharing a property between the two means an
        // anchor jump to #content-universe lets whichever writes last win
        // (the entrance finishing ~2s after the jump was silently undoing
        // the pin's y/opacity mid-choreography). Disjoint property sets
        // make the race structurally impossible.
        .from(
          '[data-field-reveal]',
          { opacity: 0, duration: 0.8, stagger: 0.09 },
          '-=0.55',
        )

      // Recomposition pin — desktop only, triggered on the field itself so
      // its frozen crop holds all six territories and both digits at once
      // (see the earlier session's measured fix for why the trigger is the
      // field, not the section). One phase = two compositional states.
      ScrollTrigger.matchMedia({
        '(min-width: 1024px)': () => {
          const pin = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: fieldRef.current,
              start: 'top top',
              // 0.7 of a viewport, down from 1.1: with the third state gone
              // there is one move to read, and holding the page past the end
              // of it is just holding the page.
              end: () => `+=${Math.round(window.innerHeight * 0.7)}`,
              scrub: 1,
              pin: true,
              // The field's parent (.canvas) is a flex container, and
              // ScrollTrigger defaults pinSpacing OFF for flex parents —
              // which silently removed the pin's scroll distance from the
              // document (max scroll landed at the pin's start, so the
              // choreography could never play past ~6%). Found by probing
              // window.scrollY clamping, not by eyeballing frames.
              pinSpacing: true,
              invalidateOnRefresh: true,
            },
          })

          // ---- State A → State B, and that is the whole timeline ----
          // Center of gravity travels down-right toward Mobile Tech, once.
          // Purely spatial (x/y/scale/clip) — never opacity, which the
          // entrance owns; see the entrance timeline's comment.
          pin
            .to(
              '[data-cat="hardware"]',
              { x: -48, y: -14, scale: 0.88, duration: 0.45 },
              0,
            )
            .to(
              '[data-media="hardware"]',
              {
                clipPath:
                  'polygon(0% 0%, 58% 0%, 72% 28%, 72% 100%, 12% 100%, 0% 80%)',
                duration: 0.45,
              },
              0,
            )
            .to(
              '[data-cat="mobile"]',
              { x: -110, y: -54, scale: 1.1, duration: 0.45 },
              0,
            )
            // Crop "opens" via clip only — no media-own scale on top of the
            // entry scale; the compound made the crop swallow the thread
            // and the "5" at State B.
            .to(
              '[data-media="mobile"]',
              {
                clipPath: 'polygon(6% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 6%)',
                duration: 0.45,
              },
              0,
            )
            .to('[data-cat="tech-news"]', { x: -34, y: 38, duration: 0.45 }, 0)
            .to('[data-cat="scam-tech"]', { x: 56, y: -10, duration: 0.45 }, 0)
            .to(
              '[data-cat="emerging-tech"]',
              { x: -52, scale: 1.16, duration: 0.45 },
              0,
            )
            .to(
              '[data-cat="community"]',
              { x: 38, y: -16, scale: 1.12, duration: 0.45 },
              0,
            )
            .to('[data-digit="0"]', { x: -70, y: -46, duration: 0.45 }, 0)
            .to(
              '[data-digit="5"]',
              { x: -150, y: -40, scale: 1.05, duration: 0.45 },
              0,
            )
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      id="content-universe"
      className={styles.contentUniverse}
      ref={rootRef}
    >
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.canvas}>
        <div className={styles.intro}>
          <p className={styles.meta} data-reveal>
            <span>{t.contentUniverse.metaLabel}</span>
            <span className={styles.metaRule} aria-hidden="true" />
            <span>{t.contentUniverse.metaNote}</span>
          </p>
          <p className={styles.kicker} data-reveal>
            {t.contentUniverse.kicker}
          </p>
          <h2 className={styles.headline} data-headline-line>
            {t.contentUniverse.headline}
          </h2>
          <p className={styles.support} data-reveal>
            {t.contentUniverse.support}
          </p>
        </div>

        <div className={styles.field} ref={fieldRef}>
          {/* Environmental "05", split into two digits anchoring the two
              dominant territories — the composition's main diagonal runs
              digit to digit. Both move during the pin. Decorative. */}
          <span className={styles.digitZero} aria-hidden="true" data-digit="0">
            0
          </span>
          <span className={styles.digitFive} aria-hidden="true" data-digit="5">
            5
          </span>

          {/* Always-on connective tissue below desktop, where the field is
              a vertical stack — the desktop thread takes over at 1024px. */}
          <span className={styles.spine} aria-hidden="true" />

          <div className={styles.tierRow} data-row="dominant">
            {dominant.map((category) => {
              const short = category.shortIndex
                ? shortsByIndex.get(category.shortIndex)
                : undefined

              return (
                <article
                  key={category.id}
                  className={styles.entry}
                  data-tier="1"
                  data-cat={category.id}
                  data-field-reveal
                >
                  {/* The territory's real Short. A link, not decoration: the
                    crop is the poster and the whole crop is the target, so
                    the accessible name has to state the destination before
                    it is followed — hence the full title plus the same
                    "Watch on YouTube" / new-tab wording the Featured action
                    rail already uses, rather than a bare thumbnail. The
                    title itself is the published English title in every
                    language (see data/featured.ts). */}
                  {short && (
                    <a
                      className={styles.entryMedia}
                      data-media={category.id}
                      href={short.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${short.headlineLines.join(' ')} — ${
                        t.featured.actions.watch
                      } (${t.featured.a11y.opensInNewTab})`}
                    >
                      <img
                        className={styles.mediaImage}
                        src={short.thumbnail}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                    </a>
                  )}
                  <h3
                    className={styles.entryName}
                    aria-label={category.fullName}
                  >
                    {category.primary.map((line, lineIndex) => (
                      <span
                        key={`${category.id}-${lineIndex}`}
                        className={styles.entryLine}
                        aria-hidden="true"
                      >
                        {line}
                      </span>
                    ))}
                  </h3>
                  <p className={styles.entrySecondary}>{category.secondary}</p>
                  <p className={styles.entryDescription}>
                    {category.description}
                  </p>
                </article>
              )
            })}
          </div>

          <div className={styles.tierRow} data-row="secondary">
            {secondary.map((category) => (
              <article
                key={category.id}
                className={styles.entry}
                data-tier="2"
                data-cat={category.id}
                data-field-reveal
              >
                <h3 className={styles.entryName} aria-label={category.fullName}>
                  {category.primary.map((line, lineIndex) => (
                    <span
                      key={`${category.id}-${lineIndex}`}
                      className={styles.entryLine}
                      aria-hidden="true"
                    >
                      {line}
                    </span>
                  ))}
                </h3>
                <p className={styles.entrySecondary}>{category.secondary}</p>
              </article>
            ))}
          </div>

          <div className={styles.tierRow} data-row="tertiary">
            {tertiary.map((category) => (
              <article
                key={category.id}
                className={styles.entry}
                data-tier="3"
                data-cat={category.id}
                data-field-reveal
              >
                <h3 className={styles.entryName} aria-label={category.fullName}>
                  {category.primary.map((line, lineIndex) => (
                    <span
                      key={`${category.id}-${lineIndex}`}
                      className={styles.entryLine}
                      aria-hidden="true"
                    >
                      {line}
                    </span>
                  ))}
                </h3>
                <p className={styles.entrySecondary}>{category.secondary}</p>
              </article>
            ))}
          </div>
        </div>

        <p className={styles.index} data-reveal>
          {categories.map((c) => c.primary.join(' ')).join(' — ')}
        </p>
      </div>

      {/* Hardware → Content Universe transition: same hairline motif used
          at every prior section boundary, picked up by Hardware's matching
          bottom seam. */}
      <span className={styles.seamEnd} aria-hidden="true" />
    </section>
  )
}

export default ContentUniverse
