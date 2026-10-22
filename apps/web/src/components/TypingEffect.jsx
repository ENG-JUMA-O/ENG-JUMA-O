import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const TYPE_MS = 70
const DELETE_MS = 35
const HOLD_MS = 1600
const PAUSE_MS = 350

/**
 * Types and deletes a list of phrases with a blinking cursor.
 * - Starts with the first phrase already visible, so the line is readable immediately.
 * - Reduced motion: shows the first phrase statically, no cycling.
 * - Screen readers get the full list once; the animated text is hidden from them.
 * - Put it on a fixed-height line (see Hero) so the changing text never moves the layout.
 */
export default function TypingEffect({ phrases, className = '' }) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(phrases[0] ?? '')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reduceMotion || phrases.length === 0) return undefined

    const full = phrases[index]
    let timer

    if (!deleting && text === full) {
      timer = setTimeout(() => setDeleting(true), HOLD_MS)
    } else if (deleting && text === '') {
      timer = setTimeout(() => {
        setDeleting(false)
        setIndex((current) => (current + 1) % phrases.length)
      }, PAUSE_MS)
    } else {
      timer = setTimeout(
        () => setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1)),
        deleting ? DELETE_MS : TYPE_MS,
      )
    }

    return () => clearTimeout(timer)
  }, [text, deleting, index, phrases, reduceMotion])

  if (reduceMotion) return <span className={className}>{phrases[0]}</span>

  return (
    <span className={className}>
      <span className="sr-only">{phrases.join(', ')}</span>
      <span aria-hidden="true">
        {text}
        <span className="typing-cursor" />
      </span>
    </span>
  )
}
