import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

/** Scrolls to the top on route changes, or to the element named by the URL hash (with retries for lazy pages). */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return undefined
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let tries = 0
    let timer

    const attempt = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        target.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' })
      } else if (tries < 30) {
        tries += 1
        timer = setTimeout(attempt, 50)
      }
    }
    attempt()

    return () => clearTimeout(timer)
  }, [pathname, hash])

  return null
}

function PageFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-muted" role="status">
      <span className="inline-flex items-center gap-2 text-sm">
        <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </span>
    </div>
  )
}

export default function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:shadow-lift"
      >
        Skip to main content
      </a>
      <ScrollManager />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
