import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

// Light is the default. The inline script in index.html sets data-theme before first paint.
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage can be unavailable (private mode) — the theme still applies for this visit */
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    const root = document.documentElement
    root.classList.add('theme-transition')
    window.setTimeout(() => root.classList.remove('theme-transition'), 350)
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
