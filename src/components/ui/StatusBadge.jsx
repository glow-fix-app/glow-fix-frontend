/**
 * Reusable, premium status badge used across the entire app.
 * Written in pure Tailwind CSS to avoid component library compilation issues
 * and ensure beautiful, consistent branding.
 *
 * @param {{ status: string }} props
 */
export default function StatusBadge({ status }) {
  const s = String(status || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  // Color mapping config
  const configs = {
    active: {
      label: "Active",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-emerald-500",
    },
    inactive: {
      label: "Inactive",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-gray-400",
    },
    // Business statuses
    pending_review: {
      label: "Pending Review",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-amber-500 animate-pulse",
    },
    approved: {
      label: "Approved",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-blue-500",
    },
    suspended: {
      label: "Suspended",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-rose-500",
    },
    rejected: {
      label: "Rejected",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-rose-500",
    },
    // Booking statuses
    confirmed: {
      label: "Confirmed",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-blue-500",
    },
    pending: {
      label: "Pending",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-amber-500",
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-amber-500 animate-pulse",
    },
    diagnostic_ready: {
      label: "Diagnostic Ready",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-amber-500 animate-pulse",
    },
    completed: {
      label: "Completed",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-emerald-500",
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-rose-500",
    },
    // Billing / Payment statuses
    paid: {
      label: "Paid",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-emerald-500",
    },
    partial: {
      label: "Partial",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-blue-500",
    },
    refunded: {
      label: "Refunded",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-rose-500",
    },
    on_leave: {
      label: "On Leave",
      bg: "bg-transparent",
      text: "text-text-secondary",
      dot: "bg-amber-500",
    },
  };

  const cfg = configs[s] || {
    label: status,
    bg: "bg-transparent",
    text: "text-text-secondary",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize tracking-wide transition-all ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <span>{cfg.label}</span>
    </span>
  );
}
