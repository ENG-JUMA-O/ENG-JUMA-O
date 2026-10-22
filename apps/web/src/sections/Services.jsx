import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Reveal from '../components/Reveal.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import { services } from '../data/services.js'

export default function Services() {
  return (
    <Section id="services" tone="alt" labelledBy="services-title">
      <Reveal>
        <SectionHeading
          id="services-title"
          eyebrow="What I do"
          title="Areas of focus"
          description="Where design and engineering meet — from the first interface sketch to the logic behind it."
        />
      </Reveal>
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, index) => (
          <li key={service.id}>
            <Reveal delay={index * 0.07} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
