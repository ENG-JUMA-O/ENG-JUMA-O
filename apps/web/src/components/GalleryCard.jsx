import { Maximize2 } from 'lucide-react'
import Reveal from './Reveal.jsx'
import SmartImage from './SmartImage.jsx'

export const aspectRatios = {
  landscape: '4 / 3',
  portrait: '3 / 4',
  square: '1 / 1',
  wide: '16 / 9',
}

/** Gallery tile. It is a real <button>, so keyboard and screen-reader users can open the lightbox. */
export default function GalleryCard({ item, index = 0, onOpen }) {
  return (
    <Reveal delay={Math.min(index, 5) * 0.05} className="mb-5 break-inside-avoid">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="group block w-full overflow-hidden rounded-xl border border-line bg-surface text-left transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
      >
        <div className="relative">
          <SmartImage
            src={item.image}
            alt={item.alt}
            kind={item.kind}
            ratio={aspectRatios[item.aspect] || aspectRatios.landscape}
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-lg bg-surface/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <div className="p-4">
          <span className="block text-xs font-semibold uppercase tracking-wider text-link">{item.category}</span>
          <span className="mt-1 block font-display text-base font-semibold text-ink">{item.title}</span>
          <span className="sr-only">Open larger preview</span>
        </div>
      </button>
    </Reveal>
  )
}
