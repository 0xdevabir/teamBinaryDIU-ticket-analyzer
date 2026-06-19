interface BarChartProps {
  title: string;
  data: Record<string, number>;
}

const barColors = [
  "bg-brand-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

export default function BarChart({ title, data }: BarChartProps) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-400">No data yet</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([label, value], i) => (
            <div key={label} className="grid grid-cols-[minmax(80px,120px)_1fr_32px] items-center gap-3">
              <span className="truncate text-xs text-slate-600 dark:text-slate-400">{label}</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${barColors[i % barColors.length]}`}
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
              <span className="text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
