import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const LOCATION_CACHE_KEY = "discover:lastUserLocation";
const LOCATION_REFRESH_THRESHOLD_KM = 0.05;

function readCachedLocation() {
  try {
    const raw = sessionStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const location = JSON.parse(raw);
    if (location?.lat == null || location?.lng == null) return null;
    return location;
  } catch {
    return null;
  }
}

function writeCachedLocation(location) {
  try {
    sessionStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
  } catch {
    // Ignore storage failures in private browsing or quota-limited contexts.
  }
}

function distanceKm(a, b) {
  if (!a || !b) return Infinity;
  const toRad = (value) => (value * Math.PI) / 180;
  const radiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function useDiscoverLocation() {
  const user = useSelector((state) => state.auth.user);
  const fallbackLocation = user?.clientLocation
    ? { lat: user.clientLocation.latitude, lng: user.clientLocation.longitude }
    : null;

  const cachedLocation = readCachedLocation();
  const [userLocation, setUserLocation] = useState(cachedLocation || fallbackLocation);
  const [isLocationReady, setIsLocationReady] = useState(Boolean(cachedLocation || fallbackLocation));
  const [locationError, setLocationError] = useState("");
  const [locationLabel, setLocationLabel] = useState(cachedLocation ? "you" : fallbackLocation ? "saved location" : "");

  // Update if fallback location arrives later
  useEffect(() => {
    if (!userLocation && fallbackLocation) {
      setUserLocation(fallbackLocation);
      setLocationLabel("saved location");
      setIsLocationReady(true);
    }
  }, [fallbackLocation, userLocation]);

  useEffect(() => {
    if (!navigator.geolocation) {
      if (!fallbackLocation) {
        setUserLocation(null);
        setLocationLabel("");
        setLocationError("Your browser does not support location services.");
      }
      setIsLocationReady(true);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const nextLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation((currentLocation) => {
          if (
            currentLocation &&
            distanceKm(currentLocation, nextLocation) < LOCATION_REFRESH_THRESHOLD_KM
          ) {
            return currentLocation;
          }
          writeCachedLocation(nextLocation);
          return nextLocation;
        });
        setLocationLabel("you");
        setLocationError("");
        setIsLocationReady(true);
      },
      () => {
        if (!fallbackLocation) {
          setUserLocation(null);
          setLocationLabel("");
          setLocationError("Allow location access to find providers near you.");
        } else {
          // If browser location is denied, just rely on the fallback location silently
          setUserLocation(fallbackLocation);
          setLocationLabel("saved location");
          setLocationError("");
        }
        setIsLocationReady(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return {
    userLocation,
    isLocationReady,
    locationError,
    locationLabel,
  };
}
