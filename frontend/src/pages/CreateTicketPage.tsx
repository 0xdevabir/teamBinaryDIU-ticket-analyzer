import { useNavigate } from "react-router-dom";
import { useCreateTicket } from "../hooks/useCreateTicket";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useToast } from "../context/ToastContext";
import TicketForm from "../components/forms/TicketForm";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import type { TicketCreate } from "../types/ticket";
import type { AIResultView } from "../types/ai";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submit, preview, loading, error } = useCreateTicket();

  useDocumentTitle("Create Ticket");

  async function handleSubmit(data: TicketCreate) {
    const result = await submit(data);
    toast("Ticket created and analyzed", "success");
    navigate(`/tickets/${result.ticketId}/ai`, { state: { result } });
  }

  async function handlePreview(data: TicketCreate) {
    const result: AIResultView = await preview(data);
    toast("AI preview ready", "info");
    navigate("/ai-results", { state: { result } });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Create Ticket"
        description="Submit a support ticket and get instant AI classification"
      />
      <Card>
        <TicketForm
          onSubmit={handleSubmit}
          onPreview={handlePreview}
          loading={loading}
          error={error}
        />
      </Card>
    </div>
  );
}
