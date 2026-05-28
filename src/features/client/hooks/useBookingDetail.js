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

function serviceLinesFromItems(bookingItems = []) {
  return bookingItems
    .map((it) => ({
      id: it.id || `${it.service_id || it.title}`,
      title: it.service_name || it.title || it.name || "Service",
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
  const status = String(booking?.status ?? "pending").toLowerCase();
  const payments = booking?.payments ?? [];
  const bookingItems = booking?.booking_items ?? [];
  const diagnosticReports = booking?.diagnostic_reports ?? [];
  const paidPayment = payments.find((p) => p.status === PAID);
  const deliveryAt = booking?.ready_at || booking?.completed_at || booking?.delivery_date;

  return {
    bookingId,
    status,
    stepIndex: getStepIndex(status),
    providerName: booking?.branch?.business_name ?? null,
    bookingCode: booking?.booking_code ?? booking?.id ?? bookingId,
    address: booking?.branch?.address ?? null,
    vehicleLabel: vehicleLabel(booking?.vehicle),
    scheduledLabel: formatDateTime(booking?.scheduled_at) || null,
    deliveryLabel: deliveryAt ? formatDateTime(deliveryAt) : null,
    notes: booking?.notes?.trim() || null,
    serviceLines: serviceLinesFromItems(bookingItems),
    visibleServiceLimit: VISIBLE_SERVICES,
    diagnosticReports,
    primaryReport: diagnosticReports[0] ?? null,
    hasDiagnosticReport: diagnosticReports.length > 0,
    hasPaidPayment: Boolean(paidPayment),
    paidPaymentId: paidPayment?.id ?? null,
    needsPayment: status === "confirmed" && !paidPayment,
    isCancellable: status === "confirmed" || status === "pending",
    isCancelled: status === "cancelled",
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
