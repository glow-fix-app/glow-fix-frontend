import { useQuery } from "@tanstack/react-query";
import { providerApi } from "@/features/provider/services/providerApi";

export function useProviderEarnings() {
  return useQuery({ queryKey: ["providerEarnings"], queryFn: providerApi.earnings });
}




