const files = import.meta.glob('../assets/{photos,work}/*.{webp,avif}', { eager: true, import: 'default' })
const idx = {}
for (const [p, url] of Object.entries(files)) {
  const m = p.match(/\/([^/]+)-(\d+)\.(webp|avif)$/)
  if (!m) continue
  const [, name, w, ext] = m
  ;((idx[name] ||= {})[ext] ||= []).push({ w: +w, url })
}
export const has = (name) => !!idx[name]
export const src = (name, ext = 'webp', small = false) => { const l = [...(idx[name]?.[ext] || [])].sort((a, b) => (small ? a.w - b.w : b.w - a.w)); return l[0]?.url }
const set = (l) => l.sort((a, b) => a.w - b.w).map((x) => `${x.url} ${x.w}w`).join(', ')

export default function Pic({ name, alt = '', sizes = '100vw', className, eager, ...rest }) {
  const e = idx[name]
  if (!e) return null
  const small = [...e.webp].sort((a, b) => a.w - b.w)[0]
  return (
    <picture className={className}>
      {e.avif && <source type="image/avif" srcSet={set([...e.avif])} sizes={sizes} />}
      <img src={small.url} srcSet={set([...e.webp])} sizes={sizes} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchpriority={eager ? 'high' : undefined} {...rest} />
    </picture>
  )
}
