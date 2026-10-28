
import { useEffect, useState } from 'react'
import { ArrowRight, AlertCircle, LoaderCircle } from 'lucide-react'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Reveal from '../components/Reveal.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import Button from '../components/Button.jsx'
import { projects as localProjects } from '../data/projects.js'
import { githubService } from '../services/github.service.js'

function toSlug(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function mapGitHubProject(repository) {
  const slug = toSlug(repository.name)

  const curatedProject = localProjects.find(
    (project) =>
      project.slug === slug ||
      project.github?.split('/').filter(Boolean).pop()?.toLowerCase() ===
        repository.name.toLowerCase(),
  )

  return {
    ...curatedProject,
    id: repository.id,
    slug,
    title: curatedProject?.title || repository.name,
    summary:
      curatedProject?.summary ||
      repository.description ||
      `Explore ${repository.name}, a project developed using ${
        repository.language || 'modern development technologies'
      }.`,
    description:
      curatedProject?.description ||
      repository.description ||
      `Explore the source code and implementation of ${repository.name}.`,
    category:
      curatedProject?.category ||
      (repository.language === 'Swift'
        ? 'Mobile Applications'
        : ['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(
              repository.language,
            )
          ? 'Web Development'
          : 'Backend Development'),
    tech: curatedProject?.tech || [
      ...(repository.language ? [repository.language] : []),
      ...(repository.topics || []),
    ],
    date: repository.updatedAt || curatedProject?.date || '',
    updatedAt: repository.updatedAt,
    featured: curatedProject?.featured ?? false,
    image: curatedProject?.image || '',
    imageKind: curatedProject?.imageKind || 'web',
    screenshots: curatedProject?.screenshots || [],
    github: repository.githubUrl || curatedProject?.github || '',
    live: repository.homepage || curatedProject?.live || '',
    stars: repository.stars ?? 0,
    forks: repository.forks ?? 0,
    placeholder: false,
  }
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      try {
        setLoading(true)
        setError('')

        const response = await githubService.getProjects({
          page: 1,
          perPage: 10,
        })

        if (!response?.success || !Array.isArray(response.data)) {
          throw new Error(
            response?.message || 'Unable to retrieve GitHub projects.',
          )
        }

        const mappedProjects = response.data
          .filter((repository) => repository.visibility !== 'private')
          .filter((repository) => repository.name?.toLowerCase() !== 'eng-juma-o')
          .map(mapGitHubProject)

        if (isMounted) {
          setProjects(mappedProjects)
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message ||
              'Could not load projects. Please check your connection and try again.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      isMounted = false
    }
  }, [])

  const featuredProjects = projects.filter((project) => project.featured)
  const shown = (featuredProjects.length > 0 ? featuredProjects : projects).slice(
    0,
    6,
  )

  return (
    <Section id="featured-projects" labelledBy="featured-title">
      <Reveal>
        <SectionHeading
          id="featured-title"
          eyebrow="Selected work"
          title="Featured Projects"
          description="A selection of projects that showcase my approach to building useful digital experiences."
        />
      </Reveal>

      {loading ? (
        <div
          className="mt-12 flex flex-col items-center justify-center gap-3 py-12 text-slate-500"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            className="h-8 w-8 animate-spin text-emerald-600"
            aria-hidden="true"
          />
          <p>Loading projects from GitHub...</p>
        </div>
      ) : error ? (
        <div
          className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
          role="alert"
        >
          <AlertCircle
            className="mx-auto mb-3 h-7 w-7 text-red-600"
            aria-hidden="true"
          />
          <p className="font-medium text-red-800">
            Unable to load projects
          </p>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
          >
            Try Again
          </button>
        </div>
      ) : shown.length > 0 ? (
        <>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((project, index) => (
              <li key={project.id || project.slug}>
                <ProjectCard project={project} index={index} />
              </li>
            ))}
          </ul>

          <div className="mt-12 flex justify-center">
            <Button to="/projects" variant="secondary">
              View All Projects
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-12 rounded-2xl border border-slate-200 p-8 text-center">
          <p className="font-semibold text-slate-800">
            No projects available yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Public GitHub repositories will appear here when available.
          </p>
          <a
            href="https://github.com/ENG-JUMA-O"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex font-semibold text-emerald-700 hover:underline"
          >
            Visit my GitHub profile
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      )}
    </Section>
  )
}
