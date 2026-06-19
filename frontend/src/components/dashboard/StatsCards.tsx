import Card from "../ui/Card";

interface StatsCardsProps {
  total: number;
  analyzedToday: number;
  avgConfidence: number | null | undefined;
}

export default function StatsCards({ total, analyzedToday, avgConfidence }: StatsCardsProps) {
  const stats = [
    { label: "Total Tickets", value: total },
    { label: "Analyzed Today", value: analyzedToday },
    {
      label: "Avg Confidence",
      value: avgConfidence != null ? `${Math.round(avgConfidence * 100)}%` : "—",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <p className="text-sm text-slate-500">{s.label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{s.value}</p>
        </Card>
      ))}
    </div>
  );
}
