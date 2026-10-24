import { useLayoutEffect, useState } from 'react'
import styles from './EditorialProgress.module.css'

const SECTION_IDS = [
  'hero',
  'creator',
  'featured',
  'hardware',
  'content-universe',
  'closing',
] as const

function EditorialProgress() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [left, setLeft] = useState(0)

  useLayoutEffect(() => {
    const canvas = document.querySelector<HTMLElement>(
      '#hero [class*="canvas"]',
    )
    const desktop = window.matchMedia?.('(min-width: 1240px)')
    if (!canvas || !desktop) return

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    )
    let baseLeft = 0
    let activeIndexValue = 0

    const getLeftForSection = (index: number) => {
      const sectionHeading = sections[index]?.querySelector('h1, h2')
      if (index === 0 || !sectionHeading) return baseLeft
      return Math.min(
        baseLeft,
        sectionHeading.getBoundingClientRect().left - 24,
      )
    }

    const updateLeft = () => {
      const bounds = canvas.getBoundingClientRect()
      const rootSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      )
      const padding = Math.min(
        Math.max(rootSize * 1.25, window.innerWidth * 0.04),
        rootSize * 4,
      )
      baseLeft = bounds.left + Math.max(padding, bounds.width * 0.11 - 105)
      setLeft(getLeftForSection(activeIndexValue))
    }

    const updateFromViewport = () => {
      const midpoint = window.innerHeight / 2
      let currentIndex = 0
      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= midpoint) {
          currentIndex = index
        }
      })
      if (currentIndex === activeIndexValue) return
      activeIndexValue = currentIndex
      setActiveIndex(currentIndex)
      setLeft(getLeftForSection(currentIndex))
    }

    const scheduleViewportUpdate = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        updateFromViewport()
      })
    }

    let resizeObserver: ResizeObserver | undefined
    let frame = 0

    const start = () => {
      updateLeft()
      resizeObserver = new ResizeObserver(updateLeft)
      resizeObserver.observe(canvas)
      window.addEventListener('resize', updateLeft)
      window.addEventListener('scroll', scheduleViewportUpdate, {
        passive: true,
      })
      updateFromViewport()
    }

    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        start()
      } else {
        stop()
      }
    }

    const stop = () => {
      window.removeEventListener('scroll', scheduleViewportUpdate)
      resizeObserver?.disconnect()
      resizeObserver = undefined
      window.removeEventListener('resize', updateLeft)
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    if (desktop.matches) start()
    desktop.addEventListener('change', onBreakpointChange)

    return () => {
      desktop.removeEventListener('change', onBreakpointChange)
      stop()
    }
  }, [])

  return (
    <>
      <div
        className={styles.rail}
        data-editorial-rail
        aria-hidden="true"
        style={{ left }}
      >
        <span className={styles.tick} />
        <span className={styles.tick} />
        <span
          className={styles.marker}
          data-editorial-marker
          style={{ top: `${activeIndex * 20}%` }}
        />
      </div>
      <div
        className={styles.index}
        data-editorial-index
        aria-hidden="true"
        style={{ left }}
      >
        <span>{String(activeIndex + 1).padStart(2, '0')}</span>
        <span>/06</span>
      </div>
    </>
  )
}

export default EditorialProgress
