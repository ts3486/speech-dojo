import { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  disabled?: boolean;
  className?: string;
}

interface ButtonProps extends BaseProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

interface LinkButtonProps extends BaseProps {
  to: string;
}

const baseStyle = (variant: Variant, disabled?: boolean): CSSProperties => {
  const background =
    variant === "primary"
      ? "var(--color-primary)"
      : variant === "danger"
      ? "var(--color-danger)"
      : "transparent";
  const color =
    variant === "primary"
      ? "#1f1f1f"
      : variant === "danger"
      ? "#fff"
      : "var(--color-text)";
  const border =
    variant === "primary"
      ? "1px solid var(--color-primary)"
      : variant === "danger"
      ? "1px solid var(--color-danger)"
      : "1px solid var(--color-border)";

  return {
    background,
    color,
    border,
    padding: "10px 14px",
    borderRadius: "var(--radius)",
    fontWeight: 600,
    transition: "background 150ms ease, transform 150ms ease",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };
};

const hoverBackground = (variant: Variant) => {
  if (variant === "primary") return "var(--color-primary-hover)";
  if (variant === "danger") return "#a8372c";
  return "rgba(0,0,0,0.04)";
};

export function Button({ children, variant = "primary", disabled, className, onClick, type = "button" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle(variant, disabled)}
      className={`ui-btn ${className ?? ""}`.trim()}
      data-variant={variant}
    >
      {children}
    </button>
  );
}

export function LinkButton({ children, to, variant = "secondary", disabled, className }: LinkButtonProps) {
  return (
    <Link
      to={disabled ? "#" : to}
      aria-disabled={disabled}
      className={`ui-link-button ${className ?? ""}`.trim()}
      data-variant={variant}
      style={baseStyle(variant, disabled)}
    >
      {children}
    </Link>
  );
}

// Component-scoped hover/focus styles
const styleSheet = `
.ui-btn:hover:not(:disabled),
.ui-link-button:hover {
  background: var(--hover-bg, rgba(0,0,0,0.04));
  transform: translateY(-1px);
}

.ui-btn:focus-visible,
.ui-link-button:focus-visible {
  box-shadow: var(--focus);
}

.ui-btn[data-variant="primary"],
.ui-link-button[data-variant="primary"] {
  --hover-bg: var(--color-primary-hover);
}
.ui-btn[data-variant="danger"],
.ui-link-button[data-variant="danger"] {
  --hover-bg: #a8372c;
}
.ui-btn[data-variant="secondary"],
.ui-link-button[data-variant="secondary"],
.ui-btn[data-variant="ghost"],
.ui-link-button[data-variant="ghost"] {
  --hover-bg: rgba(0,0,0,0.04);
}
`;

export function ButtonStyles() {
  return <style>{styleSheet}</style>;
}
