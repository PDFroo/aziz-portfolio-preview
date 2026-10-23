import puppeteer from 'puppeteer-core'
const URL = process.argv[2] || 'http://localhost:4173/aziz-portfolio-preview/'
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
for (const [w, h, name, mobile] of [[1440, 900, 'desktop-1440', false], [390, 844, 'mobile-390', true]]) {
  const p = await b.newPage(); const errs = [], bad = []
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(e.message))
  p.on('response', (r) => r.status() >= 400 && bad.push(r.status() + ' ' + r.url()))
  await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 })
  await p.goto(URL, { waitUntil: 'networkidle0' }); await new Promise((r) => setTimeout(r, 5500))
  await p.screenshot({ path: `qa/${name}-intro-hero.png` })
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < H; y += h / 2) { await p.evaluate((y) => window.scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 160)) }
  await new Promise((r) => setTimeout(r, 800))
  // viewport shots at key sections
  for (const id of ['about', 'work', 'gallery', 'design', 'upcoming', 'speaking', 'certificates', 'contact']) {
    await p.evaluate((id) => window.scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY), id); await new Promise((r) => setTimeout(r, 1300))
    await p.screenshot({ path: `qa/${name}-${id}.png` })
  }
  await p.evaluate(() => window.scrollTo(0, 0)); await new Promise((r) => setTimeout(r, 800))
  await p.screenshot({ path: `qa/${name}-full.png`, fullPage: true })
  const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, wide: [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && !e.closest('.gal-track,.mq,.menu,.pprev') }).slice(0, 5).map((e) => e.className) }))
  console.log(name, JSON.stringify({ errs, bad, ov }))
  await p.close()
}
await b.close()
