import { STATIC } from "./base";
import { defaultContent } from "./data/defaultContent";

const STORAGE_KEY = "abdul-aziz-portfolio-content";
const TOKEN_KEY = "abdul-aziz-admin-token";
const LOCAL_PASSWORD_KEY = "abdul-aziz-admin-password";

export function applySeo(content) {
  const title = content.seo?.title || defaultContent.seo.title;
  const description = content.seo?.description || defaultContent.seo.description;
  const analytics = content.adminSettings?.analytics || {};

  document.title = title;
  const t = content.theme || {};
  if (/^#[0-9a-f]{6}$/i.test(t.green || "")) document.documentElement.style.setProperty("--green", t.green);
  if (/^#[0-9a-f]{6}$/i.test(t.gold || "")) document.documentElement.style.setProperty("--gold", t.gold);
  setMeta("description", description);
  setMeta("keywords", content.seo?.keywords || defaultContent.seo.keywords);
  setMeta("google-site-verification", analytics.searchConsole || "");
  setMeta("msvalidate.01", analytics.bing || "");
  setMetaProperty("og:title", title);
  setMetaProperty("og:description", description);
}

function setMeta(name, value) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!value) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

function setMetaProperty(property, value) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!value) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

export async function loadContent() {
  if (STATIC) return defaultContent;
  try {
    const response = await fetch("/api/content", { headers: { accept: "application/json" } });
    if (response.ok) {
      const data = await response.json();
      const merged = mergeContent(defaultContent, data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {
    // Local preview mode uses browser storage.
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultContent;

  try {
    return mergeContent(defaultContent, JSON.parse(stored));
  } catch {
    return defaultContent;
  }
}

export async function saveContent(content) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) return { mode: "preview" };

  try {
    const response = await fetch("/api/content", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify(content)
    });

    if (response.ok) return { mode: "cloud" };
  } catch {
    // Keep local preview save.
  }

  return { mode: "preview" };
}

export async function login(username, password) {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      return { ok: true, mode: "cloud" };
    }
  } catch {
    // Local preview accepts any non-empty password so the UI can be tested.
  }

  const localPassword = localStorage.getItem(LOCAL_PASSWORD_KEY);
  if (localPassword) {
    if (username === "admin" && password === localPassword) {
      localStorage.setItem(TOKEN_KEY, "preview-token");
      return { ok: true, mode: "preview" };
    }
    return { ok: false, message: "Invalid preview password." };
  }

  if (password.trim().length >= 4) {
    localStorage.setItem(TOKEN_KEY, "preview-token");
    return { ok: true, mode: "preview" };
  }

  return { ok: false, message: "Password must be at least 4 characters." };
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function changePreviewPassword(currentPassword, nextPassword) {
  const localPassword = localStorage.getItem(LOCAL_PASSWORD_KEY);
  if (localPassword && currentPassword !== localPassword) {
    return { ok: false, message: "Current preview password is incorrect." };
  }

  if (nextPassword.trim().length < 10) {
    return { ok: false, message: "New password must be at least 10 characters." };
  }

  localStorage.setItem(LOCAL_PASSWORD_KEY, nextPassword);
  return { ok: true, message: "Preview admin password updated." };
}

function mergeContent(base, incoming) {
  return {
    ...base,
    ...incoming,
    seo: { ...base.seo, ...incoming.seo },
    hero: { ...base.hero, ...incoming.hero },
    about: { ...base.about, ...incoming.about },
    contact: { ...base.contact, ...incoming.contact },
    assets: { ...base.assets, ...incoming.assets },
    theme: { ...base.theme, ...incoming.theme },
    services: incoming.services || base.services,
    completedWork: incoming.completedWork || base.completedWork,
    upcoming: incoming.upcoming || base.upcoming,
    awards: incoming.awards || base.awards,
    videos: incoming.videos || base.videos,
    skills: incoming.skills || base.skills,
    projects: incoming.projects || base.projects,
    blogPosts: incoming.blogPosts || base.blogPosts,
    socialLinks: incoming.socialLinks || base.socialLinks
  };
}
