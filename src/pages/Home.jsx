import { asset, withBase } from "../base";
import FloatingNav from "../components/FloatingNav";
import ContactCard from "../components/ContactCard";
import { useLuxuryMotion } from "../useLuxuryMotion";

export default function Home({ content, navigate, theme, setTheme }) {
  const publishedPosts = content.blogPosts.filter((post) => post.published);

  useLuxuryMotion("home");

  const go = (path) => (event) => {
    event.preventDefault();
    navigate(path);
  };

  return (
    <>
      <FloatingNav content={content} navigate={navigate} theme={theme} setTheme={setTheme} />
      <main className="luxury-site page-transition">
        <div className="ambient-aurora" aria-hidden="true" />
        <div className="site-grain" aria-hidden="true" />
        <div className="cursor-aura" aria-hidden="true" />
        <section className="hero-section">
          <img className="hero-bg" src={asset(content.hero.image)} alt="" fetchPriority="high" />
          <div className="hero-overlay" />
          <div className="hero-light-beam" aria-hidden="true" data-depth="10" />
          <div className="hero-orbit orbit-one" aria-hidden="true" data-depth="24" />
          <div className="hero-orbit orbit-two" aria-hidden="true" data-depth="16" />
          <div className="hero-content reveal">
            <p className="eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.name}</h1>
            <h2>{content.hero.headline}</h2>
            <p>{content.hero.subheadline}</p>
            <div className="hero-actions">
              <a className="button primary" href={withBase("/projects")} onClick={go("/projects")}>
                {content.hero.primaryCta}
              </a>
              <a className="button ghost" href={withBase("/blog")} onClick={go("/blog")}>
                {content.hero.secondaryCta}
              </a>
            </div>
          </div>
        </section>

        <section className="about-section section-shell section-preview" id="about" data-reveal>
          <div className="section-copy" data-reveal>
            <p className="eyebrow">{content.about.title}</p>
            <h2>{content.about.heading}</h2>
            <p>{content.about.body}</p>
            <a className="text-link" href={withBase("/about")} onClick={go("/about")}>
              Open About Page
            </a>
            <div className="stats-grid">
              {content.about.stats.map((stat, index) => (
                <div
                  className="stat-card motion-card"
                  data-reveal
                  style={{ "--delay": `${index * 80}ms` }}
                  key={`${stat.value}-${stat.label}`}
                >
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="profile-stage" data-reveal>
            <span className="profile-halo" aria-hidden="true" />
            <img className="profile-card" src={asset(content.about.image)} alt={content.hero.name} loading="lazy" />
          </div>
        </section>

        <section className="cinematic-section section-preview" id="services">
          <img src={asset(content.assets.servicesImage)} alt="" loading="lazy" />
          <div className="cinematic-overlay" />
          <div className="section-heading" data-reveal>
            <p className="eyebrow">What I Do</p>
            <h2>Services Built For Real Growth</h2>
            <a className="text-link center" href={withBase("/services")} onClick={go("/services")}>
              Open Services Page
            </a>
          </div>
          <div className="service-grid">
            {content.services.map((service, index) => (
              <article
                className="glass-card motion-card"
                data-reveal
                style={{ "--delay": `${index * 90}ms` }}
                key={service.title}
              >
                <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell compact section-preview" id="skills" data-reveal>
          <div className="section-heading left" data-reveal>
            <p className="eyebrow">Skills</p>
            <h2>Tools, strategy, and execution in one place.</h2>
            <a className="text-link" href={withBase("/skills")} onClick={go("/skills")}>
              Open Skills Page
            </a>
          </div>
          <div className="skill-cloud">
            {content.skills.map((skill, index) => (
              <span data-reveal style={{ "--delay": `${index * 45}ms` }} key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="section-shell section-preview" id="projects" data-reveal>
          <div className="section-heading" data-reveal>
            <p className="eyebrow">Selected Work</p>
            <h2>Projects & Case Studies</h2>
            <a className="text-link center" href={withBase("/projects")} onClick={go("/projects")}>
              Open Projects Page
            </a>
          </div>
          <div className="project-grid">
            {content.projects.map((project, index) => (
              <article
                className="project-card motion-card"
                data-reveal
                style={{ "--delay": `${index * 110}ms` }}
                key={project.title}
              >
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <a href={withBase("/projects")} onClick={go("/projects")}>View Details</a>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell section-preview" id="blog" data-reveal>
          <div className="section-heading" data-reveal>
            <p className="eyebrow">Blog</p>
            <h2>Ideas, SEO Notes & Growth Lessons</h2>
            <a className="text-link center" href={withBase("/blog")} onClick={go("/blog")}>
              Open Blog Page
            </a>
          </div>
          <div className="blog-grid">
            {publishedPosts.map((post, index) => (
              <article
                className="blog-card motion-card"
                data-reveal
                style={{ "--delay": `${index * 90}ms` }}
                key={post.id}
              >
                <span>{post.createdAt}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <a className="read-link" href={`/blog/${post.slug || post.id}`} onClick={go(`/blog/${post.slug || post.id}`)}>
                  Read post
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section section-preview" id="contact" data-reveal>
          <div data-reveal>
            <p className="eyebrow">Contact</p>
            <h2>Let’s build something useful, beautiful, and fast.</h2>
            <p>{content.contact.location}</p>
            <a className="text-link" href={withBase("/contact")} onClick={go("/contact")}>
              Open Contact Page
            </a>
          </div>
          <ContactCard content={content} navigate={navigate} />
        </section>
      </main>
    </>
  );
}
