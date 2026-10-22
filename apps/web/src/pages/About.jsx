import { Download } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Reveal from '../components/Reveal.jsx'
import FeatureCard from '../components/FeatureCard.jsx'
import Button from '../components/Button.jsx'
import SmartImage from '../components/SmartImage.jsx'
import Education from '../sections/Education.jsx'
import ContactCta from '../sections/ContactCta.jsx'
import { aboutFeatures } from '../data/features.js'
import { profile } from '../data/profile.js'
import { useCvAvailable } from '../hooks/useCvAvailable.js'
import { useSeo } from '../hooks/useSeo.js'
import { assetUrl } from '../utils/url.js'

export default function About() {
  useSeo({
    title: 'About',
    description:
      'Learn about ENG Douglas Oroko — a software developer interested in UI/UX design, frontend and backend development, and cross-platform applications.',
    path: '/about',
  })
  const cvAvailable = useCvAvailable()

  return (
    <>
      <PageHeader
        eyebrow="About me"
        title="Software developer, designer at heart"
        description="Building useful digital products with clean code and thoughtful design."
      />

      <Section tone="plain" labelledBy="story-title">
        <div className="grid items-start gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <Reveal>
            <h2 id="story-title" className="text-3xl font-bold tracking-tight text-ink">
              Hello, I'm Douglas
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{profile.bio}</p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              I enjoy the point where design and engineering meet: shaping how something looks and feels, then building
              the logic that makes it work — on the web and on mobile.
            </p>
            {cvAvailable && (
              <Button href={assetUrl(profile.cvPath)} download={profile.cvFileName} variant="secondary" className="mt-8">
                <Download className="h-4 w-4" aria-hidden="true" />
                Download CV
              </Button>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            {profile.portrait && (
              <SmartImage
                src={profile.portrait}
                alt={`Portrait of ${profile.name}`}
                ratio="4 / 5"
                className="mb-6 rounded-2xl border border-line"
                showPlaceholderLabel={false}
              />
            )}
            <div className="rounded-xl border border-line bg-surface-alt p-6">
              <h3 className="text-lg font-semibold text-ink">Areas of interest</h3>
              <ul className="mt-4 space-y-2.5">
                {profile.interests.map((interest) => (
                  <li key={interest} className="flex items-center gap-3 text-sm text-muted">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="alt" labelledBy="values-title">
        <Reveal>
          <SectionHeading id="values-title" eyebrow="What I value" title="Principles I build by" />
        </Reveal>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {aboutFeatures.map((feature, index) => (
            <li key={feature.id}>
              <Reveal delay={index * 0.07} className="h-full">
                <FeatureCard feature={feature} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Education variant="full" />
      <ContactCta />
    </>
  )
}
