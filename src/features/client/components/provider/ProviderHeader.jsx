import {
  ClockIcon,
  MapPinIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function ProviderHeader({ provider, onDirections }) {
  if (!provider) return null;

  return (
    <header className="relative z-10 bg-white pb-6 pt-0">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-6">
          <UserAvatar
            user={{
              name: provider.businessName,
              avatar: provider.logoUrl,
            }}
            radius="none"
            bg="bg-white text-text-primary"
            shadow="shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-border-default"
            ring="ring-4 ring-white rounded-[24px] sm:rounded-[32px]"
            className="h-[100px] w-[100px] -mt-[50px] text-3xl sm:h-[136px] sm:w-[136px] sm:-mt-[68px] sm:text-4xl"
          />

          <div className="min-w-0 flex-1 pt-4 sm:pt-2">
            <h1 className="text-[22px] font-medium leading-tight text-text-primary sm:text-[26px]">
              {provider.businessName}
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-text-tertiary">
              {provider.avgRating > 0 && (
                <span className="inline-flex items-center gap-1 text-text-primary">
                  <StarIcon className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold text-black">{provider.avgRating.toFixed(1)}</span>
                  {provider.reviewCount > 0 && (
                    <span className="text-text-muted">({provider.reviewCount})</span>
                  )}
                </span>
              )}

              {provider.distanceLabel && (
                <span className="inline-flex items-center gap-1 uppercase tracking-wide">
                  <MapPinIcon className="h-3.5 w-3.5 text-text-muted" />
                  {provider.distanceLabel}
                </span>
              )}

              {(provider.openTime || provider.openLabel) && (
                <span className={`inline-flex items-center gap-1 uppercase tracking-wide ${provider.isOpen ? "text-emerald-500" : "text-red-500"}`}>
                  <ClockIcon className="h-3.5 w-3.5" />
                  {provider.isOpen && provider.openTime && provider.closeTime ? (
                    <>
                      <span className="font-semibold">OPEN</span>
                      <span>
                        {" "}
                        - {provider.openTime} - {provider.closeTime}
                      </span>
                    </>
                  ) : (
                    <span>
                      {provider.openLabel}
                    </span>
                  )}
                </span>
              )}
            </div>


          </div>
        </div>

        <div className="flex shrink-0 gap-3 pt-2 lg:pb-1 lg:pt-0">
          <button
            type="button"
            onClick={onDirections}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border-default bg-white px-5 text-[13px] font-semibold text-text-primary shadow-sm transition-colors hover:bg-surface-hover"
          >
            <PaperAirplaneIcon className="h-4 w-4 text-text-tertiary" />
            Directions
          </button>
        </div>
      </div>
    </header>
  );
}
