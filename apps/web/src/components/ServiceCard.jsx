import { Code, Palette, Server, Smartphone } from 'lucide-react'

const icons = { code: Code, palette: Palette, server: Server, smartphone: Smartphone }

export default function ServiceCard({ service }) {
  const Icon = icons[service.icon] || Code
  return (
    <article className="group h-full rounded-2xl border border-line bg-surface shadow-soft p-6 transition duration-200 hover:-translate-y-1 hover:border-brand-bright/50 hover:shadow-card">
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-leaf-soft text-brand-deep transition-colors duration-200 group-hover:bg-brand group-hover:text-white">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-ink">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
    </article>
  )
}
