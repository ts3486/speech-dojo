import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TranscriptView } from "../components/TranscriptView";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  fetchPublicSessionDetail,
  fetchComments,
  toggleLike,
  postComment,
  deleteComment,
  type PublicSessionDetail,
  type CommentItem,
  type PublicSessionListItem,
} from "../services/api";

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
}

function speakerColor(tag: string): string {
  const colors = ["#EBE9FA", "#FFE5E5", "#E8FFF0"];
  const idx = tag.length > 8 ? tag.charCodeAt(8) % 3 : 0;
  return colors[idx] ?? colors[0];
}

function CommentItemView({
  comment,
  canDelete,
  onDelete,
}: {
  comment: CommentItem;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="comment-item">
      <div className="comment-item__header">
        <span className="comment-item__speaker">{comment.speaker_tag}</span>
        <span className="comment-item__date">· {formatDate(comment.created_at)}</span>
        {canDelete && (
          <button
            type="button"
            className="comment-item__delete"
            onClick={() => onDelete(comment.id)}
            aria-label="Delete comment"
          >
            🗑
          </button>
        )}
      </div>
      <p className="comment-item__text">{comment.text}</p>
    </div>
  );
}

export function PublicSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: session, isLoading, isError } = useQuery<PublicSessionDetail>({
    queryKey: ["publicSession", id],
    queryFn: () => fetchPublicSessionDetail(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const { data: comments = [] } = useQuery<CommentItem[]>({
    queryKey: ["comments", id],
    queryFn: () => fetchComments(id!),
    enabled: Boolean(id),
    staleTime: 10_000,
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(id!),
    onSuccess: (data) => {
      queryClient.setQueryData(["publicSession", id], (old: PublicSessionDetail | undefined) =>
        old ? { ...old, like_count: data.like_count, user_has_liked: data.user_has_liked } : old
      );
      queryClient.setQueryData(["publicSessions"], (old: PublicSessionListItem[] | undefined) =>
        old?.map((s) => s.id === id ? { ...s, like_count: data.like_count } : s)
      );
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => postComment(id!, text),
    onSuccess: (newComment) => {
      queryClient.setQueryData(["comments", id], (old: CommentItem[] | undefined) =>
        [...(old ?? []), newComment]
      );
      setCommentText("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(id!, commentId),
    onSuccess: (_data, commentId) => {
      queryClient.setQueryData(["comments", id], (old: CommentItem[] | undefined) =>
        old?.filter((c) => c.id !== commentId)
      );
    },
  });

  if (isLoading) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="page">
        <p className="text-danger">Session not found or not public.</p>
        <Link to="/social">← Back to Social Hub</Link>
      </div>
    );
  }

  const avatarColor = speakerColor(session.speaker_tag);
  const duration = formatDuration(session.duration_seconds);

  return (
    <div className="page">
      <Link to="/social" className="breadcrumb-link">
        ← Social Hub
      </Link>

      <div className="page-header">
        <div>
          <div className="public-detail-header">
            <div
              className="public-detail-avatar"
              style={{ backgroundColor: avatarColor }}
            >
              {session.speaker_tag.charAt(0)}
            </div>
            <div className="public-detail-speaker-meta">
              <span className="public-detail-speaker-name">{session.speaker_tag}</span>
              <div className="public-detail-speaker-sub">
                {formatDate(session.start_time)}
                {duration && ` · ${duration}`}
                {session.topic_category && (
                  <span className="social-card__category">{session.topic_category}</span>
                )}
              </div>
            </div>
          </div>
          <h2 className="public-detail-title">{session.topic_title}</h2>
        </div>
      </div>

      <Card>
        {session.audio_url ? (
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
              src={session.audio_url}
              controls
              style={{ width: "100%" }}
            />
          </div>
        ) : (
          <p style={{ color: "var(--color-muted)", fontSize: 14 }}>No audio available for this session.</p>
        )}

        <div style={{ marginTop: 20, marginBottom: 12 }} className="section-title">Transcript</div>
        <TranscriptView
          segments={session.transcript || []}
          emptyMessage="No transcript available for this session."
        />

        {/* Likes section */}
        <div className="like-section">
          <button
            type="button"
            className={`like-btn${session.user_has_liked ? " like-btn--liked" : ""}`}
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            aria-pressed={session.user_has_liked}
            aria-label={session.user_has_liked ? "Unlike this session" : "Like this session"}
          >
            <span aria-hidden="true">♥</span>
            {session.user_has_liked ? "Unlike" : "Like"}
          </button>
          <span className="like-btn__count">
            {session.like_count} {session.like_count === 1 ? "like" : "likes"}
          </span>
        </div>

        {/* Comments section */}
        <div className="comments-section">
          <div className="comments-section__title">
            Comments ({comments.length})
          </div>
          {comments.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 16 }}>
              No comments yet. Be the first!
            </p>
          )}
          {comments.map((c) => (
            <CommentItemView
              key={c.id}
              comment={c}
              canDelete={c.speaker_tag === session.speaker_tag}
              onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
            />
          ))}
          <div className="comment-form">
            <textarea
              placeholder="Add a comment… (max 500 characters)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <div className="comment-form__actions">
              <Button
                size="sm"
                onClick={() => {
                  if (commentText.trim()) commentMutation.mutate(commentText.trim());
                }}
                disabled={!commentText.trim() || commentMutation.isPending}
              >
                {commentMutation.isPending ? "Posting…" : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="practice-cta">
        <div className="practice-cta__text">
          <span className="practice-cta__label">Ready to practice?</span>
          <p className="practice-cta__desc">Try this topic yourself in a live session.</p>
        </div>
        <Button
          onClick={() =>
            navigate(`/session?topicTitle=${encodeURIComponent(session.topic_title)}`)
          }
        >
          Practice This Topic →
        </Button>
      </div>
    </div>
  );
}
