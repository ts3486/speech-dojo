type Segment = { speaker: string; text: string };

interface Props {
  segments: Segment[];
}

export function TranscriptView({ segments }: Props) {
  if (!segments.length) return <p>No transcript yet.</p>;
  return (
    <ul>
      {segments.map((s, idx) => (
        <li key={idx}>
          <strong>{s.speaker}:</strong> {s.text}
        </li>
      ))}
    </ul>
  );
}
