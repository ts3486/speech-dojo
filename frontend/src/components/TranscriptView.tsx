type Segment = { speaker: string; text: string; timestamp?: string };

interface Props {
  segments: Segment[];
  emptyMessage?: string;
}

export function TranscriptView({ segments, emptyMessage }: Props) {
  if (!segments.length) {
    return (
      <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 14, padding: "12px 0" }}>
        {emptyMessage ?? "No transcript yet."}
      </p>
    );
  }

  // Collect unique speakers in order of appearance
  const speakerOrder: string[] = [];
  segments.forEach((s) => {
    if (!speakerOrder.includes(s.speaker)) speakerOrder.push(s.speaker);
  });

  // Single speaker — show label once at top, then bubbles without repeating the label
  if (speakerOrder.length === 1) {
    return (
      <div className="transcript-solo" aria-label="transcript">
        <p className="transcript-solo__speaker">{speakerOrder[0]}</p>
        <div className="transcript-solo__bubbles">
          {segments.map((s, idx) => (
            <div key={idx} className="transcript-solo__bubble">
              {s.timestamp && <span className="transcript-solo__ts">{s.timestamp}</span>}
              <div className="transcript-bubble__text">{s.text}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Multi-speaker — chat bubble layout with alternating sides
  return (
    <div className="transcript-chat" aria-label="transcript">
      {segments.map((s, idx) => {
        const speakerIdx = speakerOrder.indexOf(s.speaker);
        const isAlt = speakerIdx % 2 === 1;
        return (
          <div key={idx} className={`transcript-bubble${isAlt ? " transcript-bubble--alt" : ""}`}>
            <div className="transcript-bubble__speaker">
              {s.speaker}
              {s.timestamp ? (
                <span className="transcript-bubble__ts">{s.timestamp}</span>
              ) : null}
            </div>
            <div className="transcript-bubble__text">{s.text}</div>
          </div>
        );
      })}
    </div>
  );
}
