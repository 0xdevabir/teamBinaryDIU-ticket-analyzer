import { useState } from "react";
import { useTickets } from "../hooks/useTickets";
import type { TicketFilters as Filters } from "../types/ticket";
import TicketFiltersBar from "../components/tickets/TicketFilters";
import TicketCard from "../components/tickets/TicketCard";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function TicketListPage() {
  const [draft, setDraft] = useState<Filters>({ page: 1, page_size: 10 });
  const [applied, setApplied] = useState<Filters>({ page: 1, page_size: 10 });
  const { tickets, total, loading, error } = useTickets(applied);

  const totalPages = Math.max(1, Math.ceil(total / (applied.page_size ?? 10)));

  function applyFilters() {
    setApplied({ ...draft, page: 1 });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
        <p className="text-sm text-slate-500">Browse and filter support tickets</p>
      </div>

      <TicketFiltersBar filters={draft} onChange={setDraft} onApply={applyFilters} />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <Spinner label="Loading tickets..." />
      ) : tickets.length === 0 ? (
        <EmptyState title="No tickets found" description="Try adjusting your filters." />
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Showing {tickets.length} of {total} tickets
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {tickets.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 pt-4">
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
