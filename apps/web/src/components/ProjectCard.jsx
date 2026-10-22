import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import Reveal from './Reveal.jsx'
import SmartImage from './SmartImage.jsx'
import { GithubIcon } from './BrandIcons.jsx'
import { safeUrl } from '../utils/url.js'

/** Reusable project card for the homepage, the catalogue and related projects. */
export default function ProjectCard({ project, index = 0 }) {
  const github = safeUrl(project.github)
  const live = safeUrl(project.live)
  const detailsPath = `/projects/${project.slug}`
  const linkClass =
    'inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-semibold text-ink transition-colors hover:border-brand hover:text-link'

  return (
    <Reveal delay={Math.min(index, 5) * 0.06} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10 focus-within:border-brand/60">
        <Link to={detailsPath} tabIndex={-1} aria-hidden="true" className="block">
          <SmartImage
            src={project.image}
            alt={`${project.title} preview`}
            kind={project.imageKind}
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-link">{project.category}</span>
            {project.placeholder && (
              <span className="rounded-full border border-dashed border-line px-2.5 py-1 text-xs font-medium text-muted">
                Sample placeholder
              </span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold text-ink">
            <Link to={detailsPath} className="transition-colors hover:text-link">
              {project.title}
            </Link>
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>

          {project.tech?.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
              {project.tech.map((item) => (
                <li key={item} className="rounded-md border border-line px-2 py-0.5 text-xs text-muted">
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
            <Link
              to={detailsPath}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              View details
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only"> of {project.title}</span>
            </Link>
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <GithubIcon className="h-4 w-4" />
                GitHub
                <span className="sr-only"> repository for {project.title} (opens in a new tab)</span>
              </a>
            )}
            {live && (
              <a href={live} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Live demo
                <span className="sr-only"> of {project.title} (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  )
}
