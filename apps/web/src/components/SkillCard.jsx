import TechIcon from './TechIcon.jsx'

export default function SkillCard({ skill }) {
  return (
    <div className="group flex h-full flex-col items-center rounded-2xl border border-line bg-surface shadow-soft p-5 text-center transition duration-200 hover:-translate-y-1 hover:border-brand-bright/50 hover:shadow-card">
      <span className="grid h-14 w-14 place-items-center rounded-xl bg-surface-alt transition-colors group-hover:bg-leaf-soft">
        <TechIcon name={skill.icon} className="h-8 w-8 transition-transform duration-200 group-hover:scale-110" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">{skill.name}</h3>
      <p className="mt-1 text-xs text-muted">{skill.category}</p>
    </div>
  )
}
