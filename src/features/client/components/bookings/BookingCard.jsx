import { Button, Card } from "@heroui/react";
import { BOOKING_STATUS } from "@/features/client/lib/bookingConstants";
import { formatDateTime } from "@/features/client/utils/formatters";

/**
 * A single booking list item card.
 *
 * @param {{
 *   booking: import("@/features/client/lib/mapClientBooking").ClientBooking,
 *   onViewDetails: (id: string) => void,
 *   onCancel?: (id: string) => void,
 *   onReviewReport?: (id: string) => void,
 * }} props
 */
export default function BookingCard({
  booking,
  onViewDetails,
  onCancel,
  onReviewReport,
  isCancelling,
}) {
  const isUpcoming =
    booking.status === BOOKING_STATUS.ACCEPTED ||
    booking.status === BOOKING_STATUS.CONFIRMED ||
    booking.status === BOOKING_STATUS.IN_PROGRESS ||
    booking.status === BOOKING_STATUS.DIAGNOSTIC_READY;

  // Extract initials
  const initials = booking.providerName
    ? booking.providerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "SC";

  const statusStyles = (() => {
    const s = String(booking.status).toLowerCase();
    if (s === "confirmed" || s === "paid" || s === "completed") {
      return { text: "text-brand-500", bg: "bg-brand-500" };
    }
    if (s === "pending" || s === "accepted") {
      return { text: "text-warning", bg: "bg-warning" };
    }
    return { text: "text-text-muted", bg: "bg-text-muted" };
  })();

  const dateTimeLabel = booking.rawDate
    ? formatDateTime(booking.rawDate, { uppercase: true })
    : `${booking.date} · ${booking.time}`;

  return (
    <Card className="rounded-[20px] border border-gray-200 bg-white shadow-none ring-0 p-5 sm:p-6 overflow-hidden">
      {/* ── Top Layout: Avatar + Info Column + Status ───────────────────────── */}
      <div className="flex items-start gap-4 w-full">
        {/* Left Circular Avatar with soft green theme */}
        <div className="h-12 w-12 sm:h-[52px] sm:w-[52px] rounded-full bg-success/10 text-success/80 flex items-center justify-center text-[15px] font-bold shrink-0">
          {initials}
        </div>

        {/* Right Info Column */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3 w-full">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h3 className="text-[16px] sm:text-[17px] font-semibold text-text-primary truncate leading-tight">
                {booking.providerName}
              </h3>
              {booking.serviceName && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-text-tertiary tracking-wide shrink-0">
                  {booking.serviceName}
                </span>
              )}
            </div>

            {/* Custom dot status match */}
            <div className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider shrink-0 uppercase ${statusStyles.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusStyles.bg}`} />
              {booking.status}
            </div>
          </div>

          {/* Combined Metadata Row: Address & Date inline without icons */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 text-[13px] text-text-tertiary">
            <span className="truncate max-w-[200px] sm:max-w-[260px]">{booking.address}</span>
            <span className="text-text-muted font-semibold">•</span>
            <span className="font-semibold text-text-tertiary">{dateTimeLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Dashed Divider ─────────────────────────────────────────────────── */}
      <div className="border-t border-dashed border-gray-200 my-4 w-full" />

      {/* ── Bottom row: Left-aligned buttons ─────────────────────────────────── */}
      <div className="flex items-center gap-3 w-full justify-start">
        {/* View details with top-right arrow icon */}
        <Button
          size="sm"
          className="h-9 rounded-full bg-brand-500 text-white px-5 text-[13px] font-semibold flex items-center gap-1 hover:bg-brand-600"
          onPress={() => onViewDetails(booking.id)}
        >
          View details
          <span className="text-[12px] font-normal">↗</span>
        </Button>

        {/* Cancel button if confirmed, accepted, or pending and upcoming */}
        {isUpcoming && onCancel && (booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.ACCEPTED) && (
          <Button
            size="sm"
            className="h-9 rounded-full bg-white border border-gray-200 text-text-tertiary px-5 text-[13px] font-semibold hover:bg-gray-50 transition-colors"
            onPress={() => onCancel(booking.id)}
            isLoading={isCancelling}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}
