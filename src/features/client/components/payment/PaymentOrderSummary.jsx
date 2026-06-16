import { Link } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { formatDateTime, formatEgp } from "@/features/client/utils/formatters";
import PaymentSummaryLine from "@/features/client/components/payment/PaymentSummaryLine";
import { ROUTE_PATHS } from "@/routes/paths";

export default function PaymentOrderSummary({
  bookingId,
  checkout,
  useLoyalty,
  canSubmit,
  isSubmitting,
  payError,
  payErrorMessage,
  stripeReady,
}) {
  const {
    providerName,
    scheduledLabel,
    estimatedRepairTime,
    isPayingForRepairs,
    serviceTitle,
    servicePrice,
    selectedRepairItems,
    repairsCost,
    platformFee,
    loyaltyDiscount,
    total,
  } = checkout;

  const subtitle =
    isPayingForRepairs
      ? estimatedRepairTime
        ? `Estimated repair time: ${estimatedRepairTime}`
        : null
      : formatDateTime(scheduledLabel);

  const serviceLineLabel = serviceTitle ?? "Service";

  return (
    <div className="sticky top-24 rounded-2xl border border-border-default bg-white p-6 space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-2">
          Provider
        </p>
        <h3 className="text-[15px] font-black text-text-primary leading-tight">
          {providerName ?? "—"}
        </h3>
        {subtitle && <p className="text-[13px] text-text-tertiary mt-1">{subtitle}</p>}
      </div>

      <div className="space-y-2">
        {!isPayingForRepairs && (
          <PaymentSummaryLine label={serviceLineLabel} value={formatEgp(servicePrice)} />
        )}
        {isPayingForRepairs && (
          <PaymentSummaryLine
            label={`Approved repairs (${selectedRepairItems.length})`}
            value={formatEgp(repairsCost)}
          />
        )}
        <PaymentSummaryLine label="Platform fee" value={formatEgp(platformFee)} />
        {useLoyalty && loyaltyDiscount > 0 && (
          <PaymentSummaryLine
            label="Loyalty discount"
            value={formatEgp(loyaltyDiscount)}
            isDiscount
          />
        )}
      </div>

      <div className="border-t-2 border-dotted border-border-default" />

      <div className="flex items-end justify-between mt-2">
        <span className="text-[14px] font-semibold text-text-primary">Total</span>
        <span className="text-[18px] font-semibold text-text-primary">
          {formatEgp(total)}
        </span>
      </div>

      {!isPayingForRepairs && !checkout.canPay && (
        <p className="text-[12px] text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          This booking has already been paid.
        </p>
      )}

      {payError && (
        <p className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {payErrorMessage || "Payment failed. Please try again."}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-[48px] rounded-full bg-brand-500 text-white text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/15 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" color="white" />
            Processing…
          </>
        ) : !stripeReady ? (
          <>
            <Spinner size="sm" color="white" />
            Loading Stripe…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Pay {formatEgp(total)}
          </>
        )}
      </button>

      {!isPayingForRepairs && (
        <div className="text-center">
          <Link
            to={ROUTE_PATHS.BOOKING_DETAIL(bookingId)}
            className="text-[13px] font-semibold text-text-tertiary hover:text-text-primary transition-colors"
          >
            Cancel
          </Link>
        </div>
      )}
    </div>
  );
}
