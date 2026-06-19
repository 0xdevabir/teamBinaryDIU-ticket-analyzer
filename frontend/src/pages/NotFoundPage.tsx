import { Link } from "react-router-dom";
import { Home, Ticket } from "lucide-react";
import Button from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Page Not Found");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold tracking-tightest text-neutral-900 dark:text-white">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button>
            <Home size={16} />
            Dashboard
          </Button>
        </Link>
        <Link to="/tickets">
          <Button variant="secondary">
            <Ticket size={16} />
            Tickets
          </Button>
        </Link>
      </div>
    </div>
  );
}
