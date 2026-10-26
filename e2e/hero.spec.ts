import { test, expect } from '@playwright/test'
import { en } from '../src/i18n/en'
import { fr } from '../src/i18n/fr'
import { es } from '../src/i18n/es'

test('studio Hero follows the approved desktop composition with real links', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1585, height: 992 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() =>
    localStorage.setItem('carterpcs-theme', 'dark'),
  )
  await page.goto('/')
  const hero = page.locator('#hero')
  await expect(hero.getByRole('heading', { level: 1 })).toHaveAccessibleName(
    en.hero.headlineLabel,
  )
  await expect(hero.locator('aside')).toHaveCount(1)
  await expect(hero.getByText(en.hero.statsSource)).toBeVisible()
  await expect(hero.locator('img')).toHaveCount(4)
  await expect(
    hero.getByRole('link', { name: en.hero.ctaPrimary }),
  ).toHaveAttribute('href', '#content-universe')
  await expect(
    hero.getByRole('link', { name: en.hero.ctaSecondary }),
  ).toHaveAttribute('href', '#featured')
  const geometry = await hero.evaluate((el) => {
    const tile = el
      .querySelector('a[href="#hardware"]')!
      .getBoundingClientRect()
    const title = el.querySelector('h1')!.getBoundingClientRect()
    const cards = [...el.querySelectorAll('aside > div')].map((n) =>
      n.getBoundingClientRect(),
    )
    const actions = el
      .querySelector('[class*="actions_"]')!
      .getBoundingClientRect()
    return {
      tileX: tile.x,
      tileY: tile.y,
      titleX: title.x,
      titleY: title.y,
      cardsBelowButtons: cards.every((r) => r.top >= actions.bottom + 16),
      cardsSideBySide:
        Math.abs(cards[0].top - cards[1].top) < 1 &&
        cards[0].right < cards[1].left,
      cardsLeftOfFace: cards.every((r) => r.right <= innerWidth * 0.56),
    }
  })
  // Center-left copy; cards and lower tiles remain in normal flow.
  expect(Math.abs(geometry.titleX - 54)).toBeLessThan(12)
  expect(geometry.titleY).toBeGreaterThan(180)
  expect(geometry.titleY).toBeLessThan(350)
  expect(Math.abs(geometry.tileX - 54)).toBeLessThan(8)
  expect(geometry.tileY).toBeGreaterThan(650)
  expect(geometry.cardsBelowButtons).toBe(true)
  expect(geometry.cardsSideBySide).toBe(true)
  expect(geometry.cardsLeftOfFace).toBe(true)
  const link = hero.getByRole('link', { name: en.hero.ctaPrimary })
  await link.focus()
  await expect(link).toBeFocused()
  expect(
    await link.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).not.toBe('none')
  await link.press('Enter')
  await expect(page).toHaveURL(/#content-universe$/)
})

test('Hero stays in bounds across sizes, languages, palettes, and reduced motion', async ({
  page,
}) => {
  test.setTimeout(120_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [language, dictionary] of [
    ['en', en],
    ['fr', fr],
    ['es', es],
  ] as const) {
    for (const theme of ['dark', 'light']) {
      for (const [width, height] of [
        [320, 568],
        [375, 812],
        [390, 844],
        [768, 1024],
        [844, 390],
        [1024, 768],
        [1280, 720],
        [1440, 900],
        [1920, 1080],
      ]) {
        await page.setViewportSize({ width, height })
        await page.addInitScript(
          ({ language, theme }) => {
            localStorage.setItem('carterpcs-language', language)
            localStorage.setItem('carterpcs-theme', theme)
          },
          { language, theme },
        )
        await page.goto('/')
        await page.evaluate(() => document.fonts.ready)
        const hero = page.locator('#hero')
        await expect(
          hero.getByRole('heading', { level: 1 }),
        ).toHaveAccessibleName(dictionary.hero.headlineLabel)
        const results = await hero.evaluate((el) => {
          const bounds = el.getBoundingClientRect()
          const links = [...el.querySelectorAll('a')]
          const title = el.querySelector('h1')!.getBoundingClientRect()
          const nav = document.querySelector('nav')!.getBoundingClientRect()
          const copy = el
            .querySelector('[class*="inner_"]')!
            .getBoundingClientRect()
          const facts = el.querySelector('aside')!.getBoundingClientRect()
          const tiles = el
            .querySelector('[class*="tiles_"]')!
            .getBoundingClientRect()
          const intersects = (a: DOMRect, b: DOMRect) =>
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            linksInBounds: links.every((a) => {
              const r = a.getBoundingClientRect()
              return (
                r.left >= 0 &&
                r.right <= innerWidth + 1 &&
                r.bottom <= bounds.bottom + 1 &&
                r.height >= 44
              )
            }),
            imagesLoaded: [...el.querySelectorAll('img')].every(
              (i) => i.complete && i.naturalWidth > 0,
            ),
            navClear: title.top >= nav.bottom,
            factsClear:
              facts.top >= nav.bottom &&
              !intersects(copy, facts) &&
              !intersects(facts, tiles),
            headlineLines: [...el.querySelectorAll('h1 span')].every(
              (n) =>
                n.getBoundingClientRect().height <=
                parseFloat(getComputedStyle(n).lineHeight) + 2,
            ),
            textSpill: [...el.querySelectorAll('h1, a span')].some(
              (n) => n.scrollWidth > n.clientWidth + 1,
            ),
          }
        })
        expect(results, `${width}x${height} ${language}/${theme}`).toEqual({
          overflow: 0,
          linksInBounds: true,
          imagesLoaded: true,
          navClear: true,
          factsClear: true,
          headlineLines: true,
          textSpill: false,
        })
      }
    }
  }
  expect(errors).toEqual([])
})
