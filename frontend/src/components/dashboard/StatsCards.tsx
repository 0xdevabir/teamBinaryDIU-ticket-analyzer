import { Ticket, Sparkles, Gauge } from "lucide-react";
import Card from "../ui/Card";

interface StatsCardsProps {
  total: number;
  analyzedToday: number;
  avgConfidence: number | null | undefined;
}

export default function StatsCards({ total, analyzedToday, avgConfidence }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Tickets",
      value: total,
      icon: Ticket,
      color: "bg-brand-50 text-brand-600",
    },
    {
      label: "Analyzed Today",
      value: analyzedToday,
      icon: Sparkles,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Avg Confidence",
      value: avgConfidence != null ? `${Math.round(avgConfidence * 100)}%` : "—",
      icon: Gauge,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{s.value}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon size={20} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
