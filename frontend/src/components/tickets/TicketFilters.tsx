import { Search, X } from "lucide-react";
import type { TicketFilters } from "../../types/ticket";
import Button from "../ui/Button";

const CATEGORIES = [
  "",
  "Billing",
  "Technical",
  "Account",
  "Feature Request",
  "Other",
  "Authentication",
  "General",
];

const PRIORITIES = ["", "low", "medium", "high", "critical"];

const ANALYZED = [
  { value: "", label: "All statuses" },
  { value: "true", label: "Analyzed" },
  { value: "false", label: "Pending" },
];

interface Props {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
  onApply: (filters?: TicketFilters) => void;
}

export default function TicketFiltersBar({ filters, onChange, onApply }: Props) {
  const hasActive =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.priority) ||
    Boolean(filters.analyzed);

  function clearAll() {
    const cleared: TicketFilters = { page: 1, page_size: filters.page_size ?? 10 };
    onChange(cleared);
    onApply(cleared);
  }

  function update(patch: Partial<TicketFilters>) {
    const next = { ...filters, ...patch, page: 1 };
    onChange(next);
    if (patch.category !== undefined || patch.priority !== undefined || patch.analyzed !== undefined) {
      onApply(next);
    }
  }

  return (
    <div className="space-y-3">
      <div className="saas-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by title or description..."
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onApply({ ...filters, page: 1 })}
            className="saas-input pl-9"
          />
        </div>
        <select
          value={filters.category ?? ""}
          onChange={(e) => update({ category: e.target.value || undefined })}
          className="saas-input"
          aria-label="Filter by category"
        >
          {CATEGORIES.map((c) => (
            <option key={c || "all"} value={c}>
              {c || "All categories"}
            </option>
          ))}
        </select>
        <select
          value={filters.priority ?? ""}
          onChange={(e) => update({ priority: e.target.value || undefined })}
          className="saas-input"
          aria-label="Filter by priority"
        >
          {PRIORITIES.map((p) => (
            <option key={p || "all"} value={p}>
              {p ? p.charAt(0).toUpperCase() + p.slice(1) : "All priorities"}
            </option>
          ))}
        </select>
        <select
          value={filters.analyzed ?? ""}
          onChange={(e) => update({ analyzed: e.target.value || undefined })}
          className="saas-input"
          aria-label="Filter by status"
        >
          {ANALYZED.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {hasActive && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active:</span>
          {filters.search && (
            <FilterChip label={`Search: "${filters.search}"`} onRemove={() => update({ search: undefined })} />
          )}
          {filters.category && (
            <FilterChip label={`Category: ${filters.category}`} onRemove={() => update({ category: undefined })} />
          )}
          {filters.priority && (
            <FilterChip
              label={`Priority: ${filters.priority}`}
              onRemove={() => update({ priority: undefined })}
            />
          )}
          {filters.analyzed && (
            <FilterChip
              label={filters.analyzed === "true" ? "Analyzed" : "Pending"}
              onRemove={() => update({ analyzed: undefined })}
            />
          )}
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
      {label}
      <button onClick={onRemove} className="rounded-full hover:bg-brand-100 dark:hover:bg-brand-900">
        <X size={12} />
      </button>
    </span>
  );
}
