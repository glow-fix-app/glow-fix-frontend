import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ListBox, Select } from "@heroui/react";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest Rated" },
  { value: "distance", label: "Nearest" },
];

export default function DiscoverSearchBar({
  search,
  onSearchChange,
  searchType,
  onSearchTypeChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          aria-label="Search providers"
          placeholder={
            searchType === "area"
              ? "Search by area (e.g., Zamalek, Maadi)..."
              : "Search by provider name..."
          }
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-12 w-full rounded-xl border border-border-default bg-white pl-11 pr-24 text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        {/* Search type dropdown in place of "Near you" */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Select
            aria-label="Search type"
            selectedKey={searchType}
            onSelectionChange={(key) => onSearchTypeChange(key)}
            className="w-24"
          >
            <Select.Trigger className="h-8 min-h-0 flex items-center justify-between bg-gray-100 hover:bg-gray-200 border-none shadow-none px-2.5 rounded-lg data-[focus=true]:outline-none data-[focus=true]:ring-0">
              <Select.Value className="text-[11px] font-semibold text-text-tertiary" />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="rounded-lg">
              <ListBox>
                <ListBox.Item id="provider" textValue="Provider" className="text-[12px] font-medium rounded-md">
                  Provider
                </ListBox.Item>
                <ListBox.Item id="area" textValue="Area" className="text-[12px] font-medium rounded-md">
                  Area
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {/* Sort */}
      <div className="w-full sm:w-[200px] shrink-0">
        <Select
          aria-label="Sort providers"
          selectedKey={sort}
          onSelectionChange={(key) => onSortChange(key)}
          className="w-full"
        >
          <Select.Trigger className="h-12 flex items-center justify-between bg-white border border-border-default rounded-xl px-4 hover:border-brand-500 transition-colors shadow-none data-[focus=true]:border-brand-500 data-[focus=true]:ring-2 data-[focus=true]:ring-brand-500/20">
            <Select.Value className="text-[13px] font-semibold text-text-tertiary" />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="rounded-lg">
            <ListBox>
              {SORT_OPTIONS.map((opt) => (
                <ListBox.Item id={opt.value} key={opt.value} textValue={opt.label} className="text-[13px] font-medium text-text-tertiary rounded-md">
                  Sort · {opt.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </div>
  );
}
