import { useMemo, useState } from "react";
import {
  Autocomplete,
  Label,
  ListBox,
  SearchField,
  Spinner,
} from "@heroui/react";

function defaultMatchItem(item, query) {
  if (!query) return true;
  const haystack = (item.searchText || item.label || "").toLowerCase();
  return haystack.includes(query);
}

export default function FilterDropdown({
  items = [],
  selectedId,
  onChange,
  isLoading = false,
  loadingText = "Loading...",
  placeholder = "Select...",
  icon: Icon,
  searchPlaceholder = "Search...",
  noItemsText = "No items found",
  matchItem = defaultMatchItem,
  className = "w-full shrink-0 sm:w-[min(100%,280px)] sm:max-w-[280px]",
}) {
  const [filterText, setFilterText] = useState("");

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId),
    [items, selectedId]
  );

  const filteredItems = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return items.filter((item) => matchItem(item, q));
  }, [items, filterText, matchItem]);

  const handleSelection = (key) => {
    if (!key) return;
    onChange(String(key));
    setFilterText("");
  };

  const handleSearchChange = (value) => {
    setFilterText(typeof value === "string" ? value : "");
  };

  return (
    <Autocomplete
      aria-label={placeholder}
      items={items}
      selectedKey={selectedId}
      onSelectionChange={handleSelection}
      isDisabled={isLoading}
      className={className}
    >
      <Label className="sr-only">{placeholder}</Label>
      <Autocomplete.Trigger className="flex h-12 items-center gap-2 rounded-xl border border-border-default bg-white px-3 shadow-none data-[focus-within=true]:border-brand-500 data-[focus-within=true]:ring-2 data-[focus-within=true]:ring-brand-500/20">
        {isLoading ? (
          <Spinner size="sm" color="primary" className="shrink-0" />
        ) : Icon ? (
          <Icon className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />
        ) : null}
        <span className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold text-text-primary">
          {isLoading ? loadingText : selected?.label || placeholder}
        </span>
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover className="w-[var(--trigger-width)] rounded-xl">
        <Autocomplete.Filter>
          <SearchField
            aria-label={searchPlaceholder}
            value={filterText}
            onChange={handleSearchChange}
            className="p-2"
          >
            <SearchField.Group className="rounded-lg border border-border-default bg-surface-hover px-1">
              <SearchField.SearchIcon className="text-text-muted" />
              <SearchField.Input
                placeholder={searchPlaceholder}
                className="text-[13px] text-text-primary placeholder:text-text-muted"
              />
            </SearchField.Group>
          </SearchField>

          {filteredItems.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] font-medium text-text-tertiary">
              {noItemsText}
            </p>
          ) : (
            <ListBox
              aria-label={`${placeholder} suggestions`}
              className="max-h-60 overflow-y-auto p-1 outline-none"
            >
              {filteredItems.map((item) => (
                <ListBox.Item
                  key={item.id}
                  id={item.id}
                  textValue={item.label}
                  className="cursor-pointer rounded-lg px-3 py-2.5 text-[13px] font-medium text-text-primary outline-none data-[focused=true]:bg-gray-100 data-[selected=true]:bg-brand-50 data-[selected=true]:text-brand-600"
                >
                  <Label className="block truncate">{item.label}</Label>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          )}
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
