import CardInput from "@/features/client/components/payment/CardInput";

export default function PaymentCardForm({ cardForm }) {
  const {
    cardNumber,
    cardName,
    expiry,
    cvc,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvcChange,
    setCardName,
  } = cardForm;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[20px] font-semibold text-text-primary">Card details</h2>
      </div>
      <p className="text-[13px] text-text-muted mb-6">
        Card details are used for this payment only and are not saved.
      </p>

      <div className="rounded-2xl border border-border-default bg-white p-6 space-y-5">
        <CardInput
          label="Card Number"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={handleCardNumberChange}
          mono
        />
        <CardInput
          label="Name on Card"
          placeholder="Full name"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <CardInput
            label="Expiry"
            placeholder="MM / YY"
            value={expiry}
            onChange={handleExpiryChange}
            mono
          />
          <CardInput
            label="CVC"
            placeholder="•••"
            value={cvc}
            onChange={handleCvcChange}
            type="password"
            mono
          />
        </div>
      </div>
    </div>
  );
}
