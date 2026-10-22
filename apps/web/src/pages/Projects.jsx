import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SearchX, X } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import Button from '../components/Button.jsx'
import { categoryOrder, projects } from '../data/projects.js'
import { useSeo } from '../hooks/useSeo.js'

const ALL = 'All Projects'

const SORTS = [
  { value: 'featured', label: 'Featured first' },
  { value: 'newest', label: 'Newest first' },
  { value: 'alpha', label: 'Alphabetical (A–Z)' },
]

function sortProjects(list, sort) {
  const copy = [...list]
  if (sort === 'alpha') return copy.sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'newest') {
    // Projects without a supplied date go last; dates are never invented.
    return copy.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }
  return copy.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
}

export default function Projects() {
  useSeo({
    title: 'Projects',
    description: 'Explore the applications, websites, and digital experiences ENG Douglas Oroko has been working on.',
    path: '/projects',
  })

  const [params, setParams] = useSearchParams()

  // Only offer categories that actually have projects.
  const categories = useMemo(() => {
    const present = new Set(projects.map((project) => project.category))
    const ordered = categoryOrder.filter((category) => present.has(category))
    const extras = [...present].filter((category) => !categoryOrder.includes(category))
    return [ALL, ...ordered, ...extras]
  }, [])

  const hasDates = projects.some((project) => project.date)
  const sortOptions = SORTS.filter((option) => option.value !== 'newest' || hasDates)

  const requestedCategory = params.get('category') || ALL
  const category = categories.includes(requestedCategory) ? requestedCategory : ALL
  const query = params.get('q') || ''
  const requestedSort = params.get('sort') || 'featured'
  const sort = sortOptions.some((option) => option.value === requestedSort) ? requestedSort : 'featured'

  const update = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      const isDefault = !value || value === ALL || (key === 'sort' && value === 'featured')
      if (isDefault) next.delete(key)
      else next.set(key, value)
    })
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = projects.filter((project) => {
      if (category !== ALL && project.category !== category) return false
      if (!term) return true
      const haystack = [project.title, project.summary, project.description, project.category, ...(project.tech || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
    return sortProjects(filtered, sort)
  }, [category, query, sort])

  const filtersActive = category !== ALL || query.trim() !== ''

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="My Projects"
        description="Explore the applications, websites, and digital experiences I've been working on."
      >
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Browse by category, search by name or technology, and open any project for the full story.
          {import.meta.env.DEV && projects.some((project) => project.placeholder) && (
            <>
              {' '}
              <em>
                (Developer note: sample placeholders are shown until real projects are added to src/data/projects.js.)
              </em>
            </>
          )}
        </p>
      </PageHeader>

      <section aria-label="Project catalogue" className="bg-surface py-12 sm:py-16">
        <div className="container-page">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
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
                <label htmlFor="project-search" className="sr-only">
                  Search projects
                </label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  id="project-search"
                  type="search"
                  value={query}
                  onChange={(event) => update({ q: event.target.value })}
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
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {sortOptions.length > 1 && (
                <div>
                  <label htmlFor="project-sort" className="sr-only">
                    Sort projects
                  </label>
                  <select
                    id="project-sort"
                    value={sort}
                    onChange={(event) => update({ sort: event.target.value })}
                    className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <p role="status" aria-live="polite" className="mt-6 text-sm text-muted">
            Showing {results.length} {results.length === 1 ? 'project' : 'projects'}
            {category !== ALL ? ` in ${category}` : ''}
            {query.trim() ? ` matching “${query.trim()}”` : ''}
          </p>

          {results.length > 0 ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((project, index) => (
                <li key={project.slug}>
                  <ProjectCard project={project} index={index} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 rounded-xl border border-dashed border-line bg-surface-alt px-6 py-14 text-center">
              <SearchX className="mx-auto h-10 w-10 text-muted" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold text-ink">No projects match your search</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Try a different keyword or technology, or clear the filters to see every project.
              </p>
              {filtersActive && (
                <Button variant="secondary" className="mt-6" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                  Clear search and filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
