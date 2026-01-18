type Tone = "active" | "recovering" | "error" | "idle";

interface Props {
  label: string;
  tone?: Tone;
}

export function StatusChip({ label, tone = "idle" }: Props) {
  const toneMap: Record<Tone, { bg: string; dot: string; text: string }> = {
    active: { bg: "bg-secondary/15", dot: "bg-secondary", text: "text-secondary" },
    recovering: { bg: "bg-primary/20", dot: "bg-primary", text: "text-primary" },
    error: { bg: "bg-danger/15", dot: "bg-danger", text: "text-danger" },
    idle: { bg: "bg-black/5", dot: "bg-muted", text: "text-muted" }
  };

  const toneStyle = toneMap[tone ?? "idle"];

  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${toneStyle.bg} ${toneStyle.text}`}
      aria-label={`Status: ${label}`}
    >
      <span className={`w-2 h-2 rounded-full inline-block ${toneStyle.dot}`} />
      {label}
    </span>
  );
}
