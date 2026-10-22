// GALLERY — add real screenshots by dropping images into /public/gallery and adding an entry here.
//
//   id           unique string
//   title        shown under the image and in the lightbox
//   category     'Web Interfaces' | 'Mobile UI' | 'Dashboards' | 'UI/UX Concepts'
//   description  short text shown in the lightbox
//   image        e.g. '/gallery/my-dashboard.png' (blank = clearly labelled placeholder art)
//   alt          meaningful description of what the image shows
//   aspect       'landscape' | 'portrait' | 'square' | 'wide' (reserves space; avoids layout shift)
//   kind         placeholder art style: 'web' | 'mobile' | 'dashboard' | 'concept'
//   projectSlug  optional: links to /projects/<slug>
//   link         optional external URL (real URLs only)
//   placeholder  true marks a sample entry; remove it from real images
//
// The entries below are SAMPLE PLACEHOLDERS, not real work.

export const gallery = [
  {
    id: 'g1',
    title: 'Landing page layout',
    category: 'Web Interfaces',
    description: 'Placeholder for a website interface preview. Replace with a real screenshot.',
    image: '',
    alt: 'Placeholder illustration of a website layout',
    aspect: 'landscape',
    kind: 'web',
    placeholder: true,
  },
  {
    id: 'g2',
    title: 'Mobile onboarding screens',
    category: 'Mobile UI',
    description: 'Placeholder for a mobile interface design. Replace with a real screen capture.',
    image: '',
    alt: 'Placeholder illustration of a mobile app screen',
    aspect: 'portrait',
    kind: 'mobile',
    placeholder: true,
  },
  {
    id: 'g3',
    title: 'Analytics dashboard',
    category: 'Dashboards',
    description: 'Placeholder for a dashboard design. Replace with a real screenshot.',
    image: '',
    alt: 'Placeholder illustration of a dashboard with charts',
    aspect: 'wide',
    kind: 'dashboard',
    placeholder: true,
  },
  {
    id: 'g4',
    title: 'Design system concept',
    category: 'UI/UX Concepts',
    description: 'Placeholder for a UI/UX concept or design-system study.',
    image: '',
    alt: 'Placeholder illustration of overlapping interface concepts',
    aspect: 'square',
    kind: 'concept',
    placeholder: true,
  },
  {
    id: 'g5',
    title: 'Responsive web app',
    category: 'Web Interfaces',
    description: 'Placeholder for another web interface preview.',
    image: '',
    alt: 'Placeholder illustration of a web application interface',
    aspect: 'square',
    kind: 'web',
    placeholder: true,
  },
  {
    id: 'g6',
    title: 'Mobile settings flow',
    category: 'Mobile UI',
    description: 'Placeholder for a second mobile interface design.',
    image: '',
    alt: 'Placeholder illustration of a second mobile screen',
    aspect: 'portrait',
    kind: 'mobile',
    placeholder: true,
  },
  {
    id: 'g7',
    title: 'Admin overview',
    category: 'Dashboards',
    description: 'Placeholder for an admin or reporting interface.',
    image: '',
    alt: 'Placeholder illustration of an admin overview',
    aspect: 'landscape',
    kind: 'dashboard',
    placeholder: true,
  },
  {
    id: 'g8',
    title: 'Wireframe exploration',
    category: 'UI/UX Concepts',
    description: 'Placeholder for wireframes or user-flow experiments.',
    image: '',
    alt: 'Placeholder illustration of wireframe shapes',
    aspect: 'landscape',
    kind: 'concept',
    placeholder: true,
  },
]

export const galleryCategoryOrder = ['Web Interfaces', 'Mobile UI', 'Dashboards', 'UI/UX Concepts']
