import { useEffect, useState } from 'react'
import { profile } from '../data/profile.js'
import { assetUrl } from '../utils/url.js'

let cached

/**
 * True only when a real PDF exists at profile.cvPath. Static hosts often answer unknown paths with
 * index.html, so the content type is checked as well as the status code.
 */
export function useCvAvailable() {
  const [available, setAvailable] = useState(cached ?? false)

  useEffect(() => {
    if (cached !== undefined || !profile.cvPath) return undefined
    let cancelled = false

    fetch(assetUrl(profile.cvPath), { method: 'HEAD' })
      .then((response) => {
        const type = response.headers.get('content-type') || ''
        const ok = response.ok && (type.includes('pdf') || type.includes('octet-stream'))
        cached = ok
        if (!cancelled) setAvailable(ok)
      })
      .catch(() => {
        cached = false
      })

    return () => {
      cancelled = true
    }
  }, [])

  return available
}
