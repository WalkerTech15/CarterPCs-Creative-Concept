/**
 * Types shared between Featured's components, hooks and helpers. The story
 * shape itself is content, not view state, so it lives in data/types.ts.
 */

/** How a share attempt ended — see `shareLink()` in featured.utils.ts. */
export type ShareOutcome = 'shared' | 'copied' | 'failed'

/**
 * Result of the last share, shown next to the rail it came from and
 * announced through that panel's own live region. Only clipboard outcomes
 * produce one: a platform share sheet reports its own result.
 */
export interface ShareNotice {
  id: string
  copied: boolean
}

/**
 * Where a panel's readable glyphs sit inside the panel, in px from its left
 * edge. Measured once per pin setup by useFeaturedSequence and fed to
 * `copyFocus()` every frame — see the comment on that function.
 */
export interface CopyInsets {
  textLeft: number
  textRight: number
}
