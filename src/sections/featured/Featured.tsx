import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  gsap,
  ScrollTrigger,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import { featuredStoryCount, getFeaturedStories } from '../../data/featured'
import styles from './Featured.module.css'

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
 * Featured Content, per ARCHITECTURE.md's Section 4 spec: "showcase a small
 * set of standout content pieces as large editorial stories, not a video
 * grid." Narrative pacing steps up here on purpose — Hero (dramatic) →
 * Creator (calm editorial pause) → Featured (dynamic showcase) — expressed
 * through punchier multi-line headlines, richer color balance per panel, and
 * (desktop only) the site's first horizontal-motion sequence, not through a
 * "transition effect" bolted on for spectacle.
 *
 * Layout is CSS-first, JS-enhanced: the ≥1024px breakpoint alone switches
 * each panel from a stacked block into a full-bleed, 100vw panel inside a
 * natively horizontally-scrollable (scroll-snapped) track — a working,
 * readable sequence even if GSAP fails to load, per TECH_STACK.md §18's
 * progressive-enhancement requirement. GSAP then *enhances* that same
 * markup, on top of the CSS layout, into a pinned/scrubbed sequence — it
 * never gates visibility or structure. Reduced motion and <1024px never run
 * the pin at all, so the CSS fallback is what most of those visitors see by
 * design, not as a degraded second-class path.
 *
 * Content status: `data/featured.ts` documents in full why every headline
 * below is original editorial-development copy grounded in RESEARCH.md §3's
 * category descriptions, not a reproduced (verified or unverified) Carter
 * video title — see that file's top comment before editing panel copy.
 *
 * MEDIA — click to play, nothing before that
 * Each panel carries a real CarterPCs Short. The page loads ZERO YouTube
 * iframes: every panel starts as a local poster image plus a real <button>,
 * and the iframe for one story is created only when that story's button is
 * pressed. Three always-mounted embeds meant three third-party connections,
 * three player bundles and three sets of YouTube chrome on first paint, on a
 * section most visitors scroll past.
 *
 * Exactly one player can exist: `playingId` holds a single story id, so
 * pressing Play on a second story unmounts the first player outright rather
 * than leaving it paused in the background. Closing restores that story's
 * poster and its Play button.
 *
 * The embed is the privacy-enhanced youtube-nocookie.com host, and the player
 * lives inside the panel's own 9:16 media frame — never stretched across the
 * panel, where it used to sit at inset: 0 and cover the headline.
 *
 * Each panel's readable text (`[data-panel-content]`) fades/lifts against
 * its own measured content box, computed arithmetically each frame (no
 * second trigger, no getBoundingClientRect() calls during scroll — see the
 * comment above `contentMetrics`) — a visual-review fix for text that was
 * otherwise still legibly opaque while being clipped by the viewport edge
 * mid-translate, which read as an accidental crop rather than cinematic
 * motion.
 *
 * Two earlier versions got the *position* math wrong in different ways
 * (panel-index distance as an edge proxy, then raw offsetLeft instead of
 * the padding-adjusted glyph box). A third bug — subtler — was in *when*
 * that position math ran: it read `self.progress` from the ScrollTrigger's
 * own onUpdate, which is the raw, scroll-input-driven target progress, not
 * the eased value the scrub (see `scrub: 1` below) is still catching up to
 * on the actual rendered `rail` transform. Scrubbing intentionally makes
 * the rendered position lag the target during fast scroll input, so math
 * built on the target progress could conclude text was already safely
 * inside the viewport while the pixels on screen still showed it clipped.
 * This version instead reads the rail's actual current rendered `x` (via
 * `gsap.getProperty`) from inside the horizontal tween's own `onUpdate` —
 * which only fires when GSAP has just written that frame's real transform
 * — so the visibility math can never be ahead of what's on screen.
 *
 * Visibility is two independent, direction-specific terms (see
 * `updateCopyVisibility`), not one shared "inset from both edges" rule: a
 * panel's copy is only ever at risk from ONE edge at a time — the right
 * edge while entering, the left edge while later exiting as the next panel
 * enters — and those two edges have very different amounts of real travel
 * room given this design's own (left-anchored) content padding. Gating
 * both edges identically made the settled state itself fail the left-edge
 * check, snapping fully-arrived copy back to opacity 0. The media
 * stage/numeral are intentionally left out of this fade — they're
 * abstract background texture, not text that can look "broken," so they
 * stay visible for continuous motion.
 */
function Featured() {
  const reducedMotion = useReducedMotion()
  const { t, language } = usePreferences()
  const stories = useMemo(() => getFeaturedStories(language), [language])
  const rootRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

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

  // Result of the last share, shown next to the rail it came from and
  // announced through that panel's own live region.
  const [shareNotice, setShareNotice] = useState<{
    id: string
    copied: boolean
  } | null>(null)
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const shareStory = useCallback(async (id: string, title: string, url: string) => {
    if (shareTimer.current) {
      clearTimeout(shareTimer.current)
      shareTimer.current = null
    }
    // The platform's own share sheet, where there is one. It reports its own
    // outcome, so nothing is shown here — and a visitor who dismisses the
    // sheet has not failed at anything, so a rejection is silence, not an
    // error message.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        /* dismissed */
      }
      return
    }
    // Otherwise the clipboard, with a real result either way: the API is
    // absent outside secure contexts and can reject on a denied permission,
    // and silently doing nothing would look identical to succeeding.
    let copied = false
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('clipboard unavailable')
      }
      await navigator.clipboard.writeText(url)
      copied = true
    } catch {
      copied = false
    }
    setShareNotice({ id, copied })
    shareTimer.current = setTimeout(() => setShareNotice(null), 4000)
  }, [])

  useEffect(
    () => () => {
      if (shareTimer.current) {
        clearTimeout(shareTimer.current)
      }
    },
    [],
  )

  const openPlayer = useCallback((id: string) => {
    lastPlayedId.current = id
    setPlayingId(id)
  }, [])

  const closePlayer = useCallback(() => {
    setPlayingId(null)
  }, [])

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
          // A panel's copy only ever risks being clipped by ONE edge at a
          // time, and it's a different edge depending on direction — never
          // both at once, and never the edge you'd naively guess from a
          // single shared "inset from both edges" rule:
          //  - Entering (from the right): the block's *trailing* (right)
          //    edge is the last part still off-screen, so copyRight vs. the
          //    right edge is the only real constraint. Its own left inset
          //    is nowhere near the left edge this whole time (content is
          //    left-anchored inside a full-viewport panel, so copyLeft
          //    starts and stays large until long after this panel has
          //    already settled).
          //  - Exiting (to the left, as the NEXT panel enters): the
          //    block's copyLeft is what approaches the left edge.
          // A first version of this fix used one shared, symmetric
          // "inside a safe zone inset from both edges" rule for both
          // directions — which broke the *settled* state: a panel's own
          // natural left inset (its content padding, ~80px at this
          // section's desktop breakpoints — see restInsetLeft below) is
          // narrower than a viewport-ratio-based safe inset would need it
          // to be, so the shared rule stayed permanently unsatisfiable on
          // the left, snapping settled copy back to opacity 0 the instant
          // it finished entering (caught by scanning real rendered opacity
          // across the full scroll range, not just the reported bug's two
          // transitions). Splitting entry and exit into their own terms
          // fixes that without touching the already-approved exit fade's
          // actual visual behavior (still a smooth, ungated fade as this
          // panel's own copy is pushed left off-screen by the next one).
          const SAFE_INSET_RATIO = 0.06
          // Entry ramp: once safely inside from the right, opacity climbs
          // to 1 over this many px — comfortably short of a "pop," and
          // there's plenty of real travel room on this side (see
          // FIRST_VISIBLE_FRAME logs during validation: several hundred px
          // between "just became safe" and "fully settled").
          const ENTRY_FADE_TRAVEL_PX = 96
          const contentMetrics = contents.map((content) => {
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
          // Exit ramp: sized as a fraction of the panel's own measured
          // rest-state left inset (rather than a fixed px constant) so it
          // always finishes comfortably before copyLeft reaches that rest
          // value — guaranteeing settled copy reaches exactly opacity 1 —
          // while still fading smoothly, well before the true left edge,
          // as this panel is pushed off-screen by the next one entering.
          const restInsetLeft = Math.min(
            ...contentMetrics.map((m) => m.textLeft),
          )
          const EXIT_FADE_TRAVEL_PX = restInsetLeft * 0.6

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
                const idx = Math.round(self.progress * (panelCount - 1))
                setActiveIndex((prev) => (prev === idx ? prev : idx))
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
            const safeRight = viewportWidth * (1 - SAFE_INSET_RATIO)

            contents.forEach((content, i) => {
              const { textLeft, textRight } = contentMetrics[i]
              const panelOffset = i * viewportWidth + railX
              const copyLeft = panelOffset + textLeft
              const copyRight = panelOffset + textRight

              // Entry: hard 0 until the block's trailing (right) edge is
              // inside the conservative safe zone — never a partial value
              // while still outside it, so a still-entering block can
              // never read as "already fading in." Then a short ramp to 1.
              const rightMargin = safeRight - copyRight
              const entryFocus =
                rightMargin < 0
                  ? 0
                  : gsap.utils.clamp(0, 1, rightMargin / ENTRY_FADE_TRAVEL_PX)

              // Exit: smooth (ungated) fade as copyLeft approaches the true
              // left edge — the already-approved "may fade before fully
              // leaving the viewport" behavior, just sized so it's still 1
              // at this panel's own settled position.
              const exitFocus = gsap.utils.clamp(
                0,
                1,
                copyLeft / EXIT_FADE_TRAVEL_PX,
              )

              const focus = Math.min(entryFocus, exitFocus)

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
  }, [reducedMotion])

  return (
    <section id="featured" className={styles.featured} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.intro}>
        <p className={styles.meta} data-intro-reveal>
          <span>{t.featured.metaLabel}</span>
          <span className={styles.metaRule} aria-hidden="true" />
          <span>{t.featured.metaNote}</span>
        </p>
        <h2 className={styles.title} data-intro-line>
          {t.featured.title}
        </h2>
      </div>

      <div className={styles.track} ref={trackRef}>
        <div className={styles.rail} ref={railRef}>
          {stories.map((story) => {
            // The real, published title of the Short. Deliberately the same
            // English string in every language (see data/featured.ts) — it
            // names a specific video, so it is not translated.
            const title = story.headlineLines.join(' ')
            const isPlaying = playingId === story.index
            const isLiked = likedIds.has(story.index)
            const notice = shareNotice?.id === story.index ? shareNotice : null
            const newTab = `(${t.featured.a11y.opensInNewTab})`

            return (
              <article
                key={story.index}
                className={styles.panel}
                data-panel
                data-variant={story.variant}
              >
                {/* Decoration only — gradient field, framing marks and the
                  environmental numeral. The media itself is the .media frame
                  below, which is why this whole layer is aria-hidden. */}
                <div className={styles.panelStage} aria-hidden="true">
                  <div className={styles.panelStageSurface}>
                    <span className={styles.panelGuide} />
                    <span className={styles.panelCorner} />
                    <span className={styles.panelCornerEnd} />
                  </div>
                  <span className={styles.panelNumeral}>{story.index}</span>
                </div>

                {/* Media frame: a 9:16 card, because that is the shape of the
                  thing. The poster is a 1280x720 YouTube thumbnail whose real
                  portrait frame is the centre 31.6% of its width, so a 9:16
                  box with object-fit: cover shows precisely that column and
                  crops away only YouTube's blurred filler bars.

                  Nothing is requested from YouTube until the button below is
                  pressed: on first paint this is a local image and a button,
                  and there is no iframe in the document at all. */}
                <div className={styles.media}>
                  <div className={styles.mediaFrame} data-media-frame>
                    {isPlaying ? (
                      <>
                        <iframe
                          className={styles.player}
                          // Built here rather than stored, so the autoplay flag
                          // can depend on the visitor. A click IS the request to
                          // play, so autoplay after it is not "autoplay" in the
                          // sense the reduced-motion preference is about — but
                          // someone who has asked for less motion gets the
                          // player loaded paused with its controls anyway, and
                          // decides for themselves.
                          src={
                            reducedMotion
                              ? story.embedUrl
                              : `${story.embedUrl}&autoplay=1`
                          }
                          title={`${t.featured.a11y.player} — ${title}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                        <button
                          type="button"
                          ref={closeButtonRef}
                          className={styles.close}
                          onClick={closePlayer}
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
                          ref={(node) => {
                            playButtonRefs.current.set(story.index, node)
                          }}
                          className={styles.play}
                          onClick={() => openPlayer(story.index)}
                          aria-label={`${t.featured.playShort} — ${title}`}
                        >
                          <span
                            className={styles.playIcon}
                            aria-hidden="true"
                          />
                          <span className={styles.playLabel}>
                            {t.featured.playShort}
                          </span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Action rail — the editorial reading of a Shorts viewer's
                    right-hand column. Four controls, in the same order the
                    shape is recognised in, and each one either does something
                    real on this page or leaves for the real Short. There are
                    no counts beside them because there is no data behind them;
                    a number here would be an invention, and an invented number
                    on a concept site is just a lie with a nice typeface.

                    It sits OUTSIDE the 9:16 frame rather than over the video:
                    an overlay would cover the thing it is meant to serve, and
                    once a player is mounted, controls painted over an iframe
                    stop receiving pointer events anyway. */}
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={`${styles.action} ${styles.actionLike}`}
                      // The state is the button's, so it is announced by
                      // aria-pressed rather than by swapping the label — a name
                      // that changes under the visitor is a name they cannot
                      // refer back to.
                      aria-pressed={isLiked}
                      onClick={() => toggleLike(story.index)}
                      aria-label={`${t.featured.actions.like} — ${title}`}
                    >
                      <HeartIcon filled={isLiked} />
                      <span>{t.featured.actions.like}</span>
                    </button>

                    {/* No local comments drawer: the comments are on YouTube,
                      so this goes to YouTube and its name says so before it is
                      followed. */}
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
                      onClick={() => {
                        void shareStory(story.index, title, story.videoUrl)
                      }}
                      aria-label={`${t.featured.actions.share} — ${title}`}
                    >
                      <ShareIcon />
                      <span>{t.featured.actions.share}</span>
                    </button>

                    {/* Replaces the copy column's old "Watch the Short" link.
                      Same destination, same new tab, now in the rail where the
                      other three actions are — one place to leave from rather
                      than two. */}
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

                    {/* Always mounted, filled on demand: a live region added to
                      the DOM at the same moment as its text is frequently
                      missed by screen readers, which watch existing regions for
                      changes. */}
                    <p className={styles.actionNotice} role="status">
                      {notice
                        ? notice.copied
                          ? t.featured.actions.linkCopied
                          : t.featured.actions.copyFailed
                        : ''}
                    </p>
                  </div>
                </div>

                <div className={styles.panelContent} data-panel-content>
                  <p className={styles.panelIndex}>
                    {story.category}
                  </p>
                  {/* Keyed by position, not by text: a translated headline may
                    legitimately repeat a word across its three lines, and a
                    text key would then collide. */}
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
                  {/* The external link that used to close this column now
                    lives in the rail as "Watch on YouTube". Leaving both would
                    have put the same destination on the panel twice, and this
                    column is now purely read, never operated — which also
                    removes the one place where the tab order and the mobile
                    reading order disagreed. */}
                </div>

                {/* Sequence position — one per panel, not one for the section.
                  It reads as the bottom line of this story's text column, so
                  it has to be anchored to that column's left edge; a single
                  viewport-fixed indicator agrees with that edge only while the
                  rail is exactly on a panel, and was measured up to 960px out
                  of line mid-travel. Inside the panel it is aligned by
                  construction, at every position, because it shares the
                  panel's own padding.

                  Deliberately OUTSIDE [data-panel-content]: that block is
                  faded and lifted as its panel enters and leaves, and the
                  position indicator should stay legible through the
                  transition rather than dissolving with the copy.

                  Decorative, hence aria-hidden: it restates `activeIndex`,
                  which is derived from scroll position, and a screen-reader
                  visitor is reading the panels in document order rather than
                  scrubbing a rail. */}
                <div className={styles.progress} aria-hidden="true">
                  {stories.map((other, i) => (
                    <span
                      key={other.index}
                      className={
                        i === activeIndex
                          ? `${styles.tick} ${styles.tickActive}`
                          : styles.tick
                      }
                    />
                  ))}
                </div>

                {/* A second copy of those three positions used to be drawn
                  vertically at the far right, to fill the panel's empty right
                  margin. It is gone: by its own description it restated the
                  indicator directly above it, which itself restates scroll
                  position, so the panel carried the same one fact three
                  times. The margin is left empty on purpose — an empty margin
                  in an editorial layout is a measure, not a gap to fill, and
                  the panel now has exactly one progress indicator, which is
                  the one a visitor can act on. */}
              </article>
            )
          })}
        </div>
      </div>

      {/* Featured → Hardware transition: same minimal hairline-seam motif
          used at every prior section boundary, picked up by Hardware's
          matching top seam (see Hardware.module.css's .seam). Purely
          additive — nothing else in the approved Featured composition
          changes. */}
      <span className={styles.seamEnd} aria-hidden="true" />
    </section>
  )
}

export default Featured
