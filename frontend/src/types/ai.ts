export interface AnalyzeRequest {
  title: string;
  description: string;
}

export interface AnalyzeResponse {
  category: string;
  priority: string;
  summary: string;
  confidence: number;
  inference_source?: string;
  confidence_breakdown?: Record<string, number>;
  processing_ms?: number;
}

export interface AIResultView {
  ticketId?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  summary: string;
  confidence: number;
  inference_source?: string;
  confidence_breakdown?: Record<string, number>;
  processing_ms?: number;
}
