import { useLayoutEffect, type RefObject } from 'react'
import {
  gsap,
  ScrollTrigger,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { featuredStoryCount } from '../../data/featured'
import type { CopyInsets } from './featured.types'
import { activePanelIndex, copyFocus, exitFadeTravel } from './featured.utils'

/**
 * Featured's GSAP layer: the intro headline wipe, and (≥1024px only) the
 * pinned, scrubbed horizontal sequence.
 *
 * It only ever ENHANCES the CSS layout. The ≥1024px breakpoint alone switches
 * each panel into a full-bleed, 100vw panel inside a natively horizontally-
 * scrollable (scroll-snapped) track — a working, readable sequence even if
 * GSAP fails to load, per TECH_STACK.md §18's progressive-enhancement
 * requirement. This hook then pins and scrubs that same markup; it never gates
 * visibility or structure. Reduced motion and <1024px never run the pin at
 * all, so the CSS fallback is what most of those visitors see by design, not
 * as a degraded second-class path.
 *
 * COPY VISIBILITY
 * Each panel's readable text (`[data-panel-content]`) fades/lifts against its
 * own measured content box, computed arithmetically each frame (no second
 * trigger, no getBoundingClientRect() calls during scroll — see the comment
 * above `contentInsets`) — a visual-review fix for text that was otherwise
 * still legibly opaque while being clipped by the viewport edge
 * mid-translate, which read as an accidental crop rather than cinematic
 * motion.
 *
 * Two earlier versions got the *position* math wrong in different ways
 * (panel-index distance as an edge proxy, then raw offsetLeft instead of the
 * padding-adjusted glyph box). A third bug — subtler — was in *when* that
 * position math ran: it read `self.progress` from the ScrollTrigger's own
 * onUpdate, which is the raw, scroll-input-driven target progress, not the
 * eased value the scrub (see `scrub: 1` below) is still catching up to on the
 * actual rendered `rail` transform. Scrubbing intentionally makes the
 * rendered position lag the target during fast scroll input, so math built on
 * the target progress could conclude text was already safely inside the
 * viewport while the pixels on screen still showed it clipped. This version
 * instead reads the rail's actual current rendered `x` (via
 * `gsap.getProperty`) from inside the horizontal tween's own `onUpdate` —
 * which only fires when GSAP has just written that frame's real transform —
 * so the visibility math can never be ahead of what's on screen.
 *
 * The math itself is `copyFocus()` in featured.utils.ts, which documents why
 * entry and exit are two independent, direction-specific terms. The media
 * stage/numeral are intentionally left out of this fade — they're abstract
 * background texture, not text that can look "broken," so they stay visible
 * for continuous motion.
 */
export function useFeaturedSequence({
  rootRef,
  trackRef,
  railRef,
  reducedMotion,
  onActiveIndexChange,
}: {
  rootRef: RefObject<HTMLElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  railRef: RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  /** A state setter: called with an updater, so it must be stable. */
  onActiveIndexChange: (update: (previous: number) => number) => void
}) {
  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      // Resolved once, inside the context, so the onComplete below acts on
      // the same scoped elements (see Creator.tsx for the same note).
      const introLines = gsap.utils.toArray<HTMLElement>('[data-intro-line]')

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 70%',
            once: true,
          },
        })
        .fromTo(
          introLines,
          { clipPath: HEADLINE_WIPE_FROM },
          {
            clipPath: HEADLINE_WIPE_TO,
            duration: 0.8,
            // See HEADLINE_WIPE_* — no live cropping rectangle at rest.
            onComplete: () => gsap.set(introLines, { clearProps: 'clipPath' }),
          },
        )
        .from(
          '[data-intro-reveal]',
          { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 },
          '-=0.5',
        )

      ScrollTrigger.matchMedia({
        '(min-width: 1024px)': () => {
          const track = trackRef.current
          const rail = railRef.current
          if (!track || !rail) {
            return
          }

          track.style.overflowX = 'hidden'

          const getDistance = () =>
            Math.max(rail.scrollWidth - window.innerWidth, 0)

          const contents = gsap.utils.toArray<HTMLElement>(
            '[data-panel-content]',
            rail,
          )
          // Panel COUNT is language-independent by construction (one row per
          // story in data/featured.ts, three translations inside it), so the
          // pinned sequence's geometry never depends on which language the
          // effect happened to be set up under.
          const panelCount = featuredStoryCount
          const contentInsets: CopyInsets[] = contents.map((content) => {
            const style = window.getComputedStyle(content)
            return {
              // offsetLeft/offsetWidth describe the padded BORDER box; the
              // actual readable glyphs sit inset from that box by its own
              // padding (content is a flex child that stretches full-width
              // with no margin, so offsetLeft alone is ~0 — the real inset
              // comes entirely from padding). An earlier version used
              // offsetLeft/offsetWidth directly, which measured the
              // transparent padding as if it were "safe," so the fade only
              // fully engaged once the *box* neared the edge — by then the
              // text inside it, inset ~80px further in, had already been
              // clipped for a while. Measured once up front (a layout
              // read, but layout doesn't change during scroll — only
              // transforms do) so the per-frame math below needs no
              // getBoundingClientRect() calls, which would otherwise
              // interleave layout reads with the gsap.set writes below and
              // thrash layout every scroll frame.
              textLeft: content.offsetLeft + parseFloat(style.paddingLeft),
              textRight:
                content.offsetLeft +
                content.offsetWidth -
                parseFloat(style.paddingRight),
            }
          })
          const exitTravel = exitFadeTravel(contentInsets)

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: track,
              start: 'top top',
              end: () => `+=${getDistance() * 0.82}`,
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
              // The rail comes to rest ON a panel, never between two.
              //
              // Without this, a scrubbed rail rests wherever the visitor
              // happened to stop, and the panel it leaves on screen is a
              // fraction of the way through its travel. Measured across 42
              // rest states at 1024/1440/1920, only 9 landed on a panel: the
              // rest sat up to 960px off, which is what makes the last story
              // read as "shifted right" — and it dragged the copy out of line
              // with everything anchored to the panel's own left edge.
              //
              // snapTo is 1/(panels-1) because the tween's progress maps
              // linearly onto the rail, so 0, 0.5 and 1 ARE the three panel
              // boundaries. Kept short and undelayed: this is a correction of
              // a few hundred px, not a page transition, and a slow snap on a
              // pinned section feels like the page is arguing with the wheel.
              snap: {
                snapTo: 1 / (panelCount - 1),
                duration: { min: 0.15, max: 0.35 },
                delay: 0.05,
                ease: 'power2.inOut',
                inertia: false,
              },
              onUpdate: (self) => {
                const idx = activePanelIndex(self.progress, panelCount)
                onActiveIndexChange((prev) => (prev === idx ? prev : idx))
              },
            },
          })

          // Fade + lift each panel's readable text against the rail's
          // ACTUAL rendered position, not the ScrollTrigger's raw target
          // progress — this callback lives on the horizontal tween itself,
          // so it only runs once GSAP has written that frame's real `x`
          // (see the top-of-file comment for why that distinction matters
          // once scrub smoothing is in play).
          const updateCopyVisibility = () => {
            const railX = (gsap.getProperty(rail, 'x') as number) || 0
            const viewportWidth = window.innerWidth

            contents.forEach((content, i) => {
              const focus = copyFocus({
                insets: contentInsets[i],
                panelIndex: i,
                railX,
                viewportWidth,
                exitTravel,
              })

              gsap.set(content, {
                opacity: focus,
                y: (1 - focus) * 20,
              })
            })
          }

          tl.to(
            rail,
            {
              x: () => -getDistance(),
              ease: 'none',
              onUpdate: updateCopyVisibility,
            },
            0,
          )

          return () => {
            track.style.overflowX = ''
            gsap.set(contents, { clearProps: 'opacity,transform' })
          }
        },
      })
    }, rootRef)

    return () => ctx.revert()
    // The refs are stable objects and the callback is a state setter, so in
    // practice only the motion preference tears the timelines down and
    // rebuilds them.
  }, [reducedMotion, rootRef, trackRef, railRef, onActiveIndexChange])
}
