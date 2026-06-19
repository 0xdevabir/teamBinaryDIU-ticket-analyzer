import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, RefreshCw, Sparkles } from "lucide-react";
import { useTicket } from "../hooks/useTickets";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useToast } from "../context/ToastContext";
import { ticketsApi } from "../api";
import { ticketToAIResult } from "../utils/ticketToAIResult";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import AIResultsPanel from "../components/tickets/AIResultsPanel";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ticket, loading, error, refetch } = useTicket(id);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useDocumentTitle(ticket?.title ?? "Ticket Detail");

  async function handleAnalyze() {
    if (!id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await ticketsApi.analyze(id);
      await refetch();
      toast("AI analysis complete", "success");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Analysis failed");
      toast("Analysis failed", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setActionLoading(true);
    try {
      await ticketsApi.delete(id);
      toast("Ticket deleted", "success");
      navigate("/tickets");
    } catch {
      toast("Failed to delete ticket", "error");
    } finally {
      setActionLoading(false);
      setShowDelete(false);
    }
  }

  if (loading) return <Spinner label="Loading ticket..." />;

  if (error || !ticket) {
    return (
      <EmptyState
        title={error ? "Failed to load ticket" : "Ticket not found"}
        description={error ?? "This ticket may have been deleted."}
        action={
          <Link to="/tickets">
            <Button variant="secondary">Back to tickets</Button>
          </Link>
        }
      />
    );
  }

  const aiResult = ticketToAIResult(ticket);
  const analyzed = Boolean(aiResult);

  return (
    <div className="space-y-6">
      <Link
        to="/tickets"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Back to tickets
      </Link>

      {actionError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{ticket.title}</h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                analyzed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {analyzed ? "Analyzed" : "Pending"}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Created {new Date(ticket.created_at).toLocaleString()}
          </p>
          {analyzed && aiResult && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge label={aiResult.category} variant="category" />
              <Badge label={aiResult.priority} variant="priority" />
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
          <Button variant="danger" size="sm" onClick={() => setShowDelete(true)} disabled={actionLoading}>
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

      <ConfirmDialog
        open={showDelete}
        title="Delete ticket?"
        message="This action cannot be undone. The ticket and its analysis will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={actionLoading}
      />
    </div>
  );
}
