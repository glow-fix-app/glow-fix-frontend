import { useNavigate } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import { ROUTE_PATHS } from "@/routes/paths";

export default function BookingPaymentBanner({ view }) {
  const navigate = useNavigate();
  if (!view.needsPayment) return null;

  return (
    <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-white rounded-3xl border border-brand-50 shadow-sm relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h2 className="text-[16px] font-bold text-text-primary">Booking accepted by provider</h2>
            <p className="text-[13px] font-medium text-text-tertiary">
              {view.providerName ?? "Your provider"} has accepted your request.
              {view.deliveryLabel && (
                <>
                  {" "}
                  Delivery: <span className="font-semibold text-blue-600">{view.deliveryLabel}</span>
                </>
              )}
            </p>
            <p className="text-[12px] font-medium text-text-tertiary">
              Complete payment to secure your appointment.
            </p>
          </div>
        </div>
        <Button
          onPress={() => navigate(ROUTE_PATHS.BOOKING_PAY(view.bookingId))}
          className="w-full md:w-auto font-bold px-6 bg-success hover:bg-success/90 text-white shrink-0"
        >
          Pay now
        </Button>
      </div>
    </Card>
  );
}
