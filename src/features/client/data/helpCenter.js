export const HELP_CATEGORIES = [
  { id: "bookings", label: "Bookings", keywords: ["booking", "cancel", "schedule", "appointment"] },
  { id: "payments", label: "Payments", keywords: ["payment", "charge", "billing", "invoice"] },
  { id: "providers", label: "Providers", keywords: ["provider", "technician", "mechanic"] },
  { id: "account", label: "Account & Security", keywords: ["account", "password", "security", "profile"] },
  { id: "disputes", label: "Disputes & Refunds", keywords: ["dispute", "refund", "complaint"] },
  { id: "technical", label: "Technical Issues", keywords: ["technical", "app", "bug", "error"] },
];

export const HELP_FAQS = [
  {
    id: "diagnostic",
    question: "How does the diagnostic check work?",
    answer:
      "The provider inspects your car and submits a structured report through the app. You review it and decide whether to proceed with the recommended repairs — no charge until you approve.",
    categories: ["bookings", "providers"],
  },
  {
    id: "charges",
    question: "When am I charged for a service?",
    answer:
      "You are only charged after you approve a diagnostic report or confirm a fixed-price service at checkout. Pending bookings do not charge your card until the work is authorized.",
    categories: ["payments", "bookings"],
  },
  {
    id: "cancel",
    question: "How do I cancel a booking?",
    answer:
      "Open Bookings, select the appointment, and choose Cancel. Free cancellation is available up to 24 hours before the scheduled time; later cancellations may incur a fee depending on the provider policy.",
    categories: ["bookings"],
  },
  {
    id: "reviews",
    question: "Can I leave a review for any booking?",
    answer:
      "Yes. After a completed booking, you will receive a prompt to rate the provider and leave a written review. Reviews help other clients choose trusted professionals.",
    categories: ["bookings", "providers"],
  },
];
