import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import portrait from '../../assets/hero/carter-hero-portrait-cutout.webp'
import { CHANNELS } from '../../data/channels'
import { HERO_STATS, HERO_TILES } from '../../data/hero'
import styles from './Hero.module.css'

interface HeroProps {
  /** True once the Intro is done (or was skipped) and Hero should reveal. */
  ready: boolean
}

const REVEAL_SELECTOR =
  '[data-reveal], [data-headline-line], [data-stage], [data-about], [data-stats]'

/**
 * Hero — a recreation of the approved reference composition. The
 * reference image is the visual source of truth for this section: nav bar,
 * eyebrow, "Built / Different." headline, three-line support, twin CTAs,
 * Carter portrait region, environmental disc, About Carter card, By The
 * Numbers card, three lower content tiles, and the row at the foot, in the
 * reference's positions and proportions.
 *
 * One reference element remains deliberately omitted: its "Featured in"
 * wordmark row (see the FACTUAL-INTEGRITY note that follows). The left
 * left editorial rail and its "01 /06" marker are intentionally omitted;
 * the six top-level editorial sections remain in the page structure.
 *
 * FACTUAL-INTEGRITY DEVIATIONS (the only intentional ones):
 * - The By The Numbers card keeps the reference's container geometry but
 *   carries dated public-tracker statistics (see data/hero.ts's HERO_STATS
 *   provenance note), never the concept image's illustrative 1.2M+ / 100M+ / 4K+.
 * - The reference's "Featured in" wordmark row is NOT reproduced. It has
 *   been replaced by the real channel row (see data/channels.ts for the
 *   full reasoning): the same quiet full-width beat at the composition's
 *   foot, but carrying three destinations a visitor can actually open
 *   instead of six publication names this project cannot support.
 * - The reference's avatar row and cross-platform audience claim are omitted:
 *   they are illustrative social proof, not verified audience evidence.
 *
 * PORTRAIT MEDIA
 * The supplied asset is used as-is — nothing is scraped, generated, or
 * retouched. `src/assets/hero/carter-hero-portrait.png` is preserved
 * unchanged as the source; the production asset is a non-destructive
 * derivative (cropped to the subject's alpha bounds, re-encoded to
 * WebP). No pixel of the person is altered: the supplied PNG already
 * carried a clean alpha channel, so no background-removal pass — and no
 * AI alteration — was applied to the figure.
 *
 * Geometry is derived from the reference: cap top, chin and head centre
 * are matched to the reference's landmarks, the figure runs behind the
 * By The Numbers card and the lower tiles, and the lower torso is
 * dissolved by a CSS mask rather than cut. Layer order (see the CSS)
 * puts the environmental disc behind the portrait and the cards and
 * tiles in front of it.
 *
 * ACCESSIBILITY
 * Visible headline lines are aria-hidden; the h1 carries the accessible
 * name "CarterPCs — Built Different". The portrait is editorial media
 * whose subject the h1 already names, so it carries alt="" rather than
 * duplicating that for screen readers. The environmental layers are
 * aria-hidden. Every control is a real link: the two CTAs and the three
 * tiles to real sections, the channel row to the real channels.
 */

// HERO_TILES (lower content tiles) and HERO_STATS (By The Numbers card,
// including its public-tracker source and rounding-direction notes) live in
// data/hero.ts — the same structure-vs-dictionary-copy split data/channels.ts
// uses for the channel row below.

function Hero({ ready }: HeroProps) {
  const reducedMotion = useReducedMotion()
  const { t } = usePreferences()
  const rootRef = useRef<HTMLElement>(null)

  const statLines = HERO_STATS.map(({ value, label }) => ({
    value,
    label: t.hero.stats[label],
  }))

  useLayoutEffect(() => {
    if (!ready) {
      return
    }

    if (reducedMotion) {
      gsap.set(REVEAL_SELECTOR, { clearProps: 'all' })
      return
    }

    const ctx = gsap.context(() => {
      // Entrance — heavily overlapped so it reads cinematic, and every
      // element settles exactly onto the reference composition.
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-stage]', {
          opacity: 0,
          scale: 1.04,
          duration: 1.05,
          ease: 'power2.out',
        })
        .from(
          '[data-reveal="eyebrow"]',
          { opacity: 0, y: 10, duration: 0.5 },
          0.05,
        )
        // Masked vertical reveal: each line rises out of its own clip box.
        .fromTo(
          '[data-headline-line]',
          { yPercent: 110 },
          { yPercent: 0, duration: 0.78, stagger: 0.07, ease: 'power4.out' },
          0.12,
        )
        .from(
          '[data-reveal="support"]',
          { opacity: 0, y: 10, duration: 0.5 },
          0.48,
        )
        .from(
          '[data-reveal="actions"]',
          { opacity: 0, y: 10, duration: 0.45 },
          0.58,
        )
        .from('[data-about]', { opacity: 0, y: 14, duration: 0.55 }, 0.62)
        .from('[data-stats]', { opacity: 0, y: 14, duration: 0.55 }, 0.68)
        .from(
          '[data-reveal="tiles"]',
          { opacity: 0, y: 16, duration: 0.6 },
          0.72,
        )
        .from('[data-reveal="strip"]', { opacity: 0, duration: 0.5 }, 0.85)

      // Scroll depth — a few pixels of differential drift, desktop only.
      // Restrained so the resting frame stays the reference composition;
      // the Hero is never pinned, so the handoff into Creator stays an
      // ordinary, uninterrupted scroll.
      ScrollTrigger.matchMedia({
        // Matches the CSS breakpoint where the absolute reference
        // composition engages — the stacked flow below it never drifts.
        '(min-width: 1240px)': () => {
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: rootRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
                invalidateOnRefresh: true,
              },
            })
            .to('[data-stage]', { y: 44 }, 0)
            .to('[data-headline]', { y: -30 }, 0)
            .to('[data-about]', { y: 16 }, 0)
            .to('[data-stats]', { y: 22 }, 0)

        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [ready, reducedMotion])

  return (
    <section id="hero" className={styles.hero} ref={rootRef}>
      {/* 0 — Environmental light wash. Full-bleed, decorative. */}
      <div className={styles.env} aria-hidden="true" />

      {/* Shared ~1536px composition canvas: every major element below is
          positioned against this one centred frame, so wide viewports
          never spread the composition apart. */}
      <div className={styles.canvas}>
        {/* Environmental disc — canvas-locked so it stays behind Carter
            at every viewport width. Decorative. */}
        <span className={styles.envDisc} aria-hidden="true" />

        {/* 1 — Carter portrait. Sits in front of the environmental disc
            and behind the cards and lower tiles (see the CSS layers). */}
        <div className={styles.stage} data-stage>
          <img
            className={styles.media}
            src={portrait}
            alt=""
            width={1018}
            height={897}
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
        </div>

        {/* 2 — Type column */}
        <div className={styles.inner}>
          <p className={styles.eyebrow} data-reveal="eyebrow">
            <span>{t.hero.eyebrow}</span>
            <span className={styles.eyebrowDot} aria-hidden="true" />
          </p>

          {/* The two visible lines stay aria-hidden in every language; the
            h1's accessible name is the dictionary's own translated
            equivalent of "CarterPCs — Built Different". */}
          <h1
            className={styles.headline}
            aria-label={t.hero.headlineLabel}
            data-headline
          >
            <span className={styles.lineMask} aria-hidden="true">
              <span className={styles.line} data-headline-line>
                {t.hero.headlineLineOne}
              </span>
            </span>
            <span className={styles.lineMask} aria-hidden="true">
              <span className={styles.line} data-headline-line>
                {t.hero.headlineLineTwo}
                <span className={styles.period}>.</span>
              </span>
            </span>
          </h1>

          {/* Approved copy (CONTENT.md §Hero) shaped to the reference's
            three-line support block. */}
          <p className={styles.support} data-reveal="support">
            {t.hero.support}
          </p>

          <div className={styles.actions} data-reveal="actions">
            <a
              className={`${styles.cta} ${styles.ctaPrimary}`}
              href="#content-universe"
            >
              {t.hero.ctaPrimary}
              <span className={styles.ctaBadge} aria-hidden="true">
                →
              </span>
            </a>
            {/* No reel exists yet — routes to the selected-work sequence,
              keeping the reference's visual treatment. */}
            <a
              className={`${styles.cta} ${styles.ctaSecondary}`}
              href="#featured"
            >
              {t.hero.ctaSecondary}
              <span className={styles.play} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* 3 — Right card rail. One column on desktop so the two cards
            space themselves and can never collide as the viewport
            height compresses; dissolves on mobile (display: contents). */}
        <div className={styles.cards}>
          {/* About Carter card */}
          <aside className={styles.about} data-about>
            <p className={styles.cardMeta}>
              <span className={styles.cardIndex}>01</span>
              <span>{t.hero.aboutTitle}</span>
            </p>
            {/* User-supplied preferred positioning copy (2026-08). */}
            <p className={styles.aboutText}>{t.hero.aboutText}</p>
            <a className={styles.aboutLink} href="#creator">
              {t.hero.aboutLink}
              <span className={styles.aboutArrow} aria-hidden="true">
                ↗
              </span>
            </a>
          </aside>

          {/* 4 — By The Numbers card: reference geometry, dated
          public-tracker statistics (see data/hero.ts's HERO_STATS). */}
          <aside className={styles.stats} data-stats>
            <p className={styles.cardMeta}>
              <span>{t.hero.statsTitle}</span>
              <span className={styles.cardIndex}>02</span>
            </p>
            <ul className={styles.statsList}>
              {statLines.map(({ value, label }) => (
                <li key={label} className={styles.stat}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </li>
              ))}
            </ul>
            <p className={styles.statsSource}>{t.hero.statsSource}</p>
          </aside>
        </div>

        {/* 5 — Lower rail: three content tiles + Featured-In strip */}
        <div className={styles.lower}>
          <div className={styles.tiles} data-reveal="tiles">
            {HERO_TILES.map(({ index, copy, href, media }) => (
              <a key={index} className={styles.tile} href={href}>
                {/* Temporary reference asset (see data/hero.ts's HERO_TILES
                  provenance note); decorative — the tile's text names the
                  destination. */}
                <img
                  className={styles.tileMedia}
                  src={media}
                  alt=""
                  width={208}
                  height={168}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <span className={styles.tileBody}>
                  <span className={styles.tileIndex}>{index}</span>
                  <span className={styles.tileTitle}>
                    {t.hero.tiles[copy].title}
                  </span>
                  <span className={styles.tileText}>
                    {t.hero.tiles[copy].body}
                  </span>
                </span>
                <span className={styles.tileArrow} aria-hidden="true">
                  →
                </span>
              </a>
            ))}
          </div>

          {/* Channel row — occupies the same quiet full-width beat the
              reference's "Featured in" wordmark row held, but every entry
              here is a real destination the visitor can open and check
              (see data/channels.ts for why the wordmark row could not
              stay). It is NOT aria-hidden: unlike the row it replaces,
              this one is real, so hiding it from assistive tech would
              withhold three working links rather than suppress a claim.
              The disclaimer below is unchanged and still carries the
              unofficial/non-affiliation message. */}
          <div className={styles.strip} data-reveal="strip">
            <span className={styles.stripLabel} aria-hidden="true">
              {t.hero.channelsLabel}
            </span>
            <ul className={styles.stripSlots} aria-label={t.hero.channelsLabel}>
              {CHANNELS.map(({ name, href }) => (
                <li key={name} className={styles.stripSlot}>
                  <a
                    className={styles.stripLink}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${name} — ${t.footer.a11y.opensInNewTab}`}
                  >
                    {name}
                    <span className={styles.stripArrow} aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* The metrics source sits beneath its figures; this note keeps
              the separate non-affiliation statement with the lower rail. */}
          <p className={styles.disclaimer}>{t.hero.disclaimer}</p>
        </div>
      </div>

      {/* Hero → Creator transition: picked up by Creator's matching top
          seam (see Creator.module.css's .seam) so the section boundary
          reads as one hairline crossed, not a hard cut. */}
      <span className={styles.seam} aria-hidden="true" />
    </section>
  )
}

export default Hero
