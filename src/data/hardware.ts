/**
 * Hardware Experience — typed beat content for the Hardware section
 * (ARCHITECTURE.md §5). Three restrained internal chapter markers, not
 * clickable tabs/cards — see Hardware.tsx.
 *
 * Content status: headline/support/beat copy is original editorial
 * development language, not a CarterPCs quote. Grounded in RESEARCH.md §7's
 * "Custom PCs vs. Overpriced Prebuilts" theme (value-oriented, hands-on,
 * unfiltered-critique tone) and CONTENT.md §Hardware Sequence's category
 * list (CPU, GPU, RAM, cooling, storage, build) — used only as *category*
 * references, never as specific specs, benchmarks, or claims. No follower
 * counts, view counts, dates, prices, or attributed quotes appear anywhere.
 *
 * LOCALIZATION: `label`/`description` are `Localized` records carrying all
 * three languages next to the `index` they belong to;
 * `getHardwareBeats(language)` resolves one language into the flat
 * `HardwareBeat` shape the section renders. Component names (GPU, CPU) are
 * kept as-is in every language — they are the terms used in all three.
 */

import { localize, type Language } from '../i18n'
import type { HardwareBeat, LocalizedSource } from './types'

type HardwareBeatSource = LocalizedSource<HardwareBeat, 'label' | 'description'>

const hardwareBeatSources: HardwareBeatSource[] = [
  {
    index: '01',
    label: {
      en: 'Build',
      fr: 'Montage',
      es: 'Montaje',
    },
    description: {
      en: 'The machine as a finished object — assembled, cabled, and powered on.',
      fr: 'La machine comme objet fini — assemblée, câblée et sous tension.',
      es: 'La máquina como objeto acabado: montada, cableada y encendida.',
    },
  },
  {
    index: '02',
    label: {
      en: 'Components',
      fr: 'Composants',
      es: 'Componentes',
    },
    description: {
      en: 'The individual pieces that matter, examined up close: GPU, CPU, cooling, storage.',
      fr: 'Les pièces qui comptent vraiment, examinées de près : GPU, CPU, refroidissement, stockage.',
      es: 'Las piezas que de verdad importan, examinadas de cerca: GPU, CPU, refrigeración, almacenamiento.',
    },
  },
  {
    index: '03',
    label: {
      en: 'Performance',
      fr: 'Performance',
      es: 'Rendimiento',
    },
    description: {
      en: 'Not a benchmark chart — what the hardware actually enables day to day.',
      fr: 'Pas un graphique de benchmark — ce que le matériel permet vraiment au quotidien.',
      es: 'No es una tabla de benchmarks: lo que el hardware permite de verdad cada día.',
    },
  },
]

export function getHardwareBeats(language: Language): HardwareBeat[] {
  return hardwareBeatSources.map((beat) => ({
    index: beat.index,
    label: localize(beat.label, language),
    description: localize(beat.description, language),
  }))
}
