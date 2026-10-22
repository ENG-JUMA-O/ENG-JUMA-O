import { useEffect, useState } from 'react'
import PlaceholderArt from './PlaceholderArt.jsx'
import { assetUrl } from '../utils/url.js'

/**
 * Image with a reserved aspect ratio (no layout shift). Falls back to clearly-labelled placeholder
 * art when no source is supplied or the file fails to load.
 */
export default function SmartImage({
  src,
  alt,
  kind = 'web',
  ratio = '16 / 10',
  className = '',
  imgClassName = '',
  loading = 'lazy',
  showPlaceholderLabel = true,
}) {
  const [failed, setFailed] = useState(false)
  const resolved = assetUrl(src)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const showImage = resolved && !failed

  return (
    <div className={`relative overflow-hidden bg-brand-soft ${className}`} style={{ aspectRatio: ratio }}>
      {showImage ? (
        <img
          src={resolved}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <>
          <PlaceholderArt kind={kind} alt={`Placeholder illustration: ${alt}`} />
          {showPlaceholderLabel && (
            <span className="absolute bottom-2.5 left-2.5 rounded-md border border-line bg-surface/90 px-2 py-0.5 text-[11px] font-medium text-muted">
              Placeholder image
            </span>
          )}
        </>
      )}
    </div>
  )
}
