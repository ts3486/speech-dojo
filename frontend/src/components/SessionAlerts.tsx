export type SessionAlertAction = {
  label: string;
  onClick: () => void;
};

export type SessionAlert = {
  type: "network" | "mic" | "token";
  message: string;
  actions?: SessionAlertAction[];
};

interface Props {
  alerts: SessionAlert[];
}

export function SessionAlerts({ alerts }: Props) {
  if (!alerts.length) return null;

  return (
    <div aria-label="session-alerts" style={{ margin: "1rem 0" }}>
      {alerts.map((alert) => (
        <div
          key={alert.type}
          role="alert"
          style={{
            border: "1px solid #f59e0b",
            background: "#fff7ed",
            padding: "0.5rem",
            marginBottom: "0.5rem"
          }}
        >
          <p style={{ margin: "0 0 0.25rem 0" }}>{alert.message}</p>
          {alert.actions && alert.actions.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {alert.actions.map((action, idx) => (
                <button key={idx} onClick={action.onClick}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
