import { ArrowLeft } from 'lucide-react'
import Button from '../components/Button.jsx'

export default function NotFound() {
  return <section className="grid min-h-[55vh] place-items-center px-4 py-20 text-center"><div><p className="text-sm font-black uppercase tracking-widest text-coffee-dark">404 · Page not found</p><h1 className="mt-3 text-4xl font-black">This page wandered off.</h1><p className="mt-3 text-muted">The link may be outdated, or the page may have moved.</p><div className="mt-6"><Button to="/" variant="coffee"><ArrowLeft size={17} /> Back to home</Button></div></div></section>
}