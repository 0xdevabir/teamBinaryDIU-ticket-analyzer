import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";

interface Props {
  onSeed: () => void;
  seeding: boolean;
  hasTickets: boolean;
}

export default function DemoBanner({ onSeed, seeding, hasTickets }: Props) {
  if (hasTickets) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold tracking-tight text-neutral-900 dark:text-white">
            Get started
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Load sample tickets or create one to explore the dashboard.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" onClick={onSeed} disabled={seeding}>
            {seeding ? "Loading..." : "Load demo data"}
          </Button>
          <Link to="/create">
            <Button size="sm" variant="secondary">
              Create ticket
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
