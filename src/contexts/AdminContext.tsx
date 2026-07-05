import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as hospitalApi from "@/lib/api/hospital";
import { mapOverdueToAlertLog } from "@/lib/api/mappers";
import { isApiConfigured } from "@/lib/config";
import type { AlertLog } from "@/types/admin";
import type { AdminUser } from "@/types/user";

interface PlatformMetrics {
  totalRegisteredParents: number;
  totalChildren: number;
  vaccinesTracked: number;
  overdueAlerts: number;
  completionRate: number;
  dueSoon: number;
}

interface AdminContextValue {
  user: AdminUser;
  metrics: PlatformMetrics;
  overdueAlerts: AlertLog[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const EMPTY_METRICS: PlatformMetrics = {
  totalRegisteredParents: 0,
  totalChildren: 0,
  vaccinesTracked: 0,
  overdueAlerts: 0,
  completionRate: 0,
  dueSoon: 0,
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const canLoadData = isApiConfigured() && Boolean(authUser?.id);

  const [metrics, setMetrics] = useState<PlatformMetrics>(EMPTY_METRICS);
  const [overdueAlerts, setOverdueAlerts] = useState<AlertLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!canLoadData) {
      setMetrics(EMPTY_METRICS);
      setOverdueAlerts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [stats, overdue] = await Promise.all([
        hospitalApi.getStats(),
        hospitalApi.getOverdue(),
      ]);

      setMetrics({
        totalRegisteredParents: stats.total_registered_parents,
        totalChildren: stats.total_children,
        vaccinesTracked: stats.active_vaccines,
        overdueAlerts: stats.schedules_overdue,
        completionRate: stats.completion_rate,
        dueSoon: stats.schedules_due_soon,
      });
      setOverdueAlerts(overdue.map(mapOverdueToAlertLog));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hospital dashboard.");
      setMetrics(EMPTY_METRICS);
      setOverdueAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [canLoadData]);

  useEffect(() => {
    void refresh();
  }, [refresh, authUser?.id]);

  const value = useMemo<AdminContextValue>(() => {
    const user: AdminUser = {
      id: authUser?.id ?? "admin-unknown",
      name: authUser?.name ?? "Administrator",
      email: authUser?.email ?? "",
      role: "Hospital Administrator",
      organization: authUser?.organization ?? "VaxReminder Health Network",
      initials: authUser?.initials ?? "AD",
    };

    return {
      user,
      metrics,
      overdueAlerts,
      isLoading,
      error,
      refresh,
    };
  }, [authUser, metrics, overdueAlerts, isLoading, error, refresh]);

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdminContext(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
}
