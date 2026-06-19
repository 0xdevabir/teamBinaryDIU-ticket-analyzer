import { Link } from "react-router-dom";
import { Menu, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-white">
          <Sparkles size={14} />
        </div>
        <span className="font-bold text-slate-900">TicketAI</span>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <Link to="/create" className="hidden sm:block">
          <Button size="sm">
            <Plus size={16} />
            New Ticket
          </Button>
        </Link>
        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-slate-200 bg-white p-4 md:hidden">
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
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
