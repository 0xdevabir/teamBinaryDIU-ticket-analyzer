import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, RefreshCw, Sparkles } from "lucide-react";
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Back to tickets
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{ticket.title}</h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                analyzed
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {analyzed ? "Analyzed" : "Pending"}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Created {new Date(ticket.created_at).toLocaleString()}
          </p>
          {analyzed && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge label={ticket.category!} variant="category" />
              <Badge label={ticket.priority!} variant="priority" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleAnalyze} disabled={actionLoading}>
            <RefreshCw size={14} className={actionLoading ? "animate-spin" : ""} />
            {analyzed ? "Re-analyze" : "Analyze"}
          </Button>
          {analyzed && (
            <Link to={`/tickets/${ticket.id}/ai`}>
              <Button variant="secondary" size="sm">
                <Sparkles size={14} />
                AI View
              </Button>
            </Link>
          )}
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={actionLoading}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Description
        </h2>
        <p className="leading-relaxed text-slate-700">{ticket.description}</p>
      </Card>

      {aiResult ? (
        <AIResultsPanel result={aiResult} />
      ) : (
        <Card className="border-dashed">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Sparkles size={22} />
            </div>
            <p className="font-medium text-slate-700">No AI analysis yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Click Analyze to classify this ticket with AI
            </p>
            <Button className="mt-4" size="sm" onClick={handleAnalyze} disabled={actionLoading}>
              Run Analysis
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
