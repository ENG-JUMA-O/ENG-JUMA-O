
import { Routes, Route } from 'react-router-dom'
import Support from './pages/Support.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
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
