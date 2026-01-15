interface Props {
  label: string;
  tone?: "active" | "recovering" | "error" | "idle";
}

export function StatusChip({ label, tone = "idle" }: Props) {
  const toneMap: Record<Props["tone"], { bg: string; color: string }> = {
    active: { bg: "rgba(42,157,143,0.15)", color: "var(--color-secondary)" },
    recovering: { bg: "rgba(244,162,97,0.2)", color: "var(--color-primary)" },
    error: { bg: "rgba(196,69,54,0.15)", color: "var(--color-danger)" },
    idle: { bg: "rgba(0,0,0,0.05)", color: "var(--color-muted)" },
  };

  const toneStyle = toneMap[tone] || toneMap.idle;

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: "999px",
        fontWeight: 600,
        fontSize: "12px",
        background: toneStyle.bg,
        color: toneStyle.color,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      }}
      aria-label={`Status: ${label}`}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: toneStyle.color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}
