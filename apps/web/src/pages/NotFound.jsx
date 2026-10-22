import Button from '../components/Button.jsx'
import { useSeo } from '../hooks/useSeo.js'

export default function NotFound({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or may have moved.",
  backTo = '/projects',
  backLabel = 'Browse projects',
}) {
  useSeo({ title, description: message, path: '/404', noindex: true })

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="container-page relative grid min-h-[60vh] place-items-center py-20 text-center">
        <div>
          <p className="font-display text-7xl font-bold tracking-tight text-brand/30 sm:text-8xl" aria-hidden="true">
            404
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted">{message}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/">Back to home</Button>
            <Button to={backTo} variant="secondary">
              {backLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
