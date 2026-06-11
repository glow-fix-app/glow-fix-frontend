import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/features/client/hooks/useDebounce";
import { useDiscover } from "@/features/client/hooks/useDiscover";
import { useDiscoverLocation } from "@/features/client/hooks/useDiscoverLocation";
import { clientApi } from "@/features/client/services/clientApi";
import { queryKeys } from "@/services/queryClient";
import DiscoverFilterPanel from "@/features/client/components/discover/DiscoverFilterPanel";
import DiscoverResults from "@/features/client/components/discover/DiscoverResults";
import DiscoverToolbar from "@/features/client/components/discover/DiscoverToolbar";

const DEFAULT_FILTERS = {
  categories: [],
  maxDistance: 50,
  minRating: 0,
  openNow: false,
  search: "",
  searchType: "provider",
};

export default function ClientDiscoverPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [layout, setLayout] = useState("map");
  const [showFilters, setShowFilters] = useState(window.innerWidth >= 1024);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [locationId, setLocationId] = useState("all");

  // Build location dropdown: first fetch discover filters to get city list from backend
  const filterOptionsQuery = useQuery({
    queryKey: [...queryKeys.discover, "filter-options"],
    queryFn: () => clientApi.discover({}),
    staleTime: 1000 * 60 * 5,
  });

  const locations = useMemo(() => {
    const base = [
      { id: "all", label: "All locations", city: null },
      { id: "near-me", label: "Near you", useGeo: true, city: null },
    ];
    const backendCities = filterOptionsQuery.data?.filters?.locations ?? [];
    backendCities.forEach((loc) => {
      base.push({ id: loc.name, label: loc.name, city: loc.name, count: loc.count });
    });
    return base;
  }, [filterOptionsQuery.data?.filters?.locations]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => clientApi.categories(),
    staleTime: 1000 * 60 * 5,
  });

  const categories = useMemo(() => {
    return categoriesQuery.data?.map(c => ({ id: c.id, name: c.name, label: c.name, count: 0 })) || [];
  }, [categoriesQuery.data]);

  const {
    userLocation,
    isLocationReady,
    locationError,
    locationLabel,
  } = useDiscoverLocation();

  const debouncedMaxDistance = useDebounce(filters.maxDistance, 600);
  const debouncedUserLocation = useDebounce(userLocation, 1000);
  const queryFilters = useMemo(
    () => ({ 
      ...filters, 
      maxDistance: locationId === "near-me" ? debouncedMaxDistance : null 
    }),
    [filters, debouncedMaxDistance, locationId]
  );

  // Resolve selected location: near-me uses geolocation; named city uses city string filter
  const selectedCity = useMemo(() => {
    if (locationId === "all" || locationId === "near-me") return null;
    const loc = locations.find((l) => l.id === locationId);
    return loc?.city ?? null;
  }, [locationId, locations]);

  // Coordinates to pass: always send them so distance is calculated for all providers
  const activeUserLocation = debouncedUserLocation;

  // Always enable the query — let backend return all providers when no location given
  const { providers, isLoading, error } = useDiscover({
    filters: queryFilters,
    sort: "recommended",
    userLocation: activeUserLocation,
    city: selectedCity,
    enabled: true,
  });

  const isWaitingForLocationQuery =
    locationId === "near-me" && isLocationReady && !locationError && Boolean(userLocation) && !debouncedUserLocation;

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

  return (
    <div className="mx-auto w-full max-w-7xl min-h-[calc(100vh-175px)] flex flex-col">
      <DiscoverToolbar
        filters={filters}
        layout={layout}
        showFilters={showFilters}
        onSearchChange={handleSearchChange}
        onLayoutChange={setLayout}
        onToggleFilters={() => setShowFilters((visible) => !visible)}
        locations={locations}
        locationId={locationId}
        onLocationChange={setLocationId}
        isLocating={!isLocationReady && locationId === "near-me"}
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
          categories={categories}
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
