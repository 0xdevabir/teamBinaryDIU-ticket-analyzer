import { NavLink } from "react-router-dom";
import { LayoutDashboard, List, PlusCircle, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tickets", label: "Tickets", icon: List },
  { to: "/create", label: "Create", icon: PlusCircle },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/" className="text-lg font-bold text-brand-700">
          Ticket Analyzer
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 px-4 py-3 md:hidden">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
