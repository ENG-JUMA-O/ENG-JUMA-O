
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

const linkClass =
  'inline-flex min-h-8 items-center gap-1.5 text-sm text-muted transition-colors duration-200 hover:text-link'

export default function Footer() {
  const reduce = useReducedMotion()
  const year = new Date().getFullYear()

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: reduce ? 'instant' : 'smooth',
    })

  return (
    <footer className="border-t border-line bg-surface-alt">
      <div aria-hidden="true" className="h-1 bg-linear-to-r from-leaf via-sky to-accent" />
      <div className="container-page py-10 sm:py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-[1.4fr_0.7fr_0.9fr]">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2"
              aria-label={`${profile.name} — home`}
            >
              <Logo className="h-8 w-8 shrink-0" />
              <span className="font-display text-sm font-bold text-ink">
                {profile.name}
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {profile.tagline}
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-deep">
              Explore
            </h2>

            <ul className="mt-3 space-y-1">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social and contact links */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-deep">
              Connect
            </h2>

            <ul className="mt-3 space-y-1">
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`} className={linkClass}>
                    <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Email
                  </a>
                </li>
              )}

              {profile.github && (
                <li>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    <GithubIcon className="h-3.5 w-3.5 shrink-0" />
                    GitHub
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}

              {profile.linkedin && (
                <li>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    <LinkedinIcon className="h-3.5 w-3.5 shrink-0" />
                    LinkedIn
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}

              {profile.buyMeACoffee && (
                <li>
                  <a
                    href={profile.buyMeACoffee}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    <Coffee className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Buy Me a Coffee
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}

              {!profile.email &&
                !profile.github &&
                !profile.linkedin &&
                !profile.buyMeACoffee && (
                  <li>
                    <Link to="/contact" className={linkClass}>
                      Contact page
                    </Link>
                  </li>
                )}
            </ul>
          </div>
        </div>

        {/* Compact copyright bar */}
        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs leading-relaxed text-muted">
            <p>
              © {year} {profile.name}. All rights reserved.
            </p>
            <p className="mt-0.5">
              Thanks for stopping by.
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex h-11 w-fit items-center gap-1.5 rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-brand hover:bg-brand-soft hover:text-link"
          >
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
