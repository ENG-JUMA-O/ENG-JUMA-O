import { ArrowRight } from 'lucide-react'
import Section from '../components/Section.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'

export default function ContactCta() {
  return (
    <Section id="cta" labelledBy="cta-title">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-deep to-brand px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative">
            <h2 id="cta-title" className="text-2xl font-bold tracking-tight min-[400px]:text-3xl sm:text-4xl">
              Let's Build Something Great
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
              Have an idea, a project, or an opportunity to discuss? I'd be happy to hear from you.
            </p>
            <Button
              to="/contact"
              variant="secondary"
              className="mt-8 border-white bg-white text-brand-deep hover:border-white hover:text-brand-deep"
            >
              Get in touch
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
