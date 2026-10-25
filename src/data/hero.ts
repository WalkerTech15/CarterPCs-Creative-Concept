/**
 * Hero — structural data for the two reference-composition modules that list
 * multiple entries: the lower content tiles and the By The Numbers card.
 *
 * Not `Localized<...>` like `featured.ts`/`hardware.ts`/`contentUniverse.ts`:
 * every visible word here (tile titles/bodies, stat labels) is resolved from
 * the dictionary in Hero.tsx via `t.hero.tiles[copy]` / `t.hero.stats[label]`.
 * This file only owns the structure those lookups key into — index, href,
 * media, and which dictionary key each stat's label comes from — the same
 * split `channels.ts` uses for Hero's channel row.
 */

import tileBuilds from '../assets/hero/tile-media-builds.webp'
import tileStudio from '../assets/hero/tile-media-studio.webp'
import tileUniverse from '../assets/hero/tile-media-universe.webp'

/**
 * Lower editorial tiles, matched to the reference's three modules.
 *
 * MEDIA: temporary reference assets, cropped non-destructively from the media
 * regions of the user's approved concept render (no text, borders or UI
 * cropped; nothing scraped from third parties). Swap for final approved
 * photography when it exists.
 *
 * Structure only — index, destination and media never change with language.
 * `copy` names the tile's entry in the active dictionary (`t.hero.tiles`), so
 * a translated title/body can never drift away from its own href or asset.
 */
export const HERO_TILES = [
  {
    index: '03',
    copy: 'builds',
    href: '#hardware',
    media: tileBuilds,
  },
  {
    index: '04',
    copy: 'content',
    href: '#featured',
    media: tileStudio,
  },
  {
    index: '05',
    copy: 'universe',
    href: '#content-universe',
    media: tileUniverse,
  },
] as const

/**
 * By The Numbers card — the two public YouTube channel metrics, sourced
 * from TubeLeader's public tracker page for the CarterPCs channel
 * (tubeleader.com/youtube-channel/actuallycarterpcs), read 24 October 2026:
 * 3,890,000 subscribers and 10,064,416,227 total views. These are third-party
 * public-counter estimates, not private YouTube Analytics — the on-screen
 * `t.hero.statsSource` line says so and gives the snapshot date.
 *
 * ROUNDING DIRECTION: a "+" suffix is a floor claim, so each value is rounded
 * DOWN to the nearest tenth, which is the only direction that keeps it below
 * the cited reading — 3,890,000 is "3.8M+", not "3.9M+"; 10,064,416,227 is
 * "10.0B+", not "10.1B+".
 *
 * No lifetime custom-build counter is shown: no such figure is publicly
 * tracked, and this card does not invent one.
 *
 * LOCALIZATION: the two values below are rendered unchanged in every
 * language — a figure must not be re-typed per locale where it could be
 * mistranscribed. Only the LABELS (`t.hero.stats[label]`) and the dated
 * `t.hero.statsSource` line are localized.
 *
 * Refresh the values and `statsSource`'s date together before any production
 * release, from a fresh read of the same source, and never substitute the
 * concept image's illustrative figures (1.2M+ / 100M+ / 4K+).
 */
export const HERO_STATS = [
  { value: '3.8M+', label: 'subscribers' },
  { value: '10.0B+', label: 'views' },
] as const
