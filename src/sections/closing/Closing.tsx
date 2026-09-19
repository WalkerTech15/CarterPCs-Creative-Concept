import { useLayoutEffect, useRef } from 'react'
import {
  gsap,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import styles from './Closing.module.css'

/**
 * Closing statement — section 06, the last beat before the footer. The footer
 * is a separate task and nothing here anticipates it.
 *
 * COMPOSITION
 * The site's five content sections all open the same way: a small label, then
 * display type, then supporting copy, all left-aligned on the shared 96rem
 * canvas. This closes on the same rail rather than centring, so the page ends
 * on the axis it has held throughout — and it deliberately runs SHORTER than
 * the sections above it (60vh rather than 100vh), because a closing beat that
 * demands a full viewport reads as another section rather than as an ending.
 *
 * The "06" is the same environmental-numeral device Hardware (04) and Content
 * Universe (05) already use: a large, low-contrast glyph in its own layer
 * behind the type, aria-hidden and purely compositional. It is the only
 * element here that is not copy the brief asked for, and it carries no
 * information — the numeral is visual language, not a new claim.
 *
 * COPY
 * Everything visible comes from the dictionary except the identity, which is
 * the proper noun "CarterPCs" and is written as a literal in every language,
 * exactly as the nav bar already does. There are no links, handles, counts or
 * contact details of any kind — the only interactive element is the
 * back-to-top control, which targets #hero.
 *
 * The headline is one sentence broken across two display lines, and each
 * language chooses its own break point (see the dictionary comment) rather
 * than inheriting English's.
 *
 * MOTION
 * The same one-shot reveal the other sections use: the two headline lines wipe
 * in with the shared HEADLINE_WIPE_* constants — which carry a vertical bleed
 * and clear themselves on completion, so no cropping rectangle survives at
 * rest — and the remaining elements fade up on a stagger. Under reduced motion
 * the effect never runs at all, so nothing is left mid-animation: the section
 * simply renders in its resting state.
 */
function Closing() {
  const reducedMotion = useReducedMotion()
  const { t } = usePreferences()
  const rootRef = useRef<HTMLElement>(null)

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
            start: 'top 80%',
            once: true,
          },
        })
        .fromTo(
          headlineLines,
          { clipPath: HEADLINE_WIPE_FROM },
          {
            clipPath: HEADLINE_WIPE_TO,
            duration: 0.9,
            stagger: 0.12,
            // See HEADLINE_WIPE_* — no live cropping rectangle at rest.
            onComplete: () =>
              gsap.set(headlineLines, { clearProps: 'clipPath' }),
          },
        )
        // fromTo, not from — the resting state is stated explicitly rather
        // than read off the element. `from()` records its end value when the
        // tween first RENDERS, but immediateRender has already written
        // opacity:0 at timeline-creation time; on an element that also
        // carries a CSS opacity transition, the browser finishes transitioning
        // to 0 before the ScrollTrigger fires, so GSAP reads 0 as the natural
        // value and animates 0 → 0. The back-to-top link hit exactly that and
        // stayed invisible forever. (The link no longer transitions opacity
        // either — see Closing.module.css — but stating both ends removes the
        // dependency on read-back entirely, for any element added later.)
        .fromTo(
          '[data-reveal]',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 },
          '-=0.75',
        )
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="closing" className={styles.closing} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

      {/* Environmental "06" — same device as Hardware's and Content
          Universe's section numerals. Decorative, never a label. */}
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.backdropNumeral}>06</span>
      </div>

      <div className={styles.canvas}>
        {/* Proper noun, not translated — see the file comment. The dot is the
            same restrained violet indicator the nav bar sets beside it. */}
        <p className={styles.wordmark} data-reveal>
          CarterPCs
          <span className={styles.wordmarkDot} aria-hidden="true" />
        </p>

        <h2
          className={styles.headline}
          aria-label={`${t.closing.headlineLineOne} ${t.closing.headlineLineTwo}`}
        >
          <span className={styles.line} aria-hidden="true" data-headline-line>
            {t.closing.headlineLineOne}
          </span>
          <span className={styles.line} aria-hidden="true" data-headline-line>
            {t.closing.headlineLineTwo}
          </span>
        </h2>

        <p className={styles.disclaimer} data-reveal>
          <span>{t.closing.disclaimerLineOne}</span>
          <span>{t.closing.disclaimerLineTwo}</span>
        </p>

        <a className={styles.backToTop} href="#hero" data-reveal>
          {t.closing.backToTop}
          <span className={styles.backToTopArrow} aria-hidden="true">
            ↑
          </span>
        </a>
      </div>
    </section>
  )
}

export default Closing
