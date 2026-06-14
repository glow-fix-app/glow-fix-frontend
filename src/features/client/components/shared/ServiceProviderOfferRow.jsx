import { ArrowUpRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import ProviderOfferAvatar from "@/features/client/components/shared/ProviderOfferAvatar";
import ServicePrice from "@/features/client/components/provider/ServicePrice";
import { buildCheckoutPath } from "@/store/slices/checkoutSlice";
import { formatProviderLocationLine } from "@/features/client/lib/providerDisplay";

/**
 * Marketplace row: provider + one service offer (used on service search; layout aligned with provider ServiceCard pricing).
 */
const PROVIDER_DETAIL_PATH = (id) => `/providers/${id}`;

export default function ServiceProviderOfferRow({ offer, className = "" }) {
  const { provider = {}, service, offerLine } = offer || {};
  const checkoutPath = buildCheckoutPath(provider.id, [service.id]);

  return (
    <article
      className={`grid grid-cols-1 gap-4 border-b border-gray-200 px-5 py-5 last:border-b-0 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:gap-5 sm:px-6 ${className}`}
    >
      <ProviderOfferAvatar name={provider.businessName} avatarUrl={provider.logoUrl} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={PROVIDER_DETAIL_PATH(provider.id)}
            className="text-[15px] font-semibold text-text-primary hover:text-brand-500 no-underline"
          >
            {provider.businessName}
          </Link>
          {provider.reviewCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-text-tertiary">
              <StarIcon className="h-3.5 w-3.5 text-amber-400" aria-hidden />
              {provider.avgRating > 0 ? provider.avgRating.toFixed(1) : "—"}
              <span className="font-medium text-text-muted">({provider.reviewCount})</span>
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {formatProviderLocationLine(provider)}
        </p>

        {provider.isOpen ? (
          <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
            {provider.openLabel || "OPEN NOW"}
          </p>
        ) : (
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            {provider.openLabel || "Closed"}
          </p>
        )}

        {offerLine ? (
          <p className="mt-2 text-[13px] leading-relaxed text-text-tertiary line-clamp-2">{offerLine}</p>
        ) : null}
      </div>

      <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-3">
        <ServicePrice priceLabel={service.priceLabel} />
        <Link
          to={checkoutPath}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-brand-500 px-5 text-[13px] font-semibold !text-white no-underline transition-colors hover:bg-brand-600"
        >
          Book
          <ArrowUpRightIcon className="h-3.5 w-3.5 !text-white" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
