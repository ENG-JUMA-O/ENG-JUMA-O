import Hero from '../sections/Hero.jsx'
import AboutPreview from '../sections/AboutPreview.jsx'
import Skills from '../sections/Skills.jsx'
import Services from '../sections/Services.jsx'
import FeaturedProjects from '../sections/FeaturedProjects.jsx'
import Process from '../sections/Process.jsx'
import Education from '../sections/Education.jsx'
import CoffeeSupport from '../sections/CoffeeSupport.jsx'
import ContactCta from '../sections/ContactCta.jsx'
import { useSeo } from '../hooks/useSeo.js'
import { profile } from '../data/profile.js'

export default function Home() {
  useSeo({ description: profile.heroText, path: '/' })

  return (
    <>
      <Hero />
      <AboutPreview />
      <Skills />
      <Services />
      <FeaturedProjects />
      <Process />
      <Education variant="preview" />
      <CoffeeSupport />
      <ContactCta />
    </>
  )
}
