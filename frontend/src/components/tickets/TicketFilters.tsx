import type { TicketFilters } from "../../types/ticket";
import Button from "../ui/Button";

const CATEGORIES = ["", "Billing", "Technical", "Account", "Feature Request", "Other", "Authentication", "General"];
const PRIORITIES = ["", "critical", "high", "medium", "low", "Critical", "High", "Medium", "Low"];
const ANALYZED = [
  { value: "", label: "All" },
  { value: "true", label: "Analyzed" },
  { value: "false", label: "Pending" },
];

interface Props {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
  onApply: () => void;
}

const selectClass =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export default function TicketFilters({ filters, onChange, onApply }: Props) {
  return (
    <form
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <input
        type="search"
        placeholder="Search..."
        value={filters.search ?? ""}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className={selectClass}
      />
      <select
        value={filters.category ?? ""}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className={selectClass}
      >
        {CATEGORIES.map((c) => (
          <option key={c || "all"} value={c}>{c || "All categories"}</option>
        ))}
      </select>
      <select
        value={filters.priority ?? ""}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className={selectClass}
      >
        {PRIORITIES.map((p) => (
          <option key={p || "all"} value={p}>{p || "All priorities"}</option>
        ))}
      </select>
      <select
        value={filters.analyzed ?? ""}
        onChange={(e) => onChange({ ...filters, analyzed: e.target.value })}
        className={selectClass}
      >
        {ANALYZED.map((o) => (
          <option key={o.value || "all"} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Button type="submit" className="w-full sm:w-auto">Apply</Button>
    </form>
  );
}
