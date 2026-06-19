import type { AIResultView } from "../types/ai";
import type { Ticket, TicketAnalyzeResponse } from "../types/ticket";

export function ticketToAIResult(ticket: Ticket | TicketAnalyzeResponse): AIResultView | null {
  if (!ticket.category) return null;
  return {
    ticketId: ticket.id,
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority ?? "medium",
    summary: ticket.summary ?? "",
    confidence: ticket.ai_confidence ?? 0,
    inference_source: "inference_source" in ticket ? ticket.inference_source : undefined,
    confidence_breakdown: "confidence_breakdown" in ticket ? ticket.confidence_breakdown : undefined,
    processing_ms: "processing_ms" in ticket ? ticket.processing_ms : undefined,
  };
}
