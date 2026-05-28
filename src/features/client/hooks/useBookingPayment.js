import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { useCardForm } from "@/features/client/hooks/useCardForm";
import { useLoyalty } from "@/features/client/hooks/useLoyalty";

const DEFAULT_PLATFORM_FEE_RATE = 0.02;
const num = (value) => Number(value) || 0;

function computePlatformFee(booking, taxable) {
  if (booking?.platform_fee != null) return num(booking.platform_fee);
  const rate = num(booking?.platform_fee_rate);
  return Math.round(taxable * (rate > 0 ? rate : DEFAULT_PLATFORM_FEE_RATE));
}

function buildCheckout(booking, routerState, { balance, activeConfig }, applyLoyalty) {
  const items = booking?.booking_items ?? [];
  const status = String(booking?.status ?? "").toLowerCase();
  const isPaid = status === "paid";

  const selectedRepairItems = routerState?.selectedRepairItems ?? [];
  const isPayingForRepairs = selectedRepairItems.length > 0;
  const repairsCost = num(routerState?.repairsCost);
  const servicePrice = isPayingForRepairs
    ? 0
    : num(booking?.service_price ?? booking?.total_price);

  const taxable = servicePrice + repairsCost;
  const platform = computePlatformFee(booking, taxable);
  const subtotal = taxable + platform;

  const egpPerPoint = num(activeConfig?.egp_per_point) || 0.1;
  const maxRedeemPct = num(activeConfig?.max_redeem_pct) || 100;
  const maxPoints = Math.min(
    balance,
    Math.floor((subtotal * maxRedeemPct) / 100 / egpPerPoint)
  );
  const loyaltyDiscount = applyLoyalty ? maxPoints * egpPerPoint : 0;

  return {
    bookingItems: items,
    canPay: isPayingForRepairs || !isPaid,
    repairsCost,
    selectedRepairItems,
    isPayingForRepairs,
    servicePrice,
    platformFee: platform,
    loyaltyDiscount,
    potentialLoyaltyDiscount: maxPoints * egpPerPoint,
    maxPointsAllowed: maxPoints,
    loyaltyMinPoints: 1 / egpPerPoint,
    egpPerPoint,
    total: Math.max(0, subtotal - loyaltyDiscount),
    serviceTitle: items[0]?.title ?? null,
    providerName: booking?.branch?.business_name ?? null,
    scheduledLabel: booking?.scheduled_at ?? null,
    estimatedRepairTime: routerState?.estimatedRepairTime ?? null,
  };
}

export function useBookingPayment(bookingId) {
  const { state: routerState } = useLocation();
  const queryClient = useQueryClient();
  const cardForm = useCardForm();
  const loyalty = useLoyalty();
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const bookingQuery = useQuery({
    queryKey: [...queryKeys.bookings, bookingId, "pay"],
    queryFn: () => clientApi.bookingDetails(bookingId),
    enabled: Boolean(bookingId),
  });

  const checkout = useMemo(
    () =>
      bookingQuery.data
        ? buildCheckout(
            bookingQuery.data,
            routerState,
            { balance: loyalty.balance, activeConfig: loyalty.activeConfig },
            useLoyaltyPoints
          )
        : null,
    [bookingQuery.data, routerState, loyalty.balance, loyalty.activeConfig, useLoyaltyPoints]
  );

  const payMutation = useMutation({
    mutationFn: async () => {
      const booking = bookingQuery.data;
      if (!booking?.id) {
        throw new Error("Booking not found.");
      }

      const redeem =
        useLoyaltyPoints && checkout.maxPointsAllowed > 0
          ? clientApi.redeemLoyaltyPoints({
              booking_id: booking.id,
              transaction_type: "REDEEM",
              points: checkout.maxPointsAllowed,
              description: "Redeemed for service discount",
              created_at: new Date().toISOString(),
            })
          : null;

      await Promise.all([
        clientApi.payBooking(booking.id),
        ...(redeem ? [redeem] : []),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.loyalty });
      setIsSuccess(true);
    },
  });

  const canSubmit = Boolean(
    checkout?.canPay && cardForm.isValid && !payMutation.isPending
  );

  return {
    isLoading: bookingQuery.isLoading,
    error: bookingQuery.error,
    isSuccess,
    checkout,
    loyaltyBalance: loyalty.balance,
    useLoyalty: useLoyaltyPoints,
    setUseLoyalty: setUseLoyaltyPoints,
    cardForm,
    payMutation,
    canSubmit,
    submitPayment: (e) => {
      e?.preventDefault?.();
      if (canSubmit) payMutation.mutate();
    },
  };
}
