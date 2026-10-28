import { useRef, useState } from 'react'
import { CircleAlert, CircleCheck, LoaderCircle, Send } from 'lucide-react'
import Button from './Button.jsx'
import { profile } from '../data/profile.js'
import { emailDeliveryConfigured, sendContactEmail } from '../utils/email.js'
import { FIELD_LIMITS, validateContact } from '../utils/validation.js'

const EMPTY = { name: '', email: '', subject: '', message: '', company: '' }

const inputClass = (hasError) =>
  `w-full scroll-mt-28 rounded-xl border bg-surface px-4 py-3 text-base text-ink shadow-soft transition placeholder:text-muted/80 focus:outline-none focus:ring-4 sm:text-sm ${
    hasError ? 'border-danger focus:ring-danger/20' : 'border-line hover:border-brand-bright/60 focus:border-brand focus:ring-leaf/50'
  }`

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} <span className="text-danger" aria-hidden="true">*</span>
        <span className="sr-only"> (required)</span>
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error | unconfigured
  const submitting = useRef(false)

  const sending = status === 'sending'

  const mailtoHref = profile.email
    ? `mailto:${profile.email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(values.message)}`
    : ''

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
    if (status === 'success' || status === 'error' || status === 'unconfigured') setStatus('idle')
  }

  const handleBlur = (event) => {
    const { name } = event.target
    if (name === 'company') return
    const message = validateContact(values)[name]
    setErrors((current) => {
      const next = { ...current }
      if (message) next[name] = message
      else delete next[name]
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting.current) return // duplicate-submission guard

    // Honeypot: real visitors never see or fill this field.
    if (values.company) return

    const found = validateContact(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      const firstInvalid = ['name', 'email', 'subject', 'message'].find((field) => found[field])
      document.getElementById(`contact-${firstInvalid}`)?.focus()
      return
    }

    if (!emailDeliveryConfigured) {
      setStatus('unconfigured')
      return
    }

    submitting.current = true
    setStatus('sending')
    try {
      await sendContactEmail(values) // resolves only on provider-confirmed success
      setValues(EMPTY)
      setErrors({})
      setStatus('success')
    } catch {
      setStatus('error') // keep what the visitor typed
    } finally {
      submitting.current = false
    }
  }

  const describe = (field) => (errors[field] ? `contact-${field}-error` : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-busy={sending}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Full name" error={errors.name}>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={FIELD_LIMITS.name}
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe('name')}
            className={inputClass(errors.name)}
            placeholder="Your full name"
          />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={FIELD_LIMITS.email}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe('email')}
            className={inputClass(errors.email)}
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <Field id="contact-subject" label="Subject" error={errors.subject}>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          maxLength={FIELD_LIMITS.subject}
          value={values.subject}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={describe('subject')}
          className={inputClass(errors.subject)}
          placeholder="What would you like to talk about?"
        />
      </Field>

      <Field id="contact-message" label="Message" error={errors.message}>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          maxLength={FIELD_LIMITS.message}
          value={values.message}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe('message')}
          className={`${inputClass(errors.message)} resize-y`}
          placeholder="Tell me about your idea, project or opportunity."
        />
      </Field>

      {/* Honeypot field for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={handleChange} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={sending} aria-disabled={sending} className="w-full min-w-40 disabled:cursor-not-allowed sm:w-auto">
          {sending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Send message
            </>
          )}
        </Button>
      </div>

      <div aria-live="polite">
        {status === 'success' && (
          <p role="status" className="flex items-start gap-2 rounded-xl border border-success/40 bg-success-soft p-4 text-sm text-success">
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Thank you — your message was sent. I'll get back to you as soon as I can.</span>
          </p>
        )}

        {status === 'error' && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger-soft p-4 text-sm text-danger">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              Your message could not be sent. Nothing was lost — your text is still in the form, so you can try again
              {mailtoHref ? (
                <>
                  {' '}
                  or{' '}
                  <a href={mailtoHref} className="font-semibold underline">
                    send it by email instead
                  </a>
                </>
              ) : null}
              .
            </span>
          </p>
        )}

        {status === 'unconfigured' && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger-soft p-4 text-sm text-danger">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              The contact form is not connected to an email service yet, so this message has <strong>not</strong> been sent.
              {mailtoHref ? (
                <>
                  {' '}
                  Please{' '}
                  <a href={mailtoHref} className="font-semibold underline">
                    email me directly
                  </a>
                  .
                </>
              ) : (
                ' Please check back soon.'
              )}
              {import.meta.env.DEV && (
                <>
                  {' '}
                  <em>
                    (Developer note: set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY in
                    .env — see the README.)
                  </em>
                </>
              )}
            </span>
          </p>
        )}
      </div>
    </form>
  )
}
