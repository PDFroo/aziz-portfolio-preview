import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { applySeo, loadContent } from "./api";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import PortfolioPage from "./pages/PortfolioPage";
import "./styles.css";
import { STATIC, stripBase, withBase } from "./base";

function App() {
  const [content, setContent] = useState(null);
  const [path, setPath] = useState(() => stripBase(window.location.pathname));
  const [theme, setTheme] = useState(() => localStorage.getItem("abdul-aziz-theme") || "dark");

  useEffect(() => {
    loadContent().then((data) => {
      setContent(data);
      applySeo(data);
    });
  }, []);

  useEffect(() => {
    const onPopState = () => setPath(stripBase(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("abdul-aziz-theme", theme);
  }, [theme]);

  const navigate = useMemo(
    () => (nextPath) => {
      window.history.pushState({}, "", withBase(nextPath));
      setPath(nextPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  if (!content) {
    return (
      <main className="loading-screen">
        <span>Loading portfolio...</span>
      </main>
    );
  }

  if (path.startsWith("/admin") && !STATIC) {
    return <Admin content={content} setContent={setContent} navigate={navigate} />;
  }

  if (path !== "/" && !(STATIC && path.startsWith("/admin"))) {
    return <PortfolioPage content={content} navigate={navigate} path={path} theme={theme} setTheme={setTheme} />;
  }

  return <Home content={content} navigate={navigate} theme={theme} setTheme={setTheme} />;
}

createRoot(document.getElementById("root")).render(<App />);
