import { useEffect, useLayoutEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Pic, { has } from './components/Pic'
import Logo from './components/Logo'
import Split from './components/Split'
import { profile, disciplines, projects, designWork, upcoming, certificates, talks, gallery } from './data/content'
const Silk = lazy(() => import('./components/Silk'))

gsap.registerPlugin(ScrollTrigger)
const mq = (q) => typeof matchMedia !== 'undefined' && matchMedia(q).matches
const RM = mq('(prefers-reduced-motion: reduce)')
const FINE = mq('(pointer:fine) and (min-width:900px)')
let lenis = null
const go = (e, id) => { e?.preventDefault(); const el = document.getElementById(id); if (!el) return; lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView() }
const NAV = [['about', 'About'], ['work', 'Work'], ['gallery', 'Gallery'], ['design', 'Design'], ['speaking', 'Speaking'], ['certificates', 'Certificates'], ['contact', 'Contact']]
const pad = (n) => String(n).padStart(2, '0')
const webglOK = () => { if (RM) return false; try { const c = document.createElement('canvas'); return !!c.getContext('webgl') && (navigator.hardwareConcurrency || 4) >= 4 } catch { return false } }

/* ───────── cursor ───────── */
function Cursor() {
  const dot = useRef(null), ring = useRef(null)
  useEffect(() => {
    if (!FINE) return
    const q = (el, p, d) => gsap.quickTo(el, p, { duration: d, ease: 'power3' })
    const dx = q(dot.current, 'x', 0.12), dy = q(dot.current, 'y', 0.12), rx = q(ring.current, 'x', 0.5), ry = q(ring.current, 'y', 0.5)
    const mv = (e) => { document.documentElement.classList.add('moved'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); const t = e.target.closest?.('a,button,[data-cursor]'); ring.current.classList.toggle('on', !!t); ring.current.dataset.label = t?.dataset.cursor || '' }
    document.documentElement.classList.add('has-cursor'); addEventListener('mousemove', mv)
    return () => removeEventListener('mousemove', mv)
  }, [])
  return FINE ? <><div className="cur-d" ref={dot} aria-hidden="true" /><div className="cur-r" ref={ring} aria-hidden="true" /></> : null
}

function Magnetic({ children, className = '', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!FINE || RM) return
    const el = ref.current, x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1,.35)' }), y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1,.35)' })
    const m = (e) => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.35); y((e.clientY - r.top - r.height / 2) * 0.35) }
    const l = () => { x(0); y(0) }
    el.addEventListener('mousemove', m); el.addEventListener('mouseleave', l)
    return () => { el.removeEventListener('mousemove', m); el.removeEventListener('mouseleave', l) }
  }, [])
  return <a ref={ref} className={`btn ${className}`} {...rest}><span className="btn-t">{children}</span></a>
}

/* ───────── header ───────── */
function Header() {
  const [open, setOpen] = useState(false)
  useEffect(() => { document.documentElement.classList.toggle('menu-open', open); open ? lenis?.stop() : lenis?.start() }, [open])
  useEffect(() => { const k = (e) => e.key === 'Escape' && setOpen(false); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  return (
    <>
      <header className="hdr">
        <a href="#top" className="hdr-logo" onClick={(e) => go(e, 'top')} aria-label="Abdul Aziz Bin Harun, home"><Logo size="sm" /><span className="foil-t">A. Aziz</span></a>
        <nav className="hdr-nav" aria-label="Primary">{NAV.slice(0, 6).map(([id, l]) => <a key={id} href={`#${id}`} onClick={(e) => go(e, id)}>{l}</a>)}</nav>
        <a className="hdr-cta" href="#contact" onClick={(e) => go(e, 'contact')}>Let’s talk</a>
        <button className="hdr-burger" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'}><i /><i /></button>
      </header>
      <div id="menu" className={`menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">{NAV.map(([id, l], i) => <a key={id} href={`#${id}`} tabIndex={open ? 0 : -1} style={{ '--i': i }} onClick={(e) => { setOpen(false); setTimeout(() => go(null, id), 50); e.preventDefault() }}><small>{pad(i + 1)}</small>{l}</a>)}</nav>
        <a className="menu-mail" href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1}>{profile.email}</a>
      </div>
    </>
  )
}

/* ───────── sections ───────── */
function Hero() {
  return (
    <section className="hero" id="top" data-world="0">
      <div className="hero-orbit" aria-hidden="true"><Logo size="xl" /></div>
      <h1 className="hero-name" aria-label={profile.name}>
        <span className="hn hn-1" aria-hidden="true"><Split parts="Abdul" /><em className="foil-t"><Split parts="Aziz" /></em></span>
        <span className="hn hn-2" aria-hidden="true"><Split parts="Bin Harun" /></span>
      </h1>
      <div className="hero-cut"><div className="hero-halo" /><Pic name="cut-navy" eager sizes="(max-width:900px) 86vw, 40vw" alt="Abdul Aziz Bin Harun in a tailored suit" /></div>
      <div className="hero-side">
        <p className="hero-tag">{profile.tagline}</p>
        <ul className="hero-roles">{profile.roles.map((r) => <li key={r}>{r}</li>)}</ul>
      </div>
      <div className="hero-foot"><span className="lbl">{profile.location}</span><a className="hero-scroll lbl" href="#about" onClick={(e) => go(e, 'about')}>Scroll to explore <i /></a></div>
    </section>
  )
}

function Marquee() {
  const w = ['Graphic Design', 'Web Development', 'Artificial Intelligence', 'Motivational Speaking']
  return <div className="mq" aria-hidden="true"><div className="mq-t">{[0, 1].map((k) => <span key={k}>{w.map((x, i) => <b key={x} className={i % 2 ? 'foil-t it' : 'iri-t'}>{x}<i>✦</i></b>)}</span>)}</div></div>
}

function Head({ n, label, title, gem }) {
  return (
    <div className="head">
      <div className="head-l"><span className={`gem gem-${gem}`} /><span className="num">{pad(n)}</span><span className="lbl">{label}</span></div>
      <Split as="h2" className="h2" parts={title} />
    </div>
  )
}

function About() {
  return (
    <section className="sec about" id="about" data-world="1">
      <Head n={1} gem="em" label="About" title={['The work of a ', ['maker.', 'i']]} />
      <div className="about-grid">
        <figure className="about-img glass rip"><Pic name="portrait-navy" sizes="(max-width:900px) 92vw, 34vw" alt="Portrait of Abdul Aziz Bin Harun" /><figcaption className="lbl">{profile.name} · {profile.location}</figcaption></figure>
        <div className="about-copy">
          <Split as="p" className="scrub" mode="scrub" parts={profile.intro} />
          <ol className="disc">{disciplines.map((d, i) => (
            <li key={d.n} className={`disc-i glass fade g${i}`}><span className="num">{d.n}</span><h3>{d.title}</h3><p>{d.text}</p></li>))}</ol>
        </div>
      </div>
    </section>
  )
}

function Visual({ kind, ph }) {
  if (ph) return <div className="vis vis-ph"><Logo size="md" /><span>Coming soon</span></div>
  return <div className={`vis vis-${kind}`}>{kind === 'cosmos' ? <><i className="orb" /><b>Facts<br /><em>in Seconds</em></b></> : <><i className="ply" /><b>Blink<em>Beyond</em></b></>}</div>
}

function Work() {
  return (
    <section className="work" id="work" data-world="2">
      <div className="work-pin">
        <div className="sec work-head"><Head n={2} gem="sa" label="Selected work" title={['Built, run ', ['& shipped.', 'i']]} /><span className="lbl work-hint">Scroll →</span></div>
        <div className="work-track">
          {projects.map((p, i) => (
            <article key={p.title + i} className={`wcard glass ${p.placeholder ? 'is-ph' : ''}`}>
              <div className="wcard-media rip">{p.image && has(p.image) ? <Pic name={p.image} sizes="(max-width:900px) 84vw, 44vw" alt={`${p.title} website`} /> : <Visual kind={p.visual} ph={p.placeholder} />}</div>
              <div className="wcard-body">
                <span className="num">{pad(i + 1)} / {pad(projects.length)}</span>
                <h3>{p.placeholder ? 'Coming soon' : p.title}</h3>
                <span className="lbl">{p.placeholder ? 'Graphic design · Web · AI' : p.kind}</span>
                <p>{p.placeholder ? 'A new project will be added here.' : p.text}</p>
                <div className="wcard-links">{p.links?.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" data-cursor="Visit">{l.label} ↗</a>)}</div>
              </div>
            </article>))}
        </div>
      </div>
    </section>
  )
}

function Gallery({ onOpen }) {
  return (
    <section className="sec gal" id="gallery" data-world="3">
      <Head n={3} gem="am" label="Gallery" title={['In ', ['frame.', 'i']]} />
      <div className="gal-grid">
        {gallery.map((g, i) => (
          <button key={g.image} className={`gal-i gi-${i % 8} fade`} onClick={() => onOpen(i)} data-cursor="View" aria-label={`Open photo: ${g.alt}`}>
            <span className="gal-img rip"><Pic name={g.image} sizes="(max-width:900px) 46vw, 24vw" alt={g.alt} /></span>
          </button>))}
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
      <div className="lb-img" key={i} onClick={(e) => e.stopPropagation()}><Pic name={gallery[i].image} alt={gallery[i].alt} sizes="90vw" eager /></div>
      <button className="lb-b lb-x" onClick={close} aria-label="Close" autoFocus>Close</button>
      <button className="lb-b lb-p" onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous photo">Prev</button>
      <button className="lb-b lb-n" onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next photo">Next</button>
      <span className="lb-c lbl">{pad(i + 1)} / {pad(gallery.length)}</span>
    </div>
  )
}

function Design() {
  return (
    <section className="sec design" id="design" data-world="4">
      <Head n={4} gem="ru" label="Graphic design" title={['Visual ', ['craft.', 'i']]} />
      <div className="cs-grid">{designWork.map((d, i) => d.placeholder || !has(d.image)
        ? <div key={i} className="cs glass fade"><span className="num">{pad(i + 1)}</span><Logo size="md" /><span className="cs-c">Coming soon</span><span className="lbl">Design piece</span></div>
        : <figure key={i} className="cs-img glass rip fade"><Pic name={d.image} alt={d.title} sizes="(max-width:700px) 92vw, 30vw" /><figcaption className="lbl">{d.title}</figcaption></figure>)}</div>
      <div id="upcoming" className="up">
        <Head n={5} gem="ru" label="Upcoming" title={['What comes ', ['next.', 'i']]} />
        <ol className="tl">{upcoming.map((u, i) => (
          <li key={i} className={`tl-i glass fade ${u.placeholder ? 'is-ph' : ''}`}><span className="lbl foil-t">{u.label}</span><h3>{u.placeholder ? 'Coming soon' : u.title}</h3><p>{u.placeholder ? 'A new upcoming project will be announced here.' : u.text}</p></li>))}</ol>
      </div>
    </section>
  )
}

function Speaking() {
  return (
    <section className="sec spk" id="speaking" data-world="5">
      <div className="spk-grid">
        <div className="spk-img glass rip"><Pic name="wall-smile" sizes="(max-width:900px) 92vw, 40vw" alt="Abdul Aziz Bin Harun smiling" /></div>
        <div>
          <Head n={6} gem="em" label="Speaking" title={['Words that ', ['move', 'i'], ' people.']} />
          <p className="spk-p fade">Motivational talks on learning, building with AI and believing in your own work.</p>
          <div className="talks">{talks.map((t, i) => (
            <div key={i} className="talk glass fade"><span className="lbl">{t.placeholder ? 'Event · Date' : t.place}</span><b>{t.placeholder ? 'Coming soon' : t.title}</b></div>))}</div>
          <Magnetic href="#contact" onClick={(e) => go(e, 'contact')}>Invite me to speak</Magnetic>
        </div>
      </div>
    </section>
  )
}

function Certs() {
  return (
    <section className="sec certs" id="certificates" data-world="2">
      <Head n={7} gem="sa" label="Certificates" title={['Learning, ', ['certified.', 'i']]} />
      <div className="cert-grid">{certificates.map((c, i) => (
        <div key={i} className={`frame fade ${c.placeholder ? 'is-ph' : ''}`}>
          <div className="frame-in">
            <span className="frame-corner tl" /><span className="frame-corner tr" /><span className="frame-corner bl" /><span className="frame-corner br" />
            <span className="num">No. {pad(i + 1)}</span>
            {c.image && has(c.image) ? <Pic name={c.image} alt={c.title} sizes="300px" /> : <Logo size="md" />}
            <b>{c.placeholder ? 'Coming soon' : c.title}</b>
            <span className="lbl">{c.placeholder ? 'Certificate' : `${c.issuer ?? ''} ${c.year ?? ''}`}</span>
          </div>
        </div>))}</div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact" id="contact" data-world="6">
      <div className="sec">
        <div className="head-l"><span className="gem gem-ru" /><span className="num">08</span><span className="lbl">Contact</span></div>
        <h2 className="ct-big"><Split parts="Let’s create" /><br /><em className="iri-t"><Split parts="something" /></em> <Split parts="remarkable." /></h2>
        <div className="ct-row">
          <Magnetic href={`mailto:${profile.email}`} className="btn-xl" data-cursor="Write">Start a project</Magnetic>
          <div className="ct-info glass">
            <span className="lbl">Email</span><a href={`mailto:${profile.email}`} className="ct-mail">{profile.email}</a>
            <span className="lbl">Elsewhere</span><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <span className="lbl">PDFroo enquiries</span><a href="mailto:hello@pdfroo.com">hello@pdfroo.com</a>
          </div>
        </div>
      </div>
      <footer className="ftr">
        <div className="ftr-wm foil-t" aria-hidden="true">Abdul Aziz</div>
        <div className="ftr-row lbl"><span><Logo size="sm" /> © {new Date().getFullYear()} {profile.name}</span><span>{profile.location}</span><a href="#top" onClick={(e) => go(e, 'top')}>Back to top ↑</a></div>
      </footer>
    </section>
  )
}

/* ───────── motion ───────── */
function useMotion(setWorld) {
  useLayoutEffect(() => {
    const worlds = gsap.utils.toArray('[data-world]')
    const sts = worlds.map((el) => ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setWorld(+el.dataset.world) }))
    if (RM) { document.documentElement.classList.add('rm'); return () => sts.forEach((s) => s.kill()) }
    lenis = new Lenis({ duration: 1.2, smoothWheel: true, easing: (t) => 1 - Math.pow(1 - t, 4) })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 })
      tl.from('.hn .wi', { yPercent: 115, rotate: 6, duration: 1.4, ease: 'expo.out', stagger: 0.09 })
        .from('.hero-cut img', { yPercent: 18, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.2)
        .from('.hero-halo', { scale: 0.4, opacity: 0, duration: 2, ease: 'expo.out' }, 0.1)
        .from('.hero-side > *, .hero-foot, .hdr', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.6)
        .from('.hero-orbit', { scale: 0.6, opacity: 0, duration: 2, ease: 'expo.out' }, 0.3)
      gsap.to('.hn-1', { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hn-2', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hero-cut', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.utils.toArray('.h2, .ct-big').forEach((h) => gsap.from(h.querySelectorAll('.wi'), { yPercent: 115, rotate: 4, duration: 1.2, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: h, start: 'top 88%' } }))
      gsap.utils.toArray('.scrub').forEach((p) => gsap.fromTo(p.querySelectorAll('.wi'), { opacity: 0.15 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 55%', scrub: true } }))
      gsap.utils.toArray('.fade').forEach((el) => gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%' } }))
      gsap.utils.toArray('.glass.rip img, .spk-img img, .about-img img').forEach((img) => gsap.fromTo(img, { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } }))
      gsap.to('.mq-t', { xPercent: -50, ease: 'none', duration: 30, repeat: -1 })
      gsap.from('.ftr-wm', { yPercent: 50, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'bottom bottom', scrub: true } })
      mm.add('(min-width: 900px)', () => {
        const track = document.querySelector('.work-track')
        const dist = () => track.scrollWidth - innerWidth
        gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.work', start: 'top top', end: () => '+=' + dist(), pin: '.work-pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } })
      })
    })
    const r = () => ScrollTrigger.refresh(); const t = setTimeout(r, 900); addEventListener('load', r)
    return () => { clearTimeout(t); sts.forEach((s) => s.kill()); ctx.revert(); mm.revert(); gsap.ticker.remove(tick); lenis.destroy(); lenis = null }
  }, [setWorld])
}

/* hover ripple via SVG displacement */
function useRipple() {
  useEffect(() => {
    if (!FINE || RM) return
    const disp = document.getElementById('rip-d'), turb = document.getElementById('rip-t')
    const o = { s: 0, f: 0.012 }
    const apply = () => { disp.setAttribute('scale', o.s); turb.setAttribute('baseFrequency', `${o.f} ${o.f * 1.6}`) }
    const on = (e) => { const t = e.target.closest?.('.rip'); if (!t) return; t.classList.add('rip-on'); gsap.fromTo(o, { s: 40, f: 0.02 }, { s: 0, f: 0.008, duration: 1.4, ease: 'expo.out', onUpdate: apply }) }
    const off = (e) => { const t = e.target.closest?.('.rip'); if (t && !t.contains(e.relatedTarget)) t.classList.remove('rip-on') }
    document.addEventListener('mouseover', on); document.addEventListener('mouseout', off)
    return () => { document.removeEventListener('mouseover', on); document.removeEventListener('mouseout', off) }
  }, [])
}

export default function App() {
  const [lb, setLb] = useState(-1)
  const [world, setWorld] = useState(0)
  const [gl, setGl] = useState(false)
  useEffect(() => {
    if (!webglOK()) return
    const start = () => setGl(true)
    const id = 'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 1200)
    return () => ('cancelIdleCallback' in window ? cancelIdleCallback(id) : clearTimeout(id))
  }, [])
  useEffect(() => { document.documentElement.dataset.world = world }, [world])
  useMotion(setWorld)
  useRipple()
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="bg-css" aria-hidden="true" />
      {gl && <Suspense fallback={null}><Silk world={world} onFail={() => setGl(false)} /></Suspense>}
      <div className="grain" aria-hidden="true" />
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><filter id="rip"><feTurbulence id="rip-t" type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="3" /><feDisplacementMap id="rip-d" in="SourceGraphic" scale="0" /></filter></svg>
      <Cursor />
      <Header />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Gallery onOpen={setLb} />
        <Design />
        <Speaking />
        <Certs />
        <Contact />
      </main>
      <Lightbox i={lb} setI={setLb} />
    </>
  )
}
