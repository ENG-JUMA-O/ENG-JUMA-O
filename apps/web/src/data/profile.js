// Central place for personal details. Edit this file (or the .env values it reads) to update the site.
// Anything left blank is hidden from the UI rather than replaced with invented details.
import { safeEmail, safeUrl } from '../utils/url.js'

const env = import.meta.env

export const profile = {
  name: 'ENG Douglas Oroko',
  shortName: 'Douglas Oroko',
  initials: 'DO',
  title: 'Software Developer',
  tagline: 'Designing and building useful, intuitive digital experiences.',

  heroText:
    "I'm a passionate software developer focused on creating modern, intuitive, and scalable digital experiences. I bring together design, frontend engineering, backend development, and cross-platform technologies to transform ideas into useful digital products.",

  bio: "I'm a software developer passionate about building useful digital products and creating intuitive digital experiences. My interests span UI/UX design, frontend and backend development, and cross-platform application development. I value clean code, thoughtful design, continuous learning, and solving real problems through technology.",

  typingPhrases: ['Software Developer', 'Frontend Developer', 'Flutter Developer', 'UI/UX Enthusiast'],

  interests: [
    'UI/UX design',
    'Frontend development',
    'Backend development',
    'Cross-platform application development',
    'Modern web applications',
    'Responsive user interfaces',
  ],

  // Contact + social. Configure via .env (recommended) or paste values here.
  email: safeEmail(env.VITE_CONTACT_EMAIL),
  github: safeUrl(env.VITE_GITHUB_URL),
  linkedin: safeUrl(env.VITE_LINKEDIN_URL),
  buyMeACoffee: safeUrl(env.VITE_BUYMEACOFFEE_URL),

  // Drop the real PDF at public/cv/Douglas-Oroko-CV.pdf — the button appears automatically when the file exists.
  cvPath: '/cv/Douglas-Oroko-CV.pdf',
  cvFileName: 'Douglas-Oroko-CV.pdf',

  // Optional portrait, e.g. '/images/portrait.jpg' (file in public/images). Leave blank to hide it.
  portrait: '',

  siteUrl: (env.VITE_SITE_URL || '').trim().replace(/\/$/, ''),
  ogImage: (env.VITE_OG_IMAGE || '').trim(),
}
