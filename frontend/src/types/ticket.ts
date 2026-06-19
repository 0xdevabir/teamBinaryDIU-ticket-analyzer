export interface Ticket {
  id: string;
  title: string;
  description: string;
  category?: string | null;
  priority?: string | null;
  summary?: string | null;
  ai_confidence?: number | null;
  created_at: string;
  updated_at: string;
}

export interface TicketAnalyzeResponse extends Ticket {
  inference_source?: string | null;
  confidence_breakdown?: Record<string, number> | null;
  processing_ms?: number | null;
}

export interface TicketCreate {
  title: string;
  description: string;
}

export interface TicketListResponse {
  items: Ticket[];
  total: number;
  page: number;
  page_size: number;
}

export interface DashboardStats {
  total_tickets: number;
  analyzed_total: number;
  pending_total: number;
  analyzed_today: number;
  analysis_rate: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  avg_confidence?: number | null;
}

export interface TicketFilters {
  page?: number;
  page_size?: number;
  analyzed?: string;
  category?: string;
  priority?: string;
  search?: string;
}
