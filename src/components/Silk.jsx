import { useEffect, useRef } from 'react'
/* Jewel palettes per section world: [base, a, b, c] */
export const WORLDS = [
  [[0.03, 0.02, 0.07], [0.42, 0.16, 0.78], [0.10, 0.32, 0.95], [0.95, 0.72, 0.36]], // amethyst/sapphire (hero)
  [[0.01, 0.05, 0.04], [0.02, 0.55, 0.40], [0.10, 0.75, 0.62], [0.90, 0.75, 0.40]], // emerald
  [[0.01, 0.02, 0.08], [0.07, 0.25, 0.85], [0.30, 0.55, 1.00], [0.62, 0.30, 0.95]], // sapphire
  [[0.04, 0.01, 0.07], [0.55, 0.15, 0.80], [0.85, 0.30, 0.70], [0.25, 0.20, 0.90]], // amethyst
  [[0.07, 0.01, 0.03], [0.75, 0.05, 0.22], [0.95, 0.30, 0.35], [0.95, 0.65, 0.30]], // ruby
  [[0.02, 0.04, 0.04], [0.05, 0.50, 0.42], [0.85, 0.65, 0.25], [0.20, 0.35, 0.90]], // emerald-gold
  [[0.05, 0.02, 0.06], [0.70, 0.10, 0.35], [0.45, 0.15, 0.85], [0.95, 0.75, 0.40]], // ruby-amethyst
]
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const FS = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform float s;uniform vec3 c0,c1,c2,c3;
float h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
float T=t*.06+s*.6;vec2 q=p+(m-.5)*.35;
for(int i=1;i<5;i++){float fi=float(i);q+=vec2(.55/fi*sin(fi*q.y*1.7+T*fi+.3*fi),.45/fi*cos(fi*q.x*1.5+T*1.3*fi));}
float a=.5+.5*sin(q.x*1.2+q.y*.8+T*2.),b=.5+.5*cos(q.y*1.6-T),k=.5+.5*sin((q.x-q.y)*2.6+T*3.);
vec3 col=mix(c1,c2,a);col=mix(col,c3,pow(k,6.)*.55);
float silk=pow(.5+.5*sin(q.x*3.+q.y*2.+T*2.5),14.);
vec3 iri=.5+.5*cos(6.283*(vec3(0.,.33,.67)+a+q.x*.15));
col+=silk*(.35*iri+.25);
float d=length(p-(m-.5)*vec2(1.6,-1.)*.6);col+=c3*.12*exp(-d*3.);
float v=smoothstep(1.35,.2,length(uv-.5)*1.6);
col=mix(c0,col,(.32+.38*b)*v);col+=(n(gl_FragCoord.xy*.9)-.5)*.035;
gl_FragColor=vec4(col,1.);}`
/** Fixed full-page liquid-silk shader. world: index into WORLDS (changes animate). */
export default function Silk({ world = 0, onFail }) {
  const cv = useRef(null), st = useRef({ w: world })
  st.current.w = world
  useEffect(() => {
    const c = cv.current
    const gl = c.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) { onFail?.(); return }
    const sh = (ty, src) => { const o = gl.createShader(ty); gl.shaderSource(o, src); gl.compileShader(o); return o }
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { onFail?.(); return }
    gl.useProgram(pr)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = Object.fromEntries(['r', 't', 'm', 's', 'c0', 'c1', 'c2', 'c3'].map((k) => [k, gl.getUniformLocation(pr, k)]))
    const mob = innerWidth < 900, scale = mob ? 0.35 : 0.5
    const size = () => { c.width = Math.round(innerWidth * scale); c.height = Math.round(innerHeight * scale); gl.viewport(0, 0, c.width, c.height) }
    size(); addEventListener('resize', size)
    const cur = WORLDS[world].map((v) => [...v]); const mouse = [0.5, 0.5], tm = [0.5, 0.5]
    const mv = (e) => { tm[0] = e.clientX / innerWidth; tm[1] = e.clientY / innerHeight }
    addEventListener('pointermove', mv, { passive: true })
    let raf, last = performance.now(), slow = 0, frames = 0, t0 = performance.now(), vis = true
    const vh = () => { vis = !document.hidden; if (vis) { last = performance.now(); raf = requestAnimationFrame(loop) } }
    document.addEventListener('visibilitychange', vh)
    function loop(now) {
      if (!vis) return
      const dt = Math.min(now - last, 100); last = now; frames++
      if (frames < 90 && dt > 45) slow++
      if (slow > 30) { cancelAnimationFrame(raf); onFail?.(); return }
      const tgt = WORLDS[st.current.w] || WORLDS[0], f = 1 - Math.pow(0.96, dt / 16)
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) cur[i][j] += (tgt[i][j] - cur[i][j]) * f
      mouse[0] += (tm[0] - mouse[0]) * 0.04; mouse[1] += (tm[1] - mouse[1]) * 0.04
      gl.uniform2f(U.r, c.width, c.height); gl.uniform1f(U.t, (now - t0) / 1000 * 10); gl.uniform2f(U.m, mouse[0], mouse[1])
      gl.uniform1f(U.s, scrollY / innerHeight)
      ;['c0', 'c1', 'c2', 'c3'].forEach((k, i) => gl.uniform3fv(U[k], cur[i]))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop); c.classList.add('on')
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', mv); document.removeEventListener('visibilitychange', vh); gl.getExtension('WEBGL_lose_context')?.loseContext() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={cv} className="silk" aria-hidden="true" />
}
