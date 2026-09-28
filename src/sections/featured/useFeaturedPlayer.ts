import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Click-to-play state for Featured's Shorts, plus the keyboard and focus
 * behaviour that has to go with it.
 *
 * Exactly one player can exist: `playingId` holds a single story id, so
 * pressing Play on a second story unmounts the first player outright rather
 * than leaving it paused in the background. Closing restores that story's
 * poster and its Play button.
 */
export function useFeaturedPlayer() {
  // ONE story's id, or null. Holding a single value is what enforces "only one
  // Short at a time" — React unmounts the previous <iframe> the moment this
  // changes, which tears the old player down rather than leaving it paused in
  // the background still holding a connection to YouTube.
  const [playingId, setPlayingId] = useState<string | null>(null)
  const playButtonRefs = useRef(new Map<string, HTMLButtonElement | null>())
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  // Which play button to hand focus back to once the player closes. Held in a
  // ref rather than derived from `playingId`, because by the time the effect
  // runs on close, `playingId` is already null.
  const lastPlayedId = useRef<string | null>(null)

  const openPlayer = useCallback((id: string) => {
    lastPlayedId.current = id
    setPlayingId(id)
  }, [])

  const closePlayer = useCallback(() => {
    setPlayingId(null)
  }, [])

  const registerPlayButton = useCallback(
    (id: string, node: HTMLButtonElement | null) => {
      playButtonRefs.current.set(id, node)
    },
    [],
  )

  // Keyboard: a player that can be opened from the keyboard has to be
  // closable from it too. The close button is reachable by Tab, and Escape is
  // the shortcut. The listener only exists while a player is mounted.
  useEffect(() => {
    if (!playingId) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePlayer()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [playingId, closePlayer])

  // Focus follows the swap in both directions: onto the close button when a
  // player opens, back onto the play button that opened it when it closes.
  // Without this, closing would drop focus to <body> and a keyboard visitor
  // would restart the whole section.
  useEffect(() => {
    if (playingId) {
      closeButtonRef.current?.focus()
      return
    }
    const previous = lastPlayedId.current
    if (previous) {
      playButtonRefs.current.get(previous)?.focus()
      lastPlayedId.current = null
    }
  }, [playingId])

  return {
    playingId,
    openPlayer,
    closePlayer,
    registerPlayButton,
    closeButtonRef,
  }
}

export type FeaturedPlayer = ReturnType<typeof useFeaturedPlayer>
