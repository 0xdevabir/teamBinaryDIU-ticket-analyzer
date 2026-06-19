import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { PriorityBadge } from "../components/tickets/TicketCard";
import type { Ticket } from "../types/ticket";

export default function SubmitTicket() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Ticket | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const ticket = await api.createTicket({ title, description });
      setResult(ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div>
        <h1>Ticket Analyzed</h1>
        <div className="card result-card">
          <h2>{result.title}</h2>
          {result.category && (
            <>
              <div className="result-meta">
                <span className="tag">{result.category}</span>
                {result.priority && <PriorityBadge priority={result.priority} />}
              </div>
              <p><strong>Summary:</strong> {result.summary}</p>
              <p className="muted">
                AI Confidence: {((result.ai_confidence ?? 0) * 100).toFixed(0)}%
              </p>
            </>
          )}
          <div className="actions">
            <button onClick={() => navigate(`/tickets/${result.id}`)}>View Details</button>
            <button className="secondary" onClick={() => navigate("/")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Submit Ticket</h1>
      <p className="subtitle">Describe your issue and our AI will classify it instantly.</p>

      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cannot login to my account"
            required
            minLength={3}
            maxLength={200}
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            required
            minLength={10}
            rows={6}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Submit & Analyze"}
        </button>
      </form>
    </div>
  );
}
