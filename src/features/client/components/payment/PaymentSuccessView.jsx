import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { formatEgp } from "@/features/client/utils/formatters";
import { ROUTE_PATHS } from "@/routes/paths";

export default function PaymentSuccessView({ bookingId, total, paymentId, isPayingForRepairs }) {
  const message = isPayingForRepairs
    ? `Thank you! Your payment of ${formatEgp(total)} for the approved repairs has been processed successfully.`
    : `Thank you! Your payment of ${formatEgp(total)} has been processed successfully. Your booking is now confirmed and fully paid.`;

  return (
    <section className="mx-auto w-full max-w-3xl pb-16 pt-12">
      <div className="rounded-3xl border border-border-default bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-10 w-10 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-text-primary">Payment Successful!</h1>
        <p className="mx-auto mb-8 max-w-md text-text-tertiary">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isPayingForRepairs ? (
            <Link
              to={ROUTE_PATHS.BOOKING_DETAIL(bookingId)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border-default bg-white px-8 h-[48px] text-[14px] font-semibold text-text-primary transition-all hover:bg-surface-hover hover:border-gray-400"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Booking
            </Link>
          ) : (
            <Link
              to={ROUTE_PATHS.CLIENT_HOME}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border-default bg-white px-8 h-[48px] text-[14px] font-semibold text-text-primary transition-all hover:bg-surface-hover hover:border-gray-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Home
            </Link>
          )}
          {paymentId && (
            <Link
              to={ROUTE_PATHS.PAYMENT_RECEIPT(paymentId)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 h-[48px] text-[14px] font-semibold text-white transition-all hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              View Receipt
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
