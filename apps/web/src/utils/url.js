// Small helpers for safely handling configured links and public assets.

/** Returns a normalised http(s) URL, or '' when the value is missing or invalid. */
export function safeUrl(value) {
  if (!value || typeof value !== 'string') return ''
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : ''
  } catch {
    return ''
  }
}

/** Returns the e-mail address when it looks valid, otherwise ''. */
export function safeEmail(value) {
  if (!value || typeof value !== 'string') return ''
  const email = value.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : ''
}

/** Resolves a path in /public ("/cv/file.pdf") against Vite's base path. External URLs pass through. */
export function assetUrl(path) {
  if (!path || typeof path !== 'string') return ''
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
