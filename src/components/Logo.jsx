import { src } from './Pic'
const base = import.meta.env.BASE_URL
/** Animated emblem: still frame + centre, slowly rotating gold text ring, shimmer sweep (CSS; honours reduced motion). */
export default function Logo({ size = 'md', mono = false, className = '' }) {
  return (
    <span className={`emblem emblem--${size} ${className}`} aria-hidden="true">
      <img className="emblem-layer" src={`${base}brand/logo-frame.svg`} alt="" />
      {mono ? <img className="emblem-layer" src={`${base}brand/logo-core-monogram.svg`} alt="" />
        : <span className="emblem-core"><img src={src('cut-head', 'webp', true)} alt="" /></span>}
      <img className="emblem-layer emblem-ring" src={`${base}brand/logo-ring.svg`} alt="" />
      <span className="emblem-shine" />
    </span>
  )
}
