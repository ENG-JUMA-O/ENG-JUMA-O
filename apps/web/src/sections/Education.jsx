import { ArrowRight, BookOpen, GraduationCap, School } from 'lucide-react'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import { education } from '../data/education.js'

const icons = { graduation: GraduationCap, school: School, book: BookOpen }

/**
 * variant="preview": compact cards for the homepage.
 * variant="full":    vertical timeline for the About page (anchor id "education").
 */
export default function Education({ variant = 'preview', tone = 'plain' }) {
  const full = variant === 'full'

  return (
    <Section id={full ? 'education' : undefined} tone={tone} labelledBy={`education-title-${variant}`}>
      <Reveal>
        <SectionHeading
          id={`education-title-${variant}`}
          eyebrow="Education"
          title="Where I've studied"
          description="The schools and institute that shaped my path into technology."
        />
      </Reveal>

      {full ? (
        <ol className="relative ml-5 mt-12 max-w-2xl space-y-10 border-l border-line">
          {education.map((item, index) => {
            const Icon = icons[item.icon] || GraduationCap
            return (
              <li key={item.id} className="relative pl-10">
                <span className="absolute -left-5 top-0 grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-link">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <Reveal delay={index * 0.08}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-link">{item.stage}</p>
                  <h3 className="mt-1 text-xl font-semibold text-ink">{item.institution}</h3>
                  {item.period && <p className="mt-1 text-sm text-muted">{item.period}</p>}
                  {item.details && <p className="mt-2 text-sm leading-relaxed text-muted">{item.details}</p>}
                </Reveal>
              </li>
            )
          })}
        </ol>
      ) : (
        <>
          <ul className="mt-12 grid gap-5 sm:grid-cols-3">
            {education.map((item, index) => {
              const Icon = icons[item.icon] || GraduationCap
              return (
                <li key={item.id}>
                  <Reveal delay={index * 0.07} className="h-full">
                    <article className="h-full rounded-xl border border-line bg-surface p-6 transition duration-200 hover:border-brand/50">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-link">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-link">{item.stage}</p>
                      <h3 className="mt-1 text-lg font-semibold text-ink">{item.institution}</h3>
                      {item.period && <p className="mt-1 text-sm text-muted">{item.period}</p>}
                    </article>
                  </Reveal>
                </li>
              )
            })}
          </ul>
          <div className="mt-10">
            <Button to="/about#education" variant="ghost">
              See education on the About page
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </>
      )}
    </Section>
  )
}
