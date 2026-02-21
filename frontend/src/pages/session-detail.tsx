import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TranscriptView } from "../components/TranscriptView";
import { StatusChip } from "../components/ui/StatusChip";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { fetchSessionDetail } from "../services/api";

type TranscriptSegment = { speaker: string; text: string };

type SessionDetail = {
  id: string;
  topic_id?: string | null;
  topic_title: string;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number | null;
  status: string;
  privacy: string;
  audio_url?: string | null;
  transcript: TranscriptSegment[];
};

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    ended: "Completed",
    in_progress: "In Progress",
    error: "Error",
    recovering: "Recovering",
  };
  return map[status] ?? status;
}

interface Props {
  sessionId?: string;
  onBack?: () => void;
}

export function SessionDetailPage({ sessionId, onBack }: Props) {
  const params = useParams();
  const navigate = useNavigate();
  const id = sessionId || params.id || params.sessionId;

  const {
    data: detail,
    isLoading: loading,
    isError,
    error
  } = useQuery<SessionDetail>({
    queryKey: ["session", id],
    queryFn: () => fetchSessionDetail(String(id)),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false
  });

  function handlePracticeAgain() {
    if (!detail) return;
    const params = new URLSearchParams({ topicTitle: detail.topic_title });
    if (detail.topic_id) params.set("topicId", detail.topic_id);
    navigate(`/session?${params.toString()}`);
  }

  return (
    <section className="page session-detail">
      <div className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h2>{detail?.topic_title ?? "Session Detail"}</h2>
          <div className="meta-row">
            <span>{detail ? new Date(detail.start_time).toLocaleString() : ""}</span>
            {detail?.duration_seconds ? <span>{detail.duration_seconds}s</span> : null}
            {detail ? (
              <StatusChip
                label={formatStatus(detail.status)}
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
        <div className="actions-inline">
          {detail && (
            <Button onClick={handlePracticeAgain}>
              Practice Again
            </Button>
          )}
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              Back to History
            </Button>
          )}
        </div>
      </div>

      {loading && <p>Loading…</p>}
      {isError && <p className="text-danger">{(error as Error)?.message ?? "Failed to load session"}</p>}
      {detail && (
        <Card>
          {detail.audio_url ? (
            <div className="audio-player-wrapper">
              <div className="audio-player-label">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="3" y="1" width="4" height="7" rx="2" fill="currentColor" />
                  <path d="M0.5 6a6.5 6.5 0 0 0 13 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <line x1="7" y1="12.5" x2="7" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="4.5" y1="13.5" x2="9.5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Recording
              </div>
              <audio
                className="audio-player"
                aria-label="session audio player"
                src={detail.audio_url}
                controls
                style={{ width: "100%" }}
              />
            </div>
          ) : (
            <p style={{ color: "var(--color-muted)", fontSize: 14 }}>No audio available for this session.</p>
          )}
          <h4 style={{ marginTop: 20, marginBottom: 12 }}>Transcript</h4>
          <TranscriptView
            segments={detail.transcript || []}
            emptyMessage="No transcript available for this session."
          />
        </Card>
      )}
    </section>
  );
}
