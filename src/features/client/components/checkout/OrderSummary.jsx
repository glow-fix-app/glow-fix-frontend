import { Card } from "@heroui/react";
import { useFormContext } from "react-hook-form";
import { formatDateLabel, formatPrice } from "@/store/slices/checkoutSlice";

export default function OrderSummary({ services, className = "" }) {
  const { watch } = useFormContext();
  const selectedDate = watch("selectedDate");
  const selectedTime = watch("selectedTime");
  const total = services.reduce((acc, s) => acc + (Number(s.price) || 0), 0);

  return (
    <div className={className}>
      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-black/[0.06] rounded-2xl">
        <div className="bg-surface-hover px-6 py-5 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-text-primary">Order Summary</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {services.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4">
                <span className="text-[14px] text-text-tertiary">{s.name}</span>
                <span className="text-[14px] font-medium text-text-primary whitespace-nowrap">
                  {formatPrice(s.price)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-dashed border-border-default pt-6">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-text-primary">Total</span>
              <span className="text-[18px] font-bold text-text-primary">{formatPrice(total)}</span>
            </div>
            {(selectedDate || selectedTime) && (
              <p className="mt-2 text-right text-[12px] font-medium text-text-tertiary">
                {selectedDate ? formatDateLabel(selectedDate) : ""}
                {selectedDate && selectedTime ? " · " : ""}
                {selectedTime}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
