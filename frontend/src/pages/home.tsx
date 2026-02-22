import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTopics } from "../services/api";

type Topic = {
  id: string;
  title: string;
  category?: string | null;
  system_prompt?: string | null;
  difficulty?: string | null;
  prompt_hint?: string | null;
};

function SoloIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="4.5" y="0.5" width="5" height="8" rx="2.5" fill="currentColor" />
      <path d="M1.5 7a5.5 5.5 0 0 0 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="7" y1="12.5" x2="7" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.5" y1="13.5" x2="9.5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InteractiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="4.5" cy="7" r="1" fill="currentColor" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="9.5" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

function TopicSection({
  title,
  icon,
  iconVariant,
  description,
  topics,
  onSelect
}: {
  title: string;
  icon: React.ReactNode;
  iconVariant: "solo" | "interactive";
  description: string;
  topics: Topic[];
  onSelect: (topic: Topic) => void;
}) {
  return (
    <section className="topic-section">
      <div className="section-heading">
        <div className={`section-heading__icon section-heading__icon--${iconVariant}`}>
          {icon}
        </div>
        <div>
          <h3>{title}</h3>
        </div>
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-muted)" }}>{description}</p>
      <div className="tile-grid">
        {Array.from({ length: 3 }).map((_, idx) => {
          const topic = topics[idx];
          const disabled = !topic;
          return (
            <button
              key={topic?.id ?? `${title}-${idx}`}
              type="button"
              className={disabled ? "topic-tile topic-tile-skeleton skeleton" : "topic-tile"}
              onClick={() => topic && onSelect(topic)}
              disabled={disabled}
              aria-label={topic ? `Start session for ${topic.title}` : "Topic coming soon"}
            >
              {topic ? (
                <>
                  <span className="tile-title">{topic.title}</span>
                  {topic.prompt_hint && (
                    <span className="tile-hint">{topic.prompt_hint}</span>
                  )}
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function HomePage() {
  const navigate = useNavigate();

  const {
    data: topics = [],
    isLoading,
    isError,
    error
  } = useQuery<Topic[]>({
    queryKey: ["topics"],
    queryFn: fetchTopics,
    staleTime: 30_000
  });

  const practiceTopics = useMemo(() => topics.filter(t => t.category === "solo"), [topics]);
  const agentTopics = useMemo(() => topics.filter(t => t.category === "interactive"), [topics]);

  function handleSelect(topic: Topic) {
    const params = new URLSearchParams({
      topicId: topic.id,
      topicTitle: topic.title,
      mode: topic.category === "interactive" ? "interactive" : "solo",
      ...(topic.system_prompt ? { systemPrompt: topic.system_prompt } : {})
    });
    navigate(`/session?${params.toString()}`);
  }

  return (
    <div className="page home-page">
      <p className="eyebrow">Home</p>
      <h1>Practice your speech</h1>
      <p className="lede">Pick a topic to start a self-practice session or work with an agent. Your history will be saved automatically.</p>
      {isError && <p className="text-danger">{(error as Error)?.message ?? "Failed to load topics"}</p>}
      {isLoading ? (
        <div className="home-grid">
          {[0, 1].map(sectionIdx => (
            <div className="topic-section" key={sectionIdx}>
              <div className="skeleton" style={{ height: 28, width: 120, marginBottom: 12 }} />
              <div className="tile-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="topic-tile-skeleton skeleton" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="home-grid">
          <TopicSection
            title="Solo Practice"
            icon={<SoloIcon />}
            iconVariant="solo"
            description="Speak freely and get AI feedback after you finish."
            topics={practiceTopics}
            onSelect={handleSelect}
          />
          <TopicSection
            title="Interactive"
            icon={<InteractiveIcon />}
            iconVariant="interactive"
            description="Have a live conversation with an AI partner."
            topics={agentTopics}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}
