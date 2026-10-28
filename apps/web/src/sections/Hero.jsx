
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Coffee, Download } from 'lucide-react'
import Button from '../components/Button.jsx'
import TypingEffect from '../components/TypingEffect.jsx'
import TechIcon from '../components/TechIcon.jsx'
import { GithubIcon } from '../components/BrandIcons.jsx'
import { useCvAvailable } from '../hooks/useCvAvailable.js'
import { profile } from '../data/profile.js'
import { assetUrl } from '../utils/url.js'

const PROFILE_IMAGE = 'https://github.com/ENG-JUMA-O.png'
const HERO_BACKGROUND = '/images/hero-ink-background.png'

function FloatingIcon({ name, className = '', delay = '0s' }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`absolute z-30 grid h-14 w-14 place-items-center rounded-2xl border border-emerald-200/80 bg-white/95 shadow-xl shadow-emerald-950/10 backdrop-blur-md sm:h-16 sm:w-16 ${className}`}
      animate={
        reduceMotion
          ? undefined
          : { y: [0, -8, 0], rotate: [-3, 3, -3] }
      }
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: Number.parseFloat(delay) || 0,
      }}
    >
      <TechIcon name={name} className="h-8 w-8 sm:h-9 sm:w-9" />
    </motion.div>
  )
}

function HeroVisual() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="relative mx-auto w-full max-w-[660px] pb-14"
      aria-label="Portrait surrounded by a black ink splash"
    >
      {/* Keep the original background aspect ratio to preserve alignment. */}
      <div className="relative aspect-[1312/1199] w-full">
        {/* Portrait: no square frame, border, or background card. */}
        <motion.div
          className="absolute left-[52%] top-[27%] z-10 h-[54%] w-[38%] overflow-hidden rounded-[48%_48%_43%_43%]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: 'easeOut',
          }}
        >
          <img
            src={PROFILE_IMAGE}
            alt="Eng. Douglas Oroko"
            className="h-full w-full object-cover object-top"
            loading="eager"
            fetchPriority="high"
            draggable="false"
          />
        </motion.div>

        {/* The transparent opening reveals the portrait underneath. */}
        <motion.img
          src={assetUrl(HERO_BACKGROUND)}
          alt=""
          aria-hidden="true"
          draggable="false"
          className="pointer-events-none absolute inset-0 z-20 h-full w-full select-none object-contain"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: 'easeOut',
          }}
        />

        {/* Floating technology icons */}
        <FloatingIcon
          name="react"
          className="right-[5%] top-[17%]"
        />

        <FloatingIcon
          name="flutter"
          className="left-[3%] top-[43%]"
          delay="1.2s"
        />

        <FloatingIcon
          name="nodejs"
          className="right-[4%] top-[68%]"
          delay="2.4s"
        />
      </div>

      {/* Developer nameplate */}
      <motion.div
        className="absolute bottom-0 left-[52%] z-40 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-2xl border border-emerald-200/80 bg-white/95 px-4 py-3 shadow-xl shadow-emerald-950/10 backdrop-blur-xl sm:px-5"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.6,
          delay: reduceMotion ? 0 : 0.3,
        }}
      >
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>

        <div>
          <p className="text-sm font-bold text-slate-950">
            Eng. Douglas Oroko
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Software Developer
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const cvAvailable = useCvAvailable()

  const enter = (order) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduce ? 0 : 0.55,
      delay: reduce ? 0 : 0.08 * order,
      ease: 'easeOut',
    },
  })

  const quietLink =
    'inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-600'

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-[#f8fbfa] text-slate-950"
    >
      {/* Soft background lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-emerald-300/30 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-20 -z-10 h-96 w-96 rounded-full bg-cyan-300/25 blur-[100px]"
      />

      {/* Subtle technical grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(16,185,129,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.045)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <div className="container-page relative grid items-center gap-8 py-9 sm:py-14 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[1fr_1.05fr] lg:gap-2 lg:py-14">
        {/* Left column: introduction and actions */}
        <div className="relative z-10 order-2 min-w-0 lg:order-1">
          <motion.p
            {...enter(0)}
            className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 sm:text-sm sm:tracking-[0.2em]"
          >
            <span className="h-[3px] w-10 shrink-0 rounded-full bg-emerald-500" />
            Hello, I'm Eng Douglas Oroko
          </motion.p>

          <motion.h1
            id="hero-title"
            {...enter(1)}
            className="mt-4 max-w-1xl text-1xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-3xl lg:text-2xl xl:text-[4rem]"
          >
            Building Digital Experiences That{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              Make a Difference.
            </span>
          </motion.h1>

          <motion.div
            {...enter(2)}
            className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-slate-600 sm:text-base"
          >
            <span className="font-mono font-bold text-emerald-500">
              {'</>'}
            </span>
            <span>Full Stack Developer</span>
            <span className="text-slate-300">|</span>
            <span>Mobile Apps</span>
            <span className="text-slate-300">|</span>
            <span>Web Apps</span>
          </motion.div>

          <motion.div
            {...enter(3)}
            className="mt-3 min-h-7 text-base font-semibold text-emerald-600 sm:text-lg"
          >
            <TypingEffect phrases={profile.typingPhrases} />
          </motion.div>

          <motion.p
            {...enter(4)}
            className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8"
          >
            {profile.heroText ||
              'I build modern, scalable and user-friendly applications that solve real problems and create value for people and businesses.'}
          </motion.p>

          <motion.div
            {...enter(5)}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Button to="/projects">
              Explore My Projects
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button to="/contact" variant="secondary">
              Let's Connect
            </Button>
          </motion.div>

          {(profile.github || cvAvailable || profile.buyMeACoffee) && (
            <motion.ul
              {...enter(6)}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-6"
            >
              {profile.github && (
                <li>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={quietLink}
                  >
                    <GithubIcon />
                    GitHub
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              )}

              {cvAvailable && (
                <li>
                  <a
                    href={assetUrl(profile.cvPath)}
                    download={profile.cvFileName}
                    className={quietLink}
                  >
                    <Download className="h-5 w-5" aria-hidden="true" />
                    Download CV
                  </a>
                </li>
              )}

              {profile.buyMeACoffee && (
                <li>
                  <a
                    href={profile.buyMeACoffee}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={quietLink}
                  >
                    <Coffee className="h-5 w-5" aria-hidden="true" />
                    Buy Me a Coffee
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              )}
            </motion.ul>
          )}
        </div>

        {/* Right column: portrait aligned to the ink opening */}
        <motion.div
          className="order-1 min-w-0 lg:order-2"
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduce ? 0 : 0.7,
            delay: reduce ? 0 : 0.15,
            ease: 'easeOut',
          }}
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  )
}
