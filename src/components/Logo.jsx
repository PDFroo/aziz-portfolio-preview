const base = import.meta.env.BASE_URL
/** v3 emblem: velvet disc, iridescent ring, gold-foil AAB monogram + animated foil sheen. */
export default function Logo({ size = 'md', className = '' }) {
  return (
    <span className={`emb emb--${size} ${className}`} aria-hidden="true">
      <img src={`${base}brand/logo-v3.svg`} alt="" width="512" height="512" />
      <span className="emb-sheen" />
    </span>
  )
}
