import { useMemo, useRef, useState } from "react";
import { applySeo, changePreviewPassword, isLoggedIn, login, logout, saveContent } from "../api";

const navItems = [
  { id: "Dashboard", icon: "D" },
  { id: "Branding & theme", icon: "B" },
  { id: "Homepage", icon: "H" },
  { id: "Tools & SEO", icon: "T" },
  { id: "Blog", icon: "P" },
  { id: "Pages", icon: "G" },
  { id: "Menus & footer", icon: "M" },
  { id: "Ads", icon: "A" },
  { id: "Analytics & add-ons", icon: "N" },
  { id: "Social & contact", icon: "S" },
  { id: "Deploy status", icon: "R" },
  { id: "Security", icon: "K" }
];

const defaultAdminSettings = {
  brand: {
    siteName: "Abdul Aziz Portfolio",
    tagline: "Web Developer, Designer, Marketer & SEO Specialist",
    domain: "yourdomain.com",
    siteUrl: "https://yourdomain.com",
    language: "en"
  },
  theme: {
    primary: "#4f3bff",
    secondary: "#8a5cff",
    accent: "#19e3b1",
    radius: "18",
    defaultTheme: "system"
  },
  ads: {
    enabled: false,
    publisherId: "",
    homepage: false,
    servicePages: true,
    blog: true
  },
  analytics: {
    ga4: "",
    searchConsole: "",
    bing: "",
    conversionApi: false,
    conversionUrl: ""
  },
  pages: [
    { title: "About", slug: "/about", published: true },
    { title: "Contact", slug: "/contact", published: true },
    { title: "Services", slug: "/services", published: true },
    { title: "Projects", slug: "/projects", published: true }
  ],
  menuItems: ["About", "Services", "Projects", "Blog", "Contact"]
};

export default function Admin({ content, setContent, navigate }) {
  const [draft, setDraft] = useState(() => normalizeContent(content));
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [status, setStatus] = useState("");
  const [credentials, setCredentials] = useState({ username: "admin", password: "" });
  const [editingPostIndex, setEditingPostIndex] = useState(null);
  const [editingPageIndex, setEditingPageIndex] = useState(null);
  const [passwordDraft, setPasswordDraft] = useState({ current: "", next: "", repeat: "" });
  const importInputRef = useRef(null);

  const jsonPreview = useMemo(() => JSON.stringify(draft, null, 2), [draft]);
  const hasChanges = useMemo(() => jsonPreview !== JSON.stringify(normalizeContent(content), null, 2), [jsonPreview, content]);
  const publishedPosts = draft.blogPosts.filter((post) => post.published).length;

  async function handleLogin(event) {
    event.preventDefault();
    const result = await login(credentials.username, credentials.password);
    if (result.ok) {
      setLoggedIn(true);
      setStatus(result.mode === "cloud" ? "Logged in with Cloudflare backend." : "Preview login active.");
    } else {
      setStatus(result.message);
    }
  }

  async function handleSave() {
    const normalized = normalizeContent(draft);
    const result = await saveContent(normalized);
    setDraft(normalized);
    setContent(normalized);
    applySeo(normalized);
    setStatus(
      result.mode === "cloud"
        ? "Saved permanently to Cloudflare D1."
        : "Saved in local preview. Connect Cloudflare D1 for permanent online saving."
    );
  }

  function update(path, value) {
    setDraft((current) => updatePath(current, path, value));
  }

  function replaceList(key, nextItems) {
    setDraft((current) => ({ ...current, [key]: nextItems }));
  }

  function updateListItem(key, index, nextItem) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => (itemIndex === index ? nextItem : item))
    }));
  }

  function deleteListItem(key, index) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function updateAdminList(path, index, nextItem) {
    setDraft((current) => {
      const clone = structuredClone(current);
      const list = path.split(".").reduce((target, key) => target[key], clone);
      list[index] = nextItem;
      return clone;
    });
  }

  function deleteAdminListItem(path, index) {
    setDraft((current) => {
      const clone = structuredClone(current);
      const list = path.split(".").reduce((target, key) => target[key], clone);
      list.splice(index, 1);
      return clone;
    });
  }

  function addBlogPost() {
    const post = {
      id: crypto.randomUUID(),
      title: "New Blog Post",
      slug: "new-blog-post",
      excerpt: "Short summary.",
      body: "Full post body.",
      published: true,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setDraft((current) => ({ ...current, blogPosts: [post, ...current.blogPosts] }));
    setEditingPostIndex(0);
  }

  function addPage() {
    const page = { title: "New Page", slug: "/new-page", published: true };
    setDraft((current) => ({
      ...current,
      adminSettings: {
        ...current.adminSettings,
        pages: [page, ...current.adminSettings.pages]
      }
    }));
    setEditingPageIndex(0);
  }

  function handlePasswordUpdate() {
    if (passwordDraft.next !== passwordDraft.repeat) {
      setStatus("New password and repeat password do not match.");
      return;
    }

    const result = changePreviewPassword(passwordDraft.current, passwordDraft.next);
    setStatus(result.message);
    if (result.ok) setPasswordDraft({ current: "", next: "", repeat: "" });
  }

  async function handleExport() {
    try {
      await navigator.clipboard.writeText(jsonPreview);
      setStatus("Full content JSON copied. Keep it as a backup before big edits.");
    } catch {
      setStatus("Copy blocked. Open Social & contact, then copy the JSON backup manually.");
    }
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        setDraft(normalizeContent(JSON.parse(String(reader.result))));
        setStatus("Imported content loaded. Review it, then click Save.");
      } catch {
        setStatus("Import failed. Please upload a valid JSON backup file.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  if (!loggedIn) {
    return (
      <main className="admin-login admin-shell">
        <form className="admin-card admin-login-card" onSubmit={handleLogin}>
          <div className="admin-logo-row">
            <span className="admin-logo">A</span>
            <div>
              <strong>Aziz Portfolio</strong>
              <small>Admin</small>
            </div>
          </div>
          <h1>Control Your Portfolio</h1>
          <TextField label="Username" value={credentials.username} onChange={(value) => setCredentials({ ...credentials, username: value })} />
          <TextField
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(value) => setCredentials({ ...credentials, password: value })}
          />
          <button className="admin-primary" type="submit">Login</button>
          <button className="admin-ghost" type="button" onClick={() => navigate("/")}>Back To Website</button>
          {status && <p className="admin-status">{status}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-layout admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo-row">
          <span className="admin-logo">A</span>
          <strong>Aziz Admin</strong>
          <span className="admin-mini-badge">ADMIN</span>
        </div>

        <div className="admin-nav">
          {navItems.map((item) => (
            <button className={activeTab === item.id ? "active" : ""} key={item.id} onClick={() => setActiveTab(item.id)}>
              <span>{item.icon}</span>
              {item.id}
            </button>
          ))}
        </div>

        <div className="admin-sidebar-footer">
          <button onClick={() => navigate("/")}>Open site</button>
          <button
            onClick={() => {
              logout();
              setLoggedIn(false);
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <section className="admin-panel">
        <header className="admin-topbar">
          <div>
            <h1>{activeTab === "Dashboard" ? "Dashboard" : `${activeTab} settings`}</h1>
          </div>
          <div className="admin-top-actions">
            <button className="admin-icon-button" title="Theme preview">Theme</button>
            <button className="admin-live-pill">Live</button>
          </div>
        </header>

        <input ref={importInputRef} className="hidden-file" type="file" accept="application/json,.json" onChange={handleImport} />
        {status && <p className="admin-status admin-status-bar">{status}</p>}

        {activeTab === "Dashboard" && (
          <>
            <div className="admin-stats">
              <StatCard value={draft.services.length} label="Services" />
              <StatCard value={draft.projects.length} label="Projects" />
              <StatCard value={draft.blogPosts.length} label="Blog posts" />
              <StatCard value={draft.socialLinks.length} label="Social links" />
            </div>
            <Panel title="Status">
              <div className="status-table">
                <span>Save state</span><strong>{hasChanges ? "Unsaved edits" : "Saved draft"}</strong>
                <span>Live site</span><strong>Live</strong>
                <span>Saved to</span><strong>Cloudflare / GitHub-ready</strong>
                <span>Site URL</span><strong>{draft.adminSettings.brand.siteUrl}</strong>
                <span>Published blog posts</span><strong>{publishedPosts}</strong>
                <span>SEO title</span><strong>{draft.seo.title}</strong>
              </div>
              <div className="admin-row-actions">
                <button className="admin-primary" onClick={handleSave}>Save changes</button>
                <button onClick={() => setDraft(normalizeContent(content))}>Reset draft</button>
                <button onClick={handleExport}>Copy backup JSON</button>
                <button onClick={() => importInputRef.current?.click()}>Import JSON</button>
              </div>
            </Panel>
            <Panel title="Launch checklist">
              <Checklist items={[
                ["Set real domain in Branding", draft.adminSettings.brand.domain !== "yourdomain.com"],
                ["Add Google Search Console verification", Boolean(draft.adminSettings.analytics.searchConsole)],
                ["Add GA4 measurement ID", Boolean(draft.adminSettings.analytics.ga4)],
                ["Publish at least 3 helpful blog posts", publishedPosts >= 3],
                ["Set contact email", draft.contact.email && draft.contact.email !== "your-email@example.com"],
                ["Enable ads only after traffic", draft.adminSettings.ads.enabled]
              ]} />
            </Panel>
          </>
        )}

        {activeTab === "Branding & theme" && (
          <>
            <Panel title="Brand" subtitle="Names, domain, metadata, and language.">
              <FieldGrid>
                <TextField label="Site name" value={draft.adminSettings.brand.siteName} onChange={(value) => update("adminSettings.brand.siteName", value)} />
                <TextField label="Tagline" value={draft.adminSettings.brand.tagline} onChange={(value) => update("adminSettings.brand.tagline", value)} />
                <TextField label="Domain" value={draft.adminSettings.brand.domain} onChange={(value) => update("adminSettings.brand.domain", value)} />
                <TextField label="Site URL" value={draft.adminSettings.brand.siteUrl} onChange={(value) => update("adminSettings.brand.siteUrl", value)} />
              </FieldGrid>
              <TextArea label="Default meta description" value={draft.seo.description} onChange={(value) => update("seo.description", value)} />
              <TextField label="Language code" value={draft.adminSettings.brand.language} onChange={(value) => update("adminSettings.brand.language", value)} />
            </Panel>
            <Panel title="Logo & icons" subtitle="Upload SVG or PNG assets used across the site.">
              <div className="admin-upload-grid">
                <ImageField label="Hero image" value={draft.hero.image} onChange={(value) => update("hero.image", value)} />
                <ImageField label="Profile image" value={draft.about.image} onChange={(value) => update("about.image", value)} />
                <ImageField label="Services image" value={draft.assets.servicesImage} onChange={(value) => update("assets.servicesImage", value)} />
                <ImageField label="Favicon / icon" value={draft.adminSettings.brand.icon || ""} onChange={(value) => update("adminSettings.brand.icon", value)} />
              </div>
            </Panel>
            <Panel title="Colors & theme">
              <FieldGrid>
                <ColorField label="Primary" value={draft.adminSettings.theme.primary} onChange={(value) => update("adminSettings.theme.primary", value)} />
                <ColorField label="Secondary" value={draft.adminSettings.theme.secondary} onChange={(value) => update("adminSettings.theme.secondary", value)} />
                <ColorField label="Accent" value={draft.adminSettings.theme.accent} onChange={(value) => update("adminSettings.theme.accent", value)} />
                <TextField label="Corner radius (px)" value={draft.adminSettings.theme.radius} onChange={(value) => update("adminSettings.theme.radius", value)} />
              </FieldGrid>
              <div className="admin-segmented">
                {["system", "light", "dark"].map((mode) => (
                  <button
                    className={draft.adminSettings.theme.defaultTheme === mode ? "active" : ""}
                    key={mode}
                    onClick={() => update("adminSettings.theme.defaultTheme", mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className="theme-preview"><span>Preview</span><strong>Accent</strong></div>
            </Panel>
          </>
        )}

        {activeTab === "Homepage" && (
          <>
            <Panel title="Hero">
              <FieldGrid>
                <TextField label="Name" value={draft.hero.name} onChange={(value) => update("hero.name", value)} />
                <TextField label="Eyebrow" value={draft.hero.eyebrow} onChange={(value) => update("hero.eyebrow", value)} />
                <TextField label="Primary button" value={draft.hero.primaryCta} onChange={(value) => update("hero.primaryCta", value)} />
                <TextField label="Secondary button" value={draft.hero.secondaryCta} onChange={(value) => update("hero.secondaryCta", value)} />
              </FieldGrid>
              <TextArea label="Headline" value={draft.hero.headline} onChange={(value) => update("hero.headline", value)} />
              <TextArea label="Subheadline" value={draft.hero.subheadline} onChange={(value) => update("hero.subheadline", value)} />
              <ImageField label="Hero image" value={draft.hero.image} onChange={(value) => update("hero.image", value)} />
            </Panel>
            <Panel title="About">
              <TextField label="Section title" value={draft.about.title} onChange={(value) => update("about.title", value)} />
              <TextArea label="Heading" value={draft.about.heading} onChange={(value) => update("about.heading", value)} />
              <TextArea label="Body" value={draft.about.body} onChange={(value) => update("about.body", value)} />
              <ImageField label="Profile image" value={draft.about.image} onChange={(value) => update("about.image", value)} />
            </Panel>
          </>
        )}

        {activeTab === "Tools & SEO" && (
          <>
            <Panel title="SEO">
              <TextField label="SEO title" value={draft.seo.title} onChange={(value) => update("seo.title", value)} />
              <TextArea label="SEO description" value={draft.seo.description} onChange={(value) => update("seo.description", value)} />
              <TextArea label="SEO keywords" value={draft.seo.keywords} onChange={(value) => update("seo.keywords", value)} />
            </Panel>
            <Panel title="Services">
              <ImageField label="Services section image" value={draft.assets.servicesImage} onChange={(value) => update("assets.servicesImage", value)} />
              <EditableList
                title="Services"
                items={draft.services}
                createItem={() => ({ title: "New Service", description: "Describe this service." })}
                onChange={(items) => replaceList("services", items)}
                render={(item, index, updateItem) => (
                  <>
                    <input value={item.title} onChange={(event) => updateItem(index, { ...item, title: event.target.value })} />
                    <textarea value={item.description} onChange={(event) => updateItem(index, { ...item, description: event.target.value })} />
                  </>
                )}
              />
            </Panel>
          </>
        )}

        {activeTab === "Blog" && (
          editingPostIndex === null ? (
            <Panel title="Blog posts" subtitle="Articles help you rank for long-tail searches.">
              <div className="admin-panel-action">
                <button className="admin-primary" onClick={addBlogPost}>+ New post</button>
              </div>
              <div className="admin-list-table">
                {draft.blogPosts.map((post, index) => (
                  <article key={post.id || post.slug || index}>
                    <div>
                      <strong>{post.title}</strong>
                      <span>/{post.slug} · {post.published ? "Published" : "Draft"} · {post.createdAt}</span>
                    </div>
                    <button onClick={() => setEditingPostIndex(index)}>Edit</button>
                    <button className="danger" onClick={() => deleteListItem("blogPosts", index)}>Delete</button>
                  </article>
                ))}
              </div>
            </Panel>
          ) : (
            <Panel title={draft.blogPosts[editingPostIndex]?.title || "New post"}>
              <div className="admin-panel-action">
                <button onClick={() => setEditingPostIndex(null)}>Back</button>
              </div>
              <PostEditor
                post={draft.blogPosts[editingPostIndex]}
                onChange={(post) => updateListItem("blogPosts", editingPostIndex, post)}
              />
            </Panel>
          )
        )}

        {activeTab === "Pages" && (
          editingPageIndex === null ? (
            <Panel title="Pages" subtitle="About, Contact, Services, Projects, Blog and custom pages.">
              <div className="admin-panel-action">
                <button className="admin-primary" onClick={addPage}>+ New page</button>
              </div>
              <div className="admin-list-table">
                {draft.adminSettings.pages.map((page, index) => (
                  <article key={`${page.slug}-${index}`}>
                    <div>
                      <strong>{page.title}</strong>
                      <span>{page.slug} · {page.published ? "Published" : "Draft"}</span>
                    </div>
                    <button onClick={() => setEditingPageIndex(index)}>Edit</button>
                    <button className="danger" onClick={() => deleteAdminListItem("adminSettings.pages", index)}>Delete</button>
                  </article>
                ))}
              </div>
            </Panel>
          ) : (
            <Panel title={draft.adminSettings.pages[editingPageIndex]?.title || "New page"}>
              <div className="admin-panel-action">
                <button onClick={() => setEditingPageIndex(null)}>Back</button>
              </div>
              <PageEditor
                page={draft.adminSettings.pages[editingPageIndex]}
                onChange={(page) => updateAdminList("adminSettings.pages", editingPageIndex, page)}
              />
            </Panel>
          )
        )}

        {activeTab === "Menus & footer" && (
          <>
            <Panel title="Menu items">
              <EditableList
                title="Navigation"
                items={draft.adminSettings.menuItems.map((label) => ({ label }))}
                createItem={() => ({ label: "New menu" })}
                onChange={(items) => update("adminSettings.menuItems", items.map((item) => item.label))}
                row
                render={(item, index, updateItem) => (
                  <input value={item.label} onChange={(event) => updateItem(index, { label: event.target.value })} />
                )}
              />
            </Panel>
            <Panel title="Social links">
              <EditableList
                title="Footer/social buttons"
                items={draft.socialLinks}
                createItem={() => ({ label: "New Link", url: "#" })}
                onChange={(items) => replaceList("socialLinks", items)}
                row
                render={(item, index, updateItem) => (
                  <>
                    <input value={item.label} onChange={(event) => updateItem(index, { ...item, label: event.target.value })} />
                    <input value={item.url} onChange={(event) => updateItem(index, { ...item, url: event.target.value })} />
                  </>
                )}
              />
            </Panel>
          </>
        )}

        {activeTab === "Ads" && (
          <Panel title="Google AdSense" subtitle="Add only after traffic. Use official script and publisher ID.">
            <Toggle label="Enable ads" checked={draft.adminSettings.ads.enabled} onChange={(value) => update("adminSettings.ads.enabled", value)} />
            <TextField label="Publisher ID" value={draft.adminSettings.ads.publisherId} onChange={(value) => update("adminSettings.ads.publisherId", value)} />
            <FieldGrid>
              <Toggle label="Show on homepage" checked={draft.adminSettings.ads.homepage} onChange={(value) => update("adminSettings.ads.homepage", value)} />
              <Toggle label="Show on service pages" checked={draft.adminSettings.ads.servicePages} onChange={(value) => update("adminSettings.ads.servicePages", value)} />
              <Toggle label="Show on blog" checked={draft.adminSettings.ads.blog} onChange={(value) => update("adminSettings.ads.blog", value)} />
            </FieldGrid>
          </Panel>
        )}

        {activeTab === "Analytics & add-ons" && (
          <>
            <Panel title="Analytics & Search Console">
              <TextField label="Google Analytics 4 measurement ID" value={draft.adminSettings.analytics.ga4} onChange={(value) => update("adminSettings.analytics.ga4", value)} />
              <TextField label="Google Search Console verification code" value={draft.adminSettings.analytics.searchConsole} onChange={(value) => update("adminSettings.analytics.searchConsole", value)} />
              <TextField label="Bing Webmaster verification code" value={draft.adminSettings.analytics.bing} onChange={(value) => update("adminSettings.analytics.bing", value)} />
            </Panel>
            <Panel title="Optional server add-on">
              <Toggle label="Enable offline conversion tools" checked={draft.adminSettings.analytics.conversionApi} onChange={(value) => update("adminSettings.analytics.conversionApi", value)} />
              <TextField label="Conversion API URL" value={draft.adminSettings.analytics.conversionUrl} onChange={(value) => update("adminSettings.analytics.conversionUrl", value)} />
            </Panel>
          </>
        )}

        {activeTab === "Social & contact" && (
          <>
            <Panel title="Social profiles">
              <EditableList
                title="Profiles"
                items={draft.socialLinks}
                createItem={() => ({ label: "New Profile", url: "#" })}
                onChange={(items) => replaceList("socialLinks", items)}
                row
                render={(item, index, updateItem) => (
                  <>
                    <input value={item.label} onChange={(event) => updateItem(index, { ...item, label: event.target.value })} />
                    <input value={item.url} onChange={(event) => updateItem(index, { ...item, url: event.target.value })} />
                  </>
                )}
              />
            </Panel>
            <Panel title="Contact">
              <TextField label="Email" value={draft.contact.email} onChange={(value) => update("contact.email", value)} />
              <TextField label="Phone" value={draft.contact.phone} onChange={(value) => update("contact.phone", value)} />
              <TextField label="Address / location" value={draft.contact.location} onChange={(value) => update("contact.location", value)} />
              <TextField label="CV URL" value={draft.contact.cvUrl} onChange={(value) => update("contact.cvUrl", value)} />
              <details className="json-preview">
                <summary>Export full content JSON</summary>
                <textarea readOnly value={jsonPreview} />
              </details>
            </Panel>
          </>
        )}

        {activeTab === "Deploy status" && (
          <>
            <Panel title="How publishing works">
              <ol className="admin-steps">
                <li>You edit content and click Save.</li>
                <li>The live website updates from saved content.</li>
                <li>For your own domain, connect GitHub and Cloudflare Pages later.</li>
              </ol>
            </Panel>
            <Panel title="Deploy status">
              <div className="status-table">
                <span>Status</span><strong>Live</strong>
                <span>Repository</span><strong>Portfolio project</strong>
                <span>Last action</span><strong>{hasChanges ? "Unsaved changes waiting" : "Current preview is saved"}</strong>
              </div>
              <div className="admin-row-actions">
                <button className="admin-primary" onClick={handleSave}>Deploy again</button>
                <button onClick={() => navigate("/")}>Open live site</button>
              </div>
            </Panel>
          </>
        )}

        {activeTab === "Security" && (
          <Panel title="Change admin password" subtitle="At least 10 characters. This updates the preview/admin password in browser storage.">
            <TextField
              label="Current password"
              type="password"
              value={passwordDraft.current}
              onChange={(value) => setPasswordDraft({ ...passwordDraft, current: value })}
            />
            <TextField
              label="New password"
              type="password"
              value={passwordDraft.next}
              onChange={(value) => setPasswordDraft({ ...passwordDraft, next: value })}
            />
            <TextField
              label="Repeat new password"
              type="password"
              value={passwordDraft.repeat}
              onChange={(value) => setPasswordDraft({ ...passwordDraft, repeat: value })}
            />
            <button className="admin-primary" onClick={handlePasswordUpdate}>Update password</button>
          </Panel>
        )}
      </section>
    </main>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="admin-card wide">
      {title && (
        <div className="admin-card-head">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

function StatCard({ value, label }) {
  return (
    <article className="admin-stat-card">
      <span>+</span>
      <strong>{value}</strong>
      <p>{label}</p>
    </article>
  );
}

function Checklist({ items }) {
  return (
    <div className="admin-checklist">
      {items.map(([label, done]) => (
        <div key={label}>
          <span className={done ? "done" : ""} />
          <p>{label}</p>
        </div>
      ))}
    </div>
  );
}

function FieldGrid({ children }) {
  return <div className="admin-field-grid">{children}</div>;
}

function TextField({ label, value, onChange, type = "text" }) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label>
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ImageField({ label, value, onChange }) {
  const fileInputRef = useRef(null);

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <label className="admin-image-field">
      {label}
      <div className="admin-image-control">
        <span className="admin-thumb">{value ? <img src={value} alt="" /> : "IMG"}</span>
        <input value={value} placeholder="/assets/image.webp or upload" onChange={(event) => onChange(event.target.value)} />
      </div>
      <span className="admin-field-actions">
        <button type="button" onClick={() => fileInputRef.current?.click()}>Upload</button>
        <button type="button" onClick={() => onChange("")}>Clear</button>
      </span>
      <input ref={fileInputRef} className="hidden-file" type="file" accept="image/*,.svg" onChange={handleFile} />
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  const colorValue = /^#[0-9a-f]{6}$/i.test(value) ? value : "#6d4cff";

  return (
    <label className="admin-color-field">
      {label}
      <span>
        <input type="color" value={colorValue} onChange={(event) => onChange(event.target.value)} />
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="admin-toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span />
      {label}
    </label>
  );
}

function PostEditor({ post, onChange }) {
  if (!post) return null;

  function formatBody(type) {
    const snippets = {
      bold: "**important text**",
      italic: "_emphasized text_",
      h2: "\n## Section heading\n",
      h3: "\n### Sub heading\n",
      quote: "\n> Add a strong quote here.\n",
      list: "\n- First point\n- Second point\n- Third point\n",
      link: "[link text](https://example.com)",
      image: "\n![Image alt text](https://example.com/image.jpg)\n",
      html: "\n<section>\n  <h2>Custom HTML block</h2>\n</section>\n"
    };

    onChange({ ...post, body: type === "clear" ? "" : `${post.body || ""}${snippets[type] || ""}` });
  }

  return (
    <div className="admin-editor-form">
      <TextField label="Title" value={post.title} onChange={(value) => onChange({ ...post, title: value })} />
      <FieldGrid>
        <TextField label="URL slug" value={post.slug} onChange={(value) => onChange({ ...post, slug: value })} />
        <TextField label="Date" value={post.createdAt} onChange={(value) => onChange({ ...post, createdAt: value })} />
        <TextField label="Author" value={post.author || "Abdul Aziz Bin Harun"} onChange={(value) => onChange({ ...post, author: value })} />
      </FieldGrid>
      <TextField label="Tags" value={post.tags || ""} onChange={(value) => onChange({ ...post, tags: value })} />
      <TextArea label="Meta description / excerpt" value={post.excerpt} onChange={(value) => onChange({ ...post, excerpt: value })} />
      <ImageField label="Cover image" value={post.coverImage || ""} onChange={(value) => onChange({ ...post, coverImage: value })} />
      <div className="admin-editor-toolbar">
        {[
          ["B", "bold"],
          ["I", "italic"],
          ["H2", "h2"],
          ["H3", "h3"],
          ["Quote", "quote"],
          ["List", "list"],
          ["Link", "link"],
          ["Image", "image"],
          ["HTML", "html"],
          ["Clear", "clear"]
        ].map(([label, type]) => (
          <button type="button" key={type} onClick={() => formatBody(type)}>{label}</button>
        ))}
      </div>
      <TextArea label="Content" value={post.body} onChange={(value) => onChange({ ...post, body: value })} />
      <Toggle label="Published" checked={post.published} onChange={(value) => onChange({ ...post, published: value })} />
      <button type="button" className="admin-primary" onClick={() => onChange({ ...post, updatedAt: new Date().toISOString() })}>Save post</button>
    </div>
  );
}

function PageEditor({ page, onChange }) {
  if (!page) return null;

  return (
    <div className="admin-editor-form">
      <TextField label="Page title" value={page.title} onChange={(value) => onChange({ ...page, title: value })} />
      <TextField label="URL slug" value={page.slug} onChange={(value) => onChange({ ...page, slug: value })} />
      <TextArea label="Meta description" value={page.description || ""} onChange={(value) => onChange({ ...page, description: value })} />
      <Toggle label="Published" checked={page.published} onChange={(value) => onChange({ ...page, published: value })} />
    </div>
  );
}

function EditableList({ title, items, createItem, render, onChange, row = false }) {
  function updateItem(index, nextItem) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextItem : item)));
  }

  function deleteItem(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className={row ? "editable-list compact" : "editable-list"}>
      <div className="list-title">
        <h2>{title}</h2>
        <button onClick={() => onChange([...items, createItem()])}>+ New</button>
      </div>
      {items.map((item, index) => (
        <div className="editable-item" key={item.id || item.title || item.label || index}>
          {render(item, index, updateItem)}
          <button className="danger" onClick={() => deleteItem(index)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

function normalizeContent(content) {
  return {
    ...content,
    adminSettings: {
      ...defaultAdminSettings,
      ...(content.adminSettings || {}),
      brand: { ...defaultAdminSettings.brand, ...(content.adminSettings?.brand || {}) },
      theme: { ...defaultAdminSettings.theme, ...(content.adminSettings?.theme || {}) },
      ads: { ...defaultAdminSettings.ads, ...(content.adminSettings?.ads || {}) },
      analytics: { ...defaultAdminSettings.analytics, ...(content.adminSettings?.analytics || {}) },
      pages: content.adminSettings?.pages || defaultAdminSettings.pages,
      menuItems: content.adminSettings?.menuItems || defaultAdminSettings.menuItems
    }
  };
}

function updatePath(object, path, value) {
  const keys = path.split(".");
  const clone = structuredClone(object);
  let target = clone;

  keys.slice(0, -1).forEach((key) => {
    if (!target[key]) target[key] = {};
    target = target[key];
  });

  target[keys.at(-1)] = value;
  return clone;
}
