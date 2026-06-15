import { useQuery } from "@tanstack/react-query";
import { providerApi } from "../services/providerApi";

export function useProviderPayouts(page = 1, limit = 20) {
  // We need the businessId first
  const businessQuery = useQuery({
    queryKey: ["provider", "myBusiness"],
    queryFn: providerApi.myBusiness,
  });

  const businessId = businessQuery.data?.id;

  // Then fetch the payouts for this business
  const payoutsQuery = useQuery({
    queryKey: ["provider", "payouts", businessId, page, limit],
    queryFn: () => providerApi.getPayouts(businessId, { page, limit }),
    enabled: !!businessId,
  });

  return {
    payouts: payoutsQuery.data?.data || [],
    meta: payoutsQuery.data?.meta || null,
    isLoading: businessQuery.isLoading || (payoutsQuery.isLoading && payoutsQuery.fetchStatus !== "idle"),
    error: businessQuery.error || payoutsQuery.error,
  };
}
