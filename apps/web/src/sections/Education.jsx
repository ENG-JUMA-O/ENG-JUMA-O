
import { ArrowRight, BookOpen, GraduationCap, School, CalendarDays } from 'lucide-react'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import { education } from '../data/education.js'

const icons = {
  graduation: GraduationCap,
  school: School,
  book: BookOpen,
}

function getEducationOrder(item) {
  const value = `${item.stage ?? ''} ${item.institution ?? ''}`.toLowerCase()

  if (value.includes('primary')) return 1
  if (value.includes('secondary')) return 2
  if (
    value.includes('college') ||
    value.includes('institute') ||
    value.includes('university')
  ) return 3

  return 4
}

function getCompletionYear(item) {
  if (item.endYear) return item.endYear

  // Supports periods such as "2018 - 2022" or "2018–2022".
  const years = String(item.period ?? '').match(/\b(?:19|20)\d{2}\b/g)

  return years?.[years.length - 1] ?? null
}

function SchoolLogo({ item, Icon }) {
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-surface shadow-sm sm:h-[72px] sm:w-[72px]">
      {item.logo ? (
        <img
          src={item.logo}
          alt={`${item.institution} logo`}
          className="h-full w-full object-contain p-2"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
            event.currentTarget.nextElementSibling?.classList.remove('hidden')
          }}
        />
      ) : null}

      <Icon
        aria-hidden="true"
        className={`h-8 w-8 text-link ${item.logo ? 'hidden' : ''}`}
      />
    </div>
  )
}

function EducationCard({ item, index, full }) {
  const Icon = icons[item.icon] || GraduationCap
  const completionYear = getCompletionYear(item)

  return (
    <Reveal delay={index * 0.08} className="h-full">
      <article className="group relative h-full overflow-hidden rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-bright/50 hover:shadow-lg sm:p-6">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-brand opacity-70 transition-opacity group-hover:opacity-100"
        />

        <div className="flex items-start gap-4">
          <SchoolLogo item={item} Icon={Icon} />

          <div className="min-w-0 flex-1 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-link">
              {item.stage}
            </p>

            <h3 className="mt-1 break-words text-lg font-bold leading-snug text-ink sm:text-xl">
              {item.institution}
            </h3>

            {item.period && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.period}
              </p>
            )}
          </div>
        </div>

        {item.details && full && (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {item.details}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-xs font-medium text-muted">
            {completionYear ? 'Year completed' : 'Education'}
          </span>

          {completionYear ? (
            <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-link">
              {completionYear}
            </span>
          ) : (
            <span className="text-sm font-medium text-muted">
              {item.endYear ? item.endYear : 'Year not provided'}
            </span>
          )}
        </div>
      </article>
    </Reveal>
  )
}

export default function Education({
  variant = 'preview',
  tone = 'plain',
}) {
  const full = variant === 'full'

  const orderedEducation = [...education].sort(
    (a, b) => getEducationOrder(a) - getEducationOrder(b),
  )

  return (
    <Section
      id={full ? 'education' : undefined}
      tone={tone}
      labelledBy={`education-title-${variant}`}
    >
      <Reveal>
        <SectionHeading
          id={`education-title-${variant}`}
          eyebrow="My education"
          title="My learning journey"
          description="From primary school to higher education, each step has helped shape my knowledge and passion for technology."
        />
      </Reveal>

      {full ? (
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="mb-7 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-link">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-semibold text-ink">Academic timeline</h3>
              <p className="text-sm text-muted">
                My education, in chronological order
              </p>
            </div>
          </div>

          <ol className="relative space-y-5 border-l border-line pl-5 sm:pl-7">
            {orderedEducation.map((item, index) => (
              <li key={item.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[26px] top-7 h-3 w-3 rounded-full border-2 border-brand bg-surface sm:-left-[34px]"
                />
                <EducationCard item={item} index={index} full />
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {orderedEducation.map((item, index) => (
              <li key={item.id}>
                <EducationCard item={item} index={index} full={false} />
              </li>
            ))}
          </ol>

          <div className="mt-9">
            <Button to="/about#education" variant="ghost">
              Explore my education
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </>
      )}
    </Section>
  )
}
