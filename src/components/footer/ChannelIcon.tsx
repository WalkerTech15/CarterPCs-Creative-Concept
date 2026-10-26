import type { CHANNELS } from '../../data/channels'

export function ChannelIcon({
  name,
}: {
  name: (typeof CHANNELS)[number]['name']
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {name === 'YouTube' ? (
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M4 4h16a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Zm5 4v8l7-4-7-4Z"
        />
      ) : name === 'Instagram' ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.6" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </g>
      ) : (
        <path
          fill="currentColor"
          d="M15.6 2h-3.2v13.1a3.05 3.05 0 1 1-2.4-2.98V8.85a6.3 6.3 0 1 0 5.6 6.25V8.4a9.3 9.3 0 0 0 5.2 1.6V6.8c-2.7 0-4.8-1.7-5.2-4.8Z"
        />
      )}
    </svg>
  )
}
