import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { useCardForm } from "@/features/client/hooks/useCardForm";
import { useLoyalty } from "@/features/client/hooks/useLoyalty";

const DEFAULT_PLATFORM_FEE_RATE = 0.02;
const num = (value) => Number(value) || 0;

// Singleton promise — Stripe SDK is only loaded once
let stripePromise = null;
function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

function computePlatformFee(booking, taxable) {
  if (booking?.platformFee != null) return num(booking.platformFee);
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
    providerName: booking?.business?.businessName ?? null,
    scheduledLabel: booking?.scheduled_at ?? null,
    estimatedRepairTime: routerState?.estimatedRepairTime ?? null,
    // expose the pending payment id for receipt linking
    pendingPayment: booking?.payment ?? null,
  };
}

export function useBookingPayment(bookingId) {
  const { state: routerState } = useLocation();
  const queryClient = useQueryClient();
  const cardForm = useCardForm();
  const loyalty = useLoyalty();
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

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

      const isRedeeming = useLoyaltyPoints && checkout.maxPointsAllowed > 0;

      // Step 1 — Create PaymentIntent on backend, get client_secret
      const intentResponse = await clientApi.payBooking({
        booking_id: booking.id,
        payment_method: "CARD",
        redeem_points: isRedeeming,
        points_to_redeem: isRedeeming ? checkout.maxPointsAllowed : undefined,
      });

      const clientSecret = intentResponse?.client_secret;
      const paymentIntentId = intentResponse?.payment_intent_id;

      if (!clientSecret || !paymentIntentId) {
        throw new Error("Payment intent creation failed. Please try again.");
      }

      // Step 2 — Confirm the card charge with Stripe
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error("Stripe failed to initialize. Check your publishable key.");
      }

      // Build a card object from the manual form values
      const [expMonth, expYear] = (cardForm.expiry.replace(/\s/g, "").split("/")).map(Number);
      const cardNumber = cardForm.cardNumber.replace(/\s/g, "");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            number: cardNumber,
            exp_month: expMonth,
            exp_year: expYear < 100 ? 2000 + expYear : expYear,
            cvc: cardForm.cvc,
          },
          billing_details: {
            name: cardForm.cardName,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || "Card payment failed. Please check your card details.");
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error(`Unexpected payment status: ${paymentIntent?.status}`);
      }

      // Step 3 — Tell backend the payment succeeded → sets booking status to CONFIRMED
      const result = await clientApi.confirmPayment(paymentIntentId);
      return result;
    },
    onSuccess: (data) => {
      setPaymentId(data?.payment_id ?? null);
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
    paymentId,
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
