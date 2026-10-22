// PROJECT CATALOGUE — edit this file to add real projects. No page code needs to change.
//
// Fields (only slug, title, summary and category are required):
//   slug          unique, URL-safe id  -> /projects/<slug>
//   title         project name
//   summary       one or two sentences (cards + search)
//   description   optional longer overview shown on the detail page
//   category      'Web Development' | 'Mobile Applications' | 'UI/UX Design' | 'Backend Development'
//   tech          array of technology names
//   date          optional ISO date ('2025-03'); enables "Newest first" sorting. Never guess dates.
//   featured      true to appear on the homepage
//   image         cover image in /public, e.g. '/projects/my-app/cover.png' (blank = placeholder art)
//   imageKind     placeholder art style when there is no image: 'web' | 'mobile' | 'dashboard' | 'concept'
//   screenshots   [{ src: '/projects/my-app/1.png', alt: 'Describe the screenshot', caption: 'optional' }]
//   github, live  real URLs only (leave blank to hide the buttons)
//   problem       string                      goals: string[]       audience: string
//   features      string[]                    process: string[]
//   challenges    [{ challenge: '', solution: '' }]
//   placeholder   true marks a sample entry; remove it from real projects
//
// The entries below are SAMPLE PLACEHOLDERS. Replace or delete them once real projects are available.

export const categoryOrder = ['Web Development', 'Mobile Applications', 'UI/UX Design', 'Backend Development']

export const projects = [
  {
    slug: 'sample-web-application',
    title: 'Sample Web Application',
    summary: 'Placeholder entry for a responsive web project. Replace it with a real project in src/data/projects.js.',
    description:
      'This card is a sample showing how a web project will appear. Add a real title, summary, screenshots and links to replace it.',
    category: 'Web Development',
    tech: ['React', 'JavaScript', 'Tailwind CSS'],
    featured: true,
    image: '',
    imageKind: 'web',
    placeholder: true,
  },
  {
    slug: 'sample-mobile-application',
    title: 'Sample Mobile Application',
    summary: 'Placeholder entry for a cross-platform mobile app. Swap in a real Flutter or mobile project here.',
    description:
      'This card is a sample showing how a mobile project will appear. Add real details, screenshots and links to replace it.',
    category: 'Mobile Applications',
    tech: ['Flutter', 'Dart'],
    featured: true,
    image: '',
    imageKind: 'mobile',
    placeholder: true,
  },
  {
    slug: 'sample-ui-ux-concept',
    title: 'Sample UI/UX Concept',
    summary: 'Placeholder entry for an interface or design-system concept, with wireframes and flows once supplied.',
    description:
      'This card is a sample showing how a design project will appear. Add real wireframes, flows and outcomes to replace it.',
    category: 'UI/UX Design',
    tech: ['Wireframes', 'User flows', 'Design system'],
    featured: true,
    image: '',
    imageKind: 'concept',
    placeholder: true,
  },
  {
    slug: 'sample-api-service',
    title: 'Sample API Service',
    summary: 'Placeholder entry for a backend or API project. Replace it with a real service and its repository.',
    description:
      'This card is a sample showing how a backend project will appear. Add real architecture notes and links to replace it.',
    category: 'Backend Development',
    tech: ['Node.js', 'SQL'],
    featured: false,
    image: '',
    imageKind: 'dashboard',
    placeholder: true,
  },
]
