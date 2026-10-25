import { test, expect } from '@playwright/test'
import { en } from '../src/i18n/en'
import { getFeaturedStories } from '../src/data/featured'
import { primaryNav } from './helpers'

const FEATURED = getFeaturedStories('en')
const shortTitle = (index: number) => FEATURED[index].headlineLines.join(' ')
const playName = (index: number) =>
  `${en.featured.playShort} — ${shortTitle(index)}`

test('Featured is reachable from Creator and the Work navigation link', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { level: 2, name: /selected stories/i }),
  ).toBeAttached()
  await primaryNav(page)
    .getByRole('link', { name: /^work$/i })
    .click()
  await expect(page).toHaveURL(/#featured$/)
  await expect(
    page.getByRole('heading', { level: 2, name: /selected stories/i }),
  ).toBeVisible()
})

for (const [name, viewport] of [
  ['small mobile', { width: 320, height: 568 }],
  ['mobile', { width: 390, height: 844 }],
  ['tablet', { width: 768, height: 1024 }],
  ['small desktop', { width: 1024, height: 768 }],
  ['desktop', { width: 1440, height: 900 }],
  ['reference desktop', { width: 1586, height: 1052 }],
  ['wide desktop', { width: 1920, height: 1080 }],
] as const) {
  test(`Featured ${name}: all three stories fit the responsive editorial layout`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize(viewport)
    await page.goto('/#featured')

    const stories = page.locator('#featured [data-panel]')
    await expect(stories).toHaveCount(3)
    for (let i = 0; i < 3; i += 1) {
      await expect(stories.nth(i)).toBeVisible()
      await expect(
        page.getByRole('heading', {
          level: 3,
          name: shortTitle(i),
          exact: true,
        }),
      ).toBeVisible()
      await stories
        .nth(i)
        .locator('[data-media-frame] img')
        .scrollIntoViewIfNeeded()
      await expect
        .poll(() =>
          stories
            .nth(i)
            .locator('[data-media-frame] img')
            .evaluate(
              (image: HTMLImageElement) =>
                image.complete && image.naturalWidth > 0,
            ),
        )
        .toBe(true)
    }

    if (viewport.width >= 1280) {
      await primaryNav(page)
        .getByRole('link', { name: /^work$/i })
        .click()
    }

    const geometry = await page.evaluate(() => {
      const section = document.querySelector<HTMLElement>('#featured')!
      const panels = Array.from(
        section.querySelectorAll<HTMLElement>('[data-panel]'),
      )
      const rect = (el: Element) => el.getBoundingClientRect()
      const lead = panels[0]
      const leadText = rect(lead.querySelector('[data-panel-content]')!)
      const leadMedia = rect(lead.querySelector('[data-media-frame]')!)
      const leadActions = rect(
        lead.querySelector('[class*="actionsFeatured"]')!,
      )
      const progress = rect(section.querySelector('[class*="progress"]')!)
      return {
        width: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        leadText: { left: leadText.left, right: leadText.right },
        leadMedia: {
          left: leadMedia.left,
          right: leadMedia.right,
          width: leadMedia.width,
          height: leadMedia.height,
        },
        leadTextAndActionsCenterDelta: Math.abs(
          (leadText.top + leadActions.bottom) / 2 -
            (leadMedia.top + leadMedia.bottom) / 2,
        ),
        progress: { top: progress.top, bottom: progress.bottom },
        panelRects: panels.map((panel) => {
          const box = rect(panel)
          return {
            left: box.left,
            right: box.right,
            top: box.top,
            bottom: box.bottom,
          }
        }),
        hasHorizontalTrack: Boolean(section.querySelector('[class*="track"]')),
      }
    })

    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width)
    expect(geometry.hasHorizontalTrack).toBe(false)
    expect(geometry.leadMedia.width / geometry.leadMedia.height).toBeCloseTo(
      9 / 16,
      2,
    )
    expect(geometry.progress.top).toBeGreaterThan(
      geometry.panelRects[2].bottom - 1,
    )

    if (viewport.width >= 1024) {
      expect(geometry.panelRects[0].left).toBeLessThan(
        geometry.panelRects[1].left,
      )
      expect(geometry.leadMedia.right).toBeLessThanOrEqual(
        geometry.leadText.left + 1,
      )
    }

    if (viewport.width >= 1280) {
      expect(geometry.leadTextAndActionsCenterDelta).toBeLessThan(80)
      expect(geometry.panelRects[1].left).toBeCloseTo(
        geometry.panelRects[2].left,
        0,
      )
      expect(geometry.panelRects[1].bottom).toBeLessThanOrEqual(
        geometry.panelRects[2].top + 1,
      )
      expect(geometry.leadText.right).toBeLessThan(geometry.panelRects[1].left)
    }

    if (viewport.width === 1586) {
      expect(geometry.progress.bottom).toBeLessThanOrEqual(viewport.height)
    }
  })
}

test('the first paint has no YouTube iframes, and every story has its own Play and action controls', async ({
  page,
}) => {
  await page.goto('/#featured')

  await expect(page.locator('iframe')).toHaveCount(0)
  await expect(page.locator('#featured [data-media-frame] img')).toHaveCount(3)
  await expect(
    page.getByRole('button', {
      name: new RegExp(`^${en.featured.playShort} `),
    }),
  ).toHaveCount(3)
  await expect(
    page.getByRole('link', {
      name: new RegExp(`^${en.featured.actions.watch} `),
    }),
  ).toHaveCount(3)

  const progress = page
    .locator('#featured [class*="progressItem"]')
    .first()
    .locator('..')
  await expect(progress).toHaveAttribute('aria-hidden', 'true')
  await expect(progress.locator('[class*="progressItem"]')).toHaveCount(3)
  await expect(page.locator('[data-editorial-rail]')).toHaveCount(0)
})

test('playing a second Short replaces the first player, and Escape restores focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#featured')

  const first = page.getByRole('button', { name: playName(0), exact: true })
  await first.scrollIntoViewIfNeeded()
  await first.focus()
  await page.keyboard.press('Enter')
  const player = page.locator('#featured iframe')
  await expect(player).toHaveCount(1)
  await expect(player).toHaveAttribute(
    'src',
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/JekaYRzZRfU\?/,
  )

  await expect(
    page.getByRole('button', {
      name: `${en.featured.closePlayer} — ${shortTitle(0)}`,
      exact: true,
    }),
  ).toBeFocused()

  await page.getByRole('button', { name: playName(1), exact: true }).click()
  await expect(player).toHaveCount(1)
  await expect(player).toHaveAttribute('src', /1iBOP4Gyfi8/)

  await page.keyboard.press('Escape')
  await expect(player).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: playName(1), exact: true }),
  ).toBeFocused()
})

test('video playback stays inside its 9:16 frame and clear of story text', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#featured')
  await page.getByRole('button', { name: playName(0), exact: true }).click()

  const geometry = await page.evaluate(() => {
    const iframe = document.querySelector('#featured iframe')!
    const panel = iframe.closest('[data-panel]')!
    const frame = iframe.closest('[data-media-frame]')!
    const text = panel.querySelector('[data-panel-content]')!
    const r = (el: Element) => el.getBoundingClientRect()
    const cross = (a: DOMRect, b: DOMRect) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
    return {
      frame: r(frame),
      player: r(iframe),
      text: r(text),
      aspect: r(frame).width / r(frame).height,
      overlap: cross(r(iframe), r(text)),
    }
  })

  expect(geometry.aspect).toBeCloseTo(9 / 16, 2)
  expect(geometry.overlap).toBe(0)
  expect(Math.abs(geometry.frame.left - geometry.player.left)).toBeLessThan(1)
  expect(Math.abs(geometry.frame.right - geometry.player.right)).toBeLessThan(1)
  expect(Math.abs(geometry.frame.top - geometry.player.top)).toBeLessThan(1)
  expect(Math.abs(geometry.frame.bottom - geometry.player.bottom)).toBeLessThan(
    1,
  )
})

test('the action rails remain operable, quiet, and do not trigger network requests for Like', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#featured')

  const stories = page.locator('#featured [data-panel]')
  await expect(stories).toHaveCount(3)
  const like = stories.first().getByRole('button', {
    name: `${en.featured.actions.like} — ${shortTitle(0)}`,
  })
  await like.click()
  await expect(like).toHaveAttribute('aria-pressed', 'true')
  expect(requests.some((url) => /youtube|google/i.test(url))).toBe(false)

  for (let index = 0; index < 3; index += 1) {
    const controls = stories
      .nth(index)
      .locator('[class*="actions"] button, [class*="actions"] a')
    await expect(controls).toHaveCount(4)
    for (let controlIndex = 0; controlIndex < 4; controlIndex += 1) {
      await expect(controls.nth(controlIndex)).toBeVisible()
    }
  }
})
