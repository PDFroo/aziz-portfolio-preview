import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export const ease = [0.22, 1, 0.36, 1]
export const useFine = () => {
  const [f, setF] = useState(false)
  useEffect(() => { const m = matchMedia('(pointer:fine) and (min-width:900px)'); setF(m.matches); const h = () => setF(m.matches); m.addEventListener('change', h); return () => m.removeEventListener('change', h) }, [])
  return f
}

export function Magnetic({ children, strength = 0.35, className = '', ...rest }) {
  const ref = useRef(null); const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18 }), sy = useSpring(y, { stiffness: 220, damping: 18 })
  const fine = useFine()
  const move = (e) => { if (!fine) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * strength); y.set((e.clientY - r.top - r.height / 2) * strength) }
  const leave = () => { x.set(0); y.set(0) }
  const Tag = rest.href ? motion.a : motion.button
  return <Tag ref={ref} className={`mag ${className}`} style={{ x: sx, y: sy }} onMouseMove={move} onMouseLeave={leave} data-cursor="hover" {...rest}>{children}</Tag>
}

/** Masked line-by-line text reveal (observer on the unclipped wrapper). */
export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.span className={`rv ${className}`} initial="h" whileInView="v" viewport={{ once: true, margin: '-6% 0px' }}>
      <motion.span className="rv-i" variants={{ h: { y: '110%' }, v: { y: '0%', transition: { duration: 1.1, ease, delay } } }}>{children}</motion.span>
    </motion.span>
  )
}
export function FadeUp({ children, delay = 0, className = '', as = 'div', ...rest }) {
  const M = motion[as]
  return <M className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.9, ease, delay }} {...rest}>{children}</M>
}

export function Cursor() {
  const fine = useFine(); const dot = useRef(null), ring = useRef(null)
  useEffect(() => {
    if (!fine) return
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf
    const mv = (e) => { x = e.clientX; y = e.clientY; const t = e.target.closest?.('a,button,[data-cursor]'); ring.current?.classList.toggle('on', !!t); document.documentElement.classList.add('has-cursor') }
    const loop = () => { rx += (x - rx) * 0.16; ry += (y - ry) * 0.16; if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`; if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`; raf = requestAnimationFrame(loop) }
    addEventListener('mousemove', mv); loop()
    return () => { removeEventListener('mousemove', mv); cancelAnimationFrame(raf); document.documentElement.classList.remove('has-cursor') }
  }, [fine])
  if (!fine) return null
  return <><div className="cur-dot" ref={dot} aria-hidden="true" /><div className="cur-ring" ref={ring} aria-hidden="true" /></>
}
