import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import BarChart from "../components/dashboard/BarChart";
import { TicketCard } from "../components/tickets/TicketCard";
import type { DashboardStats, Ticket } from "../types/ticket";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, recentData] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentTickets(),
      ]);
      setStats(statsData);
      setRecent(recentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSeed() {
    setSeeding(true);
    try {
      await api.seedDemoData();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to seed data");
    } finally {
      setSeeding(false);
    }
  }

  if (loading) return <p className="loading">Loading dashboard...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">AI-powered support ticket insights</p>
        </div>
        <button className="secondary" onClick={handleSeed} disabled={seeding}>
          {seeding ? "Seeding..." : "Load Demo Data"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-label">Total Tickets</span>
          <span className="stat-value">{stats?.total_tickets ?? 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Analyzed Today</span>
          <span className="stat-value">{stats?.analyzed_today ?? 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Avg Confidence</span>
          <span className="stat-value">
            {stats?.avg_confidence
              ? `${Math.round(stats.avg_confidence * 100)}%`
              : "—"}
          </span>
        </div>
      </div>

      <div className="grid-2">
        <BarChart title="By Category" data={stats?.by_category ?? {}} />
        <BarChart title="By Priority" data={stats?.by_priority ?? {}} />
      </div>

      <section>
        <h2>Recent Tickets</h2>
        <div className="ticket-list">
          {recent.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
          {!recent.length && (
            <p className="muted">
              No tickets yet. Submit one or click &quot;Load Demo Data&quot;.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
