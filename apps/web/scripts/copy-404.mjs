// GitHub Pages has no rewrite rules, but it serves 404.html for unknown paths.
// Copying index.html to 404.html lets the React router handle direct visits to /projects, /gallery, etc.
// It is harmless on Vercel and Netlify.
import { copyFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const index = resolve(dist, 'index.html')

if (existsSync(index)) {
  copyFileSync(index, resolve(dist, '404.html'))
  console.log('[postbuild] Copied dist/index.html to dist/404.html')
}
