import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { adminApi } from "@/features/admin/services/adminApi";

export function useClients(params) {
  return useQuery({
    queryKey: queryKeys.clients(params),
    queryFn: () => adminApi.clients(params),
  });
}
