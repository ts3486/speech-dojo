type Segment = { speaker: string; text: string; timestamp?: string };

interface Props {
  segments: Segment[];
  emptyMessage?: string;
}

export function TranscriptView({ segments, emptyMessage }: Props) {
  if (!segments.length) {
    return (
      <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 14 }}>
        {emptyMessage ?? "No transcript yet."}
      </p>
    );
  }
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
