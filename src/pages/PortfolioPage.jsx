import { asset, withBase } from "../base";
import FloatingNav from "../components/FloatingNav";
import ContactCard from "../components/ContactCard";
import { WorkGrid, UpcomingGrid, AwardsGrid, VideoGrid } from "../components/Showcase";
import { useLuxuryMotion } from "../useLuxuryMotion";

const pageMeta = {
  about: {
    eyebrow: "Profile",
    title: "A luxury personal brand system for a multi-skilled digital creator.",
    intro:
      "This page presents the story, positioning, and trust signals behind Abdul Aziz Bin Harun's work."
  },
  services: {
    eyebrow: "Services",
    title: "Digital services for sharper brands and cleaner growth.",
    intro: "Each service is designed to help visitors understand what you offer and why they should trust you."
  },
  skills: {
    eyebrow: "Skills",
    title: "A polished toolkit for building, ranking, and growing brands.",
    intro: "Your technical, creative, and marketing skills are arranged for a clean professional read."
  },
  projects: {
    eyebrow: "Work",
    title: "Selected projects presented with case-study depth.",
    intro: "The project page can later hold full case studies, screenshots, metrics, and client stories."
  },
  blog: {
    eyebrow: "Journal",
    title: "SEO notes, digital growth lessons, and practical brand thinking.",
    intro: "Blog pages are ready for publishing posts from the admin panel."
  },
  work: { eyebrow: "Completed Work", title: "Work I have designed, built and delivered.", intro: "A record of finished projects." },
  upcoming: { eyebrow: "Upcoming", title: "What I am building next.", intro: "Projects that are planned or in progress." },
  awards: { eyebrow: "Awards & Certificates", title: "Recognition, awards and certificates.", intro: "Milestones of learning and recognition." },
  videos: { eyebrow: "Videos", title: "Watch my latest videos.", intro: "Talks, stories and AI-made videos from YouTube." },
  contact: {
    eyebrow: "Contact",
    title: "Let’s connect for serious digital work.",
    intro: "Visitors get your main contact channels with a premium final impression."
  }
};

export default function PortfolioPage({ content, navigate, path, theme, setTheme }) {
  const [, rawPage = "about", rawSlug] = path.split("/");
  const page = pageMeta[rawPage] ? rawPage : "about";
  const publishedPosts = content.blogPosts.filter((post) => post.published);
  const selectedPost =
    page === "blog" && rawSlug
      ? publishedPosts.find((post) => (post.slug || post.id) === rawSlug) || publishedPosts[0]
      : null;
  const meta = selectedPost
    ? {
        eyebrow: "Journal",
        title: selectedPost.title,
        intro: selectedPost.excerpt
      }
    : pageMeta[page];

  useLuxuryMotion(path);

  return (
    <>
      <FloatingNav content={content} navigate={navigate} theme={theme} setTheme={setTheme} />
      <main className="luxury-site inner-site page-transition">
        <div className="ambient-aurora" aria-hidden="true" />
        <div className="site-grain" aria-hidden="true" />
        <div className="cursor-aura" aria-hidden="true" />
        <section className="inner-hero">
          <img className="inner-hero-bg" src={asset(page === "about" ? content.about.image : content.assets.servicesImage)} alt="" />
          <div className="inner-hero-shade" />
          <div className="hero-light-beam" aria-hidden="true" data-depth="10" />
          <div className="hero-orbit orbit-one" aria-hidden="true" data-depth="24" />
          <div className="inner-hero-copy" data-reveal>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h1>{meta.title}</h1>
            <p>{meta.intro}</p>
            <button className="button ghost back-home-button" onClick={() => navigate("/")}>
              Back To Home
            </button>
          </div>
        </section>

        <div className="marquee-band" aria-hidden="true">
          {[content.hero.name, ...String(content.hero.eyebrow || "").split("•").map((r) => r.trim()).filter(Boolean)].map((t) => <span key={t}>{t}</span>)}
        </div>

        {selectedPost ? (
          <BlogPost post={selectedPost} />
        ) : (
          <>
            {page === "about" && <AboutPage content={content} />}
            {page === "services" && <ServicesPage content={content} />}
            {page === "skills" && <SkillsPage content={content} />}
            {page === "projects" && <ProjectsPage content={content} navigate={navigate} />}
            {page === "blog" && <BlogPage posts={publishedPosts} navigate={navigate} />}
            {page === "contact" && <ContactPage content={content} navigate={navigate} />}
            {page === "work" && <section className="section-shell">{content.completedWork.length ? <WorkGrid items={content.completedWork} /> : <Empty />}</section>}
            {page === "upcoming" && <section className="section-shell">{content.upcoming.length ? <UpcomingGrid items={content.upcoming} /> : <Empty />}</section>}
            {page === "awards" && <section className="section-shell">{content.awards.length ? <AwardsGrid items={content.awards} /> : <Empty />}</section>}
            {page === "videos" && <section className="section-shell">{content.videos.length ? <VideoGrid items={content.videos} /> : <Empty />}</section>}
          </>
        )}
      </main>
    </>
  );
}

function AboutPage({ content }) {
  return (
    <section className="detail-grid section-shell">
      <div className="feature-panel" data-reveal>
        <p className="eyebrow">{content.about.title}</p>
        <h2>{content.about.heading}</h2>
        <p>{content.about.body}</p>
      </div>
      <div className="luxury-stack">
        {content.about.stats.map((stat, index) => (
          <article className="stack-card motion-card" data-reveal style={{ "--delay": `${index * 90}ms` }} key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicesPage({ content }) {
  return (
    <section className="page-list section-shell">
      {content.services.map((service, index) => (
        <article className="wide-motion-card motion-card" data-reveal style={{ "--delay": `${index * 90}ms` }} key={service.title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h2>{service.title}</h2>
          <p>{service.description}</p>
        </article>
      ))}
    </section>
  );
}

function SkillsPage({ content }) {
  return (
    <section className="skill-gallery section-shell">
      {content.skills.map((skill, index) => (
        <article className="skill-tile motion-card" data-reveal style={{ "--delay": `${index * 55}ms` }} key={skill}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{skill}</strong>
        </article>
      ))}
    </section>
  );
}

function ProjectsPage({ content }) {
  return <section className="section-shell"><WorkGrid items={content.projects} /></section>;
}

function Empty() {
  return <p className="sc-empty" data-reveal>Coming soon.</p>;
}

function BlogPage({ posts, navigate }) {
  return (
    <section className="journal-list section-shell">
      {posts.map((post, index) => (
        <article className="journal-card motion-card" data-reveal style={{ "--delay": `${index * 90}ms` }} key={post.id}>
          <span>{post.createdAt}</span>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <button onClick={() => navigate(`/blog/${post.slug || post.id}`)}>Read Article</button>
        </article>
      ))}
    </section>
  );
}

function BlogPost({ post }) {
  return (
    <article className="article-shell section-shell" data-reveal>
      <span>{post.createdAt}</span>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </article>
  );
}

function ContactPage({ content, navigate }) {
  return (
    <section className="detail-grid section-shell">
      <div className="feature-panel" data-reveal>
        <p className="eyebrow">Available For</p>
        <h2>Web projects, SEO strategy, marketing campaigns, brand visuals, and speaking sessions.</h2>
        <p>{content.contact.location}</p>
      </div>
      <ContactCard content={content} navigate={navigate} />
    </section>
  );
}
