import { StatusChip } from "./ui/StatusChip";

export type StatusState = {
  connection: "idle" | "connecting" | "active" | "recovering" | "error";
  mic: "idle" | "granted" | "denied" | "error";
  token: "idle" | "valid" | "refreshing" | "error";
  info?: string;
};

interface Props {
  status: StatusState;
}

export function StatusBar({ status }: Props) {
  return (
    <div
      aria-label="session status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <StatusChip
        label={`Connection: ${status.connection}`}
        tone={
          status.connection === "active"
            ? "active"
            : status.connection === "recovering"
            ? "recovering"
            : status.connection === "error"
            ? "error"
            : "idle"
        }
      />
      <StatusChip
        label={`Mic: ${status.mic}`}
        tone={
          status.mic === "granted"
            ? "active"
            : status.mic === "denied" || status.mic === "error"
            ? "error"
            : "idle"
        }
      />
      <StatusChip
        label={`Token: ${status.token}`}
        tone={
          status.token === "valid"
            ? "active"
            : status.token === "refreshing"
            ? "recovering"
            : status.token === "error"
            ? "error"
            : "idle"
        }
      />
      {status.info && (
        <span style={{ color: "var(--color-muted)", fontSize: 14 }}>
          {status.info}
        </span>
      )}
    </div>
  );
}
