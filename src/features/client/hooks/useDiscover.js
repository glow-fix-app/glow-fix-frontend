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

function enrichWithAvatar(providers) {
  return (providers || []).map((p) => {
    const avatar = getAvatarStyle(p.businessName);
    return {
      ...p,
      initials: getInitials(p.businessName),
      avatarBg: avatar.bg,
      avatarText: avatar.text,
    };
  });
}

export function useDiscover({
  filters = {},
  sort = "recommended",
  userLocation = null,
  enabled = true,
} = {}) {
  const { serviceType, maxDistance, minRating, openNow, search, searchType } = filters;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      ...queryKeys.discover,
      userLocation?.lat ?? null,
      userLocation?.lng ?? null,
      serviceType,
      maxDistance,
      minRating,
      openNow,
      search,
      searchType,
      sort,
    ],
    queryFn: ({ signal }) =>
      clientApi.discover({
        userLocation,
        serviceType,
        maxDistance,
        minRating,
        openNow,
        search,
        searchType,
        sort,
        signal,
      }),
    enabled,
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });

  const providers = useMemo(() => enrichWithAvatar(data), [data]);

  return { providers, isLoading, error: error || null };
}
