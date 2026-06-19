import type { DashboardStats, Ticket, TicketCreate, TicketListResponse } from "../types/ticket";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

function parseErrorDetail(body: unknown): string {
  if (!body || typeof body !== "object") return "Request failed";
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => (typeof d === "object" && d && "msg" in d ? String(d.msg) : String(d))).join(", ");
  }
  return "Request failed";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(parseErrorDetail(error) || response.statusText);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  createTicket: (data: TicketCreate) =>
    request<Ticket>("/tickets", { method: "POST", body: JSON.stringify(data) }),

  listTickets: (params?: Record<string, string | number>) => {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])
    ).toString();
    return request<TicketListResponse>(`/tickets${query ? `?${query}` : ""}`);
  },

  getTicket: (id: string) => request<Ticket>(`/tickets/${id}`),

  reanalyzeTicket: (id: string) =>
    request<Ticket>(`/tickets/${id}/reanalyze`, { method: "POST" }),

  getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),

  getRecentTickets: () => request<Ticket[]>("/dashboard/recent"),

  seedDemoData: () => request<Ticket[]>("/dashboard/seed", { method: "POST" }),
};
