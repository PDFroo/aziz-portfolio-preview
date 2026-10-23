/** Splits text into masked words for GSAP reveals. parts: string | (string | [string,'i'])[] */
export default function Split({ parts, as: Tag = 'span', className = '', mode = 'rise', ...rest }) {
  const list = Array.isArray(parts) ? parts : [parts]
  let k = 0
  return (
    <Tag className={`split split--${mode} ${className}`} {...rest}>
      {list.map((seg) => {
        const [t, it] = Array.isArray(seg) ? seg : [seg]
        return t.split(/(\s+)/).map((w) => {
          if (/^\s+$/.test(w)) return ' '
          if (!w) return null
          const word = <span className="w" key={k++}><span className="wi">{w}</span></span>
          return it ? <em key={k++}>{word}</em> : word
        })
      })}
    </Tag>
  )
}
