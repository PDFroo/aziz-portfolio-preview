import opentype from 'opentype.js'; import fs from 'fs';
const cinzel=opentype.parse(fs.readFileSync('scripts/fonts/Cinzel.ttf').buffer), corm=opentype.parse(fs.readFileSync('scripts/fonts/Cormorant.ttf').buffer);
const C=256, R=186, SIZE=27;
const text='ABDUL AZIZ BIN HARUN • DESIGN • CODE • AI • INSPIRE • ';
const items=[...text].map(ch=>ch==='•'?{sep:true,w:SIZE*0.9}:{ch,w:cinzel.getAdvanceWidth(ch,SIZE)});
const raw=items.reduce((a,b)=>a+b.w,0), circ=2*Math.PI*(R+SIZE*0.36);
const track=(circ-raw)/items.length;
let cur=0, parts=[];
for(const it of items){ const mid=cur+it.w/2+track/2; const deg=mid/circ*360;
  if(it.sep) parts.push(`<g transform="rotate(${deg.toFixed(3)} ${C} ${C})"><path d="M${C} ${C-R-SIZE*0.62}l4.2 4.2-4.2 4.2-4.2-4.2z"/></g>`);
  else if(it.ch!==' '){ const d=cinzel.getPath(it.ch,-it.w/2,0,SIZE).toPathData(2); parts.push(`<g transform="rotate(${deg.toFixed(3)} ${C} ${C}) translate(${C} ${C-R})"><path d="${d}"/></g>`);}
  cur+=it.w+track; }
const defs=`<defs>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e7c1"/><stop offset=".35" stop-color="#d8b26a"/><stop offset=".6" stop-color="#a97f3c"/><stop offset=".8" stop-color="#e9cf91"/><stop offset="1" stop-color="#b68a45"/></linearGradient>
<radialGradient id="disc" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#16203a"/><stop offset=".65" stop-color="#0b1122"/><stop offset="1" stop-color="#05070f"/></radialGradient>
<radialGradient id="core" cx=".45" cy=".35" r=".8"><stop offset="0" stop-color="#1c2a4b"/><stop offset="1" stop-color="#070b17"/></radialGradient>
<clipPath id="cc"><circle cx="${C}" cy="${C}" r="138"/></clipPath></defs>`;
const ring=`<g fill="url(#gold)">${parts.join('')}</g>`;
const ringsSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${ring}</svg>`;
const frame=`<circle cx="${C}" cy="${C}" r="252" fill="url(#disc)"/>
<circle cx="${C}" cy="${C}" r="247" fill="none" stroke="url(#gold)" stroke-width="2.2"/>
<circle cx="${C}" cy="${C}" r="240" fill="none" stroke="url(#gold)" stroke-width=".7" opacity=".6"/>
<circle cx="${C}" cy="${C}" r="150" fill="none" stroke="url(#gold)" stroke-width="2"/>
<circle cx="${C}" cy="${C}" r="143" fill="none" stroke="url(#gold)" stroke-width=".7" opacity=".6"/>`;
const mono=(()=>{const s=118; const g=['A','A','B'].map(c=>corm.getAdvanceWidth(c,s)); const kern=-14; const w=g.reduce((a,b)=>a+b)+kern*2; let x=C-w/2; let d='';
  ['A','A','B'].forEach((c,i)=>{d+=corm.getPath(c,x,C+40,s).toPathData(2);x+=g[i]+kern});
  return `<circle cx="${C}" cy="${C}" r="138" fill="url(#core)"/><path d="${d}" fill="url(#gold)"/><path d="M${C-46} ${C+66}h92" stroke="url(#gold)" stroke-width="1.2"/><path d="M${C} ${C+60}l5 6-5 6-5-6z" fill="url(#gold)"/>`;})();
const coreMono=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${mono}</svg>`;
const head=fs.readFileSync('src/assets/photos/cut-head-700.webp').toString('base64');
const portrait=`<circle cx="${C}" cy="${C}" r="138" fill="url(#core)"/><image href="data:image/webp;base64,${head}" x="${C-150}" y="${C-128}" width="300" height="${300*1}" clip-path="url(#cc)" preserveAspectRatio="xMidYMin slice"/>`;
const full=(core)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${frame}${core}${ring}</svg>`;
fs.mkdirSync('public/brand',{recursive:true});
fs.writeFileSync('public/brand/logo-monogram.svg',full(mono));
fs.writeFileSync('public/brand/logo-portrait.svg',full(portrait));
fs.writeFileSync('public/brand/logo-ring.svg',ringsSvg);
fs.writeFileSync('public/brand/logo-frame.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${frame}</svg>`);
fs.writeFileSync('public/brand/logo-core-monogram.svg',coreMono);
const fav=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}<circle cx="256" cy="256" r="252" fill="url(#disc)"/><circle cx="256" cy="256" r="236" fill="none" stroke="url(#gold)" stroke-width="14"/>${mono.replace('r="138" fill="url(#core)"','r="0"')}</svg>`;
fs.writeFileSync('public/favicon.svg',fav.replace(/translate\(0 0\)/,''));
console.log('ok');
