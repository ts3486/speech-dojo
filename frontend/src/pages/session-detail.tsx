import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TranscriptView } from "../components/TranscriptView";
import { StatusChip } from "../components/ui/StatusChip";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
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
    <section className="page session-detail">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Session Detail</h2>
          <div className="meta-row">
            <span>{detail ? new Date(detail.start_time).toLocaleString() : ""}</span>
            {detail?.duration_seconds ? <span>{detail.duration_seconds}s</span> : null}
            {detail ? (
              <StatusChip
                label={detail.status}
                tone={
                  detail.status === "ended"
                    ? "active"
                    : detail.status === "recovering"
                    ? "recovering"
                    : detail.status === "error"
                    ? "error"
                    : "idle"
                }
              />
            ) : null}
          </div>
        </div>
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            Back to history
          </Button>
        )}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      {detail && (
        <Card>
          <h3 style={{ marginTop: 0 }}>{detail.topic_title}</h3>
          {detail.audio_url ? (
            <audio
              className="audio-player"
              aria-label="session audio player"
              src={detail.audio_url}
              controls
            />
          ) : (
            <p>No audio available for this session.</p>
          )}
          <h4>Transcript</h4>
          <TranscriptView segments={detail.transcript || []} />
        </Card>
      )}
    </section>
  );
}
