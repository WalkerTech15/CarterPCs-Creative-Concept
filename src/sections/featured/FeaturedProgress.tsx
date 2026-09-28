import type { FeaturedStory } from '../../data/types'
import styles from './Featured.progress.module.css'

/**
 * Sequence position — one per panel, not one for the section. It reads as the
 * bottom line of this story's text column, so it has to be anchored to that
 * column's left edge; a single viewport-fixed indicator agrees with that edge
 * only while the rail is exactly on a panel, and was measured up to 960px out
 * of line mid-travel. Inside the panel it is aligned by construction, at every
 * position, because it shares the panel's own padding.
 *
 * Rendered OUTSIDE [data-panel-content]: that block is faded and lifted as its
 * panel enters and leaves, and the position indicator should stay legible
 * through the transition rather than dissolving with the copy.
 *
 * Decorative, hence aria-hidden: it restates `activeIndex`, which is derived
 * from scroll position, and a screen-reader visitor is reading the panels in
 * document order rather than scrubbing a rail.
 *
 * A second copy of those three positions used to be drawn vertically at the
 * far right, to fill the panel's empty right margin. It is gone: by its own
 * description it restated this indicator, which itself restates scroll
 * position, so the panel carried the same one fact three times. The margin is
 * left empty on purpose — an empty margin in an editorial layout is a measure,
 * not a gap to fill, and the panel now has exactly one progress indicator.
 */
function FeaturedProgress({
  stories,
  activeIndex,
}: {
  stories: FeaturedStory[]
  activeIndex: number
}) {
  return (
    <div className={styles.progress} aria-hidden="true">
      {stories.map((other, i) => (
        <span
          key={other.index}
          className={
            i === activeIndex
              ? `${styles.tick} ${styles.tickActive}`
              : styles.tick
          }
        />
      ))}
    </div>
  )
}

export default FeaturedProgress
