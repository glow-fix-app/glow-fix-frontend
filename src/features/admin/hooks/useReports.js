import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/services/adminApi";

export function useReports() {
  return useQuery({ queryKey: ["reports"], queryFn: adminApi.reports });
}




