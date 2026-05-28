import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CheckoutShell({ backLabel, onBack, category, title, children }) {
  return (
    <div className="-mx-4 -mt-6 bg-white pb-16 sm:-mx-6 lg:-mx-8">
      <div className="mx-auto max-w-[1480px] px-6 pt-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          {backLabel}
        </button>

        <div className="mt-5">
          {category ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Booking · {category}
            </p>
          ) : null}
          <h1 className="mt-1 text-[24px] font-semibold text-text-primary">{title}</h1>
        </div>

        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
