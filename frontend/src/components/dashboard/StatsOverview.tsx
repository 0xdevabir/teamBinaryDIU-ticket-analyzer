import {
  Ticket,
  Sparkles,
  Gauge,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Card from "../ui/Card";
import type { DashboardStats } from "../../types/ticket";

interface Props {
  stats: DashboardStats;
}

export default function StatsOverview({ stats }: Props) {
  const cards = [
    {
      label: "Total Tickets",
      value: stats.total_tickets,
      icon: Ticket,
      color: "bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400",
    },
    {
      label: "Analyzed",
      value: stats.analyzed_total,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    },
    {
      label: "Pending",
      value: stats.pending_total,
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    },
    {
      label: "Analyzed Today",
      value: stats.analyzed_today,
      icon: Clock,
      color: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    },
    {
      label: "Analysis Rate",
      value: `${stats.analysis_rate}%`,
      icon: Sparkles,
      color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
    },
    {
      label: "Avg Confidence",
      value: stats.avg_confidence != null ? `${Math.round(stats.avg_confidence * 100)}%` : "—",
      icon: Gauge,
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((s) => (
        <Card key={s.label}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {s.value}
              </p>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon size={18} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
