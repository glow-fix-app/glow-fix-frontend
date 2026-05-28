import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { adminApi } from "@/features/admin/services/adminApi";

export function useUsers(params) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => adminApi.users(params),
  });
}





