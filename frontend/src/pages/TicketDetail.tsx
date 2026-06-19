import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { PriorityBadge } from "../components/tickets/TicketCard";
import type { Ticket } from "../types/ticket";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getTicket(id)
      .then(setTicket)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleReanalyze() {
    if (!id) return;
    setReanalyzing(true);
    try {
      const updated = await api.reanalyzeTicket(id);
      setTicket(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reanalysis failed");
    } finally {
      setReanalyzing(false);
    }
  }

  if (loading) return <p>Loading ticket...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  const analyzed = Boolean(ticket.category);

  return (
    <div>
      <Link to="/" className="back-link">← Back to Dashboard</Link>
      <h1>{ticket.title}</h1>
      <p className="muted">
        {analyzed ? "Analyzed" : "Pending"} · Created {new Date(ticket.created_at).toLocaleString()}
      </p>

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
          <button onClick={handleReanalyze} disabled={reanalyzing}>
            {reanalyzing ? "Reanalyzing..." : "Re-analyze"}
          </button>
        </div>
      ) : (
        <div className="card">
          <p>No analysis available yet.</p>
          <button onClick={handleReanalyze} disabled={reanalyzing}>
            {reanalyzing ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      )}
    </div>
  );
}
