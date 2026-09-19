/**
 * The real CarterPCs channel destinations.
 *
 * Shared by Hero's platform row and the footer so the two can never drift out
 * of sync — the same reason `components/navigation/sections.ts` exists for the
 * section anchors. These three URLs were supplied by the owner and are the
 * only external destinations the site links to anywhere.
 *
 * Provenance note: this list REPLACED Hero's former "Featured in" strip, which
 * rendered Apple / Forbes / The Verge / HYPEBEAST / Linus Tech Tips / uncrate
 * as typographic wordmarks. Those were a visual recreation of a concept
 * render, not relationships anything in this project supports: no press
 * feature, affiliation or endorsement is evidenced anywhere in the repo, and a
 * row of publication names under the words "Featured in" reads as a claim to
 * every sighted visitor regardless of the `aria-hidden` that used to sit on
 * it. A verifiable destination the visitor can open is the honest version of
 * the same compositional beat: it is the only kind of social proof this
 * project can actually stand behind.
 *
 * Platform names are proper nouns and are not translated — only the row's
 * LABEL is (see `hero.channelsLabel` in the dictionary).
 */
export const CHANNELS = [
  { name: 'YouTube', href: 'https://www.youtube.com/@actuallycarterpcs' },
  { name: 'Instagram', href: 'https://www.instagram.com/carterpcs_/?hl=en' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@carterpcs?lang=en' },
] as const
