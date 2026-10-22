import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react'
import SmartImage from './SmartImage.jsx'
import { assetUrl, safeUrl } from '../utils/url.js'

/**
 * Accessible modal image viewer.
 * Escape closes, Left/Right arrows (and swipes) navigate, Tab is trapped inside the dialog,
 * background scrolling is locked, and focus returns to the opener when it closes.
 *
 * Render inside <AnimatePresence> so the exit animation can play:
 *   <AnimatePresence>{index !== null && <ImageLightbox ... />}</AnimatePresence>
 *
 * items: [{ src, alt, title, description, category, kind, projectSlug, link }]
 */
export default function ImageLightbox({ items, index, onClose, onIndexChange }) {
  const reduce = useReducedMotion()
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const touchStartX = useRef(null)
  const [failedSrc, setFailedSrc] = useState(null)

  const item = items[index]
  const total = items.length

  const goPrev = useCallback(() => onIndexChange((index - 1 + total) % total), [index, total, onIndexChange])
  const goNext = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange])

  // Lock background scroll and restore focus to the opener on close.
  useEffect(() => {
    const opener = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      if (opener && typeof opener.focus === 'function') opener.focus()
    }
  }, [])

  // Keyboard: Escape, arrows, and a Tab focus trap.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowLeft' && total > 1) {
        goPrev()
      } else if (event.key === 'ArrowRight' && total > 1) {
        goNext()
      } else if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button, a[href]')
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, goPrev, goNext, total])

  if (!item) return null

  const imageSrc = assetUrl(item.src)
  const showImage = imageSrc && failedSrc !== imageSrc
  const external = safeUrl(item.link)

  const onTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX
  }
  const onTouchEnd = (event) => {
    if (touchStartX.current === null || total < 2) return
    const delta = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) > 50) (delta > 0 ? goPrev : goNext)()
  }

  const iconButton =
    'grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-brand hover:text-link'

  return createPortal(
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        className="mx-auto flex h-full w-full max-w-5xl flex-col gap-3 p-3 sm:p-6"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-end">
          <button ref={closeRef} type="button" onClick={onClose} className={iconButton} aria-label="Close preview">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <motion.div
          key={item.src || item.title}
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0 : 0.25, ease: 'easeOut' }}
          className="flex min-h-0 flex-1 items-center justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          {showImage ? (
            <img
              src={imageSrc}
              alt={item.alt}
              onError={() => setFailedSrc(imageSrc)}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
          ) : (
            <SmartImage
              src=""
              alt={item.alt}
              kind={item.kind}
              ratio="16 / 10"
              className="w-full max-w-3xl rounded-xl"
            />
          )}
        </motion.div>

        <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {item.category && <p className="text-xs font-semibold uppercase tracking-wider text-link">{item.category}</p>}
              <h2 id="lightbox-title" className="mt-1 text-lg font-semibold text-ink">
                {item.title}
              </h2>
              {item.description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.description}</p>}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                {item.projectSlug && (
                  <Link to={`/projects/${item.projectSlug}`} onClick={onClose} className="text-link hover:underline">
                    View related project
                  </Link>
                )}
                {external && (
                  <a
                    href={external}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-link hover:underline"
                  >
                    Open link <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </div>

            {total > 1 && (
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={goPrev} className={iconButton} aria-label="Previous image">
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="min-w-12 text-center text-sm tabular-nums text-muted" aria-live="polite">
                  {index + 1} / {total}
                </span>
                <button type="button" onClick={goNext} className={iconButton} aria-label="Next image">
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>,
    document.body,
  )
}
