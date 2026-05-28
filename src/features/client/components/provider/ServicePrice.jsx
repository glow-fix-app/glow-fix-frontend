export default function ServicePrice({ priceLabel }) {
  if (!priceLabel) return null;

  if (priceLabel === "Free") {
    return <p className="text-right text-[18px] font-semibold text-text-primary">Free</p>;
  }

  const match = priceLabel.match(/^EGP\s+(.+)$/i);
  if (!match) {
    return <p className="text-right text-[18px] font-semibold text-text-primary">{priceLabel}</p>;
  }

  return (
    <div className="text-right leading-none">
      <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">EGP</p>
      <p className="mt-0.5 text-[22px] font-semibold text-text-primary">{match[1]}</p>
    </div>
  );
}
