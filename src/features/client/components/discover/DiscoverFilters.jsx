const RATING_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 3, label: "3★" },
  { value: 4, label: "4★" },
  { value: 4.5, label: "4.5★" },
];

export default function DiscoverFilters({ filters, onChange, onReset }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Filters
          </p>
          <h3 className="text-[16px] font-bold text-text-primary">Refine</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[12px] font-semibold text-text-tertiary hover:text-text-primary transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Service Type */}
      <div className="mb-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Service
        </p>
        <div className="flex gap-2">
          {["wash", "repair"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                update("serviceType", filters.serviceType === type ? "all" : type)
              }
              className={`flex-1 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition-all ${filters.serviceType === type
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-border-default bg-white text-text-tertiary hover:bg-surface-hover"
                }`}
            >
              {type === "wash" ? "Wash" : "Repair"}
            </button>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Distance
          </p>
          <span className="text-[12px] font-semibold text-text-primary">
            ≤ {filters.maxDistance ?? 50} km
          </span>
        </div>
        <div className="relative mt-2">
          <input
            type="range"
            min="1"
            max="100"
            value={filters.maxDistance ?? 50}
            onChange={(e) => update("maxDistance", Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500 outline-none"
          />
        </div>
      </div>

      {/* Min Rating */}
      <div className="mb-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Min Rating
        </p>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("minRating", opt.value)}
              className={`flex-1 rounded-xl border px-2 py-2 text-[12px] font-semibold transition-all ${(filters.minRating || 0) === opt.value
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-border-default bg-white text-text-tertiary hover:bg-surface-hover"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Availability
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-text-tertiary">Open now</span>
            <button
              type="button"
              onClick={() => update("openNow", !filters.openNow)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${filters.openNow ? "bg-brand-500" : "bg-gray-200"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${filters.openNow ? "translate-x-4" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-auto rounded-xl bg-surface-hover p-4 ring-1 ring-black/5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
          Prepaid
        </p>
        <p className="text-[12px] leading-relaxed text-text-tertiary">
          All bookings are securely <strong className="text-text-primary">prepaid online</strong>. No extra charges or hidden fees are paid at the branch.
        </p>
      </div>
    </div>
  );
}
