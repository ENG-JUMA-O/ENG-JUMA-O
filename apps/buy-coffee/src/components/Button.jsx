import { Link } from 'react-router-dom'

const base = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50'
const variants = {
  primary: 'bg-ink text-white hover:-translate-y-0.5 hover:bg-coffee-dark hover:shadow-lg',
  coffee: 'bg-coffee text-ink hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg',
  secondary: 'border border-ink/15 bg-white/70 text-ink hover:border-ink/30 hover:bg-white',
  ghost: 'text-ink hover:bg-black/5',
}

export default function Button({ to, href, variant = 'primary', className = '', external = false, children, ...props }) {
  const classes = `${base} ${variants[variant] || variants.primary} ${className}`
  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>
  if (href) return <a href={href} className={classes} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} {...props}>{children}</a>
  return <button className={classes} {...props}>{children}</button>
}