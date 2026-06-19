import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { PriorityBadge } from "../components/tickets/TicketCard";
import type { Ticket } from "../types/ticket";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getTicket(id)
      .then(setTicket)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAnalyze() {
    if (!id) return;
    setReanalyzing(true);
    setError(null);
    try {
      const updated = await api.analyzeTicket(id);
      setTicket(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setReanalyzing(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm("Delete this ticket permanently?")) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteTicket(id);
      navigate("/tickets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <p>Loading ticket...</p>;
  if (error && !ticket) return <p className="error">Error: {error}</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  const analyzed = Boolean(ticket.category);

  return (
    <div>
      <Link to="/tickets" className="back-link">← Back to Tickets</Link>
      <h1>{ticket.title}</h1>
      <p className="muted">
        {analyzed ? "Analyzed" : "Pending"} · Created {new Date(ticket.created_at).toLocaleString()}
      </p>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <h2>Description</h2>
        <p>{ticket.description}</p>
      </div>

      {analyzed ? (
        <div className="card">
          <h2>AI Analysis</h2>
          <div className="result-meta">
            <span className="tag">{ticket.category}</span>
            {ticket.priority && <PriorityBadge priority={ticket.priority} />}
          </div>
          <p><strong>Summary:</strong> {ticket.summary}</p>
          <ul className="meta-list">
            <li>AI confidence: {((ticket.ai_confidence ?? 0) * 100).toFixed(0)}%</li>
            <li>Last updated: {new Date(ticket.updated_at).toLocaleString()}</li>
          </ul>
        </div>
      ) : (
        <div className="card">
          <p>No analysis available yet.</p>
        </div>
      )}

      <div className="actions">
        <button onClick={handleAnalyze} disabled={reanalyzing}>
          {reanalyzing ? "Analyzing..." : analyzed ? "Re-analyze" : "Run Analysis"}
        </button>
        <button className="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete Ticket"}
        </button>
      </div>
    </div>
  );
}
