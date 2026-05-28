import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { adminApi } from "@/features/admin/services/adminApi";

export function useProviders(params) {
  return useQuery({
    queryKey: queryKeys.providers(params),
    queryFn: () => adminApi.providers(params),
  });
}





