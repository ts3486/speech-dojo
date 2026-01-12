import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, DEMO_USER } from "../config";

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
    <section>
      <h2>Session History</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && sessions.length === 0 && <p>No sessions yet.</p>}
      <ul>
        {sessions.map((s) => (
          <li key={s.id} style={{ marginBottom: "0.5rem" }}>
            <div>
              <strong>{s.topic_title}</strong> — {new Date(s.start_time).toLocaleString()}
            </div>
            <div>Status: {s.status} • Duration: {s.duration_seconds ?? "?"}s • Audio: {s.has_audio ? "yes" : "no"} • Transcript: {s.has_transcript ? "yes" : "no"}</div>
            <div style={{ marginTop: "0.25rem" }}>
              <button onClick={() => (onSelect ? onSelect(s.id) : navigate(`/sessions/${s.id}`))}>Open</button>{" "}
              <button onClick={() => deleteSession(s.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
