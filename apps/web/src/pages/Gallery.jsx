import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import PageHeader from '../components/PageHeader.jsx'
import GalleryCard from '../components/GalleryCard.jsx'
import ImageLightbox from '../components/ImageLightbox.jsx'
import { gallery, galleryCategoryOrder } from '../data/gallery.js'
import { useSeo } from '../hooks/useSeo.js'

const ALL = 'All'

export default function Gallery() {
  useSeo({
    title: 'Creative Gallery',
    description: 'A closer look at interfaces, visual concepts, and digital experiences by ENG Douglas Oroko.',
    path: '/gallery',
  })

  const [category, setCategory] = useState(ALL)
  const [activeIndex, setActiveIndex] = useState(null)

  // Only offer categories that have content.
  const categories = useMemo(() => {
    const present = new Set(gallery.map((item) => item.category))
    const ordered = galleryCategoryOrder.filter((name) => present.has(name))
    const extras = [...present].filter((name) => !galleryCategoryOrder.includes(name))
    return [ALL, ...ordered, ...extras]
  }, [])

  const items = useMemo(
    () => (category === ALL ? gallery : gallery.filter((item) => item.category === category)),
    [category],
  )

  const lightboxItems = useMemo(
    () =>
      items.map((item) => ({
        src: item.image,
        alt: item.alt,
        title: item.title,
        description: item.description,
        category: item.category,
        kind: item.kind,
        projectSlug: item.projectSlug,
        link: item.link,
      })),
    [items],
  )

  const selectCategory = (name) => {
    setActiveIndex(null)
    setCategory(name)
  }

  const closeLightbox = useCallback(() => setActiveIndex(null), [])

  return (
    <>
      <PageHeader
        eyebrow="Visual work"
        title="Creative Gallery"
        description="A closer look at interfaces, visual concepts, and digital experiences."
      >
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Select any image to view it larger. Use the arrow keys to move between images and Escape to close.
          {import.meta.env.DEV && (
            <>
              {' '}
              <em>(Developer note: placeholders are shown until real images are added to src/data/gallery.js.)</em>
            </>
          )}
        </p>
      </PageHeader>

      <section aria-label="Gallery" className="bg-surface py-12 sm:py-16">
        <div className="container-page">
          <div role="group" aria-label="Filter gallery by category" className="flex flex-wrap gap-2">
            {categories.map((name) => {
              const active = name === category
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectCategory(name)}
                  className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                    active
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-surface text-muted hover:border-brand hover:text-link'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>

          <p role="status" aria-live="polite" className="mt-6 text-sm text-muted">
            Showing {items.length} {items.length === 1 ? 'image' : 'images'}
            {category !== ALL ? ` in ${category}` : ''}
          </p>

          <div className="mt-6 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {items.map((item, index) => (
              <GalleryCard key={item.id} item={item} index={index} onOpen={() => setActiveIndex(index)} />
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeIndex !== null && lightboxItems[activeIndex] && (
          <ImageLightbox
            items={lightboxItems}
            index={activeIndex}
            onClose={closeLightbox}
            onIndexChange={setActiveIndex}
          />
        )}
      </AnimatePresence>
    </>
  )
}
