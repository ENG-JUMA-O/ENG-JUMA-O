// Clearly-labelled placeholder artwork shown until a real image is supplied.
// Colours come from CSS tokens so it follows the light/dark theme.
function Web() {
  return (
    <>
      <rect x="60" y="40" width="280" height="170" rx="10" className="fill-surface stroke-line" strokeWidth="2" />
      <path d="M60 64h280" className="stroke-line" strokeWidth="2" />
      <circle cx="78" cy="52" r="4" className="fill-danger" opacity=".6" />
      <circle cx="92" cy="52" r="4" className="fill-coffee" opacity=".6" />
      <circle cx="106" cy="52" r="4" className="fill-success" opacity=".6" />
      <rect x="80" y="84" width="120" height="14" rx="4" className="fill-brand" opacity=".85" />
      <rect x="80" y="108" width="170" height="8" rx="4" className="fill-line" />
      <rect x="80" y="124" width="140" height="8" rx="4" className="fill-line" />
      <rect x="80" y="150" width="64" height="24" rx="6" className="fill-brand" />
      <rect x="226" y="84" width="96" height="104" rx="8" className="fill-brand-soft stroke-line" strokeWidth="2" />
      <circle cx="274" cy="124" r="20" className="fill-accent" opacity=".5" />
    </>
  )
}

function Mobile() {
  return (
    <>
      <rect x="140" y="20" width="120" height="212" rx="18" className="fill-surface stroke-line" strokeWidth="2" />
      <rect x="188" y="28" width="24" height="5" rx="2.5" className="fill-line" />
      <rect x="154" y="46" width="92" height="52" rx="8" className="fill-brand" opacity=".85" />
      <rect x="154" y="108" width="92" height="10" rx="5" className="fill-line" />
      <rect x="154" y="126" width="68" height="10" rx="5" className="fill-line" />
      <rect x="154" y="150" width="42" height="38" rx="8" className="fill-brand-soft stroke-line" strokeWidth="2" />
      <rect x="204" y="150" width="42" height="38" rx="8" className="fill-brand-soft stroke-line" strokeWidth="2" />
      <rect x="154" y="200" width="92" height="20" rx="10" className="fill-accent" opacity=".7" />
    </>
  )
}

function Dashboard() {
  return (
    <>
      <rect x="40" y="30" width="320" height="190" rx="10" className="fill-surface stroke-line" strokeWidth="2" />
      <rect x="56" y="46" width="88" height="42" rx="6" className="fill-brand-soft stroke-line" strokeWidth="2" />
      <rect x="156" y="46" width="88" height="42" rx="6" className="fill-brand-soft stroke-line" strokeWidth="2" />
      <rect x="256" y="46" width="88" height="42" rx="6" className="fill-brand-soft stroke-line" strokeWidth="2" />
      <rect x="56" y="100" width="170" height="104" rx="6" className="fill-surface-alt stroke-line" strokeWidth="2" />
      <rect x="72" y="166" width="16" height="30" rx="2" className="fill-brand" opacity=".5" />
      <rect x="96" y="148" width="16" height="48" rx="2" className="fill-brand" opacity=".7" />
      <rect x="120" y="156" width="16" height="40" rx="2" className="fill-brand" opacity=".6" />
      <rect x="144" y="124" width="16" height="72" rx="2" className="fill-brand" />
      <rect x="168" y="138" width="16" height="58" rx="2" className="fill-brand" opacity=".75" />
      <rect x="192" y="116" width="16" height="80" rx="2" className="fill-accent" />
      <rect x="238" y="100" width="106" height="104" rx="6" className="fill-surface-alt stroke-line" strokeWidth="2" />
      <circle cx="291" cy="152" r="30" className="fill-none stroke-brand" strokeWidth="14" opacity=".8" />
      <circle cx="291" cy="152" r="30" className="fill-none stroke-accent" strokeWidth="14" strokeDasharray="50 140" />
    </>
  )
}

function Concept() {
  return (
    <>
      <rect x="70" y="50" width="150" height="110" rx="10" className="fill-surface stroke-line" strokeWidth="2" />
      <rect x="86" y="68" width="70" height="10" rx="5" className="fill-line" />
      <rect x="86" y="88" width="110" height="8" rx="4" className="fill-line" />
      <rect x="86" y="130" width="50" height="16" rx="8" className="fill-brand" opacity=".85" />
      <rect x="170" y="90" width="150" height="110" rx="10" className="fill-brand-soft stroke-brand" strokeWidth="2" strokeDasharray="6 5" />
      <circle cx="245" cy="138" r="24" className="fill-accent" opacity=".45" />
      <path d="M220 105l12 12m-12 0l12-12" className="stroke-brand" strokeWidth="2" strokeLinecap="round" />
      <path d="M150 160c24 24 40 20 62 4" className="fill-none stroke-brand" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
    </>
  )
}

const kinds = { web: Web, mobile: Mobile, dashboard: Dashboard, concept: Concept }

export default function PlaceholderArt({ kind = 'web', alt = 'Placeholder illustration' }) {
  const Art = kinds[kind] || Web
  return (
    <svg
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={alt}
      className="absolute inset-0 h-full w-full bg-linear-to-br from-brand-soft to-surface-alt"
    >
      <circle cx="350" cy="40" r="70" className="fill-brand" opacity=".07" />
      <circle cx="40" cy="220" r="60" className="fill-accent" opacity=".08" />
      <Art />
    </svg>
  )
}
