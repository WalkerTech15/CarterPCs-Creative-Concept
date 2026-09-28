import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Featured from './Featured'
import { PreferencesProvider } from '../../app/Preferences'
import { en } from '../../i18n/en'
import { getFeaturedStories } from '../../data/featured'

/**
 * Featured's own behaviour, rendered on its own: the section needs nothing
 * from the page but the preferences provider. Page-level assertions — the
 * section's place in the landmark and heading order, its nav link, the
 * localized copy — stay in app/App.test.tsx.
 */
const renderFeatured = () =>
  render(
    <PreferencesProvider>
      <Featured />
    </PreferencesProvider>,
  )

/**
 * The published title of a Short. English in every language on purpose — see
 * the `featured` block in i18n/en.ts. Written out here rather than imported
 * from featured.utils.ts, so the names below are checked against an
 * independent derivation.
 */
const title = (story: { headlineLines: string[] }) =>
  story.headlineLines.join(' ')

/** Featured composes each control's accessible name as `visible label — title`. */
const playName = (story: { headlineLines: string[] }) =>
  `${en.featured.playShort} — ${title(story)}`

/**
 * Matches an accessible name by its leading visible label. A function matcher
 * rather than a regex, so the titles' `$`, `?` and `.` need no escaping.
 */
const startsWith = (label: string) => (name: string) => name.startsWith(label)

describe('Featured', () => {
  beforeEach(() => {
    // The provider seeds its initial language from local storage, so a value
    // left behind by an earlier test would silently change the language every
    // assertion below is written against.
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the Featured section with an accessible heading and all three stories', () => {
    renderFeatured()

    expect(
      screen.getByRole('heading', { level: 2, name: /selected stories/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 3, name: /best pc/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /apple copied/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /lenovo thinkpad/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/^hardware$/i, { selector: 'p' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/^tech$/i, { selector: 'p' })).toBeInTheDocument()
    expect(
      screen.getByText(/^commentary$/i, { selector: 'p' }),
    ).toBeInTheDocument()
  })

  /**
   * Featured's three Shorts are click-to-play. The assertions below are about
   * what the DOCUMENT contains, not about what is visible: an <iframe> that
   * exists has already opened a connection to YouTube, whether or not anyone
   * can see it.
   */
  it('loads no YouTube iframe until a story is played', () => {
    renderFeatured()

    // No embed in the section (App.test.tsx checks the whole page).
    expect(document.querySelectorAll('iframe')).toHaveLength(0)

    const featured = document.querySelector('#featured') as HTMLElement
    // Each story shows its own local poster and offers a real button instead.
    // Scoped to the media frames so only the three poster images are counted.
    expect(featured.querySelectorAll('[data-media-frame] img')).toHaveLength(3)
    expect(
      within(featured).getAllByRole('button', {
        name: startsWith(en.featured.playShort),
      }),
    ).toHaveLength(3)
    // The YouTube fallback still exists — it moved into the action rail as
    // "Watch on YouTube", and still leaves for the real Short.
    expect(
      within(featured).getAllByRole('link', {
        name: startsWith(en.featured.actions.watch),
      }),
    ).toHaveLength(3)
  })

  it('creates the privacy-enhanced embed for the story whose Play button is pressed', async () => {
    const user = userEvent.setup()
    renderFeatured()

    const [first] = getFeaturedStories('en')
    await user.click(screen.getByRole('button', { name: playName(first) }))

    const players = document.querySelectorAll('iframe')
    expect(players).toHaveLength(1)

    const src = players[0].getAttribute('src') ?? ''
    expect(src).toBe(`${first.embedUrl}&autoplay=1`)
    expect(src).toContain('https://www.youtube-nocookie.com/embed/JekaYRzZRfU')
    // The privacy-enhanced host, not the tracking one.
    expect(src).not.toContain('youtube.com/embed')
    expect(players[0]).toHaveAttribute(
      'title',
      `${en.featured.a11y.player} — ${title(first)}`,
    )
  })

  it('plays only one Short at a time — starting a second removes the first player', async () => {
    const user = userEvent.setup()
    renderFeatured()

    const [first, second] = getFeaturedStories('en')

    await user.click(screen.getByRole('button', { name: playName(first) }))
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
    expect(document.querySelector('iframe')?.getAttribute('src')).toContain(
      'JekaYRzZRfU',
    )
    // While it is playing, its own Play button is replaced by the player.
    expect(
      screen.queryByRole('button', { name: playName(first) }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: playName(second) }))

    // Still exactly one iframe, and it is the second story's — the first was
    // removed outright, not left paused in the background.
    const players = document.querySelectorAll('iframe')
    expect(players).toHaveLength(1)
    expect(players[0].getAttribute('src')).toContain('1iBOP4Gyfi8')
    expect(players[0].getAttribute('src')).not.toContain('JekaYRzZRfU')

    // ...and the first story is back to its poster and Play button.
    expect(
      screen.getByRole('button', { name: playName(first) }),
    ).toBeInTheDocument()
  })

  it('closes a player from the keyboard and restores its poster and focus', async () => {
    const user = userEvent.setup()
    renderFeatured()

    const [first] = getFeaturedStories('en')
    const play = screen.getByRole('button', { name: playName(first) })

    // Keyboard path: focus the control and press Enter, as a keyboard visitor
    // would, rather than synthesising a click.
    play.focus()
    await user.keyboard('{Enter}')

    expect(document.querySelectorAll('iframe')).toHaveLength(1)
    const close = screen.getByRole('button', {
      name: `${en.featured.closePlayer} — ${title(first)}`,
    })
    // Focus moves to the close control, so the player can be dismissed without
    // tabbing back through the section.
    await waitFor(() => expect(close).toHaveFocus())

    await user.keyboard('{Escape}')

    expect(document.querySelectorAll('iframe')).toHaveLength(0)
    const restored = screen.getByRole('button', { name: playName(first) })
    await waitFor(() => expect(restored).toHaveFocus())
  })

  /* ===== Action rail ===== */

  it('gives every story a four-action rail in order, with no invented counts', () => {
    renderFeatured()

    const featured = document.querySelector('#featured') as HTMLElement
    const rails = featured.querySelectorAll('[data-panel] [class*="actions"]')
    expect(rails).toHaveLength(3)

    const [first] = getFeaturedStories('en')
    const controls = Array.from(rails[0].querySelectorAll('button, a'))
    const labels = controls.map(
      (el) => (el.getAttribute('aria-label') ?? '').split(' — ')[0],
    )
    expect(labels).toEqual([
      en.featured.actions.like,
      en.featured.actions.comments,
      en.featured.actions.share,
      en.featured.actions.watch,
    ])

    // Nothing in the rail claims a number. A concept site has no like count,
    // no view count and no comment count to report, so it reports none.
    expect(rails[0].textContent).not.toMatch(/\d/)

    // Both links leave for the real Short, in a new tab, with no referrer.
    for (const link of Array.from(rails[0].querySelectorAll('a'))) {
      expect(link).toHaveAttribute('href', first.videoUrl)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noreferrer')
    }
  })

  it('toggles Like as a pressed state on this page only, one story at a time', async () => {
    const user = userEvent.setup()
    renderFeatured()

    const [first, second] = getFeaturedStories('en')
    const likeFirst = screen.getByRole('button', {
      name: `${en.featured.actions.like} — ${title(first)}`,
    })
    const likeSecond = screen.getByRole('button', {
      name: `${en.featured.actions.like} — ${title(second)}`,
    })

    expect(likeFirst).toHaveAttribute('aria-pressed', 'false')

    await user.click(likeFirst)
    expect(likeFirst).toHaveAttribute('aria-pressed', 'true')
    // Liking one story must not like the others.
    expect(likeSecond).toHaveAttribute('aria-pressed', 'false')
    // The name is stable across the state change — aria-pressed carries the
    // state, so a visitor can still refer to the control by the same name.
    expect(likeFirst).toHaveAccessibleName(
      `${en.featured.actions.like} — ${title(first)}`,
    )

    await user.click(likeFirst)
    expect(likeFirst).toHaveAttribute('aria-pressed', 'false')

    // Nothing left the page: no embed was created by liking.
    expect(document.querySelectorAll('iframe')).toHaveLength(0)
  })

  it('names the Comments link for where it actually goes', () => {
    renderFeatured()

    const [first] = getFeaturedStories('en')
    const link = screen.getAllByRole('link', {
      name: startsWith(en.featured.actions.comments),
    })[0]

    const name = link.getAttribute('aria-label') ?? ''
    // Visible label first (WCAG 2.5.3), then the required statement of
    // destination, then which Short, then the new-tab warning.
    expect(name.startsWith(en.featured.actions.comments)).toBe(true)
    expect(name).toContain(en.featured.a11y.viewComments)
    expect(name).toContain(title(first))
    expect(name).toContain(en.featured.a11y.opensInNewTab)
    // No local comments UI was built to go with it.
    expect(link).toHaveAttribute('href', first.videoUrl)
  })

  it('copies the Short’s URL from the keyboard and reports the result in a live region', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    renderFeatured()

    const [first] = getFeaturedStories('en')
    const share = screen.getByRole('button', {
      name: `${en.featured.actions.share} — ${title(first)}`,
    })

    // Keyboard, not a synthesised click: this control has to work on Enter.
    share.focus()
    await user.keyboard('{Enter}')

    expect(writeText).toHaveBeenCalledWith(first.videoUrl)
    const status = await screen.findByText(en.featured.actions.linkCopied)
    expect(status).toHaveAttribute('role', 'status')
  })

  it('says so when the clipboard refuses, rather than looking like it worked', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    })

    renderFeatured()

    const [first] = getFeaturedStories('en')
    await user.click(
      screen.getByRole('button', {
        name: `${en.featured.actions.share} — ${title(first)}`,
      }),
    )

    expect(
      await screen.findByText(en.featured.actions.copyFailed),
    ).toBeInTheDocument()
  })

  it('hands off to the platform share sheet when there is one, and copies nothing', async () => {
    const user = userEvent.setup()
    const share = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
    })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    renderFeatured()

    const [first] = getFeaturedStories('en')
    await user.click(
      screen.getByRole('button', {
        name: `${en.featured.actions.share} — ${title(first)}`,
      }),
    )

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: title(first),
        url: first.videoUrl,
      }),
    )
    expect(writeText).not.toHaveBeenCalled()
    // The share sheet reports its own outcome; the page does not double up.
    expect(
      screen.queryByText(en.featured.actions.linkCopied),
    ).not.toBeInTheDocument()

    Reflect.deleteProperty(navigator, 'share')
  })
})
