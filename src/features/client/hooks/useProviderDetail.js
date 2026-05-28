import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";

const AVATAR_COLORS = [
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#ede9fe", text: "#5b21b6" },
];

function getAvatarStyle(name = "") {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatDistance(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} M AWAY`;
  return `${km.toFixed(1)} KM AWAY`;
}

export function useProviderDetail(providerId) {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(null);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const query = useQuery({
    queryKey: [...queryKeys.providerDetail(providerId), userLocation],
    queryFn: () => clientApi.providerDetails(providerId, { userLocation }),
    enabled: !!providerId,
    staleTime: 1000 * 60,
  });

  const provider = query.data
    ? {
        ...query.data,
        initials: getInitials(query.data.businessName),
        avatarStyle: getAvatarStyle(query.data.businessName),
        distanceLabel: formatDistance(query.data.distance),
      }
    : null;

  return {
    provider,
    isLoading: query.isLoading,
    error: query.error,
    userLocation,
  };
}
