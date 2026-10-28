import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Button from './Button.jsx'

/** Slide-down menu for screens below the `lg` breakpoint. Rendered inside the primary <nav>. */
export default function MobileMenu({ open, links, activeTo, onNavigate }) {
  const reduce = useReducedMotion()
  const duration = reduce ? 0 : 0.25

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id="mobile-menu"
          key="mobile-menu"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration, ease: 'easeOut' }}
          className="overflow-hidden border-t border-line bg-surface shadow-card lg:hidden"
        >
          <div className="container-page max-h-[calc(100dvh-4rem)] overscroll-contain overflow-y-auto py-4">
            <ul className="flex flex-col gap-1">
              {links.map((link) => {
                const active = link.to === activeTo
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`flex h-12 items-center rounded-lg px-3 text-base font-medium transition-colors ${
                        active ? 'bg-brand-soft font-semibold text-link' : 'text-ink hover:bg-surface-alt'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <Button to="/contact" onClick={onNavigate} className="mt-4 w-full">
              Let's Talk
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
