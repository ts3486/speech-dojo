import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import SessionPage from "./pages/session";
import { HistoryPage } from "./pages/history";
import { SessionDetailPage } from "./pages/session-detail";
import { HomePage } from "./pages/home";
import { SocialHubPage } from "./pages/social";
import { PublicSessionDetailPage } from "./pages/social-detail";

function Shell() {
  const location = useLocation();
  const path = location.pathname;
  const isSession = path === "/session";
  const isHistory = path === "/history" || path.startsWith("/sessions");
  const isSocial = path === "/social" || path.startsWith("/social/");

  return (
    <header className="app-header">
      <div className="brand">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect x="8" y="1" width="6" height="12" rx="3" fill="currentColor" />
          <path d="M3 10a8 8 0 0 0 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          <line x1="11" y1="18" x2="11" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="7" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Speech <span>Dojo</span>
      </div>
      <nav className="nav" aria-label="Primary">
        <Link to="/" aria-current={path === "/" ? "page" : undefined}>
          Home
        </Link>
        <Link to="/session" aria-current={isSession ? "page" : undefined}>
          Session
        </Link>
        <Link to="/history" aria-current={isHistory ? "page" : undefined}>
          History
        </Link>
        <Link to="/social" aria-current={isSocial ? "page" : undefined}>
          Social Hub
        </Link>
      </nav>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="app-header-wrapper">
        <Shell />
      </div>
      <div className="app-shell">
        <main id="main" role="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/sessions/:id" element={<SessionDetailPage />} />
            <Route path="/social" element={<SocialHubPage />} />
            <Route path="/social/:id" element={<PublicSessionDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
