import { ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
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

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-[#5C4EE0] to-[#7B6CF0] text-white border border-[#5C4EE0]/70 shadow-[0_2px_12px_rgba(92,78,224,0.32),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_5px_22px_rgba(92,78,224,0.48)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[0_1px_4px_rgba(92,78,224,0.20)]",
  secondary:
    "bg-white text-primary border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-primary/5 hover:border-primary/40 hover:-translate-y-[1px]",
  danger:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white hover:border-danger hover:-translate-y-[1px]",
  ghost:
    "bg-transparent text-muted border border-transparent hover:bg-primary/5 hover:text-primary hover:-translate-y-[1px]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-[15px] gap-2.5",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed";

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled,
  className,
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className ?? ""}`.trim()}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  to,
  variant = "secondary",
  size = "md",
  disabled,
  className,
}: LinkButtonProps) {
  return (
    <Link
      to={disabled ? "#" : to}
      aria-disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className ?? ""}`.trim()}
    >
      {children}
    </Link>
  );
}
