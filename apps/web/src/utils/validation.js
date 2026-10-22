const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const FIELD_LIMITS = { name: 100, email: 254, subject: 150, message: 3000 }

/** Validates the contact form. Returns an object of { field: errorMessage }; empty means valid. */
export function validateContact(values) {
  const errors = {}
  const name = (values.name || '').trim()
  const email = (values.email || '').trim()
  const subject = (values.subject || '').trim()
  const message = (values.message || '').trim()

  if (!name) errors.name = 'Please enter your full name.'
  else if (name.length < 2) errors.name = 'Your name should be at least 2 characters.'

  if (!email) errors.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address, like name@example.com.'

  if (!subject) errors.subject = 'Please add a subject.'
  else if (subject.length < 3) errors.subject = 'Your subject should be at least 3 characters.'

  if (!message) errors.message = 'Please write a message.'
  else if (message.length < 10) errors.message = 'Your message should be at least 10 characters.'

  return errors
}
