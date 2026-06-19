interface BarChartProps {
  title: string;
  data: Record<string, number>;
  colors?: Record<string, string>;
}

const DEFAULT_COLORS: Record<string, string> = {
  Billing: "#8b5cf6",
  Technical: "#3b82f6",
  Account: "#06b6d4",
  "Feature Request": "#10b981",
  Other: "#6b7280",
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#16a34a",
};

export default function BarChart({ title, data, colors = DEFAULT_COLORS }: BarChartProps) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (!entries.length) {
    return (
      <div className="card">
        <h2>{title}</h2>
        <p className="muted">No data yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="bar-chart">
        {entries.map(([label, value]) => (
          <div key={label} className="bar-row">
            <span className="bar-label">{label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(value / max) * 100}%`,
                  backgroundColor: colors[label] ?? "#64748b",
                }}
              />
            </div>
            <span className="bar-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
