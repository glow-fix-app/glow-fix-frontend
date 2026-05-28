import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";

export function useBillingSummary() {
  return useQuery({
    queryKey: [...queryKeys.payments, "summary"],
    queryFn: clientApi.billingSummary,
  });
}
