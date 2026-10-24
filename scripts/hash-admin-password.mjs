// Usage: node scripts/hash-admin-password.mjs '<password>'  → prints JSON for content/admin.json
import { webcrypto as c } from "node:crypto";
const pw = process.argv[2]; if (!pw) { console.error("password required"); process.exit(1); }
const iter = 310000, salt = c.getRandomValues(new Uint8Array(16));
const key = await c.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
const bits = await c.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256);
const hex = (b) => Buffer.from(b).toString("hex");
console.log(JSON.stringify({ hash: `pbkdf2$sha256$${iter}$${hex(salt)}$${hex(bits)}`, updatedAt: new Date().toISOString() }, null, 2));
