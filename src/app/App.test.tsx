import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { en } from '../i18n/en'

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
        name: en.hero.headlineLabel,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(en.hero.support)).toBeInTheDocument()
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

  it('labels the generated Creator, Hardware, and Closing artwork as illustrative', () => {
    render(<App />)

    const disclosures = screen.getAllByText(en.creator.imageDisclosure)
    expect(disclosures).toHaveLength(3)
    disclosures.forEach((disclosure) => {
      expect(disclosure.tagName).toBe('FIGCAPTION')
      expect(disclosure.closest('[aria-hidden="true"]')).toBeNull()
    })
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
    expect(h1s[0]).toHaveAccessibleName(en.hero.headlineLabel)

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
    // Closing is the last section, and its headline is art-directed onto two
    // lines, so match its accessible name rather than run-together text.
    expect(main).toContainElement(
      screen.getByRole('heading', {
        level: 2,
        name: /^good tech\. no guesswork\.$/i,
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
    expect(h2s.at(-1)).toHaveAccessibleName(/^good tech\. no guesswork\.$/i)
  })

  it('renders the Closing section with its statement, creator image, disclaimer, and section links', () => {
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
        name: /^good tech\. no guesswork\.$/i,
      }),
    ).toBeInTheDocument()
    expect(closing?.querySelector('img')).toHaveAttribute('alt', '')
    expect(closing?.querySelector('img')).toHaveAttribute('loading', 'lazy')
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

    const storiesLink = within(closing as HTMLElement).getByRole('link', {
      name: /explore the stories/i,
    })
    const creatorLink = within(closing as HTMLElement).getByRole('link', {
      name: /meet the creator/i,
    })
    expect(storiesLink).toHaveAttribute('href', '#featured')
    expect(creatorLink).toHaveAttribute('href', '#creator')
    expect(document.querySelector('#featured')).toBeInTheDocument()
    expect(document.querySelector('#creator')).toBeInTheDocument()
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
    expect(within(footer).getByText(en.footer.credit)).toBeInTheDocument()
    expect(footer.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(3)
    expect(footer.querySelectorAll('span[class*="columnRule"]')).toHaveLength(2)
    expect(
      within(footer).getByRole('link', {
        name: `CarterPCs — ${en.footer.a11y.home}`,
      }),
    ).toHaveAttribute('href', '#hero')

    // The full footer disclosure is not an exact repeat of Closing's shorter
    // independent-concept line.
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
    expect(footer.querySelectorAll('a')).toHaveLength(8)
    expect(footer.querySelectorAll('a[href^="#"]')).toHaveLength(5)
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

    // The only figures are the copyright year and the explicitly requested
    // fan-since year.
    const digits = (footer.innerText ?? footer.textContent ?? '').match(/\d+/g)
    expect(digits).toEqual(['2026', '15', '2023'])
  })

  it('matches the studio Hero reference without invented social proof', () => {
    render(<App />)
    const hero = document.querySelector('#hero') as HTMLElement
    expect(hero.querySelectorAll('aside')).toHaveLength(1)
    expect(hero.textContent).not.toMatch(/Featured in|Forbes|Dozens/i)
    expect(
      within(hero).getByRole('link', { name: /Explore the Universe/ }),
    ).toHaveAttribute('href', '#content-universe')
    expect(
      within(hero).getByRole('link', { name: /Watch the Shorts/ }),
    ).toHaveAttribute('href', '#featured')
    expect(
      Array.from(hero.querySelectorAll('a[class*="tile_"]')).map((a) =>
        a.getAttribute('href'),
      ),
    ).toEqual(['#hardware', '#featured', '#content-universe'])
    expect(hero.querySelectorAll('img')).toHaveLength(4)
    expect(within(hero).getByText(en.hero.eyebrow)).toBeInTheDocument()
    expect(within(hero).getByText(en.hero.statsSource)).toBeInTheDocument()
    for (const tile of Object.values(en.hero.tiles)) {
      expect(within(hero).getByText(tile.body)).toBeInTheDocument()
    }
    expect(
      within(hero).getByRole('link', { name: /YouTube —/ }),
    ).toHaveAttribute('target', '_blank')
    expect(within(hero).getByText(en.hero.disclaimer)).toBeInTheDocument()
    expect(within(hero).getByText(en.hero.imageDisclosure)).toHaveAttribute(
      'id',
      'hero-image-disclosure',
    )
    expect(hero.querySelector('figure')).toHaveAttribute(
      'aria-describedby',
      'hero-image-disclosure',
    )
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

  it('keeps Closing links internal and adds no contact details or audience claims', () => {
    render(<App />)

    const closing = document.querySelector('#closing') as HTMLElement

    // Both calls to action point to existing sections on this site.
    const links = Array.from(closing.querySelectorAll('a'))
    expect(links).toHaveLength(2)
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#featured',
      '#creator',
    ])
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
        name: en.hero.headlineLabel,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(en.hero.support)).toBeInTheDocument()
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
    // and both internal links must already be in their resting state.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /^good tech\. no guesswork\.$/i,
      }),
    ).toBeInTheDocument()
    expect(
      within(document.querySelector('#closing') as HTMLElement).getByText(
        /^independent creative concept\.$/i,
      ),
    ).toBeInTheDocument()
    expect(
      within(document.querySelector('#closing') as HTMLElement).getByRole(
        'link',
        { name: /explore the stories/i },
      ),
    ).toBeInTheDocument()
    expect(
      within(document.querySelector('#closing') as HTMLElement).getByRole(
        'link',
        { name: /meet the creator/i },
      ),
    ).toBeInTheDocument()
  })
})
