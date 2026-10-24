# Abdul Aziz Bin Harun Portfolio

Premium React portfolio website with a permanent admin panel target for Cloudflare Pages + D1.

## Stack

- React + Vite frontend
- Cloudflare Pages hosting
- Cloudflare Pages Functions API
- Cloudflare D1 database
- GitHub for code backup

## Local Preview

```bash
npm install
npm run dev
```

The public site works immediately. The admin panel also works in local preview mode with browser storage.

## Cloudflare Deployment

1. Push this project to GitHub.
2. Create a Cloudflare Pages project from the GitHub repo.
3. Build command: `npm run build`
4. Build output: `dist`
5. Create a D1 database named `abdul_aziz_portfolio`.
6. Run `db/schema.sql` on the D1 database.
7. Bind the D1 database to Pages with binding name `DB`.
8. Add environment variables:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
9. Deploy.

## Admin

Open `/admin`.

You can manage:

- Hero section
- About section
- Services
- Skills
- Projects
- Blog posts
- Social links
- SEO title, description, and keywords
- Contact information

If the Cloudflare API is not configured, the admin panel falls back to local preview mode.
