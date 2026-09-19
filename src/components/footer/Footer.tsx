import { usePreferences } from '../../app/Preferences'
import { SECTION_HREFS } from '../navigation/sections'
import { CHANNELS } from '../../data/channels'
import styles from './Footer.module.css'

/**
 * Footer — the site's last row, deliberately quieter than the Closing
 * statement above it.
 *
 * COMPOSITION
 * One hairline divider, then two compact rows on the shared 96rem canvas:
 * destinations and platforms on the first, ownership and disclaimer on the
 * second. Below 640px the four groups simply stack. Nothing here competes
 * with Closing — smaller type, muted ink throughout, and no display face.
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
 * list is exactly how one of them goes stale. They are typographic labels
 * rather than brand marks: the site bundles no third-party logo files
 * anywhere, and a text label is its own accessible name.
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

function Footer() {
  const { t, navigationLabels } = usePreferences()

  return (
    <footer className={styles.footer}>
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.canvas}>
        {/* Same six destinations as the bar, from the same shared list — see
            components/navigation/sections.ts. */}
        <nav className={styles.nav} aria-label={t.footer.a11y.footerNavigation}>
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
                {name}
                <span className={styles.external} aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className={styles.copyright}>
          {/* The one accent in the footer, echoing the identity's indicator in
              the bar and in the Closing statement. */}
          <span className={styles.accentDot} aria-hidden="true" />©{' '}
          {COPYRIGHT_YEAR} {t.footer.copyright}
        </p>

        {/* One line only. The Closing statement directly above already says
            "Independent creative concept." — repeating it here read as an
            editing slip rather than as emphasis. */}
        <p className={styles.disclaimer}>{t.footer.disclaimer}</p>
      </div>
    </footer>
  )
}

export default Footer
