import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, DEMO_USER } from "../config";

type Topic = { id: string; title: string; category?: string | null };

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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/topics`, {
          headers: { "x-user-id": DEMO_USER }
        });
        if (!res.ok) throw new Error("Failed to load topics");
        const data = await res.json();
        setTopics(data || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load topics";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const practiceTopics = useMemo(() => topics.slice(0, 3), [topics]);
  const agentTopics = useMemo(() => topics.slice(3, 6), [topics]);

  function handleSelect(topic: Topic) {
    navigate(`/session?topicId=${encodeURIComponent(topic.id)}&topicTitle=${encodeURIComponent(topic.title)}`);
  }

  return (
    <div className="page home-page">
      <p className="eyebrow">Home</p>
      <h1>Practice your speech</h1>
      <p className="lede">Pick a topic to start a self-practice session or work with an agent. Your history will be saved automatically.</p>
      {error && <p className="text-danger">{error}</p>}
      {loading && <p>Loading topics…</p>}
      <div className="home-grid">
        <TopicSection title="Solo" topics={practiceTopics} onSelect={handleSelect} />
        <TopicSection title="Interactive" topics={agentTopics} onSelect={handleSelect} />
      </div>
    </div>
  );
}
