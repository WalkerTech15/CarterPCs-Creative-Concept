import type { RefObject } from 'react'
import { usePreferences } from '../../app/Preferences'
import type { FeaturedStory } from '../../data/types'
import { playerSrc } from './featured.utils'
import styles from './Featured.media.module.css'

/**
 * Media frame: a 9:16 card, because that is the shape of the thing. The poster
 * is a 1280x720 YouTube thumbnail whose real portrait frame is the centre
 * 31.6% of its width, so a 9:16 box with object-fit: cover shows precisely
 * that column and crops away only YouTube's blurred filler bars.
 *
 * CLICK TO PLAY, NOTHING BEFORE THAT
 * The page loads ZERO YouTube iframes: every panel starts as a local poster
 * image plus a real <button>, and the iframe for one story is created only
 * when that story's button is pressed. Three always-mounted embeds meant three
 * third-party connections, three player bundles and three sets of YouTube
 * chrome on first paint, on a section most visitors scroll past. Which story
 * is playing — and the rule that only one can be — is owned by
 * useFeaturedPlayer; this component only renders the state it is given.
 *
 * The embed is the privacy-enhanced youtube-nocookie.com host, and the player
 * lives inside this 9:16 frame — never stretched across the panel, where it
 * used to sit at inset: 0 and cover the headline.
 */
function FeaturedMedia({
  story,
  title,
  isPlaying,
  reducedMotion,
  onPlay,
  onClose,
  playButtonRef,
  closeButtonRef,
}: {
  story: FeaturedStory
  title: string
  isPlaying: boolean
  reducedMotion: boolean
  onPlay: () => void
  onClose: () => void
  playButtonRef: (node: HTMLButtonElement | null) => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
}) {
  const { t } = usePreferences()

  return (
    <div className={styles.mediaFrame} data-media-frame>
      {isPlaying ? (
        <>
          <iframe
            className={styles.player}
            src={playerSrc(story.embedUrl, reducedMotion)}
            title={`${t.featured.a11y.player} — ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <button
            type="button"
            ref={closeButtonRef}
            className={styles.close}
            onClick={onClose}
            aria-label={`${t.featured.closePlayer} — ${title}`}
          >
            <span aria-hidden="true">✕</span>
            {t.featured.closePlayer}
          </button>
        </>
      ) : (
        <>
          <img
            className={styles.poster}
            src={story.thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <button
            type="button"
            ref={playButtonRef}
            className={styles.play}
            onClick={onPlay}
            aria-label={`${t.featured.playShort} — ${title}`}
          >
            <span className={styles.playIcon} aria-hidden="true" />
            <span className={styles.playLabel}>{t.featured.playShort}</span>
          </button>
        </>
      )}
    </div>
  )
}

export default FeaturedMedia
