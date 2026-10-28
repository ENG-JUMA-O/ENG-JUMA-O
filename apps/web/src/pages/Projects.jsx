
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SearchX, X } from 'lucide-react'

import PageHeader from '../components/PageHeader.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import Button from '../components/Button.jsx'
import { categoryOrder, projects as localProjects } from '../data/projects.js'
import { useSeo } from '../hooks/useSeo.js'
import { githubService } from '../services/github.service.js'

const ALL = 'All Projects'

const SORTS = [
  { value: 'featured', label: 'Featured first' },
  { value: 'newest', label: 'Recently updated' },
  { value: 'alpha', label: 'Alphabetical (A–Z)' },
]

function sortProjects(list, sort) {
  const copy = [...list]

  if (sort === 'alpha') {
    return copy.sort((a, b) => a.title.localeCompare(b.title))
  }

  if (sort === 'newest') {
    return copy.sort((a, b) =>
      (b.updatedAt || b.date || '').localeCompare(
        a.updatedAt || a.date || '',
      ),
    )
  }

  return copy.sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  )
}

function getProjectCategory(repository) {
  const topics = (repository.topics || []).map((topic) =>
    topic.toLowerCase(),
  )
  const language = (repository.language || '').toLowerCase()

  if (
    topics.some((topic) =>
      ['flutter', 'dart', 'mobile', 'android', 'ios'].includes(topic),
    )
  ) {
    return 'Mobile Applications'
  }

  if (
    topics.some((topic) =>
      ['ui-ux', 'design', 'figma', 'design-system'].includes(topic),
    )
  ) {
    return 'UI/UX Design'
  }

  if (
    topics.some((topic) =>
      ['backend', 'api', 'server', 'express', 'nodejs'].includes(topic),
    )
  ) {
    return 'Backend Development'
  }

  if (['python', 'java', 'go', 'php'].includes(language)) {
    return 'Backend Development'
  }

  return 'Web Development'
}

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function mapGitHubProject(repository) {
  const slug = toSlug(repository.name)

  // Match curated local content when a real entry exists.
  const local = localProjects.find(
    (project) => project.slug === slug && !project.placeholder,
  )

  return {
    ...local,
    slug,
    title: local?.title || repository.name,
    summary:
      local?.summary ||
      repository.description ||
      `Explore ${repository.name}, its source code, and implementation on GitHub.`,
    description:
      local?.description || repository.description || '',
    category: local?.category || getProjectCategory(repository),
    tech: local?.tech?.length
      ? local.tech
      : [
          ...(repository.language ? [repository.language] : []),
          ...(repository.topics || []),
        ],
    github: repository.githubUrl,
    live: repository.homepage || local?.live || '',
    stars: repository.stars ?? 0,
    forks: repository.forks ?? 0,
    updatedAt: repository.updatedAt || '',
    date: local?.date || '',
    featured: local?.featured ?? false,
    image: local?.image || '',
    imageKind: local?.imageKind || 'web',
    screenshots: local?.screenshots || [],
    placeholder: false,
  }
}

export default function Projects() {
  useSeo({
    title: 'Projects',
    description:
      'Explore the applications, websites, and digital experiences ENG Douglas Oroko has been working on.',
    path: '/projects',
  })

  const [params, setParams] = useSearchParams()
  const [githubProjects, setGithubProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      setLoading(true)
      setApiError('')

      try {
        const response = await githubService.getProjects({
          page: 1,
          perPage: 10,
        })

        if (!response?.success || !Array.isArray(response.data)) {
          throw new Error(
            'The projects API returned an unexpected response.',
          )
        }

        const repositories = response.data
          // Exclude the GitHub profile repository from the portfolio list.
          .filter(
            (repository) =>
              repository.name.toLowerCase() !== 'eng-juma-o',
          )
          .map(mapGitHubProject)

        if (!cancelled) {
          setGithubProjects(repositories)
        }
      } catch (error) {
        if (!cancelled) {
          setApiError(
            error.message ||
              'Unable to load projects. Please try again.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      cancelled = true
    }
  }, [retryCount])

  const categories = useMemo(() => {
    const present = new Set(
      githubProjects.map((project) => project.category),
    )

    const ordered = categoryOrder.filter((category) =>
      present.has(category),
    )

    const extras = [...present].filter(
      (category) => !categoryOrder.includes(category),
    )

    return [ALL, ...ordered, ...extras]
  }, [githubProjects])

  const hasDates = githubProjects.some(
    (project) => project.date || project.updatedAt,
  )

  const sortOptions = SORTS.filter(
    (option) => option.value !== 'newest' || hasDates,
  )

  const requestedCategory = params.get('category') || ALL
  const category = categories.includes(requestedCategory)
    ? requestedCategory
    : ALL

  const query = params.get('q') || ''
  const requestedSort = params.get('sort') || 'featured'

  const sort = sortOptions.some(
    (option) => option.value === requestedSort,
  )
    ? requestedSort
    : 'featured'

  const update = (changes) => {
    const next = new URLSearchParams(params)

    Object.entries(changes).forEach(([key, value]) => {
      const isDefault =
        !value ||
        value === ALL ||
        (key === 'sort' && value === 'featured')

      if (isDefault) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    })

    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()

    const filtered = githubProjects.filter((project) => {
      if (category !== ALL && project.category !== category) {
        return false
      }

      if (!term) return true

      const haystack = [
        project.title,
        project.summary,
        project.description,
        project.category,
        ...(project.tech || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })

    return sortProjects(filtered, sort)
  }, [githubProjects, category, query, sort])

  const filtersActive = category !== ALL || query.trim() !== ''

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="My Projects"
        description="Explore the applications, websites, and digital experiences I've been working on."
      >
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Browse by category, search by name or technology, and open any
          project for the full story.
          {!loading && !apiError && (
            <>
              {' '}
              Projects are loaded from GitHub.
            </>
          )}
        </p>
      </PageHeader>

      <section
        aria-label="Project catalogue"
        className="bg-page py-12 sm:py-16"
      >
        <div className="container-page">
          {loading && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl border border-line bg-surface p-6 text-sm text-muted"
            >
              <span className="inline-flex items-center gap-3">
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-brand"
                  aria-hidden="true"
                />
                Loading projects from GitHub…
              </span>
            </div>
          )}

          {apiError && !loading && (
            <div
              role="alert"
              className="rounded-xl border border-line bg-surface p-6"
            >
              <h2 className="font-semibold text-ink">
                Unable to load projects
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {apiError}
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Try again
              </Button>
            </div>
          )}

          {!loading && !apiError && (
            <>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div
                  role="group"
                  aria-label="Filter by category"
                  className="flex flex-wrap gap-2"
                >
                  {categories.map((item) => {
                    const active = item === category

                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={active}
                        onClick={() => update({ category: item })}
                        className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                          active
                            ? 'border-brand bg-brand text-white'
                            : 'border-line bg-surface text-muted hover:border-brand hover:text-link'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative sm:w-72">
                    <label
                      htmlFor="project-search"
                      className="sr-only"
                    >
                      Search projects
                    </label>

                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />

                    <input
                      id="project-search"
                      type="search"
                      value={query}
                      onChange={(event) =>
                        update({ q: event.target.value })
                      }
                      placeholder="Search name, technology…"
                      autoComplete="off"
                      className="h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-10 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 [&::-webkit-search-cancel-button]:hidden"
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={() => update({ q: '' })}
                        aria-label="Clear search"
                        className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:text-ink"
                      >
                        <X
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </div>

                  {sortOptions.length > 1 && (
                    <div>
                      <label
                        htmlFor="project-sort"
                        className="sr-only"
                      >
                        Sort projects
                      </label>

                      <select
                        id="project-sort"
                        value={sort}
                        onChange={(event) =>
                          update({ sort: event.target.value })
                        }
                        className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                      >
                        {sortOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <p
                role="status"
                aria-live="polite"
                className="mt-6 text-sm text-muted"
              >
                Showing {results.length}{' '}
                {results.length === 1 ? 'project' : 'projects'}
                {category !== ALL ? ` in ${category}` : ''}
                {query.trim()
                  ? ` matching “${query.trim()}”`
                  : ''}
              </p>

              {results.length > 0 ? (
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((project, index) => (
                    <li key={project.slug}>
                      <ProjectCard
                        project={project}
                        index={index}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-10 rounded-xl border border-dashed border-line bg-surface-alt px-6 py-14 text-center">
                  <SearchX
                    className="mx-auto h-10 w-10 text-muted"
                    aria-hidden="true"
                  />

                  <h2 className="mt-4 text-xl font-semibold text-ink">
                    No projects match your search
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                    Try a different keyword or technology, or clear
                    the filters to see every project.
                  </p>

                  {filtersActive && (
                    <Button
                      variant="secondary"
                      className="mt-6"
                      onClick={() =>
                        setParams(new URLSearchParams(), {
                          replace: true,
                        })
                      }
                    >
                      Clear search and filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
