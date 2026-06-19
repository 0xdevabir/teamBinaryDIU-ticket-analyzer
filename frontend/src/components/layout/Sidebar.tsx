import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/create", label: "New Ticket", icon: PlusCircle },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 md:flex ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-4 dark:border-slate-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-white">
          <Sparkles size={18} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">TicketAI</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Analyzer
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-950 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-3 flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
