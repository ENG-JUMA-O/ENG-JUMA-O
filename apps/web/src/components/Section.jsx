/** Consistent page section: spacing, max width and alternating background tone. */
export default function Section({ id, tone = 'plain', labelledBy, className = '', children }) {
  const background = tone === 'alt' ? 'bg-surface-alt' : 'bg-surface'
  return (
    <section id={id} aria-labelledby={labelledBy} className={`scroll-mt-20 py-16 sm:py-20 lg:py-24 ${background} ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  )
}
