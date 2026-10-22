import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Coffee, Download } from 'lucide-react'
import Button from '../components/Button.jsx'
import TypingEffect from '../components/TypingEffect.jsx'
import TechIcon from '../components/TechIcon.jsx'
import SmartImage from '../components/SmartImage.jsx'
import { GithubIcon } from '../components/BrandIcons.jsx'
import { useCvAvailable } from '../hooks/useCvAvailable.js'
import { profile } from '../data/profile.js'
import { assetUrl } from '../utils/url.js'

function FloatingIcon({ name, className, delay = '0s' }) {
  return (
    <div
      className={`absolute grid h-12 w-12 animate-float place-items-center rounded-xl border border-line bg-surface shadow-md shadow-brand/10 ${className}`}
      style={{ animationDelay: delay }}
    >
      <TechIcon name={name} className="h-6 w-6" />
    </div>
  )
}

/** Decorative only: a static code-style card. It does not run code and is hidden from assistive tech. */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md pb-10 lg:max-w-none" aria-hidden="true">
      <div className="absolute -inset-4 rounded-[2rem] bg-linear-to-br from-brand/20 via-accent/10 to-transparent blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-xl shadow-brand/10">
        <div className="flex items-center gap-2 border-b border-line bg-surface-alt px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-danger/70" />
          <span className="h-3 w-3 rounded-full bg-coffee/70" />
          <span className="h-3 w-3 rounded-full bg-success/70" />
          <span className="ml-3 font-mono text-xs text-muted">profile.js</span>
        </div>
        <pre className="overflow-hidden p-5 font-mono text-[13px] leading-7 text-ink">
          <code>
            <span className="text-link">const</span> developer = {'{'}
            {'\n'}
            {'  '}name: <span className="text-success">"Douglas Oroko"</span>,{'\n'}
            {'  '}role: <span className="text-success">"Software Developer"</span>,{'\n'}
            {'  '}focus: [{'\n'}
            {'    '}
            <span className="text-success">"UI/UX"</span>,{'\n'}
            {'    '}
            <span className="text-success">"Frontend"</span>,{'\n'}
            {'    '}
            <span className="text-success">"Backend"</span>,{'\n'}
            {'    '}
            <span className="text-success">"Cross-platform"</span>,{'\n'}
            {'  '}],{'\n'}
            {'}'};
          </code>
        </pre>
      </div>

      {profile.portrait && (
        <div className="absolute -bottom-2 left-4 w-24 overflow-hidden rounded-2xl border-4 border-surface shadow-lg sm:w-28">
          <SmartImage src={profile.portrait} alt="" ratio="1 / 1" loading="eager" showPlaceholderLabel={false} />
        </div>
      )}

      <FloatingIcon name="react" className="-top-4 right-2 sm:-right-4" />
      <FloatingIcon name="flutter" className="left-1 top-1/2 sm:-left-5" delay="1.2s" />
      <FloatingIcon name="nodejs" className="-bottom-1 right-6 sm:right-10" delay="2.4s" />

      <div className="absolute -bottom-2 right-24 hidden w-36 rounded-xl border border-line bg-surface p-3 shadow-lg sm:block lg:right-32">
        <div className="h-2 w-16 rounded-full bg-brand" />
        <div className="mt-2 h-1.5 w-full rounded-full bg-line" />
        <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-line" />
        <div className="mt-3 h-6 w-full rounded-md bg-brand-soft" />
      </div>
    </div>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const cvAvailable = useCvAvailable()

  const enter = (order) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay: 0.08 * order, ease: 'easeOut' },
        }

  const quietLink =
    'inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-link'

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-surface">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-28">
        <div>
          <motion.p {...enter(0)} className="eyebrow">
            HELLO, I'M ENG DOUGLAS OROKO
          </motion.p>

          <motion.h1
            id="hero-title"
            {...enter(1)}
            className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Building Digital Experiences That{' '}
            <span className="bg-linear-to-r from-brand to-accent-strong bg-clip-text text-transparent">
              Make a Difference.
            </span>
          </motion.h1>

          <motion.p
            {...enter(2)}
            className="mt-5 flex h-8 items-center whitespace-nowrap font-display text-lg font-semibold text-link sm:text-xl"
          >
            <TypingEffect phrases={profile.typingPhrases} />
          </motion.p>

          <motion.p {...enter(3)} className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {profile.heroText}
          </motion.p>

          <motion.div {...enter(4)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/projects">
              Explore My Projects
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button to="/contact" variant="secondary">
              Let's Connect
            </Button>
          </motion.div>

          {(profile.github || cvAvailable || profile.buyMeACoffee) && (
            <motion.ul {...enter(5)} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {profile.github && (
                <li>
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className={quietLink}>
                    <GithubIcon className="h-4 w-4" />
                    GitHub
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
              {cvAvailable && (
                <li>
                  <a href={assetUrl(profile.cvPath)} download={profile.cvFileName} className={quietLink}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download CV
                  </a>
                </li>
              )}
              {profile.buyMeACoffee && (
                <li>
                  <a href={profile.buyMeACoffee} target="_blank" rel="noopener noreferrer" className={quietLink}>
                    <Coffee className="h-4 w-4" aria-hidden="true" />
                    Buy Me a Coffee
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
            </motion.ul>
          )}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.2, ease: 'easeOut' }}
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  )
}
