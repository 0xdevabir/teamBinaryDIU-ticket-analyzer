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

const iconClass =
  "flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";

export default function StatsOverview({ stats }: Props) {
  const cards = [
    { label: "Total Tickets", value: stats.total_tickets, icon: Ticket },
    { label: "Analyzed", value: stats.analyzed_total, icon: CheckCircle2 },
    { label: "Pending", value: stats.pending_total, icon: AlertCircle },
    { label: "Analyzed Today", value: stats.analyzed_today, icon: Clock },
    { label: "Analysis Rate", value: `${stats.analysis_rate}%`, icon: BarChart3 },
    {
      label: "Avg Confidence",
      value: stats.avg_confidence != null ? `${Math.round(stats.avg_confidence * 100)}%` : "—",
      icon: Gauge,
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
            <div className={iconClass}>
              <s.icon size={18} strokeWidth={1.75} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
