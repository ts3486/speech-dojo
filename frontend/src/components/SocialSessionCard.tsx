import { LinkButton } from "./ui/Button";
import type { PublicSessionListItem } from "../services/api";

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function speakerColor(tag: string): string {
  const colors = ["#EBE9FA", "#FFE5E5", "#E8FFF0"];
  // Use charCodeAt safely - tag might be "Speaker #XXXX" (length 13+)
  const idx = tag.length > 8 ? tag.charCodeAt(8) % 3 : 0;
  return colors[idx] ?? colors[0];
}

export function SocialSessionCard({ session }: { session: PublicSessionListItem }) {
  const duration = formatDuration(session.duration_seconds);
  const date = formatDate(session.start_time);
  const avatarColor = speakerColor(session.speaker_tag);

  return (
    <div className="social-card">
      <div className="social-card__header">
        <div className="social-card__avatar" style={{ backgroundColor: avatarColor }}>
          {session.speaker_tag.charAt(0)}
        </div>
        <div className="social-card__meta">
          <span className="social-card__speaker">{session.speaker_tag}</span>
          <span className="social-card__date">
            {date}
            {duration && ` · ${duration}`}
            {session.topic_category && (
              <span className="social-card__category" style={{ marginLeft: 6 }}>{session.topic_category}</span>
            )}
          </span>
        </div>
      </div>
      <div className="social-card__title">{session.topic_title}</div>
      <div className="social-card__footer">
        <span className="social-card__likes">
          <span aria-hidden="true">♥</span> {session.like_count}
        </span>
        <LinkButton to={`/social/${session.id}`} variant="secondary">
          Listen →
        </LinkButton>
      </div>
    </div>
  );
}
