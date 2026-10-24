// Site content lives in /content/site.json (edited from the admin panel, committed to GitHub, baked in at build).
import site from "../../content/site.json";

const empty = {
  seo: {}, theme: {}, hero: {}, about: { stats: [] }, services: [], skills: [], projects: [], completedWork: [],
  upcoming: [], awards: [], videos: [], blogPosts: [], socialLinks: [], contact: {}, assets: {}
};
export const defaultContent = { ...empty, ...site };
