import type { FeaturedStory } from '../../data/types'
import FeaturedActionRail from './FeaturedActionRail'
import FeaturedMedia from './FeaturedMedia'
import { storyTitle } from './featured.utils'
import type { FeaturedActions } from './useFeaturedActions'
import type { FeaturedPlayer } from './useFeaturedPlayer'
import styles from './Featured.module.css'

/**
 * One story in the Selected Stories composition. The lead gets the larger
 * image-and-copy treatment; supporting stories remain complete, playable
 * articles with their own action rail.
 */
function FeaturedPanel({
  story,
  featured,
  reducedMotion,
  player,
  actions,
}: {
  story: FeaturedStory
  featured: boolean
  reducedMotion: boolean
  player: FeaturedPlayer
  actions: FeaturedActions
}) {
  const title = storyTitle(story)
  const notice =
    actions.shareNotice?.id === story.index ? actions.shareNotice : null

  return (
    <article
      id={`featured-story-${story.index}`}
      className={`${styles.panel} ${featured ? styles.panelFeatured : styles.panelSupporting}`}
      data-panel
      data-story-reveal
      data-featured={featured || undefined}
      data-variant={story.variant}
    >
      <div
        className={`${styles.panelCopy} ${featured ? styles.panelCopyFeatured : ''}`}
      >
        <div className={styles.panelContent} data-panel-content>
          <p
            className={styles.panelIndex}
          >{`${story.index} — ${story.category}`}</p>
          <h3 className={styles.panelHeadline}>{title}</h3>
          <p className={styles.panelSupport}>{story.support}</p>
          <p className={styles.panelTags}>{story.tags.join(' — ')}</p>
        </div>

        <FeaturedActionRail
          story={story}
          title={title}
          isLiked={actions.likedIds.has(story.index)}
          notice={notice}
          onToggleLike={() => actions.toggleLike(story.index)}
          onShare={() => {
            void actions.shareStory(story.index, title, story.videoUrl)
          }}
          layout={featured ? 'featured' : 'supporting'}
        />
      </div>

      {/* No YouTube request is made until Play is pressed. */}
      <div
        className={`${styles.media} ${featured ? styles.mediaFeatured : styles.mediaSupporting}`}
      >
        <FeaturedMedia
          story={story}
          title={title}
          isPlaying={player.playingId === story.index}
          reducedMotion={reducedMotion}
          onPlay={() => player.openPlayer(story.index)}
          onClose={player.closePlayer}
          playButtonRef={(node) => {
            player.registerPlayButton(story.index, node)
          }}
          closeButtonRef={player.closeButtonRef}
        />
      </div>
    </article>
  )
}

export default FeaturedPanel
