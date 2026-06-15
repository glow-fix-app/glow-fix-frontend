import {
  ArrowLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryClient";
import { clientApi } from "@/features/client/services/clientApi";
import { ROUTE_PATHS } from "@/routes/paths";
import logo from "@/assets/images/logo.svg";
import { formatDateShort, formatCurrency } from "@/features/client/utils/formatters";

export default function ClientPaymentReceiptPage() {
  const { receiptId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const { data: p, isLoading, error } = useQuery({
    queryKey: [...queryKeys.payments, receiptId],
    queryFn: () => clientApi.paymentDetails(receiptId),
    enabled: !!receiptId,
  });

  const transaction = p
    ? {
      id: p.id,
      dateLabel: p.paid_at ? formatDateShort(p.paid_at) : "Pending",
      provider: p.booking?.branch?.business_name || "GlowFix Service",
      providerLocation: p.booking?.branch?.address || "Online Payment",
      service: p.booking?.booking_code ? `Booking ${p.booking.booking_code}` : "Service",
      amount: p.amount || 0,
      paymentMethod: p.provider ? p.provider.toUpperCase() : "CARD",
    }
    : null;

  const billedName = user?.full_name?.trim() || user?.name?.trim() || "Guest";
  const billedEmail = user?.email?.trim() || "—";

  return (
    <section className="mx-auto w-full max-w-2xl pb-16">
      <Link
        to={ROUTE_PATHS.PAYMENTS}
        className="mb-8 inline-flex items-center gap-2 text-[11px] font-normal uppercase tracking-[0.16em] text-text-tertiary transition-colors hover:text-text-primary"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back to payments
      </Link>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error || !p ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-[14px] text-text-tertiary">
          Receipt not found or failed to load.
        </div>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <header className="flex flex-col gap-6 border-b border-gray-100 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ring-black/5">
                <img alt="GlowFix" className="h-9 w-9 rounded-full object-cover" src={logo} />
              </span>
              <span className="text-[20px] font-medium italic tracking-tight text-text-primary">_GlowFix._</span>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] font-normal uppercase tracking-[0.14em] text-text-muted">Receipt</p>
              <p className="mt-1 text-[18px] font-medium text-text-primary">{transaction.id}</p>
              <p className="mt-0.5 text-[13px] text-text-tertiary">{transaction.dateLabel}</p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 border-b border-gray-100 px-6 py-6 sm:grid-cols-2 sm:px-8">
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.14em] text-text-muted">From</p>
              <p className="mt-2 text-[15px] font-medium text-text-primary">{transaction.provider}</p>
              <p className="mt-0.5 text-[13px] text-text-tertiary">{transaction.providerLocation}</p>
            </div>
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.14em] text-text-muted">Billed to</p>
              <p className="mt-2 text-[15px] font-medium text-text-primary">{billedName}</p>
              <p className="mt-0.5 text-[13px] text-text-tertiary">{billedEmail}</p>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="grid grid-cols-[1fr_auto] gap-4 bg-surface-hover px-4 py-3 text-[10px] font-normal uppercase tracking-[0.14em] text-text-muted">
                <span>Item</span>
                <span>Amount</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 border-t border-gray-200 px-4 py-4">
                <span className="text-[14px] text-text-primary">{transaction.service}</span>
                <span className="text-[14px] font-medium text-text-primary">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-gray-100 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.14em] text-text-muted">Total paid</p>
              <p className="mt-1 text-[13px] text-text-tertiary">{transaction.paymentMethod}</p>
            </div>
            <p className="text-[26px] font-medium tracking-tight text-text-primary">
              {formatCurrency(transaction.amount)}
            </p>
          </div>


        </article>
      )}
    </section>
  );
}
