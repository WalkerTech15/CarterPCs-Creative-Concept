import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PreferencesProvider, usePreferences } from './Preferences'

function Probe() {
  const { language, theme, setLanguage, setTheme } = usePreferences()
  return (
    <button
      onClick={() => {
        setLanguage('fr')
        setTheme('dark')
      }}
    >
      {language}/{theme}
    </button>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
})
afterEach(() => vi.restoreAllMocks())

describe('automatic first-visit preferences', () => {
  it.each([
    [['fr-FR'], 'fr'],
    [['en-US'], 'en'],
    [['es-MX'], 'es'],
    [['de-DE', 'fr-CA'], 'fr'],
    [['de-DE'], 'en'],
  ] as const)('resolves browser languages %j to %s', (locales, expected) => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([...locales])
    render(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>,
    )
    expect(
      screen.getByRole('button', { name: `${expected}/system` }),
    ).toBeInTheDocument()
  })

  it('keeps a saved manual preference ahead of browser preferences', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR'])
    window.localStorage.setItem('carterpcs-language', 'es')
    window.localStorage.setItem('carterpcs-theme', 'light')
    render(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>,
    )
    expect(screen.getByRole('button', { name: 'es/light' })).toBeInTheDocument()
  })
})

describe('preferences without reliable storage', () => {
  it.each(['getter', 'read', 'write'] as const)(
    'renders and changes preferences when the storage %s throws',
    (failure) => {
      window.localStorage.clear()
      const denied = () => {
        throw new DOMException('Storage denied', 'SecurityError')
      }
      if (failure === 'getter')
        vi.spyOn(window, 'localStorage', 'get').mockImplementation(denied)
      if (failure === 'read')
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied)
      if (failure === 'write')
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denied)
      render(
        <PreferencesProvider>
          <Probe />
        </PreferencesProvider>,
      )
      fireEvent.click(screen.getByRole('button', { name: 'en/system' }))
      expect(
        screen.getByRole('button', { name: 'fr/dark' }),
      ).toBeInTheDocument()
      expect(document.documentElement.lang).toBe('fr')
      expect(document.documentElement.dataset.theme).toBe('dark')
    },
  )

  it('ignores invalid saved values', () => {
    window.localStorage.setItem('carterpcs-language', 'invalid')
    window.localStorage.setItem('carterpcs-theme', 'invalid')
    render(
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>,
    )
    expect(
      screen.getByRole('button', { name: 'en/system' }),
    ).toBeInTheDocument()
  })
})
