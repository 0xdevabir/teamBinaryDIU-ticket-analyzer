const categoryColors: Record<string, string> = {
  Billing: "bg-neutral-100 text-neutral-800 ring-neutral-300/40 dark:bg-neutral-800 dark:text-neutral-200",
  Technical: "bg-neutral-200 text-neutral-900 ring-neutral-400/40 dark:bg-neutral-700 dark:text-white",
  Account: "bg-neutral-100 text-neutral-700 ring-neutral-300/40 dark:bg-neutral-800 dark:text-neutral-300",
  Authentication: "bg-neutral-100 text-neutral-700 ring-neutral-300/40",
  "Feature Request": "bg-white text-neutral-800 ring-neutral-400 dark:bg-neutral-900 dark:text-neutral-200",
  General: "bg-neutral-50 text-neutral-600 ring-neutral-200",
  Other: "bg-neutral-50 text-neutral-600 ring-neutral-200",
};

const priorityColors: Record<string, string> = {
  Critical: "bg-neutral-900 text-white ring-neutral-700 dark:bg-white dark:text-neutral-900",
  High: "bg-neutral-800 text-white ring-neutral-600",
  Medium: "bg-neutral-200 text-neutral-900 ring-neutral-300",
  Low: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  critical: "bg-neutral-900 text-white ring-neutral-700 dark:bg-white dark:text-neutral-900",
  high: "bg-neutral-800 text-white ring-neutral-600",
  medium: "bg-neutral-200 text-neutral-900 ring-neutral-300",
  low: "bg-neutral-100 text-neutral-600 ring-neutral-200",
};

export default function Badge({
  label,
  variant = "priority",
}: {
  label: string;
  variant?: "priority" | "category";
}) {
  const colors =
    variant === "category"
      ? categoryColors[label] ?? "bg-neutral-50 text-neutral-600 ring-neutral-200"
      : priorityColors[label] ?? "bg-neutral-50 text-neutral-600 ring-neutral-200";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${colors}`}
    >
      {label}
    </span>
  );
}
