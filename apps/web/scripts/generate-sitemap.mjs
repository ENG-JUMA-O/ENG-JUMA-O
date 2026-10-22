// Generates public/sitemap.xml and public/robots.txt before every build.
// Uses VITE_SITE_URL (from the environment or .env). Falls back to a clearly fake placeholder domain.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function readDotEnv() {
  const file = resolve(root, '.env')
  if (!existsSync(file)) return {}
  const out = {}
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match) out[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
  return out
}

const env = { ...readDotEnv(), ...process.env }
const placeholder = 'https://your-domain.example'
const siteUrl = (env.VITE_SITE_URL || '').trim().replace(/\/$/, '')

if (!siteUrl) {
  console.warn(
    '[sitemap] VITE_SITE_URL is not set — using the placeholder domain. Set it before deploying.',
  )
}
const base = siteUrl || placeholder

const { projects } = await import(pathToFileURL(resolve(root, 'src/data/projects.js')).href)

const paths = ['/', '/about', '/projects', '/gallery', '/contact', ...projects.map((p) => `/projects/${p.slug}`)]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${base}${p === '/' ? '/' : p}</loc></url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`

writeFileSync(resolve(root, 'public/sitemap.xml'), xml)
writeFileSync(resolve(root, 'public/robots.txt'), robots)
console.log(`[sitemap] Wrote ${paths.length} URLs for ${base}`)
