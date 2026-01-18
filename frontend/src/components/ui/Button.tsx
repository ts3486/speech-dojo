import { ReactNode } from "react";
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

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white border border-primary hover:bg-primaryHover hover:-translate-y-[1px]",
  secondary:
    "bg-white text-text border border-border hover:bg-black/5 hover:-translate-y-[1px]",
  danger:
    "bg-danger text-white border border-danger hover:bg-[#d23b3b] hover:-translate-y-[1px]",
  ghost:
    "bg-transparent text-text border border-transparent hover:bg-black/5 hover:-translate-y-[1px]"
};

const baseClasses =
  "inline-flex items-center gap-2 rounded-[12px] px-4 py-2 font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 disabled:opacity-60 disabled:cursor-not-allowed";

export function Button({ children, variant = "primary", disabled, className, onClick, type = "button" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className ?? ""}`.trim()}
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
      className={`${baseClasses} ${variantClasses[variant]} ${className ?? ""}`.trim()}
    >
      {children}
    </Link>
  );
}
