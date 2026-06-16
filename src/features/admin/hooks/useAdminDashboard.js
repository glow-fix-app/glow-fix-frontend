import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/services/adminApi";
import { queryKeys } from "@/services/queryClient";

export function useDashboardStats() {
  return useQuery({
    queryKey: [...queryKeys.admin, "dashboard", "stats"],
    queryFn: () => adminApi.dashboardStats(),
  });
}

export function useRevenueStats({ period = "monthly", months = 12 } = {}) {
  return useQuery({
    queryKey: [...queryKeys.admin, "dashboard", "revenue", { period, months }],
    queryFn: () => adminApi.dashboardRevenue({ period, months }),
  });
}

export function useTopPerformers({ limit = 5 } = {}) {
  return useQuery({
    queryKey: [...queryKeys.admin, "dashboard", "top-performers", { limit }],
    queryFn: () => adminApi.dashboardTopPerformers({ limit }),
  });
}

export function usePlatformHealth() {
  return useQuery({
    queryKey: [...queryKeys.admin, "dashboard", "health"],
    queryFn: () => adminApi.dashboardHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
