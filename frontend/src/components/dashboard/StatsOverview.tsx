import {
  Ticket,
  Gauge,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import Card from "../ui/Card";
import type { DashboardStats } from "../../types/ticket";

interface Props {
  stats: DashboardStats;
}

export default function StatsOverview({ stats }: Props) {
  const cards = [
    { label: "Total Tickets", value: stats.total_tickets, icon: Ticket, tint: "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400" },
    { label: "Analyzed", value: stats.analyzed_total, icon: CheckCircle2, tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
    { label: "Pending", value: stats.pending_total, icon: AlertCircle, tint: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
    { label: "Analyzed Today", value: stats.analyzed_today, icon: Clock, tint: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400" },
    { label: "Analysis Rate", value: `${stats.analysis_rate}%`, icon: BarChart3, tint: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" },
    {
      label: "Avg Confidence",
      value: stats.avg_confidence != null ? `${Math.round(stats.avg_confidence * 100)}%` : "—",
      icon: Gauge,
      tint: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((s) => (
        <Card key={s.label}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                {s.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {s.value}
              </p>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-md ${s.tint}`}>
              <s.icon size={18} strokeWidth={1.75} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
