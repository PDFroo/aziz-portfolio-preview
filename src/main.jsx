import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { applySeo, loadContent } from "./api";
import { defaultContent } from "./data/defaultContent";
const Admin = lazy(() => import("./pages/Admin")); // Cloudflare/D1 admin (kept for a future Cloudflare deploy)
const GitHubAdmin = lazy(() => import("./admin/AdminApp"));
import Home from "./pages/Home";
import PortfolioPage from "./pages/PortfolioPage";
import "./styles.css";
import { STATIC, stripBase, withBase } from "./base";

function App() {
  const [content, setContent] = useState(null);
  const [path, setPath] = useState(() => stripBase(window.location.pathname));
  const [theme, setTheme] = useState(() => localStorage.getItem("abdul-aziz-theme") || defaultContent.theme?.defaultMode || "dark");

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

  if (path.startsWith("/admin") && STATIC) {
    return <Suspense fallback={<main className="loading-screen"><span>Loading admin…</span></main>}><GitHubAdmin /></Suspense>;
  }

  if (path.startsWith("/admin") && !STATIC) {
    return <Suspense fallback={null}><Admin content={content} setContent={setContent} navigate={navigate} /></Suspense>;
  }

  if (path !== "/") {
    return <PortfolioPage content={content} navigate={navigate} path={path} theme={theme} setTheme={setTheme} />;
  }

  return <Home content={content} navigate={navigate} theme={theme} setTheme={setTheme} />;
}

createRoot(document.getElementById("root")).render(<App />);
