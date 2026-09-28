import { describe, expect, it } from 'vitest'
import { LANGUAGES } from '../i18n'
import { CHANNELS } from './channels'
import { getContentCategories } from './contentUniverse'
import { featuredStoryCount, getFeaturedStories } from './featured'
import { getHardwareBeats } from './hardware'

/**
 * Content integrity: the invariants the data files promise in their comments,
 * checked rather than trusted. Rendering is tested per section.
 */
describe('content data', () => {
  it('resolves every row in every language with no empty copy', () => {
    for (const language of LANGUAGES) {
      const rows = [
        ...getFeaturedStories(language),
        ...getHardwareBeats(language),
        ...getContentCategories(language),
      ]
      for (const row of rows) {
        for (const value of Object.values(row).flat()) {
          if (typeof value === 'string') {
            expect(value.trim()).not.toBe('')
          }
        }
      }
    }
  })

  it('points each Short’s embed at the same video as its watch link, on the privacy-enhanced host', () => {
    const stories = getFeaturedStories('en')
    expect(stories).toHaveLength(featuredStoryCount)
    for (const story of stories) {
      const id = /^https:\/\/www\.youtube\.com\/shorts\/([\w-]+)$/.exec(
        story.videoUrl,
      )?.[1]
      expect(id).toBeTruthy()
      expect(story.embedUrl).toBe(
        `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`,
      )
    }
  })

  it('keeps structure language-independent', () => {
    const structure = (language: (typeof LANGUAGES)[number]) => ({
      featured: getFeaturedStories(language).map((s) => [
        s.index,
        s.variant,
        s.videoUrl,
        s.embedUrl,
        s.thumbnail,
      ]),
      hardware: getHardwareBeats(language).map((b) => b.index),
      categories: getContentCategories(language).map((c) => [
        c.id,
        c.tier,
        c.shortIndex,
      ]),
    })
    for (const language of LANGUAGES) {
      expect(structure(language)).toEqual(structure('en'))
    }
  })

  it('links Content Universe media slots only to Featured stories that exist', () => {
    const indexes = new Set(getFeaturedStories('en').map((s) => s.index))
    for (const category of getContentCategories('en')) {
      if (category.shortIndex !== null) {
        expect(indexes.has(category.shortIndex)).toBe(true)
      }
    }
  })

  it('links only to secure channel destinations', () => {
    for (const channel of CHANNELS) {
      expect(new URL(channel.href).protocol).toBe('https:')
    }
  })
})
