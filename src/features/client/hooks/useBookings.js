import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { mapClientBooking } from "@/features/client/lib/mapClientBooking";

export function useBookings() {
  const query = useQuery({
    queryKey: queryKeys.bookings,
    // The backend returns { data: BookingResponseDto[], meta: { total, page, limit, totalPages } }
    queryFn: () => clientApi.bookings(),
  });

  // Backend scopes bookings to the authenticated user — no need to filter client-side.
  const rawList = query.data?.data ?? query.data ?? [];
  const bookings = rawList.map(mapClientBooking);

  return {
    bookings,
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

