import { useLayoutEffect, type RefObject } from 'react'
import {
  gsap,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'

/** A restrained, one-time entrance for the static editorial story layout. */
export function useFeaturedIntro({
  rootRef,
  reducedMotion,
}: {
  rootRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
}) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reducedMotion) return

    const context = gsap.context(() => {
      const headline = root.querySelector<HTMLElement>('[data-intro-line]')
      const intro = gsap.utils.toArray<HTMLElement>('[data-intro-reveal]', root)
      const stories = gsap.utils.toArray<HTMLElement>(
        '[data-story-reveal]',
        root,
      )

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 72%',
          once: true,
        },
      })

      if (headline) {
        timeline.fromTo(
          headline,
          { clipPath: HEADLINE_WIPE_FROM },
          {
            clipPath: HEADLINE_WIPE_TO,
            duration: 0.65,
            ease: 'power3.out',
            onComplete: () => gsap.set(headline, { clearProps: 'clipPath' }),
          },
        )
      }

      if (intro.length) {
        timeline.from(
          intro,
          { opacity: 0, y: 10, duration: 0.4, stagger: 0.06 },
          '-=0.35',
        )
      }

      if (stories.length) {
        timeline.from(
          stories,
          { opacity: 0, y: 14, duration: 0.45, stagger: 0.07 },
          '-=0.2',
        )
      }
    }, root)

    return () => context.revert()
  }, [reducedMotion, rootRef])
}
