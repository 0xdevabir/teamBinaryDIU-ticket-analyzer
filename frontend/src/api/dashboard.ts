import { http } from "./axios";
import type { DashboardStats, Ticket } from "../types/ticket";

export const dashboardApi = {
  stats: () =>
    http.get<DashboardStats>("/dashboard/stats").then((r) => r.data),

  recent: () =>
    http.get<Ticket[]>("/dashboard/recent").then((r) => r.data),

  seed: () =>
    http.post<Ticket[]>("/dashboard/seed").then((r) => r.data),
};
