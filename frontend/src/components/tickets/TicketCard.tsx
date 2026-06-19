import { Link } from "react-router-dom";
import type { Ticket } from "../../types/ticket";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const analyzed = Boolean(ticket.category);

  return (
    <Link to={`/tickets/${ticket.id}`}>
      <Card className="transition-shadow hover:shadow-saas-md">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-neutral-900 line-clamp-1 dark:text-white">{ticket.title}</h3>
          {ticket.priority && <Badge label={ticket.priority} variant="priority" />}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {ticket.category ?? "Pending"} · {analyzed ? "Analyzed" : "Pending"}
        </p>
        {ticket.summary && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{ticket.summary}</p>
        )}
      </Card>
    </Link>
  );
}
