interface BarChartProps {
  title: string;
  data: Record<string, number>;
}

const barColors = [
  "bg-neutral-900 dark:bg-white",
  "bg-neutral-700",
  "bg-neutral-500",
  "bg-neutral-400",
  "bg-neutral-300",
  "bg-neutral-200",
];

export default function BarChart({ title, data }: BarChartProps) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {title}
      </h3>
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-400">No data yet</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([label, value], i) => (
            <div key={label} className="grid grid-cols-[minmax(80px,120px)_1fr_32px] items-center gap-3">
              <span className="truncate text-xs text-neutral-600 dark:text-neutral-400">{label}</span>
              <div className="h-2 overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={`h-full rounded-sm transition-all ${barColors[i % barColors.length]}`}
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
              <span className="text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
