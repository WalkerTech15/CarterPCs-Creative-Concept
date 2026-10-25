import { usePreferences } from '../../app/Preferences'
import { SECTION_HREFS } from '../navigation/sections'
import { CHANNELS } from '../../data/channels'
import styles from './Footer.module.css'

/**
 * Footer — the site's last row, deliberately quieter than the Closing
 * statement above it.
 *
 * COMPOSITION
 * The reference composition has three clear groups in its main row and three
 * aligned ownership/disclaimer/credit groups below a second divider.
 *
 * MOTION
 * None, on purpose. Every section above carries a one-shot scroll reveal;
 * the footer is the one place where an entrance would be noise rather than
 * choreography, and "no animation" is also the quietest possible answer to
 * the reduced-motion requirement — there is nothing to disable, and nothing
 * that can strand an element at opacity 0 (which is exactly how the Closing
 * section's back-to-top control broke in the previous pass). The only
 * transition is a hover colour change, which the global reduced-motion rule
 * already collapses.
 *
 * SOCIAL LINKS
 * Exactly the three destinations that were supplied. They now come from
 * `data/channels.ts` rather than a private const here, because the Hero's
 * channel row links to the same three and two hand-maintained copies of a URL
 * list is exactly how one of them goes stale. Small inline SVG marks accompany
 * visible platform names; the names remain the accessible labels.
 *
 * Each carries `target="_blank"` with `rel="noreferrer"`, and an accessible
 * name that appends a translated "opens in a new tab" AFTER the visible
 * platform name — so the visible label remains the start of the accessible
 * name (WCAG 2.5.3 Label in Name) instead of being replaced by it.
 *
 * There are no counts, no contact details, and no other destinations.
 */

/** Language-neutral; the translated part is the name in `footer.copyright`. */
const COPYRIGHT_YEAR = 2026

function ChannelIcon({ name }: { name: (typeof CHANNELS)[number]['name'] }) {
  if (name === 'YouTube') {
    return (
      <svg
        className={styles.channelIcon}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"
          fill="currentColor"
        />
        <path d="m9.6 15.4 6.3-3.6-6.3-3.6v7.2Z" fill="var(--color-bg-base)" />
      </svg>
    )
  }

  if (name === 'Instagram') {
    return (
      <svg
        className={styles.channelIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.6" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  return (
    <svg
      className={styles.channelIcon}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M15.6 2h-3.2v13.1a3.05 3.05 0 1 1-2.4-2.98V8.85a6.3 6.3 0 1 0 5.6 6.25V8.4a9.3 9.3 0 0 0 5.2 1.6V6.8c-2.7 0-4.8-1.7-5.2-4.8Z" />
    </svg>
  )
}

function Footer() {
  const { t, navigationLabels } = usePreferences()

  return (
    <footer className={styles.footer}>
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.canvas}>
        <div className={styles.topRow}>
          <a
            className={styles.brand}
            href="#hero"
            aria-label={`CarterPCs — ${t.footer.a11y.home}`}
          >
            <span>Carter</span>
            <span className={styles.brandAccent}>PCs</span>
          </a>
          <span className={styles.columnRule} aria-hidden="true" />

          {/* Same real section destinations as the bar, from the shared list — see
            components/navigation/sections.ts. */}
          <nav
            className={styles.nav}
            aria-label={t.footer.a11y.footerNavigation}
          >
            <ul className={styles.navList}>
              {SECTION_HREFS.map((href, index) => (
                <li key={`${href}-${index}`}>
                  <a className={styles.link} href={href}>
                    {navigationLabels[index]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <span className={styles.columnRule} aria-hidden="true" />

          <ul className={styles.social} aria-label={t.footer.a11y.socialLinks}>
            {CHANNELS.map(({ name, href }) => (
              <li key={name}>
                <a
                  className={styles.link}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${name} — ${t.footer.a11y.opensInNewTab}`}
                >
                  <ChannelIcon name={name} />
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.metaRow}>
          <p className={styles.copyright}>
            © {COPYRIGHT_YEAR} {t.footer.copyright}
          </p>
          <p className={styles.disclaimer}>{t.footer.disclaimer}</p>
          <p className={styles.credit}>{t.footer.credit}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
