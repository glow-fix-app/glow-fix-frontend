import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/features/client/hooks/useDebounce";
import { useDiscover } from "@/features/client/hooks/useDiscover";
import { useDiscoverLocation } from "@/features/client/hooks/useDiscoverLocation";
import DiscoverFilterPanel from "@/features/client/components/discover/DiscoverFilterPanel";
import DiscoverResults from "@/features/client/components/discover/DiscoverResults";
import DiscoverToolbar from "@/features/client/components/discover/DiscoverToolbar";

const DEFAULT_FILTERS = {
  serviceType: "all",
  maxDistance: 50,
  minRating: 0,
  openNow: false,
  search: "",
  searchType: "provider",
};

export default function ClientDiscoverPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("recommended");
  const [layout, setLayout] = useState("map");
  const [showFilters, setShowFilters] = useState(window.innerWidth >= 1024);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  const {
    userLocation,
    isLocationReady,
    locationError,
    locationLabel,
  } = useDiscoverLocation();

  const debouncedMaxDistance = useDebounce(filters.maxDistance, 600);
  const debouncedUserLocation = useDebounce(userLocation, 1000);
  const queryFilters = useMemo(
    () => ({ ...filters, maxDistance: debouncedMaxDistance }),
    [filters, debouncedMaxDistance]
  );

  const { providers, isLoading, error } = useDiscover({
    filters: queryFilters,
    sort,
    userLocation: debouncedUserLocation,
    enabled: Boolean(debouncedUserLocation),
  });

  const isWaitingForLocationQuery =
    isLocationReady && !locationError && Boolean(userLocation) && !debouncedUserLocation;

  useEffect(() => {
    if (!selectedProviderId) return;
    document.getElementById(`provider-card-${selectedProviderId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedProviderId]);

  const handleSearchChange = useCallback(
    (value) => setFilters((prev) => ({ ...prev, search: value })),
    []
  );

  const handleSearchTypeChange = useCallback(
    (value) => setFilters((prev) => ({ ...prev, searchType: value })),
    []
  );

  return (
    <div className="mx-auto w-full max-w-7xl min-h-[calc(100vh-175px)] flex flex-col">
      <DiscoverToolbar
        filters={filters}
        sort={sort}
        layout={layout}
        showFilters={showFilters}
        onSearchChange={handleSearchChange}
        onSearchTypeChange={handleSearchTypeChange}
        onSortChange={setSort}
        onLayoutChange={setLayout}
        onToggleFilters={() => setShowFilters((visible) => !visible)}
      />

      <div
        className={`mt-6 grid grid-cols-1 gap-6 transition-all duration-300 ${
          showFilters ? "lg:grid-cols-[280px_1fr]" : "lg:grid-cols-1"
        }`}
      >
        <DiscoverFilterPanel
          filters={filters}
          showFilters={showFilters}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          onOpenChange={setShowFilters}
        />

        <section>
          <DiscoverResults
            providers={providers}
            layout={layout}
            userLocation={userLocation}
            locationLabel={locationLabel}
            isLocationReady={isLocationReady}
            isWaitingForLocationQuery={isWaitingForLocationQuery}
            locationError={locationError}
            isLoading={isLoading}
            error={error}
            selectedProviderId={selectedProviderId}
            onSelectProvider={setSelectedProviderId}
          />
        </section>
      </div>
    </div>
  );
}
