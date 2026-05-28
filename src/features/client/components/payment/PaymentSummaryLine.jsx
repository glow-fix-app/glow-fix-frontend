export default function PaymentSummaryLine({ label, value, isDiscount = false, isBold = false }) {
  return (
    <div
      className={`flex items-center justify-between py-1 ${isBold ? "text-[14px] font-semibold" : "text-[13.5px]"}`}
    >
      <span className="text-text-tertiary">{label}</span>
      <span className={`font-semibold ${isDiscount ? "text-emerald-600" : "text-text-primary"}`}>
        {isDiscount ? `− ${value}` : value}
      </span>
    </div>
  );
}
