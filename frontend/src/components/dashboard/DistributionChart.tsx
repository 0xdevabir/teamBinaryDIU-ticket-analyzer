const CHART_COLORS = [
  "#0a0a0a",
  "#404040",
  "#737373",
  "#a3a3a3",
  "#d4d4d4",
  "#e5e5e5",
  "#525252",
  "#262626",
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
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {title}
        </h3>
        <p className="text-sm text-neutral-400">No data yet</p>
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
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {title}
      </h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div
          className="relative h-40 w-40 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white dark:bg-neutral-900">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {total}
            </span>
            <span className="text-xs text-neutral-400">tickets</span>
          </div>
        </div>
        <ul className="w-full space-y-2">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate text-neutral-600 dark:text-neutral-400">{s.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-white">{s.value}</span>
                <span className="text-xs text-neutral-400">({s.pct.toFixed(0)}%)</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
