import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo.jsx'
import Button from './Button.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import MobileMenu from './MobileMenu.jsx'
import { getActiveTo, navLinks } from '../data/navigation.js'
import { profile } from '../data/profile.js'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const toggleRef = useRef(null)
  const activeTo = getActiveTo(location)

  // Subtle background + shadow once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu after any navigation.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  // Escape closes the menu and returns focus to the toggle button.
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Never leave the mobile menu open after resizing up to the desktop layout.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const onChange = (event) => {
      if (event.matches) setOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled ? 'border-line bg-surface/90 shadow-sm backdrop-blur-md' : 'border-transparent bg-surface'
      }`}
    >
      <nav aria-label="Primary">
        <div className="container-page flex h-16 items-center justify-between gap-2">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={`${profile.name} — home`}>
            <Logo className="h-10 w-10 shrink-0" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-display text-[15px] font-bold text-ink">{profile.name}</span>
              <span className="hidden text-xs text-muted sm:block">{profile.title}</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = link.to === activeTo
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand after:transition-transform after:duration-200 ${
                      active
                        ? 'text-link after:scale-x-100'
                        : 'text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-brand hover:text-link lg:hidden"
            >
              {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <MobileMenu open={open} links={navLinks} activeTo={activeTo} onNavigate={() => setOpen(false)} />
      </nav>
    </header>
  )
}
