import { ArrowRight } from 'lucide-react'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Reveal from '../components/Reveal.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import Button from '../components/Button.jsx'
import { projects } from '../data/projects.js'

export default function FeaturedProjects() {
  const featured = projects.filter((project) => project.featured)
  const shown = (featured.length > 0 ? featured : projects).slice(0, 6)

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

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project, index) => (
          <li key={project.slug}>
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
    </Section>
  )
}
