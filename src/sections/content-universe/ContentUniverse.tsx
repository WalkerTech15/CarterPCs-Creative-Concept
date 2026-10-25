import { useMemo } from 'react'
import { usePreferences } from '../../app/Preferences'
import { getContentCategories } from '../../data/contentUniverse'
import { getFeaturedStories } from '../../data/featured'
import styles from './ContentUniverse.module.css'

/** Six coexisting content territories, led by the two categories with real
 * Shorts and followed by four concise editorial summaries. */
function ContentUniverse() {
  const { t, language } = usePreferences()

  // IDs and tiers stay language-independent so the layout targets the same
  // categories in every locale.
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

  return (
    <section id="content-universe" className={styles.contentUniverse}>
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.canvas}>
        <div className={styles.intro}>
          <p className={styles.meta}>
            <span>{t.contentUniverse.metaLabel}</span>
            <span className={styles.metaRule} aria-hidden="true" />
            <span>{t.contentUniverse.metaNote}</span>
          </p>
          <p className={styles.kicker}>{t.contentUniverse.kicker}</p>
          <h2 className={styles.headline}>{t.contentUniverse.headline}</h2>
          <p className={styles.support}>{t.contentUniverse.support}</p>
        </div>

        <div className={styles.field}>
          {/* Subtle section numeral, decorative only. */}
          <span className={styles.digitZero} aria-hidden="true">
            0
          </span>
          <span className={styles.digitFive} aria-hidden="true">
            5
          </span>

          {/* Retain a quiet guide line when the field becomes a phone stack. */}
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
                <p className={styles.entryDescription}>
                  {category.description}
                </p>
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
                <p className={styles.entryDescription}>
                  {category.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <p className={styles.index}>
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
