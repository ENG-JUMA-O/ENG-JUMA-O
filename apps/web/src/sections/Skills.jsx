import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Reveal from '../components/Reveal.jsx'
import SkillCard from '../components/SkillCard.jsx'
import { skills } from '../data/skills.js'

export default function Skills() {
  return (
    <Section id="skills" labelledBy="skills-title">
      <Reveal>
        <SectionHeading
          id="skills-title"
          eyebrow="Technical skills"
          title="Tools and technologies"
          description="The languages, frameworks and tools I work with across mobile, web, backend and collaboration."
        />
      </Reveal>
      <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {skills.map((skill, index) => (
          <li key={skill.id}>
            <Reveal delay={Math.min(index, 7) * 0.04} className="h-full">
              <SkillCard skill={skill} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
