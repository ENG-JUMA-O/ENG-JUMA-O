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
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Tag id={id} className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </Tag>
      {description && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
    </div>
  )
}
