import { motion, useReducedMotion } from 'motion/react'

/** Visual header used at the top of inner pages (Projects, Gallery, About, Contact). */
export default function PageHeader({ eyebrow, title, description, children }) {
  const reduce = useReducedMotion()
  const motionProps = reduce
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: 'easeOut' } }

  return (
    <header className="relative overflow-hidden border-b border-line bg-page">
      <div aria-hidden="true" className="bg-wash pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
      />
      <motion.div {...motionProps} className="container-page relative py-12 sm:py-16 lg:py-20">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-brand-deep sm:text-4xl lg:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </motion.div>
    </header>
  )
}
