import type { Ticket } from "../types/ticket";
import type { TicketFilters } from "../types/ticket";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function ticketsToCsv(tickets: Ticket[]): string {
  const headers = [
    "id",
    "title",
    "description",
    "category",
    "priority",
    "summary",
    "ai_confidence",
    "created_at",
    "updated_at",
  ];
  const rows = tickets.map((t) =>
    [
      t.id,
      t.title,
      t.description,
      t.category ?? "",
      t.priority ?? "",
      t.summary ?? "",
      t.ai_confidence != null ? String(t.ai_confidence) : "",
      t.created_at,
      t.updated_at,
    ]
      .map(escapeCsv)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(content: string, filename = "tickets-export.csv") {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function filtersToParams(filters: TicketFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.category) params.category = filters.category;
  if (filters.priority) params.priority = filters.priority;
  if (filters.analyzed === "true") params.analyzed = "true";
  if (filters.analyzed === "false") params.analyzed = "false";
  return params;
}
