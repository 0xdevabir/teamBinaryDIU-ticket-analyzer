import { FormEvent, useState } from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import Button from "../ui/Button";
import type { TicketCreate } from "../../types/ticket";

interface Props {
  onSubmit: (data: TicketCreate) => void;
  onPreview?: (data: TicketCreate) => void;
  loading?: boolean;
  error?: string | null;
}

export default function TicketForm({ onSubmit, onPreview, loading, error }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ title, description });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        id="title"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Unable to login"
        required
        minLength={3}
        maxLength={200}
      />
      <Textarea
        id="description"
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue in detail..."
        required
        minLength={10}
        rows={6}
      />
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Submit & Analyze"}
        </Button>
        {onPreview && (
          <Button
            type="button"
            variant="secondary"
            disabled={loading || title.length < 3 || description.length < 10}
            onClick={() => onPreview({ title, description })}
          >
            Preview AI Only
          </Button>
        )}
      </div>
    </form>
  );
}
