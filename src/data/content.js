/**
 * ─────────────────────────────────────────────────────────────
 *  SITE CONTENT — edit this one file to update the whole site.
 *  Images: put files in src/assets/photos or src/assets/work and
 *  reference them by file name WITHOUT size/extension, e.g. 'pdfroo'.
 *  Any item with `placeholder: true` renders as an elegant empty card.
 * ─────────────────────────────────────────────────────────────
 */
export const profile = {
  name: 'Abdul Aziz Bin Harun',
  first: 'Abdul Aziz',
  last: 'Bin Harun',
  location: 'Dhaka, Bangladesh',
  roles: ['Graphic Designer', 'Web Developer', 'Motivational Speaker', 'AI Expert'],
  tagline: 'Design, code and artificial intelligence, made to be useful for everyone.',
  intro:
    'I design, build and speak. I founded PDFroo so anyone can use PDF tools for free, I make short space and science stories with Facts In Seconds, and I use AI as a creative partner for every project I work on.',
  email: 'abdulazizmagnifybusinessgroup@gmail.com',
  emailIsPlaceholder: false,
  linkedin: 'https://www.linkedin.com/in/cboabdulazizbinharun',
}

export const disciplines = [
  { n: '01', title: 'Graphic Design', text: 'Brand marks, social visuals and clean layouts. Restrained, deliberate, and made to be remembered.' },
  { n: '02', title: 'Web Development', text: 'Fast, responsive websites and web tools, from free PDF utilities to personal brand sites.' },
  { n: '03', title: 'Artificial Intelligence', text: 'AI as a creative partner: AI-made Shorts, narrated stories and smarter workflows.' },
  { n: '04', title: 'Motivational Speaking', text: 'Sharing what I learn about building, learning and believing in your own work.' },
]

/** Featured work, shown in the horizontal showcase. */
export const projects = [
  {
    title: 'PDFroo',
    kind: 'Founder · Web Product',
    text: 'Free, user-friendly online PDF tools. I built PDFroo on my own so anyone can use PDF tools for free.',
    image: 'pdfroo',
    links: [{ label: 'Visit pdfroo.com', href: 'https://pdfroo.com' }],
  },
  {
    title: 'Success with Harun',
    kind: 'Website · Design & Development',
    text: 'A personal brand website I designed and built for my father.',
    image: 'success',
    links: [{ label: 'View preview', href: 'https://pdfroo.github.io/success-with-harun-preview/' }],
  },
  {
    title: 'Facts In Seconds',
    kind: 'Content · Facebook & Instagram',
    text: 'Space and science fact reels, plus narrated "What if" videos. @factsinseconds',
    visual: 'cosmos',
    links: [{ label: 'Instagram', href: 'https://www.instagram.com/factsinseconds/' }],
  },
  {
    title: 'BlinkBeyond',
    kind: 'YouTube · AI-made Shorts',
    text: 'A YouTube channel of Shorts made with artificial intelligence.',
    visual: 'blink',
    links: [{ label: 'Find on YouTube', href: 'https://www.youtube.com/results?search_query=BlinkBeyond' }],
  },
  { placeholder: true, title: 'Add your project', kind: 'Graphic design · Web · AI', text: 'Add an entry to `projects` in src/data/content.js.' },
]

/** Graphic design pieces. Add { title, image } objects; placeholders render until filled. */
export const designWork = [
  { placeholder: true, title: 'Design piece coming soon' },
  { placeholder: true, title: 'Design piece coming soon' },
  { placeholder: true, title: 'Design piece coming soon' },
]

/** Upcoming projects, shown as a timeline. Keep wording honest. */
export const upcoming = [
  { label: 'Next', title: 'PDFroo: new features', text: 'More free tools and quality-of-life improvements are in the works.' },
  { label: 'Next', title: 'Facts In Seconds: expansion', text: 'New formats and more stories about space and science.' },
  { label: 'Soon', title: 'Add your upcoming project', text: 'Edit `upcoming` in src/data/content.js.', placeholder: true },
]

/** Certificates. Add { title, issuer, year, image, href }. */
export const certificates = [
  { placeholder: true, title: 'Certificate coming soon' },
  { placeholder: true, title: 'Certificate coming soon' },
  { placeholder: true, title: 'Certificate coming soon' },
  { placeholder: true, title: 'Certificate coming soon' },
]

/** Speaking. Add { title, place, date, text, image }. */
export const talks = [
  { placeholder: true, title: 'Talk / event coming soon', place: 'Venue · Date' },
  { placeholder: true, title: 'Talk / event coming soon', place: 'Venue · Date' },
]

/** Gallery photos (file names in src/assets/photos). */
export const gallery = [
  { image: 'wall-smile', alt: 'Abdul Aziz Bin Harun smiling in a navy suit' },
  { image: 'campus-smile', alt: 'Abdul Aziz Bin Harun outdoors in a navy suit' },
  { image: 'wall-stand', alt: 'Abdul Aziz Bin Harun standing against a warm wall' },
  { image: 'campus-button', alt: 'Abdul Aziz Bin Harun buttoning his blazer' },
  { image: 'wall-shades', alt: 'Abdul Aziz Bin Harun wearing sunglasses' },
  { image: 'campus-stand', alt: 'Abdul Aziz Bin Harun standing on campus' },
  { image: 'wall-full', alt: 'Full-length portrait of Abdul Aziz Bin Harun' },
  { image: 'campus-full', alt: 'Full-length outdoor portrait of Abdul Aziz Bin Harun' },
]
