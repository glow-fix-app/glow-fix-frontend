export default function SummaryCard({ label, value, icon: Icon, iconBg = "bg-blue-50", iconColor = "text-blue-500" }) {
  return (
    <article className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-5">
      <div>
        <p className="text-[10px] font-normal uppercase tracking-[0.14em] text-text-muted">
          {label}
        </p>
        <p className="mt-2 text-[26px] font-medium tracking-tight text-text-primary">
          {value}
        </p>
      </div>
      {Icon && (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
        </div>
      )}
    </article>
  );
}
