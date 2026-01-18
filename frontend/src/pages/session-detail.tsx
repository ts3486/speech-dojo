import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TranscriptView } from "../components/TranscriptView";
import { StatusChip } from "../components/ui/StatusChip";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { fetchSessionDetail } from "../services/api";

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
  const params = useParams();
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

  return (
    <section className="page session-detail">
      <div className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h2>History Detail</h2>
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
      {isError && <p className="text-danger">{(error as Error)?.message ?? "Failed to load session"}</p>}
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
