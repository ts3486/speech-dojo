'use client';

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TranscriptView } from "../../../src/components/TranscriptView";
import { StatusChip } from "../../../src/components/ui/StatusChip";
import { Button } from "../../../src/components/ui/Button";
import { AiFeedbackPanel } from "../../../src/components/AiFeedbackPanel";
import { fetchSessionDetail, setSessionPrivacy } from "../../../src/services/api";

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type StatusTone = "active" | "recovering" | "error" | "idle";
function statusTone(status: string): StatusTone {
  if (status === "ended") return "active";
  if (status === "recovering") return "recovering";
  if (status === "error") return "error";
  return "idle";
}

// ── Icons ──────────────────────────────────────────────────────────────────

function IconMic() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="6" height="9" rx="3" fill="currentColor" fillOpacity="0.9" />
      <path d="M2 8a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <line x1="8" y1="14" x2="8" y2="15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="5.5" y1="15.5" x2="10.5" y2="15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconScroll() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.5" y="2" width="11" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5.5" y1="10.5" x2="8.5" y2="10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="9" cy="9" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.3" />
      <line x1="1.5" y1="9" x2="16.5" y2="9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3.5" y="8.5" width="11" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6 8.5V6.5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="sd-skeleton-wrap">
      <div className="sd-skeleton-hero skeleton" />
      <div className="sd-body">
        <div className="sd-main">
          <div className="skeleton sd-skeleton-card" />
          <div className="skeleton sd-skeleton-card" style={{ height: 260 }} />
        </div>
        <div className="sd-aside">
          <div className="skeleton sd-skeleton-card" style={{ height: 300 }} />
        </div>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

function SessionDetailPage() {
  const params = useParams();
  const id = params.id;

  const {
    data: detail,
    isLoading: loading,
    isError,
    error,
  } = useQuery<SessionDetail>({
    queryKey: ["session", id],
    queryFn: () => fetchSessionDetail(String(id)),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
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
  const isPublic = detail?.privacy === "public";

  return (
    <section className="sd-page">

      {/* Back nav */}
      <nav className="sd-nav">
        <Link href="/history" className="breadcrumb-link">← History</Link>
      </nav>

      {/* Hero */}
      <div className="sd-hero">
        <div className="sd-hero__body">
          <p className="sd-hero__eyebrow">Session Detail</p>
          <h1 className="sd-hero__title">{detail?.topic_title ?? "Loading…"}</h1>
          {detail && (
            <div className="sd-hero__meta">
              <span>{formatDate(detail.start_time)}</span>
              {duration && <span className="sd-hero__dot" aria-hidden="true" />}
              {duration && <span>{duration}</span>}
              <StatusChip
                label={formatStatus(detail.status)}
                tone={statusTone(detail.status)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && <PageSkeleton />}

      {/* Error */}
      {isError && (
        <div className="sd-error">
          <p className="sd-error__msg">
            {(error as Error)?.message ?? "Failed to load session"}
          </p>
        </div>
      )}

      {/* Main content */}
      {detail && (
        <div className="sd-body">

          {/* ── Left column ──────────────────────────────── */}
          <div className="sd-main">

            {/* Recording */}
            <div className="sd-card">
              <header className="sd-card__header">
                <div className="sd-card__icon sd-card__icon--violet">
                  <IconMic />
                </div>
                <span className="sd-card__title">Recording</span>
              </header>
              {detail.audio_url ? (
                <audio
                  controls
                  src={detail.audio_url}
                  className="sd-audio"
                  aria-label="Session audio player"
                />
              ) : (
                <p className="sd-muted-note">No audio recorded for this session.</p>
              )}
            </div>

            {/* Transcript */}
            <div className="sd-card">
              <header className="sd-card__header">
                <div className="sd-card__icon sd-card__icon--coral">
                  <IconScroll />
                </div>
                <span className="sd-card__title">Transcript</span>
                {(detail.transcript?.length ?? 0) > 0 && (
                  <span className="sd-card__count">
                    {detail.transcript.length} segment{detail.transcript.length !== 1 ? "s" : ""}
                  </span>
                )}
              </header>
              <div className="sd-transcript-body">
                <TranscriptView
                  segments={detail.transcript || []}
                  emptyMessage="No transcript available for this session."
                />
              </div>
            </div>

            {/* Share / Visibility — only for completed sessions */}
            {detail.status === "ended" && (
              <div className={`sd-share${isPublic ? " sd-share--public" : ""}`}>
                <div className={`sd-share__icon-wrap${isPublic ? " sd-share__icon-wrap--public" : ""}`}>
                  {isPublic ? <IconGlobe /> : <IconLock />}
                </div>
                <div className="sd-share__body">
                  <p className="sd-share__status">
                    {isPublic ? "Public" : "Private"}
                  </p>
                  <p className="sd-share__desc">
                    {isPublic
                      ? "Visible in Social Hub — others can listen and comment."
                      : "Only you can see this. Share it so others can learn from your practice."}
                  </p>
                </div>
                <div className="sd-share__action">
                  {isPublic ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => privacyMutation.mutate("private")}
                      disabled={privacyMutation.isPending}
                    >
                      Make Private
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => privacyMutation.mutate("public")}
                      disabled={privacyMutation.isPending}
                    >
                      Share to Social Hub
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: AI Feedback ─────────────────── */}
          <aside className="sd-aside">
            <AiFeedbackPanel
              sessionId={detail.id}
              hasTranscript={(detail.transcript || []).length > 0}
              status={detail.status}
            />
          </aside>

        </div>
      )}
    </section>
  );
}

export default function SessionDetailRoute() {
  return <SessionDetailPage />;
}
