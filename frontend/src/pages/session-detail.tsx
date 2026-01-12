import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TranscriptView } from "../components/TranscriptView";
import { API_BASE, DEMO_USER } from "../config";

type TranscriptSegment = { speaker: string; text: string };

type SessionDetail = {
  id: string;
  topic_title: string;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number | null;
  status: string;
  privacy: string;
  audio_url?: string | null;
  transcript: TranscriptSegment[];
};

interface Props {
  sessionId?: string;
  onBack?: () => void;
}

export function SessionDetailPage({ sessionId, onBack }: Props) {
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const id = sessionId || params.id || params.sessionId;

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
          headers: { "x-user-id": DEMO_USER }
        });
        if (!res.ok) throw new Error("Failed to load session");
        const data = await res.json();
        setDetail(data.session || data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Session load failed";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  return (
    <section>
      {onBack && <button onClick={onBack}>Back to history</button>}
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {detail && (
        <>
          <h2>Session Detail</h2>
          <p>
            <strong>Topic:</strong> {detail.topic_title}
          </p>
          <p>
            <strong>Status:</strong> {detail.status} • <strong>Duration:</strong>{" "}
            {detail.duration_seconds ?? "?"}s
          </p>
          {detail.audio_url && (
            <audio src={detail.audio_url} controls style={{ display: "block", margin: "0.5rem 0" }} />
          )}
          <h3>Transcript</h3>
          <TranscriptView segments={detail.transcript || []} />
        </>
      )}
    </section>
  );
}
