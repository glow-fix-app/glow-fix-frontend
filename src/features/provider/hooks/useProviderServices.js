import { useQuery } from "@tanstack/react-query";
import { providerApi } from "@/features/provider/services/providerApi";

export function useProviderServices() {
  return useQuery({ queryKey: ["providerServices"], queryFn: providerApi.services });
}




