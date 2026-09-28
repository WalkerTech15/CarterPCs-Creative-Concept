/**
 * The content model — every shape a `src/data/*` file resolves for a section
 * to render, in one place, so what the site can show is readable without
 * opening the sections that show it.
 *
 * Each data file authors its rows as a `LocalizedSource<...>` of the shape
 * below (structure once, copy three times — see `Localized` in i18n/index.ts)
 * and exposes a `get*(language)` selector that resolves one language into that
 * shape. Provenance and verification notes stay in the data files, next to
 * the values they describe.
 */

import type { Localized } from '../i18n'

/**
 * The authoring form of a resolved content shape: the fields named in `K`
 * carry all three languages, every other field is language-independent
 * structure. Derived rather than written out per file, so a field added to a
 * shape below cannot be forgotten in its source type.
 */
export type LocalizedSource<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: Localized<T[P]>
}

/** One Featured panel — see data/featured.ts. */
export interface FeaturedStory {
  /** Panel index within Featured, distinct from the global "03 / Featured" section number. */
  index: string
  category: string
  headlineLines: string[]
  support: string
  /** Restrained editorial metadata, sourced from RESEARCH.md §3's category names. */
  tags: string[]
  /** Selects the panel's decorative media-stage variant (see Featured.module.css). */
  variant: 'hardware' | 'tech' | 'commentary'
  /** youtube.com watch page — the target of the rail's Comments and Watch links. */
  videoUrl: string
  /**
   * Privacy-enhanced embed, on youtube-nocookie.com. This is a BASE url: no
   * iframe carries it until a visitor presses Play, and `playerSrc()` in
   * sections/featured/featured.utils.ts appends `&autoplay=1` at that point
   * (see the comment there for why autoplay is withheld under
   * prefers-reduced-motion). `rel=0` keeps end-cards on the same channel;
   * `playsinline=1` stops iOS hijacking the whole screen.
   */
  embedUrl: string
  thumbnail: string
}

/** One Hardware beat — see data/hardware.ts. */
export interface HardwareBeat {
  index: string
  label: string
  description: string
}

/** One Content Universe territory — see data/contentUniverse.ts. */
export interface ContentCategory {
  id: string
  /** Full RESEARCH.md §3 category name — used as the accessible heading name. */
  fullName: string
  /** Visual kinetic-type treatment: one word per line. */
  primary: string[]
  /** Short qualifier shown beneath the primary word(s). */
  secondary: string
  description: string
  tags: string[]
  /** Scale tier, from RESEARCH.md §3's Importance column: 1 = Core/Primary, 2 = High, 3 = Medium(-High). */
  tier: 1 | 2 | 3
  /**
   * The `index` of the Featured story (see data/featured.ts) that actually
   * belongs to this territory, or null where none does.
   *
   * This replaced a `media: boolean` flag that switched on an empty
   * decorative crop window — a clipped rectangle holding a blurred colour
   * field, described in the code as "deliberately obscured future footage".
   * On the light theme it read as an image that had failed to load, and on
   * either theme it was a picture of nothing: the section's two most
   * important territories were illustrated with placeholders while three
   * real, already-licensed Shorts sat one section above it. Pointing the
   * same two slots at those Shorts costs no new assets and makes the field
   * an index of real work rather than a taxonomy diagram.
   *
   * Only the two tier-1 territories carry one, so media stays a deliberate
   * accent rather than a per-item default — and the mapping lives here, as
   * data, instead of being inferred from a category name in the view.
   */
  shortIndex: FeaturedStory['index'] | null
}
