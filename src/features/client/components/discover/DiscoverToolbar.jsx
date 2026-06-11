import { MapIcon, ListBulletIcon } from "@heroicons/react/24/solid";
import DiscoverSearchBar from "@/features/client/components/discover/DiscoverSearchBar";

const LAYOUT_TABS = [
  { id: "map", label: "Map", icon: MapIcon },
  { id: "list", label: "List", icon: ListBulletIcon },
];

export default function DiscoverToolbar({
  filters,
  sort,
  layout,
  showFilters,
  onSearchChange,
  onLayoutChange,
  onToggleFilters,
  locations,
  locationId,
  onLocationChange,
  isLocating,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center shrink-0">
      <div className="flex-1">
        <DiscoverSearchBar
          search={filters.search}
          onSearchChange={onSearchChange}
          locations={locations}
          locationId={locationId}
          onLocationChange={onLocationChange}
          isLocating={isLocating}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`flex h-11 items-center gap-2 rounded-xl border border-border-default bg-white px-4 text-[13px] font-semibold text-text-tertiary transition-all hover:bg-surface-hover ${
            showFilters ? "border-brand-500/30 bg-blue-50/10" : ""
          }`}
          onClick={onToggleFilters}
        >
          <svg
            className={`h-4 w-4 transition-all ${
              showFilters ? "text-brand-500 scale-110" : "text-text-tertiary"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
          <span className={showFilters ? "text-brand-500" : ""}>Filters</span>
        </button>

        <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-white p-1 h-11">
          {LAYOUT_TABS.map((tab) => {
            const isActive = layout === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onLayoutChange(tab.id)}
                className={`flex h-9 items-center gap-1.5 rounded-lg px-4 text-[12px] font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-800 hover:bg-gray-50/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
