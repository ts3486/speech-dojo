import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE, DEMO_USER } from "../config";
import { StatusChip } from "../components/ui/StatusChip";
import { Button, LinkButton } from "../components/ui/Button";
import { fetchSessions } from "../services/api";

type SessionListItem = {
  id: string;
  topic_id: string;
  topic_title: string;
  topic_category?: string | null;
  start_time: string;
  duration_seconds?: number | null;
  status: string;
  privacy: string;
  audio_url?: string | null;
  has_audio: boolean;
  has_transcript: boolean;
};

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    ended: "Completed",
    in_progress: "In Progress",
    error: "Error",
    recovering: "Recovering",
    created: "Started",
  };
  return map[status] ?? status;
}

function statusTone(status: string): "active" | "recovering" | "error" | "idle" {
  if (status === "ended") return "active";
  if (status === "recovering") return "recovering";
  if (status === "error") return "error";
  return "idle";
}

interface Props {
  onSelect?: (id: string) => void;
}

export function HistoryPage({ onSelect }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const {
    data: sessions = [],
    isLoading: loading,
    isError,
    error
  } = useQuery<SessionListItem[]>({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    retry: false
  });

  async function deleteSession(id: string) {
    const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": DEMO_USER }
    });
    if (!res.ok) {
      console.error("Delete failed");
      return;
    }
    queryClient.setQueryData<SessionListItem[] | undefined>(["sessions"], (prev) =>
      (prev ?? []).filter((s) => s.id !== id)
    );
    setConfirmingDelete(null);
  }

  return (
    <section className="page page-history">
      <div className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h2>History</h2>
        </div>
        <Button onClick={() => navigate("/session")}>Start a session</Button>
      </div>

      {loading && (
        <div className="history-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="history-row-skeleton skeleton" />
          ))}
        </div>
      )}
      {isError && <p className="text-danger">{(error as Error)?.message ?? "History load failed"}</p>}
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
        <div className="history-list" role="list">
          {sessions.map((s) => (
            <article className="history-row" key={s.id} role="listitem">
              <div className="history-row__content">
                <h3>{s.topic_title}</h3>
                <p className="meta-row">
                  <span>{new Date(s.start_time).toLocaleString()}</span>
                  <span>{formatDuration(s.duration_seconds)}</span>
                  {s.topic_category && (
                    <span className={`category-badge category-badge--${s.topic_category}`}>
                      {s.topic_category}
                    </span>
                  )}
                  <StatusChip
                    label={formatStatus(s.status)}
                    tone={statusTone(s.status)}
                  />
                </p>
              </div>
              <div className="history-row__actions">
                {onSelect ? (
                  <Button variant="secondary" onClick={() => onSelect(s.id)}>
                    Open
                  </Button>
                ) : (
                  <LinkButton to={`/sessions/${s.id}`} variant="secondary">
                    Open
                  </LinkButton>
                )}
                {confirmingDelete === s.id ? (
                  <div className="delete-confirm">
                    <span className="delete-confirm__label">Delete?</span>
                    <Button variant="danger" onClick={() => deleteSession(s.id)}>
                      Yes
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmingDelete(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button variant="danger" onClick={() => setConfirmingDelete(s.id)}>
                    Delete
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
