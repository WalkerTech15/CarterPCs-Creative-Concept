import { usePreferences } from '../../app/Preferences'
import type { FeaturedStory } from '../../data/types'
import type { ShareNotice } from './featured.types'
import styles from './Featured.rail.module.css'

/**
 * Action-rail glyphs. Drawn here rather than imported so they inherit
 * `currentColor` and the rail's own sizing, and so nothing in this section
 * reaches for a third-party icon font. All four are presentational — every
 * control they sit in carries its own text label and accessible name — hence
 * aria-hidden and focusable="false" (IE-era SVGs are focusable by default in
 * some ATs, and a focus stop on a decorative glyph is a dead key press).
 *
 * Deliberately NOT a YouTube mark: the fourth action leaves for YouTube, but
 * it says so in words and points there with a generic "leaves this page"
 * glyph. Reproducing the platform's logo would be borrowing its identity for
 * a concept site that has no relationship with it.
 */
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false as const,
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg {...iconProps} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.3c-1.6-1-7.2-4.7-7.2-9.6A3.9 3.9 0 0 1 12 8.2a3.9 3.9 0 0 1 7.2 2.5c0 4.9-5.6 8.6-7.2 9.6Z" />
  </svg>
)

const CommentIcon = () => (
  <svg {...iconProps}>
    <path d="M4.8 5.5h14.4v9.6h-8.6l-4.2 3.4v-3.4H4.8Z" />
  </svg>
)

const ShareIcon = () => (
  <svg {...iconProps}>
    <circle cx="17.5" cy="5.8" r="2.3" />
    <circle cx="6.5" cy="12" r="2.3" />
    <circle cx="17.5" cy="18.2" r="2.3" />
    <path d="M8.5 10.8 15.5 6.9M8.5 13.2l7 3.9" />
  </svg>
)

const ExternalIcon = () => (
  <svg {...iconProps}>
    <path d="M14 4.8h5.2V10M19.2 4.8 11 13" />
    <path d="M17 14v4.7a1.5 1.5 0 0 1-1.5 1.5H6.3a1.5 1.5 0 0 1-1.5-1.5V9.5A1.5 1.5 0 0 1 6.3 8H11" />
  </svg>
)

/**
 * Action rail — the editorial reading of a Shorts viewer's right-hand column.
 * Four controls, in the same order the shape is recognised in, and each one
 * either does something real on this page or leaves for the real Short. There
 * are no counts beside them because there is no data behind them; a number
 * here would be an invention, and an invented number on a concept site is
 * just a lie with a nice typeface.
 *
 * It sits OUTSIDE the 9:16 frame rather than over the video: an overlay would
 * cover the thing it is meant to serve, and once a player is mounted, controls
 * painted over an iframe stop receiving pointer events anyway.
 *
 * Like and Share state is held for the whole section by useFeaturedActions;
 * this component renders one story's slice of it.
 */
function FeaturedActionRail({
  story,
  title,
  isLiked,
  notice,
  onToggleLike,
  onShare,
}: {
  story: FeaturedStory
  title: string
  isLiked: boolean
  /** This story's share notice, or null when the last share was another story's. */
  notice: ShareNotice | null
  onToggleLike: () => void
  onShare: () => void
}) {
  const { t } = usePreferences()
  const newTab = `(${t.featured.a11y.opensInNewTab})`

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={`${styles.action} ${styles.actionLike}`}
        // The state is the button's, so it is announced by aria-pressed rather
        // than by swapping the label — a name that changes under the visitor
        // is a name they cannot refer back to.
        aria-pressed={isLiked}
        onClick={onToggleLike}
        aria-label={`${t.featured.actions.like} — ${title}`}
      >
        <HeartIcon filled={isLiked} />
        <span>{t.featured.actions.like}</span>
      </button>

      {/* No local comments drawer: the comments are on YouTube, so this goes
        to YouTube and its name says so before it is followed. */}
      <a
        className={styles.action}
        href={story.videoUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${t.featured.actions.comments} — ${t.featured.a11y.viewComments} — ${title} ${newTab}`}
      >
        <CommentIcon />
        <span>{t.featured.actions.comments}</span>
      </a>

      <button
        type="button"
        className={styles.action}
        onClick={onShare}
        aria-label={`${t.featured.actions.share} — ${title}`}
      >
        <ShareIcon />
        <span>{t.featured.actions.share}</span>
      </button>

      {/* Replaces the copy column's old "Watch the Short" link. Same
        destination, same new tab, now in the rail where the other three
        actions are — one place to leave from rather than two. */}
      <a
        className={styles.action}
        href={story.videoUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${t.featured.actions.watch} — ${title} ${newTab}`}
      >
        <ExternalIcon />
        <span>{t.featured.actions.watch}</span>
      </a>

      {/* Always mounted, filled on demand: a live region added to the DOM at
        the same moment as its text is frequently missed by screen readers,
        which watch existing regions for changes. */}
      <p className={styles.actionNotice} role="status">
        {notice
          ? notice.copied
            ? t.featured.actions.linkCopied
            : t.featured.actions.copyFailed
          : ''}
      </p>
    </div>
  )
}

export default FeaturedActionRail
