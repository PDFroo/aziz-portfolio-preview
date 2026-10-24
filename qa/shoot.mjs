import { chromium } from 'playwright'
const url = process.argv[2] || 'http://localhost:4173/aziz-portfolio-preview/', pre = process.argv[3] || 'v3'
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] })
for (const [tag, w, h] of [['desktop-1440', 1440, 900], ['mobile-390', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(e.message))
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(3500)
  await p.screenshot({ path: `qa/${pre}-${tag}-hero.png` })
  for (const id of (process.argv[4]||'work,certificates,contact').split(',')) {
    await p.evaluate((id) => { const y = document.getElementById(id).getBoundingClientRect().top + scrollY; window.scrollTo(0, y + (id==='work' && innerWidth>=1024 ? 600 : -64)) }, id)
    await p.waitForTimeout(2500); await p.screenshot({ path: `qa/${pre}-${tag}-${id}.png` })
  }
  console.log(tag, 'errors:', JSON.stringify(errs), 'silk:', await p.evaluate(() => !!document.querySelector('.silk.on')))
}
await b.close()
