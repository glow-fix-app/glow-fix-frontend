import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { mapClientBooking } from "@/features/client/lib/mapClientBooking";

export function useBookings() {
  const loggedInUserId = useSelector((state) => state.auth.user?.id);

  const query = useQuery({
    queryKey: queryKeys.bookings,
    queryFn: clientApi.bookings,
  });

  const bookings = (query.data || [])
    .filter((b) => String(b.user_id) === String(loggedInUserId))
    .map(mapClientBooking);

  return {
    bookings,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
