/**
 * Featured Content — typed panel data for the Featured section
 * (ARCHITECTURE.md §4). Three editorial chapters, not a video grid.
 *
 * Content status: every `headlineLines`/`support` value below is
 * PROVISIONAL EDITORIAL DEVELOPMENT COPY, not a verified CarterPCs video
 * title or quote. RESEARCH.md §5 Notable Videos does contain specific
 * titles, but TECH_STACK.md §9 explicitly marks that table "a reference
 * list of candidates, not a cleared asset list" pending licensing review —
 * so no title from it is reproduced here, verbatim or paraphrased closely
 * enough to be mistaken for one. Instead, each panel's copy is written from
 * RESEARCH.md §3 Content Categories' *category-level* descriptions (typical
 * content, tone), the same sourcing tier CONTENT.md's own Featured Content
 * placeholders use. `category` names are taken directly from RESEARCH.md §3.
 * No follower/view counts, dates, or attributed quotes appear anywhere.
 *
 * LOCALIZATION: every text field is a `Localized` record carrying all three
 * languages, stored next to the structural fields (`index`, `variant`) that
 * the copy must stay in sync with. `getFeaturedStories(language)` resolves one
 * language into the flat `FeaturedStory` shape the section renders. The French
 * and Spanish headlines keep the English version's three-beat cadence and
 * comparable line lengths, because the panel's display type is set to that
 * measure. Nothing here is machine-translated at runtime.
 */

import { localize, type Language } from '../i18n'
import type { FeaturedStory, LocalizedSource } from './types'

const pc250kShort = new URL(
  '../assets/featured/pc-250k-short.webp',
  import.meta.url,
).href
const appleSamsungShort = new URL(
  '../assets/featured/apple-samsung-short.webp',
  import.meta.url,
).href
const thinkpadShort = new URL(
  '../assets/featured/thinkpad-short.webp',
  import.meta.url,
).href

/** Authoring shape: structure once, copy three times. */
type FeaturedStorySource = LocalizedSource<
  FeaturedStory,
  'category' | 'headlineLines' | 'support' | 'tags'
>

const featuredStorySources: FeaturedStorySource[] = [
  {
    index: '01',
    variant: 'hardware',
    category: {
      en: 'Hardware',
      fr: 'Matériel',
      es: 'Hardware',
    },
    headlineLines: {
      en: ['What’s the best PC', 'you can get for', '$250k??'],
      fr: ['What’s the best PC', 'you can get for', '$250k??'],
      es: ['What’s the best PC', 'you can get for', '$250k??'],
    },
    support: {
      en: 'A quick look at the most extreme PC budget CarterPCs has explored.',
      fr: 'Un regard rapide sur le budget PC le plus extrême exploré par CarterPCs.',
      es: 'Una mirada rápida al presupuesto de PC más extremo que CarterPCs ha explorado.',
    },
    tags: {
      en: ['YouTube Short', 'PC Hardware', 'Custom Builds'],
      fr: ['Short YouTube', 'Matériel PC', 'PC sur mesure'],
      es: ['Short de YouTube', 'Hardware de PC', 'PC a medida'],
    },
    videoUrl: 'https://www.youtube.com/shorts/JekaYRzZRfU',
    embedUrl:
      'https://www.youtube-nocookie.com/embed/JekaYRzZRfU?rel=0&playsinline=1',
    thumbnail: pc250kShort,
  },
  {
    index: '02',
    variant: 'tech',
    category: {
      en: 'Tech',
      fr: 'Tech',
      es: 'Tecnología',
    },
    headlineLines: {
      en: ['What has Apple copied', 'from Samsung??'],
      fr: ['What has Apple copied', 'from Samsung??'],
      es: ['What has Apple copied', 'from Samsung??'],
    },
    support: {
      en: 'A fast comparison of the features Apple borrowed and the ideas Samsung brought first.',
      fr: 'Une comparaison rapide des fonctions reprises par Apple et des idées lancées d’abord par Samsung.',
      es: 'Una comparación rápida entre las funciones que Apple adoptó y las ideas que Samsung lanzó primero.',
    },
    tags: {
      en: ['YouTube Short', 'Smartphones', 'Consumer Tech'],
      fr: ['Short YouTube', 'Smartphones', 'Tech grand public'],
      es: ['Short de YouTube', 'Smartphones', 'Tecnología de consumo'],
    },
    videoUrl: 'https://www.youtube.com/shorts/1iBOP4Gyfi8',
    embedUrl:
      'https://www.youtube-nocookie.com/embed/1iBOP4Gyfi8?rel=0&playsinline=1',
    thumbnail: appleSamsungShort,
  },
  {
    index: '03',
    variant: 'commentary',
    category: {
      en: 'Commentary',
      fr: 'Analyse',
      es: 'Opinión',
    },
    headlineLines: {
      en: ['The Lenovo ThinkPad', 'is the Toyota', 'of laptops..'],
      fr: ['The Lenovo ThinkPad', 'is the Toyota', 'of laptops..'],
      es: ['The Lenovo ThinkPad', 'is the Toyota', 'of laptops..'],
    },
    support: {
      en: 'A quick case for why this reliable laptop has earned its everyday-car reputation.',
      fr: 'Un argument rapide pour expliquer pourquoi ce portable fiable a gagné sa réputation de voiture du quotidien.',
      es: 'Una explicación rápida de por qué este portátil fiable se ganó su reputación de coche para todos los días.',
    },
    tags: {
      en: ['YouTube Short', 'Laptops', 'Everyday Tech'],
      fr: ['Short YouTube', 'Ordinateurs portables', 'Tech du quotidien'],
      es: ['Short de YouTube', 'Portátiles', 'Tecnología cotidiana'],
    },
    videoUrl: 'https://www.youtube.com/shorts/dT49PluhENM',
    embedUrl:
      'https://www.youtube-nocookie.com/embed/dT49PluhENM?rel=0&playsinline=1',
    thumbnail: thinkpadShort,
  },
]

/** Panel count is language-independent — safe for layout math before a render. */
export const featuredStoryCount = featuredStorySources.length

export function getFeaturedStories(language: Language): FeaturedStory[] {
  return featuredStorySources.map((story) => ({
    index: story.index,
    variant: story.variant,
    category: localize(story.category, language),
    headlineLines: localize(story.headlineLines, language),
    support: localize(story.support, language),
    tags: localize(story.tags, language),
    videoUrl: story.videoUrl,
    embedUrl: story.embedUrl,
    thumbnail: story.thumbnail,
  }))
}
