import { ArrowUpRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import ServicePrice from "./ServicePrice";

export default function ServiceCard({ service, index, total, onBook, selectedServices, onToggle }) {
  const indexLabel = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const isSelected = selectedServices?.some((s) => s.id === service.id);

  return (
    <article 
      onClick={() => onToggle?.(service)}
      className={`grid grid-cols-1 gap-4 border-b border-gray-200 py-6 last:border-b-0 sm:grid-cols-[80px_1fr_auto] sm:items-center sm:gap-6 cursor-pointer transition-all duration-300 ${isSelected ? 'bg-brand-500/5 -mx-5 px-5 sm:-mx-6 sm:px-6' : 'hover:bg-slate-50/50'}`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <input
          type="checkbox"
          checked={isSelected || false}
          onChange={() => onToggle?.(service)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-border-default text-brand-500 focus:ring-brand-500/20 cursor-pointer"
        />
        <p className="text-[11px] font-medium tracking-wide text-text-muted">
          {indexLabel}
        </p>
      </div>

      <div className="min-w-0">
        <h4 className="text-[16px] font-semibold text-text-primary">{service.name}</h4>
        {service.description && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
            {service.description}
          </p>
        )}
        {service.durationLabel && (
          <p className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {service.durationLabel}
          </p>
        )}
      </div>

      <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start sm:gap-3 sm:pt-0">
        <ServicePrice priceLabel={service.priceLabel} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBook?.(service);
          }}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand-500 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Book this
          <ArrowUpRightIcon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
