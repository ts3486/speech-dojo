import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, DEMO_USER } from "../config";
import { Card } from "../components/ui/Card";
import { StatusChip } from "../components/ui/StatusChip";
import { Button, LinkButton } from "../components/ui/Button";

type SessionListItem = {
  id: string;
  topic_id: string;
  topic_title: string;
  start_time: string;
  duration_seconds?: number | null;
  status: string;
  privacy: string;
  audio_url?: string | null;
  has_audio: boolean;
  has_transcript: boolean;
};

interface Props {
  onSelect?: (id: string) => void;
}

export function HistoryPage({ onSelect }: Props) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/sessions`, {
        headers: { "x-user-id": DEMO_USER }
      });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      const list = data.sessions || data || [];
      setSessions(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "History load failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function deleteSession(id: string) {
    const confirmed = window.confirm("Delete this session?");
    if (!confirmed) return;
    const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": DEMO_USER }
    });
    if (!res.ok) {
      setError("Delete failed");
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <section className="page page-history">
      <h2>Session History</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      {!loading && sessions.length === 0 ? (
        <div className="empty-state" role="status">
          <div className="empty-illustration" aria-hidden="true" />
          <div>
            <h3>No sessions yet</h3>
            <p>Start a new session to see your progress here.</p>
            <Button onClick={() => navigate("/session")}>Start a session</Button>
          </div>
        </div>
      ) : (
        <div className="history-grid" role="list">
          {sessions.map((s) => (
            <Card
              key={s.id}
              title={s.topic_title}
              actions={
                <>
                  {onSelect ? (
                    <Button variant="secondary" onClick={() => onSelect(s.id)}>
                      Open
                    </Button>
                  ) : (
                    <LinkButton to={`/sessions/${s.id}`} variant="secondary">
                      Open
                    </LinkButton>
                  )}
                  <Button variant="danger" onClick={() => deleteSession(s.id)}>
                    Delete
                  </Button>
                </>
              }
            >
              <div className="meta-row">
                <span>{new Date(s.start_time).toLocaleString()}</span>
                <span>Duration: {s.duration_seconds ?? "?"}s</span>
                <StatusChip
                  label={s.status}
                  tone={
                    s.status === "ended"
                      ? "active"
                      : s.status === "recovering"
                      ? "recovering"
                      : s.status === "error"
                      ? "error"
                      : "idle"
                  }
                />
              </div>
              <div className="meta-row">
                <span>Audio: {s.has_audio ? "yes" : "no"}</span>
                <span>Transcript: {s.has_transcript ? "yes" : "no"}</span>
                <span>Privacy: {s.privacy}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
