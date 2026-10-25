import type { FeaturedStory } from '../../data/types'
import styles from './Featured.progress.module.css'

/** A quiet, section-level index echoing the three stories' editorial order. */
function FeaturedProgress({ stories }: { stories: FeaturedStory[] }) {
  return (
    <div className={styles.progress} aria-hidden="true">
      {stories.map((story, index) => (
        <div className={styles.progressItem} key={story.index}>
          <span
            className={`${styles.progressLine} ${index === 0 ? styles.progressLineActive : ''}`}
          />
          <span className={styles.progressLabel}>
            <span>{story.index}</span>
            <span>{story.category}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export default FeaturedProgress
