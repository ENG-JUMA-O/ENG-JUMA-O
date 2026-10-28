import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Reveal from '../components/Reveal.jsx'
import { processSteps } from '../data/features.js'

export default function Process() {
  return (
    <Section id="process" tone="alt" labelledBy="process-title">
      <Reveal>
        <SectionHeading
          id="process-title"
          eyebrow="Approach"
          title="How I like to work"
          description="A simple loop that keeps design and code pointing at the same goal."
        />
      </Reveal>
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((step, index) => (
          <li key={step.id}>
            <Reveal delay={index * 0.07} className="h-full">
              <div className="relative h-full rounded-2xl border border-line bg-surface p-6 shadow-soft">
                <span className="font-display text-4xl font-bold text-brand-bright/40" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}
