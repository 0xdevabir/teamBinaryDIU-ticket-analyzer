import { Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import TicketListPage from "../pages/TicketListPage";
import TicketDetailPage from "../pages/TicketDetailPage";
import CreateTicketPage from "../pages/CreateTicketPage";
import AIResultsPage from "../pages/AIResultsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tickets" element={<TicketListPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="tickets/:id/ai" element={<AIResultsPage />} />
        <Route path="create" element={<CreateTicketPage />} />
        <Route path="ai-results" element={<AIResultsPage />} />
      </Route>
    </Routes>
  );
}
