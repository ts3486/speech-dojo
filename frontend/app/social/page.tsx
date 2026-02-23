'use client';

import { useQuery } from "@tanstack/react-query";
import { SocialSessionCard } from "../../src/components/SocialSessionCard";
import { fetchPublicSessions, type PublicSessionListItem } from "../../src/services/api";

function SkeletonCard() {
  return (
    <div className="social-card">
      <div className="social-card__header">
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="skeleton" style={{ height: 13, width: 100 }} />
          <div className="skeleton" style={{ height: 12, width: 140 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 15, width: "80%" }} />
      <div className="skeleton" style={{ height: 13, width: 60 }} />
    </div>
  );
}

export default function SocialHubPage() {
  const { data: sessions = [], isLoading, isError, error } = useQuery<PublicSessionListItem[]>({
    queryKey: ["publicSessions"],
    queryFn: fetchPublicSessions,
    staleTime: 30_000,
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Community</p>
          <h2>Social Hub</h2>
          <p className="lede">Shared speech sessions from the community</p>
        </div>
      </div>

      {isError && (
        <p className="text-danger">{(error as Error)?.message ?? "Failed to load sessions"}</p>
      )}

      {isLoading ? (
        <div className="social-feed-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-muted)" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🎙</p>
          <p style={{ fontWeight: 600, fontSize: 16, color: "var(--color-text)" }}>No shared sessions yet.</p>
          <p style={{ fontSize: 14 }}>Be the first to share!</p>
        </div>
      ) : (
        <div className="social-feed-grid">
          {sessions.map((s) => (
            <SocialSessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}
