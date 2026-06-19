import { Link } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950 md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
          T
        </div>
        <span className="font-bold tracking-tight text-neutral-900 dark:text-white">
          Ticket Analyzer
        </span>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link to="/create" className="hidden sm:block">
          <Button size="sm">
            <Plus size={16} />
            New Ticket
          </Button>
        </Link>
        <button
          className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
          <nav className="flex flex-col gap-1">
            {[
              { to: "/", label: "Dashboard" },
              { to: "/tickets", label: "Tickets" },
              { to: "/create", label: "New Ticket" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
