import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { adminApi } from "@/features/admin/services/adminApi";

export function useAdminBookings(params) {
  return useQuery({
    queryKey: [...queryKeys.bookings, params],
    queryFn: () => adminApi.bookings(params),
  });
}
