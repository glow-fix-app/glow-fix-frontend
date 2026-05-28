import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";

export function usePayments({ page = 1, limit = 5 } = {}) {
  return useQuery({
    queryKey: [...queryKeys.payments, page, limit],
    queryFn: () => clientApi.payments({ page, limit }),
  });
}
