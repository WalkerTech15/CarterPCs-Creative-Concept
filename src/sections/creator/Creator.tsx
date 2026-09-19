import { useLayoutEffect, useRef } from 'react'
import {
  gsap,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import workshop from '../../assets/creator/creator-workshop-filming-setup.png'
import workshopWebp from '../../assets/creator/creator-workshop-filming-setup.webp'
import styles from './Creator.module.css'

/**
 * Creator Introduction — a short editorial bridge from Hero's visual
 * statement to the site's later content sections, per ARCHITECTURE.md's
 * Section 3 spec: "editorial text block + imagery, restrained motion...
 * this section should feel like a pause, not a spectacle."
 *
 * Visual rhythm deliberately mirrors Hero rather than repeating it: Hero's
 * media stage bleeds off the right edge, this one bleeds off the left —
 * a call-and-response across the Hero→Creator scroll, not a copy-paste
 * layout. See Hero.tsx's top-of-file comment for the shared stage language
 * (near-black surface, restrained glow fields, dissolve mask, thin framing
 * lines) this section reuses on purpose for continuity.
 *
 * Copy sourcing (kept internally distinct per the task brief, even though
 * the page doesn't visually label OBSERVATION vs INTERPRETATION):
 *   OBSERVATION   — content pillars, platforms, and format description
 *                   (RESEARCH.md §3 Content Categories, §8 Observable Facts,
 *                   §1 Executive Summary platform list — names/format only,
 *                   no follower/subscriber/view counts).
 *   INTERPRETATION — tone/positioning language (RESEARCH.md §9 Brand/Creator
 *                   Identity Themes: Accessible Tech Demystifier, Honest
 *                   Consumer Advocate, Digital-Native Personality). "Built
 *                   for viewers who want the point without losing the
 *                   context" is this kind of interpretation — a paraphrase
 *                   of §2's "punchy 30-to-60 second vertical clips" /
 *                   ultra-short cadence, not a Carter quote. It replaces an
 *                   earlier draft's "not a 20-minute review" line, which a
 *                   visual/content review flagged as an unnecessary
 *                   put-down of another format; the new phrasing states
 *                   what the content is without comparing it to what it
 *                   isn't.
 * No name, age, birthplace, relocation, dates, milestones, partnerships, or
 * direct quotes are used anywhere — all excluded per the task's factual
 * safety requirement regardless of RESEARCH.md support, since none of it is
 * timeless creator-positioning content.
 *
 * SECTION MEDIA
 * `src/assets/creator/creator-workshop-filming-setup.png` is the supplied
 * asset, copied in byte for byte (SHA-256
 * 173F6E94…B67A94505, 1 536 x 1 024, 1 818 691 bytes). It is not cropped,
 * resized, re-encoded or retouched anywhere in this codebase — every framing
 * decision below is CSS around the file, never a change to it. This replaces
 * the gradient placeholder that `.stageSurface` was always documented as the
 * drop-in target for, so the surrounding structure is unchanged.
 *
 * The photograph's own composition decides the layout: its subject (the open
 * case, the hands, the phone rig, the camera, the tool mat) occupies the left
 * ~80% and it carries dark negative space on the right. So the image takes the
 * section's left panel and the type column sits beside it — the same
 * media-left / text-right rhythm this section already had, now driven by real
 * media. The only region ever cropped is that right-hand negative space; the
 * subject is never cut. See `.stage` in Creator.module.css for the arithmetic.
 *
 * ACCESSIBILITY
 * The photograph is editorial media illustrating copy that already names it —
 * the body paragraph describes PC builds "filmed fast, tested by hand" — so it
 * carries alt="" rather than restating that for screen readers, matching the
 * convention Hero documents for its portrait. It is not a functional image and
 * conveys no information the section's text does not.
 */
function Creator() {
  const reducedMotion = useReducedMotion()
  const { t } = usePreferences()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      // Resolved once, inside the context, so the onComplete below acts on
      // the same scoped elements rather than re-running a selector that is
      // no longer context-scoped by the time the callback fires.
      const headlineLines = gsap.utils.toArray<HTMLElement>(
        '[data-headline-line]',
      )

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 75%',
          once: true,
        },
      })

      tl.fromTo(
        headlineLines,
        { clipPath: HEADLINE_WIPE_FROM },
        {
          clipPath: HEADLINE_WIPE_TO,
          duration: 0.9,
          // See HEADLINE_WIPE_* — the finished wipe must not leave a live
          // cropping rectangle on the headline.
          onComplete: () => gsap.set(headlineLines, { clearProps: 'clipPath' }),
        },
      )
        .from(
          '[data-reveal-stage]',
          { opacity: 0, xPercent: -5, duration: 1.2 },
          '-=0.8',
        )
        .from(
          '[data-reveal]',
          { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 },
          '-=0.9',
        )
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="creator" className={styles.creator} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

      {/* The section index rail that used to sit here (a hairline with five
          tick marks and a "02 /06" count) is gone, with Hero's. It restated
          what the meta label immediately below it already says in words —
          "02 / Creator" — in a second, weaker notation whose tick count was
          decorative rather than structural. One progression language per
          page, and the readable one wins. */}

      <div className={styles.canvas}>
        <p className={styles.meta} data-reveal>
          <span>{t.creator.metaLabel}</span>
          <span className={styles.metaRule} aria-hidden="true" />
          <span>{t.creator.metaNote}</span>
        </p>

        <div className={styles.type}>
          <p className={styles.kicker} data-reveal>
            {t.creator.kicker}
          </p>
          <h2 className={styles.headline} data-headline-line>
            {t.creator.headline}
          </h2>

          <div className={styles.body}>
            <p data-reveal>{t.creator.bodyOne}</p>
            <p data-reveal>{t.creator.bodyTwo}</p>
          </div>
        </div>

        <div className={styles.footer} data-reveal>
          <p className={styles.tags}>{t.creator.tags}</p>
          <p className={styles.platforms}>{t.creator.platforms}</p>
        </div>
      </div>

      {/* Section media. Ordered after .canvas in markup so mobile naturally
          stacks text-then-image (per ARCHITECTURE.md's Section 3 responsive
          spec) without needing a separate mobile-only DOM order; desktop lifts
          it out of flow with position: absolute (see Creator.module.css). */}
      <div className={styles.stage} aria-hidden="true" data-reveal-stage>
        <div className={styles.stageSurface}>
          {/* Deliberately NOT lazy. This is section 02, one scroll below the
              Hero, so it is on the first scroll path rather than deep in the
              page, and at 1.8 MB the fetch is far from instant — deferring the
              request is how you get an empty plate under someone already
              looking at it. Intrinsic width/height are declared so the box is
              reserved before the bytes land and nothing below it shifts. */}
          <picture>
            <source srcSet={workshopWebp} type="image/webp" />
            <img
              className={styles.stageImage}
              src={workshop}
              alt=""
              width={1536}
              height={1024}
              decoding="async"
            />
          </picture>
        </div>
      </div>

      {/* Creator → Featured transition: mirrors the Hero → Creator seam
          above, picked up by Featured's matching top seam (see
          Featured.module.css's .seam). Purely additive — nothing else in
          the approved Creator composition changes. */}
      <span className={styles.seamEnd} aria-hidden="true" />
    </section>
  )
}

export default Creator
