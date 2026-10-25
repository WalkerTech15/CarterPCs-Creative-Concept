/**
 * English dictionary — the SHAPE SOURCE OF TRUTH for the whole i18n layer.
 *
 * `Dictionary` is derived from this object (`typeof en`, see ./index.ts), so
 * `fr.ts` and `es.ts` are compile-time checked against it: a missing key, an
 * extra key, or a wrong value type is a typecheck failure, not a silent
 * English fallback at runtime. Adding a new visible string therefore means
 * adding it here first, then translating it in the other two files.
 *
 * SCOPE: this file holds interface/section copy. Per-item content that already
 * has a typed home stays in `src/data/*` (featured, hardware, contentUniverse),
 * where each text field is a `Localized<...>` record — same compile-time
 * guarantee, colocated with the structural data (index, variant, tier, id)
 * those files own.
 *
 * NOT TRANSLATED, deliberately:
 * - "CarterPCs" is a proper noun, as are the platform names in Hero's channel
 *   row (YouTube / Instagram / TikTok), which live in data/channels.ts
 *   alongside their real URLs — only that row's LABEL is localized here.
 * - Platform names (TikTok / YouTube Shorts / Instagram Reels) are proper
 *   nouns; they carry a per-language entry only so the separator/order stays
 *   editable per locale.
 * - Hero's public tracker statistics ("3.8M+", "10.0B+") are rendered from
 *   `data/hero.ts`'s `HERO_STATS` unchanged. Only their LABELS and dated
 *   `statsSource` are localized (see hero.stats below).
 * - Section numerals ("02 / …") stay Arabic numerals in every language; only
 *   the word after the slash is translated.
 */

export const en = {
  /** Document-level metadata, mirrored onto <title> and <meta name="description">. */
  meta: {
    title: 'CarterPCs Portfolio Concept',
    description:
      'Unofficial interactive portfolio concept inspired by CarterPCs.',
  },

  /** Accessible names that are never visible on screen. */
  a11y: {
    skipToContent: 'Skip to content',
    primaryNavigation: 'Primary',
    chooseTheme: 'Choose theme',
    chooseLanguage: 'Choose language',
    chooseSections: 'Browse sections',
    themeMenu: 'Theme',
    languageMenu: 'Language',
    sectionsMenu: 'Sections',
  },

  nav: {
    /** Centre labels, in bar order — one per real section. Targets live in
        components/navigation/sections.ts; the two former labels whose
        destinations duplicated these ("Impact" → #featured, "Content" →
        #content-universe) were removed, not renamed. */
    sections: ['Work', 'Systems', 'Process', 'Universe'],
    about: 'About Carter',
    themes: {
      dark: 'Dark',
      light: 'Light',
      system: 'System',
    },
    /** Language names as written IN the currently selected language. */
    languages: {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
    },
  },

  hero: {
    eyebrow: 'Cinematic Computers',
    /** h1 accessible name — the visible two-line headline is aria-hidden. */
    headlineLabel: 'CarterPCs — Built Different',
    headlineLineOne: 'Built',
    /** The period is a separate styled span in Hero.tsx and is not part of this string. */
    headlineLineTwo: 'Different',
    support:
      'Making tech interesting. PC builds, hardware, and the everyday technology decisions in between.',
    ctaPrimary: 'Explore the Universe',
    /** Names the three real Shorts in Featured, which is where it goes. The
        reference's "Watch Reel" promised a showreel that does not exist. */
    ctaSecondary: 'Watch the Shorts',
    aboutTitle: 'About Carter',
    aboutText:
      'Short-form tech videos spanning PCs, phones, and everyday devices.',
    aboutLink: 'Learn more',
    statsTitle: 'By The Numbers',
    stats: {
      subscribers: 'YouTube Subscribers',
      views: 'Total YouTube Views',
    },
    /**
     * Dates the public tracker snapshot; figures are estimates, not private
     * YouTube Analytics data.
     */
    statsSource:
      'Public YouTube tracker snapshot from TubeLeader, 24 October 2026; not private YouTube Analytics.',
    tiles: {
      builds: {
        title: 'Custom Builds',
        body: 'High-performance computers engineered for aesthetics and reliability.',
      },
      content: {
        title: 'Content Creation',
        body: 'Short-form stories about PCs, phones, and everyday technology.',
      },
      universe: {
        title: 'The Universe',
        body: 'Explore the recurring subjects across CarterPCs videos.',
      },
    },
    /**
     * Labels the real channel row at the foot of the Hero. It replaced
     * `featuredIn` ("Featured in"), whose row of publication names claimed
     * press coverage this project has no source for — see data/channels.ts.
     */
    channelsLabel: 'Watch on',
    disclaimer: 'Unofficial concept. No affiliation or endorsement implied.',
  },

  creator: {
    metaLabel: '02 / Creator',
    metaNote: 'Creator overview',
    kicker: 'The Creator',
    headline: 'Hardware knowledge, delivered without the fluff.',
    bodyOne:
      'Short-form videos cover PC hardware, smartphones, consumer devices and everyday technology questions.',
    bodyTwo:
      'Topics range from product comparisons and practical tech advice to PC hardware, creator commentary and occasional gaming stories.',
    tags: 'PC Hardware — Mobile Tech — Consumer Tech — Scam-Busting',
    /** Proper nouns — identical in every language, kept per-locale only so the separator can move. */
    platforms: 'TikTok · YouTube Shorts · Instagram Reels',
  },

  /**
   * The three Shorts are click-to-play: nothing is fetched from YouTube until
   * a visitor asks for it. Only the INTERFACE is translated here. The
   * editorial headlines stay in English in every language (see
   * data/featured.ts). They are not represented as verified published titles;
   * two title/video pairs remain unconfirmed. Translating the editorial
   * headlines would change the selected English concept copy.
   *
   * Each accessible name is composed as `${visible label} — ${title}`, so the
   * visible label always STARTS the accessible name (WCAG 2.5.3 Label in Name)
   * and the name still says which of the three Shorts it acts on.
   */
  featured: {
    metaLabel: '03 / Featured',
    metaNote: 'Selected editorial stories',
    title: 'Selected Stories',
    playShort: 'Play Short',
    closePlayer: 'Close player',
    /**
     * The action rail beside each Short.
     *
     * `like` is a preference held on this page and nowhere else — nothing is
     * sent to YouTube and nothing is counted, which is exactly why the label
     * is the bare verb and why no number appears next to it. `comments` and
     * `watch` both leave for the real Short rather than staging a local
     * imitation of it. `share` hands off to the platform's own share sheet
     * where there is one, and copies the same URL where there is not.
     */
    actions: {
      like: 'Like',
      comments: 'Comments',
      share: 'Share',
      watch: 'Watch on YouTube',
      /** Announced and shown after the URL reaches the clipboard. */
      linkCopied: 'Link copied',
      copyFailed: 'Could not copy the link',
    },
    a11y: {
      /** Prefix for the iframe's title attribute. */
      player: 'YouTube player',
      opensInNewTab: 'opens in a new tab',
      /**
       * Follows the visible "Comments" label so the accessible name states
       * where the link actually goes — it leaves the site rather than opening
       * a drawer, and the name has to say so before it is followed.
       */
      viewComments: 'View comments on YouTube',
    },
  },

  hardware: {
    metaLabel: '04 / Hardware',
    metaNote: 'Hardware experience',
    kicker: 'Inside the build',
    headline: 'Built from the inside out.',
    support:
      'Every component judged on what it does, not what the box promises.',
    tags: 'Custom Builds — Component Testing — Value vs. Prebuilt',
  },

  contentUniverse: {
    metaLabel: '05 / Content Universe',
    metaNote: 'The full range',
    kicker: 'Beyond the featured stories',
    headline: 'Six territories, one connected feed.',
    support:
      'The recurring ground every video comes back to — from custom builds to the stories that have nothing to do with hardware at all.',
  },

  /** Closing statement, section links, and independent-concept disclaimer. */
  closing: {
    disclaimerLineOne: 'Independent creative concept.',
    disclaimerLineTwo: 'Not affiliated with CarterPCs.',
    headlineLineOne: 'Good tech.',
    headlineLineTwo: 'No guesswork.',
    description:
      'From custom PC builds to everyday devices, explore the details, trade-offs, and practical advice behind the tech.',
    exploreStories: 'Explore the stories',
    meetCreator: 'Meet the creator',
  },

  /**
   * Footer — the site's last, quietest row.
   *
   * `copyright` holds only the NAME. The "©" and the year are language-neutral
   * and are composed in Footer.tsx from a single constant, so the year is one
   * edit rather than three.
   *
   * The three platform names are proper nouns and are NOT translated; they
   * appear here only so `opensInNewTab` can be appended to each accessible
   * name in the right language. Those are the only three destinations that
   * exist — see Footer.tsx.
   *
   * The footer reference uses a complete fan-made/non-affiliation statement;
   * keep this wording distinct from Closing's shorter disclaimer.
   */
  footer: {
    copyright: 'CarterPCs Portfolio Concept',
    disclaimer:
      'Independent fan-made concept. Not affiliated with or endorsed by CarterPCs.',
    credit: 'Made by WalkerTech15 — a CarterPCs fan since 2023.',
    a11y: {
      footerNavigation: 'Footer',
      socialLinks: 'Social',
      home: 'home',
      /** Appended after the platform name, so the visible label is preserved. */
      opensInNewTab: 'opens in a new tab',
    },
  },
}
