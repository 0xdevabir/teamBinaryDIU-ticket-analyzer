import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import SubmitTicket from "./pages/SubmitTicket";
import TicketDetail from "./pages/TicketDetail";
import TicketList from "./pages/TicketList";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tickets" element={<TicketList />} />
          <Route path="submit" element={<SubmitTicket />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
