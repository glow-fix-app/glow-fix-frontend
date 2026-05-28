import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";

export function pickActiveLoyaltyConfig(configList) {
  const list = Array.isArray(configList) ? configList : configList ? [configList] : [];
  return list.find((c) => c.is_active) ?? list[0] ?? null;
}

export function loyaltyBalanceFromTransactions(transactions = []) {
  return transactions.reduce((total, tx) => {
    const points = Math.abs(Number(tx.points) || 0);
    return tx.transaction_type === "EARN" ? total + points : total - points;
  }, 0);
}

export function useLoyalty() {
  const configQuery = useQuery({
    queryKey: [...queryKeys.loyalty, "config"],
    queryFn: clientApi.loyaltyConfig,
  });

  const transactionsQuery = useQuery({
    queryKey: [...queryKeys.loyalty, "transactions"],
    queryFn: clientApi.loyaltyTransactions,
  });

  const transactions = transactionsQuery.data ?? [];
  const activeConfig = useMemo(
    () => pickActiveLoyaltyConfig(configQuery.data),
    [configQuery.data]
  );
  const balance = useMemo(
    () => loyaltyBalanceFromTransactions(transactions),
    [transactions]
  );

  return {
    config: configQuery.data,
    activeConfig,
    balance,
    transactions,
    isLoading: configQuery.isLoading || transactionsQuery.isLoading,
    error: configQuery.error || transactionsQuery.error,
  };
}
