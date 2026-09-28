import { useCallback, useEffect, useRef, useState } from 'react'
import { shareLink } from './featured.utils'
import type { ShareNotice } from './featured.types'

/**
 * State behind every panel's action rail. Held once for the section rather
 * than per rail: only one share notice is ever on screen, and a second share
 * replaces the first one's notice and its timer.
 */
export function useFeaturedActions() {
  // Which Shorts this visitor has liked, for as long as this page is open.
  // A Set of ids rather than a flag per story, so the rail stays driven by
  // data/featured.ts's list rather than by three hard-coded pieces of state.
  //
  // This is a LOCAL preference and nothing more. No request is made, no count
  // is read or written, and nothing here claims to be a YouTube like — which
  // is also why it is not persisted: a value that survives a reload would
  // start to look like an account, and there is no account.
  const [likedIds, setLikedIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  )
  const toggleLike = useCallback((id: string) => {
    setLikedIds((previous) => {
      const next = new Set(previous)
      if (!next.delete(id)) {
        next.add(id)
      }
      return next
    })
  }, [])

  const [shareNotice, setShareNotice] = useState<ShareNotice | null>(null)
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const shareStory = useCallback(
    async (id: string, title: string, url: string) => {
      if (shareTimer.current) {
        clearTimeout(shareTimer.current)
        shareTimer.current = null
      }
      const outcome = await shareLink(title, url)
      // The share sheet reports its own outcome; the page does not double up.
      if (outcome === 'shared') {
        return
      }
      setShareNotice({ id, copied: outcome === 'copied' })
      shareTimer.current = setTimeout(() => setShareNotice(null), 4000)
    },
    [],
  )

  useEffect(
    () => () => {
      if (shareTimer.current) {
        clearTimeout(shareTimer.current)
      }
    },
    [],
  )

  return { likedIds, toggleLike, shareNotice, shareStory }
}

export type FeaturedActions = ReturnType<typeof useFeaturedActions>
