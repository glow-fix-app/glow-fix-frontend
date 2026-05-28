import { BoltIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@heroui/react";
import EmptyState from "@/components/feedback/EmptyState";
import ServiceSearchGroup from "@/features/client/components/service-search/ServiceSearchGroup";
import ServiceSearchToolbar from "@/features/client/components/service-search/ServiceSearchToolbar";
import { useServiceSearch } from "@/features/client/hooks/useServiceSearch";

export default function ClientServiceSearchPage() {
  const {
    query,
    setQuery,
    category,
    setCategory,
    locationId,
    handleLocationChange,
    isLocating,
    groups,
    meta,
    chips,
    locations,
    isLoading,
    isFetching,
    error,
  } = useServiceSearch();

  const totalOffers = meta?.totalOffers ?? 0;
  const totalServices = meta?.totalServices ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl pb-16">
      <div className="mb-8">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
          <BoltIcon className="h-4 w-4 text-brand-500" aria-hidden />
          Service search
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-tight text-text-primary sm:text-[32px]">
          Find a service. Compare prices.
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-tertiary">
          Search any car service and see every provider that offers it — with live pricing near your
          location.
        </p>
      </div>

      <div className="space-y-4">
        <ServiceSearchToolbar
          locations={locations}
          locationId={locationId}
          onLocationChange={handleLocationChange}
          isLocating={isLocating}
          searchValue={query}
          onSearchChange={setQuery}
          categories={chips}
          categoryId={category}
          onCategoryChange={setCategory}
        />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
          {isFetching && !isLoading
            ? "Updating…"
            : `${totalOffers} offer${totalOffers === 1 ? "" : "s"} · ${totalServices} service${totalServices === 1 ? "" : "s"}`
          }
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" color="primary" />
        </div>
      ) : error ? (
        <EmptyState
          title="Could not load services"
          message="Please check your connection and try again."
        />
      ) : groups.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No services found"
            message="Try a different search term, category, or location."
          />
        </div>
      ) : (
        <div className="mt-6">
          {groups.map((group) => (
            <ServiceSearchGroup key={group.serviceKey} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
