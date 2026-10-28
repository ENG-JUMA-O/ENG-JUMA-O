import { Link } from 'react-router-dom'

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 select-none disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60'

const sizes = {
  md: 'h-12 px-6 text-sm sm:h-11 sm:px-5',
  sm: 'h-10 px-4 text-[13px] sm:h-9 sm:px-3.5',
}

const variants = {
  primary:
    'bg-brand text-white shadow-soft hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-card active:translate-y-0 active:bg-brand-deep',
  secondary:
    'border border-brand bg-surface text-link hover:-translate-y-0.5 hover:bg-brand-soft active:translate-y-0',
  info: 'border border-accent/60 bg-accent-soft text-accent-strong hover:-translate-y-0.5 hover:border-accent active:translate-y-0',
  ghost: 'text-link hover:bg-brand-soft',
  coffee:
    'bg-coffee text-white shadow-soft hover:-translate-y-0.5 hover:shadow-card active:translate-y-0',
}

/**
 * One button for everything: renders a router <Link> (`to`), an <a> (`href`) or a <button>.
 * `external` adds target/rel safely and announces the new tab to screen readers.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  external = false,
  download,
  className = '',
  children,
  ...rest
}) {
  const classes = [base, sizes[size], variants[variant], className].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  if (href) {
    const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
    return (
      <a href={href} className={classes} download={download} {...externalProps} {...rest}>
        {children}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
