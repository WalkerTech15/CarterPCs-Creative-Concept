import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import studio from '../../assets/hero/hero-techno-insider.webp'
import { HERO_STATS, HERO_TILES } from '../../data/hero'
import { CHANNELS } from '../../data/channels'
import { ChannelIcon } from '../../components/footer/ChannelIcon'
import styles from './Hero.module.css'

interface HeroProps {
  ready: boolean
}

/** Approved studio composition with live, accessible text and links. */
function Hero({ ready }: HeroProps) {
  const reducedMotion = useReducedMotion()
  const { t } = usePreferences()
  const rootRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (!ready || reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-reveal]', {
        opacity: 0,
        y: 12,
        duration: 0.65,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'all',
      })
    }, rootRef)
    return () => ctx.revert()
  }, [ready, reducedMotion])

  return (
    <section id="hero" className={styles.hero} ref={rootRef}>
      <figure className={styles.stage} aria-describedby="hero-image-disclosure">
        <img
          className={styles.media}
          src={studio}
          alt=""
          width={1506}
          height={1045}
          fetchPriority="high"
          decoding="async"
          draggable={false}
        />
      </figure>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.canvas}>
        <div className={styles.overview}>
          <div className={styles.inner}>
            <p className={styles.eyebrow} data-hero-reveal>
              {t.hero.eyebrow}
            </p>
            <h1
              className={styles.headline}
              aria-label={t.hero.headlineLabel}
              data-hero-reveal
            >
              <span aria-hidden="true">{t.hero.headlineLineOne}</span>
              <span aria-hidden="true">{t.hero.headlineLineTwo}.</span>
            </h1>
            <p className={styles.support} data-hero-reveal>
              {t.hero.support}
            </p>
            <div className={styles.actions} data-hero-reveal>
              <a
                className={`${styles.cta} ${styles.ctaPrimary}`}
                href="#content-universe"
              >
                {t.hero.ctaPrimary}
                <span className={styles.ctaBadge} aria-hidden="true">
                  →
                </span>
              </a>
              <a
                className={`${styles.cta} ${styles.ctaSecondary}`}
                href="#featured"
              >
                {t.hero.ctaSecondary}
                <span className={styles.play} aria-hidden="true" />
              </a>
            </div>
          </div>
          <aside
            className={styles.facts}
            aria-label={t.hero.aboutTitle}
            data-hero-reveal
          >
            <div className={styles.factCard}>
              <h2>
                <span className={styles.factIndex} aria-hidden="true">
                  01
                </span>{' '}
                {t.hero.aboutTitle}
              </h2>
              <p>{t.hero.aboutText}</p>
              <a href="#creator">
                {t.hero.aboutLink} <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className={styles.factCard}>
              <h2>
                {t.hero.statsTitle}{' '}
                <span className={styles.factIndex} aria-hidden="true">
                  02
                </span>
              </h2>
              <dl className={styles.stats}>
                {HERO_STATS.map(({ value, label }) => (
                  <div key={label}>
                    <dt>{t.hero.stats[label]}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.statsSource}>{t.hero.statsSource}</p>
            </div>
          </aside>
        </div>
        <div className={styles.tiles} data-hero-reveal>
          {HERO_TILES.map(({ index, copy, href, media }) => (
            <a key={index} className={styles.tile} href={href}>
              <img
                className={styles.tileMedia}
                src={media}
                alt=""
                width={232}
                height={187}
                decoding="async"
                draggable={false}
              />
              <span className={styles.tileBody}>
                <span className={styles.tileIndex} aria-hidden="true">
                  {index}
                </span>
                <span className={styles.tileTitle}>
                  {t.hero.tiles[copy].title}
                </span>
                <span className={styles.tileDescription}>
                  {t.hero.tiles[copy].body}
                </span>
              </span>
              <span className={styles.tileArrow} aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
        <div className={styles.channels}>
          <span>{t.hero.channelsLabel}</span>
          <ul>
            {CHANNELS.map(({ name, href }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${name} — ${t.footer.a11y.opensInNewTab}`}
                >
                  <ChannelIcon name={name} />
                  {name} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.disclosures}>
          <p>{t.hero.disclaimer}</p>
          <p id="hero-image-disclosure">{t.hero.imageDisclosure}</p>
        </div>
      </div>
    </section>
  )
}
export default Hero
