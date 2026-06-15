import { SearchField } from "@heroui/react";
import { MapPinIcon, TagIcon } from "@heroicons/react/24/outline";
import FilterDropdown from "./FilterDropdown";

export default function ServiceSearchToolbar({
  locations = [],
  locationId,
  onLocationChange,
  isLocating = false,
  searchValue,
  onSearchChange,
  categories = [],
  categoryId,
  onCategoryChange,
}) {
  const categoryItems = [
    { id: "all", label: "All categories" },
    ...categories.filter(c => c.id !== "all"),
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <SearchField
        aria-label="Search services"
        value={searchValue}
        onChange={onSearchChange}
        fullWidth
        className="min-w-0 flex-1"
      >
        <SearchField.Group className="flex w-full items-center h-12 rounded-xl border border-border-default bg-white shadow-none px-3 gap-2 data-[focus-within=true]:border-brand-500 data-[focus-within=true]:ring-2 data-[focus-within=true]:ring-brand-500/20">
          <SearchField.SearchIcon className="text-text-muted shrink-0" />
          <SearchField.Input
            placeholder="Try 'AC repair', 'ceramic wax', 'brake'..."
            className="min-w-0 flex-1 text-[15px] text-text-primary placeholder:text-text-muted outline-none border-none bg-transparent"
          />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <FilterDropdown
        items={categoryItems}
        selectedId={categoryId}
        onChange={onCategoryChange}
        placeholder="Choose category"
        searchPlaceholder="Search category..."
        noItemsText="No categories found"
        icon={TagIcon}
        className="w-full shrink-0 sm:w-[min(100%,220px)] sm:max-w-[220px]"
      />

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
        className="w-full shrink-0 sm:w-[min(100%,220px)] sm:max-w-[220px]"
      />
    </div>
  );
}
