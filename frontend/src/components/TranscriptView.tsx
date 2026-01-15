type Segment = { speaker: string; text: string; timestamp?: string };

interface Props {
  segments: Segment[];
}

export function TranscriptView({ segments }: Props) {
  if (!segments.length) return <p>No transcript yet.</p>;
  return (
    <ul className="transcript-list" aria-label="transcript">
      {segments.map((s, idx) => (
        <li key={idx}>
          <span className="pill">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-secondary)" }} />
            {s.speaker}
            {s.timestamp ? ` • ${s.timestamp}` : ""}
          </span>
          <div>{s.text}</div>
        </li>
      ))}
    </ul>
  );
}
