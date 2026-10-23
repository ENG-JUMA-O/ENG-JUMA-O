
import { useState } from 'react'
import { Code2, Github, Heart, Sparkles } from 'lucide-react'
import CoffeeSupport from '../components/CoffeeSupport.jsx'
import { site } from '../data/site.js'

export default function Support() {
  const [imageFailed, setImageFailed] = useState(false)

  const profileImage =
    import.meta.env.VITE_CREATOR_IMAGE ||
    'https://github.com/ENG-JUMA-O.png'

  const initials =
    site.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'YO'

  return (
    <main className="support-page min-h-screen bg-[#f7fbf7] px-4 py-6 text-slate-800 sm:px-6 sm:py-8">
      <header className="support-enter mx-auto mb-6 max-w-5xl text-center sm:mb-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
          Enjoying what I build?
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          Support my work with a coffee via M-Pesa.
        </p>
      </header>

      <div className="support-container support-enter mx-auto grid w-full max-w-5xl items-center gap-5 rounded-3xl border border-emerald-50 bg-white/70 p-3 shadow-[0_20px_60px_-35px_rgba(16,90,58,0.25)] sm:gap-6 sm:p-5 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8 lg:p-6">
        <section className="profile-panel min-w-0 p-2 sm:p-3" aria-label="Creator profile">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Sparkles size={15} />
            Passionate developer
          </div>

          <div className="profile-photo-wrap mx-auto mt-5 grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-emerald-50 bg-gradient-to-br from-emerald-100 to-lime-100 shadow-md sm:mx-0 sm:h-32 sm:w-32">
            {!imageFailed && profileImage ? (
              <img
                src={profileImage}
                alt={`${site.name} profile`}
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-black text-emerald-800">
                {initials}
              </span>
            )}
          </div>

          <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900 sm:text-left">
            {site.name}
          </h2>
          <p className="mt-1 text-center text-sm font-medium text-emerald-700 sm:text-left">
            {site.handle}
          </p>
          <p className="mt-3 text-center text-sm leading-6 text-slate-600 sm:text-left">
            {site.bio}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              <Code2 size={14} />
              Building useful applications
            </span>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <Github size={14} />
              GitHub
            </a>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-500 sm:justify-start sm:text-left">
              <Heart size={14} className="shrink-0 text-emerald-600" />
              Every coffee helps me keep building.
            </p>
          </div>
        </section>

        <section className="support-form-panel min-w-0" aria-label="Support payment form">
          <CoffeeSupport />
        </section>
      </div>

      <p className="support-enter mx-auto mt-5 max-w-5xl text-center text-[11px] text-slate-400">
        Made with care · Payments are confirmed only after server-side M-Pesa verification
      </p>
    </main>
  )
}
