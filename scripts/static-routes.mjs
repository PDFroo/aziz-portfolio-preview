// GH Pages is static: give each SPA route its own index.html so deep links return 200.
import { mkdirSync, copyFileSync } from "node:fs";
import { readFileSync } from "node:fs";
const defaultContent = JSON.parse(readFileSync("content/site.json", "utf8"));
const routes = ["about", "services", "skills", "projects", "blog", "contact", "work", "upcoming", "awards", "videos", "admin", "admin/login", ...defaultContent.blogPosts.map((p) => `blog/${p.slug}`)];
for (const r of routes) { mkdirSync(`dist/${r}`, { recursive: true }); copyFileSync("dist/index.html", `dist/${r}/index.html`); }
copyFileSync("dist/index.html", "dist/404.html");
console.log("static routes:", routes.length);
