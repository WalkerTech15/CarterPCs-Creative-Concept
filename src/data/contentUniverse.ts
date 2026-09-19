/**
 * Content Universe — typed category data for the Content Universe section
 * (ARCHITECTURE.md §6). Six content territories, not a video grid — see
 * ContentUniverse.tsx.
 *
 * Content status: category selection and `fullName` values come directly
 * from RESEARCH.md §3's Content Categories table (PC Hardware & Custom
 * Builds, Smartphones & Mobile Tech, Tech News & Controversies, Scam Tech &
 * Budget Gear, Emerging Tech & AI Tools, Community & Storytelling) — the
 * same six rows ARCHITECTURE.md §6 names as this section's content source,
 * cross-referenced against CONTENT.md's own (shorter) Main Content
 * Categories list. `tier` reflects RESEARCH.md §3's own "Importance" column
 * (Core/Primary → 1, High → 2, Medium/Medium-High → 3), used here to drive
 * deliberate scale variation rather than treating every category as equal.
 *
 * `description` and `tags` are original editorial-development paraphrases of
 * RESEARCH.md §3's "Typical Content" column for each row — never a
 * reproduced video title from §5 Notable Videos (that table is marked in
 * TECH_STACK.md §9 as unlicensed candidates, not cleared copy) and never a
 * Carter quote. No follower/subscriber/view counts, dates, prices, or
 * milestones appear anywhere below.
 *
 * Categories are deliberately unnumbered (no "01/02/03" index), unlike
 * `featured.ts`'s three stories or `hardware.ts`'s three beats: Featured and
 * Hardware are both sequences: Content Universe is explicitly the opposite
 * of a sequence — six territories that coexist, per ARCHITECTURE.md's "the
 * breadth of CarterPCs' content categories" framing.
 *
 * LOCALIZATION: every text field is a `Localized` record stored next to the
 * `id`/`tier`/`shortIndex` structure it describes, and `getContentCategories(
 * language)` resolves one language into the flat shape the section renders.
 * `id` is NEVER localized — it is the animation selector (`[data-cat="…"]`,
 * `[data-media="…"]`) the pinned choreography addresses, so the timeline is
 * identical in all three languages. `primary` stays one word per line in
 * every language because that split IS the kinetic-type treatment; the
 * translations are chosen to survive that split without hyphenation (e.g.
 * "Emerging / Tech" → "Tech / émergente", which reads correctly stacked and
 * still joins into a natural phrase in the closing index line).
 */

import { localize, type Language, type Localized } from '../i18n'

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
  shortIndex: string | null
}

interface ContentCategorySource {
  id: string
  tier: ContentCategory['tier']
  shortIndex: string | null
  fullName: Localized<string>
  primary: Localized<string[]>
  secondary: Localized<string>
  description: Localized<string>
  tags: Localized<string[]>
}

const contentCategorySources: ContentCategorySource[] = [
  {
    id: 'hardware',
    tier: 1,
    // "What's the best PC you can get for $250k??" — featured.ts story 01.
    shortIndex: '01',
    fullName: {
      en: 'PC Hardware & Custom Builds',
      fr: 'Matériel PC et PC sur mesure',
      es: 'Hardware de PC y montajes a medida',
    },
    primary: {
      en: ['Hardware'],
      fr: ['Matériel'],
      es: ['Hardware'],
    },
    secondary: {
      en: 'Custom Builds',
      fr: 'PC sur mesure',
      es: 'PC a medida',
    },
    description: {
      en: 'Budget rigs, extreme builds, and every component judged on what it actually costs to run.',
      fr: 'Machines à petit budget, montages extrêmes, et chaque composant jugé sur ce qu’il coûte vraiment à l’usage.',
      es: 'Equipos económicos, montajes extremos y cada componente juzgado por lo que cuesta de verdad usarlo.',
    },
    tags: {
      en: ['Custom Builds', 'GPU / CPU Value', 'Prebuilt Teardowns'],
      fr: ['PC sur mesure', 'Valeur GPU / CPU', 'Démontage de préassemblés'],
      es: ['PC a medida', 'Valor GPU / CPU', 'Desmontaje de preensamblados'],
    },
  },
  {
    id: 'mobile',
    tier: 1,
    // "What has Apple copied from Samsung??" — featured.ts story 02.
    shortIndex: '02',
    fullName: {
      en: 'Smartphones & Mobile Tech',
      fr: 'Smartphones et tech mobile',
      es: 'Smartphones y tecnología móvil',
    },
    primary: {
      en: ['Mobile', 'Tech'],
      fr: ['Tech', 'mobile'],
      es: ['Tech', 'móvil'],
    },
    secondary: {
      en: 'Smartphones',
      fr: 'Smartphones',
      es: 'Smartphones',
    },
    description: {
      en: 'The phones people argue about most — features, quirks, and ecosystem loyalty tested in public.',
      fr: 'Les téléphones dont on débat le plus — fonctions, bizarreries et fidélité à l’écosystème, testées en public.',
      es: 'Los teléfonos sobre los que más se discute: funciones, rarezas y lealtad al ecosistema, puestas a prueba en público.',
    },
    tags: {
      en: ['iOS & Android', 'Feature Deep-Dives', 'Ecosystem Debates'],
      fr: ['iOS et Android', 'Fonctions en détail', 'Débats d’écosystème'],
      es: ['iOS y Android', 'Funciones a fondo', 'Debates de ecosistema'],
    },
  },
  {
    id: 'tech-news',
    tier: 2,
    shortIndex: null,
    fullName: {
      en: 'Tech News & Controversies',
      fr: 'Actus tech et controverses',
      es: 'Noticias tech y controversias',
    },
    primary: {
      en: ['Tech', 'News'],
      fr: ['Actus', 'tech'],
      es: ['Noticias', 'tech'],
    },
    secondary: {
      en: 'Controversies',
      fr: 'Controverses',
      es: 'Controversias',
    },
    description: {
      en: 'Policy shifts and corporate missteps, covered the same day they happen.',
      fr: 'Virages réglementaires et faux pas des entreprises, couverts le jour même.',
      es: 'Giros normativos y tropiezos corporativos, cubiertos el mismo día.',
    },
    tags: {
      en: ['Policy Shifts', 'Corporate Fallout', 'Quick Reaction'],
      fr: [
        'Virages réglementaires',
        'Retombées d’entreprise',
        'Réaction rapide',
      ],
      es: ['Giros normativos', 'Caídas corporativas', 'Reacción rápida'],
    },
  },
  {
    id: 'scam-tech',
    tier: 2,
    shortIndex: null,
    fullName: {
      en: 'Scam Tech & Budget Gear',
      fr: 'Arnaques tech et matériel discount',
      es: 'Tecnología fraudulenta y aparatos baratos',
    },
    primary: {
      en: ['Scam', 'Tech'],
      fr: ['Arnaques', 'tech'],
      es: ['Fraudes', 'tech'],
    },
    secondary: {
      en: 'Budget Gear',
      fr: 'Matériel discount',
      es: 'Aparatos baratos',
    },
    description: {
      en: "Suspiciously cheap hardware, tested until it proves itself — or doesn't.",
      fr: 'Du matériel suspicieusement bon marché, testé jusqu’à ce qu’il fasse ses preuves — ou non.',
      es: 'Hardware sospechosamente barato, probado hasta que demuestra su valía — o no.',
    },
    tags: {
      en: ['Budget Gear', 'Consumer Testing', 'Marketing Callouts'],
      fr: ['Matériel discount', 'Tests grand public', 'Marketing dénoncé'],
      es: ['Aparatos baratos', 'Pruebas de consumo', 'Marketing señalado'],
    },
  },
  {
    id: 'emerging-tech',
    tier: 3,
    shortIndex: null,
    fullName: {
      en: 'Emerging Tech & AI Tools',
      fr: 'Tech émergente et outils IA',
      es: 'Tecnología emergente y herramientas de IA',
    },
    primary: {
      en: ['Emerging', 'Tech'],
      fr: ['Tech', 'émergente'],
      es: ['Tech', 'emergente'],
    },
    secondary: {
      en: 'AI Tools',
      fr: 'Outils IA',
      es: 'Herramientas de IA',
    },
    description: {
      en: 'Spatial computing, AI tools, and hardware still finding its category.',
      fr: 'Informatique spatiale, outils d’IA et matériel qui cherche encore sa catégorie.',
      es: 'Computación espacial, herramientas de IA y hardware que aún busca su categoría.',
    },
    tags: {
      en: ['AI Tools', 'Spatial Tech', 'Early Hardware'],
      fr: ['Outils IA', 'Tech spatiale', 'Matériel précoce'],
      es: ['Herramientas de IA', 'Tecnología espacial', 'Hardware temprano'],
    },
  },
  {
    id: 'community',
    tier: 3,
    shortIndex: null,
    fullName: {
      en: 'Community & Storytelling',
      fr: 'Communauté et récits',
      es: 'Comunidad y relatos',
    },
    primary: {
      en: ['Community'],
      fr: ['Communauté'],
      es: ['Comunidad'],
    },
    secondary: {
      en: 'Storytelling',
      fr: 'Récits',
      es: 'Relatos',
    },
    description: {
      en: "Viewer trades, collaborations, and the moments that aren't about hardware at all.",
      fr: 'Échanges avec les spectateurs, collaborations et moments qui n’ont rien à voir avec le matériel.',
      es: 'Intercambios con espectadores, colaboraciones y momentos que no van de hardware en absoluto.',
    },
    tags: {
      en: ['Viewer Stories', 'Collaborations', 'Milestones'],
      fr: ['Histoires de spectateurs', 'Collaborations', 'Étapes marquantes'],
      es: ['Historias de espectadores', 'Colaboraciones', 'Hitos'],
    },
  },
]

export function getContentCategories(language: Language): ContentCategory[] {
  return contentCategorySources.map((category) => ({
    id: category.id,
    tier: category.tier,
    shortIndex: category.shortIndex,
    fullName: localize(category.fullName, language),
    primary: localize(category.primary, language),
    secondary: localize(category.secondary, language),
    description: localize(category.description, language),
    tags: localize(category.tags, language),
  }))
}
