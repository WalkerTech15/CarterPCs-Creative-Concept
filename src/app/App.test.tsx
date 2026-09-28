import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { en } from '../i18n/en'
import { fr } from '../i18n/fr'
import { es } from '../i18n/es'
import type { Language } from '../i18n'
import { getFeaturedStories } from '../data/featured'
import { getHardwareBeats } from '../data/hardware'
import { getContentCategories } from '../data/contentUniverse'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

/**
 * The centre link row is display:none below the desktop breakpoint, and the
 * injected module CSS makes that jsdom's reality too — so destination
 * assertions go through the sections disclosure, the same control a phone
 * visitor uses. Bar row, menu and footer all render from the ONE shared
 * SECTION_HREFS × nav.sections pairing, so verifying the menu verifies the
 * map itself.
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

describe('App', () => {
  beforeEach(() => {
    // The provider seeds its initial language from local storage, so a value
    // left behind by an earlier test would silently change the language every
    // assertion below is written against.
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the skip link, navigation, and Hero heading', () => {
    render(<App />)

    expect(
      screen.getByRole('link', { name: /skip to content/i }),
    ).toHaveAttribute('href', '#main-content')

    expect(
      screen.getByRole('navigation', { name: /primary/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^carterpcs$/i })).toHaveAttribute(
      'href',
      '#hero',
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /^carterpcs — built different$/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/making tech interesting\./i)).toBeInTheDocument()
  })

  // #creator has two intentional entries with honestly-related labels: the
  // "About Carter" utility pill and the centre row's "Process" — plus the
  // footer echo. The pill is the one asserted here; "Process" is covered by
  // the destination-map test below.
  it('has a real navigation link to the Creator section', () => {
    render(<App />)

    expect(
      screen.getByRole('link', { name: /^about carter$/i }),
    ).toHaveAttribute('href', '#creator')
  })

  // Issue-1 regression guard: every primary destination is intentional —
  // one label per section, no two labels sharing an anchor (the reference's
  // six labels used to make six promises about four destinations).
  it('maps each primary-navigation label to its own distinct section', async () => {
    const user = userEvent.setup()
    render(<App />)

    const menu = await openSectionsMenu(user)
    const items = menu.getAllByRole('menuitem')
    expect(
      items.map((item) => [
        item.textContent?.trim(),
        item.getAttribute('href'),
      ]),
    ).toEqual([
      ['Work', '#featured'],
      ['Systems', '#hardware'],
      ['Process', '#creator'],
      ['Universe', '#content-universe'],
    ])
    // No duplicate destinations among the section links.
    const hrefs = items.map((item) => item.getAttribute('href'))
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('renders the Creator section with an accessible heading and content', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /hardware knowledge/i,
      }),
    ).toBeInTheDocument()
    // Scoped to the section: "TikTok" is also a Footer destination now.
    const creator = within(document.querySelector('#creator') as HTMLElement)
    expect(creator.getByText(/tiktok/i)).toBeInTheDocument()
    expect(creator.getByText(/youtube shorts/i)).toBeInTheDocument()
  })

  // "Work" is the Featured entry — asserted through the disclosure, the
  // control below-desktop visitors actually use (see openSectionsMenu).
  it('has a real navigation link to the Featured section', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      (await openSectionsMenu(user)).getByRole('menuitem', {
        name: /^work$/i,
      }),
    ).toHaveAttribute('href', '#featured')
  })

  // Featured's own behaviour — click-to-play, the action rail — is covered
  // in sections/featured/Featured.test.tsx. The page-level half of the
  // click-to-play promise stays here: nothing on the whole page embeds.
  it('loads no YouTube iframe anywhere on first render', () => {
    render(<App />)

    expect(document.querySelectorAll('iframe')).toHaveLength(0)
  })

  // "Systems" is the reference bar's Hardware entry.
  it('has a real navigation link to the Hardware section', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      (await openSectionsMenu(user)).getByRole('menuitem', {
        name: /^systems$/i,
      }),
    ).toHaveAttribute('href', '#hardware')
  })

  it('renders the Hardware section with an accessible heading and all three beats', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /built from the inside out/i,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/^build$/i)).toBeInTheDocument()
    expect(screen.getByText(/^components$/i)).toBeInTheDocument()
    expect(screen.getByText(/^performance$/i)).toBeInTheDocument()
  })

  it('has a real navigation link to the Content Universe section', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      (await openSectionsMenu(user)).getByRole('menuitem', {
        name: /^universe$/i,
      }),
    ).toHaveAttribute('href', '#content-universe')
  })

  it('renders the Content Universe section with an accessible heading and all six content categories', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 2, name: /six territories/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /pc hardware & custom builds/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /smartphones & mobile tech/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /tech news & controversies/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /scam tech & budget gear/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /emerging tech & ai tools/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /community & storytelling/i,
      }),
    ).toBeInTheDocument()

    // The closing index line resolves all six into one connected list.
    expect(
      screen.getByText(
        /hardware.*mobile tech.*tech news.*scam tech.*emerging tech.*community/i,
      ),
    ).toBeInTheDocument()
  })

  it('has a main landmark containing Hero, Creator, Featured, Hardware, Content Universe, and Closing with no duplicate headings and logical heading order', () => {
    render(<App />)

    const main = screen.getByRole('main')
    const h1s = screen.getAllByRole('heading', { level: 1 })
    const h2s = screen.getAllByRole('heading', { level: 2 })

    expect(h1s).toHaveLength(1)
    expect(main).toContainElement(h1s[0])
    // The visible headline is art-directed onto two lines and hidden from
    // the a11y tree; the h1's aria-label keeps the CarterPCs identity
    // intact rather than exposing only the editorial phrase.
    expect(h1s[0]).toHaveAccessibleName(/^carterpcs — built different$/i)

    // One h2 per major section (Creator, Featured, Hardware, Content
    // Universe, Closing) — not a duplicate.
    const h2Names = h2s.map((h) => h.textContent)
    expect(new Set(h2Names).size).toBe(h2Names.length)
    expect(main).toContainElement(
      screen.getByRole('heading', { level: 2, name: /hardware knowledge/i }),
    )
    expect(main).toContainElement(
      screen.getByRole('heading', { level: 2, name: /selected stories/i }),
    )
    expect(main).toContainElement(
      screen.getByRole('heading', {
        level: 2,
        name: /built from the inside out/i,
      }),
    )
    expect(main).toContainElement(
      screen.getByRole('heading', { level: 2, name: /six territories/i }),
    )
    // Closing is the last section, and its heading is art-directed onto two
    // lines the same way the Hero's h1 is — so it is matched on its
    // accessible name, not on the run-together text content.
    expect(main).toContainElement(
      screen.getByRole('heading', {
        level: 2,
        name: /^making tech interesting\.$/i,
      }),
    )

    // Logical order: h1 first, then h2s in section order (Creator,
    // Featured, Hardware, Content Universe, Closing) — no skipped or
    // out-of-order levels.
    const headingOrder = screen
      .getAllByRole('heading')
      .map((h) => Number(h.tagName[1]))
    expect(headingOrder[0]).toBe(1)
    expect(headingOrder.slice(1).every((level) => level >= 2)).toBe(true)
    expect(h2s.at(-2)).toHaveAccessibleName(/six territories/i)
    expect(h2s.at(-1)).toHaveAccessibleName(/^making tech interesting\.$/i)
  })

  it('renders the Closing section with the identity, statement, disclaimer, and a back-to-top link', () => {
    render(<App />)

    const closing = document.querySelector('#closing')
    expect(closing).toBeInTheDocument()

    // Directly after Content Universe, and the last thing in main.
    const main = screen.getByRole('main')
    expect(main.lastElementChild).toBe(closing)
    expect(
      document.querySelector('#content-universe')?.nextElementSibling,
    ).toBe(closing)

    expect(closing).toHaveTextContent('CarterPCs')
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /^making tech interesting\.$/i,
      }),
    ).toBeInTheDocument()
    // Scoped to the section: "Independent creative concept." belongs to the
    // Closing statement and is stated here only.
    expect(
      within(closing as HTMLElement).getByText(
        /^independent creative concept\.$/i,
      ),
    ).toBeInTheDocument()
    expect(
      within(closing as HTMLElement).getByText(
        /^not affiliated with carterpcs\.$/i,
      ),
    ).toBeInTheDocument()

    const backToTop = screen.getByRole('link', { name: /back to top/i })
    expect(closing).toContainElement(backToTop)
    expect(backToTop).toHaveAttribute('href', '#hero')
    // The target it claims to return to actually exists.
    expect(document.querySelector('#hero')).toBeInTheDocument()
  })

  it('renders the Footer after main as a contentinfo landmark, with the same destinations as the bar', async () => {
    const user = userEvent.setup()
    render(<App />)

    const footer = screen.getByRole('contentinfo')
    const main = screen.getByRole('main')

    // A landmark of its own — not part of the document's main content.
    expect(main).not.toContainElement(footer)
    expect(main.compareDocumentPosition(footer)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    const footerNav = within(
      within(footer).getByRole('navigation', {
        name: en.footer.a11y.footerNavigation,
      }),
    )
    // Same labels, same targets, same order as the bar — both read the one
    // shared list in components/navigation/sections.ts. The bar side is read
    // from its sections disclosure (the centre row is hidden below desktop,
    // which is jsdom's reality too — see openSectionsMenu).
    const sectionsMenu = await openSectionsMenu(user)
    en.nav.sections.forEach((label) => {
      const barItem = sectionsMenu.getByRole('menuitem', { name: label })
      const footerLink = footerNav.getByRole('link', { name: label })
      expect(footerLink).toHaveAttribute(
        'href',
        barItem.getAttribute('href') as string,
      )
    })
    expect(footerNav.getAllByRole('link')).toHaveLength(4)

    expect(
      within(footer).getByText('© 2026 CarterPCs Portfolio Concept'),
    ).toBeInTheDocument()
    expect(within(footer).getByText(en.footer.disclaimer)).toBeInTheDocument()

    // The footer states the affiliation disclaimer ONCE and does not repeat
    // the Closing statement's "Independent creative concept." line.
    expect(
      within(footer).queryByText(/^independent creative concept\.$/i),
    ).toBeNull()
  })

  it('links to exactly the three supplied social destinations, opened safely', () => {
    render(<App />)

    const footer = screen.getByRole('contentinfo')
    const expected = [
      ['YouTube', 'https://www.youtube.com/@actuallycarterpcs'],
      ['Instagram', 'https://www.instagram.com/carterpcs_/?hl=en'],
      ['TikTok', 'https://www.tiktok.com/@carterpcs?lang=en'],
    ]

    const external = Array.from(
      footer.querySelectorAll('a[href^="http"]'),
    ) as HTMLAnchorElement[]
    expect(external).toHaveLength(3)

    external.forEach((link, index) => {
      const [name, href] = expected[index]
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noreferrer')
      // The visible platform name STARTS the accessible name, so the
      // new-tab warning does not replace the label (WCAG 2.5.3).
      expect(link).toHaveAccessibleName(
        `${name} — ${en.footer.a11y.opensInNewTab}`,
      )
      expect(link.textContent).toContain(name)
    })
  })

  it('invents nothing in the Footer — no extra destinations, contact details, or counts', () => {
    render(<App />)

    const footer = screen.getByRole('contentinfo') as HTMLElement

    // Four internal (one per real section) + three external, nothing else.
    expect(footer.querySelectorAll('a')).toHaveLength(7)
    expect(footer.querySelectorAll('a[href^="#"]')).toHaveLength(4)
    expect(footer.querySelectorAll('button, form, input')).toHaveLength(0)
    expect(footer.innerHTML).not.toMatch(/mailto:|tel:/i)

    // No other social destinations crept in.
    const hosts = Array.from(footer.querySelectorAll('a[href^="http"]')).map(
      (a) => new URL((a as HTMLAnchorElement).href).hostname,
    )
    expect(hosts).toEqual([
      'www.youtube.com',
      'www.instagram.com',
      'www.tiktok.com',
    ])

    // No follower counts or other figures: the only digits in visible text
    // are the copyright year.
    const digits = (footer.innerText ?? footer.textContent ?? '').match(/\d+/g)
    expect(digits).toEqual(['2026'])
  })

  it('claims no press coverage in the Hero — the row at its foot is the real channels, not publications', () => {
    render(<App />)

    const hero = document.querySelector('#hero') as HTMLElement

    // The six wordmarks that used to sit under a "Featured in" label are
    // gone, in every form: visible text, accessibility text, and markup. An
    // `aria-hidden` on that row was never enough — a sighted visitor reads a
    // list of publication names under "Featured in" as a claim, and this
    // project has no source for any of them.
    for (const name of [
      'Featured in',
      'Forbes',
      'The Verge',
      'HYPEBEAST',
      'Linus Tech Tips',
      'uncrate',
    ]) {
      expect(hero.innerHTML).not.toMatch(new RegExp(name, 'i'))
    }
    expect(hero.querySelectorAll('img[src*="apple"]')).toHaveLength(0)

    // What replaced it goes to the same three real destinations the footer
    // uses, from the same shared list — and is NOT hidden from assistive
    // tech, because unlike the row it replaced it is real.
    const external = Array.from(
      hero.querySelectorAll('a[href^="http"]'),
    ) as HTMLAnchorElement[]
    expect(external.map((a) => a.href)).toEqual([
      'https://www.youtube.com/@actuallycarterpcs',
      'https://www.instagram.com/carterpcs_/?hl=en',
      'https://www.tiktok.com/@carterpcs?lang=en',
    ])
    external.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noreferrer')
      expect(link.closest('[aria-hidden="true"]')).toBeNull()
    })

    // The unofficial/non-affiliation message stays exactly where it was.
    expect(screen.getByText(en.hero.disclaimer)).toBeInTheDocument()
  })

  it('states no figure the cited reading does not clear, and dates the ones it shows', () => {
    render(<App />)

    const hero = document.querySelector('#hero') as HTMLElement
    const stats = document.querySelector('#hero aside:last-of-type')
      ?.textContent as string

    // Rounded DOWN from 2.94M / 6,868,093,822 (see Hero.tsx's STATS note):
    // a "+" is a floor claim, so the old 3.0M+/7.0B+ overstated the source.
    expect(stats).toContain('2.9M+')
    expect(stats).toContain('6.8B+')
    expect(hero.textContent).not.toContain('3.0M+')
    expect(hero.textContent).not.toContain('7.0B+')

    // The build count stays qualitative — no counter exists to invent from.
    expect(stats).toContain(en.hero.stats.dozens)

    // And the figures carry their date somewhere a visitor can read it, not
    // only in a source comment. It sits in the Hero's fine-print row rather
    // than in the card itself — see Hero.tsx for the measured reason.
    expect(screen.getByText(en.hero.statsSource)).toBeInTheDocument()

    // Exactly three values, and the third is a word rather than a figure —
    // read off the value elements themselves, because the card's textContent
    // runs its "02" index straight into the first value.
    const values = Array.from(
      document.querySelectorAll(
        '#hero aside:last-of-type li > span:first-child',
      ),
    ).map((el) => el.textContent)
    expect(values).toEqual(['2.9M+', '6.8B+', en.hero.stats.dozens])
  })

  it('points the Content Universe media slots at real Shorts rather than placeholders', () => {
    render(<App />)

    const universe = document.querySelector('#content-universe') as HTMLElement

    // The two tier-1 territories link to the same two videos Featured plays,
    // resolved from the same data — never a second URL for the same Short.
    const links = Array.from(
      universe.querySelectorAll('a[href^="http"]'),
    ) as HTMLAnchorElement[]
    expect(links.map((a) => a.href)).toEqual([
      'https://www.youtube.com/shorts/JekaYRzZRfU',
      'https://www.youtube.com/shorts/1iBOP4Gyfi8',
    ])

    // Each names the Short it opens and says that it leaves the page, so the
    // poster is never an unlabelled image that happens to be clickable.
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noreferrer')
      expect(link.getAttribute('aria-label')).toMatch(
        new RegExp(en.featured.a11y.opensInNewTab, 'i'),
      )
      // The poster is decorative INSIDE a link that is already named.
      expect(link.querySelector('img')).toHaveAttribute('alt', '')
    })

    // No empty decorative crop survives anywhere in the section.
    expect(universe.querySelectorAll('[data-dev-placeholder]')).toHaveLength(0)
  })

  it('invents nothing in the Closing section — no links other than back-to-top, and no contact or audience claims', () => {
    render(<App />)

    const closing = document.querySelector('#closing') as HTMLElement

    // The back-to-top control is the ONLY interactive element in the section.
    const links = Array.from(closing.querySelectorAll('a'))
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '#hero')
    expect(closing.querySelectorAll('button, form, input')).toHaveLength(0)

    // No external destinations, mail/tel handles, or social handles.
    expect(closing.innerHTML).not.toMatch(/https?:|mailto:|tel:|@/i)
    // No invented figures — the section carries no numbers except its own
    // decorative section numeral, which is aria-hidden.
    const visibleText = Array.from(closing.querySelectorAll('*'))
      .filter((el) => !el.closest('[aria-hidden="true"]'))
      .map((el) => el.textContent)
      .join(' ')
    expect(visibleText).not.toMatch(/\d/)
  })

  it('renders Hero, Creator, Featured, Hardware, Content Universe, and Closing content immediately when reduced motion is preferred', () => {
    mockMatchMedia(true)
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /^carterpcs — built different$/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/making tech interesting\./i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /hardware knowledge/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /selected stories/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /best pc/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /built from the inside out/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/^build$/i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /six territories/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /pc hardware & custom builds/i,
      }),
    ).toBeInTheDocument()
    // Closing's reveal is skipped entirely under reduced motion, so its copy
    // and its one control must already be in their resting state.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /^making tech interesting\.$/i,
      }),
    ).toBeInTheDocument()
    expect(
      within(document.querySelector('#closing') as HTMLElement).getByText(
        /^independent creative concept\.$/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /back to top/i }),
    ).toBeInTheDocument()
  })
})

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

      // Hero — headline, CTAs, both cards, tiles, disclaimer
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: dictionary.hero.headlineLabel,
        }),
      ).toBeInTheDocument()
      expect(screen.getByText(dictionary.hero.support)).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: new RegExp(dictionary.hero.ctaPrimary, 'i'),
        }),
      ).toBeInTheDocument()
      expect(screen.getByText(dictionary.hero.statsTitle)).toBeInTheDocument()
      expect(
        screen.getByText(dictionary.hero.stats.subscribers),
      ).toBeInTheDocument()
      expect(screen.getByText(dictionary.hero.stats.dozens)).toBeInTheDocument()
      expect(
        screen.getByText(dictionary.hero.tiles.universe.body),
      ).toBeInTheDocument()
      expect(screen.getByText(dictionary.hero.disclaimer)).toBeInTheDocument()

      // The verified figures are NOT localized — see Hero.tsx's STATS note.
      // Both round DOWN from the cited reading (2.94M / 6.87B): a "+" figure
      // is a floor claim, so rounding up would overstate the source.
      expect(screen.getByText('2.9M+')).toBeInTheDocument()
      expect(screen.getByText('6.8B+')).toBeInTheDocument()

      // The dated provenance line beneath them IS localized.
      expect(screen.getByText(dictionary.hero.statsSource)).toBeInTheDocument()

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
        screen.getByText(stories[0].category, { selector: 'p' }),
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

/**
 * Preference-menu open/close behaviour.
 *
 * The CSS-only version these replaced could not close at all once an option
 * was chosen — the selected item still held focus, so `:focus-within` pinned
 * the panel open — and exposed no `aria-expanded` for assistive tech to read.
 * Each case below locks in one of the behaviours that regression produced.
 */
describe('preference menus', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const trigger = (name: RegExp | string) =>
    screen.getByRole('button', { name })

  it('reports its state through aria-expanded and opens on click', async () => {
    const user = userEvent.setup()
    render(<App />)

    const languageTrigger = trigger(en.a11y.chooseLanguage)
    expect(languageTrigger).toHaveAttribute('aria-expanded', 'false')
    expect(languageTrigger).toHaveAttribute('aria-haspopup', 'menu')

    await user.click(languageTrigger)
    expect(languageTrigger).toHaveAttribute('aria-expanded', 'true')

    // aria-controls points at the menu it actually owns.
    const controlled = languageTrigger.getAttribute('aria-controls')
    expect(
      screen.getByRole('menu', { name: en.a11y.languageMenu, hidden: true }),
    ).toHaveAttribute('id', controlled)
  })

  it('closes immediately after an option is selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(trigger(en.a11y.chooseTheme))
    expect(trigger(en.a11y.chooseTheme)).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.click(menuOption(en.nav.themes.light))

    // The selection applied AND the menu closed, with focus handed back to
    // the trigger rather than left on a now-hidden item.
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(trigger(en.a11y.chooseTheme)).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(trigger(en.a11y.chooseTheme)).toHaveFocus()
  })

  it('keeps the checked state on the selected item', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(trigger(en.a11y.chooseTheme))
    await user.click(menuOption(en.nav.themes.light))
    await user.click(trigger(en.a11y.chooseTheme))

    expect(menuOption(en.nav.themes.light)).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(menuOption(en.nav.themes.dark)).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(trigger(en.a11y.chooseLanguage))
    expect(trigger(en.a11y.chooseLanguage)).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.keyboard('{Escape}')

    expect(trigger(en.a11y.chooseLanguage)).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(trigger(en.a11y.chooseLanguage)).toHaveFocus()
    // Escape must not have applied anything.
    expect(document.documentElement.lang).toBe('en')
  })

  it('closes when focus moves outside the menu', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(trigger(en.a11y.chooseLanguage))
    expect(trigger(en.a11y.chooseLanguage)).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    screen.getByRole('link', { name: en.nav.about }).focus()

    await waitFor(() =>
      expect(trigger(en.a11y.chooseLanguage)).toHaveAttribute(
        'aria-expanded',
        'false',
      ),
    )
  })

  it('closes the previously open menu when the other one opens', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(trigger(en.a11y.chooseTheme))
    await user.click(trigger(en.a11y.chooseLanguage))

    expect(trigger(en.a11y.chooseTheme)).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(trigger(en.a11y.chooseLanguage)).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('opens from the keyboard and moves between items with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<App />)

    trigger(en.a11y.chooseTheme).focus()
    await user.keyboard('{ArrowDown}')

    await waitFor(() => expect(menuOption(en.nav.themes.dark)).toHaveFocus())

    await user.keyboard('{ArrowDown}')
    expect(menuOption(en.nav.themes.light)).toHaveFocus()

    await user.keyboard('{End}')
    expect(menuOption(en.nav.themes.system)).toHaveFocus()

    await user.keyboard('{Home}')
    expect(menuOption(en.nav.themes.dark)).toHaveFocus()

    // Enter on the focused item selects it and closes, same as a click.
    await user.keyboard('{Enter}')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(trigger(en.a11y.chooseTheme)).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
