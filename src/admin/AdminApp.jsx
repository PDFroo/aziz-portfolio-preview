import { useCallback, useEffect, useRef, useState } from "react";
import { makeHash, verifyHash } from "./crypto";
import * as gh from "./github";
import { youtubeId } from "../components/Showcase";
import bundledAuth from "../../content/admin.json";
import { BASE, withBase } from "../base";
import "./admin.css";

const NAV = [
  ["dashboard", "Dashboard", "D"], ["branding", "Branding & theme", "B"], ["home", "Homepage", "H"], ["services", "Services & skills", "S"],
  ["completedWork", "Completed work", "W"], ["projects", "Projects", "P"], ["upcoming", "Upcoming projects", "U"], ["awards", "Awards & certificates", "A"],
  ["videos", "YouTube videos", "Y"], ["blog", "Blog", "J"], ["social", "Social & contact", "C"], ["deploy", "Deploy status", "R"], ["security", "Security", "K"],
];
const LISTS = {
  completedWork: { title: "Completed work", hint: "Finished projects / client work. Shown in the “Completed Work” section and /work page.", fields: [["title", "Title"], ["category", "Category / role"], ["year", "Year"], ["description", "Description", "textarea"], ["url", "Link (optional)"], ["image", "Image", "image"]] },
  projects: { title: "Projects", hint: "Your own ventures. Shown in “Projects & Case Studies” and /projects.", fields: [["title", "Title"], ["category", "Category"], ["description", "Description", "textarea"], ["url", "Link (optional)"], ["image", "Image", "image"]] },
  upcoming: { title: "Upcoming projects", hint: "Planned or in-progress work. Shown in the “Upcoming” section.", fields: [["title", "Title"], ["status", "Status (e.g. In progress, Planned)"], ["description", "Description", "textarea"], ["image", "Image (optional)", "image"]] },
  awards: { title: "Awards & certificates", hint: "Shown as gold-framed cards in “Awards & Certificates”. The section appears once you add one.", fields: [["title", "Title"], ["issuer", "Issued by"], ["year", "Year"], ["description", "Short note (optional)", "textarea"], ["url", "Verify link (optional)"], ["image", "Certificate / award image", "image"]] },
  videos: { title: "YouTube videos", hint: "Paste any YouTube link (watch, youtu.be, shorts). It is embedded in the “Videos” section.", fields: [["url", "YouTube URL"], ["title", "Title"], ["description", "Description (optional)", "textarea"]] },
  blogPosts: { title: "Blog posts", hint: "Published posts appear on the home page and /blog.", fields: [["title", "Title"], ["slug", "URL slug"], ["createdAt", "Date (YYYY-MM-DD)"], ["excerpt", "Excerpt", "textarea"], ["body", "Content", "textarea"], ["published", "Published", "toggle"]] },
  socialLinks: { title: "Social links", hint: "Shown on the contact card. Use full links (https://…).", fields: [["label", "Label"], ["url", "URL"]] },
  "about.stats": { title: "About stats", hint: "Small highlight cards next to the About text.", fields: [["value", "Value"], ["label", "Label"]] },
  services: { title: "Services", hint: "Service cards on the home page and /services.", fields: [["title", "Title"], ["description", "Description", "textarea"]] },
};
const get = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
const set = (o, p, v) => { const c = structuredClone(o); const ks = p.split("."); let t = c; ks.slice(0, -1).forEach((k) => { t[k] ??= {}; t = t[k]; }); t[ks.at(-1)] = v; return c; };
const imgSrc = (v) => (!v ? "" : v.startsWith("/uploads/") ? gh.rawUrl("public" + v) : v.startsWith("/") ? BASE + v : v);
const slugify = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

async function compress(file) {
  if (file.type === "image/svg+xml" || file.type === "image/gif") return { bytes: new Uint8Array(await file.arrayBuffer()), ext: file.type === "image/gif" ? "gif" : "svg" };
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise((r) => c.toBlob(r, "image/webp", 0.85));
  return { bytes: new Uint8Array(await blob.arrayBuffer()), ext: "webp" };
}

export default function AdminApp() {
  const [stage, setStage] = useState(gh.restoreSession() ? "app" : "login");
  useEffect(() => {
    document.title = "Admin · Abdul Aziz Portfolio";
    const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex, nofollow"; document.head.appendChild(m);
  }, []);
  if (stage === "login") return <Login onDone={() => setStage("app")} />;
  return <Shell onLogout={() => { gh.logout(); setStage("login"); }} />;
}

function Login({ onDone }) {
  const [pw, setPw] = useState(""), [tok, setTok] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const [needToken, setNeedToken] = useState(false), fails = useRef(0);
  async function submit(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      if (fails.current >= 5) await new Promise((r) => setTimeout(r, 4000 * (fails.current - 4)));
      const auth = (await gh.fetchAuth()) || bundledAuth;
      if (!(await verifyHash(pw, auth.hash))) { fails.current++; throw new Error("Wrong password."); }
      fails.current = 0;
      if (needToken) { await gh.connect(pw, tok); return onDone(); }
      if (!gh.hasSealedToken()) { setNeedToken(true); setBusy(false); return; }
      try { await gh.unlock(pw); } catch { throw new Error("Saved GitHub token on this device could not be unlocked. Use “Forget this device” and connect again."); }
      onDone();
    } catch (x) { setErr(x.message); setBusy(false); }
  }
  return (
    <main className="admin-login admin-shell">
      <form className="admin-card admin-login-card" onSubmit={submit} data-testid="login-form">
        <div className="admin-logo-row"><span className="admin-logo">A</span><div><strong>Aziz Portfolio</strong><small>Admin</small></div></div>
        <h1>{needToken ? "Connect GitHub (once per device)" : "Admin sign in"}</h1>
        <label>Password<input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus disabled={needToken} /></label>
        {needToken && (
          <>
            <p className="adm-note">This device has no GitHub key yet. Paste your <b>fine-grained GitHub token</b> (repo <code>{gh.REPO}</code>, Contents: Read and write, Actions: Read). It is encrypted with your password and stored only in this browser; it never goes into the website code.</p>
            <label>GitHub token<input type="password" value={tok} onChange={(e) => setTok(e.target.value)} placeholder="github_pat_…" autoFocus /></label>
          </>
        )}
        {err && <p className="admin-status adm-err" role="alert">{err}</p>}
        <button className="admin-primary" type="submit" disabled={busy || !pw || (needToken && !tok)}>{busy ? "Checking…" : needToken ? "Connect & sign in" : "Sign in"}</button>
        {gh.hasSealedToken() && !needToken && <button className="admin-ghost" type="button" onClick={() => { if (confirm("Remove the saved GitHub key from this browser?")) { gh.forgetDevice(); location.reload(); } }}>Forget this device</button>}
        <a className="admin-ghost adm-back" href={withBase("/")}>← Back to website</a>
      </form>
    </main>
  );
}

function Shell({ onLogout }) {
  const [tab, setTab] = useState("dashboard"), [menu, setMenu] = useState(false);
  const [site, setSite] = useState(null), [sha, setSha] = useState(null), [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(""), [run, setRun] = useState(null), [commit, setCommit] = useState(null);
  const toast = (m) => { setMsg(m); clearTimeout(toast.t); toast.t = setTimeout(() => setMsg(""), 6000); };
  const refreshStatus = useCallback(() => { gh.latestRun().then(setRun).catch(() => {}); gh.lastCommit().then(setCommit).catch(() => {}); }, []);
  useEffect(() => { gh.getJson(gh.CONTENT_PATH).then(({ data, sha }) => { setSite(data); setSha(sha); }).catch((e) => toast(e.message)); refreshStatus(); }, [refreshStatus]);
  useEffect(() => { const active = run && run.status !== "completed"; const t = setInterval(refreshStatus, active ? 6000 : 30000); return () => clearInterval(t); }, [run, refreshStatus]);
  useEffect(() => { const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } }; addEventListener("beforeunload", h); return () => removeEventListener("beforeunload", h); }, [dirty]);
  const upd = (p, v) => { setSite((s) => set(s, p, v)); setDirty(true); };
  async function save() {
    setBusy(true);
    try {
      const n = await gh.putJson(gh.CONTENT_PATH, site, sha, `admin: update site content (${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC)`);
      setSha(n); setDirty(false); toast("Saved. Deploying – live in about 1–2 minutes."); setTimeout(refreshStatus, 4000);
    } catch (e) { toast(e.message); } finally { setBusy(false); }
  }
  const go = (t) => { setTab(t); setMenu(false); scrollTo({ top: 0 }); };
  if (!site) return <main className="admin-login admin-shell"><p className="admin-status">{msg || "Loading content from GitHub…"}</p></main>;
  const live = !run ? "—" : run.status !== "completed" ? "Deploying…" : run.conclusion === "success" ? "Live" : "Deploy failed";
  const P = { site, upd, toast };
  return (
    <main className="admin-layout admin-shell adm">
      <aside className={`admin-sidebar ${menu ? "adm-open" : ""}`}>
        <div className="admin-logo-row"><span className="admin-logo">A</span><strong>Aziz Admin</strong><span className="admin-mini-badge">ADMIN</span></div>
        <div className="admin-nav">{NAV.map(([k, l, i]) => <button key={k} className={tab === k ? "active" : ""} onClick={() => go(k)} data-testid={`nav-${k}`}><span>{i}</span>{l}</button>)}</div>
        <div className="admin-sidebar-footer">
          <a href={withBase("/")} target="_blank" rel="noreferrer"><button type="button">View site ↗</button></a>
          <button onClick={onLogout}>Log out</button>
        </div>
      </aside>
      {menu && <div className="adm-scrim" onClick={() => setMenu(false)} />}
      <section className="admin-panel">
        <header className="admin-topbar">
          <button className="adm-burger" aria-label="Menu" onClick={() => setMenu(true)}>☰</button>
          <h1>{NAV.find((n) => n[0] === tab)?.[1]}</h1>
          <div className="admin-top-actions">
            <button className={`admin-live-pill adm-live-${live === "Live" ? "ok" : live === "Deploy failed" ? "bad" : "run"}`} onClick={() => go("deploy")}>{live}</button>
            <button className="admin-primary" disabled={!dirty || busy} onClick={save} data-testid="save">{busy ? "Saving…" : dirty ? "Save & publish" : "Saved"}</button>
          </div>
        </header>
        {msg && <p className="admin-status admin-status-bar" role="status">{msg}</p>}
        {tab === "dashboard" && <Dashboard {...P} go={go} run={run} commit={commit} live={live} />}
        {tab === "branding" && <Branding {...P} />}
        {tab === "home" && <Homepage {...P} />}
        {tab === "services" && <><ListEditor {...P} path="services" /><Panel title="Skills" subtitle="One per line. Shown as chips on the home page and /skills."><TA label="Skills" value={(site.skills || []).join("\n")} onChange={(v) => upd("skills", v.split("\n").map((s) => s.trim()).filter(Boolean))} /></Panel></>}
        {["completedWork", "projects", "upcoming", "awards", "videos"].includes(tab) && <ListEditor {...P} path={tab} />}
        {tab === "blog" && <ListEditor {...P} path="blogPosts" />}
        {tab === "social" && <><Panel title="Contact"><div className="admin-field-grid">
          <TF label="Email" value={site.contact?.email} onChange={(v) => upd("contact.email", v)} /><TF label="Phone / WhatsApp (optional)" value={site.contact?.phone} onChange={(v) => upd("contact.phone", v)} />
          <TF label="Location" value={site.contact?.location} onChange={(v) => upd("contact.location", v)} /><TF label="CV link (optional)" value={site.contact?.cvUrl} onChange={(v) => upd("contact.cvUrl", v)} />
        </div></Panel><ListEditor {...P} path="socialLinks" /></>}
        {tab === "deploy" && <Deploy run={run} commit={commit} refresh={refreshStatus} />}
        {tab === "security" && <Security toast={toast} />}
        {dirty && <div className="adm-savebar"><span>You have unsaved changes.</span><button className="admin-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save & publish"}</button></div>}
      </section>
    </main>
  );
}

function Dashboard({ site, go, run, commit, live }) {
  const stats = [["Completed work", site.completedWork, "completedWork"], ["Projects", site.projects, "projects"], ["Upcoming", site.upcoming, "upcoming"], ["Awards", site.awards, "awards"], ["Videos", site.videos, "videos"], ["Blog posts", site.blogPosts, "blog"]];
  return (
    <>
      <div className="admin-stats">{stats.map(([l, v, t]) => <button key={l} className="admin-stat-card adm-stat" onClick={() => go(t)}><span>+</span><strong>{v?.length || 0}</strong><p>{l}</p></button>)}</div>
      <Panel title="Status">
        <div className="adm-kv">
          <span>Live site</span><b><a href={withBase("/")} target="_blank" rel="noreferrer">{location.origin + withBase("/")}</a> · {live}</b>
          <span>Last saved</span><b>{commit ? `${new Date(commit.commit.author.date).toLocaleString()} · ${commit.commit.message.split("\n")[0]}` : "—"}</b>
          <span>Saved to</span><b><a href={`https://github.com/${gh.REPO}`} target="_blank" rel="noreferrer">GitHub · {gh.REPO}</a></b>
          <span>Last deploy</span><b>{run ? `${new Date(run.created_at).toLocaleString()} · ${run.conclusion || run.status}` : "—"}</b>
        </div>
      </Panel>
      <Panel title="How saving works">
        <p className="adm-note">Edit anything, then press <b>Save &amp; publish</b>. The change is committed to GitHub and the site rebuilds automatically; it is live in about 1–2 minutes (watch the pill at the top right). Images are compressed in your browser before upload.</p>
      </Panel>
    </>
  );
}

function Branding({ site, upd }) {
  return (
    <>
      <Panel title="SEO" subtitle="Browser tab title and search description.">
        <TF label="Site title" value={site.seo?.title} onChange={(v) => upd("seo.title", v)} />
        <TA label="Description" value={site.seo?.description} onChange={(v) => upd("seo.description", v)} />
        <TF label="Keywords" value={site.seo?.keywords} onChange={(v) => upd("seo.keywords", v)} />
      </Panel>
      <Panel title="Colours & theme" subtitle="Accent colours used across the site (buttons, gradients, highlights).">
        <div className="admin-field-grid">
          <Color label="Green accent" value={site.theme?.green || "#3ff4ad"} onChange={(v) => upd("theme.green", v)} />
          <Color label="Gold accent" value={site.theme?.gold || "#d8ad65"} onChange={(v) => upd("theme.gold", v)} />
          <label>Default mode for new visitors<select value={site.theme?.defaultMode || "dark"} onChange={(e) => upd("theme.defaultMode", e.target.value)}><option value="dark">Dark</option><option value="light">Light</option></select></label>
        </div>
      </Panel>
    </>
  );
}

function Homepage({ site, upd, toast }) {
  return (
    <>
      <Panel title="Hero">
        <div className="admin-field-grid">
          <TF label="Name" value={site.hero?.name} onChange={(v) => upd("hero.name", v)} />
          <TF label="Roles line (separate with •)" value={site.hero?.eyebrow} onChange={(v) => upd("hero.eyebrow", v)} />
          <TF label="Primary button" value={site.hero?.primaryCta} onChange={(v) => upd("hero.primaryCta", v)} />
          <TF label="Secondary button" value={site.hero?.secondaryCta} onChange={(v) => upd("hero.secondaryCta", v)} />
        </div>
        <TF label="Headline" value={site.hero?.headline} onChange={(v) => upd("hero.headline", v)} />
        <TA label="Sub-headline" value={site.hero?.subheadline} onChange={(v) => upd("hero.subheadline", v)} />
        <Img label="Hero background image" value={site.hero?.image} onChange={(v) => upd("hero.image", v)} toast={toast} />
      </Panel>
      <Panel title="About">
        <TF label="Section label" value={site.about?.title} onChange={(v) => upd("about.title", v)} />
        <TF label="Heading" value={site.about?.heading} onChange={(v) => upd("about.heading", v)} />
        <TA label="Text" value={site.about?.body} onChange={(v) => upd("about.body", v)} />
        <Img label="Profile image" value={site.about?.image} onChange={(v) => upd("about.image", v)} toast={toast} />
      </Panel>
      <ListEditor site={site} upd={upd} toast={toast} path="about.stats" />
      <Panel title="Services background"><Img label="Services section image" value={site.assets?.servicesImage} onChange={(v) => upd("assets.servicesImage", v)} toast={toast} /></Panel>
    </>
  );
}

function ListEditor({ site, upd, toast, path }) {
  const cfg = LISTS[path], items = get(site, path) || [];
  const [open, setOpen] = useState(-1);
  const change = (next) => upd(path, next);
  const move = (i, d) => { const n = [...items]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; change(n); setOpen(j); };
  const add = () => { const blank = Object.fromEntries(cfg.fields.map(([k, , t]) => [k, t === "toggle" ? true : ""])); if (path === "blogPosts") Object.assign(blank, { id: `post-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) }); change([blank, ...items]); setOpen(0); };
  return (
    <Panel title={cfg.title} subtitle={cfg.hint} action={<button className="admin-primary" onClick={add} data-testid={`add-${path}`}>+ Add new</button>}>
      {!items.length && <p className="adm-note">Nothing here yet. Click “+ Add new”.</p>}
      <div className="adm-list">
        {items.map((it, i) => {
          const label = it.title || it.label || it.value || it.url || "(untitled)";
          const yt = path === "videos" ? youtubeId(it.url) : "";
          return (
            <div className={`adm-item ${open === i ? "open" : ""}`} key={i}>
              <div className="adm-item-head">
                <button className="adm-item-title" onClick={() => setOpen(open === i ? -1 : i)}>
                  {(it.image || yt) && <img src={yt ? `https://i.ytimg.com/vi/${yt}/default.jpg` : imgSrc(it.image)} alt="" />}
                  <span>{label}</span>{path === "blogPosts" && !it.published && <em>draft</em>}
                </button>
                <div className="admin-row-actions">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
                  <button onClick={() => setOpen(open === i ? -1 : i)}>{open === i ? "Close" : "Edit"}</button>
                  <button className="danger" onClick={() => { if (confirm(`Delete “${label}”?`)) { change(items.filter((_, k) => k !== i)); setOpen(-1); } }} data-testid="delete">Delete</button>
                </div>
              </div>
              {open === i && (
                <div className="admin-editor-form">
                  {cfg.fields.map(([k, l, t]) => {
                    const on = (v) => { const n = { ...it, [k]: v }; if (path === "blogPosts" && k === "title" && (!it.slug || it.slug === slugify(it.title))) n.slug = n.id = slugify(v); change(items.map((x, j) => (j === i ? n : x))); };
                    if (t === "textarea") return <TA key={k} label={l} value={it[k]} onChange={on} />;
                    if (t === "image") return <Img key={k} label={l} value={it[k]} onChange={on} toast={toast} />;
                    if (t === "toggle") return <label key={k} className="admin-toggle"><input type="checkbox" checked={!!it[k]} onChange={(e) => on(e.target.checked)} /><span />{l}</label>;
                    return <TF key={k} label={l} value={it[k]} onChange={on} />;
                  })}
                  {path === "videos" && it.url && !yt && <p className="admin-status adm-err">This does not look like a YouTube link.</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Deploy({ run, commit, refresh }) {
  return (
    <Panel title="Deploy status" subtitle="Every save starts the GitHub Action “Deploy to GitHub Pages”." action={<button onClick={refresh}>Refresh</button>}>
      <div className="adm-kv">
        <span>Latest run</span><b>{run ? <a href={run.html_url} target="_blank" rel="noreferrer">#{run.run_number} · {run.display_title}</a> : "—"}</b>
        <span>State</span><b>{run ? `${run.status}${run.conclusion ? ` · ${run.conclusion}` : ""}` : "—"}</b>
        <span>Started</span><b>{run ? new Date(run.created_at).toLocaleString() : "—"}</b>
        <span>Last content commit</span><b>{commit ? <a href={commit.html_url} target="_blank" rel="noreferrer">{commit.sha.slice(0, 7)} · {commit.commit.message.split("\n")[0]}</a> : "—"}</b>
      </div>
      <p className="adm-note">If a deploy failed, open the run on GitHub and press “Re-run all jobs”.</p>
    </Panel>
  );
}

function Security({ toast }) {
  const [cur, setCur] = useState(""), [nw, setNw] = useState(""), [nw2, setNw2] = useState(""), [tok, setTok] = useState(""), [busy, setBusy] = useState(false);
  async function changePw(e) {
    e.preventDefault(); setBusy(true);
    try {
      const { data, sha } = await gh.getJson(gh.AUTH_PATH);
      if (!(await verifyHash(cur, data?.hash))) throw new Error("Current password is wrong.");
      if (nw.length < 12) throw new Error("Use at least 12 characters.");
      if (nw !== nw2) throw new Error("New passwords do not match.");
      await gh.putJson(gh.AUTH_PATH, { hash: await makeHash(nw), updatedAt: new Date().toISOString() }, sha, "[skip ci] admin: change password");
      await gh.resealToken(nw); setCur(""); setNw(""); setNw2(""); toast("Password changed. Use the new password next time (other devices too).");
    } catch (x) { toast(x.message); } finally { setBusy(false); }
  }
  async function replaceToken(e) {
    e.preventDefault(); setBusy(true);
    try { const { data } = await gh.getJson(gh.AUTH_PATH); if (!(await verifyHash(cur, data?.hash))) throw new Error("Enter your current password above first."); await gh.connect(cur, tok); setTok(""); toast("GitHub token replaced on this device."); } catch (x) { toast(x.message); } finally { setBusy(false); }
  }
  return (
    <>
      <Panel title="Change admin password" subtitle="Stored only as a salted PBKDF2 hash in content/admin.json.">
        <form onSubmit={changePw} className="admin-editor-form">
          <TF label="Current password" type="password" value={cur} onChange={setCur} />
          <div className="admin-field-grid"><TF label="New password" type="password" value={nw} onChange={setNw} /><TF label="Repeat new password" type="password" value={nw2} onChange={setNw2} /></div>
          <button className="admin-primary" disabled={busy}>Change password</button>
        </form>
      </Panel>
      <Panel title="Replace GitHub token" subtitle="Use when the token expires. Needs the current password above.">
        <form onSubmit={replaceToken} className="admin-editor-form">
          <TF label="New fine-grained token" type="password" value={tok} onChange={setTok} />
          <button className="admin-primary" disabled={busy || !tok || !cur}>Replace token</button>
        </form>
      </Panel>
      <Panel title="This device"><button className="danger" onClick={() => { if (confirm("Remove the saved GitHub key from this browser and log out?")) { gh.forgetDevice(); location.reload(); } }}>Forget this device</button></Panel>
    </>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="admin-card wide">
      <div className="admin-card-head adm-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
      {children}
    </section>
  );
}
function TF({ label, value, onChange, type = "text" }) { return <label>{label}<input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} /></label>; }
function TA({ label, value, onChange }) { return <label>{label}<textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} /></label>; }
function Color({ label, value, onChange }) {
  return <label className="admin-color-field">{label}<span><input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#3ff4ad"} onChange={(e) => onChange(e.target.value)} /><input value={value} onChange={(e) => onChange(e.target.value)} /></span></label>;
}
function Img({ label, value, onChange, toast }) {
  const ref = useRef(null), [busy, setBusy] = useState(false);
  async function pick(e) {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    setBusy(true);
    try { const { bytes, ext } = await compress(f); const name = `${Date.now()}-${slugify(f.name.replace(/\.[^.]+$/, "")) || "image"}.${ext}`; onChange(await gh.putImage(name, bytes)); toast(`Image uploaded (${Math.round(bytes.length / 1024)} KB). Press Save & publish.`); }
    catch (x) { toast(x.message); } finally { setBusy(false); }
  }
  return (
    <div className="admin-image-field">
      <span>{label}</span>
      <div className="admin-image-control">
        <span className="admin-thumb">{value ? <img src={imgSrc(value)} alt="" /> : "IMG"}</span>
        <input value={value ?? ""} placeholder="/uploads/… or https://…" onChange={(e) => onChange(e.target.value)} aria-label={`${label} path`} />
      </div>
      <span className="admin-field-actions">
        <button type="button" onClick={() => ref.current?.click()} disabled={busy}>{busy ? "Uploading…" : "Upload"}</button>
        <button type="button" onClick={() => onChange("")}>Clear</button>
      </span>
      <input ref={ref} className="hidden-file" type="file" accept="image/*" onChange={pick} />
    </div>
  );
}
