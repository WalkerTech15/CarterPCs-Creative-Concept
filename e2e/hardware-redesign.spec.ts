import { expect, test } from '@playwright/test'

test('Hardware matches the editorial reference layout on desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#hardware')

  const section = page.locator('#hardware')
  const heading = section.getByRole('heading', { level: 2 })
  const image = section.locator('figure img')
  await expect(heading).toBeVisible()
  await expect(image).toBeVisible()
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0)

  const desktopLayout = await section.evaluate((element) => {
    const intro = element
      .querySelector('h2')!
      .parentElement!.getBoundingClientRect()
    const media = element.querySelector('figure')!.getBoundingClientRect()
    const beats = element.querySelector('ul')!.getBoundingClientRect()
    const imageElement = element.querySelector('figure img') as HTMLImageElement
    const image = imageElement.getBoundingClientRect()

    return {
      introLeft: intro.left,
      introRight: intro.right,
      mediaLeft: media.left,
      mediaRight: media.right,
      mediaRatio: media.width / media.height,
      imageRatio: imageElement.naturalWidth / imageElement.naturalHeight,
      introAlign: getComputedStyle(element.querySelector('h2')!.parentElement!)
        .alignSelf,
      mediaAlign: getComputedStyle(element.querySelector('figure')!).alignSelf,
      beatsTop: beats.top,
      heroBottom: Math.max(intro.bottom, media.bottom),
      viewportWidth: document.documentElement.clientWidth,
      objectFit: getComputedStyle(element.querySelector('figure img')!)
        .objectFit,
      imageWidth: image.width,
      imageHeight: image.height,
      dividerWidth: getComputedStyle(element.querySelectorAll('ul > li')[1])
        .borderInlineStartWidth,
      beatMetaDirection: getComputedStyle(
        element.querySelectorAll('ul > li')[1].querySelector('p')!,
      ).flexDirection,
      beatIconCount: element.querySelectorAll('ul > li svg[viewBox]').length,
      beatIconNamesHidden: [...element.querySelectorAll('ul > li svg')].every(
        (icon) =>
          icon.getAttribute('aria-hidden') === 'true' ||
          icon.parentElement?.getAttribute('aria-hidden') === 'true',
      ),
      tagRules: [
        getComputedStyle(element.querySelector('p[class*="tags"]')!, '::before')
          .height,
        getComputedStyle(element.querySelector('p[class*="tags"]')!, '::after')
          .height,
      ],
      hasBackdropNumeral: Boolean(
        element.querySelector('[class*="backdropNumeral"]'),
      ),
    }
  })

  expect(desktopLayout.mediaRatio).toBeCloseTo(8 / 5, 2)
  expect(desktopLayout.imageRatio).toBeCloseTo(16 / 9, 2)
  expect(desktopLayout.objectFit).toBe('cover')
  expect(desktopLayout.imageWidth).toBeGreaterThan(38 * 16)
  expect(desktopLayout.introRight).toBeLessThan(desktopLayout.mediaLeft)
  expect(desktopLayout.introLeft).toBeGreaterThan(40)
  expect(desktopLayout.introLeft).toBeLessThan(80)
  expect(desktopLayout.introAlign).toBe('start')
  expect(desktopLayout.mediaAlign).toBe('start')
  expect(
    desktopLayout.viewportWidth - desktopLayout.mediaRight,
  ).toBeGreaterThan(40)
  expect(desktopLayout.viewportWidth - desktopLayout.mediaRight).toBeLessThan(
    80,
  )
  expect(desktopLayout.beatsTop).toBeGreaterThanOrEqual(
    desktopLayout.heroBottom - 1,
  )
  expect(Number.parseFloat(desktopLayout.dividerWidth)).toBeGreaterThan(0)
  expect(desktopLayout.beatMetaDirection).toBe('row')
  expect(desktopLayout.beatIconCount).toBe(3)
  expect(desktopLayout.beatIconNamesHidden).toBe(true)
  expect(desktopLayout.tagRules).toEqual(['1px', '1px'])
  expect(desktopLayout.hasBackdropNumeral).toBe(false)
  expect(desktopLayout.imageWidth).toBeGreaterThan(desktopLayout.imageHeight)
})

test('Hardware redesign has no horizontal overflow at common viewport sizes', async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/#hardware')
    await expect(page.locator('#hardware figure img')).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }))

    expect(
      dimensions.page,
      `overflow at ${viewport.width}x${viewport.height}`,
    ).toBeLessThanOrEqual(dimensions.viewport)
  }
})
