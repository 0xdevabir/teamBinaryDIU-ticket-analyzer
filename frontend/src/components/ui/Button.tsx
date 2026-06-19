import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
  secondary:
    "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800",
  danger: "bg-neutral-900 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500",
  ghost: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
