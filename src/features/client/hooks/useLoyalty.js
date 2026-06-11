import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";

// ─── helpers kept for useBookingPayment compatibility ────────────────────────
export function pickActiveLoyaltyConfig(configList) {
  const list = Array.isArray(configList) ? configList : configList ? [configList] : [];
  return list.find((c) => c.is_active) ?? list[0] ?? null;
}

export function loyaltyBalanceFromTransactions(transactions = []) {
  return transactions.reduce((total, tx) => {
    const points = Math.abs(Number(tx.points) || 0);
    return tx.type === "EARNED" ? total + points : total - points;
  }, 0);
}

// ─── main hook ────────────────────────────────────────────────────────────────
export function useLoyalty() {
  const qc = useQueryClient();

  // GET /loyalty/summary  →  { points_balance, points_value_egp, tier_name, points_to_next_tier, … }
  const summaryQuery = useQuery({
    queryKey: [...queryKeys.loyalty, "summary"],
    queryFn: clientApi.loyaltySummary,
  });

  // GET /loyalty/transactions  →  { data: [...], meta: { total, page, … } }
  const transactionsQuery = useQuery({
    queryKey: [...queryKeys.loyalty, "transactions"],
    queryFn: () => clientApi.loyaltyTransactions({ limit: 20 }),
  });

  // GET /loyalty/quick-redeem  →  { options: [{ points, value_egp, description }] }
  const quickRedeemQuery = useQuery({
    queryKey: [...queryKeys.loyalty, "quick-redeem"],
    queryFn: clientApi.loyaltyQuickRedeem,
  });

  // POST /loyalty/redeem
  const redeemMutation = useMutation({
    mutationFn: (points) => clientApi.loyaltyRedeem(points),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.loyalty });
    },
  });

  const summary = summaryQuery.data ?? null;
  const transactions = transactionsQuery.data?.data ?? [];
  const quickRedeemOptions = quickRedeemQuery.data?.options ?? [];

  // Derive balance from summary (preferred) or fall back to transaction math
  const balance = summary?.points_balance ?? loyaltyBalanceFromTransactions(transactions);

  // Build a synthetic activeConfig shape so useBookingPayment stays compatible
  const activeConfig = useMemo(() => {
    if (!summary) return null;
    const egpPerPoint = balance > 0 ? (summary.points_value_egp ?? 0) / balance : 0.1;
    return {
      is_active: true,
      points_per_egp: 1,
      egp_per_point: egpPerPoint,
      min_redeem_points: quickRedeemOptions[0]?.points ?? 100,
    };
  }, [summary, balance, quickRedeemOptions]);

  return {
    // Page-level fields
    summary,
    transactions,
    quickRedeemOptions,
    // Compat fields used by useBookingPayment
    config: activeConfig ? [activeConfig] : [],
    activeConfig,
    balance,
    // Redeem action
    redeem: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
    redeemError: redeemMutation.error,
    // Loading / error
    isLoading:
      summaryQuery.isLoading ||
      transactionsQuery.isLoading ||
      quickRedeemQuery.isLoading,
    error:
      summaryQuery.error ||
      transactionsQuery.error ||
      quickRedeemQuery.error,
  };
}
