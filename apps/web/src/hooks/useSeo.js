import { useEffect } from 'react'
import { profile } from '../data/profile.js'

const SITE_NAME = 'ENG Douglas Oroko'
const DEFAULT_DESCRIPTION =
  'Portfolio of ENG Douglas Oroko, a software developer focused on UI/UX design, frontend and backend development, and cross-platform applications.'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Sets the document title and social metadata for the current page.
 * VITE_SITE_URL provides the canonical domain; until it is set the current origin is used.
 */
export function useSeo({ title, description = DEFAULT_DESCRIPTION, path = '/', image, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Software Developer`
    document.title = fullTitle

    const root = profile.siteUrl || window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '')
    const url = path === '/' ? `${root}/` : `${root}${path}`

    const imageSource = image || profile.ogImage
    const imageUrl = imageSource ? (imageSource.startsWith('http') ? imageSource : `${root}${imageSource}`) : ''

    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex' : '')
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', imageUrl)
    setMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', imageUrl)
    setCanonical(url)
  }, [title, description, path, image, noindex])
}
