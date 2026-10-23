
import {
  Coffee,
  GitBranch,
  ArrowUpRight,
  Heart,
  Code2,
} from 'lucide-react'

import Section from '../components/Section.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import { profile } from '../data/profile.js'

export default function CoffeeSupport() {
  const coffeeUrl = profile.buyMeACoffee
  const githubUrl = 'https://github.com/ENG-JUMA-O'
  const profileImage = profile.image || '/images/profile.jpg'

  // Hide the section in production until a coffee URL is configured.
  if (!coffeeUrl && !import.meta.env.DEV) return null

  return (
    <Section id="support" tone="alt" labelledBy="coffee-title">
      <Reveal>
        <div className="group relative isolate mx-auto max-w-5xl overflow-hidden rounded-2xl border border-coffee/15 bg-surface shadow-sm transition-all duration-300 hover:border-coffee/30 hover:shadow-lg">
          {/* Decorative background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-coffee/10 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-48 w-48 rounded-full bg-coffee/5 blur-3xl"
          />

          {/* Main layout */}
          <div className="flex flex-col-reverse items-center gap-6 p-5 text-center sm:p-7 md:flex-row md:justify-between md:gap-8 md:text-left lg:p-8">
            {/* Text and buttons — LEFT */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-coffee/15 bg-coffee/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-coffee-text">
                <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                Developer · Creator
              </div>

              <h2
                id="coffee-title"
                className="text-xl font-bold tracking-tight text-ink sm:text-2xl lg:text-3xl"
              >
                Enjoying what I build?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted md:mx-0 md:text-base">
                I build projects, explore new technologies, and share useful
                work. Support my journey with a coffee or explore my projects
                on GitHub.
              </p>

              {/* Action buttons */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center md:justify-start">
                {coffeeUrl ? (
                  <Button
                    href={coffeeUrl}
                    external
                    variant="coffee"
                    className="h-11 w-full justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
                  >
                    <Coffee className="h-4 w-4" aria-hidden="true" />
                    Buy Me a Coffee
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <p className="rounded-xl border border-dashed border-coffee/30 bg-coffee/5 px-3 py-2 text-xs leading-5 text-coffee-text">
                    Development preview: configure{' '}
                    <code className="break-all font-semibold">
                      VITE_BUYMEACOFFEE_URL
                    </code>{' '}
                    to enable the support button.
                  </p>
                )}

                <Button
                  href={githubUrl}
                  external
                  variant="secondary"
                  className="h-11 w-full justify-center gap-2 rounded-xl border border-ink/10 px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 sm:w-auto"
                >
                  <GitBranch className="h-4 w-4" aria-hidden="true" />
                  View GitHub
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              {/* Supporting message */}
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted md:justify-start">
                <Heart
                  className="h-3.5 w-3.5 text-coffee"
                  aria-hidden="true"
                />
                Thanks for supporting independent development.
              </p>
            </div>

            {/* Profile image — RIGHT on desktop */}
            <div className="relative shrink-0 md:ml-4">
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-coffee/20 bg-coffee/10 p-1 shadow-md transition-transform duration-300 group-hover:scale-[1.03] sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                <img
                  src={profileImage}
                  alt="My profile"
                  className="h-full w-full rounded-xl object-cover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              {/* Heart badge */}
              <span className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full border-2 border-surface bg-coffee text-white shadow-sm">
                <Heart
                  className="h-4 w-4 fill-current"
                  aria-hidden="true"
                />
              </span>

              {/* Decorative accent */}
              <span
                aria-hidden="true"
                className="absolute -left-2 -top-2 -z-10 h-10 w-10 rounded-xl border border-coffee/20"
              />
            </div>
          </div>

          {/* Bottom accent */}
          <div
            aria-hidden="true"
            className="h-1 w-full bg-gradient-to-r from-transparent via-coffee/30 to-transparent"
          />
        </div>
      </Reveal>
    </Section>
  )
}
