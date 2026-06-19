import { useCallback, useEffect, useState } from "react";
import { dashboardApi } from "../api";
import type { DashboardStats, Ticket } from "../types/ticket";

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, recentData] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.recent(),
      ]);
      setStats(statsData);
      setRecent(recentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const seed = async () => {
    await dashboardApi.seed();
    await refresh();
  };

  return { stats, recent, loading, error, refresh, seed };
}
