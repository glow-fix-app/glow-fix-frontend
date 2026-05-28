import { useQuery } from "@tanstack/react-query";
import { providerApi } from "@/features/provider/services/providerApi";

export function useProviderTracking() {
  return useQuery({ queryKey: ["providerTracking"], queryFn: providerApi.tracking });
}




