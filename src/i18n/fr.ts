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
      'Créateur de vidéos courtes sur les PC, les téléphones et la tech du quotidien.',
    aboutLink: 'En savoir plus',
    statsTitle: 'En chiffres',
    stats: {
      subscribers: 'Abonnés YouTube',
      views: 'Vues YouTube totales',
    },
    statsSource:
      'Relevé public de la chaîne YouTube par TubeLeader, le 24 octobre 2026 ; pas les données privées de YouTube Analytics.',
    tiles: {
      builds: {
        title: 'PC sur mesure',
        body: 'Des ordinateurs haute performance conçus pour l’esthétique et la fiabilité.',
      },
      content: {
        title: 'Création de contenu',
        body: 'Des histoires courtes sur les PC, les téléphones et la tech du quotidien.',
      },
      universe: {
        title: 'L’univers',
        body: 'Découvrez les sujets récurrents des vidéos de CarterPCs.',
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
      'Ses vidéos courtes parlent de matériel PC, de smartphones, d’appareils grand public et de questions tech du quotidien.',
    bodyTwo:
      'Les sujets vont des comparatifs et conseils pratiques au matériel PC, aux commentaires de créateur et parfois aux jeux vidéo.',
    tags: 'Matériel PC — Tech mobile — Tech grand public — Anti-arnaques',
    platforms: 'TikTok · YouTube Shorts · Instagram Reels',
  },

  /* Interface only : les titres éditoriaux restent en anglais ; deux titres
     ne sont pas confirmés comme les titres publiés des vidéos. */
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

  /* Closing statement, section links, and independent-concept disclaimer. */
  closing: {
    disclaimerLineOne: 'Concept créatif indépendant.',
    disclaimerLineTwo: 'Sans affiliation avec CarterPCs.',
    headlineLineOne: 'La tech,',
    headlineLineTwo: 'sans deviner.',
    description:
      'Des PC sur mesure aux appareils du quotidien, découvrez les détails, les compromis et les conseils pratiques derrière la technologie.',
    exploreStories: 'Explorer les histoires',
    meetCreator: 'Rencontrer le créateur',
  },

  /* `copyright` is the name only — the "©" and the year are composed in
     Footer.tsx. It follows this file's own `meta.title` wording. */
  footer: {
    copyright: 'CarterPCs — Concept de portfolio',
    disclaimer:
      'Concept indépendant créé par un fan. Ni affilié à CarterPCs ni approuvé par CarterPCs.',
    credit: 'Créé par WalkerTech15 — fan de CarterPCs depuis 2023.',
    a11y: {
      footerNavigation: 'Pied de page',
      socialLinks: 'Réseaux sociaux',
      home: 'accueil',
      opensInNewTab: 'ouvre dans un nouvel onglet',
    },
  },
}
