import puppeteer from 'puppeteer-core'; import fs from 'fs';
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p=await b.newPage();
const shot=async(svg,out,w,h=w,bg='transparent')=>{await p.setViewport({width:w,height:h});
 await p.setContent(`<html><body style="margin:0;background:${bg}"><img src="data:image/svg+xml;base64,${fs.readFileSync(svg).toString('base64')}" style="width:${Math.min(w,h)}px;height:${Math.min(w,h)}px;display:block;margin:auto"></body></html>`);
 await new Promise(r=>setTimeout(r,300)); await p.screenshot({path:out,omitBackground:true});};
for(const s of [512,1024]){await shot('public/brand/logo-portrait.svg',`public/brand/logo-portrait-${s}.png`,s);await shot('public/brand/logo-monogram.svg',`public/brand/logo-monogram-${s}.png`,s);}
await shot('public/favicon.svg','public/favicon-32.png',32);await shot('public/favicon.svg','public/apple-touch-icon.png',180);await shot('public/favicon.svg','public/icon-512.png',512);
// OG
await p.setViewport({width:1200,height:630});
const lg=fs.readFileSync('public/brand/logo-portrait.svg').toString('base64'); const cut=fs.readFileSync('src/assets/photos/cut-navy-700.webp').toString('base64');
const cf=fs.readFileSync('scripts/fonts/Cormorant.ttf').toString('base64');
await p.setContent(`<html><head><style>@font-face{font-family:C;src:url(data:font/ttf;base64,${cf})}body{margin:0;width:1200px;height:630px;background:radial-gradient(80% 90% at 75% 40%,#17213d,#060810 70%);font-family:C;color:#f3e9d2;overflow:hidden;position:relative}
h1{position:absolute;left:80px;top:170px;font-size:86px;font-weight:500;line-height:.95;margin:0}h1 i{color:#d8b26a}p{position:absolute;left:84px;top:400px;font:600 17px sans-serif;letter-spacing:.32em;color:#c9a45c;margin:0}
.c{position:absolute;right:40px;bottom:0;height:600px}.l{position:absolute;left:80px;top:60px;width:84px}</style></head><body><img class=l src="data:image/svg+xml;base64,${lg}"><h1>Abdul Aziz<br><i>Bin Harun</i></h1><p>DESIGN · CODE · AI · INSPIRE</p><img class=c src="data:image/webp;base64,${cut}"></body></html>`);
await new Promise(r=>setTimeout(r,500)); await p.screenshot({path:'public/og-image.jpg',type:'jpeg',quality:88});
await b.close();
