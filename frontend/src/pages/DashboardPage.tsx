import { useState } from "react";
import { Link } from "react-router-dom";
import { Database, ArrowRight } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useToast } from "../context/ToastContext";
import StatsOverview from "../components/dashboard/StatsOverview";
import DistributionChart from "../components/dashboard/DistributionChart";
import BarChart from "../components/dashboard/BarChart";
import DemoBanner from "../components/dashboard/DemoBanner";
import TicketTable from "../components/tickets/TicketTable";
import TicketCard from "../components/tickets/TicketCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function DashboardPage() {
  const { stats, recent, loading, error, seed } = useDashboard();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  useDocumentTitle("Statistics Dashboard");

  async function handleSeed() {
    setSeeding(true);
    try {
      await seed();
      toast("Demo tickets loaded and analyzed", "success");
    } catch {
      toast("Failed to load demo data", "error");
    } finally {
      setSeeding(false);
    }
  }

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (!stats) return null;

  const hasTickets = stats.total_tickets > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Statistics Dashboard"
        description="Ticket metrics, category & priority distribution"
        action={
          <Button variant="secondary" onClick={handleSeed} disabled={seeding}>
            <Database size={16} />
            {seeding ? "Seeding..." : "Load Demo Data"}
          </Button>
        }
      />

      <DemoBanner onSeed={handleSeed} seeding={seeding} hasTickets={hasTickets} />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <StatsOverview stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <DistributionChart title="Category Distribution" data={stats.by_category} type="category" />
        </Card>
        <Card>
          <DistributionChart title="Priority Distribution" data={stats.by_priority} type="priority" />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <BarChart title="Category Breakdown" data={stats.by_category} />
        </Card>
        <Card>
          <BarChart title="Priority Breakdown" data={stats.by_priority} />
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Tickets</h2>
          <Link
            to="/tickets"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card>
            <EmptyState
              title="No tickets yet"
              description="Submit a ticket or load demo data to get started."
              action={
                <Link to="/create">
                  <Button>Create Ticket</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:hidden">
              {recent.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
            <Card padding={false} className="hidden md:block">
              <TicketTable tickets={recent} compact />
            </Card>
          </>
        )}
      </section>
    </div>
  );
}
