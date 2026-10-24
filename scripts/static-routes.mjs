// GH Pages is static: give each SPA route its own index.html so deep links return 200.
import { mkdirSync, copyFileSync } from "node:fs";
import { defaultContent } from "../src/data/defaultContent.js";
const routes = ["about", "services", "skills", "projects", "blog", "contact", "admin", ...defaultContent.blogPosts.map((p) => `blog/${p.slug}`)];
for (const r of routes) { mkdirSync(`dist/${r}`, { recursive: true }); copyFileSync("dist/index.html", `dist/${r}/index.html`); }
copyFileSync("dist/index.html", "dist/404.html");
console.log("static routes:", routes.length);
