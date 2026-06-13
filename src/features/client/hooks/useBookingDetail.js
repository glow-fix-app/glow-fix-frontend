import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { getStepIndex } from "@/features/client/lib/bookingConstants";
import { formatDateTime } from "@/features/client/utils/formatters";

const PAID = "PAID";
const VISIBLE_SERVICES = 4;

function vehicleLabel(vehicle) {
  if (!vehicle) return null;
  const label = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  return label || null;
}

function serviceLinesFromItems(items = []) {
  // Handle both new backend shape (items[].serviceTitle) and old shape (booking_items[].service_name)
  return items
    .map((it) => ({
      id: it.id || `${it.businessServiceId || it.service_id || it.title}`,
      title: it.serviceTitle || it.service_name || it.title || it.name || "Service",
      price: Number(it.price) || 0,
    }))
    .filter((line) => line.title);
}

function chatMessagesFromBooking(booking) {
  const raw = booking?.messages ?? booking?.chat_messages ?? booking?.conversation?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return raw.map((m) => {
    const role = String(m.sender_role ?? m.sender_type ?? m.role ?? "").toLowerCase();
    let type = m.type;
    if (!type) {
      if (role === "client" || role === "user") type = "sent";
      else if (role === "system") type = "system";
      else type = "received";
    }
    return {
      id: String(m.id),
      type,
      text: m.text ?? m.body ?? m.content ?? "",
      time:
        m.time_label ??
        (m.created_at
          ? new Date(m.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""),
    };
  });
}

/** Derived UI state for booking detail — lives in the hook, not a separate lib file. */
function buildBookingDetailView(booking, bookingId) {
  // Backend returns status in UPPER_SNAKE_CASE (PENDING, CONFIRMED, etc.)
  const statusRaw = booking?.status ?? "PENDING";
  const status = String(statusRaw).toLowerCase();

  // New backend: payment is a single object (not an array), diagnostic reports TBD
  const payment = booking?.payment ?? null;
  // items is the backend field name (new); fall back to booking_items (legacy)
  const bookingItems = booking?.items ?? booking?.booking_items ?? [];
  const diagnosticReport = booking?.diagnostic_report ?? null;
  const diagnosticReports = diagnosticReport ? [diagnosticReport] : (booking?.diagnostic_reports ?? []);

  const isPaid = payment?.status === PAID || String(payment?.status ?? "").toUpperCase() === PAID;
  const deliveryAt = booking?.expected_delivery_at || booking?.ready_at || booking?.completed_at;

  // Support both new backend (b.business.businessName) and old (b.branch.business_name)
  const business = booking?.business ?? booking?.branch ?? {};
  const providerName = business.businessName ?? business.business_name ?? null;
  const address = business.address ?? null;
  const providerUserId = business.managerId ?? null;

  return {
    bookingId,
    status,
    stepIndex: getStepIndex(status),
    providerName,
    providerUserId,
    bookingCode: booking?.id ?? bookingId,
    address,
    vehicleLabel: vehicleLabel(booking?.vehicle),
    scheduledLabel: formatDateTime(booking?.scheduled_at) || null,
    deliveryLabel: deliveryAt ? formatDateTime(deliveryAt) : null,
    // New backend uses a single `note` string; old used a `notes` string
    notes: (booking?.note ?? booking?.notes ?? "").trim() || null,
    serviceLines: serviceLinesFromItems(bookingItems),
    visibleServiceLimit: VISIBLE_SERVICES,
    diagnosticReports,
    primaryReport: diagnosticReports[0] ?? null,
    hasDiagnosticReport: diagnosticReports.length > 0,
    hasPaidPayment: isPaid,
    paidPaymentId: isPaid ? payment?.id : null,
    needsPayment: status === "confirmed" && !isPaid,
    isCancellable: status === "confirmed" || status === "pending",
    isCancelled: status === "cancelled" || status === "rejected",
    cancellationReason: booking?.cancellation_reason || null,
    rejectionReason: booking?.rejection_reason || null,
    totalFormatted: booking?.total_price,
    chatMessages: chatMessagesFromBooking(booking),
  };
}

export function useBookingDetail(bookingId) {
  const queryClient = useQueryClient();

  const bookingQuery = useQuery({
    queryKey: [...queryKeys.bookings, bookingId],
    queryFn: () => clientApi.bookingDetails(bookingId),
    enabled: Boolean(bookingId),
  });

  const view = useMemo(
    () => (bookingQuery.data ? buildBookingDetailView(bookingQuery.data, bookingId) : null),
    [bookingQuery.data, bookingId]
  );

  const cancelMutation = useMutation({
    mutationFn: () => clientApi.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });

  return {
    booking: bookingQuery.data,
    view,
    isLoading: bookingQuery.isLoading,
    error: bookingQuery.error,
    cancelMutation,
  };
}
