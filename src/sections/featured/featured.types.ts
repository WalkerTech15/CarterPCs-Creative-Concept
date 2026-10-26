/**
 * Types shared between Featured's components, hooks and helpers. The story
 * shape itself is content, not view state, so it lives in data/types.ts.
 */

/** How a share attempt ended — see `shareLink()` in featured.utils.ts. */
export type ShareOutcome =
  | 'shared'
  | 'cancelled'
  | 'copied'
  | 'copy-failed'
  | 'share-failed'

/**
 * Result of the last share, shown next to the rail it came from and
 * announced through that panel's own live region. Successful platform shares
 * and cancellations stay quiet; failures and clipboard success are explicit.
 */
export interface ShareNotice {
  id: string
  outcome: Extract<ShareOutcome, 'copied' | 'copy-failed' | 'share-failed'>
}
