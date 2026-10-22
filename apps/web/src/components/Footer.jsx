import { Link } from 'react-router-dom'
import { ArrowUp, Coffee, Mail } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import Logo from './Logo.jsx'
import { GithubIcon, LinkedinIcon } from './BrandIcons.jsx'
import { profile } from '../data/profile.js'

const exploreLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
]

const linkClass = 'inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-link'

export default function Footer() {
  const reduce = useReducedMotion()
  const year = new Date().getFullYear()

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })

  return (
    <footer className="border-t border-line bg-surface-alt">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label={`${profile.name} — home`}>
              <Logo className="h-11 w-11" />
              <span className="font-display text-lg font-bold text-ink">{profile.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{profile.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-semibold text-ink">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-ink">Connect</h2>
            <ul className="mt-4 space-y-2.5">
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`} className={linkClass}>
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email
                  </a>
                </li>
              )}
              {profile.github && (
                <li>
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <GithubIcon className="h-4 w-4" />
                    GitHub
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
              {profile.linkedin && (
                <li>
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <LinkedinIcon className="h-4 w-4" />
                    LinkedIn
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
              {profile.buyMeACoffee && (
                <li>
                  <a href={profile.buyMeACoffee} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <Coffee className="h-4 w-4" aria-hidden="true" />
                    Buy Me a Coffee
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
              {!profile.email && !profile.github && !profile.linkedin && !profile.buyMeACoffee && (
                <li>
                  <Link to="/contact" className={linkClass}>
                    Contact page
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <div className="text-sm text-muted">
            <p>
              © {year} {profile.name}. All rights reserved.
            </p>
            <p className="mt-1">Thanks for stopping by — I hope you found something useful.</p>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-link"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
