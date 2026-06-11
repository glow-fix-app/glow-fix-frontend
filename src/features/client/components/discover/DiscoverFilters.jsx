const RATING_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 3, label: "3★" },
  { value: 4, label: "4★" },
  { value: 4.5, label: "4.5★" },
];

export default function DiscoverFilters({ filters, onChange, onReset, categories = [] }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function toggleCategory(categoryName) {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryName)
      ? currentCategories.filter(n => n !== categoryName)
      : [...currentCategories, categoryName];
    update("categories", newCategories);
  }

  // Ensure "all" is not shown in the list since we use checkboxes
  const categoryItems = categories.filter(c => c.id !== "all");

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

      {/* Categories */}
      {categoryItems.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Categories
          </p>
          <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {categoryItems.map((cat) => {
              const isSelected = (filters.categories || []).includes(cat.name || cat.label);
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => toggleCategory(cat.name || cat.label)}
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    isSelected 
                      ? "bg-brand-500 border-brand-500 text-white" 
                      : "border-gray-300 bg-white group-hover:border-brand-500"
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[13px] font-medium transition-colors ${
                    isSelected ? "text-text-primary" : "text-text-tertiary group-hover:text-text-primary"
                  }`}>
                    {cat.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

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
