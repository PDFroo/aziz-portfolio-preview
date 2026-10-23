import { useEffect, useRef, useState, useCallback } from 'react'
import Lenis from 'lenis'
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'framer-motion'
import Pic, { has } from './components/Pic'
import Logo from './components/Logo'
import { Magnetic, Reveal, FadeUp, Cursor, ease } from './components/Fx'
import { profile, disciplines, projects, designWork, upcoming, certificates, talks, gallery } from './data/content'

const NAV = [['work', 'Work'], ['about', 'About'], ['upcoming', 'Upcoming'], ['certificates', 'Certificates'], ['gallery', 'Gallery'], ['contact', 'Contact']]
let lenis
const go = (e, id) => { e?.preventDefault(); const el = document.getElementById(id); if (!el) return; lenis ? lenis.scrollTo(el, { offset: -10, duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' }) }

function Intro({ done }) {
  return (
    <motion.div className="intro" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.9, ease } }} onAnimationComplete={() => {}}>
      <motion.div initial={{ scale: 0.7, opacity: 0, rotate: -90 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 1.4, ease }}><Logo size="xl" mono /></motion.div>
      <div className="intro-name"><motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, ease, delay: 0.5 }}>{profile.name}</motion.span></div>
      <motion.div className="intro-bar" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.6, ease, delay: 0.3 }} onAnimationComplete={done} />
    </motion.div>
  )
}

function Header() {
  const [open, setOpen] = useState(false); const [solid, setSolid] = useState(false)
  useEffect(() => { const f = () => setSolid(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])
  useEffect(() => { document.documentElement.classList.toggle('menu-open', open); open ? lenis?.stop() : lenis?.start() }, [open])
  return (
    <header className={`hdr ${solid ? 'solid' : ''}`}>
      <a href="#top" className="brand" onClick={(e) => { go(e, 'top'); setOpen(false) }} aria-label="Abdul Aziz Bin Harun, home"><Logo size="sm" /><span className="brand-t">Abdul Aziz<em>Bin Harun</em></span></a>
      <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
        {NAV.map(([id, l], i) => <a key={id} href={`#${id}`} style={{ '--i': i }} onClick={(e) => { go(e, id); setOpen(false) }}>{l}</a>)}
      </nav>
      <button className={`burger ${open ? 'x' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button>
    </header>
  )
}

function Hero() {
  const ref = useRef(null); const rm = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yImg = useTransform(scrollYProgress, [0, 1], ['0%', rm ? '0%' : '14%'])
  const yTxt = useTransform(scrollYProgress, [0, 1], ['0%', rm ? '0%' : '-18%'])
  const op = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-glow" aria-hidden="true" />
      <motion.div className="hero-copy" style={{ y: yTxt, opacity: op }}>
        <FadeUp className="eyebrow" delay={0.2}><span className="ln" />{profile.location}</FadeUp>
        <h1 className="hero-h">
          <Reveal delay={0.25}>{profile.first}</Reveal>
          <Reveal delay={0.38} className="gold-i"><em>{profile.last}</em></Reveal>
        </h1>
        <FadeUp as="ul" className="roles" delay={0.6}>{profile.roles.map((r) => <li key={r}>{r}</li>)}</FadeUp>
        <FadeUp as="p" className="hero-p" delay={0.72}>{profile.tagline}</FadeUp>
        <FadeUp className="cta" delay={0.85}>
          <Magnetic href="#work" className="btn btn-gold" onClick={(e) => go(e, 'work')}>View my work <span aria-hidden>→</span></Magnetic>
          <Magnetic href="#contact" className="btn btn-ghost" onClick={(e) => go(e, 'contact')}>Get in touch</Magnetic>
        </FadeUp>
      </motion.div>
      <motion.div className="hero-art" style={{ y: yImg }}>
        <motion.div className="halo" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease, delay: 0.2 }} aria-hidden="true" />
        <motion.div className="hero-cut" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease, delay: 0.35 }}>
          <Pic name="cut-navy" eager sizes="(max-width:900px) 80vw, 40vw" alt="Abdul Aziz Bin Harun in a navy suit" />
        </motion.div>
        <motion.div className="hero-badge" initial={{ opacity: 0, scale: 0.6, rotate: -60 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.5, ease, delay: 0.8 }}><Logo size="lg" /></motion.div>
      </motion.div>
      <a className="scroll-cue" href="#about" onClick={(e) => go(e, 'about')}><span>Scroll</span><i /></a>
    </section>
  )
}

function Marquee() {
  const words = ['Design', 'Code', 'Artificial Intelligence', 'Inspire']
  return <div className="marquee" aria-hidden="true"><div className="mq-track">{[0, 1, 2, 3].map((k) => <span key={k}>{words.map((w) => <b key={w}>{w}<i>✦</i></b>)}</span>)}</div></div>
}

function SecHead({ n, kicker, title, sub }) {
  return (
    <div className="sec-head">
      <FadeUp className="kicker"><span>{n}</span>{kicker}</FadeUp>
      <h2 className="h2"><Reveal>{title}</Reveal></h2>
      {sub && <FadeUp as="p" className="sub" delay={0.15}>{sub}</FadeUp>}
    </div>
  )
}

function About() {
  const ref = useRef(null); const rm = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], rm ? ['0%', '0%'] : ['-8%', '8%'])
  return (
    <section className="sec about" id="about" ref={ref}>
      <div className="about-img"><motion.div className="par" style={{ y }}><Pic name="portrait-navy" sizes="(max-width:900px) 92vw, 40vw" alt="Portrait of Abdul Aziz Bin Harun" /></motion.div><span className="frame" aria-hidden="true" /></div>
      <div className="about-copy">
        <SecHead n="01" kicker="About" title={<>Building useful things, <em>beautifully.</em></>} />
        <FadeUp as="p" className="lead">{profile.intro}</FadeUp>
        <div className="disc">
          {disciplines.map((d, i) => (
            <FadeUp key={d.n} className="disc-i" delay={i * 0.08}><span className="disc-n">{d.n}</span><h3>{d.title}</h3><p>{d.text}</p></FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

function Visual({ kind }) {
  return <div className={`vis vis-${kind}`} aria-hidden="true">{kind === 'cosmos' ? <><i className="planet" /><i className="orbit" /><b>Facts<br />In Seconds</b></> : <><i className="play" /><b>Blink<br />Beyond</b></>}</div>
}

function ProjectCard({ p, i }) {
  if (p.placeholder) return (
    <article className="pcard pcard--ph"><div className="pc-media ph-media"><span className="ph-plus">+</span></div>
      <div className="pc-body"><span className="pc-kind">{p.kind}</span><h3>{p.title}</h3><p>{p.text}</p><span className="ph-tag">Placeholder</span></div></article>
  )
  return (
    <article className="pcard">
      <div className="pc-media">{p.image && has(p.image) ? <Pic name={p.image} sizes="(max-width:900px) 88vw, 46vw" alt={`${p.title} website`} /> : <Visual kind={p.visual} />}<span className="pc-n">{String(i + 1).padStart(2, '0')}</span></div>
      <div className="pc-body"><span className="pc-kind">{p.kind}</span><h3>{p.title}</h3><p>{p.text}</p>
        <div className="pc-links">{p.links?.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="tlink">{l.label} <span aria-hidden>↗</span></a>)}</div></div>
    </article>
  )
}

function Work() {
  const ref = useRef(null); const track = useRef(null); const rm = useReducedMotion()
  const [dist, setDist] = useState(0); const [horiz, setHoriz] = useState(false)
  useEffect(() => {
    const m = () => { const h = innerWidth >= 900 && !rm; setHoriz(h); if (track.current) setDist(Math.max(0, track.current.scrollWidth - innerWidth)) }
    m(); addEventListener('resize', m); const t = setTimeout(m, 600); return () => { removeEventListener('resize', m); clearTimeout(t) }
  }, [rm])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist])
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <section className={`work ${horiz ? 'is-h' : ''}`} id="work" ref={ref} style={horiz ? { height: `calc(100vh + ${dist}px)` } : undefined}>
      <div className="work-sticky">
        <div className="work-head"><SecHead n="02" kicker="Selected work" title={<>Work that <em>works.</em></>} sub="Products, websites and content I have built and run." />
          {horiz && <div className="work-bar" aria-hidden="true"><motion.i style={{ scaleX: bar }} /></div>}</div>
        <motion.div className="work-track" ref={track} style={horiz ? { x } : undefined}>
          {projects.map((p, i) => <ProjectCard key={p.title + i} p={p} i={i} />)}
        </motion.div>
      </div>
    </section>
  )
}

function Design() {
  return (
    <section className="sec design" id="design">
      <SecHead n="03" kicker="Graphic design" title={<>Visual <em>craft.</em></>} sub="A curated selection of graphic design work, coming soon." />
      <div className="ph-grid">{designWork.map((d, i) => d.placeholder || !has(d.image)
        ? <FadeUp key={i} className="phc" delay={i * 0.08}><span className="ph-plus">+</span><b>{d.title}</b><small>Add to <code>designWork</code> in content.js</small></FadeUp>
        : <FadeUp key={i} className="dcard" delay={i * 0.08}><Pic name={d.image} alt={d.title} sizes="(max-width:700px) 92vw, 30vw" /><b>{d.title}</b></FadeUp>)}</div>
    </section>
  )
}

function Upcoming() {
  return (
    <section className="sec upcoming" id="upcoming">
      <SecHead n="04" kicker="Upcoming" title={<>What's <em>next.</em></>} />
      <ol className="tl">{upcoming.map((u, i) => (
        <FadeUp as="li" key={i} className={`tl-i ${u.placeholder ? 'is-ph' : ''}`} delay={i * 0.1}><span className="tl-dot" aria-hidden="true" /><span className="tl-l">{u.label}</span><h3>{u.title}</h3><p>{u.text}</p></FadeUp>
      ))}</ol>
    </section>
  )
}

function Speaker() {
  return (
    <section className="sec speaker" id="speaking">
      <div className="spk-bg" aria-hidden="true"><Pic name="wall-smile" sizes="100vw" alt="" /></div>
      <div className="spk-in">
        <SecHead n="05" kicker="Speaking" title={<>Words that <em>move</em> people.</>} sub="Motivational talks on learning, building with AI and believing in your own work." />
        <div className="talks">{talks.map((t, i) => (
          <FadeUp key={i} className={`talk ${t.placeholder ? 'is-ph' : ''}`} delay={i * 0.1}><small>{t.place}</small><b>{t.title}</b>{t.placeholder && <span className="ph-tag">Placeholder</span>}</FadeUp>))}</div>
        <Magnetic href="#contact" className="btn btn-gold" onClick={(e) => go(e, 'contact')}>Invite me to speak <span aria-hidden>→</span></Magnetic>
      </div>
    </section>
  )
}

function Certificates() {
  return (
    <section className="sec certs" id="certificates">
      <SecHead n="06" kicker="Certificates" title={<>Learning, <em>certified.</em></>} />
      <div className="cert-grid">{certificates.map((c, i) => (
        <FadeUp key={i} className={`cert ${c.placeholder ? 'is-ph' : ''}`} delay={i * 0.07}>
          <div className="cert-seal" aria-hidden="true">✦</div>
          {c.image && has(c.image) && <Pic name={c.image} alt={c.title} sizes="300px" />}
          <b>{c.title}</b><small>{c.placeholder ? 'Add to certificates in content.js' : `${c.issuer ?? ''} ${c.year ?? ''}`}</small>
        </FadeUp>))}</div>
    </section>
  )
}

function Gallery() {
  const [open, setOpen] = useState(-1)
  const close = useCallback(() => setOpen(-1), [])
  const step = useCallback((d) => setOpen((o) => (o + d + gallery.length) % gallery.length), [])
  useEffect(() => {
    if (open < 0) return; lenis?.stop()
    const k = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }
    addEventListener('keydown', k); return () => { removeEventListener('keydown', k); lenis?.start() }
  }, [open, close, step])
  return (
    <section className="sec gallery" id="gallery">
      <SecHead n="07" kicker="Gallery" title={<>In <em>frame.</em></>} />
      <div className="g-grid">{gallery.map((g, i) => (
        <FadeUp key={g.image} className={`g-i g-${i}`} delay={(i % 4) * 0.06}>
          <button onClick={() => setOpen(i)} aria-label={`Open photo: ${g.alt}`} data-cursor="hover"><Pic name={g.image} alt={g.alt} sizes="(max-width:700px) 46vw, 25vw" /></button>
        </FadeUp>))}</div>
      <AnimatePresence>{open >= 0 && (
        <motion.div className="lb" role="dialog" aria-modal="true" aria-label="Photo viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div key={open} className="lb-img" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }} onClick={(e) => e.stopPropagation()}>
            <Pic name={gallery[open].image} alt={gallery[open].alt} sizes="90vw" eager />
          </motion.div>
          <button className="lb-b lb-x" onClick={close} aria-label="Close" autoFocus>×</button>
          <button className="lb-b lb-p" onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous photo">←</button>
          <button className="lb-b lb-n" onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next photo">→</button>
          <span className="lb-c">{open + 1} / {gallery.length}</span>
        </motion.div>)}</AnimatePresence>
    </section>
  )
}

function Contact() {
  return (
    <section className="sec contact" id="contact">
      <Logo size="lg" />
      <FadeUp className="kicker"><span>08</span>Contact</FadeUp>
      <h2 className="h2 big"><Reveal>Let's create</Reveal><Reveal delay={0.1}><em>something remarkable.</em></Reveal></h2>
      <div className="cta center">
        <Magnetic href={`mailto:${profile.email}`} className="btn btn-gold">Email me <span aria-hidden>→</span></Magnetic>
        <Magnetic href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">LinkedIn ↗</Magnetic>
      </div>
      {profile.emailIsPlaceholder && <p className="note">Personal email placeholder: set <code>profile.email</code> in content.js</p>}
      <p className="note">For PDFroo enquiries: <a href="mailto:hello@pdfroo.com">hello@pdfroo.com</a></p>
    </section>
  )
}

export default function App() {
  const rm = useReducedMotion()
  const [intro, setIntro] = useState(() => !rm && !sessionStorage.getItem('aab-intro'))
  useEffect(() => {
    document.documentElement.classList.toggle('motion-ok', !rm)
    if (rm) return
    lenis = new Lenis({ duration: 1.2, smoothWheel: true })
    let id; const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }; id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy(); lenis = null }
  }, [rm])
  useEffect(() => { if (intro) { lenis?.stop(); document.documentElement.classList.add('lock') } else { lenis?.start(); document.documentElement.classList.remove('lock') } }, [intro])
  const done = () => setTimeout(() => { sessionStorage.setItem('aab-intro', '1'); setIntro(false) }, 350)
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <AnimatePresence>{intro && <Intro key="intro" done={done} />}</AnimatePresence>
      <Cursor />
      <Header />
      <main id="main">
        {!intro && <Hero />}
        {intro && <section className="hero" id="top" />}
        <Marquee />
        <About />
        <Work />
        <Design />
        <Upcoming />
        <Speaker />
        <Certificates />
        <Gallery />
        <Contact />
      </main>
      <footer className="ftr"><span>© {new Date().getFullYear()} {profile.name}</span><span>{profile.location}</span><a href="#top" onClick={(e) => go(e, 'top')}>Back to top ↑</a></footer>
    </>
  )
}
