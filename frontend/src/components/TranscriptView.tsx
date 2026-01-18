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
            <span className="pill-dot" />
            {s.speaker}
            {s.timestamp ? ` • ${s.timestamp}` : ""}
          </span>
          <div>{s.text}</div>
        </li>
      ))}
    </ul>
  );
}
