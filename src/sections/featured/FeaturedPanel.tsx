import type { FeaturedStory } from '../../data/types'
import FeaturedActionRail from './FeaturedActionRail'
import FeaturedMedia from './FeaturedMedia'
import FeaturedProgress from './FeaturedProgress'
import { storyTitle } from './featured.utils'
import type { FeaturedActions } from './useFeaturedActions'
import type { FeaturedPlayer } from './useFeaturedPlayer'
import styles from './Featured.module.css'

/**
 * One story: decorative stage, the Short and its action rail, the copy
 * column, and the sequence position. Stacked below 1024px; a full-bleed 100vw
 * panel of the pinned horizontal sequence above it (see Featured.module.css).
 */
function FeaturedPanel({
  story,
  stories,
  activeIndex,
  reducedMotion,
  player,
  actions,
}: {
  story: FeaturedStory
  stories: FeaturedStory[]
  activeIndex: number
  reducedMotion: boolean
  player: FeaturedPlayer
  actions: FeaturedActions
}) {
  const title = storyTitle(story)
  const notice =
    actions.shareNotice?.id === story.index ? actions.shareNotice : null

  return (
    <article className={styles.panel} data-panel data-variant={story.variant}>
      {/* Decoration only — gradient field, framing marks and the
        environmental numeral. The media itself is FeaturedMedia's frame
        below, which is why this whole layer is aria-hidden. */}
      <div className={styles.panelStage} aria-hidden="true">
        <div className={styles.panelStageSurface}>
          <span className={styles.panelGuide} />
          <span className={styles.panelCorner} />
          <span className={styles.panelCornerEnd} />
        </div>
        <span className={styles.panelNumeral}>{story.index}</span>
      </div>

      {/* Nothing is requested from YouTube until the Play button is pressed:
        on first paint this is a local image and a button, and there is no
        iframe in the document at all. */}
      <div className={styles.media}>
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

        <FeaturedActionRail
          story={story}
          title={title}
          isLiked={actions.likedIds.has(story.index)}
          notice={notice}
          onToggleLike={() => actions.toggleLike(story.index)}
          onShare={() => {
            void actions.shareStory(story.index, title, story.videoUrl)
          }}
        />
      </div>

      <div className={styles.panelContent} data-panel-content>
        <p className={styles.panelIndex}>{story.category}</p>
        {/* Keyed by position, not by text: a translated headline may
          legitimately repeat a word across its three lines, and a text key
          would then collide. */}
        <h3 className={styles.panelHeadline}>
          {story.headlineLines.map((line, lineIndex) => (
            <span
              key={`${story.index}-${lineIndex}`}
              className={styles.panelLine}
            >
              {line}
            </span>
          ))}
        </h3>
        <p className={styles.panelSupport}>{story.support}</p>
        <p className={styles.panelTags}>{story.tags.join(' — ')}</p>
        {/* The external link that used to close this column now lives in the
          rail as "Watch on YouTube". Leaving both would have put the same
          destination on the panel twice, and this column is now purely read,
          never operated — which also removes the one place where the tab
          order and the mobile reading order disagreed. */}
      </div>

      <FeaturedProgress stories={stories} activeIndex={activeIndex} />
    </article>
  )
}

export default FeaturedPanel
