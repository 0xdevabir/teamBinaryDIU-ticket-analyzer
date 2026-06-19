const categoryColors: Record<string, string> = {
  Billing: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800",
  Technical: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-800",
  Account: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800",
  Authentication: "bg-sky-50 text-sky-700 ring-sky-200",
  "Feature Request": "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800",
  General: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  Other: "bg-neutral-100 text-neutral-600 ring-neutral-200",
};

const priorityColors: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800",
  High: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-800",
  Medium: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800",
  Low: "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400",
  critical: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800",
  high: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-800",
  medium: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800",
  low: "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400",
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
      ? categoryColors[label] ?? "bg-neutral-100 text-neutral-600 ring-neutral-200"
      : priorityColors[label] ?? "bg-neutral-100 text-neutral-600 ring-neutral-200";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}
    >
      {label}
    </span>
  );
}
