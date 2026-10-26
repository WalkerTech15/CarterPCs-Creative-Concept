import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { en } from '../i18n/en'
import { fr } from '../i18n/fr'
import { es } from '../i18n/es'
import type { Language } from '../i18n'
import { getFeaturedStories } from '../data/featured'
import { getHardwareBeats } from '../data/hardware'
import { getContentCategories } from '../data/contentUniverse'

/**
 * The centre link row is display:none below the desktop breakpoint, and the
 * injected module CSS makes that jsdom's reality too — so destination
 * assertions go through the sections disclosure, the same control a phone
 * visitor uses. Bar row, menu and footer all render from the ONE shared
 * SECTION_HREFS × nav.sections pairing, so verifying the menu verifies the
 * map itself.
 *
 * Duplicated from App.test.tsx's own copy rather than shared from a test-
 * helpers module: it is six lines, used once here, and keeping this file
 * readable top-to-bottom without a side trip outweighs the duplication.
 */
async function openSectionsMenu(
  user: ReturnType<typeof userEvent.setup>,
  a11y: { chooseSections: string; sectionsMenu: string } = en.a11y,
) {
  await user.click(screen.getByRole('button', { name: a11y.chooseSections }))
  return within(screen.getByRole('menu', { name: a11y.sectionsMenu }))
}

/**
 * Matches an accessible name by its leading visible label. A function matcher
 * rather than a regex, so the titles' `$`, `?` and `.` need no escaping.
 */
const startsWith = (label: string) => (name: string) => name.startsWith(label)

/**
 * Localization coverage.
 *
 * The completeness check below is deliberately generated rather than a
 * hand-written list of phrases: it walks the English dictionary AND the three
 * data files, keeps every string whose translation actually differs, and then
 * asserts none of those English originals survive in the rendered French or
 * Spanish page. Adding a new English string without translating it therefore
 * fails this test automatically — the previous pass shipped with most
 * long-form copy still in English precisely because nothing checked for it.
 */

/**
 * Deterministic depth-first walk over every string leaf. Keys are sorted so
 * two dictionaries of the same type produce index-aligned arrays, which is
 * what lets an English string be compared against its own translation without
 * threading key paths through the comparison.
 */
function flattenStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(flattenStrings)
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.keys(record)
      .sort()
      .flatMap((key) => flattenStrings(record[key]))
  }
  return []
}

function allStrings(language: Language) {
  return [
    ...flattenStrings({ en, fr, es }[language]),
    ...flattenStrings(getFeaturedStories(language)),
    ...flattenStrings(getHardwareBeats(language)),
    ...flattenStrings(getContentCategories(language)),
  ]
}

/**
 * Rendered copy, one text node per line. `document.body.textContent` welds
 * adjacent elements together with no separator ("…FeaturedSelected Stories…"),
 * which defeats the whole-phrase matching below; splitting on node boundaries
 * gives every phrase a real edge to match against.
 */
function renderedText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const lines: string[] = []
  let node = walker.nextNode()
  while (node) {
    lines.push((node.textContent ?? '').trim())
    node = walker.nextNode()
  }
  return lines.join('\n')
}

/** Matches a phrase only as a whole, so "Impact" never matches "Impacto". */
function containsPhrase(haystack: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^\\p{L}])${escaped}([^\\p{L}]|$)`, 'u').test(haystack)
}

/**
 * The dropdowns are closed (`display: none`) until their trigger is
 * activated, so the accessibility tree hides their items from a default
 * `getByRole` query. Opening first mirrors what a real visitor does.
 */
async function openMenu(
  user: ReturnType<typeof userEvent.setup>,
  triggerName: RegExp | string,
) {
  await user.click(screen.getByRole('button', { name: triggerName }))
}

function menuOption(name: RegExp | string) {
  return screen.getByRole('menuitemradio', { name, hidden: true })
}

/** Opens the language menu and picks an option in one step. */
async function chooseLanguage(
  user: ReturnType<typeof userEvent.setup>,
  triggerName: RegExp | string,
  optionName: RegExp | string,
) {
  await openMenu(user, triggerName)
  await user.click(menuOption(optionName))
}

/**
 * English phrases that MUST have disappeared once `language` is selected:
 * long enough to be real copy rather than a shared loanword ("Tech", "Impact",
 * "Performance" are legitimately identical in at least one target language),
 * genuinely different from their translation, and actually visible in the
 * English render — accessible names and <head> metadata are asserted
 * separately since they never appear in body text.
 */
function untranslatedSentinels(language: Language, englishBodyText: string) {
  const source = allStrings('en')
  const target = allStrings(language)
  return source.filter(
    (value, index) =>
      value.length >= 12 &&
      value !== target[index] &&
      containsPhrase(englishBodyText, value),
  )
}

describe('localization', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.lang = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to English and records it on the document', () => {
    render(<App />)

    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe(en.meta.title)
    expect(screen.getByText(en.hero.support)).toBeInTheDocument()
  })

  it.each([
    ['fr' as const, fr],
    ['es' as const, es],
  ])('restores a stored %s preference on load', (language, dictionary) => {
    window.localStorage.setItem('carterpcs-language', language)
    render(<App />)

    expect(document.documentElement.lang).toBe(language)
    expect(screen.getByText(dictionary.hero.support)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: dictionary.hardware.headline,
      }),
    ).toBeInTheDocument()
  })

  it('falls back to English when the stored language is not one we support', () => {
    window.localStorage.setItem('carterpcs-language', 'de')
    render(<App />)

    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByText(en.hero.support)).toBeInTheDocument()
  })

  it.each([
    ['fr' as const, fr, /^french$/i],
    ['es' as const, es, /^spanish$/i],
  ])(
    'switches every section to %s immediately, with no reload',
    async (language, dictionary, menuLabel) => {
      const user = userEvent.setup()
      render(<App />)

      await chooseLanguage(user, en.a11y.chooseLanguage, menuLabel)

      // Document state
      expect(document.documentElement.lang).toBe(language)
      expect(document.title).toBe(dictionary.meta.title)
      expect(window.localStorage.getItem('carterpcs-language')).toBe(language)

      // Navigation + skip link
      expect(
        screen.getByRole('link', { name: dictionary.a11y.skipToContent }),
      ).toHaveAttribute('href', '#main-content')
      const sectionsMenu = await openSectionsMenu(user, dictionary.a11y)
      expect(
        sectionsMenu.getByRole('menuitem', {
          name: dictionary.nav.sections[0],
        }),
      ).toHaveAttribute('href', '#featured')
      // Close it again so the remaining assertions read the settled page.
      await user.keyboard('{Escape}')
      expect(
        screen.getByRole('link', { name: dictionary.nav.about }),
      ).toHaveAttribute('href', '#creator')
      expect(
        screen.getByRole('navigation', {
          name: dictionary.a11y.primaryNavigation,
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: dictionary.a11y.chooseLanguage }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: dictionary.a11y.chooseTheme }),
      ).toBeInTheDocument()

      // Hero — live headline, real CTA destinations, tiles and disclosure.
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: dictionary.hero.headlineLabel,
        }),
      ).toBeInTheDocument()
      expect(screen.getByText(dictionary.hero.support)).toBeInTheDocument()
      expect(
        within(document.querySelector('#hero') as HTMLElement).getByRole(
          'link',
          {
            name: new RegExp(dictionary.hero.ctaPrimary, 'i'),
          },
        ),
      ).toBeInTheDocument()
      expect(
        within(document.querySelector('#hero') as HTMLElement).getByRole(
          'link',
          {
            name: new RegExp(dictionary.hero.ctaSecondary, 'i'),
          },
        ),
      ).toHaveAttribute('href', '#featured')
      expect(
        screen.getByText(dictionary.hero.tiles.universe.title),
      ).toBeInTheDocument()
      expect(screen.getByText(dictionary.hero.disclaimer)).toBeInTheDocument()
      expect(document.querySelector('#hero aside')).not.toBeNull()

      // Creator / Featured / Hardware / Content Universe section copy
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: dictionary.creator.headline,
        }),
      ).toBeInTheDocument()
      expect(screen.getByText(dictionary.creator.bodyOne)).toBeInTheDocument()
      expect(screen.getByText(dictionary.creator.tags)).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: dictionary.featured.title,
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: dictionary.hardware.headline,
        }),
      ).toBeInTheDocument()
      expect(screen.getByText(dictionary.hardware.tags)).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: dictionary.contentUniverse.headline,
        }),
      ).toBeInTheDocument()

      // Data-driven content: stories, beats, and categories
      const stories = getFeaturedStories(language)
      expect(screen.getByText(stories[0].support)).toBeInTheDocument()
      expect(
        screen.getByText(`${stories[0].index} — ${stories[0].category}`, {
          selector: 'p',
        }),
      ).toBeInTheDocument()
      expect(screen.getByText(stories[2].tags.join(' — '))).toBeInTheDocument()

      // The Shorts' player controls are interface, so they translate; the
      // video titles inside their accessible names stay English.
      expect(
        screen.getAllByRole('button', {
          name: startsWith(dictionary.featured.playShort),
        }),
      ).toHaveLength(3)
      // Every rail control translates too — the two links out, and the two
      // buttons that act on this page.
      expect(
        screen.getAllByRole('link', {
          name: startsWith(dictionary.featured.actions.watch),
        }),
      ).toHaveLength(3)
      expect(
        screen.getAllByRole('link', {
          name: startsWith(dictionary.featured.actions.comments),
        }),
      ).toHaveLength(3)
      expect(
        screen.getAllByRole('button', {
          name: startsWith(dictionary.featured.actions.like),
        }),
      ).toHaveLength(3)
      expect(
        screen.getAllByRole('button', {
          name: startsWith(dictionary.featured.actions.share),
        }),
      ).toHaveLength(3)
      // The required wording for the comments destination, in this language.
      expect(
        screen
          .getAllByRole('link', {
            name: startsWith(dictionary.featured.actions.comments),
          })[0]
          .getAttribute('aria-label'),
      ).toContain(dictionary.featured.a11y.viewComments)

      const beats = getHardwareBeats(language)
      expect(screen.getByText(beats[0].label)).toBeInTheDocument()
      expect(screen.getByText(beats[2].description)).toBeInTheDocument()

      const categories = getContentCategories(language)
      for (const category of categories) {
        expect(
          screen.getByRole('heading', { level: 3, name: category.fullName }),
        ).toBeInTheDocument()
      }
      expect(screen.getByText(categories[0].description)).toBeInTheDocument()
    },
  )

  it.each([['fr' as const], ['es' as const]])(
    'leaves no English source copy visible in %s',
    async (language) => {
      const user = userEvent.setup()
      const { unmount } = render(<App />)
      const englishText = renderedText()
      unmount()

      const sentinels = untranslatedSentinels(language, englishText)
      // Guards the guard: a short sentinel list would make the assertion
      // below pass without covering much. Every section contributes several.
      expect(sentinels.length).toBeGreaterThan(50)

      render(<App />)
      await chooseLanguage(
        user,
        en.a11y.chooseLanguage,
        language === 'fr' ? /^french$/i : /^spanish$/i,
      )

      const translatedText = renderedText()
      const leaked = sentinels.filter((phrase) =>
        containsPhrase(translatedText, phrase),
      )
      expect(leaked).toEqual([])
    },
  )

  it('keeps the theme control working and independent of language', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseLanguage(user, en.a11y.chooseLanguage, /^french$/i)
    await openMenu(user, fr.a11y.chooseTheme)
    await user.click(menuOption(fr.nav.themes.light))

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('carterpcs-theme')).toBe('light')
    expect(document.documentElement.lang).toBe('fr')
  })
})
