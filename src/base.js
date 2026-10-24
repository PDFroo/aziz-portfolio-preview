export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const STATIC = import.meta.env.VITE_STATIC === "1";
export const withBase = (p = "/") => BASE + p;
export const asset = (p = "") => (typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? BASE + p : p);
export const stripBase = (p) => (BASE && p.startsWith(BASE) ? p.slice(BASE.length) || "/" : p);
