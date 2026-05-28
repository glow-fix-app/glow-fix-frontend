import { useQuery } from "@tanstack/react-query";
import { providerApi } from "@/features/provider/services/providerApi";

export function useProviderReviews() {
  return useQuery({ queryKey: ["providerReviews"], queryFn: providerApi.reviews });
}




