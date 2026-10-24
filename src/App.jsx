import { useEffect, useLayoutEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Pic, { has } from './components/Pic'
import Logo from './components/Logo'
import { profile, disciplines, projects, designWork, upcoming, certificates, talks, gallery } from './data/content'
const Silk = lazy(() => import('./components/Silk'))

gsap.registerPlugin(ScrollTrigger)
const mq = (q) => typeof matchMedia !== 'undefined' && matchMedia(q).matches
const RM = mq('(prefers-reduced-motion: reduce)')
const FINE = mq('(pointer:fine) and (min-width:1024px)')
let lenis = null
const go = (e, id) => { e?.preventDefault(); const el = document.getElementById(id); if (!el) return; lenis ? lenis.scrollTo(el, { duration: 1.4, offset: -64 }) : el.scrollIntoView() }
const NAV = [['about', 'About'], ['services', 'Expertise'], ['work', 'Work'], ['certificates', 'Certificates'], ['speaking', 'Speaking'], ['contact', 'Contact']]
const pad = (n) => String(n).padStart(2, '0')
const mail = `mailto:${profile.email}`

function Cursor() {
  const r = useRef(null)
  useEffect(() => {
    if (!FINE || RM) return
    const x = gsap.quickTo(r.current, 'x', { duration: 0.35, ease: 'power3' }), y = gsap.quickTo(r.current, 'y', { duration: 0.35, ease: 'power3' })
    const mv = (e) => { r.current.style.opacity = 1; x(e.clientX); y(e.clientY); r.current.classList.toggle('on', !!e.target.closest?.('a,button')) }
    addEventListener('mousemove', mv); return () => removeEventListener('mousemove', mv)
  }, [])
  return FINE && !RM ? <div className="cursor" ref={r} aria-hidden="true" /> : null
}

function Header() {
  const [open, setOpen] = useState(false), [active, setActive] = useState(''), [scrolled, setScrolled] = useState(false)
  useEffect(() => { document.documentElement.classList.toggle('menu-open', open); open ? lenis?.stop() : lenis?.start() }, [open])
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setOpen(false); addEventListener('keydown', k)
    const s = () => setScrolled(scrollY > 40); addEventListener('scroll', s, { passive: true })
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    NAV.forEach(([id]) => { const el = document.getElementById(id); el && io.observe(el) })
    return () => { removeEventListener('keydown', k); removeEventListener('scroll', s); io.disconnect() }
  }, [])
  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="wrap nav-in">
          <a href="#top" className="nav-brand" onClick={(e) => go(e, 'top')} aria-label="Abdul Aziz Bin Harun, home"><Logo size="sm" /><span>Abdul Aziz <i>Bin Harun</i></span></a>
          <nav className="nav-links" aria-label="Primary">{NAV.map(([id, l]) => <a key={id} href={`#${id}`} className={active === id ? 'is-active' : ''} onClick={(e) => go(e, id)}>{l}</a>)}</nav>
          <a className="btn btn-sm" href="#contact" onClick={(e) => go(e, 'contact')}>Hire me</a>
          <button className="nav-burger" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'}><i /><i /></button>
        </div>
      </header>
      <div id="menu" className={`menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">{NAV.map(([id, l], i) => <a key={id} href={`#${id}`} tabIndex={open ? 0 : -1} onClick={(e) => { e.preventDefault(); setOpen(false); setTimeout(() => go(null, id), 60) }}><small>{pad(i + 1)}</small>{l}</a>)}</nav>
        <a className="menu-mail" href={mail} tabIndex={open ? 0 : -1}>{profile.email}</a>
      </div>
    </>
  )
}

function SecHead({ n, label, title, intro, aside }) {
  return (
    <header className="sh grid">
      <p className="eyebrow sh-l"><span>{pad(n)}</span>{label}</p>
      <h2 className="h2 sh-t rv">{title}</h2>
      {intro && <p className="lead sh-i rv">{intro}</p>}
      {aside && <div className="sh-a rv">{aside}</div>}
    </header>
  )
}

function Hero({ gl, onFail }) {
  return (
    <section className="hero" id="top">
      {gl && <Suspense fallback={null}><Silk world={0} onFail={onFail} /></Suspense>}
      <div className="wrap grid hero-g">
        <div className="hero-copy">
          <p className="eyebrow hr">Portfolio · {profile.location}</p>
          <h1 className="h1 hr" aria-label={profile.name}><span>Abdul Aziz</span><em>Bin Harun</em></h1>
          <p className="hero-pos hr">{profile.tagline}</p>
          <ul className="roles hr">{profile.roles.map((r) => <li key={r}>{r}</li>)}</ul>
          <div className="ctas hr">
            <a className="btn" href="#contact" onClick={(e) => go(e, 'contact')}>Hire me</a>
            <a className="btn btn-ghost" href="#work" onClick={(e) => go(e, 'work')}>View selected work</a>
          </div>
        </div>
        <figure className="hero-fig hr">
          <div className="hero-arch"><Pic name="cut-navy" eager sizes="(max-width:1023px) 80vw, 34vw" alt="Abdul Aziz Bin Harun in a tailored navy suit" /></div>
          <figcaption className="cap"><Logo size="xs" /> Graphic Designer · Web Developer · Speaker · AI</figcaption>
        </figure>
      </div>
    </section>
  )
}

function About() {
  const facts = [['Based in', profile.location], ['Founder', 'PDFroo · free PDF tools'], ['Creator', 'Facts In Seconds · BlinkBeyond'], ['Disciplines', 'Design · Web · AI · Speaking']]
  return (
    <section className="sec" id="about">
      <div className="wrap">
        <SecHead n={1} label="About" title={<>Design, code and AI, <em>made to be useful.</em></>} />
        <div className="grid about-g">
          <figure className="about-fig rv"><Pic name="portrait-navy" sizes="(max-width:1023px) 90vw, 30vw" alt="Portrait of Abdul Aziz Bin Harun" /></figure>
          <div className="about-copy">
            <p className="lead rv">{profile.intro}</p>
            <dl className="facts">{facts.map(([k, v]) => <div key={k} className="rv"><dt className="eyebrow">{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="sec sec-alt" id="services">
      <div className="wrap">
        <SecHead n={2} label="Expertise" title={<>Four disciplines, <em>one standard.</em></>} />
        <ol className="svc">{disciplines.map((d) => (
          <li key={d.n} className="svc-i rv"><span className="svc-n">{d.n}</span><h3 className="h3">{d.title}</h3><p>{d.text}</p></li>))}</ol>
      </div>
    </section>
  )
}

function Visual({ kind, ph }) {
  if (ph) return <div className="vis vis-ph"><Logo size="md" /><span>Coming soon</span></div>
  return <div className="vis">{kind === 'cosmos' ? <b>Facts <em>in Seconds</em></b> : <b>Blink<em>Beyond</em></b>}</div>
}

function Work() {
  return (
    <section className="sec work" id="work">
      <div className="work-pin">
        <div className="wrap"><SecHead n={3} label="Selected work" title={<>Built, run <em>and shipped.</em></>} aside={<span className="eyebrow work-hint">Scroll to browse →</span>} /></div>
        <div className="work-track">
          {projects.map((p, i) => (
            <article key={p.title + i} className={`case ${p.placeholder ? 'is-ph' : ''}`}>
              <div className="case-media">{p.image && has(p.image) ? <Pic name={p.image} sizes="(max-width:1023px) 84vw, 40vw" alt={`${p.title} website`} /> : <Visual kind={p.visual} ph={p.placeholder} />}</div>
              <div className="case-meta"><span>{pad(i + 1)}</span><span>Role · {p.placeholder ? 'To be added' : p.kind.split(' · ')[0]}</span></div>
              <h3 className="h3">{p.placeholder ? 'Coming soon' : p.title}</h3>
              <p>{p.placeholder ? 'A new project will be added here.' : p.text}</p>
              <ul className="tags">{(p.placeholder ? ['Graphic design', 'Web', 'AI'] : p.kind.split(' · ').slice(1).flatMap((t) => t.split(' & '))).map((t) => <li key={t}>{t}</li>)}</ul>
              {p.links?.map((l) => <a key={l.href} className="link" href={l.href} target="_blank" rel="noopener noreferrer">{l.label} <span aria-hidden="true">↗</span></a>)}
            </article>))}
        </div>
      </div>
    </section>
  )
}

function Design() {
  return (
    <section className="sec" id="design">
      <div className="wrap">
        <SecHead n={4} label="Graphic design" title={<>Visual <em>craft.</em></>} />
        <div className="grid cards3">{designWork.map((d, i) => d.placeholder || !has(d.image)
          ? <div key={i} className="ph rv"><span className="eyebrow">{pad(i + 1)}</span><Logo size="md" /><p>Coming soon</p></div>
          : <figure key={i} className="rv"><Pic name={d.image} alt={d.title} sizes="30vw" /><figcaption className="cap">{d.title}</figcaption></figure>)}</div>
      </div>
    </section>
  )
}

function Gallery({ onOpen }) {
  return (
    <section className="sec sec-tight" id="gallery" aria-label="Gallery">
      <div className="wrap">
        <div className="gal">{gallery.map((g, i) => (
          <button key={g.image} className={`gal-i gi-${i} rv`} onClick={() => onOpen(i)} aria-label={`Open photo: ${g.alt}`}><Pic name={g.image} sizes="(max-width:1023px) 45vw, 24vw" alt={g.alt} /></button>))}</div>
      </div>
    </section>
  )
}

function Lightbox({ i, setI }) {
  const close = useCallback(() => setI(-1), [setI])
  const step = useCallback((d) => setI((o) => (o + d + gallery.length) % gallery.length), [setI])
  useEffect(() => {
    if (i < 0) return; lenis?.stop()
    const k = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }
    addEventListener('keydown', k); return () => { removeEventListener('keydown', k); lenis?.start() }
  }, [i, close, step])
  if (i < 0) return null
  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close}>
      <div className="lb-img" onClick={(e) => e.stopPropagation()}><Pic name={gallery[i].image} alt={gallery[i].alt} sizes="90vw" eager /></div>
      <button className="lb-b lb-x" onClick={close} aria-label="Close" autoFocus>Close</button>
      <button className="lb-b lb-p" onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous photo">Prev</button>
      <button className="lb-b lb-n" onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next photo">Next</button>
    </div>
  )
}

function Certs() {
  return (
    <section className="sec sec-alt" id="certificates">
      <div className="wrap">
        <SecHead n={5} label="Certificates" title={<>Learning, <em>certified.</em></>} />
        <div className="certs">{certificates.map((c, i) => (
          <div key={i} className="frame rv"><div className="frame-in">
            <span className="eyebrow">No. {pad(i + 1)}</span>
            {c.image && has(c.image) ? <Pic name={c.image} alt={c.title} sizes="300px" /> : <Logo size="md" />}
            <p className="frame-t">{c.placeholder ? 'Coming soon' : c.title}</p>
            <span className="eyebrow">{c.placeholder ? 'Certificate' : `${c.issuer ?? ''} ${c.year ?? ''}`}</span>
          </div></div>))}</div>
      </div>
    </section>
  )
}

function Speaking() {
  return (
    <section className="sec" id="speaking">
      <div className="wrap grid spk-g">
        <figure className="spk-fig rv"><Pic name="wall-smile" sizes="(max-width:1023px) 90vw, 34vw" alt="Abdul Aziz Bin Harun smiling" /></figure>
        <div className="spk-copy">
          <p className="eyebrow sh-l"><span>06</span>Speaking</p>
          <h2 className="h2 rv">Words that <em>move people.</em></h2>
          <p className="lead rv">Motivational talks on learning, building with AI and believing in your own work.</p>
          <ul className="rows">{talks.map((t, i) => <li key={i} className="rv"><span className="eyebrow">{t.placeholder ? 'Event · Date' : t.place}</span><span>{t.placeholder ? 'Coming soon' : t.title}</span></li>)}</ul>
          <a className="btn" href="#contact" onClick={(e) => go(e, 'contact')}>Book a talk</a>
        </div>
      </div>
    </section>
  )
}

function Upcoming() {
  return (
    <section className="sec sec-alt" id="upcoming">
      <div className="wrap">
        <SecHead n={7} label="Upcoming" title={<>What comes <em>next.</em></>} />
        <ol className="grid cards3">{upcoming.map((u, i) => (
          <li key={i} className={`up rv ${u.placeholder ? 'is-ph' : ''}`}><span className="eyebrow">{u.label}</span><h3 className="h3">{u.placeholder ? 'Coming soon' : u.title}</h3><p>{u.placeholder ? 'A new upcoming project will be announced here.' : u.text}</p></li>))}</ol>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="sec contact" id="contact">
      <div className="wrap">
        <p className="eyebrow sh-l"><span>08</span>Contact</p>
        <h2 className="display rv">Let’s create something <em>remarkable.</em></h2>
        <div className="grid ct-g">
          <p className="lead rv">For design, web and AI projects, or to book a talk, get in touch.</p>
          <div className="ctas rv"><a className="btn" href={mail}>Email me</a><a className="btn btn-ghost" href="#contact" onClick={(e) => { e.preventDefault(); location.href = `${mail}?subject=Speaking%20enquiry` }}>Book a talk</a></div>
          <dl className="ct-list rv">
            <div><dt className="eyebrow">Email</dt><dd><a href={mail}>{profile.email}</a></dd></div>
            <div><dt className="eyebrow">LinkedIn</dt><dd><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">Abdul Aziz Bin Harun ↗</a></dd></div>
            <div><dt className="eyebrow">PDFroo enquiries</dt><dd><a href="mailto:hello@pdfroo.com">hello@pdfroo.com</a></dd></div>
          </dl>
        </div>
      </div>
      <footer className="wrap ftr"><span><Logo size="xs" /> © {new Date().getFullYear()} {profile.name}</span><span>{profile.location}</span><a href="#top" onClick={(e) => go(e, 'top')}>Back to top ↑</a></footer>
    </section>
  )
}

function useMotion() {
  useLayoutEffect(() => {
    if (RM) return
    lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      gsap.from('.hr', { y: 24, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.08, delay: 0.1 })
      gsap.utils.toArray('.rv').forEach((el) => gsap.from(el, { y: 28, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }))
      mm.add('(min-width: 1024px)', () => {
        const track = document.querySelector('.work-track'), dist = () => track.scrollWidth - innerWidth
        gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.work', start: 'top top', end: () => '+=' + dist(), pin: '.work-pin', scrub: 0.8, invalidateOnRefresh: true } })
      })
    })
    const r = () => ScrollTrigger.refresh(); const t = setTimeout(r, 800); addEventListener('load', r)
    return () => { clearTimeout(t); ctx.revert(); mm.revert(); gsap.ticker.remove(tick); lenis.destroy(); lenis = null }
  }, [])
}

export default function App() {
  const [lb, setLb] = useState(-1), [gl, setGl] = useState(false)
  useEffect(() => {
    if (RM || (navigator.hardwareConcurrency || 4) < 4) return
    const id = setTimeout(() => setGl(true), 1800); return () => clearTimeout(id)
  }, [])
  useMotion()
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Cursor />
      <Header />
      <main id="main">
        <Hero gl={gl} onFail={() => setGl(false)} />
        <About />
        <Services />
        <Work />
        <Design />
        <Gallery onOpen={setLb} />
        <Certs />
        <Speaking />
        <Upcoming />
        <Contact />
      </main>
      <Lightbox i={lb} setI={setLb} />
    </>
  )
}
