import { GITHUB_PATH } from './BrandIcons.jsx'

// Simplified, recognisable technology marks drawn inline (no external requests).
// To use an official logo instead, replace the matching entry with that logo's SVG shapes.
const icons = {
  react: (
    <>
      <circle cx="12" cy="12" r="2.1" fill="#61DAFB" />
      <g fill="none" stroke="#61DAFB" strokeWidth="1.1">
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      </g>
    </>
  ),
  javascript: (
    <>
      <rect x="1.5" y="1.5" width="21" height="21" rx="2.5" fill="#F7DF1E" />
      <text x="21" y="20" textAnchor="end" fontFamily="Arial, sans-serif" fontSize="10.5" fontWeight="700" fill="#111827">
        JS
      </text>
    </>
  ),
  typescript: (
    <>
      <rect x="1.5" y="1.5" width="21" height="21" rx="2.5" fill="#3178C6" />
      <text x="21" y="20" textAnchor="end" fontFamily="Arial, sans-serif" fontSize="10.5" fontWeight="700" fill="#ffffff">
        TS
      </text>
    </>
  ),
  nodejs: (
    <>
      <polygon points="12,1.5 21.5,7 21.5,17 12,22.5 2.5,17 2.5,7" fill="#5FA04E" />
      <text x="12" y="15" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7.5" fontWeight="700" fill="#ffffff">
        JS
      </text>
    </>
  ),
  flutter: (
    <>
      <polygon points="14,1 19.5,1 6.5,14 3.8,11.3" fill="#47C5FB" />
      <polygon points="14,10.5 19.5,10.5 14.8,15.2 12,12.5" fill="#47C5FB" />
      <polygon points="9.3,17.5 12,14.8 14.8,17.6 12,20.3" fill="#00569E" />
      <polygon points="12,20.3 14.8,17.6 17.5,20.3 14.8,23" fill="#00B5F8" />
    </>
  ),
  dart: (
    <>
      <polygon points="12,2 22,12 12,22 2,12" fill="#01579B" />
      <polygon points="12,6 18,12 12,18 6,12" fill="#40C4FF" />
      <polygon points="12,9 15,12 12,15 9,12" fill="#ffffff" />
    </>
  ),
  swiftui: (
    <>
      <rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="#F05138" />
      <path d="M6.5 16.5c4.2 2.4 8.4 1.6 11-2-3 1.6-6.4.8-9-3 3 2.6 5 2.6 5 2.6-2.4-2-5-5.4-5-5.4 3.6 3.4 6.4 4.4 6.4 4.4" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  sql: (
    <g fill="none" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </g>
  ),
  git: (
    <>
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="2" fill="#F05032" transform="rotate(45 12 12)" />
      <g stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M12 8.2v7.4M12 11.6l3.3 1.8" />
      </g>
      <g fill="#ffffff">
        <circle cx="12" cy="8.2" r="1.5" />
        <circle cx="12" cy="15.6" r="1.5" />
        <circle cx="15.4" cy="13.4" r="1.5" />
      </g>
    </>
  ),
  github: <path d={GITHUB_PATH} fill="currentColor" className="text-ink" />,
}

export default function TechIcon({ name, className = 'h-7 w-7' }) {
  const icon = icons[name]
  if (!icon) return null
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {icon}
    </svg>
  )
}
