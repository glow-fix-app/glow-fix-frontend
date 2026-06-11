import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { toast } from "@heroui/react";

const NO_LOCATION = { id: "all", label: "All locations", lat: null, lng: null };

function requestGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function useServiceSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [locationId, setLocationId] = useState(NO_LOCATION.id);
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locations, setLocations] = useState([
    NO_LOCATION,
    { id: "near-me", label: "Near you", useGeo: true },
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === locationId),
    [locations, locationId]
  );

  const coords = useMemo(() => {
    if (locationId === "near-me" && userCoords) {
      return { lat: userCoords.lat, lng: userCoords.lng, label: "Near you" };
    }
    if (selectedLocation?.lat != null && selectedLocation?.lng != null) {
      return {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        label: selectedLocation.label,
      };
    }
    return { lat: null, lng: null, label: "All locations" };
  }, [locationId, userCoords, selectedLocation]);

  // When the user picks a named area (e.g. "Zamalek") — not "all" or the
  // geo "near-me" option — we send it as a location filter to the backend.
  const locationArea =
    locationId !== NO_LOCATION.id && locationId !== "near-me" ? locationId : null;

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
        maxDistance: coords.lat != null && coords.lng != null ? 50 : null,
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

  const activateNearMe = useCallback(async () => {
    setIsLocating(true);
    try {
      const pos = await requestGeolocation();
      setUserCoords(pos);
      setLocationId("near-me");
    } catch {
      toast.danger("Please enable location services in your browser/device to use 'Near me'.", {
        title: "Location Access Denied",
      });
      setLocationId(NO_LOCATION.id);
      setUserCoords(null);
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleLocationChange = useCallback(
    (id) => {
      if (id === "near-me") {
        activateNearMe();
        return;
      }
      setUserCoords(null);
      setLocationId(id);
    },
    [activateNearMe]
  );

  const handleSearchChange = useCallback((value) => {
    setQuery(typeof value === "string" ? value : "");
  }, []);

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
