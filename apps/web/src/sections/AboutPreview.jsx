import { ArrowRight } from 'lucide-react'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Reveal from '../components/Reveal.jsx'
import FeatureCard from '../components/FeatureCard.jsx'
import Button from '../components/Button.jsx'
import SmartImage from '../components/SmartImage.jsx'
import { aboutFeatures } from '../data/features.js'
import { profile } from '../data/profile.js'

export default function AboutPreview() {
  return (
    <Section id="about" tone="alt" labelledBy="about-title">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal>
          <SectionHeading id="about-title" eyebrow="About me" title="Useful products, thoughtfully built" />
          {profile.portrait && (
            <SmartImage
              src={profile.portrait}
              alt={`Portrait of ${profile.name}`}
              ratio="1 / 1"
              className="mt-6 w-28 rounded-2xl border border-line"
              showPlaceholderLabel={false}
            />
          )}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{profile.bio}</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Hello — I'm Douglas. If you have an idea, a project or an opportunity, I'd be glad to hear about it.
          </p>
          <Button to="/about" variant="secondary" className="mt-8">
            More about me
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2">
          {aboutFeatures.map((feature, index) => (
            <li key={feature.id}>
              <Reveal delay={index * 0.07} className="h-full">
                <FeatureCard feature={feature} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
