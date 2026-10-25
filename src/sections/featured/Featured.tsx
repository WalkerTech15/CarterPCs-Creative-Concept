import { useMemo, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import { getFeaturedStories } from '../../data/featured'
import FeaturedPanel from './FeaturedPanel'
import FeaturedProgress from './FeaturedProgress'
import { useFeaturedActions } from './useFeaturedActions'
import { useFeaturedPlayer } from './useFeaturedPlayer'
import { useFeaturedIntro } from './useFeaturedIntro'
import styles from './Featured.module.css'

/**
 * Featured Content, per ARCHITECTURE.md's Section 4 spec: "showcase a small
 * set of standout content pieces as large editorial stories, not a video
 * grid." Narrative pacing steps up here on purpose — Hero (dramatic) →
 * Creator (calm editorial pause) → Featured (dynamic showcase) — expressed
 * through punchier story typography and an asymmetric lead/supporting layout,
 * not through a "transition effect" bolted on for spectacle.
 *
 * Layout is CSS-first and remains a natural vertical page scroll at every
 * width. One story leads; the other two sit beside it on wide screens and
 * follow it on smaller screens.
 *
 * Content status: `data/featured.ts` documents in full why every panel's copy
 * is what it is — see that file's top comment before editing panel copy.
 *
 * WHERE THINGS LIVE
 *  - FeaturedPanel.tsx        one story: copy, portrait media, and actions
 *  - FeaturedMedia.tsx        poster ⇄ player swap inside the 9:16 frame
 *  - FeaturedActionRail.tsx   Like / Comments / Share / Watch
 *  - FeaturedProgress.tsx     quiet horizontal story index
 *  - useFeaturedPlayer.ts     one player at a time, Escape, focus restoration
 *  - useFeaturedActions.ts    local likes, share + its live-region notice
 *  - useFeaturedIntro.ts      GSAP: restrained section-entry reveal
 *  - featured.utils.ts        pure helpers (titles, embed src, share)
 *  - Featured*.module.css     base/panel layout, media, rail, progress
 */
function Featured() {
  const reducedMotion = useReducedMotion()
  const { t, language } = usePreferences()
  const stories = useMemo(() => getFeaturedStories(language), [language])
  const rootRef = useRef<HTMLElement>(null)

  const player = useFeaturedPlayer()
  const actions = useFeaturedActions()

  useFeaturedIntro({ rootRef, reducedMotion })

  return (
    <section id="featured" className={styles.featured} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.intro}>
        <div className={styles.headingGroup}>
          <p className={styles.meta} data-intro-reveal>
            <span>{t.featured.metaLabel}</span>
          </p>
          <h2 className={styles.title} data-intro-line>
            {t.featured.title}
          </h2>
        </div>
        <p className={styles.metaNote} data-intro-reveal>
          {t.featured.metaNote}
        </p>
      </div>

      <div className={styles.storyGrid}>
        {stories.map((story, index) => (
          <FeaturedPanel
            key={story.index}
            story={story}
            featured={index === 0}
            reducedMotion={reducedMotion}
            player={player}
            actions={actions}
          />
        ))}
      </div>

      <div className={styles.progressWrap}>
        <FeaturedProgress stories={stories} />
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
