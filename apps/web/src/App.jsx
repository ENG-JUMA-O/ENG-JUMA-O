import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'

// Secondary pages are code-split so the first visit loads only what it needs.
const About = lazy(() => import('./pages/About.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const ProjectDetails = lazy(() => import('./pages/ProjectDetails.jsx'))
const Gallery = lazy(() => import('./pages/Gallery.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetails />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
