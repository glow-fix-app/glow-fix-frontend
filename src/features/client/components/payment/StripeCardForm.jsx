import { CardElement } from "@stripe/react-stripe-js";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#111827",
      letterSpacing: "0.015em",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  hidePostalCode: true,
};

/**
 * StripeCardForm
 * Renders the Stripe-hosted CardElement. Must be mounted inside <Elements>.
 * The parent hook (useBookingPayment) calls useElements() directly to obtain
 * the element reference — no props needed here.
 */
export default function StripeCardForm() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[20px] font-semibold text-text-primary">Card details</h2>
        <div className="flex items-center gap-1.5">
          {["Visa", "MC", "Amex"].map((brand) => (
            <span
              key={brand}
              className="text-[10px] font-bold tracking-wide text-text-muted border border-border-default rounded px-1.5 py-0.5 bg-surface-subtle"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[13px] text-text-muted mb-6">
        Your card is charged securely via Stripe. We never store card numbers.
      </p>

      <div className="rounded-2xl border border-border-default bg-white p-6">
        <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">
          Card information
        </label>
        <div className="rounded-xl border border-border-default bg-surface-subtle px-4 py-3.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="mt-3 text-[11px] text-text-muted flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Secured by Stripe — PCI DSS compliant
        </p>
      </div>
    </div>
  );
}
