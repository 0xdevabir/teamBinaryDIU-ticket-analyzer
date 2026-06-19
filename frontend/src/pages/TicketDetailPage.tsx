import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import { useTicket } from "../hooks/useTickets";
import { ticketsApi } from "../api";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import AIResultsPanel from "../components/tickets/AIResultsPanel";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ticket, loading, error, refetch } = useTicket(id);
  const [actionLoading, setActionLoading] = useState(false);

  async function handleAnalyze() {
    if (!id) return;
    setActionLoading(true);
    try {
      await ticketsApi.analyze(id);
      await refetch();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this ticket permanently?")) return;
    setActionLoading(true);
    try {
      await ticketsApi.delete(id);
      navigate("/tickets");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <Spinner label="Loading ticket..." />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  const analyzed = Boolean(ticket.category);
  const aiResult = analyzed
    ? {
        ticketId: ticket.id,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category!,
        priority: ticket.priority!,
        summary: ticket.summary!,
        confidence: ticket.ai_confidence ?? 0,
      }
    : null;

  return (
    <div className="space-y-6">
      <Link
        to="/tickets"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Back to tickets
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {analyzed ? "Analyzed" : "Pending"} ·{" "}
            {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleAnalyze} disabled={actionLoading}>
            <RefreshCw size={14} />
            {analyzed ? "Re-analyze" : "Analyze"}
          </Button>
          {analyzed && (
            <Link to={`/tickets/${ticket.id}/ai`}>
              <Button variant="secondary" size="sm">AI View</Button>
            </Link>
          )}
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={actionLoading}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Description
        </h2>
        <p className="text-slate-700 leading-relaxed">{ticket.description}</p>
      </Card>

      {aiResult ? (
        <AIResultsPanel result={aiResult} />
      ) : (
        <Card>
          <p className="text-slate-500">No AI analysis yet. Click Analyze to run classification.</p>
        </Card>
      )}

      {analyzed && (
        <div className="flex gap-2">
          <Badge label={ticket.category!} />
          <Badge label={ticket.priority!} />
        </div>
      )}
    </div>
  );
}
