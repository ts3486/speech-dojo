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
  network: { bg: "bg-[#fff7ed]", border: "border-primary" },
  mic: { bg: "bg-[#fff7ed]", border: "border-primary" },
  token: { bg: "bg-[#fff7ed]", border: "border-primary" },
  info: { bg: "bg-[#f0f6ff]", border: "border-[#5b8def]" },
  error: { bg: "bg-[#fff0ed]", border: "border-danger" },
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
            className={`alert-card ${tone.bg} ${tone.border}`}
          >
            <p className="alert-card__title">{alert.message}</p>
            {alert.actions && alert.actions.length > 0 && (
              <div className="alert-card__actions">
                {alert.actions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={action.onClick}
                    className={`border rounded-[12px] px-2.5 py-2 text-sm ${tone.border}`}
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
