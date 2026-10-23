import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Pic, { has } from './components/Pic'
import Logo from './components/Logo'
import Split from './components/Split'
import { profile, disciplines, projects, designWork, upcoming, certificates, talks, gallery } from './data/content'

gsap.registerPlugin(ScrollTrigger)
const RM = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const FINE = typeof matchMedia !== 'undefined' && matchMedia('(pointer:fine) and (min-width:900px)').matches
const base = import.meta.env.BASE_URL
let lenis = null
const go = (e, id) => { e?.preventDefault(); const el = document.getElementById(id); if (!el) return; lenis ? lenis.scrollTo(el, { duration: 1.8 }) : el.scrollIntoView() }
const NAV = [['about', 'About'], ['work', 'Work'], ['gallery', 'Gallery'], ['upcoming', 'Upcoming'], ['speaking', 'Speaking'], ['certificates', 'Certificates'], ['contact', 'Contact']]
const pad = (n) => String(n).padStart(2, '0')

/* ───────── preloader ───────── */
function Preloader({ onDone }) {
  const root = useRef(null), num = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const o = { v: 0 }
      const tl = gsap.timeline({ onComplete: onDone })
      tl.from('.pl-l', { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.035 }, 0.1)
        .to(o, { v: 100, duration: 1.5, ease: 'power3.inOut', onUpdate: () => { num.current.textContent = pad(Math.round(o.v)).padStart(3, '0') } }, 0)
        .to('.pl-bar i', { scaleX: 1, duration: 1.5, ease: 'power3.inOut' }, 0)
        .to('.pl-l', { yPercent: -110, duration: 0.7, ease: 'expo.in', stagger: 0.012 }, 1.55)
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 1.85)
    }, root)
    return () => ctx.revert()
  }, [onDone])
  return (
    <div className="pl" ref={root} aria-hidden="true">
      <div className="pl-top"><span>Portfolio</span><span>{profile.location}</span></div>
      <div className="pl-name">{[...profile.name.toUpperCase()].map((c, i) => <span className="pl-m" key={i}><span className="pl-l">{c === ' ' ? '\u00a0' : c}</span></span>)}</div>
      <div className="pl-foot"><div className="pl-bar"><i /></div><span className="pl-num" ref={num}>000</span></div>
    </div>
  )
}

/* ───────── cursor + hover preview ───────── */
function Cursor() {
  const dot = useRef(null)
  useEffect(() => {
    if (!FINE) return
    const xT = gsap.quickTo(dot.current, 'x', { duration: 0.45, ease: 'power3' }), yT = gsap.quickTo(dot.current, 'y', { duration: 0.45, ease: 'power3' })
    const mv = (e) => { xT(e.clientX); yT(e.clientY); const t = e.target.closest?.('a,button,[data-cursor]'); dot.current.classList.toggle('on', !!t); dot.current.dataset.label = t?.dataset.cursor && t.dataset.cursor !== 'hover' ? t.dataset.cursor : '' }
    document.documentElement.classList.add('has-cursor'); addEventListener('mousemove', mv)
    return () => removeEventListener('mousemove', mv)
  }, [])
  return FINE ? <div className="cur" ref={dot} aria-hidden="true" /> : null
}

function Magnetic({ children, className = '', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!FINE || RM) return
    const el = ref.current, x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,.4)' }), y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,.4)' })
    const m = (e) => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.3); y((e.clientY - r.top - r.height / 2) * 0.3) }
    const l = () => { x(0); y(0) }
    el.addEventListener('mousemove', m); el.addEventListener('mouseleave', l)
    return () => { el.removeEventListener('mousemove', m); el.removeEventListener('mouseleave', l) }
  }, [])
  return <a ref={ref} className={`btn ${className}`} {...rest}><span className="btn-t">{children}</span></a>
}

/* ───────── header / menu ───────── */
function Clock() {
  const [t, setT] = useState('')
  useEffect(() => { const f = () => setT(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }).format(new Date())); f(); const i = setInterval(f, 20000); return () => clearInterval(i) }, [])
  return <span className="clock">Dhaka <i>{t}</i></span>
}
function Header() {
  const [open, setOpen] = useState(false)
  useEffect(() => { document.documentElement.classList.toggle('menu-open', open); open ? lenis?.stop() : lenis?.start() }, [open])
  useEffect(() => { const k = (e) => e.key === 'Escape' && setOpen(false); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  return (
    <>
      <header className="hdr">
        <a href="#top" className="hdr-mark" onClick={(e) => { go(e, 'top'); setOpen(false) }} aria-label="Abdul Aziz Bin Harun, home"><img src={`${base}brand/monogram.svg`} alt="" width="40" height="40" /><span>Abdul Aziz<br />Bin Harun</span></a>
        <Clock />
        <span className="hdr-role">Designer · Developer · Speaker · AI</span>
        <button className="hdr-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu"><span className="mt">{open ? 'Close' : 'Menu'}</span><span className={`mi ${open ? 'x' : ''}`}><i /><i /></span></button>
      </header>
      <nav id="menu" className={`menu ${open ? 'open' : ''}`} aria-label="Main" aria-hidden={!open}>
        <div className="menu-in">
          <ol>{NAV.map(([id, l], i) => <li key={id} style={{ '--i': i }}><a href={`#${id}`} tabIndex={open ? 0 : -1} onClick={(e) => { setOpen(false); setTimeout(() => go(e, id), 10); e.preventDefault() }}><small>{pad(i + 1)}/</small><span>{l}</span></a></li>)}</ol>
          <div className="menu-side"><Logo size="lg" mono /><p>{profile.location}</p><a href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1}>{profile.email}</a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>LinkedIn ↗</a></div>
        </div>
      </nav>
    </>
  )
}

/* ───────── sections ───────── */
function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-meta hm-l"><span className="lbl">(Portfolio)</span><span className="lbl">{profile.location}</span></div>
      <h1 className="hero-name" aria-label={profile.name}>
        <span className="hn hn-1" aria-hidden="true"><Split parts="ABDUL AZIZ" /></span>
        <span className="hn hn-2" aria-hidden="true"><Split parts="BIN HARUN" /></span>
      </h1>
      <div className="hero-cut"><Pic name="cut-navy" eager sizes="(max-width:900px) 92vw, 46vw" alt="Abdul Aziz Bin Harun in a tailored suit" /></div>
      <ul className="hero-roles">{profile.roles.map((r, i) => <li key={r}><small>{pad(i + 1)}</small>{r}</li>)}</ul>
      <p className="hero-tag">{profile.tagline}</p>
      <div className="hero-emb"><Logo size="lg" /></div>
      <a className="hero-scroll lbl" href="#about" onClick={(e) => go(e, 'about')}>Scroll <i /></a>
    </section>
  )
}

function Marquee() {
  const w = ['Graphic Design', 'Web Development', 'Artificial Intelligence', 'Motivational Speaking']
  return <div className="mq" aria-hidden="true"><div className="mq-t">{[0, 1].map((k) => <span key={k}>{w.map((x, i) => <b key={x} className={i % 2 ? 'it' : ''}>{x}<i>✳</i></b>)}</span>)}</div></div>
}

function Head({ n, label, title, light }) {
  return (
    <div className={`head ${light ? 'head--l' : ''}`}>
      <div className="head-l"><span className="num">{pad(n)}/</span><span className="lbl">{label}</span></div>
      <Split as="h2" className="h2" parts={title} />
    </div>
  )
}

function About() {
  return (
    <section className="sec about" id="about">
      <Head n={1} label="About" title={['The work of a ', ['maker.', 'i']]} />
      <div className="about-grid">
        <figure className="about-img clip"><Pic name="portrait-navy-bw" sizes="(max-width:900px) 92vw, 34vw" alt="Black and white portrait of Abdul Aziz Bin Harun" /><figcaption className="lbl">Abdul Aziz Bin Harun, {profile.location}</figcaption></figure>
        <div className="about-copy">
          <Split as="p" className="scrub" mode="scrub" parts={profile.intro} />
          <ol className="disc">{disciplines.map((d) => (
            <li key={d.n} className="disc-i fade"><span className="num">{d.n}/</span><h3>{d.title}</h3><p>{d.text}</p></li>))}</ol>
        </div>
      </div>
    </section>
  )
}

function Work() {
  const prev = useRef(null); const [cur, setCur] = useState(-1)
  useEffect(() => {
    if (!FINE) return
    const el = prev.current, x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' }), y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' })
    const m = (e) => { x(e.clientX); y(e.clientY) }; addEventListener('mousemove', m); return () => removeEventListener('mousemove', m)
  }, [])
  const items = projects
  return (
    <section className="sec work" id="work">
      <Head n={2} label="Selected work" title={['Built, run ', ['& shipped.', 'i']]} />
      <ul className="plist" onMouseLeave={() => setCur(-1)}>
        {items.map((p, i) => (
          <li key={p.title + i} className={`prow fade ${p.placeholder ? 'is-ph' : ''} ${cur === i ? 'on' : ''}`} onMouseEnter={() => setCur(i)}>
            <span className="num">{pad(i + 1)}/</span>
            <div className="prow-main">
              <h3>{p.placeholder ? 'Coming soon' : p.title}</h3>
              <p>{p.placeholder ? 'A new project will be added here.' : p.text}</p>
            </div>
            <span className="prow-kind lbl">{p.placeholder ? 'Add your project' : p.kind}</span>
            <div className="prow-links">{p.links?.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" data-cursor="Visit">{l.label} ↗</a>)}</div>
            <div className="prow-thumb">{p.image && has(p.image) ? <Pic name={p.image} sizes="90vw" alt={`${p.title} website`} /> : <Visual kind={p.visual} ph={p.placeholder} />}</div>
          </li>))}
      </ul>
      {FINE && <div className="pprev" ref={prev} aria-hidden="true">{items.map((p, i) => (
        <div key={i} className={`pprev-i ${cur === i ? 'on' : ''}`}>{p.image && has(p.image) ? <Pic name={p.image} sizes="460px" alt="" /> : <Visual kind={p.visual} ph={p.placeholder} />}</div>))}</div>}
    </section>
  )
}
function Visual({ kind, ph }) {
  if (ph) return <div className="vis vis-ph"><span>Coming soon</span></div>
  return <div className={`vis vis-${kind}`}>{kind === 'cosmos' ? <><i className="orb" /><b>Facts<br /><em>in Seconds</em></b></> : <><i className="ply" /><b>Blink<em>Beyond</em></b></>}</div>
}

function Gallery({ onOpen }) {
  return (
    <section className="gal" id="gallery">
      <div className="gal-pin">
        <div className="gal-head"><Head n={3} label="Gallery" title={['In ', ['frame.', 'i']]} /><span className="lbl gal-hint">Drag / scroll →</span></div>
        <div className="gal-track">
          {gallery.map((g, i) => {
            const bw = i % 2 === 1 && has(g.image + '-bw') ? g.image + '-bw' : g.image
            return (
              <button key={g.image} className={`gal-i gi-${i % 4}`} onClick={() => onOpen(i)} data-cursor="View" aria-label={`Open photo ${i + 1}: ${g.alt}`}>
                <span className="gal-img"><Pic name={bw} sizes="(max-width:900px) 70vw, 30vw" alt={g.alt} /></span>
                <span className="lbl">{pad(i + 1)} / {pad(gallery.length)}</span>
              </button>)
          })}
        </div>
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

function Ivory() {
  return (
    <section className="ivory">
      <div className="sec" id="design">
        <Head n={4} label="Graphic design" title={['Visual ', ['craft.', 'i']]} light />
        <div className="cs-grid">{designWork.map((d, i) => d.placeholder || !has(d.image)
          ? <div key={i} className="cs fade"><span className="num">{pad(i + 1)}</span><span className="cs-c">Coming soon</span><span className="lbl">Design piece</span></div>
          : <figure key={i} className="cs-img clip"><Pic name={d.image} alt={d.title} sizes="(max-width:700px) 92vw, 30vw" /><figcaption className="lbl">{d.title}</figcaption></figure>)}</div>
      </div>
      <div className="sec" id="upcoming">
        <Head n={5} label="Upcoming" title={['What comes ', ['next.', 'i']]} light />
        <ol className="tl">{upcoming.map((u, i) => (
          <li key={i} className={`tl-i fade ${u.placeholder ? 'is-ph' : ''}`}><span className="num">{pad(i + 1)}/</span><span className="lbl">{u.label}</span><h3>{u.placeholder ? 'Coming soon' : u.title}</h3><p>{u.placeholder ? 'A new upcoming project will be announced here.' : u.text}</p></li>))}</ol>
      </div>
    </section>
  )
}

function Speaking() {
  return (
    <section className="spk" id="speaking">
      <div className="spk-img"><Pic name="wall-smile-bw" sizes="100vw" alt="" /></div>
      <div className="spk-in sec">
        <Head n={6} label="Speaking" title={['Words that ', ['move', 'i'], ' people.']} />
        <p className="spk-p fade">Motivational talks on learning, building with AI and believing in your own work.</p>
        <div className="talks">{talks.map((t, i) => (
          <div key={i} className="talk fade"><span className="lbl">{t.placeholder ? 'Event · Date' : t.place}</span><b>{t.placeholder ? 'Coming soon' : t.title}</b></div>))}</div>
        <Magnetic href="#contact" onClick={(e) => go(e, 'contact')}>Invite me to speak</Magnetic>
      </div>
    </section>
  )
}

function Certs() {
  return (
    <section className="sec certs" id="certificates">
      <Head n={7} label="Certificates" title={['Learning, ', ['certified.', 'i']]} />
      <div className="cert-grid">{certificates.map((c, i) => (
        <div key={i} className={`cert fade ${c.placeholder ? 'is-ph' : ''}`}>
          <span className="num">{pad(i + 1)}</span>
          {c.image && has(c.image) ? <Pic name={c.image} alt={c.title} sizes="300px" /> : <img className="cert-seal" src={`${base}brand/monogram.svg`} alt="" width="60" height="60" />}
          <b>{c.placeholder ? 'Coming soon' : c.title}</b><span className="lbl">{c.placeholder ? 'Certificate' : `${c.issuer ?? ''} ${c.year ?? ''}`}</span>
        </div>))}</div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="sec">
        <div className="head-l"><span className="num">08/</span><span className="lbl">Contact</span></div>
        <Split as="h2" className="ct-big" parts={["Let's create ", ['something', 'i'], ' remarkable.']} />
        <div className="ct-row">
          <a className="ct-mail" href={`mailto:${profile.email}`} data-cursor="Write"><span className="lbl">Email</span><b>{profile.email}</b></a>
          <div className="ct-links">
            <Magnetic href={`mailto:${profile.email}`}>Email me</Magnetic>
            <Magnetic href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn-o">LinkedIn ↗</Magnetic>
          </div>
        </div>
        <p className="ct-note lbl">PDFroo enquiries · <a href="mailto:hello@pdfroo.com">hello@pdfroo.com</a></p>
      </div>
      <footer className="ftr">
        <img className="ftr-wm" src={`${base}brand/wordmark-ivory.svg`} alt="Abdul Aziz Bin Harun" width="1400" height="240" loading="lazy" />
        <div className="ftr-row lbl"><span>© {new Date().getFullYear()} {profile.name}</span><span>{profile.location}</span><a href="#top" onClick={(e) => go(e, 'top')}>Back to top ↑</a></div>
      </footer>
    </section>
  )
}

/* ───────── motion orchestration ───────── */
function useMotion(ready) {
  useLayoutEffect(() => {
    if (!ready) return
    if (RM) { document.documentElement.classList.add('rm'); return }
    lenis = new Lenis({ duration: 1.25, smoothWheel: true, easing: (t) => 1 - Math.pow(1 - t, 4) })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      // hero intro
      const tl = gsap.timeline({ delay: 0.05 })
      tl.from('.hn .wi', { yPercent: 105, duration: 1.4, ease: 'expo.out', stagger: 0.08 })
        .from('.hero-cut', { yPercent: 18, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.15)
        .from('.hero-roles li, .hero-tag, .hero-meta .lbl, .hero-scroll', { y: 20, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.05 }, 0.6)
        .from('.hero-emb', { scale: 0.6, rotate: -90, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.5)
        .from('.hdr > *', { y: -20, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.06 }, 0.4)
      // hero scroll: lines drift apart, cutout lifts
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        .to('.hn-1', { xPercent: -12 }, 0).to('.hn-2', { xPercent: 12 }, 0)
        .to('.hero-cut', { yPercent: -8, scale: 1.04 }, 0).to('.hero-roles, .hero-tag, .hero-emb', { opacity: 0, y: -40 }, 0)
      // split heading reveals
      gsap.utils.toArray('.split--rise').forEach((el) => {
        if (el.closest('.hero')) return
        gsap.from(el.querySelectorAll('.wi'), { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 88%' } })
      })
      // scrubbed reading paragraph
      gsap.utils.toArray('.split--scrub').forEach((el) => {
        gsap.fromTo(el.querySelectorAll('.wi'), { opacity: 0.14 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } })
      })
      // clip-path image reveals
      gsap.utils.toArray('.clip').forEach((el) => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
          .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
          .from(el.querySelector('img'), { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.2)
      })
      gsap.utils.toArray('.fade').forEach((el) => gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } }))
      // speaking parallax + reveal
      gsap.fromTo('.spk-img', { clipPath: 'inset(12% 8% 12% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.spk', start: 'top bottom', end: 'top top', scrub: true } })
      gsap.fromTo('.spk-img img', { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: '.spk', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.from('.ftr-wm', { yPercent: 60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'bottom bottom', scrub: true } })
      // pinned horizontal gallery (desktop/tablet)
      mm.add('(min-width: 900px)', () => {
        const track = document.querySelector('.gal-track')
        const dist = () => track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft)
        gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.gal', start: 'top top', end: () => '+=' + dist(), pin: '.gal-pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } })
        gsap.utils.toArray('.gal-img img').forEach((img) => gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.gal', start: 'top top', end: () => '+=' + dist(), scrub: true } }))
      })
    })
    const r = () => ScrollTrigger.refresh(); const t = setTimeout(r, 800); addEventListener('load', r)
    return () => { clearTimeout(t); ctx.revert(); mm.revert(); gsap.ticker.remove(tick); lenis.destroy(); lenis = null }
  }, [ready])
}

export default function App() {
  const [loading, setLoading] = useState(() => !RM && !sessionStorage.getItem('aab-pl'))
  const [lb, setLb] = useState(-1)
  const done = useCallback(() => { sessionStorage.setItem('aab-pl', '1'); setLoading(false) }, [])
  useEffect(() => { document.documentElement.classList.toggle('lock', loading) }, [loading])
  useMotion(!loading)
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      {loading && <Preloader onDone={done} />}
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Header />
      <main id="main" className={loading ? 'pre' : ''}>
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Gallery onOpen={setLb} />
        <Ivory />
        <Speaking />
        <Certs />
        <Contact />
      </main>
      <Lightbox i={lb} setI={setLb} />
    </>
  )
}
