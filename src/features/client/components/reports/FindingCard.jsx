// ─── Reusable: Finding Card ─────────────────────────────────────────────────────
// Displays a single diagnostic finding with priority badge

const PRIORITY_STYLES = {
  CRITICAL: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    icon: "text-red-500",
    dot: "bg-red-500",
  },
  WARNING: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: "text-amber-500",
    dot: "bg-amber-500",
  },
  INFO: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    icon: "text-blue-500",
    dot: "bg-blue-500",
  },
  OK: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "text-emerald-500",
    dot: "bg-emerald-500",
  },
};

export default function FindingCard({ finding, isLast }) {
  const priority = (finding.priority || "INFO").toUpperCase();
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.INFO;

  const renderIcon = () => {
    if (priority === "CRITICAL") {
      return (
        <svg className={`w-5 h-5 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (priority === "WARNING") {
      return (
        <svg className={`w-5 h-5 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return (
      <svg className={`w-5 h-5 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className={`p-5 flex items-start gap-4 ${!isLast ? 'border-b border-gray-100' : ''} bg-white`}>
      {/* Icon circle */}
      <div className={`h-10 w-10 rounded-full ${style.bg} flex items-center justify-center shrink-0`}>
        {renderIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-[15px] text-text-primary mb-0.5">
          {finding.title}
        </h4>
        <p className="text-[14px] text-text-tertiary leading-relaxed">
          {finding.description}
        </p>
      </div>

      {/* Priority badge on the right */}
      <span className={`inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-widest ${style.badge}`}>
        {priority}
      </span>
    </div>
  );
}
