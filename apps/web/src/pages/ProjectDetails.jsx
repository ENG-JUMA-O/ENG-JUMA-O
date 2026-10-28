
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  ZoomIn,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react'

import Button from '../components/Button.jsx'
import ImageLightbox from '../components/ImageLightbox.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import SmartImage from '../components/SmartImage.jsx'
import { GithubIcon } from '../components/BrandIcons.jsx'
import Reveal from '../components/Reveal.jsx'
import NotFound from './NotFound.jsx'
import { projects as localProjects } from '../data/projects.js'
import { useSeo } from '../hooks/useSeo.js'
import { githubService } from '../services/github.service.js'
import { safeUrl } from '../utils/url.js'

function toSlug(name = '') {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function Block({ title, children }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-2xl font-bold tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function formatDate(date) {
  if (!date) return ''

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return ''

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}

function getRepositoryName(slug) {
  const curated = localProjects.find(
    (item) => item.slug === slug && !item.placeholder,
  )

  if (curated?.github) {
    return curated.github.split('/').filter(Boolean).pop()
  }

  // Resolve a slug against known local project metadata first.
  const matchingProject = localProjects.find(
    (item) => !item.placeholder && toSlug(item.slug) === slug,
  )

  if (matchingProject?.github) {
    return matchingProject.github.split('/').filter(Boolean).pop()
  }

  // A slug must not match a known sample placeholder.
  const isPlaceholder = localProjects.some(
    (item) => item.placeholder && item.slug === slug,
  )

  return isPlaceholder ? null : slug
}

export default function ProjectDetails() {
  const { slug } = useParams()

  const [repository, setRepository] = useState(null)
  const [readme, setReadme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [readmeError, setReadmeError] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const localProject = localProjects.find(
    (item) => item.slug === slug && !item.placeholder,
  )

  useSeo({
    title: localProject?.title || slug || 'Project',
    description:
      localProject?.summary ||
      'Explore this project, its technologies, and source code.',
    path: `/projects/${slug}`,
    noindex: false,
  })

  useEffect(() => {
    let cancelled = false

    async function loadProject() {
      setLoading(true)
      setError('')
      setReadmeError('')
      setRepository(null)
      setReadme(null)

      try {
        const repositoryName = getRepositoryName(slug)

        if (!repositoryName) {
          throw new Error(
            'This is a sample project, not a published GitHub repository.',
          )
        }

        const response =
          await githubService.getProject(repositoryName)

        if (!response?.success || !response.data?.name) {
          throw new Error('The GitHub repository was not found.')
        }

        if (cancelled) return

        setRepository(response.data)

        try {
          const readmeResponse =
            await githubService.getProjectReadme(
              response.data.name,
            )

          if (!readmeResponse?.success) {
            throw new Error('README content is unavailable.')
          }

          if (!cancelled) {
            setReadme(readmeResponse.data || null)
          }
        } catch (readmeFetchError) {
          if (!cancelled) {
            setReadmeError(
              readmeFetchError.message ||
                'Unable to load the README.',
            )
          }
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError.message ||
              'Unable to load this GitHub repository.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (slug) {
      loadProject()
    } else {
      setError('No project was specified.')
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [slug])

  const project = useMemo(() => {
    if (!repository) return null

    const repositorySlug = toSlug(repository.name)

    const curated =
      localProjects.find(
        (item) =>
          item.slug === repositorySlug && !item.placeholder,
      ) || localProject

    const inferredCategory = [
      'JavaScript',
      'TypeScript',
      'HTML',
      'CSS',
    ].includes(repository.language)
      ? 'Web Development'
      : repository.language === 'Swift' ||
          repository.language === 'Dart'
        ? 'Mobile Applications'
        : 'Backend Development'

    return {
      ...curated,
      id: repository.id,
      slug: repositorySlug,
      title: curated?.title || repository.name,
      summary:
        curated?.summary ||
        repository.description ||
        `Explore ${repository.name} on GitHub.`,
      description:
        curated?.description || repository.description || '',
      category: curated?.category || inferredCategory,
      tech:
        curated?.tech?.length
          ? curated.tech
          : [
              ...(repository.language
                ? [repository.language]
                : []),
              ...(repository.topics || []),
            ],
      github: repository.githubUrl || '',
      live: repository.homepage || curated?.live || '',
      stars: repository.stars ?? 0,
      forks: repository.forks ?? 0,
      updatedAt: repository.updatedAt || '',
      image: curated?.image || '',
      imageKind: curated?.imageKind || 'web',
      screenshots: curated?.screenshots || [],
      features: curated?.features || [],
      goals: curated?.goals || [],
      process: curated?.process || [],
      challenges: curated?.challenges || [],
      problem: curated?.problem || '',
      audience: curated?.audience || '',
      placeholder: false,
    }
  }, [repository, localProject])

  const screenshots = useMemo(
    () =>
      (project?.screenshots || []).map((shot, index) => ({
        src: shot.src,
        alt: shot.alt || `${project.title} screenshot ${index + 1}`,
        title:
          shot.caption ||
          `${project.title} — screenshot ${index + 1}`,
        description: shot.caption || '',
        category: project.category,
        kind: project.imageKind,
      })),
    [project],
  )

  const related = useMemo(() => {
    if (!project) return []

    return localProjects
      .filter(
        (item) =>
          !item.placeholder && item.slug !== project.slug,
      )
      .slice(0, 3)
  }, [project])

  if (loading) {
    return (
      <main className="container-page bg-page py-20">
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 text-sm text-muted"
        >
          <LoaderCircle
            className="h-5 w-5 animate-spin"
            aria-hidden="true"
          />
          Loading project from GitHub…
        </div>
      </main>
    )
  }

  if (error || !project) {
    return (
      <NotFound
        title="Project not found"
        message={
          error ||
          "That project doesn't exist or may have been renamed."
        }
        backTo="/projects"
        backLabel="Back to all projects"
      />
    )
  }

  const github = safeUrl(project.github)
  const live = safeUrl(project.live)

  const hasCaseStudy = Boolean(
    project.problem ||
      project.goals?.length ||
      project.audience ||
      project.features?.length ||
      project.process?.length ||
      project.challenges?.length,
  )

  return (
    <>
      <header className="relative overflow-hidden border-b border-line bg-page">
        <div
          aria-hidden="true"
          className="bg-wash pointer-events-none absolute inset-0"
        />

        <div className="container-page relative py-10 sm:py-14">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-link transition-colors hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-leaf-soft px-3 py-1 text-xs font-semibold text-brand-deep">
              {project.category}
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-brand-deep sm:text-4xl lg:text-5xl">
            {project.title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {project.summary}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            <span>{project.stars} GitHub stars</span>
            <span>{project.forks} forks</span>
            {project.updatedAt && (
              <span>Updated {formatDate(project.updatedAt)}</span>
            )}
          </div>

          {(github || live) && (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {live && (
                <Button href={live} external>
                  <ExternalLink
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Live demo
                </Button>
              )}

              {github && (
                <Button
                  href={github}
                  external
                  variant="secondary"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub repository
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="bg-page py-12 sm:py-16">
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

          {project.description && (
            <Block title="Overview">
              <p className="max-w-3xl text-base leading-relaxed text-muted">
                {project.description}
              </p>
            </Block>
          )}

          {project.problem && (
            <Block title="The problem">
              <p className="max-w-3xl text-base leading-relaxed text-muted">
                {project.problem}
              </p>
            </Block>
          )}

          {(project.goals?.length > 0 || project.audience) && (
            <Block title="Goals and audience">
              {project.goals?.length > 0 && (
                <ul className="space-y-2">
                  {project.goals.map((goal) => (
                    <li key={goal} className="flex gap-3 text-base text-muted">
                      <Check
                        className="mt-1 h-4 w-4 shrink-0 text-link"
                        aria-hidden="true"
                      />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              )}

              {project.audience && (
                <p className="mt-4 text-base text-muted">
                  <strong className="font-semibold text-ink">
                    Intended audience:{' '}
                  </strong>
                  {project.audience}
                </p>
              )}
            </Block>
          )}

          {project.features?.length > 0 && (
            <Block title="Features">
              <ul className="grid gap-3 sm:grid-cols-2">
                {project.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-3 rounded-lg border border-line p-3.5 text-sm text-muted"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-link"
                      aria-hidden="true"
                    />
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
                    <span className="pt-1 text-base text-muted">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {project.challenges?.length > 0 && (
            <Block title="Challenges and solutions">
              <div className="space-y-4">
                {project.challenges.map((item) => (
                  <div
                    key={item.challenge}
                    className="rounded-xl border border-line p-5"
                  >
                    <p className="text-sm font-semibold text-ink">
                      Challenge
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {item.challenge}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-ink">
                      Solution
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {!project.description && !hasCaseStudy && (
            <p className="text-base text-muted">
              More details about this project will be added soon.
            </p>
          )}

          <Block title="GitHub README">
            {readmeError && (
              <div
                role="status"
                className="rounded-xl border border-line bg-surface p-5"
              >
                <p className="text-sm text-muted">{readmeError}</p>
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"
                  >
                    Read repository on GitHub
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}

            {readme?.content ? (
              <div className="rounded-xl border border-line bg-surface p-5 sm:p-8">
                <p className="mb-5 text-xs text-muted">
                  Source: {readme.fileName || 'README.md'}
                </p>

                <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-muted">
                  {readme.content}
                </pre>

                {readme.htmlUrl && (
                  <a
                    href={safeUrl(readme.htmlUrl) || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"
                  >
                    View formatted README on GitHub
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            ) : !readmeError ? (
              <p className="text-sm text-muted">
                This repository has no available README content.
              </p>
            ) : null}
          </Block>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
            <div>
              {screenshots.length > 0 && (
                <section aria-labelledby="screenshots-title">
                  <h2
                    id="screenshots-title"
                    className="text-2xl font-bold tracking-tight text-ink"
                  >
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

                          <span className="sr-only">
                            Open larger preview: {shot.title}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside
              aria-label="Project facts"
              className="space-y-5 lg:sticky lg:top-24 lg:self-start"
            >
              {project.tech?.length > 0 && (
                <div className="rounded-xl border border-line bg-surface-alt p-5">
                  <h2 className="text-sm font-semibold text-ink">
                    Technology stack
                  </h2>

                  <ul className="mt-3 flex flex-wrap gap-2">
                    {project.tech.map((item) => (
                      <li
                        key={item}
                        className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-muted"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl border border-line bg-surface-alt p-5">
                <h2 className="text-sm font-semibold text-ink">
                  Project info
                </h2>

                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Category</dt>
                    <dd className="text-right font-medium text-ink">
                      {project.category}
                    </dd>
                  </div>

                  {project.updatedAt && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Last updated</dt>
                      <dd className="text-right font-medium text-ink">
                        {formatDate(project.updatedAt)}
                      </dd>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Stars</dt>
                    <dd className="text-right font-medium text-ink">
                      {project.stars}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Forks</dt>
                    <dd className="text-right font-medium text-ink">
                      {project.forks}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <section className="mt-16" aria-labelledby="related-title">
              <h2
                id="related-title"
                className="text-2xl font-bold tracking-tight text-ink"
              >
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
