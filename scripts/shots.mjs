import puppeteer from 'puppeteer-core'; import sharp from 'sharp';
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();
for(const [u,n] of [['https://pdfroo.com','pdfroo'],['https://pdfroo.github.io/success-with-harun-preview/','success']]){
 await p.setViewport({width:1440,height:900});await p.goto(u,{waitUntil:'networkidle2',timeout:60000});await new Promise(r=>setTimeout(r,4500)); await p.evaluate(()=>{[...document.querySelectorAll('button')].find(x=>/decline/i.test(x.textContent))?.click()}); await new Promise(r=>setTimeout(r,800));
 const buf=await p.screenshot();for(const w of [800,1400]){await sharp(buf).resize(w).webp({quality:80}).toFile(`src/assets/work/${n}-${w}.webp`);await sharp(buf).resize(w).avif({quality:55}).toFile(`src/assets/work/${n}-${w}.avif`);}}
await b.close();
