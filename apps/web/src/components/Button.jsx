import { Link } from 'react-router-dom'

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 select-none'

const sizes = {
  md: 'h-11 px-5 text-sm',
  sm: 'h-9 px-3.5 text-[13px]',
}

const variants = {
  primary:
    'bg-linear-to-r from-brand to-brand-deep text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/30 active:translate-y-0',
  secondary: 'border border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-brand hover:text-link',
  ghost: 'text-link hover:bg-brand-soft',
  coffee:
    'bg-coffee text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-coffee/30 active:translate-y-0',
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
