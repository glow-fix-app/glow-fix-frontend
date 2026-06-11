import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import FilterDropdown from "@/features/client/components/service-search/FilterDropdown";

export default function DiscoverSearchBar({
  search,
  onSearchChange,
  locations = [],
  locationId,
  onLocationChange,
  isLocating,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          aria-label="Search providers"
          placeholder="Search by provider name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-12 w-full rounded-xl border border-border-default bg-white pl-11 pr-4 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {/* Location */}
      <FilterDropdown
        items={locations}
        selectedId={locationId}
        onChange={onLocationChange}
        isLoading={isLocating}
        loadingText="Finding you..."
        placeholder="Choose location"
        searchPlaceholder="Search city or address..."
        noItemsText="No locations found"
        icon={MapPinIcon}
        className="w-full shrink-0 sm:w-[min(100%,220px)] sm:max-w-[220px] h-12"
      />
    </div>
  );
}
