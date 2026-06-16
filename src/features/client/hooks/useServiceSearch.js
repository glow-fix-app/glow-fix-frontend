import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { useDiscoverLocation } from "./useDiscoverLocation";

const NO_LOCATION = { id: "all", label: "All locations", lat: null, lng: null };

export function useServiceSearch() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [locationId, setLocationId] = useState(NO_LOCATION.id);
  const [locations, setLocations] = useState([
    NO_LOCATION,
    { id: "near-me", label: "Near you", useGeo: true },
  ]);

  const {
    userLocation,
    isLocationReady,
    locationError,
  } = useDiscoverLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === locationId),
    [locations, locationId]
  );

  // When the user picks a named area (e.g. "Zamalek") — not "all" or the
  // geo "near-me" option — we send it as a location filter to the backend.
  const locationArea =
    locationId !== NO_LOCATION.id && locationId !== "near-me" ? locationId : null;

  // Only attach coordinates when the user explicitly wants location-based results.
  // When "All locations" is selected we must NOT send lat/lng, otherwise the
  // backend's default 20 km radius filter silently hides distant providers.
  const locationActive = locationId !== NO_LOCATION.id;
  const coords =
    locationActive && userLocation
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : { lat: null, lng: null };

  const searchQuery = useQuery({
    queryKey: [
      ...queryKeys.serviceSearch,
      debouncedQuery.trim(),
      category,
      locationId,
      coords.lat,
      coords.lng,
      locationArea,
    ],
    queryFn: () =>
      clientApi.searchServices({
        q: debouncedQuery.trim(),
        category,
        lat: coords.lat,
        lng: coords.lng,
        // Only apply maxDistance filter when user explicitly selects "Near me"
        maxDistance: locationId === "near-me" ? 50 : null,
        locationArea,
      }),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (searchQuery.data?.locations?.length) {
      setLocations([
        NO_LOCATION,
        { id: "near-me", label: "Near you", useGeo: true },
        ...searchQuery.data.locations.filter(
          (location) => location.id !== NO_LOCATION.id && location.id !== "near-me"
        ),
      ]);
    }
  }, [searchQuery.data?.locations]);

  const handleLocationChange = useCallback((id) => {
    setLocationId(id);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setQuery(typeof value === "string" ? value : "");
  }, []);

  const isLocating = locationId === "near-me" && !isLocationReady && !locationError;

  return {
    query,
    setQuery: handleSearchChange,
    category,
    setCategory,
    locationId,
    handleLocationChange,
    isLocating,
    groups: searchQuery.data?.groups ?? [],
    meta: searchQuery.data?.meta ?? null,
    chips: searchQuery.data?.chips ?? [],
    locations,
    isLoading: searchQuery.isLoading,
    isFetching: searchQuery.isFetching,
    error: searchQuery.error,
  };
}
