// Browser crypto helpers for the static admin (WebCrypto only; nothing secret is shipped in the bundle).
const enc = new TextEncoder(), dec = new TextDecoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)));
const b64 = (b) => btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function pbkdf2Bits(password, salt, iter) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256);
}
/** Hash format: pbkdf2$sha256$<iter>$<saltHex>$<hashHex> (same as scripts/hash-admin-password.mjs). */
export async function makeHash(password, iter = 310000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$sha256$${iter}$${hex(salt)}$${hex(await pbkdf2Bits(password, salt, iter))}`;
}
export async function verifyHash(password, stored) {
  const [k, alg, iter, salt, want] = String(stored || "").split("$");
  if (k !== "pbkdf2" || alg !== "sha256") return false;
  const got = hex(await pbkdf2Bits(password, unhex(salt), +iter));
  let d = got.length ^ want.length; for (let i = 0; i < got.length; i++) d |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return d === 0;
}
async function aesKey(password, salt) {
  const bits = await pbkdf2Bits(password, salt, 200000);
  return crypto.subtle.importKey("raw", bits, "AES-GCM", false, ["encrypt", "decrypt"]);
}
/** Encrypt the GitHub token with a key derived from the admin password (stored only in this browser). */
export async function seal(password, text) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(password, salt), enc.encode(text));
  return JSON.stringify({ v: 1, s: b64(salt), i: b64(iv), c: b64(ct) });
}
export async function unseal(password, blob) {
  const o = JSON.parse(blob);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(o.i) }, await aesKey(password, unb64(o.s)), unb64(o.c));
  return dec.decode(pt);
}
export const toB64 = (bytes) => { let s = ""; const u = new Uint8Array(bytes); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
export const utf8ToB64 = (str) => toB64(enc.encode(str));
export const b64ToUtf8 = (s) => dec.decode(Uint8Array.from(atob(s.replace(/\n/g, "")), (c) => c.charCodeAt(0)));
