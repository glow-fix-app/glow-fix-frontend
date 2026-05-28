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

export function getAvatarStyle(name = "") {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function getInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function formatDistanceKm(distance) {
  if (distance == null) return null;
  if (distance < 1) return `${Math.round(distance * 1000)} m`;
  return `${distance.toFixed(1)} km`;
}

export function formatProviderLocationLine(provider) {
  const dist = (provider.distanceLabel || formatDistanceKm(provider.distance) || "").toUpperCase();
  const area = (provider.areaLabel || "").toUpperCase();
  const city = (provider.cityLabel || "").toUpperCase();
  if (dist && area && city) return `${dist} · ${area}, ${city}`;
  if (dist && area) return `${dist} · ${area}`;
  return (provider.address || "—").toUpperCase();
}
