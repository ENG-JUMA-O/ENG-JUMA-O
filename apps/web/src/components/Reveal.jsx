import { motion, useReducedMotion } from 'motion/react'

/** Fades and lifts content into view once. Renders plain markup when reduced motion is preferred. */
export default function Reveal({ children, delay = 0, y = 16, className = '' }) {
  const reduce = useReducedMotion()

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
