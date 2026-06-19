import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useTickets } from "../hooks/useTickets";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { TicketFilters as Filters } from "../types/ticket";
import TicketFiltersBar from "../components/tickets/TicketFilters";
import TicketTable from "../components/tickets/TicketTable";
import TicketCard from "../components/tickets/TicketCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function TicketListPage() {
  const [draft, setDraft] = useState<Filters>({ page: 1, page_size: 10 });
  const [applied, setApplied] = useState<Filters>({ page: 1, page_size: 10 });
  const { tickets, total, loading, error } = useTickets(applied);

  useDocumentTitle("Tickets");

  const totalPages = Math.max(1, Math.ceil(total / (applied.page_size ?? 10)));

  function applyFilters() {
    setApplied({ ...draft, page: 1 });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Browse, filter, and manage support tickets"
        action={
          <Link to="/create">
            <Button size="sm">
              <Plus size={16} />
              New Ticket
            </Button>
          </Link>
        }
      />

      <TicketFiltersBar filters={draft} onChange={setDraft} onApply={applyFilters} />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <Spinner label="Loading tickets..." />
      ) : tickets.length === 0 ? (
        <Card>
          <EmptyState title="No tickets found" description="Try adjusting your filters." />
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Showing {tickets.length} of {total} tickets</span>
          </div>

          <div className="grid gap-4 md:hidden">
            {tickets.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>

          <Card padding={false} className="hidden md:block">
            <TicketTable tickets={tickets} />
          </Card>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={(applied.page ?? 1) <= 1}
              onClick={() => setApplied((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-500">
              Page {applied.page ?? 1} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={(applied.page ?? 1) >= totalPages}
              onClick={() => setApplied((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
