import { useState } from "react";
import { asset } from "../base";

const ext = (u = "") => (u && u !== "#" ? (/^(https?:|mailto:|\/)/i.test(u) ? u : `https://${u}`) : "");

export function youtubeId(url = "") {
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(url.trim()) ? url.trim() : "";
}

/** Project / completed-work cards (same look as the original project cards, image optional). */
export function WorkGrid({ items, linkLabel = "Visit" }) {
  return (
    <div className="project-grid">
      {items.map((p, i) => {
        const href = ext(p.url);
        return (
          <article className="project-card motion-card" data-reveal style={{ "--delay": `${i * 110}ms` }} key={(p.title || "") + i}>
            {p.image && <img className="sc-thumb" src={asset(p.image)} alt={p.title} loading="lazy" />}
            <span>{[p.category, p.year].filter(Boolean).join(" · ")}</span>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            {href && <a href={href} target="_blank" rel="noopener noreferrer">{linkLabel} ↗</a>}
          </article>
        );
      })}
    </div>
  );
}

export function UpcomingGrid({ items }) {
  return (
    <div className="project-grid">
      {items.map((u, i) => (
        <article className="project-card motion-card" data-reveal style={{ "--delay": `${i * 110}ms` }} key={(u.title || "") + i}>
          {u.image && <img className="sc-thumb" src={asset(u.image)} alt={u.title} loading="lazy" />}
          <span>{u.status || "Upcoming"}</span>
          <h3>{u.title}</h3>
          <p>{u.description}</p>
        </article>
      ))}
    </div>
  );
}

export function AwardsGrid({ items }) {
  return (
    <div className="sc-awards">
      {items.map((a, i) => {
        const href = ext(a.url);
        const inner = (
          <>
            <div className="sc-award-frame">{a.image ? <img src={asset(a.image)} alt={a.title} loading="lazy" /> : <span aria-hidden="true">★</span>}</div>
            <span>{[a.issuer, a.year].filter(Boolean).join(" · ")}</span>
            <h3>{a.title}</h3>
            {a.description && <p>{a.description}</p>}
          </>
        );
        return href
          ? <a className="sc-award motion-card" data-reveal style={{ "--delay": `${i * 90}ms` }} key={(a.title || "") + i} href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
          : <article className="sc-award motion-card" data-reveal style={{ "--delay": `${i * 90}ms` }} key={(a.title || "") + i}>{inner}</article>;
      })}
    </div>
  );
}

function Video({ v, i }) {
  const id = youtubeId(v.url);
  const [play, setPlay] = useState(false);
  if (!id) return null;
  return (
    <article className="sc-video motion-card" data-reveal style={{ "--delay": `${i * 90}ms` }}>
      <div className="sc-video-frame">
        {play ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={v.title || "YouTube video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <button type="button" onClick={() => setPlay(true)} aria-label={`Play video: ${v.title || "YouTube video"}`}>
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
            <i aria-hidden="true">▶</i>
          </button>
        )}
      </div>
      {v.title && <h3>{v.title}</h3>}
      {v.description && <p>{v.description}</p>}
    </article>
  );
}
export function VideoGrid({ items }) {
  return <div className="sc-videos">{items.map((v, i) => <Video v={v} i={i} key={(v.url || "") + i} />)}</div>;
}
