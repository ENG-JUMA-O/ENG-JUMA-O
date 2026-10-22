import { useId } from 'react'

/** The DO monogram. Also used (as static SVG) for the favicon. */
export default function Logo({ className = 'h-10 w-10' }) {
  const gradientId = useId()
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
      <text
        x="32"
        y="43"
        textAnchor="middle"
        fontFamily="'Space Grotesk', Inter, Arial, sans-serif"
        fontSize="30"
        fontWeight="700"
        fill="#ffffff"
        letterSpacing="-1"
      >
        DO
      </text>
      <circle cx="51" cy="15" r="4" fill="#06B6D4" />
    </svg>
  )
}
