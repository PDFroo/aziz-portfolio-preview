import puppeteer from 'puppeteer-core'; import fs from 'fs';
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const p=await b.newPage();
const b64=(f)=>fs.readFileSync(f).toString('base64');
const shot=async(svg,out,w,h=w)=>{await p.setViewport({width:w,height:h});
 await p.setContent(`<body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${b64(svg)}" style="width:${w}px;height:${h}px;display:block;object-fit:contain"></body>`);
 await new Promise(r=>setTimeout(r,250)); await p.screenshot({path:out,omitBackground:true});};
for(const s of [512,1024]){await shot('public/brand/logo-portrait.svg',`public/brand/logo-portrait-${s}.png`,s);await shot('public/brand/logo-monogram.svg',`public/brand/logo-monogram-${s}.png`,s);}
await shot('public/brand/wordmark-ivory.svg','public/brand/wordmark-ivory.png',1400,240);
await shot('public/favicon.svg','public/favicon-32.png',32);await shot('public/favicon.svg','public/apple-touch-icon.png',180);await shot('public/favicon.svg','public/icon-512.png',512);
await p.setViewport({width:1200,height:630});
const bf=b64('scripts/fonts/Bodoni.ttf'), gf=b64('scripts/fonts/InterTight.ttf');
await p.setContent(`<html><head><style>@font-face{font-family:B;src:url(data:font/ttf;base64,${bf})}@font-face{font-family:G;src:url(data:font/ttf;base64,${gf})}
body{margin:0;width:1200px;height:630px;background:#0b0a09;color:#ede6da;overflow:hidden;position:relative;font-family:G}
h1{position:absolute;left:0;right:0;top:120px;text-align:center;font:400 150px/0.86 B;letter-spacing:-.02em;margin:0;font-variation-settings:'opsz' 96}
.c{position:absolute;left:50%;transform:translateX(-50%);bottom:0;height:470px;filter:grayscale(.2)}.l{position:absolute;right:48px;bottom:48px;width:120px}
.t{position:absolute;left:48px;top:40px;right:48px;display:flex;justify-content:space-between;font-size:13px;letter-spacing:.3em;color:#b9b5ac}
.f{position:absolute;left:48px;bottom:48px;font-size:13px;letter-spacing:.3em;color:#b9b5ac}</style></head><body>
<div class=t><span>PORTFOLIO</span><span>DHAKA, BANGLADESH</span></div><h1>ABDUL AZIZ<br>BIN HARUN</h1>
<img class=c src="data:image/webp;base64,${b64('src/assets/photos/cut-navy-700.webp')}"><div class=f>DESIGN · CODE · AI · INSPIRE</div><img class=l src="data:image/svg+xml;base64,${b64('public/brand/logo-monogram.svg')}"></body></html>`);
await new Promise(r=>setTimeout(r,500)); await p.screenshot({path:'public/og-image.jpg',type:'jpeg',quality:88}); await b.close();
