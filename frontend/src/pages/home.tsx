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
};

function TopicSection({
  title,
  topics,
  onSelect
}: {
  title: string;
  topics: Topic[];
  onSelect: (topic: Topic) => void;
}) {
  return (
    <section className="topic-section">
      <h3>{title}</h3>
      <div className="tile-grid">
        {Array.from({ length: 3 }).map((_, idx) => {
          const topic = topics[idx];
          const disabled = !topic;
          return (
            <button
              key={topic?.id ?? `${title}-${idx}`}
              type="button"
              className="topic-tile"
              onClick={() => topic && onSelect(topic)}
              disabled={disabled}
              aria-label={topic ? `Start session for ${topic.title}` : "Topic coming soon"}
            >
              <span>{topic?.title ?? "Coming soon"}</span>
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
      {isLoading && <p>Loading topics…</p>}
      <div className="home-grid">
        <TopicSection title="Solo" topics={practiceTopics} onSelect={handleSelect} />
        <TopicSection title="Interactive" topics={agentTopics} onSelect={handleSelect} />
      </div>
    </div>
  );
}
