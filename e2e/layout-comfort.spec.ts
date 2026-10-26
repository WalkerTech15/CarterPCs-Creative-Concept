import { expect, test } from '@playwright/test'

test('phone Hero stays compact, readable, and clear of the navigation in every locale', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  const phoneViewports = [
    { width: 320, height: 568 }, // small iPhone / narrow viewport floor
    { width: 360, height: 780 }, // compact Android-sized phone
    { width: 375, height: 812 }, // iPhone SE / mini class
    { width: 390, height: 844 }, // current standard iPhone class
    { width: 402, height: 874 }, // larger iPhone class
    { width: 430, height: 932 }, // large iPhone class
  ]

  for (const viewport of phoneViewports) {
    for (const language of ['en', 'fr', 'es'] as const) {
      const { width } = viewport
      await page.setViewportSize(viewport)
      await page.addInitScript((locale) => {
        window.localStorage.setItem('carterpcs-language', locale)
        window.localStorage.setItem('carterpcs-theme', 'dark')
      }, language)
      await page.goto('/')

      const layout = await page.evaluate(() => {
        const hero = document.querySelector('#hero')!
        const nav = document.querySelector('nav')!
        const headline = hero.querySelector('h1')!
        const source = hero.querySelector('#hero-image-disclosure')!
        const firstTile = hero.querySelector('a[class*="tile_"]')!
        const tileBody = firstTile.querySelector('[class*="tileBody"]')!
        const firstTileText = firstTile.querySelector('[class*="tileTitle"]')!

        return {
          heroHeight: hero.getBoundingClientRect().height,
          navBottom: nav.getBoundingClientRect().bottom,
          headlineTop: headline.getBoundingClientRect().top,
          sourceFontSize: Number.parseFloat(getComputedStyle(source).fontSize),
          tileColumns: getComputedStyle(firstTile)
            .gridTemplateColumns.trim()
            .split(/\s+/).length,
          tileBodyOverflow: tileBody.scrollWidth - tileBody.clientWidth,
          tileTextOverflow:
            firstTileText.scrollWidth - firstTileText.clientWidth,
          documentOverflow: document.documentElement.scrollWidth - innerWidth,
        }
      })

      expect(
        layout.heroHeight,
        `${language} ${width}px Hero height`,
      ).toBeLessThan(2300)
      expect(
        layout.headlineTop,
        `${language} ${width}px nav clearance`,
      ).toBeGreaterThan(layout.navBottom)
      expect(
        layout.sourceFontSize,
        `${language} source readability`,
      ).toBeGreaterThanOrEqual(12)
      expect(layout.tileColumns, `${language} ${width}px tile layout`).toBe(2)
      expect(
        layout.tileBodyOverflow,
        `${language} ${width}px tile body`,
      ).toBeLessThanOrEqual(0)
      expect(
        layout.tileTextOverflow,
        `${language} ${width}px tile copy`,
      ).toBeLessThanOrEqual(0)
      expect(
        layout.documentOverflow,
        `${language} ${width}px page overflow`,
      ).toBe(0)
    }
  }
})

test('phone landscape keeps the Hero readable and the page inside the viewport width', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const language of ['en', 'fr', 'es'] as const) {
    await page.setViewportSize({ width: 844, height: 390 })
    await page.addInitScript((locale) => {
      window.localStorage.setItem('carterpcs-language', locale)
      window.localStorage.setItem('carterpcs-theme', 'dark')
    }, language)
    await page.goto('/')

    const layout = await page.evaluate(() => {
      const nav = document.querySelector('nav')!.getBoundingClientRect()
      const headline = document
        .querySelector('#hero h1')!
        .getBoundingClientRect()

      return {
        navBottom: nav.bottom,
        headlineTop: headline.top,
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
      }
    })

    expect(
      layout.headlineTop,
      `${language} landscape nav clearance`,
    ).toBeGreaterThan(layout.navBottom)
    expect(layout.pageWidth, `${language} landscape horizontal overflow`).toBe(
      layout.viewportWidth,
    )
  }
})

test('desktop Content Universe secondary names no longer tilt against the main type', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const transforms = await page
    .locator(
      '#content-universe [data-tier="2"], #content-universe [data-tier="3"]',
    )
    .evaluateAll((entries) =>
      entries.map((entry) => getComputedStyle(entry).transform),
    )

  expect(transforms.length).toBeGreaterThan(0)
  expect(transforms.every((transform) => transform === 'none')).toBe(true)
})

test('wide Featured lead video stays left of its story copy inside the panel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('#featured [data-featured]')!
    const media = panel.querySelector(':scope > [class*="media"]')!
    const copy = panel.querySelector('[data-panel-content]')!
    const rect = (element: Element) => element.getBoundingClientRect()

    return { panel: rect(panel), media: rect(media), copy: rect(copy) }
  })

  expect(geometry.media.left).toBeGreaterThanOrEqual(geometry.panel.left)
  expect(geometry.media.right).toBeLessThanOrEqual(geometry.copy.left)
  expect(geometry.copy.right).toBeLessThanOrEqual(geometry.panel.right)
})

test('Hero copy, actions and lower tiles stay separated on desktop and tablet', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [width, height] of [
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height })
    for (const language of ['en', 'fr', 'es']) {
      await page.addInitScript(
        (locale) => localStorage.setItem('carterpcs-language', locale),
        language,
      )
      await page.goto('/')
      const geometry = await page.locator('#hero').evaluate((el) => {
        const actions = el
          .querySelector('[class*="actions"]')!
          .getBoundingClientRect()
        const tiles = el
          .querySelector('[class*="tiles"]')!
          .getBoundingClientRect()
        const caption = el
          .querySelector('#hero-image-disclosure')!
          .getBoundingClientRect()
        return {
          gap: tiles.top - actions.bottom,
          captionGap: caption.top - tiles.bottom,
          overflow: document.documentElement.scrollWidth - innerWidth,
        }
      })
      expect(
        geometry.gap,
        `${width}/${language} actions/tiles gap`,
      ).toBeGreaterThanOrEqual(20)
      expect(
        geometry.captionGap,
        `${width}/${language} disclosure gap`,
      ).toBeGreaterThanOrEqual(0)
      expect(geometry.overflow).toBe(0)
    }
  }
})

test('Hero disclosure text tokens meet contrast against the base palette in both themes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const theme of ['dark', 'light'] as const) {
    await page.addInitScript((preference) => {
      window.localStorage.setItem('carterpcs-theme', preference)
    }, theme)
    await page.goto('/')

    const ratios = await page.evaluate(() => {
      const parse = (value: string) =>
        value
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
      const luminance = (value: string) => {
        const [r, g, b] = parse(value).map((channel) => {
          const normalized = channel / 255
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4
        })

        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      const ratio = (foreground: string, background: string) => {
        const [lighter, darker] = [
          luminance(foreground),
          luminance(background),
        ].sort((a, b) => b - a)

        return (lighter + 0.05) / (darker + 0.05)
      }
      const background = getComputedStyle(document.body).backgroundColor
      const source = document.querySelector('#hero-image-disclosure')!
      const disclaimer = source.previousElementSibling!

      return [
        ratio(getComputedStyle(source).color, background),
        ratio(getComputedStyle(disclaimer).color, background),
      ]
    })

    expect(
      ratios[0],
      `${theme} image disclosure token contrast`,
    ).toBeGreaterThanOrEqual(4.5)
    expect(ratios[1], `${theme} disclaimer contrast`).toBeGreaterThanOrEqual(
      4.5,
    )
  }
})
