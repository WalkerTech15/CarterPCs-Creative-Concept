import type { FeaturedStory } from '../../data/types'
import type { ShareOutcome } from './featured.types'

/** The title used for player and action accessible names. */
export const storyTitle = (story: Pick<FeaturedStory, 'headlineLines'>) =>
  story.headlineLines.join(' ')

/** Add autoplay only after the visitor explicitly presses Play. */
export const playerSrc = (embedUrl: string, reducedMotion: boolean) =>
  reducedMotion ? embedUrl : `${embedUrl}&autoplay=1`

/** Share through the platform when available, otherwise report clipboard outcome. */
export async function shareLink(
  title: string,
  url: string,
  nav: Navigator | undefined = typeof navigator === 'undefined'
    ? undefined
    : navigator,
): Promise<ShareOutcome> {
  if (nav?.share) {
    try {
      await nav.share({ title, url })
      return 'shared'
    } catch (error) {
      // Web Share uses AbortError when the visitor dismisses the sheet. Other
      // rejections (for example permission or platform errors) are failures.
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'AbortError'
      ) {
        return 'cancelled'
      }
      return 'share-failed'
    }
  }

  try {
    if (!nav?.clipboard?.writeText) {
      throw new Error('clipboard unavailable')
    }
    await nav.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'copy-failed'
  }
}
