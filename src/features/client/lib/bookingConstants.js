export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PAID: "paid",
  VEHICLE_RECEIVED: "vehicle_received",
  IN_PROGRESS: "in_progress",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DIAGNOSTIC_READY: "diagnostic_ready",
};

export const BOOKING_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "paid", label: "Paid" },
  { key: "vehicle_received", label: "Vehicle Received" },
  { key: "in_progress", label: "In Progress" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
];

export function getStepIndex(status) {
  const s = String(status).toLowerCase();
  const idx = BOOKING_STEPS.findIndex((step) => step.key === s);
  if (idx >= 0) return idx;
  if (s === "diagnostic_ready") return 3;
  return 0;
}
