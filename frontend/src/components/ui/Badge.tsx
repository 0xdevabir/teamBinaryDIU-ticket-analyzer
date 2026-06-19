const categoryColors: Record<string, string> = {
  Billing: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Technical: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Account: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  Authentication: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  "Feature Request": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  General: "bg-slate-50 text-slate-600 ring-slate-500/20",
  Other: "bg-slate-50 text-slate-600 ring-slate-500/20",
};

const priorityColors: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 ring-red-600/20",
  High: "bg-orange-50 text-orange-700 ring-orange-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Low: "bg-green-50 text-green-700 ring-green-600/20",
  critical: "bg-red-50 text-red-700 ring-red-600/20",
  high: "bg-orange-50 text-orange-700 ring-orange-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-green-50 text-green-700 ring-green-600/20",
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
      ? categoryColors[label] ?? "bg-slate-50 text-slate-600 ring-slate-500/20"
      : priorityColors[label] ?? "bg-slate-50 text-slate-600 ring-slate-500/20";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors}`}
    >
      {label}
    </span>
  );
}
