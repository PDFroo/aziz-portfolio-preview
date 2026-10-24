const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "");

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    if (path === "content" && request.method === "GET") return getContent(env);
    if (path === "content" && request.method === "PUT") return putContent(request, env);
    if (path === "login" && request.method === "POST") return login(request, env);
    if (path === "logout" && request.method === "POST") return logout(request, env);

    return json({ error: "Not found" }, 404);
  } catch (error) {
    return json({ error: error.message || "Server error" }, 500);
  }
}

async function getContent(env) {
  assertDb(env);
  const row = await env.DB.prepare("SELECT data FROM site_content WHERE id = 1").first();
  if (!row?.data) return json({});
  return json(JSON.parse(row.data));
}

async function putContent(request, env) {
  assertDb(env);
  await requireAuth(request, env);
  const body = await request.json();
  const data = JSON.stringify(body);

  await env.DB.prepare(
    "INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP) " +
      "ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP"
  )
    .bind(data)
    .run();

  return json({ ok: true });
}

async function login(request, env) {
  const body = await request.json();
  const username = env.ADMIN_USERNAME || "admin";
  const password = env.ADMIN_PASSWORD;

  if (!password) {
    return json({ error: "ADMIN_PASSWORD is not configured in Cloudflare." }, 401);
  }

  if (body.username !== username || body.password !== password) {
    return json({ error: "Invalid login." }, 401);
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  await env.DB.prepare("INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)").bind(token, expires).run();

  return json({ token });
}

async function logout(request, env) {
  assertDb(env);
  const token = getBearerToken(request);
  if (token) {
    await env.DB.prepare("DELETE FROM admin_sessions WHERE token = ?").bind(token).run();
  }
  return json({ ok: true });
}

async function requireAuth(request, env) {
  const token = getBearerToken(request);
  if (!token) throw new Error("Missing admin token.");

  const row = await env.DB.prepare("SELECT token FROM admin_sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP")
    .bind(token)
    .first();

  if (!row?.token) throw new Error("Invalid or expired admin token.");
}

function getBearerToken(request) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
}

function assertDb(env) {
  if (!env.DB) throw new Error("Cloudflare D1 binding DB is not configured.");
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...jsonHeaders, ...corsHeaders() }
  });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  };
}
