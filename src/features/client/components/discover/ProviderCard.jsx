import { StarIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { Card } from "@heroui/react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ROUTE_PATHS } from "@/routes/paths";

function getServiceLabel(serviceType) {
  if (!serviceType) return "—";
  const t = serviceType.toLowerCase();
  if (t === "wash") return "Car Wash";
  if (t === "repair") return "Repair";
  if (t === "both") return "Wash & Repair";
  return serviceType;
}

export default function ProviderCard({ provider, isSelected, onSelect }) {
  const distanceKm = provider.distanceKm;
  const distanceLabel =
    distanceKm != null && distanceKm > 0
      ? distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m`
        : `${distanceKm.toFixed(1)} km`
      : "—";

  const openLabel = provider.isOpen
    ? provider.operatingHoursToday
      ? `Open · ${provider.operatingHoursToday}`
      : "Open now"
    : provider.operatingHoursToday
    ? `Closed · ${provider.operatingHoursToday}`
    : "Closed";

  return (
    <Link
      to={ROUTE_PATHS.PROVIDER_DETAIL(provider.id)}
      className="block no-underline"
      onClick={() => onSelect?.(provider.id)}
    >
      <Card
        id={`provider-card-${provider.id}`}
        className={`shrink-0 cursor-pointer border-none px-4 py-3.5 shadow-none rounded-xl transition-all ${
          isSelected
            ? "ring-2 ring-brand-500 bg-brand-500/5 shadow-sm"
            : "bg-white ring-1 ring-border-default hover:ring-gray-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <UserAvatar
            user={{ name: provider.businessName }}
            className="h-11 w-11 rounded-xl text-[13px] font-semibold shrink-0"
            style={{ backgroundColor: provider.avatarBg, color: provider.avatarText }}
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-text-primary">
              {provider.businessName}
            </h3>
            <div className="mt-0.5 flex items-center gap-1 text-[12px] text-text-tertiary">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
              <span className="truncate">{provider.address}</span>
            </div>
          </div>
        </div>

        <div className="my-2.5 border-t border-dashed border-border-default" />

        <div className="grid grid-cols-3 gap-2">
          {/* Rating */}
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-text-muted">
              Rating
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              <StarIcon className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[13px] font-semibold text-text-primary">
                {provider.avgRating > 0 ? provider.avgRating.toFixed(1) : "—"}
              </span>
              {provider.reviewCount > 0 && (
                <span className="text-[11px] text-text-muted">
                  ({provider.reviewCount})
                </span>
              )}
            </div>
          </div>

          {/* Distance */}
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-text-muted">
              Distance
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-text-primary">
              {distanceLabel}
            </p>
          </div>

          {/* Open / Closed status (replaces "Service") */}
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-text-muted">
              Status
            </p>
            <p className={`mt-0.5 text-[13px] font-semibold ${provider.isOpen ? "text-emerald-500" : "text-red-400"}`}>
              {provider.isOpen ? "Open" : "Closed"}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
