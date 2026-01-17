import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import SessionPage from "./pages/session";
import { HistoryPage } from "./pages/history";
import { SessionDetailPage } from "./pages/session-detail";
import { HomePage } from "./pages/home";
import { ButtonStyles } from "./components/ui/Button";

function Shell() {
  const location = useLocation();
  const path = location.pathname;
  const isSession = path === "/session";
  const isHistory = path === "/history" || path.startsWith("/sessions");

  return (
    <>
      <header className="app-header">
        <div className="brand">Speech Dojo</div>
        <nav className="nav" aria-label="Primary">
          <Link to="/" aria-current={path === "/" ? "page" : undefined}>
            Home
          </Link>
          <Link
            to="/session"
            aria-current={isSession ? "page" : undefined}
          >
            Session
          </Link>
          <Link
            to="/history"
            aria-current={isHistory ? "page" : undefined}
          >
            History
          </Link>
        </nav>
      </header>

      <main id="main" className="page" role="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="app-shell">
        <Shell />
      </div>
      <ButtonStyles />
    </BrowserRouter>
  );
}

export default App;
