
import { Coffee, Heart, ArrowUpRight } from 'lucide-react'
import Section from '../components/Section.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import { profile } from '../data/profile.js'

export default function CoffeeSupport() {
  const url = profile.buyMeACoffee

  // Hide the section in production until a real URL is configured.
  if (!url && !import.meta.env.DEV) return null

  return (
    <Section id="support" tone="alt" labelledBy="coffee-title">
      <Reveal>
        <div className="group relative isolate overflow-hidden rounded-2xl border border-coffee/20 bg-surface px-5 py-7 shadow-sm transition-shadow duration-300 hover:shadow-md sm:px-8 sm:py-9 lg:px-10">
          {/* Subtle decorative background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full bg-coffee/10 blur-3xl"
          />

          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
            {/* Icon */}
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-coffee/10 text-coffee transition-transform duration-300 group-hover:rotate-3 sm:h-16 sm:w-16">
              <Coffee className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-coffee-text">
                <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                Support my work
              </div>

              <h2
                id="coffee-title"
                className="text-xl font-bold tracking-tight text-ink sm:text-2xl"
              >
                Enjoying what I build?
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted sm:mx-0 sm:text-base">
                If my projects have helped or inspired you, consider buying me a coffee.
                Your support helps me keep learning, creating, and sharing useful work.
              </p>
            </div>

            {/* Action */}
            <div className="flex w-full shrink-0 flex-col items-center gap-2 sm:w-auto sm:items-start">
              {url ? (
                <Button
                  href={url}
                  external
                  variant="coffee"
                  className="h-11 w-full justify-center px-5 text-sm sm:w-auto"
                >
                  <Coffee className="h-4 w-4" aria-hidden="true" />
                  Buy Me a Coffee
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <p className="max-w-xs rounded-lg border border-dashed border-coffee/40 bg-coffee/5 px-3 py-2 text-xs leading-relaxed text-coffee-text">
                  Development preview: add your
                  {' '}
                  <code>VITE_BUYMEACOFFEE_URL</code>
                  {' '}
                  to enable the support button.
                </p>
              )}

              {url && (
                <span className="text-xs text-muted">
                  Thanks for supporting independent development.
                </span>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
