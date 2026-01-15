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
  network: { bg: "#fff7ed", border: "var(--color-primary)" },
  mic: { bg: "#fff7ed", border: "var(--color-primary)" },
  token: { bg: "#fff7ed", border: "var(--color-primary)" },
  info: { bg: "#f0f6ff", border: "#5b8def" },
  error: { bg: "#fff0ed", border: "var(--color-danger)" },
};

export function AlertStack({ alerts }: Props) {
  if (!alerts.length) return null;

  return (
    <div aria-label="alerts" className="alert-stack">
      {alerts.map((alert) => {
        const tone = toneStyles[alert.tone] || toneStyles.info;
        return (
          <div
            key={alert.id}
            role="alert"
            className="alert-card"
            style={{ border: `1px solid ${tone.border}`, background: tone.bg }}
          >
            <p className="alert-card__title">{alert.message}</p>
            {alert.actions && alert.actions.length > 0 && (
              <div className="alert-card__actions">
                {alert.actions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={action.onClick}
                    style={{ border: `1px solid ${tone.border}` }}
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
