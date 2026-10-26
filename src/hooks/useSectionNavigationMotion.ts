import { useEffect } from 'react'

const ARRIVAL_ATTRIBUTE = 'data-navigation-arrival'
const SCROLL_IDLE_MS = 180

/** Replays a quiet heading arrival cue after each same-page section link. */
export function useSectionNavigationMotion(reducedMotion: boolean): void {
  useEffect(() => {
    if (reducedMotion) return

    let pendingSection: HTMLElement | null = null
    let scrollTimer: number | undefined
    let activeSection: HTMLElement | null = null

    const finishNavigation = () => {
      window.clearTimeout(scrollTimer)
      const section = pendingSection
      pendingSection = null
      if (!section) return

      if (activeSection && activeSection !== section) {
        activeSection.removeAttribute(ARRIVAL_ATTRIBUTE)
      }

      section.removeAttribute(ARRIVAL_ATTRIBUTE)
      // Restart the CSS animation when the visitor selects the same section
      // again, even if the URL hash and scroll position did not change.
      void section.offsetWidth
      section.setAttribute(ARRIVAL_ATTRIBUTE, 'true')
      activeSection = section
    }

    const onClick = (event: MouseEvent) => {
      const origin = event.target
      if (!(origin instanceof Element)) return
      const anchor = origin.closest<HTMLAnchorElement>('a[href]')
      if (!anchor) return

      const url = new URL(anchor.href, window.location.href)
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search ||
        !url.hash
      ) {
        return
      }

      const id = decodeURIComponent(url.hash.slice(1))
      const target = document.getElementById(id)
      pendingSection = target?.matches('section[id]') ? target : null
      if (!pendingSection) return

      // Scrollend is the primary signal; the idle timer also covers browsers
      // and reduced-motion/native jumps that do not emit it consistently.
      window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(finishNavigation, SCROLL_IDLE_MS)
    }

    const onScroll = () => {
      if (!pendingSection) return
      window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(finishNavigation, SCROLL_IDLE_MS)
    }

    document.addEventListener('click', onClick)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', finishNavigation)

    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', finishNavigation)
      window.clearTimeout(scrollTimer)
      activeSection?.removeAttribute(ARRIVAL_ATTRIBUTE)
    }
  }, [reducedMotion])
}
