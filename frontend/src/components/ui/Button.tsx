'use client';

import { ReactNode } from "react";
import Link from "next/link";

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
    "bg-gradient-to-br from-[#4338CA] to-[#5C4EE0] !text-white [&_svg]:!text-white border border-[#4338CA]/80 shadow-[0_2px_12px_rgba(67,56,202,0.35),inset_0_1px_0_rgba(255,255,255,0.20)] hover:shadow-[0_5px_22px_rgba(67,56,202,0.50)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[0_1px_4px_rgba(67,56,202,0.22)]",
  secondary:
    "bg-white text-primary border border-border shadow-[0_1px_3px_rgba(0,0,0,0.07)] hover:bg-primary/5 hover:border-primary/40 hover:-translate-y-[1px]",
  danger:
    "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] hover:bg-danger hover:!text-white hover:border-danger hover:-translate-y-[1px]",
  ghost:
    "bg-transparent text-primary border border-primary/25 hover:bg-primary/10 hover:border-primary/40 hover:-translate-y-[1px]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs gap-1.5",
  md: "px-4 py-2 text-xl gap-1.5",
  lg: "px-5 py-2.5 text-sm gap-2",
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
      href={disabled ? "#" : to}
      aria-disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className ?? ""}`.trim()}
    >
      {children}
    </Link>
  );
}
