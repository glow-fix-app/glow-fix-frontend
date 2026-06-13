/**
 * Maps API booking records (BookingResponseDto) to UI list shape.
 *
 * Backend shape (BookingResponseDto):
 *  { id, business: { businessName, address }, vehicle: { year, model, licensePlate },
 *    scheduled_at, status (uppercase), total_price, note, items[], status_history[] }
 */

/**
 * @typedef {ReturnType<typeof mapClientBooking>} ClientBooking
 */

export function getTabForStatus(status) {
  const s = String(status).toLowerCase();
  if (s === "completed") return "past";
  if (s === "cancelled" || s === "rejected") return "cancelled";
  return "upcoming";
}

export function mapClientBooking(b) {
  // Backend returns status in UPPER_SNAKE_CASE (e.g. "PENDING", "CONFIRMED")
  const statusRaw = b.status ?? b.statusHistory?.[b.statusHistory.length - 1]?.status ?? "PENDING";
  const status = String(statusRaw).toLowerCase();

  // Support both new backend shape (b.business) and old shape (b.branch)
  const business = b.business ?? b.branch ?? {};
  const businessName = business.businessName ?? business.business_name ?? "Unknown Provider";
  const address = business.address ?? "No address provided";

  const vehicle = b.vehicle ?? {};
  const vehicleLabel = [vehicle.year, vehicle.model].filter(Boolean).join(" ") || vehicle.licensePlate || "No vehicle";

  return {
    id: b.id,
    providerName: businessName,
    providerInitials: businessName.substring(0, 2).toUpperCase(),
    providerColor: "#f4f4f5",
    providerInitialsColor: "#18181b",
    serviceName:
      b.items?.[0]?.serviceTitle ??
      b.booking_items?.[0]?.service_name ??
      b.booking_code ??
      "Service Appointment",
    date: b.scheduled_at
      ? new Date(b.scheduled_at)
          .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
          .toUpperCase()
      : "TBD",
    time: b.scheduled_at
      ? new Date(b.scheduled_at).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    status,
    tab: getTabForStatus(statusRaw),
    address,
    price: Number(b.total_price ?? b.totalPrice ?? 0),
    vehicle: vehicleLabel,
    notes: b.note ?? b.notes ?? "",
    rawDate: b.scheduled_at,
  };
}

