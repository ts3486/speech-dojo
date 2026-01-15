import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

export function Card({ children, title, actions }: Props) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: "20px",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {(title || actions) && (
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          {title && (
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          )}
          {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
        </header>
      )}
      {children}
    </div>
  );
}
