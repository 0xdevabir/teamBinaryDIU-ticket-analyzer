import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import SystemStatus from "./SystemStatus";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-neutral-400">Ticket Analyzer · Support Operations</p>
            <SystemStatus />
          </div>
        </footer>
      </div>
    </div>
  );
}
