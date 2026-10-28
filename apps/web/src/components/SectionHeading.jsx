export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Tag = 'h2',
  id,
  className = '',
}) {
  const centered = align === 'center'
  return (
    <div className={`max-w-2xl ${centered ? 'mx-auto text-center' : ''} ${className}`}>
      {eyebrow && <p className="eyebrow mb-3 inline-flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-6 rounded-full bg-leaf" />{eyebrow}</p>}
      <Tag id={id} className="text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl lg:text-4xl">
        {title}
      </Tag>
      {description && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
    </div>
  )
}
