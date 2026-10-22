import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-ink transition-colors hover:border-brand hover:text-link ${className}`}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
    </button>
  )
}
