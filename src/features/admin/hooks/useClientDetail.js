import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { adminApi } from "@/features/admin/services/adminApi";

export function useClientDetail(clientId) {
  return useQuery({
    queryKey: [...queryKeys.admin, "user", clientId],
    queryFn: () => adminApi.userById(clientId),
    enabled: !!clientId,
  });
}

export function useClientBookings(clientId, params) {
  return useQuery({
    queryKey: [...queryKeys.admin, "user", clientId, "bookings", params],
    queryFn: () => adminApi.userBookings(clientId, params),
    enabled: !!clientId,
  });
}
