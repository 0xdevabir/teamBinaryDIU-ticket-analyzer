import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { http } from "../../api/axios";

export default function SystemStatus() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    http
      .get("/health/ready")
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  const colors = {
    loading: "text-neutral-400",
    ok: "text-neutral-600 dark:text-neutral-400",
    error: "text-red-600",
  };

  const labels = {
    loading: "Checking...",
    ok: "All systems operational",
    error: "API unavailable",
  };

  return (
    <div className={`flex items-center gap-1.5 text-xs ${colors[status]}`}>
      <Activity size={12} className={status === "ok" ? "" : ""} />
      <span>{labels[status]}</span>
    </div>
  );
}
