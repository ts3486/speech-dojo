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
      className="flex items-center gap-3 px-3 py-2 border border-border rounded-[12px] bg-surface shadow-soft"
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
        <span className="text-sm text-muted">{status.info}</span>
      )}
    </div>
  );
}
