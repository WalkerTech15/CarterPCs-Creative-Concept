import { useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import { getFeaturedStories } from '../../data/featured'
import FeaturedPanel from './FeaturedPanel'
import { useFeaturedActions } from './useFeaturedActions'
import { useFeaturedPlayer } from './useFeaturedPlayer'
import { useFeaturedSequence } from './useFeaturedSequence'
import styles from './Featured.module.css'

/**
 * Featured Content, per ARCHITECTURE.md's Section 4 spec: "showcase a small
 * set of standout content pieces as large editorial stories, not a video
 * grid." Narrative pacing steps up here on purpose — Hero (dramatic) →
 * Creator (calm editorial pause) → Featured (dynamic showcase) — expressed
 * through punchier multi-line headlines, richer color balance per panel, and
 * (desktop only) the site's first horizontal-motion sequence, not through a
 * "transition effect" bolted on for spectacle.
 *
 * Layout is CSS-first, JS-enhanced: below 1024px (and under reduced motion at
 * any width) the stories are a plain vertical stack; above it, full-bleed
 * panels in a horizontal track that useFeaturedSequence pins and scrubs.
 *
 * Content status: `data/featured.ts` documents in full why every panel's copy
 * is what it is — see that file's top comment before editing panel copy.
 *
 * WHERE THINGS LIVE
 *  - FeaturedPanel.tsx        one story: stage, media + rail, copy, progress
 *  - FeaturedMedia.tsx        poster ⇄ player swap inside the 9:16 frame
 *  - FeaturedActionRail.tsx   Like / Comments / Share / Watch
 *  - FeaturedProgress.tsx     per-panel sequence position
 *  - useFeaturedPlayer.ts     one player at a time, Escape, focus restoration
 *  - useFeaturedActions.ts    local likes, share + its live-region notice
 *  - useFeaturedSequence.ts   GSAP: intro wipe, desktop pin/scrub/snap, copy fade
 *  - featured.utils.ts        pure helpers (titles, embed src, fade math, share)
 *  - Featured*.module.css     base/panel layout, media, rail, progress
 */
function Featured() {
  const reducedMotion = useReducedMotion()
  const { t, language } = usePreferences()
  const stories = useMemo(() => getFeaturedStories(language), [language])
  const rootRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const player = useFeaturedPlayer()
  const actions = useFeaturedActions()

  useFeaturedSequence({
    rootRef,
    trackRef,
    railRef,
    reducedMotion,
    onActiveIndexChange: setActiveIndex,
  })

  return (
    <section id="featured" className={styles.featured} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.intro}>
        <p className={styles.meta} data-intro-reveal>
          <span>{t.featured.metaLabel}</span>
          <span className={styles.metaRule} aria-hidden="true" />
          <span>{t.featured.metaNote}</span>
        </p>
        <h2 className={styles.title} data-intro-line>
          {t.featured.title}
        </h2>
      </div>

      <div className={styles.track} ref={trackRef}>
        <div className={styles.rail} ref={railRef}>
          {stories.map((story) => (
            <FeaturedPanel
              key={story.index}
              story={story}
              stories={stories}
              activeIndex={activeIndex}
              reducedMotion={reducedMotion}
              player={player}
              actions={actions}
            />
          ))}
        </div>
      </div>

      {/* Featured → Hardware transition: same minimal hairline-seam motif
          used at every prior section boundary, picked up by Hardware's
          matching top seam (see Hardware.module.css's .seam). Purely
          additive — nothing else in the approved Featured composition
          changes. */}
      <span className={styles.seamEnd} aria-hidden="true" />
    </section>
  )
}

export default Featured
