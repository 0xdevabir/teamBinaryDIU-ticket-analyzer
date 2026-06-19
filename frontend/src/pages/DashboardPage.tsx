import { useState } from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import StatsCards from "../components/dashboard/StatsCards";
import BarChart from "../components/dashboard/BarChart";
import TicketCard from "../components/tickets/TicketCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function DashboardPage() {
  const { stats, recent, loading, error, seed } = useDashboard();
  const [seeding, setSeeding] = useState(false);

  async function handleSeed() {
    setSeeding(true);
    try {
      await seed();
    } finally {
      setSeeding(false);
    }
  }

  if (loading) return <Spinner label="Loading dashboard..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">AI-powered support ticket insights</p>
        </div>
        <Button variant="secondary" onClick={handleSeed} disabled={seeding}>
          {seeding ? "Seeding..." : "Load Demo Data"}
        </Button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <StatsCards
        total={stats?.total_tickets ?? 0}
        analyzedToday={stats?.analyzed_today ?? 0}
        avgConfidence={stats?.avg_confidence}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <BarChart title="By Category" data={stats?.by_category ?? {}} />
        </Card>
        <Card>
          <BarChart title="By Priority" data={stats?.by_priority ?? {}} />
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Tickets</h2>
          <Link to="/tickets" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            description="Submit a ticket or load demo data to get started."
            action={
              <Link to="/create">
                <Button>Create Ticket</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recent.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
