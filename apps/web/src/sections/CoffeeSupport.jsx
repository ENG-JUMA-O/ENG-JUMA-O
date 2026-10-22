import { Coffee } from 'lucide-react'
import Section from '../components/Section.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import { profile } from '../data/profile.js'

/**
 * Support section. It only renders a real link when VITE_BUYMEACOFFEE_URL is configured.
 * In production, with no URL configured, the whole section is hidden. In development, a labelled
 * setup note is shown instead, so visitors are never sent to an invented account.
 */
export default function CoffeeSupport() {
  const url = profile.buyMeACoffee
  if (!url && !import.meta.env.DEV) return null

  return (
    <Section id="support" tone="alt" labelledBy="coffee-title">
      <Reveal>
        <div className="group relative overflow-hidden rounded-2xl border border-coffee/25 bg-coffee-soft px-6 py-10 sm:px-12 sm:py-14 md:flex md:items-center md:gap-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-coffee/10 blur-2xl"
          />
          <span className="relative mx-auto grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-coffee text-white transition-transform duration-300 group-hover:-rotate-6 md:mx-0">
            <Coffee className="h-9 w-9" aria-hidden="true" />
          </span>

          <div className="relative mt-6 flex-1 text-center md:mt-0 md:text-left">
            <h2 id="coffee-title" className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Enjoying My Work?
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
              If you find my projects useful or enjoy what I create, consider supporting my work. Every contribution
              helps me keep learning, building, and sharing.
            </p>
          </div>

          <div className="relative mt-8 flex justify-center md:mt-0 md:shrink-0">
            {url ? (
              <Button href={url} external variant="coffee" className="h-12 px-6 text-base">
                <Coffee className="h-5 w-5" aria-hidden="true" />
                Buy Me a Coffee
              </Button>
            ) : (
              <p className="max-w-60 rounded-lg border border-dashed border-coffee/50 p-3 text-center text-xs text-coffee-text">
                Setup placeholder (visible in development only): set VITE_BUYMEACOFFEE_URL in .env to show the button.
              </p>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
