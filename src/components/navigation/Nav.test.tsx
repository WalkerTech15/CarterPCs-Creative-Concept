import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../app/App'
import { en } from '../../i18n/en'

/**
 * Nav's theme/language menus, exercised through the full app shell (Nav needs
 * only `PreferencesProvider`, but these cases pre-date that render-alone
 * option and every assertion is about Nav's own DOM, so re-rendering with it
 * is a behavioural change this split does not make).
 */

/**
 * Opens a menu's trigger and returns its currently-focused `menuitemradio`
 * matcher. Local to this file: it is three lines, generic, and used only
 * here, so a shared test-helpers module would be one more file to open for
 * no real reuse.
 */
function menuOption(name: RegExp | string) {
  return screen.getByRole('menuitemradio', { name, hidden: true })
}

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

  it('shows country flag icons beside the three language names', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(trigger(en.a11y.chooseLanguage))
    const menu = screen.getByRole('menu', {
      name: en.a11y.languageMenu,
      hidden: true,
    })

    expect(
      Array.from(menu.querySelectorAll('svg[data-language-flag]')).map((flag) =>
        flag.getAttribute('data-language-flag'),
      ),
    ).toEqual(['en', 'fr', 'es'])
    expect(menuOption(en.nav.languages.en)).toBeInTheDocument()
    expect(menuOption(en.nav.languages.fr)).toBeInTheDocument()
    expect(menuOption(en.nav.languages.es)).toBeInTheDocument()
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
