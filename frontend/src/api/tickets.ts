import { http } from "./axios";
import type { Ticket, TicketAnalyzeResponse, TicketCreate, TicketFilters, TicketListResponse } from "../types/ticket";

export const ticketsApi = {
  create: (data: TicketCreate) =>
    http.post<Ticket>("/tickets", data).then((r) => r.data),

  list: (params?: TicketFilters) =>
    http.get<TicketListResponse>("/tickets", { params }).then((r) => r.data),

  get: (id: string) =>
    http.get<Ticket>(`/tickets/${id}`).then((r) => r.data),

  update: (id: string, data: Partial<TicketCreate>) =>
    http.patch<Ticket>(`/tickets/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    http.delete(`/tickets/${id}`),

  analyze: (id: string) =>
    http.post<TicketAnalyzeResponse>(`/tickets/${id}/analyze`).then((r) => r.data),

  exportCsv: (params?: Record<string, string>) =>
    http
      .get("/tickets/export", { params, responseType: "blob" })
      .then((r) => r.data as Blob),
};
