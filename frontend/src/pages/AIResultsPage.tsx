import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { AIResultView } from "../types/ai";
import AIResultsPanel from "../components/tickets/AIResultsPanel";
import Button from "../components/ui/Button";

export default function AIResultsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const result = location.state?.result as AIResultView | undefined;

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl text-center py-16">
        <p className="text-slate-500">No analysis results available.</p>
        <Link to="/create" className="mt-4 inline-block">
          <Button>Create a ticket</Button>
        </Link>
      </div>
    );
  }

  const ticketId = id ?? result.ticketId;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={ticketId ? `/tickets/${ticketId}` : "/tickets"}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        {ticketId ? "View ticket" : "Back to tickets"}
      </Link>

      <AIResultsPanel result={result} />

      <div className="flex flex-wrap gap-3">
        {ticketId && (
          <Link to={`/tickets/${ticketId}`}>
            <Button variant="secondary">Ticket Details</Button>
          </Link>
        )}
        <Link to="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
