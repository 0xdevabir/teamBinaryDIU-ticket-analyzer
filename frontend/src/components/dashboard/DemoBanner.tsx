import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import Button from "../ui/Button";

interface Props {
  onSeed: () => void;
  seeding: boolean;
  hasTickets: boolean;
}

export default function DemoBanner({ onSeed, seeding, hasTickets }: Props) {
  if (hasTickets) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-violet-50 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Try the AI Demo</h2>
            <p className="mt-1 text-sm text-slate-600">
              Load sample tickets or create one to see Hugging Face classification in action.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" onClick={onSeed} disabled={seeding}>
            {seeding ? "Loading..." : "Load Demo Data"}
          </Button>
          <Link to="/create">
            <Button size="sm" variant="secondary">
              Create Ticket
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
