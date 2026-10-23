import { src } from './Pic'
const base = import.meta.env.BASE_URL
/** Circular emblem: still frame + centre, slowly rotating platinum ring text, light sweep. */
export default function Logo({ size = 'md', mono = false, className = '' }) {
  return (
    <span className={`emblem emblem--${size} ${className}`} aria-hidden="true">
      <img className="emblem-layer" src={`${base}brand/logo-frame.svg`} alt="" width="512" height="512" />
      {mono ? <img className="emblem-layer" src={`${base}brand/logo-core-monogram.svg`} alt="" width="512" height="512" />
        : <span className="emblem-core"><img src={src('cut-head', 'webp', true)} alt="" width="700" height="700" /></span>}
      <img className="emblem-layer emblem-ring" src={`${base}brand/logo-ring.svg`} alt="" width="512" height="512" />
      <span className="emblem-shine" />
    </span>
  )
}
