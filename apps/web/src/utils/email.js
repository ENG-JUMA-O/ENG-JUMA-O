// Contact-form delivery through the EmailJS REST API.
// Only PUBLIC values are used here. EmailJS public keys are designed for browser use;
// restrict them in the EmailJS dashboard (allowed domains, rate limits). Never put private keys in this project.
const env = import.meta.env

const config = {
  serviceId: env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: env.VITE_EMAILJS_PUBLIC_KEY || '',
}

export const emailDeliveryConfigured = Boolean(config.serviceId && config.templateId && config.publicKey)

/**
 * Sends the message. Resolves only when EmailJS confirms success (HTTP 2xx);
 * otherwise it throws, so the UI can never claim a message was sent when it was not.
 */
export async function sendContactEmail(values) {
  if (!emailDeliveryConfigured) throw new Error('not-configured')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        template_params: {
          from_name: values.name.trim(),
          from_email: values.email.trim(),
          reply_to: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        },
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(detail || `Request failed with status ${response.status}`)
    }
    return true
  } finally {
    clearTimeout(timer)
  }
}
