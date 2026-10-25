import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  gsap,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import { getHardwareBeats } from '../../data/hardware'
import hardwareCreatorBuild from '../../assets/hardware/hardware-creator-build.webp'
import styles from './Hardware.module.css'

function BeatIcon({ index }: { index: string }) {
  const icon = {
    '01': (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4.3 7.7 7.7 4.4 7.7-4.4M12 12v9" />
      </>
    ),
    '02': (
      <>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 2v4m6-4v4m-6 12v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" />
      </>
    ),
    '03': (
      <>
        <path d="M4 20V11m5 9V5m5 15v-7m5 7V8" />
        <path d="M2 20h20" />
      </>
    ),
  }[index]

  return (
    <span className={styles.beatIcon} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
    </span>
  )
}

/**
 * Hardware Experience: the section shifts from the creator's stories
 * (Featured) to the PC hardware behind them. A restrained split editorial
 * composition keeps the copy and a single wide creator-workshop image
 * together, with the three existing translated beats below.
 *
 * Copy: headline/support/beat text is original editorial development
 * language grounded in RESEARCH.md §7's "Custom PCs vs. Overpriced
 * Prebuilts" theme (value-oriented, hands-on, unfiltered tone) and
 * CONTENT.md §Hardware Sequence's category list — see data/hardware.ts's
 * top comment for the full sourcing note. No specs, benchmarks, prices, or
 * quotes are used anywhere.
 *
 * Motion: a short entrance reveal for the headline, image, beats, and tags.
 * It runs once when the section enters view and is skipped for reduced motion.
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
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="hardware" className={styles.hardware} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

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

        {/* Decorative, AI-generated illustrative media (not a verified photo
            of Carter). The adjacent heading and copy carry the meaning. */}
        <figure
          className={styles.hardwareStage}
          aria-hidden="true"
          data-reveal-stage
        >
          <img
            className={styles.mediaImage}
            src={hardwareCreatorBuild}
            alt=""
          />
        </figure>

        <ul className={styles.beats}>
          {beats.map((beat) => (
            <li key={beat.index} className={styles.beat} data-reveal>
              <p className={styles.beatMeta}>
                <span className={styles.beatIndex}>{beat.index}</span>
                <span className={styles.beatLabel}>{beat.label}</span>
              </p>
              <div className={styles.beatDetail}>
                <BeatIcon index={beat.index} />
                <p className={styles.beatDescription}>{beat.description}</p>
              </div>
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
