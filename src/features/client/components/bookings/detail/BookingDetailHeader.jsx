import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button, Separator } from "@heroui/react";

export default function BookingDetailHeader({ view, onBack }) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="light"
          onPress={onBack}
          className="h-auto min-w-0 gap-2 px-0 text-[13px] font-semibold text-text-tertiary bg-transparent data-[hover=true]:text-text-primary data-[hover=true]:bg-transparent"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Bookings
        </Button>
        <span className="text-[13px] font-semibold text-text-tertiary">
          Booking · {view.bookingCode}
        </span>
      </div>

      <div className="mb-2">
        <h1 className="text-[18px] sm:text-[20px] font-bold text-text-primary">
          With <span className="text-brand-500">{view.providerName ?? "—"}</span>
        </h1>
        <div className="mt-1 flex items-center justify-between text-[14px] text-text-tertiary">
          <span>{view.scheduledLabel ?? "—"}</span>
          {view.vehicleLabel && (
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path
                  d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A2 2 0 002 11.7V16c0 .6.4 1 1 1h2m14 0a2 2 0 11-4 0 2 2 0 014 0zM7 17a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{view.vehicleLabel}</span>
            </div>
          )}
        </div>
      </div>
      <Separator className="bg-gray-200 mb-8" />
    </>
  );
}
