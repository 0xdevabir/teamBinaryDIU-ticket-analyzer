const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#ec4899",
  "#64748b",
];

interface DistributionChartProps {
  title: string;
  data: Record<string, number>;
  type?: "category" | "priority";
}

export default function DistributionChart({ title, data }: DistributionChartProps) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (entries.length === 0) {
    return (
      <div>
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        <p className="text-sm text-slate-400">No data yet</p>
      </div>
    );
  }

  let cumulative = 0;
  const segments = entries.map(([label, value], i) => {
    const pct = (value / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { label, value, pct, start, color: CHART_COLORS[i % CHART_COLORS.length] };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)
    .join(", ");

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div
          className="relative h-40 w-40 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{total}</span>
            <span className="text-xs text-slate-500">tickets</span>
          </div>
        </div>
        <ul className="w-full space-y-2">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate text-slate-600 dark:text-slate-400">{s.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{s.value}</span>
                <span className="text-xs text-slate-400">({s.pct.toFixed(0)}%)</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
