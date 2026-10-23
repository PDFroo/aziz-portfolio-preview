import opentype from 'opentype.js'; import fs from 'fs';
const L=(f)=>opentype.parse(fs.readFileSync('scripts/fonts/'+f).buffer);
const grot=L('InterTight.ttf'), bod=L('Bodoni.ttf'), bodI=L('BodoniIt.ttf');
const C=256, R=190, SIZE=21;
const text='ABDUL AZIZ BIN HARUN • DESIGN • CODE • AI • INSPIRE • ';
const items=[...text].map(ch=>ch==='•'?{sep:true,w:SIZE*1.1}:{ch,w:grot.getAdvanceWidth(ch,SIZE)});
const raw=items.reduce((a,b)=>a+b.w,0), circ=2*Math.PI*(R+SIZE*0.36), track=(circ-raw)/items.length;
let cur=0, parts=[];
for(const it of items){const deg=(cur+it.w/2+track/2)/circ*360;
  if(it.sep) parts.push(`<circle cx="${C}" cy="${C-R-SIZE*0.36}" r="2.2" transform="rotate(${deg.toFixed(3)} ${C} ${C})"/>`);
  else if(it.ch!==' ') parts.push(`<path transform="rotate(${deg.toFixed(3)} ${C} ${C}) translate(${C} ${C-R})" d="${grot.getPath(it.ch,-it.w/2,0,SIZE).toPathData(2)}"/>`);
  cur+=it.w+track;}
const defs=`<defs><linearGradient id="pt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f3ec"/><stop offset=".3" stop-color="#c9c5bc"/><stop offset=".55" stop-color="#8c8880"/><stop offset=".78" stop-color="#ece8df"/><stop offset="1" stop-color="#a7a39a"/></linearGradient>
<radialGradient id="disc" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#1d1b19"/><stop offset=".7" stop-color="#0d0c0b"/><stop offset="1" stop-color="#050505"/></radialGradient>
<radialGradient id="core" cx=".45" cy=".3" r=".85"><stop offset="0" stop-color="#2a2724"/><stop offset="1" stop-color="#0a0908"/></radialGradient><clipPath id="cc"><circle cx="${C}" cy="${C}" r="148"/></clipPath></defs>`;
const ring=`<g fill="url(#pt)">${parts.join('')}</g>`;
const frame=`<circle cx="${C}" cy="${C}" r="254" fill="url(#disc)"/><circle cx="${C}" cy="${C}" r="249" fill="none" stroke="url(#pt)" stroke-width="1.4"/><circle cx="${C}" cy="${C}" r="243" fill="none" stroke="url(#pt)" stroke-width=".5" opacity=".55"/><circle cx="${C}" cy="${C}" r="156" fill="none" stroke="url(#pt)" stroke-width="1.2"/><circle cx="${C}" cy="${C}" r="151" fill="none" stroke="url(#pt)" stroke-width=".5" opacity=".5"/>`;
const monoPath=(cx,cy,s)=>{ // Bodoni 'A' + italic 'A' overlap + small 'B'
  const a=bod.getPath('A',0,0,s), ai=bodI.getPath('A',0,0,s); const wa=bod.getAdvanceWidth('A',s), wi=bodI.getAdvanceWidth('A',s), wb=bod.getAdvanceWidth('B',s);
  const gap=-s*0.16, tot=wa+wi+wb+gap*2; let x=cx-tot/2;
  const d1=bod.getPath('A',x,cy,s).toPathData(2); x+=wa+gap; const d2=bodI.getPath('A',x,cy,s).toPathData(2); x+=wi+gap; const d3=bod.getPath('B',x,cy,s).toPathData(2);
  return d1+d2+d3;};
const mono=`<circle cx="${C}" cy="${C}" r="148" fill="url(#core)"/><path d="${monoPath(C,C+38,112)}" fill="url(#pt)"/><path d="M${C-34} ${C+64}h68" stroke="url(#pt)" stroke-width=".9"/>`;
const head=fs.readFileSync('src/assets/photos/cut-head-700.webp').toString('base64');
const portrait=`<circle cx="${C}" cy="${C}" r="148" fill="url(#core)"/><image href="data:image/webp;base64,${head}" x="${C-158}" y="${C-134}" width="316" height="316" clip-path="url(#cc)" preserveAspectRatio="xMidYMin slice"/>`;
const svg=(b)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${b}</svg>`;
const W=(f)=>(n,s)=>fs.writeFileSync(n,s);
fs.mkdirSync('public/brand',{recursive:true}); for(const f of fs.readdirSync('public/brand')) fs.unlinkSync('public/brand/'+f);
fs.writeFileSync('public/brand/logo-portrait.svg',svg(frame+portrait+ring));
fs.writeFileSync('public/brand/logo-monogram.svg',svg(frame+mono+ring));
fs.writeFileSync('public/brand/logo-ring.svg',svg(ring));
fs.writeFileSync('public/brand/logo-frame.svg',svg(frame));
fs.writeFileSync('public/brand/logo-core-monogram.svg',svg(mono));
fs.writeFileSync('public/brand/monogram.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}<path d="${monoPath(256,300,210)}" fill="url(#pt)"/></svg>`);
fs.writeFileSync('public/favicon.svg',svg(`<rect width="512" height="512" rx="96" fill="#0b0a09"/><circle cx="256" cy="256" r="214" fill="none" stroke="url(#pt)" stroke-width="10"/><path d="${monoPath(256,312,190)}" fill="url(#pt)"/>`));
// wordmark
const wm=bod.getPath('ABDUL AZIZ',0,96,110); const bb=wm.getBoundingBox(); const ww=bb.x2;
const sub='BIN HARUN'; const ss=30, tr=22; let sx=0, sp=''; const sw=[...sub].reduce((a,c)=>a+grot.getAdvanceWidth(c,ss)+tr,0)-tr; sx=(ww-sw)/2;
for(const c of sub){sp+=grot.getPath(c,sx,160,ss).toPathData(2); sx+=grot.getAdvanceWidth(c,ss)+tr;}
const wmsvg=(fill)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 0 ${Math.ceil(ww)+20} 180"><path d="${wm.toPathData(2)}" fill="${fill}"/><path d="${sp}" fill="${fill}"/></svg>`;
fs.writeFileSync('public/brand/wordmark-ivory.svg',wmsvg('#ede6da')); fs.writeFileSync('public/brand/wordmark-onyx.svg',wmsvg('#0b0a09'));
console.log('ok');
