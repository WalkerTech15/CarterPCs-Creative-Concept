import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_LANGUAGE,
  getDictionary,
  isLanguage,
  type Dictionary,
  type Language,
} from '../i18n'

export type ThemePreference = 'dark' | 'light' | 'system'
export type { Language }

const THEME_PREFERENCES: ThemePreference[] = ['dark', 'light', 'system']

const LANGUAGE_STORAGE_KEY = 'carterpcs-language'
const THEME_STORAGE_KEY = 'carterpcs-theme'

interface PreferencesValue {
  language: Language
  setLanguage: (language: Language) => void
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
  /**
   * The fully-resolved dictionary for the current language. Components render
   * from this directly — see src/i18n/index.ts for why no DOM-level
   * translation pass exists.
   */
  t: Dictionary
  /** Language names written in the CURRENT language, for the nav's language menu. */
  languageLabels: Record<Language, string>
  /** The six centre nav labels, in bar order. */
  navigationLabels: string[]
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

function readPreference(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function storePreference(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Persistence is optional: preferences still work in memory when storage
    // is denied or full. Never prevent the application from rendering.
  }
}

function readStoredLanguage(): Language {
  const value = readPreference(LANGUAGE_STORAGE_KEY)
  if (isLanguage(value)) return value
  // Browser language preferences are more useful than physical location and
  // need neither geolocation permission nor a third-party IP lookup.
  for (const locale of navigator.languages?.length
    ? navigator.languages
    : [navigator.language]) {
    const language = locale.toLowerCase().split(/[-_]/)[0]
    if (isLanguage(language)) return language
  }
  return DEFAULT_LANGUAGE
}

function readStoredTheme(): ThemePreference {
  const value = readPreference(THEME_STORAGE_KEY)
  return THEME_PREFERENCES.includes(value as ThemePreference)
    ? (value as ThemePreference)
    : 'system'
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readStoredLanguage)
  const [theme, setTheme] = useState<ThemePreference>(readStoredTheme)

  const t = useMemo(() => getDictionary(language), [language])

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const resolved =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : theme
      if (root.dataset.theme === resolved) {
        // Already painted in this palette — index.html stamps the same
        // resolution before first paint, so the mount-time run lands here.
        return
      }
      // A THEME change is a palette swap, not an interaction: every element
      // that transitions `color`/`background-color` for hover would otherwise
      // animate the swap too, and for ~150ms render in-between colours that
      // belong to neither palette (measured under AA on both grounds). The
      // attribute turns those transitions off for the swap itself — see
      // global.css — and comes back off the tree one frame later, so hover
      // behaviour is untouched.
      root.setAttribute('data-theme-switching', '')
      root.dataset.theme = resolved
      // Force the un-transitioned styles to actually commit before the
      // attribute is lifted.
      void document.body.offsetWidth
      requestAnimationFrame(() => {
        root.removeAttribute('data-theme-switching')
      })
    }
    apply()
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  // Document-level language state and metadata. `lang` has to track the
  // rendered copy for screen-reader pronunciation and browser translation
  // prompts; title/description are the only visible strings that live outside
  // the React tree, so they are written here rather than in index.html.
  useEffect(() => {
    document.documentElement.lang = language
    document.title = t.meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t.meta.description)
    storePreference(LANGUAGE_STORAGE_KEY, language)
  }, [language, t])

  useEffect(() => {
    storePreference(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      t,
      languageLabels: t.nav.languages,
      navigationLabels: t.nav.sections,
    }),
    [language, theme, t],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context)
    throw new Error('usePreferences must be used inside PreferencesProvider')
  return context
}
