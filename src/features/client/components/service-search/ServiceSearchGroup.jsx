import ServiceProviderOfferRow from "@/features/client/components/shared/ServiceProviderOfferRow";

export default function ServiceSearchGroup({ group }) {
  return (
    <section className="mb-10 last:mb-0">
      <div className="mb-4">
        <h2 className="text-[22px] font-semibold leading-tight text-text-primary sm:text-2xl">
          {group.serviceTitle}
        </h2>
        <p className="mt-1 text-[13px] font-medium text-text-tertiary">
          {group.providerCount} provider{group.providerCount === 1 ? "" : "s"} · from{" "}
          {group.minPriceLabel}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {group.offers.map((offer) => (
          <ServiceProviderOfferRow key={`${offer.provider.id}-${offer.service.id}`} offer={offer} />
        ))}
      </div>
    </section>
  );
}
