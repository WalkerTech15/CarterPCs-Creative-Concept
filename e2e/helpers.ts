import type { Page } from '@playwright/test'
import { en } from '../src/i18n/en'

/**
 * The section labels appear twice — once in the bar and once in the footer's
 * compact row — so a bare name is ambiguous. Scoping to the landmark is also
 * a stronger assertion than the bare name was.
 */
export const primaryNav = (page: Page) =>
  page.getByRole('navigation', { name: en.a11y.primaryNavigation })
