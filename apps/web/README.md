# ENG Douglas Oroko — Portfolio

A multi-page developer portfolio built with **Vite, React (JavaScript/JSX), Tailwind CSS v4.3**, React Router, Motion and Lucide icons.

Pages: Home · About (with Education) · Projects · Project details · Gallery (with lightbox) · Contact · 404.

Everything personal lives in data files and `.env`, so the site can be updated without touching page code.

---

## 1. Prerequisites

- Node.js **20.19 or newer** (22 LTS recommended) and npm
- Git (for GitHub deployment)

## 2. Install

```bash
npm install
```

`package.json` already lists the dependencies. If you prefer to install them one by one (this also pins exact versions in `package.json`):

```bash
npm install tailwindcss@4.3.3 @tailwindcss/vite@4.3.3
npm install react react-dom react-router-dom lucide-react motion
npm install -D vite @vitejs/plugin-react
```

> If `4.3.3` is not published yet, use the newest `4.3.x` (`npm view tailwindcss versions`). Tailwind is configured CSS-first (`@import "tailwindcss"` and `@theme` in `src/index.css`); there is no `tailwind.config.js`.

Verify the versions that were actually installed:

```bash
npm ls tailwindcss @tailwindcss/vite vite react
```

## 3. Run

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload (http://localhost:5173) |
| `npm run build` | Production build into `dist/` (also regenerates `sitemap.xml` and `robots.txt`) |
| `npm run preview` | Serves the production build locally |

## 4. Configure the site (`.env`)

Copy the example file and fill in what you have. Anything left blank is simply hidden — nothing is invented.

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Production URL (canonical links, social cards, sitemap) |
| `VITE_BASE_PATH` | `/` by default; `/repo-name/` for a GitHub Pages project site |
| `VITE_CONTACT_EMAIL` | Shown on Contact/footer; powers the `mailto:` fallback |
| `VITE_GITHUB_URL`, `VITE_LINKEDIN_URL` | Social links (hero, contact, footer) |
| `VITE_BUYMEACOFFEE_URL` | Enables the Buy Me a Coffee section and links |
| `VITE_EMAILJS_*` | Contact form delivery (see below) |
| `VITE_OG_IMAGE` | Social-sharing image path, e.g. `/images/og-image.png` |

Only **public** values belong here — everything prefixed `VITE_` is included in the browser bundle. `.env` is git-ignored; never commit credentials.

## 5. Update personal details

Edit `src/data/profile.js` (name, bio, typing phrases, interests, CV path, portrait path). Links come from `.env`, but you can also paste them into this file.

| What | Where |
| --- | --- |
| Skills (and their icons) | `src/data/skills.js`, `src/components/TechIcon.jsx` |
| Services | `src/data/services.js` |
| About value cards, process steps | `src/data/features.js` |
| Education (add `period` / `details` when you have real ones) | `src/data/education.js` |
| Navigation links | `src/data/navigation.js` |

The skill icons are simplified inline marks. To use an official logo, replace that entry's shapes in `TechIcon.jsx` with the logo's SVG.

## 6. Add a project

1. Put images in `public/projects/<project-name>/` (e.g. `cover.png`, `screen-1.png`).
2. Add an entry to `src/data/projects.js`. The field reference is documented at the top of that file.

```js
{
  slug: 'my-app',
  title: 'My App',
  summary: 'One or two sentences about what it does.',
  category: 'Web Development', // Web Development | Mobile Applications | UI/UX Design | Backend Development
  tech: ['React', 'Node.js'],
  featured: true,            // shows on the homepage
  image: '/projects/my-app/cover.png',
  screenshots: [{ src: '/projects/my-app/screen-1.png', alt: 'Dashboard screen', caption: 'The dashboard' }],
  github: 'https://github.com/you/my-app', // real URLs only
  live: '',
  problem: '…', goals: ['…'], audience: '…', features: ['…'], process: ['…'],
  challenges: [{ challenge: '…', solution: '…' }],
  date: '2025-03', // optional; only add real dates
}
```

The detail page at `/projects/my-app` is created automatically, and sections you leave out simply don't appear. Delete the four sample placeholder projects once you have real ones. Filters only show categories that have projects.

## 7. Add gallery images

Put images in `public/gallery/` and add entries to `src/data/gallery.js` (fields are documented at the top of the file). Set `aspect` (`landscape`, `portrait`, `square`, `wide`) so space is reserved and the page doesn't jump while images load. Delete the sample placeholders when you add real work.

## 8. Add your CV

Save the PDF as **`public/cv/Douglas-Oroko-CV.pdf`**. The "Download CV" buttons (hero and About) appear automatically when that file exists; to replace the CV, overwrite the file. To use a different filename, change `cvPath` and `cvFileName` in `src/data/profile.js`.

## 9. Buy Me a Coffee

Create a profile at buymeacoffee.com, then set `VITE_BUYMEACOFFEE_URL=https://buymeacoffee.com/<your-username>` in `.env`. The homepage section, hero link, contact card and footer link all appear. Without it, the section is hidden in production (and shows a setup note in development). No payments are processed on this site — visitors are sent to your Buy Me a Coffee page in a new tab.

## 10. Contact form (EmailJS)

1. Create a free account at emailjs.com and connect an email service.
2. Create a template that uses these variables: `{{from_name}}`, `{{from_email}}`, `{{reply_to}}`, `{{subject}}`, `{{message}}`.
3. Put the Service ID, Template ID and **Public Key** in `.env` (`VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`).
4. In the EmailJS dashboard, restrict the key to your domain and set sending limits.

The form validates input, blocks double submits, and shows success **only** when EmailJS confirms the send. If it fails, the visitor's text is kept. If EmailJS isn't configured, the form says so plainly and offers a `mailto:` link (when `VITE_CONTACT_EMAIL` is set). Never put private keys or secrets in this project; if you need stronger spam protection, use a serverless endpoint instead.

## 11. Deploy

`dist/` is a static site; all routes need to fall back to `index.html`. This repo includes that config already:

- **Vercel** – import the repo; `vercel.json` handles rewrites. Build command `npm run build`, output `dist`.
- **Netlify** – `public/_redirects` handles rewrites. Build command `npm run build`, publish directory `dist`.
- **GitHub Pages** – set `VITE_BASE_PATH=/<repo-name>/` and `VITE_SITE_URL=https://<user>.github.io/<repo-name>` before building. The build copies `index.html` to `404.html` so direct links to `/projects` etc. work. Publish the contents of `dist/` (e.g. with a GitHub Actions Pages workflow).

Set the same `VITE_*` variables in your host's environment settings, since `.env` is not committed.

## 12. Connect to GitHub

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `dist` and every `.env` file except `.env.example`.

## Project structure

```
public/            static files: favicon, robots.txt, sitemap.xml, cv/, images/, projects/, gallery/
scripts/           sitemap generator (prebuild) and 404.html copy (postbuild)
src/
  components/      reusable UI (Navbar, ProjectCard, ImageLightbox, ContactForm, …)
  sections/        homepage sections (Hero, Skills, Services, CoffeeSupport, …)
  pages/           route components
  layouts/         MainLayout (nav, footer, scroll handling, skip link)
  data/            all editable content
  hooks/           useTheme, useSeo, useCvAvailable
  utils/           validation, URL safety, email delivery
  index.css        Tailwind v4 CSS-first config and design tokens
```

## Notes

- Light theme is the default; dark mode is optional and remembered after a visitor chooses it.
- The sitemap and `robots.txt` are regenerated on build from `VITE_SITE_URL` and the project slugs. Until it is set they use a placeholder domain.
- Page titles and social tags are set in the browser. For link previews that work on every platform, supply a 1200×630 `public/images/og-image.png` and set `VITE_OG_IMAGE`; some crawlers don't run JavaScript, so consider pre-rendering later if that matters.
