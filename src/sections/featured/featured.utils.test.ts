import { describe, expect, it, vi } from 'vitest'
import { playerSrc, shareLink, storyTitle } from './featured.utils'

describe('storyTitle', () => {
  it('joins the headline lines into the published title', () => {
    expect(
      storyTitle({
        headlineLines: ['What’s the best PC', 'you can get for', '$250k??'],
      }),
    ).toBe('What’s the best PC you can get for $250k??')
  })
})

describe('playerSrc', () => {
  const base = 'https://www.youtube-nocookie.com/embed/abc?rel=0&playsinline=1'

  it('autoplays after the click that asked for it', () => {
    expect(playerSrc(base, false)).toBe(`${base}&autoplay=1`)
  })

  it('loads the player paused under reduced motion', () => {
    expect(playerSrc(base, true)).toBe(base)
  })
})

describe('shareLink', () => {
  const title = 'A Short'
  const url = 'https://www.youtube.com/shorts/abc'

  it('hands off to the share sheet and copies nothing', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn()
    const nav = { share, clipboard: { writeText } } as unknown as Navigator
    await expect(shareLink(title, url, nav)).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith({ title, url })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('treats a dismissed share sheet as silence, not a failure', async () => {
    const nav = {
      share: vi.fn().mockRejectedValue(new Error('AbortError')),
    } as unknown as Navigator
    await expect(shareLink(title, url, nav)).resolves.toBe('shared')
  })

  it('copies the URL when there is no share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const nav = { clipboard: { writeText } } as unknown as Navigator
    await expect(shareLink(title, url, nav)).resolves.toBe('copied')
    expect(writeText).toHaveBeenCalledWith(url)
  })

  it('reports a refused or missing clipboard as a failure', async () => {
    const refused = {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    } as unknown as Navigator
    await expect(shareLink(title, url, refused)).resolves.toBe('failed')
    await expect(shareLink(title, url, {} as Navigator)).resolves.toBe('failed')
    await expect(shareLink(title, url, undefined)).resolves.toBe('failed')
  })
})
