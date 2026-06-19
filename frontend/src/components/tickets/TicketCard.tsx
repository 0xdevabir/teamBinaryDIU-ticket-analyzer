import { Link } from "react-router-dom";
import type { Ticket } from "../../types/ticket";

const priorityColors: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#16a34a",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className="badge"
      style={{ backgroundColor: priorityColors[priority] ?? "#6b7280" }}
    >
      {priority}
    </span>
  );
}

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const analyzed = Boolean(ticket.category);

  return (
    <Link to={`/tickets/${ticket.id}`} className="card ticket-card">
      <div className="ticket-card-header">
        <h3>{ticket.title}</h3>
        {ticket.priority && <PriorityBadge priority={ticket.priority} />}
      </div>
      <p className="muted">
        {ticket.category ?? "Pending"} · {analyzed ? "analyzed" : "pending"}
      </p>
      {ticket.summary && <p className="summary">{ticket.summary}</p>}
    </Link>
  );
}
