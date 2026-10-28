import { BookOpen, Braces, MonitorSmartphone, Users } from 'lucide-react'

const icons = { users: Users, braces: Braces, responsive: MonitorSmartphone, book: BookOpen }

export default function FeatureCard({ feature }) {
  const Icon = icons[feature.icon] || Users
  return (
    <article className="h-full rounded-2xl border border-line bg-surface p-5 shadow-soft transition duration-200 hover:border-brand-bright/50">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent-strong">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">{feature.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{feature.description}</p>
    </article>
  )
}
