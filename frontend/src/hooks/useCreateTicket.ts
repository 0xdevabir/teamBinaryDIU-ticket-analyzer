import { useState } from "react";
import { aiApi, ticketsApi } from "../api";
import type { AIResultView } from "../types/ai";
import type { TicketCreate } from "../types/ticket";

export function useCreateTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: TicketCreate): Promise<AIResultView> => {
    setLoading(true);
    setError(null);
    try {
      const ticket = await ticketsApi.create(data);
      const analyzed = await ticketsApi.analyze(ticket.id);
      return {
        ticketId: analyzed.id,
        title: analyzed.title,
        description: analyzed.description,
        category: analyzed.category ?? "General",
        priority: analyzed.priority ?? "Medium",
        summary: analyzed.summary ?? "",
        confidence: analyzed.ai_confidence ?? 0,
      };
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
      return { ...data, ...result };
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
