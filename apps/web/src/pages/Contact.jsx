import { Coffee, Mail, MessageCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import ContactForm from '../components/ContactForm.jsx'
import Reveal from '../components/Reveal.jsx'
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons.jsx'
import { profile } from '../data/profile.js'
import { useSeo } from '../hooks/useSeo.js'

const WHATSAPP_NUMBER = '254706311983'

const CONTACT_MESSAGE =
  "Hello Douglas, I visited your portfolio and would like to get in touch with you. I have an idea or opportunity I'd like to discuss. Please let me know when you're available. Thank you!"

const EMAIL_SUBJECT = 'Inquiry from your portfolio'

export default function Contact() {
  useSeo({
    title: 'Contact',
    description:
      "Have an idea, a project, or an opportunity to discuss? Contact ENG Douglas Oroko via email, WhatsApp, GitHub, or LinkedIn.",
    path: '/contact',
  })

  const channels = [
    profile.email && {
      key: 'email',
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(CONTACT_MESSAGE)}`,
      icon: <Mail className="h-5 w-5" aria-hidden="true" />,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      value: 'Chat with me directly',
      href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(CONTACT_MESSAGE)}`,
      external: true,
      icon: <MessageCircle className="h-5 w-5" aria-hidden="true" />,
    },
    profile.github && {
      key: 'github',
      label: 'GitHub',
      value: profile.github.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      href: profile.github,
      external: true,
      icon: <GithubIcon className="h-5 w-5" aria-hidden="true" />,
    },
    profile.linkedin && {
      key: 'linkedin',
      label: 'LinkedIn',
      value: profile.linkedin.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      href: profile.linkedin,
      external: true,
      icon: <LinkedinIcon className="h-5 w-5" aria-hidden="true" />,
    },
    profile.buyMeACoffee && {
      key: 'coffee',
      label: 'Buy Me a Coffee',
      value: 'Support my work',
      href: profile.buyMeACoffee,
      external: true,
      icon: <Coffee className="h-5 w-5" aria-hidden="true" />,
    },
  ].filter(Boolean)

  return (
    <>
      <PageHeader eyebrow="Contact" title="Let's Build Something Great">
        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Have an idea, a project, or an opportunity to discuss? I'd be happy
          to hear from you.
        </p>
      </PageHeader>

      <section aria-label="Contact" className="bg-page py-12 sm:py-16 lg:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Get in touch
            </h2>

            <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
              Send a message using the form, or reach out through any of the
              channels below.
            </p>

            {channels.length > 0 ? (
              <ul className="mt-8 space-y-4">
                {channels.map((channel) => (
                  <li key={channel.key}>
                    <a
                      href={channel.href}
                      {...(
                        channel.external
                          ? {
                              target: '_blank',
                              rel: 'noopener noreferrer',
                            }
                          : {}
                      )}
                      className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft transition duration-200 hover:border-brand-bright/50 hover:shadow-card"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-leaf-soft text-brand-deep transition-colors group-hover:bg-brand group-hover:text-white">
                        {channel.icon}
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">
                          {channel.label}
                        </span>
                        <span className="block truncate text-sm text-muted">
                          {channel.value}
                        </span>
                      </span>

                      {channel.external && (
                        <span className="sr-only"> (opens in a new tab)</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              import.meta.env.DEV && (
                <p className="mt-8 rounded-lg border border-dashed border-line p-4 text-sm text-muted">
                  Developer note: configure your contact email and social links
                  in your environment or profile data.
                </p>
              )
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-card min-[400px]:p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-ink">
                Send a message
              </h2>
              <p className="mt-1 mb-6 text-sm text-muted">
                All fields are required.
              </p>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}