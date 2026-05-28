import { useQuery } from "@tanstack/react-query";
import { providerApi } from "@/features/provider/services/providerApi";

export function useProviderBookings() {
  return useQuery({ queryKey: ["providerBookings"], queryFn: providerApi.bookings });
}




