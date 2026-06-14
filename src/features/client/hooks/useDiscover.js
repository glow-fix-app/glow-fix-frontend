import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";

const AVATAR_COLORS = [
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#e0e7ff", text: "#3730a3" },
  { bg: "#ccfbf1", text: "#115e59" },
  { bg: "#fee2e2", text: "#991b1b" },
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

function normalizeProvider(p) {
  return {
    id: p.id,
    businessName: p.business_name,
    address: p.address,
    contactPhone: p.contact_phone,
    contactEmail: p.contact_email,
    distanceKm: p.distance_km,
    avgRating: p.average_rating,
    reviewCount: p.total_reviews,
    isOpen: p.is_open,
    isVerified: p.is_verified,
    serviceType: p.service_type,
    offers: p.offers || [],
    operatingHoursToday: p.operating_hours_today,
    // Expose as both lat/lng (for map) and latitude/longitude
    lat: p.latitude,
    lng: p.longitude,
    latitude: p.latitude,
    longitude: p.longitude,
    createdAt: p.created_at,
  };
}

function enrichWithAvatar(rawData) {
  const list = Array.isArray(rawData) ? rawData : rawData?.data ?? [];
  return list.map((p) => {
    const normalized = normalizeProvider(p);
    const avatar = getAvatarStyle(normalized.businessName);
    return {
      ...normalized,
      initials: getInitials(normalized.businessName),
      avatarBg: avatar.bg,
      avatarText: avatar.text,
    };
  });
}

export function useDiscover({
  filters = {},
  sort = "recommended",
  userLocation = null,
  city = null,
  enabled = true,
} = {}) {
  const { maxDistance, minRating, openNow, search, categories } = filters;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      ...queryKeys.discover,
      userLocation?.lat ?? null,
      userLocation?.lng ?? null,
      city,
      maxDistance,
      minRating,
      openNow,
      search,
      sort,
      categories,
    ],
    queryFn: ({ signal }) =>
      clientApi.discover({
        userLocation,
        city,
        maxDistance,
        minRating,
        openNow,
        search,
        sort,
        categories,
        signal,
      }),
    enabled,
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });

  const allProviders = useMemo(() => enrichWithAvatar(data), [data]);

  // Backend now handles category filtering
  const providers = allProviders;

  const meta = data?.meta ?? null;
  const filterOptions = data?.filters ?? null;

  return { providers, meta, filterOptions, isLoading, error: error || null };
}
