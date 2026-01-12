import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SessionPage from "./pages/session";
import { HistoryPage } from "./pages/history";
import { SessionDetailPage } from "./pages/session-detail";

function App() {
  return (
    <BrowserRouter>
      <main>
        <h1>Speech Dojo</h1>
        <nav style={{ marginBottom: "1rem" }}>
          <Link to="/session">Start Session</Link>{" | "}
          <Link to="/history">History</Link>
        </nav>

        <Routes>
          <Route path="/" element={<SessionPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
