import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { ArrowLeft, Check, ExternalLink, Info, ZoomIn } from 'lucide-react'
import Button from '../components/Button.jsx'
import ImageLightbox from '../components/ImageLightbox.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import SmartImage from '../components/SmartImage.jsx'
import { GithubIcon } from '../components/BrandIcons.jsx'
import Reveal from '../components/Reveal.jsx'
import NotFound from './NotFound.jsx'
import { projects } from '../data/projects.js'
import { useSeo } from '../hooks/useSeo.js'
import { safeUrl } from '../utils/url.js'

function Block({ title, children }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-2xl font-bold tracking-tight text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function ProjectDetails() {
  const { slug } = useParams()
  const project = projects.find((item) => item.slug === slug)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useSeo(
    project
      ? {
          title: project.title,
          description: project.summary,
          path: `/projects/${project.slug}`,
          image: project.image,
        }
      : { title: 'Project not found', path: `/projects/${slug}`, noindex: true },
  )

  const screenshots = useMemo(
    () =>
      (project?.screenshots || []).map((shot, index) => ({
        src: shot.src,
        alt: shot.alt || `${project.title} screenshot ${index + 1}`,
        title: shot.caption || `${project.title} — screenshot ${index + 1}`,
        description: shot.caption || '',
        category: project.category,
        kind: project.imageKind,
      })),
    [project],
  )

  const related = useMemo(() => {
    if (!project) return []
    const others = projects.filter((item) => item.slug !== project.slug)
    const sameCategory = others.filter((item) => item.category === project.category)
    const rest = others.filter((item) => item.category !== project.category)
    return [...sameCategory, ...rest].slice(0, 3)
  }, [project])

  if (!project) {
    return (
      <NotFound
        title="Project not found"
        message="That project doesn't exist or may have been renamed."
        backTo="/projects"
        backLabel="Back to all projects"
      />
    )
  }

  const github = safeUrl(project.github)
  const live = safeUrl(project.live)
  const hasCaseStudy =
    project.problem ||
    project.goals?.length ||
    project.audience ||
    project.features?.length ||
    project.process?.length ||
    project.challenges?.length

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <div className="container-page py-10 sm:py-14">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-link transition-colors hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-link">{project.category}</span>
            {project.placeholder && (
              <span className="rounded-full border border-dashed border-line px-3 py-1 text-xs font-medium text-muted">
                Sample placeholder
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">{project.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{project.summary}</p>

          {(github || live) && (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {live && (
                <Button href={live} external>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Live demo
                </Button>
              )}
              {github && (
                <Button href={github} external variant="secondary">
                  <GithubIcon className="h-4 w-4" />
                  GitHub repository
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="bg-surface py-12 sm:py-16">
        <div className="container-page">
          <Reveal>
            <SmartImage
              src={project.image}
              alt={`${project.title} preview`}
              kind={project.imageKind}
              ratio="16 / 9"
              loading="eager"
              className="rounded-2xl border border-line"
            />
          </Reveal>

          {project.placeholder && (
            <p className="mt-6 flex items-start gap-3 rounded-lg border border-line bg-brand-soft p-4 text-sm text-ink">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-link" aria-hidden="true" />
              <span>
                This is a sample placeholder project. Real case-study details — problem, goals, features and process —
                will appear here once they are added to the project data.
              </span>
            </p>
          )}

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
            <div>
              {project.description && (
                <Block title="Overview">
                  <p className="max-w-3xl text-base leading-relaxed text-muted">{project.description}</p>
                </Block>
              )}

              {project.problem && (
                <Block title="The problem">
                  <p className="max-w-3xl text-base leading-relaxed text-muted">{project.problem}</p>
                </Block>
              )}

              {(project.goals?.length > 0 || project.audience) && (
                <Block title="Goals and audience">
                  {project.goals?.length > 0 && (
                    <ul className="space-y-2">
                      {project.goals.map((goal) => (
                        <li key={goal} className="flex gap-3 text-base text-muted">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-link" aria-hidden="true" />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {project.audience && (
                    <p className="mt-4 text-base text-muted">
                      <strong className="font-semibold text-ink">Intended audience: </strong>
                      {project.audience}
                    </p>
                  )}
                </Block>
              )}

              {project.features?.length > 0 && (
                <Block title="Features">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {project.features.map((feature) => (
                      <li key={feature} className="flex gap-3 rounded-lg border border-line p-3.5 text-sm text-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-link" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Block>
              )}

              {project.process?.length > 0 && (
                <Block title="Development process">
                  <ol className="space-y-3">
                    {project.process.map((step, index) => (
                      <li key={step} className="flex gap-4">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-link">
                          {index + 1}
                        </span>
                        <span className="pt-1 text-base text-muted">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Block>
              )}

              {project.challenges?.length > 0 && (
                <Block title="Challenges and solutions">
                  <div className="space-y-4">
                    {project.challenges.map((item) => (
                      <div key={item.challenge} className="rounded-xl border border-line p-5">
                        <p className="text-sm font-semibold text-ink">Challenge</p>
                        <p className="mt-1 text-sm text-muted">{item.challenge}</p>
                        <p className="mt-3 text-sm font-semibold text-ink">Solution</p>
                        <p className="mt-1 text-sm text-muted">{item.solution}</p>
                      </div>
                    ))}
                  </div>
                </Block>
              )}

              {!project.description && !hasCaseStudy && (
                <p className="text-base text-muted">More details about this project will be added soon.</p>
              )}
            </div>

            <aside aria-label="Project facts" className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              {project.tech?.length > 0 && (
                <div className="rounded-xl border border-line bg-surface-alt p-5">
                  <h2 className="text-sm font-semibold text-ink">Technology stack</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {project.tech.map((item) => (
                      <li key={item} className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-xl border border-line bg-surface-alt p-5">
                <h2 className="text-sm font-semibold text-ink">Project info</h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Category</dt>
                    <dd className="text-right font-medium text-ink">{project.category}</dd>
                  </div>
                  {project.date && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Date</dt>
                      <dd className="text-right font-medium text-ink">{project.date}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </aside>
          </div>

          {screenshots.length > 0 && (
            <section className="mt-16" aria-labelledby="screenshots-title">
              <h2 id="screenshots-title" className="text-2xl font-bold tracking-tight text-ink">
                Screenshots
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {screenshots.map((shot, index) => (
                  <li key={shot.src || index}>
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      aria-haspopup="dialog"
                      className="group relative block w-full overflow-hidden rounded-xl border border-line text-left"
                    >
                      <SmartImage
                        src={shot.src}
                        alt={shot.alt}
                        kind={project.imageKind}
                        ratio="16 / 10"
                        imgClassName="transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-lg bg-surface/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <ZoomIn className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="sr-only">Open larger preview: {shot.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-16" aria-labelledby="related-title">
              <h2 id="related-title" className="text-2xl font-bold tracking-tight text-ink">
                Related projects
              </h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item, index) => (
                  <li key={item.slug}>
                    <ProjectCard project={item} index={index} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-14">
            <Button to="/projects" variant="secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to all projects
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <ImageLightbox
            items={screenshots}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onIndexChange={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </>
  )
}
