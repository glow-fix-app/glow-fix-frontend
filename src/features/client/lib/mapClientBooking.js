/**
 * Maps API booking records to UI list shape.
 */

/**
 * @typedef {ReturnType<typeof mapClientBooking>} ClientBooking
 */

export function getTabForStatus(status) {
  const s = String(status).toLowerCase();
  if (s === "completed") return "past";
  if (s === "cancelled") return "cancelled";
  return "upcoming";
}

export function mapClientBooking(b) {
  return {
    id: b.id,
    providerName: b.branch?.business_name || "Unknown Provider",
    providerInitials: (b.branch?.business_name || "U").substring(0, 2).toUpperCase(),
    providerColor: "#f4f4f5",
    providerInitialsColor: "#18181b",
    serviceName: b.booking_code || "Service Appointment",
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
    status: String(b.status || "pending").toLowerCase(),
    tab: getTabForStatus(b.status),
    address: b.branch?.address || "No address provided",
    price: b.total_price || 0,
    vehicle: b.vehicle ? `${b.vehicle.year} ${b.vehicle.model}` : "No vehicle",
    notes: b.notes || "",
    rawDate: b.scheduled_at,
  };
}
