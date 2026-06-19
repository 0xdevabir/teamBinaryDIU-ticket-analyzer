import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export default function Card({ padding = true, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${padding ? "p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
