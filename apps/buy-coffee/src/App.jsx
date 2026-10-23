import { Routes, Route, useLocation } from 'react-router-dom'
import Support from './pages/Support.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  const { pathname } = useLocation()
  const isDirectSupportPage = pathname === '/support' || pathname === '/support/'

  // Keep the payment flow focused: portfolio support buttons open a standalone page.
  if (isDirectSupportPage) {
    return (
      <div className="min-h-screen bg-cream text-ink">
        <main>
          <Support />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <main>
        <Routes>
          
          <Route path="/support" element={<Support />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
