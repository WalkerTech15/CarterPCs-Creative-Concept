import type { Dictionary } from './index'

/**
 * Spanish dictionary. Structurally checked against `en.ts` by the `Dictionary`
 * annotation below — a missing or misspelled key fails `npm run typecheck`.
 *
 * Copy is translated, not transliterated: line lengths are kept close to the
 * English source so the approved display-type geometry (Hero's two-line
 * headline, Content Universe's one-word-per-line kinetic entries, the nav
 * bar's six centre labels) holds without reflowing. See `en.ts`'s top comment
 * for what is deliberately left untranslated.
 */
export const es: Dictionary = {
  meta: {
    title: 'CarterPCs — Concepto de portafolio',
    description:
      'Concepto de portafolio interactivo no oficial inspirado en CarterPCs.',
  },

  a11y: {
    skipToContent: 'Saltar al contenido',
    primaryNavigation: 'Principal',
    chooseTheme: 'Elegir tema',
    chooseLanguage: 'Elegir idioma',
    chooseSections: 'Explorar secciones',
    themeMenu: 'Tema',
    languageMenu: 'Idioma',
    sectionsMenu: 'Secciones',
  },

  nav: {
    sections: ['Proyectos', 'Sistemas', 'Proceso', 'Universo'],
    about: 'Sobre Carter',
    themes: {
      dark: 'Oscuro',
      light: 'Claro',
      system: 'Sistema',
    },
    languages: {
      en: 'Inglés',
      fr: 'Francés',
      es: 'Español',
    },
  },

  hero: {
    eyebrow: 'Ordenadores cinemáticos',
    headlineLabel: 'CarterPCs — Hecho diferente',
    headlineLineOne: 'Hecho',
    headlineLineTwo: 'diferente',
    support:
      'Tecnología que engancha. Montajes de PC, hardware y las decisiones tecnológicas del día a día.',
    ctaPrimary: 'Explorar el universo',
    // Names the three real Shorts this button scrolls to. "Ver el vídeo"
    // implied a single showreel that does not exist.
    ctaSecondary: 'Ver los Shorts',
    aboutTitle: 'Sobre Carter',
    aboutText:
      'Creador de vídeos cortos sobre PC, móviles y tecnología cotidiana.',
    aboutLink: 'Saber más',
    statsTitle: 'En cifras',
    stats: {
      subscribers: 'Suscriptores YouTube',
      views: 'Total vistas YouTube',
    },
    statsSource:
      'Recuento público del canal de YouTube según TubeLeader, 24 de octubre de 2026; no son datos privados de YouTube Analytics.',
    tiles: {
      builds: {
        title: 'PC a medida',
        body: 'Ordenadores de alto rendimiento diseñados para la estética y la fiabilidad.',
      },
      content: {
        title: 'Creación de contenido',
        body: 'Historias cortas sobre PC, móviles y tecnología cotidiana.',
      },
      universe: {
        title: 'El universo',
        body: 'Explora los temas recurrentes en los vídeos de CarterPCs.',
      },
    },
    // Labels the real channel row. Replaced `featuredIn` ("Aparece en"),
    // which introduced publications this project cannot substantiate.
    channelsLabel: 'Ver en',
    disclaimer: 'Concepto no oficial. No implica afiliación ni respaldo.',
  },

  creator: {
    metaLabel: '02 / Creador',
    metaNote: 'Perfil del creador',
    kicker: 'El creador',
    headline: 'Conocimiento de hardware, sin relleno.',
    bodyOne:
      'Sus vídeos cortos tratan sobre hardware de PC, smartphones, dispositivos de consumo y dudas tecnológicas cotidianas.',
    bodyTwo:
      'Los temas van desde comparativas y consejos prácticos hasta hardware de PC, comentarios de creador y, a veces, videojuegos.',
    tags: 'Hardware de PC — Tecnología móvil — Tecnología de consumo — Antiestafas',
    platforms: 'TikTok · YouTube Shorts · Instagram Reels',
  },

  /* Solo interfaz: los titulares editoriales se mantienen en inglés; dos de
     ellos no están confirmados como títulos publicados de los vídeos. */
  featured: {
    metaLabel: '03 / Destacados',
    metaNote: 'Historias editoriales seleccionadas',
    title: 'Historias elegidas',
    playShort: 'Reproducir el Short',
    closePlayer: 'Cerrar el reproductor',
    actions: {
      like: 'Me gusta',
      comments: 'Comentarios',
      share: 'Compartir',
      watch: 'Ver en YouTube',
      linkCopied: 'Enlace copiado',
      copyFailed: 'No se pudo copiar el enlace',
      shareFailed: 'No se pudo abrir el menú para compartir',
    },
    a11y: {
      player: 'Reproductor de YouTube',
      opensInNewTab: 'se abre en una pestaña nueva',
      viewComments: 'Ver los comentarios en YouTube',
    },
  },

  hardware: {
    metaLabel: '04 / Hardware',
    metaNote: 'Experiencia de hardware',
    kicker: 'Dentro del montaje',
    headline: 'Construido desde dentro.',
    support:
      'Cada componente juzgado por lo que hace, no por lo que promete la caja.',
    tags: 'PC a medida — Prueba de componentes — A medida vs. preensamblado',
  },

  contentUniverse: {
    metaLabel: '05 / Universo de contenido',
    metaNote: 'Todo el alcance',
    kicker: 'Más allá de las historias destacadas',
    headline: 'Seis territorios, un feed conectado.',
    support:
      'El terreno recurrente al que vuelve cada vídeo: desde los PC a medida hasta las historias que no tienen nada que ver con el hardware.',
  },

  /* Closing statement, section links, and independent-concept disclaimer. */
  closing: {
    disclaimerLineOne: 'Concepto creativo independiente.',
    disclaimerLineTwo: 'Sin afiliación con CarterPCs.',
    headlineLineOne: 'Buena tecnología.',
    headlineLineTwo: 'Sin adivinar.',
    description:
      'Desde PC personalizados hasta dispositivos cotidianos: descubre los detalles, las ventajas y los consejos prácticos que hay detrás de la tecnología.',
    exploreStories: 'Explorar las historias',
    meetCreator: 'Conocer al creador',
  },

  /* `copyright` is the name only — the "©" and the year are composed in
     Footer.tsx. It follows this file's own `meta.title` wording. */
  footer: {
    copyright: 'CarterPCs — Concepto de portafolio',
    disclaimer:
      'Concepto independiente hecho por un fan. Sin afiliación ni respaldo de CarterPCs.',
    credit: 'Hecho por WalkerTech15 — fan de CarterPCs desde 2023.',
    a11y: {
      footerNavigation: 'Pie de página',
      socialLinks: 'Redes sociales',
      home: 'inicio',
      opensInNewTab: 'se abre en una pestaña nueva',
    },
  },
}
