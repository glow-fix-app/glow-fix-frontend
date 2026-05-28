import { InputOTP } from "@heroui/react";

export function OtpInput({ value, onChange, error }) {
  const slotClass = [
    "h-14 w-12 bg-transparent text-xl shadow-none ring-0",
    "border data-[focus=true]:ring-0",
    error
      ? "border-red-400 data-[focus=true]:border-red-500"
      : "border-border-form data-[focus=true]:border-brand-600",
  ].join(" ");

  return (
    <div className="flex flex-col items-center gap-4">
      <InputOTP maxLength={6} value={value} onChange={onChange}>
        <InputOTP.Group>
          <InputOTP.Slot index={0} className={slotClass} />
          <InputOTP.Slot index={1} className={slotClass} />
          <InputOTP.Slot index={2} className={slotClass} />
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group>
          <InputOTP.Slot index={3} className={slotClass} />
          <InputOTP.Slot index={4} className={slotClass} />
          <InputOTP.Slot index={5} className={slotClass} />
        </InputOTP.Group>
      </InputOTP>
      {error ? (
        <span className="text-xs text-red-500">{error}</span>
      ) : null}
    </div>
  );
}
