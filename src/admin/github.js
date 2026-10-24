// GitHub REST client for the static admin. Every content save is one commit to main;
// .github/workflows/deploy.yml rebuilds the site and publishes it to GitHub Pages.
import { b64ToUtf8, seal, unseal, utf8ToB64, toB64 } from "./crypto";

export const REPO = "PDFroo/aziz-portfolio-preview";
export const BRANCH = "main";
export const CONTENT_PATH = "content/site.json";
export const AUTH_PATH = "content/admin.json";
export const WORKFLOW = "deploy.yml";
const API = "https://api.github.com";
const TOKEN_KEY = "aziz-admin-sealed-token"; // AES-GCM encrypted with the admin password
const SESSION_KEY = "aziz-admin-session";    // decrypted token, this tab only, 12 h
const SESSION_HOURS = 12;

let token = "";
export function restoreSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (s && s.exp > Date.now() && s.t) { token = s.t; return true; }
  } catch { /* ignore */ }
  return false;
}
function startSession(t) { token = t; sessionStorage.setItem(SESSION_KEY, JSON.stringify({ t, exp: Date.now() + SESSION_HOURS * 3600e3 })); }
export function logout() { token = ""; sessionStorage.removeItem(SESSION_KEY); }
export const hasSealedToken = () => !!localStorage.getItem(TOKEN_KEY);
export function forgetDevice() { localStorage.removeItem(TOKEN_KEY); logout(); }
export async function unlock(password) { startSession(await unseal(password, localStorage.getItem(TOKEN_KEY))); }
export async function connect(password, t) {
  t = t.trim();
  const repo = await req("GET", `/repos/${REPO}`, undefined, t);
  if (!repo.permissions?.push) throw new Error("This token cannot write to the repository. Give it Contents: Read and write.");
  localStorage.setItem(TOKEN_KEY, await seal(password, t));
  startSession(t);
}
export async function resealToken(newPassword) { localStorage.setItem(TOKEN_KEY, await seal(newPassword, token)); }

async function req(method, path, body, t = token) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${t}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404 && method === "GET") return null;
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new Error("GitHub token is invalid or expired. Use Security → Replace GitHub token.");
    if (res.status === 409) throw new Error("Someone saved in the meantime. Reload the admin and try again.");
    throw new Error(data?.message || `GitHub request failed (${res.status})`);
  }
  return data;
}
const contents = (p) => `/repos/${REPO}/contents/${p.split("/").map(encodeURIComponent).join("/")}`;

export async function getJson(path) {
  const d = await req("GET", `${contents(path)}?ref=${BRANCH}&t=${Date.now()}`);
  if (!d) return { data: null, sha: null };
  return { data: JSON.parse(b64ToUtf8(d.content)), sha: d.sha };
}
export async function putJson(path, data, sha, message) {
  const r = await req("PUT", contents(path), { message, branch: BRANCH, sha: sha || undefined, content: utf8ToB64(JSON.stringify(data, null, 2) + "\n") });
  return r.content.sha;
}
/** Upload an image (already compressed) to public/uploads; [skip ci] so only the content save deploys. */
export async function putImage(name, bytes) {
  const path = `public/uploads/${name}`;
  await req("PUT", contents(path), { message: `[skip ci] admin: upload ${name}`, branch: BRANCH, content: toB64(bytes) });
  return `/uploads/${name}`;
}
export async function latestRun() {
  const d = await req("GET", `/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?branch=${BRANCH}&per_page=1`);
  return d?.workflow_runs?.[0] || null;
}
export async function lastCommit() {
  const d = await req("GET", `/repos/${REPO}/commits?sha=${BRANCH}&path=${CONTENT_PATH}&per_page=1`);
  return d?.[0] || null;
}
export const rawUrl = (p) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${p}`;
/** Public, token-free read of the current password hash (so a new device can verify the password). */
export async function fetchAuth() {
  const r = await fetch(`${rawUrl(AUTH_PATH)}?t=${Date.now()}`).catch(() => null);
  return r && r.ok ? r.json() : null;
}
