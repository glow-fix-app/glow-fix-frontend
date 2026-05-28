import { formatEgp } from "@/features/client/utils/formatters";

export default function LoyaltyPointsCard({
  pointsToUse,
  totalPoints,
  discountAmount,
  egpPerPoint,
  checked,
  onChange,
  disabled,
}) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      className={`rounded-2xl border-2 p-4 transition-all cursor-pointer ${
        checked
          ? "border-brand-500 bg-blue-50/40"
          : "border-border-default bg-white hover:border-gray-400"
      } ${disabled ? "opacity-40 pointer-events-none" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
            checked ? "bg-brand-500 border-brand-500" : "border-gray-300 bg-white"
          }`}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <div className="h-9 w-9 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-text-primary">
            Use {pointsToUse.toLocaleString()} points (− {formatEgp(discountAmount)})
          </p>
          <p className="text-[12px] text-text-tertiary mt-0.5">
            Balance: {totalPoints.toLocaleString()} pts · 1 pt = EGP{" "}
            {egpPerPoint.toLocaleString("en-EG", { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
