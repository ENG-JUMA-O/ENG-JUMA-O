import { useState } from 'react'
import { Code2, Github } from 'lucide-react'
import CoffeeSupport from '../components/CoffeeSupport.jsx'
import { site } from '../data/site.js'

export default function Support() {
  const [imageFailed, setImageFailed] = useState(false)

  const profileImage =
    import.meta.env.VITE_CREATOR_IMAGE || 'https://github.com/ENG-JUMA-O.png'

  const initials =
    site.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'YO'

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-4 py-6 text-slate-800 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-emerald-900/10">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="bg-gradient-to-br from-emerald-800 to-green-600 p-6 text-white sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-100">
              <Code2 size={16} />
              Developer
            </div>

            <div className="mt-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/80 bg-lime-100 sm:h-28 sm:w-28">
              {!imageFailed && profileImage ? (
                <img
                  src={profileImage}
                  alt={site.name}
                  width="112"
                  height="112"
                  decoding="async"
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <span className="text-3xl font-black text-emerald-800">
                  {initials}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-2xl font-black sm:text-3xl">
              {site.name}
            </h1>

            <p className="mt-1 text-sm font-semibold text-lime-200">
              {site.handle}
            </p>

            <p className="mt-4 text-sm leading-6 text-emerald-50">
              {site.bio}
            </p>

            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-200"
            >
              <Github size={18} />
              View GitHub
            </a>
          </aside>

          <div className="min-w-0 p-5 sm:p-8 lg:p-10">
            <h2 className="mb-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              <span className="mr-2" aria-hidden="true">☕</span>
              Buy me a coffee
            </h2>

            <p className="mb-6 text-sm text-slate-500">
              Choose an amount and pay securely with M-Pesa.
            </p>

            <CoffeeSupport />
          </div>
        </div>
      </section>
    </main>
  )
}