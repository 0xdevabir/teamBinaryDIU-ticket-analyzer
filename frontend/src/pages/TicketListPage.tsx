import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Download } from "lucide-react";
import { useTickets } from "../hooks/useTickets";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useToast } from "../context/ToastContext";
import { ticketsApi } from "../api";
import type { TicketFilters as Filters } from "../types/ticket";
import TicketFiltersBar from "../components/tickets/TicketFilters";
import TicketTable from "../components/tickets/TicketTable";
import TicketCard from "../components/tickets/TicketCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { filtersToParams } from "../utils/exportCsv";

export default function TicketListPage() {
  const [draft, setDraft] = useState<Filters>({ page: 1, page_size: 10 });
  const [applied, setApplied] = useState<Filters>({ page: 1, page_size: 10 });
  const debouncedSearch = useDebouncedValue(draft.search ?? "");
  const { tickets, total, loading, error } = useTickets(applied);
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  useDocumentTitle("Tickets");

  useEffect(() => {
    setApplied((prev) => {
      const nextSearch = debouncedSearch || undefined;
      if (prev.search === nextSearch) return prev;
      return { ...prev, search: nextSearch, page: 1 };
    });
  }, [debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(total / (applied.page_size ?? 10)));

  function applyFilters(next?: Filters) {
    setApplied(next ?? { ...draft, page: 1 });
    if (next) setDraft(next);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await ticketsApi.exportCsv(filtersToParams(applied));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast("CSV exported successfully", "success");
    } catch {
      toast("Export failed", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Search, filter, and export support tickets"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport} disabled={exporting || total === 0}>
              <Download size={16} />
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            <Link to="/create">
              <Button size="sm">
                <Plus size={16} />
                New Ticket
              </Button>
            </Link>
          </div>
        }
      />

      <TicketFiltersBar filters={draft} onChange={setDraft} onApply={applyFilters} />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading tickets..." />
      ) : tickets.length === 0 ? (
        <Card>
          <EmptyState title="No tickets found" description="Try adjusting your filters or search query." />
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
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
            <span className="text-sm text-slate-500 dark:text-slate-400">
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
