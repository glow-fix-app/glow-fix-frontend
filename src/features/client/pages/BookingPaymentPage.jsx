import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Elements } from "@stripe/react-stripe-js";
import EmptyState from "@/components/feedback/EmptyState";
import { ROUTE_PATHS } from "@/routes/paths";
import { useBookingPayment, getStripe } from "@/features/client/hooks/useBookingPayment";
import StripeCardForm from "@/features/client/components/payment/StripeCardForm";
import LoyaltyPointsCard from "@/features/client/components/payment/LoyaltyPointsCard";
import PaymentSecurityNotice from "@/features/client/components/payment/PaymentSecurityNotice";
import PaymentOrderSummary from "@/features/client/components/payment/PaymentOrderSummary";
import PaymentSuccessView from "@/features/client/components/payment/PaymentSuccessView";

const STRIPE_ELEMENTS_OPTIONS = {
  fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" }],
};

function BookingPaymentForm({ bookingId }) {
  const navigate = useNavigate();
  const {
    isLoading,
    error,
    isSuccess,
    paymentId,
    checkout,
    loyaltyBalance,
    useLoyalty,
    setUseLoyalty,
    stripeReady,
    payMutation,
    canSubmit,
    submitPayment,
  } = useBookingPayment(bookingId);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-5xl pb-16">
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-5xl pb-16">
        <EmptyState
          title="Booking not found"
          message="We couldn't load the booking for payment."
        />
      </section>
    );
  }

  if (isSuccess) {
    return (
      <PaymentSuccessView
        bookingId={bookingId}
        total={checkout.total}
        paymentId={paymentId}
        isPayingForRepairs={checkout.isPayingForRepairs}
      />
    );
  }

  const loyaltyDisabled = loyaltyBalance < checkout.loyaltyMinPoints;

  return (
    <section className="mx-auto w-full max-w-5xl pb-16">
      {!checkout.isPayingForRepairs && (
        <button
          type="button"
          onClick={() => navigate(ROUTE_PATHS.BOOKING_DETAIL(bookingId))}
          className="flex items-center gap-2 text-[13px] font-semibold text-text-tertiary transition-colors hover:text-text-primary mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to booking
        </button>
      )}

      <form onSubmit={submitPayment}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Stripe CardElement — the hook calls useElements() directly to access it */}
            <StripeCardForm />

            <div>
              <h2 className="text-[20px] font-semibold text-text-primary mb-4">Loyalty points</h2>
              <LoyaltyPointsCard
                pointsToUse={checkout.maxPointsAllowed}
                totalPoints={loyaltyBalance}
                discountAmount={checkout.potentialLoyaltyDiscount}
                egpPerPoint={checkout.egpPerPoint}
                checked={useLoyalty}
                onChange={setUseLoyalty}
                disabled={loyaltyDisabled}
              />
            </div>

            <PaymentSecurityNotice />
          </div>

          <div className="lg:col-span-2">
            <PaymentOrderSummary
              bookingId={bookingId}
              checkout={checkout}
              useLoyalty={useLoyalty}
              canSubmit={canSubmit}
              isSubmitting={payMutation.isPending}
              payError={payMutation.isError}
              payErrorMessage={payMutation.error?.message}
              stripeReady={stripeReady}
            />
          </div>
        </div>
      </form>
    </section>
  );
}

export default function BookingPaymentPage() {
  const { bookingId } = useParams();

  return (
    <Elements stripe={getStripe()} options={STRIPE_ELEMENTS_OPTIONS}>
      <BookingPaymentForm bookingId={bookingId} />
    </Elements>
  );
}
