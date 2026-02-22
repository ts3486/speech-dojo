import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TranscriptView } from "../components/TranscriptView";
import { StatusChip } from "../components/ui/StatusChip";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AiFeedbackPanel } from "../components/AiFeedbackPanel";
import { fetchSessionDetail, setSessionPrivacy } from "../services/api";

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

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
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

  const queryClient = useQueryClient();

  const privacyMutation = useMutation({
    mutationFn: (p: "public" | "private") => setSessionPrivacy(String(id), p),
    onSuccess: (data) => {
      queryClient.setQueryData(["session", id], (old: SessionDetail | undefined) =>
        old ? { ...old, privacy: data.privacy } : old
      );
      queryClient.invalidateQueries({ queryKey: ["publicSessions"] });
    },
  });
  
  const duration = formatDuration(detail?.duration_seconds);

  return (
    <section className="page session-detail">
      {/* Breadcrumb */}
      {!onBack && (
        <Link to="/history" className="breadcrumb-link">
          ← History
        </Link>
      )}

      <div className="page-header">
        <div>
          <p className="eyebrow">Session Detail</p>
          <h2>{detail?.topic_title ?? "Session Detail"}</h2>
          <div className="meta-row">
            <span>{detail ? new Date(detail.start_time).toLocaleString() : ""}</span>
            {duration && <span>· {duration}</span>}
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
        <>
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

            <div className="section-title transcript-divider">Transcript</div>
            <TranscriptView
              segments={detail.transcript || []}
              emptyMessage="No transcript available for this session."
            />

            {detail.status === "ended" && (
              <div className="privacy-toggle">
                <span className="privacy-toggle__label">Visibility</span>
                <span className="privacy-toggle__status">
                  {detail.privacy === "public"
                    ? "Public — visible in Social Hub"
                    : "Private — only you can see this"}
                </span>
                {detail.privacy === "public" ? (
                  <Button
                    variant="ghost"
                    onClick={() => privacyMutation.mutate("private")}
                    disabled={privacyMutation.isPending}
                  >
                    Make Private
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => privacyMutation.mutate("public")}
                    disabled={privacyMutation.isPending}
                  >
                    Share to Social Hub
                  </Button>
                )}
              </div>
            )}
          </Card>
          <AiFeedbackPanel
            sessionId={detail.id}
            hasTranscript={(detail.transcript || []).length > 0}
            status={detail.status}
          />
        </>
      )}
    </section>
  );
}
