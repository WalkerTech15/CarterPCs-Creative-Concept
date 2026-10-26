import { expect, test } from '@playwright/test'
import { en } from '../src/i18n/en'

test('preference menu animates briefly and remains keyboard-operable', async ({
  page,
}) => {
  await page.goto('/')

  const trigger = page.getByRole('button', { name: en.a11y.chooseLanguage })
  const menuId = await trigger.getAttribute('aria-controls')
  expect(menuId).toBeTruthy()
  const menu = page.locator(`#${menuId}`)

  await expect(menu).toBeHidden()
  const closedMotion = await menu.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      properties: style.transitionProperty,
      visibility: style.visibility,
    }
  })
  expect(closedMotion.properties).toContain('opacity')
  expect(closedMotion.properties).toContain('transform')
  expect(closedMotion.visibility).toBe('hidden')

  await trigger.focus()
  await page.keyboard.press('ArrowDown')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitemradio').first()).toBeFocused()
  await expect
    .poll(() => menu.evaluate((element) => getComputedStyle(element).opacity))
    .toBe('1')

  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('inert', '')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('Enter and Space move focus into the menu they open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const cases = [
    { triggerName: en.a11y.chooseTheme, key: 'Enter', itemRole: 'menuitemradio' },
    { triggerName: en.a11y.chooseLanguage, key: 'Space', itemRole: 'menuitemradio' },
    { triggerName: en.a11y.chooseSections, key: 'Enter', itemRole: 'menuitem' },
  ] as const

  for (const { triggerName, key, itemRole } of cases) {
    const trigger = page.getByRole('button', { name: triggerName })
    const menuId = await trigger.getAttribute('aria-controls')
    expect(menuId).toBeTruthy()
    const menu = page.locator(`#${menuId}`)

    await trigger.focus()
    await page.keyboard.press(key)
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(menu.getByRole(itemRole).first()).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  }
})

test('reduced motion keeps menus usable without a visible transition', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const trigger = page.getByRole('button', { name: en.a11y.chooseLanguage })
  const menuId = await trigger.getAttribute('aria-controls')
  expect(menuId).toBeTruthy()
  const menu = page.locator(`#${menuId}`)

  await trigger.click()
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitemradio').first()).toBeVisible()

  const reducedMotion = await menu.evaluate((element) => {
    const style = getComputedStyle(element)
    const durationMs = style.transitionDuration
      .split(',')
      .map((duration) => {
        const value = Number.parseFloat(duration)
        return duration.trim().endsWith('ms') ? value : value * 1000
      })
      .reduce((longest, duration) => Math.max(longest, duration), 0)
    return { durationMs, transitionDelay: style.transitionDelay }
  })
  expect(reducedMotion.durationMs).toBeLessThanOrEqual(0.02)
  expect(
    reducedMotion.transitionDelay
      .split(',')
      .every((delay) => Number.parseFloat(delay) === 0),
  ).toBe(true)
})

test('Hero story cards expose their hover cue when reached by keyboard', async ({
  page,
}) => {
  await page.goto('/')

  const tile = page.getByRole('link', { name: /Custom Builds/ })
  const arrow = tile.locator('span[aria-hidden="true"]')

  for (let attempt = 0; attempt < 24; attempt += 1) {
    if (await tile.evaluate((element) => element === document.activeElement))
      break
    await page.keyboard.press('Tab')
  }

  await expect(tile).toBeFocused()
  await expect
    .poll(() =>
      arrow.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe('none')
})

test('Short Play has keyboard feedback without loading its player', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#featured')

  const play = page.getByRole('button', { name: /Play Short/ }).first()
  await expect(play).toBeVisible()
  await play.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(play).toBeFocused()

  const icon = play.locator('span[aria-hidden="true"]').first()
  await expect
    .poll(() => icon.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe('none')
  await expect(page.locator('iframe')).toHaveCount(0)
})
