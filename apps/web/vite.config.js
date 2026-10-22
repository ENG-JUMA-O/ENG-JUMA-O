import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Tailwind CSS v4 is configured CSS-first (see src/index.css); there is no tailwind.config.js.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Set VITE_BASE_PATH=/your-repo/ when deploying to GitHub Pages project sites.
  const base = env.VITE_BASE_PATH || '/'

  return {
    base,
    plugins: [react(), tailwindcss()],
  }
})
