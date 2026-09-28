import { describe, expect, it, vi } from 'vitest'
import {
  activePanelIndex,
  copyFocus,
  ENTRY_FADE_TRAVEL_PX,
  exitFadeTravel,
  playerSrc,
  SAFE_INSET_RATIO,
  shareLink,
  storyTitle,
} from './featured.utils'

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

describe('activePanelIndex', () => {
  it('maps pinned progress to the nearest of three panels', () => {
    expect(activePanelIndex(0, 3)).toBe(0)
    expect(activePanelIndex(0.24, 3)).toBe(0)
    expect(activePanelIndex(0.26, 3)).toBe(1)
    expect(activePanelIndex(0.5, 3)).toBe(1)
    expect(activePanelIndex(0.76, 3)).toBe(2)
    expect(activePanelIndex(1, 3)).toBe(2)
  })
})

/**
 * Geometry shaped like the real desktop panel: copy starts ~80px in from the
 * panel's left edge and its column is a little over 400px wide.
 */
describe('copyFocus', () => {
  const viewportWidth = 1440
  const insets = [
    { textLeft: 80.64, textRight: 495.36 },
    { textLeft: 80.64, textRight: 495.36 },
    { textLeft: 80.64, textRight: 495.36 },
  ]
  const exitTravel = exitFadeTravel(insets)
  const focusAt = (panelIndex: number, railX: number) =>
    copyFocus({
      insets: insets[panelIndex],
      panelIndex,
      railX,
      viewportWidth,
      exitTravel,
    })

  it('sizes the exit ramp from the narrowest rest inset', () => {
    expect(
      exitFadeTravel([
        { textLeft: 100, textRight: 0 },
        { textLeft: 80, textRight: 0 },
      ]),
    ).toBeCloseTo(48)
  })

  // The regression the split entry/exit terms exist for: a shared symmetric
  // rule left settled copy at opacity 0.
  it('shows every panel at exactly full opacity when the rail rests on it', () => {
    for (const i of [0, 1, 2]) {
      expect(focusAt(i, -i * viewportWidth)).toBe(1)
    }
  })

  it('holds entering copy at a hard 0 until its trailing edge is inside the safe zone', () => {
    const safeRight = viewportWidth * (1 - SAFE_INSET_RATIO)
    // Panel 1's copy right edge exactly 1px outside the safe zone.
    const railX = safeRight + 1 - viewportWidth - insets[1].textRight
    expect(focusAt(1, railX)).toBe(0)
  })

  it('ramps entering copy in over the entry travel once it is safe', () => {
    const safeRight = viewportWidth * (1 - SAFE_INSET_RATIO)
    const edge = safeRight - viewportWidth - insets[1].textRight
    expect(focusAt(1, edge - ENTRY_FADE_TRAVEL_PX / 2)).toBeCloseTo(0.5)
    expect(focusAt(1, edge - ENTRY_FADE_TRAVEL_PX)).toBe(1)
  })

  it('fades exiting copy out before it reaches the left edge', () => {
    // Panel 0's copy left edge halfway through the exit ramp, then past the edge.
    expect(focusAt(0, exitTravel / 2 - insets[0].textLeft)).toBeCloseTo(0.5)
    expect(focusAt(0, -insets[0].textLeft)).toBe(0)
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
