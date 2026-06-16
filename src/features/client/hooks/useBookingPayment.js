import { useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { useLoyalty } from "@/features/client/hooks/useLoyalty";

const DEFAULT_PLATFORM_FEE_RATE = 0.02;
const num = (value) => Number(value) || 0;

// Singleton promise — Stripe SDK is only loaded once
let stripePromise = null;
export function getStripe() {
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
    pendingPayment: booking?.payment ?? null,
  };
}

export function useBookingPayment(bookingId) {
  const { state: routerState } = useLocation();
  const queryClient = useQueryClient();
  const loyalty = useLoyalty();
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  // ref to the Stripe elements instance provided by <StripeCheckoutForm>
  const stripeRef = useRef(null);
  const elementsRef = useRef(null);

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
      if (!booking?.id) throw new Error("Booking not found.");

      const stripe = stripeRef.current;
      const elements = elementsRef.current;
      if (!stripe || !elements) throw new Error("Card form is not ready. Please wait a moment and try again.");

      const isRedeeming = useLoyaltyPoints && checkout.maxPointsAllowed > 0;

      // Step 1 — Create PaymentIntent on backend → get client_secret
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

      // Step 2 — Confirm card via Stripe Elements (CardElement)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement("card"),
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || "Card payment failed. Please check your card details.");
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error(`Unexpected payment status: ${paymentIntent?.status}`);
      }

      // Step 3 — Finalize with backend → sets booking status ACCEPTED → CONFIRMED
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

  const canSubmit = Boolean(checkout?.canPay && !payMutation.isPending);

  return {
    isLoading: bookingQuery.isLoading,
    error: bookingQuery.error,
    isSuccess,
    paymentId,
    checkout,
    loyaltyBalance: loyalty.balance,
    useLoyalty: useLoyaltyPoints,
    setUseLoyalty: setUseLoyaltyPoints,
    stripeRef,
    elementsRef,
    payMutation,
    canSubmit,
    submitPayment: (e) => {
      e?.preventDefault?.();
      if (canSubmit) payMutation.mutate();
    },
  };
}
