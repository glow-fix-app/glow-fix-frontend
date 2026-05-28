import { Button } from "@heroui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/store/slices/checkoutSlice";

export default function BookingSuccess({ booking, onGoToBookings }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-text-primary">Booking Confirmed!</h2>
      <p className="mt-2 text-[14px] text-text-tertiary">
        Your booking{" "}
        <span className="font-semibold text-text-primary">{booking.bookingCode}</span> has been submitted
        at <span className="font-semibold text-text-primary">{booking.providerName}</span>.
      </p>
      <p className="mt-1 text-[13px] text-text-muted">Total: {formatPrice(booking.totalPrice)}</p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button
          className="h-11 rounded-full bg-brand-500 px-6 text-[13px] font-semibold text-white hover:bg-brand-600"
          onPress={onGoToBookings}
        >
          View my bookings
        </Button>
      </div>
    </div>
  );
}
