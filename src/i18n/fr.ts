import type { Dictionary } from './index'

/**
 * French dictionary. Structurally checked against `en.ts` by the `Dictionary`
 * annotation below — a missing or misspelled key fails `npm run typecheck`.
 *
 * Copy is translated, not transliterated: line lengths are kept close to the
 * English source so the approved display-type geometry (Hero's two-line
 * headline, Content Universe's one-word-per-line kinetic entries, the nav
 * bar's six centre labels) holds without reflowing. See `en.ts`'s top comment
 * for what is deliberately left untranslated.
 */
export const fr: Dictionary = {
  meta: {
    title: 'CarterPCs — Concept de portfolio',
    description:
      'Concept de portfolio interactif non officiel inspiré de CarterPCs.',
  },

  a11y: {
    skipToContent: 'Aller au contenu',
    primaryNavigation: 'Principale',
    chooseTheme: 'Choisir le thème',
    chooseLanguage: 'Choisir la langue',
    chooseSections: 'Parcourir les sections',
    themeMenu: 'Thème',
    languageMenu: 'Langue',
    sectionsMenu: 'Sections',
  },

  nav: {
    sections: ['Projets', 'Systèmes', 'Processus', 'Univers'],
    about: 'À propos de Carter',
    themes: {
      dark: 'Sombre',
      light: 'Clair',
      system: 'Système',
    },
    languages: {
      en: 'Anglais',
      fr: 'Français',
      es: 'Espagnol',
    },
  },

  hero: {
    eyebrow: 'Ordinateurs cinématiques',
    headlineLabel: 'CarterPCs — Créé autrement',
    headlineLineOne: 'Créé',
    headlineLineTwo: 'autrement',
    support:
      'La tech rendue intéressante. Montages PC, matériel et les décisions technologiques du quotidien.',
    ctaPrimary: 'Explorer l’univers',
    // Names the three real Shorts this button scrolls to. "Voir la vidéo"
    // implied a single showreel that does not exist.
    ctaSecondary: 'Voir les Shorts',
    aboutTitle: 'À propos de Carter',
    aboutText:
      'Carter crée des contenus tech rapides et accessibles : matériel, mobile, montages et tout l’univers de la tech.',
    aboutLink: 'En savoir plus',
    // The audience line and the three stat labels sit in `white-space: nowrap`
    // slots sized against the approved English composition (see
    // Hero.module.css's .aboutAudience and the ≥1240px .statLabel rule), so
    // these are deliberately terse: a faithful-but-longer phrasing
    // ("Des millions sur toutes les plateformes") measured 87px past its slot
    // and ran off the About card.
    audience: 'Millions, tous réseaux',
    statsTitle: 'En chiffres',
    stats: {
      subscribers: 'Abonnés YouTube',
      views: 'Vues YouTube totales',
      builds: 'PC sur mesure',
      // Single word: "Des dizaines" wrapped onto a second line and pushed the
      // stats card taller than the reference geometry allows.
      dozens: 'Dizaines',
    },
    // Keep the date and the figures in Hero.tsx's STATS in sync.
    statsSource:
      'Chiffres YouTube relevés sur un compteur public le 28 juillet 2026, arrondis à la baisse. Les montages ne sont pas comptabilisés publiquement.',
    tiles: {
      builds: {
        title: 'PC sur mesure',
        body: 'Des ordinateurs haute performance conçus pour l’esthétique et la fiabilité.',
      },
      content: {
        title: 'Création de contenu',
        body: 'Du contenu tech cinématographique qui informe, divertit et inspire.',
      },
      universe: {
        title: 'L’univers',
        body: 'Découvrez les systèmes, la philosophie et le processus derrière tout cela.',
      },
    },
    // Labels the real channel row. Replaced `featuredIn` ("Vu dans"), which
    // introduced a list of publications this project cannot substantiate.
    channelsLabel: 'À regarder sur',
    disclaimer:
      'Concept non officiel. Aucune affiliation ni approbation implicite.',
  },

  creator: {
    metaLabel: '02 / Créateur',
    metaNote: 'Aperçu du créateur',
    kicker: 'Le créateur',
    headline: 'Le matériel expliqué, sans le superflu.',
    bodyOne:
      'Un journal quotidien au format court sur les montages PC, les smartphones et les décisions tech de tous les jours — filmé vite, testé à la main, et pensé pour ceux qui veulent l’essentiel sans perdre le contexte.',
    bodyTwo:
      'Le ton reste direct par choix : des explications en langage clair, la volonté de dénoncer le mauvais matériel et le marketing pire encore, et un humour qui ne s’éloigne jamais de l’internet où il a grandi.',
    tags: 'Matériel PC — Tech mobile — Tech grand public — Anti-arnaques',
    platforms: 'TikTok · YouTube Shorts · Instagram Reels',
  },

  /* Interface only : les titres des Shorts restent en anglais, ce sont les
     titres réellement publiés (voir data/featured.ts). */
  featured: {
    metaLabel: '03 / Sélection',
    metaNote: 'Histoires éditoriales choisies',
    title: 'Histoires choisies',
    playShort: 'Lire le Short',
    closePlayer: 'Fermer le lecteur',
    actions: {
      like: 'J’aime',
      comments: 'Commentaires',
      share: 'Partager',
      watch: 'Voir sur YouTube',
      linkCopied: 'Lien copié',
      copyFailed: 'Impossible de copier le lien',
    },
    a11y: {
      player: 'Lecteur YouTube',
      opensInNewTab: 'ouvre dans un nouvel onglet',
      viewComments: 'Voir les commentaires sur YouTube',
    },
  },

  hardware: {
    metaLabel: '04 / Matériel',
    metaNote: 'Expérience matérielle',
    kicker: 'Au cœur du montage',
    headline: 'Conçu de l’intérieur.',
    support:
      'Chaque composant jugé sur ce qu’il fait, pas sur ce que promet la boîte.',
    tags: 'PC sur mesure — Test de composants — Sur mesure vs préassemblé',
  },

  contentUniverse: {
    metaLabel: '05 / Univers de contenu',
    metaNote: 'Toute l’étendue',
    kicker: 'Au-delà des histoires choisies',
    headline: 'Six territoires, un flux connecté.',
    support:
      'Le terrain récurrent auquel chaque vidéo revient — des PC sur mesure aux histoires qui n’ont rien à voir avec le matériel.',
  },

  /* The headline reuses this file's own opening of `hero.support` ("La tech
     rendue intéressante"), broken where French breaks naturally: the article
     stays with its noun on line one. */
  closing: {
    disclaimerLineOne: 'Concept créatif indépendant.',
    disclaimerLineTwo: 'Sans affiliation avec CarterPCs.',
    headlineLineOne: 'La tech rendue',
    headlineLineTwo: 'intéressante.',
    backToTop: 'Haut de page',
  },

  /* `copyright` is the name only — the "©" and the year are composed in
     Footer.tsx. It follows this file's own `meta.title` wording. */
  footer: {
    copyright: 'CarterPCs — Concept de portfolio',
    disclaimer: 'Aucune affiliation ni approbation impliquée.',
    a11y: {
      footerNavigation: 'Pied de page',
      socialLinks: 'Réseaux sociaux',
      opensInNewTab: 'ouvre dans un nouvel onglet',
    },
  },
}
