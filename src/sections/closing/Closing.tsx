import { useLayoutEffect, useRef } from 'react'
import {
  gsap,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import creatorFilming from '../../assets/closing/creator-filming-devices.webp'
import styles from './Closing.module.css'

/**
 * Closing statement — section 06, the last beat before the footer. The footer
 * is a separate task and nothing here anticipates it.
 *
 * COMPOSITION
 * The closing beat pairs a compact editorial statement and two internal
 * destinations with the existing workshop photograph. It keeps the site's
 * dark editorial register while giving the page a clear, useful ending.
 *
 * COPY
 * Copy comes from the dictionary except the identity, the proper noun
 * "CarterPCs", which remains consistent with the nav. Both calls to action
 * lead to existing sections; no social handles, contact details, counts, or
 * new claims are introduced.
 *
 * The headline is broken across two display lines, with natural localized
 * wording in each dictionary.
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

      <div className={styles.canvas}>
        {/* Proper noun, not translated — see the file comment. The dot is the
            same restrained violet indicator the nav bar sets beside it. */}
        <p className={styles.wordmark} data-reveal>
          CarterPCs
          <span className={styles.wordmarkDot} aria-hidden="true" />
        </p>

        <div className={styles.copy}>
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

          <p className={styles.description} data-reveal>
            {t.closing.description}
          </p>

          <div className={styles.actions} data-reveal>
            <a className={styles.primaryAction} href="#featured">
              {t.closing.exploreStories}
              <span aria-hidden="true">↗</span>
            </a>
            <a className={styles.secondaryAction} href="#creator">
              {t.closing.meetCreator}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <p className={styles.disclaimer} data-reveal>
          <span>{t.closing.disclaimerLineOne}</span>
          <span>{t.closing.disclaimerLineTwo}</span>
        </p>
      </div>

      {/* Generated editorial illustration, not documentary evidence. The
          visible figcaption discloses that distinction; the image itself
          remains decorative for assistive technology. */}
      <figure className={styles.media} data-reveal-stage>
        <img
          className={styles.mediaImage}
          src={creatorFilming}
          alt=""
          width={1672}
          height={941}
          loading="lazy"
          decoding="async"
        />
        <figcaption className={styles.mediaDisclosure}>
          {t.closing.imageDisclosure}
        </figcaption>
      </figure>
    </section>
  )
}

export default Closing
