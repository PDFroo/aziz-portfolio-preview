import { asset, withBase } from "../base";
export default function FloatingNav({ navigate, theme, setTheme }) {
  const go = (path) => (event) => {
    event.preventDefault();
    navigate(path);
  };

  return (
    <nav className="floating-nav" aria-label="Main navigation">
      <button className="brand-pill" onClick={() => navigate("/")}>
        <span className="avatar-dot">
          <img src={asset("/assets/nav-avatar.webp")} alt="" aria-hidden="true" />
        </span>
        <strong>Aziz</strong>
      </button>
      <a href={withBase("/about")} onClick={go("/about")}>About</a>
      <a href={withBase("/services")} onClick={go("/services")}>Services</a>
      <a href={withBase("/projects")} onClick={go("/projects")}>Projects</a>
      <a href={withBase("/blog")} onClick={go("/blog")}>Blog</a>
      <a href={withBase("/contact")} onClick={go("/contact")}>Contact</a>
      <button
        className="theme-toggle"
        type="button"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <span aria-hidden="true">{theme === "dark" ? "Light" : "Dark"}</span>
      </button>
    </nav>
  );
}
