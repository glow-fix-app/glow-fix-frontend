import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/services/adminApi";

export function useAnalytics() {
  return useQuery({ queryKey: ["analytics"], queryFn: adminApi.analytics });
}




