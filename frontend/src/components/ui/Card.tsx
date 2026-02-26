import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
  className?: string;
}

export function Card({ children, title, actions, className }: Props) {
  return (
    <div className={`bg-surface-alt border border-border rounded-[12px] p-8 shadow-soft ${className ?? ""}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between mb-3">
          {title && <h3 className="m-0 text-lg font-bold">{title}</h3>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  );
}
