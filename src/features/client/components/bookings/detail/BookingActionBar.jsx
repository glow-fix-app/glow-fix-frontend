import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { ROUTE_PATHS } from "@/routes/paths";

export default function BookingActionBar({ view, onCancel, isCancelling }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {view.needsPayment && (
        <Button
          onPress={() => navigate(ROUTE_PATHS.BOOKING_PAY(view.bookingId))}
          className="font-semibold px-6 bg-success hover:bg-success/90 text-white"
          radius="full"
        >
          Pay now
        </Button>
      )}

      {view.hasPaidPayment && view.paidPaymentId ? (
        <Button
          onPress={() => navigate(ROUTE_PATHS.PAYMENT_RECEIPT(view.paidPaymentId))}
          variant="outline"
          className="font-semibold px-6"
          radius="full"
        >
          View receipt
        </Button>
      ) : (
        <Button isDisabled variant="outline" className="font-semibold px-6" radius="full">
          View receipt
        </Button>
      )}

      {view.isCancellable && !view.isCancelled && (
        <Button
          variant="danger-soft"
          className="font-semibold px-6"
          radius="full"
          isLoading={isCancelling}
          onPress={onCancel}
        >
          Cancel booking
        </Button>
      )}
    </div>
  );
}
