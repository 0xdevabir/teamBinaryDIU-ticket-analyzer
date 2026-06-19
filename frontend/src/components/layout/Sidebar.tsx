import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
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
      className={`hidden flex-col border-r border-neutral-200 bg-white transition-all dark:border-neutral-800 dark:bg-neutral-950 md:flex ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-neutral-100 px-4 dark:border-neutral-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
          T
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
              Ticket Analyzer
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
              Support Desk
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
              }`
            }
          >
            <Icon size={18} className="shrink-0" strokeWidth={1.75} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-3 flex items-center justify-center rounded-md border border-neutral-200 p-2 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-800 dark:hover:bg-neutral-900"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
