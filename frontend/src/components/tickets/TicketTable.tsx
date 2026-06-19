import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Ticket } from "../../types/ticket";
import Badge from "../ui/Badge";

interface Props {
  tickets: Ticket[];
  compact?: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TicketTable({ tickets, compact = false }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">No tickets to display</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Priority</th>
            {!compact && <th className="px-4 py-3">Confidence</th>}
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {tickets.map((ticket) => {
            const analyzed = Boolean(ticket.category);
            return (
              <tr
                key={ticket.id}
                className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3.5">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="font-medium text-neutral-900 hover:text-brand-600 dark:text-neutral-100 dark:hover:text-brand-400"
                  >
                    <span className="line-clamp-1">{ticket.title}</span>
                  </Link>
                  {!compact && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                      {ticket.summary ?? ticket.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {ticket.category ? (
                    <Badge label={ticket.category} variant="category" />
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {ticket.priority ? (
                    <Badge label={ticket.priority} variant="priority" />
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                {!compact && (
                  <td className="px-4 py-3.5">
                    {ticket.ai_confidence != null ? (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-sm bg-brand-500"
                            style={{ width: `${ticket.ai_confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {Math.round(ticket.ai_confidence * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                      analyzed
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}
                  >
                    {analyzed ? "Analyzed" : "Pending"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                  {formatDate(ticket.created_at)}
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 dark:text-brand-400"
                  >
                    View
                    <ArrowUpRight size={12} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
