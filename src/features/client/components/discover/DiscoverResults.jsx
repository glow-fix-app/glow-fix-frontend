import { lazy, Suspense } from "react";
import { Spinner } from "@heroui/react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import EmptyState from "@/components/feedback/EmptyState";
import ProviderCard from "@/features/client/components/discover/ProviderCard";

const DiscoverMap = lazy(
  () => import("@/features/client/components/discover/DiscoverMap")
);

function LoadingBlock() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function ResultsHeader({ count, locationLabel, size = "md" }) {
  return (
    <div className={size === "lg" ? "mb-4 shrink-0" : "mb-3 shrink-0"}>
      <p className={`${size === "lg" ? "text-[28px]" : "text-[24px]"} font-bold text-text-primary`}>
        {count}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
        Providers found{locationLabel ? ` near ${locationLabel}` : ""}
      </p>
    </div>
  );
}

export default function DiscoverResults({
  providers,
  layout,
  userLocation,
  locationLabel,
  isLocationReady,
  isWaitingForLocationQuery,
  locationError,
  isLoading,
  error,
  selectedProviderId,
  onSelectProvider,
}) {
  if (!isLocationReady || isWaitingForLocationQuery || isLoading) {
    return <LoadingBlock />;
  }

  if (locationError) {
    return (
      <EmptyState
        icon={MapPinIcon}
        title="Location access needed"
        message={locationError}
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading providers"
        message="There was an issue fetching providers. Please try again later."
      />
    );
  }

  if (providers.length === 0) {
    return (
      <EmptyState
        icon={MapPinIcon}
        title="No providers found"
        message="Try adjusting your filters or searching a different area."
      />
    );
  }

  if (layout === "map") {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <div className="order-last xl:order-none flex flex-col">
          <ResultsHeader count={providers.length} locationLabel={locationLabel} />
          <div className="space-y-3 p-1 pb-4">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSelected={selectedProviderId === provider.id}
                onSelect={onSelectProvider}
              />
            ))}
          </div>
        </div>

        <div className="order-first xl:order-none h-[450px] xl:h-[calc(100vh-120px)] xl:sticky xl:top-24">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center rounded-xl bg-surface-hover ring-1 ring-black/5">
                <Spinner size="lg" />
              </div>
            }
          >
            <DiscoverMap
              providers={providers}
              userLocation={userLocation}
              selectedId={selectedProviderId}
              onSelectProvider={onSelectProvider}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ResultsHeader count={providers.length} locationLabel={locationLabel} size="lg" />
      <div className="flex flex-col gap-4 p-1 pb-6">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
