import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  gsap,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import { getHardwareBeats } from '../../data/hardware'
import hardwareWorkshopBuild from '../../assets/hardware/hardware-workshop-build.png'
import styles from './Hardware.module.css'

/**
 * Hardware Experience, per ARCHITECTURE.md's Section 5 spec: the site's
 * signature hardware showcase, shifting the narrative from "what CarterPCs
 * creates" (Featured) into "the physical technology world his content
 * revolves around." One immersive composition, not three more panels —
 * Featured already owns the multi-entry/horizontal-story grammar, so this
 * section is deliberately a single dominant stage instead.
 *
 * Depth is real DOM layering, not a 3D library (TECH_STACK.md §3 keeps
 * Three.js/R3F optional and explicitly scopes Hardware's default
 * implementation to CSS/GSAP): `.backdrop` (background — the environmental
 * "04"), `.hardwareStage` (midground — the layered component-scale planes),
 * `.intro`/`.beats`/`.tags` (foreground — headline and editorial metadata).
 * Three real, independently-positioned layers, so the depth-separation
 * scroll choreography can move each at its own subtle rate instead of
 * faking depth with a single flattened layer.
 *
 * The "04" is deliberately NOT a repeat of Creator's/Featured's corner-accent
 * numeral treatment: it lives in its own full-bleed `.backdrop` layer
 * *behind* the stage rather than beside it, so the stage's layered planes
 * visually sit "in" the numeral's environment — integrated background
 * typography, not a decorative corner label.
 *
 * The single primary media surface uses original workshop photography. The
 * two accent planes around it remain decorative depth/composition elements,
 * not additional media slots.
 *
 * Copy: headline/support/beat text is original editorial development
 * language grounded in RESEARCH.md §7's "Custom PCs vs. Overpriced
 * Prebuilts" theme (value-oriented, hands-on, unfiltered tone) and
 * CONTENT.md §Hardware Sequence's category list — see data/hardware.ts's
 * top comment for the full sourcing note. No specs, benchmarks, prices, or
 * quotes are used anywhere.
 *
 * Motion: one entrance reveal and nothing else — the headline clip, the
 * stage fade, and the staggered beats/tags, on the same one-time "top 75%"
 * trigger Hero/Creator/Featured already use. The section previously also
 * borrowed 0.65 of a viewport for a pinned depth-separation effect on its
 * decorative planes; see the note where that timeline used to be built for
 * why it was removed rather than tuned. Featured's horizontal pin is now the
 * page's only borrowed-scroll moment on the desktop path, which is also what
 * makes it read as this page's one signature move rather than as a habit.
 */
function Hardware() {
  const reducedMotion = useReducedMotion()
  const { t, language } = usePreferences()
  const beats = useMemo(() => getHardwareBeats(language), [language])
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
          '[data-reveal-stage]',
          { opacity: 0, y: 24, duration: 1, scale: 0.97 },
          '-=0.7',
        )
        .from(
          '[data-reveal]',
          { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 },
          '-=0.8',
        )

      // The depth-separation pin that used to live here is gone. It held the
      // page for 0.65 of a viewport while the two decorative accent planes
      // and the background numeral pulled apart and then recomposed to
      // exactly the frame they started from — a round trip that ended where
      // it began, so nothing it showed survived it. Its own history says as
      // much: the movement had been enlarged once already because a recording
      // showed the effect was imperceptible, which is the tell that the
      // motion was there to be noticed rather than to communicate. Borrowing
      // a visitor's scroll is the most expensive thing a section can do, and
      // this section now spends it on nothing: the stage's depth is real
      // static layering, the photograph is the subject, and the entrance
      // reveal above still introduces both.
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="hardware" className={styles.hardware} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

      {/* Background layer — environmental "04", see top-of-file comment. */}
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.backdropNumeral} data-numeral>
          04
        </span>
      </div>

      <div className={styles.canvas}>
        <div className={styles.intro}>
          <p className={styles.meta} data-reveal>
            <span>{t.hardware.metaLabel}</span>
            <span className={styles.metaRule} aria-hidden="true" />
            <span>{t.hardware.metaNote}</span>
          </p>
          <p className={styles.kicker} data-reveal>
            {t.hardware.kicker}
          </p>
          <h2 className={styles.headline} data-headline-line>
            {t.hardware.headline}
          </h2>
          <p className={styles.support} data-reveal>
            {t.hardware.support}
          </p>
        </div>

        {/* Workshop image is decorative: the adjacent copy provides the
            section's meaning, while the accent planes retain the stage depth. */}
        <figure
          className={styles.hardwareStage}
          aria-hidden="true"
          data-reveal-stage
        >
          <div className={styles.stageAccentBack} data-stage-plane="back" />
          <div className={styles.mediaLayer} data-stage-plane="mid">
            <img
              className={styles.mediaImage}
              src={hardwareWorkshopBuild}
              alt=""
            />
            <span className={styles.stageGuide} aria-hidden="true" />
            <span className={styles.stageCorner} aria-hidden="true" />
            <span className={styles.stageCornerEnd} aria-hidden="true" />
          </div>
          <div className={styles.stageAccentFront} data-stage-plane="front" />
        </figure>

        <ul className={styles.beats}>
          {beats.map((beat) => (
            <li key={beat.index} className={styles.beat} data-reveal>
              <p className={styles.beatMeta}>
                <span className={styles.beatIndex}>{beat.index}</span>
                <span className={styles.beatLabel}>{beat.label}</span>
              </p>
              <p className={styles.beatDescription}>{beat.description}</p>
            </li>
          ))}
        </ul>

        <p className={styles.tags} data-reveal>
          {t.hardware.tags}
        </p>
      </div>

      {/* Hardware → Content Universe transition: same hairline motif used
          at every prior section boundary, picked up by Content Universe's
          matching top seam (see ContentUniverse.module.css's .seam).
          Purely additive — nothing else in the approved Hardware
          composition changes. */}
      <span className={styles.seamEnd} aria-hidden="true" />
    </section>
  )
}

export default Hardware
