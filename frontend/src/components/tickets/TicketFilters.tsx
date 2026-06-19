import { Search } from "lucide-react";
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

const selectClass = "saas-input";

export default function TicketFilters({ filters, onChange, onApply }: Props) {
  return (
    <form
      className="saas-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search tickets..."
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className={`${selectClass} pl-9`}
        />
      </div>
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
      <Button type="submit" className="w-full sm:w-auto">Apply Filters</Button>
    </form>
  );
}
