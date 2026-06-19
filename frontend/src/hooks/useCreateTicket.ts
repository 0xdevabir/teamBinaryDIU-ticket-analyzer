import { useState } from "react";
import { aiApi, ticketsApi } from "../api";
import type { AIResultView } from "../types/ai";
import type { TicketCreate } from "../types/ticket";

function toAIResultView(
  data: { title: string; description: string },
  analyzed: {
    id?: string;
    category?: string | null;
    priority?: string | null;
    summary?: string | null;
    ai_confidence?: number | null;
    inference_source?: string | null;
    confidence_breakdown?: Record<string, number> | null;
    processing_ms?: number | null;
  }
): AIResultView {
  return {
    ticketId: analyzed.id,
    title: data.title,
    description: data.description,
    category: analyzed.category ?? "General",
    priority: analyzed.priority ?? "Medium",
    summary: analyzed.summary ?? "",
    confidence: analyzed.ai_confidence ?? 0,
    inference_source: analyzed.inference_source ?? undefined,
    confidence_breakdown: analyzed.confidence_breakdown ?? undefined,
    processing_ms: analyzed.processing_ms ?? undefined,
  };
}

export function useCreateTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: TicketCreate): Promise<AIResultView> => {
    setLoading(true);
    setError(null);
    try {
      const ticket = await ticketsApi.create(data);
      const analyzed = await ticketsApi.analyze(ticket.id);
      return toAIResultView(data, { ...analyzed, id: analyzed.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const preview = async (data: TicketCreate): Promise<AIResultView> => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.analyze(data);
      return {
        ...data,
        category: result.category,
        priority: result.priority,
        summary: result.summary,
        confidence: result.confidence,
        inference_source: result.inference_source,
        confidence_breakdown: result.confidence_breakdown,
        processing_ms: result.processing_ms,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, preview, loading, error };
}
