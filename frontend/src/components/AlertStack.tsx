import { ReactNode } from "react";

export type AlertTone = "network" | "mic" | "token" | "info" | "error";

export type AlertAction = {
  label: string;
  onClick: () => void;
};

export type Alert = {
  id: string;
  tone: AlertTone;
  message: string;
  actions?: AlertAction[];
};

interface Props {
  alerts: Alert[];
}

const toneStyles: Record<AlertTone, { bg: string; border: string }> = {
  network: { bg: "#fff7ed", border: "#f4a261" },
  mic: { bg: "#fff7ed", border: "#f4a261" },
  token: { bg: "#fff7ed", border: "#f4a261" },
  info: { bg: "#f0f6ff", border: "#5b8def" },
  error: { bg: "#fff0ed", border: "#c44536" },
};

export function AlertStack({ alerts }: Props) {
  if (!alerts.length) return null;

  return (
    <div aria-label="alerts" style={{ display: "grid", gap: 12 }}>
      {alerts.map((alert) => {
        const tone = toneStyles[alert.tone] || toneStyles.info;
        return (
          <div
            key={alert.id}
            role="alert"
            style={{
              border: `1px solid ${tone.border}`,
              background: tone.bg,
              padding: "12px",
              borderRadius: "var(--radius)",
              display: "grid",
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>{alert.message}</span>
            {alert.actions && alert.actions.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {alert.actions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={action.onClick}
                    style={{
                      background: "transparent",
                      border: `1px solid ${tone.border}`,
                      borderRadius: "var(--radius)",
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
