import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import styles from './Nav.module.css'
import { ThemeIcon } from './ThemeIcon'
import { SECTION_HREFS } from './sections'
import {
  usePreferences,
  type Language,
  type ThemePreference,
} from '../../app/Preferences'

/**
 * Primary navigation — recreation of the approved Hero reference's bar:
 * mark + wordmark + violet indicator left, the section labels centred
 * (one per real section — see ./sections.ts for why the reference's six
 * became four), "About Carter ↗" pill and the square utilities right.
 * Below 1024px the centre labels move behind the sections disclosure so
 * the fixed bar stays a compact header instead of wrapping to ~197px.
 *
 * LINK TARGETS: see ./sections.ts.
 *
 * The link targets themselves live in ./sections.ts, shared with the footer.
 *
 * PREFERENCE MENUS
 * The theme and language dropdowns are state-driven disclosures, not the
 * CSS-only `:hover`/`:focus-within` pair they started as. That earlier
 * version could not satisfy the behaviour this bar needs, because CSS has
 * no way to express any of it: selecting an option left focus inside the
 * menu, so `:focus-within` held it open indefinitely; Escape did nothing;
 * and the trigger exposed no `aria-expanded`, so assistive tech was never
 * told a popup existed at all, let alone whether it was open.
 *
 * Open/close is therefore owned by `openMenu` — one menu at a time — and
 * closes on: selecting an option, Escape (focus returns to the trigger),
 * focus leaving the wrapper, and a pointer press outside it. Triggers
 * carry `aria-haspopup`/`aria-expanded`/`aria-controls`; items stay
 * `menuitemradio` with live `aria-checked`. Keyboard support is a superset
 * of what the CSS version offered: Enter/Space and Arrow keys open the
 * menu and land on an item, arrows and Home/End move within it, Tab still
 * walks through naturally, and Escape returns to the trigger.
 */

const LANGUAGES: { code: Language }[] = [
  { code: 'en' },
  { code: 'fr' },
  { code: 'es' },
]

function LanguageFlag({ language }: { language: Language }) {
  return (
    <svg
      className={styles.flag}
      data-language-flag={language}
      viewBox="0 0 20 14"
      aria-hidden="true"
      focusable="false"
    >
      {language === 'fr' && (
        <>
          <rect width="6.67" height="14" fill="#1b3f8b" />
          <rect x="6.67" width="6.66" height="14" fill="#fff" />
          <rect x="13.33" width="6.67" height="14" fill="#ed2939" />
        </>
      )}
      {language === 'es' && (
        <>
          <rect width="20" height="14" fill="#aa151b" />
          <rect y="3.5" width="20" height="7" fill="#f1bf00" />
        </>
      )}
      {language === 'en' && (
        <>
          <rect width="20" height="14" fill="#fff" />
          {[0, 2.15, 4.3, 6.45, 8.6, 10.75, 12.9].map((y) => (
            <rect key={y} y={y} width="20" height="1.08" fill="#b22234" />
          ))}
          <rect width="8.5" height="7.55" fill="#3c3b6e" />
          {[
            [1.3, 1.15],
            [3.2, 1.15],
            [5.1, 1.15],
            [7, 1.15],
            [2.25, 2.65],
            [4.15, 2.65],
            [6.05, 2.65],
            [1.3, 4.15],
            [3.2, 4.15],
            [5.1, 4.15],
            [7, 4.15],
            [2.25, 5.65],
            [4.15, 5.65],
            [6.05, 5.65],
          ].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r="0.38" fill="#fff" />
          ))}
        </>
      )}
    </svg>
  )
}

/** Order only — the visible label comes from the active dictionary. */
const THEMES: ThemePreference[] = ['dark', 'light', 'system']

type MenuId = 'theme' | 'language' | 'sections'

function Nav() {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    t,
    languageLabels,
    navigationLabels,
  } = usePreferences()

  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)

  // Scrolled-state scrim (see Nav.module.css). One rAF in flight at most —
  // scroll events fire far more often than frames are painted, and the
  // scrim only needs the value that will actually render.
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setScrolled(window.scrollY > 16)
    }
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }
    // Initial read: a reload restores the previous scroll position, and the
    // bar must not render transparent over mid-page content while waiting
    // for the first scroll event.
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  const baseId = useId()
  const menuId = (id: MenuId) => `${baseId}-${id}-menu`

  const themeWrapRef = useRef<HTMLDivElement>(null)
  const languageWrapRef = useRef<HTMLDivElement>(null)
  const sectionsWrapRef = useRef<HTMLDivElement>(null)
  const themeTriggerRef = useRef<HTMLButtonElement>(null)
  const languageTriggerRef = useRef<HTMLButtonElement>(null)
  const sectionsTriggerRef = useRef<HTMLButtonElement>(null)

  const wrapRef = useCallback(
    (id: MenuId): RefObject<HTMLDivElement | null> =>
      id === 'theme'
        ? themeWrapRef
        : id === 'language'
          ? languageWrapRef
          : sectionsWrapRef,
    [],
  )
  const triggerRef = useCallback(
    (id: MenuId): RefObject<HTMLButtonElement | null> =>
      id === 'theme'
        ? themeTriggerRef
        : id === 'language'
          ? languageTriggerRef
          : sectionsTriggerRef,
    [],
  )

  const closeMenu = useCallback(
    (id: MenuId, returnFocus: boolean) => {
      setOpenMenu((current) => (current === id ? null : current))
      if (returnFocus) triggerRef(id).current?.focus()
    },
    [triggerRef],
  )

  // Escape anywhere, and any pointer press outside the open wrapper, close
  // it. Both live on the document rather than the wrapper so they still fire
  // when focus has drifted somewhere else entirely (a click on inert page
  // chrome, say) instead of stranding an open menu over the page.
  useEffect(() => {
    if (!openMenu) return

    const wrap = wrapRef(openMenu).current

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closeMenu(openMenu, true)
    }

    const handlePointerDown = (event: Event) => {
      if (wrap && !wrap.contains(event.target as Node))
        closeMenu(openMenu, false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [openMenu, closeMenu, wrapRef])

  const items = (id: MenuId) =>
    Array.from(
      wrapRef(id).current?.querySelectorAll<HTMLElement>(
        '[role="menuitemradio"], [role="menuitem"]',
      ) ?? [],
    )

  const focusItem = (id: MenuId, index: number) => {
    const list = items(id)
    if (!list.length) return
    const wrapped = (index + list.length) % list.length
    list[wrapped].focus()
  }

  /** Opens the menu, then lands on an item after the DOM update. */
  const openAt = (id: MenuId, edge: 'first' | 'last') => {
    setOpenMenu(id)
    // The closed menu is visibility:hidden until the state lands, so focus
    // has to wait for the committed DOM rather than target hidden markup.
    window.requestAnimationFrame(() =>
      focusItem(id, edge === 'first' ? 0 : items(id).length - 1),
    )
  }

  const handleTriggerKeyDown =
    (id: MenuId) => (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        // Match the arrow-key entry path and the menu-button pattern: opening
        // a menu moves focus into it instead of leaving keyboard users on the
        // trigger while the menu is already expanded.
        event.preventDefault()
        openAt(id, 'first')
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        openAt(id, 'first')
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        openAt(id, 'last')
      }
    }

  const handleMenuKeyDown =
    (id: MenuId) => (event: KeyboardEvent<HTMLDivElement>) => {
      const list = items(id)
      const index = list.indexOf(document.activeElement as HTMLButtonElement)
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        focusItem(id, index + 1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        focusItem(id, index - 1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        focusItem(id, 0)
      } else if (event.key === 'End') {
        event.preventDefault()
        focusItem(id, list.length - 1)
      }
    }

  const handleFocusOut =
    (id: MenuId) => (event: FocusEvent<HTMLDivElement>) => {
      const wrap = event.currentTarget
      const next = event.relatedTarget as Node | null
      if (next) {
        if (!wrap.contains(next)) closeMenu(id, false)
        return
      }
      // Some browsers report a null relatedTarget when a press moves focus to
      // the body. Deciding immediately would close the menu before the click
      // on the item it contains had a chance to land, so let activeElement
      // settle first.
      window.setTimeout(() => {
        if (!wrap.contains(document.activeElement)) closeMenu(id, false)
      }, 0)
    }

  /** Applies a selection, then closes and hands focus back to the trigger. */
  const select = (id: MenuId, apply: () => void) => {
    apply()
    closeMenu(id, true)
  }

  return (
    <nav
      className={styles.nav}
      aria-label={t.a11y.primaryNavigation}
      data-scrolled={scrolled || undefined}
    >
      {/* Same shared ~1536px composition canvas as the Hero, so the bar
          never spreads apart from the content on wide viewports. */}
      <div className={styles.bar}>
        <a className={styles.wordmark} href="#hero">
          {/* Neutral abstract mark — original geometry, not a copied logo. */}
          <svg
            className={styles.mark}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 1.5v13M3 4.25l10 7.5M13 4.25l-10 7.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          CarterPCs
          <span className={styles.markDot} aria-hidden="true" />
        </a>

        <ul className={styles.sections}>
          {SECTION_HREFS.map((href, index) => (
            <li key={`${href}-${index}`}>
              <a className={styles.link} href={href}>
                {navigationLabels[index]}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.utils}>
          <div
            className={styles.menuWrap}
            ref={themeWrapRef}
            onBlur={handleFocusOut('theme')}
          >
            <button
              className={styles.theme}
              type="button"
              ref={themeTriggerRef}
              aria-label={t.a11y.chooseTheme}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'theme'}
              aria-controls={menuId('theme')}
              onClick={() =>
                setOpenMenu((current) => (current === 'theme' ? null : 'theme'))
              }
              onKeyDown={handleTriggerKeyDown('theme')}
            >
              <ThemeIcon theme={theme} />
              <span className={styles.themeLabel} aria-hidden="true">
                {t.nav.themes[theme]}
              </span>
              <svg
                className={styles.themeChevron}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m4 6 4 4 4-4" />
              </svg>
            </button>
            <div
              className={
                openMenu === 'theme'
                  ? `${styles.menu} ${styles.menuOpen}`
                  : styles.menu
              }
              id={menuId('theme')}
              role="menu"
              aria-label={t.a11y.themeMenu}
              inert={openMenu !== 'theme'}
              // Programmatically focusable only: the arrow-key handler lives
              // on the container (keydown bubbles up from the items), and an
              // element carrying an interactive role must be able to hold
              // focus. It is never a Tab stop.
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown('theme')}
            >
              {THEMES.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={theme === value}
                  className={theme === value ? styles.menuActive : undefined}
                  onClick={() => select('theme', () => setTheme(value))}
                >
                  <ThemeIcon theme={value} />
                  {t.nav.themes[value]}
                  {theme === value && (
                    <span className={styles.themeCheck} aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div
            className={styles.menuWrap}
            ref={languageWrapRef}
            onBlur={handleFocusOut('language')}
          >
            <button
              className={styles.language}
              type="button"
              ref={languageTriggerRef}
              aria-label={t.a11y.chooseLanguage}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'language'}
              aria-controls={menuId('language')}
              onClick={() =>
                setOpenMenu((current) =>
                  current === 'language' ? null : 'language',
                )
              }
              onKeyDown={handleTriggerKeyDown('language')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="12" cy="12" r="9" />
                <ellipse cx="12" cy="12" rx="4" ry="9" />
                <path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" />
              </svg>
              <span className={styles.languageCode} aria-hidden="true">
                {language.toUpperCase()}
              </span>
              <svg
                className={styles.languageChevron}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m4 6 4 4 4-4" />
              </svg>
            </button>
            <div
              className={
                openMenu === 'language'
                  ? `${styles.menu} ${styles.menuOpen}`
                  : styles.menu
              }
              id={menuId('language')}
              role="menu"
              aria-label={t.a11y.languageMenu}
              inert={openMenu !== 'language'}
              // See the theme menu above — programmatically focusable only.
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown('language')}
            >
              {LANGUAGES.map(({ code }) => (
                <button
                  key={code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={language === code}
                  className={language === code ? styles.menuActive : undefined}
                  onClick={() => select('language', () => setLanguage(code))}
                >
                  <LanguageFlag language={code} />
                  {languageLabels[code]}
                </button>
              ))}
            </div>
          </div>

          <a className={styles.about} href="#creator">
            {t.nav.about}
            <span className={styles.aboutArrow} aria-hidden="true">
              ↗
            </span>
          </a>

          {/* COMPACT-HEADER SECTIONS MENU — below 1024px only (see
              .sectionsTrigger in Nav.module.css). The centre link row used to
              wrap under the identity there, holding the fixed bar at ~197px on
              phones; the links now live behind this disclosure instead. It is
              the same state-driven menu system as theme/language — same
              open-state owner, Escape-with-focus-return, outside-press close,
              arrow/Home/End movement — with role="menuitem" links as its items
              (the shared items() helper matches both item roles). Activating a
              link lets the anchor navigate, then closes the panel and hands
              focus back to the trigger so it is never stranded on a
              display:none child. */}
          <div
            className={styles.menuWrap}
            ref={sectionsWrapRef}
            onBlur={handleFocusOut('sections')}
          >
            <button
              className={styles.sectionsTrigger}
              type="button"
              ref={sectionsTriggerRef}
              aria-label={t.a11y.chooseSections}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'sections'}
              aria-controls={menuId('sections')}
              onClick={() =>
                setOpenMenu((current) =>
                  current === 'sections' ? null : 'sections',
                )
              }
              onKeyDown={handleTriggerKeyDown('sections')}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div
              className={
                openMenu === 'sections'
                  ? `${styles.menu} ${styles.sectionsMenu} ${styles.menuOpen}`
                  : `${styles.menu} ${styles.sectionsMenu}`
              }
              id={menuId('sections')}
              role="menu"
              aria-label={t.a11y.sectionsMenu}
              inert={openMenu !== 'sections'}
              // See the theme menu above — programmatically focusable only.
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown('sections')}
            >
              {SECTION_HREFS.map((href, index) => (
                <a
                  key={`${href}-${index}`}
                  role="menuitem"
                  href={href}
                  // Close WITHOUT reclaiming focus: activating a link is a
                  // navigation, and the browser moves focus with the fragment
                  // (to the target region). Stealing it back to the trigger
                  // would fight that. Escape and outside-press still return
                  // focus via the shared closeMenu path.
                  onClick={() => closeMenu('sections', false)}
                >
                  {navigationLabels[index]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Nav
