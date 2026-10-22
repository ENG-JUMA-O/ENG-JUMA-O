export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Skills', to: '/#skills' },
  { label: 'Projects', to: '/projects' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Education', to: '/about#education' },
  { label: 'Contact', to: '/contact' },
]

/** Returns the `to` of the single nav link that should be highlighted for a router location. */
export function getActiveTo(location) {
  const full = location.pathname + location.hash
  const exact = navLinks.find((link) => link.to === full)
  if (exact) return exact.to

  const byPath = navLinks.find((link) => {
    if (link.to.includes('#')) return false
    if (link.to === '/') return location.pathname === '/'
    return location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)
  })
  return byPath?.to
}
