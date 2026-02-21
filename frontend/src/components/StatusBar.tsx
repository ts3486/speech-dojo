import { ReactNode } from "react";

export type StatusState = {
  connection: "idle" | "connecting" | "active" | "recovering" | "error";
  mic: "idle" | "granted" | "denied" | "error";
  token: "idle" | "valid" | "refreshing" | "error";
  info?: string;
};

type Tone = "idle" | "active" | "recovering" | "error";

function connectionTone(c: StatusState["connection"]): Tone {
  if (c === "active") return "active";
  if (c === "recovering" || c === "connecting") return "recovering";
  if (c === "error") return "error";
  return "idle";
}
function connectionLabel(c: StatusState["connection"]): string {
  if (c === "active") return "Live";
  if (c === "connecting") return "Connecting";
  if (c === "recovering") return "Reconnecting";
  if (c === "error") return "Error";
  return "—";
}

function micTone(m: StatusState["mic"]): Tone {
  if (m === "granted") return "active";
  if (m === "denied" || m === "error") return "error";
  return "idle";
}
function micLabel(m: StatusState["mic"]): string {
  if (m === "granted") return "Active";
  if (m === "denied") return "Denied";
  if (m === "error") return "Error";
  return "—";
}

function tokenTone(t: StatusState["token"]): Tone {
  if (t === "valid") return "active";
  if (t === "refreshing") return "recovering";
  if (t === "error") return "error";
  return "idle";
}
function tokenLabel(t: StatusState["token"]): string {
  if (t === "valid") return "Active";
  if (t === "refreshing") return "Refreshing";
  if (t === "error") return "Error";
  return "—";
}

function ConnectionIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M1 4.5C2.8 2.5 5.5 1.5 7 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M3 6.5C4.2 5.1 6 4.5 7.5 5.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7"/>
      <circle cx="7.5" cy="8.5" r="1.5" fill="currentColor" />
      <path d="M11 2.5C11 2.5 9 4.5 9.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.4"/>
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
      <rect x="3" y="0.5" width="5" height="7" rx="2.5" fill="currentColor" />
      <path d="M1 6a4.5 4.5 0 0 0 9 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <line x1="5.5" y1="10.5" x2="5.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="3.5" y1="12.5" x2="7.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M7 7.5L12 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 10.5L11.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

interface CellProps {
  icon: ReactNode;
  label: string;
  value: string;
  tone: Tone;
}

function StatusCell({ icon, label, value, tone }: CellProps) {
  return (
    <div className="status-cell">
      <div className={`status-cell__icon status-cell__icon--${tone}`}>{icon}</div>
      <span className="status-cell__label">{label}</span>
      <span className={`status-cell__value status-cell__value--${tone}`}>{value}</span>
    </div>
  );
}

interface Props {
  status: StatusState;
}

export function StatusBar({ status }: Props) {
  return (
    <div aria-label="session status" className="status-bar">
      <StatusCell
        icon={<ConnectionIcon />}
        label="Connection"
        value={connectionLabel(status.connection)}
        tone={connectionTone(status.connection)}
      />
      <StatusCell
        icon={<MicIcon />}
        label="Microphone"
        value={micLabel(status.mic)}
        tone={micTone(status.mic)}
      />
      <StatusCell
        icon={<KeyIcon />}
        label="Token"
        value={tokenLabel(status.token)}
        tone={tokenTone(status.token)}
      />
      {status.info && (
        <div className="status-bar__info">{status.info}</div>
      )}
    </div>
  );
}
