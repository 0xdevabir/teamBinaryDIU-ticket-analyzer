import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { TicketCard } from "../components/tickets/TicketCard";
import type { Ticket } from "../types/ticket";

const CATEGORIES = ["", "Billing", "Technical", "Account", "Feature Request", "Other"];
const PRIORITIES = ["", "critical", "high", "medium", "low"];
const ANALYZED_OPTIONS = [
  { value: "", label: "All tickets" },
  { value: "true", label: "Analyzed only" },
  { value: "false", label: "Pending only" },
];

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [analyzed, setAnalyzed] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10;

  const loadTickets = useCallback(
    async (overridePage?: number) => {
      setLoading(true);
      setError(null);
      const currentPage = overridePage ?? page;
      try {
        const params: Record<string, string | number> = { page: currentPage, page_size: pageSize };
        if (search) params.search = search;
        if (category) params.category = category;
        if (priority) params.priority = priority;
        if (analyzed) params.analyzed = analyzed;

        const data = await api.listTickets(params);
        setTickets(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    },
    [page, search, category, priority, analyzed]
  );

  useEffect(() => {
    loadTickets();
  }, [page, loadTickets]);

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    if (page === 1) {
      loadTickets(1);
    } else {
      setPage(1);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1>All Tickets</h1>
      <p className="subtitle">Browse and filter analyzed support tickets</p>

      <form className="card filters" onSubmit={handleFilter}>
        <input
          type="search"
          placeholder="Search title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c || "all"} value={c}>
              {c || "All categories"}
            </option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITIES.map((p) => (
            <option key={p || "all"} value={p}>
              {p || "All priorities"}
            </option>
          ))}
        </select>
        <select value={analyzed} onChange={(e) => setAnalyzed(e.target.value)}>
          {ANALYZED_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button type="submit">Apply Filters</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading tickets...</p>
      ) : (
        <>
          <p className="muted results-count">
            Showing {tickets.length} of {total} tickets
          </p>
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
            {!tickets.length && <p className="muted">No tickets match your filters.</p>}
          </div>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
