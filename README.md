# Abdul Aziz Bin Harun · Portfolio

React + Vite. Edit **src/data/content.js** to fill placeholders (projects, design work, certificates, talks, upcoming, personal email).
Images: drop `name-640.webp`/`name-1200.webp` (and optional `.avif`) into `src/assets/photos` and reference `name`.

- `npm run dev` / `npm run build` (base path defaults to `/aziz-portfolio-preview/`; set `BASE=/` for a root domain)
- `npm run deploy` publishes `dist` to the `gh-pages` branch
- Logo: `public/brand/*.svg|png` (regenerate with `node scripts/logo.mjs && node scripts/render.mjs`)
- Before going public: remove `<meta name="robots" content="noindex">` in index.html.
