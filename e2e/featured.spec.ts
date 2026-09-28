import { test, expect, type Page } from '@playwright/test'
import { en } from '../src/i18n/en'
import { getFeaturedStories } from '../src/data/featured'
import { primaryNav } from './helpers'

/**
 * Featured in the browser: reaching it, click-to-play, the pinned desktop
 * sequence and the action rail. The French run of the pinned sequence lives
 * with the other language checks in app.spec.ts.
 */

test('scrolling from Creator reveals the Featured section', async ({
  page,
}) => {
  await page.goto('/')

  const featuredTitle = page.getByRole('heading', {
    level: 2,
    name: /selected stories/i,
  })
  await expect(featuredTitle).toBeAttached()

  await featuredTitle.scrollIntoViewIfNeeded()
  await expect(featuredTitle).toBeVisible()
})

test('Featured nav link scrolls to the Featured section', async ({ page }) => {
  await page.goto('/')

  // "Work" is the reference bar's Featured entry (see Nav.tsx).
  await primaryNav(page)
    .getByRole('link', { name: /^work$/i })
    .click()
  await expect(page).toHaveURL(/#featured$/)
})

test('desktop: the horizontal sequence progresses through all three stories on scroll', async ({
  page,
}) => {
  await page.goto('/')

  const firstStory = page.getByRole('heading', {
    level: 3,
    name: /best pc/i,
  })
  const lastStory = page.getByRole('heading', {
    level: 3,
    name: /lenovo thinkpad/i,
  })

  await firstStory.scrollIntoViewIfNeeded()
  await expect(firstStory).toBeVisible()
  // Not yet reached — still off-screen to the right of the pinned track.
  await expect(lastStory).not.toBeInViewport()

  // Scroll past the pinned track's distance so the sequence completes.
  // Kept close to that distance (not a large overshoot): Hardware now
  // follows Featured, so once the pin releases, scrolling continues
  // normally into Hardware — too generous an overshoot here would carry
  // the viewport past Featured's last panel and into Hardware instead.
  await page.evaluate(() => window.scrollBy(0, 2200))
  await page.waitForTimeout(500)

  await expect(lastStory).toBeInViewport()
})

test('mobile: Featured stories are reachable through natural vertical scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const lastStory = page.getByRole('heading', {
    level: 3,
    name: /lenovo thinkpad/i,
  })
  await lastStory.scrollIntoViewIfNeeded()
  await expect(lastStory).toBeVisible()

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )
  expect(overflow).toBe(true)
})

/* ===== Featured: click-to-play Shorts ===== */

const FEATURED = getFeaturedStories('en')
const shortTitle = (index: number) => FEATURED[index].headlineLines.join(' ')
const playName = (index: number) =>
  `${en.featured.playShort} — ${shortTitle(index)}`

test('the page loads with no YouTube iframe anywhere, at any scroll position', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('iframe')).toHaveCount(0)

  // Scrolling Featured into view must not create one either — the embeds are
  // built on click, not on visibility.
  await page
    .getByRole('heading', { level: 2, name: /selected stories/i })
    .scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  await expect(page.locator('iframe')).toHaveCount(0)

  await expect(
    page.getByRole('button', {
      name: new RegExp(`^${en.featured.playShort} `),
    }),
  ).toHaveCount(3)
})

test('mobile: playing a Short creates a nocookie player, and a second one replaces it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const first = page.getByRole('button', { name: playName(0), exact: true })
  await first.scrollIntoViewIfNeeded()
  await first.click()

  const player = page.locator('#featured iframe')
  await expect(player).toHaveCount(1)
  await expect(player).toHaveAttribute(
    'src',
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/JekaYRzZRfU\?/,
  )
  // Exact string, not a regex: these titles contain `$` and `?`, which a
  // RegExp would read as anchors and quantifiers rather than characters.
  await expect(player).toHaveAttribute(
    'title',
    `${en.featured.a11y.player} — ${shortTitle(0)}`,
  )

  // Starting the second Short must leave exactly one player, and it must be
  // the second one — the first is removed, not paused offscreen.
  const second = page.getByRole('button', { name: playName(1), exact: true })
  await second.scrollIntoViewIfNeeded()
  await second.click()

  await expect(player).toHaveCount(1)
  await expect(player).toHaveAttribute('src', /1iBOP4Gyfi8/)
  await expect(
    page.getByRole('button', { name: playName(0), exact: true }),
  ).toBeVisible()

  // The portrait frame must not push the page sideways at 390px.
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true)
})

test('mobile: closing a player restores the poster and the Play control', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const play = page.getByRole('button', { name: playName(0), exact: true })
  await play.scrollIntoViewIfNeeded()
  await play.click()
  await expect(page.locator('#featured iframe')).toHaveCount(1)

  await page
    .getByRole('button', {
      name: `${en.featured.closePlayer} — ${shortTitle(0)}`,
      exact: true,
    })
    .click()

  await expect(page.locator('#featured iframe')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: playName(0), exact: true }),
  ).toBeVisible()
  // The poster is back: three stories, three local posters, no embed.
  await expect(page.locator('#featured [data-media-frame] img')).toHaveCount(3)
})

test('desktop: the player is confined to its media frame and never covers the headline', async ({
  page,
}) => {
  await page.goto('/')
  // Park the pinned TRACK at the viewport top. That is where the pin starts
  // and the rail is still at x = 0, so panel 1 is squarely in frame and the
  // measurement below is taken against its own headline rather than against a
  // half-finished transition between two panels.
  await page.evaluate(() => {
    const track = document.querySelector('#featured [class*="track"]')!
    window.scrollTo(0, window.scrollY + track.getBoundingClientRect().top)
  })
  await page.waitForTimeout(1200)

  const firstPanel = page.locator('#featured [data-panel]').first()
  await firstPanel.getByRole('button', { name: playName(0) }).click()

  const player = page.locator('#featured iframe')
  await expect(player).toHaveCount(1)

  const overlap = await page.evaluate(() => {
    const iframe = document.querySelector('#featured iframe')!
    const frame = iframe.closest('[data-media-frame]')!
    const panel = iframe.closest('[data-panel]')!
    const headline = panel.querySelector('h3')!
    const support = panel.querySelector('h3 + p')!
    const r = (el: Element) => el.getBoundingClientRect()
    const cross = (a: DOMRect, b: DOMRect) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
    const pr = r(iframe)
    const fr = r(frame)
    return {
      // The player fills its frame and nothing more.
      escapesFrame: +Math.max(
        0,
        fr.left - pr.left,
        pr.right - fr.right,
        fr.top - pr.top,
        pr.bottom - fr.bottom,
      ).toFixed(1),
      // ...and the frame is nowhere near the copy.
      overHeadline: cross(pr, r(headline)),
      overSupport: cross(pr, r(support)),
      // The panel is not one big video: how much of it the player covers.
      panelShare: +(
        (pr.width * pr.height) /
        (r(panel).width * r(panel).height)
      ).toFixed(3),
    }
  })

  expect(overlap.escapesFrame).toBeLessThanOrEqual(0.5)
  expect(overlap.overHeadline).toBe(0)
  expect(overlap.overSupport).toBe(0)
  // Editorial, not a wall of YouTube.
  expect(overlap.panelShare).toBeLessThan(0.25)
})

/* ===== Featured: the pinned composition ===== */

/**
 * The rail is scrubbed, so without a snap it comes to rest wherever the
 * visitor stopped — leaving the panel on screen a fraction of the way through
 * its travel, which is the "shifted right" the last story was reported with.
 * These two tests are about where scrolling COMES TO REST, so each one stops
 * at a deliberately awkward fraction of a panel and then waits.
 */
for (const [width, height] of [
  [1024, 768],
  [1440, 900],
  [1920, 1080],
] as const) {
  test(`desktop @ ${width}x${height}: the sequence rests on a panel, never between two`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    // The pin does not exist until GSAP has run its setup, and its start and
    // distance are meaningless before then — scrolling first measured a page
    // that had not been pinned yet.
    await page.waitForTimeout(1500)

    const pin = await page.evaluate(() => {
      const track = document.querySelector('#featured [class*="track"]')!
      const rail = document.querySelector('#featured [class*="rail"]')!
      return {
        start: window.scrollY + track.getBoundingClientRect().top,
        distance: rail.scrollWidth - window.innerWidth,
      }
    })

    // Fractions that land nowhere near a boundary. Kept inside the pinned
    // range: past its end the section scrolls away as a whole, which is not a
    // state this test is about.
    for (const fraction of [0.14, 0.33, 0.5, 0.68, 0.9]) {
      await page.evaluate(
        (y) => window.scrollTo(0, y),
        pin.start + pin.distance * 0.82 * fraction,
      )
      // Both axes in one number: `left` is the horizontal drift this test is
      // about, and `top` proves the reading was taken while the section was
      // still pinned rather than after it had begun scrolling away, where a
      // flush panel says nothing.
      const settledOffset = () =>
        page.evaluate(() => {
          const panels = Array.from(
            document.querySelectorAll('#featured [data-panel]'),
          )
          const mid = document.documentElement.clientWidth / 2
          const visible = panels.find((p) => {
            const r = p.getBoundingClientRect()
            return r.left <= mid && r.right >= mid
          })!
          const r = visible.getBoundingClientRect()
          return Math.abs(r.left) + Math.abs(r.top)
        })

      // Polled rather than measured after a fixed sleep: the snap eases in
      // through Lenis's own scroll loop and, under a loaded CI machine, one
      // sleep long enough for the slowest run is a sleep wasted on every other.
      // 3px, not 0, because that easing leaves a sub-pixel residue — measured
      // across 42 rest states the worst was 1.4px, against the 960px this
      // guards.
      await expect.poll(settledOffset, { timeout: 8000 }).toBeLessThan(3)

      // ...and with the panel settled, the plate hangs below the fixed bar.
      const frameClearsNav = await page.evaluate(() => {
        const panels = Array.from(
          document.querySelectorAll('#featured [data-panel]'),
        )
        const mid = document.documentElement.clientWidth / 2
        const visible = panels.find((p) => {
          const r = p.getBoundingClientRect()
          return r.left <= mid && r.right >= mid
        })!
        const nav = document.querySelector('nav')!.getBoundingClientRect()
        const frame = visible
          .querySelector('[data-media-frame]')!
          .getBoundingClientRect()
        return frame.top - nav.bottom
      })
      expect(frameClearsNav).toBeGreaterThan(0)
    }
  })
}

test('desktop: the timeline shares the text column’s left edge exactly', async ({
  page,
}) => {
  await page.goto('/')
  await parkFeatured(page)

  const columns = await page.evaluate(() => {
    const left = (el: Element) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      const rects = Array.from(range.getClientRects()).filter(
        (r) => r.width > 0.5 && r.height > 0.5,
      )
      return Math.min(...rects.map((r) => r.left))
    }
    return Array.from(document.querySelectorAll('#featured [data-panel]')).map(
      (panel) => {
        const content = panel.querySelector('[data-panel-content]')!
        const timeline = panel.querySelector('[class*="progress"]')!
        return {
          kicker: left(content.querySelector('p')!),
          headline: left(panel.querySelector('h3')!),
          support: left(panel.querySelector('h3 + p')!),
          tags: left(panel.querySelector('h3 + p + p')!),
          timeline: timeline.getBoundingClientRect().left,
          // The connected-dot form the reference asks for: a line behind
          // circular markers, one of them the cyan active one.
          markers: timeline.querySelectorAll('span').length,
          radius: getComputedStyle(timeline.querySelector('span')!).borderRadius,
        }
      },
    )
  })

  expect(columns).toHaveLength(3)
  for (const c of columns) {
    // One column: every line of copy AND the timeline start on the same pixel.
    expect(Math.abs(c.headline - c.kicker)).toBeLessThan(1)
    expect(Math.abs(c.support - c.kicker)).toBeLessThan(1)
    expect(Math.abs(c.tags - c.kicker)).toBeLessThan(1)
    expect(Math.abs(c.timeline - c.kicker)).toBeLessThan(1)
    expect(c.markers).toBe(3)
    expect(c.radius).toBe('50%')
  }
})

/* The far-right vertical sequence mark this block used to cover has been
   removed from the section (see FeaturedProgress.tsx and
   Featured.progress.module.css): it
   drew the same three scroll positions the bottom timeline already draws,
   so the panel stated one fact three times. The timeline's own geometry
   test directly above still covers the indicator that remains. */

/* ===== Featured: the action rail ===== */

/** Parks the pinned track at its start, rail at x = 0, panel 1 in frame. */
const parkFeatured = async (page: Page) => {
  await page.evaluate(() => {
    const track = document.querySelector('#featured [class*="track"]')!
    window.scrollTo(0, window.scrollY + track.getBoundingClientRect().top)
  })
  await page.waitForTimeout(1200)
}

test('desktop: the rail is a column beside the video, clear of the copy, the bar and the progress', async ({
  page,
}) => {
  await page.goto('/')
  await parkFeatured(page)

  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('#featured [data-panel]')!
    const rail = panel.querySelector('[class*="actions"]')!
    const frame = panel.querySelector('[data-media-frame]')!
    const content = panel.querySelector('[data-panel-content]')!
    const nav = document.querySelector('nav')!
    const progress = document.querySelector('#featured [class*="progress"]')!
    const r = (el: Element) => el.getBoundingClientRect()
    const cross = (a: DOMRect, b: DOMRect) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
    // The copy's INK, not its box: a line box is as wide as its container.
    const range = document.createRange()
    range.selectNodeContents(content)
    const inkRects = Array.from(range.getClientRects()).filter(
      (b) => b.width > 0.5 && b.height > 0.5,
    )
    const ink = new DOMRect(
      Math.min(...inkRects.map((b) => b.left)),
      Math.min(...inkRects.map((b) => b.top)),
      Math.max(...inkRects.map((b) => b.right)) -
        Math.min(...inkRects.map((b) => b.left)),
      Math.max(...inkRects.map((b) => b.bottom)) -
        Math.min(...inkRects.map((b) => b.top)),
    )
    const rr = r(rail)
    const fr = r(frame)
    const controls = Array.from(rail.querySelectorAll('button, a'))
    return {
      // A column: every control shares a left edge, and they stack.
      isColumn: controls.every(
        (c, i) =>
          i === 0 || r(c).top >= r(controls[i - 1]).bottom - 0.5,
      ),
      // ...to the RIGHT of the video, not over it.
      startsRightOfFrame: rr.left >= fr.right - 0.5,
      overFrame: cross(rr, fr),
      overCopy: cross(rr, ink),
      overNav: cross(rr, r(nav)),
      overProgress: cross(rr, r(progress)),
      withinPanel: rr.right <= r(panel).right + 0.5,
      smallestControl: Math.min(
        ...controls.map((c) => Math.min(r(c).width, r(c).height)),
      ),
      pageOverflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    }
  })

  expect(geometry.isColumn).toBe(true)
  expect(geometry.startsRightOfFrame).toBe(true)
  expect(geometry.overFrame).toBe(0)
  expect(geometry.overCopy).toBe(0)
  expect(geometry.overNav).toBe(0)
  expect(geometry.overProgress).toBe(0)
  expect(geometry.withinPanel).toBe(true)
  // WCAG 2.5.8 minimum, comfortably.
  expect(geometry.smallestControl).toBeGreaterThanOrEqual(24)
  expect(geometry.pageOverflow).toBe(0)
})

test('desktop: Like is a pressed state, and pressing it fetches nothing', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))

  await page.goto('/')
  await parkFeatured(page)

  const like = page
    .locator('#featured [data-panel]')
    .first()
    .getByRole('button', { name: `${en.featured.actions.like} — ${shortTitle(0)}` })

  await expect(like).toHaveAttribute('aria-pressed', 'false')
  requests.length = 0
  await like.click()
  await expect(like).toHaveAttribute('aria-pressed', 'true')
  await page.waitForTimeout(400)

  // A local preference: nothing was sent anywhere, least of all to YouTube.
  expect(requests.filter((u) => /youtube|ytimg|google/i.test(u))).toEqual([])
  await expect(page.locator('#featured iframe')).toHaveCount(0)

  await like.click()
  await expect(like).toHaveAttribute('aria-pressed', 'false')
})

test('desktop: Share copies the real Short URL from the keyboard and confirms it', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  // Force the clipboard branch: with a share sheet present the platform owns
  // the outcome and there is nothing for this test to observe.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    })
  })
  await page.goto('/')
  await parkFeatured(page)

  const share = page
    .locator('#featured [data-panel]')
    .first()
    .getByRole('button', {
      name: `${en.featured.actions.share} — ${shortTitle(0)}`,
    })

  // Keyboard, not a click: this has to work on Enter.
  await share.focus()
  await page.keyboard.press('Enter')

  await expect(
    page.getByText(en.featured.actions.linkCopied).first(),
  ).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    FEATURED[0].videoUrl,
  )
})

test('mobile: the rail sits under the video, still reachable and inside the panel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')

  const rail = page.locator('#featured [data-panel]').first().locator('[class*="actions"]')
  await rail.scrollIntoViewIfNeeded()

  const measured = await page.evaluate(() => {
    const panel = document.querySelector('#featured [data-panel]')!
    const rail = panel.querySelector('[class*="actions"]')!
    const frame = panel.querySelector('[data-media-frame]')!
    const r = (el: Element) => el.getBoundingClientRect()
    const controls = Array.from(rail.querySelectorAll('button, a'))
    return {
      belowFrame: r(rail).top >= r(frame).bottom - 0.5,
      withinPanel:
        r(rail).left >= r(panel).left - 0.5 &&
        r(rail).right <= r(panel).right + 0.5,
      controls: controls.length,
      smallestControl: Math.min(
        ...controls.map((c) => Math.min(r(c).width, r(c).height)),
      ),
      pageOverflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    }
  })

  expect(measured.belowFrame).toBe(true)
  expect(measured.withinPanel).toBe(true)
  expect(measured.controls).toBe(4)
  expect(measured.smallestControl).toBeGreaterThanOrEqual(24)
  expect(measured.pageOverflow).toBe(0)
})
